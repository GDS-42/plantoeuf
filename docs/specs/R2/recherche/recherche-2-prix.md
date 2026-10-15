# Recherche 2 : prix de vente et volumes vendables, ferme d'exemple du Sud de La Réunion

Ferme d'exemple : un maraîcher seul sur environ 1,5 ha, à mi-pente dans le Sud (Le Tampon, Petite-Île, Saint-Joseph). Il produit toute l'année et vend en direct : marché forain, paniers hebdomadaires, une épicerie qui paie au prix de revendeur, et les œufs de 200 pondeuses.

Recherche faite le 15/10/2026. Ce document ne traite que les prix de vente et les volumes vendables.

---

## 0. Méthode et niveau de confiance

**Source principale.** Les mercuriales officielles de la DAAF de La Réunion (service SISE), publiées au format PDF sous licence ouverte. Elles couvrent cinq circuits :

| Circuit | Ce que la mercuriale mesure | Fréquence de relevé |
|---|---|---|
| Marché de gros de Saint-Pierre | « Cours production » : prix payés aux producteurs | Deux fois par semaine (lundi et mercredi) |
| Grandes et moyennes surfaces (GMS) | Prix au détail | Chaque semaine (mardi) |
| Marchés forains | Prix au détail | Tous les quinze jours (vendredi) |
| Producteurs bio | Prix de vente des producteurs | Selon calendrier DAAF |
| Épiceries spécialisées bio | Prix au détail | Selon calendrier DAAF |

Règles de lecture des mercuriales :
- Les prix sont **au kilo sauf mention contraire** (« pièce », « botte », « plateau »).
- L'origine « RUN » signifie La Réunion.
- Une cotation marquée « (1) » est « peu représentative » : elle repose sur moins de trois relevés.

Sources complémentaires :
- les bulletins mensuels « Prix des fruits et légumes » de la DAAF ;
- la presse locale (Linfo.re, La 1ère, Imazpress, Zinfos974, Journal.re, Freedom) ;
- une question écrite à l'Assemblée nationale ;
- la fiche filière Œufs de la DAAF.

**Limite technique importante.** Pendant cette session, l'outil de lecture de pages (WebFetch) ne résolvait aucun nom de domaine, et le proxy refusait de télécharger les PDF de `daaf.reunion.agriculture.gouv.fr`. **Toutes les valeurs viennent donc des extraits de PDF et d'articles renvoyés par le moteur de recherche. Aucun PDF n'a été ouvert en entier.** Le quota de recherches (200 par tour, partagé entre tous les agents) a ensuite été épuisé. Conséquences :
- certaines unités n'étaient pas visibles dans les extraits ; elles sont notées « unité à confirmer » ;
- il peut rester des erreurs de lecture de colonne, par exemple une « variation » lue comme un « prix » ;
- les paniers, les volumes et le chiffre d'affaires n'ont pas pu être cherchés en ligne. Ces parties sont des estimations raisonnées.

**Marquage des valeurs dans le document :**

| Marque | Signification |
|---|---|
| `[n]` | Valeur sourcée ; *n* renvoie à la liste numérotée de la section 9 |
| **E** | Estimation de l'agent ; le raisonnement est donné |
| **H** | Référence hors Réunion |
| **?** | Valeur relevée mais douteuse, à vérifier dans le PDF |

---

## 1. Tableau récapitulatif : fourchette basse / médiane / haute par produit et par canal

### 1.1 Comment lire les colonnes

- **Détail marché** : prix payé par le consommateur sur un marché forain ou en bord de champ.
  - *bas* : saison d'abondance, ou minimum relevé.
  - *médiane* : prix moyen habituel hors crise.
  - *haut* : prix moyen en période de pénurie (saison chaude ou après un cyclone). Les pics extrêmes sont donnés à part.
- **Panier** : aucune source réunionnaise ne détaille la valeur des produits dans un panier (voir §6.2). Par défaut, chaque produit est valorisé au **prix médian du détail marché** (E). C'est la pratique courante des systèmes de paniers, qui s'alignent sur le prix du marché.
- **Revendeur / gros** : prix payé au producteur. On prend le cours production du marché de gros de Saint-Pierre comme référence du prix qu'une épicerie paie à un producteur. Quand il manque, on applique le coefficient gros/détail calculé au §5 (≈ 0,65 ; plage 0,45 à 0,95), et la valeur est marquée E.

### 1.2 Tableau

