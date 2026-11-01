-- Stalak: the new owner's dashboard (1/11/2026): where accounts are made and visits come from, by country.
-- Paste it all once in the D1 console (database "stalak"), BEFORE publishing the version that uses it.
-- It only adds empty columns: nothing existing is changed or deleted.
-- Only the COUNTRY given by Cloudflare is kept (2 letters, e.g. US, FR); never the IP address nor the city.

-- the account: country and kind of device at sign-up, and how it was made (email, google, apple, microsoft)
ALTER TABLE users ADD COLUMN country TEXT;
ALTER TABLE users ADD COLUMN device TEXT;
ALTER TABLE users ADD COLUMN signup_method TEXT;

-- a visit: country, kind of device, where it comes from (?ref= or the site that sent it), and whether this browser
-- came on an earlier day (a yes/no told by the page, no identifier)
ALTER TABLE visits ADD COLUMN country TEXT;
ALTER TABLE visits ADD COLUMN device TEXT;
ALTER TABLE visits ADD COLUMN source TEXT;
ALTER TABLE visits ADD COLUMN came_back INTEGER;
