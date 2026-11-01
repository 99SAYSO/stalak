# « One take » : SPEC (promo v5, idée A choisie le 1/11)

Le propriétaire a choisi l'idée A et a demandé : HyperFrames, une voix off, beaucoup de mouvement et de 3D, un motion design poussé, aux couleurs de Stalak, avec des transitions fluides.

```text
GOAL:    un rappeur qui scrolle comprend en 29 s que Stalak transforme son son + ses prises en snippet coupé
         sur le temps, lèvres synchro, et va sur stalak.app.
OUTPUT:  HyperFrames 0.8.223, 1080 x 1920, 30 i/s.
TIME:    v3 (retours du propriétaire, 1/11 midi) : 66 temps à 157 BPM x 0,382166 s = 25,22 s = 757 images.
         11,465 images par temps ; le temps b tombe à l'image round(b x 11,465). Changement d'état sur un temps.
MUSIC:   « neva die » et son instru, calés à l'échantillon (instru = son + 23,13007 s, corrélation 0,99 sur les basses).
         v3 : b0-4 son mesure 3 (5,955 s, ses mains vers la caméra) ; b4-44 instru mesures 6-15 ; b44-48 son
         mesure 6 (« I gotta bounce », 1 mesure = 1,53 s) ; b48-66 instru depuis la mesure 25, fondu 1 s à la fin.
         Les accords de l'instru reviennent toutes les 8 mesures (corrélation 0,99) : chaque raccord garde la même
         place dans cette boucle.
VOICE:   Gemini 3.1 Flash TTS (Achird), une lecture, coupée en 14 phrases (vérifié : 14 segments, durées et syllabes).
         v3, sans blanc (0,1 à 0,35 s entre deux phrases) : L1 b4, L2 b10,25, L3 b12,75, L4 b17,75, L5 b20, L6 b24,25,
         L7 b27, L8 b35, L9 b38,25, L10 b40,5, L11 b48, L12 b52,75, L13 b56,75, L14 b60,5. Pas de voix pendant les snippets.
         Les mots apparaissent à l'écran un par un, à l'heure mesurée de chaque mot dans les fichiers.
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
SHOTS:   (v3)
         m0      b0-4 le snippet en plein écran (Version 2), il arrive incliné et zoomé, un coup de zoom par temps,
                 une coupe sur b2 ; le curseur clique sur b4
         m1      b4 il se fige en cadre 360 x 640 qui fait défiler ses images ; les mots se verrouillent autour sur la
                 voix : STILL (en haut), EDITING (à la verticale à gauche), SNIPPETS (dessous), BY (à la verticale à
                 droite), HAND? (rose, en dessous) ; la caméra tourne doucement et tape sur chaque mot
         m2      b9,75 les mots s'envolent, le cadre devient la zone ; « Drop » b10,75 ; la pilule du son b11,25
         m3      « Stalak » : le logo claque en haut sur le mot ; 157.0 BPM compte jusqu'à b14,5, 4 points sur b13-16
         m4      b17 « Add your takes » ; clic b18 ; la carte grandit (b18,5 / 18,875 / 19,25)
         m5      b20 les 3 prises en profondeur, décalées ; b22 tout s'aligne ; « All the takes are synced. »
         m6      b24,25 paroles, clic b25, collées b25,25
         m7-m9   b26,75 le montage : les 21 plans sur les doubles croches ; Shuffle b35 ; Version 2 b36,25
         m10     b37,75 la rangée de filtres ; clic Frost b38,75 ; balayage
         m11     b40,25 « Export ↓ » ; clic b41,25 ; remplissage jusqu'au drop
         m12     b44-48 le drop : son snippet en plein écran, Frost, « I gotta bounce », filigrane (1,53 s)
         m13-m14 b48 « 40 min by hand » ; b52,75 « 3 min with [logo] »
         m15     b56,25 la pilule fait un tour et devient l'icône ; logo b57 ; slogan avec la voix ; stalak.app tapé b59,75
BANNED:  vide sombre ; halo, néon, particules décoratives (seule la neige de la marque) ; cartes en verre ;
         tout qui apparaît en fondu en même temps ; titres qui bougent pendant la lecture ; boucles qui « respirent »
         sur l'interface ; rebond de dessin animé ; anneaux de clic ; trois cartes « avantages » en rang (les 3 prises
         côte à côte de la synchro, elles, sont le sujet) ; logo collé dans un coin ;
         interface penchée en 3D pendant qu'on la lit (seules les vidéos penchent) ; bouton ou texte inventé.
QA:      une image par temps (76), une bande autour de chaque changement d'état, la planche à 360 px de large,
         l'heure de chaque phrase de voix contre l'heure de son image, le niveau (-16 à -14 LUFS), aucune image noire.
```
