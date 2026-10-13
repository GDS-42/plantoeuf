// Tranche P1 — présentation. Tests de bout en bout sur dist/index.html ouvert en file://.
// P2 (T34) : les étapes de navigation passent par les pages et les tiroirs (aller, ouvrir, modifier) ; les tests de
// mise en page propres à P1 (deux volets, panneaux toujours ouverts, raccourcis) sont remplacés par leurs
// équivalents P2 ou retirés quand ils n'ont plus d'objet (navigation et tiroirs : test/p2-socle.e2e.js).
const { test, expect } = require("@playwright/test");
const { aller, modifier, ajouterEspace } = require("./outils.js");

// Relève les erreurs de la page : exceptions non rattrapées et messages d'erreur de la console.
function releverErreurs(page) {
  const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") erreurs.push(message.text());
  });
  return erreurs;
}

test("[T11] le rendu est découpé en modules, et l'outil s'utilise sans aucune erreur", async ({ page }) => {
  const erreurs = releverErreurs(page);
  await page.goto("index.html");

  const modules = await page.evaluate(() => ["UiCommun", "UiSaisie", "UiTableau", "UiSauvegarde"].map((nom) => typeof globalThis[nom]));
  expect(modules).toEqual(["object", "object", "object", "object"]);

  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(10);
  await modifier(page, "plantations", "Courgette");
  await page.locator("#plantation-surface").fill("20");
  await page.locator("#plantation-ajouter").click();
  await expect(page.locator("#liste-plantations li", { hasText: "Courgette" })).toContainText("20 m²");
  await aller(page, "sauvegarde");
  await Promise.all([page.waitForEvent("download"), page.locator("#exporter").click()]);
  await page.locator("#effacer-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(0);

  expect(erreurs).toEqual([]);
});

// ---- T12 — EX-11, EX-16, remplacés en P2 par EX-32 et EX-37 : la synthèse de la saison reste sous les yeux
// pendant la saisie, pas de défilement horizontal.

async function chargerExemple(page) {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(10);
}

for (const [largeur, hauteur] of [[1280, 720], [1366, 768], [1920, 1080]]) {
  test(`[T12] P1-S1 à ${largeur} × ${hauteur} : la synthèse en tête reste visible pendant la saisie et suit la modification`, async ({ page }) => {
    await page.setViewportSize({ width: largeur, height: hauteur });
    await chargerExemple(page);

    for (const nom of ["espaces", "cultures", "plantations", "sauvegarde"]) {
      await aller(page, nom);
      await page.locator("#contenu").evaluate((el) => { el.scrollTop = el.scrollHeight; });
      await expect(page.locator("#synthese")).toBeInViewport();
    }

    const courgette = page.locator("#tableau tbody tr[data-mesure=\"volume\"]", { hasText: "Courgette" });
    const cultureId = await courgette.getAttribute("data-culture");
    const total = page.locator(`#tableau tr[data-culture="${cultureId}"][data-mesure="ca"] td[data-mois="total"] .mediane`);
    const avant = Number(await total.getAttribute("data-valeur"));
    const enTete = page.locator("#synthese .mediane");
    const enTeteAvant = Number(await enTete.getAttribute("data-valeur"));

    await modifier(page, "plantations", "Courgette");
    await page.locator("#plantation-surface").fill("15");
    await page.locator("#plantation-ajouter").click();

    await expect.poll(async () => Number(await total.getAttribute("data-valeur"))).toBeLessThan(avant);
    await expect.poll(async () => Number(await enTete.getAttribute("data-valeur"))).toBeLessThan(enTeteAvant);
    await expect(page.locator("#synthese")).toBeInViewport();
    await aller(page, "synthese");
    await page.locator("#tableau-defilement").scrollIntoViewIfNeeded();
    await expect(total).toBeInViewport();
  });
}

test("[T12] EX-16, EX-37 : aucun défilement horizontal de la page de 360 à 1920 px de large, ferme d'exemple chargée", async ({ page }) => {
  for (const largeur of [360, 390, 1000, 1280, 1366, 1600, 1920]) {
    await page.setViewportSize({ width: largeur, height: 800 });
    await chargerExemple(page);
    for (const mesure of ["ca", "volume"]) {
      await page.locator(`#tableau-mesures button[data-mesure="${mesure}"]`).click();
      const debordement = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(debordement, `${largeur} px, ${mesure}`).toBeLessThanOrEqual(0);
    }
    await page.evaluate(() => localStorage.clear());
  }
});

// ---- T13 — EX-12, EX-15, remplacés en P2 par EX-30 et EX-31 : chaque liste est titrée et compte ses éléments.

test("[T13] chaque liste a son titre et le nombre de ses éléments actifs", async ({ page }) => {
  await chargerExemple(page);
  const attendus = { espaces: "5", cultures: "7", varietes: "7", plantations: "10" };
  const pages = { espaces: "espaces", cultures: "cultures", varietes: "cultures", plantations: "plantations" };
  for (const [objet, nombre] of Object.entries(attendus)) {
    await aller(page, pages[objet]);
    const panneau = page.locator(`#section-${objet}`);
    await expect(panneau).toHaveClass(/\bpanneau\b/);
    await expect(panneau.locator("h2")).toBeVisible();
    await expect(panneau.locator(".compte")).toHaveText(nombre);
  }
  await aller(page, "sauvegarde");
  await expect(page.locator("#section-sauvegarde")).toHaveClass(/\bpanneau\b/);
  await expect(page.locator("#section-sauvegarde h2")).toBeVisible();
});

test("[T13] le nombre d'éléments d'une liste suit les ajouts et les suppressions", async ({ page }) => {
  await page.goto("index.html");
  const compte = page.locator("#section-espaces .compte");
  await expect(compte).toHaveText("0");
  await ajouterEspace(page, { nom: "planche 1", surface: 30 });
  await expect(compte).toHaveText("1");
  await page.locator('#liste-espaces [data-action="supprimer"]').click();
  await expect(compte).toHaveText("0");
});

const { saisirS2 } = require("./outils.js");

// ---- T14 — EX-13, EX-14 : en-têtes figés, synthèse de la saison.

test("[T14] P1-S2 : les mois et les cultures restent visibles pendant le défilement du tableau", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await chargerExemple(page);
  const boite = page.locator("#tableau-defilement");
  await boite.scrollIntoViewIfNeeded();
  const debord = await boite.evaluate((el) => ({ x: el.scrollWidth - el.clientWidth, y: el.scrollHeight - el.clientHeight }));
  expect(debord.x).toBeGreaterThan(0);
  expect(debord.y).toBeGreaterThan(0);

  await boite.evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
    el.scrollTop = el.scrollHeight;
  });
  await expect(page.locator("#tableau thead th[data-mois]").last()).toBeInViewport();
  await expect(page.locator('#tableau tbody tr[data-mesure="ca"] th', { hasText: "Tomate" })).toBeInViewport();
  const derniere = page.locator("#tableau tbody tr[data-mesure]:not([hidden])").last().locator("th");
  await expect(derniere).toBeInViewport();
});

