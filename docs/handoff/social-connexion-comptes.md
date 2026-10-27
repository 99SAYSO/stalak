Statut : PRÊT
Branche : social/connexion-comptes

## Résumé
Connexion des comptes TikTok et Instagram côté serveur (rôle 4, Réseaux sociaux). Rien de visible dans l'app pour l'instant :
la fonction reste éteinte (`SOCIAL_CONNECT_ENABLED = "0"` dans `wrangler.toml`, non modifié).
- Relier / délier un compte : `/api/connect`, `/api/connect/{tiktok,instagram}/{start,callback}`, `DELETE /api/connect/{tiktok,instagram}`.
- Jetons rangés chiffrés (AES-GCM, secret `SOCIAL_TOKEN_KEY`), renouvelés automatiquement (`socialAccessToken`, pour l'étape « Publier »).
- Appels de Meta signés : `POST /api/connect/instagram/{deauthorize,data-deletion}`, page de suivi `GET /api/connect/instagram/deletion`.
- `/api/config` : nouvelle clé `features.social` (réseaux disponibles ; `[]` tant que c'est éteint).
- Suppression d'un compte Stalak : comptes reliés effacés et jeton TikTok révoqué (sans erreur si la migration manque).

## Fichiers touchés
- `functions/_lib/social.js` (réécrit, domaine Réseaux sociaux)
- `functions/_lib/router.js` (fichier partagé, 5 lignes : import, `features.social`, routes Meta avant le contrôle CSRF, `/api/connect`, suppression du compte)
- `migrations/0005_social_accounts.sql` (nouveau)
- `tests/backend/run.mjs` (faux TikTok / Instagram + 7 tests ; l'ancien test des ébauches est remplacé)
- `BACKEND.md` (tableau des routes), `docs/STATUS.md` (section Réseaux sociaux, D1)
- `docs/SOCIAL_SETUP.md` (liste pour le propriétaire), `docs/appsec-review-social-connect.md` (revue sécurité)

## Migration SQL
À lancer dans la console D1 **avant** la fusion (`migrations/0005_social_accounts.sql`) :

```sql
CREATE TABLE IF NOT EXISTS social_accounts (
  user_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider           TEXT NOT NULL,              -- 'tiktok' | 'instagram'
  account_id         TEXT NOT NULL,              -- TikTok open_id / Instagram professional account id (IG_ID, used to publish)
  app_user_id        TEXT,                       -- Instagram: the id given to our app only (Meta's deletion requests may use it)
  username           TEXT,                       -- Instagram @name (TikTok: none without the user.info.profile scope)
  display_name       TEXT,
  avatar_url         TEXT,                       -- link to the photo at TikTok / Instagram (it expires after a while)
  account_type       TEXT,                       -- Instagram: 'BUSINESS' | 'MEDIA_CREATOR'
  scopes             TEXT,                       -- permissions the person granted, comma-separated
  access_token_enc   TEXT NOT NULL,
  access_expires_at  INTEGER NOT NULL,
  refresh_token_enc  TEXT,                       -- TikTok only (Instagram refreshes the access token itself)
  refresh_expires_at INTEGER,
  status             TEXT NOT NULL DEFAULT 'ok', -- 'ok' | 'expired' (must connect again)
  created_at         INTEGER NOT NULL,
  updated_at         INTEGER NOT NULL,
  refreshed_at       INTEGER,
  PRIMARY KEY (user_id, provider)
);
CREATE INDEX IF NOT EXISTS social_accounts_account ON social_accounts(provider, account_id);
CREATE TABLE IF NOT EXISTS social_states (
  state_hash  TEXT PRIMARY KEY,             -- SHA-256 of the state
  provider    TEXT NOT NULL,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  binding     TEXT NOT NULL,                -- SHA-256 of the stalak_c cookie: the callback must come from the same browser
  return_to   TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);
```

## Tests
- `node tests/backend/run.mjs` : 55/55 (dont 7 nouveaux tests « social »).
- `node --check src/app.js` : OK ; `python3 build.py` : OK.
- Aucun fichier de `src/` ni de `site_src/` modifié : pas besoin de reconstruire `public/`, pas de changement d'affichage.
- Skills utilisés : `context7` (doc officielle TikTok / Meta), `appsec-review`.

## Reste au propriétaire
- Créer les applis TikTok et Meta en suivant `docs/SOCIAL_SETUP.md`.
- Saisir 5 secrets dans Cloudflare (type Secret) : `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `SOCIAL_TOKEN_KEY`.
- Décider : publication directe réservée à Stalak Pro ou ouverte à tous ?

## Pour le Chef de projet
- Fusion sans risque même avant les secrets : tout `/api/connect…` répond `404 not_enabled`.
- Ne passer `SOCIAL_CONNECT_ENABLED` à `"1"` qu'au premier test avec les comptes testeurs (les secrets doivent être en place).
