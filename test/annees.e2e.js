// Tranche R3 — plusieurs années, dans le navigateur (T53 : calcul par année dans le fichier livré).
const { test, expect } = require("@playwright/test");

test("[T53] EX-56 : le fichier livré calcule une année à la fois, la semaine du nouvel an comptant dans l'année de son jeudi", async ({ page }) => {
  await page.goto("index.html");
  const resultat = await page.evaluate(() => {
    const f = (basse, mediane = basse, haute = mediane) => ({ basse, mediane, haute });
    const donnees = {
      cultures: [{ id: "c1", nom: "courgette", unite: "kg", rendement: f(3), prix: f(2, 2.5, 3), joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10 }],
      varietes: [{ id: "v1", cultureId: "c1", nom: "Black Beauty" }],
      plantations: [{ id: "p1", varieteId: "v1", espaceId: "e1", surface: 100, date: "2026-03-01" }, { id: "p2", varieteId: "v1", espaceId: "e1", surface: 100, date: "2027-03-01" }],
      pointsVente: [{ id: "pv1", nom: "marché", distanceKm: 12, coutKm: f(0.4) }],
      seances: [{ id: "s1", pointVenteId: "pv1", jour: 6, debut: "2027-01-02", fin: "2027-03-27", frais: f(15) }],
      charges: [{ id: "ch1", nom: "Cotisation", montant: f(150), periodicite: "mois" }],
    };
    const t2026 = Calc.tableau(donnees, { annee: 2026 });
    const t2027 = Calc.tableau(donnees, { annee: 2027 });
    return { annees: Calc.annees(donnees), mois2026: t2026.mois, mois2027: t2027.mois, decembre: t2026.total.mois["2026-12"].couts.mediane };
  });
  expect(resultat.annees).toEqual([2026, 2027]);
  expect(resultat.mois2026[0]).toBe("2026-01");
  expect(resultat.mois2026[11]).toBe("2026-12");
  expect(resultat.mois2027).toHaveLength(12);
  expect(resultat.mois2027[0]).toBe("2027-01");
  expect(resultat.decembre).toBeCloseTo(24.6, 6);
});

test("[T54] EX-60 : la ferme d'exemple chargée en 2027 montre janvier à décembre 2027, sans colonne de décembre 2026", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2027-05-20T10:00:00+04:00"));
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#bandeau-exemple")).toBeVisible();
  await page.evaluate(() => { location.hash = "synthese"; });
  const mois = page.locator("#tableau thead th[data-mois]:not(.col-total)");
  await expect(mois).toHaveCount(12);
  await expect(mois.first()).toHaveAttribute("data-mois", "2027-01");
  await expect(mois.last()).toHaveAttribute("data-mois", "2027-12");
  await expect(page.locator('#tableau thead th[data-mois="2026-12"]')).toHaveCount(0);
});

// ---- T55 : le choix de l'année (EX-55 à EX-58)

// La ferme du scénario S16 (courgette en 2026 et en 2027, charges fixes), vendue au marché du samedi du
// 2 mai 2026 au 26 juin 2027, avec une fourgonnette.
async function fermeDeuxAnnees(page, horloge = "2027-05-20T10:00:00+04:00") {
  await page.clock.setFixedTime(new Date(horloge));
  await page.goto("index.html");
  await page.evaluate(() => {
    const ferme = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    const e1 = ferme.ajouter("espaces", { nom: "planche 1", surface: 100, type: "plein_champ" });
    const e2 = ferme.ajouter("espaces", { nom: "planche 2", surface: 100, type: "plein_champ" });
    const c = ferme.ajouter("cultures", { nom: "courgette", unite: "kg", rendement: F(3), prix: F(2, 2.5, 3), joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10,
      implantation: "plant", densite: 1, prixUnite: F(0.3, 0.4, 0.5), intrants: F(0.2) });
    const v = ferme.ajouter("varietes", { nom: "Black Beauty", cultureId: c.id });
    ferme.ajouter("plantations", { varieteId: v.id, espaceId: e1.id, surface: 100, date: "2026-03-01" });
    ferme.ajouter("plantations", { varieteId: v.id, espaceId: e2.id, surface: 100, date: "2027-03-01" });
    ferme.ajouter("charges", { nom: "Assurance", montant: F(600), periodicite: "an" });
    ferme.ajouter("charges", { nom: "Cotisation", montant: F(150), periodicite: "mois" });
    const vehicule = ferme.ajouter("vehicules", { nom: "Fourgonnette", consommation: F(7), prixLitre: F(1.55) });
    const point = ferme.ajouter("pointsVente", { nom: "marché", distanceKm: 13, vehiculeId: vehicule.id });
    ferme.ajouter("seances", { pointVenteId: point.id, jour: 6, debut: "2026-05-02", fin: "2027-06-26", frais: F(15) });
    ferme.ajouter("debouches", { pointVenteId: point.id, produitId: c.id, prix: F(2.5), volumeParSeance: F(20) });
  });
  await page.reload();
}

