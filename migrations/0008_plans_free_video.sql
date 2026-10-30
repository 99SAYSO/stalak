-- Stalak: offer of 30/10/2026 (Gratuit 1 video a day + Basic / Pro / Max).
-- Paste it all once in the D1 console (database "stalak"), BEFORE publishing the version that uses it.
-- It only adds columns (empty for the existing rows) and a table: nothing existing is changed.

-- The plan of a subscription, set by the Paddle webhook from the price: basic / pro / max.
-- NULL for the subscriptions of the first offer: they count as Pro (a subscriber keeps his price and his plan).
ALTER TABLE subscriptions ADD COLUMN plan TEXT;
-- A move to a smaller plan takes effect at the next renewal (conditions of sale): the plan paid for is kept until then.
ALTER TABLE subscriptions ADD COLUMN keep_plan TEXT;
ALTER TABLE subscriptions ADD COLUMN keep_until INTEGER;

-- Reminder e-mail « Ta vidéo gratuite du jour est disponible »: 1 = the person ticked the box (sign-up or account).
ALTER TABLE users ADD COLUMN reminders INTEGER NOT NULL DEFAULT 0;
-- Proof of that consent: {"at": ms, "text": the exact words of the box, "lang": "fr"|"en", "from": "signup"|"account"}.
ALTER TABLE users ADD COLUMN reminders_proof TEXT;
-- Last visit of the site while signed in (at most one write per hour): reminders stop after 7 days without a visit.
ALTER TABLE users ADD COLUMN last_seen_at INTEGER;
-- Paris day (YYYY-MM-DD) of the last reminder sent: at most 1 a day.
ALTER TABLE users ADD COLUMN reminder_day TEXT;
-- Random key of the unsubscribe link in the reminders (made with the first reminder).
ALTER TABLE users ADD COLUMN reminder_key TEXT;

-- The free video of the day: one row per account and per Paris day (the day starts at midnight, Paris time).
-- video = the id of the video the « jeton du jour » was given for (the same video may be exported again that day).
CREATE TABLE IF NOT EXISTS free_videos (
  user_id TEXT NOT NULL,
  day TEXT NOT NULL,
  video TEXT NOT NULL,
  token TEXT NOT NULL,              -- the « jeton du jour » given for that video (random)
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, day)
);
CREATE INDEX IF NOT EXISTS free_videos_day ON free_videos(day);
