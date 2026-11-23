# AppSec review — compte/essai-gratuit (essai gratuit de 7 jours de Stalak Pro)
Scope / authority : dépôt `99SAYSO/stalak`, branche `compte/essai-gratuit` contre `origin/main` (1f62c8b), arbre de travail. Fichiers : `functions/_lib/trial.js` (nouveau), `paddle.js` (webhook, refus de changement de formule pendant l'essai), `entitlements.js`, `router.js` (`/api/trial/cancel`, config, suppression de compte, tâches), `cloud.js`, `retention.js`, `notify.js`, `reminders.js`, `admin.js` / `admin-page.js`, `migrations/0020_trial.sql`, `wrangler.toml`. Tests locaux (faux D1, faux Paddle, faux Resend). Aucun service réel touché.

Threat model :
- Biens : l'argent (ne jamais prélever sans que la personne s'y attende, ne pas donner Pro gratuitement en série), l'accès Pro, les adresses e-mail des comptes supprimés.
- Acteurs : personne honnête, personne qui veut des essais en série (nouveaux comptes, même adresse, prix d'essai forcé dans le paiement), antivirus de messagerie qui ouvrent les liens, autre site (CSRF), Paddle (webhooks signés).
- Entrées : webhook Paddle (signé), `GET/POST /api/trial/cancel`, `GET /api/me`, `GET /api/config`, tâches quotidiennes.

Release advice : **proceed within reviewed scope**, après la migration 0020 et les deux prix créés dans Paddle.

| ID | Sévérité / confiance | Fichier | Conditions / impact | Correction / test |
|---|---|---|---|---|
| T1 | Élevé / confirmé (protégé) | trial.js `trialAfterWebhook` | Les identifiants de prix sont publics : on peut forcer le prix d'essai dans le paiement Paddle sans y avoir droit. | Le serveur vérifie au webhook, en une seule requête SQL (`UPDATE users … WHERE trial_used_at IS NULL AND NOT EXISTS (autre abonnement) AND NOT EXISTS (empreinte)`). Sans droit : arrêt immédiat chez Paddle **sans rien prélever** et jamais de Pro (`trial_result = 'refused'` coupe Pro même si un message de Paddle arrive en retard). Tests « already had a subscription », « two checkouts at once », « late message ». |
| T2 | Moyen / confirmé (choix) | trial.js | Prélever tout de suite un essai refusé (« activate ») ferait payer quelqu'un qui a vu « gratuit 7 jours » : litige, remboursement forcé. | Choisi : annulation immédiate, rien prélevé. La personne doit reprendre la formule normale. |
| T3 | Moyen / confirmé (protégé) | trial.js `trialMark` | Supprimer son compte puis revenir avec la même adresse (ou nom+1@…, points Gmail) pour un 2e essai. | Empreinte HMAC-SHA-256 (`AUTH_SECRET`, préfixe « trial: ») de la boîte ramenée à une forme, écrite à la suppression si le compte avait un abonnement ou un essai, effacée 12 mois après. Tests HMAC ≠ SHA-256, 11 mois gardée / 13 effacée, rien sans clé. |
| T4 | Moyen / confirmé (protégé) | trial.js `cancelPage` / `cancelTrial` | Un lien qui annule à l'ouverture serait déclenché par les antivirus de messagerie ; un lien devinable permettrait d'annuler l'essai de quelqu'un d'autre. | GET = page avec un bouton, sans effet. POST : clé HMAC (`AUTH_SECRET`, « trialcancel: » + id d'abonnement) comparée en temps constant, ou compte connecté propriétaire de l'abonnement ; 404 sinon ; 20 essais par heure et par IP (empreinte) ; JSON obligatoire et origine vérifiée (règle commune) ; bloqué sur les maquettes. Page : `Content-Security-Policy` stricte avec nonce, `X-Frame-Options: DENY`, `no-referrer`, `noindex`. Tests « wrong key 404 », « other account 404 », « opening cancels nothing ». |
| T5 | Faible / confirmé (protégé) | trial.js `trialReminders` | Deux tâches en même temps enverraient deux e-mails ; un montant faux tromperait la personne. | L'e-mail est réservé en base avant l'envoi (une ligne écrite une fois) ; le montant vient de Paddle (`next_transaction`, taxes comprises) ; sans lui, pas d'e-mail (nouvel essai 6 h plus tard). Tests. |
| T6 | Faible / confirmé (protégé) | paddle.js `changePlan` | Passer à Creator Plus pendant l'essai (Paddle ne facture rien pendant un essai) = Creator Plus gratuit. | 409 `in_trial` pendant l'essai. Test. |
| T7 | Faible / confirmé | entitlements.js | 1er prélèvement raté : garder Pro pendant les relances de Paddle donnerait des semaines de Pro sans jamais payer. | `past_due` après un essai = pas de Pro (les autres abonnés gardent la règle d'avant). Test. |
| T8 | Info / hypothèse | — | De vraies nouvelles adresses (ou « Masquer mon e-mail » d'Apple) = nouveaux essais ; mais chaque essai demande une carte valide chez Paddle. | Accepté. Paddle limite aussi les cartes à risque. |
| T9 | Info | — | `AUTH_SECRET` absent en production : ni empreinte (T3) ni lien d'annulation par clé (le lien mène alors à la page du compte). | **Le propriétaire vérifie qu'il existe.** |

Dependencies : aucune ajoutée ni changée.
Secrets hygiene : aucun secret écrit ; `AUTH_SECRET`, `PADDLE_API_KEY` et `RESEND_API_KEY` lus dans l'environnement (valeurs factices dans les tests). Les identifiants de prix d'essai sont publics.

| Check | Statut | Commande | Résultat |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 120/120 (5 nouveaux sur l'essai) |
| Tableau de bord + support | PASS | `tests/ui/support_ui.py` | 64/64 |
| E-mail et page d'annulation (390 px, FR / EN) | PASS | Playwright | pas de défilement de côté |
| Vrais webhooks d'essai de Paddle (sandbox) | NOT RUN | — | à faire par le Chef de projet après création des prix sandbox |
| `AUTH_SECRET` en production | NOT RUN | — | à vérifier par le propriétaire |

Coverage / residual risk : les écrans (App) ne sont pas faits ; la forme exacte des messages d'essai de Paddle est celle de sa documentation (`items[].trial_dates`, `next_billed_at`, `scheduled_change`) : à confirmer par un essai réel en sandbox.
CEO handoff : Chef de projet (migration 0020, prix dans `wrangler.toml`, essai sandbox) ; App (écrans) ; Juridique (conditions, durée de l'empreinte) ; propriétaire (Paddle, `AUTH_SECRET`).
