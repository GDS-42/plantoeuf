# DONNÉES — Ferme d'exemple du Sud de La Réunion (tranche R2)

Dossier des valeurs de `src/exemple.js` : pour chacune, sa fourchette basse / médiane / haute, sa ou ses sources, et le passage de la source à la fourchette. Recherche documentaire du 15/10/2026 par quatre agents en parallèle (cultures ; prix de vente ; poules ; débouchés, trajets et charges), complétée par deux agents (charges ; cultures) et une recherche directe (semences) ; synthèse par l'agent principal. Les rapports de recherche, avec les extraits relevés, sont dans `docs/specs/R2/recherche/`.

## 0. Méthode et réserves

- **Accès aux sources.** Le réseau de l'environnement de travail refuse l'ouverture directe des pages et des PDF (proxy : `daaf.reunion.agriculture.gouv.fr`, `agreste.agriculture.gouv.fr`, `armeflhor.fr`, etc.). **Toutes les valeurs ont été relevées dans les extraits des documents renvoyés par le moteur de recherche**, pas dans les documents ouverts en entier. Les relevés tirés de tableaux ont été contrôlés par calcul quand c'était possible (barème DAAF : rendement × prix = produit à l'hectare). Les documents à relire en priorité sont listés au § 12.
- **Marques.** **[R]** source réunionnaise ; **[NR]** référence non réunionnaise (Hexagone, Antilles-Guyane, Polynésie, Mayotte), marquée comme telle ; **[E]** estimation de l'agent, raisonnement donné ; **[N]** texte national applicable à La Réunion.
- **Règle des bornes.** Quand une source ne donne qu'une valeur moyenne, elle sert de médiane, et les bornes valent les deux tiers et les quatre tiers de la médiane **[E]**, sauf quand une source donne une borne (plafond agronomique, prix de pénurie relevé).
- **Saisonnalité.** L'outil porte une seule fourchette par valeur pour l'année : pour les prix, la basse est le prix d'abondance (saison fraîche), la médiane le prix habituel, la haute le prix de pénurie (saison chaude, après un cyclone), d'après les relevés datés de la DAAF.
- **Année.** Toutes les dates de la ferme tombent dans l'année de chargement (règle de la spec) ; une récolte qui déborde sur l'année suivante n'est pas vendue dans la projection, faute de séance.

## 1. La ferme

| Élément | Valeur | Source |
| --- | --- | --- |
| Lieu | Hauts de Petite-Île, Sud, mi-pente (environ 300 à 800 m) | Choix de l'humain (14/10/2026). Le Sud est le premier bassin maraîcher de l'île : Le Tampon 578 ha de légumes, Saint-Pierre 137 ha, Petite-Île 103 ha, Saint-Joseph 80 ha (RA 2020) [D2] [R]. Périmètre irrigué du Bras de la Plaine (Saint-Pierre, Petite-Île, Saint-Joseph, Entre-Deux, Le Tampon), avec une extension de 377 ha à Mont-Vert et Anse-les-Hauts, sur Petite-Île ; avec le Bras de Cilaos, les périmètres du Sud irriguent environ 9 000 ha [W1] [R] |
| Taille, actif | Un maraîcher seul, environ 1,5 ha, 200 poules | Cas type du brief (`docs/BRIEF.md`) |
| Surface en légumes à un instant donné | 0,42 ha (4 200 m² d'espaces : 400 m² d'abris, 3 800 m² de plein champ) | 2,8 actifs par ha en production de légumes, soit environ 0,36 ha par actif (enquête 2014) [D4] [R] ; 1 754 ha pour 2 205 producteurs, soit 0,8 ha par producteur (RA 2020) [D2] [R]. Le reste des 1,5 ha : parcours des poules, engrais verts et jachère (1,1 culture par an en bio, 1,9 en conventionnel [D4, attribution entre *Analyses* n° 100 et la publication AB 2017 à vérifier]), chemins, bâtiments [E] |
| Abris | Deux tunnels de 200 m² | 131 ha de serres en 2023, environ 8 % de la surface en légumes, surtout tomate et courgette [D3] [R] ; la plupart des abris font moins de 500 m² [C3] [R] |
| Parcelles | Cinq parcelles de 600 m², une treille de chouchou de 300 m², une parcelle haute de 500 m² (ail) | [E] Taille fixée par la demande des débouchés (§ 8) et la capacité de travail d'un actif |

## 2. Cultures : rendement, prix, délais, pertes

Familles botaniques : classification usuelle. Rendement commercialisable par m² et par cycle, dans l'unité de vente. Prix : prix de détail sur les marchés forains (mercuriales de la DAAF), utilisé par l'outil seulement pour une culture sans débouché (§ 8) ; le prix de chaque débouché est au § 8.

| Culture (`CULTURES`) | Unité | Rendement /m² | Prix (€) | Jours avant récolte | Semaines de récolte | Pertes % |
| --- | --- | --- | --- | --- | --- | --- |
| Tomate (sous abri) | kg | 8 / 12 / 16 | 2 / 3,5 / 7,5 | 70 | 11 | 15 |
| Salade batavia | pièce | 6,5 / 9 / 11 | 1 / 1,15 / 1,5 | 42 | 2 | 20 |
| Brède petsaï | botte | 2 / 3 / 4 | 1 / 1,25 / 2,2 | 40 | 2 | 20 |
| Chou pommé | pièce | 2 / 3 / 4 | 1 / 1,85 / 3,5 | 85 | 3 | 15 |
| Carotte | kg | 2 / 3 / 4 | 2,3 / 2,7 / 3,5 | 105 | 3 | 15 |
| Haricot vert | kg | 0,6 / 0,9 / 1,2 | 5 / 5,5 / 7 | 60 | 4 | 20 |
| Courgette | kg | 1,5 / 2 / 3 | 1,5 / 2 / 4,1 | 50 | 6 | 20 |
| Concombre (sous abri) | pièce | 20 / 30 / 50 | 0,75 / 1,17 / 3 | 40 | 6 | 20 |
| Piment (petit piment) | kg | 0,5 / 0,8 / 1,1 | 12,5 / 19 / 25 | 105 | 26 | 15 |
| Chouchou | kg (par an) | 3,9 / 5 / 6,7 | 1 / 1,5 / 5,5 | 105 | 35 | 20 |
| Ail péi | kg (sec) | 0,3 / 0,6 / 0,8 | 15 / 20 / 25 | 150 | 8 | 20 |

**Rendements.** Source commune : barème départemental des calamités agricoles 2023-2025 de la DAAF, établi d'après le référentiel technico-économique de La Réunion [D1] [R] (1 t/ha = 0,1 kg/m²).
- Tomate : sous abri en sol, 11,41 et 12,15 kg/m² sur 11 semaines (essais ARMEFLHOR 2016-2017) [A2] [R] → médiane 12, bornes 8 et 16 [E, règle des bornes]. Le barème donne 300 t/ha sous serre [D1], valeur de serre intensive hors sol, non retenue pour une petite ferme en sol.
- Salade : 26 t/ha [D1] = 2,6 kg/m², soit 6,5 pièces de 400 g → basse 6,5 ; densité en planche 11 plants/m² [A1] [R] → haute 11 ; médiane 9 [E].
- Brède : 20 t/ha [D1] = 2 kg/m². Poids d'une botte ≈ 0,7 kg [E] : prix bord champ du barème 1,38 €/kg [D1] contre prix de gros 1,00 € la botte (marché de gros, 30/07/2025) [D6] → 0,72 kg. 2 ÷ 0,7 ≈ 3 bottes/m² → 2 / 3 / 4 [E, règle des bornes].
- Chou pommé : ≈ 30 t/ha [D1] = 3 kg/m², pomme ≈ 1 kg [E] → 3 pièces/m² ; densité 4 plants/m² (40 × 40 cm) [N3] [NR] → haute 4.
- Carotte 30 t/ha, haricot vert 9 t/ha, courgette 20 t/ha, petit piment 8 t/ha, ail violet 6 t/ha [D1] → médianes ; bornes [E]. Ail : production réunionnaise 150 t (2022), 130 t (2023), < 100 t (2024) [P5] [R].
- Concombre : 350 t/ha sous abri [D1] (serre intensive) ; pour une petite serre en sol 8 / 12 / 20 kg/m² [E, rapport de compléments], soit, à 0,4 kg le concombre [E], 20 / 30 / 50 pièces/m².
- Chouchou : 50 t/ha par an [D1] → médiane 5 ; basse 3,9 : environ 3 500 t (Agreste 2019) [D10] sur 90 ha [C1] ; haute 6,7 : environ 6 000 t par an sur 90 ha [C1] [R + E].

