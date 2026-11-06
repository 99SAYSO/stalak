-- 0016 : audit du 6/11, point 12. L'e-mail de remerciement part ~3 h après l'achat (envoi programmé chez Resend) :
-- on garde son numéro chez Resend pour l'annuler si le compte est supprimé avant l'envoi.
-- (Numéro 0016 : 0014 est pris par compte/provenance-ue, 0015 par les vidéos par personne.)
ALTER TABLE users ADD COLUMN thanks_mail_id TEXT;
