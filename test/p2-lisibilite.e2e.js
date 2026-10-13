// Tranche P2 — vérification de la tranche (T37), EX-37 sur toutes les pages : aucune page ne défile
// en largeur de 360 à 1920 px ; en thème sombre comme en thème clair, aucun texte sous 12 px ni sous un
// contraste de 4,5:1 ; le focus clavier reste visible dans un tiroir.
const { test, expect } = require("@playwright/test");
const { aller, modifier } = require("./outils.js");

const PAGES = ["synthese", "espaces", "cultures", "plantations", "ventes", "poules", "sauvegarde"];

async function chargerExemple(page) {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(10);
}

// Pour chaque texte affiché : sa taille et son contraste avec le fond réellement peint dessous
// (même audit que les tests de lisibilité de P1, T15).
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

function verifierLisibilite(textes, contexte) {
  expect(textes.length, contexte).toBeGreaterThan(10);
  expect(textes.filter((t) => t.taille < 12).map((t) => t.texte), `${contexte} : textes de moins de 12 px`).toEqual([]);
  const peuContrastes = textes.filter((t) => t.contraste < 4.5).map((t) => `${t.texte} (${t.contraste.toFixed(2)})`);
  expect(peuContrastes, `${contexte} : textes de contraste inférieur à 4,5:1`).toEqual([]);
}

test("[T37] EX-37 : aucune page ne défile en largeur, de 360 à 1920 px, ferme d'exemple chargée", async ({ page }) => {
  await chargerExemple(page);
  for (const largeur of [360, 390, 768, 1024, 1280, 1366, 1920]) {
    await page.setViewportSize({ width: largeur, height: 800 });
    for (const nom of PAGES) {
      await aller(page, nom);
      const debordement = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(debordement, `${nom} à ${largeur} px`).toBeLessThanOrEqual(0);
    }
  }
});

for (const theme of ["light", "dark"]) {
  test(`[T37] EX-37 : thème ${theme === "dark" ? "sombre" : "clair"}, chaque page lisible (tailles et contrastes), ferme d'exemple chargée`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.setViewportSize({ width: 1366, height: 768 });
    await chargerExemple(page);
    for (const nom of PAGES) {
      await aller(page, nom);
      verifierLisibilite(await auditerTextes(page), `${nom} (${theme})`);
    }
    for (const onglet of ["offre", "points"]) {
      await aller(page, "synthese");
      await page.locator(`#onglet-${onglet}`).click();
      verifierLisibilite(await auditerTextes(page), `onglet ${onglet} (${theme})`);
    }
    await modifier(page, "plantations", "Courgette");
    verifierLisibilite(await auditerTextes(page), `tiroir (${theme})`);
  });
}

test("[T37] EX-37 : dans un tiroir ouvert, chaque élément atteint au clavier porte un contour visible", async ({ page }) => {
  await chargerExemple(page);
  await modifier(page, "cultures", "Tomate");
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Tab");
    const contour = await page.evaluate(() => {
      const el = document.activeElement;
      const s = getComputedStyle(el);
      return { element: el.tagName + (el.id ? "#" + el.id : ""), dansTiroir: Boolean(el.closest("#tiroir-cultures")), style: s.outlineStyle, largeur: parseFloat(s.outlineWidth) };
    });
    expect(contour.dansTiroir, JSON.stringify(contour)).toBe(true);
    expect(contour.style !== "none" && contour.largeur >= 2, JSON.stringify(contour)).toBe(true);
  }
});
