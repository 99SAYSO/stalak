-- 0024 : premier test d'acquisition payante (Comptes, 25/11, docs/handoff/chef-test-acquisition-payante.md).
-- La source d'un paiement : d'où ce navigateur est venu la première fois (« ref:ttads », « ref:<influenceur> »…),
-- envoyée par la page avec le paiement (Paddle customData.src) ; un total anonyme par source au tableau de bord.
ALTER TABLE payments ADD COLUMN source TEXT;
-- Les liens suivis par la carte « Test payant », et l'argent dépensé pour chacun, saisi à la main par le propriétaire.
CREATE TABLE IF NOT EXISTS paid_tests (
  ref         TEXT PRIMARY KEY,        -- le code du lien ?ref= (« ttads », « inf-nom »)
  label       TEXT,                    -- « Pubs TikTok US », « @nom »
  spent_cents INTEGER NOT NULL DEFAULT 0,   -- dépensé en tout pour ce lien, en centimes d'euro
  started_on  TEXT NOT NULL,           -- AAAA-MM-JJ : les chiffres comptent à partir de ce jour
  updated_at  INTEGER NOT NULL
);
