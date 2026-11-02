# SPEC — « The edit nobody sees » (vidéo YouTube de présentation, 2/11/2026)

Histoire A de `STORYLINES.md`, choisie par le propriétaire le 2/11 à 0 h 14 (« la A »). Voix Achird validée le 2/11 (0,013 $).

GOAL:    à la fin, l'artiste pense « c'est vrai que j'en aurais grave besoin » : il a vu le travail caché d'un snippet monté à la main, puis Stalak le faire en 3 gestes, et il sait ce que fait chaque geste.
OUTPUT:  HyperFrames 0.8.223, 1920 × 1080, 30 images/s (YouTube). Le Short : projet à part, 1080 × 1920 (voir `short/`).
TIME:    environ 62 s (le texte de la voix décide) × 30 = ~1860 images. Musique : l'instru de « neva die », 157 BPM (P = 0,38217 s = 11,465 images, mesure = 1,5287 s = 45,86 images). Le drop de l'instru tombe sur « This is Stalak. ».

LOOK:
- Deux mondes, jamais un fond noir vide :
  - **L'ancien monde : le tapis de découpe.** Un vrai tapis de découpe vert (#2f6a55, quadrillage 1 cm = 40 px en #4f8a73 à 60 %, graduations en #d9efe5, chiffres Rubik 600 18 px) vu en 3D (rotateX 52 à 62°), éclairé par une lampe de bureau (une tache chaude #fff3d6 à 18 % en haut à gauche, pas de halo ni de lueur). Dessus : la bande du son (papier blanc cassé #f4f1e8, forme d'onde encre #26303d, traits des temps), les 3 pellicules des prises (cadre noir #14181f, perforations, images tirées de ses vraies prises), un cutter et une règle en métal (#c9d1da, reflet #eef3f7). Étiquettes en ruban de masquage (#efe3c2, Rubik 700 22 px, majuscules écrites à la main dans le texte).
  - **Le monde Stalak : le ciel.** Bleu Stalak #1f6fd6, neige qui tombe (flocons blancs 2 à 6 px, 90 flocons, chute 60 à 140 px/s), cartes blanches #ffffff au contour d'encre #0a0d14 de 6 px, ombre d'encre décalée de 12 px, stalactites sous les cartes. Titres Lilita One, texte Rubik 500 à 800.
