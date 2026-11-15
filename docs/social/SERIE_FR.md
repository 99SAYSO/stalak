# Série animée en français : programmation, bios, rapport, boost

> Réseaux sociaux (4), le 15/11/2026, d'après la décision du propriétaire du 15/11 (18 h 07) transmise par le Chef de projet.
> **Ce document remplace** `PROMO_AUTO.md`, `TACHE_DIMANCHE.md` et `PREMIER_ESSAI.md` (circuit du 3 au 7/11 : comptes en anglais, une vidéo par jour à 16 h 30 New York, « ok » dans la conversation de Marketing). Ces fichiers restent pour l'historique.

## Ce qui change le 15/11

- **Langue** : `@stalak_app` passe en **français**, sur un seul compte, sur TikTok et sur Instagram.
- **Contenu** : la série animée de Marketing. Un rappeur enregistre chez lui, veut faire des vidéos de promo, n'y arrive pas, et découvre Stalak ; chaque épisode est une situation de la vie d'un rappeur.
- **Rythme** : **3 vidéos par jour**, programmées par **Réseaux sociaux** dans Zernio. Marketing fabrique, Réseaux sociaux programme.
- **Accord** : le propriétaire **approuve chaque lot dans Zernio**. Rien ne part sans son accord.

## 1. Programmation : 3 vidéos par jour

**Heures de départ (heure de Paris)** : **12 h 30, 18 h et 21 h**, chaque jour. On les ajustera avec le rapport du samedi : ces trois horaires servent de test d'heure.

**Ce que Marketing (5) livre pour chaque lot** (par exemple 21 épisodes pour une semaine) :

- les vidéos en MP4, 9:16, 1080 × 1920, de 60 s au plus (au-delà, Shorts et TikTok les traitent moins bien) ;
- un fichier `promo/serie/lots/AAAA-MM-JJ.md` sur sa branche. Pour chaque épisode, une ligne : n°, titre, nom du fichier, légende en français (avec « stalak.app » écrit en toutes lettres), 3 à 5 hashtags, durée, voix IA ou pas ;
- les fichiers vidéo, au choix :
  - **(a)** dans un dossier Google Drive « Stalak — série FR / lot AAAA-MM-JJ » ;
  - **(b)** directement chez Zernio : outil `media_get_media_presigned_url`, puis envoi du fichier. Marketing note alors l'adresse `publicUrl` de chaque épisode dans le fichier du lot. Elle reste valable 7 jours, il faut donc programmer dans la semaine.

**Ce que fait Réseaux sociaux** (dans cette conversation, sur demande du propriétaire ou du Chef de projet quand un lot est prêt) :

1. Lire le fichier du lot et vérifier chaque légende : français, « stalak.app », aucun concurrent cité, rien d'inventé.
2. Envoyer les vidéos à Zernio, si Marketing ne l'a pas déjà fait :
   - adresse d'envoi de Zernio ;
   - si l'envoi est refusé depuis l'espace de travail : lien de partage Google Drive, retiré une fois la vidéo publiée.
3. Créer **une publication par épisode** avec `posts_create_post`, en mode **« en attente d'approbation »** (`requires_approval: true`) :
   - réseaux : TikTok `6aea6c148f6a54a6ec36f683` et Instagram `6aea6a4e8eb8b805f91e01de` (Reel partagé dans le fil), plus YouTube Shorts une fois relié (voir « À décider ») ;
   - `scheduled_for` : `AAAA-MM-JJT12:30:00`, `T18:00:00` ou `T21:00:00`, avec `timezone` : `Europe/Paris` ;
   - réglages TikTok : `privacy_level: PUBLIC_TO_EVERYONE` (seule possibilité pour ce compte), commentaires oui, Duo non, Collage non, `commercialContentType: none`, `videoMadeWithAi: false`. Décisions du propriétaire du 4/11 : sans « Ta marque » ni étiquette IA, ni mention « AI voiceover ». Un dessin animé n'est pas une image réaliste : TikTok ne demande l'étiquette IA que pour des scènes ou des personnes réalistes ;
   - `content_preview_confirmed` et `express_consent_given` : TikTok les demande dès la création. Ils prennent effet seulement quand le propriétaire approuve la publication dans Zernio ; une publication non approuvée ne part jamais ;
   - étiquettes : `serie-fr`, `lot-AAAA-MM-JJ`, `ep-<n°>`, `heure-1230` / `heure-1800` / `heure-2100`.
4. Envoyer au propriétaire le tableau du lot (jour, heure, épisode, légende) et lui dire de l'approuver dans Zernio.
5. **Jamais** de publication immédiate (`publish_now`, `posts_publish_now`), et jamais `posts_review_post` à la place du propriétaire. Une seule exception : il l'écrit lui-même dans cette conversation (« approuve le lot du … »). Dans ce cas, Claude demande encore son accord avant chaque appel.

