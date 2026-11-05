-- Stalak: where each new account comes from (owner's dashboard v3, 5/11/2026).
-- Paste it once in the D1 console (database "stalak") BEFORE publishing the version that uses it. Adds one empty column.
-- The value is the first way this browser came to Stalak, kept by the page until sign-up: "ref:<code>" (a ?ref= link),
-- "utm:<source>", a site kind ("tiktok", "ig", "yt", "google"…), "dir:<directory>" (alternativeto, saashub…),
-- "site:<domain>" (another site), or "direct". Never a full address, never anything about the person.
ALTER TABLE users ADD COLUMN signup_source TEXT;
