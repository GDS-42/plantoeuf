# RUNBOOK — Tranche P2

Spec : `SPEC.md` (lecture seule) · Tâches : `features.json` · Journal : `PROGRESS.md` à la racine.

**Seuil d'alerte : 10 sessions agent pour les six tâches.** Atteint, l'agent s'arrête et rend compte ; l'humain décide.

## But et résultat observable

La ferme d'exemple s'ouvre sur une application à pages : synthèse lisible (chiffres clés, graphique, tableaux à une mesure), listes claires, formulaires en tiroir, calendrier de culture. `./verify.sh P2` → code de sortie 0, puis l'humain valide les captures.

## Orientation

- Coquille et système visuel dans `src/index.html` (jetons de couleur en tête du `<style>`, thème sombre compris) ; navigation dans `src/ui-navigation.js` ; tiroirs dans `src/ui-saisie.js`.
- Contrat avec les tests : identifiants des champs et des boutons inchangés (`#espace-nom`, `#plantation-ajouter`…), listes `#liste-<objet> li[data-id]` avec `[data-action="modifier"|"supprimer"]`, tableaux `#tableau`, `#matrice`, `#points` avec leurs attributs `data-*` et `.basse/.mediane/.haute[data-valeur]`. Pages `#page-<nom>`, liens `#navigation a[data-page]`, boutons `[data-ouvrir="<objet>"]`, tiroirs `#tiroir-<objet>`.
- Aides de test : `aller(page, nom)`, `ouvrir(page, objet)`, `modifier(page, objet, texte)` dans `test/outils.js`.
- T34, T35 et T36 touchent des zones séparées et peuvent avancer en parallèle (`parallelisme_max: 3`), chacune dans sa copie de travail ; l'orchestrateur fusionne.
- Dans le conteneur cloud : `PLAYWRIGHT_BROWSERS_PATH` vers l'alias local du Chromium installé (voir le runbook de N1, Surprises).

## Tranches

| ID | Exig. | Tâche | Fini quand | Dépend de |
| --- | --- | --- | --- | --- |
| T33 | EX-30, 31, 32, 36 | Socle : coquille, navigation, tiroirs, accueil, aides de test | `./verify.sh T33` → exit 0 | — |
| T34 | EX-33, 34 | Synthèse : chiffres clés, graphique, tableau « Par culture » | `./verify.sh T34` → exit 0 | T33 |
| T35 | EX-34, 36 | Ventes : offre et demande, points de vente, listes | `./verify.sh T35` → exit 0 | T33 |
| T36 | EX-35, 36 | Ferme : lignes des listes, calendrier de culture, sauvegarde | `./verify.sh T36` → exit 0 | T33 |
| T37 | toutes | Vérification de la tranche, puis évaluateur séparé | `./verify.sh P2` → exit 0 ; rapport sans écart | T34, T35, T36 |
| T38 | EX-38 | Captures validées par l'humain | validation humaine | T37 |

## ✎ Surprises

## ✎ Décisions

- 13/10/2026 — Les étapes de navigation des tests de bout en bout existants changent (aller sur la page, ouvrir le tiroir) ; leurs assertions restent. Motif : refus de la présentation P1 par l'humain, qui demande une application agréable et des données présentées clairement.
