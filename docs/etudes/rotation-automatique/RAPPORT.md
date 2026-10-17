# Étude de faisabilité : « créer la rotation d'un clic »

Étude du 17/10/2026, projet plantoeuf, tranche R4 terminée. Aucun fichier du dépôt n'a été modifié.

Demande de l'utilisateur, mot pour mot : « étudier la possibilité de créer automatiquement la rotation via un simple bouton avec les données préexistantes de l'utilisateur pour ses plantations, rotations qui respecte les contraintes ».

> **Où sont les fichiers.** Dans ce dossier : ce rapport, les résultats bruts (`resultats.txt`, annexe A) et le prototype (`prototype-rotation.js`). Pour relancer le prototype depuis la racine du dépôt : `node docs/etudes/rotation-automatique/prototype-rotation.js` (Node 22, aucune dépendance).

## En bref

- **C'est faisable**, à condition de bien délimiter ce que fait le bouton. Il **reprend les plantations de l'année en cours dans l'année suivante, aux mêmes dates et sur les mêmes surfaces, et choisit l'espace de chacune** pour respecter au mieux les règles saisies. Il ne choisit ni les cultures, ni les dates, ni les surfaces.
- **Prototype sur la ferme d'exemple, pour 2027.** Si l'on refait 2026 à l'identique, on obtient 36 retours trop tôt ; avec le plan proposé, **5**. Le plan ne crée aucune sur-occupation. **Volumes et chiffre d'affaires sont identiques** (30 526 € de chiffre d'affaires médian pour les cultures, 0 € d'écart par culture). Le calcul prend **60 à 100 ms**.
- **Les 5 retours trop tôt et les 9 mauvais précédents restants sont inévitables avec les règles saisies.** Une recherche exhaustive le confirme pour les tunnels. En 2026, chaque tunnel a déjà reçu 240 m² de Solanacées pour 200 m² de surface, et la tomate doit rester sous abri. Le chouchou reste sur sa treille.
- **Les règles de l'exemple ne tiennent pas dans la durée.** En 2029, les Brassicacées (brèdes et choux) demandent 1 440 m², et aucune de leurs plantations ne trouve plus de place dans son délai de 4 ans : il y a 28 retours trop tôt. L'outil doit le dire, par un bilan de place par famille, et non le cacher.
- **Ce que la demande change à la règle.** Le BRIEF interdit la « rotation automatique ». R4 l'a confirmé : « l'outil ne crée, ne déplace, ne modifie ni ne refuse jamais une plantation de lui-même ». Proposition : l'outil calcule un **brouillon** et n'enregistre que ce que le maraîcher accepte d'un geste. Il ne touche jamais une plantation existante. Lever cette règle, même en partie, est une décision de l'humain.
- **Données manquantes pour un plan juste** : « sous abri : obligatoire, possible ou jamais » et « vivace » sur la culture. La fenêtre de saison ne serait nécessaire que pour déplacer des dates, ce que la variante recommandée ne fait pas. Le temps de travail ne change pas, puisque les dates et les surfaces restent celles de l'an passé.
- **Taille** : une tranche de 7 tâches, comparable à R4. Seuil d'alerte proposé : 10 à 11 sessions.

## 0. Ce que la demande change à la règle « l'outil ne décide pas »

Le BRIEF range la « rotation automatique » dans les no-go du noyau. R4 l'a maintenue par une dérogation écrite (`docs/specs/R4/SPEC.md`) : « le système ne crée, ne déplace, ne modifie ni ne refuse jamais une plantation de lui-même ; ses suggestions sont des aides ». La demande vise précisément une rotation automatique. Trois lectures sont possibles :

| Lecture | Ce que fait l'outil | Compatible avec la règle actuelle ? | Avis |
| --- | --- | --- | --- |
| a) Stricte | Il calcule et montre le plan de l'année suivante (un « Que planter ici ? » pour toute l'année). Le maraîcher ressaisit chaque plantation à la main | Oui, telle qu'elle est | On perd le « simple bouton » : 51 plantations à ressaisir |
| **b) Brouillon accepté par l'utilisateur** | Il calcule un brouillon que rien n'enregistre. Un geste explicite (tout le plan, une culture ou une ligne) crée les plantations acceptées. Les plantations existantes ne sont jamais modifiées, déplacées ni supprimées, et rien n'est refusé | Non, il faut une nouvelle dérogation : la machine choisit les places, l'humain les accepte | **Recommandée** |
| c) Automatique | L'année suivante est écrite sans relecture | Non | À écarter : elle contredit l'esprit du BRIEF, et les règles de l'exemple ne sont pas validées localement (DONNEES § 14 : « aucune source réunionnaise ne chiffre un délai de retour ») |

Texte de dérogation proposé, à écrire par l'humain s'il l'accepte : « L'outil peut calculer une proposition de plan pour l'année suivante. Il n'enregistre que ce que l'utilisateur accepte, d'un geste explicite ; il ne crée rien de lui-même, ne modifie, ne déplace ni ne supprime jamais une plantation existante, et ne refuse rien. »

