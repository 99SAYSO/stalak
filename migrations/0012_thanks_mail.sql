-- 0012 : e-mail de remerciement après un nouvel abonnement (demande du propriétaire du 5/11).
-- thanked_at : quand le remerciement est parti (ms) ; une seule fois par compte, même après un réabonnement.
-- Les clients qui ont déjà un abonnement réel (les 3 premiers, à qui le propriétaire écrit lui-même) sont marqués tout de suite :
-- ils ne le recevront jamais.
ALTER TABLE users ADD COLUMN thanked_at INTEGER;
UPDATE users SET thanked_at = CAST(strftime('%s', 'now') AS INTEGER) * 1000
  WHERE id IN (SELECT user_id FROM subscriptions WHERE env = 'production' AND user_id IS NOT NULL);
