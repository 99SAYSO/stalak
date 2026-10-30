# Stalak — contexte commun à toutes les conversations

> À mettre dans les « connaissances du projet » Claude (Project knowledge).
> Chaque conversation du projet le lit avant de travailler. Mis à jour le 30/10/2026 (nouvelle offre : Gratuit 1 vidéo par jour + Basic / Pro / Max).

## 1. Le produit en une minute

**Stalak** (https://stalak.app) est une app web de montage de playback (lip sync), dans l'esprit de Triller.
- L'utilisateur importe son son et plusieurs vidéos où il chante dessus.
- Stalak coupe sur le rythme en passant d'une prise à l'autre, avec une synchro des lèvres parfaite.
- Il exporte pour TikTok, Reels, Shorts, ou un clip YouTube en 16:9.
- Le montage et l'export se font dans le navigateur, sur l'appareil.
- Artiste : 99Sayso, collectif Alaska. Priorité : simple, mondial (FR + EN), iPhone Safari d'abord.
- Direction artistique : froid, glace, neige, liquide.
  - Fond bleu ciel avec neige qui tombe, cartes blanches à contour encre (#0a0d14), stalactites.
  - Polices Lilita One (titres) et Rubik.
  - Mascotte en parka bleue à fourrure, avec 16 emojis dans `site_src/emoji/`.
- Ton des textes : français avec « tu », anglais naturel et décontracté.

## 2. Offre et décisions déjà prises (ne pas les remettre en cause sans le dire)

**Offre (décidée le 30/10/2026, en cours de mise en place) :**
- **Gratuit** : 1 vidéo par jour, compte gratuit obligatoire, logo Stalak de 3 s à la fin, 3 filtres. E-mail de rappel quotidien si l'utilisateur l'accepte.
- **Basic** : 4,99 €/mois ou 39 €/an. Vidéos illimitées sans logo, toutes les tailles et apparitions du texte, 3 filtres.
- **Pro** : 10,99 €/mois ou 109 €/an. Basic, plus tous les filtres, le mode Clip 16:9, les packs de 5 et 10, les paroles automatiques (20 par jour) et la sauvegarde en ligne (20 Go).
- **Max** : 13,99 €/mois ou 139 €/an. Pro, plus les packs de 30, les paroles automatiques (60 par jour), 100 Go et « Parler à un humain » (chat en direct, ou réponse par e-mail sous 24 h ; ne jamais écrire « 24 h/24 »). Carte mise en avant : « seulement 3 € de plus que Pro ».
- Prix TTC en Europe. Un abonné garde son prix.

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
- Éditeur anonyme (particulier) pour l'instant. Une LLC américaine est prévue.
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
