# « One take » : SPEC (promo v5, idée A choisie le 1/11)

Le propriétaire a choisi l'idée A et a demandé : HyperFrames, une voix off, beaucoup de mouvement et de 3D, un motion design poussé, aux couleurs de Stalak, avec des transitions fluides.

```text
GOAL:    un rappeur qui scrolle comprend en 29 s que Stalak transforme son son + ses prises en snippet coupé
         sur le temps, lèvres synchro, et va sur stalak.app.
OUTPUT:  HyperFrames 0.8.223, 1080 x 1920, 30 i/s.
TIME:    19 mesures à 157 BPM = 76 temps x 0,382166 s = 29,04 s = 871 images. 11,465 images par temps ;
         le temps b tombe à l'image round(b x 11,465). Changement d'état sur un temps, de mise en page sur la mesure.
MUSIC:   « neva die » et son instru, calés à l'échantillon (instru = son + 23,13007 s, corrélation 0,99 sur les basses).
         m0 : son (avec la voix de 99Sayso) mesure 6 du son (10,541 s) ; m1-m11 : instru depuis 35,200 s
         (m10-m11 = la coupure des basses de l'instru) ; m12-m14 : son depuis 4,426 s (le drop + la voix, lèvres synchro) ;
         m15-m18 : instru depuis 56,600 s, fondu 1,3 s à la fin. Même phase dans la boucle de 8 mesures à chaque raccord.
VOICE:   Gemini 3.1 Flash TTS (Achird), une lecture, coupée en 14 phrases (vérifié : 14 segments, durées et syllabes).
         Chaque phrase commence sur un temps (b) : L1 b4, L2 b10, L3 b12, L4 b17, L5 b19, L6 b24, L7 b28, L8 b36,
         L9 b40, L10 b44, L11 b60, L12 b64,5, L13 b68,5, L14 b72. Pas de voix pendant les snippets (m0, m12-m14).
LOOK:    le monde de Stalak. Fond bleu roi #1f6fd6 (radial : #2a7be6 au centre, #1a5fc0 aux bords), neige qui tombe
         en 3 couches (loin 2-3 px nette, milieu 4-6 px, près 18-32 px floue à 8 px), grain 2 %.
         La forme : un bloc 3D extrudé de 26 px. Deux matières : « encre » (face #0a0d14, liseré clair en haut,
         côtés #05070b) pour les boutons, « neige » (face #ffffff, contour encre 6 px, côtés encre) pour les cartes.
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
         Caméra 3D : perspective 1700 px, orbite lente 3-4°/s, coup de zoom +1,2 % sur chaque temps (décroît en
         0,18 s), +3 % sur les temps forts après le drop. Flou de mouvement HyperFrames (data-motion-blur) sur la forme.
SHOTS:   m0      snippet fini dans la forme (vidéo verticale penchée en 3D), « I gotta bounce », 2 coupes sur le temps
         m1      clic b4 : la vidéo se fige, se redresse et devient la zone « Import your music » (carte blanche, pointillés)
         m2      le fichier « neva-die » glisse avec le curseur et tombe sur « Drop » (b10) ; rond qui charge ; coche
         m3      le rond s'étire en pilule du son : lecture, « neva-die », « 157.0 BPM », barres qui suivent la vraie basse
         m4      carte « Add your takes » ; clic « Import my videos » b17 ; 3 prises tombent (b17,5 / b18 / b18,5)
         m5      les 3 prises sortent en profondeur, décalées ; la caméra tourne autour ; elles se plaquent b23 : synchro
         m6      carte « Lyrics on screen », « Paste my lyrics », les 2 vraies lignes se tapent
         m7-m8   carte « Your edit » : aperçu qui coupe sur le temps, les 21 blocs arrivent en 3D, tête de lecture
         m9      « ↻ Shuffle » : clic b37, les blocs sautent et changent de place en arc 3D, « Version 2 »
         m10     (coupure des basses) rangée de filtres, l'anneau glisse et s'étire jusqu'à Frost, l'aperçu givre
         m11     (coupure des basses) bouton « Export ↓ », clic b45,5, remplissage qui monte jusqu'au drop
         m12-m14 le drop b48 : le bouton s'ouvre jusqu'à remplir l'écran : le snippet fini, son + voix, lèvres
                 synchro, « After all this time, baby », Frost, petit logo en filigrane
         m15-m16 la vidéo se replie en pilule : « 40 min by hand », le 40 roule et devient 3 sur « Three » (b65)
         m17-m18 la pilule devient le logo Stalak en 3D (extrudé, stalactites), « Free · in your browser · no sign-up »,
                 « stalak.app » qui s'écrit sur L14, tenue jusqu'à 29,04 s
BANNED:  vide sombre ; halo, néon, particules décoratives (seule la neige de la marque) ; cartes en verre ;
         tout qui apparaît en fondu en même temps ; titres qui bougent pendant la lecture ; boucles qui « respirent »
         sur l'interface ; rebond de dessin animé ; anneaux de clic ; trois cartes en rang ; logo collé dans un coin ;
         interface penchée en 3D pendant qu'on la lit (seules les vidéos penchent) ; bouton ou texte inventé.
QA:      une image par temps (76), une bande autour de chaque changement d'état, la planche à 360 px de large,
         l'heure de chaque phrase de voix contre l'heure de son image, le niveau (-16 à -14 LUFS), aucune image noire.
```
