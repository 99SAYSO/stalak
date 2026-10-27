# AppSec review — tableau de bord privé + « Parler à un humain » (branche `compte/tableau-de-bord`)

Scope / authority: dépôt `99SAYSO/stalak`, base `main` @ `d997e9b`, cible = branche `compte/tableau-de-bord`.
Fichiers serveur : `functions/_lib/admin.js`, `admin-page.js`, `support.js`, `metrics.js`, `functions/admin/[[path]].js`,
`paddle.js` (paiements, remboursements), `router.js` (routes, suppression de compte), `help.js` (compteurs), `oauth.js`
(`jwksFor` exporté), migration `0006_admin_support.sql`. Client : bloc d'aide de `src/app.js`, `markup.html`, `theme.css`.
Revue locale (faux D1, faux Access, faux Resend). Aucun service réel appelé. Exclus : la configuration Cloudflare Access
elle-même (faite par le propriétaire), Cloudflare, Paddle, Resend.

Threat model:
- Biens : données des comptes (e-mails, abonnements, paiements), messages et e-mails des visiteurs, boîte e-mail du
  propriétaire (notifications), quota D1 gratuit (100 000 écritures/jour), réputation (e-mails envoyés au nom de Stalak).
- Acteurs : visiteur anonyme, abonné, robot (plusieurs IP), site tiers (CSRF), quelqu'un qui atteint les routes d'admin
  par un autre nom d'hôte (`stalak.app`, `*.pages.dev`), quelqu'un qui a passé Access avec un autre e-mail.
