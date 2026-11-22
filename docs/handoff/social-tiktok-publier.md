Statut : PRÊT
Branche : social/tiktok-publier
Maquette : https://social-tiktok-publier.stalak-site.pages.dev

Résumé :
« Publier sur TikTok » (publication directe + brouillon) et « Mes stats », demande du Chef de projet du 21/11 (0 h 17).
- **Décision changée par le propriétaire (21/11)** : Publier est **réservé à Stalak Pro** (TikTok interdit qu'une appli ajoute un
  filigrane ; seules les vidéos Pro n'en ont pas). Remplace « ouvert à tout le monde » (0 h 20). Le serveur le vérifie aussi.
- App (stalak.app seulement, module à part `src/tiktok.js` + `src/tiktok.css`) : carte TikTok dans « Ton compte » (Relier ;
  une fois relié : avatar, nom, « Mes stats », « Délier »), « TikTok · Mes stats » dans le menu du compte, bouton « Publier sur TikTok »
  à la fin de l'export (sous Enregistrer / Partager ; PRO → page des formules pour un compte gratuit).
- Formulaire selon les Content Sharing Guidelines : nom du compte (creator_info à chaque ouverture et à chaque envoi), aperçu,
  légende modifiable, visibilité sans choix par défaut, Commentaires / Duo / Collage décochés (grisés si interdits), contenu commercial
  (Ta marque / Contenu de marque, étiquettes, pas de « Seulement moi » pour le contenu de marque), phrase de consentement (Music Usage
  Confirmation, Branded Content Policy), rien n'est envoyé avant « Publier », barre d'envoi, suivi du statut, « Voir sur TikTok ».
  Mode brouillon (`video.upload`) : la vidéo arrive dans la boîte de réception TikTok.
- Envoi : par morceaux de 10 Mo à travers le serveur de Stalak (FILE_UPLOAD), pas d'adresse temporaire sur R2.
- « Mes stats » : gratuit = abonnés, j'aime, nombre de vidéos, 10 dernières vidéos (vues, j'aime) + encadré Pro ;
  Pro = analyse sur toutes les vidéos (jusqu'à 100) : vues médianes, réactions par vue, jour, heure, durée, hashtags, Stalak ou non,
  3 meilleures / 3 moins vues, passage du son pour les vidéos publiées depuis Stalak. Phrase : les chiffres ne garantissent pas de vues.
- Script plan par plan de la vidéo de démo : `docs/social/DEMO_TIKTOK.md` (Sandbox, compte Pro, les 5 permissions sur stalak.app).

Fichiers touchés :
- nouveaux : `functions/_lib/tiktok.js`, `migrations/0018_tiktok_posts.sql`, `src/tiktok.js`, `src/tiktok.css`, `tests/ui/tiktok_ui.py`,
  `docs/social/TIKTOK_PUBLIER.md`, `docs/social/DEMO_TIKTOK.md`, `docs/appsec-review-tiktok-publier.md`, ce compte rendu.
- modifiés : `functions/_lib/social.js` (permissions TikTok, liste des permissions accordées, nettoyage en déliant / à la suppression du
  compte), `functions/_lib/router.js` (partagé, 3 lignes : import, CSRF des morceaux en octets, route `/api/tiktok/*`),
  `functions/_lib/entitlements.js` (Comptes, 1 ligne : `tiktok: 'pro'`), `src/app.js` (partagé : bloc de traductions
  `_bloc.social.tiktok` FR/EN, `tiktok` dans FEAT_PLAN et WHY_FEATURE, pont en lecture seule `window.StalakApp` juste avant
  `applyLang();` à la fin), `build_site.py` (charge tiktok.js et tiktok.css), `tests/backend/run.mjs`, `docs/STATUS.md`, `public/` reconstruit.

Migration SQL (à coller dans la console D1 AVANT la mise en ligne, après 0005) :
```sql
CREATE TABLE IF NOT EXISTS tiktok_posts (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  publish_id      TEXT NOT NULL,
  mode            TEXT NOT NULL,
  status          TEXT NOT NULL,
  fail_reason     TEXT,
  upload_url_enc  TEXT,
  video_size      INTEGER NOT NULL,
  chunk_size      INTEGER NOT NULL,
  chunk_count     INTEGER NOT NULL,
  chunks_done     INTEGER NOT NULL DEFAULT 0,
  privacy         TEXT,
  post_id         TEXT,
  creator_username TEXT,
  meta_json       TEXT,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  checked_at      INTEGER,
  expires_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS tiktok_posts_user ON tiktok_posts(user_id, created_at);
CREATE INDEX IF NOT EXISTS tiktok_posts_post ON tiktok_posts(user_id, post_id);
```

Tests :
- serveur `node tests/backend/run.mjs` : 112/112 (dont 5 tests TikTok : refus éteint / non relié / gratuit, règles revérifiées côté
  serveur, morceaux et plages, statut, lien exact (id 64 bits), brouillon, « Seulement moi » avant audit, adresse expirée, limite,
  nettoyage en déliant, adresse d'envoi hors TikTok refusée, plan des morceaux, stats gratuit / Pro).
- interface `python3 tests/ui/tiktok_ui.py public` : 184/184 (iPhone 390 px et ordinateur 1280 px, FR et EN, gratuit et Pro, sans
  défilement de côté, aucune erreur).
- `node --check src/app.js`, `python3 build.py` (version claude.ai) : OK.
- Revue de sécurité (skill appsec-review) : `docs/appsec-review-tiktok-publier.md` — 1 correction faite (adresse d'envoi limitée aux
  serveurs d'envoi de TikTok), à mettre en ligne dans le périmètre revu.

Reste au Chef de projet / au propriétaire :
1. Migration 0018 dans D1 avant la mise en ligne ; `SOCIAL_CONNECT_ENABLED` à "1" à la fusion (prévu).
2. Sur la maquette, TikTok ne marche pas (pas de clés ni d'adresse de retour) : le vrai essai se fait après fusion, en Sandbox, avec
   @stalak_app et « Seulement moi » (appli non auditée : l'app l'explique si TikTok refuse le public).
3. Tourner la vidéo de démo (`docs/social/DEMO_TIKTOK.md`), avec un compte **Pro**, puis l'envoyer dans la demande de validation.
4. Juridique (6) : page de confidentialité (profil, chiffres et liste des vidéos lus sur TikTok ; vidéos envoyées ; effacement en déliant).
5. Après validation TikTok : le propriétaire remplace les clés Sandbox par celles de Production dans Cloudflare.
6. Pour App (info) : le pont `window.StalakApp` est en fin de `src/app.js`, juste avant `applyLang();` (la sonde des tests y reste).
