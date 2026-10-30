# AppSec review — compte/formules (Gratuit + Basic / Pro / Max, vidéo gratuite du jour, rappel)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/formules` contre `main` b5731a4, copie de travail locale.
Serveur relu : `functions/_lib/entitlements.js` (réécrit), `functions/_lib/videos.js` (nouveau), `functions/_lib/paddle.js`
(formule déduite du prix, `changePlan`), `functions/_lib/router.js` (routes `videos/claim`, `paddle/change`, `reminders/stop`,
`cron/reminders`, `/me`, config), `functions/_lib/cloud.js`, `lyrics.js`, `support.js`, `help.js`, `profile.js`, `auth.js`
(case de rappel), `admin.js` / `admin-page.js` (chiffres par formule), `workers/cloud-cleanup/index.js`,
`migrations/0008_plans_free_video.sql`. Page : `src/account.js`, bloc compte de `src/app.js`.
Environnement : tests locaux seulement (faux D1 node:sqlite, faux R2, faux Paddle et Resend). Exclus : vrai Paddle (sandbox),
vrai Resend, vrai Cloudflare.

Threat model:
- Biens : les droits payants (formule), l'abonnement Paddle et le moyen de paiement enregistré, la liste d'e-mails et le
  consentement aux rappels, les quotas (paroles auto, espace en ligne), le compteur de la vidéo gratuite.
- Acteurs : visiteur anonyme, compte gratuit, abonné (Basic, Pro, Max), site tiers (CSRF), lecteur d'un e-mail transféré,
  robot de messagerie qui ouvre les liens, Paddle (webhook signé).
- Entrées : `POST /api/videos/claim`, `POST /api/paddle/change`, `GET|POST /api/reminders/stop`, `POST /api/cron/reminders`,
  `PATCH /api/me {reminders}`, `POST /api/auth/signup {reminders}`, webhook Paddle (prix → formule), `GET /api/config`.
- Frontières : navigateur → Functions (cookie de session + Origin + JSON), lien d'e-mail → Functions (clé aléatoire),
  Functions → Paddle API (clé secrète), Paddle → webhook (signature HMAC), Functions → Resend.

Release advice: proceed within reviewed scope (migration 0008 d'abord ; les 6 prix dans `wrangler.toml` avant de vendre).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| F-1 (corrigé) | Faible / confirmé | `functions/_lib/videos.js` `sendReminders` | Le compteur de la vidéo gratuite gardait une ligne par compte et par jour sans limite de durée (minimisation des données). | Lignes effacées après 100 jours, à chaque passage des rappels. Test « reminders… » : la ligne du 01/07 disparaît. Politique de confidentialité FR/EN complétée. |
| F-2 (accepté, par conception) | Moyen / confirmé | `src/app.js` `fvClaim`, `exportOne` | L'export se fait dans le navigateur : un gratuit qui modifie le code de la page peut sauter la demande du jeton (comme il pourrait déjà retirer le logo de fin). Le serveur compte et refuse honnêtement, il ne peut pas empêcher un export local. Si le serveur ne répond pas, l'export n'est pas bloqué (choix : ne pas punir une panne). | Rien côté serveur ne dépend du jeton. À reconsidérer seulement si le contournement devient visible dans les chiffres (tableau de bord : vidéos gratuites du jour). |
| F-3 (accepté) | Faible / confirmé | `functions/_lib/entitlements.js` `planOfSub` | Un abonnement dont le prix n'est ni dans `wrangler.toml` ni marqué `{"plan": …}` dans Paddle compte comme Pro (règle de la première offre). Seul le propriétaire crée des prix ; la page n'achète que des prix listés dans la config, donc présents dans la table. Un avertissement est écrit dans les journaux. | Chef de projet : remplir les 6 `PADDLE_PRICE_*` avant d'ouvrir la vente. Vérifier après le premier achat test : `subscriptions.plan` rempli. |

Contrôles vérifiés (aucun problème trouvé) :
- Droits : un seul tableau `FEATURES` (fonction → plus petite formule) ; `requirePlan` sur sauvegarde en ligne (toutes les routes
  `/api/projects*`), paroles auto, « Parler à un humain » (création et écriture). Refus `403 pro_required` avec `need`.
  Quotas tirés de `LIMITS` par formule (paroles 20/60 par jour, 20/100 Go). Testé pour chaque formule.
- Webhook : la formule vient du prix (table serveur) ou du `custom_data` **du prix** (catalogue Paddle, réglé par le
  propriétaire), jamais du `custom_data` de la transaction que le client peut remplir au paiement. Événement signé (inchangé).
- `POST /api/paddle/change` : compte connecté, JSON + Origin (test : 403 depuis un autre site), 10 par heure ; l'abonnement est
  choisi **par le serveur** parmi ceux du compte (actif, pas en retard de paiement, pas en fin) ; le prix vient de la table
  serveur, jamais du client ; `on_payment_failure: prevent_change` ; la formule ne change qu'au webhook. Testé (même formule 409,
  formule inconnue 400, sans abonnement 404, non connecté 401, prix absent 409).
