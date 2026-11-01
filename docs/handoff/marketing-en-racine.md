# Compte rendu — branche `marketing/en-racine` (Marketing & croissance, 01/11/2026)

Statut : PRÊT

Branche partie de `main` (f87bdac). À mettre en ligne **en une fois avec les liens d'e-mails de Comptes** (point 5). Aucune migration SQL.

## Résumé

Les 4 décisions du propriétaire du 31/10 à 20 h 15 (haut de `docs/STATUS.md`) :

1. **L'anglais à l'adresse principale, le français dans `/fr/`** (plan `docs/marketing/US_FIRST.md`, partie A).

   | Page | Anglais | Français |
   |---|---|---|
   | Accueil (l'app) | `/` | `/fr/` |
   | Tarifs | `/pricing` | `/fr/tarifs` |
   | Conditions | `/terms` | `/fr/conditions` |
   | Remboursement | `/refunds` | `/fr/remboursement` |
   | Confidentialité | `/privacy` | `/fr/confidentialite` |
   | Mentions légales | `/legal-notice` | `/fr/mentions-legales` |

   - `hreflang` : fr → `/fr/`, en et x-default → `/` (accueil et pages jumelles).
   - **Redirections 301 directes** (jamais en chaîne, Cloudflare garde le `?…`) dans `site_src/_redirects` : `/en`, `/en/`, `/en/index.html`, chaque `/en/<page>` (et `.html`) → la racine ; `/tarifs`, `/conditions`, `/remboursement`, `/confidentialite`, `/mentions-legales` (et `.html`) → `/fr/…` ; anciennes pages Triller : `/en/triller-alternative` → `/triller-alternative`, `/alternative-triller` → `/fr/alternative-triller` ; puis `/en/*` → `/:splat`.
   - **Pas de redirection automatique selon la langue** (Google visite en anglais) : sur l'accueil anglais, un téléphone réglé en français voit « Version française → » (en haut, fermable d'un appui, choix retenu ; le lien retient le français avec la même clé que le bouton FR / EN et garde le panneau ouvert, ex. `#connexion`). Il est décidé avant le premier affichage : rien ne bouge (CLS 0). Caché si la page est déjà en français ou si une langue a été choisie.
   - **App installée** : chaque accueil a son manifest. `/manifest.webmanifest` (anglais, `start_url /?app=1`) et `/fr/manifest.webmanifest` (français, `start_url /fr/?app=1`) : installée depuis `/fr/`, l'app s'ouvre en français, iPhone compris (l'app d'écran d'accueil d'iOS ne partage pas la mémoire de Safari). Les apps installées avant la bascule ouvrent `/?app=1` : un téléphone en français qui n'a jamais choisi de langue y garde le français (`?lang=fr` ajouté avant le démarrage de l'app) ; celui qui a choisi l'anglais le garde.
   - La langue de l'app suit la balise `lang` de la page (déjà le cas dans `app.js`) : **aucun changement de logique dans `app.js`**.