- Couleurs des prises (celles de l'app) : prise 1 #d6336c, prise 2 #3a6fe0, prise 3 #e0952c. Rouge d'erreur (seulement dans l'ancien monde) : #ff4d5e. Accent : le bleu Stalak, une fois par plan.
- Texte à l'écran : le moins possible, jamais la phrase de la voix mot pour mot ; au moins 34 px ; les mots de l'app sont ceux de l'app (anglais).
- Grain : `brand/grain.png` à 3,5 %. Ombres : décalage 0 18 px, flou 40 px, 22 % d'opacité (ancien monde) ; ombre d'encre pleine (monde Stalak).

OBJECTS:
- La bande du son : du papier avec la vraie forme d'onde de « neva die » (tirée du fichier) et un trait par temps ; elle passe d'un monde à l'autre (c'est elle qu'on dépose dans « Import your music »).
- Les 3 pellicules : des images de ses 3 vraies prises (une image par seconde), cadre noir perforé, ruban de couleur de la prise au début.
- Le cutter : manche jaune #f2c230, lame argent ; la règle : métal gradué.
- La bouche décalée : gros plan d'une vraie image de sa prise ; le mot « bounce » de sa chanson glisse à côté de la bouche, un trait rouge marque l'écart.
- Les jours : des fiches de papier « TUE », « WED », « THU »… qui tombent sur le tapis, chacune avec une nouvelle pile de morceaux.
- L'interface de Stalak : refaite avec ses vrais mots (Pick your song, Import your music, Add your takes, Import my videos, Film now, Take 1/2/3, Your edit, Cuts Auto / On the words / Every bar, Pace Chill / Normal / Punchy, Lyrics on screen, Paste my lyrics, Export, Make the pack, 5 / 10 / 30 videos, Pack ready: 30 videos, all different.). Ses vraies prises jouent dans l'aperçu.
- La fin : l'icône et le mot « Stalak » officiels (`brand/icon.svg`, `brand/wordmark.svg`), jamais redessinés.

MOTION:
- Entrée : power3.out (0,45 s) ; déplacement : power2.inOut (0,6 s) ; sortie : power2.in (0,3 s) ; caméra : sine.inOut pour les travellings (1,2 à 3 s), expo.inOut pour les plongées (0,7 s).
- Pas de rebond ni d'élastique sur l'interface. Les objets de l'ancien monde peuvent tomber avec un petit rebond physique (back.out 1,4) : ce sont des objets, pas de l'interface.
- Un geste principal par plan ; les mouvements secondaires 60 % de l'ampleur, 0,12 s après.
- Coupes et changements sur les temps de l'instru (cut sur la mesure dans la partie Stalak).

SHOTS (les temps exacts viennent de la voix, voir `build.py`) :
1. 0 → l1 « You wrote the song. You filmed the takes. » — Vue plongeante sur le tapis : la bande du son et les 3 pellicules posées ; la caméra avance en travelling le long des bandes (sine.inOut 2,4 s). Les étiquettes « SONG », « TAKE 1 / 2 / 3 ».
2. l2 « …nobody sees: the edit. » — Le cutter entre par la droite, coupe une pellicule ; les morceaux s'éparpillent (une pile de 40 morceaux), la caméra recule et tourne de 12°.
3. l3 « Every take has to line up with the track. » — Plongée basse : une pellicule glisse le long de la bande du son, avance, recule, recule encore (3 essais), les repères ne tombent pas en face.
4. l4 « Every cut has to land on the beat. » — Les traits des temps s'allument un par un sur la bande ; la lame coupe… un poil à côté : un trait rouge « off beat ».
5. l5 « One frame off… » — Plongée (expo.inOut) dans une image de la pellicule jusqu'au gros plan de la bouche ; le mot « bounce » se décale de la bouche, le trait rouge s'ouvre.
6. l6 « And tomorrow?… » — La caméra remonte, les fiches TUE, WED, THU tombent sur le tapis, chacune avec sa pile ; le tapis disparaît sous les morceaux.
7. l7 « This is Stalak. » — Sur le drop : tous les morceaux sont aspirés dans un point ; le tapis s'ouvre et la caméra passe au travers vers le ciel bleu ; l'icône Stalak tombe, ses stalactites poussent.
8. l8 « Drop in your song. » — La carte « Pick your song » ; la bande du son (le même objet) tombe dans « Import your music » ; la ligne « neva die · 157.0 BPM » apparaît avec la forme d'onde.
9. l9 « Add a few takes… » — La carte « Add your takes » : les 3 pellicules tombent et deviennent « Take 1 / 2 / 3 » ; « Import my videos » puis « Film now » s'allument.
10. l10 « Stalak lines every take up… » — Les 3 formes d'onde des prises se calent sur celle du son (glissent et s'alignent), puis la barre de coupe se découpe sur les temps et l'aperçu passe d'une prise à l'autre sur le temps.
11. l11 « Your lip sync stays locked. » — Gros plan sur l'aperçu : la bouche et le mot ensemble, un cadenas se ferme.
12. l12 « Paste your lyrics… » — La carte « Lyrics on screen » : les lignes se collent, le bouton du tap clignote sur les temps, les temps se remplissent, la ligne apparaît dans l'aperçu.
13. l13 « Chill or punchy?… » — Le réglage Pace passe de Chill à Punchy, la barre de coupe se redécoupe (plus de plans).
14. l14 « Export… With Pro… » — Le bouton « Export » ; le téléphone 9:16 part sur la gauche (TikTok · Reels · Shorts), un écran 16:9 « Music video » + PRO arrive à droite.
15. l15 « And with Creator Plus… » — « Make the pack » ; 30 vidéos s'éventaillent, puis se rangent dans une semaine MON → SUN.
16. Le résultat (sans voix, 4 mesures de sa chanson) : ses vraies prises montées sur le temps, plein cadre 16:9 (Music video), « I gotta bounce » à l'écran.
17. l16 « You film. Stalak edits. » — Deux mots qui claquent sur le temps : une caméra, puis l'icône.
18. l17 « Free, in your browser… » — Écran de fin : l'icône portée par la neige, le mot « Stalak » qui se dévoile, « stalak.app », « Free · No download · No sign-up » ; tenu 2,5 s.

BANNED: fond noir ou bleu nuit vide, lueurs, particules décoratives (la neige est la neige de la marque), dégradés violets, cartes de verre, papier crème comme fond, trois cartes en ligne, logo dans un coin, texte qui bouge pendant qu'on le lit, tout qui monte en fondu, interface penchée en 3D (l'interface reste de face, seule la caméra bouge autour), barres de progression, bouton ou capacité inventés, chiffre inventé, concurrent cité.

