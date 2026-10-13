# SPEC — Présentation, tranche P2 « Une application agréable, des données présentées clairement »

Liens : `docs/specs/P1/SPEC.md`, `docs/specs/N2/SPEC.md`, `docs/specs/S3/SPEC.md`, `docs/adr/ADR-004.md`
Statut : **rédigée par l'agent** le 13/10/2026 après le refus de la présentation P1 par GDS-42 (EX-17 non validée). Lecture seule pour l'agent une fois la tranche commencée. La validation visuelle revient à l'humain (EX-38).

## Pourquoi cette tranche

GDS-42 a essayé l'outil en ligne et a refusé la présentation de P1, captures à l'appui :

- « c'est très moche et pas pratique » : huit formulaires toujours ouverts, empilés dans une colonne étroite ; un grand cadre blanc vide quand la ferme est vide ; le chiffre d'affaires coupé en haut à droite ;
- « Même les tableaux, quand je charge les données […], sont illisibles, il n'y a aucun travail de présentation des données » : quatre lignes de doubles nombres par point de vente, libellés coupés, rien ne montre ce qui rapporte ni ce qui coûte ;
- « L'application doit être agréable, des données correctement présentées, clairement. »

La cause est en partie dans la spec P1 elle-même (EX-12 : « sans cacher aucun champ de saisie derrière un clic »). P2 la remplace.

## Objectif

Le maraîcher ouvre une application claire : une page par sujet, des listes lisibles, un formulaire qui s'ouvre quand il en a besoin, et une synthèse qui montre d'un coup d'œil ce que la saison peut rapporter, ce qu'elle coûte et quand.

## Hors périmètre

