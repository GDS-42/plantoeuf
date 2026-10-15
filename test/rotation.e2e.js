// Tranche R4 — rotation et associations, dans le navigateur (T59 : modèle version 6).
const fs = require("node:fs");
const { test, expect } = require("@playwright/test");
const { aller, choisir, ajouterPlantation } = require("./outils.js");

test("[T59] EX-61 : le fichier livré exporte les familles, associations et rotations en version 6 et importe un fichier de version 5", async ({ page }) => {
  await page.goto("index.html");
  await page.evaluate(() => {
    const ferme = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    ferme.ajouter("familles", { nom: "Solanacées", delaiRetour: F(3, 4, 5) });
    const c = ferme.ajouter("cultures", { nom: "tomate", famille: "Solanacées", groupe: "fruit", unite: "kg", rendement: F(12), prix: F(3.5), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 15 });
    ferme.ajouter("associations", { type: "voisinage", cultureA: c.id, cultureB: c.id + "-autre", effet: "favorable" });
    ferme.ajouter("rotations", { nom: "Exigence décroissante", groupes: ["fruit", "feuille", "racine"] });
  });
  await page.reload();
  await aller(page, "sauvegarde");
  const [telechargement] = await Promise.all([page.waitForEvent("download"), page.locator("#exporter").click()]);
  const fichier = JSON.parse(fs.readFileSync(await telechargement.path(), "utf8"));
  expect(fichier.version).toBe(6);
  expect(fichier.familles.map((x) => x.nom)).toEqual(["Solanacées"]);
  expect(fichier.associations).toHaveLength(1);
  expect(fichier.rotations[0].groupes).toEqual(["fruit", "feuille", "racine"]);
  expect(fichier.cultures[0].groupe).toBe("fruit");

  // Un fichier de version 5 (sans les trois listes) s'importe.
  const ancien = { ...fichier, version: 5 };
  for (const objet of ["familles", "associations", "rotations"]) delete ancien[objet];
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await aller(page, "sauvegarde");
  await page.locator("#importer").setInputFiles({ name: "ancien.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(ancien)) });
  await expect(page.locator("#import-message")).toBeVisible();
  const relu = await page.evaluate(() => { const f = Store.ouvrir(localStorage); return { cultures: f.lister("cultures").length, familles: f.lister("familles").length }; });
  expect(relu).toEqual({ cultures: 1, familles: 0 });
});

test("[T60] EX-62 à EX-65 : le fichier livré calcule les retours trop tôt, les précédents, les voisins et les suggestions", async ({ page }) => {
  await page.goto("index.html");
  const r = await page.evaluate(() => {
    const f = (b, m = b, h = m) => ({ basse: b, mediane: m, haute: h });
    const d = {
      espaces: [{ id: "e", nom: "planche", surface: 30 }],
      cultures: [{ id: "t", nom: "tomate", famille: "Solanacées", groupe: "fruit", unite: "kg", rendement: f(3), prix: f(2), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 10 },
        { id: "l", nom: "laitue", famille: "Astéracées", groupe: "feuille", unite: "piece", rendement: f(9), prix: f(1), joursAvantRecolte: 42, semainesRecolte: 2, pertes: 20 }],
      varietes: [{ id: "vt", cultureId: "t", nom: "Heatmaster" }, { id: "vl", cultureId: "l", nom: "Goldorac" }],
      familles: [{ id: "fs", nom: "Solanacées", delaiRetour: f(3) }],
      rotations: [{ id: "r", nom: "Exigence", groupes: ["fruit", "feuille"] }],
      plantations: [{ id: "p1", varieteId: "vt", espaceId: "e", surface: 30, date: "2026-02-04" }, { id: "p2", varieteId: "vt", espaceId: "e", surface: 30, date: "2027-02-04" }],
    };
    return {
      trop: Object.keys(Calc.retoursTropTot(d)),
      precedents: Calc.precedents(d, { varieteId: "vl", espaceId: "e", surface: 30, date: "2026-07-01" }).precedents.map((p) => p.culture),
      suggestions: Calc.suggestions(d, { espaceId: "e", date: "2026-07-01" }).map((s) => s.culture),
    };
  });
  expect(r.trop).toEqual(["p2"]);
  expect(r.precedents).toEqual(["tomate"]);
  expect(r.suggestions).toEqual(["laitue", "tomate"]);
});

// ---- T61 : la saisie sur la page Cultures (EX-61)

async function deuxCultures(page) {
  await page.goto("index.html");
  await page.evaluate(() => {
    const ferme = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    const base = { unite: "kg", rendement: F(3), prix: F(2), joursAvantRecolte: 60, semainesRecolte: 6, pertes: 10 };
    ferme.ajouter("cultures", { nom: "tomate", famille: "Solanacées", ...base });
    ferme.ajouter("cultures", { nom: "courgette", famille: "Cucurbitacées", ...base });
  });
  await page.reload();
  await aller(page, "cultures");
}

async function ouvrirSur(page, objet) {
  await page.locator(`#section-${objet} [data-ouvrir="${objet}"]`).filter({ visible: true }).click();
  await expect(page.locator(`#tiroir-${objet}`)).toBeVisible();
}

test("[T61] EX-61 : la page Cultures saisit une famille et son délai de retour, et dit quelles cultures en sont", async ({ page }) => {
  await deuxCultures(page);
  const section = page.locator("#section-familles");
  await expect(section.locator("h2")).not.toBeEmpty();
  await expect(section.locator(".compte")).toHaveText("0");
  await expect(page.locator("#familles-vide")).toBeVisible();
  // Les familles des cultures qui n'ont pas encore de fiche sont nommées.
  await expect(page.locator("#familles-manquantes")).toContainText("Cucurbitacées");
  await expect(page.locator("#familles-manquantes")).toContainText("Solanacées");
  await ouvrirSur(page, "familles");
  await page.locator("#famille-nom").fill("Solanacées");
  await page.locator("#famille-delaiRetour").fill("3 / 4 / 5");
  await page.locator("#famille-note").fill("flétrissement bactérien");
  await page.locator("#famille-ajouter").click();
  await expect(page.locator("#tiroir-familles")).toBeHidden();
  await expect(section.locator(".compte")).toHaveText("1");
  const ligne = page.locator("#liste-familles li", { hasText: "Solanacées" });
  await expect(ligne.locator('[data-fait="delai"]')).toContainText("4 ans");
  await expect(ligne.locator('[data-fait="delai"]')).toContainText("3 à 5");
  await expect(ligne.locator('[data-fait="cultures"]')).toHaveText("tomate");
  await expect(page.locator("#familles-manquantes")).not.toContainText("Solanacées");
  // Une famille sans délai le dit.
  await ouvrirSur(page, "familles");
  await page.locator("#famille-nom").fill("Cucurbitacées");
  await page.locator("#famille-ajouter").click();
  await expect(page.locator("#liste-familles li", { hasText: "Cucurbitacées" })).toContainText(/délai non saisi/i);
  await expect(page.locator("#familles-manquantes")).toBeHidden();
  await page.reload();
  await aller(page, "cultures");
  await expect(page.locator("#liste-familles li")).toHaveCount(2);
});

test("[T61] EX-61 : le tiroir d'une culture propose les familles connues et son groupe de rotation", async ({ page }) => {
  await deuxCultures(page);
  await page.evaluate(() => Store.ouvrir(localStorage).ajouter("familles", { nom: "Brassicacées", delaiRetour: Store.fourchette(3, 4, 5) }));
  await page.reload();
  await aller(page, "cultures");
  await page.locator("#liste-cultures li", { hasText: "tomate" }).locator('[data-action="modifier"]').click();
  await expect(page.locator("#tiroir-cultures")).toBeVisible();
  const liste = await page.locator("#culture-famille").getAttribute("list");
  expect(await page.locator(`#${liste} option`).evaluateAll((os) => os.map((o) => o.value))).toEqual(["Brassicacées"]);
  await expect(page.locator("#culture-groupe option")).toHaveCount(7);
  await page.locator("#culture-groupe").selectOption("fruit");
  await page.locator("#culture-ajouter").click();
  await expect(page.locator("#tiroir-cultures")).toBeHidden();
  const ligne = page.locator("#liste-cultures li", { hasText: "tomate" });
  await expect(ligne.locator('[data-fait="groupe"]')).toContainText(/fruit/);
  expect(await page.evaluate(() => Store.ouvrir(localStorage).lister("cultures").find((c) => c.nom === "tomate").groupe)).toBe("fruit");
  // La famille reste un texte libre, et la ligne la montre comme avant.
  await expect(ligne.locator(".ligne-entete .puce")).toHaveText("Solanacées");
});

test("[T61] EX-61 : une association se saisit entre deux cultures, avec son type et son effet ; deux fois la même culture est refusée", async ({ page }) => {
  await deuxCultures(page);
  await expect(page.locator("#associations-vide")).toBeVisible();
  await ouvrirSur(page, "associations");
  await page.locator("#association-type").selectOption("precedent");
  await choisir(page, "#association-cultureA", "tomate");
  await choisir(page, "#association-cultureB", "courgette");
  await page.locator("#association-effet").selectOption("defavorable");
  await page.locator("#association-ajouter").click();
  await expect(page.locator("#tiroir-associations")).toBeHidden();
  const ligne = page.locator("#liste-associations li");
  await expect(ligne).toHaveCount(1);
  await expect(ligne).toContainText("tomate");
  await expect(ligne).toContainText("courgette");
  await expect(ligne).toContainText(/défavorable/i);
  await expect(page.locator("#section-associations .compte")).toHaveText("1");
  // Un voisinage d'une culture avec elle-même est refusé, le tiroir reste ouvert avec un message.
  await ouvrirSur(page, "associations");
  await page.locator("#association-type").selectOption("voisinage");
  await choisir(page, "#association-cultureA", "tomate");
  await choisir(page, "#association-cultureB", "tomate");
  await page.locator("#association-effet").selectOption("favorable");
  await page.locator("#association-ajouter").click();
  await expect(page.locator("#association-erreur")).toBeVisible();
  await expect(page.locator("#association-erreur")).toContainText(/deux cultures différentes/i);
  await expect(page.locator("#tiroir-associations")).toBeVisible();
});

test("[T61] EX-61 : une rotation ordonne ses groupes ; un seul groupe ou un doublon sont refusés", async ({ page }) => {
  await deuxCultures(page);
  await ouvrirSur(page, "rotations");
  await page.locator("#rotation-nom").fill("Exigence décroissante");
  await expect(page.locator("#tiroir-rotations select")).toHaveCount(6);
  await page.locator("#rotation-groupe1").selectOption("fruit");
  await page.locator("#rotation-ajouter").click();
  await expect(page.locator("#rotation-erreur")).toContainText(/2 à 6 groupes/);
  await page.locator("#rotation-groupe2").selectOption("feuille");
  await page.locator("#rotation-groupe3").selectOption("racine");
  await page.locator("#rotation-ajouter").click();
  await expect(page.locator("#tiroir-rotations")).toBeHidden();
  const ligne = page.locator("#liste-rotations li", { hasText: "Exigence décroissante" });
  await expect(ligne.locator('[data-fait="groupes"]')).toHaveText(/fruit.*feuille.*racine/);
  expect(await page.evaluate(() => Store.ouvrir(localStorage).lister("rotations")[0].groupes)).toEqual(["fruit", "feuille", "racine"]);
  // Le tiroir de modification reprend l'ordre ; un doublon est refusé.
  await ligne.locator('[data-action="modifier"]').click();
  await expect(page.locator("#rotation-groupe3")).toHaveValue("racine");
  await expect(page.locator("#rotation-groupe4")).toHaveValue("");
  await page.locator("#rotation-groupe3").selectOption("fruit");
  await page.locator("#rotation-ajouter").click();
  await expect(page.locator("#rotation-erreur")).toBeVisible();
});

test("[T61] un fichier dont une rotation est mal formée est refusé avec un message clair, sans rien changer", async ({ page }) => {
  await page.goto("index.html");
  const fichier = await page.evaluate(() => {
    const ferme = Store.ouvrir(localStorage);
    ferme.ajouter("rotations", { nom: "r", groupes: ["fruit", "feuille"] });
    const f = ferme.exporter();
    localStorage.clear();
    f.rotations[0].groupes = ["fruit"];
    return f;
  });
  await page.reload();
  await aller(page, "sauvegarde");
  await page.locator("#importer").setInputFiles({ name: "mauvais.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(fichier)) });
  await expect(page.locator("#import-message")).toContainText(/2 à 6 groupes/);
  await expect(page.locator("#import-message")).toContainText(/rien n'a été/i);
  expect(await page.evaluate(() => Store.ouvrir(localStorage).lister("rotations").length)).toBe(0);
});

// ---- T62 : les aides à l'écran — alertes, tiroir de plantation, calendrier, « Que planter ici ? » (EX-62 à EX-65)

// Une tomate (Solanacées, délai 2 / 3 / 4 ans) sur une planche de 30 m² mise en place le 1er mars 2026.
async function planche(page) {
  await page.goto("index.html");
  const premiere = await page.evaluate(() => {
    const f = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    f.ajouter("familles", { nom: "Solanacées", delaiRetour: F(2, 3, 4) });
    const c = f.ajouter("cultures", { nom: "tomate", famille: "Solanacées", groupe: "fruit", unite: "kg", rendement: F(12), prix: F(3.5), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 15 });
    const v = f.ajouter("varietes", { cultureId: c.id, nom: "Heatmaster" });
    const e = f.ajouter("espaces", { nom: "planche 1", surface: 30, type: "plein_champ" });
    return f.ajouter("plantations", { varieteId: v.id, espaceId: e.id, surface: 30, date: "2026-03-01" }).id;
  });
  await page.reload();
  return premiere;
}

test("[T62] S18, EX-62 : un retour trop tôt est signalé sur la ligne de la plantation, celle de l'espace et la barre du calendrier, et la plantation est enregistrée", async ({ page }) => {
  const premiere = await planche(page);
  await aller(page, "plantations");
  await expect(page.locator(".alerte-rotation")).toHaveCount(0);
  await ajouterPlantation(page, { variete: "Heatmaster", espace: "planche 1", surface: 30, date: "01/03/2027" });
  await expect(page.locator("#tiroir-plantations")).toBeHidden();
  // alerte_seulement : la plantation est enregistrée.
  const ids = await page.evaluate(() => Store.ouvrir(localStorage).lister("plantations").map((p) => p.id));
  expect(ids).toHaveLength(2);
  const seconde = ids.find((id) => id !== premiere);
  const alerte = page.locator(`#liste-plantations li[data-id="${seconde}"] .alerte-rotation`);
  await expect(alerte).toContainText(/retour trop tôt/i);
  await expect(alerte).toContainText("Solanacées");
  await expect(page.locator(`#liste-plantations li[data-id="${premiere}"] .alerte-rotation`)).toHaveCount(0);
  const barre = page.locator(`#calendrier .cal-barre[data-id="${seconde}"]`);
  await expect(barre).toHaveClass(/cal-retour/);
  await expect(barre).toHaveAttribute("aria-label", /retour trop tôt/i);
  await expect(page.locator(`#calendrier .cal-barre[data-id="${premiere}"]`)).not.toHaveClass(/cal-retour/);
  await expect(page.locator("#calendrier-legende")).toContainText(/retour trop tôt/i);
  await aller(page, "espaces");
  const espace = page.locator("#liste-espaces li", { hasText: "planche 1" });
  await expect(espace.locator(".alerte-rotation")).toContainText(/retour trop tôt/i);
  await expect(espace.locator(".alerte-rotation")).toContainText("01/03/2027");
  // Une classe distincte de la sur-occupation, qui n'est pas en cause ici.
  await expect(espace.locator(".sur-occupation")).toHaveCount(0);
});

test("[T62] S18, EX-62 : sur une parcelle qui a la place, seul le retour de trop est signalé", async ({ page }) => {
  await page.goto("index.html");
  const derniere = await page.evaluate(() => {
    const f = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    f.ajouter("familles", { nom: "Solanacées", delaiRetour: F(2, 3, 4) });
    const c = f.ajouter("cultures", { nom: "tomate", famille: "Solanacées", unite: "kg", rendement: F(12), prix: F(3.5), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 15 });
    const v = f.ajouter("varietes", { cultureId: c.id, nom: "Heatmaster" });
    const e = f.ajouter("espaces", { nom: "parcelle", surface: 600, type: "plein_champ" });
    for (const date of ["2026-01-10", "2026-06-10", "2026-11-01", "2026-12-01", "2027-03-01"]) f.ajouter("plantations", { varieteId: v.id, espaceId: e.id, surface: 120, date });
    return f.ajouter("plantations", { varieteId: v.id, espaceId: e.id, surface: 120, date: "2027-04-01" }).id;
  });
  await page.reload();
  await aller(page, "plantations");
  await expect(page.locator("#liste-plantations .alerte-rotation")).toHaveCount(1);
  await expect(page.locator(`#liste-plantations li[data-id="${derniere}"] .alerte-rotation`)).toContainText(/retour trop tôt/i);
  await expect(page.locator("#calendrier .cal-barre.cal-retour")).toHaveCount(1);
});

test("[T62] S19, EX-63, EX-64 : le tiroir d'une plantation dit ce qui la précède et ce qui la voisine ; un voisin défavorable est signalé sur les deux lignes", async ({ page }) => {
  await page.goto("index.html");
  await page.evaluate(() => {
    const f = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    const base = { unite: "kg", rendement: F(2), prix: F(3), pertes: 10 };
    const haricot = f.ajouter("cultures", { nom: "haricot vert", famille: "Fabacées", groupe: "legumineuse", joursAvantRecolte: 60, semainesRecolte: 6, ...base });
    const chou = f.ajouter("cultures", { nom: "chou pommé", famille: "Brassicacées", groupe: "feuille", joursAvantRecolte: 90, semainesRecolte: 4, ...base });
    const ail = f.ajouter("cultures", { nom: "ail", famille: "Amaryllidacées", groupe: "bulbe", joursAvantRecolte: 100, semainesRecolte: 4, ...base });
    const vh = f.ajouter("varietes", { cultureId: haricot.id, nom: "Contender" });
    f.ajouter("varietes", { cultureId: chou.id, nom: "Tropicana" });
    const va = f.ajouter("varietes", { cultureId: ail.id, nom: "Rose" });
    f.ajouter("associations", { type: "precedent", cultureA: haricot.id, cultureB: chou.id, effet: "favorable" });
    f.ajouter("associations", { type: "voisinage", cultureA: ail.id, cultureB: haricot.id, effet: "defavorable" });
    const a = f.ajouter("espaces", { nom: "planche A", surface: 30, type: "plein_champ" });
    const b = f.ajouter("espaces", { nom: "planche B", surface: 30, type: "plein_champ" });
    // Le haricot de la planche A est récolté jusqu'à la fin mai 2026 ; l'ail de la planche B, d'avril à août.
    f.ajouter("plantations", { varieteId: vh.id, espaceId: a.id, surface: 30, date: "2026-02-15" });
    f.ajouter("plantations", { varieteId: va.id, espaceId: b.id, surface: 10, date: "2026-04-01" });
    f.ajouter("plantations", { varieteId: vh.id, espaceId: b.id, surface: 10, date: "2026-06-01" });
  });
  await page.reload();
  await aller(page, "plantations");
  await page.locator('#section-plantations [data-ouvrir="plantations"]').filter({ visible: true }).click();
  await choisir(page, "#plantation-varieteId", "Tropicana");
  await choisir(page, "#plantation-espaceId", "planche A");
  await page.locator("#plantation-surface").fill("30");
  await page.locator("#plantation-date").fill("15/06/2026");
  const apercu = page.locator("#plantation-apercu");
  await expect(apercu.locator('[data-apercu="avant"]')).toContainText(/haricot vert, bon précédent/i);
  await page.keyboard.press("Escape");
  await expect(page.locator("#tiroir-plantations")).toBeHidden();
  expect(await page.evaluate(() => Store.ouvrir(localStorage).lister("plantations").length)).toBe(3);

  const surB = page.locator("#liste-plantations li", { hasText: "planche B" });
  const haricotB = surB.filter({ hasText: "Contender" });
  const ailB = surB.filter({ hasText: "Rose" });
  await expect(haricotB.locator(".alerte-rotation")).toContainText(/voisin défavorable : ail/i);
  await expect(ailB.locator(".alerte-rotation")).toContainText(/voisin défavorable : haricot vert/i);
  await expect(page.locator("#liste-plantations li", { hasText: "planche A" }).locator(".alerte-rotation")).toHaveCount(0);
  // Le tiroir de modification le dit aussi.
  await haricotB.locator('[data-action="modifier"]').click();
  await expect(apercu.locator('[data-apercu="a-cote"]')).toContainText(/ail, mauvais voisin/i);
});

test("[T62] S20, EX-65 : « Que planter ici ? » classe les cultures avec leurs raisons et préremplit le tiroir de plantation, sans rien enregistrer", async ({ page }) => {
  await page.goto("index.html");
  const ids = await page.evaluate(() => {
    const f = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    f.ajouter("familles", { nom: "Solanacées", delaiRetour: F(2, 3, 4) });
    f.ajouter("rotations", { nom: "Exigence décroissante", groupes: ["fruit", "feuille", "racine", "legumineuse"] });
    const base = { unite: "kg", rendement: F(3), prix: F(2), pertes: 10 };
    const t = f.ajouter("cultures", { nom: "tomate", famille: "Solanacées", groupe: "fruit", joursAvantRecolte: 70, semainesRecolte: 11, ...base });
    const l = f.ajouter("cultures", { nom: "laitue", famille: "Astéracées", groupe: "feuille", joursAvantRecolte: 42, semainesRecolte: 2, ...base });
    const c = f.ajouter("cultures", { nom: "carotte", famille: "Apiacées", groupe: "racine", joursAvantRecolte: 90, semainesRecolte: 4, ...base });
    const h = f.ajouter("cultures", { nom: "haricot vert", famille: "Fabacées", groupe: "legumineuse", joursAvantRecolte: 60, semainesRecolte: 6, ...base });
    const vt = f.ajouter("varietes", { cultureId: t.id, nom: "Heatmaster" });
    const vl = f.ajouter("varietes", { cultureId: l.id, nom: "Batavia" });
    f.ajouter("varietes", { cultureId: c.id, nom: "Nantaise" });
    f.ajouter("varietes", { cultureId: h.id, nom: "Contender" });
    const e = f.ajouter("espaces", { nom: "planche 1", surface: 30, type: "plein_champ" });
    // La tomate est récoltée jusqu'à la fin juin 2026.
    f.ajouter("plantations", { varieteId: vt.id, espaceId: e.id, surface: 30, date: "2026-02-04" });
    return { espace: e.id, laitue: vl.id };
  });
  await page.reload();
  // Le calendrier de culture le propose sur la ligne de chaque espace.
  await aller(page, "plantations");
  await expect(page.locator(`#calendrier [data-que-planter="${ids.espace}"]`)).toBeVisible();
  await aller(page, "espaces");
  await page.locator("#liste-espaces li", { hasText: "planche 1" }).locator("[data-que-planter]").click();
  const tiroir = page.locator("#tiroir-que-planter");
  await expect(tiroir).toBeVisible();
  await expect(tiroir).toContainText("planche 1");
  await page.locator("#que-planter-date").fill("01/07/2026");
  await expect(page.locator("#que-planter-surface")).toHaveValue("30");
  const lignes = page.locator("#que-planter-liste > li");
  await expect(lignes).toHaveCount(4);
  await expect(lignes.first()).toContainText("laitue");
  await expect(lignes.first().locator(".raisons")).toContainText(/suit/i);
  await expect(lignes.last()).toContainText("tomate");
  await expect(lignes.last().locator(".raisons")).toContainText(/retour trop tôt/i);
  for (const ligne of await lignes.all()) await expect(ligne.locator(".raisons")).not.toBeEmpty();

  const avant = await page.evaluate(() => localStorage.getItem(Store.CLE));
  await lignes.first().locator("[data-planter]").click();
  await expect(tiroir).toBeHidden();
  await expect(page.locator("#tiroir-plantations")).toBeVisible();
  await expect(page.locator("#plantation-varieteId")).toHaveValue(ids.laitue);
  await expect(page.locator("#plantation-espaceId")).toHaveValue(ids.espace);
  await expect(page.locator("#plantation-date")).toHaveValue("01/07/2026");
  await expect(page.locator("#plantation-surface")).toHaveValue("30");
  // suggestion_sans_plantation : rien n'est enregistré sans « Ajouter ».
  expect(await page.evaluate(() => localStorage.getItem(Store.CLE))).toBe(avant);
});

test("[T62] sans_regle_comme_r3 : sans famille, association, rotation ni groupe, aucune aide de rotation ne s'affiche", async ({ page }) => {
  await page.goto("index.html");
  await page.evaluate(() => {
    const f = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    const c = f.ajouter("cultures", { nom: "tomate", famille: "Solanacées", unite: "kg", rendement: F(12), prix: F(3.5), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 15 });
    const v = f.ajouter("varietes", { cultureId: c.id, nom: "Heatmaster" });
    const e = f.ajouter("espaces", { nom: "planche 1", surface: 30, type: "plein_champ" });
    f.ajouter("plantations", { varieteId: v.id, espaceId: e.id, surface: 30, date: "2026-03-01" });
    f.ajouter("plantations", { varieteId: v.id, espaceId: e.id, surface: 30, date: "2026-08-01" });
  });
  await page.reload();
  await aller(page, "plantations");
  await expect(page.locator(".alerte-rotation")).toHaveCount(0);
  await expect(page.locator(".cal-retour")).toHaveCount(0);
  await expect(page.locator("[data-que-planter]")).toHaveCount(0);
  await expect(page.locator("#calendrier-legende")).not.toContainText(/trop tôt/i);
  await page.locator("#liste-plantations li").last().locator('[data-action="modifier"]').click();
  await expect(page.locator("#plantation-apercu")).toBeVisible();
  await expect(page.locator("#plantation-apercu [data-apercu]")).toHaveCount(0);
});