**Prix (détail, marchés forains, DAAF).** Mercuriales des marchés forains [D5] et bulletins mensuels [D8], 2022-2026 [R] :
- tomate : 7,33 €/kg (6 à 9) le 02/05/2025 [D5] ; 6 à 8 €/kg en avril 2025 après le cyclone Garance [P1] ; « plus de 3 € » en septembre 2026 [P2] → 2 / 3,5 / 7,5 (basse [E] : prix de gros × 1,3) ;
- salade batavia : 1,15 € la pièce (mai 2025) [D8], 1,10 (juin 2025) [P3] → 1 / 1,15 / 1,5, prix très stable (bornes [E]) ;
- brèdes : 1,00 à 1,50 € la botte en 2025 ; 2,17 à 2,50 en mars 2022 (pénurie) [D5] → 1 / 1,25 / 2,2 ;
- chou vert : 1,83 € la pièce (1 à 2,5) le 03/10/2025 ; 2,70 en janvier 2025 [D5] [D8] → 1 / 1,85 / 3,5 (haute [E], du prix de gros à 3,00) ;
- carotte : 2,33 €/kg (septembre 2022), 2,67 à 2,83 (février 2026) [D5] → 2,3 / 2,7 / 3,5 ;
- haricot vert : 5,50 €/kg (5 à 7) le 03/10/2025 [D5] → 5 / 5,5 / 7 ;
- courgette : 2,00 €/kg (1,5 à 2,5) en octobre 2025 ; 4,10 en juin 2025 [D5] [P3] → 1,5 / 2 / 4,1 ;
- concombre : 1,17 € la pièce (0,75 à 3) le 05/12/2025 [D5] → 0,75 / 1,17 / 3 ;
- petit piment : piment cabri 20 €/kg (15 à 25) le 03/10/2025, 18,75 le 19/12/2025 ; petit piment rouge 12,50 [D5] → 12,5 / 19 / 25 ;
- chouchou : 1,00 €/kg (juin 2025), 1,50 (septembre 2025), 5,48 (4 à 8,90) le 06/02/2026 [D5] [D8] → 1 / 1,5 / 5,5 ;
- ail péi (vendu sans débouché détaillé, § 8) : 15 à 20 €/kg à la Fête de l'ail de Petite-Île [P5] ; 20 €/kg (18 à 20) au marché de gros en 2025 [D6] ; 25 à 30 €/kg en commerce [P6] ; 33,33 €/kg (25 à 40) sur les marchés forains le 05/09/2025 [D5] → 15 / 20 / 25, choix prudent d'une vente en gros et à la fête plutôt qu'au détail.

**Délais et durées.**
- Salade : récolte 5 à 7 semaines après plantation [A1] [R] → 42 jours.
- Tomate sous abri : 11 semaines de récolte [A2] [R] ; 70 jours avant récolte [E].
- Chouchou : récolte 3 à 4 mois après plantation [C1] [R] → 105 jours.
- Ail : plantation fin avril-début mai, récolte fin septembre-début octobre [P5] [R] → 150 jours. Huit semaines de « récolte » [E] : l'ail se récolte en 2 à 4 semaines, puis, séché, se vend de fin septembre à la mi-novembre, Fête de l'ail de Petite-Île (fin octobre) comprise ; l'outil répartit les ventes sur ces huit semaines.
- Concombre : récolte dès 1 mois après plantation, au plus 1,5 mois de récolte [N1] [NR] → 40 jours, 6 semaines.
- Brède : 30 / 40 / 50 jours, 2 semaines [N2] [NR + E].
- Autres délais et durées : estimations de l'agent [E], dans les fourchettes du rapport de recherche (chou 70/85/100 j, carotte 90/105/120 j, haricot 50/60/70 j, courgette 40/50/60 j, piment 90/105/120 j).

**Pertes.** Aucune source ne chiffre un taux de pertes par culture à La Réunion ; valeurs [E] encadrées par des repères sourcés [R] :
- cucurbitacées (courgette, concombre, chouchou) : 20 à 25 % de pertes au plus avec une protection agroécologique contre les mouches des légumes (projet GAMOUR, dont des fermes de Petite-Île) [G1] → 20 ;
- tomate de plein champ sans pesticide : 40 % non commercialisé et deux années sur cinq sans récolte (RESCAM) [G2] — d'où la tomate sous abri seulement ; sous abri 15 [E] ;
- cyclone Garance (2025) : jusqu'à 90 % de la production sous serre perdue chez certains maraîchers, environ 35 % de la production locale [P1] — une année cyclonique se lit dans la borne basse des marges, pas dans les pertes moyennes.

## 3. Coûts de mise en place (`COUTS`)

| Culture | Mise en place | Densité /m² | Prix d'une graine ou d'un plant (€) | Intrants (€/m² par cycle) |
| --- | --- | --- | --- | --- |
| Tomate | plant | 2,5 | 0,29 / 0,39 / 0,55 | 0,08 / 0,12 / 0,19 |
| Salade batavia | plant | 11 | 0,074 / 0,087 / 0,12 | idem |
| Brède petsaï | plant | 10 | 0,074 / 0,087 / 0,12 | idem |
| Chou pommé | plant | 4 | 0,13 / 0,18 / 0,32 | idem |
| Carotte | semis | 150 | 0,0019 / 0,0029 / 0,0038 | idem |
| Haricot vert | semis | 25 | 0,004 / 0,006 / 0,008 | idem |
| Courgette | plant | 1 | 0,29 / 0,39 / 0,55 | idem |
| Concombre | plant | 1,6 | 0,29 / 0,39 / 0,55 | idem |
| Piment | plant | 2 | 0,29 / 0,39 / 0,55 | idem |
| Chouchou | plant (fruit germé) | 0,15 | 0,4 / 0,6 / 2,2 | 0,15 / 0,24 / 0,38 |
| Ail péi | plant (caïeu) | 33 | 0,06 / 0,08 / 0,10 | 0,08 / 0,12 / 0,19 |

