-- 0020 : essai gratuit de 7 jours de Stalak Pro (décision du propriétaire du 23/11). (0019 a servi à la « vidéo offerte »,
-- annulée : sa colonne users.free_nowm_at reste en base, inutilisée.)
-- users.trial_used_at : quand ce compte a commencé son essai (une seule fois par compte).
ALTER TABLE users ADD COLUMN trial_used_at INTEGER;
-- subscriptions : début et fin de l'essai (ms), ce qu'il est devenu ('paid' devenu payant, 'canceled' annulé pendant
-- l'essai, 'failed' 1er prélèvement raté, 'refused' essai refusé par le serveur car le compte y avait déjà eu droit),
-- et quand l'e-mail de rappel (2 jours avant le 1er prélèvement) est parti.
ALTER TABLE subscriptions ADD COLUMN trial_started_at INTEGER;
ALTER TABLE subscriptions ADD COLUMN trial_ends_at INTEGER;
ALTER TABLE subscriptions ADD COLUMN trial_result TEXT;
ALTER TABLE subscriptions ADD COLUMN trial_reminded_at INTEGER;
CREATE INDEX IF NOT EXISTS subscriptions_trial ON subscriptions(trial_ends_at) WHERE trial_ends_at IS NOT NULL;
