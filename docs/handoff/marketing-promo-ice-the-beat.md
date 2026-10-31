Statut : PRÊT
Branche : marketing/promo-ice-the-beat

Résumé : vidéo promo « Ice the Beat » de Stalak (25 s, verticale 1080 × 1920, 30 i/s, anglais américain) pour TikTok, Reels et Shorts, faite avec HyperFrames. Elle est validée par le propriétaire sur 4 images clés. La vidéo finale et la voix off lui ont été envoyées directement : elles ne sont pas dans le dépôt. Il n'y a rien à mettre en ligne sur le site.
- Les 8 scènes du brief : 3 prises, « ONE TRACK. NO EDITING SKILLS. », vraies captures de l'app, « AUTO-SYNC. » et « CUT ON BEAT. », karaoké « LYRICS. EFFECTS. YOUR VIBE. », « YOUR VIDEO. IN ABOUT A MINUTE. », « NO DOWNLOAD. NO SIGN-UP. », carte de fin avec stalak.app, « TRY IT FREE. » et @stalak_app.
- Changements demandés par le propriétaire : « No editing skills » à la place de « Zero editing » ; @stalak_app sur la carte de fin ; un passage motion design 3D (éclats de glace qui volent vers la caméra, cadres qui arrivent du fond, logo qui pivote avec un reflet, cadres flottants en parallaxe, illustrations de glace, zooms).
- Fidélité au produit :
  - Seules les vraies captures de l'app sont utilisées (faites sur la version réelle, à plat, jamais inclinées en 3D).
  - Le passage de 9 à 13,5 s reprend le vrai montage de Stalak (plans 7 à 11 de la version 1).
  - La synchro des lèvres est exacte.
  - Aucun concurrent, aucun faux avis, aucun chiffre inventé ; seule la phrase « about a minute » est utilisée.
- Voix off : Flora, modèle Google Gemini TTS, avec une voix « pub sociale » amicale choisie par le propriétaire.
- Musique : « neva die » de 99Sayso (son propre morceau, sa voix incluse), baissée sous la voix off.

Fichiers touchés : `promo/ice-the-beat/` (nouveau projet HyperFrames : `index.html`, `compositions/`, `assets/ui`, `assets/brand`, `assets/fonts`, `assets/vendor`, `SPEC.md`, `REVIEW.md`, `MEDIA.md`, `.gitignore`), `docs/STATUS.md`, `docs/handoff/marketing-promo-ice-the-beat.md`. Aucun fichier de l'app ni du site n'est touché.

Migration SQL : aucune.

Tests :
- `npx hyperframes lint` et `npx hyperframes check` : 0 erreur, 0 avertissement.
- Images de contrôle à 35 moments, toutes regardées.
- Rendu final : 25,000 s, 1080 × 1920, 30 i/s, 750 images, H.264 + AAC ; décodé sans erreur ; −17,3 LUFS, crête −1,5 dBTP.
- Détail : `promo/ice-the-beat/REVIEW.md`.

Reste au propriétaire :
- Poster la vidéo (TikTok, Reels, Shorts).
- Pour refaire un rendu un jour : remettre les médias listés dans `promo/ice-the-beat/MEDIA.md`.

Limites :
- Aucun instrumental ni enregistrement d'écran n'a été fourni : la musique garde la voix chantée sous la voix off, et les captures de l'app ont été faites par Marketing sur la vraie app.
- Pas de vrai bruit de glace qui craque (seulement les sons fournis avec HyperFrames).
- La place de chaque phrase de la voix off a été calée sur ses silences, sans écoute.