- `POST /api/videos/claim` : compte obligatoire (401), id de vidéo validé (8-40 caractères sûrs), 60 par heure, une seule ligne
  par compte et jour de Paris (clé primaire + `ON CONFLICT DO NOTHING` : deux exports simultanés ne passent pas tous les deux).
  Jeton aléatoire stocké. Jour de Paris vérifié été / hiver / changement d'heure.
- Désabonnement : clé aléatoire de 24 octets par compte, comparée en temps constant ; mauvaise clé ou compte inconnu → même
  404 (pas d'énumération). `GET` n'affiche qu'un bouton (un robot de messagerie qui ouvre le lien ne désabonne pas) ; `POST`
  (bouton ou « un clic » RFC 8058) désabonne. Pas de contrôle Origin ici, volontairement : la clé du lien est l'autorisation.
  Page sous CSP stricte (`default-src 'none'`, `form-action 'self'`, `frame-ancestors 'none'`), `noindex`, `no-store`,
  `no-referrer` ; valeurs échappées.
- Rappels : seulement aux comptes qui ont coché la case (décochée par défaut), adresse vérifiée, au plus 1 par jour (réservation
  du jour par `UPDATE … WHERE` avant l'envoi : deux passages simultanés n'envoient pas deux fois), le lendemain d'une vidéo
  gratuite, arrêt après 7 jours sans visite, jamais à un abonné, de 10 h à 21 h (Paris). En-têtes `List-Unsubscribe`.
  `POST /api/cron/reminders` : même secret que le nettoyage (`CRON_SECRET`, 404 sinon).
- `PATCH /api/me {reminders}` : booléen exigé (400 sinon), JSON + Origin. Inscription : `reminders: true` strict.
- Requêtes SQL toutes liées (`bind`) ; aucune concaténation de valeur venue du client.
- Glaçon d'aide : le nom de formule passé à l'IA vient d'une liste fermée.
- Tableau de bord : lecture seule, derrière Cloudflare Access (inchangé).
- Suppression du compte : lignes `free_videos` effacées aussi. Testé.

Dependencies: aucune dépendance ajoutée ni modifiée. Contrôle d'avis de sécurité : NOT RUN (sans objet).

Secrets hygiene: aucune clé ni mot de passe ajouté. Les identifiants `pri_…` de `wrangler.toml` sont publics (ils servent au
paiement côté navigateur). Inspection du diff : PASS.

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 70/70 (7 nouveaux : table des formules, droits par formule, changement de formule, vidéo du jour, heure de Paris, rappels et désabonnement, tableau de bord) |
| Formules, vidéo du jour, rappel (page) | PASS | `tests/ui/plans_ui.py` sur `tests/ui/cloud-server.mjs` | 38/38, 390 et 1280 px, FR/EN, sans défilement horizontal ni erreur |
| « Parler à un humain » (Max) + tableau de bord | PASS | `tests/ui/support_ui.py` sur `tests/ui/server.mjs` | 39/39 |
| Glaçon d'aide + version claude.ai | PASS | `tests/ui/help_ui.py` | 42/42 |
| Galerie (sauvegarde Pro) | PASS | `tests/ui/gallery_ui.py` | 40/40 |
| Lecture du diff serveur | PASS | `git diff origin/main -- functions/ migrations/ workers/` | voir ci-dessus |
| Vrai Paddle (achat, changement de formule), vrai Resend | NOT RUN | — | à vérifier en sandbox après publication |

Coverage / residual risk: comportement réel de Paddle sur `PATCH /subscriptions` (prorata, échec de paiement) vérifié sur la
documentation, pas en sandbox ; délivrabilité des rappels (Resend, quotas d'envoi) non testée ; F-2 est une limite connue d'un
export fait sur l'appareil.

CEO handoff: Chef de projet — migration 0008 avant de publier ; créer les 3 produits / 6 prix en sandbox, les mettre dans
`wrangler.toml` et STATUS ; redéployer le Worker `workers/cloud-cleanup` (nouveaux horaires des rappels) ; tester un achat Basic,
un passage Pro → Max et un désabonnement par le lien d'un vrai e-mail.
