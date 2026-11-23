-- 0019 : « 1re vidéo sans filigrane offerte » (décision du propriétaire du 23/11).
-- free_nowm_at : quand le compte gratuit a pris sa vidéo offerte (ms) ; NULL = pas encore prise.
-- Tant que le compte existe, rien d'autre n'est gardé. À la suppression d'un compte qui l'a prise : une ligne
-- « freevideo:<HMAC de l'adresse avec AUTH_SECRET> » dans webhook_events, effacée 12 mois après : rien à créer ici.
ALTER TABLE users ADD COLUMN free_nowm_at INTEGER;
CREATE INDEX IF NOT EXISTS users_free_nowm ON users(free_nowm_at) WHERE free_nowm_at IS NOT NULL;
