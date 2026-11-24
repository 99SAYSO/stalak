# AppSec review — compte/dashboard-clarity-ga4
Scope / authority: repo 99SAYSO/stalak, base `main` 68379c8 → working tree of `compte/dashboard-clarity-ga4` (24/11). Local tests only (fake D1, fake Google / Clarity answers); no live call to Google or Microsoft, no secret used. Excluded: Cloudflare Access configuration itself (unchanged), consent.js (unchanged).
Threat model:
- Assets: GA4 service-account private key (`GA4_SA_KEY`), Clarity API token (`CLARITY_API_TOKEN`), the owner's dashboard, visitors' privacy, Clarity's daily quota.
- Actors: the owner (Cloudflare Access), anonymous internet, a compromised/odd answer from Google or Clarity.
- Entry points: `GET /api/admin/analytics|analytics/live|analytics/tiles`, `POST /api/admin/clarity/refresh`, the daily tasks (`maybeCleanup`, `POST /api/cron/cloud-cleanup` with `CRON_SECRET`, Worker cron).
- Trust boundaries: Worker ↔ oauth2.googleapis.com / analyticsdata.googleapis.com / www.clarity.ms (fixed hosts); D1; admin page (browser).
Release advice: **proceed within reviewed scope.**

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| A1 | Low / confirmed, mitigated | clarity.js `cleanText` | Clarity rows carry full page URLs; a sign-in link could carry a code in `?…`, a URL could contain an e-mail. | Query and fragment stripped before storage; any string with `@` masked. Test « clarity: one snapshot a UTC day » asserts no `987654` and no `@` stored or returned. |
| A2 | Low / confirmed, mitigated | admin-page.js `clarityRender`, `analyticsLive` | Page titles / URLs / source names come from outside (GA4, Clarity) → XSS if inserted as HTML. | Everything set with `textContent` / `el()`; the only `href` is built server-side from `CLARITY_PROJECT_ID` filtered to `[\w-]`; `target=_blank` with `rel=noopener noreferrer`. UI test checks href / rel, no page error under strict CSP. |
| A3 | Low / confirmed, mitigated | clarity.js `clarityDaily`, admin.js refresh | Repeated refresh could burn Clarity's 10/day and block the daily snapshot. | Own budget 8 calls / UTC day (counted in `clarity_calls`), stop after 429 or 401, refresh limited 6 / day and behind Access + JSON CSRF check. Test « never more than 8 calls a day ». |
| A4 | Info | ga4.js | Secret handling: key parsed in memory only, never logged nor returned; errors return codes only (`bad_key`, `access`…). Access token kept in isolate memory ≤ 50 min, scope `analytics.readonly`. | Test asserts claims (iss/aud/scope/exp) and the RS256 signature with the public key; `bad_key` test does not echo the secret. |
| A5 | Info | ga4.js / clarity.js | SSRF: hosts are constants; `GA4_PROPERTY_ID` must be digits (4–15). | Review only. |
| A6 | Info | migrations/0022 | Stored data are anonymous totals; 400-day retention enforced by the job. | Review only. |

Dependencies: none added (WebCrypto `RSASSA-PKCS1-v1_5`, `fetch`, `AbortSignal.timeout`). Advisory lookup: NOT RUN (no new package).
Secrets hygiene: no secret in code, tests or docs; tests generate a throw-away RSA key at run time; the demo uses another throw-away key. `wrangler.toml` holds only `GA4_PROPERTY_ID` (public).

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Admin routes need Access | PASS | `node tests/backend/run.mjs` (« without the secrets… owner only » → 403) | 132/132 |
| JWT built correctly, read-only scope | PASS | same, GA4 test | signature verified |
| No PII stored / shown | PASS | same + `tests/ui/analytics_ui.py` (« jamais d'e-mail ») | 76/76 |
| Quota respected (Clarity) | PASS | same, 429 / 8-calls tests | — |
| Strict CSP, no page error | PASS | `tests/ui/analytics_ui.py`, `tests/ui/support_ui.py` | 76/76, 64/64 |
| Live Google / Clarity behaviour | NOT RUN | needs the owner's secrets | to check after setup |

Coverage / residual risk: real field names of Clarity metrics other than Traffic are undocumented (parsed defensively; unknown → « — »). Clarity filtered-recordings URL format undocumented (link opens the recordings page; filter written as text).
CEO handoff: Comptes — none blocking. After the owner adds the two secrets: open the page once, check figures look sane, and send Comptes a filtered Clarity URL if a pre-filtered link is wanted.