QA (images à vérifier) : 0 s (vignette : le tapis et les bandes, lisible), milieu de chaque plan, l'aspiration et le passage dans le ciel, l'alignement des prises, le gros plan de la bouche verrouillée, le pack, le résultat (ses prises), le logo final ; aucune image noire, rien hors du cadre de sécurité (90 %), texte ≥ 34 px.

## Changements pendant la fabrication (2/11, nuit)

- **La voix** : les silences de la lecture (1 à 2,8 s après chaque phrase) sont ramenés à 0,04–0,2 s dans une phrase, ~0,27 s entre les phrases du problème et ~0,41 s entre celles de Stalak (demande du propriétaire : « raccourcir les blancs », « que ça reste dynamique »). Parole totale : 47,1 s ; film : 61,15 s (40 mesures).
- **Plan 5** : la caméra plonge dans une image de la pellicule, qui se met à jouer (sa prise 3, visage proche) ; à côté, une feuille « VOICE / LIPS » : la piste des lèvres glisse d'une image (« 1 frame off »), puis le mot « bounce » se décolle de la bouche (« out of sync »).
- **Plans 3 et 4** : faits sur des endroits propres de la bande (début et fin), pour que les morceaux du plan 2 ne cachent pas les repères.
- **Plan 6** : quatre fiches (TUE, WED, THU, FRI), chacune avec sa pile.
- **Plan 15** : le badge « Creator Plus », la bande du son au milieu, les 30 vidéos en sortent, « Pack ready: 30 videos, all different. » dans la carte, puis la semaine MON → SUN.
- **Plan 16 (le résultat)** : au lieu d'un 16:9 plein cadre (le recadrage coupait sa tête dans certaines prises), trois vidéos du pack (MON, TUE, WED) en 9:16, sur sa chanson : chacune coupée à son rythme, et à chaque temps les trois montrent trois prises différentes. « I gotta bounce » s'affiche en même temps sur les trois.
- **Taille du texte** : le plancher est 28 px (contrôle HyperFrames) ; le texte de lecture fait 34 px ou plus à l'écran, sauf les chiffres de la règle et du tapis (décor).

## v3 — les remarques du propriétaire (2/11, 2 h 28)

