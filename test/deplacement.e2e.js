// Tranche R5 — déplacer une plantation dans le calendrier, dans le navigateur.
const { test, expect } = require("@playwright/test");

test("[T65] EX-68 : le fichier livré calcule les conséquences d'un déplacement", async ({ page }) => {
  await page.goto("index.html");
  const r = await page.evaluate(() => {
    const f = (b, m = b, h = m) => ({ basse: b, mediane: m, haute: h });
    const d = {
      espaces: [{ id: "p1", nom: "planche 1", surface: 30 }, { id: "p2", nom: "planche 2", surface: 30 }],
      familles: [{ id: "fs", nom: "Solanacées", delaiRetour: f(2, 3, 4) }],
      cultures: [{ id: "t", nom: "tomate", famille: "Solanacées", unite: "kg", rendement: f(3), prix: f(2), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 10 }],
      varietes: [{ id: "vt", cultureId: "t", nom: "Heatmaster" }],
      plantations: [{ id: "a", varieteId: "vt", espaceId: "p1", surface: 30, date: "2026-03-01" }, { id: "b", varieteId: "vt", espaceId: "p2", surface: 30, date: "2027-03-01" }],
    };
    const c = Calc.consequencesDeplacement(d, "b", { date: "2027-03-15", espaceId: "p1" });
    return { retours: c.retours.map((x) => x.plantationId), levees: c.levees };
  });
  expect(r).toEqual({ retours: ["b"], levees: 0 });
});

// ---- T66 : le geste dans le calendrier de culture (EX-67 à EX-70)

const { aller } = require("./outils.js");

// Contexte de S22 et S23 : tomate (Solanacées, délai 2 / 3 / 4 ans) sur deux planches de 30 m².
async function deuxPlanches(page) {
  await page.goto("index.html");
  const ids = await page.evaluate(() => {
    const f = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    f.ajouter("familles", { nom: "Solanacées", delaiRetour: F(2, 3, 4) });
    const c = f.ajouter("cultures", { nom: "tomate", famille: "Solanacées", unite: "kg", rendement: F(12), prix: F(3.5), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 15 });
    const v = f.ajouter("varietes", { cultureId: c.id, nom: "Heatmaster" });
    const p1 = f.ajouter("espaces", { nom: "planche 1", surface: 30, type: "plein_champ" });
    const p2 = f.ajouter("espaces", { nom: "planche 2", surface: 30, type: "plein_champ" });
    const a = f.ajouter("plantations", { varieteId: v.id, espaceId: p1.id, surface: 30, date: "2026-03-01" });
    const b = f.ajouter("plantations", { varieteId: v.id, espaceId: p2.id, surface: 30, date: "2027-03-01" });
    return { p1: p1.id, p2: p2.id, a: a.id, b: b.id };
  });
  await page.reload();
  await aller(page, "plantations");
  return ids;
}

// L'abscisse, dans la page, du début d'un jour sur l'axe du calendrier (d'après l'en-tête de son mois).
async function xDuJour(page, iso) {
  return page.evaluate((date) => {
    const [a, m, j] = date.split("-").map(Number);
    const boite = document.querySelector(`#calendrier .cal-mois[data-mois="${date.slice(0, 7)}"]`).getBoundingClientRect();
    return boite.left + ((j - 1) / new Date(Date.UTC(a, m, 0)).getUTCDate()) * boite.width;
  }, iso);
}

const plantation = (page, id) => page.evaluate((i) => {
  const p = Store.ouvrir(localStorage).obtenir("plantations", i);
  return { date: p.date, espaceId: p.espaceId };
}, id);

