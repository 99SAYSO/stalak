Statut : PRÊT
Branche : marketing/audit-site

Résumé : audit SEO et textes de l'accueil et des Tarifs, en FR et EN. Ces changements sont déjà dans `main` (fusionnés avant ce compte rendu). Ce commit n'ajoute que ce compte rendu ; il n'y a rien d'autre à mettre en ligne.
- Descriptions Google raccourcies (135 à 151 caractères) ; aperçus de partage (`og:` / `twitter:`) ajoutés sur Tarifs ; titre Tarifs plus parlant.
- FAQ « Mes vidéos sont-elles envoyées ? » corrigée : elle cite maintenant les paroles automatiques (son envoyé à Workers AI, non gardé) ; même correction sur l'accueil.
- Karaoké et mot par mot marqués Stalak Pro sur l'accueil ; limites Pro affichées sur Tarifs (20 paroles/jour, 8 min, 20 Go, effacement après 6 mois sans ouverture).
- Formules exagérées remplacées par des faits ; section « Comment faire un playback avec Stalak » ajoutée sur l'accueil.
- Logo 120 × 120 pour l'écran Google (`docs/marketing/logo-google-120.png`), déjà publié par le Chef de projet.
- Détail : `docs/marketing/AUDIT_SITE.md`. Plan de lancement, calendrier réseaux et e-mails : document « Stalak — plan de lancement et réseaux » dans claude.ai.

Fichiers touchés : `build_site.py` (textes de l'accueil dans `PAGE` et une marge CSS de `.about ul`), `site_src/tarifs.html`, `site_src/en/pricing.html`, `public/` (reconstruit), `docs/STATUS.md`, `docs/marketing/`, `docs/handoff/marketing-audit-site.md`.

Migration SQL : aucune.

Tests : `node tests/backend/run.mjs` 49/49 ; `node --check src/app.js` ; `build.py` passe ; Playwright à 390 px et 1280 px sur `/`, `/en/`, `/tarifs`, `/en/pricing` : pas de défilement horizontal, aucune erreur hors `/api/me` et `/api/config` (serveur de comptes absent en local).

Reste au propriétaire :
- Décider des boutons Pro de la page Tarifs pendant que Paddle est en sandbox (« Pro arrive bientôt » ou Paddle en réel) avant toute promo.
- Lancer la phase 1 du plan : inviter 10 à 15 testeurs, poster les premières vidéos à partir du 2 novembre.

À transmettre à d'autres rôles (via `docs/STATUS.md`) : case « recevoir les nouveautés » à l'inscription (Comptes) ; mots « montage de playback » dans le H1 et JS/CSS en fichiers cachés (App).
