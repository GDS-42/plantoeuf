// Tranche P2 — ferme (T36) : lignes des listes, calendrier de culture (EX-35), poules, sauvegarde,
// états vides et tiroir des plantations (EX-36).
const { test, expect } = require("@playwright/test");
const { aller, ouvrir, modifier, ajouterEspace, ajouterCulture, ajouterVariete } = require("./outils.js");

// La ferme d'exemple se charge dans l'année du jour : l'horloge fixée donne la saison 2026,
// et un « aujourd'hui » au milieu de la saison.
async function exemple(page, date = "2026-05-20T10:00:00+04:00") {
  await page.clock.setFixedTime(new Date(date));
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(10);
}

function ligne(page, objet, texte) {
  return page.locator(`#liste-${objet} li`, { hasText: texte });
}

// La valeur d'un fait d'une ligne (« libellé : valeur »), désigné par sa clé.
function fait(li, cle) {
  return li.locator(`[data-fait="${cle}"] dd`);
}

async function stockees(page, objet) {
  return page.evaluate((o) => JSON.parse(localStorage.getItem("plantoeuf"))[o].filter((e) => !e.supprimeLe), objet);
}

// Identifiant d'un enregistrement : celui de la ligne de sa liste qui contient tous les `textes`.
async function idDe(page, objet, ...textes) {
  let li = page.locator(`#liste-${objet} li`);
  for (const texte of textes) li = li.filter({ hasText: texte });
  return li.getAttribute("data-id");
}

// Abscisse (px) du début d'un jour « AAAA-MM-JJ » sur l'axe des mois du calendrier.
async function abscisse(page, date, racine = "#calendrier") {
  const boite = await page.locator(`${racine} .cal-mois[data-mois="${date.slice(0, 7)}"]`).boundingBox();
  const jours = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 0)).getUTCDate();
  return boite.x + (boite.width * (Number(date.slice(8, 10)) - 1)) / jours;
}

function proche(valeur, attendu, message, tolerance = 3) {
  expect(Math.abs(valeur - attendu), `${message} : ${valeur} au lieu de ${attendu}`).toBeLessThanOrEqual(tolerance);
}

function seChevauchent(a, b) {
  return a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 && a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;
}

// ---- Lignes des listes

test("[T36] Lignes : un espace montre son type, sa surface et ce qui y pousse", async ({ page }) => {
  await exemple(page);
  await aller(page, "espaces");
  const tunnel = ligne(page, "espaces", "Tunnel");
  await expect(tunnel.locator(".ligne-titre")).toHaveText("Tunnel");
  await expect(tunnel.locator(".ligne-entete .puce")).toHaveText("abri");
  await expect(fait(tunnel, "surface")).toHaveText("60 m²");
  await expect(fait(tunnel, "plantations")).toHaveText("Tomate × 2");
  const planche3 = ligne(page, "espaces", "Planche 3");
  await expect(planche3.locator(".ligne-entete .puce")).toHaveText("plein champ");
  await expect(fait(planche3, "plantations")).toHaveText("Brède chou de Chine × 2, Carotte");
  await expect(fait(ligne(page, "espaces", "Planche 1"), "plantations")).toHaveText("Courgette");
  await expect(page.locator("#liste-espaces .sur-occupation")).toHaveCount(0);
  // L'occupation des espaces se voit dans le calendrier de culture, à un clic.
  await page.locator("#espaces-voir-calendrier").click();
  await expect(page.locator("#page-plantations")).toBeVisible();
  await expect(page.locator("#carte-calendrier")).toBeVisible();
});