const attendu = (page, annee) => page.evaluate((annee) => {
  const ferme = Store.ouvrir(localStorage);
  const d = {};
  for (const objet of Store.OBJETS) d[objet] = ferme.lister(objet);
  return { ca: Calc.tableau(d, { annee }).total.total.ca.mediane, km: [...Calc.vehicules(d, { annee }).values()][0].km };
}, annee);

test("[T55] EX-55, EX-56 : « ‹ 2027 › » passe d'une année à l'autre ; la barre du haut, les tuiles et le tableau suivent l'année", async ({ page }) => {
  await fermeDeuxAnnees(page);
  const choix = page.locator("#choix-annee");
  await expect(choix).toBeVisible();
  await expect(page.locator("#annee-choisie")).toHaveText("2027");
  await expect(page.locator("#annee-suivante")).toBeDisabled();
  await expect(page.locator("#annee-precedente")).toBeEnabled();
  await page.evaluate(() => { location.hash = "synthese"; });
  const mois = page.locator("#tableau thead th[data-mois]:not(.col-total)");
  await expect(mois).toHaveCount(12);
  await expect(mois.first()).toHaveAttribute("data-mois", "2027-01");
  await expect(mois.last()).toHaveAttribute("data-mois", "2027-12");
  const en2027 = await attendu(page, 2027);
  await expect(page.locator("#synthese .mediane")).toHaveAttribute("data-valeur", String(en2027.ca));

  await page.locator("#annee-precedente").click();
  await expect(page.locator("#annee-choisie")).toHaveText("2026");
  await expect(page.locator("#annee-precedente")).toBeDisabled();
  await expect(page.locator("#annee-suivante")).toBeEnabled();
  await expect(mois.first()).toHaveAttribute("data-mois", "2026-01");
  await expect(mois.last()).toHaveAttribute("data-mois", "2026-12");
  const en2026 = await attendu(page, 2026);
  await expect(page.locator("#synthese .mediane")).toHaveAttribute("data-valeur", String(en2026.ca));
  await expect(page.locator('#tuiles .tuile[data-chiffre="ca"] .mediane').first()).toHaveAttribute("data-valeur", String(en2026.ca));
  // Au clavier aussi : la flèche suivante a le focus et revient à 2027.
  await page.locator("#annee-suivante").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#annee-choisie")).toHaveText("2027");
  await expect(page.locator("#annee-precedente")).toHaveAttribute("aria-label", /.+/);
  await expect(page.locator("#annee-suivante")).toHaveAttribute("aria-label", /.+/);
});

test("[T55] EX-58 : l'année choisie survit au rechargement, sans compter comme une modification de la ferme", async ({ page }) => {
  await fermeDeuxAnnees(page);
  const etat = () => page.evaluate(() => JSON.parse(localStorage.getItem(Store.CLE)).etat);
  const avant = await etat();
  await page.locator("#annee-precedente").click();
  await expect(page.locator("#annee-choisie")).toHaveText("2026");
  const apres = await etat();
  assertMemeModification(avant, apres);
  await page.reload();
  await expect(page.locator("#annee-choisie")).toHaveText("2026");
});

function assertMemeModification(avant, apres) {
  expect(apres.nonExporteDepuis).toBe(avant.nonExporteDepuis);
  expect(apres.dernierExport).toBe(avant.dernierExport);
}

