// Tranche P2 — synthèse (T34) : chiffres clés, graphique mois par mois, tableau « Par culture » à une mesure.
const { test, expect } = require("@playwright/test");
const { aller, saisirS2 } = require("./outils.js");

const NIVEAUX = ["basse", "mediane", "haute"];

// R2 : la ferme d'exemple se charge dans l'année du jour ; l'horloge fixée donne la saison 2026 (comme
// test/p2-ferme.e2e.js), pour que les mois attendus ne dépendent pas du jour où le test tourne.
async function chargerExemple(page) {
  await page.clock.setFixedTime(new Date("2026-05-20T10:00:00+04:00"));
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(51);
  await aller(page, "synthese");
}

function releverErreurs(page) {
  const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") erreurs.push(message.text());
  });
  return erreurs;
}

// Les trois valeurs exactes (data-valeur) d'un élément qui contient .basse, .mediane et .haute.
async function fourchette(locator) {
  const valeurs = {};
  for (const niveau of NIVEAUX) valeurs[niveau] = Number(await locator.locator(`.${niveau}`).first().getAttribute("data-valeur"));
  return valeurs;
}

const pied = (page, mesure) => page.locator(`#tableau tfoot tr[data-mesure="${mesure}"] td[data-mois="total"]`);
const chiffres = (texte) => texte.replace(/[^\d-]/g, "");

// ---- EX-33 : chiffres clés

test("[T34] EX-33 : les chiffres clés donnent le chiffre d'affaires, les coûts, la marge et les œufs, justes et en fourchette", async ({ page }) => {
  const erreurs = releverErreurs(page);
  await chargerExemple(page);
  const tuile = (nom) => page.locator(`#tuiles .tuile[data-chiffre="${nom}"]`);
  await expect(page.locator("#tuiles .tuile")).toHaveCount(5);

  expect(await fourchette(tuile("ca"))).toEqual(await fourchette(pied(page, "ca")));
  expect(await fourchette(tuile("marge"))).toEqual(await fourchette(pied(page, "marge")));
  const seances = await fourchette(pied(page, "couts"));
  const aliment = await fourchette(pied(page, "aliment"));
  const cultures = await fourchette(pied(page, "cultures"));
  const couts = await fourchette(tuile("couts"));
  for (const niveau of NIVEAUX) expect(couts[niveau]).toBeCloseTo(seances[niveau] + aliment[niveau] + cultures[niveau], 6);
  const oeufs = page.locator('#tableau tbody tr[data-culture="oeufs"][data-mesure="volume"] td[data-mois="total"]');
  expect(await fourchette(tuile("oeufs"))).toEqual(await fourchette(oeufs));

  // Chaque tuile : son nom, la médiane en grand, « entre … et … », un repère de la fourchette.
  for (const nom of ["ca", "couts", "marge", "revenu", "oeufs"]) {
    const t = tuile(nom);
    await expect(t.locator(".tuile-titre")).toBeVisible();
    await expect(t.locator(".tuile-valeur .mediane")).toBeVisible();
    await expect(t.locator(".tuile-bornes")).toContainText(/entre .+ et /);
    await expect(t.locator(".tuile-repere .repere-fourchette")).toBeVisible();
    await expect(t.locator(".tuile-repere .repere-mediane")).toBeVisible();
    const taille = await t.locator(".tuile-valeur .mediane").evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(taille, nom).toBeGreaterThanOrEqual(24);
  }
  await expect(tuile("ca").locator(".tuile-valeur .mediane")).toHaveText(/€/);
  // Les coûts détaillent séances et aliment, chacun en fourchette.
  await expect(tuile("couts").locator('[data-cout="seances"]')).toContainText(/séances/i);
  await expect(tuile("couts").locator('[data-cout="aliment"]')).toContainText(/aliment/i);
  expect(await fourchette(tuile("couts").locator('[data-cout="aliment"]'))).toEqual(aliment);
  // Le chiffre d'affaires montre la part des cultures et celle des œufs, chacune en fourchette.
  const caOeufs = page.locator('#tableau tbody tr[data-culture="oeufs"][data-mesure="ca"] td[data-mois="total"]');
  expect(await fourchette(tuile("ca").locator('[data-part="oeufs"]'))).toEqual(await fourchette(caOeufs));
  await expect(tuile("ca").locator('[data-part="cultures"]')).toContainText(/cultures/i);
  expect(erreurs).toEqual([]);
});

