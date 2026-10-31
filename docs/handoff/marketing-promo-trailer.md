Statut : PRÊT
Branche : marketing/promo-trailer

Résumé : bande-annonce v4 « Before midnight », repartie de zéro à la demande du propriétaire (il n'a pas gardé la v3 « Unfreeze your snippet », branche `marketing/promo-unfreeze`, marquée abandonnée).
- **Format** : vertical 1080 × 1920, 30 i/s, 37,5 s, anglais américain, pour TikTok, Reels et Shorts. Faite avec HyperFrames et three.js (iPhone 3D).
- **Ce qu'il voulait** : pas de mascotte, une voix off, du motion design et de la 3D dans le style de son exemple (la pub « Spenda 2.0 » de WizzEdits). Il a choisi, parmi 3 idées, le thème de l'horloge (le temps qu'on perd, puis qu'on gagne) avec les effets de l'idée 1 (mots un par un, écho sur « 40 MIN », carré qui devient le logo, anneau lumineux, iPhone 3D, prises en orbite).
- **L'histoire** : ton son sort à minuit, ton snippet n'est pas monté, 40 min à la main (l'horloge passe 12:22 AM, tu rates la sortie). On rembobine : Stalak. Ton son, tes prises, les coupes sur le beat, les paroles et le style, c'est fait à 11:45 PM. 40 min à la main, 3 min avec Stalak. Rien à télécharger, pas d'inscription, stalak.app, Try it free.
- **Chiffres** : 40 min et 3 min sont les vrais temps du propriétaire (3 min mesuré le 31/10).
- **Voix off** : Gemini 3.1 Flash TTS dans Flora (voix Achird, 0,026 $ pour deux lectures), téléchargée par le propriétaire. Musique : l'instru de « neva die ». Un son de la bibliothèque HyperFrames sur chaque action.
- **Images** : les vraies captures de l'app sur l'écran de l'iPhone 3D, les vraies prises et le vrai montage de Stalak, le filtre Frost en vrai traitement vidéo.
- La vidéo, la voix et la musique ont été envoyées directement au propriétaire et ne sont pas dans le dépôt. Rien à mettre en ligne sur le site.

Fichiers touchés :
- `promo/trailer/` : nouveau projet (`index.html` généré par `build.py` depuis `timing.json`, `compositions/` (12 scènes + `stage.html` pour l'iPhone 3D), `assets/` (kit, trailer.css, trailer.js, times.js, ui, brand, fonts, vendor avec GSAP et three.js), `SPEC.md`, `STORYLINES.md`, `REVIEW.md`, `MEDIA.md`, `.gitignore`) ;
- `docs/STATUS.md` ;
- `docs/handoff/marketing-promo-trailer.md`.

Aucun fichier de l'app ni du site n'est touché.

Migration SQL : aucune.

Tests : voir `promo/trailer/REVIEW.md` (lint, check, images de contrôle, rendu final vérifié : durée, image, son).

Reste au propriétaire :
- Vérifier la licence de l'instru avant de diffuser la pub : le fichier s'appelle « free … type beat », ce qui est souvent gratuit seulement hors usage commercial.
- Avant de poster, regarder l'aperçu dans TikTok et Instagram pour vérifier que rien n'est caché.
- Poster la vidéo.
