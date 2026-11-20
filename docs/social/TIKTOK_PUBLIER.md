# « Publier sur TikTok » et « Mes stats » (Réseaux sociaux, 21/11/2026)

Branche `social/tiktok-publier`. Demande du Chef de projet du 21/11 (0 h 17). Pour la vidéo de démo de la validation TikTok :
`docs/social/DEMO_TIKTOK.md`. Revue de sécurité : `docs/appsec-review-tiktok-publier.md`.

## Décisions

- **« Publier sur TikTok » est réservé à Stalak Pro** (réponse du propriétaire le 21/11, **change la décision « ouvert à tout le
  monde » de 0 h 20**). Raison : les règles de TikTok interdisent à une appli d'ajouter un filigrane ou un logo promotionnel sur la vidéo
  publiée (« API Clients should not add promotional watermarks/logos to creators' content », Content Sharing Guidelines). Les vidéos
  gratuites ont le filigrane Stalak ; les vidéos Pro n'en ont pas. Le serveur refuse aussi un compte gratuit (`plan_required`), et
  l'app refuse d'envoyer une vidéo qui porte le filigrane.
- **« Mes stats »** : aperçu gratuit (abonnés, j'aime, nombre de vidéos, les 10 dernières vidéos avec vues et j'aime). Analyse
  détaillée Pro, sur toutes les vidéos du compte, faites avec Stalak ou non : jour et heure qui marchent, durée, hashtags, vidéos
  Stalak contre les autres, réactions par vue, 3 meilleures et 3 moins vues. **« Le passage du son »** seulement pour les vidéos publiées
  depuis Stalak (Stalak garde le nom du son, le début et la fin du passage au moment de l'envoi) : TikTok ne donne pas la courbe de
  rétention par l'API. Réponse du propriétaire : « Ce qui est vrai ».
- Jamais de promesse : la page dit « Ces chiffres montrent ce qui a marché sur ton compte jusqu'ici. Ils ne garantissent pas de vues ».
  Un groupe de moins de 3 vidéos est marqué « pas assez de vidéos pour conclure ».
- **Brouillon** (`video.upload`) fait : « Envoyer en brouillon dans TikTok » (la personne finit dans l'appli TikTok). La permission
  `video.upload` reste donc dans la demande de validation.
- **Envoi du fichier** : par morceaux (`FILE_UPLOAD`) à travers le serveur de Stalak, pas d'adresse temporaire sur stalak.app. Plus
  simple (rien à stocker sur R2, rien à effacer), suit le guide de TikTok, et marche de la même façon en brouillon.

## Comment ça marche

1. **Relier** : page « Ton compte » → carte TikTok → « Relier TikTok » (petite fenêtre TikTok, Login Kit). Une fois relié : avatar,
   nom, « Mes stats », « Délier ». Aussi dans le menu du compte : « TikTok · Mes stats ».
2. **Publier** : fin d'export → « Publier sur TikTok » (sous « Enregistrer la vidéo » ; étiquette PRO pour un compte gratuit, qui
   ouvre la page des formules). Le formulaire suit les Content Sharing Guidelines :
   - 1a nom du compte TikTok (creator_info demandé **à chaque ouverture et à chaque envoi**) ; 1b si TikTok refuse (limite du jour),
     message clair ; 1c durée maximale du compte vérifiée.
   - 2a légende modifiable (2200 caractères) ; 2b « Qui peut voir la vidéo ? » **sans choix par défaut**, seulement les choix
     donnés par TikTok ; 2c Commentaires / Duo / Collage **décochés**, grisés si le compte les interdit.
   - 3a « Contenu commercial » désactivé par défaut ; une fois activé, il faut choisir « Ta marque » et/ou « Contenu de marque » ;
     étiquette affichée (« Contenu promotionnel » / « Partenariat rémunéré ») ; 3b contenu de marque ⇒ « Seulement moi » impossible.
   - 4 phrase de consentement avec le lien « Music Usage Confirmation » (et « Branded Content Policy » pour le contenu de marque).
   - 5 aperçu de la vidéo ; rien n'est envoyé avant le bouton « Publier » ; puis barre d'envoi, « TikTok prépare ta vidéo, ça peut
     prendre quelques minutes », suivi du statut, et « Voir sur TikTok » une fois publiée.
3. **Serveur** (`functions/_lib/tiktok.js`) :
   - `GET /api/tiktok/creator` → creator_info (Pro, permission `video.publish`).
   - `POST /api/tiktok/publish` → revérifie tout (consentement, visibilité, durée, contenu commercial, titre), puis init TikTok
     (direct : `/v2/post/publish/video/init/` ; brouillon : `/v2/post/publish/inbox/video/init/`). Garde l'adresse d'envoi chiffrée.
   - `PUT /api/tiktok/publish/:id/chunk/:n` → morceaux de 10 Mo (dernier jusqu'à 20 Mo), dans l'ordre, transmis à TikTok
     (`Content-Range`). Adresse d'envoi effacée à la fin.
   - `GET /api/tiktok/publish/:id` → statut (au plus un appel à TikTok toutes les 3 s), lien de la vidéo publiée.
   - `GET /api/tiktok/stats` → user/info (`user.info.stats`) + video/list (`video.list`). Gratuit : 10 vidéos ; Pro : jusqu'à 100 et l'analyse.
4. **Base** : table `tiktok_posts` (migration `0018_tiktok_posts.sql`), effacée quand on délie TikTok ou supprime son compte.

## Ce que dit la doc de TikTok (vérifié le 21/11)

- Content Sharing Guidelines : https://developers.tiktok.com/doc/content-sharing-guidelines (points 1a à 5e repris ci-dessus).
- creator_info : https://developers.tiktok.com/doc/content-posting-api-reference-query-creator-info (20 demandes / min).
- Direct Post : https://developers.tiktok.com/doc/content-posting-api-reference-direct-post — « unaudited clients » : vidéos privées seulement
  (`unaudited_client_can_only_post_to_private_accounts`) ; 6 demandes / min.
- Brouillon : https://developers.tiktok.com/doc/content-posting-api-reference-upload-video (5 brouillons en attente / 24 h).
- Envoi par morceaux : https://developers.tiktok.com/doc/content-posting-api-media-transfer-guide (5 à 64 Mo, dernier ≤ 128 Mo,
  1000 morceaux au plus, dans l'ordre, adresse valable 1 h).
- Statut : https://developers.tiktok.com/doc/content-posting-api-reference-get-video-status (30 / min).
- user/info : https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info ; video/list : https://developers.tiktok.com/doc/tiktok-api-v2-video-list.

## Avant la validation et la mise en ligne

- Migration 0018 dans D1 **avant** la mise en ligne ; `SOCIAL_CONNECT_ENABLED = "1"` (Chef de projet, à la fusion).
- Tant que l'appli n'est pas validée : clés du bac à sable, seul @stalak_app (testeur) peut relier, et seulement « Seulement moi ».
  L'app le dit clairement si TikTok refuse une vidéo publique.
- Juridique (6) : page de confidentialité (données lues sur TikTok, envoi des vidéos, effacement en déliant).
- Après validation : le propriétaire remplace les clés du bac à sable par celles de Production dans Cloudflare.
