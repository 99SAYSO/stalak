-- 0013 : vue « Heure par heure » du tableau de bord (demande du propriétaire du 5/11).
-- Les visites, les comptes et les abonnements ont déjà leur heure ; les exports de vidéos n'avaient qu'un total par jour.
-- Ici : un compteur par heure (heure UTC, comptée depuis 1970) et par nom ; seulement « export_ok » (une vidéo exportée).
-- Anonyme comme daily_counts : ni compte, ni IP, ni appareil. Effacé après 90 jours (comme les visites).
CREATE TABLE IF NOT EXISTS hourly_counts (
  hour INTEGER NOT NULL,                 -- Math.floor(ms / 3600000), en UTC
  name TEXT NOT NULL,
  n    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (hour, name)
);