test("[T34] EX-33 : les chiffres clés suivent les modifications ; sans poules, pas de tuile œufs ; sans coût, aucun n'est inventé", async ({ page }) => {
  await page.goto("index.html");
  await saisirS2(page);
  await aller(page, "synthese");
  await expect(page.locator("#tuiles .tuile")).toHaveCount(3);
  await expect(page.locator('#tuiles .tuile[data-chiffre="oeufs"]')).toHaveCount(0);
  await expect(page.locator("#tuiles [data-part]")).toHaveCount(0);
  const ca = page.locator('#tuiles .tuile[data-chiffre="ca"]');
  expect(await fourchette(ca)).toEqual({ basse: 540, mediane: 675, haute: 810 });
  expect(await fourchette(page.locator('#tuiles .tuile[data-chiffre="couts"]'))).toEqual({ basse: 0, mediane: 0, haute: 0 });
  await expect(page.locator('#tuiles .tuile[data-chiffre="couts"]')).toContainText(/aucune séance/i);
});

// ---- EX-33 : graphique mois par mois

test("[T34] EX-33 : le graphique montre chaque mois du tableau, le chiffre d'affaires et la marge avec leur fourchette", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await chargerExemple(page);
  await expect(page.locator("#carte-graphique")).toBeVisible();
  await expect(page.locator("#graphique-titre")).not.toBeEmpty();
  const svg = page.locator("#graphique svg.graphique-svg");
  await expect(svg).toBeVisible();
  const description = await svg.evaluate((el) => (el.getAttribute("aria-labelledby") || "").split(" ").map((id) => document.getElementById(id)?.textContent || "").join(" "));
  expect(description).toMatch(/chiffre d'affaires/i);
  expect(description).toMatch(/marge/i);

  const moisTableau = await page.locator("#tableau thead th[data-mois]").evaluateAll((ths) => ths.map((th) => th.dataset.mois));
  const moisGraphique = await page.locator("#graphique g.graphique-mois").evaluateAll((gs) => gs.map((g) => g.dataset.mois));
  expect(moisGraphique).toEqual(moisTableau);

  for (const mois of moisTableau) {
    const g = page.locator(`#graphique g.graphique-mois[data-mois="${mois}"]`);
    const ca = await fourchette(page.locator(`#tableau tfoot tr[data-mesure="ca"] td[data-mois="${mois}"]`));
    const marge = await fourchette(page.locator(`#tableau tfoot tr[data-mesure="marge"] td[data-mois="${mois}"]`));
    expect(Number(await g.locator(".barre-ca").getAttribute("data-valeur"))).toBe(ca.mediane);
    expect(Number(await g.locator(".fourchette-ca").getAttribute("data-basse"))).toBe(ca.basse);
    expect(Number(await g.locator(".fourchette-ca").getAttribute("data-haute"))).toBe(ca.haute);
    expect(Number(await page.locator(`#graphique .point-marge[data-mois="${mois}"]`).getAttribute("data-valeur"))).toBe(marge.mediane);
    if (ca.haute > ca.basse) {
      // La fourchette se voit : elle dépasse le haut de la barre (la médiane) des deux côtés.
      const boites = await g.evaluate((el) => {
        const barre = el.querySelector(".barre-ca").getBBox();
        const f = el.querySelector(".fourchette-ca").getBBox();
        return { barreHaut: barre.y, fHaut: f.y, fBas: f.y + f.height };
      });
      expect(boites.fHaut).toBeLessThan(boites.barreHaut);
      expect(boites.fBas).toBeGreaterThan(boites.barreHaut);
    }
  }
  // La fourchette de la marge, en bande ; la marge de mars est négative : le zéro est marqué.
  await expect(page.locator("#graphique .bande-marge")).toHaveCount(1);
  await expect(page.locator("#graphique .ligne-zero")).toHaveCount(1);
  await expect(page.locator("#graphique .legende-graphique")).toContainText(/chiffre d'affaires/i);
  await expect(page.locator("#graphique .legende-graphique")).toContainText(/marge/i);
});

test("[T34] EX-33 : au survol ou au clavier, une infobulle donne les fourchettes exactes du mois", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await chargerExemple(page);
  const infobulle = page.locator("#graphique .infobulle");
  await expect(infobulle).toBeHidden();

  const juillet = page.locator('#graphique .zone-survol[data-mois="2026-07"]');
  await juillet.hover();
  await expect(infobulle).toBeVisible();
  await expect(infobulle).toContainText("juillet 2026");
  const ca = await fourchette(page.locator('#tableau tfoot tr[data-mesure="ca"] td[data-mois="2026-07"]'));
  const marge = await fourchette(page.locator('#tableau tfoot tr[data-mesure="marge"] td[data-mois="2026-07"]'));
  const texte = chiffres(await infobulle.textContent());
  for (const valeur of [...Object.values(ca), ...Object.values(marge)]) expect(texte).toContain(String(Math.round(valeur)));

  await page.mouse.move(5, 5);
  await expect(infobulle).toBeHidden();
  await page.locator("#graphique svg.graphique-svg").focus();
  await page.keyboard.press("End");
  await expect(infobulle).toBeVisible();
  await expect(infobulle).toContainText("décembre 2026");
  await page.keyboard.press("ArrowLeft");
  await expect(infobulle).toContainText("novembre 2026");
  await page.keyboard.press("Escape");
  await expect(infobulle).toBeHidden();
});