test("[T14] P1-S3 : la synthèse donne le chiffre d'affaires estimé de la saison en fourchette, et suit les modifications", async ({ page }) => {
  await page.goto("index.html");
  const synthese = page.locator("#synthese");
  await expect(synthese).toBeVisible();
  await saisirS2(page);

  await expect(synthese).toContainText(/estim/i);
  await expect(synthese.locator(".mediane")).toHaveText("675 €");
  await expect(synthese.locator(".basse")).toHaveText("540 €");
  await expect(synthese.locator(".haute")).toHaveText("810 €");

  await modifier(page, "plantations", "Black Beauty");
  await page.locator("#plantation-surface").fill("50");
  await page.locator("#plantation-ajouter").click();
  await expect(synthese.locator(".mediane")).toHaveText("338 €");
  await expect(synthese.locator(".basse")).toHaveText("270 €");
  await expect(synthese.locator(".haute")).toHaveText("405 €");
});

test("[T14] la synthèse reste en tête quel que soit le défilement", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await chargerExemple(page);
  await page.locator("#tableau-defilement").evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await page.locator("#contenu").evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await expect(page.locator("#synthese")).toBeInViewport();
});

test("[T14] une case vide du tableau s'affiche discrètement", async ({ page }) => {
  await chargerExemple(page);
  const vide = page.locator("#tableau td.nul").first();
  await expect(vide.locator(".mediane")).toHaveText("—");
  await expect(vide.locator(".bornes")).toBeHidden();
});

