# AppSec review — compte/mail-merci (e-mail de remerciement aux nouveaux abonnés)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/mail-merci` partie de `main` 18c4589 ; copie de travail locale.
Relu : `functions/_lib/thanks.js` (nouveau), `functions/_lib/paddle.js` (webhook), `functions/_lib/notify.js` (`isNewPurchase`),
`functions/_lib/admin.js` (route `thanks-test`), `functions/_lib/admin-page.js` (bouton), `migrations/0012_thanks_mail.sql`.
Exclus : vrai compte Resend (domaine `stalak.app` vérifié, adresse d'envoi `99sayso@stalak.app`), vrai webhook Paddle.

Threat model:
- Biens : l'adresse e-mail des clients ; la réputation d'envoi du domaine stalak.app ; le webhook Paddle (le paiement doit toujours passer).
- Entrées : webhook Paddle (signé, inchangé) → décide si un e-mail part ; `POST /api/admin/thanks-test` (propriétaire).
- Sortie : Resend (clé secrète `RESEND_API_KEY`, déjà en place). Destinataire : l'adresse du compte lié à l'abonnement, jamais une
  adresse venant de la requête ; pour le bouton, l'adresse vérifiée par Cloudflare Access.

Release advice: proceed within reviewed scope (migration 0012 avant de publier).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| MM-1 (maîtrisé) | Moyenne si raté / confirmé | `thanks.js` `thanksAfterPurchase` | E-mails en double (Paddle envoie created + activated + updated presque ensemble) → prise atomique `UPDATE … WHERE thanked_at IS NULL`, puis une clé par adresse (empreinte SHA-256) dans `webhook_events`, plus `Idempotency-Key` côté Resend. | Test « once per person » : 3 évènements → 1 e-mail ; réabonnement, renouvellement, compte recréé → 0. |
| MM-2 (maîtrisé) | Moyenne si raté / confirmé | `paddle.js` webhook | Resend lent ou en panne ne doit pas bloquer le paiement : envoi dans `waitUntil` après la réponse, erreurs avalées ; en cas d'échec, les marques sont reprises pour un nouvel essai. | Test « Resend down » : webhook 200, compte Pro, marque reprise, l'évènement suivant envoie. |
| MM-3 (maîtrisé) | Faible / confirmé | `thanks.js` | Jamais en sandbox (`PADDLE_ENV` ≠ production) ; jamais aux clients déjà abonnés (migration 0012). | Tests « never in sandbox » et migration. |
| MM-4 (maîtrisé) | Faible / confirmé | `thanks.js` `thanksEmail` | Aucune donnée du client dans le texte (ni nom ni pseudo) : pas d'injection possible ; la version HTML est échappée. | Test du texte anglais mot pour mot. |
| MM-5 (maîtrisé) | Faible / confirmé | `admin.js` `thanks-test` | Route réservée au propriétaire (Access + vérification serveur), écriture seulement depuis l'origine du tableau de bord, envoi uniquement à l'adresse Access. Pas de limite, comme la notif de test (choix du propriétaire). | Test : 403 sans jeton ou depuis une autre origine ; 2 e-mails à `owner@…`. |
| MM-6 (à savoir) | Info | migration 0012 | Les clients déjà abonnés sont marqués par compte seulement (SQLite ne sait pas calculer l'empreinte) : si l'un d'eux supprime son compte puis se réabonne avec un nouveau compte, il recevrait l'e-mail. Cas très rare. | — |
| MM-7 (à savoir) | Info | `thanks.js` | Programmé 3 h plus tard : un client remboursé dans ces 3 heures le reçoit quand même. | — |

Dependencies: aucune ajoutée. Secrets hygiene: aucun secret ajouté ni affiché (PASS) ; la clé Resend reste dans Cloudflare.

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 93/93 (3 nouveaux) |
| Interface | PASS | `tests/ui/support_ui.py` | 55/55 (bouton, aucune erreur CSP) |
| Envoi réel par Resend (programmé) | NOT RUN | — | pas de clé Resend dans l'atelier ; à vérifier avec le bouton après la mise en ligne |

CEO handoff: Juridique — mentionner l'e-mail de remerciement dans la confidentialité ; Chef de projet — migration 0012 avant de publier.
