# Recherche 8 : associations de cultures (voisinage et précédents) pour la ferme d'exemple

- **Date** : 15 octobre 2026
- **Objet** : relations de VOISINAGE (deux cultures en place en même temps sur le même espace) et de PRÉCÉDENT (A cultivée avant B sur le même espace) entre les 11 cultures de la ferme d'exemple (hauts de Petite-Île, Sud de La Réunion) : tomate, piment, salade batavia (laitue), brède petsaï, chou pommé, carotte, haricot vert, courgette, concombre, chouchou, ail péi.
- **Méthode** : environ 67 recherches web (WebSearch), soit un peu plus que le plafond de 60 que je visais. J'ai lu les extraits renvoyés par le moteur. J'ai tenté WebFetch et `curl` sur hal.inrae.fr, ephytia.inrae.fr, manioc.org, daaf.mayotte, ecophytopic.fr, service-public.pf et revistas.upr.edu. Tous ont été refusés (DNS ENOTFOUND, ou 403 du proxy). **Je n'ai donc lu aucun document en entier.** Les « extraits » ci-dessous sont soit des citations rendues mot pour mot par le moteur (entre guillemets « »), soit des résumés d'extraits (signalés « résumé »). Il faut vérifier les années, les auteurs et les pages sur les documents avant de les citer dans le dépôt.
- **Niveaux de preuve** :
  - **E1, essai scientifique** : expérimentation publiée, au champ, sous abri, en pots ou en laboratoire (précisé à chaque fois).
  - **E2, institut technique ou service agricole** : recommandation d'une chambre d'agriculture, d'un service agricole public, d'un BSV ou d'un groupement bio, sans essai publié sur la paire elle-même.
  - **E3, guide de jardinage sans preuve.**
- **Marques** :
  - **[R]** : source réunionnaise.
  - **[NR]** : source non réunionnaise (lieu précisé).
  - **[E]** : estimation ou déduction de ma part, qu'aucune source ne formule telle quelle.
