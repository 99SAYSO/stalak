# Stalak — état du projet

> Tenu à jour par le Chef de projet. Chaque conversation le lit avant de commencer et met à jour sa section sur sa branche à la fin de chaque tâche.
> Dernière mise à jour : 27/10/2026 (fusion et mise en ligne : assistant d'aide, connexion TikTok/Instagram éteinte, état des lieux juridique).

## En ligne (stalak.app)
- App de montage FR/EN : son, prises, paroles, montage, export, packs, effets, mode Clip.
- Caméra iPhone : minuteur, message « prise enregistrée », miroir de la caméra selfie, fichier vidéo remis en ordre.
- Comptes v3 :
  - e-mail + mot de passe, code de vérification, appareils de confiance ;
  - Google ;
  - profil avec photo et pseudo ;
  - page compte, page Stalak Pro, remerciement et slides après l'achat.
- Stalak Pro (Paddle **sandbox**) :
  - fonctions réservées : sans logo, Clip, packs, tailles et apparitions du texte, paroles auto, sauvegarde en ligne ;
  - un ancien Pro perd l'accès à ses projets en ligne.
- Paroles automatiques (Workers AI, Whisper large-v3-turbo) : marchent bien sur de vraies chansons.
- Sauvegarde en ligne (R2 `stalak-media`) : en place, à faire tester par le propriétaire.
- Assistant IA de la bulle d'aide (Workers AI, Gemma 4) : ouvert à tous, 60 questions par jour pour tout le site (`HELP_DAILY_MAX`).
- Connexion TikTok / Instagram côté serveur : en place mais **éteinte** (`SOCIAL_CONNECT_ENABLED = "0"`), en attente des applis TikTok/Meta et des 5 secrets.
- Pages : tarifs, conditions, remboursement, confidentialité, mentions légales (FR/EN), avec des animations glacées.

## En cours
- Rien. La précision des paroles auto est en ligne : voix mise en avant, contexte entre les morceaux, import de la voix seule. Seuils à vérifier sur de vraies chansons via les infos techniques (« centre / mix »).
- Rien.
- **Assistant d'aide, réponses vides** (branche `compte/assistant-reponses-vides`, compte rendu `docs/handoff/compte-assistant-reponses-vides.md`, Statut : PRÊT) : réflexion de Gemma 4 coupée, place de réponse 450 → 700 jetons, un deuxième essai si la réponse est vide (compté dans le budget du jour), erreur en 503 au lieu de 502, raison des réponses vides dans les journaux. Aucune migration.

## Base de données D1
- Migrations appliquées : 0001, 0002, 0003, 0004_lyrics_usage, 0004_cloud_save, 0005_social_accounts (27/10).
- En attente : aucune.

## À faire, par rôle

### Chef de projet
- Supprimer l'ancien projet Cloudflare « stalak » en double.

### App & montage
- Test caméra iPhone par le propriétaire (27/10) : son après le décompte OK, sens du selfie OK ; **lecture saccadée** et **export lent**.
- **En ligne depuis le 27/10 (22 h 20)** : prises filmées sur iPhone réparées. Cause : le fichier en morceaux de Safari ne dit pas où commencent les données de chaque piste (cas prévu par la norme) ; la bibliothèque MP4Box les lisait au mauvais endroit, d'où des vidéos abîmées dès le tournage (« Decoder failure » dans l'aperçu, la copie légère, l'analyse et l'export, sur les 10 façons de décoder testées). Le site recalcule maintenant lui-même la place de chaque image et de chaque son (`fragSamples` / `fragFix`). Nouveau test `tests/ui/remux_frag.py`.
- À vérifier après mise en ligne : nouveau test caméra sur iPhone (lecture fluide, vitesse d'export, ligne « échantillons repris au bon endroit » dans les infos techniques).
- À regarder : `tests/ui/lyrics_ui.py` s'arrête au bout de 15 s d'attente, déjà sur `main` avant cette branche.
- À décider ensuite : baisser la qualité d'export (720p) seulement si l'export reste lent une fois le décodage réparé.

### Comptes, paiements & serveur
- Paddle en réel une fois la structure créée : nouveaux produits, prix, clés et webhook, puis `PADDLE_ENV=production`.
- Microsoft (création du compte bloquée, à retenter) et Apple (programme développeur à 99 $/an).
- Ménage quotidien automatique des projets (Worker `workers/cloud-cleanup`, à déployer avec wrangler depuis un ordinateur). Pour l'instant, le ménage se fait quand quelqu'un ouvre « Mes projets ».
- Assistant IA de la bulle d'aide : fait (branche `compte/assistant-aide`). Après la mise en ligne : poser quelques vraies questions pour juger les réponses ; ajuster `HELP_DAILY_MAX` si besoin.
- Assistant d'aide, réponses vides (1 sur 3 en ligne) : corrigé sur `compte/assistant-reponses-vides`. Après la mise en ligne : poser une dizaine de questions et regarder les journaux Cloudflare (lignes `[stalak] help ai empty`, qui donnent la raison sans le texte).
- Assistant d'aide : la correction des réponses vides est en ligne depuis le 27/10. Test en ligne : 8 questions sur 8 ont reçu une réponse, en 1,5 à 5 s, justes en FR et en EN.
  - Petit détail à reprendre : en anglais, à la question « What is Clip mode? », le glaçon dit ne pas connaître ce mode. Le guide anglais l'appelle seulement « Music video », alors que d'autres textes disent « Clip ». Il faudrait ajouter « (also called Clip mode) » dans `HELP_GUIDE_EN`.
- Plus tard : saler l'empreinte des IP des compteurs (paroles et aide) avec `AUTH_SECRET`.
- Plus de 210 minutes de transcription par jour : passer au forfait Workers payant (5 $/mois).

### Réseaux sociaux
- **Fait et en ligne (éteint)** : connexion des comptes TikTok et Instagram côté serveur.
  - `functions/_lib/social.js` : relier / délier un compte, jetons chiffrés en base, renouvellement automatique, appels de suppression de Meta.
  - Migration `0005_social_accounts.sql` appliquée le 27/10.
  - 7 nouveaux tests serveur (55/55 passent). Revue sécurité : `docs/appsec-review-social-connect.md`.
  - La fonction reste éteinte (`SOCIAL_CONNECT_ENABLED = "0"`).
  - Compte rendu : `docs/handoff/social-connexion-comptes.md` (Statut : PRÊT).
- **Au propriétaire** : créer les applis TikTok et Meta en suivant `docs/SOCIAL_SETUP.md`, puis saisir 5 secrets dans Cloudflare (`TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `SOCIAL_TOKEN_KEY`).
- Reste à faire : boutons « Relier TikTok / Instagram » et écran « Publier » dans l'app, envoi de la vidéo (adresse temporaire sur R2), page de confidentialité à compléter (TikTok / Instagram), dossiers de validation, vidéo de démo.
- À décider : la publication directe est-elle réservée à Stalak Pro ou ouverte à tous ? Meta risque de demander une vérification d'entreprise (lien avec la LLC).

### Marketing & croissance
- **Fait (branche `marketing/audit-site`)** : audit SEO et textes de l'accueil et des Tarifs, FR/EN. Détail dans `docs/marketing/AUDIT_SITE.md`. Descriptions raccourcies, aperçus de partage sur Tarifs, limites Pro affichées, FAQ « données envoyées » corrigée (paroles auto), karaoké marqué Pro, section « comment faire un playback » sur l'accueil.
- **Fait** : plan de lancement en 4 phases, calcul de l'objectif, idées de vidéos, calendrier réseaux 2 → 29 nov. avec légendes FR/EN, messages testeurs et e-mail Pro (document « Stalak — plan de lancement et réseaux » dans claude.ai).
- **Fait et en ligne** : logo 120 × 120 sur l'écran de connexion Google. Envoyé dans Google Cloud → Stalak → Branding par le Chef de projet le 27/10 ; marque vérifiée et publiée par Google.
- **À décider** : boutons Pro de la page Tarifs pendant que Paddle est en sandbox (« bientôt » ou Paddle réel) avant toute promo.
- **À demander** : case « recevoir les nouveautés » à l'inscription (Comptes) ; mots « montage de playback » dans le H1 et JS/CSS en fichiers cachés (App).

### Juridique & business
- **Fait (branche `legal/etat-des-lieux`)** : état des lieux du statut, de Paddle en réel et des pages légales (infos pour décider, pas un avis juridique).
- **À décider (propriétaire)** : statut. La LLC prévue est remise en question : pour un résident français, elle ne supprime ni l'impôt ni les cotisations en France et ajoute des obligations (formulaire américain 5472, 25 000 $ d'amende si oublié ; compte étranger à déclarer). La micro-entreprise paraît plus simple. Rendez-vous avec un expert-comptable avant de créer quoi que ce soit (BIC ou BNC, ACRE).
- **À faire (Comptes)** : bouton de rétractation « Renoncer au contrat ici », obligatoire depuis le 19/06/2026 (ordonnance n° 2026-2) : visible pendant 14 jours après l'achat, gratuit, avec accusé de réception par e-mail. Cahier des charges à écrire par Juridique.
- **À faire (Juridique, sans attendre le statut)** : confidentialité complétée (Google pour la connexion et la boîte contact@, statistiques Cloudflare) ; règle pour les mineurs qui paient.
- **À faire une fois la structure créée** : nom, adresse (ou domiciliation) et SIRET dans les mentions légales ; nom légal dans les conditions (`--seller`) ; médiateur de la consommation désigné et nommé ; responsable du traitement nommé ; validation du site par Paddle (même nom sur le site, le compte Paddle et la banque).