test("[T36] Lignes : une culture montre sa famille, son unité de vente, son rendement, son prix, sa récolte et ses pertes", async ({ page }) => {
  await exemple(page);
  await aller(page, "cultures");
  const tomate = ligne(page, "cultures", "Tomate");
  await expect(tomate.locator(".ligne-titre")).toHaveText("Tomate");
  await expect(tomate.locator(".ligne-entete .puce")).toHaveText("Solanacées");
  await expect(tomate.locator(".ligne-sous-titre")).toHaveText("vendue au kg");
  await expect(fait(tomate, "rendement")).toHaveText("6 kg/m² 4 à 8");
  await expect(fait(tomate, "prix")).toHaveText("3 €/kg 2,5 à 3,5");
  await expect(fait(tomate, "recolte")).toHaveText("après 75 jours, pendant 10 semaines");
  await expect(fait(tomate, "pertes")).toHaveText("15 %");
  const laitue = ligne(page, "cultures", "Laitue batavia");
  await expect(laitue.locator(".ligne-sous-titre")).toHaveText("vendue à la pièce");
  await expect(fait(laitue, "rendement")).toHaveText("10 pièces/m² 8 à 12");
  await expect(fait(laitue, "prix")).toHaveText("1 €/pièce 0,8 à 1,2");
  // La médiane en évidence, la fourchette à côté.
  await expect(fait(tomate, "prix").locator(".f-mediane")).toHaveText("3 €/kg");
  await expect(fait(tomate, "prix").locator(".f-bornes")).toHaveText("2,5 à 3,5");
});

test("[T36] Lignes : une variété ne montre que ce qui diffère de sa culture, sinon le dit", async ({ page }) => {
  await exemple(page);
  await aller(page, "cultures");
  const heatmaster = ligne(page, "varietes", "Heatmaster");
  await expect(heatmaster.locator(".ligne-titre")).toHaveText("Heatmaster");
  await expect(heatmaster.locator(".ligne-entete .puce")).toHaveText("Tomate");
  await expect(heatmaster.locator("[data-fait]")).toHaveCount(1);
  await expect(fait(heatmaster, "recolte")).toHaveText("après 70 jours");
  const zoizo = ligne(page, "varietes", "Zoizo");
  await expect(zoizo.locator("[data-fait]")).toHaveCount(2);
  await expect(fait(zoizo, "rendement")).toHaveText("0,6 kg/m² 0,3 à 1");
  await expect(fait(zoizo, "prix")).toHaveText("15 €/kg 12 à 18");
  const blonde = ligne(page, "varietes", "Blonde de Paris");
  await expect(blonde.locator("[data-fait]")).toHaveCount(0);
  await expect(blonde.locator(".ligne-note")).toHaveText("mêmes valeurs que la culture");
});

test("[T36] Lignes : une plantation montre sa culture, sa variété, son espace, sa surface, sa mise en place et sa récolte", async ({ page }) => {
  await exemple(page);
  await aller(page, "plantations");
  const courgette = ligne(page, "plantations", "Black Beauty");
  await expect(courgette.locator(".ligne-titre")).toHaveText("Courgette Black Beauty");
  await expect(courgette.locator(".ligne-entete .puce")).toHaveText("Planche 1");
  await expect(fait(courgette, "surface")).toHaveText("30 m²");
  await expect(fait(courgette, "miseEnPlace")).toHaveText("01/05/2026");
  await expect(fait(courgette, "recolte")).toHaveText("du 20/06/2026 au 14/08/2026");
  // 30 m² × 2 / 3 / 4 kg × 90 % : une fourchette, jamais un chiffre seul.
  await expect(fait(courgette, "production")).toHaveText("81 kg 54 à 108");
});

test("[T36] Lignes : un lot de poules montre son effectif, ses dates, sa ponte, ses œufs et son aliment par semaine en fourchette", async ({ page }) => {
  await exemple(page);
  await aller(page, "poules");
  const lot = ligne(page, "lots", "Lot de printemps");
  await expect(lot.locator(".ligne-titre")).toHaveText("Lot de printemps");
  await expect(lot.locator(".ligne-entete .puce")).toHaveText("100 poules");
  await expect(lot.locator(".ligne-sous-titre")).toHaveText("arrivée le 02/03/2026 · réforme le 25/10/2026");
  await expect(fait(lot, "ponte")).toHaveText("du 06/04/2026 au 25/10/2026");
  await expect(fait(lot, "ponteParPoule")).toHaveText("0,72 œuf 0,6 à 0,8");
  // 100 poules × 0,6 / 0,72 / 0,8 × 92 % × 7 jours ; 100 × 115 / 125 / 135 g × 7 jours × 0,70 / 0,80 / 0,95 €
  // (la haute, 89,774 999… en virgule flottante, s'arrondit à 89,77).
  await expect(fait(lot, "oeufs")).toHaveText("464 386 à 515");
  await expect(fait(lot, "aliment")).toHaveText("70 € 56,35 à 89,77");
});

