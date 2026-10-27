-- Stalak: initial schema (Cloudflare D1 / SQLite).
-- Apply with:  npx wrangler d1 migrations apply stalak --remote
-- or paste this file in the D1 console of the Cloudflare dashboard.
-- All timestamps are Unix milliseconds (INTEGER).

CREATE TABLE IF NOT EXISTS users (
  id                 TEXT PRIMARY KEY,           -- random id, also sent to Paddle as customData.user_id
  email              TEXT NOT NULL UNIQUE,       -- lower-cased
  lang               TEXT NOT NULL DEFAULT 'fr', -- 'fr' | 'en'
  paddle_customer_id TEXT,                       -- ctm_...
  created_at         INTEGER NOT NULL,
  last_login_at      INTEGER
);
CREATE INDEX IF NOT EXISTS users_paddle_customer ON users(paddle_customer_id);

-- One pending login code per email. Codes are stored hashed, never in clear.
CREATE TABLE IF NOT EXISTS login_codes (
  email      TEXT PRIMARY KEY,
  code_hash  TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts   INTEGER NOT NULL DEFAULT 0,
  lang       TEXT,                        -- language asked at send time, copied to the user
  created_at INTEGER NOT NULL
);

-- Sessions: only the SHA-256 of the cookie token is stored.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

-- Fixed-window counters for rate limiting (keys contain hashed emails / IPs).
CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count        INTEGER NOT NULL
);

-- Paddle Billing subscriptions, as last reported by webhooks.
CREATE TABLE IF NOT EXISTS subscriptions (
  id                   TEXT PRIMARY KEY,   -- sub_...
  user_id              TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_id          TEXT,               -- ctm_...
  status               TEXT NOT NULL,      -- active | trialing | past_due | paused | canceled
  price_id             TEXT,               -- pri_...
  current_period_end   INTEGER,            -- end of the paid period (ms)
  cancel_at            INTEGER,            -- scheduled cancellation date (ms), if any
  last_event_at        INTEGER NOT NULL,   -- occurred_at of the last applied event (ordering guard)
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_customer ON subscriptions(customer_id);

-- Webhook idempotency: Paddle may deliver the same event more than once.
CREATE TABLE IF NOT EXISTS webhook_events (
  event_id    TEXT PRIMARY KEY,   -- evt_...
  event_type  TEXT NOT NULL,
  received_at INTEGER NOT NULL
);

-- Online project saves (Pro). JSON state only, media files are not uploaded.
CREATE TABLE IF NOT EXISTS projects (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id         TEXT NOT NULL,
  name       TEXT NOT NULL DEFAULT '',
  data       TEXT NOT NULL,
  size       INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, id)
);
