# Recherche 5 : compléments sur les charges fixes

Ferme d'exemple de plantoeuf : un maraîcher seul, chef d'exploitation sans salarié, sur environ 1,5 ha dans les hauts de **Petite-Île** (Sud de La Réunion, à mi-pente). Légumes toute l'année, 200 poules pondeuses en deux lots de 100, vente directe : marchés de Saint-Pierre et de Saint-Joseph, paniers, une épicerie.

Recherche faite le **15 octobre 2026**. Elle complète la note `recherche-4-debouches-charges.md`, où les lignes 3 à 12 du tableau des charges fixes n'étaient **pas sourcées**.

> **Méthode et réserves.** WebFetch et curl ne pouvaient pas ouvrir les pages. **Toutes les valeurs viennent des extraits renvoyés par WebSearch** : le moteur résume les pages, et aucun PDF n'a été lu en entier. Un tableau PDF mal extrait peut donc être mal lu. 69 recherches ont été faites.
>
> - **[RUN]** : source réunionnaise.
> - **[HORS RUN]** : source de métropole, d'un autre DOM ou nationale.
> - **EST** : estimation de l'agent, dont le raisonnement est donné.
>
> Sauf mention contraire, les montants sont **hors taxes (HT)**. À La Réunion, le taux normal de TVA est de 8,5 %.

---

## 0. Tableau final des charges fixes proposées

Fourchettes basse / médiane / haute en euros. La colonne **Période** indique comment saisir le montant dans plantoeuf (`mois` ou `an`).