// ---- Calendrier de culture (EX-35)

test("[T36] EX-35 : sans plantation, pas de calendrier ; avec la ferme d'exemple, un calendrier titré et légendé", async ({ page }) => {
  await page.goto("index.html");
  await aller(page, "plantations");
  await expect(page.locator("#carte-calendrier")).toBeHidden();
  await aller(page, "synthese");
  await page.locator("#charger-exemple").click();
  await aller(page, "plantations");
  const carte = page.locator("#carte-calendrier");
  await expect(carte).toBeVisible();
  await expect(carte.locator("h2")).toHaveText(/calendrier de culture/i);
  for (const legende of ["Croissance", "Récolte", "Sur-occupation"]) await expect(carte.locator(".cal-legende")).toContainText(legende);
  await expect(page.locator("#calendrier")).toHaveAttribute("role", "group");
});

test("[T36] EX-35 : une ligne par espace, nom et surface à gauche, et une barre par plantation dans la ligne de son espace", async ({ page }) => {
  await exemple(page);
  await aller(page, "plantations");
  const lignes = page.locator("#calendrier .cal-ligne[data-espace]");
  await expect(lignes).toHaveCount(5);
  await expect(lignes.locator(".cal-espace-nom")).toHaveText(["Planche 1", "Planche 2", "Planche 3", "Planche 4", "Tunnel"]);
  await expect(lignes.filter({ hasText: "Tunnel" }).locator(".cal-espace-detail")).toContainText("60 m²");
  await expect(page.locator("#calendrier [data-plantation]")).toHaveCount(10);
  for (const plantation of await stockees(page, "plantations")) {
    await expect(page.locator(`#calendrier .cal-ligne[data-espace="${plantation.espaceId}"] [data-plantation="${plantation.id}"]`)).toHaveCount(1);
  }
  // L'axe des mois va de la première mise en place (15 mars) à la dernière fin de récolte (2 octobre).
  await expect(page.locator("#calendrier .cal-mois")).toHaveText(["mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct."]);
  // Le nom de la culture s'inscrit dans les barres assez larges.
  const tomate = page.locator(`#calendrier [data-plantation="${await idDe(page, "plantations", "Heatmaster", "15/04/2026")}"]`);
  await expect(tomate.locator(".cal-etiquette:visible")).toContainText("Tomate");
});

