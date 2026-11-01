# « The Snippet Machine » : SPEC (promo v8, demande du propriétaire du 1/11)

La demande (1/11, 17 h 26) : une nouvelle vidéo « en motion design, toujours dans le style 3D isométrique, pour nous montrer un petit peu quelles sont tes capacités […] des zooms, des illustrations, des animations », « uniquement la génération par Hyperframes », un script « vraiment original, qui capte l'attention et nouveau dans l'aspect ». Trois idées proposées (`STORYLINES.md`) ; il a choisi la A (« 1 », 17 h 41).

Tout est dessiné en code par HyperFrames (un petit moteur 3D dans un canvas) : aucune image ni vidéo générée par un autre outil. Les seuls médias réels : ses 3 prises, sa chanson et son instru, l'icône et le logo officiels.

```text
GOAL:    un rappeur qui scrolle regarde une machine de glace monter son snippet toute seule, sur son beat, et
         comprend sans voix ce que fait Stalak (son, prises, coupes sur le temps, lèvres synchro, paroles, Frost,
         3 minutes) ; à la fin, la machine était l'icône Stalak ; il va sur stalak.app.
OUTPUT:  HyperFrames 0.8.223, 1080 x 1920, 30 i/s, anglais américain, sans voix (titres, musique, sons).
TIME:    76 temps à 157 BPM x 0,382166 s = 29,04 s. Film 0 = mesure -4 de l'instru (sa basse, ses hi-hats légers).
         Le drop de l'instru (sa mesure 2) tombe sur le temps 24 : la lame commence à couper.
TITLES:  t -2..6 « This machine / edits your snippet. » (là dès la 1re image)  ·  6 « Drop your song. »
         10 « It finds / every beat. »  ·  16 « Drop your takes. »  ·  20 « Every cut, » puis 24 « on the beat. »
         34 « Lips stay / in sync. »  ·  38 « Lyrics / on screen. »  ·  42 « Add the Frost. »
         46 « 3 minutes. » puis 48 « Not an hour. »  ·  son snippet : « I gotta bounce » (ses paroles)
         fin : l'icône, le logo, « stalak.app », « Free · in your browser ».
SCENES:  (en temps du beat)
         0-6     l'île de glace ; un portique tient un bloc de glace où est gravée la vraie forme d'onde de sa chanson.
         6-8     la pince s'ouvre (6), le bloc tombe sur une bascule (7), qui lance une boule de neige sur le 1er domino (8).
         8-16    8 dominos de glace, un par temps ; chaque domino allume un repère de la règle ; « 157 BPM » (le tempo
                 que l'app détecte pour ce son) ; le dernier appuie sur le bouton du plateau (16).
         16-20   3 bobines aux couleurs des prises (rose 1, bleu 2, orange 3) tombent sur le plateau (16, 17, 18) ;
                 au-dessus, 3 cartes montrent ses vraies prises (jamais penchées) ; le plateau tourne (19).
         20-24   la pellicule sort sur le tapis, la lame se charge, ça monte.
         24-34   le drop : 21 coupes, une par demi-temps ; compteur CUTS 01 -> 21 ; chaque tranche vole sur la pile,
                 dans l'ordre réel des prises de son montage « Version 1 » (21 plans).
         34-38   la pile avance sous l'arche : la forme d'onde de la chanson et celle de la prise se calent (37).
         38-42   le tampon frappe 3 fois sur la pile (39, 40, 41) : « I », « GOTTA », « BOUNCE » s'impriment dessus.
         42-46   le canon à neige, sur son mât, givre la pile (43) ; des stalactites poussent.
         46-50   le chrono compte jusqu'à 03:00 (48) ; la pile vole dans l'écran du téléphone (48-49), qui s'allume.
         50-52   la caméra plonge dans l'écran (elle se redresse face à lui).
         52-60   son vrai snippet en plein écran, sa chanson (mesures 6-7, « I gotta bounce »), filtre Frost, le
                 petit logo du filigrane comme dans la version gratuite.
         60-64   la caméra ressort et recule : l'île est le dessus de l'icône Stalak en 3D (le S sur son flanc).
         64-68   la machine rentre dans la neige ; l'icône se tourne vers nous, ses coins s'arrondissent.
         68-76   l'icône (68), le logo (68,5), « stalak.app » s'écrit (69,5), « Free · in your browser » (70,5).
LOOK:    ciel bleu du site, plus clair (dégradé #a8d4ff -> #79b8f7 -> #4d97ec), neige, petites îles au loin ;
         caméra orthographique isométrique (45°, 35,26°) ; lumière venue d'en haut à gauche (-0,35 ; 1 ; 0,6) ;
         chaque face mélange deux couleurs selon la lumière (neige #ffffff/#9fc8f2, bleu Stalak #3d91f3/#1550aa,
         glace #eef8ff/#7fb7ee, prises #d6336c / #3a6fe0 / #e0952c) ; contours encre #0a0d14 de 3 à 7,5 px ;
         stalactites sous les rebords ; ombres au sol ; reflets sur la glace ; titres Lilita One 104 px blancs,
         contour encre 13 px, ombre encre 10 px ; un seul mot rose #ff6fae par titre.
SOUND:   l'instru de « neva die » (montée de 4 dB avant son drop pour que le début ne soit pas trop calme),
         le drop sur la lame ; un temps de respiration pendant la plongée ; sa chanson sous son snippet ; puis
         l'instru (mesure 10), fondu de 1,3 s. Des sons sur chaque action : faits ici (domino, lame, tranche,
         tampon, canon, chrono, pince, glace, moteur) et de la bibliothèque HyperFrames (souffles, pops, impacts,
         carillon, ping, notification, montée, frappe).
BANNED:  pas de voix (la musique, les sons et les titres portent tout) ; pas d'image ni de vidéo générée ailleurs ;
         pas de chiffres inventés (157 BPM, 21 plans, 3 minutes et « an hour » sont les vrais) ; pas de
         concurrent ; l'interface et les prises réelles jamais penchées ; pas le « trop carton, jouet » de la v3.
```