**Approbation dans Zernio** : chaque publication reste « en attente d'approbation » jusqu'à ce que le propriétaire l'approuve. Approuvée, elle part à son heure ; refusée, elle redevient un brouillon. Zernio ne publie jamais une publication en attente.

**Point à vérifier au premier lot** : la documentation de Zernio décrit l'approbation par l'API, pas l'écran. S'il n'y a pas de bouton « Approuver » dans le site Zernio, le propriétaire écrira ici « approuve le lot du … », et Claude le fera après son accord dans Claude.

## 2. Bios en français

Écrites avec le skill `profile-optimizer`. À coller par le propriétaire dans les applis.

**TikTok** (80 caractères au plus) :

- Bio conseillée : `Monte ton snippet de rap sur le beat en 1 min 🎤❄️ Gratuit, sans compte 👇`
- Autre version : `Rappeur ? Ton snippet coupé sur le beat, tout seul 🎤❄️ Gratuit, sans compte 👇`
- Site web : `stalak.app/fr/?ref=tiktok`. Le champ n'apparaît qu'à partir de 1 000 abonnés (ou plus tôt sur certains comptes professionnels). En attendant, la bio dit « stalak.app ».

**Instagram** (150 caractères au plus) :

- Nom affiché (lu par la recherche Instagram) : `Stalak · montage de clips rap`.
- Bio conseillée :
  ```
  Ton snippet de rap monté sur le beat en 1 minute 🎤❄️
  Ton son + tes prises : Stalak coupe sur le rythme, synchro des lèvres.
  Gratuit, sans compte 👇
  ```
- Autre version, quand la série tourne :
  ```
  Pour les rappeurs qui veulent poster plus 🎤❄️
  Ton son + tes prises → Stalak coupe sur le beat, tout seul.
  Nouvel épisode chaque jour. Gratuit 👇
  ```
- Lien : `stalak.app/fr/?ref=ig`.

Tout ce que disent ces bios est vrai : gratuit sans compte, coupes sur le rythme, prises synchronisées. Aucun concurrent n'est cité.

## 3. Rapport du samedi, vidéo par vidéo

Tâche programmée du samedi à 20 h 31 (consigne : `TACHE_SAMEDI.md`, mise à jour le 15/11). Pour chaque vidéo de la série publiée depuis au moins 2 jours, sur TikTok et Instagram (et Shorts une fois relié) :

- **vues** ;
- **part regardée jusqu'au bout** : `completion_rate` sur TikTok. Sur Instagram, Zernio donne la durée moyenne regardée (`ig_reels_avg_watch_time`), qu'on divise par la durée de la vidéo ;
- **partages** ;
- **visites du profil** : `profile_views`. TikTok le donne vidéo par vidéo. Sur Instagram, si Zernio ne le donne pas vidéo par vidéo, le rapport le dit ;
- **visites du site venues des réseaux** : `ref=tiktok`, `ref=ig` (plus tard `ref=youtube`), jour par jour. Elles sont lues dans le dernier rapport chiffres du Chef de projet (`docs/stats/*-rapport.md` sur `main`). La tâche du samedi n'a pas accès à la base du site, et elle n'a pas besoin de secret pour lire ce rapport. S'il n'y a pas de rapport de la semaine, le bilan l'écrit.

Ensuite, le classement :
- par heure de départ (12 h 30, 18 h, 21 h) ;
- par épisode ou type de situation ;
- les 3 meilleures vidéos (candidates au boost) ;
- les 3 moins bonnes.

Journal : `docs/social/serie-journal.csv`, sur la branche `social/promo-journal`.

## 4. Plus tard : posts et stories Instagram

À préparer **quand la série tourne** (au moins 2 semaines de lots), pas avant : un calendrier de carrousels (coulisses de la série, « 3 erreurs de snippet »), de sondages en story (« tu montes tes snippets comment ? ») et de coulisses du personnage. Réseaux sociaux le propose, Marketing écrit les textes, le propriétaire valide.

## 5. Boost payant : préparé, pas lancé

Voir `BOOST_FR.md`.

## À décider (propriétaire)

- **YouTube Shorts** : la chaîne @stalak_app n'est plus reliée à Zernio. L'offre gratuite de Zernio s'arrête à 2 comptes ; un 3ᵉ compte coûte **6 $ par mois**. La chaîne est aussi réglée en anglais, pour les tutos. Deux choix :
  - payer 6 $ par mois, relier la chaîne, et y poster les épisodes en français ;
  - ou garder les Shorts hors de Zernio pour l'instant.
- **Heures** : 12 h 30, 18 h et 21 h au départ. On revoit après 2 semaines, avec au moins 5 vidéos par heure.

## Sources (consultées le 15/11/2026)

- Zernio : approbation et états des publications (documentation de l'outil, « Post statuses », « Review ») ; prix : https://zernio.com/pricing
- TikTok, contenu généré par IA (étiquette pour les scènes réalistes) : https://www.tiktok.com/community-guidelines/integrity-authenticity/