| Produit | Unité | Détail marché bas / méd. / haut (€) | Panier (€) | Revendeur / gros bas / méd. / haut (€) | Sources et remarques |
|---|---|---|---|---|---|
| Tomate (petite, plein champ ou serre) | kg | 2,00 / 3,50 / 7,50 (pic 10) | 3,50 E | 1,50 / 2,50 / 4,00 | Détail : 7,33 (de 6 à 9) le 2/5/2025 [1] ; 6 à 8 en avril 2025 [41] ; 6,90 en avril 2026 [46] ; « plus de 3 » en septembre 2026 [47] ; 10 en 2024 [49] ; tomate serre en épicerie bio 4,09 [35]. Gros : 1,65 à 3,00 en février 2026 [26] ; 2,10 à 2,75 en mai 2026 [29] ; 4,00 (de 3,5 à 4,5) en mai 2022 [31]. Le « bas » du détail est E (gros × 1,3), appuyé sur 1,95 en septembre 2025 [38] ? |
| Tomate cerise / ancienne / grappe | kg | ancienne : 5,50 / 6,00 / 6,90 | 6,00 E | cerise 10,00 à 11,20 ; ancienne 5,00 à 5,50 ; grappe 3,50 à 4,00 | Détail ancienne le 20/2/2026 [11] ; gros le 4/5/2026 [29] |
| Salade batavia | pièce | 1,00 E / 1,15 / 1,50 E | 1,15 E | 0,50 / 0,75 / 0,80 | Détail : 1,15 en mai 2025 [37] et 1,10 en juin 2025 [40]. Gros : 0,70 (de 0,5 à 0,8) en février 2026 [26], 0,80 en mai 2026 [29], 0,70 en mai 2024 [14]. Prix **très stable** toute l'année. Haut E : +30 % en cas de pénurie, sans relevé |
| Brèdes (petsaï, pak-choï, chouchou, citrouille) | botte | 1,00 / 1,25 / 2,20 | 1,25 E | 0,90 / 1,00 / 1,45 E | Détail 2025 : petsaï 1,00 à 1,50, brède chouchou 1,17 à 1,50, pak-choï 1,00 à 1,17, citrouille 1,88 [1][3][4][6] ; mars 2022 : 2,17 (citrouille 2,50) [12]. Gros : 0,90 en octobre 2024 [15], 1,00 en juillet 2025 [19] |
| Brèdes mafane / morelle | botte | ≈ autres brèdes E (1,00 / 1,25 / 2,20) | 1,25 E | ≈ 1,00 E | **Aucune cotation réunionnaise trouvée.** H : brède mafane 1,34 €/botte dans une boutique en ligne comorienne [61] |
| Chouchou | kg | 1,00 / 1,50 / 5,50 (pic 8,90) | 1,50 E | 0,75 / 1,25 / 6,00 | Détail : 1,00 en juin 2025 [40], 1,15 en mai 2025 [37], 1,50 en septembre 2025 [38], **5,48 (de 4 à 8,90) le 6/2/2026** [10]. Gros : 1,25 le 8/9/2025 [20], **6,00 le 2/2/2026** [24], **0,75 (de 0,5 à 0,8) le 4/5/2026** [29] |
| Carotte (avec ou sans fanes) | kg | 2,30 / 2,70 / 3,50 E | 2,70 E | 1,75 / 2,00 / 2,50 | Détail : 2,33 avec fanes en septembre 2022 [13] ; 2,67 avec fanes et 2,83 sans fanes le 6/2/2026 [10]. Gros : 2,00 (de 1,75 à 2,50) le 4/5/2026 [29]. Peu saisonnière |
| Chou pommé (chou vert) | pièce | 1,00 / 1,85 / 3,50 E | 1,85 E | 1,20 / 1,75 / 3,00 | Détail : 1,83 (de 1 à 2,5) le 3/10/2025 [6] ; 2,70 en janvier 2025 [36]. Gros : 1,50 en janvier 2025 [16], 1,75 (de 1,2 à 2) en juillet 2025 [19], 3,00 (de 2 à 3,5) en juin 2025 [18]. Haut détail E, déduit du gros à 3,00 |
| Chou-fleur | pièce | 1,50 / 2,85 / 4,50 E | 2,85 E | 1,50 / 2,00 / 3,00 (max 4) | Détail : 2,83 (de 1,5 à 3,5) le 3/10/2025 [6]. Gros : 1,50 en janvier 2025 [16], 2,00 en juillet 2025 [19], 3,00 (de 3 à 4) en juin 2025 [18] |
| Haricot vert | kg | 5,00 / 5,50 / 7,00 | 5,50 E | 2,00 / 2,50 / 4,00 | Détail : 5,50 (de 5 à 7) le 3/10/2025, après 6,17 au relevé précédent [6]. Gros : 2,50 en janvier et décembre 2025 [16][21], 4,00 (de 3,5 à 4) en juin 2025 [18] |
| Courgette | kg | 1,50 / 2,00 / 4,10 | 2,00 E | 1,20 E / 1,50 E / 3,75 | Détail : 2,00 (de 1,5 à 2,5) en octobre 2025 [6] ; 4,10 en juin 2025 [40]. Gros : 3,75, en hausse, le 18/2/2026 [27] |
| Concombre | pièce (détail) | 0,75 / 1,17 / 3,00 | 1,17 E | 0,60 E / 1,00 / 1,50 E | Détail : 1,17 (de 0,75 à 3) le 5/12/2025 [7]. Gros : 1,00 en janvier 2025 [16], unité non visible (kg ou pièce) |
| Giraumon | kg | 2,00 / 2,83 / 4,00 | 2,83 E | 1,00 E / 1,50 / 2,50 E | Détail : 2,83 (de 2 à 4) le 5/12/2025 [7]. Gros : 1,50 en janvier 2025 [16] |
| Aubergine | kg | 2,00 / 3,00 / 3,80 | 3,00 E | 1,00 / 1,50 / 2,50 E | Détail : 3,00 (de 2 à 4) en octobre 2025 [6], 2,75 (de 1 à 3,5) en décembre 2025 [8], 3,20 en juin 2025 [40], 3,80 en mai 2025 [42]. Gros : 1,00 en janvier 2025 [16], 1,50 le 31/12/2025 [23] |
| Poivron vert | kg | 3,00 / 5,33 / 8,00 (pic 10) | 5,30 E | 2,00 E / 3,50 E / 5,00 E | Détail : 5,33 (de 3 à 8) le 3/10/2025 [6] ; « jusqu'à 10 € » en avril 2025 [41]. Pas de cotation de gros trouvée |
| Poivron rouge ou jaune | kg | 5,95 / 7,98 / 10,00 | 8,00 E | 4,00 E / 5,20 E / 6,50 E | Détail le 3/10/2025 [6] ; en GMS, 10,48 (de 8,99 à 13,99) le 9/9/2025 [32] |
| Gros piment (vert) | kg | 4,50 / 5,83 / 9,00 | 5,80 E | 3,00 E / 3,80 E / 5,90 E | Détail : 5,83 (de 4,5 à 6,5) en octobre 2025 [6] ; 9,00 en juin 2025 [40] |
| Petit piment (zoizo ; correspondance à confirmer) | kg (vendu en sachet) | 12,50 / 19,00 / 25,00 | 19,00 E | 9,00 / 10,00 / 12,00 E | Détail : piment cabri 20,00 (de 15 à 25) en octobre 2025 [6] et 18,75 (de 15 à 22,5) en décembre 2025 [8] ; piment rouge petit 12,50, peu représentatif [8] ; piment vert petit 20,67 en GMS [32]. Gros : piment petit rouge et vert 10,00 (de 9 à 10) en janvier 2025 [16]. La DAAF n'emploie pas le nom « zoizo » |
| Oignon | kg | 2,00 E / 2,65 / 10,00 (pénurie) | 2,65 E | 1,30 E / 1,70 E / 3,00 E | Détail : oignon tête jaune 2,65 le 5/9/2025, origine non confirmée [5] ; 10 €/kg en pénurie en 2024 [49]. Pas de cotation de gros de l'oignon péi trouvée |
| Ail péi (ail violet, Petite-Île) | kg | 15,00 / 25,00 / 33,00 (max 40) | 25,00 E | 18,00 / 20,00 / 20,00 | Détail : 33,33 (de 25 à 40) sur les forains le 5/9/2025 [5] ; 25 à 30 en commerce [52] ; 15 à 20 à la fête de l'ail vers 2024 [51]. Gros : 20,00 (de 18 à 20) en mars et décembre 2025 [17][23]. À comparer à l'ail importé : 5,70 à 6,86 [5][34] |
| Poireau | kg (unité à confirmer) | 2,50 E / 3,00 E / 4,00 E | 3,00 E | 1,50 E / 2,00 / 2,50 | Gros : 2,00, en baisse de 0,50, maximum 2,50, le 4/5/2026 [29]. Pas de cotation au détail trouvée |
| Gingembre | kg | 4,90 / 7,00 / 8,50 | 7,00 E | 4,00 / 5,00 / 6,00 E | Détail : 6,67 (de 4,90 à 8,50) le 5/9/2025 [5] ; 7,65 en décembre 2025 [39]. Gros : 5,00 (de 4 à 5) le 27/5/2026 [30] |
| Curcuma (safran péi), **frais** | kg | 5,00 E / 7,00 E / 10,00 E | 7,00 E | 3,50 E / 4,50 E / 6,50 E | **Pas de cotation du rhizome frais trouvée.** Hypothèse E : prix proche du gingembre (même famille, même rayon). Le curcuma sec ou en poudre se vend 25 à 30 €/kg chez le producteur (2023-2024) [54][55] et 40 à 42,50 €/kg en ligne [56] |
| **Œufs**, standard, plateau de 30 | œuf (plateau) | 0,28 / 0,33 / 0,35 (8,50 / 10,00 / 10,50 le plateau) | 0,35 E | voir §2 | Forains : 8,50 le 16/5/2025 [2], 10,00 le 19/12/2025 [8], 10,50 le 9/1/2026 [9]. Toutes ces cotations sont peu représentatives |
| **Œufs plein air**, boîte de 6 | œuf (boîte) | 0,42 E / 0,50 E / 0,55 (2,50 E / 3,00 E / 3,20 la boîte) | 0,50 E | 0,30 E / 0,35 E / 0,40 E | En GMS le 9/9/2025 : 3,16 la boîte (de 3,09 à 3,20), soit 0,53 €/œuf [32]. Le prix au marché est une estimation E (voir §2) |