Deux franchises s'imposent :
- Un plan « qui respecte les contraintes » respecte **les règles saisies**, pas une vérité agronomique. Les délais de l'exemple viennent de sources non réunionnaises, certaines jugées « sans doute sévères ». L'écran doit dire « selon vos règles ».
- Même en 2027, **toutes les règles de l'exemple ne peuvent pas être tenues** : la tomate sous abri n'a aucune place permise. Le bouton doit donc savoir dire ce qu'il ne peut pas respecter, et pourquoi.

## 1. Que signifierait « créer la rotation d'un clic » ?

| Variante | Ce que l'outil choisit | Données nécessaires | Effet sur l'économie (prototype, 2027) | Avis |
| --- | --- | --- | --- | --- |
| **V1 Reprendre et replacer** | L'espace de chaque plantation de l'an passé, reprise aux mêmes date, surface et variété | Celles d'aujourd'hui ; « abri » et « vivace » conseillés | **Aucun**, par construction : le tableau ne dépend pas de l'espace. 30 526 € médian, comme en 2026 | **Recommandée** |
| V2 Rotation par blocs | Le programme entier d'un espace (toutes ses plantations) passe sur un autre espace | Les mêmes | Aucun | Très lisible et exacte (69 ms), mais elle ne sait pas couper une série trop grande pour un espace : 13 retours trop tôt au lieu de 5. À garder comme départage possible (garder les séries ensemble) |
| V3 Remplir les créneaux avec « Que planter ici ? » | Chaque espace garde son calendrier de l'an passé ; la culture change | Les mêmes | **−48 %** : 15 974 € au lieu de 30 526 €. Plus d'ail, de chou, de chouchou, de haricot ni de courgette. Avec des quotas par culture : encore −48 %, et le chouchou tombe de 1 200 à 96 kg | À écarter : elle répond à « quoi planter ici ? », pas à « où va chaque culture ? » |
| V4 Bâtir le plan depuis la demande | Quelles cultures, combien et quand, pour couvrir les points de vente | Fenêtres de saison, rendements selon la saison, temps de travail, engrais verts | Imprévisible | Autre produit (planification de production) ; c'est le piège « sur-modélisation agronomique » du BRIEF |
| V5 Décaler des dates de quelques semaines | Une date, dans une fenêtre permise, pour lever un conflit | Fenêtre de mise en place par culture | Faible si la fenêtre est respectée | Utile plus tard, après V1 |
| Plusieurs années d'avance | Le calcul V1 répété année après année | Les mêmes | Aucun | Utile comme **bilan** (§ 4.5), pas comme plan à accepter |

**Recommandation : V1**, accompagnée d'un **bilan de place par famille** qui dit, avant tout détail, ce que les règles permettent ou non. V5 pourrait venir dans une tranche suivante, si les fenêtres de saison sont saisies.

## 2. Les contraintes

### 2.1 Ce que la proposition ne viole jamais

| Contrainte | Dans l'outil aujourd'hui ? |
| --- | --- |
| Pas de sur-occupation d'un espace, à aucune date (EX-06) | Oui : `Calc.surOccupations`. Le prototype vérifie la place de chaque essai avec la même règle (de la mise en place à la fin de récolte, `Calc.datesRecolte`) |
| Même variété, même jour et même mois, même surface que l'an passé | Par construction (V1) |
| Une plantation sous abri reste sous abri, une de plein champ reste en plein champ | **En partie.** L'espace a un type (`abri`, `plein_champ`), mais la culture ne dit pas si elle exige un abri. Le prototype garde « le même type d'espace que l'an passé ». Sans cette contrainte (variante F), les quatre tomates partent en plein champ et la brède entre dans les tunnels : un seul retour trop tôt, mais un plan contraire au dossier de données (§ 5 : à La Réunion, la tomate passe sous abri) |
| Les cultures vivaces et les plantations épinglées restent en place | **Non.** Sans cette contrainte (variante E), le chouchou quitte sa treille pour la Parcelle 1 |
| Les plantations déjà saisies dans l'année cible restent telles quelles et comptent pour la place et pour les règles | Oui : le prototype les traite comme toute plantation existante. Reste à décider comment éviter les doublons avec la reprise |

### 2.2 Ce que la proposition cherche à respecter, dans cet ordre, sans poids chiffré

C'est l'ordre de « Que planter ici ? » (R4), pour que le plan et cet écran parlent la même langue :
1. pas de **retour trop tôt** (règle à la surface : `Calc.precedents(...).tropTot`, `Calc.retoursTropTot`) ;
2. ni **précédent** ni **voisin défavorable** (`Calc.precedents`, `Calc.voisins`, `Calc.associationsDefavorables`) ;
3. le plus de **raisons favorables**. Écart proposé par rapport à R4 : on les compte **par culture**, pas par plantation. Sinon, quinze salades voisines du piment comptent quinze fois, et les séries s'entassent autour d'une seule culture ;
4. le **groupe suit** celui de la dernière culture de l'espace dans une rotation (règle de `Calc.suggestions`) ;
5. à égalité, **rester à sa place de l'an passé**, puis l'ordre alphabétique des espaces. Sans ce départage, une ferme sans aucune règle verrait 27 de ses 51 plantations changer d'espace sans raison. Avec lui, aucune ne bouge (variante J). C'est l'équivalent, pour le plan, de l'invariant `sans_regle_comme_r3`.

