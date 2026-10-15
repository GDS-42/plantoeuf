# SPEC — Tranche R4 « Rotation et associations »

Liens : `docs/BRIEF.md` (« Plus tard : rotation » ; no-go « rotation automatique »), `docs/specs/N1/SPEC.md` (culture, famille botanique), `docs/specs/N1/SPEC.md` (EX-06, sur-occupation), `docs/specs/P2/SPEC.md` (EX-35, calendrier), `docs/specs/R2/SPEC.md` et `DONNEES.md` (ferme d'exemple sourcée), `docs/specs/R3/SPEC.md` (plusieurs années)
Statut : **rédigée par l'agent** le 15/10/2026, plan approuvé par l'humain le 15/10/2026. Lecture seule pour l'agent une fois la tranche commencée.

## Objectif

Aider le maraîcher à faire tourner ses cultures sur ses espaces, au fil des années que R3 a ouvertes. L'outil connaît la famille botanique de chaque culture et son groupe de rotation ; le maraîcher y ajoute ses règles : le délai de retour de chaque famille, les cultures qui s'entraident ou se gênent quand elles poussent ensemble, les bons et les mauvais précédents, et l'ordre de ses groupes. L'outil s'en sert pour signaler un retour trop tôt, dire ce qui précède et ce qui voisine une plantation, et proposer quoi planter sur un espace libre. Il ne plante, ne déplace et ne refuse jamais rien de lui-même.

## Choix de l'humain (15/10/2026)

- **Classement** (« syntaxons ») : les deux — la famille botanique sert au délai de retour (maladies du sol) ; le groupe de rotation (feuille, fruit, racine, bulbe, légumineuse, engrais vert) sert à l'ordre des cultures.
- **Aides** : les quatre — voisins sur un espace (compagnonnage), précédent cultural, alerte de rotation sur le calendrier, culture suivante proposée.
- **Règles agronomiques** : saisies par le maraîcher ; la ferme d'exemple en porte, sourcées dans le dossier de données. Aucune table de référence intégrée.

## Dérogation au BRIEF (décision de l'humain, 15/10/2026)

- La règle d'admission dans le noyau (« un objet n'y entre que s'il change une case du tableau de projection ») est levée pour les objets d'aide `familles`, `associations` et `rotations`, qui ne changent aucune case du tableau.
- Le no-go « rotation automatique » reste : le système ne crée, ne déplace, ne modifie ni ne refuse jamais une plantation de lui-même ; ses suggestions sont des aides.

## Hors périmètre de la tranche

Position des plantations à l'intérieur d'un espace (un espace reste un tout) ; voisinage entre espaces différents ; engrais verts comme culture vendue ; effet d'un précédent sur le rendement ou les coûts ; table de référence agronomique intégrée ; rotation automatique.

## Modèle de données : ce que R4 ajoute

| Objet (liste enregistrée) | Champs |
| --- | --- |
| Culture (`cultures`, existant) | `groupe` facultatif : « feuille », « fruit », « racine », « bulbe », « legumineuse » ou « engrais_vert ». Le champ `famille` reste un texte libre |
| Famille (`familles`) | `nom` (texte) ; `delaiRetour` (en années, fourchette, facultatif) ; `note` (texte, facultatif) |
| Association (`associations`) | `type` (« voisinage » ou « precedent ») ; `cultureA`, `cultureB` (identifiants de cultures) ; `effet` (« favorable » ou « defavorable ») ; `note` (texte, facultatif). Un précédent va de A (avant) vers B (après) ; un voisinage vaut dans les deux sens |
| Rotation (`rotations`) | `nom` (texte) ; `groupes` (liste ordonnée de 2 à 6 groupes, sans doublon) |

Chaque enregistrement porte, comme en N1, un UUID, ses dates de création et de modification et une suppression logique. Format exporté en version 6 ; un fichier de version 1 à 5 s'importe par migration (listes vides). Seul le vocabulaire des groupes et des effets figure dans le code et `src/i18n.js` ; aucune valeur agronomique.

## Règles de calcul

- **Famille d'une culture** : l'enregistrement `familles` actif dont le nom est celui de la culture, sans tenir compte des majuscules, des accents composés différemment ni des espaces en trop. Une culture sans famille, ou dont la famille n'a pas de délai de retour, n'est soumise à aucun délai.
- **Période d'une plantation** : de sa mise en place à sa fin de récolte (règle de N1).
- **Retour trop tôt (règle à la surface)** : sur un espace, une plantation B d'une famille F de délai D (médiane, en années) revient trop tôt quand sa surface, ajoutée à celle des plantations A de la même famille sur cet espace, mises en place avant elle (même jour : par ordre d'identifiant) et dont la fin de récolte plus D × 365 jours dépasse la date de B, excède la surface de l'espace. Sur une planche, c'est la règle habituelle ; sur une grande parcelle, seul le retour qu'on ne peut pas loger ailleurs dans la parcelle est signalé.
- **Précédents d'une plantation** : les plantations du même espace dont la récolte s'est achevée dans les 365 jours avant sa mise en place, chacune avec l'effet de l'association « précédent » de sa culture vers celle de la plantation (favorable, défavorable ou aucun), et le verdict de retour trop tôt de la plantation. Ils se calculent aussi pour une plantation en cours de saisie, pas encore enregistrée.
- **Voisins d'une plantation** : les plantations du même espace dont la période chevauche la sienne, chacune avec l'effet de l'association « voisinage » entre leurs deux cultures (dans un sens ou dans l'autre).
- **Surface libre d'un espace à une date** : sa surface moins celle des plantations en place ce jour-là (zéro au moins).
- **Que planter ici ?** Pour un espace, une date et une surface (la surface libre par défaut), les cultures actives qui ont au moins une variété, chacune avec ses raisons, classées dans cet ordre : d'abord celles qui ne reviennent pas trop tôt ; puis celles sans précédent ni voisin défavorable ; puis le plus de raisons favorables (précédents et voisins favorables) ; puis celles dont le groupe suit, dans une rotation, le groupe de la dernière culture de l'espace (ordre circulaire) ; puis l'ordre alphabétique. Aucun poids chiffré.

