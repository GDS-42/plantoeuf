// Tranche P2 — ventes (T35) : vue « Points de vente », vue « Offre et demande », page Ventes.
const { test, expect } = require("@playwright/test");
const { aller, ouvrir } = require("./outils.js");

// Ferme du scénario S4/S6 (courgette, marché de Saint-Paul le samedi), plus une épicerie qui ne vend
// rien mais coûte son trajet : son résultat est négatif. Saisie par le store, puis rechargement.
async function fermeVentes(page) {
  await page.goto("index.html");
  await page.evaluate(() => {
    const F = Store.fourchette;
    const ferme = Store.ouvrir(localStorage);
    const espace = ferme.ajouter("espaces", { nom: "planche 1", surface: 100, type: "plein_champ" });
    const culture = ferme.ajouter("cultures", {
      nom: "courgette", famille: "Cucurbitacées", unite: "kg", rendement: F(3), prix: F(2, 2.5, 3),
      joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10,
    });
    const variete = ferme.ajouter("varietes", {
      nom: "Black Beauty", cultureId: culture.id, rendement: null, prix: null, joursAvantRecolte: null, semainesRecolte: null, pertes: null,
    });
    ferme.ajouter("plantations", { varieteId: variete.id, espaceId: espace.id, surface: 100, date: "2026-03-01" });
    const marche = ferme.ajouter("pointsVente", { nom: "marché de Saint-Paul", distanceKm: 12, coutKm: F(0.4) });
    ferme.ajouter("seances", { pointVenteId: marche.id, jour: 6, debut: "2026-05-02", fin: "2026-06-27", frais: F(15) });
    ferme.ajouter("debouches", { pointVenteId: marche.id, produitId: culture.id, prix: F(2.5), volumeParSeance: F(15, 20, 25) });
    const epicerie = ferme.ajouter("pointsVente", { nom: "épicerie de Saint-Gilles", distanceKm: 9, coutKm: F(0.3, 0.4, 0.5) });
    ferme.ajouter("seances", { pointVenteId: epicerie.id, jour: 4, debut: "2026-05-07", fin: "2026-06-25", frais: F(0) });
  });
  await page.reload();
}

async function vue(page, nom) {
  await aller(page, "synthese");
  await page.locator(`#onglet-${nom}`).click();
  await expect(page.locator(`#section-${nom}`)).toBeVisible();
}

const valeurs = (locator) => locator.evaluateAll((els) => els.map((el) => Number(el.dataset.valeur)));
const nombre = async (locator) => Number(await locator.getAttribute("data-valeur"));
// Les trois valeurs exactes [basse, médiane, haute] d'une fourchette affichée sous `locator`.
const trois = async (locator) => [await nombre(locator.locator(".basse")), await nombre(locator.locator(".mediane")), await nombre(locator.locator(".haute"))];

// Couleur calculée d'un jeton de :root, pour comparer à la couleur d'un texte.
function couleurDuJeton(page, jeton) {
  return page.evaluate((j) => {
    const sonde = document.createElement("span");
    sonde.style.color = `var(${j})`;
    document.body.append(sonde);
    const couleur = getComputedStyle(sonde).color;
    sonde.remove();
    return couleur;
  }, jeton);
}

// ---- Vue « Points de vente » : cartes

test("[T35] EX-34 : une carte par point de vente, du meilleur résultat médian au moins bon, avec ses fourchettes", async ({ page }) => {
  await fermeVentes(page);
  await vue(page, "points");
  const cartes = page.locator("#points-cartes > .pv-carte");
  await expect(cartes).toHaveCount(2);
  await expect(cartes.nth(0)).toContainText("marché de Saint-Paul");
  await expect(cartes.nth(1)).toContainText("épicerie de Saint-Gilles");
  await expect(cartes.nth(0)).toContainText("9 séances");
  await expect(cartes.nth(1)).toContainText("8 séances");

  const medianes = await valeurs(page.locator("#points-cartes .pv-resultat .mediane"));
  expect(medianes[0]).toBeGreaterThan(medianes[1]);

  // Les trois valeurs du résultat d'une carte sont celles du total de son point dans le tableau.
  for (const carte of [cartes.nth(0), cartes.nth(1)]) {
    const id = await carte.getAttribute("data-point-vente");
    const total = page.locator(`#points tr[data-point-vente="${id}"][data-mesure="resultat"] td[data-mois="total"]`);
    for (const niveau of ["basse", "mediane", "haute"]) {
      expect(await nombre(carte.locator(`.pv-resultat .${niveau}`))).toBeCloseTo(await nombre(total.locator(`.${niveau}`)), 6);
    }
  }
  expect(medianes[0]).toBeCloseTo(178.6, 6);
  await expect(cartes.nth(0).locator('[data-mesure="ca"]')).toContainText("400");
  await expect(cartes.nth(0).locator('[data-mesure="couts"]')).toContainText("221");
  await expect(cartes.nth(0).locator(".pv-resultat")).toContainText(/entre .* et /);
});

