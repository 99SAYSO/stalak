# Stalak — contexte commun à toutes les conversations

> À mettre dans les « connaissances du projet » Claude (Project knowledge).
> Chaque conversation du projet le lit avant de travailler. Mis à jour le 30/10/2026 à 21 h (cible : États-Unis d'abord ; aucun concurrent cité sur le site ; filigrane, packs, sauvegarde automatique).

## 1. Le produit en une minute

**Stalak** (https://stalak.app) est une app web de montage de playback (lip sync), dans l'esprit de Triller.
- L'utilisateur importe son son et plusieurs vidéos où il chante dessus.
- Stalak coupe sur le rythme en passant d'une prise à l'autre, avec une synchro des lèvres parfaite.
- Il exporte pour TikTok, Reels, Shorts, ou un clip YouTube en 16:9.
- Le montage et l'export se font dans le navigateur, sur l'appareil.
- Artiste : 99Sayso, collectif Alaska. Priorité : simple, iPhone Safari d'abord.
- **Marché visé : les États-Unis d'abord (décision du 30/10 au soir).** L'anglais (américain) est la langue principale du site, des textes et du marketing ; le français reste disponible. Prix en dollars.
- Direction artistique : froid, glace, neige, liquide.
  - Fond bleu ciel avec neige qui tombe, cartes blanches à contour encre (#0a0d14), stalactites.
  - Polices Lilita One (titres) et Rubik.
  - Mascotte en parka bleue à fourrure, avec 16 emojis dans `site_src/emoji/`.
- Ton des textes : français avec « tu », anglais naturel et décontracté.
- **Animations et transitions (décision du 31/10)** : toute animation du site ou de l'app est choisie avec le skill `motion-design` (chaque animation doit avoir un rôle ; durées courtes, courbes « ease-out » pour ce qui apparaît, `transform` et `opacity` seulement, respect de « réduire les animations »). Responsable : App & montage.
- **Vidéos promo / motion design (31/10)** : deux skills sont dans le dépôt (`.claude/skills/`), chargés quand une conversation ouvre le dépôt : `code-motion-video` (films en code : HTML + Playwright + ffmpeg, calés sur la musique) et `saas-motion-video` (méthode en 7 étapes avec validation du propriétaire, kit dans `tools/motion/saas-motion-kit/`). Pour les vidéos TikTok / Reels / pubs de Stalak. Responsable : Marketing & croissance.

## 2. Offre et décisions déjà prises (ne pas les remettre en cause sans le dire)

**Offre (décidée le 30/10/2026 au soir, remplace Basic / Pro / Max du même jour) :**
- **Gratuit, sans compte obligatoire** :
  - montage illimité (coupes sur le rythme), paroles en phrases entières, taille M ;
  - import des paroles et calage au tap, mais pas de paroles automatiques ;
  - les filtres gratuits (Givre, Film 35 mm, Noir & blanc) ;
  - export avec un **filigrane** : seulement le logo Stalak, discret, dans l'esprit du filigrane de l'ancien Triller ; il change de place de temps en temps en apparaissant directement à un autre endroit, sans qu'on le voie glisser ;
  - **pub récompensée** : regarder une pub vidéo d'environ 30 s retire le filigrane de CETTE vidéo, gratuitement. Pubs « rewarded » web de Google Ad Manager (GPT), pas AdMob ni AppLovin, qui ne marchent que dans les applis installées.
- **Stalak Pro** : 7,99 $/mois ou 49,99 $/an. Ni pub ni filigrane. Débloque le mode Clip 16:9, les effets premium, les paroles mot par mot et karaoké (et toutes les tailles), tous les filtres et les paroles automatiques.
- **Stalak Creator Plus** : 14,99 $/mois ou 99,99 $/an. Tout Pro, plus le générateur de packs (5 à 30 vidéos aux coupes différentes, à partir de 2 playbacks), la sauvegarde en ligne **automatique** (chaque projet s'enregistre tout seul, comme CapCut ; pas de bouton « Sauvegarder en ligne ») et « Parler à un humain » (chat en direct, ou réponse par e-mail sous 24 h ; ne jamais écrire « 24 h/24 »).
- La limite d'une vidéo gratuite par jour, l'e-mail de rappel et la fin de vidéo de 3 s sont **abandonnés**.
- Prix en dollars dans Paddle ; Paddle les convertit et ajoute la TVA selon le pays. Un abonné garde son prix.
- **Aucun concurrent cité sur le site** (ni Triller, ni CapCut, ni camrip, etc.) : pages, FAQ, `llms.txt`, textes de l'app. Décision du 30/10 au soir.
- Croissance : aucun faux témoignage ni pub déguisée. Le fondateur parle en son nom (« je suis rappeur, j'ai codé Stalak »), dans le respect des règles de chaque réseau.

**Règles commerciales :**
- Un abonné qui perd la sauvegarde en ligne (fin d’abonnement, ou passage à une formule sans sauvegarde) **perd l’accès** à ses projets en ligne. Ils restent gardés jusqu’à l’effacement des 6 mois et reviennent s’il reprend une formule qui la contient.
- Remboursement : 14 jours, intégral, sans justification.
- Paiement par **Paddle**, revendeur officiel (Merchant of Record). Aujourd'hui en mode **test (sandbox)**.
- Le ruban de la carte annuelle dit « Meilleur prix », pas « Le plus populaire » : pas d'affirmation fausse.

**Comptes :**
- Inscription par e-mail + mot de passe, avec un code e-mail pour vérifier l'adresse.
- Un code est aussi demandé sur un nouvel appareil, puis l'appareil est retenu 90 jours.
- Connexion Google active. Microsoft et Apple sont prêts dans le code mais pas configurés.
- Un mauvais mot de passe donne toujours le même message, pour ne pas révéler quels e-mails ont un compte.

**Statut légal :**
- Éditeur anonyme (particulier) pour l'instant. **Le propriétaire crée une micro-entreprise française (décision du 30/10)** ; la LLC américaine n'est plus prévue. Plafond de la micro-entreprise : environ 83 600 € encaissés par an ; passage en société si Stalak dépasse.
- Les vrais paiements attendent la structure. Les mentions légales et les conditions recevront le nom légal (option `--seller` du build).

## 3. Technique (où sont les choses)

- **Code** : GitHub `99SAYSO/stalak`, branche `main`. Le dépôt est la **source de vérité**.
- **Hébergement** : Cloudflare Pages, projet `stalak-site`. Déploiement automatique à chaque push sur `main` : sortie `public/`, fonctions serveur dans `functions/`.
- **Build** :
  - site : `python3 build_site.py --domain stalak.app --email contact@stalak.app`, qui produit `public/` (FR sur `/`, EN sur `/en/`) ;
  - version claude.ai (un seul fichier, sans comptes) : `python3 build.py`, qui produit `shuffle-lab.html` ;
  - **toujours reconstruire `public/` avant de pousser.**
- **Sources** :
  - app : `src/` (`app.js` en un seul bloc, `markup.html`, `style.css`, `theme.css`, `pricing.css`, `account.js`) ;
  - pages légales et tarifs : `site_src/` ;
  - serveur : `functions/_lib/` ;
  - schéma de base : `migrations/` ;
  - mode d'emploi serveur en français : `BACKEND.md`.
- **Services** :
  - **D1 `stalak`** : comptes, abonnements, projets. Migrations 0001 à 0004 appliquées. Une nouvelle migration se lance à la main dans la console D1, **avant** le déploiement.
  - **R2 `stalak-media`** : vidéos des projets sauvegardés, privé.
  - **Workers AI** : Whisper large-v3-turbo pour les paroles automatiques.
  - **Resend** : e-mails envoyés depuis login@stalak.app.
  - **Email Routing** : contact@stalak.app arrive sur le Gmail du propriétaire.
  - **Paddle sandbox**, **Google OAuth** (projet Google Cloud « Stalak »), Web Analytics, Search Console et Bing.
- **Langues** :
  - textes en français dans le markup, avec `data-i18n` ;
  - anglais dans `I18N_EN` et textes JS français dans `I18N_FR`, dans `app.js` ;
  - fonctions `_t()` et `setT()`.
- **Fonctions Pro** : `acctPro()` donne le statut, `acctOpen('raison')` ouvre la page Pro. Côté serveur : `requirePro`.
- **Tests** :
  - serveur : `node tests/backend/run.mjs`, tout doit passer ;
  - interface : `tests/ui/*.py` (Playwright) ;
  - vérifier aussi la syntaxe de `src/app.js` et que `build.py` passe.

## 4. Règles de travail entre conversations

1. **Une seule conversation publie** : la conversation « Chef de projet », qui fusionne dans `main`, lance les migrations et met en ligne. Les autres travaillent sur une **branche à leur nom** (`app/…`, `compte/…`, `social/…`, `marketing/…`) et donnent à la fin le nom de la branche et un résumé.
2. **Avant de commencer** : récupérer la dernière version de `main` et lire `docs/STATUS.md` dans le dépôt.
3. **À la fin de chaque tâche** (le propriétaire n'a rien à copier-coller) :
   - mettre à jour `docs/STATUS.md` sur sa branche (fait, en cours, à décider) ;
   - écrire le compte rendu pour le Chef de projet dans `docs/handoff/<nom-de-la-branche-avec-des-tirets>.md`, sur la même branche. Il contient : `Statut : PRÊT` (ou `EN COURS`), le résumé, les fichiers touchés, la migration SQL s'il y en a, les tests passés et ce qu'il reste à faire au propriétaire ;
   - **pousser la branche sur GitHub** et vérifier qu'elle y est (`git ls-remote --heads origin <branche>`) ;
   - dire au propriétaire « c'est prêt, le Chef de projet va l'intégrer ».

   Le Chef de projet surveille GitHub. Toute branche avec un compte rendu `Statut : PRÊT` est relue, testée, fusionnée et mise en ligne sans que le propriétaire ait à transmettre quoi que ce soit.
4. **Fichiers partagés** (`src/app.js`, `src/markup.html`, `functions/_lib/router.js`) :
   - modifier le moins possible en dehors de son domaine ;
   - ajouter ses clés de traduction dans un bloc à part, avec un commentaire au nom du domaine ;
   - ne pas reformater le reste du fichier.
5. **Jamais de secret** (clé API, mot de passe) dans le code ni dans la conversation : les secrets vont dans Cloudflare → stalak-site → Variables and secrets, saisis par le propriétaire.
6. **Le propriétaire** crée lui-même les comptes, tape les mots de passe et les codes, accepte les conditions et fait les paiements. Claude peut faire le reste dans Chrome une fois le propriétaire connecté.
7. **Utiliser les skills disponibles** pour chaque tâche : vérification des docs (`context7`), revue de sécurité (`appsec-review`), tests web (`webapp-testing`), textes de vente (`copywriting`), SEO (`seo-audit`), etc. Dire lesquels ont servi.
8. **Avant chaque mise en ligne** : tests serveur + vérification sur téléphone (390 px) et ordinateur (1280 px), en FR et EN, sans défilement horizontal, sans erreur. La version claude.ai doit toujours se charger.

## 5. Les rôles

| Conversation | Domaine | Fichiers principaux |
|---|---|---|
| **1. Chef de projet** (la conversation d'origine) | Fusion, mises en ligne, Cloudflare, Paddle, D1, tests finaux, priorités | tout, en lecture ; publication |
| **2. App & montage** | Éditeur, export, caméra iPhone, effets, performances, bugs d'affichage | `src/` (sauf le bloc compte), `build.py` |
| **3. Comptes, paiements & serveur** | Connexion, Pro, Paddle, sauvegarde en ligne, paroles auto, sécurité | `functions/`, `migrations/`, `src/account.js`, bloc compte de `app.js`, `BACKEND.md` |
| **4. Réseaux sociaux** | Publication directe TikTok et Instagram, dossiers de validation TikTok/Meta, vidéo de démo | `functions/_lib/social.js`, nouveaux fichiers, interface « Publier » |
| **5. Marketing & croissance** | Textes, page tarifs, SEO, réseaux de Stalak, lancement, e-mails | `site_src/`, textes, plans (peu de code) |
| **6. Juridique & business** (optionnel) | LLC, Paddle en réel, mentions légales, conditions, conformité | `site_src/` pages légales, documents (pas un avis juridique) |
