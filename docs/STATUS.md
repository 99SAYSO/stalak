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

- **Tableau de bord privé + « Parler à un humain »** (branche `compte/tableau-de-bord`, compte rendu `docs/handoff/compte-tableau-de-bord.md`, Statut : PRÊT) :
  - `https://admin.stalak.app/admin/`, réservé à l'e-mail du propriétaire par Cloudflare Access (jeton vérifié aussi par le serveur) : inscrits, Pro mensuels/annuels, revenu, visiteurs en direct, jour par jour, usage des fonctions, messages ;
  - glaçon : « Parler à un humain » (direct si le propriétaire est disponible, sinon e-mail du visiteur et réponse par e-mail) ;
  - **migration 0006 à lancer avant publication** ; puis 2 secrets (`ACCESS_AUD`, `ADMIN_EMAILS`), domaine personnalisé admin.stalak.app sur Pages, événements Paddle `adjustment.*` (BACKEND.md, étape 13). L'équipe Access est déjà dans `wrangler.toml`.

## Base de données D1
- Migrations appliquées : 0001, 0002, 0003, 0004_lyrics_usage, 0004_cloud_save, 0005_social_accounts (27/10).
- En attente : `0006_admin_support.sql` (branche `compte/tableau-de-bord`), à lancer avant de publier cette branche.

## À faire, par rôle

### Chef de projet
- Supprimer l'ancien projet Cloudflare « stalak » en double.

