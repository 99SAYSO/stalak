Statut : PRÊT

# Branche `app/tiktok-masque` — urgent : bouton TikTok masqué (point 6) et régression du passage corrigée (point 9)

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

## Régression du passage (point 9, `son_passage` 78/86 → 86/86)
**Le problème** : sur téléphone, toucher le curseur rouge déplaçait le début du passage, et « Écouter le passage » ne partait plus du début.

**Pourquoi** : depuis le 25/11, lâcher une poignée fait écouter le passage. Le bouton passe alors à « ❚❚ Stop », un texte plus court. Sur téléphone, la ligne des deux boutons tient soudain sur une seule ligne, et la forme d'onde remonte d'environ 40 px sous le doigt. Le doigt posé sur le bouton rond du curseur tombait alors sur la poignée de début, ce qui déplaçait le passage.

**Ce qui est corrigé** :
- `src/theme.css` : sur téléphone, « Écouter » et « Écouter le passage » prennent chacun une ligne entière. La forme d'onde ne bouge plus quand le texte change.
- `src/app.js` : le bouton rond du curseur est cherché là où il est dessiné (il avance pendant la lecture), et non plus là où on l'avait posé.

## Tests
- `son_passage` : 86/86 (avant la correction : 78/86 sur main).
- `suite_clarity_ui` 24/24, `ou_est_ton_son_ui` 23/23.
- Serveur : `node tests/backend/run.mjs` 138/138. Le nouveau test vérifie :
  - quelqu'un de déconnecté, ou un compte ordinaire, ne voit pas TikTok ;
  - le testeur listé voit TikTok ;
  - un compte qui a déjà relié TikTok le voit ;
  - avec `TIKTOK_PUBLIC = "1"`, tout le monde le voit.
- App : `tiktok_ui` 224/224 (ce test simule la config, donc il est inchangé).

## À prévenir
- **Comptes** : `functions/` touché (`socialVisible` dans `social.js`, `config(env, social)` dans `router.js`), plus 2 variables dans `wrangler.toml`.
- **Propriétaire** : remplir `TIKTOK_TESTERS` avec l'e-mail du compte Stalak qui tourne la démo.
