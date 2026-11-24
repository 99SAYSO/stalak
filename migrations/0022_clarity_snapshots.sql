-- 0022 : le relevé quotidien de Microsoft Clarity pour le tableau de bord (Comptes, 24/11).
-- L'API d'export de Clarity ne donne que les 3 derniers jours et seulement 10 appels par jour : une fois par jour (jour UTC),
-- 3 appels (par appareil, par page et appareil, par canal) sont gardés ici ; le tableau de bord lit cette table, jamais l'API.
-- Que des totaux anonymes : les adresses de page sont gardées sans leur « ?… » ni « #… », aucun e-mail, IP ni identifiant de visiteur.
-- Gardé 400 jours, puis effacé par le relevé lui-même.
CREATE TABLE IF NOT EXISTS clarity_snapshots (
  day        TEXT NOT NULL,        -- jour UTC du relevé (AAAA-MM-JJ)
  kind       TEXT NOT NULL,        -- device | url_device | channel
  fetched_at INTEGER NOT NULL,     -- l'API couvre les 24 h avant cet instant
  data       TEXT NOT NULL,        -- la réponse de Clarity, nettoyée (JSON)
  PRIMARY KEY (day, kind)
);
-- les appels faits chaque jour UTC (Clarity en permet 10 par projet), et la dernière erreur
CREATE TABLE IF NOT EXISTS clarity_calls (
  day        TEXT PRIMARY KEY,
  n          INTEGER NOT NULL DEFAULT 0,
  quota      INTEGER NOT NULL DEFAULT 0,   -- 1 : Clarity a répondu 429 (limite du jour atteinte), plus d'appel ce jour-là
  last_error TEXT,                         -- auth | quota | http_<code> | network | bad_answer
  last_at    INTEGER
);