// ---- T15 — EX-16 : tailles de texte, contrastes, focus clavier visible.

// Pour chaque texte affiché : sa taille et son contraste avec le fond réellement peint dessous.
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
    const marcheur = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = marcheur.nextNode(); n; n = marcheur.nextNode()) {
      const el = n.parentElement;
      if (!n.textContent.trim() || el.closest("script, style, select") || !el.checkVisibility()) continue;
      const style = getComputedStyle(el);
      const fond = fondDe(el);
      const texte = melanger(lire(style.color), fond);
      const [clair, sombre] = [luminance(texte), luminance(fond)].sort((a, b) => b - a);
      resultats.push({ texte: n.textContent.trim().slice(0, 50), taille: parseFloat(style.fontSize), contraste: (clair + 0.05) / (sombre + 0.05) });
    }
    return resultats;
  });
}

function verifierLisibilite(textes) {
  expect(textes.length).toBeGreaterThan(10);
  const tropPetits = textes.filter((t) => t.taille < 12);
  expect(tropPetits, "textes de moins de 12 px").toEqual([]);
  const peuContrastes = textes.filter((t) => t.contraste < 4.5).map((t) => `${t.texte} (${t.contraste.toFixed(2)})`);
  expect(peuContrastes, "textes de contraste inférieur à 4,5:1").toEqual([]);
}

test("[T15] EX-16 : texte courant d'au moins 14 px, aucun texte sous 12 px ni sous un contraste de 4,5:1 — ferme vide", async ({ page }) => {
  await page.goto("index.html");
  expect(parseFloat(await page.evaluate(() => getComputedStyle(document.body).fontSize))).toBeGreaterThanOrEqual(14);
  verifierLisibilite(await auditerTextes(page));
});

test("[T15] EX-16 : mêmes règles avec la ferme d'exemple, une modification en cours, une sur-occupation et une erreur", async ({ page }) => {
  await chargerExemple(page);
  for (const selecteur of ["ul.liste li .ligne-texte", "#tableau td .mediane", "label"]) {
    const taille = await page.locator(selecteur).first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(taille, selecteur).toBeGreaterThanOrEqual(14);
  }
  // P2 : chaque page se lit à part ; la synthèse d'abord.
  verifierLisibilite(await auditerTextes(page));
  await modifier(page, "plantations", "Courgette");
  await page.locator("#plantation-surface").fill("45");
  await page.locator("#plantation-ajouter").click();
  await aller(page, "espaces");
  await expect(page.locator(".sur-occupation")).toHaveCount(1);
  verifierLisibilite(await auditerTextes(page));
  await modifier(page, "cultures", "Tomate");
  await page.locator("#culture-prix").fill("4 / 3 / 5");
  await page.locator("#culture-ajouter").click();
  await expect(page.locator("#culture-erreur")).toBeVisible();
  verifierLisibilite(await auditerTextes(page));
});

test("[T15] EX-16 : l'élément qui a le focus clavier porte un contour visible", async ({ page }) => {
  await chargerExemple(page);
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press("Tab");
    const contour = await page.evaluate(() => {
      const el = document.activeElement;
      const s = getComputedStyle(el);
      return { element: el.tagName + (el.id ? "#" + el.id : ""), style: s.outlineStyle, largeur: parseFloat(s.outlineWidth) };
    });
    // P2 : une page à la fois, moins d'éléments à parcourir ; au bout, le focus repasse par le document lui-même.
    if (contour.element === "BODY") continue;
    expect(contour.style !== "none" && contour.largeur >= 2, JSON.stringify(contour)).toBe(true);
  }
});

// ---- T16 — vérification de bout en bout : sur un grand écran, le tableau occupe toute sa boîte.

test("[T16] à 1920 × 1080, le tableau occupe toute la largeur de sa boîte", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await chargerExemple(page);
  const { boite, tableau } = await page.evaluate(() => ({
    boite: document.getElementById("tableau-defilement").clientWidth,
    tableau: document.getElementById("tableau").getBoundingClientRect().width,
  }));
  expect(tableau).toBeGreaterThanOrEqual(boite - 1);
});
