# Audit technique de Stalak (30/10/2026)

Révision lue : `main` au commit `d3db23f`. Lecture seule, rien n'a été modifié dans le dépôt.
Skills utilisés : `anthropic-skills:appsec-review` (méthode de la revue de sécurité).
Contrôles faits : lecture du code (`functions/`, `src/app.js`, `site_src/_headers`, `wrangler.toml`, `migrations/`), tests serveur lancés depuis une copie (`node tests/backend/run.mjs` : **70/70 réussis**), poids des fichiers mesurés dans `public/`.
Pas pu faire : rien vérifié sur le vrai site (stalak.app n'est pas joignable depuis ma machine), pas de test sur un vrai iPhone, pas de vérification des forfaits Cloudflare et Resend du compte.
Je n'ai pas repris ce que les revues `docs/appsec-review-*.md` ont déjà corrigé ou accepté (filigrane retiré dans le navigateur, prix inconnu compté comme Pro, etc.).

Ce qui va bien (vérifié) : signature du webhook Paddle (HMAC, 5 min, anti-doublon), CSRF (type JSON + Origin), cookies `HttpOnly; Secure; SameSite=Lax`, mots de passe PBKDF2 avec le même temps de réponse que le compte existe ou non, codes e-mail hachés (5 essais), OAuth Google (state + nonce + PKCE + cookie de liaison), tableau de bord protégé deux fois (Cloudflare Access + jeton vérifié par le serveur + CSP stricte), clés R2 toujours fabriquées par le serveur avec l'id du compte, quota réservé en une seule requête, limites par compte et par IP sur presque toutes les routes. Aucun secret trouvé dans le code (les valeurs de `wrangler.toml` sont publiques par nature).

---

## Classement (du plus important au moins important)

### 1. Un pack (ou un long clip) peut faire planter Safari sur iPhone, car tout est gardé en mémoire
- **Quoi / où** : toute la vidéo est fabriquée en mémoire vive (RAM), sans rien écrire sur le disque.
  - `src/app.js:6874` et `:7280` : `Mp4Muxer.ArrayBufferTarget` + `fastStart:'in-memory'`. Le fichier entier est en mémoire, puis copié une 2e fois dans un `Blob` (`:7497`, `:7559`).
  - `src/app.js:7298` : la seule limite est « plus de 1 200 Mo de morceaux encodés ». C'est bien trop haut pour un iPhone : un onglet Safari est en général fermé par iOS bien avant (ordre de grandeur 1 à 2 Go selon le modèle ; à mesurer).
  - `src/app.js:7559` : dans un pack, les N vidéos finies restent toutes en mémoire jusqu'au zip (`makeZip`, `:7587`).
  - Rien ne limite la durée du passage pour un pack : `src/app.js:2944` met le passage sur toute la chanson quand `nBars === 0`, et `exportPackRun` (`:7534`) ne vérifie pas la durée.
  - Calcul : 30 vidéos × 3 min × 8 Mbit/s ≈ 30 × 180 Mo ≈ **5,4 Go**. Même 10 vidéos d'1 min, c'est environ 600 Mo de vidéos plus les morceaux encodés.
- **Risque** : l'onglet se recharge en plein export (« Un problème est survenu avec la page »). Le montage peut être perdu, sans message clair. Ça touche d'abord Creator Plus, la formule la plus chère (packs de 5 à 30).
- **À faire** :
  - (a) court terme : une limite de mémoire selon l'appareil (par exemple 300 à 400 Mo sur iPhone/iPad au lieu de 1 200), qui vérifie aussi « nombre de vidéos × taille estimée ». Au-delà, proposer un passage plus court ou moins de vidéos.
  - (b) libérer chaque morceau dès qu'il est dans le fichier.
  - (c) moyen terme : écrire dans un fichier temporaire du navigateur (OPFS, avec `StreamTarget` / `FileSystemWritableFileStreamTarget` de mp4-muxer) au lieu de la mémoire, et faire le zip au fil de l'eau. À valider sur iPhone : je n'ai pas vérifié ce que Safari iOS accepte pour l'écriture en continu.
  - Test : un pack de 30 sur une chanson de 3 min, sur un iPhone de 4 Go de RAM.
- **Effort** : moyen pour (a)+(b), gros pour (c). **Responsable** : App & montage. **Gravité** : critique.

### 2. Les quotas gratuits de Cloudflare peuvent couper tout le serveur le jour d'un succès
- **Quoi / où** :
  - Chaque page ouverte envoie un « signe de vie » à `/api/presence` **toutes les minutes** (`src/app.js:8790-8796`, `functions/_lib/metrics.js:21`). Chaque envoi fait 1 requête de fonction serveur et au moins 1 écriture dans la base D1.
  - BACKEND.md (§13 et ligne 331) parle de l'offre gratuite (100 000 requêtes et 100 000 écritures par jour, environ 1 600 heures de visite par jour). Je n'ai pas pu vérifier le forfait réel du compte.
- **Risque** : une vidéo TikTok qui marche (par exemple 6 000 visiteurs × 20 min), et le quota du jour est épuisé. Toutes les routes `/api/*` répondent alors en erreur jusqu'à minuit UTC : connexion, inscription, paroles auto, sauvegarde, webhook Paddle (Paddle réessaie, mais les abonnés attendent leurs avantages). Le site reste visible, mais tout ce qui touche au compte et au paiement tombe.
- **À faire** :
  - prendre **Workers Paid (5 $/mois) avant le lancement aux États-Unis** ;
  - espacer le signe de vie (toutes les 3 à 5 min) ou laisser Cloudflare Web Analytics compter les visites ;
  - activer les alertes d'usage et de facturation dans Cloudflare (Workers, D1, Workers AI).
- **Effort** : petit. **Responsable** : Comptes / paiements / serveur (achat du forfait : le propriétaire). **Gravité** : critique (si le compte est encore en gratuit).

### 3. E-mails de code : aucune limite globale, et un code peut ne jamais partir
- **Quoi / où** :
  - Les limites sont seulement par connexion (20/h) et par adresse (5/h) (`functions/_lib/auth.js:54-55`, `:313-314`). Il n'y a ni plafond global par jour, ni anti-robot (Turnstile) à l'inscription ou sur « mot de passe oublié ».
  - Le plan Resend n'est pas indiqué. L'offre gratuite de Resend est d'environ 100 e-mails par jour (à vérifier dans le compte).
  - Bug : `issueCode` (`auth.js:57-61`) enregistre le code **avant** de l'envoyer. Si Resend échoue (`email.js:70-73`, erreur 502), un nouvel essai dans les 30 s répond « code envoyé » (`auth.js:49-52`), alors qu'aucun e-mail n'est parti.
- **Risque** :
  - un robot avec beaucoup d'IP envoie des codes à des adresses au hasard. Le quota Resend s'épuise et plus personne ne peut s'inscrire ni se connecter sur un nouvel appareil ;
  - la réputation du domaine baisse (spam), et les vrais codes finissent en indésirables ;
  - un pic d'inscriptions honnêtes suffit aussi à dépasser 100 par jour.
- **À faire** :
  - forfait Resend payant avant le lancement ;
  - plafond global par jour (`limit(env, 'send:all:<jour>', …)`) avec un e-mail d'alerte au propriétaire ;
  - Cloudflare Turnstile (gratuit) sur l'inscription et « mot de passe oublié » ;
  - en cas d'échec d'envoi, effacer la ligne `auth_codes` (ou remettre `created_at` à 0) ;
  - test serveur : « Resend en panne → le 2e essai renvoie vraiment un e-mail ».
- **Effort** : petit à moyen. **Responsable** : Comptes / paiements / serveur. **Gravité** : important.

### 4. Le propriétaire ne peut pas mesurer le parcours visite → export → pub → abonnement
- **Quoi / où** : le tableau de bord (`functions/_lib/admin.js:92-109`) montre les visites, les inscrits, les abonnements, les paiements et les remboursements, les paroles auto, l'aide, les sauvegardes et les messages. Les compteurs du jour existent seulement pour `help_q, help_fail, cloud_save, ticket, ticket_msg` (`metrics.js:9`). Il n'y a **aucune mesure** de :
  - export commencé, réussi ou raté (et pourquoi) ;
  - pub proposée, affichée ou récompensée ;
  - écran des formules ouvert (et quelle raison : filtre, Clip, pack…) ;
  - paiement Paddle ouvert.

  Les erreurs d'export restent dans le journal local (`diag`) et n'arrivent jamais au serveur.
- **Risque** : impossible de savoir si les gratuits exportent vraiment, combien regardent la pub, quel cadenas fait payer, et si l'export plante sur certains iPhone (voir points 1 et 5). On pilote les revenus à l'aveugle.
- **À faire** :
  - ajouter une route `POST /api/event {name}` : liste fermée de noms, limitée par IP comme `presence`, sans cookie ni identifiant, qui appelle `bump()` ;
  - ajouter ces noms à `METRICS` et une ligne « entonnoir » au tableau de bord : visites → export ok → pub récompensée → paiement ouvert → abonnés ;
  - pour un export raté, envoyer une **catégorie** d'erreur (mémoire, décodeur, annulé, onglet caché) et le type d'appareil (iOS ou autre), rien de personnel ;
  - le texte de confidentialité est à revoir avec Juridique (simples compteurs, rien sur la personne).
- **Effort** : moyen. **Responsable** : Marketing & croissance (définir les étapes) + Comptes / serveur (route et tableau) + App & montage (envois). **Gravité** : important.

### 5. Export : rien ne gère l'écran qui se verrouille ou le changement d'appli
- **Quoi / où** : `src/app.js` n'utilise ni `navigator.wakeLock` ni `visibilitychange` pendant l'export (le seul `visibilitychange` est celui des visites, `:8796`). Il n'y a pas non plus d'avertissement `beforeunload` pendant un export (celui de `:10073` concerne la sauvegarde auto). Le chemin « temps réel » (`renderRealtime`, `:7356`) dépend de `requestAnimationFrame`, qui s'arrête dès que l'onglet est caché.
- **Risque** : un export de pack dure plusieurs minutes. L'iPhone se met en veille ou la personne va sur TikTok : iOS met la page en pause et peut reprendre l'encodeur vidéo. L'export échoue (« codec reclaimed »), ou la vidéo « temps réel » sort avec des images figées. Tout est à refaire. Le texte d'aide (`:8561`) dit seulement « laisser l'onglet ouvert ».
- **À faire** :
  - demander un `wakeLock('screen')` pendant l'export (Safari iOS 16.4 et plus) ;
  - sur `visibilitychange` caché : en temps réel, arrêter proprement et le dire ; en image par image, mettre en pause puis reprendre, ou relancer avec un message clair (« reste sur Stalak pendant l'export ») ;
  - `beforeunload` pendant l'export ;
  - compter ces cas dans le point 4.
- **Effort** : petit à moyen. **Responsable** : App & montage. **Gravité** : important.

### 6. Aucun test automatique avant la mise en ligne, et les versions d'essai écrivent dans la vraie base
- **Quoi / où** : pas de dossier `.github/` ni d'autre CI. Chaque push sur `main` est publié par Cloudflare sans lancer `tests/backend/run.mjs`. `wrangler.toml:53` : les déploiements d'aperçu (toutes les branches poussées par les conversations) utilisent **la même base D1, le même R2 et les mêmes secrets** que la production.
- **Risque** :
  - une erreur qui casse la connexion ou le webhook part en ligne sans être vue ;
  - le code d'une branche pas finie (sur `*.stalak-site.pages.dev`) peut lire la vraie base et, pour les routes sans contrôle d'Origin (webhook, cron, OAuth), y écrire ;
  - la règle « une migration avant le déploiement » n'est pas contrôlée.
- **À faire** :
  - une GitHub Action qui lance `node tests/backend/run.mjs` à chaque push et bloque la fusion si un test échoue ;
  - une base D1 et un R2 « preview » séparés (`[env.preview]` dans `wrangler.toml`) ;
  - ou, à défaut, couper les aperçus de branches dans Cloudflare Pages.
- **Effort** : petit. **Responsable** : Comptes / paiements / serveur. **Gravité** : important.

### 7. Passage aux vrais paiements Paddle : les abonnements de test restent dans la base
- **Quoi / où** : les tables `subscriptions`, `payments` et `refunds` n'ont pas de colonne « test ou réel » (`migrations/*.sql`). Le passage en production ne change que des variables (`wrangler.toml` : `PADDLE_ENV`, jeton, prix ; secret du webhook).
  - Les abonnements sandbox restent « actifs » jusqu'à leur fin de période + 3 jours (`entitlements.js:59-67`) : un an pour un annuel de test.
  - Les paiements de test restent dans le revenu du tableau de bord.
  - La suppression de compte appelle l'API Paddle **de production** pour arrêter un abonnement sandbox (`router.js:177-180`, `paddle.js:198`). Ça répond en erreur, et `deleteAccount` s'arrête en 502 : la personne **ne peut plus supprimer son compte**, alors que c'est une obligation légale. C'est déduit du code ; le cas « Paddle répond en erreur » n'est pas testé.
- **À faire** :
  - une liste de contrôle « passage en production » : vider `subscriptions`, `payments`, `refunds` et `webhook_events` des lignes sandbox (ou ajouter une colonne `env`), changer les 4 prix et le secret ensemble, puis faire un vrai achat de 7,99 $ remboursé ;
  - dans `deleteAccount`, ne pas bloquer si Paddle dit « déjà annulé » ou « introuvable » (le noter dans le journal et continuer) ;
  - test serveur.
- **Effort** : petit. **Responsable** : Comptes / paiements / serveur. **Gravité** : important.

### 8. Pas de sauvegarde de la base, pas d'alerte en cas de panne
- **Quoi / où** :
  - Les erreurs du serveur ne vont que dans `console.error` (`http.js:25`, `email.js:71`, `paddle.js:178`, `lyrics.js:179`). Rien dans `wrangler.toml` n'active des journaux gardés (`[observability]`), et il n'y a aucune alerte.
  - Aucune sauvegarde de D1 ou de R2 n'est décrite dans BACKEND.md. D1 a « Time Travel », un retour en arrière automatique : 7 jours en gratuit, 30 en payant, mais la marche à suivre n'est écrite nulle part. R2 n'a pas de sauvegarde, et la règle des 6 mois ou `dropUnusedFiles` effacent pour de bon.
- **Risque** : une panne de Resend, de Workers AI ou de Paddle, ou un bug après une mise en ligne, et personne ne le sait avant les plaintes. Une fausse manœuvre dans la console D1 (une migration collée à la main) peut effacer les comptes et les abonnements sans copie récente.
- **À faire** :
  - activer les journaux Workers / Pages et une alerte e-mail sur les erreurs 5xx ;
  - activer les alertes d'échec de webhook dans Paddle ;
  - une copie de D1 chaque semaine (`wrangler d1 export stalak --remote`), rangée hors de Cloudflare ;
  - écrire dans BACKEND.md comment revenir en arrière avec Time Travel ;
  - avant chaque migration collée à la main, faire une copie.
  - R2 : accepter le risque (c'est une sauvegarde de confort), mais le dire.
- **Effort** : petit. **Responsable** : Comptes / paiements / serveur. **Gravité** : important.

### 9. Les fichiers gardés « pour toujours » par le navigateur ne seront pas mis à jour
- **Quoi / où** : `site_src/_headers:19-23` : `/vendor/*` et `/fonts/*` sont gardés un an par le navigateur (`immutable`), mais leurs noms ne changent jamais (`mp4box.all.min.js`, `mp4-muxer.min.js`, `rubik.ttf`…). La page, elle, est rechargée à chaque visite (`no-cache`).
- **Risque** : le jour où une de ces bibliothèques d'export est mise à jour (par exemple pour la mémoire, point 1), les visiteurs déjà venus gardent l'ancienne version avec la nouvelle page. L'export peut alors casser pour eux seulement, et c'est très difficile à comprendre.
- **À faire** : mettre la version ou une empreinte dans le nom (`mp4-muxer.5.x.min.js` ou `?v=<hash>` ajouté par `build_site.py`), ou passer à `max-age=86400` sans `immutable`.
- **Effort** : petit. **Responsable** : App & montage. **Gravité** : utile.

### 10. Premier chargement lourd sur mobile
- **Quoi / où** (mesuré) :
  - `public/index.html` pèse 1,03 Mo, environ **350 Ko compressé** (gzip) : 756 Ko de JavaScript et 162 Ko de CSS dans la page ;
  - 2 scripts bloquent l'affichage dans `<head>` (`index.html:36-37`) : mp4box (256 Ko) et mp4-muxer (31 Ko). Ils ne servent qu'à l'import et à l'export ;
  - polices en TTF, pas en WOFF2 : Rubik 173 Ko, TikTok Sans 706 Ko, Unbounded 581 Ko…, chargées quand le style de paroles les utilise ;
  - code mort : le son de fin `ICE_MP3`, 24 Ko en base64 (`src/app.js:6850`). La fin de 3 s est abandonnée (`outroOn()` renvoie toujours `false`, `:6738`).
- **Risque** : un visiteur qui arrive de TikTok avec la 4G attend plus longtemps avant de voir la page. Ça peut lui faire quitter l'accueil avant même l'import.
- **À faire** :
  - `defer` sur les 2 scripts du `<head>`, ou mieux, les charger au premier import ;
  - convertir les polices en WOFF2 (de -30 à -50 %) et précharger seulement Rubik et Lilita One ;
  - retirer `ICE_MP3` et le code de la fin de 3 s ;
  - plus tard : réduire (minifier) le JS au build.
- **Effort** : petit (scripts, polices, code mort) à moyen (minification). **Responsable** : App & montage. **Gravité** : utile.

### 11. Pas de CSP ni de HSTS sur le site public
- **Quoi / où** : `site_src/_headers:1-5` contient nosniff, Referrer-Policy, Permissions-Policy et X-Frame-Options, mais **ni `Content-Security-Policy` ni `Strict-Transport-Security`**. Le tableau de bord, lui, a une CSP stricte (`functions/admin/[[path]].js:24`). La page charge du code tiers : Google Ad Manager (`securepubads.g.doubleclick.net`, `app.js:6009`) et Paddle (`cdn.paddle.com`, `account.js`). Je n'ai pas pu vérifier si Cloudflare ajoute déjà HSTS au niveau du domaine.
- **Risque** : faible aujourd'hui, car les cookies sont `HttpOnly`. Mais sans CSP, un script de pub compromis ou une faille d'affichage pourrait agir sur la page connectée (lancer un paiement, lire les projets par l'API).
- **À faire** : HSTS (`max-age=31536000; includeSubDomains`). Puis une CSP en mode `Report-Only` pendant 2 semaines, qui liste les domaines de Paddle, de Google Ad Manager et du consentement, avant de l'activer pour de bon.
- **Effort** : petit (HSTS) à moyen (CSP, à cause des scripts dans la page et des pubs). **Responsable** : Comptes / paiements / serveur. **Gravité** : utile.

### 12. Les envois sans taille annoncée sont lus en entier avant d'être refusés
- **Quoi / où** : `functions/_lib/http.js:69-74` (`readText`) : sans `Content-Length`, tout le corps est lu (`arrayBuffer()`) avant le contrôle de taille. Ça touche les routes ouvertes sans compte : `/api/help/chat`, `/api/presence`, `/api/auth/*`. Le même défaut a déjà été corrigé pour les couvertures (`readCapped`, revue `menu-galerie` G-1), mais pas ici.
- **Risque** : un robot envoie de gros corps « en morceaux ». Chaque requête peut remplir la mémoire de la fonction (128 Mo) et faire échouer d'autres requêtes en même temps. L'effet reste limité.
- **À faire** : utiliser `readCapped` dans `readText`. Test : « corps sans taille de 1 Mo sur /api/presence → 413 ».
- **Effort** : petit. **Responsable** : Comptes / paiements / serveur. **Gravité** : utile.

### 13. Les tests d'interface ne tournent que sur Chrome, jamais sur Safari
- **Quoi / où** : `tests/ui/*.py` utilisent Playwright Chromium (aucun fichier ne cite `webkit`). Aucun test ne fait un export long ou un pack en mesurant la mémoire. Côté serveur, 70 tests, tous réussis, mais aucun ne simule une panne de Resend (point 3) ou une erreur de Paddle à la suppression du compte (point 7).
- **Risque** : les bugs propres à Safari (décodeur qui lâche, WebP non pris en charge, mémoire) ne se voient que sur l'iPhone du propriétaire, alors que c'est la cible n°1.
- **À faire** :
  - lancer les tests d'interface aussi avec Playwright WebKit (proche de Safari, pas identique) ;
  - un test « pack de 10 sur 1 min » qui vérifie la taille et le temps ;
  - une courte liste de contrôle manuelle sur iPhone avant chaque mise en ligne qui touche l'export ;
  - les 2 tests serveur cités plus haut.
- **Effort** : moyen. **Responsable** : App & montage (interface) + Comptes / serveur (tests serveur). **Gravité** : utile.

### 14. Coûts : pas d'alerte de dépense pour Workers AI et R2
- **Quoi / où** :
  - Paroles auto : limites par compte bien en place (20 ou 60 par jour et minutes par jour, `lyrics.js:128-135`, et 200 par heure). Mais il n'y a pas de plafond **global** par jour, contrairement à l'aide (60 par jour).
  - R2 : jusqu'à 100 Go par Creator Plus (`cloud.js:21`), soit environ 1,50 $ par mois par compte plein au prix public R2. Ça reste rentable à 14,99 $.
  - Sauvegarde auto : jusqu'à 900 écritures D1 par heure et par compte (`router.js:114`).
- **Risque** : faible à court terme. Avec beaucoup d'abonnés Pro qui utilisent les paroles auto chaque jour, la facture Workers AI monte sans prévenir.
- **À faire** : alertes de facturation Cloudflare (déjà dans le point 2), et peut-être un plafond global des paroles par jour avec un e-mail au propriétaire si on l'atteint.
- **Effort** : petit. **Responsable** : Comptes / paiements / serveur. **Gravité** : utile.

---

## Note pour App (bug « la vidéo précédente continue de jouer et le 2e export est très lent »)
La cause se voit dans le code :
- `beginExport()` (`src/app.js:7391-7392`) masque `#result`, mais **ne met jamais en pause et ne vide jamais `#resultVideo`**. Aucun `pause()` sur cet élément dans tout `app.js`. Un élément `<video>` masqué (`hidden`) continue de jouer, avec le son.
- Pendant le 2e export, ce lecteur garde donc un décodeur vidéo matériel. L'iPhone n'en a que peu en même temps. Les décodeurs de l'export échouent ou passent par le « lecteur vidéo » (chemin lent : le journal affiche « images par le lecteur vidéo » ou « décodeur en échec »).
- L'ancien `lastBlob` (la vidéo d'avant) reste aussi en mémoire tout le temps du nouvel export.

Correction proposée, au début de `beginExport()` :
```js
const rv = $('#resultVideo');
rv.pause();
if (rv.src) URL.revokeObjectURL(rv.src);
rv.removeAttribute('src');
rv.load();
lastBlob = null;
```
À confirmer sur iPhone avec « Copier les infos pour l'équipe » avant et après.

---

## Résumé en 5 lignes
1. Le plus urgent pour l'App : les packs et les longs exports gardent tout en mémoire (jusqu'à plusieurs Go) et peuvent faire planter Safari iPhone. Il faut une limite selon l'appareil, puis une écriture en continu.
2. Le plus urgent pour le serveur : passer Cloudflare en Workers Paid et espacer le « signe de vie » des visites, sinon un pic de visites peut couper connexion, paiements et paroles pour la journée.
3. E-mails de code : forfait Resend payant, plafond global, anti-robot (Turnstile) et correction du code « envoyé » qui n'est jamais parti.
4. Le propriétaire ne peut pas encore mesurer export → pub → paiement : il faut quelques compteurs anonymes (`/api/event`) et une ligne « entonnoir » au tableau de bord.
5. Avant les vrais paiements : tests automatiques avant chaque mise en ligne, base séparée pour les aperçus, nettoyage des abonnements de test, copie de D1 chaque semaine et alertes d'erreurs.
