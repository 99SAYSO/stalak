# « Would you rather » : SPEC (promo v6, idée du propriétaire du 1/11)

L'idée du propriétaire (1/11, 14 h 30) : la vidéo commence comme un jeu « Tu préfères » de TikTok, pour que les gens croient que c'en est un. Deux questions normales, avec la voix, un chrono de 3 s et le pourcentage de réponses. La troisième : « une heure de montage ou 3 minutes avec Stalak ? » et là BOOM, la vidéo explose en neige, sans chrono, et la pub Stalak se lance avec la DA du site. La voix : « bah oui, la réponse c'est forcément Stalak. L'époque où tu prends 1 h pour monter un snippet c'est fini. Maintenant, tu mets ton son… », puis la promo.
Ses précisions (14 h 50) : anglais ; son image rouge / bleu en fond ; « à toi d'écrire le texte, mettre les images, les %… » ; les pourcentages, cherchés sur internet.

```text
GOAL:    un rappeur qui scrolle joue au jeu (2 questions), se fait piéger par la 3e, et comprend en 45 s que Stalak
         monte son snippet sur le temps, lèvres synchro ; il va sur stalak.app.
OUTPUT:  HyperFrames 0.8.223, 1080 x 1920, 30 i/s.
TIME:    117,75 temps à 157 BPM x 0,382166 s = 45,00 s = 1350 images.
         Le jeu : b0 -> b48 (18,34 s). Le BOOM : b48. La démo de la v5 : décalée de 60 temps (V(x) = temps x + 60),
         sans le passage « 40 min by hand / 3 with Stalak » (8,25 temps).
GAME:    Q1 b0 : « Stop time » (64 %) / « Move things with your mind » (36 %), 29 204 votes (would-you-rather-game.com).
         Q2 b16,5 : « A world without music » (24 %) / « A world without TV » (76 %), 228 186 votes (Jeu Tu Préfères,
         la version française d'origine du même jeu ; la page anglaise n'a que 69 votes).
         Q3 b34,5 : « Spend an hour editing your snippet » / « 3 minutes with Stalak » : pas de votes.
         Les deux options sont à l'écran dès le début de la question ; la voix les lit ; le cercle OR pulse sur « or ».
         Chrono de 3 s = 8 temps (3,06 s), à gauche sur la ligne : 3, 2, 1 et un arc rouge qui se vide, tic-tac sur
         chaque temps ; il part sur le premier temps après « or ». Résultat : la moitié perdante s'assombrit, la
         gagnante clignote, les deux pourcentages sautent (le gagnant en vert, comme dans l'exemple du propriétaire),
         le nombre de votes s'affiche où était le chrono ; 2,5 temps plus tard, la question suivante.
         Q3 : le chrono part comme les autres ; pendant le « 2 », sur le drop du beat (b48) : BOOM.
LOOK:    jeu : le fond du propriétaire redessiné net (son fichier fait 415 x 739) aux mêmes couleurs : rouge #ff3728,
         bleu #129aff, ligne noire de 24 px au milieu, cercle noir de 160 px « OR » (Open Sans 800, 92 px, blanc).
         Textes : Nunito Black, blanc, contour noir épais, ombre portée (le style des jeux TikTok). Images : Fluent
         Emoji 3D de Microsoft (licence MIT) ; « sans » = un anneau rouge barré dessiné par-dessus l'objet ;
         la réponse « Stalak » = la vraie icône de l'app.
         Après le BOOM : le monde de Stalak de la v5 (fond bleu roi, neige, la forme 3D, Lilita One, stalactites).
BOOM:    le cercle OR est la forme unique de la v5, plate et noire pendant le jeu. Au BOOM : flash blanc, l'écran du
         jeu se fend en 137 éclats à partir du cercle, ils volent vers la caméra en tournant, givrent et deviennent de
         la neige (560 flocons) ; le cercle devient un disque de glace en 3D (épaisseur, stalactites, flocon 3D).
         Sur « Stalak » il se retourne et devient l'icône (la vraie icône aussi au dos pendant le tour).
         « an hour » : un sablier 3D apparaît ; « are over. » : il éclate en neige. « Now, » : l'icône devient la zone
         d'import, et la démo de la v5 reprend (« drop » = le fichier tombe).
MUSIC:   l'instru de « neva die » en continu sous le jeu (son intro, sans batterie ; la basse arrive avec la question 2),
         coupée un demi-temps avant le BOOM ; le BOOM tombe sur le vrai drop du beat (mesure 2 de l'instru, d'après
         l'énergie mesurée mesure par mesure). Ensuite comme la v5 : l'instru sous la voix, son snippet sur le drop
         (son mesure 6, « I gotta bounce »), l'instru jusqu'à la fin. Chaque raccord garde la place dans la boucle de
         8 mesures des accords.
VOICE:   Gemini 3.1 Flash TTS dans Flora, voix Achird (la même que la v5), une lecture de 6 phrases (0,013 $,
         run_m176pp4ft9svwwc5nfv8e0xrmx8hcahz) + 10 phrases de la v5 (L3 à L10, L13, L14).
         Les questions : la voix s'était arrêtée avant chaque « or » ; recollées avec 0,2 s de suspense, jouées 1,12 x
         plus vite (rythme des jeux TikTok, hauteur gardée). Les réponses : pauses internes raccourcies.
         Texte : « Would you rather stop time… or move things with your mind? » / « Would you rather live in a world
         without music… or without TV? » / « Would you rather spend an hour editing your snippet… or three minutes
         with Stalak? » / « Well, yeah. The answer is obviously Stalak. » / « The days of spending an hour editing a
         snippet are over. » / « Now, you just drop your song. » puis la v5 : « Stalak finds the beat. » …
         « Free, right in your browser. » « Stalak dot app. »
         Les mots des réponses s'affichent un par un à l'heure mesurée (alignement pocketsphinx, vérifié à la main
         sur la courbe de volume). 0,12 à 0,16 s entre deux phrases après le BOOM (pas de blanc).
SOUND:   pop à l'arrivée des options, clic doux sur « or », tic / tac sur chaque temps du chrono, ping + pop au résultat,
         whoosh entre deux questions ; BOOM : impact grave, verre qui casse (fait ici), whoosh qui monte jusqu'au BOOM,
         étincelles ; l'icône : impact ; le sablier : pop puis petit verre cassé ; puis les sons de la v5.
SHOTS:   g1 b0-16,5 Q1 · g2 b16,5-34,5 Q2 · g3 b34,5-48 Q3 · BOOM b48 · a1 « Well, yeah. The answer is obviously
         Stalak. » · a2 « … an hour … are over. » · a3 « Now, you just drop your song. » · puis la v5 (voir
         ../one-shape/SPEC.md, temps + 60) : zone, fichier, son 157 BPM, prises, synchro, paroles, montage 21 plans,
         Shuffle, Frost, export, snippet (1,53 s), l'icône (repli puis tour), le logo, « Free · in your browser · no
         sign-up », stalak.app.
BANNED:  faux pourcentages ; images de personnes réelles ; concurrent cité ; interface inventée ; écran vide avant
         la première question (elle est déjà là à la première image) ; blanc dans la voix après le BOOM.
QA:      les images du jeu (chaque question, chrono, résultat), le BOOM image par image, une image par temps ensuite,
         la planche à la largeur d'un téléphone, le niveau (le jeu, le BOOM, la démo), aucune image noire.
```