test("[T36] EX-35 : chaque barre va de la mise en place à la fin de la récolte, la récolte distinguée, aux bonnes dates", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await exemple(page);
  await aller(page, "plantations");
  const id = await idDe(page, "plantations", "Black Beauty");
  const barre = page.locator(`#calendrier [data-plantation="${id}"]`);
  const croissance = await barre.locator(".cal-croissance").boundingBox();
  const recolte = await barre.locator(".cal-recolte").boundingBox();
  // Courgette : en terre le 01/05, récolte du 20/06 au 14/08 inclus.
  proche(croissance.x, await abscisse(page, "2026-05-01"), "début de la barre");
  proche(recolte.x, await abscisse(page, "2026-06-20"), "début de la récolte");
  proche(recolte.x + recolte.width, await abscisse(page, "2026-08-15"), "fin de la récolte");
  const fond = (selecteur) => barre.locator(selecteur).evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(await fond(".cal-croissance")).not.toBe(await fond(".cal-recolte"));
  // La légende reprend les deux teintes.
  expect(await page.locator(".cal-legende .cal-pastille-croissance").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(await fond(".cal-croissance"));
  expect(await page.locator(".cal-legende .cal-pastille-recolte").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(await fond(".cal-recolte"));
});

test("[T36] EX-35 : des plantations qui se chevauchent sur un même espace occupent des sous-lignes et ne se recouvrent pas", async ({ page }) => {
  await exemple(page);
  await aller(page, "plantations");
  const espaces = await stockees(page, "espaces");
  const id = (nom) => espaces.find((e) => e.nom === nom).id;
  await expect(page.locator(`#calendrier .cal-ligne[data-espace="${id("Planche 1")}"]`)).toHaveAttribute("data-sous-lignes", "1");
  await expect(page.locator(`#calendrier .cal-ligne[data-espace="${id("Planche 3")}"]`)).toHaveAttribute("data-sous-lignes", "2");
  await expect(page.locator(`#calendrier .cal-ligne[data-espace="${id("Tunnel")}"]`)).toHaveAttribute("data-sous-lignes", "2");
  for (const espace of espaces) {
    const boites = [];
    for (const barre of await page.locator(`#calendrier .cal-ligne[data-espace="${espace.id}"] [data-plantation]`).all()) boites.push(await barre.boundingBox());
    for (let i = 0; i < boites.length; i++) {
      for (let j = i + 1; j < boites.length; j++) expect(seChevauchent(boites[i], boites[j]), `${espace.nom} : barres ${i} et ${j}`).toBe(false);
    }
  }
});

test("[T36] EX-35 : agrandir une plantation marque la sur-occupation sur la ligne de son espace, aux dates du chevauchement", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await exemple(page);
  await aller(page, "plantations");
  await expect(page.locator("#calendrier .cal-sur-occupation")).toHaveCount(0);
  // Laitue du 22/05 sur la planche 2 (30 m²) : 20 m² + 15 m² de la laitue du 01/05, récoltée jusqu'au 05/07.
  await modifier(page, "plantations", "22/05/2026");
  await page.locator("#plantation-surface").fill("20");
  await page.locator("#plantation-ajouter").click();
  await expect(page.locator("#tiroir-plantations")).toBeHidden();
  const planche2 = (await stockees(page, "espaces")).find((e) => e.nom === "Planche 2").id;
  const ligneCalendrier = page.locator(`#calendrier .cal-ligne[data-espace="${planche2}"]`);
  const marque = ligneCalendrier.locator(".cal-sur-occupation");
  await expect(marque).toHaveCount(1);
  await expect(page.locator("#calendrier .cal-sur-occupation")).toHaveCount(1);
  await expect(ligneCalendrier.locator(".cal-espace")).toContainText(/sur-occupé/i);
  const boite = await marque.boundingBox();
  proche(boite.x, await abscisse(page, "2026-05-22"), "début de la sur-occupation");
  proche(boite.x + boite.width, await abscisse(page, "2026-07-06"), "fin de la sur-occupation");
  await aller(page, "espaces");
  await expect(page.locator("#liste-espaces .sur-occupation")).toHaveCount(1);
});

test("[T36] EX-35 : un clic ou la touche Entrée sur une barre ouvre la modification de sa plantation", async ({ page }) => {
  await exemple(page);
  await aller(page, "plantations");
  const id = await idDe(page, "plantations", "Black Beauty");
  const barre = page.locator(`#calendrier [data-plantation="${id}"]`);
  await expect(barre).toHaveAttribute("aria-label", /Courgette.*Black Beauty.*Planche 1.*30 m².*01\/05\/2026.*20\/06\/2026.*14\/08\/2026/);
  await barre.click();
  await expect(page.locator("#tiroir-plantations")).toBeVisible();
  await expect(page.locator("#tiroir-plantations h2")).toHaveText("Modifier la plantation");
  await expect(page.locator("#plantation-surface")).toHaveValue("30");
  await expect(page.locator("#plantation-date")).toHaveValue("2026-05-01");
  await expect(ligne(page, "plantations", "Black Beauty")).toHaveAttribute("aria-current", "true");
  await page.keyboard.press("Escape");
  await expect(page.locator("#tiroir-plantations")).toBeHidden();

  await barre.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#tiroir-plantations")).toBeVisible();
  await expect(page.locator("#plantation-surface")).toHaveValue("30");
  await page.locator("#plantation-surface").fill("12");
  await page.locator("#plantation-ajouter").click();
  await expect(page.locator("#tiroir-plantations")).toBeHidden();
  await expect(ligne(page, "plantations", "Black Beauty")).toContainText("12 m²");
  // Après l'enregistrement, le focus revient sur la barre de la plantation.
  await expect(page.locator(`#calendrier [data-plantation="${id}"]`)).toBeFocused();
});

