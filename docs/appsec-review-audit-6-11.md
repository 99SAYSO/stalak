# AppSec review — compte/audit-6-11 (audit du 6/11, points 1, 2, 3, 12, 14, 15, 16, 17, 20)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/audit-6-11` partie de `main` 5b947f3 ; copie de travail locale.
Relu : `functions/_lib/paddle.js` (`applyAdjustment`, `refundStopsSubscription`, `applySubscription`, `linkCustomer`),
`functions/_lib/metrics.js` (`presence`), `functions/_lib/retention.js` (nouveau), `functions/_lib/thanks.js` (`sendThanks`,
`cancelThanks`, `purgeOldThanks`), `functions/_lib/router.js` (suppression du compte), `functions/_lib/help.js`, `functions/_lib/admin.js`,
`functions/_lib/cloud.js`, `workers/cloud-cleanup/index.js`, `src/app.js` (`plWant`, `plTake`, `plResume`, `boot`), `src/account.js`
(`checkout`), `migrations/0016_thanks_mail_id.sql`. Exclus : vrai Paddle, vrai Resend, règles Cloudflare (à poser par le propriétaire).

Threat model: biens : l'accès payant, l'argent remboursé, la disponibilité de la base (quota d'écritures du jour), les données des
comptes. Entrées : webhook Paddle (signé, inchangé) ; `POST /api/presence` (public) ; `POST /api/help/chat` (public) ; suppression
du compte (connecté) ; l'adresse `?plan=` de la page (n'importe qui peut fabriquer un lien).

Release advice: proceed within reviewed scope (migration 0016 avant de publier ; règle Cloudflare conseillée).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| A1 (corrigé) | Haute / confirmé | `paddle.js` `refundStopsSubscription` | Un client remboursé gardait l'accès payant. Maintenant : remboursement complet approuvé ou contestation → arrêt immédiat (Paddle + ici), une seule fois (clé `refund-stop:`), `last_event_at` avancé pour qu'un vieux message ne rallume rien ; changement de formule → alerte seulement ; partiel → rien. Ne fait jamais échouer le webhook. | Test « audit 6/11 n°1 » (arrêt, Free tout de suite, une notif, rejeu, vieux message, changement de formule, partiel, refus de Paddle). |
| A2 (corrigé) | Haute / confirmé | `metrics.js` `presence` | ~100 000 signes de vie d'un même numéro épuisaient les écritures du jour. Maintenant : `WHERE visits.last_at < now - 240000` dans l'écriture ; les nouveaux numéros restent limités par connexion (inchangé). | Test « n°3 » (50 appels → 0 écriture). Reste : règle de limite Cloudflare (propriétaire). |
| A3 (corrigé) | Moyenne / confirmé | `paddle.js` `applySubscription` | Deux messages simultanés : le plus ancien écrit en dernier écrasait l'autre. Maintenant la condition est dans l'écriture (`WHERE subscriptions.last_event_at <= ?8`). | Test « n°15 ». |
| A4 (corrigé) | Moyenne / plausible | `paddle.js` `linkCustomer` | Payer avec l'e-mail d'un autre client Paddle remplaçait le client du compte (portail d'un autre). Maintenant jamais remplacé une fois rempli. | Test « n°16 ». |
| A5 (corrigé) | Moyenne / confirmé | `help.js` | Une connexion pouvait prendre les 60 questions du jour (déni de service de l'assistant). Maintenant 6 / 10 min et 10 / jour par connexion. | Test « help chat: per-connection… ». |
| A6 (corrigé) | Moyenne (conformité) / confirmé | `retention.js`, `router.js`, `thanks.js` | Durées de conservation : `lyrics_usage` 90 j + effacée avec le compte ; empreintes « remercié » 3 ans ; `rate_limits` purgé chaque jour ; e-mail de remerciement programmé annulé à la suppression du compte (id Resend gardé, migration 0016). | Test « n°12 ». |
| A7 (maîtrisé) | Faible / confirmé | `app.js` `boot` | `?plan=` fabriqué par un tiers : n'ouvre que la fenêtre Paddle de l'acheteur lui-même, avec une formule de la liste (`pro`/`creator`, `month`/`year`), seulement s'il est connecté (sinon la page de connexion) ; rien n'est payé sans lui. Choix gardé 30 min dans l'onglet ; ignoré si la connexion vient d'ailleurs que la page des formules. | `tests/ui/achat_ui.py` 12/12. |
| A8 (maîtrisé) | Info | `account.js` `checkout` | Fenêtre de paiement bloquée : message clair au lieu de rien (12 s sans « checkout.loaded » ni cadre Paddle). | `achat_ui.py` (paddle.js bloqué, fenêtre muette). |

Dependencies: aucune ajoutée. Secrets hygiene: rien d'ajouté (PASS) ; l'id Resend d'un e-mail n'est pas un secret.

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 101/101 (5 nouveaux) |
| Achat (nouveau) | PASS | `tests/ui/achat_ui.py` | 12/12 |
| Formules / app / audit / aide / tableau de bord | PASS | `plans_ui.py`, `formules_ui.py`, `audit_ui.py`, `help_ui.py`, `support_ui.py` | 35/35, 137/137, 158/158, 42/42, 63/63 |
| Vrai remboursement Paddle (sandbox) | NOT RUN | — | à faire après la mise en ligne (rembourser l'achat de test) |
| Règle de limite Cloudflare | NOT RUN | — | à poser par le propriétaire |
