-- 0015 : « Combien de vidéos par personne » (demande du propriétaire du 5/11, pour décider d'une limite en gratuit).
-- Par jour et par numéro de visite au hasard (vid : créé par la page à chaque ouverture, sans cookie, déjà envoyé pour les
-- visites) : combien de vidéos exportées (export_ok) et de vidéos propres via la pub (ad_ok), et si c'est un iPhone / iPad.
-- Ni compte, ni e-mail, ni adresse IP. Effacé après 90 jours (comme les visites).
CREATE TABLE IF NOT EXISTS video_counts (
  day  TEXT NOT NULL,                    -- AAAA-MM-JJ (UTC)
  vid  TEXT NOT NULL,                    -- 24 caractères hexadécimaux au hasard
  name TEXT NOT NULL,                    -- 'export_ok' | 'ad_ok'
  n    INTEGER NOT NULL DEFAULT 0,
  ios  INTEGER NOT NULL DEFAULT 0,       -- 1 = iPhone / iPad
  PRIMARY KEY (day, vid, name)
);
