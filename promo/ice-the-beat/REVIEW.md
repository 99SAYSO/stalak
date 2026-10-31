# Ice the Beat — REVIEW

## Contrôles du projet

- `npx hyperframes lint` : 0 erreur, 0 avertissement.
- `npx hyperframes check` (lint, exécution, mise en page, mouvement, contraste, finition, son) : 0 erreur, 0 avertissement. Il reste 7 remarques d'information, toutes voulues : chevauchements du karaoké, cadres qui dépassent pendant les zooms, éclats hors du cadre.
- Planches d'images (`npx hyperframes snapshot`) regardées à 35 moments, en particulier sur chaque nouvel effet 3D.

## Défauts trouvés et corrigés

1. Le début était gris clair au lieu de presque noir : le flash du choc s'affichait dès l'image 0, parce que GSAP applique tout de suite l'état de départ d'un `fromTo`. Corrigé avec `immediateRender: false` (testé avec GSAP 3.15 : avant le début de l'effet, la valeur d'origine revient bien).
2. Liste des prises à moitié effacée au début de « AUTO-SYNC. » : même cause, sur les reflets des lignes. Corrigé.
3. Petits éclats visibles à l'avance en haut à gauche de la scène 2 : corrigé (opacité 0 au départ et `immediateRender: false`).
4. Titres trop larges pour la zone sûre du téléphone (largeur max 860 px) : « ONE TRACK. » (156 px), « NO EDITING SKILLS. » (150 px), « AUTO-SYNC. » (146 px), « CUT ON BEAT. » (140 px), « YOUR VIDEO. » (134 px), « IN ABOUT A MINUTE. » (86 px), « NO DOWNLOAD. » (114 px), carte de fin (104 px). Corrigé.
5. « NO DOWNLOAD. » passait sur deux lignes et chevauchait « NO SIGN-UP. » : fenêtre plus large et texte qui ne revient plus à la ligne.
6. Fin trop courte pour être lue (stalak.app, TRY IT FREE., @stalak_app restaient moins de 2 s) : tout arrive maintenant entre 22,4 s et 22,7 s et reste plus de 2 s.
7. Requête GSAP vers un CDN dans le bloc neige (bloquée hors ligne) : supprimée, GSAP vient du projet.
8. Badge « 3 » des mini-prises affiché moins de 0,4 s : tenu un peu plus longtemps.
9. Pile de cartes de la scène 2 : le badge « 1 » était caché après le passage en 3D. Cartes plus écartées.

## Choix vérifiés

- Les vraies captures de l'app restent à plat : seuls les éléments dessinés passent en 3D (règle HyperFrames et règle B du brief).
- Aucun filtre CSS (flou) sur les vidéos : les cartes arrivent par la profondeur.
- Synchro des lèvres : la vidéo ne joue que dans les intervalles valides ([1,452 ; 13,45] et [17,45 ; 24,45]). Le montage reprend le vrai montage de Stalak au bon décalage (temps de la prise = temps du film − 1,452 s).
- Blocs 3D du catalogue HyperFrames regardés (`vfx-shatter`, `glass-shard-title`, `frost-sequence-camera-orbit`, `camera-rig-depth-stack`) : ils utilisent WebGL, WebGPU ou du HTML dans un canvas, risqués pour un rendu sans carte graphique. Les éclats, la parallaxe et les reflets sont donc faits en CSS 3D + GSAP, ce qui donne toujours la même image à chaque rendu.

## Rendu final (31/10, `npx hyperframes render --quality delivery --fps 30`)

- Fichier : `renders/stalak-ice-the-beat.mp4` (hors dépôt, envoyé au propriétaire).
- Format : 25,000 s, 1080 × 1920, 30 i/s, 750 images, H.264 yuv420p + AAC 48 kHz stéréo, 29,6 Mo.
- Décodage complet par ffmpeg sans erreur.
- Son : −17,3 LUFS intégrés, crête −1,5 dBTP, LRA 4,2 LU.
- 16 images du rendu regardées (0,2 à 24,9 s) : même résultat que les images de contrôle ; les vidéos jouent, les effets 3D sont bien rendus.
