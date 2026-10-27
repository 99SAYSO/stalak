-- Stalak: profile (display name, photo) and optional password.
-- Paste this file in the D1 console of the Cloudflare dashboard (after 0001_init.sql), or:
--   npx wrangler d1 migrations apply stalak --remote
ALTER TABLE users ADD COLUMN display_name TEXT;          -- pseudo, 2-30 characters, NULL = none
ALTER TABLE users ADD COLUMN avatar TEXT;                -- profile photo, base64 of the image bytes (<= 80 KB decoded)
ALTER TABLE users ADD COLUMN avatar_type TEXT;           -- image/jpeg | image/webp | image/png
ALTER TABLE users ADD COLUMN avatar_updated_at INTEGER;  -- ms; also the version in the photo's URL
ALTER TABLE users ADD COLUMN password_hash TEXT;         -- PBKDF2-SHA256, hex (32 bytes), NULL = no password
ALTER TABLE users ADD COLUMN password_salt TEXT;         -- hex (16 random bytes)
ALTER TABLE users ADD COLUMN password_iter INTEGER;      -- PBKDF2 iterations used for this hash
ALTER TABLE users ADD COLUMN password_set_at INTEGER;    -- ms
ALTER TABLE sessions ADD COLUMN method TEXT;             -- how the session was opened: 'code' | 'password'