### App & montage
- Test caméra iPhone par le propriétaire (27/10) : son après le décompte OK, sens du selfie OK ; **lecture saccadée** et **export lent**.
- **En ligne depuis le 27/10 (22 h 20)** : prises filmées sur iPhone réparées. Cause : le fichier en morceaux de Safari ne dit pas où commencent les données de chaque piste (cas prévu par la norme) ; la bibliothèque MP4Box les lisait au mauvais endroit, d'où des vidéos abîmées dès le tournage (« Decoder failure » dans l'aperçu, la copie légère, l'analyse et l'export, sur les 10 façons de décoder testées). Le site recalcule maintenant lui-même la place de chaque image et de chaque son (`fragSamples` / `fragFix`). Nouveau test `tests/ui/remux_frag.py`.
- À vérifier après mise en ligne : nouveau test caméra sur iPhone (lecture fluide, vitesse d'export, ligne « échantillons repris au bon endroit » dans les infos techniques).
- À regarder : `tests/ui/lyrics_ui.py` s'arrête au bout de 15 s d'attente, déjà sur `main` avant cette branche.
- À décider ensuite : baisser la qualité d'export (720p) seulement si l'export reste lent une fois le décodage réparé.
- En ligne (27/10, branche `app/son-passage`) : étape Son.
  - Sur ordinateur, on peut glisser le fichier audio sur le carré d'import, qui passe en « givre » avec « Lâche ton fichier ici » pendant le survol. Un fichier lâché à côté n'ouvre plus le fichier à la place du site.
  - Deux poignées sur l'onde, en TikTok/Reels comme en Clip, pour le début et la fin du passage. Elles s'accrochent aux mesures. Au doigt, chaque poignée a une zone tactile de 44 px.
  - Le menu Durée affiche les longueurs choisies avec les poignées (« 7 mesures »), et les boutons « Fin ‹ › » marchent aussi en TikTok/Reels.
  - Nouveau bouton « ▶ Écouter le passage » : il joue la partie choisie et s'arrête à sa fin.
  - Nouveau test `tests/ui/son_passage.py`.
- À regarder (non corrigé) : sur téléphone, la bulle d'aide fixée en bas à droite peut couvrir la poignée de fin quand l'onde est tout en bas de l'écran.
- En ligne (27/10, branche `app/copie-legere-export`) : croix ✕ pour supprimer une ligne de paroles. Elle est dans la liste des lignes calées, à l'étape « Paroles », la seule où les lignes sont listées. Le message propose « Annuler ». Sur téléphone, le texte de la ligne passe sous les boutons. Test `tests/ui/paroles_suppr.py`.
- Confirmé sur iPhone par le journal du 27/10 à 23 h : prises filmées lisibles, copie légère 360×640 faite en 3 s, son des prises lu (calage automatique), lecture sans image lente, export de 25 s en 7,7 s par WebCodecs (aucun repli sur le lecteur vidéo).
- En cours : « un peu de lag » dans la vidéo exportée, signalé par le propriétaire. La cause n'est pas visible dans le journal. Vidéo exportée et précisions demandées au propriétaire : saccade continue, à chaque coupe, ou lèvres en retard.

### Comptes, paiements & serveur
- Paddle en réel une fois la structure créée : nouveaux produits, prix, clés et webhook, puis `PADDLE_ENV=production`.
- Microsoft (création du compte bloquée, à retenter) et Apple (programme développeur à 99 $/an).
- Ménage quotidien automatique des projets (Worker `workers/cloud-cleanup`, à déployer avec wrangler depuis un ordinateur). Pour l'instant, le ménage se fait quand quelqu'un ouvre « Mes projets ».
- Assistant IA de la bulle d'aide : fait (branche `compte/assistant-aide`). Après la mise en ligne : poser quelques vraies questions pour juger les réponses ; ajuster `HELP_DAILY_MAX` si besoin.
- Assistant d'aide, réponses vides (1 sur 3 en ligne) : corrigé sur `compte/assistant-reponses-vides`. Après la mise en ligne : poser une dizaine de questions et regarder les journaux Cloudflare (lignes `[stalak] help ai empty`, qui donnent la raison sans le texte).
- Assistant d'aide : la correction des réponses vides est en ligne depuis le 27/10. Test en ligne : 8 questions sur 8 ont reçu une réponse, en 1,5 à 5 s, justes en FR et en EN.
  - « What is Clip mode? » en anglais : corrigé sur `compte/tableau-de-bord` (le guide anglais dit « also called Clip mode »).
- **Tableau de bord privé : la protection est prête (27/10).** Cloudflare Zero Trust Free est activé (équipe `small-band-a6ef`, donc `small-band-a6ef.cloudflareaccess.com`). L'application Access « admin » protège `admin.stalak.app` : seul le propriétaire peut l'ouvrir, avec un code reçu par e-mail. Le tableau de bord est branché sur ce nom par `compte/tableau-de-bord` (ligne suivante). Côté serveur, les routes d'administration doivent vérifier l'en-tête `Cf-Access-Jwt-Assertion` (clés publiques de l'équipe + « AUD » de l'application « admin », visible dans Zero Trust → Access controls → Applications → admin). Ne jamais s'en remettre au seul fait d'être sur ce nom de domaine.
- Tableau de bord + « Parler à un humain » : fait sur `compte/tableau-de-bord` (le jeton Access est vérifié par le serveur : hôte, signature des clés de l'équipe, AUD, e-mail). Reste : 2 secrets, domaine personnalisé, événements Paddle `adjustment.*` (BACKEND.md, étape 13).
- Si des faux messages arrivent : Cloudflare Turnstile sur « Parler à un humain ».
- Plus tard : saler l'empreinte des IP des compteurs (paroles, aide, visites, messages) avec `AUTH_SECRET`.
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
- **Fait (branche `marketing/idees-croissance`)** : recherche « idées de croissance » (concurrents, fonctions, Stalak Pro, acquisition), classée par impact et effort. Document « Stalak — idées de croissance » dans claude.ai ; résumé dans `docs/marketing/IDEES_CROISSANCE.md`.

## Idées de croissance recommandées (à répartir par le propriétaire)

> Issues de la recherche du 27/10/2026. Impact et effort estimés, pas mesurés sur Stalak. Le rôle proposé est une suggestion. Les codes (A1, P1, F1…) renvoient au document.

**À faire d'abord (fort impact, peu d'effort)**
1. **A1 — Outro lisible et légende à copier.** Les 3 s de fin affichent « stalak.app » en grand ; bouton « copier la légende » (avec @stalak.app) à l'export ; lien `stalak.app/?ref=outro` pour mesurer. → App & montage (écran d'export) + Marketing (textes).
2. **P1 — Présenter Pro juste après le premier export réussi.** La même vidéo sans logo et en karaoké, bouton « Continuer en gratuit » bien visible, une fois par session au plus. → Comptes (page Pro) + App (moment d'affichage) + Marketing (textes).
3. **F1 + F2 — Texte hook / POV et hook choisi une fois.** Une phrase en haut de l'écran dès la 1re seconde, qui change d'une vidéo à l'autre dans un pack ; l'artiste choisit une fois son passage de 15-30 s et le pack fait toutes ses variantes dessus, avec une boucle propre. → App & montage.
4. **A2 + A3 — Vidéos de fondateur et bêta Discord.** Avant / après, « je monte ton snippet », défi de la semaine dans #stalak-beta. → Propriétaire + Marketing (déjà dans le plan de lancement).

**Ensuite**
5. **P2 — Nouveaux formats dans Pro** : F4 mode pochette / visualiseur (sans filmer), F5 export multi-plateforme (TikTok / Reels / Shorts en un clic), F6 export Spotify Canvas (boucle 3-8 s). → App & montage.
6. **F7 — Looks préréglés** (VHS, film, glitch, et un look « glace » maison). → App & montage.
7. **A4 — Parrainage à deux** : 1 mois de Pro chacun, donné après le premier export de l'ami ; seulement quand Paddle est en réel. → Comptes.
8. **F3 — Calendrier de sortie** (avant / pendant / après la sortie, rappels le soir), puis publication programmée réservée à Pro. → Réseaux sociaux + Comptes.

**À trancher par le propriétaire (change l'offre déjà décidée)**
- P3 : pack de sortie à l'unité sans abonnement (par exemple 10 vidéos d'un son, 4,99 à 7,99 €).
- P4 : Pro complet offert sur le premier son, sans carte (demande un compte).
- P7 : annuel plus bas ou essai de 7 jours avec carte sur l'annuel.

**Plus tard** : P6 prix locaux via Paddle (Comptes) ; A6 affiliation après Pro ; A7 dizaine de pages SEO FR/EN (Marketing) ; A8 Product Hunt un dimanche (Marketing) ; F9 détourage, F10 stats par variante, F11 modèles partagés.

**À mesurer dès la bêta** : visites → premier export → affichage de Pro → achat, et visites venues de `?ref=outro`.

### Juridique & business
- **Fait (branche `legal/etat-des-lieux`)** : état des lieux du statut, de Paddle en réel et des pages légales (infos pour décider, pas un avis juridique).
- **À décider (propriétaire)** : statut. La LLC prévue est remise en question : pour un résident français, elle ne supprime ni l'impôt ni les cotisations en France et ajoute des obligations (formulaire américain 5472, 25 000 $ d'amende si oublié ; compte étranger à déclarer). La micro-entreprise paraît plus simple. Rendez-vous avec un expert-comptable avant de créer quoi que ce soit (BIC ou BNC, ACRE).
- **À faire (Comptes)** : bouton de rétractation « Renoncer au contrat ici », obligatoire depuis le 19/06/2026 (ordonnance n° 2026-2) : visible pendant 14 jours après l'achat, gratuit, avec accusé de réception par e-mail. Cahier des charges à écrire par Juridique.
- **À faire (Juridique, sans attendre le statut)** : confidentialité complétée (Google pour la connexion et la boîte contact@, statistiques Cloudflare) ; règle pour les mineurs qui paient.
- **À faire une fois la structure créée** : nom, adresse (ou domiciliation) et SIRET dans les mentions légales ; nom légal dans les conditions (`--seller`) ; médiateur de la consommation désigné et nommé ; responsable du traitement nommé ; validation du site par Paddle (même nom sur le site, le compte Paddle et la banque).
