-- 0023 : « Stats » et analyse de l'artiste (Comptes, 24/11, docs/handoff/chef-stats-analyse.md).
-- Profil : le genre en texte libre quand « Autre » est choisi, les liens TikTok et YouTube.
ALTER TABLE artist_profiles ADD COLUMN genre_other TEXT;
ALTER TABLE artist_profiles ADD COLUMN tiktok_url TEXT;
ALTER TABLE artist_profiles ADD COLUMN youtube_url TEXT;

-- Sorties Spotify (albums et singles), lues par l'API officielle de Spotify (GET /artists/{id}/albums). Données publiques.
CREATE TABLE IF NOT EXISTS spotify_releases (
  user_id        TEXT NOT NULL,
  release_id     TEXT NOT NULL,
  name           TEXT,
  kind           TEXT,           -- album | single | compilation
  release_date   TEXT,           -- « 2026-10-23 », ou « 2026-10 », ou « 2026 » (voir date_precision)
  date_precision TEXT,           -- day | month | year
  total_tracks   INTEGER,
  first_seen_at  INTEGER NOT NULL,
  PRIMARY KEY (user_id, release_id)
);
-- Relevé de la page publique de l'artiste (robot Apify), une fois par semaine : auditeurs mensuels, abonnés, villes.
CREATE TABLE IF NOT EXISTS spotify_snapshots (
  user_id           TEXT NOT NULL,
  week              TEXT NOT NULL,   -- semaine ISO « 2026-W48 »
  fetched_at        INTEGER NOT NULL,
  monthly_listeners INTEGER,
  followers         INTEGER,
  world_rank        INTEGER,
  top_cities        TEXT,            -- JSON [{city, country, listeners}] (5 au plus)
  PRIMARY KEY (user_id, week)
);
-- Écoutes de chaque son (robot Apify, 1 lien par sortie), une fois par mois ou à une nouvelle sortie.
-- stream_count = 0 veut dire « moins de 1 000 écoutes » pour Spotify : jamais affiché « 0 ».
CREATE TABLE IF NOT EXISTS spotify_track_counts (
  user_id      TEXT NOT NULL,
  month        TEXT NOT NULL,        -- « 2026-11 »
  track_id     TEXT NOT NULL,
  release_id   TEXT,
  name         TEXT,
  stream_count INTEGER,
  fetched_at   INTEGER NOT NULL,
  PRIMARY KEY (user_id, month, track_id)
);
-- Où en est chaque artiste (dates des derniers relevés, dernière erreur)
CREATE TABLE IF NOT EXISTS spotify_sync (
  user_id         TEXT PRIMARY KEY,
  artist_id       TEXT,
  releases_at     INTEGER,
  releases_error  TEXT,
  artist_at       INTEGER,           -- dernier relevé réussi de l'artiste
  artist_try_at   INTEGER,           -- dernier essai
  artist_error    TEXT,
  artist_fails    INTEGER NOT NULL DEFAULT 0,
  tracks_month    TEXT,              -- mois du dernier relevé des sons réussi
  tracks_try_at   INTEGER,
  tracks_error    TEXT,
  tracks_due      INTEGER NOT NULL DEFAULT 0  -- 1 : une nouvelle sortie, relever ses sons sans attendre le mois suivant
);
-- Le robot en général : relevés ratés de suite (alerte au propriétaire à 2), dernière alerte
CREATE TABLE IF NOT EXISTS robot_state (
  name       TEXT PRIMARY KEY,
  fails      INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  last_ok_at INTEGER,
  alerted_at INTEGER
);
