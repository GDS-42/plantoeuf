// Tranche P2 — socle (T33) : navigation par pages, tiroirs de saisie, synthèse en tête, accueil guidé.
const { test, expect } = require("@playwright/test");
const { aller, ouvrir, modifier, ajouterEspace } = require("./outils.js");

const PAGES = ["synthese", "espaces", "cultures", "plantations", "ventes", "poules", "sauvegarde"];

async function chargerExemple(page) {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(51);
}

// Relève les erreurs de la page : exceptions non rattrapées et messages d'erreur de la console.
function releverErreurs(page) {
  const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") erreurs.push(message.text());
  });
  return erreurs;
}

// ---- EX-30 : navigation

test("[T33] EX-30 : la navigation mène à chaque page, une seule visible à la fois, avec le nombre d'éléments de chacune", async ({ page }) => {
  const erreurs = releverErreurs(page);
  await chargerExemple(page);
  await expect(page.locator("#page-synthese")).toBeVisible();
  for (const nom of PAGES) {
    await aller(page, nom);
    for (const autre of PAGES.filter((p) => p !== nom)) await expect(page.locator(`#page-${autre}`)).toBeHidden();
    await expect(page.locator(`#navigation a[data-page="${nom}"]`)).toHaveAttribute("aria-current", "page");
    await expect(page.locator(`#page-${nom} h1`)).toBeVisible();
  }
  const comptes = { espaces: "9", cultures: "11", plantations: "51", pointsVente: "4", lots: "2" };
  for (const [objet, nombre] of Object.entries(comptes)) {
    await expect(page.locator(`#navigation .compte-nav[data-objet="${objet}"]`)).toHaveText(nombre);
  }
  expect(erreurs).toEqual([]);
});

test("[T33] EX-30 : la page ouverte se retrouve au rechargement", async ({ page }) => {
  await chargerExemple(page);
  await aller(page, "plantations");
  await page.reload();
  await expect(page.locator("#page-plantations")).toBeVisible();
  await expect(page.locator("#page-synthese")).toBeHidden();
});

// ---- EX-31 : tiroirs

test("[T33] EX-31, P2-S1 : « Ajouter un espace » ouvre le tiroir titré ; l'enregistrement le referme et l'espace apparaît", async ({ page }) => {
  await page.goto("index.html");
  await ouvrir(page, "espaces");
  await expect(page.locator("#tiroir-espaces h2")).toHaveText("Ajouter un espace");
  await expect(page.locator("#espace-nom")).toBeFocused();
  await page.locator("#espace-nom").fill("planche 1");
  await page.locator("#espace-surface").fill("30");
  await page.locator("#espace-ajouter").click();
  await expect(page.locator("#tiroir-espaces")).toBeHidden();
  await expect(page.locator("#liste-espaces li")).toHaveCount(1);
  await expect(page.locator("#liste-espaces")).toContainText("planche 1");
  await expect(page.locator('#navigation .compte-nav[data-objet="espaces"]')).toHaveText("1");
  await expect(page.locator("#annonce")).toBeVisible();
});

test("[T33] EX-31, P2-S2 : « Modifier » ouvre le tiroir de modification, signale la ligne, et l'enregistrement recalcule la synthèse", async ({ page }) => {
  await chargerExemple(page);
  const avant = Number(await page.locator("#synthese .mediane").getAttribute("data-valeur"));
  await modifier(page, "plantations", "Ail péi");
  await expect(page.locator("#tiroir-plantations h2")).toHaveText("Modifier la plantation");
  const ligne = page.locator("#liste-plantations li", { hasText: "Ail péi" });
  await expect(ligne).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#section-plantations")).toHaveAttribute("data-mode", "modification");

  await page.locator("#plantation-surface").fill("15");
  await page.locator("#plantation-ajouter").click();
  await expect(page.locator("#tiroir-plantations")).toBeHidden();
  await expect(ligne).toContainText("15 m²");
  await expect(page.locator('#contenu li[aria-current="true"]')).toHaveCount(0);
  await expect.poll(async () => Number(await page.locator("#synthese .mediane").getAttribute("data-valeur"))).toBeLessThan(avant);
});

test("[T33] EX-31 : Échap, « Annuler » et la croix referment le tiroir sans rien enregistrer", async ({ page }) => {
  await chargerExemple(page);
  for (const fermer of [
    () => page.keyboard.press("Escape"),
    () => page.locator("#culture-annuler").click(),
    () => page.locator('#tiroir-cultures [data-action="fermer"]').click(),
  ]) {
    await modifier(page, "cultures", "Tomate");
    await page.locator("#culture-nom").fill("Tomate cerise");
    await fermer();
    await expect(page.locator("#tiroir-cultures")).toBeHidden();
    await expect(page.locator("#section-cultures")).not.toHaveAttribute("data-mode", "modification");
    await expect(page.locator('#contenu li[aria-current="true"]')).toHaveCount(0);
    await expect(page.locator("#liste-cultures")).not.toContainText("Tomate cerise");
  }
});

