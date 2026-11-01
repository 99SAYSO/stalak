# « One take » : SPEC (promo v5, idée A choisie le 1/11)

Le propriétaire a choisi l'idée A et a demandé : HyperFrames, une voix off, beaucoup de mouvement et de 3D, un motion design poussé, aux couleurs de Stalak, avec des transitions fluides.

```text
GOAL:    un rappeur qui scrolle comprend en 29 s que Stalak transforme son son + ses prises en snippet coupé
         sur le temps, lèvres synchro, et va sur stalak.app.
OUTPUT:  HyperFrames 0.8.223, 1080 x 1920, 30 i/s.
TIME:    v2 : 78 temps à 157 BPM x 0,382166 s = 29,81 s = 894 images (l'adresse reste 2 s à l'écran).
         11,465 images par temps ; le temps b tombe à l'image round(b x 11,465). Changement d'état sur un temps.
MUSIC:   « neva die » et son instru, calés à l'échantillon (instru = son + 23,13007 s, corrélation 0,99 sur les basses).
         m0 : son (avec la voix de 99Sayso) mesure 6 du son (10,541 s) ; m1-m11 : instru depuis 35,200 s
         (m10-m11 = la coupure des basses de l'instru) ; m12-m14 : son depuis 4,426 s (le drop + la voix, lèvres synchro) ;
         m15-m18 : instru depuis 56,600 s, fondu 1,3 s à la fin. Même phase dans la boucle de 8 mesures à chaque raccord.
VOICE:   Gemini 3.1 Flash TTS (Achird), une lecture, coupée en 14 phrases (vérifié : 14 segments, durées et syllabes).
         Chaque phrase commence sur un temps (b) : L1 b4, L2 b10,25, L3 b12,75, L4 b17,75, L5 b20, L6 b24,25, L7 b28,
         L8 b36, L9 b40, L10 b44, L11 b60, L12 b64,75, L13 b68,75, L14 b72,5. Pas de voix pendant les snippets.
         Musique sous la voix : 0,5, baissée à 0,18 pendant chaque phrase (pas de remontée entre deux phrases proches).
LOOK:    le monde de Stalak. Fond bleu roi #1f6fd6 (radial : #2a7be6 au centre, #1a5fc0 aux bords), neige qui tombe
         en 3 couches (loin 2-3 px nette, milieu 4-6 px, près 18-32 px floue à 8 px), grain 2 %.
         La forme : un bloc 3D extrudé de 26 px. Deux matières : « encre » (face #0a0d14, liseré clair en haut)
         pour les boutons, « neige » (face #ffffff, contour encre 6 px) pour les cartes. Côtés bleu encre #22304a
         avec une lèvre claire #4d5f82 juste derrière la face ; la face s'assombrit quand elle tourne loin de la
         lumière (en haut à gauche) et une bande de brillance la balaie pendant qu'elle penche.
         Vue légèrement d'en dessous : l'épaisseur se voit en bas, comme l'ombre encre décalée des boutons de l'app.
         Stalactites de l'app : glace #d6ecff contour encre 4 px, sous les boutons et en frange en haut des cartes.
         Titres : Lilita One 132 px, blanc, contour encre 11 px, ombre encre décalée de 10 px (le style du logo).
         Interface : Rubik 500/700, Lilita One pour les titres de cartes et les boutons, comme dans l'app.
         Couleurs des prises (celles de l'app) : 1 #d6336c, 2 #3a6fe0, 3 #e0952c. Accent : bleu #1f6fd6 sur un mot.
OBJECTS: la vraie app : zone « Import your music », fichier « neva-die », « Tempo detected: 157.0 BPM. »,
         « Add your takes » / « Import my videos » / « Take 1 · Synced to the song », « All the takes are synced. »,
         « Lyrics on screen » / « Paste my lyrics », « Your edit » / « Version 1 » / « 21 shots • 25.6 s » et le vrai
         montage (21 plans), « ↻ Shuffle », « Filter » None / Frost / 35 mm film / Black & white, « Export ↓ ».
         Les vraies prises, le vrai montage de Stalak, le vrai filtre Frost (media-treatment). Le logo officiel.
MOTION:  un seul moteur render(t), tout est fonction du temps. Ressorts fermés (pas d'animation linéaire) :
         forme ζ 0,78, établie en 0,42 s ; caméra ζ 0,9, 0,8 s ; textes et opacités sans rebond (expo.out 0,16 s).
         Contenu qui change : sortie flou 10 px + opacité en 0,12 s, entrée flou 10 → 0 en 0,16 s à 45 % du morph.
         Caméra 3D : perspective 1300 px vue d'en bas, dérive lente ±1°, coup de zoom seulement sur les temps forts
         (+1,2 %, +3 % pendant le drop, décroît en 0,12 s). Un coup 3D amorti à chaque transformation, à la taille du
         changement (jusqu'à 24°), pendant que le contenu est flou ; la couleur de la face change au pic du flou.
SHOTS:   (v2, après la relecture du brouillon 1)
         m0      b0-4 le snippet fini en plein écran (le vrai montage, sa voix), « I gotta bounce », poussée lente
         m1      clic b4 : la vidéo se fige et rétrécit en cadre 484 x 860 avec un coup 3D ; titre « Still editing »
                 puis « by hand? » sur les mots de la voix ; il traîne la tête de lecture à la main (24 vraies images)
         m2      b8 le cadre devient la zone « Import your music » ; le curseur ramène « neva-die.mp3 » en arc
                 sous le texte, survol, « Drop » b10,4 ; rond qui charge, « Analyzing the sound… », coche
         m3      b12 la pilule du son : « 157.0 BPM » compte jusqu'au tempo et s'arrête sur b13,
                 4 points s'allument sur b12, b13, b14, b15 ; « Tempo detected: 157.0 BPM. »
         m4      b16 carte « Add your takes » ; clic b17,75 ; la carte grandit à chaque prise (b18,25 / 18,75 / 19,25)
         m5      b20 les 3 prises sortent en profondeur, décalées, chacune avec sa forme d'onde ; la caméra tourne ;
                 b22 tout se plaque d'un coup : ondes alignées, coches, « All the takes are synced. » tenu 0,9 s
         m6      b24,25 « Lyrics on screen », clic « Paste my lyrics » b25,25, les 2 vraies lignes collées d'un coup
         m7-m8   b28 carte du montage : grand aperçu (370 x 658), les 21 vrais plans tombent sur les doubles croches
         m9      clic « ↻ Shuffle » b36,5 : les blocs sautent en arc et changent de prise, « Version 2 », l'aperçu suit
         m10     b40 même aperçu, la rangée de filtres remplace la barre ; clic Frost b41,25, Frost balaie l'aperçu
         m11     b44 bouton « Export ↓ » encre, clic b45, remplissage glace avec le texte qui passe en encre
         m12-m14 le drop b48 : plein écran, le snippet fini, son + voix, lèvres synchro, Frost, filigrane
         m15-m16 b60 la vidéo se replie en pilule (vidéo gardée jusqu'au milieu du pli) : « 40 min » monte sur
                 « Forty », « by hand » ; « 3 min » « with Stalak » sur « Three » (b64,75)
         m17-m18 b68 la pilule fait un tour complet et devient l'icône de l'app ; le logo se dévoile dessous
                 (b68,6) ; « Free · in your browser · no sign-up » avec la voix ; « stalak.app » tapé en 0,28 s
                 (b71,75), tenu jusqu'à 29,81 s
BANNED:  vide sombre ; halo, néon, particules décoratives (seule la neige de la marque) ; cartes en verre ;
         tout qui apparaît en fondu en même temps ; titres qui bougent pendant la lecture ; boucles qui « respirent »
         sur l'interface ; rebond de dessin animé ; anneaux de clic ; trois cartes « avantages » en rang (les 3 prises
         côte à côte de la synchro, elles, sont le sujet) ; logo collé dans un coin ;
         interface penchée en 3D pendant qu'on la lit (seules les vidéos penchent) ; bouton ou texte inventé.
QA:      une image par temps (76), une bande autour de chaque changement d'état, la planche à 360 px de large,
         l'heure de chaque phrase de voix contre l'heure de son image, le niveau (-16 à -14 LUFS), aucune image noire.
```