Quand une règle ne peut pas être tenue, la plantation garde sa meilleure place, avec son alerte. Elle n'est jamais retirée, raccourcie ni réduite.

### 2.3 Ce que `calc.js` sait déjà faire, et ce qu'il faudrait ajouter

- **Déjà là, réutilisé tel quel** : `familleDe`, `retoursTropTot` (et son verdict par plantation), `precedents` et `voisins` (qui acceptent une plantation en cours de saisie, donc un essai), `associationsDefavorables`, `surfaceLibre`, `surOccupations`, `datesRecolte`, `parametres`, `tableau`, `offreDemande`, `bornesDeLAnnee`.
- **À ajouter, sans DOM** :
  - `raisonsPour(donnees, essai)`, extrait de `suggestions` sans changer son comportement, pour que le plan et « Que planter ici ? » donnent exactement les mêmes raisons. Attention : `suggestions` essaie la première variété (par ordre alphabétique) de chaque culture. Le plan, lui, doit utiliser la vraie variété de la plantation : Goldorac se récolte 3 semaines, et non 2 comme sa culture.
  - `planAnneeSuivante(donnees, { source, cible, options })` : reprise, placement, raisons, alternatives.
  - `bilanPlaceParFamille(donnees, plan)` : surface demandée et surface encore permise, par famille et par type d'espace.
  - Un évaluateur plus rapide, avec un test d'équivalence contre `precedents` et `voisins` : familles calculées une fois par culture, plantations triées par espace (§ 3, temps).

### 2.4 Les données qui manquent

