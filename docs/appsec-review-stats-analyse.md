# AppSec review — compte/stats-analyse
Scope / authority: repo 99SAYSO/stalak, base `main` 2ee3ccd → `compte/stats-analyse` (24/11). Local tests, fake D1, fake Spotify / Apify / Telegram answers. No live call, no secret used.
Threat model:
- Assets: `APIFY_TOKEN` (spends money), `SPOTIFY_CLIENT_SECRET`, artists' profiles and figures, the owner's Apify credit.
- Actors: a signed-in user (any plan), an anonymous visitor, a hostile or odd robot answer.
- Entry points: `PUT /api/artist` (links, genreOther), `GET /api/stats`, the daily tasks (`maybeCleanup`, `POST /api/cron/cloud-cleanup` with `CRON_SECRET`, Worker cron).
- Trust boundaries: Worker → api.apify.com / accounts.spotify.com / api.spotify.com (constant hosts); D1; App (JSON).
Release advice: **proceed within reviewed scope.**

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| S1 | Medium / confirmed, mitigated | router.js `case 'artist'`, spotify.js | A user flipping their Spotify link could make the server run the paid robot repeatedly. | At most 5 immediate runs per account per day (`spnow:` limit); the weekly job never retries an artist within 20 h; 10 artists per run; `maxTotalChargeUsd` = 0,01 $ per link; 25 s wait. Tests « not again before 20 h », « no second run the same week ». Residual: many accounts × 0,10 $/month (see handoff). |
| S2 | Low / confirmed, mitigated | spotify.js `apifyRun` | SSRF / injection: only `open.spotify.com/artist/<22 alnum>` or `/album/<22 alnum>` URLs are built from ids validated by regex; hosts are constants. | `spotifyArtistId` regex test (track link → `not_artist_link`). |
| S3 | Low / confirmed, mitigated | spotify.js `artistFigures`, track loop | Robot answers are untrusted: names trimmed (control chars removed, 120 chars), numbers must be finite ≥ 0, unknown shape → nothing written. | Test `artistFigures({monthlyListeners:'190'}) === null`. |
| S4 | Low / confirmed, mitigated | stats.js | Paid data leak to free accounts. | `pro: null` unless plan pro/creator, from `planFor` (server); test « a free account … would not get the Pro part ». |
| S5 | Low / confirmed, mitigated | artist.js `cleanLink` | `javascript:` / other-site links for TikTok / YouTube. | Host lists, https forced, credentials refused; test of 4 bad links → 400. |
| S6 | Info | spotify.js `robotResult` | The alert text contains only the actor name and an error code, never a token or user data. | Review. |
| S7 | Info | router.js account deletion | New tables deleted with the account; old artist's data deleted on link change. | Tests. |

Dependencies: none added. Advisory lookup NOT RUN (no new package).
Secrets hygiene: no secret in code / tests / docs; tokens sent only in `Authorization` headers to their own hosts; never logged (logs carry error codes).

| Check | Status | Command / inspection | Evidence |
|---|---|---|---|
| Backend tests | PASS | `node tests/backend/run.mjs` | 136/136 |
| Free vs Pro split | PASS | same | `pro === null` for free |
| 0 never shown as 0 | PASS | same | no `"streams":0` in the answer |
| Live Apify / Spotify | NOT RUN | needs secrets | Chef's manual test of 24/11 matches the fake answers |

Coverage / residual risk: Apify cost grows with the number of artists (handoff gives the figures); the robot depends on Spotify's public pages and can break without notice (alert after 2 failures). Spotify's `market` choice may hide releases not available in France (SPOTIFY_MARKET can be changed).
CEO handoff: Comptes — none blocking. Juridique: privacy page (Apify, Spotify API).
