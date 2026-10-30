# Stalak — état du projet

> Tenu à jour par le Chef de projet. Chaque conversation le lit avant de commencer et met à jour sa section sur sa branche à la fin de chaque tâche.
> Dernière mise à jour : 30/10/2026 à 21 h (offre hybride fusionnée et en ligne : App, Comptes, Juridique, Marketing ; migration 0008 appliquée).

## Décisions récentes du propriétaire
- **30/10, 21 h : nouvelles demandes du propriétaire.** Marché visé : **États-Unis d'abord** (anglais langue principale). **Aucun concurrent cité sur le site.** Packs dès 2 playbacks. Filigrane : logo seul, plus discret, style ancien Triller, change de place sans glisser. Sauvegarde en ligne automatique pour Creator Plus (plus de bouton). Bouton pub bleu « givré » à côté d'Exporter. Cadenas visible sur « Générer le pack ». Choix du passage du son libre (sans aimant) et curseur de lecture déplaçable au doigt. Ensuite : audit complet par le Chef de projet.
- **30/10, 21 h : offre hybride en ligne.** Fusionnées : `app/formules` (filtres, filigrane, pub récompensée de test, cadenas Pro / Creator Plus), `compte/formules`, `legal/nouvelle-offre`, `marketing/tarifs-formules` (contient `marketing/seo`). Écran des formules dans l'app : version de Comptes (branchée sur Paddle et le changement de formule) ; celle de Marketing n'est pas reprise, la page Tarifs du site l'est. `marketing/chat-pro` abandonnée. Reste au propriétaire : compte Google Ad Manager (unité « rewarded » web, puis remplacer `AD_UNIT`), outil de consentement, test sur iPhone (filigrane, pub de test).
- **30/10 au soir : l'offre change encore. Elle remplace « Gratuit 1 vidéo par jour + Basic / Pro / Max »** (voir STALAK_CONTEXTE.md, section 2) : Gratuit illimité avec filigrane et pub récompensée, Pro 7,99 $ / 49,99 $, Creator Plus 14,99 $ / 99,99 $. On reprend le travail fait sur `compte/formules`, `app/formules`, `marketing/tarifs-formules` et `legal/nouvelle-offre` (tableau des formules, Paddle, changement de formule, cadenas, pages), et on l'adapte. Ces branches ne seront pas fusionnées telles quelles. Les nouveaux prix Paddle sandbox seront créés par le Chef de projet et notés ici.
  - **Prix Paddle sandbox de l'offre hybride (créés le 30/10 à 19 h 35 par le Chef de projet, en dollars ; Paddle convertit selon le pays)** :
    | Formule | Produit | Mensuel | Annuel |
    |---|---|---|---|
    | Pro | `pro_01m5ygd6ra9bhd5vzy2v1rrk70` | 7,99 $ `pri_01m671bncd9qm3dqxjyqf127gn` | 49,99 $ `pri_01m671cexysycbr7wz1av55cvy` |
    | Creator Plus | `pro_01m671d5b8wbm0dmmvjn7x8vx9` | 14,99 $ `pri_01m671dtkv0d5m0r2a4ek02a3e` | 99,99 $ `pri_01m671eex11hq295vhmsj723wm` |
    - Anciens prix (tous encore actifs, abonnements de test seulement) : le webhook compte les prix Pro en euros (9,99 €, 79 €, 10,99 €, 109 €) et Basic comme `pro`, les prix Max comme `creator`. Ils seront archivés plus tard, avec l'accord du propriétaire.
  - **Contrat App / Comptes pour l'offre hybride** (remplace le contrat Basic/Pro/Max ci-dessous) :
    - Formules : `free`, `pro`, `creator`. Gratuit **sans compte obligatoire**, montage illimité, plus de vidéo du jour, plus d'e-mail de rappel, plus de fin Stalak de 3 s.
    - `acctHas(feat)` : `nowm` (pas de filigrane ni de pub), `clip`, `fx` (effets premium), `text` (mot par mot / karaoké), `filters` (filtres pro), `lyrics` (paroles auto) → Pro et Creator Plus ; `pack5`, `pack10`, `pack30`, `cloud`, `human` → Creator Plus seulement.
    - `acctOpen(why, { plan })` avec `plan` = `pro` ou `creator`. `acctQuota` et `acctUseVideo` ne servent plus.
    - Filigrane : ajouté par l'App dans le navigateur à l'export pour Gratuit (logo + « Clipped with stalak.app », qui bouge). La pub récompensée (Google Ad Manager, format « rewarded » pour le web) l'enlève pour **cette** vidéo. Pas de vérification côté serveur : Google n'en propose pas pour le web.
    - Paroles auto : proposition 20 par jour en Pro, 60 en Creator Plus ; sauvegarde en ligne 100 Go en Creator Plus.
