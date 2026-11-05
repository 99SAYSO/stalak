# AppSec review — compte/notif-telegram (notifications de ventes par Telegram)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/notif-telegram` partie de `main` 3047418 ; copie de travail locale.
Relu : `functions/_lib/telegram.js` (nouveau), `notify.js` (envoi vers Telegram et ntfy), `paddle.js` (appel après le webhook,
inchangé depuis `compte/notif-ventes`), `admin.js` (routes `telegram-link`, `telegram-unlink`, `notify-test`), `admin-page.js`.
Environnement : tests locaux, API Telegram imitée. Exclus : vrai Telegram.

Threat model:
- Biens : la clé du bot (`TELEGRAM_BOT_TOKEN`, secret), l'identité de la discussion qui reçoit les ventes, les données des clients.
- Acteurs : le propriétaire (tableau de bord derrière Cloudflare Access), n'importe qui sur Telegram (le bot est public :
  quiconque le trouve peut lui écrire), Paddle (webhook signé).
- Entrées nouvelles : réponses de l'API Telegram (`getUpdates`, `sendMessage`), routes admin `telegram-link`, `telegram-unlink`,
  `notify-test`.
- Frontières : Functions → api.telegram.org (clé dans l'URL, imposé par Telegram) ; propriétaire → `/api/admin/*` (Access).

Release advice: proceed within reviewed scope.

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| T-1 (maîtrisé) | Moyen / confirmé | `telegram.js` `linkTelegram` | Un inconnu qui trouve le bot pourrait envoyer /start au moment où le propriétaire relie, et recevoir les ventes. | Seules les discussions **privées** ayant envoyé `/start` dans les **15 dernières minutes** comptent ; **plusieurs** discussions différentes → refus (`telegram_several`) ; le prénom relié est affiché au tableau de bord et un message de confirmation part dans la discussion reliée ; bouton « Délier ». Tests. |
| T-2 (maîtrisé) | Moyen / confirmé | `telegram.js` `call` | La clé du bot est dans l'URL de l'API Telegram : un journal d'erreur avec l'URL la divulguerait. | Journaux : seulement la méthode, le statut et la raison courte de Telegram ; jamais l'URL. Test « no key in the logs » (panne, délai, refus). La clé n'est jamais renvoyée par l'API (test). |
| T-3 (maîtrisé) | Faible / confirmé | `notify.js`, `paddle.js` | Une panne ou lenteur de Telegram bloquerait le webhook ou le passage en Pro. | 3 s au plus (AbortController), erreurs avalées, envoi après la réponse à Paddle (`waitUntil`). Tests : panne, attente infinie, refus 403 → webhook 200 et compte Pro. |
| T-4 (maîtrisé) | Faible / confirmé | `notify.js` | Données personnelles dans la notification. | Seulement formule, prix, rythme, pays (de l'inscription) ; jamais e-mail, nom, identifiants Paddle (test). Le prénom Telegram gardé est celui du **propriétaire** (sa propre discussion). |
| T-5 (accepté) | Info | `admin_state` | L'identifiant de discussion du propriétaire est gardé en base (pas un secret : sans la clé du bot, il ne permet pas d'écrire). | — |

Contrôles vérifiés : routes admin derrière `requireAdmin` (Access, test sans jeton refusé) ; `notify-test` limité à 10 par heure et
`telegram-link` à 20 par heure ; format de la clé vérifié avant usage ; identifiant de discussion validé (`^\d{1,20}$`) ; groupes et
supergroupes ignorés ; messages lus marqués comme vus (`offset`) ; ntfy inchangé et seulement si `NTFY_TOPIC` est rempli.

Dependencies: aucune ajoutée. Secrets hygiene: aucun secret dans le code ; nouveau secret `TELEGRAM_BOT_TOKEN` saisi par le propriétaire.

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 86/86 (3 nouveaux Telegram) |
| Tableau de bord (carte Telegram, 1280 / 390 px, CSP) | PASS | `tests/ui/support_ui.py` + vérification de la carte | 43/43, sans erreur ni défilement de côté |
| Vrai bot Telegram | NOT RUN | — | après publication : « Relier mon Telegram » puis « Envoyer une notif de test » |

CEO handoff: Chef de projet — fusion et publication (aucune migration) ; propriétaire — créer le bot, saisir le secret, relier.