test("[T36] EX-35 : au survol ou au focus d'une barre, une infobulle donne la variété, l'espace, la surface et les dates", async ({ page }) => {
  await exemple(page);
  await aller(page, "plantations");
  const infobulle = page.locator("#calendrier-infobulle");
  await expect(infobulle).toBeHidden();
  const barre = page.locator(`#calendrier [data-plantation="${await idDe(page, "plantations", "Black Beauty")}"]`);
  await barre.hover();
  await expect(infobulle).toBeVisible();
  for (const texte of ["Courgette", "Black Beauty", "Planche 1", "30 m²", "01/05/2026", "20/06/2026", "14/08/2026", "81 kg"]) {
    await expect(infobulle).toContainText(texte);
  }
  await page.mouse.move(2, 2);
  await expect(infobulle).toBeHidden();
  // Au clavier : la barre suivante, puis retour sur celle-ci.
  await barre.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(barre).toBeFocused();
  await expect(infobulle).toBeVisible();
  await expect(infobulle).toContainText("Black Beauty");
});

test("[T36] EX-35 : un repère « aujourd'hui » quand la date tombe dans la saison, aucun sinon", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await exemple(page, "2026-05-20T10:00:00+04:00");
  await aller(page, "plantations");
  const repere = page.locator("#calendrier .cal-aujourdhui");
  await expect(repere).toBeVisible();
  const boite = await repere.boundingBox();
  proche(boite.x + boite.width / 2, await abscisse(page, "2026-05-20"), "repère du 20 mai", 4);

  // En janvier, la ferme d'exemple se charge pour la saison qui vient : aujourd'hui est avant elle.
  await page.evaluate(() => localStorage.clear());
  await exemple(page, "2027-01-15T10:00:00+04:00");
  await aller(page, "plantations");
  await expect(page.locator("#calendrier .cal-ligne")).not.toHaveCount(0);
  await expect(page.locator("#calendrier .cal-aujourdhui")).toHaveCount(0);
});

test("[T36] EX-35 : à 1366 px le calendrier tient sans défilement ; au téléphone il défile dans sa boîte, les espaces restant à gauche", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await exemple(page);
  await aller(page, "plantations");
  const largeurs = () => page.evaluate(() => {
    const boite = document.querySelector("#calendrier .cal-defilement");
    return { boite: boite.clientWidth, contenu: boite.scrollWidth, page: document.documentElement.scrollWidth, fenetre: window.innerWidth };
  });
  let l = await largeurs();
  expect(l.contenu).toBeLessThanOrEqual(l.boite + 1);
  expect(l.page).toBeLessThanOrEqual(l.fenetre);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => (await largeurs()).contenu).toBeGreaterThan(390);
  l = await largeurs();
  expect(l.page).toBeLessThanOrEqual(l.fenetre);
  const boite = page.locator("#calendrier .cal-defilement");
  await boite.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
  const cadre = await boite.boundingBox();
  const nom = await page.locator("#calendrier .cal-ligne .cal-espace").first().boundingBox();
  proche(nom.x, cadre.x, "colonne des espaces figée à gauche", 2);
});

// ---- Tiroir des plantations, états vides (EX-36)

test("[T36] EX-36 : sans espace ni variété, le tiroir des plantations dit quoi faire d'abord, avec un lien vers la page concernée", async ({ page }) => {
  await page.goto("index.html");
  await ouvrir(page, "plantations");
  const prealable = page.locator("#plantation-prealable");
  await expect(prealable).toBeVisible();
  await expect(prealable).toContainText(/espace/i);
  await expect(prealable).toContainText(/variété/i);
  await prealable.locator('a[href="#espaces"]').click();
  await expect(page.locator("#tiroir-plantations")).toBeHidden();
  await expect(page.locator("#page-espaces")).toBeVisible();
  await expect(page.locator("#tiroir-espaces")).toBeVisible();
  await page.keyboard.press("Escape");

  await ajouterEspace(page, { nom: "planche 1", surface: 30 });
  await ouvrir(page, "plantations");
  await expect(prealable).toBeVisible();
  await expect(prealable.locator('a[href="#espaces"]')).toHaveCount(0);
  await expect(prealable.locator('a[href="#cultures"]')).toBeVisible();
  await page.keyboard.press("Escape");

  await ajouterCulture(page, {
    nom: "courgette", unite: "kg", rendement: "3", prix: "2 / 2,5 / 3", joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10,
  });
  await ajouterVariete(page, { nom: "Black Beauty", culture: "courgette" });
  await ouvrir(page, "plantations");
  await expect(prealable).toBeHidden();
});