test("[T55] EX-57 : les points de vente, la matrice, le véhicule et les besoins suivent l'année", async ({ page }) => {
  await fermeDeuxAnnees(page);
  await page.evaluate(() => { location.hash = "ventes"; });
  const moisPoints = () => page.locator("#points thead th[data-mois]").evaluateAll((ths) => ths.map((th) => th.dataset.mois));
  const semaines = () => page.locator("#matrice thead th[data-semaine]").evaluateAll((ths) => ths.map((th) => th.dataset.semaine));
  const km = () => page.locator('#liste-vehicules [data-fait="km"]').innerText();
  await expect.poll(async () => (await moisPoints()).every((m) => m.startsWith("2027-"))).toBe(true);
  expect((await semaines())[0]).toBe("2027-01-04");
  const km2027 = await km();
  expect(km2027).toContain(String((await attendu(page, 2027)).km));
  await page.locator("#annee-precedente").click();
  await expect.poll(async () => (await moisPoints()).every((m) => m.startsWith("2026-"))).toBe(true);
  const s2026 = await semaines();
  expect(s2026[s2026.length - 1]).toBe("2026-12-28");
  expect(await km()).not.toBe(km2027);
  expect(await km()).toContain(String((await attendu(page, 2026)).km));
  await page.evaluate(() => { location.hash = "plantations"; });
  const moisBesoins = () => page.locator("#section-besoins .besoins-mois").evaluateAll((s) => s.map((x) => x.dataset.mois));
  expect(await moisBesoins()).toEqual(["2026-03"]);
  await page.locator("#annee-suivante").click();
  await expect.poll(moisBesoins).toEqual(["2027-03"]);
});

test("[T55] EX-55 : sans donnée, pas de choix d'année ; de 360 à 1920 px, le choix tient dans la barre du haut sans chevauchement", async ({ page }) => {
  await page.goto("index.html");
  await expect(page.locator("#choix-annee")).toBeHidden();
  await fermeDeuxAnnees(page);
  for (const [largeur, hauteur] of [[360, 740], [390, 844], [900, 800], [1280, 720], [1920, 1080]]) {
    await page.setViewportSize({ width: largeur, height: hauteur });
    const choix = page.locator("#choix-annee");
    await expect(choix).toBeVisible();
    await expect(choix).toBeInViewport({ ratio: 1 });
    const boite = await choix.boundingBox();
    for (const autre of await page.locator(".barre .marque, .barre .indicateur").all()) {
      const b = await autre.boundingBox();
      const chevauche = boite.x < b.x + b.width - 1 && b.x < boite.x + boite.width - 1 && boite.y < b.y + b.height - 1 && b.y < boite.y + boite.height - 1;
      expect(chevauche, `${largeur} px`).toBe(false);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${largeur} px`).toBeLessThanOrEqual(0);
  }
});

test("[T55] EX-60 : la ferme d'exemple chargée en 2027 n'a qu'une année : 2027, sans flèche active", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2027-05-20T10:00:00+04:00"));
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#annee-choisie")).toHaveText("2027");
  await expect(page.locator("#annee-precedente")).toBeDisabled();
  await expect(page.locator("#annee-suivante")).toBeDisabled();
});

test("[T55] EX-56 : une année sans coût de culture n'en montre pas la ligne au pied du tableau", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2027-05-20T10:00:00+04:00"));
  await page.goto("index.html");
  await page.evaluate(() => {
    const ferme = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    const e = ferme.ajouter("espaces", { nom: "planche", surface: 100, type: "plein_champ" });
    const avecCouts = ferme.ajouter("cultures", { nom: "courgette", unite: "kg", rendement: F(3), prix: F(2.5), joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10,
      implantation: "plant", densite: 1, prixUnite: F(0.4), intrants: F(0.2) });
    const sansCout = ferme.ajouter("cultures", { nom: "salade", unite: "piece", rendement: F(9), prix: F(1.15), joursAvantRecolte: 42, semainesRecolte: 2, pertes: 20 });
    const v1 = ferme.ajouter("varietes", { nom: "Black Beauty", cultureId: avecCouts.id });
    const v2 = ferme.ajouter("varietes", { nom: "Goldorac", cultureId: sansCout.id });
    ferme.ajouter("plantations", { varieteId: v1.id, espaceId: e.id, surface: 100, date: "2026-03-01" });
    ferme.ajouter("plantations", { varieteId: v2.id, espaceId: e.id, surface: 40, date: "2027-03-01" });
  });
  await page.reload();
  await page.evaluate(() => { location.hash = "synthese"; });
  await expect(page.locator("#annee-choisie")).toHaveText("2027");
  await expect(page.locator('#tableau tfoot tr[data-mesure="ca"]')).toHaveCount(1);
  await expect(page.locator('#tableau tfoot tr[data-mesure="cultures"]')).toHaveCount(0);
  await page.locator("#annee-precedente").click();
  await expect(page.locator('#tableau tfoot tr[data-mesure="cultures"]')).toHaveCount(1);
});