test("[T33] EX-31 : une erreur de saisie laisse le tiroir ouvert, avec son message", async ({ page }) => {
  await chargerExemple(page);
  await modifier(page, "cultures", "Tomate");
  await page.locator("#culture-prix").fill("4 / 3 / 5");
  await page.locator("#culture-ajouter").click();
  await expect(page.locator("#culture-erreur")).toBeVisible();
  await expect(page.locator("#tiroir-cultures")).toBeVisible();
});

// ---- EX-32 : synthèse en tête

for (const [largeur, hauteur] of [[360, 740], [390, 844], [900, 700], [1280, 720], [1920, 1080]]) {
  test(`[T33] EX-32 à ${largeur} px : chiffre d'affaires et marge en fourchette, entièrement visibles en tête, même après défilement`, async ({ page }) => {
    await page.setViewportSize({ width: largeur, height: hauteur });
    await chargerExemple(page);
    await aller(page, "plantations");
    // Défile jusqu'au bas de la page, quel que soit l'élément qui défile (page ou zone de contenu).
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
      const contenu = document.getElementById("contenu");
      contenu.scrollTop = contenu.scrollHeight;
    });
    for (const id of ["#synthese", "#synthese-marge"]) {
      const indicateur = page.locator(id);
      await expect(indicateur).toContainText(/estim/i);
      for (const niveau of ["basse", "mediane", "haute"]) {
        const valeur = indicateur.locator(`.${niveau}`);
        await expect(valeur).toHaveText(/\d.*€/);
        const boite = await valeur.boundingBox();
        expect(boite.x, `${id} .${niveau}`).toBeGreaterThanOrEqual(0);
        expect(boite.x + boite.width, `${id} .${niveau}`).toBeLessThanOrEqual(largeur);
        expect(boite.y, `${id} .${niveau}`).toBeGreaterThanOrEqual(0);
        expect(boite.y + boite.height, `${id} .${niveau}`).toBeLessThanOrEqual(hauteur);
      }
    }
    // Aucun texte de la barre ne déborde ni ne se chevauche.
    const chevauchement = await page.evaluate(() => {
      const boites = [...document.querySelectorAll(".barre .mediane, .barre .indicateur-bornes")].map((el) => el.getBoundingClientRect());
      return boites.some((a, i) => boites.some((b, j) => i < j && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1));
    });
    expect(chevauchement).toBe(false);
  });
}

// ---- EX-36 : accueil guidé

test("[T33] EX-36 : une ferme vide ouvre sur les trois étapes et la ferme d'exemple ; une étape mène au tiroir de sa page", async ({ page }) => {
  await page.goto("index.html");
  await expect(page.locator("#accueil")).toBeVisible();
  await expect(page.locator("#accueil .etape")).toHaveCount(3);
  await expect(page.locator("#proposition-exemple")).toBeVisible();

  await page.locator('#accueil [data-ouvrir="espaces"]').click();
  await expect(page.locator("#page-espaces")).toBeVisible();
  await expect(page.locator("#tiroir-espaces")).toBeVisible();
  await page.keyboard.press("Escape");

  await aller(page, "synthese");
  await ajouterEspace(page, { nom: "planche 1", surface: 30 });
  await aller(page, "synthese");
  await expect(page.locator('#accueil .etape[data-etape="espaces"]')).toHaveAttribute("data-fait", "true");
  await expect(page.locator("#proposition-exemple")).toBeHidden();
});

test("[T33] EX-36 : une liste vide le dit et propose de l'ajouter, dans l'état vide lui-même ; la liste remplie garde son bouton en tête", async ({ page }) => {
  await page.goto("index.html");
  const listes = [["espaces", "espaces"], ["cultures", "cultures"], ["cultures", "varietes"], ["plantations", "plantations"],
    ["ventes", "pointsVente"], ["ventes", "seances"], ["ventes", "debouches"], ["poules", "lots"]];
  for (const [nom, objet] of listes) {
    await aller(page, nom);
    const vide = page.locator(`#${objet}-vide`);
    await expect(vide).toBeVisible();
    await expect(vide.locator("p")).not.toBeEmpty();
    await expect(vide.locator(`[data-ouvrir="${objet}"]`)).toBeVisible();
    await expect(page.locator(`#section-${objet} .carte-entete [data-ouvrir="${objet}"]`)).toBeHidden();
  }
  await aller(page, "espaces");
  await page.locator('#espaces-vide [data-ouvrir="espaces"]').click();
  await expect(page.locator("#tiroir-espaces")).toBeVisible();
  await page.keyboard.press("Escape");
  await ajouterEspace(page, { nom: "planche 1", surface: 30 });
  await expect(page.locator("#espaces-vide")).toBeHidden();
  await expect(page.locator('#section-espaces .carte-entete [data-ouvrir="espaces"]')).toBeVisible();
});
