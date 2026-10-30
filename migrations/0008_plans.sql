-- Stalak: offer of 30/10/2026 (evening): Gratuit + Stalak Pro + Stalak Creator Plus.
-- Paste it all once in the D1 console (database "stalak"), BEFORE publishing the version that uses it.
-- It only adds empty columns: nothing existing is changed.

-- The plan of a subscription, set by the Paddle webhook from the price: pro / creator.
-- NULL for the subscriptions from before: they count from their price (the first Stalak Pro stays Pro, its price kept).
ALTER TABLE subscriptions ADD COLUMN plan TEXT;
-- A move to a smaller plan (Creator Plus → Pro) takes effect at the next renewal (conditions of sale): the plan paid for
-- is kept until then.
ALTER TABLE subscriptions ADD COLUMN keep_plan TEXT;
ALTER TABLE subscriptions ADD COLUMN keep_until INTEGER;