test("[T35] un résultat négatif se voit : signe moins, couleur d'alerte, mention, part de la barre sous zéro", async ({ page }) => {
  await fermeVentes(page);
  await vue(page, "points");
  const epicerie = page.locator("#points-cartes > .pv-carte", { hasText: "épicerie" });
  const marche = page.locator("#points-cartes > .pv-carte", { hasText: "marché" });
  await expect(epicerie).toHaveClass(/negatif/);
  await expect(marche).not.toHaveClass(/negatif/);

  const resultat = epicerie.locator(".pv-resultat .mediane");
  expect(await nombre(resultat)).toBeCloseTo(-57.6, 6);
  await expect(resultat).toHaveText(/^[−-]\s?58/);
  expect(await resultat.evaluate((el) => getComputedStyle(el).color)).toBe(await couleurDuJeton(page, "--rouge-texte"));
  await expect(epicerie.locator(".pv-statut")).toContainText(/perte/i);
  await expect(marche.locator(".pv-statut")).toHaveCount(0);

  // Repère visuel : la fourchette en barre autour de zéro, sur une échelle commune aux cartes.
  const barre = epicerie.locator(".pv-barre");
  await expect(barre).toHaveAttribute("role", "img");
  await expect(barre).toHaveAttribute("aria-label", /entre/);
  const largeur = (l) => l.evaluate((el) => el.getBoundingClientRect().width);
  expect(await largeur(epicerie.locator(".pv-barre-perte"))).toBeGreaterThan(5);
  await expect(epicerie.locator(".pv-barre-gain")).toHaveCount(0);
  await expect(marche.locator(".pv-barre-perte")).toHaveCount(0);
  expect(await largeur(marche.locator(".pv-barre-gain"))).toBeGreaterThan(await largeur(epicerie.locator(".pv-barre-perte")));
  await expect(epicerie.locator(".pv-barre-zero")).toBeVisible();
});

// ---- Vue « Points de vente » : tableau mois par mois