## Exigences

| ID | Exigence | Vérification |
| --- | --- | --- |
| EX-61 | QUAND l'utilisateur crée, modifie ou supprime une famille, une association ou une rotation, ou donne un groupe à une culture, LE SYSTÈME DOIT l'enregistrer dans le navigateur et le retrouver après réouverture, export et import compris (version 6, migration des versions 1 à 5) | Test unitaire et de bout en bout, test aller-retour |
| EX-62 | QUAND une famille revient sur un espace avant son délai de retour (règle à la surface), LE SYSTÈME DOIT le signaler sur la ligne de la plantation, sur celle de l'espace et sur la barre de la plantation dans le calendrier, sans rien refuser | Test unitaire et de bout en bout, scénario S18 |
| EX-63 | QUAND l'utilisateur saisit ou modifie une plantation, LE SYSTÈME DOIT montrer dans le tiroir ses précédents avec leur effet et le verdict de retour, et ses voisins avec leur effet | Test unitaire et de bout en bout, scénario S19 |
| EX-64 | QUAND une plantation a un précédent ou un voisin défavorable, LE SYSTÈME DOIT le signaler sur sa ligne | Test unitaire et de bout en bout, scénario S19 |
| EX-65 | QUAND l'utilisateur demande « Que planter ici ? » pour un espace et une date, LE SYSTÈME DOIT proposer les cultures classées avec leurs raisons, et préremplir le tiroir de plantation de celle qu'il choisit, sans rien enregistrer de lui-même | Test unitaire et de bout en bout, scénario S20 |
| EX-66 | QUAND la ferme d'exemple est chargée, LE SYSTÈME DOIT y inclure des familles avec leur délai de retour, le groupe de chaque culture, un ordre de rotation et des associations, tous sourcés dans le dossier de données de R2 ; l'effacement de l'exemple DOIT les retirer, et seulement eux | Test unitaire et de bout en bout, scénario S21 |

## Scénarios clés

