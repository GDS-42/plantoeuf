"use strict";
// Prototype — étude de faisabilité « créer la rotation d'un clic » pour plantoeuf.
// Lecture seule du dépôt : la ferme d'exemple est chargée dans un stockage en mémoire (comme
// test/exemple-r4.test.js) ; rien n'est enregistré. Lancer : node prototype-rotation.js
const RACINE = process.env.PLANTOEUF || "/home/user/plantoeuf";
const Store = require(RACINE + "/src/store.js");
const Calc = require(RACINE + "/src/calc.js");
const Exemple = require(RACINE + "/src/exemple.js");

// ---------- Ferme d'exemple en mémoire
function stockageEnMemoire() { const v = new Map(); return { getItem: (k) => (v.has(k) ? v.get(k) : null), setItem: (k, x) => v.set(k, String(x)) }; }
function chargerExemple(annee) {
  const ferme = Store.ouvrir(stockageEnMemoire(), { horloge: () => new Date("2026-10-17T00:00:00Z") });
  Exemple.charger(ferme, annee);
  const d = {}; for (const o of Store.OBJETS) d[o] = ferme.lister(o);
  return d;
}

// ---------- Outils
const actifs = (l) => (l || []).filter((e) => !e.supprimeLe);
const memeJour = (date, n) => { const [a, m, j] = date.split("-"); return `${Number(a) + n}-${m}-${m === "02" && j === "29" ? "28" : j}`; };
function comparer(a, b) { for (let i = 0; i < a.length; i++) { if (a[i] < b[i]) return -1; if (a[i] > b[i]) return 1; } return 0; }
const plus = (a, b) => a.map((v, i) => v + b[i]);
const moins = (a, b) => a.map((v, i) => v - b[i]);
const ZERO = [0, 0, 0, 0];
const mediane = (l) => { const s = [...l].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const INSTANT = "2026-10-17T00:00:00.000Z";

function contexte(d) {
  const varietes = new Map(actifs(d.varietes).map((v) => [v.id, v]));
  const cultures = new Map(actifs(d.cultures).map((c) => [c.id, c]));
  const espaces = new Map(actifs(d.espaces).map((e) => [e.id, e]));
  const rotations = actifs(d.rotations).filter((r) => Array.isArray(r.groupes));
  const info = (p) => { const v = varietes.get(p.varieteId); const c = v && cultures.get(v.cultureId); return c ? { culture: c, fin: Calc.datesRecolte(p, Calc.parametres(c, v)).fin } : null; };
  return { varietes, cultures, espaces, rotations, info };
}

// Raisons d'une plantation à une place, dans le vocabulaire de « Que planter ici ? » (Calc.suggestions) :
// trop_tot, precedent_*, voisin_*, groupe_suivant. dE : les données réduites aux plantations de l'espace
// (les règles de R4 ne regardent que l'espace de la plantation).
function raisonsDe(ctx, dE, p) {
  const { precedents: avant, tropTot } = Calc.precedents(dE, p);
  const autour = Calc.voisins(dE, p);
  const r = [];
  if (tropTot) r.push({ code: "trop_tot", famille: tropTot.famille, delai: tropTot.delai.mediane, surface: tropTot.surface });
  for (const x of avant) if (x.effet) r.push({ code: `precedent_${x.effet}`, culture: x.culture });
  for (const x of autour) if (x.effet) r.push({ code: `voisin_${x.effet}`, culture: x.culture });
  const ici = ctx.info(p);
  const derniere = dE.plantations.filter((a) => a.id !== p.id && !a.supprimeLe).map((a) => ({ a, i: ctx.info(a) })).filter((x) => x.i && x.i.fin < p.date)
    .sort((x, y) => x.a.date.localeCompare(y.a.date) || String(x.a.id).localeCompare(String(y.a.id))).sort((x, y) => x.i.fin.localeCompare(y.i.fin)).pop();
  const g = derniere && derniere.i.culture.groupe;
  const rot = g && ici.culture.groupe && ctx.rotations.find((ro) => { const i = ro.groupes.indexOf(g); return i !== -1 && ro.groupes[(i + 1) % ro.groupes.length] === ici.culture.groupe; });
  if (rot) r.push({ code: "groupe_suivant", groupe: ici.culture.groupe, apres: derniere.i.culture.nom });
  return r;
}
// Clés de classement de « Que planter ici ? », sans poids chiffré : retour trop tôt, défavorable, raisons
// favorables, groupe suivant. Écart choisi par l'étude : les raisons favorables se comptent par culture et non par
// plantation (quinze salades voisines comptent pour une), pour ne pas entasser les séries autour d'une culture.
const cles = (r) => [r.some((x) => x.code === "trop_tot") ? 1 : 0, r.some((x) => x.code.endsWith("_defavorable")) ? 1 : 0,
  -new Set(r.filter((x) => x.code.endsWith("_favorable")).map((x) => x.code + x.culture)).size, r.some((x) => x.code === "groupe_suivant") ? 0 : 1];
// Départage, après les clés : rester à sa place de l'an passé (sans règle, rien ne bouge), puis le nom de l'espace.
const departage = (x, es) => [es.id === x.source.espaceId ? 0 : 1, es.nom];

// Ordre des plantations à placer : date, puis la plus grande surface, puis le nom de la culture et de l'espace
// d'origine ; l'identifiant (UUID tiré au hasard) ne départage qu'en dernier, pour qu'un même plan donne la même proposition.
const ordreStable = (ctx) => (a, b) => a.date.localeCompare(b.date) || b.surface - a.surface ||
  ctx.info(a).culture.nom.localeCompare(ctx.info(b).culture.nom, "fr") || ctx.espaces.get(a.espaceId).nom.localeCompare(ctx.espaces.get(b.espaceId).nom, "fr") || a.id.localeCompare(b.id);

// Plus grande surface occupée sur [debut, fin] (la sur-occupation de N1 vue d'une plantation).
function occupationMax(liste, debut, fin, sauf) {
  let max = 0;
  for (const t of [debut, ...liste.filter((o) => o.date > debut && o.date <= fin).map((o) => o.date)]) {
    let s = 0; for (const o of liste) if (o.id !== sauf && o.date <= t && o.fin >= t) s += o.surface;
    if (s > max) max = s;
  }
  return max;
}

// ---------- Préparation commune : les plantations de l'année source, reconduites à la même date et sur la même
// surface dans l'année cible, à placer. fixes : cultures qui restent sur leur espace (simule le champ manquant
// « vivace ») ; memeType : une plantation sous abri reste sous abri, une de plein champ reste en plein champ
// (simule le champ manquant « abri obligatoire / possible ») ; garder : filtre des plantations reconduites.
function preparer(d, { source, cible = source + 1, fixes = new Set(), memeType = true, identique = false, garder = () => true }) {
  const ctx = contexte(d);
  const existantes = actifs(d.plantations).filter((p) => ctx.info(p) && ctx.espaces.has(p.espaceId));
  const sources = existantes.filter((p) => p.date.startsWith(`${source}-`) && garder(p)).sort(ordreStable(ctx));
  const plan = sources.map((s, i) => {
    const p = { id: `plan-${cible}-${String(i).padStart(3, "0")}`, varieteId: s.varieteId, surface: s.surface, date: memeJour(s.date, cible - source), espaceId: null };
    const culture = ctx.info(s).culture;
    return { p, source: s, culture, fin: ctx.info(p).fin, fixe: identique || fixes.has(culture.id), raisons: [], alternatives: [], pleins: [], ici: null };
  });
  const parEspace = new Map([...ctx.espaces.keys()].map((id) => [id, []]));
  const occ = new Map([...ctx.espaces.keys()].map((id) => [id, []]));
  for (const p of existantes) { parEspace.get(p.espaceId).push(p); occ.get(p.espaceId).push({ id: p.id, date: p.date, fin: ctx.info(p).fin, surface: p.surface }); }
  const prefixe = `plan-${cible}-`;
  const e = {
    ctx, plan, parEspace, appels: 0,
    dDe: (eid, extra) => ({ ...d, plantations: extra ? [...parEspace.get(eid), extra] : parEspace.get(eid) }),
    candidats: (x) => [...ctx.espaces.values()].filter((es) => (x.fixe ? es.id === x.source.espaceId : !memeType || es.type === ctx.espaces.get(x.source.espaceId).type)),
    tient: (x, es) => occupationMax(occ.get(es.id), x.p.date, x.fin, x.p.id) + x.p.surface <= es.surface + 1e-9,
    placer: (x, eid) => { x.p.espaceId = eid; parEspace.get(eid).push(x.p); occ.get(eid).push({ id: x.p.id, date: x.p.date, fin: x.fin, surface: x.p.surface }); },
    retirer: (x) => { const eid = x.p.espaceId; parEspace.set(eid, parEspace.get(eid).filter((q) => q.id !== x.p.id)); occ.set(eid, occ.get(eid).filter((o) => o.id !== x.p.id)); x.p.espaceId = null; },
    essayer: (x, eid) => { const essai = { ...x.p, espaceId: eid }; e.appels++; return raisonsDe(ctx, e.dDe(eid, essai), essai); },
    coutEspace: (eid) => { let c = ZERO; for (const q of parEspace.get(eid)) if (String(q.id).startsWith(prefixe)) { e.appels++; c = plus(c, cles(raisonsDe(ctx, e.dDe(eid), q))); } return c; },
    ordre: () => [...plan.filter((x) => x.fixe), ...plan.filter((x) => !x.fixe)],
  };
  return e;
}

// ---------- Méthode recommandée : glouton chronologique par plantation. Chaque plantation, dans l'ordre des
// dates, prend la place libre la mieux classée selon les clés de « Que planter ici ? » (puis le nom de l'espace).
function glouton(etat) {
  const nonPlacees = [];
  for (const x of etat.ordre()) {
    const essais = [];
    for (const es of etat.candidats(x)) {
      if (!etat.tient(x, es)) { x.pleins.push(es.nom); continue; }
      const r = etat.essayer(x, es.id);
      essais.push({ es, r, k: [...cles(r), ...departage(x, es)] });
      if (es.id === x.source.espaceId) x.ici = r; // ce que la plantation aurait à sa place de l'an passé
    }
    essais.sort((a, b) => comparer(a.k, b.k));
    if (!essais.length) { nonPlacees.push(x); continue; }
    etat.placer(x, essais[0].es.id);
    x.alternatives = essais.slice(1, 3).map((a) => ({ espace: a.es.nom, codes: a.r.map((z) => z.code) }));
  }
  return nonPlacees;
}

// ---------- Recherche locale : déplacer une plantation si le coût lexicographique total baisse.
// seulementAlertes : ne déplace que les plantations qui ont un retour trop tôt ou un défavorable.
function rechercheLocale(etat, { seulementAlertes = false, passesMax = 20 } = {}) {
  const cout = new Map([...etat.ctx.espaces.keys()].map((id) => [id, etat.coutEspace(id)]));
  let passes = 0, deplacements = 0, encore = true;
  while (encore && passes < passesMax) {
    encore = false; passes++;
    for (const x of etat.plan) {
      if (x.fixe || !x.p.espaceId) continue;
      const e1 = x.p.espaceId;
      if (seulementAlertes) { const k = cles(raisonsDe(etat.ctx, etat.dDe(e1), x.p)); if (!k[0] && !k[1]) continue; }
      let meilleur = null;
      for (const es of etat.candidats(x)) {
        if (es.id === e1 || !etat.tient(x, es)) continue;
        const avant = plus(cout.get(e1), cout.get(es.id));
        etat.retirer(x); etat.placer(x, es.id);
        const c1 = etat.coutEspace(e1), c2 = etat.coutEspace(es.id);
        etat.retirer(x); etat.placer(x, e1);
        const gain = moins(plus(c1, c2), avant);
        if (comparer(gain, ZERO) < 0 && (!meilleur || comparer(gain, meilleur.gain) < 0)) meilleur = { es, gain, c1, c2 };
      }
      if (meilleur) { etat.retirer(x); etat.placer(x, meilleur.es.id); cout.set(e1, meilleur.c1); cout.set(meilleur.es.id, meilleur.c2); deplacements++; encore = true; }
    }
  }
  return { passes, deplacements };
}

// ---------- Retour arrière avec séparation et évaluation sur les deux premières clés (retours trop tôt, puis
// défavorables) : le premier plan complet trouvé est celui du glouton ; la recherche cherche mieux dans le budget.
function retourArriere(etat, budgetMs) {
  const ordre = etat.ordre();
  const debut = performance.now();
  let meilleur = null, noeuds = 0, complet = true;
  function explorer(i, partiel) {
    if (performance.now() - debut > budgetMs) { complet = false; return; }
    noeuds++;
    if (meilleur && (partiel[0] > meilleur.cout[0] || (partiel[0] === meilleur.cout[0] && partiel[1] >= meilleur.cout[1]))) return;
    if (i === ordre.length) {
      let total = ZERO; for (const eid of etat.ctx.espaces.keys()) total = plus(total, etat.coutEspace(eid));
      if (!meilleur || comparer(total.slice(0, 2), meilleur.cout.slice(0, 2)) < 0) meilleur = { cout: total };
      return;
    }
    const x = ordre[i];
    const essais = etat.candidats(x).filter((es) => etat.tient(x, es)).map((es) => ({ es, k: [...cles(etat.essayer(x, es.id)), ...departage(x, es)] })).sort((a, b) => comparer(a.k, b.k));
    if (!essais.length) { explorer(i + 1, plus(partiel, [1000, 0, 0, 0])); return; }
    for (const a of essais) {
      etat.placer(x, a.es.id);
      explorer(i + 1, plus(partiel, a.k.slice(0, 4)));
      etat.retirer(x);
      if (!complet) return;
    }
  }
  explorer(0, ZERO);
  return { meilleur, noeuds, complet, ms: performance.now() - debut };
}

// ---------- Rotation par blocs : le programme de chaque espace de l'an passé (toutes ses plantations) passe
// en bloc sur un espace du même type ; affectation exacte par essai de toutes les permutations.
function blocs(d, options) {
  const etat = preparer(d, options);
  const ctx = etat.ctx;
  const programmes = new Map();
  for (const x of etat.plan) { if (!programmes.has(x.source.espaceId)) programmes.set(x.source.espaceId, []); programmes.get(x.source.espaceId).push(x); }
  const sources = [...programmes.keys()];
  const coutBloc = new Map();
  for (const s of sources) for (const es of ctx.espaces.values()) {
    const prog = programmes.get(s);
    const okType = prog.every((x) => etat.candidats(x).some((c) => c.id === es.id));
    if (!okType) continue;
    let ok = true;
    for (const x of prog) { if (!etat.tient(x, es)) { ok = false; break; } etat.placer(x, es.id); }
    const c = ok ? etat.coutEspace(es.id) : null;
    for (const x of prog) if (x.p.espaceId) etat.retirer(x);
    if (c) coutBloc.set(`${s}|${es.id}`, c);
  }
  let meilleur = null;
  const pris = new Set();
  (function affecter(i, cout, choix) {
    if (i === sources.length) { if (!meilleur || comparer(cout, meilleur.cout) < 0) meilleur = { cout, choix: [...choix] }; return; }
    for (const es of ctx.espaces.values()) {
      const c = coutBloc.get(`${sources[i]}|${es.id}`);
      if (!c || pris.has(es.id)) continue;
      pris.add(es.id); choix.push(es.id); affecter(i + 1, plus(cout, c), choix); choix.pop(); pris.delete(es.id);
    }
  })(0, ZERO, []);
  sources.forEach((s, i) => { for (const x of programmes.get(s)) etat.placer(x, meilleur.choix[i]); });
  return { etat, affectation: sources.map((s, i) => [ctx.espaces.get(s).nom, ctx.espaces.get(meilleur.choix[i]).nom]) };
}

// ---------- Glouton par espace guidé par Calc.suggestions : chaque créneau de l'an passé (espace, date, surface)
// garde sa place et prend la culture classée première par « Que planter ici ? » (avec quotas : la première dont il
// reste des plantations de l'an passé à reconduire).
function parEspaceSuggestions(d, { source, cible = source + 1, quotas }) {
  const ctx = contexte(d);
  const varieteDe = new Map();
  for (const v of actifs(d.varietes).sort((a, b) => a.nom.localeCompare(b.nom, "fr"))) if (!varieteDe.has(v.cultureId)) varieteDe.set(v.cultureId, v.id);
  const creneaux = actifs(d.plantations).filter((p) => p.date.startsWith(`${source}-`) && ctx.info(p)).sort(ordreStable(ctx));
  const reste = new Map();
  for (const p of creneaux) { const c = ctx.info(p).culture.id; reste.set(c, (reste.get(c) || 0) + 1); }
  const plantations = [...d.plantations];
  creneaux.forEach((s, i) => {
    const date = memeJour(s.date, cible - source);
    const liste = Calc.suggestions({ ...d, plantations }, { espaceId: s.espaceId, date, surface: s.surface });
    const choix = quotas ? liste.find((x) => reste.get(x.cultureId) > 0) : liste[0];
    if (quotas) reste.set(choix.cultureId, reste.get(choix.cultureId) - 1);
    plantations.push({ id: `plan-${cible}-${String(i).padStart(3, "0")}`, varieteId: varieteDe.get(choix.cultureId), espaceId: s.espaceId, surface: s.surface, date, creeLe: INSTANT, modifieLe: INSTANT, supprimeLe: null });
  });
  return avecSeances({ ...d, plantations }, cible);
}

// ---------- Mesures
function avecSeances(d, cible) {
  const b = Calc.bornesDeLAnnee(cible);
  const dejaLa = new Set(d.seances.filter((s) => s.debut.startsWith(`${cible}-`)).map((s) => s.pointVenteId));
  const seances = [...d.seances, ...actifs(d.seances).filter((s) => s.debut.startsWith(`${cible - 1}-`) && !dejaLa.has(s.pointVenteId)).map((s) => ({ ...s, id: `${s.id}-${cible}`, debut: b.debut, fin: b.fin }))];
  return { ...d, seances };
}
function avecPlan(d, etat, cible) {
  const plantations = [...d.plantations, ...etat.plan.filter((x) => x.p.espaceId).map((x) => ({ ...x.p, creeLe: INSTANT, modifieLe: INSTANT, supprimeLe: null }))];
  return avecSeances({ ...d, plantations }, cible);
}
// Alertes des plantations de l'année cible seulement (celles de l'année source restent ce qu'elles sont).
function compter(d2, cible) {
  const ids = new Set(d2.plantations.filter((p) => p.date.startsWith(`${cible}-`)).map((p) => p.id));
  const rt = Calc.retoursTropTot(d2), ad = Calc.associationsDefavorables(d2), so = Calc.surOccupations(d2);
  return {
    retours: Object.keys(rt).filter((i) => ids.has(i)).length,
    precedentsDefav: Object.entries(ad).filter(([i, v]) => ids.has(i) && v.precedents.length).length,
    voisinsDefav: Object.entries(ad).filter(([i, v]) => ids.has(i) && v.voisins.length).length,
    surOcc: Object.keys(so).length,
  };
}
function mesurer(d2, etat, cible) {
  for (const x of etat.plan) if (x.p.espaceId) x.raisons = raisonsDe(etat.ctx, etat.dDe(x.p.espaceId), x.p);
  const r = etat.plan.filter((x) => x.p.espaceId).map((x) => x.raisons);
  const parCulture = new Map();
  for (const x of etat.plan) if (x.p.espaceId) { if (!parCulture.has(x.culture.nom)) parCulture.set(x.culture.nom, new Set()); parCulture.get(x.culture.nom).add(x.p.espaceId); }
  return {
    ...compter(d2, cible),
    avecFavorable: r.filter((l) => l.some((z) => z.code.endsWith("_favorable"))).length,
    groupeSuivant: r.filter((l) => l.some((z) => z.code === "groupe_suivant")).length,
    nonPlacees: etat.plan.filter((x) => !x.p.espaceId).length,
    espacesParCulture: [...parCulture.values()].reduce((s, e) => s + e.size, 0),
  };
}
function lancer(d, options, methode) {
  const t0 = performance.now();
  const etat = preparer(d, options);
  let info = {};
  if (options.identique) for (const x of etat.ordre()) etat.placer(x, x.source.espaceId);
  else { glouton(etat); if (methode === "local") info = rechercheLocale(etat); if (methode === "localAlertes") info = rechercheLocale(etat, { seulementAlertes: true }); }
  const ms = performance.now() - t0;
  const cible = options.cible || options.source + 1;
  const d2 = avecPlan(d, etat, cible);
  return { etat, d2, ms, info, m: mesurer(d2, etat, cible) };
}
function chronometrer(fn, n = 7) { const t = []; for (let i = 0; i < n; i++) { const t0 = performance.now(); fn(); t.push(performance.now() - t0); } return mediane(t); }

// Bilan de place par famille : surface encore permise au 1er janvier de l'année cible (somme sur les espaces de
// leur surface moins les plantations de la famille encore dans leur délai), et surface demandée par le plan.
function bilanFamilles(d, etat, cible) {
  const ctx = etat.ctx, debut = `${cible}-01-01`;
  const res = [];
  for (const fam of actifs(d.familles).filter((f) => f.delaiRetour)) {
    const deLaFamille = (x) => Calc.familleDe(x.culture, d.familles) === fam;
    const demande = etat.plan.filter(deLaFamille).reduce((s, x) => s + x.p.surface, 0);
    if (!demande) continue;
    const libre = (type) => [...ctx.espaces.values()].filter((es) => es.type === type).reduce((s, es) => {
      const bloque = actifs(d.plantations).filter((p) => p.espaceId === es.id && ctx.info(p) && Calc.familleDe(ctx.info(p).culture, d.familles) === fam &&
        Calc.ajouterJours(ctx.info(p).fin, Math.round(fam.delaiRetour.mediane * 365)) > debut).reduce((t, p) => t + p.surface, 0);
      return s + Math.max(0, es.surface - bloque);
    }, 0);
    const demandeAbri = etat.plan.filter((x) => deLaFamille(x) && ctx.espaces.get(x.source.espaceId).type === "abri").reduce((s, x) => s + x.p.surface, 0);
    res.push({ famille: fam.nom, delai: fam.delaiRetour.mediane, demande, demandeAbri, libreAbri: libre("abri"), librePleinChamp: libre("plein_champ") });
  }
  return res;
}

// Volumes et chiffre d'affaires médians par culture (Calc.tableau d'une année).
function parCulture(d2, annee) { return new Map(Calc.tableau(d2, { annee }).lignes.map((l) => [l.nom, { unite: l.unite, volume: l.total.volume.mediane, ca: l.total.ca.mediane }])); }
const caTotal = (m) => [...m.values()].reduce((s, l) => s + l.ca, 0);

// Une ferme N fois plus grande : N copies des espaces et des plantations (mêmes cultures, mêmes règles).
function agrandir(d, n) {
  const espaces = [], plantations = [];
  for (let k = 0; k < n; k++) {
    for (const e of d.espaces) espaces.push({ ...e, id: `${e.id}-${k}`, nom: `${e.nom} (${k + 1})` });
    for (const p of d.plantations) plantations.push({ ...p, id: `${p.id}-${k}`, espaceId: `${p.espaceId}-${k}` });
  }
  return { ...d, espaces, plantations };
}

// ================= Expériences
const d = chargerExemple(2026);
const idCulture = (nom) => d.cultures.find((c) => c.nom === nom).id;
const VIVACES = new Set([idCulture("Chouchou")]);
const NOM = new Map(d.espaces.map((e) => [e.id, e.nom]));
const base = { source: 2026, cible: 2027 };
const ligne = (titre, objet) => console.log(titre.padEnd(48), JSON.stringify(objet));

console.log(`Prototype rotation — Node ${process.version} — ${d.plantations.length} plantations, ${d.espaces.length} espaces`);
console.log("\n## 1. Ferme d'exemple 2026 telle que saisie");
ligne("2026", { retours: Object.keys(Calc.retoursTropTot(d)).length, avecDefavorable: Object.keys(Calc.associationsDefavorables(d)).length, surOcc: Object.keys(Calc.surOccupations(d)).length });

console.log("\n## 2. Plan 2027 : alertes des 51 plantations de 2027");
const A = lancer(d, { ...base, identique: true });
const G = lancer(d, { ...base, fixes: VIVACES }, "glouton");
const L = lancer(d, { ...base, fixes: VIVACES }, "local");
const LA = lancer(d, { ...base, fixes: VIVACES }, "localAlertes");
const E = lancer(d, { ...base }, "glouton");
const F = lancer(d, { ...base, fixes: VIVACES, memeType: false }, "glouton");
const BL = blocs(d, { ...base, fixes: VIVACES }); const dBL = avecPlan(d, BL.etat, 2027);
const S0 = parEspaceSuggestions(d, { ...base, quotas: false });
const S1 = parEspaceSuggestions(d, { ...base, quotas: true });
ligne("A reconduction à l'identique", A.m);
ligne("B glouton par plantation (recommandé)", G.m);
ligne("C B + recherche locale (toutes)", { ...L.m, ...L.info });
ligne("D B + recherche locale (alertes seulement)", { ...LA.m, ...LA.info });
ligne("E B sans « vivace » (chouchou déplaçable)", E.m);
ligne("F B sans « abri reste abri »", F.m);
ligne("G rotation par blocs (affectation exacte)", mesurer(dBL, BL.etat, 2027));
ligne("H par espace, 1re suggestion, sans quotas", compter(S0, 2027));
ligne("I par espace, 1re suggestion, avec quotas", compter(S1, 2027));
const sansRegles = { ...d, familles: [], associations: [], rotations: [], cultures: d.cultures.map(({ groupe, ...c }) => c) };
const SR = lancer(sansRegles, { ...base, fixes: VIVACES }, "glouton");
ligne("J B sur la ferme sans aucune règle", { ...SR.m, deplacees: SR.etat.plan.filter((x) => x.p.espaceId !== x.source.espaceId).length });
ligne("  B : plantations déplacées", G.etat.plan.filter((x) => x.p.espaceId !== x.source.espaceId).length);
console.log("Blocs :", BL.affectation.map(([a, b]) => `${a} → ${b}`).join(" ; "));
const ou = (r, nom) => [...new Set(r.etat.plan.filter((x) => x.culture.nom === nom).map((x) => NOM.get(x.p.espaceId)))].join(", ");
console.log("E : chouchou sur", ou(E, "Chouchou"), "| F : tomates sur", ou(F, "Tomate"), "; tunnels :", [...new Set(F.etat.plan.filter((x) => (NOM.get(x.p.espaceId) || "").startsWith("Tunnel")).map((x) => x.culture.nom))].join(", "));

console.log("\n## 3. Volumes et chiffre d'affaires médians par culture : 2026 | 2027 B | 2027 H | 2027 I");
const c26 = parCulture(d, 2026), cB = parCulture(G.d2, 2027), cA = parCulture(A.d2, 2027), cH = parCulture(S0, 2027), cI = parCulture(S1, 2027);
for (const [nom, l] of c26) {
  const v = (m) => (m.get(nom) ? Math.round(m.get(nom).volume) : 0), c = (m) => (m.get(nom) ? Math.round(m.get(nom).ca) : 0);
  console.log(nom.padEnd(16), l.unite.padEnd(6), "volume", [v(c26), v(cB), v(cH), v(cI)].join(" | ").padEnd(28), "CA", [c(c26), c(cB), c(cH), c(cI)].join(" | "));
}
console.log("CA médian des cultures :", [caTotal(c26), caTotal(cB), caTotal(cH), caTotal(cI)].map((x) => Math.round(x)).join(" | "),
  "; tableau 2027 de A et de B identiques :", JSON.stringify(Calc.tableau(A.d2, { annee: 2027 })) === JSON.stringify(Calc.tableau(G.d2, { annee: 2027 })));

console.log("\n## 4. Temps de calcul (médiane, ms)");
const dx4 = agrandir(d, 4);
const vivX4 = VIVACES;
ligne("glouton, ferme d'exemple (51)", chronometrer(() => lancer(d, { ...base, fixes: VIVACES }, "glouton")).toFixed(0));
ligne("glouton + locale (toutes)", chronometrer(() => lancer(d, { ...base, fixes: VIVACES }, "local"), 3).toFixed(0));
ligne("glouton + locale (alertes)", chronometrer(() => lancer(d, { ...base, fixes: VIVACES }, "localAlertes"), 5).toFixed(0));
ligne("blocs (exact)", chronometrer(() => blocs(d, { ...base, fixes: VIVACES }), 3).toFixed(0));
ligne("par espace avec Calc.suggestions", chronometrer(() => parEspaceSuggestions(d, { ...base, quotas: true }), 3).toFixed(0));
ligne("contrôle Calc (retours, défav., sur-occ.)", chronometrer(() => { Calc.retoursTropTot(G.d2); Calc.associationsDefavorables(G.d2); Calc.surOccupations(G.d2); }).toFixed(0));
ligne(`glouton, ferme ×4 (${dx4.plantations.length} plantations, ${dx4.espaces.length} espaces)`, chronometrer(() => lancer(dx4, { ...base, fixes: vivX4 }, "glouton"), 3).toFixed(0));
ligne("  et ses alertes", lancer(dx4, { ...base, fixes: vivX4 }, "glouton").m);

console.log("\n## 5. Retour arrière (séparation et évaluation sur retours trop tôt, puis défavorables)");
const tunnels = new Set(d.espaces.filter((e) => e.type === "abri").map((e) => e.id));
const etT = preparer(d, { ...base, fixes: VIVACES, garder: (p) => tunnels.has(p.espaceId) });
const bbT = retourArriere(etT, 60000);
const etTg = preparer(d, { ...base, fixes: VIVACES, garder: (p) => tunnels.has(p.espaceId) }); glouton(etTg);
let cg = ZERO; for (const eid of etTg.ctx.espaces.keys()) cg = plus(cg, etTg.coutEspace(eid));
ligne(`tunnels seuls (${etT.plan.length} plantations)`, { exact: bbT.meilleur.cout.slice(0, 2), complet: bbT.complet, noeuds: bbT.noeuds, ms: Math.round(bbT.ms), glouton: cg.slice(0, 2) });
const bbF = retourArriere(preparer(d, { ...base, fixes: VIVACES }), 5000);
ligne("ferme entière, budget 5 s", { meilleur: bbF.meilleur && bbF.meilleur.cout.slice(0, 2), complet: bbF.complet, noeuds: bbF.noeuds });

console.log("\n## 6. Bilan de place par famille au 1er janvier (m²) : 2027, puis 2028 après le plan B");
for (const l of bilanFamilles(d, G.etat, 2027)) ligne("2027", l);
const G28 = lancer(G.d2, { source: 2027, cible: 2028, fixes: VIVACES }, "glouton");
for (const l of bilanFamilles(G.d2, G28.etat, 2028)) ligne("2028", l);

console.log("\n## 7. Années suivantes, chaque plan bâti sur le précédent");
const A28 = lancer(A.d2, { source: 2027, cible: 2028, identique: true });
const LA28 = lancer(G.d2, { source: 2027, cible: 2028, fixes: VIVACES }, "localAlertes");
const G29 = lancer(G28.d2, { source: 2028, cible: 2029, fixes: VIVACES }, "glouton");
const A29 = lancer(A28.d2, { source: 2028, cible: 2029, identique: true });
const parCultureRetours = (r, cible) => { const rt = Calc.retoursTropTot(r.d2); const o = {}; for (const x of r.etat.plan) if (rt[x.p.id]) o[x.culture.nom] = (o[x.culture.nom] || 0) + 1; return o; };
ligne("2028 reconduction à l'identique", A28.m);
ligne("2028 glouton", { ...G28.m, ms: Math.round(G28.ms), parCulture: parCultureRetours(G28) });
ligne("2028 glouton + locale (alertes)", { ...LA28.m, ...LA28.info });
const bb28 = retourArriere(preparer(G.d2, { source: 2027, cible: 2028, fixes: VIVACES }), 20000);
ligne("2028 retour arrière, budget 20 s", { meilleur: bb28.meilleur && bb28.meilleur.cout.slice(0, 2), complet: bb28.complet, noeuds: bb28.noeuds });
ligne("2029 reconduction à l'identique", A29.m);
ligne("2029 glouton", { ...G29.m, parCulture: parCultureRetours(G29) });
for (const l of bilanFamilles(G28.d2, G29.etat, 2029).filter((x) => x.famille === "Brassicacées")) ligne("2029 bilan", l);

console.log("\n## 8. Plan 2027 proposé (B), plantation par plantation");
const mois = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const jour = (date) => `${Number(date.slice(8))} ${mois[Number(date.slice(5, 7)) - 1]}`;
const texte = (z) => ({ trop_tot: `retour trop tôt (${z.famille}, ${z.delai} ans)`, precedent_favorable: `bon précédent : ${z.culture}`, precedent_defavorable: `mauvais précédent : ${z.culture}`,
  voisin_favorable: `bon voisin : ${z.culture}`, voisin_defavorable: `voisin gênant : ${z.culture}`, groupe_suivant: `suit ${z.apres} dans la rotation` })[z.code];
const resume = (liste) => { const n = new Map(); for (const z of liste) { const t = texte(z); n.set(t, (n.get(t) || 0) + 1); } return [...n].map(([t, k]) => (k > 1 ? `${t} (×${k})` : t)).join(" ; ") || "aucune règle"; };
for (const x of G.etat.plan) {
  const avant = x.ici ? resume(x.ici.filter((z) => z.code === "trop_tot" || z.code.endsWith("defavorable"))) : "plus de place";
  console.log(`${jour(x.p.date).padEnd(9)} ${x.culture.nom.padEnd(15)} ${String(x.p.surface).padStart(3)} m²  ${NOM.get(x.source.espaceId).padEnd(19)} → ${(NOM.get(x.p.espaceId) || "non placée").padEnd(19)} ici : ${resume(x.raisons)}  |  à sa place de 2026 : ${avant}`);
}