Ses mots : des sous-titres en motion design (« satisfaisant, qui bouge et qui s'implante bien dans le décor », une autre typo sur les mots importants) ; l'étiquette « OFF BEAT » partait trop vite (0:10) ; à 0:17 les stalactites sous le logo étaient mal placées et une petite image passait sur le logo ; à partir de 0:19, plus aucune secousse ni rebond ; au format clip (0:39), son vrai clip, pas la vidéo du format 9:16.

- **Sous-titres** (`caps.py`, dessinés par `renderCaps` dans `assets/engine.js`) : la voix, quelques mots à la fois, chaque mot qui arrive quand il est dit (0,04 s avant). Ils prennent la matière du décor :
  - sur le tapis (le problème) : des bouts de **ruban de masquage** (Rubik 800, majuscules) posés un peu de travers, qui se plaquent (échelle 1,14 → 1, inclinaison qui se pose) ; les mots importants sur du **ruban rouge**, en Lilita One ;
  - dans le ciel de Stalak : des mots **blancs cernés d'encre** (Rubik 800) qui montent de 22 px ; les mots importants dans une **pastille blanche, en Lilita One bleu** (comme les boutons de l'app).
  - Les groupes de mots s'arrêtent sur les pauses de la voix (jamais au milieu d'un « up with… » rapide) ; un groupe part en 0,07 s juste avant le suivant (jamais deux groupes à la fois) ; le dernier d'une phrase part en 0,15 s, avant la phrase suivante et avant le résultat.
  - Place : en bas (haut du texte à 878 px) en 16:9 ; pendant le gros plan, sous les pistes VOICE / LIPS ; dans le Short, en haut (196 px), plus gros (60 à 74 px), et l'étiquette « 1 frame off » passe en bas de l'image.
  - Pas sur « You film. Stalak edits. » ni sur l'écran de fin : ils montrent déjà leurs mots.
  - Les cadrages de la partie Stalak ont été reculés ou décalés pour laisser la bande du bas libre (Pick your song, Add your takes, Your edit, l'aperçu, Pace, le pack).
- **OFF BEAT** : le drop passe une mesure plus loin (mesure 12, 18,34 s ; Short : temps 34, 12,99 s), et 1,05 s de pause après « …land on the beat. ». L'étiquette claque sur la bande (échelle 1,3 → 1) au moment de la coupe et reste jusqu'à l'arrivée du gros plan : environ 1,4 s, dont 0,8 s immobile.
- **Le logo au drop** : l'icône et ses stalactites forment un seul bloc ; stalactites blanches cernées d'encre, sous le bord plat du bas de l'icône (±70 px), qui poussent. La « petite image » était le tas de morceaux aspirés, grossi par la plongée de la caméra : il disparaît à la fin de l'aspiration.
- **À partir du drop, plus de rebond ni de secousse** : chaque entrée se pose en power3.out sans dépasser ; plus de pulsation sur les temps (tableau, résultat), plus d'inclinaison de la caméra dans les travellings, plus de flottement de l'écran de fin ; le bouton TAP change de couleur sans bouger ; les boutons pressés descendent et remontent en douceur (5 px). Le problème (avant le drop) garde sa vie à la main et ses petits rebonds d'objets.
- **Format clip** : l'écran 16:9 « Landscape: YouTube, music video » montre **son clip** (`assets/clip/mv.mp4`, à partir de 4,6 s), plus une prise du 9:16.
- En route : la carte du pack (1480 px) a « Creator Plus » à l'intérieur et « Make the pack » ne chevauche plus « 30 videos » ; le tableau s'efface pendant que les trois vidéos du résultat grandissent.
- Durées : film 62,68 s (41 mesures), Short 31,34 s.

## v4 — les 3 vidéos du résultat, synchro (2/11, 3 h 52 → 11 h 27)

Sa remarque : à 0:49, les 3 vidéos (MON, TUE, WED) ne sont pas synchro avec la musique, « alors que c'est concrètement ce pour quoi on existe ».

- **La cause** : ses prises portent leur propre son, une version de « neva die » dont la voix est différente de `song.mp3` (même beat et même basse, d'où un calage qui tombait juste sur la basse et faux sur la voix). Ses lèvres suivent ce son-là. En plus, le passage choisi le montrait surtout de dos ou la main devant la bouche. Un test avec trois calages sur `song.mp3` (−0,3 s, actuel, +0,15 s) : « aucune ne colle » ; le test avec le son des prises : « oui c'est synchro ».
- **Le résultat joue le son des prises** (`assets/audio/takes_song.wav`), au même endroit de la grille du beat, 8 mesures plus loin que avant (mesures 12 à 16 du morceau, temps de prise 18,26 → 24,37 s) : là, son visage se voit dans les prises 2 et 3. La prise 1 (15 s) s'arrête avant. Image et son viennent des mêmes fichiers : synchro par construction. Le passage de l'instru au son des prises et le retour restent sur la même phase du beat (boucle de 8 mesures).
- **Les 3 vidéos** : prises 2 et 3, choisies temps par temps (visages regardés deux fois par temps) : à chaque instant, si l'une des deux montre sa bouche, au moins un panneau la montre ; les trois panneaux diffèrent sur 14 temps sur 16 ; chacun a son propre rythme de coupe.
- **Les paroles à l'écran** : sa phrase « j'ai mis de l'or sur mes plaies, cicatrices valent des millions », en anglais américain courant à sa demande : « I put gold / on my wounds, » puis « scars worth / millions. », mot par mot sur sa voix (repères : « j'ai » 21,26 s, le m de « mis » 21,50, « sur » 22,17, la virgule 22,50, « cicatrices » 22,56). Dans `caps.py` (`LYRIC`, `payoff_lyric`).
- **Le Short** : même chose sur ses 2 mesures (temps de prise 20,55 → 23,61 s), prises 2 et 3 ; « millions. » part avec le panneau.
- Volume : le son des prises est 0,6 à 0,7 LU plus bas que `song.mp3` à ces endroits ; compensé (0,51 et 0,52 au lieu de 0,48).
- Rien d'autre ne change (sa demande).