test("[T36] Tiroir des plantations : la récolte prévue suit la variété, la date et la surface saisies", async ({ page }) => {
  await exemple(page);
  await modifier(page, "plantations", "Black Beauty");
  const apercu = page.locator("#plantation-apercu");
  await expect(apercu).toBeVisible();
  await expect(apercu).toContainText("du 20/06/2026 au 14/08/2026");
  await expect(apercu).toContainText("81 kg 54 à 108");
  // 11/05 + 50 jours = 30/06 ; 8 semaines de récolte ; 15 m² × 2 / 3 / 4 kg × 90 %.
  await page.locator("#plantation-date").fill("2026-05-11");
  await page.locator("#plantation-surface").fill("15");
  await expect(apercu).toContainText("du 30/06/2026 au 24/08/2026");
  await expect(apercu).toContainText("40,5 kg 27 à 54");
  verifierLisibilite(await auditerTextes(page), "tiroir et récolte prévue");
  await page.keyboard.press("Escape");
  await ouvrir(page, "plantations");
  await expect(apercu).toBeHidden();
});

test("[T36] EX-36 : les listes vides de la ferme disent ce qu'elles contiendront et proposent de les remplir", async ({ page }) => {
  await page.goto("index.html");
  for (const [nom, objet] of [["espaces", "espaces"], ["cultures", "cultures"], ["cultures", "varietes"], ["plantations", "plantations"], ["poules", "lots"]]) {
    await aller(page, nom);
    const vide = page.locator(`#${objet}-vide`);
    await expect(vide).toBeVisible();
    await expect(vide.locator("p")).toHaveText(/apparaîtr/);
    await expect(vide.locator(`[data-ouvrir="${objet}"]`)).toBeVisible();
  }
});

// ---- Poules

test("[T36] Poules : un repère montre, pour chaque lot, la présence des poules et la période de ponte", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await exemple(page);
  await aller(page, "poules");
  const carte = page.locator("#carte-calendrier-lots");
  await expect(carte).toBeVisible();
  const lot = carte.locator(".cal-ligne[data-lot]");
  await expect(lot).toHaveCount(1);
  await expect(lot.locator(".cal-espace-nom")).toHaveText("Lot de printemps");
  const presence = await lot.locator(".cal-arrivee").boundingBox();
  const ponte = await lot.locator(".cal-ponte").boundingBox();
  proche(presence.x, await abscisse(page, "2026-03-02", "#calendrier-lots"), "arrivée");
  proche(ponte.x, await abscisse(page, "2026-04-06", "#calendrier-lots"), "début de ponte");
  proche(ponte.x + ponte.width, await abscisse(page, "2026-10-26", "#calendrier-lots"), "réforme");

  await page.locator('#liste-lots [data-action="supprimer"]').click();
  await expect(carte).toBeHidden();
});

// ---- Lisibilité des pages de la ferme (EX-37)

// Pour chaque texte visible : sa taille et son contraste avec le fond réellement peint dessous.
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
      if (!n.textContent.trim() || el.closest("script, style, select") || !el.checkVisibility({ visibilityProperty: true })) continue;
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
  expect(textes.filter((t) => t.taille < 12), `${contexte} : textes de moins de 12 px`).toEqual([]);
  const peuContrastes = textes.filter((t) => t.contraste < 4.5).map((t) => `${t.texte} (${t.contraste.toFixed(2)})`);
  expect(peuContrastes, `${contexte} : textes de contraste inférieur à 4,5:1`).toEqual([]);
}