- 27/10 : « Parler à un humain » devient un avantage **Stalak Pro** : chat en direct si le propriétaire est disponible, sinon réponse par e-mail sous 24 h. Ne jamais écrire « 24 h/24 ». Les gratuits gardent le glaçon IA et contact@stalak.app (obligation légale de pouvoir joindre le vendeur). Comptes fait la restriction côté serveur et dans le glaçon ; Marketing a écrit les textes (branche `marketing/chat-pro`, à fusionner en même temps que la branche Comptes).
- 27/10 : **menu du compte** (en haut à droite) et **Galerie** des projets en ligne, en grille avec couvertures, comme l'app Photos de l'iPhone → Comptes.

- 30/10 : **filtres vidéo** à l'étape Montage, comme les filtres des stories Instagram → App & montage. Liste choisie par le propriétaire :
  - Caméra : Givre, Grain vintage « LA », Vision nocturne, Démon, Halloween ;
  - Rétro : VHS, Film 35 mm, Super 8, Noir & blanc ;
  - Esthétique : Golden hour, Rêve, Y2K, Pastel.
  - Stalak Pro sauf 3 filtres gratuits (Noir & blanc, Givre, Film 35 mm), réglage modifiable. Les filtres « Clip rap » qui suivent le beat ne sont pas retenus pour l'instant.

- 30/10 : **nouvelle offre, 1 gratuit + 3 abonnements** (remplace « Gratuit illimité + Stalak Pro ») :
  - Gratuit : **1 vidéo par jour**, compte gratuit obligatoire, avec logo, 3 filtres. E-mail de rappel « ta vidéo du jour est disponible » (case à cocher, 1 par jour au plus, arrêt après 7 jours sans visite).
  - **Basic 4,99 €/mois (39 €/an)** : vidéos illimitées sans logo, toutes tailles et apparitions du texte, 3 filtres.
  - **Pro 10,99 €/mois (109 €/an)** : Basic + tous les filtres, mode Clip 16:9, packs de 5 et 10, paroles auto 20 par jour, sauvegarde en ligne 20 Go.
  - **Max 13,99 €/mois (139 €/an)** : Pro + packs de 30, paroles auto 60 par jour, sauvegarde 100 Go, « Parler à un humain ». Carte mise en avant : « seulement 3 € de plus que Pro ».
  - Un abonné garde son prix. Aujourd'hui, il n'y a que des abonnements de test (sandbox).
  - **Prix Paddle sandbox créés le 30/10 par le Chef de projet** (taxe : réglage du compte, catégorie « Standard digital goods ») :
    | Formule | Produit | Mensuel | Annuel |
    |---|---|---|---|
    | Basic | `pro_01m66r6h2rkefmaxn31gckec3n` | 4,99 € `pri_01m66r80jxszc4yxggqvwak5p5` | 39 € `pri_01m66r8g1bhvhnk6x1z9m0x894` |
    | Pro | `pro_01m5ygd6ra9bhd5vzy2v1rrk70` | 10,99 € `pri_01m66r4d7mtzps3wmycfmv8pk9` | 109 € `pri_01m66r5nakxvg6cxjcgc1vv7j7` |
    | Max | `pro_01m66r71dy61a2qaqsrrxgq12n` | 13,99 € `pri_01m66r9m12ckfttnrr5h3vhfgc` | 139 € `pri_01m66r9tmrfg7fxfrb5dpnk5s3` |
    - Anciens prix Pro, toujours actifs pour les abonnés existants : 9,99 € `pri_01m5ygermd2pjw66mgdsh4f4rw` et 79 € `pri_01m5ygfwqdq8h2ax297c6qagjs`. Le webhook doit les compter comme « pro ».
  - **Contrat entre App et Comptes (30/10, à respecter tel quel par Comptes)** : App a déjà écrit son côté sur la branche `app/formules`, encore à l'état EN COURS. Comptes doit fournir dans le bloc compte de `app.js`, sous ces noms exacts :
    1. `acctHas(feat)` → `true` ou `false` pour `nologo`, `text`, `unlimited` (Basic) ; `filters`, `clip`, `pack5`, `pack10` (Pro) ; `pack30` (Max). Ajouter aussi `cloud`, `lyrics` et `human` côté serveur.
    2. `acctQuota()` → `{ left, resetAt }` pour un gratuit connecté (vidéos restantes aujourd'hui, heure en ms de la prochaine), `null` pour une formule payante.
    3. `acctUseVideo()` → compte la vidéo du jour côté serveur (peut renvoyer une promesse).
    4. `acctOpen(why, { plan })` → ouvre la page des formules sur `plan` (`basic`, `pro` ou `max`). Nouvelles raisons : `daily`, `pack30` et `filters`. `daily` pour une personne non connectée ouvre la création de compte.
    - Juridique a écrit les règles côté serveur (remise à zéro, prorata, changement programmé, prix gardé) dans `docs/STATUS.md` de la branche `legal/nouvelle-offre` (`git show origin/legal/nouvelle-offre:docs/STATUS.md`), section Juridique : à appliquer.
  - Travail : Comptes (formules, compteur, e-mail de rappel, Paddle), App (ce que débloque chaque formule, écran « vidéo du jour utilisée »), Marketing (page Tarifs à 4 colonnes), Juridique (conditions de vente). Prix Paddle sandbox créés par le Chef de projet.

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

- **Tableau de bord privé + « Parler à un humain »** (**en marche depuis le 27/10 à 23 h 34** : connexion du propriétaire vérifiée ; domaine, secrets et événements Paddle `adjustment.*` en place) :
  - `https://admin.stalak.app/admin/`, réservé à l'e-mail du propriétaire par Cloudflare Access (jeton vérifié aussi par le serveur) : inscrits, Pro mensuels/annuels, revenu, visiteurs en direct, jour par jour, usage des fonctions, messages ;
  - glaçon : « Parler à un humain » (direct si le propriétaire est disponible, sinon e-mail du visiteur et réponse par e-mail) ;
  - migration 0006 appliquée ; reste au propriétaire : 2 secrets (`ACCESS_AUD`, `ADMIN_EMAILS`), domaine personnalisé admin.stalak.app sur Pages, événements Paddle `adjustment.*` (BACKEND.md, étape 13). L'équipe Access est déjà dans `wrangler.toml`.

- **Menu du compte + Galerie** (en ligne le 28/10) : un appui sur le compte en haut à droite ouvre un menu (Galerie, Mon compte, Stalak Pro ou « Gérer mon abonnement », Aide, Se déconnecter) ; la Galerie remplace « Mes projets » : grille avec couverture (image du montage, 300 px, rangée dans R2 avec le projet), nom dessous, appui = ouvrir, appui long ou « … » = renommer / supprimer. Sans Pro : « La sauvegarde en ligne est réservée à Stalak Pro ». Migration 0007 appliquée. À vérifier par le propriétaire sur iPhone : sauvegarder en ligne, puis voir la couverture dans la Galerie.
- **« Parler à un humain » réservé à Stalak Pro** (branche `compte/humain-pro`, compte rendu `docs/handoff/compte-humain-pro.md`, Statut : PRÊT) : création et écriture réservées à Pro côté serveur ; sans Pro, écran « Réservé à Stalak Pro » (page Pro + contact@stalak.app) ; un ex-Pro garde les réponses reçues ; réponse « sous 24 h » par e-mail quand tu n'es pas là ; badge Pro dans le tableau de bord. Textes de vente : `marketing/chat-pro`, à fusionner ensemble. Aucune migration.

- **Sauvegarde automatique + anglais d'abord** (branche `compte/sauvegarde-auto`, compte rendu `docs/handoff/compte-sauvegarde-auto.md`, Statut : PRÊT) :
  - Creator Plus : chaque projet s'enregistre tout seul en ligne (toutes les 4 s si quelque chose a changé ; seulement ce qui a changé ; rien pendant un export) ; indicateur « Enregistré ✓ » en haut ; bouton « Sauvegarder en ligne » supprimé ; Galerie adaptée (« il s'enregistre tout seul ») ;
  - e-mails (codes, support, rappel des 6 mois) et fenêtre de paiement Paddle en anglais par défaut, en français seulement si la page est en français ;
  - aucun concurrent cité dans le guide de l'assistant d'aide (règle ajoutée en FR et EN) ;
  - aucune migration.

