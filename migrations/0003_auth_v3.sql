-- Stalak: accounts v3 (sign up with e-mail + password, code for new devices, Google / Apple / Microsoft sign-in).
-- Paste this file in the D1 console of the Cloudflare dashboard (after 0001 and 0002), or:
--   npx wrangler d1 migrations apply stalak --remote
-- Run it once, BEFORE publishing the version that uses it.

-- When the e-mail address was proven (code received, or a Google / Apple / Microsoft account with a verified address).
ALTER TABLE users ADD COLUMN email_verified_at INTEGER;
-- every account made so far signed in with an e-mail code: its address is verified
UPDATE users SET email_verified_at = COALESCE(last_login_at, created_at) WHERE email_verified_at IS NULL;

-- Pending 6-digit codes, one per e-mail and purpose: 'signup' (confirm the address), 'login' (new device), 'reset' (forgot password).
-- Stored hashed. `data` = JSON kept until the code is used (signup: password hash, pseudo; login: user id).
CREATE TABLE IF NOT EXISTS auth_codes (
  email      TEXT NOT NULL,
  purpose    TEXT NOT NULL,
  code_hash  TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts   INTEGER NOT NULL DEFAULT 0,
  data       TEXT,
  lang       TEXT,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (email, purpose)
);

-- Browsers where a user already typed a code: no code asked there for 90 days.
-- The cookie stalak_d holds a random token; only its SHA-256 is stored. One browser may be trusted for several users.
CREATE TABLE IF NOT EXISTS trusted_devices (
  token_hash   TEXT NOT NULL,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   INTEGER NOT NULL,
  last_used_at INTEGER NOT NULL,
  expires_at   INTEGER NOT NULL,
  PRIMARY KEY (token_hash, user_id)
);
CREATE INDEX IF NOT EXISTS trusted_devices_user ON trusted_devices(user_id);

-- Google / Apple / Microsoft accounts linked to a Stalak account.
CREATE TABLE IF NOT EXISTS identities (
  provider      TEXT NOT NULL,              -- 'google' | 'apple' | 'microsoft'
  subject       TEXT NOT NULL,              -- the provider's stable user id ("sub")
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email         TEXT,                       -- address given by the provider (Apple: maybe a private relay address)
  created_at    INTEGER NOT NULL,
  last_login_at INTEGER,
  UNIQUE (provider, subject)
);
CREATE INDEX IF NOT EXISTS identities_user ON identities(user_id);

-- Sign-ins with Google / Apple / Microsoft in progress (10 minutes): state, nonce, PKCE verifier, where to go back.
CREATE TABLE IF NOT EXISTS oauth_states (
  state_hash  TEXT PRIMARY KEY,             -- SHA-256 of the state sent to the provider
  provider    TEXT NOT NULL,
  nonce       TEXT NOT NULL,
  verifier    TEXT,                         -- PKCE code_verifier (none for Apple, which does not take it)
  binding     TEXT NOT NULL,                -- SHA-256 of the stalak_o cookie: the callback must come from the same browser
  return_to   TEXT NOT NULL,
  lang        TEXT,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);
