-- Stalak: audit of 30/10/2026 (Comptes, paiements & serveur).
-- Paste it all once in the D1 console (database "stalak"), BEFORE publishing the version that uses it.
-- It only adds columns: nothing existing is changed or deleted.

-- Test (Paddle sandbox) or real (production) payment: every row written until now comes from the sandbox.
-- The site then only counts the rows of the Paddle environment in use (PADDLE_ENV): when real payments start, the test
-- subscriptions stop giving a plan and leave the dashboard at once (and can be deleted, BACKEND.md step 7).
ALTER TABLE subscriptions ADD COLUMN env TEXT NOT NULL DEFAULT 'sandbox';
ALTER TABLE payments ADD COLUMN env TEXT NOT NULL DEFAULT 'sandbox';
ALTER TABLE refunds ADD COLUMN env TEXT NOT NULL DEFAULT 'sandbox';

-- Yearly reminder to monthly subscribers (US conditions of sale): when the subscription started (Paddle started_at)
-- and when the last reminder went out.
ALTER TABLE subscriptions ADD COLUMN started_at INTEGER;
ALTER TABLE subscriptions ADD COLUMN reminded_at INTEGER;