**Lecture rapide des écarts de prix :**
- Les prix les plus volatils sont ceux du chouchou (×5 à ×8 entre abondance et pénurie), de la tomate (×2,5 à ×3,5), des brèdes (×2), des choux (×2) et de la courgette (×2).
- La salade, la carotte, l'ail et le gingembre varient peu.

---

## 2. Œufs : détail par canal

| Canal | Format | Prix (€) | €/œuf | Date | Source |
|---|---|---|---|---|---|
| Marché forain | plateau de 30 (RUN) | 8,50, peu représentatif | 0,28 | 16/05/2025 | [2] |
| Marché forain | plateau de 30 (RUN) | 10,00 | 0,33 | 19/12/2025 | [8] (déduit de [9] : 10,50 moins 0,50) |
| Marché forain | plateau de 30 (RUN) | 10,50, peu représentatif | 0,35 | 09/01/2026 | [9] |
| GMS | boîte de 6, « indus » (cage ou sol) | 2,17 (de 2,15 à 2,21) | 0,36 | 09/09/2025 | [32] |
| GMS | boîte de 6, plein air | 3,16 (de 3,09 à 3,20) | 0,53 | 09/09/2025 | [32] |
| GMS | boîte de 6, bio | 4,52 (de 3,75 à 5,19) | 0,75 | 09/09/2025 | [32] |
| GMS | plateau de 20 | 6,39 (de 6,12 à 6,59) | 0,32 | 09/09/2025 | [32] |
| GMS (ancien) | plateau de 30 | 7,15 | 0,24 | 08/02/2022 | [33] |

**Prix payé au producteur (gros ou revendeur).** Aucune donnée réunionnaise trouvée : ni mercuriale « œufs » au marché de gros, ni prix Ovocoop ou syndicat. La fiche filière de la DAAF (août 2025) apporte le contexte [57] :
- 151 millions d'œufs coquille produits en 2024 ;
- autosuffisance en œufs frais ;
- environ 22 éleveurs regroupés au Syndicat des producteurs d'œufs de La Réunion, qui détiennent l'essentiel du cheptel ;
- environ 40 producteurs indépendants en plein air, avec de petits effectifs. C'est le profil de la ferme d'exemple.

**Estimation E du prix revendeur pour des œufs plein air vendus à une épicerie :** 0,30 / 0,35 / 0,40 €/œuf, soit 1,80 à 2,40 € la boîte de 6. Raisonnement : la boîte plein air est vendue 0,53 €/œuf en rayon [32]. Une épicerie qui applique une marge de 25 à 40 % sur le prix de vente paie donc 0,32 à 0,40 €/œuf. Le bas de la fourchette s'aligne sur l'œuf standard vendu au marché (0,28 à 0,35 €/œuf).

**Estimation E du prix plein air en vente directe au marché :** 0,42 / 0,50 / 0,55 €/œuf, soit environ 12,50 / 15,00 / 16,50 € le plateau de 30. Raisonnement : ce prix se situe entre le plateau standard au marché (0,33 €) et la boîte plein air en GMS (0,53 €).

**Repères hors Réunion (H) :**
- En France métropolitaine, le prix à la production des œufs a augmenté de 37,3 % en 2025 [59].
- En vente directe, une boîte de 6 plein air vaut en moyenne 2,40 à 3,30 €, et une douzaine 4 à 5 € [60].

**Tendance.** Le plateau de 30 au marché est passé de 8,50 € (mai 2025) à 10,50 € (janvier 2026), soit +24 % en huit mois. C'est cohérent avec la hausse nationale, mais repose sur des cotations peu représentatives.

---

## 3. Saisonnalité : saison fraîche (mai-octobre) et saison chaude ou cyclonique (novembre-avril)

### 3.1 Exemples chiffrés (sources DAAF et presse)

| Produit | Abondance (saison fraîche) | Pénurie (saison chaude, après cyclone) | Rapport |
|---|---|---|---|
| Chouchou, gros | 0,75 €/kg (4/5/2026) [29] ; 1,25 (8/9/2025) [20] | **6,00 €/kg (2/2/2026)** [24] | ×5 à ×8 |
| Chouchou, détail forain | 1,00 €/kg (juin 2025) [40] | **5,48 €/kg, max 8,90 (6/2/2026)** [10] | ×5,5 |
| Tomate, détail | environ 2 à 3,50 €/kg (septembre 2025 [38] ?, septembre 2026 [47]) | 7,33 €/kg (2/5/2025) [1] ; 6 à 8 (avril 2025, après le cyclone Garance) [41] ; 10 (2024) [49] | ×2,5 à ×3,5 |
| Tomate, gros | 1,45 à 2,10 €/kg, plein champ (mai 2026) [29] | 4,00 (de 3,5 à 4,5), serre (mai 2022) [31] | ×2 à ×2,5 |
| Brèdes, détail | 1,00 €/botte (juillet et octobre 2025) [4][6] | 2,17 à 2,50 €/botte (4/3/2022) [12] | ×2,2 |
| Chou vert, gros | 1,50 à 1,75 €/pièce (janvier et juillet 2025) [16][19] | 3,00 €/pièce (juin 2025, après Garance) [18] | ×2 |
| Chou-fleur, gros | 1,50 €/pièce (janvier 2025) [16] | 3,00, max 4,00 (juin 2025) [18] | ×2 |
| Haricot vert, gros | 2,50 €/kg (janvier et décembre 2025) [16][21] | 4,00 €/kg (juin 2025) [18] | ×1,6 |
| Courgette, détail | 2,00 €/kg (octobre 2025) [6] | 4,10 €/kg (juin 2025) [40] ; gros 3,75 en hausse (février 2026) [27] | ×2 |
| Gros piment vert, détail | 5,83 €/kg (octobre 2025) [6] | 9,00 €/kg (juin 2025) [40] | ×1,5 |
| Oignon, détail | 2,65 €/kg (septembre 2025) [5] | 10 €/kg (pénurie 2024) [49] | ×3,8 |
| Salade batavia, gros | 0,50 à 0,80 €/pièce **toute l'année** (mai 2024, février et mai 2026) [14][26][29] | aucune flambée relevée | ×1 |
| Carotte | 2,00 gros / 2,30 détail [29][13] | 2,67 à 2,83 au détail (février 2026) [10] | ×1,2 |