test("[T34] EX-33 : le graphique remplit la largeur de sa carte et se redessine quand elle change", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await chargerExemple(page);
  const largeurs = async () => page.evaluate(() => ({
    svg: document.querySelector("#graphique svg.graphique-svg").getBoundingClientRect().width,
    boite: document.getElementById("graphique").clientWidth,
  }));
  const grand = await largeurs();
  expect(grand.svg).toBeGreaterThan(grand.boite - 48);
  expect(grand.svg).toBeLessThanOrEqual(grand.boite);
  await page.setViewportSize({ width: 900, height: 768 });
  await expect.poll(async () => (await largeurs()).svg).toBeLessThan(grand.svg - 100);
  const petit = await largeurs();
  expect(petit.svg).toBeGreaterThan(petit.boite - 48);
  for (const largeur of [390, 360]) {
    await page.setViewportSize({ width: largeur, height: 800 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  }
});

// ---- EX-34 : le tableau « Par culture », une mesure à la fois

async function valeursExactes(page) {
  return page.locator("#tableau [data-valeur]").evaluateAll((els) => els.map((el) => el.dataset.valeur));
}

async function lignesVisibles(page) {
  return page.locator("#tableau tbody tr[data-culture]").evaluateAll((trs) => trs.filter((tr) => tr.checkVisibility()).map((tr) => `${tr.dataset.culture}:${tr.dataset.mesure}`));
}

test("[T34] EX-34, P2-S3 : chiffres clés et graphique présents ; une ligne par culture ; passer au volume change la mesure sans changer les valeurs", async ({ page }) => {
  await chargerExemple(page);
  await expect(page.locator("#tuiles .tuile").first()).toBeVisible();
  await expect(page.locator("#graphique svg.graphique-svg")).toBeVisible();

  const boutons = page.locator("#tableau-mesures button[data-mesure]");
  await expect(boutons).toHaveCount(3);
  const ca = page.locator('#tableau-mesures button[data-mesure="ca"]');
  const volume = page.locator('#tableau-mesures button[data-mesure="volume"]');
  await expect(ca).toHaveAttribute("aria-pressed", "true");
  await expect(volume).toHaveAttribute("aria-pressed", "false");

  // Une ligne visible par culture (11) et une pour les œufs, toutes de la mesure choisie.
  const avant = await lignesVisibles(page);
  expect(avant).toHaveLength(12);
  expect(new Set(avant.map((l) => l.split(":")[0])).size).toBe(12);
  expect(avant.every((l) => l.endsWith(":ca"))).toBe(true);
  await expect(page.locator('#tableau tfoot tr[data-mesure="ca"]')).toBeVisible();
  const valeurs = await valeursExactes(page);

  await volume.click();
  await expect(volume).toHaveAttribute("aria-pressed", "true");
  await expect(ca).toHaveAttribute("aria-pressed", "false");
  const apres = await lignesVisibles(page);
  expect(apres).toHaveLength(12);
  expect(apres.every((l) => l.endsWith(":volume"))).toBe(true);
  expect(await valeursExactes(page)).toEqual(valeurs);
  // Des unités différentes ne s'additionnent pas : pas de pied en volume.
  await expect(page.locator("#tableau tfoot tr[data-mesure]").first()).toBeHidden();
  await expect(page.locator("#tableau-legende")).toContainText(/unité/i);
  await expect(page.locator('#tableau tbody tr[data-mesure="volume"]', { hasText: "Tomate" }).locator("th")).toContainText("kg");

  await page.locator('#tableau-mesures button[data-mesure="marge"]').click();
  expect((await lignesVisibles(page)).every((l) => l.endsWith(":marge"))).toBe(true);
  await expect(page.locator('#tableau tfoot tr[data-mesure="marge"]')).toBeVisible();
  expect(await valeursExactes(page)).toEqual(valeurs);
});

test("[T34] EX-34 : la médiane en évidence, la fourchette dessous en petit, l'unité dans l'en-tête et non dans les cases", async ({ page }) => {
  await chargerExemple(page);
  const ligne = page.locator('#tableau tbody tr[data-mesure="ca"]', { hasText: "Tomate" });
  const caseJuillet = ligne.locator('td[data-mois="2026-07"]');
  const mediane = caseJuillet.locator(".mediane");
  const bornes = caseJuillet.locator(".bornes");
  await expect(mediane).toBeVisible();
  await expect(bornes).toBeVisible();
  await expect(mediane).not.toContainText("€");
  await expect(bornes).not.toContainText("€");
  const taille = async (l) => l.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const graisse = async (l) => l.evaluate((el) => Number(getComputedStyle(el).fontWeight));
  expect(await taille(mediane)).toBeGreaterThanOrEqual(14);
  expect(await taille(bornes)).toBeGreaterThanOrEqual(12);
  expect(await taille(bornes)).toBeLessThan(await taille(mediane));
  expect(await graisse(mediane)).toBeGreaterThan(await graisse(bornes));
  const haut = async (l) => (await l.boundingBox()).y;
  expect(await haut(bornes)).toBeGreaterThan(await haut(mediane));
  await expect(page.locator("#tableau thead")).toContainText("€");
  // Mois abrégés, en-têtes sur une ligne ; le total à part.
  await expect(page.locator('#tableau thead th[data-mois="2026-07"]')).toContainText("juil.");
  await expect(page.locator("#tableau thead th.col-total")).toContainText(/total/i);
});

test("[T34] EX-34 : une teinte proportionnelle à la valeur montre la saison d'un coup d'œil ; le total est mis à part", async ({ page }) => {
  await chargerExemple(page);
  const cases = await page.locator('#tableau tbody tr[data-mesure="ca"] td[data-mois]:not([data-mois="total"])').evaluateAll((tds) =>
    tds.map((td) => ({ valeur: Number(td.querySelector(".mediane").dataset.valeur), teinte: Number(td.dataset.teinte || 0), fond: getComputedStyle(td).backgroundColor })));
  const max = Math.max(...cases.map((c) => c.valeur));
  expect(cases.find((c) => c.valeur === max).teinte).toBe(5);
  for (const c of cases.filter((x) => x.valeur === 0)) expect(c.teinte).toBe(0);
  // La teinte croît avec la valeur.
  const triees = [...cases].sort((a, b) => a.valeur - b.valeur);
  for (let i = 1; i < triees.length; i++) expect(triees[i].teinte).toBeGreaterThanOrEqual(triees[i - 1].teinte);
  expect(new Set(cases.map((c) => c.fond)).size).toBeGreaterThanOrEqual(4);

  const total = page.locator('#tableau tbody tr[data-mesure="ca"]').first().locator('td[data-mois="total"]');
  const style = await total.evaluate((el) => ({ position: getComputedStyle(el).position, droite: getComputedStyle(el).right, graisse: Number(getComputedStyle(el.querySelector(".mediane")).fontWeight) }));
  expect(style.position).toBe("sticky");
  expect(style.droite).toBe("0px");
  expect(style.graisse).toBeGreaterThanOrEqual(650);
});

test("[T34] EX-34, EX-13 : les mois, les cultures et le total restent visibles pendant le défilement du tableau", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  await chargerExemple(page);
  const boite = page.locator("#tableau-defilement");
  await boite.scrollIntoViewIfNeeded();
  const debord = await boite.evaluate((el) => ({ x: el.scrollWidth - el.clientWidth, y: el.scrollHeight - el.clientHeight }));
  expect(debord.x).toBeGreaterThan(0);
  expect(debord.y).toBeGreaterThan(0);
  await boite.evaluate((el) => { el.scrollLeft = el.scrollWidth / 2; el.scrollTop = el.scrollHeight; });

  const dansLaBoite = async (locator) => {
    const [b, e] = [await boite.boundingBox(), await locator.boundingBox()];
    return e.x >= b.x - 1 && e.x + e.width <= b.x + b.width + 1 && e.y >= b.y - 1 && e.y + e.height <= b.y + b.height + 1;
  };
  expect(await dansLaBoite(page.locator("#tableau thead th").first())).toBe(true);
  expect(await dansLaBoite(page.locator("#tableau thead th.col-total"))).toBe(true);
  // R2 : avec les charges fixes et le revenu, le pied occupe le bas de la boîte défilée ; la dernière ligne du
  // tableau est celle du revenu, dont le nom est dans la même colonne figée que les cultures.
  const derniere = page.locator('#tableau tfoot tr[data-mesure="revenu"]');
  expect(await dansLaBoite(derniere.locator("th"))).toBe(true);
  expect(await dansLaBoite(derniere.locator('td[data-mois="total"]'))).toBe(true);
  // Rien ne se superpose au nom de la ligne : l'en-tête figé est au-dessus, la case du mois passe dessous.
  const dessus = await derniere.locator("th").evaluate((th) => {
    const r = th.getBoundingClientRect();
    return th.contains(document.elementFromPoint(r.left + 6, r.top + r.height / 2));
  });
  expect(dessus).toBe(true);
});