2. **Les 6 guides anglais publiés** à la racine : `/lip-sync-video-editor`, `/music-video-maker-for-rappers`, `/rap-snippet-video`, `/lip-sync-videos-for-singers`, `/how-to-make-a-lip-sync-video`, `/edit-video-to-the-beat`. Liens « Guides » dans le pied de page de l'accueil anglais (cachés en français), lien vers le guide pas à pas dans « What is Stalak? ». Textes revérifiés et corrigés après relecture : les coupes suivent la musique phrase par phrase (Auto, de Chill à Punchy), « On the words » coupe au début de chaque ligne et sur la rime, « Every bar » change de prise à chaque mesure ; il faut des paroles calées pour couper sur les mots. L'ancien « on every beat, every word » de l'accueil anglais et de `llms.txt` (antérieur à cette branche) est corrigé aussi. Vidéo d'exemple affichée seulement si `site_src/demo/exemple.mp4` existe.
3. **Page comparative Triller (option B)** : `/triller-alternative` et `/fr/alternative-triller`. Neutre et vraie : ce que faisait Triller, ce que Stalak fait pareil, ce qu'il ajoute, **ce qu'il ne fait pas** (pas de fil social, pas de catalogue de sons, pas d'appli à télécharger, logo sur les vidéos gratuites), pour qui il n'est pas fait. Faits datés et sourcés : Triller Group dit avoir arrêté l'ancienne appli et ne pas vouloir la refaire (réponses aux actionnaires du 29/06/2026, présentation aux actionnaires, SEC ; la société prévoit de se renommer Eight Holdings) ; Digital Music News (15/07/2026). Les lignes « Le son » et « Prix » de Triller sont datées 2015 (seule source) ; la description pour Google attribue l'arrêt à la société mère. Les pages sont produites par `site_drafts/make_triller.py`. **Triller seulement**, aucun autre concurrent. Liée depuis **aucune** autre page (ni accueil, ni Tarifs, ni app, ni `llms.txt`) : seulement le plan du site et le lien entre ses deux langues. Données structurées Article + FAQ + fil d'Ariane. Bouton vers l'accueil avec `?ref=seo-triller`.
4. **Annuaires d'outils et Bing** : document claude.ai « Stalak — annuaires d'outils et Bing » (https://claude.ai/artifact/EbcSbWg4zfAhNLrN6XWDn9, colonne Statut à cocher par le propriétaire) et `docs/marketing/ANNUAIRES.md` : 18 sites vérifiés le 01/11 dans l'ordre (BetaList et Microlaunch sont devenus payants, annuaires d'IA écartés), textes anglais prêts par type de site, étapes Bing (import depuis Search Console). Logo carré 1024 et 5 vraies captures dans `docs/marketing/annuaires/` (envoyés aussi au propriétaire).

Aussi : plan du site à 16 adresses, **sans** les pages « noindex » (confidentialité, mentions légales : choix Juridique) qui y étaient par erreur ; `lastmod` = vraie date de modification de la page (dernier commit de sa source) ; `sitemap-old.xml` liste les anciennes adresses ; « Your Privacy Choices » ajouté au pied de page de `/pricing` (tâche Marketing du STATUS) et des nouvelles pages ; `llms.txt` (nouvelles adresses + guides, sans concurrent).

## Fichiers touchés

- `build_site.py` : chemins des deux accueils, `hreflang`, offres JSON-LD, pied de page (guides), plan du site (`SITEMAP_PAIRS`, `GUIDES`, vérification qu'aucune page listée ne manque, `lastmod`), bandeau « Version française → » et langue de l'app installée (accueil anglais seulement), boucle des pages statiques (racine + `fr/`, `{{URL}}`, bloc DEMO).
- `site_src/` : pages anglaises déplacées de `en/` à la racine, françaises dans `fr/` (liens, canonical, `hreflang` réécrits) ; 6 guides ; `triller-alternative.html`, `fr/alternative-triller.html` ; `_redirects`, `_headers` (`/fr/` sans cache), `manifest.webmanifest`, `llms.txt`, `sitemap-old.xml`.
- `site_drafts/make_pages.py` (date, modes de coupe, pied de page), `site_drafts/out/*`, `site_drafts/README.md` ; nouveau `site_drafts/make_triller.py` (page comparative FR / EN).
- `site_src/fr/manifest.webmanifest` (nouveau) ; x-default ajouté sur `terms`, `refunds`, `fr/conditions`, `fr/remboursement` (le plan du site le déclarait déjà).
- **Fichiers partagés, au minimum** : `src/markup.html` (6 liens : `/fr/tarifs`, `/fr/conditions`, `/fr/remboursement`, `/fr/confidentialite`) ; `src/app.js` (5 liens anglais de `I18N_EN` : `/pricing`, `/terms`, `/refunds`, `/privacy`, et 2 commentaires) ; `src/pricing.css` (1 commentaire). **À relire par App.**
- `tests/ui/*.py` (14 fichiers) : chemins des pages seulement (`/` anglais, `/fr/` français, `fr/index.html`) ; `filtres_ui.py` et `formules_ui.py` testent de nouveau la page française (`fr/`).
- `public/` reconstruit.
- Docs : `docs/STATUS.md`, `docs/marketing/US_FIRST.md`, `docs/marketing/SEO.md`, `docs/marketing/ANNUAIRES.md`, `docs/marketing/annuaires/` (6 images), ce compte rendu.

## Tests

- `python3 build_site.py --domain stalak.app --email contact@stalak.app` : OK (68 fichiers) ; `python3 build.py` (version claude.ai) : OK ; syntaxe de `src/app.js` : OK.
- `node tests/backend/run.mjs` : **78/78**.
- Vérification du site construit (script Marketing) : 20 pages, 355 liens internes, **aucun lien cassé ni vers une adresse redirigée**, JSON-LD valides, canonical et `hreflang` cohérents, aucun concurrent cité hors des 2 pages Triller, aucune page ne lie la page Triller.
- Playwright, **390 px et 1280 px, FR et EN, 20 pages** : bonne langue, pas de défilement horizontal, un seul titre H1, aucune erreur ; bandeau (affiché pour un téléphone français, × le ferme pour de bon, le lien ouvre `/fr/` et retient le français, rien pour en-US / de-DE ni sur `/fr/`, caché après le bouton FR) ; app installée (fr-FR → français, en-US → anglais, choix anglais gardé) ; liens Tarifs / Conditions de l'app dans la bonne langue ; bandeau sans décalage (CLS 0,000) ; lien du bandeau qui garde le panneau ouvert ; un manifest par langue : **58/58**.
- `tests/ui/help_ui.py` : **42/42** (FR et EN, et la version claude.ai) ; `tests/ui/plans_ui.py` : **35/35** ; `tests/ui/gallery_ui.py` : **49/49** ; `tests/ui/support_ui.py` : **39/39** sur un serveur de test neuf ; `tests/ui/formules_ui.py` : **169/169** ; `tests/ui/filtres_ui.py` : **106/106** (ces six tests utilisent les nouveaux chemins `/` et `/fr/`).
- `tests/ui/lyrics_ui.py` : FR 390 px entier et EN 1280 px jusqu'à « vocals of the same length » (51 réussis), puis arrêt sur le message « fichier de voix illisible » en anglais. **Exactement le même arrêt sur `main`** (51 réussis, même ligne 192) : préexistant, sans lien avec la bascule ; à regarder par App (la clé `lyr.vox.bad` n'a pas de version anglaise dans `I18N_EN`).
- `tests/ui/animations_ui.py` : 42 à 43/44 selon les passages. Les échecs sont la mesure de fluidité « processeur 4 fois plus lent » (images de plus de 20 ms), qui varie d'un passage à l'autre sur cette machine : **le même test sur `main` donne aussi 43/44, avec le même échec** (« iPhone fr : fluide… »). Rien à voir avec ce changement ; toutes les autres règles d'animation passent, pages `/fr/…` et anglaises comprises.

## Relecture indépendante (1/11)

Faite par un agent qui n'avait pas vu le travail : site reconstruit à part (identique au `public/` livré), règles Cloudflare rejouées sur les 34 anciennes pages (une seule 301 chaque fois, `?…` gardé, aucune boucle), plan du site, canonical / `hreflang`, JSON-LD, liens, 11 cas du bandeau et de l'app installée, sources Triller rouvertes. Rien de grave. Corrigé ensuite :
- une promesse fausse (« cuts on every beat, every word ») sur la page Triller, 3 guides, l'accueil anglais et `llms.txt` → les vrais modes de l'app ;
- le bandeau faisait bouger la page (CLS 0,057 en français) → affiché avant le premier rendu (CLS 0) ;
- une app installée depuis `/fr/` sur un appareil réglé en anglais s'ouvrait en anglais → manifest français ;
- précisions sur la page Triller (Eight Holdings, lignes datées 2015, description attribuée, source française exacte) ;
- `filtres_ui.py` / `formules_ui.py` ouvraient l'accueil anglais avec un navigateur français → page `fr/`.
Restent, sans action : `/en/pricing/` (avec `/` final, jamais une adresse officielle) passe par 2 redirections ; les 301 « Triller → accueil » servies depuis le 30/10 restent en mémoire dans certains navigateurs.

## Pour la mise en ligne (Chef de projet)

1. Fusionner `marketing/en-racine` **avec** le petit changement de Comptes (point 5), puis mettre en ligne.
2. Vérifier en vrai : `https://stalak.app/en/` → `/` (301), `/tarifs` → `/fr/tarifs`, `/en/pricing?x=1` garde `?x=1`, `/alternative-triller` → `/fr/alternative-triller`.
3. Search Console : soumettre `https://stalak.app/sitemap.xml` **et** `https://stalak.app/sitemap-old.xml`, demander l'indexation de `/` et `/fr/`. Retirer `sitemap-old.xml` (fichier et soumission) après ~6 semaines.
4. Dire au propriétaire que la bascule est en ligne : il fait Bing puis les annuaires (document claude.ai).
5. **Comptes, le même jour** (liens des e-mails ; sans eux rien ne casse grâce aux 301, mais un e-mail français mènerait à l'accueil anglais, et `#compte` y ouvre le panneau du compte en anglais par-dessus le bandeau) :
   - `functions/_lib/cloud.js` l. 433 : `https://stalak.app/#compte` → `https://stalak.app/fr/#compte` ; l. 439 : `https://stalak.app/en/#compte` → `https://stalak.app/#compte` ;
   - `functions/_lib/reminders.js` l. 19 : `${site}/#compte` → `${site}/fr/#compte` (fr), `${site}/en/#account` → `${site}/#account` (en) ;
   - `functions/_lib/oauth.js` l. 175 : langue par défaut `ret.startsWith('/en') ? 'en' : 'fr'` → `ret.startsWith('/fr') ? 'fr' : 'en'` (l'app envoie déjà `lang`, c'est un filet) ; l. 205 : retour par défaut `/#account` (anglais) quand la connexion échoue, à faire suivre la langue ;
   - commentaires `/en/` de `oauth.js` (l. 2, 133), `social.js` (l. 5, 239) et `reminders.js` l. 1 (`site_src/en/terms.html` → `site_src/terms.html`) ;
   - facultatif : le lien « stalak.app » en bas des e-mails **français** (`email.js` l. 50, `cloud.js` l. 451, `support.js` l. 77, `reminders.js` l. 36) pourrait mener à `https://stalak.app/fr/` ; aujourd'hui il mène à l'accueil, qui devient anglais (avec le bandeau « Version française → » pour un téléphone en français).
6. **App** : relire les liens des fichiers partagés (ci-dessus). Rien d'autre.
7. **Juridique** : vérifier les adresses des pages légales citées dans les conditions et dans les e-mails Paddle.
8. `STALAK_CONTEXTE.md` (connaissances du projet) dit encore pour le build « FR sur `/`, EN sur `/en/` » : à corriger.

## Ce qu'il reste au propriétaire

- Après la mise en ligne : **Bing** (environ 10 minutes, import depuis Search Console) et **Crawler Hints** dans Cloudflare, puis les **annuaires** dans l'ordre du document (il crée les comptes et colle les textes).
- **Deux décisions** : déclarer Stalak « alternative à Triller » sur AlternativeTo / SaaSHub (c'est sur leur site, pas le nôtre) ; accepter ou non un lien vers Twelve Tools et Fazier en pied de page de stalak.app (sinon payant, ou on les saute).
- Mettre en ligne une vidéo de démo (YouTube ou TikTok) : la plupart des annuaires demandent un lien.

Skills utilisés : `site-architecture`, `seo-audit` (contrôles du site), `competitors` (page Triller), `copywriting`, `directory-submissions`, `ai-seo`, `docs`, `webapp-testing` (tests Playwright).
