# Vidéo de démo pour la validation TikTok — script plan par plan (21/11/2026)

À tourner par le Chef de projet avec le propriétaire, **après la fusion** de `social/tiktok-publier` (les maquettes n'ont pas les clés
TikTok). Enregistrement d'écran d'ordinateur, sans montage compliqué, 3 à 5 minutes, en anglais à l'écran (`stalak.app`, langue EN)
pour les relecteurs de TikTok.

## Avant de filmer

- Appli TikTok en mode **Sandbox**, clés du bac à sable dans Cloudflare (déjà fait), `SOCIAL_CONNECT_ENABLED = "1"`, migration 0018 appliquée.
- Un compte Stalak **Pro** (Publier est réservé à Pro). Le compte TikTok testeur **privé du propriétaire** (pas @stalak_app : compte entreprise, il ne peut pas être privé, et avant l'audit TikTok n'accepte la publication directe que sur un compte privé) déconnecté de Stalak au départ
  (page « Account » → « Unlink » si besoin).
- Une vidéo courte déjà prête dans Stalak (un son + une prise), exportée **sans filigrane**.
- Navigateur en plein écran, barre d'adresse visible (on doit lire `https://stalak.app`), notifications coupées. Aucun mot de passe
  visible : le propriétaire tape le sien hors champ ou on coupe ce passage.

## Le script

| Plan | Ce qu'on montre | Produit / permission montré | Texte à l'écran (sous-titre) |
|---|---|---|---|
| 1 | `https://stalak.app` dans la barre d'adresse, l'accueil de Stalak | le site déclaré (domaine vérifié) | « Stalak: a web editor for lip-sync music videos » |
| 2 | Menu du compte → « Account » → carte « TikTok » → « Link TikTok » | Login Kit | « Users link their own TikTok account » |
| 3 | La fenêtre TikTok : connexion du compte de test privé, l'écran d'autorisation avec **les 5 permissions** bien lisibles, « Authorize » | Login Kit : `user.info.basic`, `video.publish`, `video.upload`, `user.info.stats`, `video.list` | « The user sees and accepts each permission » |
| 4 | Retour sur Stalak : la carte montre l'**avatar et le nom** du compte, « My stats », « Unlink » | `user.info.basic` | « Avatar and display name (user.info.basic) » |
| 5 | Ouvrir le projet, « Export », écran « Your video is ready » → « Post to TikTok » | Content Posting API | « Post a finished video to TikTok » |
| 6 | Le formulaire : le nom du compte TikTok en haut, l'aperçu de la vidéo (la lire 2 s), la légende qu'on modifie | creator_info, Direct Post | « Creator info is loaded before each post » |
| 7 | « Who can watch this video? » : ouvrir la liste, montrer qu'**aucun choix n'est fait d'avance**, puis choisir « Only me » | Direct Post (privacy_level_options) | « No default visibility; options come from TikTok » |
| 8 | Comments / Duet / Stitch décochés (Stitch grisé si le compte l'interdit), en cocher un | Direct Post (interaction settings) | « Interactions are off until the user turns them on » |
| 9 | « Commercial content » : l'activer, montrer qu'il faut choisir, cocher « Your brand » (étiquette « Promotional content »), puis « Branded content » (« Only me » devient impossible, la phrase cite la Branded Content Policy), puis tout désactiver | Direct Post (brand_organic / brand_content) | « Commercial content disclosure, as required » |
| 10 | La phrase de consentement avec le lien **Music Usage Confirmation** ; le bouton « Post » ne marche qu'une fois tout rempli ; cliquer « Post » | Direct Post | « Nothing is sent before the user clicks Post » |
| 11 | La barre d'envoi, « TikTok is processing your video… », puis « Posted on TikTok ✓ » et « See it on TikTok » | Direct Post, FILE_UPLOAD, status/fetch | « Upload in chunks, then status tracking » |
| 12 | Cliquer « See it on TikTok » : la vidéo sur le profil du compte de test (visible par « Only me », mode Sandbox) | Direct Post | « The video is on the creator's profile » |
| 13 | Retour sur Stalak, « Post to TikTok » à nouveau, choisir **« Send as a draft to TikTok »**, envoyer : « Sent ✓ Open TikTok: your video is waiting in your inbox… » | Content Posting API, `video.upload` | « Draft mode (video.upload) » |
| 14 | Sur le téléphone ou TikTok web : la notification / le brouillon dans la boîte de réception TikTok | `video.upload` | « The creator finishes the post in TikTok » |
| 15 | Stalak → menu du compte → « TikTok · My stats » : abonnés, j'aime, nombre de vidéos | `user.info.stats` | « Account numbers (user.info.stats) » |
| 16 | Défiler : « Your latest videos » avec vignettes, vues et j'aime ; puis l'analyse Pro (jour, heure, durée, hashtags, passage du son, top 3) et la phrase « These numbers… don't guarantee views » | `video.list` | « The user's own videos (video.list) » |
| 17 | « Account » → « Unlink » → confirmer : la carte revient à « Link TikTok » | Login Kit (révocation) | « Users can unlink at any time; Stalak deletes the data » |

## Après

- Mettre la vidéo dans le formulaire de validation de l'appli TikTok (une vidéo pour tous les produits, ou une par produit si le
  formulaire le demande : couper aux plans 2-4, 5-14, 15-16).
- Vérifier que le texte de la demande (déjà rempli) parle bien du brouillon (`video.upload`) et des stats (`user.info.stats`, `video.list`).
- Une fois validée : clés de Production dans Cloudflare (propriétaire), puis un vrai essai public avec @stalak_app.
