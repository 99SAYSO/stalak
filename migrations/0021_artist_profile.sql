-- 0021 : réponses de l'onboarding (refonte mobile, point 13) et auditeurs mensuels donnés chaque semaine par l'artiste
-- (« Stats ») ; Comptes, 23/11. Les deux partent avec le compte (suppression).
CREATE TABLE IF NOT EXISTS artist_profiles (
  user_id TEXT PRIMARY KEY,
  artist_name TEXT,
  genres TEXT,              -- liste JSON : rap, drill, chant, autre
  on_platforms INTEGER,     -- 1 déjà en ligne, 0 pas encore, NULL pas répondu
  spotify_url TEXT,
  apple_music_url TEXT,
  soundcloud_url TEXT,
  instagram_url TEXT,
  listeners_now TEXT,       -- lt100 | 100_1k | 1k_10k | gt10k (ce que l'artiste dit)
  posts_on TEXT,            -- liste JSON : tiktok, reels, shorts
  blockers TEXT,            -- liste JSON : few_views, editing_time, no_ideas
  listeners_goal TEXT,      -- 1k | 10k | 100k | 1m
  goals TEXT,               -- liste JSON : song_launch, post_more, fill_concerts
  answered_at INTEGER,      -- 1re réponse
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS listener_counts (
  user_id TEXT NOT NULL,
  week TEXT NOT NULL,       -- semaine ISO « 2026-W48 »
  platform TEXT NOT NULL DEFAULT 'spotify',
  listeners INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, week, platform)
);