for (const theme of ["light", "dark"]) {
  test(`[T36] EX-37 : pages de la ferme lisibles en thème ${theme === "light" ? "clair" : "sombre"} — tailles et contrastes, infobulle et alertes comprises`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.setViewportSize({ width: 1366, height: 900 });
    await exemple(page);
    // Une sur-occupation, pour voir l'alerte de la liste et la marque du calendrier.
    await modifier(page, "plantations", "22/05/2026");
    await page.locator("#plantation-surface").fill("20");
    await page.locator("#plantation-ajouter").click();
    for (const nom of ["espaces", "cultures", "plantations", "poules", "sauvegarde"]) {
      await aller(page, nom);
      verifierLisibilite(await auditerTextes(page), nom);
    }
    await aller(page, "plantations");
    await page.locator("#calendrier .cal-barre").first().hover();
    await expect(page.locator("#calendrier-infobulle")).toBeVisible();
    verifierLisibilite(await auditerTextes(page), "infobulle");
    await aller(page, "poules");
    await page.locator("#calendrier-lots .cal-barre").first().hover();
    verifierLisibilite(await auditerTextes(page), "repère des lots");
    await aller(page, "sauvegarde");
    await page.locator("#importer").setInputFiles({ name: "notes.json", mimeType: "application/json", buffer: Buffer.from("{ pas du json") });
    await expect(page.locator("#import-message")).toBeVisible();
    verifierLisibilite(await auditerTextes(page), "message d'import");
  });
}

test("[T36] EX-37 : aucune page de la ferme ne défile en largeur, de 360 à 1920 px", async ({ page }) => {
  await exemple(page);
  for (const [largeur, hauteur] of [[360, 740], [390, 844], [768, 1024], [1366, 768], [1920, 1080]]) {
    await page.setViewportSize({ width: largeur, height: hauteur });
    for (const nom of ["espaces", "cultures", "plantations", "poules", "sauvegarde"]) {
      await aller(page, nom);
      const largeurs = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, contenu: document.getElementById("contenu").scrollWidth, fenetre: window.innerWidth }));
      expect(largeurs.page, `${nom} à ${largeur} px`).toBeLessThanOrEqual(largeurs.fenetre);
      expect(largeurs.contenu, `${nom} à ${largeur} px (zone de contenu)`).toBeLessThanOrEqual(largeurs.fenetre);
    }
  }
});

test("[T36] EX-36 : le tiroir des plantations lisible quand il dit quoi faire d'abord", async ({ page }) => {
  await page.goto("index.html");
  await ouvrir(page, "plantations");
  await expect(page.locator("#plantation-prealable")).toBeVisible();
  verifierLisibilite(await auditerTextes(page), "tiroir des plantations");
});

// ---- Sauvegarde

test("[T36] Sauvegarde : export en bouton principal, import par un sélecteur de fichier, explication et message de résultat", async ({ page }) => {
  await exemple(page);
  await aller(page, "sauvegarde");
  await expect(page.locator("#exporter")).toBeVisible();
  await expect(page.locator("#exporter")).toHaveClass(/\bprincipal\b/);
  await expect(page.locator("#sauvegarde-contenu")).toContainText("5 espaces");
  await expect(page.locator("#sauvegarde-contenu")).toContainText("10 plantations");
  await expect(page.locator("#sauvegarde-contenu")).toContainText("1 lot de poules");
  const choisir = page.locator('label[for="importer"]');
  await expect(choisir).toBeVisible();
  await expect(choisir).toContainText(/choisir un fichier/i);
  await expect(page.locator("#page-sauvegarde")).toContainText(/navigateur/);
  await expect(page.locator("#page-sauvegarde")).toContainText(/remplace/);

  const [telechargement] = await Promise.all([page.waitForEvent("download"), page.locator("#exporter").click()]);
  const texte = require("node:fs").readFileSync(await telechargement.path(), "utf8");
  page.once("dialog", (dialogue) => dialogue.accept());
  await page.locator("#importer").setInputFiles({ name: "ferme.json", mimeType: "application/json", buffer: Buffer.from(texte) });
  const message = page.locator("#import-message");
  await expect(message).toBeVisible();
  await expect(message).toHaveAttribute("role", "status");
  await expect(message).not.toHaveClass(/erreur/);
  await expect(message).toContainText("10 plantations");
});
