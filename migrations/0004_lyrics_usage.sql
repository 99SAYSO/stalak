-- Stalak: « Paroles automatiques » (Stalak Pro) — daily use of the automatic lyrics transcription, per account.
-- Each POST /api/lyrics/transcribe (one piece of ≤ 30 s of audio) adds its seconds; the first piece of a transcription adds a job.
-- Limits (functions/_lib/lyrics.js): 20 transcriptions and 90 minutes of audio per account per UTC day.
-- No audio and no lyrics are stored. Rows go with the account (ON DELETE CASCADE).
CREATE TABLE IF NOT EXISTS lyrics_usage (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day        TEXT NOT NULL,                -- 'YYYY-MM-DD' (UTC)
  jobs       INTEGER NOT NULL DEFAULT 0,   -- transcriptions started
  pieces     INTEGER NOT NULL DEFAULT 0,   -- requests (pieces of audio) transcribed
  seconds    REAL NOT NULL DEFAULT 0,      -- audio seconds sent to Workers AI
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, day)
);
