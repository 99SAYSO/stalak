-- Stalak: videos sent to TikTok from Stalak (« Publier sur TikTok », domain « Réseaux sociaux », 21/11/2026).
-- Paste this file in the D1 console of the Cloudflare dashboard, or: npx wrangler d1 migrations apply stalak --remote
-- Run it once, BEFORE publishing the version that uses it (after 0005_social_accounts).

-- One row per sending. The upload address given by TikTok is kept ENCRYPTED while the file is being sent (1 hour at most),
-- then erased. meta_json = what Stalak knows of the video (song name, passage start / end in seconds, format), so that
-- « Mes stats » (Pro) can say which passage of a song worked best, for the videos sent from Stalak only.
CREATE TABLE IF NOT EXISTS tiktok_posts (
  id              TEXT PRIMARY KEY,               -- ttp_…
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  publish_id      TEXT NOT NULL,                  -- TikTok's id of the sending (status/fetch)
  mode            TEXT NOT NULL,                  -- 'direct' (published by Stalak) | 'draft' (sent to the TikTok inbox)
  status          TEXT NOT NULL,                  -- 'uploading' | 'processing' | 'inbox' | 'published' | 'failed'
  fail_reason     TEXT,
  upload_url_enc  TEXT,                           -- NULL once the file is sent
  video_size      INTEGER NOT NULL,
  chunk_size      INTEGER NOT NULL,
  chunk_count     INTEGER NOT NULL,
  chunks_done     INTEGER NOT NULL DEFAULT 0,
  privacy         TEXT,
  post_id         TEXT,                           -- the public TikTok video id, once published and public
  creator_username TEXT,
  meta_json       TEXT,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  checked_at      INTEGER,                        -- last status/fetch (at most one every 3 s)
  expires_at      INTEGER NOT NULL                -- end of the 1-hour window of the upload address
);
CREATE INDEX IF NOT EXISTS tiktok_posts_user ON tiktok_posts(user_id, created_at);
CREATE INDEX IF NOT EXISTS tiktok_posts_post ON tiktok_posts(user_id, post_id);