- Entrées : `GET|POST /api/admin/*` et `GET /admin/` (hôte d'admin), `GET /api/support/status`,
  `POST /api/support/tickets`, `GET|POST /api/support/tickets/:id[/messages]` (jeton), `POST /api/presence`,
  webhooks Paddle `transaction.completed`, `adjustment.*` (signés).
- Frontières : Cloudflare Access (bord) → Function (vérifie de nouveau le jeton Access) → D1 ; navigateur du visiteur
  (jeton de ticket) → Function → D1 → Resend (e-mails au propriétaire et au visiteur).

Release advice: **proceed within reviewed scope** — après la migration 0006 et la configuration Access (BACKEND.md, étape 13).

| ID | Gravité / confiance | Fichier | Conditions / impact | Correction / test |
|---|---|---|---|---|
| A1 | Élevée si absent / contrôle confirmé | `admin.js` `requireAdmin` | Les routes d'admin vivent dans le même projet que le site : sans contrôle, `stalak.app/api/admin/*` ou `*.pages.dev` les exposeraient (Access ne protège que `admin.stalak.app`). | Contrôle **dans le code** : hôte = `ADMIN_HOST`, jeton `Cf-Access-Jwt-Assertion` RS256 vérifié avec les clés publiées de l'équipe (`/cdn-cgi/access/certs`, rechargées si la clé tourne), `iss`, `aud`, `exp`, `nbf`, e-mail dans `ADMIN_EMAILS`. Réglage manquant = 404. Tests : autre hôte, jeton forgé, autre e-mail, autre `aud`, autre `iss`, expiré, futur, sans `exp`, `alg: none`, charge modifiée, clé inconnue, domaine d'équipe hors `cloudflareaccess.com`. |
| A2 | Moyenne / confirmé, **corrigé** | `support.js` (lecture), `admin.js` (`live`) | Chaque vérification du visiteur (toutes les 5 s en conversation) écrivait 2 lignes (compteur + « vu ») ; le tableau de bord ouvert, 1 ligne toutes les 10 s. Risque d'user le quota D1 gratuit. | « Vu » écrit au plus toutes les 4 s, sans ligne de limite par lecture ; présence du propriétaire écrite au plus toutes les 30 s. Tests serveur repassés. |
| A3 | Moyenne / confirmé, **corrigé** | `support.js` `deliverReply` | Un visiteur qui fermait la page juste avant ta réponse était encore compté « présent » (45 s) : pas d'e-mail, réponse perdue. | Réponse non récupérée par sa page en 20 s → e-mail (rattrapage à chaque rafraîchissement du tableau de bord) ; « jamais » respecté. Test : « catch-up ». |
| A4 | Faible / hypothèse acceptée | `support.js` | Un robot à plusieurs IP peut créer des conversations (200/jour pour le site, 5/h et 20/jour par connexion, 2 000 caractères) et ainsi encombrer la liste et la base. Les e-mails au propriétaire sont plafonnés (1 par conversation par 15 min, 50/jour). | Accepté pour le lancement. Si besoin : Cloudflare Turnstile sur « Parler à un humain ». |
| A5 | Faible / hypothèse acceptée | `admin.js` (GET `live`, GET `tickets/:id`) | Ces lectures ont des effets mineurs (présence du propriétaire, « lu », envoi des réponses en retard). Un autre site ne peut les déclencher qu'avec le cookie Access envoyé en sous-requête (SameSite le bloque par défaut) et ne lit pas la réponse (pas de CORS). | Aucune action ; garder le cookie Access en SameSite Lax (réglage par défaut). |
| A6 | Faible / hypothèse acceptée | `support.js` | L'e-mail laissé par le visiteur n'est pas vérifié : quelqu'un peut mettre l'adresse d'un autre. Seules **tes** réponses écrites à la main y partent (aucun e-mail automatique au visiteur), donc pas de relais de spam. | Aucune action ; à garder ainsi. |
| A7 | Info | `metrics.js` | Visites : nombre au hasard tiré par la page, sans cookie ni IP stockée ; nouvelles visites limitées à 60/h par connexion (compteur IP haché, comme ailleurs). | — |

Autres vérifications sans finding :
- **XSS** : tout texte venant d'un visiteur est affiché avec `textContent` (bulle et tableau de bord), échappé dans les
  e-mails HTML (`esc`) ; tableau de bord sous CSP stricte (`default-src 'none'`, script et style par nonce aléatoire à
  chaque page, `frame-ancestors 'none'`), `no-store`, `noindex`. Test : nonce nouveau à chaque page, aucune erreur CSP dans
  le navigateur (Playwright).
- **CSRF** : routes du visiteur = JSON + `Origin` du site (règle commune) ; routes d'admin = JSON + `Origin` égal à
  l'adresse du tableau de bord. Tests.
- **Tickets** : identifiant de 128 bits, jeton de 256 bits dont seul le SHA-256 est gardé, envoyé en en-tête
  (`X-Ticket-Token`, pas dans l'adresse) ; mauvais jeton = 404 identique à « inconnu ». Tests.
- **E-mails** : adresses vérifiées par motif (pas de retour à la ligne possible), sujet fixe, envoi par l'API JSON de
  Resend ; e-mail au propriétaire envoyé à `SUPPORT_EMAIL` (défaut contact@stalak.app).
- **Paiements** : écrits seulement depuis les webhooks signés de Paddle ; montants vérifiés comme entiers ; remboursements
  ordonnés par date d'événement. Tests.
- **Données personnelles** : conversations effacées avec le compte, sur demande (bouton Supprimer) et 6 mois après le
  dernier message ; paiements gardés (comptabilité) sans lien vers le compte supprimé. Politique de confidentialité FR/EN
  complétée (à relire par Juridique).
- **Journaux** : aucun contenu de message ni adresse e-mail écrit dans les journaux.

Dependencies: aucune ajoutée (pas de `package.json`).
Secrets hygiene: aucun secret ni adresse personnelle dans le code (recherche de motifs de clés et d'adresses sur le diff :
0 résultat). `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` et `ADMIN_EMAILS` se saisissent dans Cloudflare (type Secret conseillé).

| Check | Statut | Commande | Résultat |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 62/62 (5 nouveaux) |
| Scénario complet (visiteur, tableau de bord, réponses, direct) | PASS | `tests/ui/support_ui.py` | 34/34, téléphone 390 et ordinateur 1280, FR et EN |
| Bulle d'aide | PASS | `tests/ui/help_ui.py` | 42/42 |
| Paroles auto | PASS | `tests/ui/lyrics_ui.py` | 85/85 |
| Version claude.ai | PASS | idem | se charge ; pas de bouton « Parler à un humain » |
| Sauvegarde en ligne (interface) | NOT RUN | `tests/ui/test_cloud.py` | demande des vidéos VP9 absentes du dépôt ; seul ajout côté serveur : un compteur, couvert par les tests serveur |
| Vrai Cloudflare Access | NOT RUN | — | à vérifier après configuration : `https://admin.stalak.app/admin/` (ton e-mail) et `https://stalak.app/admin/` (404) |

Coverage / residual risk: configuration d'Access (une règle trop large serait rattrapée par la liste `ADMIN_EMAILS`) ;
quota gratuit des Functions (100 000 requêtes/jour) consommé aussi par le signal de présence (1 par minute et par page
ouverte) : à surveiller si l'audience grandit.

Handoff: Chef de projet (migration 0006, réglages, Access, fusion, vérification) ; Juridique (paragraphes ajoutés à la
politique de confidentialité) ; Comptes (Turnstile si spam).
