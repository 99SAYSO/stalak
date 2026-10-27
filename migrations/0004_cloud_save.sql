-- Stalak: online saving with media (Stalak Pro). The song and the takes of a saved project go to Cloudflare R2
-- (bucket stalak-media, binding MEDIA); their list, sizes and the upload progress are kept here.
-- Paste this file in the D1 console of the Cloudflare dashboard (after 0001 to 0003), or:
--   npx wrangler d1 migrations apply stalak --remote
-- Run it once, BEFORE publishing the version that uses it. Existing saved projects keep working.

-- the 6-month rule: when the project was last opened (or saved), and when its owner was warned by e-mail
ALTER TABLE projects ADD COLUMN opened_at INTEGER;
ALTER TABLE projects ADD COLUMN warned_at INTEGER;
-- total size of the project's media files in R2 (bytes); `size` stays the size of the JSON state
ALTER TABLE projects ADD COLUMN media_bytes INTEGER NOT NULL DEFAULT 0;
UPDATE projects SET opened_at = updated_at WHERE opened_at IS NULL;
CREATE INDEX IF NOT EXISTS projects_opened ON projects(opened_at);

-- One row per media file of a project. R2 key: u/<user_id>/p/<project_id>/<id>.
-- `size` is reserved in the 20 GB quota as soon as the upload starts.
CREATE TABLE IF NOT EXISTS project_files (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  id         TEXT NOT NULL,                -- chosen by the app: a fingerprint of the file (same file = same id: not sent twice)
  name       TEXT NOT NULL,
  type       TEXT NOT NULL,                -- audio/* or video/* (or application/octet-stream)
  size       INTEGER NOT NULL,             -- bytes
  status     TEXT NOT NULL,                -- 'uploading' | 'ready'
  upload_id  TEXT,                         -- R2 multipart upload id while a big file is being sent
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, project_id, id)
);
CREATE INDEX IF NOT EXISTS project_files_status ON project_files(status, updated_at);

-- The parts of a multipart upload already received (R2 needs their etags to finish it).
CREATE TABLE IF NOT EXISTS file_parts (
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id  TEXT NOT NULL,
  file_id     TEXT NOT NULL,
  part_number INTEGER NOT NULL,
  etag        TEXT NOT NULL,
  size        INTEGER NOT NULL,
  created_at  INTEGER NOT NULL,
  PRIMARY KEY (user_id, project_id, file_id, part_number)
);
