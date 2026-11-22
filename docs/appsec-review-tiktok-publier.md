# AppSec review — social/tiktok-publier (21/11/2026)

Scope / authority : dépôt 99SAYSO/stalak, branche `social/tiktok-publier`, base `57e4016` (main), état de travail de la branche.
Fichiers revus : `functions/_lib/tiktok.js` (nouveau), `functions/_lib/social.js` (permissions TikTok, nettoyage à la déconnexion),
`functions/_lib/router.js` (routes `/api/tiktok/*`, CSRF de l'envoi par morceaux), `functions/_lib/entitlements.js` (une ligne),
`migrations/0018_tiktok_posts.sql`, `src/tiktok.js` et `src/tiktok.css` (client), le pont `window.StalakApp` en fin de `src/app.js`.
Environnement : tests locaux seulement (faux D1 node:sqlite, faux TikTok). Aucun appel réel à TikTok, aucun scan d'un système en ligne.
Hors champ : `social.js` côté relier / jetons (revu le 27/10 : `docs/appsec-review-social-connect.md`), Paddle, le reste de l'app.

## Threat model

- **Biens** : le jeton d'accès TikTok de chaque personne (chiffré en base), l'adresse d'envoi TikTok (`upload_url`, vaut une autorisation
  d'écrire une vidéo sur le compte pendant 1 h), le compte TikTok lui-même (publier en son nom), les vidéos, les chiffres du compte.
- **Acteurs** : la personne connectée (gratuite ou Pro), une autre personne connectée (veut agir sur l'envoi de quelqu'un d'autre),
  un site tiers (CSRF), TikTok (réponses lues comme non fiables), quelqu'un qui modifierait une réponse en route.
- **Entrées** : `GET /api/tiktok/creator`, `POST /api/tiktok/publish` (JSON), `PUT /api/tiktok/publish/:id/chunk/:n` (octets bruts),
  `GET /api/tiktok/publish/:id`, `GET /api/tiktok/stats?tz=`. Réponses JSON de TikTok (creator_info, init, status, user/info, video/list).
- **Frontières** : navigateur → Worker Stalak (session + CSRF) ; Worker → TikTok (jeton Bearer) ; Worker → hôte d'envoi TikTok (PUT) ;
  réponses TikTok → base D1 → page (affichage).

## Release advice : proceed within reviewed scope

Une correction faite pendant la revue (R1). Le reste : contrôles en place, risques résiduels notés plus bas.

| ID | Gravité / confiance | Fichier | Conditions / impact | Correction / test de non-régression |
|---|---|---|---|---|
| R1 | Moyenne / hypothèse (corrigée) | `functions/_lib/tiktok.js` (`uploadUrl`) | L'adresse d'envoi venait de la réponse de TikTok, vérifiée seulement « https ». Si cette réponse était changée en route (ou un faux serveur en test mal réglé), le Worker aurait envoyé la vidéo de la personne vers un autre serveur (fuite + requête sortante choisie par un tiers). | Seuls les hôtes `open-upload*.tiktokapis.com` sont acceptés, sinon refus `tt_error` sans rien envoyer. Test serveur : « an upload address outside TikTok's upload hosts is never used ». |
| R2 | Faible / confirmé (accepté) | `tiktok.js` `publishChunk` | Chaque morceau (10 à 20 Mo) passe en mémoire du Worker. Limité : Pro seulement à la création, 10 envois par heure, taille ≤ 2 Go, morceaux dans l'ordre et à la taille exacte, adresse valable 55 min. | Rien à faire maintenant ; à surveiller dans les quotas Cloudflare si l'usage monte. |
| R3 | Info | `tiktok.js` `publishChunk` | Le plan n'est pas revérifié à chaque morceau : quelqu'un qui perd Pro pendant un envoi peut le finir. | Accepté (l'envoi a été autorisé au départ, il dure au plus 55 min). |

## Contrôles vérifiés

| Contrôle | Statut | Méthode | Preuve |
|---|---|---|---|
| Accès aux envois d'autrui (IDOR) | PASS | Lecture : `ownPost` (`WHERE id = ? AND user_id = ?`, id `ttp_` + 24 hex) pour morceaux et statut | test « chunks / status » : un autre compte reçoit 404 |
| Publier réservé à Pro (serveur, pas seulement l'app) | PASS | `requirePlan(env, user, 'tiktok')` sur creator et publish | test « free refused » (403 `plan_required`) ; test UI : gratuit → page des formules, aucun appel à `/api/tiktok/creator` |
| Consentement explicite exigé côté serveur | PASS | `consent === true` sinon 400 | test serveur |
| Règles TikTok revérifiées côté serveur (creator_info frais à chaque envoi) | PASS | durée max, visibilité dans `privacy_level_options`, contenu de marque ≠ privé, titre ≤ 2200, interactions coupées si interdites | tests serveur « server-side rule checks » |
| CSRF | PASS | `router.js` : JSON obligatoire, sauf `PUT …/chunk/:n` en `application/octet-stream` avec contrôle d'Origin (`checkCsrf`) | test serveur « bad origin » existant + morceaux |
| Adresse d'envoi chiffrée, puis effacée | PASS | `sealToken` AES-GCM avec AAD `user:tiktok:upload:id` ; `upload_url_enc = NULL` à la fin, à l'expiration ou en échec | migration 0018 + tests |
| Permissions TikTok vérifiées par fonction | PASS | `needScope` (video.publish / video.upload / user.info.stats + video.list) | test « missing permission » (409 `tt_scope`) |
| Sortie vers la page (XSS) | PASS | client : tout en `textContent` ; liens et images seulement `https://` (`httpsUrl`) ; id de vidéo publiée lu en chiffres seulement ; nom d'utilisateur `encodeURIComponent` | lecture de `src/tiktok.js` |
| Précision des id TikTok (int64) | PASS | id lu dans le texte brut de la réponse | test : lien `…/video/7311111111111111111` exact |
| Messages d'erreur | PASS | codes TikTok connus → texte Stalak ; sinon générique ; journal = code + log_id seulement (jamais le jeton ni l'adresse d'envoi) | lecture `ttFail` |
| Limites de débit | PASS | creator 20/min, envoi 10/h, stats 30/h, statut ≥ 3 s entre deux appels à TikTok | tests serveur |
| Suppression des données | PASS | Délier TikTok ou supprimer le compte efface `tiktok_posts` ; `ON DELETE CASCADE` | test « unlink cleanup » |
| Nouvelles dépendances | PASS | `git diff` de `package.json` / lockfile : aucun changement | — |
| Secrets dans le code | PASS | recherche de motifs de clés dans le diff : rien ; les clés restent dans Cloudflare | — |
| Avis de sécurité des dépendances | NOT RUN | aucune dépendance ajoutée | — |
| Essai réel contre TikTok (bac à sable) | NOT RUN | les maquettes Cloudflare n'ont pas les clés TikTok ; à faire après fusion, en mode Sandbox | voir `docs/social/DEMO_TIKTOK.md` |

## Coverage / residual risk

- Le parcours réel (fenêtre TikTok, envoi vers `open-upload.tiktokapis.com`, statut) n'est testé qu'avec un faux TikTok qui suit la doc.
  Premier essai réel : bac à sable, compte testeur @stalak_app, visibilité « Seulement moi » (appli non auditée).
- Le texte de la légende est envoyé tel quel à TikTok (c'est la légende de la personne) ; TikTok peut le refuser (`spam_risk_text`, message clair).
- Les vignettes et avatars viennent des serveurs de TikTok (affichés avec `referrerpolicy=no-referrer`).

## Handoff

- Chef de projet : appliquer `migrations/0018_tiktok_posts.sql` dans D1 avant la mise en ligne ; passer `SOCIAL_CONNECT_ENABLED` à `"1"` à la fusion (déjà prévu).
- Juridique (6) : la page de confidentialité doit citer les données lues sur TikTok (profil, chiffres, liste des vidéos) et l'envoi des vidéos.