```gherkin
Fonctionnalité: Rotation et associations

  Contexte:
    Soit la famille « Solanacées » avec un délai de retour de 2 / 3 / 4 ans
    Et la culture tomate (famille « Solanacées », groupe « fruit »), 70 jours avant récolte, 11 semaines de récolte

  Scénario: S18 — retour trop tôt sur une planche, pas sur une parcelle qui a la place
    Soit une planche de 30 m² avec une tomate de 30 m² mise en place le 1er mars 2026
    Quand j'y mets une tomate de 30 m² le 1er mars 2027
    Alors la plantation de 2027 est signalée « retour trop tôt », sur sa ligne, celle de la planche et sa barre du calendrier
    Et elle est enregistrée
    Soit une parcelle de 600 m² avec des tomates de 120 m² mises en place les 10 janvier, 10 juin, 1er novembre et 1er décembre 2026
    Quand j'y mets une tomate de 120 m² le 1er mars 2027
    Alors aucune n'est signalée (5 × 120 = 600 m², la surface de la parcelle)
    Quand j'y mets une autre tomate de 120 m² le 1er avril 2027
    Alors celle-ci est signalée (720 m² > 600 m²)

  Scénario: S19 — précédent et voisin
    Soit les cultures haricot vert (famille « Fabacées », groupe « légumineuse »), chou pommé (« Brassicacées », « feuille ») et ail (« Amaryllidacées », « bulbe »)
    Et l'association « précédent » haricot vert → chou pommé « favorable », et l'association « voisinage » ail / haricot vert « défavorable »
    Et sur une planche, un haricot vert récolté jusqu'au 30 mai 2026
    Quand je saisis un chou pommé sur cette planche le 15 juin 2026
    Alors le tiroir montre « Avant : haricot vert, bon précédent »
    Soit sur une autre planche un ail en place d'avril à août 2026
    Quand j'y mets un haricot vert le 1er juin 2026
    Alors la plantation de haricot vert est signalée « voisin défavorable : ail », et celle de l'ail « voisin défavorable : haricot vert »

  Scénario: S20 — que planter ici ?
    Soit la rotation « fruit → feuille → racine → légumineuse »
    Et les cultures tomate, laitue (« Astéracées », « feuille »), carotte (« Apiacées », « racine ») et haricot vert (« Fabacées », « légumineuse »), chacune avec une variété
    Et sur une planche de 30 m², une tomate récoltée jusqu'au 30 juin 2026
    Quand je demande « Que planter ici ? » pour cette planche le 1er juillet 2026
    Alors la laitue vient en premier (son groupe suit celui de la tomate dans la rotation)
    Et la tomate vient en dernier (retour trop tôt)
    Et chaque culture proposée dit ses raisons
    Quand je choisis « Planter » la laitue
    Alors le tiroir de plantation s'ouvre avec la planche, la date du 1er juillet 2026 et 30 m², sans rien enregistrer

  Scénario: S21 — la ferme d'exemple fait tourner ses cultures
    Soit la ferme d'exemple chargée
    Alors chaque culture a son groupe, chaque famille son délai de retour sourcé, la ferme a une rotation et des associations sourcées
    Et les alertes de retour trop tôt portent sur les espaces où une famille revient, dans son délai, sur plus que leur surface ; le dossier de données dit lesquels et pourquoi
```

## Exigences non fonctionnelles

- Celles des tranches précédentes (dont EX-37 : tailles et contrastes des textes, thèmes clair et sombre, aucun défilement de page de 360 à 1920 px). Aucune ressource réseau, aucune dépendance.
- Le calcul des aides d'une ferme de la taille de l'exemple (une centaine de plantations) reste sous 100 ms.

## Invariants nommés

- Ceux des tranches précédentes.
- `alerte_seulement` : aucune règle de rotation n'empêche d'enregistrer une plantation.
- `suggestion_sans_plantation` : demander « Que planter ici ? » ne crée, ne modifie et ne supprime aucun enregistrement.
- `sans_regle_comme_r3` : une ferme sans famille, sans association, sans rotation ni groupe donne exactement les résultats et l'affichage d'avant R4, sans aucune alerte de rotation.
- `famille_par_nom` : une culture est rattachée à une famille par le seul nom, sans identifiant ; renommer la famille d'une culture la rattache à la nouvelle.

## Fichiers et interfaces

- `src/store.js` : trois listes de plus ; format exporté en version 6, migration 5 → 6.
- `src/calc.js` : `familleDe`, `retoursTropTot`, `precedents`, `voisins`, `surfaceLibre`, `suggestions`.
- `src/ui-rotation.js` (nouveau) : « Que planter ici ? » ; `src/ui-saisie.js` (listes et tiroirs des familles, associations et rotations ; groupe de la culture ; aperçu du tiroir de plantation ; alertes des lignes), `src/ui-calendrier.js` (marque des retours trop tôt), `src/ui-navigation.js`, `src/ui-commun.js`, `src/index.html`, `src/i18n.js`.
- `src/exemple.js` : familles, groupes, rotation et associations de la ferme d'exemple ; `docs/specs/R2/DONNEES.md` (§ 14, rotation) et `docs/specs/R2/recherche/` (rapports de recherche).
- Tests nouveaux : `test/rotation.test.js`, `test/rotation.e2e.js`, `test/exemple-r4.test.js`, `test/exemple-r4.e2e.js`.

## Points tranchés le 15/10/2026

- **Plan approuvé par l'humain** : il vaut accord pour la modification du modèle de données (champ `groupe`, objets `familles`, `associations` et `rotations`, version 6) et pour la dérogation au BRIEF ci-dessus. Aucun test existant n'est à modifier ; si l'un devait l'être, l'agent s'arrête et le soumet à l'humain.
- Le champ `famille` d'une culture reste un texte libre (les tests existants le saisissent ainsi) ; la page Cultures propose les familles connues à la saisie.
- Les familles, associations et rotations se saisissent sur la page Cultures.
- Le délai de retour se compte en années de 365 jours, à partir de la fin de récolte ; la médiane de la fourchette sert à la règle, la fourchette est affichée.
- La ferme d'exemple n'ajoute une association que si une source la soutient ; elle peut n'en avoir que de précédent, ou aucune de voisinage.

## [À CLARIFIER]

(vide)
