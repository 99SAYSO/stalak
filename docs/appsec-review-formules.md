# AppSec review — compte/formules (Gratuit + Stalak Pro + Stalak Creator Plus, changement de formule)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/formules` après fusion de `main` 5941747 et de `origin/app/formules`
11dfaca ; copie de travail locale. Serveur relu : `functions/_lib/entitlements.js`, `paddle.js` (formule déduite du prix,
`changePlan`), `router.js` (`paddle/change`, config, `/me`, suppression du compte), `cloud.js` (espace par formule), `lyrics.js`,
`support.js` (réservé à Creator Plus ; délai d'envoi par e-mail), `help.js`, `admin.js` / `admin-page.js`, `auth.js` et `profile.js`
(case de rappel retirée), `workers/cloud-cleanup/`, `migrations/0008_plans.sql`. Page : `src/account.js`, bloc compte de `src/app.js`.
Environnement : tests locaux (faux D1 node:sqlite, faux R2, Paddle et Resend imités). Exclus : vrai Paddle, vrai Cloudflare ;
le filigrane et la pub récompensée (côté App, sans contrôle serveur possible : Google n'en propose pas pour le web).

Retiré dans cette version (offre du 30/10 au soir) : la vidéo gratuite du jour (`POST /api/videos/claim`, table `free_videos`),
l'e-mail de rappel et son lien de désabonnement (`/api/reminders/stop`, `/api/cron/reminders`), les colonnes `reminders*`,
`last_seen_at`, `reminder_*`. Les surfaces d'attaque correspondantes disparaissent ; la migration 0008 n'est pas encore appliquée,
donc rien à nettoyer en base.

Threat model:
- Biens : les droits payants (formule), l'abonnement Paddle et le moyen de paiement enregistré, les quotas (paroles auto,
  espace en ligne), les conversations « Parler à un humain ».
- Acteurs : visiteur anonyme, compte gratuit, abonné Pro ou Creator Plus, site tiers (CSRF), Paddle (webhook signé).
- Entrées : `POST /api/paddle/change`, webhook Paddle (prix → formule), routes protégées par `requirePlan`, `GET /api/config`.
- Frontières : navigateur → Functions (cookie + Origin + JSON), Functions → Paddle API (clé secrète), Paddle → webhook (HMAC).

Release advice: proceed within reviewed scope (migration 0008 d'abord).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| F-1 (accepté, par conception) | Moyen / confirmé | côté App (filigrane, pub récompensée) | Le filigrane est ajouté dans le navigateur et la pub l'enlève sans contrôle serveur : une page modifiée à la main peut exporter sans filigrane. Décision de l'offre ; aucun droit payant côté serveur n'en dépend. | Rien côté serveur. |
| F-2 (limite) | Faible / confirmé | `functions/_lib/paddle.js` `changePlan` | Paddle ne sait pas programmer un changement de rythme de facturation : annuel → mensuel est refusé (`409 change_at_renewal`, la page explique). | Test « change of plan » : 409. |
| F-3 (accepté) | Faible / confirmé | `functions/_lib/entitlements.js` `planOfSub` | Un prix inconnu sans `{"plan": …}` dans Paddle compte comme Pro. Seul le propriétaire crée des prix ; la page n'achète que les 4 prix de la config. | Avertissement dans les journaux ; après le premier achat test, vérifier `subscriptions.plan`. |
| F-4 (corrigé, fiabilité) | Faible / confirmé | `functions/_lib/support.js` `CATCH_UP_MS` | Une réponse à un visiteur qui vient de partir attendait 20 s + le passage suivant du tableau de bord (≈ 30 s) avant l'e-mail ; `tests/ui/support_ui.py` dépassait ses 50 s sur une machine plus lente. | 12 s (la page du visiteur demande toutes les 5 s). Test serveur : rien à 10 s, envoi à 13 s ; test d'interface : 19,7 s, marge 90 s. |

Contrôles vérifiés :
- Droits : tableau unique (contrat App / Comptes) : `nowm`, `clip`, `fx`, `text`, `filters`, `lyrics` → Pro ; `pack5`, `pack10`,
  `pack30`, `cloud`, `human` → Creator Plus. `requirePlan` sur toutes les routes `/api/projects*` (sauvegarde, Galerie), les
  paroles auto, « Parler à un humain ». Refus `403 pro_required` avec `need`. Quotas par formule (paroles 20 / 60 par jour,
  100 Go en Creator Plus ; au-delà, rien d'effacé, nouvelles sauvegardes refusées). Testé formule par formule.
- Prix : seuls les 4 prix en dollars de `wrangler.toml` se vendent et se choisissent dans un changement ; les anciens
  (euros, Basic, Max) ne servent qu'à reconnaître leurs abonnés (`PADDLE_PRICES_OLD`, format vérifié : `pri_…:plan:interval`).
  Webhook : la formule vient du prix (table serveur) ou du `custom_data` **du prix** (catalogue du propriétaire), jamais de celui
  de la transaction que le client remplit ; noms anciens convertis (`basic` → `pro`, `max` → `creator`). Testé.
- `POST /api/paddle/change` : compte connecté, JSON + Origin (403 depuis un autre site), 30 par heure (aperçus compris) ;
  abonnement choisi par le serveur parmi ceux du compte (actif, pas en retard, pas en fin) ; montée `prorated_immediately` avec
  aperçu du montant (`…/preview`, rien ne change) ; descente `full_next_billing_period` avec la formule payée gardée jusqu'à la fin
  de la période ; retour vers une formule déjà payée `do_not_bill` ; `on_payment_failure: prevent_change`. Testé.
- Config publique : prix et montants seulement ; aucune clé (test « config exposes only public settings »).
- Requêtes SQL toutes liées (`bind`).

Dependencies: aucune dépendance ajoutée ni modifiée. Contrôle d'avis de sécurité : NOT RUN (sans objet).

Secrets hygiene: aucune clé ni mot de passe ajouté ; les `pri_…` sont publics (paiement côté navigateur). Inspection : PASS.

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 67/67 |
| Formules et changement de formule (page) | PASS | `tests/ui/plans_ui.py` sur `tests/ui/cloud-server.mjs` (Paddle imité) | 30/30, 390 et 1280 px, FR/EN |
| « Parler à un humain » (Creator Plus) + tableau de bord | PASS | `tests/ui/support_ui.py` | 39/39, réponse par e-mail en 19,7 s |
| Galerie (Creator Plus) ; glaçon d'aide + version claude.ai | PASS | `tests/ui/gallery_ui.py` ; `tests/ui/help_ui.py` | 40/40 ; 42/42 |
| Lecture du diff serveur | PASS | `git diff origin/main -- functions/ migrations/ workers/` | voir ci-dessus |
| Vrai Paddle (achat, aperçu, changement) | NOT RUN | — | à vérifier en sandbox après publication |

Coverage / residual risk: champ du montant de l'aperçu Paddle (`immediate_transaction.details.totals.grand_total`) vérifié sur
la documentation, pas en sandbox ; `tests/ui/formules_ui.py` d'App teste encore l'offre Basic / Pro / Max (à mettre à jour par App).

CEO handoff: Chef de projet — migration 0008 avant de publier ; tester en sandbox un achat Pro, « Passer à Creator Plus »
(montant affiché) et « Passer à Pro » (date du renouvellement).
