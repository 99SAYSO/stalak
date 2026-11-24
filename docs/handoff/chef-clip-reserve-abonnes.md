# Demande du Chef : mode Clip réservé aux abonnés (24/11/2026)

Décision du propriétaire, 24/11 à 7 h 55 : « il faut pas que les gens puissent essayer le mode clip gratuit, obliger d'avoir un abonnement ».

Elle **remplace** la décision du 7/11 (mode Clip n° 2 : « les effets jouent dans l'aperçu pour tout le monde ; un clip est exporté avec Pro », `clipGate`).

## Pour App (branche `app/clip-reserve-abonnes`)
- Un compte sans Pro ni Creator Plus (essai Pro en cours compris comme abonné) ne peut plus **choisir** le mode Clip 16:9 : le choix « Clip » à l'étape 1 ouvre directement l'écran des formules (paywall), avec une phrase claire (« Le mode Clip 16:9 est réservé aux abonnés »).
- Plus d'aperçu gratuit du mode Clip : retirer « Tu peux l'essayer dans l'aperçu » (`ca.p`, `ca.try` FR/EN) et le chemin d'essai. Le bouton de l'accueil « Essaie le mode Clip » (`hero.clip`) devient un lien vers le mode réservé (ou disparaît pour les non-abonnés : à proposer).
- Un projet Clip déjà commencé par un gratuit (`localStorage`) : il s'ouvre en format TikTok / Reels, ou affiche le paywall. Ne rien perdre.
- Tests à adapter (`clip1_ui` et ceux qui passent par l'essai), maquette à montrer au propriétaire avant fusion.

## Pour Marketing
- `site_src/pricing.html` (« Try it free — Pick “Music video” at step 1 ») et les pages Clip (`/music-video`, `/fr/clip`, `music-video-maker-for-rappers`) : retirer toute promesse d'essai gratuit du mode Clip.

## Pour Juridique
- Vérifier que les conditions et la page Tarifs ne promettent pas un essai gratuit du mode Clip (l'essai Pro de 7 jours reste).