### 3.2 Indicateurs globaux

- **Cyclone Belal (janvier 2024)** : l'indice des prix à la consommation des produits frais a augmenté de **23,39 %** entre janvier et février 2024 [43].
- **Cyclone Garance (fin février 2025)** : l'offre locale s'est effondrée et les produits importés l'ont remplacée sur les forains et en GMS. Les importations de légumes frais ont atteint plus de 10 760 t au premier semestre 2025, soit +21 % par rapport à 2023 [44]. Les prix des fruits et légumes ont augmenté d'environ 19 % [45]. La tomate est restée entre 6 et 8 €/kg jusqu'en avril-mai 2025 [41][42].
- **Flambées hors saison cyclonique** :
  - Avril 2026 : la tomate atteint 6,90 €/kg. Selon la Chambre d'agriculture, les fortes chaleurs nuisent à la pollinisation, y compris sous serre [46].
  - Septembre 2026 : la tomate monte à 2 €/kg au gros et à plus de 3 €/kg au détail, à cause de *Tuta absoluta*, favorisée par un hiver trop doux [47].
  - Le pic de prix vient donc surtout **après** l'événement (février à juin), pas forcément entre novembre et décembre.
- **Effondrements** :
  - Tomate à 0,69 €/kg au marché de Saint-Pierre en 2020, par surproduction pendant la crise sanitaire [50].
  - Décembre 2025 : marché de gros globalement stable, mais hausse de toutes les tomates [22].
  - Mars 2026 : la tomate serre baisse quand l'offre revient [28].

### 3.3 Calendrier indicatif pour le modèle (E)

Ce calendrier est tiré des observations ci-dessus. Il s'applique aux produits sensibles : tomate, chouchou, brèdes, choux, cucurbitacées, haricot, piment.

| Période | Niveau de prix (détail marché) |
|---|---|
| Juillet à octobre | **bas** : abondance |
| Novembre à décembre | **médiane** : hausse progressive, notamment de la tomate |
| Janvier à avril | **médiane à haut** ; **haut** l'année d'un cyclone, avec un pic 2 à 8 semaines après son passage |
| Mai à juin | retour vers la **médiane**, parfois encore **haut** après un gros cyclone (juin 2025) |

La salade, la carotte, l'ail, le gingembre et les œufs restent à la **médiane** toute l'année.

---

## 4. Points d'observation détaillés (pour une vérification ultérieure)

### Marchés forains, prix au détail (DAAF)

| Date | Observations |
|---|---|
| 04/03/2022 | brède petsaï 2,17 ; brède chouchou 2,17 ; brède citrouille 2,50 (€/botte) [12] |
| 16/09/2022 | carotte avec fanes ≈ 2,33 €/kg [13] |
| 02/05/2025 | tomate petite serre 7,33 (de 6 à 9) ; brède petsaï 1,50 (de 1 à 2) ; brède chouchou 1,33 (de 1 à 1,5) [1] |
| 16/05/2025 | tomate arbuste 9,00, un seul relevé ; œufs plateau de 30 : 8,50 (1) [2] |
| 13/06/2025 | brède petsaï 1,33 ; brède chouchou 1,37 [3] |
| 11/07/2025 | brède petsaï 1,00 ; chouchou 1,50 ; citrouille 1,88 ; pak-choï 1,17 (€/botte) [4] |
| 05/09/2025 | ail violet 33,33 (de 25 à 40) ; ail rose 5,70 (origine à confirmer) ; gingembre 6,67 (de 4,90 à 8,50) ; oignon tête jaune 2,65 [5] |
| 03/10/2025 | chou vert 1,83/pièce (de 1 à 2,5) ; chou-fleur 2,83/pièce (de 1,5 à 3,5) ; haricot vert 5,50 (de 5 à 7) ; courgette 2,00 (de 1,5 à 2,5) ; aubergine 3,00 (de 2 à 4) ; piment cabri 20,00 (de 15 à 25) ; piment vert gros 5,83 (de 4,5 à 6,5) ; poivron rouge et jaune 7,98 (de 5,95 à 10) ; poivron vert 5,33 (de 3 à 8) ; brède petsaï 1,00 ; brède chouchou 1,17 ; brède pak-choï 1,00 ; chou chinois 1,75/pièce [6] |
| 05/12/2025 | giraumon 2,83 (de 2 à 4) ; concombre 1,17/pièce (de 0,75 à 3) [7] |
| 19/12/2025 | aubergine 2,75 (de 1 à 3,5) ; piment cabri 18,75 (de 15 à 22,5) ; piment rouge petit 12,50 (1) [8] |
| 09/01/2026 | œufs plateau de 30 : 10,50, en hausse de 0,50 (1) [9] |
| 06/02/2026 | chouchou 5,48 (de 4 à 8,90) ; carotte sans fanes 2,83 ; carotte avec fanes 2,67 [10] |
| 20/02/2026 | tomate ancienne 6,00 (de 5,5 à 6,9) [11] |

### Bulletins mensuels forains (DAAF) et articles qui les reprennent

| Mois | Observations |
|---|---|
| Janvier 2025 | chou vert 2,70/pièce [36] |
| Avril 2025 | tomate 6 à 8 €/kg ; poivrons jusqu'à 10 €/kg [41] |
| Mai 2025 | batavia 1,15/pièce ; chouchou 1,15 [37] ; petite tomate plein champ 5 ; aubergine 3,80 [42] |
| Juin 2025 | salades 1,10 ; chouchou 1,00 ; courgette 4,10 ; gros piment vert 9,00 ; aubergine 3,20 [40] |
| Septembre 2025 | chouchou 1,50 ; tomate serre 1,95 ? [38] |
| Décembre 2025 | gingembre 7,65 €/kg [39] |

