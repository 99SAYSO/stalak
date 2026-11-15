> **Remplacée** par la décision du propriétaire du 15/11 à 22 h 26 : la série devient « T-Crazy » (héros Liam, univers choisi dans Studio Stalak, onglet Univers). La nouvelle bible tiendra en une page et sera écrite quand l'univers sera choisi. Fabrication de l'univers : `docs/marketing/SERIE_UNIVERS.md`.

# « Studio Chambre » : la bible de la série (version française)

> Marketing & croissance, 15/11/2026. Série animée pour @stalak_app (TikTok, Instagram Reels, YouTube Shorts).
> Décisions du propriétaire : 15/11 à 18 h 07 (la série), 21 h 23 (Studio Stalak, règles 11 et 12), 21 h 51 (format et étape « visuels »).
> Les scripts, les images et les vidéos passent tous par Studio Stalak : https://claude.ai/artifact/UEFPPVbewDG4ATF9nLwJbx

## L'idée

Yanis, alias Lil Givre, rappe dans sa chambre et enregistre sur son ordinateur (sur BandLab). Il galère avec tout ce qui entoure la musique : la prise gâchée, le feat, et surtout les vidéos de promo. Chaque épisode raconte une situation que tout rappeur reconnaît. Stalak n'arrive qu'à la fin, au moment de faire la vidéo.

## Le format (décision du 15/11, 21 h 51)

- **Durée** : entre 1 min 05 et 1 min 20, en vertical 9:16.
- **0:00, le cri** : un personnage crie une phrase choc liée à l'épisode. En haut de l'écran, un **bandeau** porte le titre de l'épisode en majuscules.
- **Vers 0:02, le narrateur** : le bandeau s'envole quand il commence. Il présente vite les personnages (une étiquette avec le nom) et le contexte.
- **Ensuite**, le narrateur et les personnages alternent. Le cri du début revient souvent au milieu, avec le même enregistrement : on comprend enfin la scène.
- **À l'écran**, tout ce qui est dit est écrit, avec le nom de celui qui parle.
- **Le dernier tiers** : Stalak, montré avec les vraies captures de l'appli. Puis la carte de fin : « stalak.app », « Gratuit, dans ton navigateur » et le titre du prochain épisode.
- **Filigrane** : la tête de la mascotte avec stalak.app, en petit en haut à gauche, sauf pendant le bandeau et la carte de fin.
- **Look du bandeau et des sous-titres** : trois propositions dans Studio Stalak (carte givrée, glaçon, ruban bleu). Le propriétaire choisit.

## Les personnages

| Qui | Rôle | Voix (Gemini sur Flora, générée une seule fois après validation) |
|---|---|---|
| **Yanis, alias Lil Givre** | Rappeur, il enregistre dans sa chambre, rêve grand et galère. Bonnet glacé, sweat bleu nuit, casque au cou, pendentif en glaçon. | Puck |
| **Le narrateur** | On l'entend, on ne le voit pas. Posé, pince-sans-rire, jamais de pause ajoutée. | Charon |
| **Maman** | Entre toujours au pire moment ; en secret, c'est sa première fan. Chignon, lunettes rondes, gilet corail. | Kore |
| **Big Banquise** | La star du rap glacé. Il répond par notes vocales. Lunettes noires, fourrure blanche, chaîne en glace. | Algenib |
| **La mascotte de Stalak** | Petit rôle, seulement avec ses autocollants officiels (`site_src/emoji`). | Algieba |

À dessiner quand un épisode en aura besoin (images validées avant toute vidéo) : **Moussa**, le pote qui filme tout de travers ; **M. Durand**, le voisin qui tape au mur ; **Inès**, la cousine qui fait plus de vues avec une danse.

## Les décors réutilisables

- La chambre de Yanis, le jour et la nuit : la fenêtre givrée, la mousse au mur, la porte « Studio, ne pas déranger ».
- Son bureau et son ordinateur : une appli d'enregistrement et un écran de montage **dessinés par nous**, jamais l'écran de BandLab.
- La porte et le couloir.
- Le téléphone : l'écran verrouillé, la discussion avec les notes vocales, la vidéo « écran noir avec les paroles ».
- Le vrai Stalak : les captures de l'appli (`site_src/aide`).
- La carte de fin.

