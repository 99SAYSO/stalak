-- 0025 : suivi des essais Pro (Comptes, 26/11, docs/handoff/chef-suivi-essais.md).
-- Un compteur par compte et par jour, sans aucun contenu : combien de fois le compte a ouvert l'app connectée (« open »),
-- fini une vidéo (« export_ok ») et fini une vidéo sans filigrane (« export_nowm »), avec l'heure du premier et du dernier
-- de la journée (pour l'activation dans les 24 h). Ni titre, ni son, ni vidéo, ni adresse IP.
-- Sert seulement à la carte « Essais Pro » du tableau de bord (mesure du service, pas de publicité).
-- Effacé avec le compte, et au bout de 120 jours (le 2e mois d'abonnement après un essai tient dedans).
CREATE TABLE IF NOT EXISTS user_day_counts (
  user_id  TEXT NOT NULL,
  day      TEXT NOT NULL,               -- AAAA-MM-JJ (UTC)
  name     TEXT NOT NULL,               -- open | export_ok | export_nowm
  n        INTEGER NOT NULL DEFAULT 0,
  first_at INTEGER NOT NULL,            -- ms, premier de la journée
  last_at  INTEGER NOT NULL,            -- ms, dernier de la journée
  PRIMARY KEY (user_id, day, name)
);
CREATE INDEX IF NOT EXISTS idx_user_day_counts_day ON user_day_counts (day);