- **Offre du 30/10 au soir côté Comptes** (branche `compte/formules`, avec `main` et `app/formules` fusionnées, compte rendu `docs/handoff/compte-formules.md`, Statut : PRÊT) :
  - formules `free` / `pro` / `creator` ; tableau unique (`functions/_lib/entitlements.js`) selon le contrat de l'offre hybride ; sauvegarde en ligne (100 Go) et « Parler à un humain » en Creator Plus seulement ; paroles auto 20 / 60 par jour ;
  - 4 prix en dollars dans `wrangler.toml` ; anciens prix reconnus (euros et Basic → `pro`, Max → `creator`) ;
  - vidéo du jour, compteur et e-mail de rappel supprimés ; page des formules à 3 colonnes en dollars ; tableau de bord par formule (Pro, Creator Plus) ;
  - migration 0008 (`migrations/0008_plans.sql`, 3 colonnes) appliquée le 30/10 au soir.

## Base de données D1
- Migrations appliquées : 0001, 0002, 0003, 0004_lyrics_usage, 0004_cloud_save, 0005_social_accounts (27/10), 0006_admin_support (27/10), 0007_project_covers (28/10), 0008_plans (30/10).
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

- Prêt (dans `app/formules`) : 26 filtres vidéo validés par le propriétaire le 30/10, plus « Aucun » : 4 thèmes, dont « Couleurs », avec 13 retouches façon stories Instagram sous des noms Stalak. Gratuits : Givre, Film 35 mm, Noir & blanc.

- Prêt (branche `app/formules`) : offre hybride du 30/10 au soir dans l'app. Pro / Creator Plus (`can(feat)`), filigrane qui bouge sur les vidéos gratuites (« Clipped with stalak.app »), pub récompensée Google (unité de test) qui l'enlève pour une vidéo. Plus d'écran du jour ni de fin Stalak ; le gratuit exporte sans compte. Détail et suites pour Comptes et Juridique dans `docs/handoff/app-formules.md`.

