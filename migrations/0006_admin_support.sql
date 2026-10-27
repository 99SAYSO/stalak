-- Stalak: the owner's dashboard (admin.stalak.app) and « Parler à un humain » (support tickets from the help ice cube).
-- Paste all of it once in the D1 console (database "stalak"), BEFORE publishing the version that uses it.

-- Payments and refunds sent by Paddle (webhooks transaction.completed, adjustment.created / adjustment.updated), for the revenue.
-- Amounts in the currency's smallest unit (cents), as Paddle sends them.
CREATE TABLE IF NOT EXISTS payments (
  id              TEXT PRIMARY KEY,      -- txn_...
  user_id         TEXT,                  -- the Stalak account, if known (no foreign key: the payment stays when the account goes)
  subscription_id TEXT,                  -- sub_...
  price_id        TEXT,                  -- pri_... (month or year)
  origin          TEXT,                  -- web (first payment) | subscription_recurring (renewal) | api ...
  currency        TEXT NOT NULL,         -- EUR, USD ...
  total           INTEGER NOT NULL,      -- grand total, tax included
  tax             INTEGER NOT NULL DEFAULT 0,
  earnings        INTEGER,               -- what Paddle pays out (after tax and fee); NULL until Paddle has computed it
  billed_at       INTEGER NOT NULL,      -- ms
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS payments_billed ON payments(billed_at);

CREATE TABLE IF NOT EXISTS refunds (
  id             TEXT PRIMARY KEY,       -- adj_...
  transaction_id TEXT,                   -- txn_...
  action         TEXT NOT NULL,          -- refund | chargeback | credit ...
  status         TEXT NOT NULL,          -- pending_approval | approved | rejected | reversed
  currency       TEXT,
  total          INTEGER NOT NULL DEFAULT 0,
  last_event_at  INTEGER NOT NULL,       -- occurred_at of the last applied event (ordering guard)
  created_at     INTEGER NOT NULL
);

-- Visits: one row per page load and per day (a random number made by the page, no cookie, no IP), updated about once a minute
-- while the page is open. "Live" = seen in the last 2 minutes. Rows older than 90 days are deleted.
CREATE TABLE IF NOT EXISTS visits (
  day      TEXT NOT NULL,                -- 'YYYY-MM-DD' (UTC)
  vid      TEXT NOT NULL,                -- random, made by the page at load time
  first_at INTEGER NOT NULL,
  last_at  INTEGER NOT NULL,
  lang     TEXT,                         -- fr | en
  PRIMARY KEY (day, vid)
);

-- Daily counters of the features: help_q (questions answered by the help assistant), help_fail, cloud_save, ticket, ticket_msg.
CREATE TABLE IF NOT EXISTS daily_counts (
  day  TEXT NOT NULL,
  name TEXT NOT NULL,
  n    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, name)
);

-- « Parler à un humain »: a ticket and its messages. The visitor holds a random token (only its SHA-256 is here).
-- Deleted with the account, or 6 months after the last message.
CREATE TABLE IF NOT EXISTS tickets (
  id            TEXT PRIMARY KEY,
  token_hash    TEXT NOT NULL,
  user_id       TEXT,                    -- the account, if the visitor was signed in
  email         TEXT,                    -- where to send the answers when the visitor is gone
  lang          TEXT NOT NULL DEFAULT 'fr',
  status        TEXT NOT NULL DEFAULT 'open',   -- open | closed
  context       TEXT,                    -- what the page showed (step, messages, browser), for the owner
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,        -- last message
  user_seen_at  INTEGER,                 -- last time the visitor's page asked for news (live or not)
  admin_read_at INTEGER,                 -- last time the owner opened it
  notified_at   INTEGER                  -- last e-mail sent to the owner about it
);
CREATE INDEX IF NOT EXISTS tickets_updated ON tickets(updated_at);
CREATE INDEX IF NOT EXISTS tickets_user ON tickets(user_id);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id  TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender     TEXT NOT NULL,              -- user | admin
  body       TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  emailed_at INTEGER                     -- the owner's answer sent by e-mail (the visitor was not there)
);
CREATE INDEX IF NOT EXISTS ticket_messages_ticket ON ticket_messages(ticket_id, id);

-- Small settings of the dashboard: available ('1' | '0', « je suis disponible »), admin_seen (ms, the dashboard is open).
CREATE TABLE IF NOT EXISTS admin_state (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
