# Relecture — « The edit nobody sees » (YouTube 16:9) et son Short (9:16), 2/11/2026

Skills : `hyperframes` (contrat, `story.md`, `spec.md`, `review.md`), `saas-motion-video` (méthode : histoire → SPEC → construction → son → livraison), `media-use` (voix Flora, mixage).

## Ce qui a été vérifié avant le rendu

- `hyperframes lint` : 0 erreur. `hyperframes check` : lint, exécution, mouvement, son : OK. Mise en page : une seule erreur, voulue (la carte « Lyrics on screen » passe par-dessus « Your edit » : marquée `data-layout-allow-overlap`). Les chiffres de la règle et du tapis sont du décor (`data-layout-ignore`).
- Images de contrôle à chaque plan (plus de 120 images regardées), corrigé en route :
  - les objets d'un monde restaient visibles dans l'autre quand on sautait dans le temps (un parent caché ne cache pas un enfant marqué visible) : chaque couche se cache maintenant par son opacité ;
  - le gros plan restait affiché après son plan quand on sautait dans le temps : il est dessiné à chaque image ;
  - les pellicules commençaient par 40 cm de noir : les images démarrent juste après l'amorce ;
  - les morceaux du plan 2 cachaient les repères des plans 3 et 4 : ils tombent ailleurs ;
  - les plans 3 et 4 étaient trop loin : caméra plus proche, repères plus gros ;
  - la carte des paroles laissait passer les boutons de la carte « Your edit » : chaque carte a son propre plan ;
  - la 2e partie du gros plan montrait sa main devant la bouche : remplacée par la prise 3 à 12 s (visage dégagé) ;
  - le pack : 2 s de ciel vide avant les 30 vidéos : le badge « Creator Plus » et la bande du son arrivent, les vidéos en sortent ;
  - le résultat : deux des trois vidéos montraient parfois la même prise : maintenant, à chaque temps, les trois montrent trois prises différentes ;
  - l'icône Stalak repartait 0,3 s après le drop : elle reste jusqu'à la fin de « This is Stalak. ».
- Son, **mesuré, pas écouté** (je ne peux pas entendre) : mixage refait hors ligne à partir de `index.html`, par groupes (voix, musique, bruitages), puis comparé au son du premier rendu (corrélation 0,98 ; le rendu met une voix mono à pleine puissance sur les deux côtés, +3 dB par rapport à mon premier calcul, corrigé). Au premier rendu, la musique était 14,5 LU sous la voix dans la partie « problème » (presque absente) : montée de 3 dB. Réglage final : voix 7,5 LU au-dessus de la musique partout (problème : voix −16,8 / musique −24,4 LUFS ; Stalak : −16,2 / −23,7 ; fin : −15,8 / −23,9), sa chanson au résultat −15,3 LUFS (un peu plus fort que les passages parlés, c'est voulu).
- Le Short, même réglage : voix −16,4 / musique −24,2 (problème), −16,9 / −23,1 (Stalak), sa chanson −15,4.

## Les fichiers livrés (2/11, envoyés au propriétaire, pas dans le dépôt)

- `renders/Stalak_YouTube_The_edit_nobody_sees.mp4` : 1920 × 1080, 30 images/s, 61,17 s, H.264 + AAC. Aucune image noire, aucune image figée plus d'une seconde (la carte de fin avance doucement). Son : −14,0 LUFS intégrés, crête −1,4 dB, LRA 2,9 LU ; par partie : problème −14,5, Stalak −14,0, sa chanson −13,3, fin −14,1.
- `short/renders/Stalak_Short_The_edit_nobody_sees.mp4` : 1080 × 1920, 30 images/s, 29,83 s. Aucune image noire ni figée. Son : −14,0 LUFS, crête −1,3 dB, LRA 2,3 LU ; problème −14,3, Stalak −14,4, sa chanson −13,3, fin −13,5.
- Toutes les images des deux rendus regardées (2 par seconde) : rien de cassé ; le texte de lecture reste dans le cadre sûr.
- Mastering : le son du rendu est monté au niveau voulu (gain), puis limité (`alimiter`, plafond −1,4 dB) ; l'image n'est pas réencodée.

## v3 (2/11, après ses remarques de 2 h 28)

- `hyperframes lint` : 0 erreur (film et Short). `hyperframes check` : tout OK (lint, exécution, mise en page, mouvement, contraste, son). Restent des avertissements connus : le texte blanc de « Normal » posé sur la pastille bleue mobile, que le contrôle ne voit pas, et les tirets de la carte des paroles (décor) ; quelques textes de l'interface tenus moins de 1,4 s parce que la caméra suit la voix ; le dernier mot de certains groupes de sous-titres tenu 0,2 à 0,4 s (la voix enchaîne, il a été entendu). Les groupes trop courts ont été fusionnés (« Every take has to line up with the track. », « Stalak lines every take up with the music, »…).
- Images de contrôle avant le rendu (une cinquantaine), corrigé en route :
  - deux groupes de sous-titres se voyaient en même temps au moment du changement : le premier part maintenant 0,07 s avant que le suivant arrive ;
  - pendant le gros plan, les sous-titres passaient sur deux lignes : ils sont sous les pistes VOICE / LIPS, sur une ligne ;
  - dans le Short, « One frame off » et l'étiquette « 1 frame off » étaient l'un sous l'autre : l'étiquette passe en bas de l'image ;
  - les cartes (Pick your song, Add your takes, Your edit, l'aperçu, Pace) touchaient les sous-titres : caméra reculée ou décalée ; dans le Short, la carte « Your edit » descendait sous les sous-titres en haut : reculée ;
  - la grille des 30 vidéos passait sous les sous-titres : caméra reculée ;
  - « Make the pack » chevauchait « 30 videos » (depuis que « Creator Plus » est dans la carte) : carte élargie à 1480 px ;
  - le dernier sous-titre avant le résultat restait sur les trois vidéos qui grandissent, et la carte du pack restait derrière elles : le sous-titre part avant, le tableau s'efface ;
  - son clip : le passage montré commence à 4,6 s (avant : un flash blanc et des effets qui rendaient l'écran illisible).
- Vérifié sur les rendus, image par image : au drop, le tas de morceaux disparaît avant que le tapis s'ouvre, rien ne passe sur l'icône ; les stalactites poussent sous l'icône et bougent avec elle ; « OFF BEAT » est à l'écran de 9,99 s à l'arrivée du gros plan (environ 1,1 s fixe, puis pendant la plongée).
- Son, mesuré (le mixage n'a pas changé ; seule la musique commence une mesure plus tôt dans l'instru, sur le début d'une phrase de 4 mesures) :
  - film : −14,1 LUFS intégrés, crête −1,3 dB, LRA 3,1 LU ; problème −14,8, Stalak −14,0, sa chanson −13,3, fin −14,1 ;
  - Short : −14,1 LUFS, crête −1,4 dB, LRA 2,4 LU ; problème −14,6, Stalak −14,3, sa chanson −13,1, fin −13,9.

### Les fichiers livrés (2/11, envoyés au propriétaire, pas dans le dépôt)

- `renders/Stalak_YouTube_The_edit_nobody_sees.mp4` : 1920 × 1080, 30 images/s, 62,7 s, H.264 + AAC, 123 Mo. Aucune image noire, aucune image figée plus d'une seconde. Toutes les images regardées (2 par seconde).
- `short/renders/Stalak_Short_The_edit_nobody_sees.mp4` : 1080 × 1920, 30 images/s, 31,4 s, 60 Mo. Aucune image noire ni figée. Toutes les images regardées (2 par seconde).