### Marché de gros de Saint-Pierre, cours production (DAAF)

| Date | Observations |
|---|---|
| 04/05/2022 | tomate petite serre 4,00 (de 3,5 à 4,5) [31] |
| 08/05/2024 | batavia 0,70 ; tomate petite serre 3,00 ; tomate petite plein champ 2,10 [14] |
| 02/10/2024 | brède chouchou 0,90/botte ; brède citrouille 1,00/botte [15] |
| 06/01/2025 | chou vert 1,50 ; chou-fleur 1,50 ; haricot vert 2,50 ; aubergine 1,00 ; giraumon 1,50 ; concombre 1,00 ; piment petit rouge 10,00 et vert 10,00 (de 9 à 10) [16] |
| 26/03/2025 | ail violet 20,00 (de 18 à 20) [17] |
| 18/06/2025 | chou vert 3,00 (de 2 à 3,5) ; chou-fleur 3,00 (de 3 à 4) ; haricot vert 4,00 (de 3,5 à 4) [18] |
| 30/07/2025 | chou vert 1,75 (de 1,2 à 2) ; chou-fleur 2,00 (de 1,5 à 2,5) ; brède petsaï 1,00 ; brède chouchou 1,00 [19] |
| 08/09/2025 | chouchou 1,25 [20] |
| 10/12/2025 | haricot vert 2,50 (de 2 à 3). Produits phares : tomate plein champ, gros piment vert, chou vert [21] |
| 17/12/2025 | tendance stable, toutes les tomates en hausse [22] |
| 31/12/2025 | ail violet 20,00 ; aubergine 1,50 [23] |
| 02/02/2026 | chouchou 6,00, en hausse de 1,50 [24] |
| 04 et 09/02/2026 | hausse de la petite tomate sous serre, peu disponible [25] |
| 11/02/2026 | batavia 0,70 (de 0,5 à 0,8) ; tomate petite serre 3,00 (de 2,75 à 3) ; tomate petite plein champ 1,65 (de 1,65 à 2,10) [26] |
| 18/02/2026 | courgette 3,75, en hausse de 0,25 [27] |
| 16/03/2026 | baisse de la petite tomate serre, l'offre progresse [28] |
| 04/05/2026 | chouchou 0,75 (de 0,5 à 0,8) ; carotte avec fanes 2,00 (de 1,75 à 2,5) ; tomate petite plein champ 2,10 (de 1,45 à 2,10) ; petite serre 2,75 (de 2,5 à 2,75) ; grappe 4,00 ; cerise 10,00 ; ancienne 5,00 ; batavia, feuille de chêne et laitue 0,80/pièce ; poireau 2,00 (max 2,5) [29] |
| 27/05/2026 | gingembre 5,00 (de 4 à 5) [30] |

### GMS et épiceries bio (DAAF)

| Date | Observations |
|---|---|
| 08/02/2022 (GMS) | tomate petite serre 4,50 (de 3,40 à 5,99) ; œufs plateau de 30 : 7,15 [33] |
| 20/05/2025 (GMS) | ail rose 6,86 [34] |
| 09/09/2025 (GMS) | poivron rouge 10,48 ; piment vert petit 20,67 ; œufs (voir §2) [32] |
| 04/11/2025 (GMS) | tomate grosse serre RUN 1,80 et petite serre 2,01 ? Valeurs douteuses, non retenues |
| 22/10/2025 (épiceries bio) | tomate petite serre RUN 4,09 (de 2,50 à 4,95) [35] |

---

## 5. Rapport entre prix de gros et prix au détail forain (calcul de l'agent, E)

Le calcul porte sur des paires de cotations DAAF prises à des dates proches.

| Produit | Gros / détail | Coefficient |
|---|---|---|
| Batavia | 0,70-0,80 / 1,10-1,15 | 0,64 à 0,70 |
| Chouchou | 1,25 / 1,50 (septembre 2025) | 0,83 |
| Chouchou en crise | 6,00 / 5,48 (février 2026) | 1,09 : en pénurie, le gros rattrape le détail |
| Brèdes | 1,00 / 1,00-1,50 (juillet 2025) | 0,67 à 1,00 |
| Chou vert | 1,75 / 1,83 | 0,96 |
| Chou-fleur | 2,00 / 2,83 | 0,71 |
| Aubergine | 1,50 / 2,75 (décembre 2025) | 0,55 |
| Ail violet | 20 / 33,33 | 0,60 |
| Gingembre | 5,00 / 6,67-7,65 | 0,65 à 0,75 |
| Haricot vert | 2,50 / 5,50 | 0,45 |
| Giraumon | 1,50 / 2,83 | 0,53 |

**Ordre de grandeur retenu : un revendeur paie le producteur environ 65 % du prix forain (plage 45 à 95 %).** C'est le coefficient appliqué aux cases marquées E du tableau 1.

Pour une épicerie qui « achète au prix de revendeur », le prix réellement payé se situe probablement entre le cours du marché de gros (pas de commission ni de transport vers Saint-Pierre) et ce cours majoré de 10 à 20 %. Cette fourchette est E et n'est pas sourcée.

---

## 6. Volumes vendables

**Aucune source réunionnaise trouvée** sur les volumes par séance de marché, par panier ou par livraison, et le quota de recherche n'a pas permis de creuser. Toutes les valeurs de cette section sont **E**, construites pour rester cohérentes avec les prix ci-dessus.

### 6.1 Par séance de marché forain (un étal, une matinée)

**Hypothèses de l'agent :**

| Hypothèse | Bas | Médiane | Haut |
|---|---|---|---|
| Clients par séance | 60 | 100 | 150 |
| Panier moyen | 8 € | 10 € | 15 € |
| Chiffre d'affaires de la séance | ≈ 500 € | ≈ 1 000 € | ≈ 2 000 € |

La colonne médiane du tableau suivant, valorisée aux prix médians du §1, donne ≈ 880 €, œufs compris. C'est cohérent avec ces hypothèses. Tous les produits ne sont pas disponibles toute l'année.

| Produit | Unité | Bas | Médiane | Haut |
|---|---|---|---|---|
| Tomate | kg | 15 | 30 | 60 |
| Salade batavia | pièce | 25 | 50 | 100 |
| Brèdes (toutes) | botte | 30 | 60 | 120 |
| Chouchou | kg | 10 | 25 | 50 |
| Carotte | kg | 10 | 20 | 40 |
| Chou pommé | pièce | 10 | 20 | 40 |
| Chou-fleur | pièce | 5 | 10 | 20 |
| Haricot vert | kg | 4 | 8 | 15 |
| Courgette | kg | 8 | 15 | 30 |
| Concombre | pièce | 12 | 25 | 50 |
| Giraumon | kg | 10 | 20 | 40 |
| Aubergine | kg | 5 | 10 | 20 |
| Poivron | kg | 2 | 5 | 10 |
| Gros piment | kg | 0,5 | 1,5 | 3 |
| Petit piment (sachets de 50 à 100 g) | kg | 0,2 | 0,5 | 1 |
| Oignon | kg | 5 | 10 | 20 |
| Ail péi | kg | 1 | 2 | 4 |
| Poireau | kg | 4 | 8 | 15 |
| Gingembre | kg | 1,5 | 3 | 6 |
| Curcuma frais | kg | 0,5 | 1,5 | 3 |
| Œufs | œufs (plateaux de 30) | 150 (5) | 300 (10) | 600 (20) |

