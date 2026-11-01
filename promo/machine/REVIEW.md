# « The Snippet Machine » (promo v8) : REVIEW

## Ce que c'est
Une machine de glace en réaction en chaîne, en 3D isométrique, qui monte son snippet toute seule sur son beat ; la caméra la suit d'un seul plan, plonge dans le téléphone (son vrai snippet), puis recule : l'île était l'icône Stalak (voir `SPEC.md`).
- 1080 × 1920, 30 i/s, 29,04 s, anglais américain, sans voix.
- Fait avec HyperFrames 0.8.223 et rien d'autre : tout le décor est dessiné en code par `assets/engine.js`, un petit moteur 3D isométrique dans un canvas (caméra orthographique qui peut tourner et plonger, faces éclairées, contours encre de l'app, décors dessinés dans le plan de chaque face, stalactites, ombres, neige). Chaque image est calculée à partir du temps. `build.py` place la musique, les sons (dont ceux qu'il fabrique) et les vidéos sur la grille des temps de « neva die » (157 BPM).

## Les choix faits pour le propriétaire
| Choix | Pourquoi |
|---|---|
| Une seule machine, un seul plan | La réaction en chaîne se regarde jusqu'au bout ; chaque pièce est une vraie étape de Stalak, donc on comprend sans voix. |
| Tout bouge sur le beat | Les dominos tombent un par temps, la lame coupe à chaque demi-temps à partir du vrai drop de l'instru, le tampon frappe 3 temps de suite : « cut on the beat » se voit et s'entend. |
| Les vraies données | La forme d'onde gravée sur le bloc est celle de sa chanson ; « 157 BPM » est le tempo que l'app trouve ; les 21 tranches suivent l'ordre réel des prises de son montage « Version 1 » ; « 3 minutes » et « an hour » sont ses temps. |
| Ses vraies prises et son vrai snippet | Les cartes au-dessus des bobines et le snippet de la fin sont ses vidéos (filtre Frost, filigrane de la version gratuite), jamais penchées en 3D : la caméra se redresse face au téléphone pendant la plongée. |
| L'île = l'icône | Le recul final montre que la machine tient sur l'icône Stalak en 3D ; elle se tourne vers nous et ses coins s'arrondissent jusqu'à la vraie icône. |
| Pas de voix | Il voulait voir le motion design ; la musique, les sons et les titres portent tout (une voix reste possible). |
| Contre le « trop carton, jouet » de la v3 | Glace claire avec reflets, contours fins à l'encre comme l'app, stalactites, ombres douces, neige, îles au loin. |

## Contrôles avant le rendu
- `lint` : 0 erreur, 0 avertissement. `check` : réussi. Restent « le canvas touche les bords » (voulu : il remplit l'écran) et les messages du pilote graphique.
- Images de contrôle à chaque étape (accroche, chute du bloc, dominos, bobines, coupes, arche, tampon, canon, chrono, téléphone, plongée, snippet, recul, l'icône qui se tourne, la fin).
- Corrigé pendant ces contrôles : les étapes se chevauchaient à l'écran (l'île passée de 12 à 16 unités, la machine espacée) ; le canon à neige était caché par le téléphone (il est maintenant sur un mât) ; la pile disparaissait derrière le téléphone (elle vole maintenant dans l'écran, d'un seul bloc) ; le contour du chapeau de neige de l'icône sur le flanc de l'île devenait énorme en gros plan (il garde l'épaisseur des autres traits, puis prend celle de la vraie icône à la fin) ; le S de l'icône ne paraît qu'au recul ; le mot « BOUNCE » restait à l'écran quand la caméra partait ; les numéros des prises sur les cartes étaient trop petits ; la dernière ligne restait moins de 2 s.
- Corrigé après le 1er rendu complet (regardé image par image) : le chrono, à côté du téléphone, était coupé au bord de l'écran puis cachait la pile : c'est maintenant l'écran verrouillé du téléphone qui sert de chrono (« 03:00 DONE ») ; le téléphone tout noir débordait sur la scène du canon (cadrage décalé, corps du téléphone plus clair) ; deux titres se chevauchaient un instant au changement.
- Son, avant le rendu (mélange stéréo recalculé hors ligne à partir de `index.html`, comme le fait le rendu) : l'instru avant son drop est 7 LU plus calme qu'après, le début était trop bas (−21,8 LUFS) ; montée de 4 dB avant le drop, sa chanson montée sous son snippet. Résultat : crête −2,0 dB, −14,1 LUFS ; l'accroche −17,7, les dominos −14,8, les coupes −13,8, son snippet −10,9 (le point fort), la fin −15,0.

## Rendu final (1/11, 19 h 30)
- Fichier : 1080 × 1920, 30 i/s, 872 images, 29,1 s, H.264 + AAC, 49,6 Mo, qualité « delivery » (9 min 36 de rendu). Le son est ensuite baissé de 1 dB avec un limiteur de sécurité à −1 dB (l'image n'est pas réencodée). Envoyé au propriétaire (`stalak-the-snippet-machine.mp4`), pas dans le dépôt.
- **Regardé** : deux rendus complets, chacun avec une image par temps sur tout le film (77), 10 images de suite autour de chacun des 24 changements (chute du bloc, dominos, bobines, cartes, drop, coupes, arche, tampon, canon, chrono, pile dans le téléphone, plongée, snippet, recul, l'icône qui se tourne, logo, adresse), la planche à la largeur d'un téléphone et la première image (le titre et la machine). Aucune image noire (vérifié aussi par ffmpeg). Entre les deux rendus, seules les images corrigées changent (138, de 2,3 à 23,2 s).
- **Mesuré, pas écouté** (je ne peux pas entendre le son) : −15,1 LUFS au total, crête −2,9 dB. Par parties : l'accroche −18,9, les coupes −14,6, son snippet −12,1 (le point fort), la fin −16,1.

## Les points les plus faibles
- Pas de voix : tout passe par les titres (choix fait pour montrer le motion design) ; une voix peut s'ajouter.
- Les 2 premières secondes sont plus calmes (−18,9 LUFS) : l'instru avant son drop est douce ; le drop arrive à 9,2 s.
- Les titres changent très vite (un nouveau tous les 1,5 s environ) : à 1, 2 images près, l'ancien et le nouveau se croisent.
- Le téléphone (la station suivante) déborde un peu sur le bord gauche pendant la scène du canon.
- Le moteur 3D est fait main : quelques objets peuvent se recouvrir dans le mauvais ordre une fraction de seconde (rien vu sur les deux rendus).
