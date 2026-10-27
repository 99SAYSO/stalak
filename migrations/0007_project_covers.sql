-- Stalak: covers of the projects saved online (the Galerie). The picture itself is in R2 (u/<user>/p/<project>/cover,
-- about 300 px wide, 64 KB at most), deleted with the project, the account and the 6-month rule like the project's files.
-- Paste it once in the D1 console (database "stalak"), BEFORE publishing the version that uses it.
ALTER TABLE projects ADD COLUMN cover_at INTEGER;   -- ms of the last cover saved (also its version in the URL); NULL = none