- **Densités.** Salade 11 plants/m² en planche [A1] [R] ; chou 4 (40 × 40 cm) [N3] [NR] ; carotte 150 graines/m² (type nantais) [N4] [NR] ; concombre 1,6 (80 × 60 cm) [N1] [NR] ; brède 10 (25 × 40 cm) [N2] [NR] ; chouchou 500 fosses/ha [E, d'après la fumure de 20 kg par fosse de la fiche [C1]] × 3 fruits germés par fosse (2 à 4 [C1] [R]) = 0,15 ; tomate 2,5, haricot 25, courgette 1, piment 2, ail 33 caïeux [E, dans les fourchettes du rapport de recherche].
- **Plants.** Les pépiniéristes du Sud (Multiplantes au Tampon, à Saint-Pierre et à Saint-Joseph ; HGM) ne publient aucun prix [C4] [R]. Repères professionnels de l'Hexagone, hors transport [N5] [NR] : mini-motte de tomate 0,29 à 0,39 € ; motte de salade 0,074 à 0,087 € ; mini-motte de chou 0,13 à 0,23 €. Basse et médiane : ces repères ; haute : + 40 % pour le fret et l'octroi de mer [E, supposé]. Courgette, concombre, piment, brède : repères de la tomate et de la salade par analogie [E].
- **Semences.** Carotte : 3,80 € les 1 000 graines bio au détail [N6] [NR] → haute 0,0038 € la graine ; médiane et basse aux trois quarts et à la moitié [E]. Haricot : 150 € de semences pour 1 000 m² (Chambre d'agriculture d'Occitanie, 2013) [N7] [NR] = 0,15 €/m², soit 0,006 € la graine à 25 graines/m² ; bornes [E].
- **Chouchou, ail.** Un fruit germé ≈ 0,4 kg [E] × prix de détail 1,00 / 1,50 / 5,48 €/kg [D5] → 0,4 / 0,6 / 2,2 €. Un caïeu ≈ 3 à 5 g [E] × prix de gros de l'ail péi 20 €/kg [D6] → 0,06 / 0,08 / 0,10 €.
- **Intrants.** Engrais et traitements : 0,13 à 0,14 €/m² et 0,02 à 0,04 €/m² par an (Cerfrance, Bourgogne-Franche-Comté, 2022-2023) [N8] [NR] ; le prix des engrais à La Réunion est passé de 700 à 1 500 €/t (question écrite AN n° 6335, 2023) [P7] [R]. Par an : 0,15 / 0,24 / 0,38 €/m² [E : repère Cerfrance, porté au double pour la hausse réunionnaise en haute] ; par cycle, environ deux cycles par an : 0,08 / 0,12 / 0,19 €/m². Chouchou (un cycle d'un an) : la valeur annuelle.

## 4. Variétés (`VARIETES`)

| Variété | Culture | Source |
| --- | --- | --- |
| Heatmaster | Tomate | Variété majoritaire à La Réunion [C3] [R] ; critère de résistance au TYLCV [A2] [R] |
| Goldorac | Salade batavia | Laitue d'été, récolte étalée [A1] [R] ; surcharge : 3 semaines de récolte au lieu de 2 [E] |
| Petsaï | Brède | Type de brède des mercuriales (« brède petsaï ») [D5] [R] |
| Farao F1 | Chou pommé | Seule variété à avoir pommé dans un essai bio de l'ARMEFLHOR [A4] [R] |
| Nantaise | Carotte | Type nantais [N4] [NR] ; aucune variété réunionnaise sourcée |
| Haricot nain | Haricot vert | Type ; aucune variété sourcée |
| Sofia F1 | Courgette | « Variété cultivée à La Réunion » (CIRAD Mayotte, 2006) [N9] [NR citant R] |
| Lambert | Concombre | Liste de semences de l'ARMEFLHOR [A4] [R, statut non vérifié] |
| Zoizo | Piment | Nom courant du petit piment ; la DAAF dit « petit piment » [D5] ; correspondance à confirmer |
| Chouchou péi | Chouchou | Population locale [E] |
| Vacoa | Ail péi | Avec le Gros bleu, les variétés qui dominent grâce à un meilleur rendement [P5] [R] |

## 5. Calendrier des plantations (`PLANTATIONS`, 55 plantations)

| Plantation | Espace | Surface (m²) | Dates de mise en place |
| --- | --- | --- | --- |
| Tomate Heatmaster | Tunnel 1 | 120 | 10/01, 15/06 |
| Tomate Heatmaster | Tunnel 2 | 120 | 01/04, 01/09 |
| Concombre Lambert | Tunnel 1 | 15 | 10/01, 10/04 |
| Concombre Lambert | Tunnel 2 | 15 | 01/10 |
| Courgette Sofia F1 | Tunnel 2 | 60 | 01/02 |
| Courgette Sofia F1 | Tunnel 1 | 60 | 01/11 |
| Salade Goldorac | Parcelle 1 | 40 | 05/01, 26/01, 16/02, 09/03, 30/03, 20/04, 11/05, 01/06, 22/06, 13/07, 03/08, 24/08, 14/09, 05/10, 26/10, 16/11, 07/12 |
| Brède Petsaï | Parcelle 2 | 80 | 08/01, 29/01, 19/02, 12/03, 02/04, 23/04, 14/05, 04/06, 25/06, 16/07, 06/08, 27/08, 17/09, 08/10, 29/10, 19/11, 10/12 |
| Chou Farao F1 | Parcelle 3 | 80 | 01/04, 01/06, 01/08 |
| Carotte Nantaise | Parcelle 4 | 100 | 15/03, 15/05, 15/07 |
| Haricot nain | Parcelle 5 | 150 | 15/04, 01/08 |
| Courgette Sofia F1 | Parcelle 3 | 100 | 15/05 |
| Piment Zoizo | Parcelle 5 | 40 | 01/03 |
| Chouchou péi | Treille de chouchou | 300 | 15/02 |
| Ail Vacoa | Parcelle haute | 300 | 25/04 |

Surfaces et dates : estimations de l'agent [E], dans les contraintes sourcées ci-dessous, fixées pour que la production suive à peu près la demande des débouchés (§ 8), sans sur-occupation.

- **Tunnels** (tomate, concombre, courgette) : la tomate passe sous abri à La Réunion (flétrissement bactérien et mouche de la tomate en plein champ) [A5] [G2] [R] ; deux cycles de tomate par tunnel, décalés pour une récolte presque continue ; concombre et courgette sous abri en saison chaude [D3] [N1]. Au-dessus de 30 °C, le rendement de la tomate baisse [C3] [R] ; à mi-pente, la moyenne des maximales de février reste sous 27 °C au Tampon (860 m) [M1].
- **Salades et brèdes** : une plantation toutes les trois semaines, toute l'année ; laitues d'été en saison chaude [A1] [R] ; surfaces de 40 et 80 m² fixées par la demande (§ 8) [E].
- **Saison fraîche en plein champ** : chou (avril, juin, août), carotte (semis de mars à juillet ; la carotte d'été pose problème [A6] [R]), haricot (avril, août), courgette (mai) [E, dans le calendrier du rapport de compléments].
- **Cultures longues** : piment (mars, 26 semaines de récolte) ; chouchou sur treille (février) ; ail péi fin avril [P5] [R], puis engrais vert.
- **Gingembre** : écarté. Planté de septembre à novembre, il se récolte l'année suivante [C2] [R], hors de l'année modélisée.

## 6. Véhicule (`VEHICULES`)

| Champ | Valeur | Source |
| --- | --- | --- |
| Consommation | 6 / 7 / 8,5 L/100 km | Utilitaire compact diesel : 5,3 L/100 km en WLTP (Kangoo, Partner) [V1] [NR] ; 6 à 6,5 en usage réel [V2] [NR] ; + charge et fortes pentes de la mi-pente au littoral [E] |
| Prix du litre | 1,25 / 1,55 / 1,85 € | Prix maximum du gazole fixé chaque mois par le préfet : 1,24 € (octobre 2025), 1,23 (novembre 2025), 1,25 (mars 2026), 1,77 (avril 2026), environ 1,83 (mai), 1,71 (juin), 1,53 (juillet), 1,55 (août), 1,68 (septembre), 1,80 (octobre 2026) [V3] [R] ; décembre 2025 à février 2026 non trouvés (pris à 1,24) ; médiane : moyenne des douze mois, 1,51 €, arrondie vers le haut à 1,55 parce que les prix remontent [E] |
| Frais au km | 0,15 / 0,25 / 0,40 € | Entretien, pneus, assurance et usure, hors carburant : entretien et pneus d'un utilitaire de 3,5 t 0,178 €/km (CNR, 2026) [V4] [NR], réduit pour un petit utilitaire, + assurance [E] ; haute : barème kilométrique fiscal hors carburant ≈ 0,43 €/km [V5] [N] |

Le coût du km saisi sur chaque point de vente (0,23 / 0,36 / 0,56 €) est celui de la fourgonnette (consommation × prix du litre ÷ 100 + frais au km) ; il ne sert que si la fourgonnette est supprimée.

## 7. Points de vente et séances (`POINTS_VENTE`, `SEANCES`)

| Point de vente | Jour | Distance aller | Frais par séance | Source |
| --- | --- | --- | --- | --- |
| Marché forain de Saint-Pierre (front de mer) | samedi | 13 km [E] | 12 / 15 / 20 € | Samedi matin, environ 500 emplacements, zone agricole [V6] [R] ; tarifs municipaux 2023, reconduits en 2025 : 15 € par jour pour 3 m, 20 € pour 4 m (occasionnel) ; abonnement 55 € par mois pour 3 m, soit environ 12,7 € par séance [V7] [R]. Tarifs 2026 votés le 17/12/2025, non lus |
| Marché forain de Saint-Joseph (halle du Sud Sauvage) | vendredi | 13 km [E] | 5 / 10 / 15 € | Vendredi 6 h-12 h, 114 emplacements [V8] [R] ; redevance fixée chaque année par le conseil municipal, montant non trouvé : analogie avec Saint-Pierre (Ravine des Cabris : 10 € pour 3 m × 3 m) [V7] [E] |
| Paniers de l'AMAPéi | jeudi | 12 km [E] | 0 € | Sur le modèle de l'AMAPéi Mahavel, liée à une ferme de Petite-Île : distribution le jeudi à Bassin Plat (Saint-Pierre) ; contrat payé d'avance ; c'est le mangeur qui adhère [V9] [R] |
| Épicerie de Saint-Pierre | mardi | 12 km [E] | 0 € | L'épicerie paie le prix de revendeur (§ 8) ; une livraison par semaine [E] |

Toutes les séances ont lieu chaque semaine, du 1er janvier au 31 décembre : les marchés forains du Sud n'ont pas de fermeture saisonnière connue [V6] [V8]. Les distances, sans calculateur d'itinéraire, sont des estimations à ± 3 km.

## 8. Débouchés (`DEBOUCHES`)

**Prix.**
- Marchés forains : les prix de détail du § 2 [D5] [D8] [R].
- Paniers : prix de détail médian, sans fourchette [E] ; un panier de l'AMAPéi coûte 18 € [V9] [R] ; le contenu du panier moyen de la ferme (ci-dessous) se valorise à environ 15 € aux prix médians du marché [E].
- Épicerie : prix payé au producteur au marché de gros de Saint-Pierre [D6] [R] :
  - tomate : 1,65 à 3,00 €/kg (février 2026), 2,10 à 2,75 (mai 2026), 4,00 (mai 2022) → 1,5 / 2,5 / 4 ;
  - salade : 0,50 à 0,80 € la pièce → 0,5 / 0,75 / 0,8 ;
  - brède : 0,90 à 1,00 € la botte, haute [E] → 0,9 / 1 / 1,45 ;
  - carotte : 2,00 €/kg (1,75 à 2,50) → 1,75 / 2 / 2,5 ;
  - chou : 1,50 à 3,00 € la pièce → 1,2 / 1,75 / 3 ;
  - haricot : 2,50 à 4,00 €/kg → 2 / 2,5 / 4 ;
  - petit piment : 10 €/kg (9 à 10), haute [E] → 9 / 10 / 12.

  Un revendeur paie en moyenne 65 % du prix forain (45 à 95 %) [E, calculé sur des paires de cotations DAAF].
- Œufs : marchés 0,35 / 0,45 / 0,53 € l'œuf. Sur les marchés forains, le plateau de 30 standard vaut 8,50 à 10,50 €, soit 0,28 à 0,35 € (2025-2026) [D5] [R]. En grande surface, la boîte de 6 plein air vaut 3,16 €, soit 0,53 € l'œuf (09/09/2025) [D7] [R]. Plein air vendu en direct : entre les deux [E]. Paniers : 0,50 € (la boîte de 6 à 3 €) [E].
- **Pas d'œufs à l'épicerie.** Sous 250 poules, la vente directe sans centre d'emballage n'est permise qu'au consommateur final ; un revendeur demande un centre d'emballage agréé [R1] [R2] [N].
- **Ail sans débouché détaillé.** Il est vendu en fin de saison à la Fête de l'ail de Petite-Île (fin octobre) et à des collecteurs [P5] ; l'outil le compte au prix de la culture (15 / 20 / 25 €/kg).

**Volumes vendables par séance.** Aucune source réunionnaise ne chiffre ce qu'un étal vend par marché, ni ce que contient un panier. Ce sont donc des estimations [E] :
- **Marché de Saint-Pierre** : volumes du rapport de recherche pour un étal (60 à 150 clients, panier moyen de 8 à 15 €) ; ceux de la salade et des brèdes sont ramenés à ce que produit un actif seul.
- **Marché de Saint-Joseph** : environ la moitié de Saint-Pierre, pour un marché plus petit (114 emplacements contre environ 500).
- **Paniers** : 20 / 35 / 60 paniers par semaine, comme le rapport sur les prix. Les rapports sur les débouchés et les charges proposent plutôt 15 à 30 paniers pour un actif qui tient aussi deux marchés : la borne basse les couvre. Contenu d'un panier moyen : 1 kg de tomate, 1 salade, 1 botte de brèdes, 0,5 kg de carotte, 1 kg de chouchou, un demi-chou, 0,25 kg de haricot, 0,5 kg de courgette et 6 œufs.
- **Épicerie** : volumes réduits par rapport au rapport de recherche (40 à 150 kg de légumes par livraison) pour rester dans la production de la ferme.

Le tableau complet des débouchés :

| Point de vente | Produit | Prix (€) | Volume par séance |
| --- | --- | --- | --- |
| Marché de Saint-Pierre | Tomate (kg) | 2 / 3,5 / 7,5 | 15 / 30 / 60 |
| Marché de Saint-Pierre | Salade (pièce) | 1 / 1,15 / 1,5 | 20 / 40 / 80 |
| Marché de Saint-Pierre | Brède (botte) | 1 / 1,25 / 2,2 | 15 / 30 / 60 |
| Marché de Saint-Pierre | Chou (pièce) | 1 / 1,85 / 3,5 | 10 / 20 / 40 |
| Marché de Saint-Pierre | Carotte (kg) | 2,3 / 2,7 / 3,5 | 10 / 20 / 40 |
| Marché de Saint-Pierre | Haricot (kg) | 5 / 5,5 / 7 | 4 / 8 / 15 |
| Marché de Saint-Pierre | Courgette (kg) | 1,5 / 2 / 4,1 | 8 / 15 / 30 |
| Marché de Saint-Pierre | Concombre (pièce) | 0,75 / 1,17 / 3 | 12 / 25 / 50 |
| Marché de Saint-Pierre | Piment (kg) | 12,5 / 19 / 25 | 0,2 / 0,5 / 1 |
| Marché de Saint-Pierre | Chouchou (kg) | 1 / 1,5 / 5,5 | 10 / 25 / 50 |
| Marché de Saint-Pierre | Œufs (œuf) | 0,35 / 0,45 / 0,53 | 150 / 300 / 600 |
| Marché de Saint-Joseph | Tomate (kg) | 2 / 3,5 / 7,5 | 8 / 15 / 30 |
| Marché de Saint-Joseph | Salade (pièce) | 1 / 1,15 / 1,5 | 10 / 20 / 40 |
| Marché de Saint-Joseph | Brède (botte) | 1 / 1,25 / 2,2 | 8 / 15 / 30 |
| Marché de Saint-Joseph | Chou (pièce) | 1 / 1,85 / 3,5 | 5 / 10 / 20 |
| Marché de Saint-Joseph | Carotte (kg) | 2,3 / 2,7 / 3,5 | 5 / 10 / 20 |
| Marché de Saint-Joseph | Haricot (kg) | 5 / 5,5 / 7 | 2 / 4 / 8 |
| Marché de Saint-Joseph | Courgette (kg) | 1,5 / 2 / 4,1 | 4 / 8 / 15 |
| Marché de Saint-Joseph | Concombre (pièce) | 0,75 / 1,17 / 3 | 6 / 12 / 25 |
| Marché de Saint-Joseph | Piment (kg) | 12,5 / 19 / 25 | 0,1 / 0,25 / 0,5 |
| Marché de Saint-Joseph | Chouchou (kg) | 1 / 1,5 / 5,5 | 5 / 12 / 25 |
| Marché de Saint-Joseph | Œufs (œuf) | 0,35 / 0,45 / 0,53 | 75 / 150 / 300 |
| Paniers | Tomate (kg) | 3,5 / 3,5 / 3,5 | 20 / 35 / 60 |
| Paniers | Salade (pièce) | 1,15 / 1,15 / 1,15 | 20 / 35 / 60 |
| Paniers | Brède (botte) | 1,25 / 1,25 / 1,25 | 20 / 35 / 60 |
| Paniers | Carotte (kg) | 2,7 / 2,7 / 2,7 | 10 / 17,5 / 30 |
| Paniers | Chou (pièce) | 1,85 / 1,85 / 1,85 | 10 / 17,5 / 30 |
| Paniers | Haricot (kg) | 5,5 / 5,5 / 5,5 | 5 / 8,75 / 15 |
| Paniers | Courgette (kg) | 2 / 2 / 2 | 10 / 17,5 / 30 |
| Paniers | Chouchou (kg) | 1,5 / 1,5 / 1,5 | 20 / 35 / 60 |
| Paniers | Œufs (œuf) | 0,5 / 0,5 / 0,5 | 120 / 210 / 360 |
| Épicerie | Tomate (kg) | 1,5 / 2,5 / 4 | 10 / 20 / 40 |
| Épicerie | Salade (pièce) | 0,5 / 0,75 / 0,8 | 8 / 15 / 30 |
| Épicerie | Brède (botte) | 0,9 / 1 / 1,45 | 5 / 10 / 20 |
| Épicerie | Carotte (kg) | 1,75 / 2 / 2,5 | 10 / 20 / 40 |
| Épicerie | Chou (pièce) | 1,2 / 1,75 / 3 | 5 / 10 / 20 |
| Épicerie | Haricot (kg) | 2 / 2,5 / 4 | 2 / 4 / 8 |
| Épicerie | Piment (kg) | 9 / 10 / 12 | 0,2 / 0,5 / 1 |

Le calibrage vise une ferme réaliste. La demande d'un débouché ne dépasse pas de beaucoup la production, sauf hors saison. La matrice offre-demande montre donc des semaines en excédent, d'autres en manque, et la ligne de l'ail sans débouché.

## 9. Poules (`LOTS`)

| Champ | Valeur | Source |
| --- | --- | --- |
| Organisation | Deux lots de 100 poules, décalés de six mois | Pour des œufs en continu, installer un nouveau lot 3 à 4 mois avant la réforme du précédent (Idele et Chambre d'agriculture de La Réunion, 2020) [H1] [R]. Deux lots de 100 : jamais plus de 200 poules présentes, sous le seuil de 250 de la vente directe sans centre d'emballage [R1] [N] |
| Dates | Lot d'octobre (arrivé l'année précédente) : en ponte du 01/01 au 15/11 ; lot d'avril : arrivée le 06/04, ponte dès le 27/04, jusqu'au 31/12 | Poulettes de 16 à 18 semaines, ponte 2 à 5 semaines après l'arrivée, 12 à 14 mois de ponte [H2] [H3] [NR] ; arrivées hors de la saison chaude [E]. Les dates sont ramenées à l'année de chargement (le lot d'avril part à la réforme en mai de l'année suivante) |
| Ponte | 0,66 / 0,72 / 0,80 œuf par poule et par jour | Taux de ponte de 73 % (cas courant) et 80 % (objectif), poules au sol, Guadeloupe 2020 [H2] [NR]. Basse et médiane : corrigées d'une mortalité de 12 à 18 % [H2], l'outil n'ayant pas de champ « mortalité » ; haute : l'objectif de 80 %, non corrigé (plafond génétique ≈ 0,82) |
| Pertes | 6 % | 3 / 6 / 10 % [E] : autoconsommation 1 à 2,5 %, œufs cassés ou sales ; aucune source chiffrée |
| Aliment | 105 / 115 / 130 g par poule et par jour | 112 g par jour en ponte (Guadeloupe, Guyane) [H2] [H3] [NR] ; − 4 à − 10 g par forte chaleur [H4] [NR] ; un peu plus en plein air [E] |
| Prix de l'aliment | 0,60 / 0,80 / 1,00 €/kg | Aliment volaille Urcoopa en vrac 572 à 607 €/t (décembre 2022) [H5] [R] ; aliment pondeuse 545 €/t (Guadeloupe 2021) [H2] [NR] ; en sacs et avec la hausse du fret de 2026, plus cher [E] |
| Prix de l'œuf (sans débouché) | 0,30 / 0,35 / 0,45 € | Marchés forains 0,30 à 0,35 € (2025) [D5] ; sert seulement si les débouchés d'œufs sont supprimés |

Repère de la filière : 151 millions d'œufs en 2024, autosuffisance en œufs frais, une quarantaine de petits producteurs indépendants en plein air [D9] [R].

## 10. Charges fixes (`CHARGES`)

| Charge | Montant (€) | Période | Source |
| --- | --- | --- | --- |
| Cotisations sociales de l'exploitant (CGSS) | 800 / 1 650 / 2 750 | an | À La Réunion, la CGSS gère le régime agricole ; sous 40 ha pondérés, l'exploitant est exonéré d'AMEXA, de retraite de base et de prestations familiales [S1] [R]. Restent l'ATEXA (≈ 528 €), les indemnités journalières (≈ 250 €), la retraite complémentaire (875 € au minimum) et la formation, au barème national 2026 [S2] [N] ; haute : sans l'exonération, au cas où elle ne s'appliquerait pas [E] |
| Assurance de l'exploitation | 400 / 900 / 1 800 | an | Aucun tarif réunionnais ; repères commerciaux de l'Hexagone : 800 à 1 200 € par an pour une petite exploitation [S3] [NR, source faible] ; les abris sont mal couverts face aux cyclones, les non-assurés relèvent du FSOM [S4] [R] |
| Eau d'irrigation (périmètre du Sud) | 130 / 340 / 600 | an | Tarif agricole du périmètre irrigué du Sud : 0,0870 € HT/m³ au 01/01/2024 (SAPHIR) [W2] [R], porté à 0,09 et 0,10 en médiane et haute pour l'indexation depuis 2024 [E] ; volume [E] : 2 000 / 4 000 / 6 000 m³ par ha et par an sur 0,5 ha irrigué ; + part fixe liée au débit souscrit, illisible dans la source (40 / 160 / 300 €) [E] |
| Eau du réseau (lavage, poules) | 80 / 220 / 410 | an | Prix moyen de l'eau potable à La Réunion : 2,74 € TTC/m³ au 01/01/2024 [W3] [R] ; 30 / 80 / 150 m³ par an [E] |
| Électricité | 30 / 55 / 95 | mois | EDF Réunion, tarif Bleu non résidentiel au 01/02/2026 : 14,2252 c€/kWh HT, abonnement 167 à 230 € par an [S5] [R] (grille du 01/08/2026 : 14,4652 c€/kWh) ; + accise ≈ 3 c€/kWh [S6] [N] ; 1 000 / 2 500 / 5 000 kWh par an (chambre froide, poulailler) [E] |
| Fermage | 200 / 450 / 900 | an | À La Réunion, le fermage se compte en quantités de denrées fixées par arrêté préfectoral [S7] [R] ; aucun montant en € par ha trouvé ; valeur des terres : 15 000 €/ha (littoral non irrigué) à 20 000 €/ha (irrigué) en 2023 [S8] [R], 11 000 €/ha dans les Hauts (site non officiel) [S8b] ; × 1,2 à 3 % par an × 1,5 ha [E] |
| Comptabilité | 200 / 900 / 2 000 | an | Centre de gestion 150 à 200 € par an contre plus de 2 000 € pour un cabinet [S9] [NR, témoignage] ; bilan 900 à 3 000 € HT [S9] [NR] |
| Amortissement du matériel et de l'irrigation | 1 000 / 3 200 / 7 000 | an | Motoculteur ou micro-tracteur, goutte-à-goutte, chambre froide, petit matériel, prix de l'Hexagone [S10] [NR], amortis sur 7 à 10 ans [E] |
| Amortissement des tunnels | 1 800 / 3 320 / 6 680 | an | 4,5 / 8,3 / 16,7 € par m² et par an × 400 m² : tunnel de 45 €/m² sur 10 ans, abri renforcé de 100 et 200 €/m² sur 12 ans [E], bornés par le tunnel de l'Hexagone (39 à 56 €/m²) [S11] [NR] et la serre anticyclonique réunionnaise (≈ 350 €/m²) [S12] [R] |
| Achat des poulettes | 1 700 / 2 210 / 3 100 | an | 200 poulettes tous les 14 mois environ, soit 170 par an × 10 / 13 / 18 € : aucun prix réunionnais trouvé ; poulettes prêtes à pondre de 13,60 à 18 € au détail dans l'Hexagone (2026) [H6] [NR] ; basse : prix de groupe [E] |

Total : environ 6 700 / 13 850 / 26 400 € par an. Repère : en 2020, les maraîchers suivis par le RICA à La Réunion avaient environ 10 800 € de charges courantes par ha, salaires compris [S13] [R] ; sans salarié, de l'ordre de 5 000 à 6 000 € par ha [E].

## 11. Ce que donne la ferme (année 2026)

Calcul de l'outil (`Calc.tableau`, `Calc.chiffresCles`), médiane et fourchette :
- **Chiffre d'affaires** : 45 500 € (21 100 à 99 700). Les cultures font 31 500 €, dont la tomate 13 400 et la salade 5 000 ; les œufs, 14 100 €.
- **Coûts déduits** : 12 800 €, dont séances de vente 3 200, aliment 5 400, semences, plants et intrants 4 200.
- **Marge** : 32 800 € (2 900 à 90 700) ; charges fixes : 13 850 € (6 670 à 26 380) ; **revenu** : 18 900 € (− 23 510 à 84 000).
- **Repère** : en 2017, l'EBE moyen des exploitations maraîchères suivies par le RICA à La Réunion était de 37 667 € pour 3,72 ha [S13] [R]. Ramené à 1,5 ha, l'ordre de grandeur est le même.

## 12. Limites et documents à relire

1. Aucun document n'a été ouvert en entier (proxy) : relire en priorité le barème des calamités 2023-2025 [D1], les mercuriales citées [D5] [D6] [D7], la fiche laitue de l'ARMEFLHOR [A1], la grille SAPHIR [W2], la grille EDF [S5], le RICA 2017-2024 [S13].
2. Valeurs estimées [E], sans source réunionnaise directe : prix des plants et des semences, intrants, pertes, la plupart des délais avant récolte et des durées de récolte, densités, poids d'une botte, surfaces et dates des plantations, volumes vendables, distances, frais de séance de Saint-Joseph (analogie), consommation du véhicule et frais au km, volumes d'eau, consommation électrique, fermage, assurance, comptabilité, amortissements, prix de la poulette, montants des cotisations (barème national, pas DOM).
3. Le calendrier cultural réunionnais (Pilon Pilé 2024, GAB 2020, Agreste n°100) n'a pas pu être lu ; le calendrier du § 5 est construit d'après les contraintes sourcées.
4. Les valeurs sont des repères pour montrer l'outil, pas des références pour une ferme réelle ; elles restent à faire relire par un maraîcher du Sud.

## 13. Sources

Consultées le 15/10/2026, par les extraits du moteur de recherche.

**DAAF de La Réunion, Agreste [R]**
- [D1] *Barème départemental d'indemnisation des calamités agricoles 2023-2025* (novembre 2023). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/bareme_calamites_agricoles_23-25.pdf
- [D2] *Filière légumes* (22/11/2023, données du RA 2020). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20231122_filiere_legumes.pdf
- [D3] *2023 : le nombre de producteurs de fruits et légumes se maintient et les surfaces progressent* (enquête ESEA 2023). https://daaf.reunion.agriculture.gouv.fr/2023-le-nombre-de-producteurs-de-fruits-et-legumes-se-maintient-et-les-surfaces-a4162.html
- [D4] Agreste La Réunion, *Analyses* n° 100, *La culture des légumes : chou, carotte, salade, tomate* (avril 2016). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/Culture_Legumes-1_cle0954f7.pdf
- [D5] Mercuriales, prix au détail sur les marchés forains : 02/05/2025, 16/05/2025, 13/06/2025, 11/07/2025, 05/09/2025, 03/10/2025, 05/12/2025, 19/12/2025, 06/02/2026, 20/02/2026, 04/03/2022, 16/09/2022 — https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/AAAAMMJJ_mer_detail_forains__legfruits.pdf (par exemple https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20251003_mer_detail_forains__legfruits.pdf)
- [D6] Mercuriales, cours production du marché de gros de Saint-Pierre : 02/10/2024, 06/01/2025, 26/03/2025, 18/06/2025, 30/07/2025, 08/09/2025, 10/12/2025, 31/12/2025, 02/02/2026, 11/02/2026, 18/02/2026, 04/05/2026, 27/05/2026, 04/05/2022 — https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/AAAAMMJJ-mer-productions_legfruits.pdf (par exemple https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20260504-mer-productions_legfruits.pdf)
- [D7] Mercuriale, prix au détail en grandes et moyennes surfaces, 09/09/2025. https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20250909-merc-detail-gms-legfruits.pdf
- [D8] Bulletins mensuels « Prix des fruits et légumes » (janvier, mai, septembre, décembre 2025) : `com-grdpub-jan2025.pdf`, `com-grdpub-mai2025.pdf`, `com-grdpub-septembre2025.pdf`, `com-grdpub-decembre2025.pdf` ; index : https://daaf.reunion.agriculture.gouv.fr/les-mercuriales-2025-r1164.html
- [D9] *Fiche filière n° 7, Œufs et ovoproduits* (août 2025). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/202508_filiere_oeufs_2025.pdf
- [D10] Agreste / DAAF de La Réunion, productions de fruits et légumes 2019 (chouchou), cité par Linfo.re, *La tomate : La Réunion en autosuffisance*. https://www.linfo.re/la-reunion/societe/la-tomate-la-reunion-en-autosuffisance

**Recherche et références techniques [R]**
- [A1] ARMEFLHOR, *Produire de la laitue batavia en AB à La Réunion* (fiche technique 2023). https://www.armeflhor.fr/wp-content/uploads/2024/06/2023-FICHE-TECHNIQUE-Itineraire-Laitue-en-AB-BD.pdf
- [A2] ARMEFLHOR, *Fertile* n° 42, rapport d'activité 2017 (décembre 2018). https://www.armeflhor.fr/wp-content/uploads/2021/10/Fertile_42_Rapport-activite-2017.pdf
- [A4] ARMEFLHOR, *Fertile* n° 56 (juin 2023) et numéros précédents (Farao F1, Lambert). https://www.armeflhor.fr/wp-content/uploads/2023/06/FertileN56-RAV4-BAT-BD.pdf
- [A5] ARMEFLHOR, *Fertile* n° 46 (décembre 2019) et n° 53 (juin 2022) : passage de la tomate sous serre. https://www.armeflhor.fr/wp-content/uploads/2021/10/FERTILE_46.pdf
- [A6] ARMEFLHOR, *Fertile* n° 50, rapport d'activité 2020 (juin 2021) : carotte d'été. https://www.armeflhor.fr/wp-content/uploads/2021/08/Fertile50-Rapport-2020.pdf
- [C1] Chambre d'agriculture de La Réunion (Agribio), *Fiche technique chouchou* (octobre 2023). https://agribio.reunion.chambagri.fr/wp-content/uploads/2023/10/Fiche-technique-chouchou-1.pdf
- [C2] Chambre d'agriculture de La Réunion (Agribio), *Pratique culturale – Gingembre*. https://agribio.reunion.chambagri.fr/fiche/pratique-culturale-gingembre/
- [C3] CIRAD, S. Simon et J. Minatchy, *Guide de la tomate hors sol à La Réunion* (2009) ; CIRAD, travaux sur le flétrissement bactérien et les variétés de tomate. https://agritrop.cirad.fr/548058/ ; https://agritrop.cirad.fr/578386/
- [C4] Multiplantes (https://www.multiplantes.fr/production-plants-legumes.php) et HGM Pépinière (https://www.hgm-pepiniere.re/plants-legumes.php) : offre de plants, sans prix publié.
- [G1] J.-P. Deguine et al., *Gestion agroécologique des mouches des légumes à La Réunion*, Innovations Agronomiques 28 (2013) ; rapport du séminaire final GAMOUR (2011). https://hal.inrae.fr/hal-02643298/document ; https://unt.univ-reunion.fr/fileadmin/Fichiers/UNT/UVED/IBAR/chapitre3/res/Rapportgamour.pdf
- [G2] GECO / Ecophytopic, *Réduction des IFT sur tomate de plein champ à La Réunion* (RESCAM, 2014-2018). https://geco.ecophytopic.fr/geco/Concept/Reduction_Des_Ift_Sur_Tomate_De_Plein_Champ_A_La_Reunion
- [M1] Normales climatiques 1991-2020 de Météo-France, station du Tampon, reprises par Wikipédia. https://en.wikipedia.org/wiki/Le_Tampon

**Presse et institutions [R]**
- [P1] FreshPlaza, *La Réunion : les prix des fruits et légumes augmentent de 19 % après le cyclone Garance* (2025) ; Journal.re, *Les prix des fruits et légumes restent sous tension en avril et mai 2025*. https://www.freshplaza.fr/article/9733935/la-reunion-les-prix-des-fruits-et-legumes-augmentent-de-19-apres-le-cyclone-garance/ ; https://www.journal.re/consommation/les-prix-des-fruits-et-legumes-restent-sous-tension-a-la-reunion-en-avril-et-mai-2025.html
- [P2] La 1ère Réunion, *Le prix des tomates en augmentation à La Réunion* (vers septembre 2026). https://la1ere.franceinfo.fr/reunion/le-prix-des-tomates-en-augmentation-a-la-reunion-1737968.html
- [P3] Freedom, *Fruits et légumes : les tendances des marchés forains en juin 2025* (22/07/2025). https://freedom.fr/fruits-et-legumes-les-tendances-des-marches-forains-a-la-reunion-en-juin-2025/
- [P5] La 1ère Réunion, *L'ail péi en fête à Petite-Île malgré une production en baisse cette année* (2024). https://la1ere.franceinfo.fr/reunion/petite-ile/l-ail-pei-en-fete-a-petite-ile-malgre-une-production-en-baisse-cette-annee-1531216.html
- [P6] Linfo.re, *L'ail péi : toujours de qualité pour cette nouvelle saison*. https://www.linfo.re/la-reunion/societe/l-ail-pei-peu-de-producteur-mais-une-bonne-qualite
- [P7] Assemblée nationale, question écrite n° 6335, 16e législature (2023) : engrais de 700 à 1 500 €/t. https://www.assemblee-nationale.fr/dyn/16/questions/QANR5L16QE6335.pdf

**Ventes, trajets, eau [R]**
- [V3] Prix maximum des carburants fixés par le préfet : Ko@fé (30/09/2026), Prix-carburant.eu, communiqués de la préfecture (25/03, 29/04 et 30/06/2026). https://www.koafe.info/index.php/2026/09/30/1er-octobre-2-e-sans-plomb-et-180-e-gasole/ ; https://prix-carburant.eu/article/prix-carburants-outre-mer-prefet-fixe-prix-chaque-mois ; https://guide-reunion.fr/fileadmin/images/actus/gaz-carburant/2026-04-29-communique-prix-du-carburant-en-mai-2026.pdf
- [V6] SPL OPUS, *Le marché forain* de Saint-Pierre. https://www.marchesdesaintpierre.re/le-marche-forain/
- [V7] Ville de Saint-Pierre, *Tarifs des marchés de plein air* (2023) et ordre du jour du bureau municipal du 05/12/2024 (tarifs 2025). https://www.saintpierre.re/sites/default/files/2023-02/Tarifs%20des%20march%C3%A9s%20de%20plein%20air.pdf ; https://www.saintpierre.re/sites/default/files/2024-12/OdJ%20Bureau%20municipal%2020241205.pdf
- [V8] Ville de Saint-Joseph, *Marché forain du Sud Sauvage*. https://saintjoseph.re/Marche-forain-du-Sud-Sauvage
- [V9] Cetanou, fiche *AMAPéi Sud Réunion* (2022) ; Ti'Légumes Bio, *AMAPéi* ; Département de La Réunion, *Les AMAPéi à La Réunion*. https://www.cetanou.com/annuaire974/amapei-sud-reunion/ ; https://tilegumesbio.re/amapei/ ; https://www.departement974.fr/actualite/les-amapei-reunion
- [W1] Département de La Réunion, fiche *Bras de la Plaine* et *Rencontres de l'eau* (novembre 2015) ; Leader Réunion, *Les périmètres irrigués du Sud vont s'étendre* ; dossier de presse sur les périmètres irrigués du Sud (décembre 2025). https://departement974.fr/sites/default/files/bras_de_la_plaine.pdf ; https://departement974.fr/sites/default/files/2017-10/rencontres-de-leau-novembre2015.pdf ; https://www.leaderreunion.fr/en/les-perimetres-irrigues-du-sud-vont-setendre/ ; https://www.departement974.fr/sites/default/files/ddp_pisud_1.pdf
- [W2] SAPHIR, *Annexe 11 – Avenant 2 Sud 2022* : tarification de l'eau au 01/01/2024. https://www.saphir.re/wp-content/uploads/ANNEXE-11-AVENANT-2-SUD-2022.pdf
- [W3] Office de l'eau Réunion, *Chroniques de l'eau* n° 141 (août 2024). https://www.eaureunion.fr/fileadmin/user_upload/Chroniques/2024/24.08.06_CHRONIQUES_de_L_EAU_141.pdf

**Poules [R, NR]**
- [H1] Idele et Chambre d'agriculture de La Réunion, *Se diversifier avec un atelier de poulets fermiers ou de poules pondeuses* (08/09/2020). https://idele.fr/reseaux-de-references-en-elevage-dom/publications
- [H2] ODEADOM et Idele, *Système poules pondeuses au sol, Guadeloupe*, conjoncture 2020 (avril 2022) [NR]. https://www.odeadom.fr/wp-content/uploads/2022/04/Referentiel-Pondeuses-Guadeloupe-conj2020-est2021-vf.pdf
- [H3] ODEADOM et Idele, *Poules pondeuses en filière organisée en Guyane* (2018) [NR]. https://www.odeadom.fr/wp-content/uploads/2018/05/Poules-pondeuses-en-Guyane-RRE-DOM-2018.pdf
- [H4] Réussir Volailles, *Nutrition des poules : modifier l'aliment pour limiter le stress thermique* [NR]. https://www.reussir.fr/articles/nutrition-des-poules-modifier-laliment-pour-limiter-le-stress-thermique
- [H5] Idele, Chambre d'agriculture de La Réunion et URCOOPA, *Référentiel Volailles de chair, conjoncture 2022, La Réunion* (2023). https://idele.fr/fileadmin/user_upload/Referentiel_RRE_Volailles_de_chair_conj2022_Reunion.pdf
- [H6] Prix de détail des poulettes prêtes à pondre dans l'Hexagone (2026) : Ferme de Bel-Air, Élevage Gamp, Ferme avicole Declerck [NR]. https://www.fermedebelair.fr/tarifs-poules-volailles.html ; https://www.elevage-gamp.com/tarif ; https://www.fermeavicoledeclerck.fr/les-animaux/les-pondeuses.html

**Réglementation des œufs [N]**
- [R1] DGCCRF, *FAQ sur la commercialisation des œufs* (2026) ; notice du Cerfa 15296 (déclaration de vente directe, service compétent : DAAF dans les DOM). https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/professionnels-les-reponses-vos-questions-faq-sur-la-commercialisation-des-oeufs ; https://www.formulaires.service-public.gouv.fr/gf/getNotice.do?cerfaNotice=51958&cerfaFormulaire=15296
- [R2] Chambre d'agriculture des Pays de la Loire, *Quelles règles pour vendre ses œufs en circuits courts ?* https://pays-de-la-loire.chambres-agriculture.fr/tous-les-dossiers/detail-dossier/quelles-regles-pour-vendre-ses-oeufs-en-circuits-courts

**Charges [R, N, NR]**
- [S1] CGSS Réunion, *La Sécurité sociale et le monde agricole* (mai 2023) ; MSA – CGSS Réunion, *Les autres mesures d'exonération*. https://www.cgss.re/sites/default/files/fichiers_publics/publicationsPdf/livret_agricole_29_06_2023.pdf ; https://reunion.msa.fr/lfp/en/autres-exonerations
- [S2] MSA, *Barème des cotisations et contributions sociales des non-salariés agricoles 2026* [N]. https://www.msa.fr/lfp/documents/11566/41428048/Bar%C3%A8me+des+cotisations+et+contributions+sociales+des+non+salari%C3%A9s+agricoles+2026
- [S3] Modelesdebusinessplan.com, *Maraîchage : estimation du budget* ; LegalPlace, *Assurance professionnelle agricole* (2026) [NR, sources commerciales]. https://modelesdebusinessplan.com/blogs/infos/maraichage-estimation-budget-outil ; https://www.legalplace.fr/guides/assurance-professionnelle-agricole/
- [S4] DEAL Réunion, *Présentation FSOM et CatNat* (2022). https://www.reunion.developpement-durable.gouv.fr/IMG/pdf/2_a-presentation_fsom_et_catnat_2022.pdf
- [S5] EDF Réunion, *Grille de prix du tarif Bleu non résidentiel, tarifs HT* (01/02/2026). https://reunion.edf.fr/sites/sei_reu/files/2026-02/bleu_collectivite_reunion.pdf
- [S6] EDF Entreprises, *Qu'est-ce que l'accise sur l'électricité ?* [N]. https://www.edf.fr/entreprises/faq-entreprises/facture/les-taxes-evolutions-tarifaires-en-electricite/qu-est-ce-que-l-accise-sur-l-electricite
- [S7] DAAF de La Réunion, *Parution de l'arrêté préfectoral déterminant le prix des denrées fermage pour 2025* ; SAFER Réunion, *Foncier*. https://daaf.reunion.agriculture.gouv.fr/parution-de-l-arrete-prefectoral-determinant-le-prix-des-denrees-fermage-pour-a3034.html ; https://www.safer-reunion.fr/foncier
- [S8] Agreste La Réunion, *Valeur vénale des terres agricoles 2023* (septembre 2024). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/etude_vvt_2023.pdf
- [S8b] Le-prix-des-terres.fr, *DOM – Île de la Réunion* (site non officiel, 2024). https://www.le-prix-des-terres.fr/reunion/
- [S9] Legalnest, *Agriculteur : quels sont les meilleurs comptables ?* ; forum CommentÇaMarche, *Comptabilité exploitation agricole* [NR, sources faibles]. https://www.legalnest.fr/expert-comptable/activite/agricole ; https://droit-finances.commentcamarche.com/forum/affich-4099080-comptabillite-exploitation-agricole
- [S10] Terre-net (goutte-à-goutte) ; Pubert (motoculteurs) [NR]. https://www.terre-net.fr/observatoire-technique-culturale/strategie-technique-culturale/article/francis-bourges-efficience-amelioree-temps-gagne-et-image-redoree-217-104037.html ; https://pubert.com/en/?p=6025
- [S11] Hellopro, *Combien coûte une serre agricole ?* [NR]. https://conseils.hellopro.fr/combien-coute-une-serre-agricole-1342.html
- [S12] DR-AW, *Serres anticycloniques* ; L'Usine Nouvelle, *La Réunion, parfait laboratoire de l'agrivoltaïsme*. https://www.dr-aw.fr/projets/serres-anticycloniques/ ; https://www.usinenouvelle.com/article/la-reunion-ile-aux-tresors-d-agri-energie.N2217231
- [S13] DAAF de La Réunion, *Résultats économiques des exploitations agricoles à La Réunion en 2017* (RICA, 2019) ; *2020, une année favorable pour la plupart des exploitations* (2022). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/RICA_publi_2019_cle0feb2f-2.pdf ; https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20220427_Publi_RICA_Resultats_2020_VF_cle02568a.pdf

**Références non réunionnaises [NR]**
- [N1] Polynésie française, DAG, *La culture du concombre en agriculture biologique* (2018) ; CIRAD Mayotte, *Comparaison de sept variétés de concombre sous tunnel* (2007). https://www.service-public.pf/dag/wp-content/uploads/sites/28/2018/03/FTC-Concombre-PF.pdf ; https://agritrop.cirad.fr/541646/1/ID541646.pdf
- [N2] Pak-choï et petsaï : V3R, fiche *Chou chinois Pak choi* (2023) ; essais WorldVeg et GRAB. https://www.v3r.net/wp-content/uploads/2023/03/Chou-chinois-Pak-choi-Shanghai-Bio-fiche-technique.pdf
- [N3] CIRAD-FLHOR, *Fiches techniques cultures maraîchères, îles Australes* (2000). https://www.service-public.pf/sdr/wp-content/uploads/sites/28/2017/05/2_B_4_Legumes_aux_australes.pdf
- [N4] LPC Bio, *ITK carotte* ; C.A.B., *Fiches technico-économiques* (2020). http://www.lpcbio.org/PDF/fiche-lpc-ITK-carotte.pdf ; https://www.la-cab.fr/wp-content/uploads/2020/10/touteslesfiches.pdf
- [N5] Lycée horticole (Boutique Bio 56), *Jeunes plants de légumes bio, tarifs professionnels 2022* ; plants-maraichers.com, prix des plants professionnels. https://boutiquebio56.fr/wp-content/uploads/2021/12/lycee-horticole-catalogue-tarifs-pro-legumes-2022.pdf ; https://plants-maraichers.com/collections/plants-professionnels-tomates
- [N6] Jardiner Malin, *Carotte nantaise, 1 000 graines*. https://www.jardiner-malin.fr/boutique/carotte-nantaise-1000-graines
- [N7] Chambre d'agriculture d'Occitanie, *Fiche technico-économique haricot vert de plein champ* (2013). https://agri82.chambre-agriculture.fr/fileadmin/user_upload/National/FAL_commun/publications/Occitanie/FTE_haricotvert_plein_champ_2013.pdf
- [N8] DRAAF Bourgogne-Franche-Comté, *Le maraîchage* (données Cerfrance 2022-2023). https://draaf.bourgogne-franche-comte.agriculture.gouv.fr/IMG/pdf/13-maraichage.pdf
- [N9] A. Prier et J. Huat (CIRAD-FLHOR), *Évaluation agronomique de 3 variétés de courgette sous abri, saison des pluies 2005/2006* (Mayotte, 2006). https://agritrop.cirad.fr/531809/1/ID531809.pdf
- [V1] L'argus, fiche technique Peugeot Partner BlueHDi 100 (2024) ; Autotijd, Renault Kangoo Blue dCi 95. https://www.largus.fr/fiche-technique/Peugeot/Partner/III/2024/Fourgonnette/M+1000kg+BlueHDi+100ch+S&S-2805807.html
- [V2] Spritmonitor, relevés de consommation de Renault Kangoo diesel. https://www.spritmonitor.de/fr/detail/1032823.html?cdetail=1
- [V4] CNR, *Les coûts du déménagement, actualisation juin 2026*. https://www.cnr.fr/download/file/publications/CNR%20-%20les%20co%C3%BBts%20du%20d%C3%A9m%C3%A9nagement%20-%20actualisation%20juin%202026.pdf
- [V5] Barème kilométrique fiscal (arrêté du 27/03/2023, reconduit en 2026) [N] : Weblex, *Barème fiscal 2026*. https://www.weblex.fr/chiffres-cles/bareme-fiscal-de-remboursement-des-frais-kilometriques-2026