- **Limites principales** :
  1. Je n'ai trouvé **aucune source réunionnaise qui énonce une paire** de voisinage ou de précédent entre ces cultures. Les sources [R] trouvées décrivent le contexte : bioagresseurs présents, souches de *Ralstonia*, projets RESCAM et ST0P de l'ARMEFLHOR. Elles ne donnent pas de règles d'association.
  2. Les sources tropicales les plus proches viennent d'autres territoires : Polynésie française (fiches du projet INTEGRE, 2018), Guyane (Chambre d'agriculture), Martinique (Chambre d'agriculture, FREDON, CIRAD). Les essais d'association viennent surtout du Brésil, d'Inde, d'Afrique, de Porto Rico et de Chine.
  3. Aucune source ne traite du **chouchou** ni de la **brède petsaï** en particulier. Elles n'apparaissent qu'en [E], par analogie avec les autres Cucurbitacées et les autres Brassicacées.
  4. Le classeur `features.json` n'a qu'un effet favorable ou défavorable. Plusieurs associations bien étudiées ont un **effet contrasté** : moins de ravageurs, mais aussi plus de concurrence. Je les range à part et je ne les retiens pas.

---

## 1. Relations retenues (au moins une source E1 ou E2)

### 1a. Voisinage

| # | Culture A | Culture B | Effet | Mécanisme (une phrase) | Sources | Preuve | Marque |
|---|---|---|---|---|---|---|---|
| V1 | Chou pommé | Ail péi | Favorable | L'ail intercalé entre les choux réduit le nombre de larves de teigne des crucifères (*Plutella xylostella*), ravageur majeur du chou à La Réunion. Le rendement du chou n'est pas toujours amélioré. | S20, S21, S22, S46 ; présence du ravageur à La Réunion : S36 | E1 (essais au champ en Inde sur 2 saisons, en Zambie, au Bangladesh ; colza et ail en Iran) | [NR] (ravageur présent [R]) |
| V2 | Piment | Salade (laitue) | Favorable | Les cycles et les ports sont complémentaires : l'association donne le meilleur indice d'utilisation du sol de l'essai (UET 2,64 pour poivron et laitue). | S25 | E1 (essai au champ, Jaboticabal, Brésil, 2003-2004) | [NR] |
| V3 | Piment | Chou pommé | Favorable | L'association utilise mieux le sol que deux cultures pures (UET 1,92). Le piment intercalé réduit aussi les larves de teigne sur le chou. | S25, S24 | E1 (2 essais : Brésil ; Myanmar sur 2 saisons) | [NR] |
| V4 | Tomate | Salade (laitue) | Favorable, **à condition de planter la salade au plus 14 jours après la tomate** | La salade, plantée tôt, est récoltée avant que la tomate ne la couvre. Le rendement commercial de la tomate n'est pas touché. La salade rend un peu moins qu'en culture pure, mais l'indice d'utilisation du sol est le meilleur de l'essai. | S26 | E1 (essai au champ sur 2 saisons, Brésil) | [NR] |
| V5 | Carotte | Salade (laitue) | Favorable | Les enracinements et les durées de cycle sont complémentaires : UET supérieur à 1,60 en conduite biologique. | S27 | E1 (2 essais au champ, Embrapa Agrobiologia, Seropédica, Brésil tropical) | [NR] |
| V6 | Concombre | Ail péi | Favorable (surtout quand le concombre revient sur la même parcelle) | L'ail intercalé améliore la croissance du concombre. Il modifie la vie microbienne du sol : plus de bactéries et d'actinomycètes, moins de champignons. | S28 | E1 (essais en pots et sous tunnel, Chine) ; transfert au plein champ réunionnais incertain | [NR] |
| V7 | Brède petsaï | Ail péi | Favorable (preuve faible) | L'ail ralentit le développement des larves de teigne sur le chou chinois. Cela rejoint V1. | S45 (laboratoire, Fuzhou) ; V1 par analogie | E1 de laboratoire seulement | [NR] [E] |

### 1b. Précédents (A cultivée **avant** B)

| # | A (avant) | B (après) | Effet | Mécanisme (une phrase) | Sources | Preuve | Marque |
|---|---|---|---|---|---|---|---|
| P1 | Tomate | Concombre | Défavorable | Les deux cultures sont très sensibles aux nématodes à galles. Aux Antilles, une souche de *Ralstonia* (flétrissement bactérien) attaque aussi les Cucurbitacées : la tomate laisse la bactérie et les nématodes au concombre. | S1, S2, S3, S7, S17, S18 | E2 (BSV Martinique 2019 et 2023 ; fiche Polynésie) ; hôtes communs E1 | [NR] |
| P2 | Tomate | Courgette | Défavorable | Même mécanisme que P1. Aux Antilles, la courgette est citée parmi les Cucurbitacées atteintes. | S1, S2, S3, S12 (S8 non vérifiée) | E2 | [NR] |
| P3 | Piment | Concombre | Défavorable | Une Solanacée suivie d'une Cucurbitacée : la fiche Polynésie cite le poivron dans les précédents à éviter, et la Martinique proscrit la succession pour le flétrissement bactérien. | S1, S7 | E2 | [NR] |
| P4 | Piment | Courgette | Défavorable | Comme P3. | S1, S2 (S8 non vérifiée) | E2 | [NR] |
| P5 | Concombre ou courgette | Tomate | Défavorable | Les bioagresseurs du sol sont communs, surtout les nématodes à galles (et *Ralstonia* aux Antilles). La fiche de Guyane exclut les Cucurbitacées comme précédent de la tomate. | S10, S17, S18 | E2 (Guyane) ; hôtes communs E1 | [NR] |
| P6 | Concombre ou courgette | Piment | Défavorable | Comme P5. La fiche poivron de Polynésie range les Cucurbitacées dans les précédents à éviter. | S6 | E2 | [NR] |
| P7 | Ail péi | Tomate | Favorable | L'ail mis à la place de la tomate dans la rotation fait baisser la population de nématodes à galles transmise à la culture suivante. L'effet sur le rendement des cultures suivantes est net après 3 ans. | S16, S11 | E1 (essai pluriannuel, Pendjab, Inde) + E2 (Agrobio Bretagne) | [NR] |
| P8 | Ail péi | Concombre | Favorable | Même essai que P7 : le rendement du concombre augmente après l'ail. En Chine, une rotation ail, concombre, concombre a réduit *Fusarium*. | S16, S29 | E1 | [NR] |
| P9 | Ail péi | Piment | Favorable | La fiche poivron de Polynésie cite les légumes bulbes (ail) en précédents favorables. L'effet sur les nématodes (S16) est probablement le même [E]. | S6, S16 | E2 | [NR] |
| P10 | Ail péi | Courgette | Favorable | Les liliacées sont citées en précédents favorables de la courgette. | S12 (S8 non vérifiée) | E2 | [NR] |
| P11 | Carotte | Tomate | Favorable | La carotte n'est pas hôte de *Ralstonia solanacearum* biovar 2 et elle est conseillée comme culture non hôte. Attention : elle reste très sensible aux nématodes à galles. | S14, S15, S11 | E1 (Álvarez et al. 2008, biovar 2 seulement) + E2 | [NR] |
| P12 | Carotte | Piment | Favorable | La fiche poivron de Polynésie cite les légumes racines (carotte) en précédents favorables. | S6 | E2 | [NR] |
| P13 | Salade (laitue) | Tomate | Favorable | Culture courte d'une autre famille, sans bioagresseurs du sol communs majeurs. La laitue est en tête des précédents retenus par la fiche tomate de Guyane. | S10 | E2 (Guyane, tropical) | [NR] |
| P14 | Salade (laitue) | Carotte | Favorable | Les légumes-feuilles (laitue, chou) sont des précédents favorables de la carotte. | S5 | E2 (Polynésie, tropical) | [NR] |
| P15 | Chou pommé | Carotte | Favorable | Même source que P14. En plus, le chou est un hôte médiocre de *Meloidogyne javanica*, et la succession carotte-chou a contenu les nématodes dans un essai. | S5, S17 | E2 + E1 | [NR] |
| P16 | Salade (laitue) | Concombre | Favorable | Les légumes-feuilles sont des précédents favorables du concombre. | S7 | E2 | [NR] |
| P17 | Chou pommé | Concombre | Favorable | Comme P16. | S7 | E2 | [NR] |
| P18 | Salade (laitue) | Courgette | Favorable | Les légumes-feuilles sont des précédents favorables de la courgette. | S12 (S8 non vérifiée) | E2 | [NR] |
| P19 | Chou pommé | Courgette | Favorable | Comme P18. | S12 (S8 non vérifiée) | E2 | [NR] |
| P20 | Haricot vert | Carotte | Défavorable | La fiche carotte de Polynésie classe le haricot dans les précédents « à éviter ». **L'extrait ne donne pas la raison.** | S5 | E2 | [NR] |

**Déjà couvert par le délai de famille (à mentionner seulement)** :
- Solanacée après Solanacée (tomate et piment, flétrissement bactérien, nématodes) : S1, S2, S10.
- Cucurbitacée après Cucurbitacée (courgette, concombre et chouchou ; mouches des légumes et maladies) : S7, S37.
- Brassicacée après Brassicacée (chou et brède petsaï ; hernie, teigne).
- Alliacée après Alliacée.

Les fiches tropicales donnent des délais de retour de 2 à 3 ans (Cucurbitacées), de 3 à 6 ans (poivron) et de 3 à 5 ans (carotte) : S5, S6, S7.

### 1c. Déductions [E] (non retenues pour la ferme d'exemple, à soumettre au maraîcher)

| A | B | Type | Effet | Raisonnement | Appui |
|---|---|---|---|---|---|
| Tomate | Carotte | Précédent | Défavorable [E] | La tomate fait monter les populations de nématodes à galles, et la carotte y est très sensible (racines fourchues). | Statut d'hôte : S17, S18 ; aucune source ne formule ce précédent. |
| Concombre ou courgette | Carotte | Précédent | Défavorable [E] | Comme ci-dessus : le concombre multiplie les nématodes. | S17, S18 |
| Chou ou brède petsaï | Tomate ou piment | Précédent | Favorable [E] | La Martinique conseille des rotations longues « avec des brassicacées comme le radis ». Le radis en précédent a donné des résultats prometteurs contre le flétrissement de la tomate. Mais ce n'est pas le chou, et certaines moutardes hébergent *Ralstonia*. | S1, S35, S14 |
| Brède petsaï | Carotte, concombre ou courgette | Précédent | Favorable [E] | Par analogie avec « légumes-feuilles (chou) ». | S5, S7 |
| Chouchou | Courgette ou concombre | Voisinage | Défavorable [E] | Les trois espèces de mouches des légumes de La Réunion attaquent toutes les Cucurbitacées. Aucune source ne mesure l'effet de la proximité. | S37 [R] |

---

## 2. Affirmations écartées, et pourquoi

| Affirmation courante | Type | Raison de l'écart | Preuve trouvée |
|---|---|---|---|
| Ail (ou oignon) et haricot se gênent | Voisinage, défavorable | Je n'ai trouvé que des conseils de vulgarisation sans essai cité (WVU Extension, Kenosha). Des pages commerciales avancent des chiffres invérifiables. WVU écrit lui-même que le compagnonnage « is not an exact science ». Aucune étude d'allélopathie de l'ail sur le haricot n'a été trouvée. | E3 (S38, S39) |
| Carotte et alliacées contre la mouche de la carotte | Voisinage, favorable | Les essais existent mais avec l'**oignon** ou la ciboule, pas l'ail. L'effet est fort avec l'oignon jeune, nul après la bulbaison, et faible en Finlande. Surtout, je n'ai trouvé aucune preuve que *Psila rosae* soit présente à La Réunion. | E1 hors contexte (S30, S31, S32) |
| Chou et tomate | Voisinage | **Effet contrasté** : moins de teigne, mais concurrence. À Porto Rico, les pommes de chou étaient moins nombreuses et plus petites, et le parasitisme utile était réduit. En Zambie, l'effet n'apparaissait qu'en début de cycle, et le rendement n'a pas changé. | E1 contrasté (S23, S21, S24) |
| Tomate et ail | Voisinage | **Effet contrasté** : moins d'aleurodes et un meilleur rendement au Bangladesh, mais plus d'acariens et de thrips en Égypte. L'effet contre *Fusarium* n'a été mesuré qu'en pots. | E1 contrasté (S42) |
| Tomate et oignon-pays contre le flétrissement bactérien | Voisinage, favorable | L'effet est solide (CIRAD Martinique), mais il porte sur *Allium fistulosum* (ciboule ou oignon-pays), qui n'est pas l'ail péi (*A. sativum*). À ajouter si la ferme cultive la ciboule. | E1 et E2 (S33, S34, S1) |
| Haricot avant chou (« légumineuse avant culture gourmande ») | Précédent, favorable | Les sources se **contredisent**. Le principe est classique (guides québécois et bretons), mais la fiche chou-fleur d'Agrobio Bretagne classe le haricot parmi les précédents à éviter. Un haricot vert récolté en gousses laisse peu d'azote, et ce crédit n'est pas quantifié. | E2 contradictoire (S13) |
| Courgette et haricot (« trois sœurs ») | Voisinage, favorable | Ce sont des guides de jardinage, et l'association repose sur le maïs, absent de la ferme. L'essai égyptien (UET 2,45) porte sur la **fève**, pas sur le haricot. | E3 |
| Concombre et haricot | Voisinage, favorable | Je n'ai pas trouvé de résultat probant : un essai iranien existe, mais l'UET n'est pas lisible dans l'extrait. | Aucune |
| Chou et haricot | Voisinage, favorable | Un rapport SARE (nord-est des États-Unis) donne un UET de 0,86 pour Brassica et haricot, donc aucun avantage. Le nombre de chenilles n'y a pas changé. | E1 défavorable ou neutre (S40) |
| Tomate et concombre | Voisinage | Un essai du GRAB (2019, préliminaire) n'a trouvé « aucun effet » de l'association seule sur le rendement de la tomate. | E1 neutre (S41) |
| Tomate et carotte (« les carottes aiment les tomates ») | Voisinage, favorable | Ce sont des guides de jardinage. Je n'ai trouvé aucun essai. | E3 |
| Salade et concombre, salade et courgette | Voisinage, favorable | Ces paires viennent de tableaux d'associations de jardinage. Je n'ai trouvé aucun essai. | E3 |
| Piment et haricot (défavorable) | Voisinage | Affirmation courante de jardinage. Je ne l'ai pas recherchée en détail et je n'ai trouvé aucune source. | E3 |
| Toute paire avec le chouchou | Voisinage ou précédent | Je n'ai trouvé aucune source. Le chouchou est pluriannuel sur tonnelle, et le précédent ne s'y applique guère. | Aucune |

---

## 3. Sources

> Les extraits suivent la forme rendue par le moteur de recherche, car je n'ai pu ouvrir aucun document. « Citation » signifie que le moteur a renvoyé le texte mot pour mot. « Résumé » signifie un résumé de l'extrait. Il faut vérifier sur le document avant toute citation dans le dépôt.

1. **S1. Chambre d'agriculture de Martinique**, *Bulletin de santé du végétal (BSV) Cultures maraîchères*, avril 2019 (même consigne en mai 2019).
   - URL : https://martinique.chambre-agriculture.fr/fileadmin/user_upload/Outre-Mer/144_Inst-Martinique/Documents/BSV/Archives/2019/2019_04_avril_bsv_cultures_maraicheres.pdf
   - Citation : « Raisonner ses rotations pour éviter la succession de cultures sensibles à la bactérie (ex. cucurbitacées après solanacées à proscrire). Réaliser de longues rotations avec des alliacés types oignons pays ou brassicacées comme le radis. » [NR, Martinique]
2. **S2. FREDON Martinique**, *BSV Cultures maraîchères*, décembre 2023.
   - URL : https://fredon.fr/martinique/sites/default/files/BSV/BSV%20Cultures%20mara%C3%AEch%C3%A8res%20d%C3%A9cembre%202023.pdf
   - Résumé : même consigne (éviter Solanacées après Solanacées, et Cucurbitacées après Solanacées). [NR]
3. **S3. CIRAD (Wicker et al.)**, *A new Ralstonia solanacearum population affects anthurium plantations and cucurbitaceous crops in Martinique (F.W.I.)*, vers 2005-2007 (à vérifier).
   - URL : https://publications.cirad.fr/une_notice.php?dk=530951
   - Citation : « The host range of R. solanacearum has also widened to Heliconia caribea, Cucurbitaceous crops (cantaloupe, cucumber, squash, zucchini) ». [NR]
4. **S4. CIRAD, Anses et Université de La Réunion (Yahiaoui et al.)**, *Genetic Diversity of the Ralstonia solanacearum Species Complex in the Southwest Indian Ocean Islands*, Frontiers in Plant Science, 2017.
   - URL : https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5742265/
   - Résumé : 1 704 isolats de 129 parcelles, surtout sur Solanacées. Le phylotype I domine ; les phylotypes II et III n'ont été trouvés qu'à La Réunion. Aucune donnée sur les Cucurbitacées ou le haricot à La Réunion. Le mécanisme antillais de P1 à P4 (souche des Cucurbitacées) n'est donc **pas établi à La Réunion**. [R]
5. **S5. Direction de l'agriculture de Polynésie française, projet INTEGRE**, *Fiche technique Carotte, culture biologique* (FTC-Carotte-PF), 2018.
   - URL : https://www.service-public.pf/dag/wp-content/uploads/sites/28/2018/03/FTC-Carotte-PF.pdf
   - Citation : « Procéder à des rotations de 3 ans minimum avec un optimum de 5 ans » ; « Favorables : Légumes feuilles (laitue, chou…), maïs, poireau, oignon, pomme de terre. À éviter : Haricot, radis, navet, céleri, fenouil, persil. » [NR, Polynésie, tropical]
6. **S6. Idem**, *Fiche technique Poivron, culture biologique* (FTC-Poivron-PF), 2018.
   - URL : https://www.service-public.pf/dag/wp-content/uploads/sites/28/2018/03/FTC-Poivron-PF.pdf
   - Citation : « Précédents Favorables : Légumes racines (carotte, navet…), légumes bulbes (ail, échalote…) ».
   - Résumé : à éviter, les Solanacées (tomate, aubergine, pomme de terre) et les Cucurbitacées (concombre, courges, pastèque). Retour au moins 3 ans, 6 ans en optimum. L'extraction du PDF était partiellement illisible. [NR]
7. **S7. Idem**, *Fiche technique Concombre* (FTC-Concombre-PF), 2018.
   - URL : https://www.service-public.pf/dag/wp-content/uploads/sites/28/2018/03/FTC-Concombre-PF.pdf
   - Résumé : rotation d'au moins 2 ans. Favorables : légumes-feuilles (chou, laitue), maïs, poireau, oignon. À éviter : autres Cucurbitacées (courges, pastèque, melon) et Solanacées (tomate, poivron, aubergine, pomme de terre). [NR]
8. **S8. Idem**, *Fiche technique Courgette* (FTC-Courgette-PF), 2018.
   - URL : https://www.service-public.pf/dag/wp-content/uploads/sites/28/2018/03/FTC-Courgette-PF.pdf
   - Résumé **non vérifié** (extrait ambigu, possiblement influencé par ma requête) : favorables chou, laitue, maïs, poireau, ail ; à éviter Cucurbitacées et Solanacées. **À relire avant usage.** [NR]
9. **S9. Idem**, *Fiche technique Aubergine* (FTC-Aubergine-PF), 2018.
   - URL : https://www.service-public.pf/dag/wp-content/uploads/sites/28/2018/03/FTC-Aubergine-PF.pdf
   - Résumé : rotation de 3 à 4 ans. Favorables : chou, laitue, légumineuses, maïs, poireau, ail. À éviter : Solanacées et Cucurbitacées. Sert de contexte seulement (l'aubergine n'est pas cultivée à la ferme). [NR]
10. **S10. Chambre d'agriculture de Guyane**, *Protection intégrée de la tomate* (pi-tomate-rogn), vers 2020.
    - URL : https://guyane.chambre-agriculture.fr/fileadmin/user_upload/National/FAL_commun/publications/Guyane/pi-tomate-rogn.pdf
    - Citation : « Nous retiendrons ceux-là : laitue, maïs, ciboule, coriandre, céleri, persil, oseille, amarante et cacahuète ». La fiche déconseille les Solanacées et les Cucurbitacées en précédent, et ajoute : « la tolérance à un bioagresseur ne vaut pas résistance ». [NR, Guyane, tropical]
11. **S11. Agrobio Bretagne (GAB)**, *Fiche tomates*, 2012.
    - URL : https://www.agrobio-bretagne.org/wp-content/uploads/2012/04/fiche_tomates.pdf
    - Citation : « Rotation : à placer en tête ou seconde position tous les 3 à 4 ans. Précédents favorables : Carottes, céréales, liliacées ». [NR, tempéré]
12. **S12. Agrobio Bretagne (GAB)**, *Fiche courgettes*, 2009-2010.
    - URL : https://www.agrobio-bretagne.org/wp-content/uploads/2010/09/Courgettes.pdf
    - Résumé : précédents favorables liliacées, chicorée, chou, laitue, céréales ; à éviter Cucurbitacées, melon, tomate. [NR]
13. **S13. Agrobio Bretagne (GAB)**, *Fiche chou-fleur*.
    - URL : https://www.agrobio-bretagne.org/wp-content/uploads/2010/09/Choufleur.pdf
    - Résumé : précédents à éviter, crucifères, carotte, céleri, **haricot**, melon, navet, tomate, luzerne. [NR]
14. **S14. DRIAAF Île-de-France**, *Fiche Ralstonia solanacearum*, décembre 2016.
    - URL : https://driaaf.ile-de-france.agriculture.gouv.fr/IMG/pdf/fiche_ralstonia_dec2016_cle8332e2.pdf
    - Citation : « Cultivez des plantes non hôtes comme par exemple des carottes et faites des rotations de cultures. »
    - Résumé : la fiche FREDON associée cite les moutardes parmi les adventices hôtes. [NR]
15. **S15. Álvarez B. et al.**, *Comparative behavior of Ralstonia solanacearum biovar 2 in diverse plant species*, Phytopathology 98(1):59-68, 2008.
    - URL : https://www.apsnet.org/publications/phytopathology/2008/January/Pages/98_1_59.aspx
    - Résumé : 20 espèces testées. Carotte, céleri, fenouil et courgette sont non hôtes (pas d'invasion du xylème) **pour le biovar 2**. L'orge et le maïs, bien que non hôtes, peuvent servir de réservoirs. [NR, essai]
16. **S16. Indian Journal of Horticulture** 76(3):472-478, 2019, *Management of root knot nematode opting garlic crop in vegetable based cropping systems* (DOI 10.5958/0974-0112.2019.00075.6). Auteurs non lus.
    - URL : https://journal.iahs.org.in/index.php/ijh/article/view/341
    - Résumé : au Pendjab, l'ail remplace la tomate dans des rotations aubergine-tomate, gombo-tomate et concombre-tomate. « the inoculum load of root knot nematode and carry over population to the next crop in rotation decreased significantly ». Les rendements du gombo, de la tomate et du concombre augmentent après l'ail, et l'effet est plus net après 3 ans. [NR, essai]
17. **S17. Bafokuzara N. D.**, *Influence of Six Vegetable Cultivars on Reproduction of Meloidogyne javanica*, Journal of Nematology (année non vérifiée).
    - URL : https://journals.flvc.org/jon/article/view/65514
    - Résumé : au champ, la tomate, le concombre et la carotte font augmenter les *Meloidogyne* ; l'amarante, le poivron et le chou les limitent. Sous serre, la tomate, le concombre et la carotte sont très sensibles, le chou et l'amarante sont de mauvais hôtes. Parmi les séquences qui ont contenu les nématodes : tomate-poivron, chou-poivron, carotte-chou. [NR, essai]
18. **S18. INRAN (Niger)**, *Fiche 3 : nématodes*.
    - URL : https://reca-niger.org/IMG/pdf/Fiche3_nematodes_INRAN.pdf
    - Résumé : cultures les plus sensibles aux nématodes à galles : tomate, poivron, pomme de terre, aubergine, courges, concombre, laitue, carotte. [NR, tropical]
19. **S19. GRAB**, fiches et essais sur les nématodes à galles (Provence).
    - URL : https://grab.fr/805 et https://grab.fr/246
    - Résumé : cultures moins sensibles, l'oignon, le poireau, la mâche, la roquette et le fenouil. « l'introduction de plantes non hôtes telles que le fenouil ou l'oignon, a eu un effet supérieur aux traitements étudiés ». Comportements très différents entre la roquette et le pak choï. [NR]
20. **S20. Sharma et al.**, *Potentiality of intercropping in managing Diamondback moth (Plutella xylostella)*, Indian Journal of Agricultural Sciences 92(8), août 2022 (DOI 10.56093/ijas.v92i8.123186).
    - URL : https://epubs.icar.org.in/index.php/IJAgS/article/view/123186
    - Résumé : 2 saisons. Les associations chou et souci, chou et oignon, chou et ail réduisent significativement le nombre de larves par plante par rapport au chou seul. [NR, essai]
21. **S21. Luchen S. W. S.**, *Effects of intercropping Cabbage with Alliums and Tomato, on the incidence of the Diamondback moth, Plutella xylostella (L.)*, Université de Zambie (essai 1995/96, dépôt 2012).
    - URL : https://dspace.unza.zm/items/5404b3e7-ae5b-4362-b6a9-2e80c0a0f5f1
    - Citation : « Cabbage monocrop had a significantly higher incidence of DBM immatures in the early growth stage (3rd and 4th weeks after transplanting), than garlic, leek and tomato ».
    - Résumé : pas de différence de rendement en chou. [NR, essai]
22. **S22. Iranian Plant Protection Research Journal (Guilan)**, essai colza et ail contre la teigne.
    - URL : https://iprj.guilan.ac.ir/article_9268.html
    - Résumé : UET de 1,19 à 1,42 ; toutes les associations réduisent les larves et nymphes de teigne. Il s'agit du colza, pas du chou. [NR, essai]
23. **S23. González-Rodríguez A. et Macchiavelli R.**, *Dynamics of diamondback moth… in cabbage under intercropping, biological control and Bt-based sprays*, J. Agric. Univ. Puerto Rico 87(1-2):31-49, 2003.
    - URL : https://revistas.upr.edu/index.php/jaupr/article/view/1127
    - Citation de l'extrait : « tomato as a companion crop showed a tendency for reducing P. xylostella densities in cabbage, reduced the levels of C. plutellae parasitism and competed with cabbage, causing fewer and smaller heads ». [NR, Caraïbe, essai]
24. **S24. Thu Zar Aung et al.**, essai à Taunggyi, Myanmar, 2015-2016.
    - URL : https://meral.edu.mm/record/27/files/journal_(Thu_Zar_Aung)_(Open%20Access).pdf
    - Citation : « intercropping cabbage with tomato and chilli could reduce the DBM larva population significantly in both seasons ». [NR, essai]
25. **S25. UNESP Jaboticabal (Rezende B. L. A. et al., auteurs à confirmer)**, *Viabilidade da consorciação de pimentão com repolho, rúcula, alface e rabanete*, Horticultura Brasileira (essai 2003-2004 ; année de parution non vérifiée).
    - URL : https://acervodigital.unesp.br/handle/11449/1299
    - Citation : « Exceto o consórcio pimentão+repolho que obteve índice de uso eficiente da terra (UET) de 1,92; todos os outros consórcios apresentaram UET superior a 2,0, com maior UET (2,64) obtido no consórcio pimentão+alface. » [NR, essai]
26. **S26. Rezende B. L. A., Canato G. H. D. et Cecílio Filho A. B.**, *Influência das épocas de cultivo e do estabelecimento do consórcio na produção de tomate e alface consorciados*, Ciência e Agrotecnologia 29(1):77-83, 2005 (DOI 10.1590/S1413-70542005000100009).
    - URL : https://repositorio.unesp.br/handle/11449/30137
    - Citation : « A produtividade comercial do tomateiro, bem como a classificação de frutos de tomate não foram influenciadas pela presença da alface » ; « Os consórcios estabelecidos com o transplantio da alface até 14 dias após o transplantio do tomateiro obtiveram os melhores resultados segundo o índice de Uso Eficiente da Terra. » [NR, essai]
27. **S27. Salgado A. S. et al. (avec Embrapa Agrobiologia)**, consórcios alface-cenoura e alface-rabanete sob manejo orgânico, Pesquisa Agropecuária Brasileira 41:1141-1147, 2006.
    - URL : https://doaj.org/article/93dc6a3f0acd4e60adb644900538df27
    - Résumé : à Seropédica (RJ), les associations de la carotte avec la laitue lisse ou frisée atteignent un UET supérieur à 1,60. [NR, tropical, essai]
28. **S28. Xiao X. et al.**, *A green garlic (Allium sativum L.) based intercropping system reduces the strain of continuous monocropping in cucumber (Cucumis sativus L.) by adjusting the micro-ecological environment of soil*, PeerJ 7:e7267, 2019. Voir aussi Xiao et al., *Intercropping with garlic alleviated continuous cropping obstacle of cucumber in plastic tunnel*, Acta Agric. Scand. B, 2012 (DOI 10.1080/09064710.2012.697571).
    - URL : https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6637937/
    - Résumé : biomasse du concombre accrue ; plus de bactéries et d'actinomycètes, moins de champignons ; enzymes et N, P, K disponibles en hausse. [NR, essai en pots et sous tunnel]
29. **S29. Acta Horticulturae Sinica** 35(3):357, 2008.
    - URL : https://www.ahs.ac.cn/CN/Y2008/V35/I3/357
    - Résumé : sur un sol de 8 ans de monoculture de concombre, l'ail et les légumes-feuilles réduisent la salinité et freinent *Fusarium*. La rotation ail, concombre, concombre augmente le revenu de 11,6 %. [NR, essai]
30. **S30. Uvah I. I. I. et Coaker T. H.**, *Effect of mixed cropping on some insect pests of carrots and onions*, Entomologia Experimentalis et Applicata 36(2):159-167, 1984.
    - URL : https://agris.fao.org/search/en/records/65deb2ea0f3e94b9e5d08c14
    - Résumé : moins d'attaques de mouche de la carotte avec l'oignon jeune ; « virtually ineffective once the onions began to bulb ». [NR, essai]
31. **S31. Varis A.-L.**, *Effect of intercropping carrots and onions on damage caused by the carrot fly*, Agricultural Science in Finland, 1991.
    - URL : https://journal.fi/afs/article/view/72420
    - Citation : « slightly less in carrot rows adjacent to onion rows ». [NR, essai]
32. **S32. Wierzbicka B. et Majkowska-Gadomska J.**, Acta Sci. Pol. Hortorum Cultus 11(2):29-39, 2012.
    - URL : https://czasopisma.up.lublin.pl/asphc/article/view/3032
    - Résumé : la carotte associée à l'aneth ou à la ciboule (*Allium fistulosum*) réduit les dégâts de mouche ; l'ail n'a été testé que comme extrait. [NR, essai]
33. **S33. Deberdt P. et al. (CIRAD)**, *Effect of Allium fistulosum extract on Ralstonia solanacearum populations and tomato bacterial wilt*, Plant Disease 96(5):687-692, 2012.
    - URL : https://www.apsnet.org/publications/plantdisease/2012/May/Pages/96_5_687.aspx
    - Résumé : en chambre de culture, l'extrait à 100 % ramène la maladie à 6 % des plants, contre 61 % dans le témoin. [NR, Martinique, essai]
34. **S34. INRAE (Ephytia) et CIRAD**, *Tropileg : association tomate-oignon-pays*.
    - URL : https://ephytia.inra.fr/en/C/23211/Tropileg-Examples
    - Résumé : l'oignon-pays reste en place pendant l'association ; ses parties aériennes peuvent être coupées ou laissées en paillage pour optimiser la biodésinfection du sol. [NR]
35. **S35. Deberdt P. et al. (CIRAD)**, Journal of Phytopathology, 2015, sur *Crotalaria spectabilis* et *Raphanus sativus* comme précédents contre le flétrissement de la tomate. **URL exacte non vérifiée** ; notice probable sur agritrop.cirad.fr.
    - Résumé : les précédents radis et crotalaire sont prometteurs « without reducing bacterial populations ». Les espèces testées portaient la bactérie de façon latente. [NR, essai]
36. **S36. INRAE et CIRAD (Ephytia)**, *Tropileg : Teigne Plutella xylostella*.
    - URL : https://ephytia.inrae.fr/en/C/23616/Tropileg-Teigne-Plutella-xylostella
    - Résumé : la teigne ne s'attaque qu'aux Brassicacées ; La Réunion figure parmi les zones touchées ; résistance à de nombreuses molécules. [R]
37. **S37. CIRAD (Cahiers Agricultures)**, article sur les mouches des légumes à La Réunion.
    - URL : https://revues.cirad.fr/index.php/cahiers-agricultures/article/download/30995/30755/31230
    - Citation : « Ces 3 espèces de "mouches des légumes" sont des ravageurs frugivores primaires de toutes les espèces de cette famille botanique et sont considérées comme le principal problème entomologique des cucurbitacées sur l'île. »
    - Résumé : le chouchou, sous tonnelle, subit des dégâts limités en laboratoire. [R]
38. **S38. West Virginia University Extension**, *Companion planting*.
    - URL : https://extension.wvu.edu/lawn-gardening-pests/gardening/garden-management/companion-planting
    - Résumé : l'oignon et l'ail sont donnés comme mauvais voisins du haricot, sans étude citée. « companion planting is not an exact science ». [NR, E3]
39. **S39. University of Wisconsin Extension, Kenosha County**, *Companion plants*.
    - URL : https://kenosha.extension.wisc.edu/files/2020/05/Companion-plants-article.pdf
    - Résumé : même affirmation, sans essai. [NR, E3]
40. **S40. SARE**, rapport LNE99-123 sur le compagnonnage.
    - URL : https://projects.sare.org/media/pdf/8/2/8/828LNE99-123_0004.pdf
    - Résumé : UET de 0,86 pour Brassica et haricot ; les chenilles du chou ne changent pas. [NR, essai]
41. **S41. GRAB**, bulletin de mars 2019, essai association tomate-concombre sous abri à Avignon (page exacte non identifiée : grab.fr/1799 ou grab.fr/1800).
    - Résumé : l'association seule n'a eu aucun effet sur le rendement de la tomate (environ 11 kg par plante). Résultats préliminaires. [NR]
42. **S42. Essais tomate et ail.**
    - Azouz, Égypte, 2016 : https://eajbsa.journals.ekb.eg/article_12768.html (acariens et thrips en hausse, *Tuta absoluta* en baisse).
    - Sher-e-Bangla Agricultural University, Bangladesh : https://archive.saulibrary.edu.bd/handle/123456789/1268 (aleurodes en baisse, rendement de 17 t/ha).
    - Al-Dulaimi et Hussein, Irak : https://jcoagri.uobaghdad.edu.iq/index.php/intro/article/view/2480 (*Fusarium* en baisse, en pots).
    - [NR, essais]
43. **S43. Deslandes T. (ARMEFLHOR), Deguine J.-P. et Jacquot M. (CIRAD)**, Innovations Agronomiques 76:71-85, 2019.
    - URL : https://pprod.ecophytopic.fr/sites/default/files/2021-04/Vol76-12-Deslandes%20et%20al.pdf
    - Résumé : réseau RESCAM de systèmes en rotation avec tomate de plein champ à La Réunion. Bandes fleuries et maïs en plante piège. **Aucune règle de voisinage ou de précédent entre légumes dans l'extrait.** [R]
44. **S44. INRAE et CIRAD**, article de 2012 sur la lutte contre les bioagresseurs telluriques aux Antilles.
    - URL : https://hal.inrae.fr/hal-02647971/document
    - Résumé de l'extrait : les Alliacées (oignon, ciboule, ail) « ne sont pas hôtes » de *R. solanacearum* et répriment l'expression de la maladie. Document non lu ; à vérifier. [NR]
45. **S45. Étude de laboratoire à Fuzhou (Chine)**, chou chinois associé à l'ail ou à la laitue contre la teigne. Probablement Chinese Agricultural Science Bulletin 27(10), 2011 ; **attribution non vérifiée**.
    - URL : https://www.casb.org.cn/EN/Y2011/V27/I10/208
    - Résumé : stade larvaire significativement plus long dans les associations. [NR, laboratoire]
46. **S46. Sher-e-Bangla Agricultural University**, thèse sur l'association chou et ail (Bangladesh).
    - URL : https://archive.saulibrary.edu.bd/handle/123456789/1252
    - Citation : « cabbage + garlic intercropping showed the best performance in reducing insect pests and increasing natural enemies, relative yield, cabbage equivalent yield and gross return ». [NR, essai]

Sources consultées sans paire exploitable :
- ARMEFLHOR, projet ST0P à Bassin Martin (Saint-Pierre) : pleinchamp.com, reussir.fr, ecophytopic.fr.
- DAAF Réunion, recueil DEPHY EXPE cultures tropicales et présentation RESCAM 2017.
- DAAF Réunion, *Agreste* n° 100, 2016 (rotations décrites statistiquement, sans conseil).

---

## 4. Proposition pour la ferme d'exemple (à décider par le maraîcher ou le pilote)

Relations les mieux appuyées et pertinentes à Petite-Île, sous réserve de relecture des documents :

- **Voisinage** :
  - V1 : chou pommé et ail péi, favorable (E1).
  - V4 : tomate et salade, favorable si la salade est plantée au plus 14 jours après la tomate (E1).
  - V5 : carotte et salade, favorable (E1, Brésil tropical).
  - V2 : piment et salade, favorable (E1).
- **Précédents** :
  - P1 et P2 : tomate avant concombre ou courgette, défavorable (E2 Antilles et Polynésie, hôtes communs E1).
  - P5 : concombre ou courgette avant tomate, défavorable (E2 Guyane).
  - P7 et P8 : ail péi avant tomate ou concombre, favorable (E1, nématodes à galles).
  - P11 : carotte avant tomate, favorable (E1 et E2, flétrissement ; réserve sur le biovar).
  - P14 et P15 : salade ou chou avant carotte, favorable (E2 Polynésie, E1 pour le chou).
  - P20 : haricot vert avant carotte, défavorable (E2, mécanisme non précisé).

Toutes ces relations sont [NR]. Aucune n'est [R] : la recherche n'a trouvé aucune source réunionnaise qui formule une paire.