test("[T34] EX-34 : l'atelier poules garde son bandeau, et sa ligne suit la mesure choisie", async ({ page }) => {
  await chargerExemple(page);
  const bandeau = page.locator('#tableau tbody tr.bandeau-atelier[data-atelier="poules"]');
  await expect(bandeau).toBeVisible();
  await expect(bandeau).toContainText(/atelier poules/i);
  for (const mesure of ["ca", "marge", "volume"]) {
    await page.locator(`#tableau-mesures button[data-mesure="${mesure}"]`).click();
    await expect(bandeau).toBeVisible();
    await expect(page.locator(`#tableau tbody tr[data-culture="oeufs"][data-mesure="${mesure}"]`)).toBeVisible();
    for (const autre of ["ca", "marge", "volume", "aliment"].filter((m) => m !== mesure)) {
      await expect(page.locator(`#tableau tbody tr[data-culture="oeufs"][data-mesure="${autre}"]`)).toBeHidden();
    }
  }
  // En marge, la ligne des œufs dit que l'aliment est déduit.
  await page.locator('#tableau-mesures button[data-mesure="marge"]').click();
  await expect(page.locator('#tableau tbody tr[data-culture="oeufs"][data-mesure="marge"] th')).toContainText(/aliment/i);
});

// ---- EX-33, EX-36 : rien à montrer

