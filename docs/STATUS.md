# Stalak — état du projet

> Tenu à jour par le Chef de projet. Chaque conversation le lit avant de commencer et met à jour sa section sur sa branche à la fin de chaque tâche.
> Dernière mise à jour : 27/10/2026 (section Comptes : assistant d'aide).

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
- Pages : tarifs, conditions, remboursement, confidentialité, mentions légales (FR/EN), avec des animations glacées.

## En cours
- **Précision des paroles auto** (branche `lyrics-accuracy`) :
  - voix mise en avant avant l'envoi ;
  - contexte transmis d'un morceau à l'autre ;
  - import de la voix seule (a cappella).

- **Assistant IA de la bulle d'aide** (branche `compte/assistant-aide`, prête à fusionner) :
  - le glaçon d'aide répond sur stalak.app (route `POST /api/help/chat`, Workers AI, modèle Gemma 4 26B) ;
  - ouvert à tous, sans compte ; rien n'est gardé ; message « IA, peut se tromper » ;
  - limites : 15 questions / 10 min et 60 / jour par connexion, 60 / jour pour tout le site (`HELP_DAILY_MAX`) ;
  - aucune migration ; politique de confidentialité FR/EN complétée ;
  - revue de sécurité : `docs/appsec-review-assistant-aide.md`.

## Base de données D1
- Migrations appliquées : 0001, 0002, 0003, 0004_lyrics_usage, 0004_cloud_save.

## À faire, par rôle

### Chef de projet
- Fusionner `lyrics-accuracy`, puis mettre en ligne.
- Supprimer l'ancien projet Cloudflare « stalak » en double.

### App & montage
- Faire tester la caméra iPhone par le propriétaire : son après le décompte, sens du selfie, lecture fluide, vitesse d'export.

### Comptes, paiements & serveur
- Paddle en réel une fois la structure créée : nouveaux produits, prix, clés et webhook, puis `PADDLE_ENV=production`.
- Microsoft (création du compte bloquée, à retenter) et Apple (programme développeur à 99 $/an).
- Ménage quotidien automatique des projets (Worker `workers/cloud-cleanup`, à déployer avec wrangler depuis un ordinateur). Pour l'instant, le ménage se fait quand quelqu'un ouvre « Mes projets ».
- Assistant IA de la bulle d'aide : fait (branche `compte/assistant-aide`). Après la mise en ligne : poser quelques vraies questions pour juger les réponses ; ajuster `HELP_DAILY_MAX` si besoin.
- Mettre à jour le test `tests/ui/lyrics_ui.py` (il attend `vad_filter` activé, `lyrics.js` le coupe exprès) : 2 vérifications en échec, déjà sur `main`.
- Plus tard : saler l'empreinte des IP des compteurs (paroles et aide) avec `AUTH_SECRET`.
- Plus de 210 minutes de transcription par jour : passer au forfait Workers payant (5 $/mois).

### Réseaux sociaux
- Comptes Instagram (passé en professionnel) et TikTok de Stalak.
- Comptes développeur TikTok et Meta.
- Publication directe : connexion des comptes, adresse vidéo temporaire sur R2, dossiers de validation, vidéo de démo.

### Marketing & croissance
- Contenu des réseaux de Stalak, plan de lancement.
- Logo de Stalak sur l'écran de connexion Google (vérification de l'app par Google).

### Juridique & business
- LLC ou micro-entreprise.
- Nom légal dans les mentions légales et les conditions (option `--seller` du build).
- Validation du site par Paddle.