test("[T35] EX-34 : le tableau des points de vente montre une mesure à la fois, au choix, sans changer les valeurs exactes", async ({ page }) => {
  await fermeVentes(page);
  await vue(page, "points");
  const boutons = page.locator("#points-mesures button");
  await expect(boutons).toHaveCount(4);
  await expect(boutons.filter({ hasText: "Résultat" })).toHaveAttribute("aria-pressed", "true");
  const visibles = page.locator("#points tbody tr").filter({ visible: true });
  await expect(visibles).toHaveCount(2);
  for (const mesure of await visibles.evaluateAll((trs) => trs.map((tr) => tr.dataset.mesure))) expect(mesure).toBe("resultat");
  const coin = page.locator("#points thead th").first();
  await expect(coin).toContainText(/résultat estimé/i);
  await expect(coin).toContainText("€");

  const avant = await valeurs(page.locator("#points [data-valeur]"));
  await boutons.filter({ hasText: "Chiffre d'affaires" }).click();
  await expect(boutons.filter({ hasText: "Chiffre d'affaires" })).toHaveAttribute("aria-pressed", "true");
  await expect(boutons.filter({ hasText: "Résultat" })).toHaveAttribute("aria-pressed", "false");
  await expect(visibles).toHaveCount(2);
  for (const mesure of await visibles.evaluateAll((trs) => trs.map((tr) => tr.dataset.mesure))) expect(mesure).toBe("ca");
  await expect(coin).toContainText(/chiffre d'affaires/i);

  await boutons.filter({ hasText: /^Séances$/ }).click();
  await expect(visibles).toHaveCount(2);
  await expect(page.locator('#points tr[data-mesure="seances"]', { hasText: "marché" }).locator('td[data-mois="total"]')).toHaveText("9");
  await expect(coin).not.toContainText("€");
  expect(await valeurs(page.locator("#points [data-valeur]"))).toEqual(avant);
});

test("[T35] EX-34 : dans le tableau, médiane en évidence, fourchette dessous, unité dans l'en-tête, négatif marqué, en-têtes et total figés", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await fermeVentes(page);
  await vue(page, "points");
  const total = page.locator('#points tr[data-mesure="resultat"]', { hasText: "épicerie" }).locator('td[data-mois="total"]');
  await expect(total).toHaveClass(/negatif/);
  await expect(total.locator(".mediane")).toHaveText(/^[−-]\s?58$/);
  expect(await total.locator(".mediane").evaluate((el) => getComputedStyle(el).color)).toBe(await couleurDuJeton(page, "--rouge-texte"));
  const tailles = await total.evaluate((td) => ({
    mediane: parseFloat(getComputedStyle(td.querySelector(".mediane")).fontSize),
    bornes: parseFloat(getComputedStyle(td.querySelector(".bornes")).fontSize),
    graisse: Number(getComputedStyle(td.querySelector(".mediane")).fontWeight),
  }));
  expect(tailles.bornes).toBeLessThan(tailles.mediane);
  expect(tailles.bornes).toBeGreaterThanOrEqual(12);
  expect(tailles.graisse).toBeGreaterThanOrEqual(600);
  await expect(total.locator(".bornes")).toBeVisible();
  await expect(total.locator(".bornes")).toHaveText(/à/);

  // L'unité est dans l'en-tête, pas dans les cases.
  for (const texte of await page.locator("#points tbody tr").filter({ visible: true }).locator("td").allTextContents()) {
    expect(texte).not.toContain("€");
  }
  const positions = await page.evaluate(() => ({
    entete: getComputedStyle(document.querySelector("#points thead th")).position,
    nom: getComputedStyle(document.querySelector("#points tbody th")).position,
    total: getComputedStyle(document.querySelector('#points tbody td[data-mois="total"]')).position,
  }));
  expect(positions).toEqual({ entete: "sticky", nom: "sticky", total: "sticky" });
  await expect(page.locator("#points-legende")).toContainText(/ne s'additionnent pas/);
});

// ---- Vue « Offre et demande »

test("[T35] EX-20 : la matrice offre-demande a une ligne par produit ; chaque case est colorée selon l'état et porte l'écart signé", async ({ page }) => {
  await fermeVentes(page);
  await vue(page, "offre");
  await expect(page.locator("#matrice tbody tr").filter({ visible: true })).toHaveCount(1);
  await expect(page.locator('#matrice tr[data-mesure="demande"]')).toHaveCount(1);
  const ligne = page.locator('#matrice tr[data-mesure="offre"]', { hasText: "courgette" });

  const excedent = ligne.locator('td[data-semaine="2026-04-27"]');
  await expect(excedent).toHaveAttribute("data-etat", "depasse");
  await expect(excedent).toHaveAttribute("data-sur", "true");
  await expect(excedent.locator(".ecart")).toBeVisible();
  await expect(excedent.locator(".ecart")).toHaveText(/^\+14$/);
  expect(await nombre(excedent.locator(".ecart"))).toBeCloseTo(13.75, 6);

  const manque = ligne.locator('td[data-semaine="2026-06-22"]');
  await expect(manque).toHaveAttribute("data-etat", "manque");
  await expect(manque.locator(".ecart")).toHaveText(/^−20$/);

  const fond = (l) => l.evaluate((el) => getComputedStyle(el).backgroundColor.match(/\d+/g).map(Number));
  const [rb, gb, bb] = await fond(excedent);
  expect(bb, "excédent : teinte bleue").toBeGreaterThan(rb);
  const [rm, , bm] = await fond(manque);
  expect(rm, "manque : teinte ambre").toBeGreaterThan(bm);
  expect(gb).toBeGreaterThan(0);
  // Un écart sûr porte un cadre ; l'intensité suit l'écart (toute la demande manque : teinte la plus forte).
  expect(await excedent.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none");
  await expect(manque).toHaveClass(/od-n3/);
  await expect(excedent).toHaveClass(/od-n2/);

  // Survol : les fourchettes de l'offre et de la demande dans la bulle d'aide.
  await expect(excedent).toHaveAttribute("title", /33,8.*20.*15 à 25/s);
  await expect(page.locator('#matrice thead th[data-semaine="2026-04-27"]')).toContainText("27 avr.");
  await expect(page.locator('#matrice thead th[data-semaine="2026-04-27"]')).toContainText("18");

  // Légende : un échantillon par état, et le cadre de l'écart sûr.
  for (const etat of ["depasse", "manque", "equilibre", "sans_debouche"]) {
    await expect(page.locator(`#offre-legende [data-etat="${etat}"]`)).toBeVisible();
  }
  await expect(page.locator("#offre-legende [data-sur]")).toBeVisible();
});

test("[T35] le bilan de la saison de chaque produit compte ses semaines en excédent et en manque", async ({ page }) => {
  await fermeVentes(page);
  await vue(page, "offre");
  const ligne = page.locator('#matrice tr[data-mesure="offre"]', { hasText: "courgette" });
  const compte = (etat) => ligne.locator(`td[data-etat="${etat}"]`).count();
  expect(await compte("depasse")).toBe(8);
  expect(await compte("manque")).toBe(1);
  const bilan = ligne.locator(".od-bilan");
  await expect(bilan).toContainText("8 sem. en excédent");
  await expect(bilan).toContainText("1 sem. en manque");
});

test("[T35] la semaine choisie se lit en détail : offre, demande et écart en fourchettes, et les ventes par point de vente", async ({ page }) => {
  await fermeVentes(page);
  await vue(page, "offre");
  const ligne = page.locator('#matrice tr[data-mesure="offre"]', { hasText: "courgette" });
  const cellule = ligne.locator('td[data-semaine="2026-04-27"]');
  await cellule.click();
  await expect(cellule).toHaveAttribute("aria-current", "true");
  const detail = page.locator("#offre-detail");
  await expect(detail).toBeVisible();
  await expect(detail).toHaveAttribute("data-semaine", "2026-04-27");
  await expect(detail).toContainText("courgette");
  await expect(detail).toContainText(/semaine 18/i);

  const demandeCase = page.locator('#matrice tr[data-mesure="demande"] td[data-semaine="2026-04-27"]');
  expect(await trois(detail.locator('[data-mesure="offre"]'))).toEqual(await trois(cellule.locator(".od-offre")));
  expect(await trois(detail.locator('[data-mesure="demande"]'))).toEqual(await trois(demandeCase));
  expect(await trois(demandeCase)).toEqual([15, 20, 25]);
  await expect(detail.locator('[data-mesure="demande"]')).toContainText("15 à 25");
  expect(await nombre(detail.locator('[data-mesure="ecart"] .ecart'))).toBeCloseTo(13.75, 6);
  await expect(detail.locator('[data-mesure="ecart"]')).toContainText(/sûr/i);
  const debouche = detail.locator(".od-detail-debouches tbody tr");
  await expect(debouche).toHaveCount(1);
  await expect(debouche.locator("th")).toHaveText("marché de Saint-Paul");
  await expect(debouche).toContainText("20 kg");
  await expect(debouche).toContainText("15 à 25");

  // Au clavier : les flèches parcourent la matrice, et le détail suit la case qui a le focus.
  await cellule.focus();
  await page.keyboard.press("ArrowRight");
  const suivante = ligne.locator('td[data-semaine="2026-05-04"]');
  await expect(suivante).toBeFocused();
  await expect(detail).toHaveAttribute("data-semaine", "2026-05-04");
  await expect(suivante).toHaveAttribute("tabindex", "0");
  await expect(cellule).toHaveAttribute("tabindex", "-1");
});

// ---- Page Ventes : lignes des listes

test("[T35] page Ventes : chaque ligne donne ses faits, fourchettes comprises", async ({ page }) => {
  await fermeVentes(page);
  await aller(page, "ventes");
  const marche = page.locator("#liste-pointsVente li", { hasText: "marché de Saint-Paul" });
  await expect(marche.locator(".ligne-titre")).toHaveText("marché de Saint-Paul");
  for (const texte of ["12 km", "0,4 €", "9 séances", "1 débouché", "179 €"]) await expect(marche).toContainText(texte);
  const epicerie = page.locator("#liste-pointsVente li", { hasText: "épicerie" });
  await expect(epicerie).toContainText("aucun débouché");
  await expect(epicerie.locator(".negatif")).toContainText(/[−-]\s?58/);

  const seance = page.locator("#liste-seances li", { hasText: "marché de Saint-Paul" });
  await expect(seance.locator(".ligne-titre")).toHaveText("marché de Saint-Paul");
  for (const texte of ["samedi", "02/05/2026", "27/06/2026", "9 séances", "24,6 €", "15 €"]) await expect(seance).toContainText(texte);

  const debouche = page.locator("#liste-debouches li");
  await expect(debouche.locator(".ligne-titre")).toHaveText("courgette à marché de Saint-Paul");
  for (const texte of ["2,5 €/kg", "20 kg par séance", "15 à 25"]) await expect(debouche).toContainText(texte);
  for (const liste of ["pointsVente", "seances", "debouches"]) {
    await expect(page.locator(`#liste-${liste} li .ligne-faits`).first()).toBeVisible();
  }
});

// ---- EX-36 : vues et listes vides, tiroirs qui disent quoi faire d'abord

test("[T35] EX-36 : sans point de vente, les vues et les listes disent ce qu'elles contiendront et mènent au geste suivant", async ({ page }) => {
  await page.goto("index.html");
  await vue(page, "points");
  await expect(page.locator("#points-vide")).toBeVisible();
  await expect(page.locator("#points-vide")).toContainText(/chaque point de vente/i);
  await vue(page, "offre");
  await expect(page.locator("#matrice-vide")).toBeVisible();
  await expect(page.locator("#matrice-vide")).toContainText(/chaque semaine/i);

  await aller(page, "ventes");
  await expect(page.locator("#pointsVente-vide")).toContainText(/chaque culture se vend alors toute/);
  for (const objet of ["pointsVente", "seances", "debouches"]) {
    await expect(page.locator(`#${objet}-vide`)).not.toContainText("pour l'instant");
  }

  await vue(page, "points");
  await page.locator('#points-vide [data-ouvrir="pointsVente"]').click();
  await expect(page.locator("#page-ventes")).toBeVisible();
  await expect(page.locator("#tiroir-pointsVente")).toBeVisible();
});

test("[T35] EX-36 : les tiroirs de séance et de débouché disent quoi faire quand il manque un point de vente ou une culture", async ({ page }) => {
  await page.goto("index.html");
  await ouvrir(page, "seances");
  const manque = page.locator("#seance-manque-point");
  await expect(manque).toBeVisible();
  await manque.locator('[data-ouvrir="pointsVente"]').click();
  await expect(page.locator("#tiroir-seances")).toBeHidden();
  await expect(page.locator("#tiroir-pointsVente")).toBeVisible();
  await page.locator("#pointVente-nom").fill("marché");
  await page.locator("#pointVente-distanceKm").fill("5");
  await page.locator("#pointVente-coutKm").fill("0,4");
  await page.locator("#pointVente-ajouter").click();
  await expect(page.locator("#tiroir-pointsVente")).toBeHidden();

  await ouvrir(page, "seances");
  await expect(page.locator("#seance-manque-point")).toBeHidden();
  await page.keyboard.press("Escape");

  await ouvrir(page, "debouches");
  await expect(page.locator("#debouche-manque-point")).toBeHidden();
  await expect(page.locator("#debouche-manque-culture")).toBeVisible();
  await expect(page.locator('#debouche-manque-culture [data-ouvrir="cultures"]')).toBeVisible();
});

// ---- EX-37 : lisibilité des vues de vente

// Pour chaque texte visible sous `racine` : sa taille et son contraste avec le fond réellement peint dessous.
async function auditerTextes(page, racine) {
  return page.evaluate((selecteur) => {
    const lineaire = (v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const luminance = ({ r, g, b }) => 0.2126 * lineaire(r) + 0.7152 * lineaire(g) + 0.0722 * lineaire(b);
    const lire = (s) => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const melanger = (dessus, dessous) => ({
      r: dessus.r * dessus.a + dessous.r * (1 - dessus.a),
      g: dessus.g * dessus.a + dessous.g * (1 - dessus.a),
      b: dessus.b * dessus.a + dessous.b * (1 - dessus.a),
    });
    const fondDe = (el) => {
      const couches = [];
      for (let e = el; e; e = e.parentElement) {
        const c = lire(getComputedStyle(e).backgroundColor);
        if (c && c.a > 0) {
          couches.push(c);
          if (c.a >= 1) break;
        }
      }
      let fond = { r: 255, g: 255, b: 255 };
      for (const c of couches.reverse()) fond = melanger(c, fond);
      return fond;
    };
    const resultats = [];
    const marcheur = document.createTreeWalker(document.querySelector(selecteur), NodeFilter.SHOW_TEXT);
    for (let n = marcheur.nextNode(); n; n = marcheur.nextNode()) {
      const el = n.parentElement;
      if (!n.textContent.trim() || el.closest("script, style, select") || !el.checkVisibility()) continue;
      const style = getComputedStyle(el);
      const couleur = lire(style.color);
      const texte = melanger(couleur, fondDe(el));
      const [clair, sombre] = [luminance(texte), luminance(fondDe(el))].sort((a, b) => b - a);
      resultats.push({ texte: n.textContent.trim().slice(0, 40), taille: parseFloat(style.fontSize), contraste: (clair + 0.05) / (sombre + 0.05) });
    }
    return resultats;
  }, racine);
}

function verifierLisibilite(textes, contexte) {
  expect(textes.length, contexte).toBeGreaterThan(10);
  expect(textes.filter((t) => t.taille < 12), `${contexte} : textes de moins de 12 px`).toEqual([]);
  expect(textes.filter((t) => t.contraste < 4.5).map((t) => `${t.texte} (${t.contraste.toFixed(2)})`), `${contexte} : contraste < 4,5:1`).toEqual([]);
}

for (const theme of ["light", "dark"]) {
  test(`[T35] EX-37 : vues et page des ventes lisibles (taille, contraste), ferme d'exemple, thème ${theme === "light" ? "clair" : "sombre"}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("index.html");
    await page.locator("#charger-exemple").click();
    await vue(page, "points");
    verifierLisibilite(await auditerTextes(page, "#section-points"), "points de vente");
    await page.locator("#points-mesures button", { hasText: "Coût des séances" }).click();
    verifierLisibilite(await auditerTextes(page, "#section-points"), "points de vente, coûts");
    await vue(page, "offre");
    await page.locator('#matrice td[data-etat="manque"][data-sur="true"]').first().click();
    verifierLisibilite(await auditerTextes(page, "#section-offre"), "offre et demande");
    await page.locator('#matrice td[data-etat="depasse"]').last().click();
    verifierLisibilite(await auditerTextes(page, "#section-offre"), "offre et demande, excédent");
    await aller(page, "ventes");
    verifierLisibilite(await auditerTextes(page, "#page-ventes"), "page Ventes");
  });
}

test("[T35] EX-37 : aucun défilement horizontal de la page sur les vues de vente, de 360 à 1920 px ; seuls les tableaux défilent dans leur boîte", async ({ page }) => {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  for (const largeur of [360, 390, 1366, 1920]) {
    await page.setViewportSize({ width: largeur, height: 900 });
    for (const nom of ["points", "offre"]) {
      await vue(page, nom);
      const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(debord, `${nom} à ${largeur} px`).toBeLessThanOrEqual(0);
    }
    await aller(page, "ventes");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `ventes à ${largeur} px`).toBeLessThanOrEqual(0);
  }
  // Au téléphone, la matrice défile dans sa boîte, ses noms de produit restent visibles.
  await page.setViewportSize({ width: 390, height: 844 });
  await vue(page, "offre");
  const boite = page.locator("#matrice-defilement");
  await boite.scrollIntoViewIfNeeded();
  expect(await boite.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  await boite.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
  await expect(page.locator("#matrice tbody th").first()).toBeInViewport();
});
