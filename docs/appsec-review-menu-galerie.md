# AppSec review — compte/menu-galerie (menu du compte + Galerie avec couvertures)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/menu-galerie` contre `main` 89b2d30, copie de travail locale.
Fichiers serveur relus : `functions/_lib/cloud.js` (`projectCover`, `readCapped`, `coverUrl`), `functions/_lib/router.js`
(liste des projets, route `cover`, CSRF), `migrations/0007_project_covers.sql`. Côté page : `src/account.js` (`setCover`),
`src/app.js` (menu, grille, fabrication de la couverture). Environnement : tests locaux seulement (faux D1 node:sqlite, faux R2).
Exclus : vrai Cloudflare (R2, D1, cache), Paddle, aucun service tiers contacté.

Threat model:
- Biens : projets et couvertures des comptes Pro (image du montage, donc potentiellement le visage de l'utilisateur), espace R2, quota.
- Acteurs : visiteur anonyme, compte gratuit, ex-Pro, autre compte Pro, site tiers (CSRF), image piégée envoyée à la place d'une couverture.
- Entrées : `PUT /api/projects/:id/cover` (corps brut), `GET /api/projects/:id/cover?v=`, `GET /api/projects` (champ `coverUrl`).
- Frontières : navigateur → Pages Function (cookie de session + Origin), Function → D1 (requêtes liées), Function → R2 (clé construite par le serveur).
- Flux : la page dessine une image du montage (canvas, 300 px, WebP ou JPEG ≤ 64 Ko) → PUT → contrôles → R2 `u/<compte>/p/<projet>/cover`
  → `projects.cover_at` → la liste renvoie l'URL versionnée → `<img src>` de la Galerie.

Release advice: proceed within reviewed scope (après la migration 0007 dans D1).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| G-1 (corrigé) | Faible / confirmé | `functions/_lib/cloud.js` `projectCover` (PUT) | Sans `Content-Length`, le corps entier était lu en mémoire avant le refus « trop grand » (jusqu'à la limite de la plateforme). Compte Pro requis, 120 envois par heure. | `readCapped` arrête la lecture au-delà de 64 Ko. Test serveur « size not announced » → 413. |
| G-2 (prévu) | Moyen si oublié / confirmé | `functions/_lib/router.js` liste des projets | Si la version est publiée **avant** la migration 0007, `SELECT … cover_at` échoue : la Galerie répond une erreur (aucune fuite). | Ordre de mise en ligne dans le compte rendu : migration d'abord. Vérifier `GET /api/projects` après publication. |
| G-3 (accepté) | Info | `cloud.js` couverture | Les couvertures (≤ 64 Ko × 200 projets ≈ 13 Mo par compte au plus) ne comptent pas dans le quota de 20 Go. | Rien à faire : borné par le nombre de projets (200) et la taille. |

Contrôles vérifiés (aucun problème trouvé) :
- Accès : toutes les routes `/api/projects*` passent par `requireUser` puis `requirePro` (`router.js`, début de `projects()`) : anonyme 401, gratuit et ex-Pro 403 `pro_required`. Le projet doit appartenir au compte (`WHERE user_id = ?1 AND id = ?2`) : un autre compte reçoit 404, en lecture comme en écriture.
- Clé R2 construite par le serveur à partir de l'id du compte et d'un id de projet validé (`PROJECT_ID`, 1 à 64 caractères `[A-Za-z0-9_-]`) ; `cover` ne peut pas entrer en collision avec un id de fichier (8 à 64 caractères). `..%2Fother` → 400/404.
- Type : seulement `image/jpeg` et `image/webp`, et les premiers octets doivent correspondre (`sniffImage`, déjà utilisé pour les avatars) : un SVG ou un HTML déguisé → 415. Réponse GET servie avec le type enregistré (liste fermée), `nosniff`, `Content-Security-Policy: default-src 'none'; sandbox`, `Cross-Origin-Resource-Policy: same-origin`, `Cache-Control: private` (jamais dans un cache partagé).
- CSRF : PUT accepté seulement avec `Content-Type` image/jpeg|webp **et** `Origin` = le site (`checkCsrf`) ; un formulaire d'un autre site ne peut envoyer ni l'un ni l'autre. Test : Origin `https://evil.example` → 403 `bad_origin`.
- Limite : 120 couvertures par heure et par compte (`limit`).
- Effacement : la couverture est sous le préfixe du projet, donc effacée avec le projet (`deleteProjectMedia`), avec le compte (`deleteUserMedia`) et par la règle des 6 mois (même chemin). Le nettoyage des fichiers inutilisés (`dropUnusedFiles`) part des lignes D1 et ne touche pas la couverture. Testé.
- Page : le nom du projet est inséré comme texte (`textContent`), l'adresse de l'image vient du serveur ; les seuls `innerHTML` ajoutés sont des icônes fixes. Le menu « … » et le menu du compte n'exécutent que des actions fixes.
- Ex-Pro : accès coupé, couverture gardée tant que le projet est gardé (6 mois), revient avec Pro. Testé.

Dependencies: aucune dépendance ajoutée ni modifiée (`package.json` / verrous inchangés). Contrôle d'avis de sécurité : NOT RUN (sans objet).

Secrets hygiene: aucune clé, aucun mot de passe ajouté. Inspection du diff : PASS (aucune valeur secrète).

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur (dont « galerie: covers… ») | PASS | `node tests/backend/run.mjs` | 63/63 |
| Parcours Galerie (gratuit, ex-Pro, Pro, 390 et 1280 px, FR/EN) | PASS | `python3 tests/ui/gallery_ui.py http://localhost:<port>` sur `tests/ui/cloud-server.mjs` | 40/40, sans défilement horizontal, sans erreur de page |
| Glaçon d'aide + version claude.ai | PASS | `tests/ui/help_ui.py` | 42/42 |
| Tableau de bord / « Parler à un humain » (non touchés) | PASS | `tests/ui/support_ui.py` | 39/39 (après fusion de main 016500b) |
| Lecture du diff serveur | PASS | `git diff main -- functions/ migrations/` | voir tableau ci-dessus |
| Vrai R2 / D1 / cache Cloudflare | NOT RUN | — | à vérifier après publication (une sauvegarde, la couverture s'affiche, un autre compte reçoit 404) |

Coverage / residual risk: le vrai cache de Cloudflare n'est pas testé (`private` doit l'empêcher de garder l'image) ; la fabrication de la couverture dans Safari iPhone (WebP non pris en charge par `toBlob` → repli JPEG) est testée seulement dans Chromium.

CEO handoff: Chef de projet — coller `migrations/0007_project_covers.sql` dans la console D1 **avant** de publier ; après publication, une sauvegarde depuis un iPhone Pro doit montrer sa couverture dans la Galerie.