### Comptes, paiements & serveur
- Sauvegarde automatique, anglais d'abord, guide sans concurrent : fait sur `compte/sauvegarde-auto` (voir « En cours »).
  - Pour App : les lignes du guide d'aide sur les packs (« au moins 3 playbacks ») et le filigrane sont à changer quand les packs dès 2 playbacks et le filigrane logo seul seront livrés (`functions/_lib/help-guide.js`, FR et EN).
- Offre du 30/10 au soir (`compte/formules`) : fait (voir « En cours »). Au Chef de projet : migration 0008 ; plus besoin de redéployer le Worker (aucun horaire ajouté).
  - Contrat livré : `acctHas(feat)` (`nowm`, `clip`, `fx`, `text`, `filters`, `lyrics` → Pro ; `pack5`, `pack10`, `pack30`, `cloud`, `human` → Creator Plus ; anciens noms `nologo` → Pro, `unlimited` → tous), `acctOpen(why, {plan})` avec `pro` ou `creator` (`basic` / `max` acceptés et convertis). `acctQuota` / `acctUseVideo` supprimées.
  - Pour App : `FEAT_PLAN`, étiquettes BASIC/MAX, fin de 3 s (`outroOn` lit encore `nologo`) et `tests/ui/formules_ui.py` sont encore sur l'offre Basic / Pro / Max : à passer à Pro / Creator Plus.
  - Règles de Juridique gardées : montée immédiate au prorata avec le montant affiché avant ; descente au renouvellement sans remboursement ; annuel → mensuel refusé avec une explication (limite Paddle) ; remboursement d'un changement à la main.
  - Pour Marketing : textes de la page des formules dans l'app (clés `pl.*`, `pr.promo`) à relire.
- Paddle en réel une fois la structure créée : nouveaux produits, prix, clés et webhook, puis `PADDLE_ENV=production`.
- Microsoft (création du compte bloquée, à retenter) et Apple (programme développeur à 99 $/an).
- Ménage quotidien automatique des projets (Worker `workers/cloud-cleanup`, à déployer avec wrangler depuis un ordinateur). Pour l'instant, le ménage se fait quand quelqu'un ouvre la Galerie.
- Assistant IA de la bulle d'aide : fait (branche `compte/assistant-aide`). Après la mise en ligne : poser quelques vraies questions pour juger les réponses ; ajuster `HELP_DAILY_MAX` si besoin.
- Assistant d'aide, réponses vides (1 sur 3 en ligne) : corrigé sur `compte/assistant-reponses-vides`. Après la mise en ligne : poser une dizaine de questions et regarder les journaux Cloudflare (lignes `[stalak] help ai empty`, qui donnent la raison sans le texte).
- Assistant d'aide : la correction des réponses vides est en ligne depuis le 27/10. Test en ligne : 8 questions sur 8 ont reçu une réponse, en 1,5 à 5 s, justes en FR et en EN.
  - « What is Clip mode? » en anglais : corrigé sur `compte/tableau-de-bord` (le guide anglais dit « also called Clip mode »).
