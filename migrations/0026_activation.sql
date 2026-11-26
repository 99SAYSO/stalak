-- 0026 : « le wow en moins d'une minute » et « Where did you hear about Stalak? » (Comptes, 26/11 ;
-- docs/handoff/chef-activation-rapide.md points 6-7, docs/handoff/chef-question-source.md).

-- 1. La réponse à « Comment tu as connu Stalak ? » (une fois, sur le compte). heard_from : chatgpt | google | other_ai | tiktok |
--    instagram | youtube | friend | other | skip ; heard_text : le petit champ libre de « Other » (60 caractères au plus).
ALTER TABLE users ADD COLUMN heard_from TEXT;
ALTER TABLE users ADD COLUMN heard_text TEXT;
ALTER TABLE users ADD COLUMN heard_at INTEGER;

-- 2. La relance d'un projet pas fini : seulement si le compte a accepté les e-mails de conseils (case non cochée d'avance), et
--    une seule fois par compte. email_tips : 1 accepté, 0 refusé ou désinscrit, NULL jamais demandé ; email_tips_text : la
--    version du texte accepté (preuve) ; nudged_at : la relance est partie.
ALTER TABLE users ADD COLUMN email_tips INTEGER;
ALTER TABLE users ADD COLUMN email_tips_at INTEGER;
ALTER TABLE users ADD COLUMN email_tips_text TEXT;
ALTER TABLE users ADD COLUMN nudged_at INTEGER;

-- 3. L'entonnoir par étape, anonyme : chaque étape comptée une fois par visite (le numéro de visite au hasard de la page,
--    jamais le compte), et le temps jusqu'au « wow » (1re prévisualisation du montage), en secondes, par appareil.
--    Effacés au bout de 90 jours.
CREATE TABLE IF NOT EXISTS step_visits (
  day  TEXT NOT NULL,
  vid  TEXT NOT NULL,
  step TEXT NOT NULL,
  PRIMARY KEY (day, vid, step)
);
CREATE TABLE IF NOT EXISTS wow_times (
  day    TEXT NOT NULL,
  device TEXT NOT NULL,     -- ios | android | desktop
  secs   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_wow_times_day ON wow_times (day);