### 6.2 Par panier hebdomadaire

**Prix et contenu des paniers réunionnais : aucune source trouvée.** Un annuaire réunionnais recense des producteurs en vente directe et en paniers [65], mais aucun prix n'a pu être lu.

**Panier « moyen » type (E), valorisé aux prix médians du détail marché :**

| Produit | Quantité | Valeur (€) |
|---|---|---|
| Salade batavia | 1 pièce | 1,15 |
| Brèdes | 2 bottes | 2,50 |
| Tomate | 1 kg | 3,50 |
| Chouchou | 1 kg | 1,50 |
| Carotte | 0,5 kg | 1,35 |
| Chou vert, ou chou-fleur | 1 pièce | 1,85 (2,85 pour le chou-fleur) |
| Courgette, ou haricot vert 250 g | 0,5 kg | ≈ 1,30 |
| Giraumon | 1 kg | 2,83 |
| Piments et aromates | 50 à 100 g | ≈ 0,75 |
| Oignon | 0,5 kg | 1,33 |
| **Total** | | **≈ 18 €** |

| Format | Prix (E) | Remarque |
|---|---|---|
| Petit panier | 10 à 12 € | |
| Panier moyen | 15 à 20 € | |
| Grand panier | 25 à 30 € | |
| Option œufs | + 6 œufs plein air, ≈ 3 € | prix E du §2 |

**Nombre d'abonnés pour un maraîcher seul (E) : 20 / 35 / 60 paniers par semaine.** Raisonnement : au-delà d'environ 60 paniers, la préparation et la distribution prennent plus d'une journée de travail, en concurrence avec les marchés. Repère hors Réunion (H), de mémoire de l'agent et non vérifié dans cette session : en France métropolitaine, une AMAP compte souvent 30 à 60 paniers par maraîcher, à 15 à 25 € le panier de légumes.

### 6.3 Par livraison hebdomadaire à une épicerie ou supérette

| Produit livré | Bas | Médiane | Haut |
|---|---|---|---|
| Légumes | 40 kg | 80 kg | 150 kg |
| Salades | 10 | 20 | 40 |
| Brèdes | 10 bottes | 20 bottes | 40 bottes |
| Œufs, plateaux de 30 | 3 | 6 | 10 |

