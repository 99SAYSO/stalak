# AppSec review — compte/donnees-7-11 (rapport chiffres du 7/11 : provenance, entonnoir par source, abandons au paiement, e-mails)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/donnees-7-11` partie de `main` 4e15291 ; copie de travail locale.
Relu : `functions/_lib/metrics.js` (`presence`, `event`, `srcOf`), `functions/_lib/optin.js` (nouveau), `functions/_lib/router.js`
(routes `optin*`), `functions/_lib/admin.js` (`bySource`, `visitCountries`, `optinCounts`), `functions/_lib/admin-page.js`,
`functions/_lib/retention.js`, `src/app.js` (`VISIT_SRC`, `optUi`), `src/account.js` (étapes Paddle, `setSource`),
`migrations/0017_email_optins.sql`.

Threat model: nouvelles entrées publiques : `POST /api/optin` (adresse e-mail + accord), `GET/POST /api/optin/confirm|stop?t=`
(lien reçu par e-mail) ; champs `src` et `stage` sur `POST /api/presence` et `POST /api/event`. Biens : les adresses e-mail
(données personnelles avec consentement), la réputation d'envoi (stalak.app chez Resend), le quota d'écritures D1.

Release advice: proceed within reviewed scope (migration 0017 avant de publier ; textes à valider par Juridique).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| D1 (maîtrisé) | Moyenne / confirmé | `optin.js` `optinAsk` | Envoyer des e-mails de confirmation à n'importe qui (abus d'envoi) : 5 par connexion et par heure, 3 par adresse et par jour ; une adresse déjà confirmée ne reçoit rien ; même réponse dans tous les cas (on ne peut pas savoir qui est inscrit). | Test « 7/11 e-mail » (429 au 6ᵉ, pas de 2ᵉ e-mail). |
| D2 (maîtrisé) | Moyenne / confirmé | `optin.js` `optinLink` | Un lien ouvert par un antivirus de messagerie ne confirme ni ne désinscrit rien (un bouton POST, vérifié par le contrôle d'origine du routeur) ; jeton de 24 octets, seule son empreinte est gardée ; confirmation valable 7 jours. Pages sans script, CSP `default-src 'none'`, `noindex`. | Même test (GET ne confirme pas, POST oui, faux jeton 410, désinscription efface la ligne). |
| D3 (maîtrisé) | Faible (conformité) / confirmé | `optin.js`, `app.js` | Accord : case non cochée, refus côté serveur sans `consent: true` ; version du texte gardée (`v1-2026-11-07`) ; rien d'autre sur la personne (ni compte, ni provenance, ni pays, ni IP) ; durées : 7 jours sans confirmation, 3 ans après. | Test (colonnes, 400 sans accord, durées). |
| D4 (maîtrisé) | Faible / confirmé | `metrics.js` `srcOf` | `src` venant du navigateur : liste blanche (plateformes connues, `ref:` ≤ 32, `site:` ≤ 48 caractères) ; sinon « direct » (visites) ou rien (étapes). Nombre de noms de compteurs borné par les limites par connexion déjà en place. | Test (« <script> » → direct, 80 caractères → rien). |
| D5 (maîtrisé) | Faible / confirmé | `metrics.js` | Totaux par jour seulement (`vs:`, `fs:`, `ev_checkout_close_*`) : aucun numéro de visite ni compte dans ces compteurs. | Test (aucun numéro de visite dans les noms). |
| D6 (à savoir) | Info | `account.js` | `checkout_done` vient de la page (un bloqueur peut l'empêcher) ; le nombre d'achats qui fait foi reste celui du serveur (`paid_first`). | Écrit dans `docs/stats/compteurs.md`. |

Dependencies: aucune. Secrets hygiene: rien d'ajouté (PASS).

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 103/103 (2 nouveaux) |
| Navigateur (achat, étapes, source, e-mail) | PASS | `tests/ui/achat_ui.py` | 23/23 |
| App, formules, tableau de bord | PASS | `audit_ui.py`, `audit611_ui.py`, `formules_ui.py`, `plans_ui.py`, `support_ui.py` | 158/158, 91/91, 137/137, 35/35, 64/64 |
| Vrai envoi Resend de la confirmation | NOT RUN | — | pas de clé dans l'atelier ; à essayer après la mise en ligne |
