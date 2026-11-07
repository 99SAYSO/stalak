-- 0017 : rapport du 7/11 — e-mails donnés librement par les gratuits à la fin d'une vidéo (« Reçois des conseils pour tes
-- prochaines vidéos par e-mail »), avec leur accord : case non cochée, puis confirmation par un lien reçu par e-mail
-- (double confirmation). Rien d'autre sur la personne (ni compte, ni provenance, ni pays, ni adresse IP).
-- consent : la version du texte accepté (preuve de l'accord) ; confirmed_at : quand le lien a été touché.
-- Non confirmée après 7 jours : effacée. Désinscription : la ligne est effacée. Sans désinscription : effacée 3 ans après
-- la confirmation (recommandation CNIL pour les prospects).
CREATE TABLE IF NOT EXISTS email_optins (
  id           TEXT PRIMARY KEY,
  email        TEXT NOT NULL UNIQUE,
  lang         TEXT NOT NULL DEFAULT 'en',
  consent      TEXT NOT NULL,
  token_hash   TEXT NOT NULL,
  created_at   INTEGER NOT NULL,
  confirmed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_email_optins_token ON email_optins (token_hash);
