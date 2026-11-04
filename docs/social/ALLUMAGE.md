# Allumer la publication directe (TikTok et Instagram) : ce qu'il reste à faire

> Réseaux sociaux (4), le 5/11/2026. Liste pour plus tard : rien n'est codé pour l'instant.
> « Publication directe » : **les utilisateurs de Stalak** publient leur vidéo sur **leur** TikTok ou **leur** Instagram, depuis l'app.
> Ce n'est pas la même chose que les vidéos promo de Stalak : celles-là passent déjà par Zernio.

## Où on en est

- **Fait et en ligne, mais éteint** : la connexion des comptes côté serveur (`functions/_lib/social.js`, migration 0005 appliquée le 27/10).
- **Pas encore fait** :
  - les applis développeur TikTok et Meta, et les 5 secrets ;
  - les boutons et l'écran « Publier » dans l'app ;
  - l'envoi de la vidéo (adresse temporaire sur R2) ;
  - les dossiers de validation.

## Étape 1 : toi, créer les applis (environ 1 h 30 en tout, faisable en une soirée)

| # | Quoi | Temps pour toi | Détail |
|---|---|---|---|
| 1 | Compte développeur TikTok, puis appli « Stalak » : type Web, Login Kit, Content Posting API avec Direct Post, permissions `user.info.basic` et `video.publish` | 30 min | `docs/SOCIAL_SETUP.md` partie A, étapes 2, 3, 5 et 6 |
| 2 | Vérifier stalak.app chez TikTok : un texte DNS à coller dans Cloudflare, je te guide | 10 min | Partie A, étape 4. La vérification prend en général quelques minutes, parfois quelques heures |
| 3 | Mode test (Sandbox) de TikTok : ajouter ton compte TikTok perso comme testeur | 5 min | Partie A, étape 7 |
| 4 | Compte développeur Meta (téléphone et double authentification), puis appli « Stalak », cas d'usage Instagram, adresses de retour | 30 min | Partie B, étapes 2 à 5 |
| 5 | Ajouter ton Instagram perso comme testeur et accepter l'invitation dans l'appli Instagram | 5 min | Partie B, étape 6 |
| 6 | Les 5 secrets dans Cloudflare : `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `SOCIAL_TOKEN_KEY` (40 caractères aléatoires que tu inventes, à ne plus jamais changer) | 10 min | Partie C |

- **Adresses à recopier** : confidentialité `https://stalak.app/privacy`, conditions `https://stalak.app/terms`. Ce sont les adresses anglaises en place depuis le 1/11.
- **Compte Instagram de test** : il doit être professionnel (Créateur ou Entreprise). Si c'est un compte perso, le passer en pro prend 1 min.

## Étape 2 : nous, le code (pour toi : environ 20 min de test)

- **Moi (Réseaux sociaux)**, en 1 à 2 séances :
  - les boutons « Relier TikTok / Instagram » ;
  - l'écran « Publier » : légende, réglages TikTok lus chez TikTok pour chaque personne, aperçu, accord avant l'envoi ;
  - l'envoi de la vidéo par une adresse temporaire sur R2 ;
  - les tests et la revue de sécurité.
- **Juridique (6)** : ajouter TikTok et Instagram dans la page de confidentialité (ce qu'on garde, combien de temps, comment le supprimer). TikTok et Meta la lisent.
- **Chef de projet (1)** : fusion, mise en ligne, puis `SOCIAL_CONNECT_ENABLED = "1"`.
- **Toi** : relier tes comptes de test et publier 1 vidéo sur chaque réseau. Sur TikTok, la vidéo sera **privée** tant que l'appli n'est pas auditée : c'est normal.
- **À décider avant** : la publication directe est-elle réservée à Stalak Pro, ou ouverte à tous ?

## Étape 3 : les validations (pour toi : environ 1 h, puis de l'attente)

| # | Quoi | Temps pour toi | Attente |
|---|---|---|---|
| 7 | **Vidéos de démo** : enregistrer l'écran pendant que tu relies ton compte et publies, une vidéo pour TikTok et une pour Instagram. Je prépare le script plan par plan et les sous-titres | 30 min | — |
| 8 | **Validation de l'appli TikTok** (« Submit for review ») : je rédige les réponses, tu les colles et tu envoies | 15 min | **Quelques jours à 2 semaines**, d'après TikTok. En cas de refus, on corrige et on renvoie |
| 9 | **Audit de la Content Posting API de TikTok**, pour que les vidéos soient publiques : un formulaire, je prépare les réponses | 15 min | **Plusieurs semaines, variable** : TikTok ne donne pas de délai. Jusque-là, tout ce qui est publié reste privé |
| 10 | **Vérification d'entreprise chez Meta** : elle demande un document officiel au nom de l'entreprise, donc il faut **attendre le SIRET** (attendu 1 à 4 semaines après le 3/11). Ensuite : avis de situation Sirene ou extrait RNE, adresse, téléphone | 15 min | Souvent quelques jours, parfois plus de 10 jours d'après des développeurs |
| 11 | **App Review de Meta** pour `instagram_business_basic` et `instagram_business_content_publish` (« Advanced Access »), avec la vidéo de démo. Il faut avoir réussi au moins 1 publication avant, ce qui est fait à l'étape 2 | 15 min | Meta ne donne pas de délai ; compter de quelques jours à 2 semaines, plus en cas de refus |

## En résumé

- **Ton temps actif : environ 3 h**, en 4 ou 5 fois.
- **Délai total réaliste : 4 à 8 semaines**, à cause des validations. Le plus long : l'audit TikTok et la vérification Meta, qui attend le SIRET.
- **Chemin conseillé** :
  - faire l'étape 1 dès que tu as une soirée ;
  - envoyer TikTok en validation sans attendre Meta : chaque réseau s'allume dès qu'il est prêt ;
  - Instagram en dernier, quand le SIRET est arrivé.

## Sources (consultées le 5/11/2026)

- TikTok, FAQ des développeurs (validation « quelques jours à 2 semaines », contenu privé avant l'audit) : https://developers.tiktok.com/doc/getting-started-faq
- Meta, App Review de l'API Instagram (Advanced Access, vidéo de démo, au moins 1 appel réussi) : https://developers.facebook.com/documentation/instagram-platform/app-review
- Délais de la vérification d'entreprise Meta, d'après des développeurs : https://communityforums.atmeta.com/questions-and-discussions-26/business-verification-in-review-10-days-blocking-app-review-submission-177498
- Ce que regardent les personnes qui valident chez TikTok : https://bundle.social/blog/tiktok-api-approval
