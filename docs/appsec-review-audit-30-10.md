# AppSec review — compte/audit (audit du 30/10 : signe de vie, e-mails de code, Turnstile, entonnoir, avant les vrais paiements, formules, rappel annuel)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/audit` partie de `main` 6e69613 ; copie de travail locale.
Serveur relu : `functions/_lib/auth.js` (plafond, échec d'envoi, Turnstile), `turnstile.js`, `alerts.js`, `metrics.js` (`/api/event`,
signe de vie), `paddle.js` (colonne `env`, premier paiement, statut Paddle des erreurs), `entitlements.js` (`payEnv`), `router.js`
(garde des aperçus, alertes 5xx, suppression de compte, tâches du jour, config), `admin.js` / `admin-page.js` (entonnoir, santé,
filtre `env`), `reminders.js`, `cloud.js`, `workers/cloud-cleanup/`, `migrations/0009_audit.sql`, `.github/workflows/*.yml`,
`wrangler.toml`. Page : `src/account.js` (Turnstile, `event`), bloc compte de `src/app.js`, appels d'entonnoir dans l'export et la pub.
Environnement : tests locaux (faux D1 node:sqlite, faux R2 ; Paddle, Resend et Turnstile imités). Exclus : vrai Cloudflare,
vrai Paddle, vrai Turnstile, GitHub Actions réelles (pas lancées d'ici).

Threat model:
- Biens : le quota Resend et la réputation du domaine, le quota Cloudflare (requêtes, écritures D1), les droits payants, la
  base D1 (comptes, abonnements), sa copie hebdomadaire, la boîte du propriétaire (alertes).
- Acteurs : robot avec beaucoup d'IP, visiteur anonyme, abonné, page d'aperçu d'une branche, GitHub (Actions), Paddle (webhook).
- Entrées nouvelles : `POST /api/event` (anonyme), `turnstile` dans l'inscription et le mot de passe oublié, réponses
  d'erreur de Paddle, nom d'hôte des aperçus, tâches du jour, secrets GitHub de la copie.
- Frontières : navigateur → Functions (JSON + Origin) ; Functions → Resend / Paddle / Turnstile (`siteverify`) ; GitHub Actions →
  API Cloudflare (jeton D1) → artefact chiffré.

Release advice: proceed within reviewed scope (migration 0009 d'abord).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| A-1 (corrigé) | Important / confirmé | `functions/_lib/auth.js` `issueCode` | Un code enregistré puis jamais envoyé (Resend en panne) : un 2e essai dans les 30 s répondait « code envoyé » sans e-mail. | Échec d'envoi → la ligne `auth_codes` de cet essai est effacée, alerte au propriétaire. Test « Resend down ». |
| A-2 (corrigé) | Important / confirmé | `auth.js` | Aucun plafond global : un robot multi-IP épuisait le quota Resend. | `EMAIL_DAILY_MAX` (1 000 par défaut, 503 `email_busy` au-delà), alertes 80 % / 100 % ; Turnstile (si clés) sur inscription et mot de passe oublié, action vérifiée. Tests « daily ceiling », « Turnstile ». |
| A-3 (corrigé) | Important / confirmé (déduit du code) | `router.js` `deleteAccount` | En production, un abonnement de test (ou déjà arrêté) faisait échouer la suppression du compte (502) : droit légal bloqué. | Seuls les abonnements de l'environnement Paddle en cours sont arrêtés ; 404 ou « déjà arrêté » (400/409/422 avec code d'annulation) n'empêchent plus la suppression (alerte) ; 401/403/5xx bloquent toujours (personne ne paie sans le savoir). Test. |
| A-4 (corrigé) | Important / confirmé | `paddle.js`, `entitlements.js`, `admin.js` | Les abonnements et paiements de test auraient gardé des droits (jusqu'à 1 an) et faussé le revenu après le passage en production. | Colonne `env` (migration 0009), filtrée partout (droits, tableau de bord, portail, suppression, rappel). Test « test and real payments ». |
| A-5 (atténué) | Important / confirmé | `router.js` `dispatch` | Les aperçus de branches partagent la vraie base : webhook, tâches du jour, changement de formule et suppression de compte y écrivaient pour de vrai. | Garde `isPreviewHost` → 403 `preview_readonly` tant que `PREVIEW_ISOLATED` ≠ `1` ; bloc `[env.preview]` prêt (base et bucket à créer par le propriétaire). Reste : inscriptions et projets d'un aperçu vont encore dans la vraie base (accepté jusqu'à la base séparée). Test. |
| A-6 (corrigé) | Moyen / confirmé | `metrics.js`, `src/app.js` | Signe de vie toutes les minutes : 1 requête + 1 écriture par minute et par visiteur. | Toutes les 5 min (le serveur dit `every`), « en direct » 6 min 30. Test. |
| A-7 (nouveau, maîtrisé) | Faible / confirmé | `metrics.js` `event` | Route anonyme : remplissage de compteurs. | Liste fermée (noms, catégories, raisons), JSON + Origin, 120 par heure par connexion (empreinte hachée), aucun cookie ni identifiant, pas de texte libre stocké. Test (nom inconnu 400, autre Origin 403, 429). |
| A-8 (par conception) | Faible / confirmé | `turnstile.js` | Turnstile injoignable → la demande passe (sinon une panne Cloudflare bloquerait tout le monde). | Les autres limites restent (IP, adresse, jour). Test. |
| A-9 (par conception) | Faible / confirmé | `alerts.js` | Les alertes partent par Resend : si Resend est la panne, l'alerte ne part pas. | Nouvel essai à l'occurrence suivante (pas d'attente d'une heure) ; compteur `err_5xx` au tableau de bord ; conseil : alertes Cloudflare (BACKEND 15.4). |
| A-10 (maîtrisé) | Moyen / confirmé | `.github/workflows/backup-d1.yml` | Dépôt **public** : un artefact en clair exposerait toute la base. | Copie chiffrée AES-256 (openssl, PBKDF2 200 000) avant l'envoi, clair effacé (`shred`), secrets vérifiés, jeton limité à D1. Wrangler épinglé `4.149.0` (publié le 08/10/2026). |

Contrôles vérifiés :
- Alertes : aucune donnée personnelle (identifiants remplacés par `:id` dans le chemin ; test « no address in the alerts ») ; une par type et par heure, 20 par jour.
- Rappel annuel : seulement abonnements mensuels actifs, de l'environnement en cours, non programmés à l'arrêt, une fois par an
  (`reminded_at`), HTML échappé, `reply_to` support ; le Worker sans prix ne fait rien (`no_prices`). Test.
- Config publique : `auth.turnstile` = clé publique seulement si la clé secrète existe ; secret jamais renvoyé (test).
- Requêtes SQL toutes liées (`bind`). Nouvelles écritures : compteurs, `auth_codes` (effacement ciblé par `created_at`), `reminded_at`.
- Suppression de compte : supprimée seulement si Paddle dit « inconnu / déjà arrêté » ; clé refusée ou panne → rien d'effacé.
- Écran des formules : textes et ordre seulement, aucun changement du paiement.

Dependencies: aucune dépendance npm ajoutée au site. GitHub Actions : `actions/checkout@v4`, `actions/setup-node@v4`,
`actions/upload-artifact@v4` (actions officielles, tag majeur) ; `wrangler@4.149.0` dans la copie seulement. Contrôle d'avis de
sécurité en ligne : NOT RUN.

Secrets hygiene: aucune clé ni mot de passe dans le code. Nouveaux secrets à saisir par le propriétaire : `TURNSTILE_SECRET`
(Cloudflare), `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `BACKUP_PASSPHRASE` (GitHub). Inspection : PASS.

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 78/78 (8 nouveaux) |
| Écran des formules (FR 390, EN 1280) | PASS | `tests/ui/plans_ui.py` sur `tests/ui/cloud-server.mjs` | 35/35 |
| Galerie / sauvegarde auto ; « Parler à un humain » ; glaçon d'aide + claude.ai | PASS | `gallery_ui.py`, `support_ui.py`, `help_ui.py` | 49/49, 39/39, 42/42 |
| Syntaxe du tableau de bord | PASS | script de la page extrait et analysé | ok |
| Workflows GitHub (exécution réelle) | NOT RUN | — | à vérifier dans l'onglet Actions après fusion |
| Vrai Turnstile, vrai Resend, vrai Paddle production | NOT RUN | — | après publication / passage en production |

Coverage / residual risk: corps sans `Content-Length` lus en entier (audit n° 12) non traité ici ; CSP / HSTS (audit n° 11) non
traités ; validité de la syntaxe `[env.preview.ai]` de Pages à vérifier au moment d'activer le bloc ; un aperçu écrit encore les
inscriptions dans la vraie base tant que la base séparée n'existe pas.

CEO handoff: Chef de projet — migration 0009 avant de publier ; puis le propriétaire : clés Turnstile, `EMAIL_DAILY_MAX` selon
Resend, commande de build Cloudflare `node tests/backend/run.mjs`, 3 secrets GitHub de la copie, Workers Paid et alertes
Cloudflare, base `stalak-preview` (BACKEND.md 3.1, 7.1, 15).
