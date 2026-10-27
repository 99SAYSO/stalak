-- Stalak: TikTok and Instagram accounts linked to a Stalak account, to publish videos directly (domain « Réseaux sociaux »).
-- Paste this file in the D1 console of the Cloudflare dashboard (after 0001 to 0004), or:
--   npx wrangler d1 migrations apply stalak --remote
-- Run it once, BEFORE publishing the version that uses it.

-- One linked account per Stalak user and network. The tokens are stored ENCRYPTED (AES-GCM, key = secret SOCIAL_TOKEN_KEY).
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

-- Connections in progress (10 minutes): the state sent to TikTok / Instagram, who asked, from which browser, where to go back.
CREATE TABLE IF NOT EXISTS social_states (
  state_hash  TEXT PRIMARY KEY,             -- SHA-256 of the state
  provider    TEXT NOT NULL,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  binding     TEXT NOT NULL,                -- SHA-256 of the stalak_c cookie: the callback must come from the same browser
  return_to   TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);
