Statut : PRÊT
Branche : compte/audit
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` 6e69613 (audit du 30/10 : `docs/audit/2026-10-30-technique.md` n° 2, 3, 4, 6, 7, 8 ; `docs/audit/2026-10-30-ux.md` n° 7)

Résumé :
1. Signe de vie des visites (`/api/presence`) toutes les 5 minutes au lieu d'une (le serveur donne le rythme), et quand la page
   revient après une minute ; « en direct » = vu dans les 6 min 30. Cinq fois moins de requêtes et d'écritures.
2. E-mails de code :
   - plafond du jour pour tous les e-mails de code (`EMAIL_DAILY_MAX`, 1 000 par défaut) : au-delà, « réessaie demain » ; e-mail
     d'alerte au propriétaire à 80 % et à 100 % ;
   - Cloudflare Turnstile sur « Créer un compte » et « Mot de passe oublié » : prêt, s'allume quand les 2 clés sont saisies ;
   - le « code envoyé » qui n'était jamais parti : si Resend échoue, le code est oublié et le nouvel essai envoie vraiment.
3. Entonnoir : route anonyme `POST /api/event` (liste fermée, sans cookie) et bloc « Entonnoir (30 derniers jours) » au tableau de
   bord : visites → exports réussis → pubs regardées → page des formules → fenêtre de paiement → premiers paiements, avec le %
   de chaque étape, les exports ratés par catégorie, l'iPhone à part et la raison qui ouvre la page des formules. Bloc « Santé
   du serveur » (erreurs, alertes, e-mails de code). Côté App, un appel d'une ligne dans l'export, le pack et la pub.
4. Avant les vrais paiements :
   - tests : GitHub lance les tests serveur à chaque envoi ; pour bloquer une publication, commande de build Cloudflare (à régler) ;
   - aperçus : tant qu'ils partagent la vraie base, le serveur y refuse webhook, tâches du jour, changement de formule et
     suppression de compte ; bloc `[env.preview]` prêt dans `wrangler.toml` pour une base à part ;
   - abonnements de test : chaque ligne garde son environnement Paddle ; en production, les tests ne donnent plus rien et
     quittent le tableau de bord ; SQL de nettoyage et liste de contrôle dans BACKEND.md 7.1 ; la suppression d'un compte n'est
     plus bloquée par un abonnement inconnu ou déjà arrêté chez Paddle ;
   - copie de la base chaque lundi (et à la demande), chiffrée, gardée 90 jours dans GitHub ; retour en arrière Time Travel expliqué ;
   - alertes par e-mail : erreurs serveur, Resend en panne, plafond des codes, abonnement à vérifier après une suppression.
5. Écran des formules aligné sur la page Tarifs : Annuel par défaut (un abonné voit d'abord son rythme), Pro en premier et mis
   en avant (« Ni pub ni filigrane »), −47 % / −44 %, 4,17 $/mois, « dès 2 playbacks » / « from just 2 takes », « 100 GB » en
   anglais ; arrivé par un cadenas, la raison est répétée en haut de la carte.
6. Rappel annuel aux abonnés mensuels : un e-mail par an (formule, prix, comment arrêter), en anglais ou en français, avec la tâche
   du jour (Worker, ou depuis le site au plus toutes les 6 h). Le Worker a reçu les prix Paddle.

Skills utilisés : `appsec-review` (revue : `docs/appsec-review-audit-30-10.md` ; 4 corrections importantes, 1 atténuation, le reste
maîtrisé ou accepté et expliqué).

Fichiers touchés :
- nouveaux : `functions/_lib/alerts.js`, `turnstile.js`, `reminders.js`, `migrations/0009_audit.sql`, `.github/workflows/tests.yml`,
  `.github/workflows/backup-d1.yml`, `docs/appsec-review-audit-30-10.md`
- serveur : `functions/_lib/auth.js`, `metrics.js`, `router.js`, `paddle.js`, `entitlements.js`, `admin.js`, `admin-page.js`,
  `cloud.js`, `workers/cloud-cleanup/index.js` et son `wrangler.toml`, `wrangler.toml`
- page : `src/account.js`, `src/app.js` (bloc compte ; bloc de textes `_bloc.compte.audit` ; `acctEvent` + 1 ligne dans
  `beginExport`, `exportOne`, `exportPackRun`, `adWatch`, `adReward` ; signe de vie), `src/markup.html` (écran des formules),
  `src/theme.css`
- docs : `BACKEND.md` (3.1, 7.1, 7.2, 15, route `/api/event`), `docs/STATUS.md`
- tests : `tests/backend/run.mjs` (8 tests ajoutés), `tests/ui/plans_ui.py`
- `public/` reconstruit

Migration SQL : **oui, `migrations/0009_audit.sql`**, à coller dans la console D1 AVANT de publier :

    ALTER TABLE subscriptions ADD COLUMN env TEXT NOT NULL DEFAULT 'sandbox';
    ALTER TABLE payments ADD COLUMN env TEXT NOT NULL DEFAULT 'sandbox';
    ALTER TABLE refunds ADD COLUMN env TEXT NOT NULL DEFAULT 'sandbox';
    ALTER TABLE subscriptions ADD COLUMN started_at INTEGER;
    ALTER TABLE subscriptions ADD COLUMN reminded_at INTEGER;

Cinq colonnes ajoutées, rien d'effacé. Toutes les lignes actuelles sont des tests : elles sont marquées `sandbox`. À ne lancer qu'une fois.

Tests (sur la branche) :
- `node tests/backend/run.mjs` : 78/78 (Resend en panne puis nouvel essai, plafond du jour, Turnstile, entonnoir, test/réel,
  suppression de compte et erreurs Paddle, rappel annuel, aperçus)
- `tests/ui/plans_ui.py` : 35/35 (FR 390 px, EN 1280 px : annuel par défaut, Pro en premier, −47 %, 2 takes, 100 GB, raison visible)
- `tests/ui/gallery_ui.py` : 49/49 ; `tests/ui/support_ui.py` : 39/39 ; `tests/ui/help_ui.py` : 42/42 (dont la version claude.ai)
- sans défilement horizontal, sans erreur de page, FR et EN
- non lancé : les workflows GitHub (après fusion, onglet Actions), vrai Turnstile, vrai Paddle production

Ordre de mise en ligne (Chef de projet) :
1. migration 0009 dans la console D1 ;
2. fusion et publication ;
3. redéployer le Worker : `npx wrangler deploy -c workers/cloud-cleanup/wrangler.toml` (s'il est déployé ; sinon la tâche du jour
   tourne depuis le site) ;
4. vérifier : tableau de bord (blocs « Entonnoir » et « Santé du serveur »), écran des formules.

Reste au propriétaire (rien à me donner, tout se saisit dans Cloudflare ou GitHub ; BACKEND.md 3.1, 7.1, 15) :
- Cloudflare : passer à Workers Paid (5 $/mois) et activer les alertes d'usage et de facturation ;
- Resend : forfait payant avant le lancement, puis `EMAIL_DAILY_MAX` à sa limite du jour ;
- Turnstile : créer le widget, clé publique dans `wrangler.toml` (`TURNSTILE_SITE_KEY`), clé secrète `TURNSTILE_SECRET` dans Cloudflare ;
- Cloudflare Pages : commande de build `node tests/backend/run.mjs` et variable `NODE_VERSION` = `22` ;
- GitHub : secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `BACKUP_PASSPHRASE` (la noter aussi ailleurs) ;
- plus tard : base `stalak-preview` et bucket `stalak-media-preview`, puis donner l'identifiant au Chef de projet.

À signaler :
- App & montage : les appels `acctEvent` sont posés dans `beginExport`, `exportOne`, `exportPackRun`, `adWatch`, `adReward` (une
  ligne chacun) ; à garder en modifiant ces fonctions. `pack.need3` (« au moins 3 playbacks ») reste à changer avec le passage à 2.
- Juridique : politique de confidentialité à compléter (compteurs anonymes de l'entonnoir, Cloudflare Turnstile).
- Marketing : textes de l'écran des formules repris de la page Tarifs ; « Pubs regardées » = pub demandée puis récompensée.
- Non traités (pas dans la demande) : audit technique n° 11 (CSP / HSTS), n° 12 (corps sans taille), n° 14 (plafond des paroles).
