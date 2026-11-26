Statut : PRÊT

# Branche `app/tiktok-masque` — « Publier sur TikTok » masqué tant que TikTok n'a pas validé l'appli (point 6, urgent)

Demande : `docs/handoff/chef-retours-26-11.md`, point 6. Décision du propriétaire du 26/11 à 0 h 55 : masquer le bouton pour tout le monde tant que TikTok n'a pas validé l'appli (Sandbox), puis le remettre. Le compte testeur doit encore le voir pour la vidéo de démo (`docs/social/DEMO_TIKTOK.md`).

Partie de `main` (`a7aebd0`), toute petite, indépendante des autres branches.

## Ce qui change
- **Serveur** (`functions/_lib/social.js`, `functions/_lib/router.js`). `/api/config` ne propose plus TikTok quand `TIKTOK_PUBLIC = "0"`, sauf pour les comptes testeurs :
  - les comptes Stalak dont l'e-mail est dans `TIKTOK_TESTERS` (séparés par des virgules, majuscules ignorées) ;
  - les comptes qui ont déjà relié un TikTok. En Sandbox, seuls les comptes testeurs peuvent le faire.
  - Instagram ne change pas. La réponse reste `no-store`, jamais gardée en cache.
- **`wrangler.toml`** :
  - `TIKTOK_PUBLIC = "0"` : le bouton est masqué ;
  - `TIKTOK_TESTERS = ""` : **le propriétaire y met l'e-mail de son compte Stalak de test**, ici ou dans Cloudflare → Pages → Settings → Variables. Ce n'est pas un secret, mais je ne l'écris pas à sa place.
- **Pour le remettre à tout le monde**, une fois l'appli validée par TikTok : `TIKTOK_PUBLIC = "1"`, puis redéployer.
- **App** (`src/tiktok.js`) : quand on se connecte ou qu'on change de compte, l'app redemande si TikTok est proposé. Ainsi, un testeur qui se connecte après l'ouverture de la page voit le bouton sans recharger.

## Tests
- Serveur : `node tests/backend/run.mjs` 138/138. Le nouveau test vérifie :
  - quelqu'un de déconnecté, ou un compte ordinaire, ne voit pas TikTok ;
  - le testeur listé voit TikTok ;
  - un compte qui a déjà relié TikTok le voit ;
  - avec `TIKTOK_PUBLIC = "1"`, tout le monde le voit.
- App : `tiktok_ui` 224/224 (ce test simule la config, donc il est inchangé).

## À prévenir
- **Comptes** : `functions/` touché (`socialVisible` dans `social.js`, `config(env, social)` dans `router.js`), plus 2 variables dans `wrangler.toml`.
- **Propriétaire** : remplir `TIKTOK_TESTERS` avec l'e-mail du compte Stalak qui tourne la démo.
