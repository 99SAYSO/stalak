# « One take » (promo v5) : REVIEW

## Ce que c'est
L'idée A choisie par le propriétaire le 1/11 : une seule forme 3D qui ne coupe jamais et devient chaque étape de la vraie app, aux couleurs de Stalak, avec une voix off (voir `SPEC.md`, `STORYLINES.md`, `REFERENCE.md`).
- 1080 × 1920, 30 i/s, 25,22 s (757 images) depuis la version 3, anglais américain.
- Fait avec HyperFrames 0.8.223. Tout le visuel est un seul moteur, `assets/engine.js` : chaque image est calculée à partir du temps (ressorts fermés, aucune animation qui dépend de l'image précédente). `build.py` place la musique, la voix, les sons et les vidéos sur la grille des temps de « neva die » (157 BPM).

## La synchro (le défaut de la v4)
- La voix off a été générée en une lecture puis coupée en 14 phrases : 14 silences d'au moins 1,2 s, et pour chaque morceau une durée et un nombre de syllabes cohérents avec sa phrase. Chaque phrase commence à un temps choisi ; l'image est réglée sur ces mêmes temps. Il n'y a plus rien à deviner.
- Les mots comptent aussi : « by hand? » apparaît quand la voix dit « by » (mesuré dans le fichier de la voix), « 40 » arrive sur « Forty », « 3 min » sur « Three », le slogan suit « Free, right in your browser ».
- Musique : son et instru calés à l'échantillon (instru = son + 23,13007 s, corrélation 0,99 sur les basses, 0,92 sur tout le spectre).
- Lèvres : temps de la prise = temps du son − 1,452 s (le calage de la v1, validé). Le snippet du début et celui du drop jouent la vraie voix du propriétaire au bon endroit. Depuis la v3, ils montrent la Version 2 (celle qu'il obtient après Shuffle et qu'il exporte), avec les prises où son visage se voit.

## Version 3 : les retours du propriétaire (1/11, 12 h 25)
| Retour | Ce qui a changé |
|---|---|
| Le hook doit être plus engageant | Nouveau passage du morceau : il tend les mains vers la caméra, visage visible (mesure 3), puis une coupe sur le temps vers la prise 2. Le snippet arrive incliné et zoomé dès la première image, un coup de zoom à chaque temps, la caméra balance. |
| « Still editing snippets by hand? » : les mots un par un, en gros, en mouvement, certains à la verticale, collés les uns aux autres | Les 5 mots arrivent chacun sur son mot dans la voix et se verrouillent autour du snippet figé : STILL en haut, EDITING à la verticale à gauche, SNIPPETS dessous, BY à la verticale à droite, HAND? en rose, en dessous. La caméra tape sur chaque mot et tremble sur « hand? », puis les mots s'envolent. La voix dit « snippets » (pas « your snippet ») : les mots suivent la voix. |
| Sur « Stalak », Stalak doit apparaître (logo ou police) | Le logo officiel en 3D claque en haut de l'écran sur le mot « Stalak », puis « finds the beat. » s'écrit dessous. Dans « 3 min with Stalak », le mot est aussi le logo. |
| Trop de blanc après « Paste your lyrics » et après « Pick a look » | La voix s'enchaîne : 0,1 à 0,35 s entre deux phrases (avant : 0,57 s et 0,99 s). Les étapes de l'image suivent. |
| Le snippet avec le filtre (0:19-0:23) doit durer 2 s maximum | Il dure une mesure : 1,53 s (avant : 4,6 s), sur « I gotta bounce » avec la parole à l'écran. |
| Toute la vidéo plus dynamique | 25,2 s au lieu de 29,8 s. Les mots de la voix apparaissent un par un pendant toute la démo, avec le mot clé en rose (ils remplacent les titres d'étape, ce qui garde le film lisible sans le son). Coups de caméra (décalage et rotation) à chaque transformation, ressorts plus vifs, plus de temps morts (le chargement passe en un éclair). |

## Version 2 : ce qui a changé après la relecture indépendante du brouillon 1
1. **Ouverture** : le snippet en plein écran, sans inclinaison, avec une poussée lente (avant : une petite carte penchée sur un fond vide). Au clic (b4), il se fige et rétrécit en cadre avec un grand coup 3D.
2. **« Still editing snippets by hand? » a une image** : le titre apparaît sur les mots de la voix et le curseur traîne la tête de lecture à la main ; le cadre montre les 24 vraies images du snippet, dans l'ordre où il les parcourt.
3. **Le fichier** arrive en 0,6 s sur un arc, sous le texte de la zone d'import, puis « Drop » sur le mot.
4. **Le son** : « 157.0 BPM » en gros, qui compte jusqu'au tempo et s'arrête sur le temps ; 4 points s'allument, un par temps (b12 à b15).
5. **La carte des prises** a la taille de son contenu et grandit à chaque prise qui arrive.
6. **La synchro se voit** : chaque prise a sa forme d'onde (le vrai son du morceau), décalée de son retard ; sur b22 tout s'aligne d'un coup (ondes, vidéos, coches) ; la rangée alignée reste 0,9 s ; « All the takes are synced. » en encre sur blanc, 48 px. Plus de carte assombrie qui faisait « vitre » : un plateau glace opaque.
7. **Paroles** : clic sur « Paste my lyrics », les deux vraies lignes collées d'un coup (plus de frappe lettre à lettre).
8. **Montage** : aperçu bien plus grand (370 × 658), barre fine ; chaque plan tombe sur une double croche avec un éclair. **Shuffle** : sauts en arc plus hauts, les blocs changent de prise en l'air, et l'aperçu passe aux nouvelles prises (Version 2).
9. **Filtre** : le même aperçu reste ; la rangée de filtres remplace la barre ; au clic, Frost balaie l'aperçu de gauche à droite (vrai traitement Frost). Libellés plus grands, sur deux lignes.
10. **Export** : bouton encre, remplissage glace, le texte passe en encre sous le remplissage ; le curseur clique à droite de la flèche.
11. **Après le drop** : la vidéo reste pendant la moitié du pli en pilule ; « 40 min » monte vite et arrive sur « Forty ».
12. **Fin** : plus de fondu. La pilule fait un tour complet sur elle-même et devient l'icône de l'app, le logo officiel se dévoile dessous avec un coup ; slogan en 52 px ; « stalak.app » tapé en 0,28 s puis tenu 2,1 s.
13. **3D** : la face s'assombrit quand elle tourne loin de la lumière, une bande de brillance la balaie pendant les bascules, côtés bleu encre avec une lèvre claire, stalactites irrégulières avec de longues gouttes. Coups 3D à la taille de chaque changement ; coups de caméra seulement sur les temps forts ; la caméra se cale net sur la synchro.
14. **Son** : musique à 0,18 sous la voix et 0,5 entre les phrases (avant : 0,34 / 0,62), sons recalés sur les nouvelles actions.

## Contrôles
- `lint` : 0 erreur, 0 avertissement. `check` : réussi. Restent des avertissements de lecture sur des textes d'interface secondaires (voir plus bas).
- Rendu final : voir la section « Rendu final ».
- Test court avant le rendu : le balayage Frost dans l'aperçu rend correctement (l'outil d'aperçu rapide montrait un décalage qui n'existe pas dans le vrai rendu).

## Choix créatifs assumés
- Le snippet du début garde le vrai montage de Stalak. Sa main passe devant son visage pendant une partie : c'est sa chorégraphie. La première image montre son visage.
- Les sous-titres d'interface (« MP3, WAV, M4A… », « Film several lip-syncs… ») restent moins de 2 s : c'est la voix qui porte le message, ces textes sont là pour montrer la vraie app.
- Les 3 prises côte à côte à la synchro sont le sujet (pas une rangée de cartes « avantages »).
- Pas fait : la traînée derrière les prises qui volent (remarque mineure).

## Rendu de la version 2 (1/11 matin)
- Fichier : 1080 × 1920, 30 i/s, 895 images, 29,83 s, H.264 + AAC, 41,9 Mo, qualité « delivery » (25 min de rendu). Envoyé au propriétaire, pas dans le dépôt.
- **Regardé** : une image par temps (78), une bande de 12 images autour de chacun des 17 changements d'état, la planche à la largeur d'un téléphone (360 px). Aucune image noire, aucun titre qui en chevauche un autre, l'interface est droite quand on la lit.
- **Mesuré, pas écouté** (je ne peux pas entendre le son) : −14,4 LUFS au total, crête −1,3 dB. Passages avec la voix −16,0 LUFS, snippets (début et drop) −11,5 et −11,7 LUFS : le drop est 4,5 LU plus fort que les passages parlés, c'est voulu. Fin −15,5 LUFS. Aux 3 raccords de musique, aucun trou dans le volume mesuré par tranches de 10 ms.
- Le flou de mouvement d'HyperFrames n'est pas utilisé : le rendu en parallèle le coupe, et sur un seul processus il aurait demandé plusieurs heures sur cette machine. Le flou pendant chaque transformation est fait par le moteur.

## Les points les plus faibles de la version 2
- Au clic (1,55 s), l'image figée montre sa main devant son visage ; son visage revient dès que la tête de lecture recule (0,4 s plus tard).
- La phase « pas encore synchro » des 3 prises est courte (0,6 s) : on voit le décalage des ondes, moins celui des gestes.
- Au repli après le drop (23,1 s), la pilule reste vide une fraction de seconde avant « 40 min ».