Tout est dessiné en code (`tools/serie/`) : ça ne coûte rien, et ce qui est validé en image fixe est exactement ce qui bouge ensuite. `python3 tools/serie/maquette.py` refait toutes les images fixes.

## Les règles (goûts du propriétaire, onglet « Mes goûts »)

- Stalak seulement à la fin, jamais de pub dès la première seconde.
- Une vidéo montée qu'on montre est toujours synchronisée avec la musique.
- Aucun chiffre inventé sur Stalak. Les chiffres de l'histoire (heures, abonnés, prix d'un couplet) sont de la fiction sur les personnages.
- Aucun concurrent nommé. BandLab : le nom seulement, ni logo ni écran copié (en attente de l'avis de Juridique ; sinon « sur son ordi »).
- La mascotte reste en second rôle.
- Le texte reste dans la zone visible : rien d'important dans le haut (8 %), dans le bas (20 %), ni à droite entre 35 et 80 % de la hauteur.
- Chaque vidéo passe par la planche contact et par la relecture des goûts avant d'être montrée.

## Comment un épisode avance (Studio Stalak)

Script à valider → personnages et décors en images fixes à valider → feu vert de la semaine → production (voix générée une seule fois, rendu, planche contact) → vidéo à valider → programmée par Réseaux sociaux.

## Rythme et coût

**Coût par épisode : moins de 0,10 $.**
- La voix coûte 0,05 à 0,08 $ par épisode. Une génération Gemini coûte 0,013 $, quelle que soit sa longueur. On fait donc une seule génération par personnage et par façon de parler (4 à 6 par épisode), qu'on découpe ensuite. Refaire une réplique coûte 0,013 $.
- Les images, la musique (le beat est fait par nous) et le rendu coûtent 0 $.
- À 14 épisodes par semaine, la voix revient à environ 1 $. Le solde Flora actuel, environ 3 $, tient donc environ 3 semaines.

**Rythme tenable : 2 épisodes par jour, soit 14 par semaine.** La première semaine, on reste à 1 par jour, le temps de constituer la bibliothèque de poses et de décors. Pas 3 par jour, pour trois raisons :
- chaque épisode, c'est une vingtaine de plans animés ;
- il faut rendre environ 2 250 images et relire 6 planches contact ;
- le propriétaire fait 3 validations par épisode (script, images, vidéo), soit 63 par semaine à 3 épisodes par jour.

## 30 idées d'épisodes

Ce sont des propositions : chacune passe par Studio Stalak. Dans chaque épisode, Stalak n'arrive qu'à la fin, au moment de la vidéo.

| N° | Bandeau | Le cri d'ouverture | L'histoire |
|---|---|---|---|
| 1 | LE SON DE L'ANNÉE | Yanis : « Pourquoi ma bouche est décalée ?! » | Douze heures pour une vidéo de promo. Il finit par poster un écran noir, puis la mascotte frappe à la fenêtre. (pilote) |
| 2 | MA MÈRE ENTRE PENDANT LA PRISE | Maman : « T'as sorti le poulet du congélo ?! » | Elle gâche la meilleure prise… et son cri tombe pile sur le temps. Le clip « feat. Maman ». (pilote) |
| 3 | LE FEAT GRATUIT | Yanis : « Big Banquise m'a répondu ! » | Il demande un feat gratuit à une star. Ça finit en échange : le couplet contre ses vidéos. (pilote) |
| 4 | LE SNIPPET POSTÉ TROP TÔT | Yanis : « Ils veulent le son en entier ?! » | Il poste un extrait à 3 h du matin, tout le monde réclame la sortie, et le son n'est pas fini. |
| 5 | LE CONTRAT | Yanis : « On m'a proposé un contrat ! » | Un « label » dans ses messages veut tous ses droits. Le narrateur lit les petites lignes. |
| 6 | LE VOISIN | M. Durand : « C'est pas un concert, ici ! » | Le voisin tape au mur à chaque prise… en rythme. |
| 7 | LE PREMIER CONCERT | Yanis : « Ma mère a fait une pancarte ?! » | Douze personnes dans un bar, dont huit de sa famille. Chacun a filmé : ce sont les prises du clip. |
| 8 | LE BEAT VENDU À TOUT LE MONDE | Yanis : « Il a vendu mon beat à tout le monde ?! » | Son beat « exclusif » est partout. Il se démarque avec la vidéo. |
| 9 | LA BATTERIE À 1 % | Yanis : « Non, non, non, pas maintenant ! » | L'ordi s'éteint en pleine session. |
| 10 | L'EX DANS LES COMMENTAIRES | Yanis : « Elle a commenté ! » | « C'est sur moi, ce son ? » Tout le quartier mène l'enquête. |
| 11 | LE CLIP À ZÉRO EURO | Yanis : « Maman, je t'emprunte un drap ! » | Un drap en fond, une lampe de bureau en projecteur, trois prises. |
| 12 | LA COUSINE QUI DANSE | Yanis : « Elle fait plus de vues avec une danse ?! » | Sa cousine cartonne avec quinze secondes de danse sur son son. Ils font la vidéo ensemble. |
| 13 | L'HEURE PARFAITE POUR POSTER | Yanis : « Pourquoi 18 h 47 ?! » | Il suit à la lettre les conseils d'un « gourou » des réseaux. |
| 14 | L'INTRO DE QUATRE MINUTES | Yanis : « Elle commence quand, la voix ?! » | Son beatmaker fait des intros interminables. |
| 15 | LE CASQUE CASSÉ | Yanis : « On entend le métronome ?! » | Il enregistre avec les écouteurs du téléphone, et tout repisse dans le micro. |
| 16 | LE FREESTYLE DANS LE BUS | Une mamie : « Six sur dix, jeune homme. » | Il freestyle dans le bus et une passagère le note. |
| 17 | LE NOM DE SCÈNE | Yanis : « Lil Givre, c'est déjà pris ?! » | L'épisode des origines : comment il a trouvé son nom. |
| 18 | LE PREMIER HATER | Yanis : « Quelqu'un a écrit "nul" ! » | Il est fier : un hater, ça veut dire qu'on le regarde. |
| 19 | L'INTERVIEW DEVANT LE MIROIR | Yanis : « Merci, merci, c'est un honneur… » | Il répète une interview imaginaire. Sa mère entre. |
| 20 | L'HEURE DE STUDIO | Yanis : « Il reste dix minutes ?! » | Il paie une heure dans un vrai studio et passe cinquante minutes à régler son casque. |
| 21 | LES NOTES EFFACÉES | Yanis : « Maman, t'as supprimé mes textes ?! » | Elle a « fait de la place » sur son téléphone. |
| 22 | LE PLAN-SÉQUENCE | Yanis : « Prise trente-sept ! » | Il veut un clip en une seule prise, sans couper. |
| 23 | LA DATE DE SORTIE | Maman : « Ça fait cinq vendredis, Yanis ! » | Il repousse sa sortie chaque semaine. |
| 24 | LE LIVE À TROIS PERSONNES | Yanis : « Maman, sors du live ! » | Son premier live : trois spectateurs, dont sa mère, qui pose des questions. |
| 25 | LE PROF DE FRANÇAIS | Yanis : « Mon prof de français a liké ?! » | Son ancien prof corrige ses rimes en commentaire. |
| 26 | LE RÉVEIL À 5 HEURES | Yanis : « Il est quelle heure ?! » | Il veut se lever à 5 h « comme les rappeurs qui réussissent ». |
| 27 | LA SOIRÉE ÉCOUTE | Yanis : « Vous écoutez, là ?! » | Il fait écouter son projet à ses potes : ils sont tous sur leur téléphone. |
| 28 | LE POTE CAMÉRAMAN | Yanis : « T'as filmé à l'horizontale ?! » | Moussa filme tout de travers. |
| 29 | LE CLIP DE BIG BANQUISE | Big Banquise : « Frérot, j'ai un problème. » | Big Banquise revient : sa vidéo de promo est décalée. |
| 30 | LE FEAT SORT | Yanis : « Il est sorti ! » | Le feat avec Big Banquise sort, et Maman veut sa part. Fin de la saison. |
