Statut : ABANDONNÉ (ne pas intégrer)
Branche : marketing/promo-unfreeze

> **31/10, 23 h** : le propriétaire ne garde pas cette version (« j'aime pas du tout »). Une nouvelle bande-annonce, sans mascotte, avec voix off, est en préparation sur `marketing/promo-trailer`. Cette branche reste pour mémoire.

Résumé : version 3 de la vidéo promo, « Unfreeze your snippet ». Le propriétaire l'a demandée totalement différente des deux premières.
- **Format** : vertical 1080 × 1920, 30 i/s, 28 s, anglais américain, pour TikTok, Reels et Shorts. Faite avec HyperFrames et three.js.
- **Pas de voix off** : le texte apparaît à l'écran, sur l'instru de « neva die ».
- **Ce que voulait le propriétaire** : beaucoup de 3D, de mouvement et de texte qui apparaît, des transitions qui se fondent dans le décor, sa mascotte en 3D, et qu'on comprenne tout de suite qu'il n'y a rien à installer.
- La vidéo et la musique ont été envoyées directement au propriétaire et ne sont pas dans le dépôt. Rien à mettre en ligne sur le site.

- **Le hook** : « me spending 40 MIN editing a 15 sec snippet » (40 min, c'est le vrai temps de montage du propriétaire). La mascotte est gelée dans un bloc de glace avec des clips.
- **L'histoire** :
  1. la caméra plonge dans une fissure et entre dans une crevasse de glace : « cut. cut. cut… » sur des clips coupés à la main ;
  2. le bloc explose sur le temps fort, la mascotte sort en tournant et le logo claque ;
  3. les éclats dessinent un iPhone : « just open stalak.app », tapé dans Safari, puis l'app s'ouvre ;
  4. les 3 étapes : 1. drop your song, 2. add your takes, 3. it cuts on the beat (les vraies coupes de Stalak) ;
  5. la vraie vidéo finie, avec les paroles ;
  6. Shuffle : trois montages à la fois ;
  7. les avis de 3 vrais bêta-testeurs ;
  8. la carte de fin : NO DOWNLOAD. NO SIGN-UP., stalak.app, TRY IT FREE, @stalak_app ;
  9. la mascotte danse puis regèle, et la vidéo boucle sur la première image.
- **La 3D, refaite après le retour du propriétaire** (« trop carton, jouet, trop cubique ») :
  - un bloc en vraie glace : réfraction, givre sur les arêtes, bulles d'air, fissure fine ;
  - une crevasse de glace en 3D à la place des murs plats en 2D ;
  - des éclats de glace cassée et de la poudre de glace ;
  - des morceaux de glace irréguliers (plus aucun cube ni boule) ;
  - un ciel froid et une lumière de studio ;
  - une profondeur de champ, comme avec une vraie caméra.
  - Le détail est dans `promo/unfreeze/REVIEW.md`.
- **La mascotte 3D** : faite avec Meshy 7 dans Flora, avec un squelette et une danse. Coût : environ 2,10 $ de crédits Flora, accepté par le propriétaire.
- **Les avis** :
  - ce sont les vrais messages de Bloody, haeine et Kazzy, traduits fidèlement, avec leur accord ;
  - pas de photo de profil, une étiquette « beta tester » ;
  - le propriétaire demandait « plein d'avis 5 étoiles » : refusé, car il n'existe pas de système de notes.
- **Son** :
  - l'instru de « neva die », étouffée jusqu'à l'explosion puis pleine, avec toutes les animations calées sur son rythme (157 BPM) ;
  - un son de la bibliothèque HyperFrames sur chaque action.
- Cette branche part de `marketing/promo-explainer` (version 2, déjà PRÊT) et la contient.

Fichiers touchés :
- `promo/unfreeze/` : nouveau projet (`index.html` généré par `build.py`, `compositions/`, `assets/kit.css`, `assets/kit.js`, `assets/beats.js`, `assets/ui`, `assets/brand`, `assets/mascot`, `assets/fonts`, `assets/vendor` avec GSAP et three.js en local, `SPEC.md`, `REVIEW.md`, `MEDIA.md`, `.gitignore`) ;
- `docs/STATUS.md` ;
- `docs/handoff/marketing-promo-unfreeze.md`.

Aucun fichier de l'app ni du site n'est touché.

Migration SQL : aucune.

Tests : voir `promo/unfreeze/REVIEW.md` (lint, check, images de contrôle, rendu final vérifié : durée, image, son).

Reste au propriétaire :
- Vérifier la licence de l'instru avant de diffuser la pub : le fichier s'appelle « free … type beat », ce qui est souvent gratuit seulement hors usage commercial.
- Avant de poster, regarder l'aperçu dans TikTok et Instagram pour vérifier que rien n'est caché. L'interface change un peu selon le téléphone.
- Poster la vidéo.