- **Tableau de bord privé : la protection est prête (27/10).** Cloudflare Zero Trust Free est activé (équipe `small-band-a6ef`, donc `small-band-a6ef.cloudflareaccess.com`). L'application Access « admin » protège `admin.stalak.app` : seul le propriétaire peut l'ouvrir, avec un code reçu par e-mail. Le tableau de bord est branché sur ce nom par `compte/tableau-de-bord` (ligne suivante). Côté serveur, les routes d'administration doivent vérifier l'en-tête `Cf-Access-Jwt-Assertion` (clés publiques de l'équipe + « AUD » de l'application « admin », visible dans Zero Trust → Access controls → Applications → admin). Ne jamais s'en remettre au seul fait d'être sur ce nom de domaine.
- Tableau de bord + « Parler à un humain » : fait sur `compte/tableau-de-bord` (le jeton Access est vérifié par le serveur : hôte, signature des clés de l'équipe, AUD, e-mail). Reste : 2 secrets, domaine personnalisé, événements Paddle `adjustment.*` (BACKEND.md, étape 13).
- Si des faux messages arrivent : Cloudflare Turnstile sur « Parler à un humain ».
- Tableau de bord et « Parler à un humain » : fusionnés et en ligne le 27/10, migration 0006 appliquée. Le tableau de bord est en marche (connexion du propriétaire vérifiée le 27/10). Les chiffres Pro et revenu viennent pour l'instant des abonnements de test Paddle (sandbox).
  - Réglé (Comptes, `compte/formules`) : `tests/ui/support_ui.py` s'arrêtait à « reply e-mailed to the visitor who left ». Cause : un visiteur parti juste avant la réponse recevait l'e-mail après ≈ 30 s (attente de 20 s + passage du tableau de bord toutes les 10 s), au-delà des 50 s du test sur une machine lente. L'attente passe à 12 s (≈ 20 s au total) et le test laisse 90 s.
- Galerie : les projets sauvegardés avant cette version n'ont pas de couverture (carré de couleur avec un numéro) ; ils en reçoivent une à la prochaine sauvegarde.
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
- **Fait (branche `marketing/seo`, 30/10)** : référencement du nom « Stalak » et de la niche. Détail dans `docs/marketing/SEO.md` ; plan complet dans le document claude.ai « Stalak — passer premier sur Google ».
  - Fiche de la marque pour Google (Organization : logo, e-mail, noms) ; liste `SOCIAL` dans `build_site.py` pour les comptes officiels (déclarés en `sameAs` et en liens `rel="me"` dans le pied de page) — **vide pour l'instant, en attente des adresses du propriétaire**.
  - `llms.txt` pour les IA de recherche ; plan du site passé de 4 à 14 pages (pages légales + comparatif).
  - Nouvelles pages **`/alternative-triller`** et **`/en/triller-alternative`** : comparatif sourcé et daté Stalak / Triller / CapCut / camrip, FAQ, données structurées Article + FAQ + fil d'Ariane, liens depuis le pied de page de l'accueil. Vidéo d'exemple affichée seulement si `site_src/demo/exemple.mp4` existe.
  - **Correction (touche `src/app.js`, à relire par App)** : sur stalak.app, la page française passait en anglais selon la langue du navigateur, donc Google la lisait en anglais (titre anglais sur la recherche « stalak » en France). Elle reste maintenant en français ; l'anglais reste disponible par le bouton FR / EN et `/en/`. La version claude.ai n'est pas touchée.
- **Au propriétaire** : adresses des comptes Instagram / TikTok / YouTube de Stalak ; une vraie vidéo montée avec Stalak ; vérifier dans Search Console (compte propriétaire) que `sitemap.xml` est envoyé et demander l'indexation ; Bing Webmaster Tools ; inscriptions aux annuaires (liste et textes dans le document).
- **Suivant (Marketing)** : pages « faire un playback » (FR), « cut multiple takes to the beat » (EN/FR), « lip-sync videos for musicians » (EN), « paroles sur une vidéo TikTok » (FR/EN).
- **À regarder (App)** : proposer aux visiteurs dont le navigateur est en anglais un petit lien « English version » sur la page française, plutôt que de changer la langue tout seul.
- **Fait (branche `marketing/tarifs-formules`, 30/10 au soir)** : l'offre hybride affichée partout, en dollars. Remplace la version Basic / Pro / Max de la même branche. Détail dans `docs/handoff/marketing-tarifs-formules.md`.
  - Page Tarifs FR/EN et écran des formules de l'app (`#apPro`) : 3 colonnes Gratuit / Stalak Pro (7,99 $ ou 49,99 $) / Creator Plus (14,99 $ ou 99,99 $), générées d'une seule source.
  - Bouton Mensuel / Annuel, **annuel coché par défaut**, avec le badge « Meilleur prix » (pas de « le plus populaire »). Pro est mise en avant avec le ruban « Ni pub ni filigrane ».
  - Tableau comparatif et FAQ refaits : gratuit sans compte, filigrane, pub de 30 s, prix en dollars et taxes par pays, compte nécessaire seulement pour s'abonner, sauvegarde en ligne dans Creator Plus.
  - Page « Alternative à Triller » FR/EN, `llms.txt` et accueil à jour. Sur l'accueil : « Aucun téléchargement, aucune inscription : 3 étapes et c'est posté ».
  - Plan pour récupérer le public de Triller au nom de 99Sayso : `docs/marketing/PLAN_TRILLER.md`, et document « Stalak — récupérer le public de Triller » dans claude.ai.
  - La branche `marketing/chat-pro` est **abandonnée** : ne pas la fusionner.
- **À publier en même temps que l'offre hybride côté Comptes et App** : la page annonce le gratuit sans compte, le filigrane, la pub qui l'enlève, et Creator Plus.
- **Pour Comptes (boutons de l'écran des formules)** :
  - chaque bouton porte `data-plan` (`pro`, `creator`) et `data-cycle` (`month`, `year`) ; les cartes s'appellent `.p4-free`, `.p4-pro` et `.p4-creator` (pour `acctOpen(why, { plan })`) ;
  - Creator Plus appelle `buy('creator_month')` et `buy('creator_year')` ; Pro garde `#apMonth` / `#apYear`, qui appellent `buy('month')` / `buy('year')` : à relier aux nouveaux prix Paddle en dollars ;
  - sur le site, les boutons mènent à `/?plan=pro-year#pro`, `/?plan=creator-month#pro`, etc. (ou `/en/?plan=…#pro`) ;
  - encore à mettre à jour, hors de mon domaine : avantages d'un abonné (`acct.perk*`) selon la formule, prix dans `functions/_lib/help-guide.js`, `functions/_lib/router.js` et le revenu du tableau de bord.
- **À décider (propriétaire)** : afficher les limites des paroles auto (20 par jour en Pro, 60 en Creator Plus) et les 100 Go de sauvegarde. Ce ne sont encore que des propositions dans le contrat App / Comptes, donc la page ne donne pas ces chiffres.
- **Pour Juridique** : `site_src/conditions.html` parle encore de « Stalak Pro 9,99 € ou 79 € ».
- **Pour App** : les messages qui ouvrent l'écran des formules (`acct.why.*`) disent encore « Stalak Pro » seul.
- **À regarder (Juridique)** : la page de comparaison est de la publicité comparative ; elle ne compare que des faits vérifiables, sourcés et datés. Revoir les prix des concurrents tous les 3 mois.

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

**Nouveau concurrent direct (27/10) : camrip** (camrip.app). Il fait déjà le montage automatique de 1 à 4 prises coupées sur le temps, avec la synchro. Détail dans `docs/marketing/IDEES_CROISSANCE.md`.
- À mettre en avant (Marketing) : ce que camrip n'a pas (paroles à l'écran, karaoké, paroles écrites automatiquement, packs, clip 16:9, français) et le prix (Pro à 9,99 € sans limite de vidéos, contre 14,99 $ pour 30 vidéos chez camrip).
- À étudier (App & montage) : choisir automatiquement la meilleure prise à chaque coupe (visage net et bien cadré), et des zooms automatiques sur les plans qui durent.
- Renforce P3 (pack à l'unité) : camrip vend 5 vidéos 4,99 $ sans abonnement.

**Plus tard** : P6 prix locaux via Paddle (Comptes) ; A6 affiliation après Pro ; A7 dizaine de pages SEO FR/EN (Marketing) ; A8 Product Hunt un dimanche (Marketing) ; F9 détourage, F10 stats par variante, F11 modèles partagés.

**À mesurer dès la bêta** : visites → premier export → affichage de Pro → achat, et visites venues de `?ref=outro`.

## Stratégie vers 30 000 € par mois (28/10/2026, à répartir par le propriétaire)

> Objectif du propriétaire : 30 000 € de revenu **par mois**, d'ici 6 mois. Document complet : « Stalak — stratégie vers 30 000 € par mois » dans claude.ai ; résumé dans `docs/marketing/STRATEGIE_REVENUS.md`.

**Point bloquant à lever d'abord (Juridique + Comptes).** Les règles de Paddle (13/04/2026) interdisent la vente de publicité, le marketing automatisé sur les réseaux et les places de marché. Les campagnes de son et le « son à la une » ne pourront pas passer par Paddle.
- Demander à Paddle, par écrit, ce qu'il accepte, en particulier la « campagne faite pour toi ».
- Prévoir une facturation directe par une société et un autre moyen de payer les créateurs.
- À prendre en compte dans le choix du statut : à 30 000 € par mois, on dépasse les plafonds de la micro-entreprise.

**À trancher par le propriétaire (change l'offre déjà décidée)**
- Studio : 49 €/mois pour 5 artistes.
- Label : 149 €/mois pour 20 artistes.
- Pack de sortie : 19 € une fois.
- Prix en dollars aux États-Unis (par exemple 12,99 $/mois).
- Campagnes de son : à partir de 500 €, Stalak garde 25 %.
- Son à la une : par exemple 300 à 500 € la semaine.
- Campagne faite pour toi : 149 €.

**Recommandé, par rôle**
1. **Comptes** : formules Studio et Label (plusieurs artistes par compte) et pack de sortie dans Paddle, une fois validés ; prix en dollars aux États-Unis. Ensuite, le tableau de bord suit le revenu par source.
2. **Marketing** : page Tarifs avec les formules Studio et Label ; argumentaire pour les labels ; 3 campagnes pilotes en janvier avec des artistes ou labels connus, si la société existe.
3. **App & montage** : écran « campagnes » (un label dépose un son, les artistes font des vidéos dessus, avec la mention « Collaboration commerciale » ajoutée automatiquement) ; « son à la une » avec les paroles déjà calées. À faire seulement après le pilote à la main.
4. **Juridique** : loi influenceurs du 9 juin 2023 (mention pendant toute la vidéo, contrat écrit, responsabilité de l'intermédiaire ; vérifier si elle a changé depuis) ; mois Pro donnés en récompense ; mineurs (accord des parents avant 15 ans pour les données, âge minimum de Paddle) ; statut de la société.

**Exemple de répartition à 30 000 € par mois** (hypothèses, pas une prévision) :

| Source | Hypothèse | Revenu par mois |
|---|---|---|
| Campagnes de son | 20 × 2 000 € à 25 % | 10 000 € |
| Pro | 1 000 abonnés | 8 500 € |
| Studio / Label | 60 Studio + 15 Label | 5 175 € |
| Packs de sortie | 150 packs | 2 850 € |
| Campagnes faites pour toi | 15 campagnes | 2 235 € |
| Son à la une | 4 semaines | 1 600 € |

Ces montants sont avant TVA et frais. Réaliste : 10 000 € par mois en avril 2027.

### Juridique & business
- **Fait (branche `legal/etat-des-lieux`)** : état des lieux du statut, de Paddle en réel et des pages légales (infos pour décider, pas un avis juridique).
- **À décider (propriétaire)** : statut. La LLC prévue est remise en question : pour un résident français, elle ne supprime ni l'impôt ni les cotisations en France et ajoute des obligations (formulaire américain 5472, 25 000 $ d'amende si oublié ; compte étranger à déclarer). La micro-entreprise paraît plus simple. Rendez-vous avec un expert-comptable avant de créer quoi que ce soit (BIC ou BNC, ACRE).
- **Fait (branche `legal/nouvelle-offre`, 30/10 au soir)** : pages légales FR/EN adaptées à l'offre Gratuit (filigrane + pub récompensée) / Pro / Creator Plus en dollars. Tout ce qui parlait de la vidéo du jour, de l'e-mail de rappel et de Basic / Max est retiré.
  - Conditions : Gratuit sans compte ; formules et prix en dollars (conversion et taxes par Paddle, variation possible avec le taux de change) ; nouvelle section 4 « Filigrane et publicité récompensée » ; prix gardé ; changement de formule ; anti-fraude.
  - Remboursement : Pro et Creator Plus, retour du filigrane en Gratuit.
  - Confidentialité devient « Confidentialité et cookies » : section `#cookies` (pub Google Ad Manager, choix accepter/refuser, pub limitée si refus, durée 6 mois, liens Google) ; Google ajouté aux prestataires (connexion, pub, boîte contact@) ; sauvegarde 100 Go et « Parler à un humain » en Creator Plus.
  - Mentions légales : phrase sur le filigrane (marque de Stalak, aucun droit sur la vidéo).
- **Fait (branche `legal/etats-unis`, 30/10, 21 h)** : état des lieux « vendre et diffuser des pubs aux États-Unis avec une micro-entreprise et Paddle » dans `docs/juridique/ETATS_UNIS.md` (CCPA et autres États, COPPA, renouvellement automatique, pages, bandeau). Pages anglaises adaptées aux États-Unis : conditions (encadré renouvellement automatique, rappels, arrêt en ligne), confidentialité (« Your Privacy Choices », GPC, « Your US privacy rights », enfants), lien « Your Privacy Choices » en bas des pages légales anglaises. Corrigé aussi en FR : filigrane logo seul, packs dès 2 playbacks, sauvegarde automatique, annuel → mensuel en deux temps.
- **À décider (propriétaire)** : pub **personnalisée avec possibilité de refuser** (ce qu'écrivent les pages ; plus de revenu) ou **pub non personnalisée pour tous les visiteurs américains** (RDP dans Ad Manager ; presque plus de risque avec les moins de 13/16 ans ; moins de revenu). Les pages se changent en une phrase.
- **À faire par Comptes (renouvellement automatique, règles de Californie appliquées à tous les Américains)** :
  - à l'écran des formules, près du bouton d'achat : « $7.99/month, renews automatically until you cancel. Cancel anytime in Account. » (même chose pour chaque prix) ;
  - e-mail de confirmation après l'achat (formule, prix, fréquence, comment arrêter, lien) si le reçu Paddle ne le dit pas déjà : **à vérifier sur un achat sandbox** ;
  - **rappel une fois par an aux abonnés mensuels** (Paddle ne le fait pas) : formule, prix, fréquence, lien pour arrêter ;
  - abonnés annuels : vérifier que Paddle envoie bien le rappel 30 jours avant pour les Américains ; sinon l'envoyer nous-mêmes 15 à 45 jours avant ;
  - « Gérer mon abonnement » → arrêt en 1 ou 2 appuis, sans offre de rétention (ou avec le bouton « Arrêter » juste à côté) ; un e-mail « cancel » à contact@ doit suffire (à traiter sous 1 jour ouvré) ;
  - garder la preuve de l'accord (date, formule, prix, texte affiché) 3 ans.
- **À faire par App ou Comptes (vie privée, États-Unis)** :
  - lien « Your Privacy Choices » en bas de l'app et de la page Tarifs, vers un vrai bouton de refus (message « États américains » de Google « Confidentialité et messages », ou petite page maison qui enregistre le refus) ;
  - respecter **GPC** (`navigator.globalPrivacyControl`) : si actif, pub non personnalisée (drapeau RDP de GPT) ;
  - un refus enregistré (navigateur, et compte si connecté) → RDP sur toutes les pubs ;
  - Europe : bandeau inchangé (TCF). États-Unis : pas de fenêtre d'accord, refus par le lien ou GPC.
- **À faire par Marketing** : la page Tarifs et les pages « alternative » parlent encore du filigrane « Clipped with stalak.app » et citent Triller (décision 30/10 : aucun concurrent cité) ; lien « Your Privacy Choices » dans leur pied de page.
- **À suivre par Comptes (règles écrites dans les conditions)** :
  - montée en gamme (Pro → Creator Plus, mensuel → annuel) **immédiate, au prorata**, montant affiché avant confirmation ;
  - descente en gamme (Creator Plus → Pro) **au prochain renouvellement** ; annuel → mensuel en deux temps (arrêter l'annuel puis prendre le mensuel), comme le fait déjà Comptes, sans remboursement (changement programmé) ;
  - prix gardé tant que l'abonnement continue, même formule et même période ; un changement de formule prend le prix du moment ;
  - remboursement d'un paiement de changement de formule = retour à la formule d'avant jusqu'à la fin de la période ;
  - **à vérifier dans Paddle sandbox** : si un abonné payant en euros voit le montant de son renouvellement changer avec le taux de change, ou si Paddle fige le montant converti. Les conditions annoncent une « légère variation possible » ; me dire si c'est faux.
  - paroles auto 20 par jour (Pro) et 60 (Creator Plus), 8 min max, sauvegarde 100 Go : écrits tels quels dans les conditions. Me prévenir si les limites changent.
- **À faire par App (pub récompensée et filigrane)**, règles de Google et de la CNIL :
  - filigrane : logo + « Clipped with stalak.app », visible et qui bouge, ajouté à l'export en Gratuit seulement ;
  - **aucun script Google (GPT) ni fenêtre de cookies avant que l'utilisateur touche « Regarder une pub pour retirer le filigrane »** : rien ne se charge pour Pro, Creator Plus ou un gratuit qui ne choisit pas la pub ;
  - avant la pub, écran d'accord qui dit clairement l'action et la récompense (« Regarde une pub d'environ 30 s pour retirer le filigrane de cette vidéo »), avec « Non merci » aussi visible ; pas de texte qui pousse (interdit par Google : « regarde pour nous soutenir ») ;
  - si l'utilisateur ferme la pub avant la fin : lui confirmer qu'il perd la récompense ; filigrane retiré seulement à l'événement `rewardedSlotGranted` ; l'utilisateur ferme la pub lui-même ;
  - **décidé (propriétaire, 30/10)** : la pub est obligatoire pour exporter sans filigrane. Si aucune pub n'est disponible : message « Pas de pub disponible pour l'instant », bouton « Réessayer », et la vidéo s'exporte avec filigrane si l'utilisateur continue ;
  - le refus ne doit jamais bloquer l'export avec filigrane.
- **À faire par App ou Comptes : bandeau de consentement (CMP)**, nécessaire pour la pub en Europe, au Royaume-Uni et en Suisse :
  - outil **certifié par Google et compatible IAB TCF v2.2**, obligatoire pour des pubs personnalisées. Le plus simple : le message RGPD gratuit de Google Ad Manager (« Confidentialité et messages »). Sans outil certifié, seules des pubs limitées sont possibles ;
  - s'affiche au moment de la première pub (pas à l'ouverture du site), seulement pour ces pays ;
  - boutons « Tout accepter », « Tout refuser » et « Personnaliser » au même niveau (même taille, même couleur) ; pas de case pré-cochée ;
  - choix gardé 6 mois au plus, puis reposé ; refus = pub limitée (le filigrane peut quand même être retiré) ;
  - lien « Gérer les cookies » en bas des pages (app, Tarifs et pages légales) qui rouvre la fenêtre ; à défaut tant que ce n'est pas branché, lien « Cookies » vers `/confidentialite#cookies` ;
  - **décidé (propriétaire, 30/10) : pas d'âge minimum.** Les conditions disent « ouvert à tous ; si tu es mineur, demande l'accord d'un parent avant de t'abonner », et la confidentialité « moins de 15 ans : demande à un parent avant d'accepter les cookies publicitaires, ou refuse ». Stalak n'est pas un site fait pour les enfants : ne pas le déclarer « destiné aux enfants » dans Ad Manager. Si un utilisateur dit avoir moins de 13 ans (par exemple dans l'aide), ne lui servir que des pubs non personnalisées.
- **À faire (propriétaire)** : compte Google Ad Manager (paiement et informations fiscales au nom de la future structure : même nom que Paddle et la banque).
- **À faire (Marketing)** : la page Tarifs doit reprendre exactement les prix et contenus des conditions (en dollars, avec la mention « prix final avec taxes affiché avant le paiement »). En Europe, le prix montré au consommateur doit être le prix final taxes comprises : afficher les prix localisés de Paddle (aperçu des prix) plutôt que « 7,99 $ » seul.
- **À faire (Comptes)** : bouton de rétractation « Renoncer au contrat ici », obligatoire depuis le 19/06/2026 (ordonnance n° 2026-2) : visible pendant 14 jours après l'achat, gratuit, avec accusé de réception par e-mail. Cahier des charges à écrire par Juridique.
- Mineurs : réglé par la décision « pas d'âge minimum » (phrases sur l'accord d'un parent dans les conditions et la confidentialité). Google (connexion, pub, boîte contact@) est maintenant dans la confidentialité.
- **À faire une fois la structure créée** : nom, adresse (ou domiciliation) et SIRET dans les mentions légales ; nom légal dans les conditions (`--seller`) ; médiateur de la consommation désigné et nommé ; responsable du traitement nommé ; validation du site par Paddle (même nom sur le site, le compte Paddle et la banque).