test("[T34] EX-33, EX-36 : sans production, ni chiffres clés ni graphique ; la vue « Par culture » dit ce qu'elle montrera et propose le geste suivant", async ({ page }) => {
  const erreurs = releverErreurs(page);
  await page.goto("index.html");
  await expect(page.locator("#accueil")).toBeVisible();
  await expect(page.locator("#tuiles .tuile")).toHaveCount(0);
  await expect(page.locator("#carte-graphique")).toBeHidden();
  await expect(page.locator("#tableau")).toBeHidden();
  await expect(page.locator("#tableau-mesures")).toBeHidden();
  const vide = page.locator("#tableau-vide");
  await expect(vide).toBeVisible();
  await expect(vide).toContainText(/mois/i);
  // Le geste suivant est la première étape qui manque : ici, un espace.
  await vide.locator('[data-ouvrir="espaces"]').click();
  await expect(page.locator("#page-espaces")).toBeVisible();
  await expect(page.locator("#tiroir-espaces")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("index.html");
  await saisirS2(page);
  const supprimer = page.locator('#liste-plantations [data-action="supprimer"]');
  await supprimer.first().click();
  await aller(page, "synthese");
  await expect(page.locator("#tuiles .tuile")).toHaveCount(0);
  await expect(vide.locator('[data-ouvrir="plantations"]')).toBeVisible();
  expect(erreurs).toEqual([]);
});

// ---- EX-37 : lisibilité de la synthèse, thème clair et sombre

async function auditerTextes(page) {
  return page.evaluate(() => {
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
    const racine = document.getElementById("page-synthese");
    const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
    for (let n = marcheur.nextNode(); n; n = marcheur.nextNode()) {
      const el = n.parentElement;
      if (!n.textContent.trim() || !el.checkVisibility() || el.closest(".pour-lecteur-d-ecran")) continue;
      const style = getComputedStyle(el);
      // Dans un SVG, c'est le remplissage qui peint le texte.
      const couleur = el instanceof SVGElement ? style.fill : style.color;
      const fond = fondDe(el);
      const texte = melanger(lire(couleur), fond);
      const [clair, sombre] = [luminance(texte), luminance(fond)].sort((a, b) => b - a);
      resultats.push({ texte: n.textContent.trim().slice(0, 40), taille: parseFloat(style.fontSize), contraste: (clair + 0.05) / (sombre + 0.05) });
    }
    return resultats;
  });
}

for (const theme of ["light", "dark"]) {
  test(`[T34] EX-37 : textes de la synthèse d'au moins 12 px et contrastés à 4,5:1, graphique et infobulle compris — thème ${theme === "light" ? "clair" : "sombre"}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.setViewportSize({ width: 1366, height: 768 });
    await chargerExemple(page);
    await page.locator('#graphique .zone-survol[data-mois="2026-07"]').hover();
    await expect(page.locator("#graphique .infobulle")).toBeVisible();
    for (const mesure of ["ca", "volume"]) {
      await page.locator(`#tableau-mesures button[data-mesure="${mesure}"]`).click();
      const textes = await auditerTextes(page);
      expect(textes.length).toBeGreaterThan(40);
      expect(textes.filter((t) => t.taille < 12), "textes de moins de 12 px").toEqual([]);
      expect(textes.filter((t) => t.contraste < 4.5).map((t) => `${t.texte} (${t.contraste.toFixed(2)})`), "contraste < 4,5:1").toEqual([]);
    }
  });
}