| # | Charge | Basse | Médiane | Haute | Période | Source et statut |
|---|---|---|---|---|---|---|
| 1 | **Cotisations sociales de l'exploitant** (CGSS Réunion) : ATEXA, indemnités journalières (IJ) AMEXA, retraite complémentaire obligatoire (RCO), formation (VIVEA) | 800 | 1 650 | 2 750 | an | **EST** à partir de [42] [43] [44] [45] [46] [RUN + HORS RUN]. Sous 40 ha pondérés, l'exploitant est exonéré de l'AMEXA, de la vieillesse de base et des prestations familiales [42]. Basse = ATEXA (≈ 528 €) + IJ (250 €) + forfait formation DOM (≈ 19 €). Médiane = basse + RCO minimale nationale (875 €). Haute = médiane + AMEXA DOM, tranche de 2 à 40 ha (618 €), + VIVEA au barème national (≈ 430 €), au cas où l'exonération ou les montants DOM ne s'appliqueraient pas. Détail au § 7 |
| 2 | **Assurance de l'exploitation** : responsabilité civile, multirisque (poulailler, matériel, abris si assurables), hors véhicule | 400 | 900 | 1 800 | an | **EST**, appuyée sur des sources faibles [HORS RUN] : RC seule ≈ 60 à 70 €/an [29] ; multirisque d'une petite ferme de 500 à 2 500 €/an, dont 800 à 1 200 €/an pour 1,5 ha [28] (site commercial). Aucun tarif réunionnais trouvé. Le risque cyclone sur les abris est mal couvert ; les non-assurés relèvent du FSOM [30]. Détail au § 5 |
| 3 | **Eau d'irrigation** (SAPHIR, périmètre irrigué du Sud) : m³ et part fixe | 300 | 700 | 1 200 | an | **Prix sourcé [RUN], volume estimé.** Tarif agricole du Sud au 01/01/2024 : **0,0870 €/m³ HT** jusqu'à 12 000 m³/ha/an [9]. Volume EST : 2 000 / 4 000 / 6 000 m³ par ha et par an × 1,5 ha, soit 261 / 540 / 900 € de m³ (à 0,087 / 0,09 / 0,10 €/m³, pour tenir compte de l'indexation depuis 2024). On ajoute 40 / 160 / 300 € pour la part fixe liée au débit souscrit, dont le montant est illisible dans la source [9]. Frais d'ouverture d'abonnement : 82,95 € HT, payés une seule fois [9]. Détail au § 2 |
| 4 | **Eau du réseau public** : lavage des légumes, abreuvement des poules | 80 | 220 | 450 | an | **EST** à partir du prix moyen de l'eau potable à La Réunion, **2,74 € TTC/m³** au 01/01/2024 [15] [RUN]. Volume : 30 / 80 / 150 m³ par an, dont environ 18 m³ pour 200 poules (EST : 0,25 L par poule et par jour). À retirer si l'agent « poules » compte déjà l'eau |
| 5 | **Électricité** (EDF Réunion, tarif Bleu non résidentiel) | 30 | 55 | 95 | **mois** | **Prix sourcé [RUN], consommation estimée.** Grille HT au 01/02/2026 : énergie 14,2252 c€/kWh en option Base ; abonnement ≈ 167 €/an (6 kVA), 199 €/an (9 kVA), 230 €/an (12 kVA) [25]. S'y ajoute l'accise, ≈ 3,06 c€/kWh en août 2026 [27]. Consommation EST : 1 000 / 2 500 / 5 000 kWh par an (petite chambre froide, éclairage du poulailler, surpresseur éventuel), soit 340 / 631 / 1 094 € par an. Arrondi vers le haut pour la CTA. Détail au § 4 |
| 6 | **Fermage** de 1,5 ha (0 si le maraîcher est propriétaire) | 200 | 450 | 900 | an | **EST.** À La Réunion, le loyer se calcule en **quantités de denrées** fixées par le préfet, pas avec l'indice national [19] [21] [RUN]. Le barème en €/ha n'a pas été trouvé. Estimation à partir de la valeur des terres : 11 000 à 20 000 €/ha [22] [23], × un taux de 1,2 à 3 % par an (hypothèse de l'agent). Détail au § 3 |
| 7 | **Comptabilité et centre de gestion** | 200 | 900 | 2 000 | an | **EST** à partir de [48] [49] [HORS RUN]. Établissement d'un bilan : 900 à 3 000 € HT [48]. Adhésion à un centre de gestion : 150 à 200 €/an, contre plus de 2 000 €/an pour un cabinet (témoignage) [49]. Basse : micro-BA, peu d'aide extérieure. Aucun tarif réunionnais trouvé. Détail au § 7 |
| 8 | **Amortissement du matériel et de l'irrigation** : motoculteur ou micro-tracteur, goutte-à-goutte, chambre froide, petit matériel | 1 000 | 3 200 | 7 000 | an | **EST** à partir des prix [34] [37] [38] [39] [40] [HORS RUN]. Calcul au § 6.3. Les prix sont ceux de la métropole ; à La Réunion, le fret et l'octroi de mer les augmentent (non chiffré) |
| 9 | **Amortissement des abris** (**hypothèse de 500 m²** d'abris anticycloniques) | 2 250 | 4 200 | 8 300 | an | **EST.** Soit **4,5 / 8,3 / 16,7 € par m² et par an**, issus de 45 €/m² sur 10 ans, 100 €/m² sur 12 ans et 200 €/m² sur 12 ans. Bornes sourcées : tunnel de métropole à 39–56 €/m² [34] [HORS RUN] ; serres anticycloniques réunionnaises, souvent photovoltaïques, à ≈ 350–360 €/m² [32] [33] [RUN]. Les aides à l'investissement réduisent le coût net, mais leur taux n'a pas été trouvé. Détail au § 6 |
| 10 | *(option)* **Renouvellement des gaines de goutte-à-goutte**, si elles sont jetables | 300 | 450 | 600 | an | 205 à 400 € par ha et par an [37] [HORS RUN], × 1,5 ha. À compter **soit** ici, **soit** dans les intrants des cultures, pas aux deux endroits |

**Total des lignes 1 à 9** (sans l'option 10) : **≈ 5 600 / 12 900 / 25 500 € par an**, électricité comptée sur 12 mois.

- Sans les amortissements (lignes 8 et 9), il reste **≈ 2 300 / 5 500 / 10 200 € par an** de charges payées en argent.
- **Cohérence avec le RICA Réunion** (§ 1) : en 2020, les maraîchers suivis dépensaient environ 10 800 € par ha en charges courantes hors approvisionnements, salaires compris. Sans salariés, avec environ 5 400 € par ha de charges de personnel en 2017, il reste de l'ordre de 5 000 à 6 000 € par ha (calcul de l'agent, années mélangées). Sur 1,5 ha, la médiane hors amortissements est donc **dans le même ordre de grandeur**, mais un peu basse.

**Lignes de `recherche-4` non traitées ici, qui restent valables ou non sourcées :**

- droit de place à Saint-Pierre (sourcé) ;
- assurance du véhicule ;
- entretien et petites fournitures ;
- téléphone et internet ;
- adhésions et frais bancaires.

**Attention au double comptage :**

- le poulailler, les poulettes et l'aliment relèvent de l'agent « poules » ;
- l'eau des poules (ligne 4) aussi, si cet agent l'a déjà comptée.

---

## 1. Résultats économiques des exploitations maraîchères à La Réunion (RICA)

Le RICA (Réseau d'information comptable agricole) suit un échantillon d'exploitations, environ 149 à La Réunion en 2022 [5]. Il ne couvre que les exploitations dont la production potentielle standard (PBS) dépasse 15 000 €, c'est-à-dire les moyennes et grandes [5]. **Les publications réunionnaises ont une section « maraîchage », mais aucun extrait ne donne le détail des charges par poste** (assurances, eau, électricité, fermage, honoraires) : il faut ouvrir les PDF [5] [6] [7].

### 1.1 Chiffres relevés pour l'orientation « maraîchage » à La Réunion [RUN]

| Année | Indicateur | Valeur | Source |
|---|---|---|---|
| 2017 | Surface agricole utile (SAU) moyenne | 3,72 ha | [1] |
| 2017 | Excédent brut d'exploitation (EBE) moyen | ≈ 37 667 € par exploitation | [1] |
| 2017 | Charges de personnel | ≈ 20 120 € par exploitation | [1] |
| 2017 | Achats et charges externes | ≈ 43 038 € par exploitation | [1] |
| 2017 | Charges totales par ha de SAU | ≈ 26 630 €/ha (toutes orientations : 10 600 €/ha) | [1] |
| 2017 | Part des engrais, semences et plants dans les approvisionnements | plus de 70 % | [1] |
| 2017 | Revenu des maraîchers | 27 400 €, contre 35 351 € en 2016 (−22,5 %), à cause de la surproduction de tomates (prix de la tomate de plein champ −43 %) | [1] |
| 2018 | Part des engrais, semences et plants dans les approvisionnements | plus de 84 % | [2] |
| 2020 | SAU moyenne | ≈ 3,89 ha | [3] |
| 2020 | Charges d'approvisionnement | ≈ 3 650 €/ha | [3] (extrait en partie illisible) |
| 2020 | Charges courantes | ≈ 14 490 €/ha | [3] (idem) |
| 2020 | Résultat des exploitations spécialisées en maraîchage | 33 400 €, soit 27 % de moins que l'ensemble des exploitations | [3] |
| 2021 | Évolution | Maraîchage et canne : plus forte baisse ; revenu global −21,4 % | [4] |
| 2023 | Évolution | Forte baisse de l'EBE par équivalent temps plein non salarié (ETPNS) en maraîchage ; approvisionnements +13,4 %, tirés par le prix des semences et des plants | [6] |
| 2024 | Évolution | Les exploitations maraîchères améliorent leurs résultats, malgré le cyclone Belal | [7] |

**Repères toutes orientations à La Réunion [RUN] :**

- **2023 :** EBE de 42 753 € par ETPNS (−18,2 %) ; solde disponible de 32 763 € par ETPNS (−25 %) [6].
- **2024 :** production moyenne de ≈ 100 890 € par exploitation (−2,13 %) ; charges de ≈ 101 110 € (−2,7 %) ; EBE de 53 600 € (+0,79 % en euros constants) ; résultat courant avant impôt (RCAI) de 31 940 € par ETPNS (+2,0 %) [7].

**Repère national maraîchage 2023** [8] [HORS RUN : France métropolitaine, Guadeloupe et La Réunion ensemble] :

- production de 397 752 € par exploitation ;
- charges de 358 938 € ;
- EBE de 73 148 € par ETPNS ;
- RCAI de 43 381 € par ETPNS.

Ces exploitations sont beaucoup plus grandes que la ferme d'exemple.

### 1.2 Ce qu'on peut en tirer pour la ferme d'exemple (EST)

- **Ordre de grandeur de la production par ha** (calcul de l'agent, 2017) : charges totales ≈ 26 630 €/ha × 3,72 ha ≈ 99 000 €, plus un revenu de 27 400 €, donne une production de **34 000 € par ha au plus**. C'est un majorant, car le revenu inclut les subventions. Il porte sur des exploitations avec salariés, en partie sous abris.
- **Charges courantes hors approvisionnements** (2020) : 14 490 − 3 650 ≈ **10 800 €/ha**, salaires compris. Sans les ≈ 5 400 €/ha de personnel (chiffre de 2017 ramené à l'hectare), il reste ≈ 5 000 à 6 000 €/ha (calcul de l'agent, années mélangées). Ce chiffre sert au contrôle de cohérence du § 0.
- **Repères hors Réunion pour une ferme de 1,5 ha en vente directe** [HORS RUN] :
  - charges de structure de **10 000 à 12 000 € par an** (MSA, assurance, impôts, eau et électricité, petit matériel, carburant, entretien), pour un chiffre d'affaires de 30 000 à 35 000 € par an une fois le système installé (guide Bio Nouvelle-Aquitaine 2016) [60] ;
  - environ 60 000 € d'investissement pour 1,5 ha, dont 1 500 m² d'abris froids (guide Centre-Val de Loire) [61] ;
  - chiffre d'affaires d'environ 25 000 € par ha en maraîchage bio diversifié (CIVAM du Gard) [62].

---

## 2. Eau d'irrigation dans le Sud

### 2.1 Qui distribue l'eau à Petite-Île [RUN]

- Le **périmètre irrigué du Bras de la Plaine** couvre environ 5 500 ha à Saint-Pierre, **Petite-Île**, Saint-Joseph, l'Entre-Deux et Le Tampon. En 2016, 5 048 ha étaient irrigués, pour 2 250 abonnés [13].
- Une **extension sur Petite-Île** couvre 377 ha à **Mont-Vert et Anse-les-Hauts**, pour 14 M€ : 37 km de canalisations, une station de pompage et un réservoir de 4 000 m³ [13].
- L'**extension Mahavel** (≈ 170 ha) date de 2008 [13].
- Avec le Bras de Cilaos, les périmètres du Sud irriguent environ 9 000 ha et forment aujourd'hui un seul « périmètre sud » [10] [13] [14].
- L'exploitant est la **SAPHIR**, société d'économie mixte. Elle gère pour le Département les périmètres du Sud, de l'Ouest (ILO) et de Champ-Borne, soit environ 10 318 ha selon la chambre régionale des comptes [12].

### 2.2 Tarif agricole [RUN]

| Élément | Valeur | Source |
|---|---|---|
| Eau brute agricole professionnelle, périmètre du Littoral Sud, tranche A1 (≤ 12 000 m³/ha/an) | **0,0870 € HT/m³** | [9] Annexe 11, avenant 2 Sud 2022, modifiée par l'avenant 6 ; grille au 01/01/2024. L'unité (€/m³) se déduit du contexte |
| Tranche A2 (> 12 000 m³/ha/an) | 0,0894 € HT/m³ | [9] |
| Part liée au débit souscrit | Débit de base inférieur à 5 m³/h, supplément au-delà ; **montants illisibles dans l'extrait** | [9] |
| Souscription ou transfert d'un abonnement | 82,95 € HT, une fois | [9] |
| Repères anciens | ≈ 8 centimes/m³ en 2013 (exposition ILO) [11] ; « 8 centimes » en 2020 pour l'eau agricole, contre jusqu'à 33 centimes pour les intercommunalités [10] | [10] [11] |
| Hors agriculture (pour comparaison) | Eau potable : 2,74 € TTC/m³ en moyenne au 01/01/2024 [15]. Vente en gros d'eau à usage industriel par la CASUD au Tampon : 170 € HT/an de part fixe + 0,75 € HT/m³ (valeurs du 01/07/2023) [18] | [15] [18] |

Le tarif est **par m³, facturé à l'année** (rythme de facturation non trouvé). Grille 2025-2026 non trouvée : il faut prévoir une indexation.

### 2.3 Volumes

- **[HORS RUN]** Environ **3 000 m³ par ha de surface développée et par an** pour un système maraîcher. La valeur varie beaucoup selon les cultures, le sol et le climat [16].
- **[RUN, calcul de l'agent]** En 2011, la SAPHIR produisait environ 90 Mm³ par an, dont la moitié pour l'agriculture, sur plus de 8 000 ha [14]. Cela fait ≈ **3 750 m³ par ha et par an** en moyenne, canne comprise et pertes du réseau comprises.
- **[RUN]** L'irrigation représente environ 55 Mm³ de prélèvements par an (conférence de l'eau, décembre 2025) [17].
- **[RUN]** Le seuil de tranche de 12 000 m³ par ha et par an [9] est un plafond, pas un besoin normal.
- Aucune dotation par culture n'a été trouvée. L'étude du CIRAD sur la demande en eau des périmètres du Sud [63] et le chapitre 4 du guide des bonnes pratiques de la DAAF sont les pistes à suivre.

**Proposition EST : 2 000 / 4 000 / 6 000 m³ par ha et par an**, soit 3 000 / 6 000 / 9 000 m³ pour 1,5 ha.

- À mi-pente à Petite-Île, l'été austral est pluvieux et l'irrigation sert surtout de mai à novembre, d'où la valeur basse.
- La valeur haute correspond à une forte part de cultures d'hiver irriguées au goutte-à-goutte.

**Coût proposé (ligne 3 du § 0) : 300 / 700 / 1 200 € par an**, dont une provision pour la part fixe de 40 / 160 / 300 € (EST, sans source).

---

## 3. Fermage

### 3.1 Règle propre à La Réunion [RUN]

- Le prix du fermage est fixé par le préfet. Il se calcule à partir de **quantités de denrées** et de leurs **prix de référence** (article L461-7 du code rural) [19] [21].
- Les **arrêtés n°510 et n°512 de 2018** fixent les quantités minimales et maximales de denrées et le contrat-type de bail. Ils sont toujours en vigueur [19].
- Les prix des denrées viennent de l'**arrêté du 30 septembre 2024** [21]. Ils ont été **gelés pour 2025** par l'arrêté n°2053 d'octobre 2025, à cause du cyclone Garance [19]. Un gel avait déjà eu lieu pour 2021 [20].
- **Aucun extrait ne donne les quantités par hectare ni les prix en euros.** Le montant en €/ha n'est donc pas sourcé.

### 3.2 Repères de valeur des terres [RUN]

- **Agreste Réunion, 2023** (publié en septembre 2024) [22] :
  - terres irriguées du littoral et plaines du Nord : **20 000 €/ha** (de 12 000 à 29 000 ; +21 %) ;
  - littoral non irrigué : **15 000 €/ha** (de 8 000 à 22 000).
- **2024**, site non officiel [23] : littoral irrigué 19 500 €/ha, non irrigué 13 500 €/ha, **Hauts 11 000 €/ha**.
- La SAFER Réunion renvoie aussi à un arrêté sur les valeurs vénales du 26 août 2025 [21].

### 3.3 Indice national des fermages [HORS RUN], pour mémoire

- **127,04 pour 2026 (+3,23 %)**, arrêté publié au Journal officiel le 13/08/2026. Il s'applique aux échéances du 01/10/2026 au 30/09/2027 [24].
- 2025 : 123,03 (+0,42 %) ; 2024 : 122,55 (+5,23 %) [24].
- À La Réunion, c'est **l'évolution du prix des denrées** qui fait varier le loyer, pas cet indice.

### 3.4 Proposition (EST)

Calcul : valeur des terres × un taux de rendement locatif de 1,2 à 3 % par an (hypothèse de l'agent, non sourcée).

- 11 000 €/ha × 1,2 % ≈ 130 €/ha ;
- 15 000 €/ha × 2 % ≈ 300 €/ha ;
- 20 000 €/ha × 3 % ≈ 600 €/ha.

Pour 1,5 ha : **200 / 450 / 900 € par an**, ou **0** si le maraîcher est propriétaire. Le fermage se paie en général une fois par an.

**À faire :** calculer le loyer réel avec l'arrêté n°510 et l'arrêté sur le prix des denrées, ou demander à la SAFER Réunion ou à la DAAF.

---

## 4. Électricité

Les tarifs EDF Réunion sont alignés sur la métropole par la péréquation tarifaire. Leurs grilles propres incluent la « rémanence d'octroi de mer » [25] [26].

### 4.1 Tarif Bleu non résidentiel (3 à 36 kVA), grille HT au 01/02/2026 [RUN] [25]

| Puissance | Abonnement Base (€/an HT) | Énergie Base (c€/kWh HT) | Abonnement Heures pleines / Heures creuses (€/an HT) |
|---|---|---|---|
| 3 kVA | ≈ 134 | 14,2252 | — |
| 6 kVA | ≈ 167 | 14,2252 | ≈ 167 |
| 9 kVA | ≈ 199 | 14,2252 | ≈ 200 |
| 12 kVA | ≈ 230 | 14,2252 | ≈ 234 |
| 15 kVA | ≈ 261 | 14,2252 | ≈ 266 |

En option Heures pleines / Heures creuses, l'énergie coûte 14,9952 c€/kWh en heures pleines et 11,3752 c€/kWh en heures creuses [25].

**Tarif Bleu résidentiel TTC au 01/02/2026** [26], pour comparaison :

- énergie : 19,15 c€/kWh (3 kVA) à 19,03 c€/kWh (9 kVA et plus) ;
- abonnements : 130,99 € (3 kVA), 171,34 € (6 kVA), 214,81 € (9 kVA) et 256,59 € (12 kVA) par an ;
- rémanence d'octroi de mer : 1,4852 c€/kWh, incluse.

Une grille au **01/08/2026** existe [26], mais **elle n'a pas été lue**. En métropole, le Tarif Bleu a augmenté de 2,5 % TTC au 01/08/2026 ; cette hausse n'est pas vérifiée pour La Réunion.

### 4.2 Taxes [HORS RUN]

- **Accise sur l'électricité**, petits professionnels (≤ 36 kVA) : **30,85 €/MWh au 01/02/2026**, puis 30,62 €/MWh au 01/08/2026 [27].
- Une majoration d'accise s'applique dans les zones non interconnectées, dont La Réunion, depuis le 01/08/2025. Son montant n'a pas été trouvé [27].
- TVA : 8,5 % à La Réunion, récupérable si la ferme est assujettie.

### 4.3 Proposition (EST)

Consommation estimée : 1 000 / 2 500 / 5 000 kWh par an (petite chambre froide, éclairage LED des deux poulaillers, outils, surpresseur si la pression du réseau ne suffit pas).

| Hypothèse | Abonnement | Énergie et accise | Total par an | Par mois |
|---|---|---|---|---|
| Basse | 6 kVA : 167 € | 1 000 kWh × 0,1729 € | 340 € | 28 € |
| Médiane | 9 kVA : 199 € | 2 500 kWh × 0,1729 € | 631 € | 53 € |
| Haute | 12 kVA : 230 € | 5 000 kWh × 0,1729 € | 1 094 € | 91 € |

**Proposition : 30 / 55 / 95 € par mois.** L'arrondi vers le haut couvre la CTA (contribution tarifaire d'acheminement), non chiffrée. Facture **mensuelle** dans le modèle ; le rythme réel de facturation n'a pas été vérifié.

Si la parcelle n'est pas raccordée, le coût du branchement s'ajoute : il n'a pas été cherché.

---

## 5. Assurance

- **Aucun tarif réunionnais trouvé** : ni chez Groupama Océan Indien, ni à la CGSS, ni dans le poste « assurances » du RICA, dont les extraits sont illisibles.
- **Repères hors Réunion, peu fiables** [HORS RUN] :
  - responsabilité civile agricole seule : **60 à 70 € par an** (2026) [29] ;
  - multirisque d'une petite exploitation : **500 à 2 500 € par an**, dont **800 à 1 200 € par an pour 1,5 ha** [28]. C'est un site commercial de business plans, sans source citée.
  - Les sites de Groupama et du Crédit Agricole ne donnent aucun prix.
- **Risque cyclone [RUN] :**
  - Le **FSOM** (Fonds de secours pour l'outre-mer) indemnise les sinistrés **non assurés**, agriculteurs compris [30].
  - Conditions après Belal (2024) : être à jour de ses cotisations sociales et fiscales, avoir déclaré ses surfaces sur Télépac, et avoir perdu **plus de 13 %** de la production concernée [30].
  - Le cyclone Garance (2025) a causé environ 151,6 M€ de dégâts agricoles, sur ≈ 250 M€ au total [31].
  - Barème du Département applicable au 01/01/2025, aide à la replantation : **2 000 €/ha** de maraîchage en plein champ, **2 000 € pour 1 000 m²** sous abri, plafond de **5 000 € par exploitation** [36].
- **Proposition EST : 400 / 900 / 1 800 € par an**, sans le véhicule.
  - Basse : RC et multirisque minimale (poulailler, petit matériel).
  - Médiane : milieu de la fourchette commerciale pour 1,5 ha.
  - Haute : abris assurés, si un assureur accepte le risque.
  - Cotisation annuelle, souvent payable par mois.

---

## 6. Amortissement des abris et du matériel

### 6.1 Abris

| Repère | Prix | Prix au m² | Source |
|---|---|---|---|
| Serres anticycloniques, 6 × 1 000 m², Plaine-des-Palmistes | 2 200 000 € HT de travaux | ≈ 350 €/m² (calcul de l'agent) | [32] [RUN] |
| Serre de 700 m², Bras-Panon (article ancien) | 250 000 € | ≈ 360 €/m² | [33] [RUN] |
| Ferme agrivoltaïque Agrinergie 5, Saint-Joseph | 6,7 M€ pour 14 200 m², centrale solaire comprise | non comparable | [33] [RUN] |
| Tunnel agricole 9 × 20 m (métropole) | 7 000 à 8 500 € | ≈ 39 à 47 €/m² | [34] [HORS RUN] |
| Tunnel agricole 9 × 10 m (métropole) | 4 500 à 5 000 € | ≈ 50 à 56 €/m² | [34] [HORS RUN] |
| Bâche polyéthylène (PE) 200 µ | durée de vie de 18 mois, jusqu'à 24 à 36 mois si bien posée | — | fabricant cité dans l'extrait [35] [HORS RUN] |
| Bâche PVC haute résistance | plus de 10 ans | — | [35] [HORS RUN] |

Remarques :

- Les serres réunionnaises à ≈ 350 €/m² sont souvent **photovoltaïques**. Dans ces montages, l'investissement est souvent porté par un producteur d'énergie, pas par le maraîcher. Ce prix est donc un **majorant**.
- **Aides à l'investissement :** depuis 2014, le Département est l'autorité de gestion du FEADER à La Réunion [HORS RUN : document de 2016]. **Le taux d'aide et le plafond au m² pour les serres n'ont pas été trouvés.**
- **Durée d'amortissement :** aucune source trouvée dans cette session. L'agent retient **10 à 12 ans** pour la structure, et compte la bâche dans l'entretien ou dans le renouvellement.

**Proposition pour la ligne 9 (EST)**, avec une hypothèse de 500 m² d'abris, à ajuster selon le plan de culture :

| Hypothèse | Prix et durée | Coût par m² et par an | Total pour 500 m² |
|---|---|---|---|
| Basse | 45 €/m², 10 ans (tunnel simple, démonté avant les cyclones) | 4,5 € | **2 250 €/an** |
| Médiane | 100 €/m², 12 ans (abri anticyclonique simple ; valeur entre les deux bornes sourcées) | 8,3 € | **4 200 €/an** |
| Haute | 200 €/m², 12 ans (structure lourde, sans montage photovoltaïque) | 16,7 € | **8 300 €/an** |

### 6.2 Matériel et irrigation [HORS RUN]

- **Motoculteurs Pubert :**
  - ARO PRO 55H C3 : 988 € TTC ;
  - VARIO 55P C3 : 813 € TTC ;
  - fraise arrière ROTO 507, version professionnelle : 2 059 € TTC [39].
- Motoculteur à fraise arrière de 50 cm (Eurosystems) : 1 269,90 € TTC, soit 1 058 € HT [39].
- Location d'un motoculteur Grillo G85 (fraise de 60 cm) : 47 € par jour [41].
- **Micro-tracteurs d'occasion** en France : Iseki 27 ch à 7 980 € TTC ; Yanmar 25 ch à 6 150 € TTC ; Solis de 2024 à 9 500 € TTC [40].
- Micro-tracteur **neuf** Solis 26 HST avec cabine : **28 955 € TTC** (Autriche, 2025) [40].
- **Goutte-à-goutte :**
  - 1 200 à 1 500 €/ha sur 20 ha, plus **205 à 400 €/ha et par an** pour renouveler les tuyaux [37] ;
  - 1 000 €/ha pour la ligne seule (fiche artichaut 2017, sans filtration ni pompe), plus 520 €/ha de paillage biodégradable [38] ;
  - 6 000 à 15 000 €/ha pour une installation complète en maraîchage (sites commerciaux, non sourcés).
  - La durée de vie dépend du type de gaine : jetable chaque année, ou enterrée pour 20 ans et plus [37] [38].
- **Chambre froide** et **poulailler** : aucun prix trouvé dans cette session.

### 6.3 Calcul de la ligne 8 (EST)

**Basse ≈ 1 000 €/an :**

- motoculteur à 2 500 € sur 7 ans ≈ 360 € ;
- goutte-à-goutte : 1,5 ha × 1 500 € = 2 250 € sur 5 ans ≈ 450 € ;
- petit matériel : 1 000 € sur 5 ans = 200 €.

**Médiane ≈ 3 200 €/an :**

- micro-tracteur d'occasion à 8 000 € et outils à 2 000 €, sur 8 ans ≈ 1 250 € ;
- motoculteur ≈ 360 € ;
- goutte-à-goutte : 1,5 ha × 4 000 € = 6 000 € sur 7 ans ≈ 860 € ;
- chambre froide à 5 000 € sur 10 ans = 500 € (prix non sourcé) ;
- petit matériel ≈ 300 €.

**Haute ≈ 7 000 €/an :**

- micro-tracteur neuf à 29 000 € et outils à 6 000 €, sur 10 ans = 3 500 € ;
- goutte-à-goutte : 1,5 ha × 10 000 € = 15 000 € sur 8 ans ≈ 1 875 € ;
- chambre froide à 8 000 € sur 10 ans = 800 € ;
- motoculteur ≈ 300 € ;
- petit matériel ≈ 500 €.

---

## 7. Comptabilité et cotisations sociales

### 7.1 Comptabilité [HORS RUN]

- **Aucun tarif CERFRANCE Réunion ni AGC trouvé.**
- Expert-comptable agricole : établissement d'un bilan entre **900 et 3 000 € HT** [48].
- Témoignage sur un forum : adhésion à un centre de gestion **150 à 200 € par an**, contre plus de **2 000 € par an** pour un cabinet comptable [49].
- Le **micro-BA** (article 64 bis du code général des impôts) a remplacé le forfait agricole [50]. Le revenu imposable y est calculé sur la moyenne des recettes de trois ans, moins un abattement : la tenue d'une comptabilité complète n'est donc pas obligatoire.
- Selon [50], l'adhésion à un centre de gestion évite une majoration de 1,25 du revenu imposable. D'après l'agent, sans vérification dans cette session, cet avantage a été supprimé progressivement pour les revenus à partir de 2023.
- **Proposition EST : 200 / 900 / 2 000 € par an** (ligne 7), souvent prélevés par mois par les centres de gestion.

### 7.2 Cotisations sociales de l'exploitant (CGSS Réunion)

**Règles propres aux DOM [RUN] :**

- Dans les DOM, les cotisations sont calculées sur la **surface pondérée**, et non sur le revenu. Les coefficients de La Réunion sont fixés par l'**arrêté du 3 juin 1985** [42] [47].
- Il faut au moins **2 ha pondérés** pour être affilié [42] [47].
- **Sous 40 ha pondérés**, l'exploitant est **exonéré** des cotisations d'assurance maladie (AMEXA), de vieillesse et de prestations familiales [42].
- La loi de financement de la Sécurité sociale pour 2026 a supprimé, au 01/01/2026, la condition sur la nature des surfaces ajoutées et la limite de 5 ans en cas de dépassement [43] (analyse Weblex, texte officiel non lu).
- **Restent dues** [42] : l'ATEXA, la retraite complémentaire, les indemnités journalières, la formation (VIVEA). L'extrait cite aussi l'AMEXA, dans un passage sur une aide particulière.

**Montants relevés :**

| Cotisation | Montant | Source |
|---|---|---|
| ATEXA 2026, chef d'exploitation à titre principal | 527,73 € (catégorie A) à 560,38 € (catégorie E) par an | [44] barème national [HORS RUN]. Le montant pour les DOM n'a pas été trouvé |
| IJ AMEXA 2026 | 250 € par an | [44] [HORS RUN] |
| RCO, barème national 2026 | 4 % d'une assiette minimale de 1 820 SMIC horaires (12,02 €), soit ≈ **875 € par an** | [44] [HORS RUN]. Dans les DOM, le barème prévoit des taux selon la superficie (barème outre-mer 2024 de la MSA Martinique) [45], montants non lus |
| AMEXA DOM 2025, tranche de 2 à 40 ha pondérés | base de 618,29 €, plus un supplément par hectare au-delà de 20 ha pondérés | [45] barème MSA Guadeloupe pour les DROM. À priori couvert par l'exonération sous 40 ha |
| Forfait par tranche de surface pondérée dans les DOM (article D950-8) | **18,61 €** de 2 à 40 ha pondérés ; 52,19 € de 40 à 120 ha ; 92,23 € au-delà | [46] site tiers. **Objet à vérifier** : probablement la contribution formation des DOM ; le sigle VIVEA n'apparaît pas dans l'extrait |
| VIVEA, barème national | 0,61 % à 0,89 % du plafond de la Sécurité sociale (PASS) de 2026, soit 48 060 € : ≈ 293 à 428 € par an | [44] [HORS RUN] |
| Retraite selon la CGSS | « part forfaitaire de 288,47 € au 01/01/2022 », plus une part proportionnelle selon les points acquis par surface | [42]. Il n'est pas clair s'il s'agit d'une cotisation ou d'une pension : non retenu |

**Surface pondérée de la ferme :** les coefficients de 1985 pour le maraîchage et les volailles n'ont pas été lus. Avec 1,5 ha de légumes et 200 poules, la ferme est très probablement entre 2 et 40 ha pondérés (EST).

**Proposition EST : 800 / 1 650 / 2 750 € par an** (ligne 1). Le calcul est détaillé au § 0. La CSG-CRDS dans ce régime n'a pas été vérifiée.

Paiement : appel provisionnel, puis solde calculé sur la surface au 1er janvier [42]. Un paiement par mois est souvent possible.

---

## 8. Poules (repères pour l'agent « poules »)

Ces repères complètent `recherche-3-poules.md` et vont dans le même sens.

| Point | Résultat | Source |
|---|---|---|
| Prix d'une poulette prête à pondre à La Réunion | **Non trouvé** (ni couvoirs, ni Avipôle, ni annonces). Repère métropole : **14 à 20 €** la poulette, contre 2 à 5 € le poussin | [51] [HORS RUN] |
| Approvisionnement en poussins | Le couvoir ECLOCEA (Saint-Joseph, mars 2024) produit surtout des poussins de chair (souche Ross). AVIPALM (Saint-Pierre) importe des volailles. Aucun poussin de ponte ne serait produit localement : l'Urcoopa les importe (extrait de recherche, attribution à vérifier) | [52] [RUN] |
| Prix d'un sac de 25 kg d'aliment pondeuse à La Réunion | **Non trouvé** (Urcoopa, Prover, Point Vert). Repère métropole : 15,50 € les 25 kg chez Bricomarché, prix grand public | [55] [HORS RUN] |
| Contexte de l'aliment | L'aliment représente ≈ 61 % des charges en volaille de chair [56]. **Crise de l'Urcoopa** : motion du Département du 15/04/2026 sur la sécurisation de l'alimentation animale [54]. C'est un risque de hausse : garder une valeur haute large | [54] [56] [RUN] |
| Prix de l'œuf en vente directe | Marchés forains, **plateau de 30 œufs : 8,50 à 10,50 € en 2025**, soit 0,28 à 0,35 € l'œuf. 9,00 € le 28/03 ; 8,50 € le 16/05 ; 9,00 € le 25/07 ; 10,25 € le 24/10 ; 10,50 € le 21/11 ; 10,00 € le 19/12. Plusieurs relevés sont peu représentatifs | [53] [RUN] |
| Prix de l'œuf payé au producteur | Non trouvé | — |
| Filière | 151 millions d'œufs en 2024 ; 22 éleveurs au syndicat des producteurs d'œufs ; environ 40 indépendants en plein air avec de petits effectifs | [52] [RUN] |

---

## 9. Paniers

- **AMAPéi Sud Réunion** (Le Tampon) : stand aux marchés du samedi de Saint-Pierre et du Tampon. Son partenaire, la **Ferme Mahavel** (Petite-Île), propose des paniers bio à ses adhérents et vend au marché bio de Petite-Île [57] [58] [RUN].
- **Ti'Légumes Bio** (Plaine des Cafres) [57] [RUN] :
  - **18 € le panier**, à raison de **2 paniers par mois** ;
  - engagement de 12 mois au plus, avec 3 mois d'essai ;
  - adhésion de **20 € par famille et par an** ;
  - la page a environ 600 jours : prix à revérifier.
- **Repères de `recherche-4`** [RUN, vers 2022] : paniers privés du Sud à **18 à 25 €**.
- **Nombre de paniers par semaine dans une AMAPéi du Sud : non trouvé.**
- Selon la DAAF, les cultures maraîchères se trouvent surtout à Saint-Pierre (24 %), au Tampon (21 %) et à Saint-Joseph (14 %) [59] [RUN] : c'est le bassin de clientèle de la ferme.

**Proposition EST :**

- **15 / 20 / 30 paniers par semaine**, repris de `recherche-4`, pour un seul actif qui vend aussi sur deux marchés ;
- **18 / 20 / 25 € le panier** [57] ;
- le producteur ne paie pas de commission en AMAP.

---

## 10. Sources

Toutes ont été consultées le 15/10/2026, **par extraits WebSearch** : les pages n'ont pas été ouvertes. Les dates indiquées sont celles des documents, quand elles sont connues.

1. DAAF La Réunion, Agreste. *Résultats économiques des exploitations agricoles à La Réunion en 2017* (RICA, publié en 2019). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/RICA_publi_2019_cle0feb2f-2.pdf [RUN]
2. DAAF La Réunion. *En 2018, les résultats des exploitations agricoles en hausse* (Agreste n°110, décembre 2020). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20201211_Publi_RICA_result_2018_FL2_cle011271.pdf [RUN]
3. DAAF La Réunion. *2020, une année favorable pour la plupart des exploitations* (avril 2022). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20220427_Publi_RICA_Resultats_2020_VF_cle02568a.pdf [RUN]
4. DAAF La Réunion. *En 2021, une baisse des performances économiques des exploitations réunionnaises*. https://daaf.reunion.agriculture.gouv.fr/en-2021-une-baisse-des-performances-economiques-des-exploitations-reunionnaises-a3334.html [RUN]
5. DAAF La Réunion. *L'essentiel RICA 2022* (janvier 2024). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20240124_essentiel_aveccouverture_rica2022_v3.pdf ; *L'essentiel RICA 2023* : https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20240124_essentiel_aveccouv_rica2023_v1.pdf [RUN]
6. DAAF La Réunion. *Des résultats économiques agricoles en net retrait en 2023* (étude RICA 2023, mai 2025). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20250514_etude_rica_2023.pdf ; https://daaf.reunion.agriculture.gouv.fr/des-resultats-economiques-agricoles-en-net-retrait-en-2023-a3944.html [RUN]
7. DAAF La Réunion. *RICA – Un léger rebond des résultats économiques agricoles en 2024* (avril 2026), et *L'essentiel RICA 2024* (février 2026). https://daaf.reunion.agriculture.gouv.fr/rica-etude-un-leger-rebond-des-resultats-economiques-agricoles-en-2024-a4198.html ; https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20260421_etude_rica_2024.pdf ; https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20260226_essentiel_aveccouv_rica2024_v2.pdf [RUN]
8. Agreste. *Primeur n°8, décembre 2024 : résultats économiques des exploitations (RICA 2023)*. Champ : métropole, Guadeloupe et La Réunion. https://agreste.agriculture.gouv.fr/agreste-web/download/publication/publie/Pri2408/Primeur2024-8_RICA.pdf [HORS RUN]
9. SAPHIR. *Annexe 11 – Avenant 2 Sud 2022 (modifiée par l'avenant n°6) : tarification de l'eau et prestations annexes*, grille au 01/01/2024. https://www.saphir.re/wp-content/uploads/ANNEXE-11-AVENANT-2-SUD-2022.pdf [RUN]
10. Zinfos974. *Entretien : le ciel de la SAPHIR s'éclaircit avec la vente d'eau brute aux fermiers* (vers 2021-2022) ; *La SAPHIR, au service des agriculteurs ou à la recherche des contrats plus rentables ?* (2020). https://www.zinfos974.com/entretien-le-ciel-de-la-saphir-s-eclaircit-avec-la-vente-d-eau-brute-aux-fermier/ ; https://www.zinfos974.com/la-saphir-au-service-des-agriculteurs-ou-a-la-recherche-des-contrats-plus-rentab/ [RUN]
11. Département de La Réunion. *Exposition ILO – Irrigation du Littoral Ouest* (2018). https://www.departement974.fr/sites/default/files/2018-04/amen_Exposition-ILO.pdf [RUN]
12. Cour des comptes (chambre régionale des comptes). *Société d'aménagement des périmètres hydroagricoles de La Réunion (SAPHIR)*. https://www.ccomptes.fr/fr/publications/societe-damenagement-des-perimetres-hydroagricoles-de-la-reunion-saphir [RUN]
13. Département de La Réunion. *Bras de la Plaine* (fiche) ; *Rencontres de l'eau* (novembre 2015). Leader Réunion, *Les périmètres irrigués du Sud vont s'étendre*. https://departement974.fr/sites/default/files/bras_de_la_plaine.pdf ; https://departement974.fr/sites/default/files/2017-10/rencontres-de-leau-novembre2015.pdf ; https://www.leaderreunion.fr/en/les-perimetres-irrigues-du-sud-vont-setendre/ [RUN]
14. Fédération des EPL. *Île de La Réunion : eau potable et irrigation, un équilibre délicat* (2011) ; *La SAPHIR, 50 ans pour dompter les eaux* (2020). https://lesepl.fr/epl-en-action/ile-de-la-reunion-eau-potable-et-irrigation-un-equilibre-delicat/?pdf=77049 ; https://lesepl.fr/2020/11/la-saphir-50-ans-pour-dompter-les-eaux/ [RUN]
15. Office de l'eau Réunion. *Chroniques de l'eau n°141* (août 2024) : prix moyen de l'eau au 01/01/2024. https://www.eaureunion.fr/fileadmin/user_upload/Chroniques/2024/24.08.06_CHRONIQUES_de_L_EAU_141.pdf [RUN]
16. Réussir Fruits et Légumes. *Des clés pour irriguer*. https://reussir.fr/fruits-legumes/des-cles-pour-irriguer [HORS RUN]
17. DEAL Réunion. *Conférence de l'eau : restitution* (18/12/2025). https://www.reunion.developpement-durable.gouv.fr/IMG/pdf/20251218_conference_eau_restitution_4pagesvdef.pdf [RUN]
18. CASUD. *Convention de vente en gros d'eau à usage industriel* (conseil communautaire du 26/06/2026). https://www.casud.re/sites/default/files/2026-07/aff17_cc.26.06.2026_approb._conv._vente_en_gros_ep_usage_industriel.pdf [RUN]
19. DAAF La Réunion. *Parution de l'arrêté préfectoral déterminant le prix des denrées fermage pour 2025* ; préfecture, *Prix des denrées agricoles* ; DAAF, communiqué *Baux ruraux* (09/05/2018). https://daaf.reunion.agriculture.gouv.fr/parution-de-l-arrete-prefectoral-determinant-le-prix-des-denrees-fermage-pour-a3034.html ; https://www.reunion.gouv.fr/Actions-de-l-Etat/Agriculture-alimentation-et-foret/Agriculture/Actualites/Prix-des-denrees-agricoles ; https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/press_2018-05-09_DAAF_baux_ruraux_cle85395c.pdf [RUN]
20. Linfo.re. *Le gel des prix des denrées agricoles acté par un nouvel arrêté préfectoral* (2021). https://www.linfo.re/la-reunion/societe/le-gel-des-prix-des-denrees-agricoles-acte-par-un-nouvel-arrete-prefectoral [RUN]
21. SAFER Réunion. *Foncier* : fermage, arrêté du 30/09/2024, valeurs vénales au 26/08/2025. https://www.safer-reunion.fr/foncier [RUN]
22. Agreste La Réunion. *Valeur vénale des terres agricoles 2023* (septembre 2024). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/etude_vvt_2023.pdf [RUN]
23. Le-prix-des-terres.fr. *DOM – Île de la Réunion* (site non officiel). https://www.le-prix-des-terres.fr/reunion/ [RUN, non officiel]
24. Réussir. *Indice national des fermages : la hausse de 3,23 % en 2026 est confirmée* (août 2026) ; Weblex, *Indice national des fermages, année 2026*. https://www.reussir.fr/indice-des-fermages-la-hausse-de-323-en-2026-est-confirmee ; https://www.weblex.fr/chiffres-cles/indice-national-des-fermages-annee-2026 [HORS RUN]
25. EDF Réunion. *Grille de prix du tarif Bleu non résidentiel, tarifs HT* (01/02/2026). https://reunion.edf.fr/sites/sei_reu/files/2026-02/bleu_collectivite_reunion.pdf [RUN]
26. EDF Réunion. *Grilles de prix du tarif Bleu résidentiel TTC* (01/02/2026 ; grille du 01/08/2026 non lue). https://reunion.edf.fr/sites/sei_reu/files/2026-02/Tarif_Bleu_residentiel_TTC_Reunion_01022026.pdf ; https://reunion.edf.fr/sites/sei_reu/files/2026-08/Tarif_Bleu_residentiel_TTC_Reunion_01082026.pdf [RUN]
27. Selectra Entreprises. *Les taxes sur l'électricité* (2026) ; EDF Entreprises, *Qu'est-ce que l'accise sur l'électricité ?* https://entreprises.selectra.info/energie/electricite/taxes ; https://www.edf.fr/entreprises/faq-entreprises/facture/les-taxes-evolutions-tarifaires-en-electricite/qu-est-ce-que-l-accise-sur-l-electricite [HORS RUN]
28. Modelesdebusinessplan.com. *Maraîchage : estimation du budget* (site commercial, non daté). https://modelesdebusinessplan.com/blogs/infos/maraichage-estimation-budget-outil [HORS RUN, peu fiable]
29. LegalPlace. *Assurance professionnelle agricole* (2026). https://www.legalplace.fr/guides/assurance-professionnelle-agricole/ [HORS RUN, peu fiable]
30. DEAL Réunion. *Présentation FSOM et CatNat* (2022) ; préfecture, *Prolongement du délai FSOM Belal* (07/03/2024). https://www.reunion.developpement-durable.gouv.fr/IMG/pdf/2_a-presentation_fsom_et_catnat_2022.pdf ; https://www.reunion.gouv.fr/contenu/telechargement/41762/312845/file/2024-03-07_Prolongement_Delai_FSOM_Belal.pdf [RUN]
31. Outremers360. *Le cyclone Garance va coûter 160 à 200 millions d'euros au secteur de l'assurance* (2025). https://outremers360.com/bassin-indien-appli/le-cyclone-garance-va-couter-160-a-200-millions-deuros-au-secteur-de-lassurance [RUN]
32. DR-AW. *Serres anticycloniques* (projet de Plaine-des-Palmistes). https://www.dr-aw.fr/projets/serres-anticycloniques/ [RUN]
33. L'Usine Nouvelle. *La Réunion, parfait laboratoire de l'agrivoltaïsme*. https://www.usinenouvelle.com/article/la-reunion-ile-aux-tresors-d-agri-energie.N2217231 [RUN]
34. Hellopro. *Combien coûte une serre agricole ?* https://conseils.hellopro.fr/combien-coute-une-serre-agricole-1342.html [HORS RUN]
35. La Fabrique à Filets. *Bâche PVC pour serre tunnel 640 g/m²*. La durée de vie de la bâche PE vient d'un fabricant cité dans le même résultat, sans identification certaine. https://www.fabrique-a-filets.com/filets-pour-cultures/1104-bache-pvc-pour-serre-tunnel-640gm-standard.html [HORS RUN]
36. Département de La Réunion. *Règlement du protocole cyclone agriculteurs*, barème au 01/01/2025. https://subventions.departement974.fr/wp-content/uploads/reglement_protocole_cyclone_agriculteurs_CMA_v1803.pdf [RUN]
37. Terre-net. *Francis Bourges : « Efficience améliorée, temps gagné et image redorée »* (goutte-à-goutte). https://www.terre-net.fr/observatoire-technique-culturale/strategie-technique-culturale/article/francis-bourges-efficience-amelioree-temps-gagne-et-image-redoree-217-104037.html [HORS RUN]
38. Ecophytopic. *Goutte à goutte et paillage biodégradable* (fiche de 2017). https://pprod.ecophytopic.fr/sites/default/files/2020-10/goutte%20%C3%A0%20goutte%20et%20paillage%20biodegradable.pdf [HORS RUN]
39. Pubert, catalogue des motoculteurs ; Bricozor, motoculteur à fraise arrière de 50 cm. https://pubert.com/en/?p=6025 ; https://www.bricozor.com/l-55-motoculteur-a-fraise-arriere-50-cm-p55-moteur-bs-series-675.html [HORS RUN]
40. Annonces de micro-tracteurs : Leboncoin (occasion, France) et Landwirt.com (Solis 26 HST neuf, Autriche, 2025). https://leboncoin.fr/ck/materiel_agricole/tracteur-4-roues-motrices/p-3 ; https://www.landwirt.com/tags/kleintraktoren [HORS RUN]
41. Plateforme d'outils partagés AgroEcoLogique (HelloAsso) : location d'un motoculteur Grillo G85. https://www.helloasso.com/associations/lergueetlesamarres/evenements/plateforme-outils-partages-agroecologique [HORS RUN]
42. CGSS Réunion. *L'essentiel : la Sécurité sociale et le monde agricole* (mai 2023) ; MSA – CGSS Réunion, *Les principes de calcul des cotisations* ; simulateur des cotisations. https://www.cgss.re/sites/default/files/fichiers_publics/publicationsPdf/livret_agricole_29_06_2023.pdf ; https://reunion.msa.fr/lfp/en/calcul-cotisations-nsa ; https://www.cgss.re/webapps/calcul-msa/ [RUN]
43. Weblex. *Exploitants agricoles ultramarins : évolution de l'exonération des cotisations sociales* (2026). https://www.weblex.fr/weblex-actualite/exploitants-agricoles-ultramarins-evolution-de-l-exoneration-des-cotisations-sociales [HORS RUN, portée DOM]
44. MSA. *Barème des cotisations et contributions sociales des non-salariés agricoles 2026* ; *Les cotisations et contributions du chef d'exploitation*. https://www.msa.fr/lfp/documents/11566/41428048/Bar%C3%A8me+des+cotisations+et+contributions+sociales+des+non+salari%C3%A9s+agricoles+2026 ; https://www.msa.fr/lfp/en/exploitant/cotisations-et-contributions [HORS RUN]
45. MSA Guadeloupe. *Barème des cotisations NSA des DROM 2025* ; MSA Martinique, *Barème cotisations NSA Outre-mer 2024*. https://guadeloupe.msa.fr/lfp/documents/98880/91027130/BAREME+DES+COTISATIONS+ET+CONTRIBUTIONS+SOCIALES+DES+NON+SALARIES+AGRICOLES.pdf ; https://martinique.msa.fr/lfp/documents/11566/41428048/Bar%C3%A8me+cotisations+NSA+Outre-mer+2024 [HORS RUN, DOM]
46. Article D950-8 (montants par tranche de surface pondérée dans les DOM), reproduit par un site tiers : texte à vérifier sur Légifrance. https://www.thetradehub.eu/fr/reglementation/france/legislation/cibs/csp-art-d950-8 [DOM, à vérifier]
47. Assemblée nationale, question orale (12ᵉ législature) : seuil de 2 ha pondérés et arrêtés du 3 juin 1985 ; Légifrance, *Arrêté du 3 juin 1985 fixant pour la Réunion les coefficients affectés aux superficies*. https://questions.assemblee-nationale.fr/dyn/12/questions/QANR5L12QOSD1182.pdf ; https://legifrance.gouv.fr/loda/id/LEGITEXT000006073722/2026-08-13 [RUN]
48. Legalnest. *Agriculteur : quels sont les meilleurs comptables ?* https://www.legalnest.fr/expert-comptable/activite/agricole [HORS RUN]
49. CommentÇaMarche, forum *Comptabilité exploitation agricole* (témoignage). https://droit-finances.commentcamarche.com/forum/affich-4099080-comptabillite-exploitation-agricole [HORS RUN, témoignage]
50. Le Monde du Droit. *Adhésion à un centre de gestion agréé pour les exploitants agricoles avec option pour un régime fiscal*. https://www.lemondedudroit.fr/fiscal/309-fiscalite-des-entreprises/20333-adhesion-a-un-centre-de-gestion-agree-pour-les-exploitants-agricoles-avec-option-pour-un-regime-fiscal.html [HORS RUN]
51. Hellopro. *Lancer son élevage de poules pondeuses : guide complet*. https://conseils.hellopro.fr/lancer-son-elevage-de-poules-pondeuses-guide-complet-5137.html [HORS RUN]
52. DAAF La Réunion. *Fiche filière Œufs et ovoproduits* (août 2025) ; *Fiche filière Volaille* (mars 2025). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/202508_filiere_oeufs_2025.pdf ; https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/202403_filiere_volaille_2025.pdf [RUN]
53. DAAF La Réunion. *Mercuriales, prix au détail sur les marchés forains*, relevés de 2025 (du 28/03 au 19/12), par exemple : https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20251219_mer_detail_forains__legfruits.pdf ; https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20251024_mer_detail_forains__legfruits.pdf [RUN]
54. Département de La Réunion. *Motion URCOOPA*, séance plénière du 15/04/2026. https://www.departement974.fr/sites/default/files/motion_urcoopa.docx [RUN]
55. Cherchons.com. *Aliment poule pondeuse* (comparateur). https://www.cherchons.com/animalerie/oiseau/alimentation-pour-oiseaux/aliment-poule-pondeuse.html [HORS RUN]
56. Idele et Chambre d'agriculture de La Réunion. *Référentiel RRE Volailles de chair, conjoncture 2022, Réunion*. https://idele.fr/fileadmin/user_upload/Referentiel_RRE_Volailles_de_chair_conj2022_Reunion.pdf [RUN]
57. Ti'Légumes Bio. *AMAPéi*. https://tilegumesbio.re/amapei/ [RUN]
58. Département de La Réunion. *Les AMAPéi à La Réunion* ; Agribio Réunion, fiche *AMAPei* ; Cetanou, catégorie *Amap Péi* ; Réseau AMAP, annuaire 974. https://www.departement974.fr/actualite/les-amapei-reunion ; https://agribio.reunion.chambagri.fr/fiche/amapei/ ; https://www.cetanou.com/annuaire974/wpbdp_category/amap-pei/ ; https://reseau-amap.org/amap-974.htm [RUN]
59. DAAF La Réunion. *Fiche filière Légumes* (novembre 2023). https://daaf.reunion.agriculture.gouv.fr/IMG/pdf/20231122_filiere_legumes.pdf [RUN]
60. Bio Nouvelle-Aquitaine. *S'installer en maraîchage, guide pratique* (édition 2016). https://www.bionouvelleaquitaine.com/wp-content/uploads/2019/02/SINSTALLER-EN-MARAICHAGE-Guide-bd.pdf [HORS RUN]
61. Réseau Semences Paysannes / Reneta. *Je m'installe en maraîchage biologique en région Centre-Val de Loire*. https://reneta.fr/IMG/pdf/guide-installation-maraichage-bio.pdf [HORS RUN]
62. CIVAM du Gard. *Quelques références techniques, économiques et sociales* (2020). https://civamgard.fr/agroecologie/files/QuelquesReferencesTechniquesEconomiquesEt_fichierpdf_references-techniques-economiques-sociale-2020.pdf [HORS RUN]
63. CIRAD. *Les systèmes de production agricoles et leurs fonctions de demande en eau sur les périmètres irrigués du sud de la Réunion* (2006). https://agritrop.cirad.fr/539271/1/document_539271.pdf [RUN]

---

## 11. Limites

1. **Extraits seulement.** Aucun PDF n'a été ouvert. Les chiffres viennent des résumés de WebSearch, qui lisent parfois mal les tableaux. C'est le cas de la grille SAPHIR (unité déduite du contexte, part fixe illisible), de la grille EDF non résidentielle (montants « environ ») et des ratios RICA 2020 (extrait en partie illisible).
2. **RICA Réunion :** le détail des charges par poste (assurances, eau, électricité, fermage, entretien, amortissements, honoraires) **n'a pas pu être lu**. Les sections « maraîchage » des publications 2022 à 2024 [5] [6] [7] sont à ouvrir en priorité. Les exploitations du RICA ont en moyenne 3,7 à 3,9 ha et des salariés : elles ne ressemblent pas à la ferme d'exemple.
3. **Eau :** la part fixe (débit souscrit) et la grille 2025-2026 ne sont pas connues. Les volumes par hectare sont des estimations. Il faut aussi vérifier que la parcelle des hauts de Petite-Île est bien desservie (extension Mont-Vert / Anse-les-Hauts).
4. **Fermage :** aucun montant en €/ha n'a été trouvé. La ligne 6 est une **estimation**, à remplacer par le calcul selon l'arrêté n°510 et l'arrêté sur le prix des denrées.
5. **Cotisations sociales :** l'exonération dans les DOM est sourcée, mais les montants de l'ATEXA, de la RCO et de la formation **pour les DOM** n'ont pas été confirmés. L'objet de l'article D950-8 est à vérifier. Les coefficients de pondération de 1985 n'ont pas été lus.
6. **Assurance et comptabilité :** seules des sources commerciales, des forums ou des sources nationales ont été trouvées. Aucun tarif de Groupama Océan Indien, de CERFRANCE Réunion ni d'AGC.
7. **Abris :** il n'existe pas de prix réunionnais pour un abri anticyclonique « simple ». Les bornes vont du tunnel de métropole à la serre photovoltaïque. La surface de 500 m² est une hypothèse de l'agent. Les taux d'aide (FEADER, POSEI) n'ont pas été trouvés.
8. **Matériel :** les prix sont ceux de la métropole ou de l'Autriche, TTC à 20 %. Le fret, l'octroi de mer et la TVA à 8,5 % de La Réunion ne sont pas chiffrés.
9. **Poules et paniers :** pas de prix réunionnais pour la poulette, le sac d'aliment ou l'œuf payé au producteur. Le nombre de paniers d'une AMAPéi n'a pas été trouvé.
10. **Dates :** plusieurs références datent de 2013 à 2024. La grille EDF du 01/08/2026 et les tarifs SAPHIR 2025-2026 n'ont pas été lus. Les montants de 2026 peuvent donc différer.
11. **Hors taxes :** les montants des lignes 3, 5, 7, 8 et 9 sont HT. Si la ferme ne récupère pas la TVA, il faut ajouter 8,5 % (2,1 % pour l'eau, taux non vérifié).
