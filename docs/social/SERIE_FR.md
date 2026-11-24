# Série animée en français : programmation, bios, rapport, boost

> Réseaux sociaux (4), le 15/11/2026, d'après la décision du propriétaire du 15/11 (18 h 07) transmise par le Chef de projet.
> **Ce document remplace** `PROMO_AUTO.md`, `TACHE_DIMANCHE.md` et `PREMIER_ESSAI.md` (circuit du 3 au 7/11 : comptes en anglais, une vidéo par jour à 16 h 30 New York, « ok » dans la conversation de Marketing). Ces fichiers restent pour l'historique.

## Ce qui change le 15/11

- **Langue** : `@stalak_app` passe en **français**, sur un seul compte, sur TikTok et sur Instagram.
- **Contenu** : la série animée de Marketing. Un rappeur enregistre chez lui, veut faire des vidéos de promo, n'y arrive pas, et découvre Stalak ; chaque épisode est une situation de la vie d'un rappeur.
- **Rythme** : **3 vidéos par jour**, programmées par **Réseaux sociaux** dans Zernio. Marketing fabrique, Réseaux sociaux programme. Depuis 21 h 23, tout passe par la page « Studio Stalak » (voir plus bas).
- **Accord** : le propriétaire **approuve chaque lot dans Zernio**. Rien ne part sans son accord.

## 1. Programmation : 3 vidéos par jour

**Heures de départ (heure de Paris)** : **12 h 30, 18 h et 21 h**, chaque jour. On les ajustera avec le rapport du samedi : ces trois horaires servent de test d'heure.

### Depuis le 15/11 à 21 h 23 : tout passe par « Studio Stalak »

Page privée du propriétaire : https://claude.ai/artifact/UEFPPVbewDG4ATF9nLwJbx. Format des fiches : `docs/studio/STUDIO_STALAK.md`. Skills : `stalak-videos-reseaux` et `stalak-da`.
Il n'y a plus de fichier de lot ni de dossier Drive : **la fiche `videos` de la page est la seule source**.

- **Marketing (5)** écrit les fiches (`script`), fabrique après le feu vert du propriétaire, dépose la vidéo dans la page (`videoUrl`) et passe la fiche en `video`.
- **Le propriétaire** valide : `script_ok`, puis `valide`. Personne ne le fait à sa place.
- **Réseaux sociaux (4)** programme **seulement les fiches `valide`**, puis les passe en `programme` et en `publie`.

**Ce que fait Réseaux sociaux** (dans cette conversation, quand le propriétaire ou le Chef de projet dit que des fiches sont validées) :

1. **Lire les goûts** : collection `da`, toute la liste (skill `stalak-da`). Pour les légendes, deux points comptent surtout :
   - pas de pub dès la première ligne : la situation d'abord, Stalak à la fin ;
2. **Lire les fiches `valide`** (collection `videos`, `where statut == "valide"`). Pour chacune, vérifier :
   - la légende : en français, « stalak.app » écrit ;
   - la date, l'heure et la durée.
   Si une légende pose problème, ne pas la corriger soi-même : le dire au propriétaire, car la fiche est validée telle quelle.
3. **Récupérer la vidéo** : `videoUrl` est un fichier privé de la page, que Zernio ne peut pas lire. Il faut le télécharger avec l'outil `Artifact` (`action: "read"`, `url` de la page, `path` = l'identifiant du fichier), puis l'envoyer à Zernio :
   - par son adresse d'envoi (`media_get_media_presigned_url`, puis envoi du fichier) ;
   - si l'envoi est refusé depuis l'espace de travail : le lien de dépôt de Zernio (`media_generate_upload_link`), que le propriétaire ouvre pour déposer les fichiers.
4. **Créer une publication par fiche** avec `posts_create_post`, en mode **« en attente d'approbation »** (`requires_approval: true`) :
   - réseaux : TikTok `6aea6c148f6a54a6ec36f683` et Instagram `6aea6a4e8eb8b805f91e01de` (Reel partagé dans le fil), plus YouTube Shorts une fois relié (voir « À décider ») ; on suit le champ `reseaux` de la fiche ;
   - texte : `legende` de la fiche, suivie des `motsCles` en hashtags ;
   - `scheduled_for` : la `date` de la fiche et son heure (créneau 1 = 12 h 30, 2 = 18 h, 3 = 21 h, sauf si `heure` dit autre chose), avec `timezone` : `Europe/Paris` ;
   - réglages TikTok : `privacy_level: PUBLIC_TO_EVERYONE` (seule possibilité pour ce compte), commentaires oui, Duo non, Collage non, `commercialContentType: none`, `videoMadeWithAi: false`. Décisions du propriétaire du 4/11 : sans « Ta marque », sans étiquette IA, sans mention « AI voiceover ». Pour un dessin animé, TikTok ne demande l'étiquette IA que si les scènes ou les personnes sont réalistes ;
   - `content_preview_confirmed` et `express_consent_given` : TikTok les demande dès la création. Ils ne valent qu'à partir du moment où le propriétaire approuve la publication dans Zernio ; une publication jamais approuvée ne part jamais ;
   - étiquettes Zernio : `serie-fr`, `fiche-<id de la fiche>`, `heure-1230` / `heure-1800` / `heure-2100`.
5. **Envoyer au propriétaire le tableau du lot** (jour, heure, titre, légende), puis lui demander d'approuver dans Zernio.
6. **Passer la fiche en `programme`** une fois le lot approuvé (la publication est `scheduled` dans Zernio), avec `majPar: "reseaux-sociaux"`, `majLe` et `zernioId` (l'identifiant de la publication Zernio ; champ ajouté par Réseaux sociaux, à confirmer par le Chef de projet).
7. **Passer la fiche en `publie`** quand Zernio la donne publiée sur tous ses réseaux. La tâche du samedi le fait aussi pour celles qu'on aurait oubliées.
8. **Jamais** de publication immédiate (`publish_now`, `posts_publish_now`), et jamais `posts_review_post` à la place du propriétaire. Une seule exception : il l'écrit lui-même dans cette conversation (« approuve le lot du … »). Dans ce cas, Claude demande encore son accord avant chaque appel.
9. **Une remarque du propriétaire** sur une vidéo, une légende ou une heure : elle va dans `da` (skill `stalak-da`), puis on corrige.

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

Tout ce que disent ces bios est vrai : gratuit sans compte, coupes sur le rythme, prises synchronisées.

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
