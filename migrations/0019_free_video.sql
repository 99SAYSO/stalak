-- 0019 : « 1re vidéo sans filigrane offerte » (décision du propriétaire du 23/11).
-- free_nowm_at : quand le compte gratuit a pris sa vidéo offerte (ms) ; NULL = pas encore prise.
-- La trace anonyme de l'adresse (pour qu'un compte supprimé puis recréé n'y ait pas droit une 2e fois) est une ligne
-- « freevideo:<empreinte de l'e-mail> » dans webhook_events, comme pour l'e-mail de remerciement : rien à créer ici.
ALTER TABLE users ADD COLUMN free_nowm_at INTEGER;
CREATE INDEX IF NOT EXISTS users_free_nowm ON users(free_nowm_at) WHERE free_nowm_at IS NOT NULL;