// Saisit la barre près de son début et la pose au jour `date`, sur la ligne de l'espace `espaceId` ;
// `avantLacher` regarde l'écran pendant le geste.
async function glisser(page, id, depuis, { date, espaceId }, avantLacher = async () => {}) {
  await page.locator(`#calendrier .cal-mois[data-mois="${date.slice(0, 7)}"]`).scrollIntoViewIfNeeded();
  await page.locator(`#calendrier .cal-mois[data-mois="${depuis.slice(0, 7)}"]`).scrollIntoViewIfNeeded();
  const barre = await page.locator(`#calendrier .cal-barre[data-id="${id}"]`).boundingBox();
  const decalage = 6;
  const x0 = (await xDuJour(page, depuis)) + decalage;
  const y0 = barre.y + barre.height / 2;
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  await page.mouse.move(x0 + 8, y0, { steps: 2 });
  const ligne = await page.locator(`#calendrier .cal-ligne[data-espace="${espaceId}"] .cal-piste`).boundingBox();
  await page.mouse.move((await xDuJour(page, date)) + decalage, ligne.y + ligne.height / 2, { steps: 10 });
  await avantLacher();
  await page.mouse.up();
}

test("[T66] S22, EX-67, EX-68 : glisser la barre vers une autre date et un autre espace montre la date, l'espace et l'alerte, puis enregistre sans rien refuser", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  const ids = await deuxPlanches(page);
  const etiquette = page.locator("#deplacement-etiquette");
  await glisser(page, ids.b, "2027-03-01", { date: "2027-03-15", espaceId: ids.p1 }, async () => {
    await expect(etiquette).toBeVisible();
    await expect(etiquette).toContainText("15/03/2027 · planche 1");
    await expect(etiquette).toContainText(/retour trop tôt/i);
    await expect(page.locator(`#calendrier .cal-ligne[data-espace="${ids.p1}"]`)).toHaveClass(/cal-ligne-visee/);
  });
  await expect(etiquette).toBeHidden();
  expect(await plantation(page, ids.b)).toEqual({ date: "2027-03-15", espaceId: ids.p1 });
  await expect(page.locator(`#calendrier .cal-ligne[data-espace="${ids.p1}"] .cal-barre[data-id="${ids.b}"]`)).toHaveClass(/cal-retour/);
  // Le geste n'ouvre pas le tiroir de modification.
  await expect(page.locator("#tiroir-plantations")).toBeHidden();
});

test("[T66] S23, EX-69 : après le déplacement, « Annuler » remet la plantation à sa date et sur son espace d'avant", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  const ids = await deuxPlanches(page);
  await glisser(page, ids.b, "2027-03-01", { date: "2027-03-15", espaceId: ids.p1 });
  const annonce = page.locator("#annonce");
  await expect(annonce).toContainText("15/03/2027");
  await expect(annonce).toContainText("planche 1");
  await annonce.getByRole("button").click();
  expect(await plantation(page, ids.b)).toEqual({ date: "2027-03-01", espaceId: ids.p2 });
  await expect(page.locator(`#calendrier .cal-ligne[data-espace="${ids.p2}"] .cal-barre[data-id="${ids.b}"]`)).toBeVisible();
});

test("[T66] EX-70 : au clavier, D puis les flèches déplacent la barre, Entrée la pose, Échap annule ; Entrée seule ouvre toujours la modification", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  const ids = await deuxPlanches(page);
  const barre = () => page.locator(`#calendrier .cal-barre[data-id="${ids.a}"]`);
  const etiquette = page.locator("#deplacement-etiquette");
  // Échap : rien ne change.
  await barre().focus();
  await page.keyboard.press("d");
  await expect(etiquette).toContainText("01/03/2026 · planche 1");
  await page.keyboard.press("ArrowRight");
  await expect(etiquette).toContainText("02/03/2026 · planche 1");
  await page.keyboard.press("Escape");
  await expect(etiquette).toBeHidden();
  expect(await plantation(page, ids.a)).toEqual({ date: "2026-03-01", espaceId: ids.p1 });
  // Trois jours, une semaine, l'espace suivant, puis Entrée.
  await barre().focus();
  await page.keyboard.press("d");
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Shift+ArrowRight");
  await page.keyboard.press("ArrowDown");
  await expect(etiquette).toContainText("11/03/2026 · planche 2");
  await expect(etiquette).toHaveAttribute("aria-live", "polite");
  await page.keyboard.press("Enter");
  await expect(etiquette).toBeHidden();
  await expect(page.locator("#tiroir-plantations")).toBeHidden();
  expect(await plantation(page, ids.a)).toEqual({ date: "2026-03-11", espaceId: ids.p2 });
  // Hors déplacement, Entrée et le clic ouvrent la modification.
  await expect(barre()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#tiroir-plantations")).toBeVisible();
  await page.keyboard.press("Escape");
  await barre().click();
  await expect(page.locator("#tiroir-plantations")).toBeVisible();
});