Nouveaux objets ou nouveaux calculs (le modèle de données et `src/calc.js` ne changent pas, sauf ajout d'une fonction de calcul pure demandée par une vue), impression, traduction, synchronisation.

## Contraintes

- Un seul fichier HTML livré, sans ressource réseau (ADR-004) : polices du système, icônes dessinées en SVG dans le fichier.
- Logique de calcul dans `src/calc.js`, rendu dans `src/index.html` et `src/ui-*.js` ; textes dans `src/i18n.js`.
- Toute estimation reste visible en fourchette basse / médiane / haute : une vue peut mettre la médiane en avant, jamais cacher la fourchette.
- **Tests de bout en bout existants** (N1, N2, S3) : leurs assertions de calcul et de comportement ne changent pas. Seules changent les étapes qui mènent à l'écran (aller sur la page, ouvrir le tiroir), par les aides de `test/outils.js`, et les sélecteurs de mise en page que P2 remplace. Les tests de mise en page de P1 (T12, T13, T16 de `test/presentation.e2e.js`) sont remplacés par ceux de P2. Décision prise avec le refus de P1 par l'humain ; elle est consignée dans `PROGRESS.md`.

## Exigences

| ID | Exigence | Vérification |
| --- | --- | --- |
| EX-30 | QUAND l'utilisateur ouvre l'outil, LE SYSTÈME DOIT présenter une navigation qui mène en un clic à chaque page (Synthèse, Espaces, Cultures, Plantations, Ventes, Poules, Sauvegarde), avec le nombre d'éléments actifs de chacune, et n'afficher qu'une page à la fois | Test de bout en bout |
| EX-31 | QUAND l'utilisateur choisit « Ajouter » ou « Modifier », LE SYSTÈME DOIT ouvrir le formulaire dans un tiroir titré, signaler l'élément modifié dans sa liste, et refermer le tiroir à l'enregistrement, à l'annulation ou à la touche Échap ; une erreur de saisie laisse le tiroir ouvert avec son message | Test de bout en bout |
| EX-32 | LE SYSTÈME DOIT afficher en permanence, en tête de l'outil, le chiffre d'affaires et la marge estimés de la saison en fourchette, entièrement lisibles de 360 à 1920 px de large, et les recalculer à chaque modification (étend EX-14) | Test de bout en bout |
| EX-33 | QUAND la ferme a une production, LA PAGE SYNTHÈSE DOIT montrer les chiffres clés de la saison (chiffre d'affaires, coûts, marge ; œufs s'il y a des poules) en fourchette, et un graphique mois par mois du chiffre d'affaires et de la marge où la fourchette se voit | Test de bout en bout |
| EX-34 | LES TABLEAUX DOIVENT montrer une ligne par culture, produit ou point de vente et une mesure à la fois, au choix de l'utilisateur ; la médiane en évidence et la fourchette dessous ; l'unité dans l'en-tête plutôt que dans chaque case ; des noms de mois et de lignes qui restent visibles au défilement (EX-13) | Test de bout en bout |
| EX-35 | QUAND la ferme a des plantations, LA PAGE PLANTATIONS DOIT montrer un calendrier de culture : une ligne par espace, une barre par plantation de la mise en place à la fin de la récolte, la récolte distinguée, la sur-occupation signalée | Test de bout en bout |
| EX-36 | QUAND une liste ou une vue n'a rien à montrer, LE SYSTÈME DOIT dire ce qu'elle contiendra et proposer le geste suivant ; une ferme sans plantation ouvre sur les étapes à suivre et, si elle est vide, sur la ferme d'exemple | Test de bout en bout |
| EX-37 | LE SYSTÈME DOIT rester lisible : aucun défilement horizontal de la page de 360 à 1920 px de large, texte courant d'au moins 14 px et mentions secondaires d'au moins 12 px, contraste du texte d'au moins 4,5:1 sur son fond, contour visible autour de l'élément qui a le focus clavier (reprend EX-16) | Test de bout en bout (styles calculés) |
| EX-38 | QUAND la tranche est vérifiée, L'HUMAIN DOIT valider la présentation sur captures d'écran à 1366 × 768, 1920 × 1080 et 390 × 844, ferme d'exemple chargée | Validation humaine |

Exigences de P1 remplacées : EX-11 (deux volets) et EX-12 (aucun champ derrière un clic) par EX-30 et EX-31 ; EX-15 par EX-31. EX-13 et EX-14 sont reprises par EX-34 et EX-32, EX-16 par EX-37.

## Pages

| Page | Contenu |
| --- | --- |
| Synthèse | Accueil guidé tant qu'il n'y a pas de plantation (EX-36) ; chiffres clés ; graphique mensuel ; vues « Par culture », « Offre et demande », « Points de vente » |
| Espaces | Liste des espaces : surface, type, sur-occupation |
| Cultures | Liste des cultures (rendement, prix, récolte, pertes) et des variétés (ce qui diffère de la culture) |
| Plantations | Calendrier de culture (EX-35) et liste des plantations |
| Ventes | Points de vente, séances, débouchés |
| Poules | Lots de poules : dates, ponte, aliment, œufs par semaine |
| Sauvegarde | Export, import, rappel |

## Scénarios

- **P2-S1** — Ferme vide : la synthèse montre les trois étapes et la ferme d'exemple ; « Ajouter un espace » ouvre le tiroir de la page Espaces ; l'espace enregistré apparaît dans la liste et dans le compte de la navigation.
- **P2-S2** — Ferme d'exemple, page Plantations : « Modifier » sur la courgette ouvre le tiroir « Modifier la plantation » ; la ligne est signalée ; surface 15 m² enregistrée : le tiroir se ferme, la ligne affiche 15 m², le chiffre d'affaires en tête baisse.
- **P2-S3** — Ferme d'exemple, synthèse : chiffres clés et graphique présents ; le tableau « Par culture » montre une ligne par culture ; passer de « Chiffre d'affaires » à « Volume » change la mesure affichée sans changer les valeurs exactes.

## Vérification de bout en bout

`./verify.sh P2` lance toute la suite (unitaires puis Playwright sur `dist/index.html`). Attendu : code de sortie 0. Puis l'évaluateur relit la conformité à la spec, puis l'humain valide les captures (EX-38).
