# AppSec review — compte/tableau-de-bord-v2 (nouveau tableau de bord, pays, appareils, provenance)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/tableau-de-bord-v2` partie de `main` ff69d15 ; copie de travail locale.
Relu : `functions/_lib/admin.js` (`insights`, période « tout »), `admin-page.js` (page), `admin-map.js` (données de carte),
`metrics.js` (`countryOf`, `deviceOf`, présence), `auth.js` / `oauth.js` (pays et appareil à l'inscription), `migrations/0010_dashboard.sql`,
`src/app.js` (oui/non « déjà venu »), `tests/ui/server.mjs` (données de démonstration, serveur de test seulement).
Exclus : vrai Cloudflare (valeur réelle de `request.cf.country`), vrai Access.

Threat model:
- Biens : les données des comptes et visites (vie privée), le tableau de bord (réservé au propriétaire).
- Entrées nouvelles : `request.cf.country` / en-tête `CF-IPCountry`, `User-Agent`, `ref` et `back` envoyés par la page,
  `days=all` du tableau de bord.
- Frontières : navigateur → `/api/presence` (anonyme) ; propriétaire → `/api/admin/stats` (Access + jeton vérifié, inchangé).

Release advice: proceed within reviewed scope (migration 0010 d'abord).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| D-1 (par conception) | Faible / confirmé | `metrics.js` `countryOf`, `deviceOf` | Données personnelles minimisées : seul le pays (2 lettres, `XX`/`T1` ignorés) et une catégorie d'appareil (iPhone/Android/ordinateur) sont gardés ; jamais l'IP, la ville ni le `User-Agent` complet. | Tests : aucune IP ni ville dans `users` et `visits`, colonnes de `visits` listées. |
| D-2 (maîtrisé) | Faible / confirmé | `metrics.js` `presence` | `ref` venant de la page : seulement `[a-z0-9_-]{1,24}`, sinon ignoré ; `back` seulement vrai/faux. | Test « a bad ref is not kept ». |
| D-3 (maîtrisé) | Faible / confirmé | `admin.js` `stats` | `days=all` borné à 730 jours ; requêtes liées (`bind`) ; route toujours derrière `requireAdmin`. | Test « at most 2 years of days ». |
| D-4 (à signaler) | Info | `src/app.js` `VISIT_BACK` | La date de la dernière visite est gardée dans le navigateur (`localStorage`) pour dire oui/non « déjà venu » : mesure d'audience anonyme, à mentionner dans la confidentialité (Juridique). | — |
| D-5 (maîtrisé) | Faible / confirmé | `admin-page.js` | Page sous CSP stricte (nonce) : aucun style ni script en ligne hors nonce, aucun appel externe (carte embarquée, pas de CDN) ; textes venus de la base insérés en `textContent`. | `support_ui.py` : « no page error (strict CSP) » sur ordinateur et téléphone. |

Dependencies: aucune ajoutée au site. La carte est un fichier de données généré une fois hors du dépôt (world-atlas 2.0.2, Natural
Earth domaine public / ISC ; d3-geo 3.1.1 ; i18n-iso-countries 7.14.0, MIT), aucun code tiers exécuté dans la page.

Secrets hygiene: aucun secret ajouté. Inspection : PASS.

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 80/80 |
| Tableau de bord + « Parler à un humain » (1280 et 390 px, CSP) | PASS | `tests/ui/support_ui.py` | 43/43 |
| Glaçon d'aide + version claude.ai | PASS | `tests/ui/help_ui.py` | 42/42 |
| Vrai pays Cloudflare | NOT RUN | — | à voir sur le tableau de bord après publication |

CEO handoff: Chef de projet — migration 0010 avant de publier ; Juridique — phrase sur le pays et la mesure « déjà venu » dans la confidentialité.