Valeur au prix revendeur (environ 2 €/kg en moyenne pour les légumes, environ 9 à 10 € le plateau d'œufs plein air), en E : **≈ 100 / 200 / 400 € par livraison.**

### 6.4 Cohérence avec l'atelier œufs (pour l'agent poules)

Les ventes envisagées ci-dessus absorbent, par semaine :
- 1 marché : environ 10 plateaux ;
- 35 paniers avec 6 œufs : environ 7 plateaux ;
- 1 épicerie : environ 6 plateaux.

Soit **environ 23 plateaux, ou 700 œufs par semaine.** C'est à rapprocher de la production de 200 pondeuses, que calcule l'agent poules. Un deuxième marché, ou davantage d'œufs par panier, peut être nécessaire pour tout écouler.

---

## 7. Chiffre d'affaires typique d'un maraîcher diversifié en vente directe

**Aucune référence réunionnaise trouvée** : ni Chambre d'agriculture, ni DAAF, ni réseau de références. Cette partie n'a pas pu être cherchée avant l'épuisement du quota.

**Estimation E pour la ferme d'exemple** (environ 48 semaines de vente par an) :

| Poste | Bas | Médiane | Haut |
|---|---|---|---|
| Marché | 1 séance × 500 € → 24 k€ | 1 séance × 900 € → 43 k€ | 2 séances × 900 € → 86 k€ |
| Paniers | 20 × 12 € → 11,5 k€ | 35 × 17 € → 28,5 k€ | 60 × 20 € → 57,6 k€ |
| Épicerie | 100 € × 48 → 4,8 k€ | 200 € × 48 → 9,6 k€ | 400 € × 48 → 19,2 k€ |
| **Total, œufs compris** | **≈ 40 k€** | **≈ 80 k€** | **≈ 160 k€** |

- Le total « haut » dépasse probablement la capacité de travail d'une personne seule. Ce point relève des agents agronomie et charges.
- La valeur médiane correspond à environ 55 k€ par hectare cultivé sur 1,5 ha.
- Repère hors Réunion (H), de mémoire de l'agent et non vérifié : en France métropolitaine, on cite couramment 30 à 60 k€ de chiffre d'affaires par actif en maraîchage diversifié en circuits courts.

---

## 8. Correspondances et remarques utiles pour la ferme d'exemple

- **Zoizo.** Les mercuriales DAAF distinguent « piment cabri », « piment vert petit », « piment rouge petit » et « piment vert gros ». Le zoizo correspond vraisemblablement au « petit piment », mais ce n'est pas confirmé. Le gros piment correspond au « piment vert gros ».
- **Ail de Petite-Île.** Il correspond à l'ail violet origine RUN.
  - Production réunionnaise : 150 t en 2022, 130 t en 2023, un peu moins de 100 t en 2024, pour environ 80 producteurs. L'ail péi représente environ 5 % de l'ail vendu sur l'île, le reste étant importé [51].
  - La fête de l'ail de Petite-Île (fin octobre) est un temps fort de vente directe.
- **Curcuma.** Le prix « 25 à 30 €/kg » cité par la presse [54][55] concerne très probablement le safran péi **transformé** (sec ou en poudre) vendu à la Plaine des Grègues (Saint-Joseph). Il ne s'applique pas au rhizome frais. Environ 80 t de curcuma sont importées chaque année [54].
- **Unités au marché.** Les forains vendent souvent au tas ou à la barquette. La DAAF ramène les prix au kilo, à la pièce ou à la botte.
- **Où trouver des séries complètes.**
  - La DAAF publie toutes les mercuriales par année [63], et le site MFL Réunion (mflreunion.re) les regroupe par produit [62]. Ce sont les meilleures sources pour compléter ce travail quand le réseau le permettra.
  - Les fichiers sont nommés de façon prévisible : `AAAAMMJJ-mer-productions_legfruits.pdf` pour le gros, `AAAAMMJJ_mer_detail_forains__legfruits.pdf` pour les forains, `AAAAMMJJ-merc-detail-gms-legfruits.pdf` pour les GMS.

---

## 9. Sources

Toutes les sources ont été consultées le 15/10/2026, **par les extraits du moteur de recherche** : PDF et pages non ouverts en entier (voir §10). DAAF désigne la DAAF de La Réunion, service de l'information statistique et économique (SISE). La racine de toutes les URL DAAF est `https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/`.

### DAAF, mercuriales « Prix au détail – Marchés forains »

1. 2 mai 2025, `20250502_mer_detail_forains__legfruits.pdf`
2. 16 mai 2025, `20250516_mer_detail_forains__legfruits.pdf`
3. 13 juin 2025, `20250613_mer_detail_forains__legfruits.pdf`
4. 11 juillet 2025, `20250711_mer_detail_forains__legfruits.pdf`
5. 5 septembre 2025, `20250905_mer_detail_forains__legfruits.pdf`
6. 3 octobre 2025, `20251003_mer_detail_forains__legfruits.pdf`
7. 5 décembre 2025, `20251205_mer_detail_forains__legfruits.pdf`
8. 19 décembre 2025, `20251219_mer_detail_forains__legfruits.pdf`
9. 9 janvier 2026, `mercuriale_legumesfruits_forain_09-01-2026.pdf`
10. 6 février 2026, `20260206_mer_detail_forains__legfruits.pdf`
11. 20 février 2026, `20260220_mer_detail_forains__legfruits.pdf`
12. 4 mars 2022, `20220304_mer_detail_forains__legfruits.pdf`
13. 16 septembre 2022, `20220916_mer_detail_forains__legfruits.pdf`

### DAAF, mercuriales « Cours production – Marché de gros » (Saint-Pierre)

14. 8 mai 2024, `mercuriales_mgsp08-05-2024.pdf`
15. 2 octobre 2024, `20241002-mer-productions_legfruits.pdf`
16. 6 janvier 2025, `20250106-mer-productions_legfruits.pdf`
17. 26 mars 2025, `20250326-mer-productions_legfruits.pdf`
18. 18 juin 2025, `20250618-mer-productions_legfruits.pdf`
19. 30 juillet 2025, `20250730-mer-productions_legfruits.pdf`
20. 8 septembre 2025, `20250908-mer-productions_legfruits.pdf`
21. 10 décembre 2025, `20251210-mer-productions_legfruits.pdf`
22. 17 décembre 2025, `20251217-mer-productions_legfruits.pdf`
23. 31 décembre 2025, `20251231-mer-productions_legfruits.pdf`
24. 2 février 2026, `20260202-mer-productions_legfruits.pdf`
25. 4 et 9 février 2026, `20260204-mer-productions_legfruits.pdf` et `20260209-mer-productions_legfruits.pdf`
26. 11 février 2026, `20260211-mer-productions_legfruits.pdf`
27. 18 et 23 février 2026, `20260218-mer-productions_legfruits.pdf` et `20260223-mer-productions_legfruits.pdf`
28. 16 mars 2026, `20260316-mer-productions_legfruits.pdf`
29. 4 mai 2026, `20260504-mer-productions_legfruits.pdf`
30. 27 mai 2026, `20260527-mer-productions_legfruits.pdf`
31. 4 mai 2022, `20220504-mer_production__legfruits.pdf`

### DAAF, autres mercuriales

32. Prix au détail GMS, 9 septembre 2025, `20250909-merc-detail-gms-legfruits.pdf`
33. Prix au détail GMS, 8 février 2022, `20220208_merc_detail_gms__legfruits.pdf`
34. Prix au détail GMS, 20 mai 2025, `20250520-merc-detail-gms-legfruits.pdf`
35. Épiceries spécialisées bio, 22 octobre 2025, `20251022-epiceries-bio_legfruits.pdf`

### DAAF, bulletins mensuels « Prix des fruits et légumes » (forains)

36. Janvier 2025, `com-grdpub-jan2025.pdf`
37. Mai 2025, `com-grdpub-mai2025.pdf`
38. Septembre 2025, `com-grdpub-septembre2025.pdf`
39. Décembre 2025, `com-grdpub-decembre2025.pdf`

### Presse sur les prix des fruits et légumes

40. Freedom, « Fruits et légumes : les tendances des marchés forains à La Réunion en juin 2025 », 22/07/2025. https://freedom.fr/fruits-et-legumes-les-tendances-des-marches-forains-a-la-reunion-en-juin-2025/
41. Journal.re, « Les prix des fruits et légumes restent sous tension à La Réunion en avril et mai 2025 », 2025. https://www.journal.re/consommation/les-prix-des-fruits-et-legumes-restent-sous-tension-a-la-reunion-en-avril-et-mai-2025.html
42. Zinfos974, « Fruits et légumes : les prix continuent de s'envoler à La Réunion », 2025 (données de mai 2025). https://www.zinfos974.com/fruits-et-legumes-les-prix-continuent-de-senvoler-a-la-reunion/

### DAAF, notes de conjoncture

43. Note de conjoncture n°39, mars 2024. https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20240301_note_conj_mar2024.pdf
44. Note de conjoncture, septembre 2025. https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20250905_note_conj_sept2025.pdf

### Autres sources sur les fruits et légumes

45. FreshPlaza, « Fruit and vegetable prices rise by 19% after cyclone Garance hits Reunion Island », 2025. https://www.freshplaza.com/europe/article/9734112/fruit-and-vegetable-prices-rise-by-19-after-cyclone-garance-hits-reunion-island/
46. Linfo.re, « Agriculture : presque 7 euros le kilo de tomate ! », avril 2026 (date à confirmer). https://www.linfo.re/la-reunion/societe/jusqu-a-7-euros-le-kilo-de-tomate
47. La 1ère Réunion, « Le prix des tomates en augmentation à La Réunion », vers septembre 2026 (date à confirmer). https://la1ere.franceinfo.fr/reunion/le-prix-des-tomates-en-augmentation-a-la-reunion-1737968.html
48. La 1ère Réunion, « Le prix des tomates s'envole à La Réunion, jusqu'à 5 euros le kilo ! », date à confirmer. https://la1ere.franceinfo.fr/reunion/le-prix-des-tomates-s-envole-de-nouveau-a-la-reunion-jusqu-a-5-euros-le-kilo-1679439.html
49. Assemblée nationale, question écrite n°18153 (16e législature) de J.-H. Ratenon, 2024 : tomates 10 €/kg, oignon 10 €/kg, ail de Chine 5,99 €/kg. https://www.assemblee-nationale.fr/dyn/16/questions/QANR5L16QE18153.pdf
50. Linfo.re, « Surproduction de tomates à La Réunion : moins d'un euro le kilo ! », reprise par HortiDaily et FreshPlaza (2020). https://www.linfo.re/la-reunion/societe/surproduction-de-tomates-a-la-reunion-moins-d-un-euro-le-kilo et https://www.hortidaily.com/article/9360387/reunion-tomato-producers-working-at-a-loss/

### Ail et curcuma

51. La 1ère Réunion, « L'ail péi en fête à Petite-Île malgré une production en baisse cette année », vers octobre 2024. https://la1ere.franceinfo.fr/reunion/petite-ile/l-ail-pei-en-fete-a-petite-ile-malgre-une-production-en-baisse-cette-annee-1531216.html
52. Linfo.re, « L'ail péi : toujours de qualité pour cette nouvelle saison », date non connue. https://www.linfo.re/la-reunion/societe/l-ail-pei-peu-de-producteur-mais-une-bonne-qualite
53. Freedom, « La Fête de l'Ail 2025 : trois jours de saveurs… », octobre 2025. Un commentaire de lecteur y cite 25 à 30 €/kg (source faible). https://freedom.fr/la-fete-de-lail-2025-trois-jours-de-saveurs-de-musique-et-de-traditions-a-petite-ile-photos/
54. Imazpress, « Safran péi : le produit couleur or se fait (un peu) rare et son prix augmente (un peu) », vers novembre 2024. https://imazpress.com/actus-reunion/safran-pei-un-produit-couleur-or-ou-la-rarete-fait-grimper-les-prix-dont-les-reunionnais-rafolent
55. Linfo.re, « Safran péi : une récolte compliquée cette année, le prix pourrait augmenter », 2024. https://www.linfo.re/la-reunion/societe/safran-pei-une-recolte-compliquee-cette-annee-le-prix-pourrait-augmenter
56. NR Otantik (https://nrotantik.fr/produit/curcuma/) et reunionboutik.com : curcuma de la Plaine des Grègues à 40 et 42,50 €/kg en vente en ligne, date non connue.

### Œufs

57. DAAF, fiche filière n°7 « Œufs et ovoproduits », août 2025. https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/202508_filiere_oeufs_2025.pdf
58. Linfo.re, « Consommation : les œufs s'imposent face à la viande », date non connue. https://www.linfo.re/la-reunion/societe/consommation-les-ufs-s-imposent-face-a-la-viande
59. **H** — La France Agricole, « Le prix des œufs flambe de 37 % en 2025 ». https://www.lafranceagricole.fr/conjoncture-viandes/article/894189/le-prix-des-oeufs-flambe-de-37-en-2025
60. **H** — Ferme des Maquis, « Prix des œufs de ferme 2025 : comparatif complet ». https://www.fermedesmaquis.fr/prix-des-oeufs-de-ferme/

### Divers

61. **H** — Comores en ligne, « Brède mafane la botte » : 1,34 €, page ancienne. https://comores-en-ligne.fr/fr/catalogue/brede-mafane-la-botte_263
62. MFL Réunion, agrégateur des mercuriales de la DAAF par produit. https://mflreunion.re/
63. DAAF, pages d'index : « Les mercuriales 2025 » (https://daaf.reunion.agriculture.gouv.fr/les-mercuriales-2025-r1164.html), « Les mercuriales 2026 » (https://daaf.reunion.agriculture.gouv.fr/les-mercuriales-2026-r1210.html), « Prix aux producteurs de fruits et légumes (marché de gros) » (https://daaf.reunion.agriculture.gouv.fr/prix-au-producteur-de-fruits-et-legumes-marche-de-gros-r1165.html)
64. QualiREG, « Les mercuriales Réunion » : description des circuits et de la fréquence des relevés. https://www.qualireg.org/ressources/veille-ocean-indien/veille-des-prix/reunion-et-mayotte/les-mercuriales-reunion
65. Cetanou, annuaire974, rubrique « Ventes directes – marchés – paniers ». https://www.cetanou.com/annuaire974/wpbdp_category/ventes-directes-marches-paniers/

---

## 10. Limites

1. **Aucun document n'a été ouvert en entier.**
   - Le DNS de WebFetch était en échec et le proxy du réseau a refusé les connexions vers `daaf.reunion.agriculture.gouv.fr`.
   - Chaque chiffre vient d'un extrait de PDF reformulé par le moteur de recherche. Il peut donc y avoir des confusions entre colonnes (prix, variation, minimum, maximum) et des unités non vues. Les valeurs suspectes sont marquées « ? ».
   - Il faut relire les PDF cités avant de figer les valeurs de la ferme d'exemple.
   - Pour lever ce blocage, ajouter `daaf.reunion.agriculture.gouv.fr` aux domaines autorisés dans les réglages réseau de l'environnement.
2. **Le quota de recherches web (200 par tour, partagé entre agents) a été épuisé** avant d'avoir traité :
   - les paniers et AMAP réunionnais ;
   - les volumes vendus par séance ;
   - le chiffre d'affaires de référence ;
   - le prix des œufs payé au producteur ;
   - la réglementation de vente des œufs.

   Ces parties sont des estimations (E). Une nouvelle demande permettrait de poursuivre la recherche.
3. **Produits sans cotation réunionnaise trouvée** : brède mafane, brède morelle, curcuma frais, poireau au détail, poivron au gros, oignon au gros (et l'origine péi ou importée de l'oignon à 2,65), œufs au gros. Le nom « zoizo » n'apparaît pas dans les mercuriales.
4. **Représentativité.**
   - Les relevés forains sont espacés de quinze jours et certains sont « peu représentatifs » (moins de trois relevés). C'est le cas de toutes les cotations d'œufs au marché.
   - Ce sont des moyennes sur l'ensemble de l'île, pas sur les marchés du Sud seulement.
   - Le marché de gros de Saint-Pierre est bien dans le Sud.
5. **Dates de presse.** Plusieurs articles (Linfo, La 1ère) n'avaient pas de date fiable dans les extraits. Leur date est marquée « à confirmer ».
6. **Années atypiques.** 2024 (Belal) et 2025 (Garance) sont des années à cyclone marquant. Les valeurs « hautes » du tableau en dépendent. Une année sans cyclone resterait plus proche de la médiane.
7. **Paniers et revendeur.**
   - Le prix d'un produit dans un panier est valorisé par convention au prix médian du détail marché (E).
   - Le prix payé par l'épicerie est assimilé au cours du marché de gros. Ce n'est pas un prix d'épicerie observé.
8. **Inflation.** Les valeurs mélangent 2022 et 2026, mais surtout 2025 et 2026. Elles n'ont pas été corrigées de l'inflation. Les points de 2022 servent seulement d'illustration de la saisonnalité.