test.describe("au doigt", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("[T66] EX-70 : au doigt, un appui long saisit la barre et la pose ailleurs ; un glissé rapide fait seulement défiler", async ({ page }) => {
    const ids = await deuxPlanches(page);
    const cdp = await page.context().newCDPSession(page);
    const toucher = (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
    await page.locator(`#calendrier .cal-mois[data-mois="2026-03"]`).scrollIntoViewIfNeeded();
    const barre = await page.locator(`#calendrier .cal-barre[data-id="${ids.a}"]`).boundingBox();
    const x0 = (await xDuJour(page, "2026-03-01")) + 6;
    const y0 = barre.y + barre.height / 2;
    // Glissé rapide : la plantation ne bouge pas.
    await toucher("touchStart", x0, y0);
    for (let i = 1; i <= 5; i++) await toucher("touchMove", x0 - i * 12, y0);
    await toucher("touchEnd");
    expect(await plantation(page, ids.a)).toEqual({ date: "2026-03-01", espaceId: ids.p1 });
    // Appui long, puis on glisse vers la ligne de la planche 2, une semaine plus tard.
    await page.locator(`#calendrier .cal-mois[data-mois="2026-03"]`).scrollIntoViewIfNeeded();
    const x1 = (await xDuJour(page, "2026-03-01")) + 6;
    const ligne = await page.locator(`#calendrier .cal-ligne[data-espace="${ids.p2}"] .cal-piste`).boundingBox();
    const x2 = (await xDuJour(page, "2026-03-08")) + 6;
    await toucher("touchStart", x1, y0);
    await page.waitForTimeout(500);
    for (let i = 1; i <= 8; i++) await toucher("touchMove", x1 + ((x2 - x1) * i) / 8, y0 + ((ligne.y + ligne.height / 2 - y0) * i) / 8);
    await expect(page.locator("#deplacement-etiquette")).toContainText("08/03/2026 · planche 2");
    await toucher("touchEnd");
    expect(await plantation(page, ids.a)).toEqual({ date: "2026-03-08", espaceId: ids.p2 });
  });
});

// ---- T66, reprise après la vérification de la tranche : un espace hors de l'écran, en haut ou en bas.

// Douze planches (« planche 01 » à « planche 12 », dans cet ordre), une tomate sur la première :
// le calendrier dépasse la hauteur de l'écran.
async function douzePlanches(page) {
  await page.goto("index.html");
  const ids = await page.evaluate(() => {
    const f = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    f.ajouter("familles", { nom: "Solanacées", delaiRetour: F(2, 3, 4) });
    const c = f.ajouter("cultures", { nom: "tomate", famille: "Solanacées", unite: "kg", rendement: F(12), prix: F(3.5), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 15 });
    const v = f.ajouter("varietes", { cultureId: c.id, nom: "Heatmaster" });
    const planches = [];
    for (let i = 1; i <= 12; i++) planches.push(f.ajouter("espaces", { nom: `planche ${String(i).padStart(2, "0")}`, surface: 30, type: "plein_champ" }).id);
    const a = f.ajouter("plantations", { varieteId: v.id, espaceId: planches[0], surface: 30, date: "2026-03-01" });
    return { planches, a: a.id };
  });
  await page.reload();
  await aller(page, "plantations");
  return ids;
}