| Donnée | Pourquoi | Nécessaire pour V1 ? | Forme proposée |
| --- | --- | --- | --- |
| **Sous abri** (culture) : obligatoire, possible, jamais | Sans elle, la tomate part en plein champ (variante F) | **Oui**, ou l'on garde l'approximation « même type d'espace que l'an passé », moins juste | Champ facultatif `abri` sur la culture (vocabulaire seulement ; les valeurs de l'exemple sont sourcées au § 5 de DONNEES) |
| **Vivace / reste en place** (culture) | Sans elle, le chouchou quitte sa treille (variante E) | **Oui** | Champ `vivace` (oui ou non). Question liée : le délai de retour doit-il ignorer une vivace sur son propre espace (DONNEES § 14.6 : « le délai ne joue qu'après son arrachage ») ? Aujourd'hui, le chouchou de 2027 est signalé « retour trop tôt » sur sa propre treille |
| Fenêtre de mise en place (culture, éventuellement selon l'abri) | Savoir quand une culture peut être semée ou plantée | Non : V1 garde les dates. **Oui** pour V4 et V5 | `moisMiseEnPlace` : liste de mois |
| Objectif : garder volumes et chiffre d'affaires, couvrir la demande | Juger un plan | Non : V1 les garde à l'identique par construction. Mieux couvrir les semaines « manque » de l'offre et de la demande obligerait à changer surfaces et dates (V4) | — |
| Temps de travail | Charge des semaines | Non : mêmes dates et mêmes surfaces, donc même calendrier de travail. Seuls les déplacements entre espaces changent, et ils ne sont pas modélisés. Le champ « heures de travail par m² », prévu en N1, n'a jamais été ajouté | — |
| Engrais verts | Le groupe `engrais_vert` existe, mais il n'y a pas de culture « non vendue » | Non : un engrais vert saisi comme plantation (culture sans prix) est repris comme les autres. **En proposer de nouveaux** dans les creux reviendrait à créer des plantations absentes de l'an passé | Plus tard, sur décision |
| Séances de l'année suivante | Les séances sont datées : celles de l'exemple s'arrêtent au 31/12/2026. Sans séance en 2027, la synthèse de 2027 montrerait 0 € pour toute culture qui a un débouché | À décider : le prototype les reprend aux bornes de 2027 pour comparer | Case « reprendre aussi les jours de marché » |
| Règle des cycles courts (une règle, pas une donnée) | La règle à la surface compte chaque cycle de brède de 3 semaines comme un retour qui bloque 80 m² pendant 4 ans. C'est elle qui rend le plan impossible dès 2029 (§ 4.5). DONNEES § 14.6 cite déjà la règle suisse sur les cultures courtes | Non, mais elle décide de l'utilité du bouton à partir de la troisième année | Décision de l'humain |

## 3. La méthode de calcul

Mesures sur la ferme d'exemple (51 plantations, 9 espaces), pour 2027, avec Node 22. Les temps varient d'une exécution à l'autre ; on donne la fourchette observée.

| Méthode | Ce qu'elle fait | Qualité | Explicabilité | Temps | Tests |
| --- | --- | --- | --- | --- | --- |
| Glouton par espace guidé par `Calc.suggestions` (V3) | Chaque créneau de l'an passé (espace, date, surface) prend la première culture proposée | Aucune alerte sans quotas, mais **−48 % de chiffre d'affaires** ; avec quotas, 6 retours trop tôt et toujours −48 % | Excellente : c'est l'écran actuel | ≈ 100 ms | Simples |
| **Glouton par plantation (recommandé)** | Dans l'ordre des dates, chaque plantation prend la place libre la mieux classée selon les clés de « Que planter ici ? » | **36 → 5 retours trop tôt** ; 9 précédents défavorables, soit le minimum prouvé pour les tunnels ; 0 sur-occupation ; chiffre d'affaires identique | **Très bonne** : chaque ligne dit ses raisons à sa nouvelle place, ce qu'elle aurait eu à sa place de l'an passé, et pourquoi pas ailleurs (« plus de place », ou moins bien classé) | **60 à 100 ms** ; 0,66 à 0,74 s pour une ferme 4 fois plus grande (204 plantations, 36 espaces) | Simples et déterministes, une fois l'ordre stable fixé (voir plus bas) |
| Rotation par blocs (V2) | Affectation exacte des 9 programmes d'espace | 13 retours trop tôt | Très bonne (« le programme de la Parcelle 2 passe sur la Parcelle 5 ») | ≈ 70 ms | Simples |
| Retour arrière (séparation et évaluation, sur retours puis défavorables) | Essaie les combinaisons et écarte celles qui ne peuvent pas battre la meilleure déjà trouvée | Exact sur les tunnels (9 plantations, 139 nœuds, 19 ms) : **même résultat que le glouton**. Sur toute la ferme : inachevé en 5 s (≈ 33 000 nœuds) ; pour 2028, inachevé en 20 s (≈ 76 000 nœuds), sans rien trouver de mieux | Faible pour un choix isolé (« c'est le meilleur ensemble ») | Imprévisible, exponentiel | Difficiles. **À garder comme oracle de test** sur de petites fermes |
| Recherche locale (déplacer une plantation si le total s'améliore) | Après le glouton | Sur toutes les plantations : une raison favorable de plus en 2027, pour **1,4 à 2,4 s**. Sur les seules plantations en alerte : rien gagné en 2027 (90 ms), 1 retour de moins en 2028 (14 → 13) | Moyenne : un déplacement se justifie par un total, pas par la plantation elle-même | 0,09 à 2,4 s | Moyens |

**Recommandation : le glouton par plantation**, sans poids chiffré. Ordre des plantations : la date, puis la plus grande surface, puis le nom de la culture et celui de l'espace d'origine. Sinon, l'identifiant (un UUID tiré au hasard) départage les plantations du même jour, et la proposition change d'un chargement à l'autre : le prototype l'a constaté avant correction. En option, si le budget de temps le permet, on peut ajouter une passe de recherche locale limitée aux plantations en alerte.

Le temps reste à surveiller. Le calcul croît à peu près comme (plantations × espaces × plantations par espace). L'exigence de N1 (« une ferme de 200 plantations se recalcule en moins d'une seconde ») est tenue de justesse sous Node et ne l'est sans doute pas sous Firefox, plus lent. Il faut un évaluateur dédié (§ 2.3) et un test de budget à 200 plantations.

Exemples d'explications tirées du prototype (texte provisoire, qui irait dans `i18n.js`) :
- « Salade batavia du 5 janvier, 40 m² : Parcelle 1 → Parcelle 5. Ici : bon voisin, piment ; suit le piment dans la rotation. À sa place de 2026 : retour trop tôt des Astéracées (3 ans). »
- « Carotte du 15 mars, 100 m² : Parcelle 4 → Parcelle 1. Ici : bon précédent, salade batavia ; suit la salade dans la rotation. »
- « Ail péi du 25 avril, 300 m² : Parcelle haute → Parcelle 5. Ici : bon voisin, chou pommé. À sa place de 2026 : retour trop tôt des Amaryllidacées (5 ans). »
- « Tomate du 10 janvier, 120 m² : reste au Tunnel 1. Retour trop tôt des Solanacées (4 ans) et mauvais précédents (concombre, courgette) : aucune place sous abri ne l'évite. »

## 4. Le prototype et ses chiffres

### 4.1 Comment on a mesuré

- La ferme d'exemple est chargée dans un stockage en mémoire, comme dans `test/exemple-r4.test.js` (`Store.ouvrir`, `Exemple.charger(ferme, 2026)`), puis les 51 plantations de 2026 sont reprises en 2027 aux mêmes jour et mois, surface et variété.
- Les séances de 2026 sont reprises aux bornes de 2027 (`Calc.bornesDeLAnnee`), sinon aucun débouché ne vendrait en 2027.
- Options : le chouchou reste sur sa treille (il simule le champ `vivace`) ; abri reste abri (il simule le champ `abri`).
- Les alertes comptées sont celles des **plantations de 2027** : `Calc.retoursTropTot`, `Calc.associationsDefavorables` et `Calc.surOccupations` sur la ferme complétée. Les volumes et le chiffre d'affaires viennent de `Calc.tableau(…, { annee })`. Les plantations de 2026 gardent leurs propres alertes.

### 4.2 Alertes avant et après (plantations de 2027)

| | Retours trop tôt | Précédents défavorables | Voisins défavorables | Sur-occupations | Avec au moins une raison favorable | Groupe qui suit | Couples culture-espace |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026 tel que saisi (rappel, 51 plantations de 2026) | 10 | 4 (précédents) | 0 | 0 | — | — | 15 |
| **A** 2027, reprise à l'identique | **36** | **9** | 0 | 0 | 1 | 0 | 15 |
| **B** 2027, **plan proposé** (glouton) | **5** | **9** | 0 | 0 | 22 | 12 | 20 |
| C B + recherche locale (toutes) | 5 | 9 | 0 | 0 | 23 | 12 | 20 |
| D B + recherche locale (alertes seulement) | 5 | 9 | 0 | 0 | 22 | 12 | 20 |
| E B, chouchou déplaçable | 4 (chouchou sur la Parcelle 1) | 9 | 0 | 0 | 22 | 13 | 21 |
| F B, sans « abri reste abri » | 1 (tomates en plein champ, brède sous tunnel) | 0 | 0 | 0 | 32 | 19 | 22 |
| G Rotation par blocs (exacte) | 13 | 9 | 0 | 0 | 5 | 8 | 15 |
| H Par espace, 1re suggestion, sans quotas | 0 | 0 | 0 | 0 | — | — | — |
| I Par espace, 1re suggestion, avec quotas | 6 | 0 | 0 | 0 | — | — | — |
| J B sur la ferme sans aucune règle | 0 | 0 | 0 | 0 | 0 | 0 | 15 (**aucune plantation déplacée**) |

Le plan B déplace 39 plantations sur 51. Les 5 retours trop tôt qui restent sont les 4 tomates des tunnels et le chouchou ; les 9 précédents défavorables, les 9 plantations de tunnel. La recherche exhaustive sur les tunnels donne exactement ces nombres : c'est le minimum avec ces règles et ces deux contraintes.

### 4.3 Volumes et chiffre d'affaires médians par culture

| Culture | Volume 2026 | Volume 2027, plan B | CA 2026 (€) | CA 2027, plan B (€) | CA 2027, V3 sans quotas (€) | CA 2027, V3 avec quotas (€) |
| --- | --- | --- | --- | --- | --- | --- |
| Ail péi (kg) | 144 | 144 | 2 880 | 2 880 | 0 | 144 |
| Brède petsaï (botte) | 2 700 | 2 700 | 3 300 | 3 300 | 840 | 1 740 |
| Carotte (kg) | 608 | 608 | 1 514 | 1 514 | 4 182 | 780 |
| Chou pommé (pièce) | 518 | 518 | 948 | 948 | 0 | 556 |
| Chouchou (kg) | 1 200 | 1 200 | 1 800 | 1 800 | 0 | 144 |
| Concombre (pièce) | 666 | 666 | 779 | 779 | 260 | 519 |
| Courgette (kg) | 352 | 352 | 704 | 704 | 0 | 635 |
| Haricot vert (kg) | 198 | 198 | 993 | 993 | 0 | 782 |
| Piment (kg) | 27 | 27 | 448 | 448 | 510 | 501 |
| Salade batavia (pièce) | 4 320 | 4 320 | 4 950 | 4 950 | 2 567 | 3 679 |
| Tomate (kg) | 3 700 | 3 700 | 12 210 | 12 210 | 7 615 | 6 491 |
| **Total cultures** | | | **30 526** | **30 526** | **15 974** | **15 972** |

Écart du plan B : **0 € et 0 unité pour chaque culture**. Le tableau de 2027 avec le plan B est strictement identique à celui de la reprise à l'identique, puisque `Calc.tableau` n'utilise pas l'espace. On peut l'écrire comme invariant. Les fourchettes basse et haute restent elles aussi identiques ; seules les médianes sont montrées ici.

### 4.4 Ce que le plan B déplace, culture par culture

| Culture | 2026 | 2027 proposé | Pourquoi |
| --- | --- | --- | --- |
| Salade batavia, 15 × 40 m² | Parcelle 1 | Parcelle 5 (13), Parcelle 2 (2) | À la Parcelle 1, retour trop tôt des Astéracées (600 m² en 2026, délai de 3 ans). À la Parcelle 5 : bon voisin piment, suit le piment dans la rotation |
| Brède petsaï, 15 × 80 m² | Parcelle 2 | Parcelle 1 (7), Parcelle 3 (4), Parcelle 5 (3), Parcelle 4 (1) | 1 200 m² de Brassicacées en 2026 sur une parcelle de 600 m² : la série doit se partager |
| Chou pommé, 3 × 80 m² | Parcelle 3 | Parcelle 5 | Bons voisins : piment, ail péi |
| Carotte, 3 × 100 m² | Parcelle 4 | Parcelle 1 | Bon précédent : salade ; feuille → racine dans la rotation |
| Ail péi, 300 m² | Parcelle haute | Parcelle 5 | Retour trop tôt à sa place (5 ans) ; bon voisin : chou |
| Haricot vert, 2 × 150 m² | Parcelle 5 | Parcelle haute (avril), Parcelle 1 (août) | En avril, il suit l'ail (bulbe → légumineuse) ; en août, sa place de 2026 est pleine |
| Piment, courgette de plein champ | Parcelles 5 et 3 | Inchangé | Rien de mieux ailleurs (bon précédent chou pour la courgette) |
| Tomates, concombres, courgettes des tunnels | Tunnels 1 et 2 | Inchangé | Aucune place sous abri n'évite le retour ou le mauvais précédent |
| Chouchou | Treille | Inchangé (épinglé) | Vivace ; l'alerte « retour trop tôt » reste faute de notion de vivace |

### 4.5 Les années suivantes : où les règles cessent de tenir

Chaque plan est bâti sur le précédent : 2028 sur le plan 2027, puis 2029 sur le plan 2028.

| Année | Retours trop tôt, reprise à l'identique | Retours trop tôt, glouton | Détail du glouton | Précédents défavorables |
| --- | --- | --- | --- | --- |
| 2027 | 36 | **5** | tomate 4, chouchou 1 | 9 |
| 2028 | 47 | **14** (13 avec la recherche locale sur les alertes) | tomate 4, chouchou 1, courgette 2, concombre 2, brède 5 | 9 |
| 2029 | 49 | **28** | brède 15, chou 3, tomate 4, concombre 3, courgette 2, chouchou 1 | 9 |

Bilan de place par famille au 1er janvier, en m². La place permise sur un espace est sa surface moins les plantations de la famille encore dans leur délai.

| Famille (délai médian) | Demandé par an | Permis 2027 (abri / plein champ) | Permis 2028 | Permis 2029 |
| --- | --- | --- | --- | --- |
| Solanacées (4 ans) | 520, dont 480 sous abri | **0** / 3 760 | **0** / 3 720 | — |
| Brassicacées (4 ans) | 1 440 | 400 / 2 960 | 400 / **1 520** | 400 / **400** |
| Cucurbitacées (3 ans) | 565, dont 165 sous abri | 235 / 3 400 | **70** / 3 300 | — |
| Astéracées (3 ans) | 600 | 400 / 3 200 | 400 / 2 600 | — |

Lecture :
- **Tomate** : sous abri, la place permise est nulle dès 2027. Il faut accepter l'alerte, mettre des tomates en plein champ, ajouter un abri ou revoir le délai.
- **Brède et chou** : en 2029, les 400 m² permis en plein champ sont la treille (300 m², occupée toute l'année par le chouchou) et trois restes de 20 à 40 m². Aucune plantation de 80 m² n'y tient, et les 18 retours trop tôt sont donc inévitables. Placer les Brassicacées en premier ne change rien (28). La règle à la surface, appliquée à 15 cycles courts par an, épuise la ferme en trois ans. C'est la décision « cycles courts » du § 6.4.
- Ce bilan est simple, rapide et parlant. Il devrait être le premier bloc de l'aperçu (§ 5).

### 4.6 Temps de calcul (Node 22, médiane de 3 à 7 exécutions, plusieurs lancements)

| Calcul | Temps |
| --- | --- |
| Glouton, ferme d'exemple (51 plantations) | 60 à 100 ms |
| Contrôle par `Calc` (retours, défavorables, sur-occupations) | 20 ms |
| Glouton + recherche locale sur les alertes | 85 à 90 ms |
| Glouton + recherche locale sur toutes les plantations | 1,4 à 2,4 s |
| Blocs, affectation exacte | 65 à 75 ms |
| Par espace avec `Calc.suggestions` | 95 à 100 ms |
| Glouton, ferme ×4 (204 plantations, 36 espaces) | 0,66 à 0,74 s |

### 4.7 Limites du prototype

- C'est un script d'étude, pas le code livrable : pas de textes dans `i18n.js`, pas de tests, et un nom de culture (« Chouchou ») utilisé dans le script pour simuler le champ `vivace`.
- « Abri reste abri » est une approximation du champ `abri`.
- Le voisinage se juge à l'échelle de l'espace (hors périmètre de R4 : position dans l'espace). Sur une parcelle de 600 m², « bon voisin » veut seulement dire « dans la même parcelle en même temps ». C'est un signal faible, qui attire pourtant les séries (13 salades autour du piment).
- Les temps sont mesurés sous Node ; un navigateur, surtout Firefox, peut être plus lent.
- La recherche exhaustive ne départage que sur les deux premières clés (retours, puis défavorables).

## 5. Expérience utilisateur

### 5.1 Le bouton
- Il se place dans l'en-tête de la page Plantations, près du choix de l'année : « Préparer 2027 à partir de 2026 ». Il est visible quand l'année choisie est la dernière de la ferme. R3 interdit de choisir une année au-delà de la dernière ; ce bouton devient la façon naturelle d'ouvrir l'année suivante.
- Avant le calcul, trois réglages au plus, préremplis :
  - « Garder en place : Chouchou (vivace) », liste modifiable ;
  - « Une culture sous abri reste sous abri », tant que le champ `abri` n'existe pas ;
  - « Reprendre aussi les jours de marché ».

### 5.2 L'aperçu, un brouillon que rien n'enregistre
- **En tête, trois phrases**, avec des fourchettes pour les estimations :
  - « 51 plantations reprises aux mêmes dates et surfaces » ;
  - « Retours trop tôt : 36 si tout reste en place, 5 avec cette proposition » ;
  - « Chiffre d'affaires des cultures : inchangé, 30 500 € (fourchette inchangée) ».
- **« Ce que vos règles ne permettent pas »**, tiré du bilan de place par famille, en mots simples. Exemple : « Tomate : il faudrait 480 m² sous abri pour les Solanacées ; leur délai de 4 ans n'en laisse aucun en 2027. La proposition laisse les tomates dans les tunnels, avec l'alerte. Vous pouvez les garder ainsi, en mettre en plein champ ou revoir le délai. »
- **Liste groupée par culture**. Exemple : « Salade batavia, 15 plantations : Parcelle 1 → Parcelle 5 (13) et Parcelle 2 (2). Pourquoi : … ». Chaque groupe se déplie ligne par ligne, avec les mêmes pastilles que le tiroir de plantation (EX-63).
- **Comparaison** dans le calendrier continu (EX-59) : 2026, puis les barres du brouillon 2027 dans un style distinct (hachuré, « brouillon »), avec les marques d'alerte de rotation ; bascule « avant / après » par espace.
- **Sur chaque ligne et chaque culture** : « Garder la proposition » (par défaut), « Garder la place de 2026 », « Choisir un autre espace ». Le dernier choix montre pour chaque espace l'aperçu des raisons, calculé comme dans le tiroir (`precedents`, `voisins`). Le bilan et les alertes du brouillon se recalculent à chaque choix (moins de 0,1 s).

### 5.3 L'acceptation
- « Enregistrer toute la proposition », « Enregistrer cette culture », ou ligne par ligne.
- Chaque ligne acceptée devient une plantation ordinaire (UUID, dates, suppression logique). Les plantations de 2026 ne changent pas.
- Après l'enregistrement, les alertes sont exactement celles du brouillon, puisque ce sont les mêmes règles ; on peut l'écrire comme invariant.
- Les lignes non acceptées restent dans le brouillon. Fermer le brouillon ne change rien à la ferme.

### 5.4 L'annulation
- « Annuler le dernier enregistrement de la proposition » supprime logiquement exactement les plantations créées par la dernière acceptation. C'est le principe de « Effacer la ferme d'exemple », qui garde ses identifiants dans l'état du navigateur.
- Le rappel d'export (EX-08) joue comme pour toute modification.

### 5.5 Rester fidèle à « l'outil ne décide pas à la place du maraîcher »
- Rien n'est enregistré sans un geste. Le mot affiché est « proposition », jamais « plan optimal ».
- Chaque proposition dit pourquoi, et ce qu'elle évite par rapport à la place de l'an passé.
- Les règles impossibles à tenir sont montrées en premier ; elles ne sont pas cachées par une suppression ou une réduction de plantation.
- L'outil ne change jamais une date, une surface ni une variété. Il ne touche pas aux plantations existantes et ne refuse rien (`alerte_seulement` reste vrai).
- Garder la place de l'an passé se fait toujours en un clic, par culture.
- Les choix cachés du calcul (ordre des critères, départage, « abri reste abri ») sont écrits dans la spec et dans une aide « Comment la proposition est faite ».

## 6. Ce que cela demanderait

### 6.1 Modèle de données
- **Pas de nouvel objet « brouillon de plan »** dans V1. Le brouillon se recalcule à la demande (moins de 0,1 s, déterministe) ; les choix ligne par ligne vivent dans la page. Un brouillon enregistré ne servirait qu'à reprendre son travail d'un jour à l'autre ou à le partager entre appareils (S4). On pourra le décider plus tard.
- **Deux champs facultatifs sur la culture**, si l'humain les accepte :
  - `abri` : « obligatoire », « possible » ou « jamais » ; absent vaut « possible » ;
  - `vivace` : oui ou non.

  Format exporté en version 7, avec une migration 6 → 7 qui ne fait rien. Ils ne changent aucune case du tableau : il faut donc une dérogation à la règle d'admission, comme en R4.
- **Annulation** : la liste des identifiants créés par la dernière acceptation, dans l'état du navigateur (comme `etat.exemple`), hors export. Variante : un champ `origine` sur la plantation (« reprise de… »), si l'humain veut garder cette trace dans l'export.
- **Pas de fenêtre de saison** dans V1. `moisMiseEnPlace` ne viendrait qu'avec V5.

### 6.2 Taille de la tranche (sur le modèle de R4 : 7 tâches, terminée en 7 sessions sur 10)

| Tâche | Contenu | Relecture |
| --- | --- | --- |
| T1 | Données sourcées : abri et vivace des 11 cultures de l'exemple (DONNEES § 5 et § 14) ; scénario « Préparer 2027 » attendu | oui |
| T2 | Modèle v7 : `abri`, `vivace`, migration 6 → 7 ; saisie sur la page Cultures (si les champs sont acceptés) | oui |
| T3 | Calcul : `raisonsPour` partagé avec `suggestions` (refactor sans changement), `planAnneeSuivante`, `bilanPlaceParFamille`, évaluateur rapide avec test d'équivalence, invariants | oui |
| T4 | Aperçu : bouton, réglages, bilan, liste groupée par culture, calendrier avant / après | oui |
| T5 | Acceptation (tout, par culture, par ligne), reprise des séances si décidée, annulation | oui |
| T6 | Ferme d'exemple : scénario de bout en bout, captures à 390 et 1 366 px | oui |
| T7 | Vérification de la tranche et revue par l'évaluateur séparé | non |

Seuil d'alerte proposé : 10 à 11 sessions.

Esquisse d'exigences : EX-67 (proposition calculée sans rien enregistrer), EX-68 (raisons et place de l'an passé), EX-69 (bilan de place par famille), EX-70 (acceptation en bloc, par culture, par ligne), EX-71 (annulation). Invariants proposés :
- `proposition_sans_enregistrement` ;
- `existantes_intouchees` ;
- `jamais_de_sur_occupation` ;
- `tableau_inchange` : la proposition acceptée en entier donne le même tableau que la reprise à l'identique ;
- `sans_regle_rien_ne_bouge` ;
- `alertes_brouillon_egales_alertes_enregistrees` ;
- `proposition_deterministe`.

Scénario de départ :

```gherkin
Scénario: S22 — la salade quitte une parcelle pleine d'Astéracées
  Soit la famille « Astéracées » avec un délai de retour de 3 ans
  Et sur la parcelle A de 600 m², quinze salades de 40 m² en 2026
  Et une parcelle B de 600 m² sans Astéracées
  Quand je demande « Préparer 2027 à partir de 2026 »
  Alors les quinze salades de 2027 sont proposées sur la parcelle B, aux mêmes dates et surfaces
  Et chacune dit « à sa place de 2026 : retour trop tôt (Astéracées, 3 ans) »
  Et rien n'est enregistré
  Quand j'enregistre la culture « Salade batavia »
  Alors quinze plantations de 2027 sont créées, et aucune autre plantation ne change
```

### 6.3 Risques

1. **Règles trop strictes.** Avec celles de l'exemple, la proposition devient impossible dès la troisième année, et le maraîcher peut juger l'outil inutile ou se sentir poussé à réduire sa production. Parade : le bilan de place par famille, des mots justes, la décision sur les cycles courts.
2. **Choix cachés** : ordre des critères, départage, approximations. Parade : les écrire dans la spec et à l'écran.
3. **Voisinage à l'échelle de l'espace** : signal faible qui attire les séries. Parade : compter par culture (déjà fait dans le prototype), voire ignorer le voisinage sur les grands espaces.
4. **Performance** sur une grande ferme : 0,7 s sous Node pour 204 plantations. Parade : évaluateur dédié et test de budget à 200 plantations.
5. **Charge de relecture** : 39 déplacements sur 51. Parade : regrouper par culture et proposer « garder la place de 2026 » en un clic.
6. **Doublons** avec des plantations déjà saisies dans l'année cible.
7. **Glissement vers V4** (plan bâti depuis la demande) : sur-modélisation, déjà nommée dans les pièges du BRIEF.
8. **Acceptation en bloc sans lecture.** Parade : les alertes inévitables viennent en premier, avant le bouton « Tout enregistrer ».
9. **Priorité produit.** Les hypothèses H0 à H2 du BRIEF ne dépendent pas de cette fonction ; il serait utile de la confronter aux fermes pilotes.

### 6.4 À trancher par l'humain avant de commencer

1. **No-go « rotation automatique »** : accepter la lecture b) du § 0 (brouillon, enregistré seulement sur acceptation) et écrire la dérogation au BRIEF et à R4 ; ou garder la lecture a), une proposition à ressaisir.
2. **Variante** : V1 seule (reprendre et replacer, sans bouger dates ni surfaces) ; avec ou sans le mode « blocs ».
3. **Champs `abri` et `vivace`** sur la culture (modèle v7), ou l'approximation « même type d'espace » sans changement de modèle. Et pour une vivace : le délai de retour doit-il l'ignorer sur son propre espace ? Ce serait un changement de la règle de R4.
4. **Ordre des critères** : celui de « Que planter ici ? », avec deux écarts proposés (raisons favorables comptées par culture ; départage « rester à sa place »). Faut-il aussi les appliquer à « Que planter ici ? » pour garder un seul ordre ?
5. **Règle impossible** : garder la plantation à sa meilleure place avec son alerte (recommandé), ou la laisser « à placer à la main ».
6. **Cycles courts** : garder la règle à la surface telle quelle, adopter une règle propre aux cultures courtes (comme la règle suisse citée au § 14.6 de DONNEES), ou revoir les délais de l'exemple. Ce choix décide de l'utilité du bouton au-delà de deux ans.
7. **Séances** : les reprendre avec la proposition (recommandé, sinon la synthèse de l'année suivante est vide pour les cultures qui ont un débouché) ; et les lots de poules ?
8. **Brouillon** : en mémoire seulement (recommandé) ou enregistré.
9. **Annulation** : identifiants gardés dans l'état du navigateur (recommandé) ou champ `origine` exporté.
10. **Engrais verts** : hors de V1, ou proposer d'en mettre dans les creux (ce serait créer des plantations absentes de l'an passé).
11. **Budget de temps** : 200 plantations en moins d'une seconde dans Firefox et Chrome, mesuré.