// Les espaces dont la ligne est entièrement sous le bas de l'écran.
const lignesSousLEcran = (page) => page.evaluate(() => [...document.querySelectorAll("#calendrier .cal-ligne[data-espace]")]
  .filter((l) => l.getBoundingClientRect().top >= window.innerHeight).map((l) => l.dataset.espace));

test("[T66] EX-67 : à la souris, tenir le pointeur près du bas de l'écran fait défiler jusqu'à un espace qui était hors de l'écran", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 640 });
  const ids = await douzePlanches(page);
  await page.locator(`#calendrier .cal-mois[data-mois="2026-03"]`).scrollIntoViewIfNeeded();
  const barre = page.locator(`#calendrier .cal-barre[data-id="${ids.a}"]`);
  await barre.scrollIntoViewIfNeeded();
  const cachees = await lignesSousLEcran(page);
  expect(cachees.length).toBeGreaterThan(0);
  const b = await barre.boundingBox();
  const x0 = b.x + 10;
  await page.mouse.move(x0, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(x0 + 8, b.y + b.height / 2, { steps: 2 });
  await page.mouse.move(x0 + 8, 300, { steps: 4 });
  await page.mouse.move(x0 + 8, 630, { steps: 6 });
  await expect.poll(async () => page.evaluate(() => document.querySelector("#calendrier .cal-ligne-visee").dataset.espace), { timeout: 8000 }).toBe(ids.planches[11]);
  await page.mouse.up();
  const apres = await plantation(page, ids.a);
  expect(apres.espaceId).toBe(ids.planches[11]);
  expect(cachees).toContain(apres.espaceId);
});

test("[T66] EX-70 : au clavier, la flèche vers le bas amène à l'écran la ligne visée, même hors de l'écran", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 640 });
  const ids = await douzePlanches(page);
  const barre = page.locator(`#calendrier .cal-barre[data-id="${ids.a}"]`);
  await barre.scrollIntoViewIfNeeded();
  await barre.focus();
  await page.keyboard.press("d");
  for (let i = 0; i < 11; i++) await page.keyboard.press("ArrowDown");
  await expect(page.locator("#deplacement-etiquette")).toContainText("01/03/2026 · planche 12");
  const fantome = await page.locator("#calendrier .cal-fantome").boundingBox();
  expect(fantome.y).toBeGreaterThanOrEqual(0);
  expect(fantome.y + fantome.height).toBeLessThanOrEqual(640);
  await page.keyboard.press("Enter");
  expect(await plantation(page, ids.a)).toEqual({ date: "2026-03-01", espaceId: ids.planches[11] });
});

test.describe("au doigt, hors de l'écran", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("[T66] EX-70 : au doigt, tenir le doigt près du bas de l'écran fait défiler jusqu'à un espace qui était hors de l'écran", async ({ page }) => {
    const ids = await douzePlanches(page);
    await page.locator(`#calendrier .cal-mois[data-mois="2026-03"]`).scrollIntoViewIfNeeded();
    const barre = page.locator(`#calendrier .cal-barre[data-id="${ids.a}"]`);
    await barre.scrollIntoViewIfNeeded();
    const cachees = await lignesSousLEcran(page);
    expect(cachees.length).toBeGreaterThan(0);
    const cdp = await page.context().newCDPSession(page);
    const toucher = (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
    const b = await barre.boundingBox();
    const x0 = Math.max(b.x, 140) + 8;
    const y0 = b.y + b.height / 2;
    await toucher("touchStart", x0, y0);
    await page.waitForTimeout(500);
    for (let i = 1; i <= 8; i++) await toucher("touchMove", x0, y0 + ((835 - y0) * i) / 8);
    await expect.poll(async () => page.evaluate(() => document.querySelector("#calendrier .cal-ligne-visee").dataset.espace), { timeout: 8000 }).toBe(ids.planches[11]);
    await toucher("touchEnd");
    const apres = await plantation(page, ids.a);
    expect(apres.espaceId).toBe(ids.planches[11]);
    expect(cachees).toContain(apres.espaceId);
  });
});
