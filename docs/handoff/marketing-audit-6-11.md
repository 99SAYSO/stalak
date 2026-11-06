Statut : PRÊT
Branche : marketing/audit-6-11
Conversation : 5. Marketing & croissance
Partie de : `main` 5b947f3 (audit complet du 6/11, Chef de projet)
Maquette : https://marketing-audit-6-11.stalak-site.pages.dev (accueil `/` et `/fr/`, `/pricing` sur téléphone, `/rap-snippet-video` et les autres guides, une adresse inconnue comme `/xyz` pour la page 404)

Résumé (points de `docs/audit/2026-11-06-audit-complet.md` marqués Marketing) :

- **Point 6, accueil** : le propriétaire avait fait retirer le texte d'accueil le 31/10 (« ne pas le remettre ») ; je lui ai
  posé la question le 6/11 à 20 h et il a choisi la **« version compacte »** :
  - vrai titre de la page (h1) : « Free lip-sync video editor for rappers » / « Le montage de playback gratuit pour les
    rappeurs », une phrase (« Film a few takes of your song. Stalak cuts them on the beat, lips in sync. ») et une petite vidéo
    en boucle (un vrai montage Stalak, sans le son) ;
  - téléphone et tablette : la vidéo à côté du titre, au-dessus de la mascotte ; ordinateur (≥ 900 px) : à gauche du formulaire ;
  - caché dès qu'un son est importé, ou quand la carte « Reprendre ton dernier montage ? » s'affiche ; la vidéo ne joue que
    quand on la voit (et s'arrête ensuite) ; avec « réduire les animations », elle ne démarre pas seule et montre ses commandes ;
  - **le logo n'est plus le h1** : `<h1>` → `<div class="brand">` autour de `#homeBtn` (`src/markup.html` l.5), sélecteurs
    `h1` / `h1 .logo` de `src/theme.css` devenus `.brand` / `.brand .logo` (3 lignes). Aucun test ne visait le h1.
  - Code : bloc « Marketing & croissance » dans `#p1` (`src/markup.html`), bloc à la fin de `src/theme.css`, clés `hero.h1`,
    `hero.s`, `hero.v` dans `_bloc.marketing.accueil` (`src/app.js` ; `hero.t`, `hero.acct`, `hero.priv` retirées, elles ne
    servaient plus). `build_site.py` : la vidéo s'affiche si `site_src/demo/edit.mp4` existe (avant : `hero.mp4`). Version
    claude.ai : le titre et la phrase, sans la vidéo.
- **Vidéo de démo** (pour 6 et 13) : ses prises « neva die », **avec l'accord du propriétaire (6/11, 20 h) : exception à sa
  règle « aucune prise dans le dépôt » pour ces seuls fichiers ; il a les droits de l'instru**. Vrai export de l'app (4 mesures,
  une coupe par mesure, 3 lieux, filigrane mascotte), réduit pour le web (408 Ko). Détail, planche contact et scripts :
  `docs/marketing/DEMO.md`.
- **Point 8, tableau des Tarifs sur téléphone** (`src/pricing.css`, ≤ 600 px) : chaque ligne = la fonction sur sa ligne, puis
  les 3 formules côte à côte ; les noms des formules restent en haut de l'écran pendant le défilement ; plus rien à faire glisser
  (avant : 520 px dans 352 px, seule la colonne Gratuit visible). Rôles ARIA ajoutés au tableau (FR/EN) pour que les lecteurs
  d'écran le lisent toujours comme un tableau. Ordinateur inchangé.
- **Point 11, page 404** : `site_src/404.html` et `site_src/fr/404.html` (« This page melted » / « Cette page a fondu », la
  mascotte « !! », « Make a video » et « See pricing », pied de page commun), `noindex`, hors du plan du site, liens absolus.
  Cloudflare Pages les sert avec le code 404 pour toute adresse inconnue (`/fr/…` → la française). Vérifié en local (serveur qui
  imite Pages) ; **à vérifier en ligne : `curl -I https://stalak.app/xyz` doit dire 404**. Aucune adresse de l'app ne dépendait
  du renvoi vers l'accueil (l'app n'utilise que `#…`, les fonctions sont sous `/api`, `/admin`, `/admin-demo`).
- **Point 13, guides** : chacun des 6 guides a une partie de ~250 à 290 mots propre à son sujet (ce que Stalak fait des prises ;
  préparer un tournage ; une semaine de snippets ; filmer une performance chantée ; chaque étape en détail ; comment Stalak
  trouve le temps et le TAP) et un **avant / après** (image des 3 prises brutes → la vidéo montée, avec le son, lancée au toucher,
  `preload="none"`). Les guides passent de ~430 à 650–710 mots. Page Triller FR/EN : la vidéo seule.
- **Point 7, l'exemple réel** : prêt dans `site_src/demo/example/` (8 mesures du son, 3 prises légères, `example.json`) et
  vérifié dans l'app (calage 0, 157 BPM). **À brancher par App** (remplacer le son fabriqué et les visages dessinés, puis
  « Now try it with your song » sur l'écran de fin de l'exemple) : mode d'emploi dans `docs/marketing/DEMO.md`.
- **Point 19, mêmes mots que l'app** : Tarifs FR/EN (cartes et tableau), guides, page Triller et `llms.txt` : paroles auto
  « 20 a day » / « 20 par jour » (Creator Plus : 60), sauvegarde « 100 GB » / « 100 Go », « Talk to a human » / « Parler à un
  humain » (avant : « real person », « vraie personne »). « 3 steps » → **4** (Son, Prises, Paroles, Montage, comme l'app) :
  texte « What is Stalak? » de l'accueil FR/EN, guide « How to make a lip-sync video in 4 steps » (titre, h1, étapes, HowTo),
  `llms.txt`. Chiffres pris dans `functions/_lib/entitlements.js`.
- **Point 21** : lien « step-by-step guide » de l'accueil en blanc gras souligné (`build_site.py`, `.about a` ; avant 1,93:1) ;
  **une image de partage par guide** (`site_src/og/*.jpg`, 1200 × 630, la marque seulement, générées par
  `site_drafts/make_og.py`) ; **descriptions** ajoutées aux 8 pages légales FR/EN (domaine Juridique : une ligne `<meta>` par
  page, rien d'autre).
- `site_src/_headers` : `/demo/*` et `/og/*` gardés 1 jour.

Remarque pour App (détection du tempo) : sur le son complet des prises de « neva die » (25,5 s), l'app lit **89,7 BPM au lieu de
157** (rapport 7/4, ni ½× ni 2× ne corrigent) ; sur l'extrait de 12 s, elle lit bien 157. Pour la démo, j'ai corrigé avec le TAP
de l'app, comme un utilisateur. Détail dans `docs/marketing/DEMO.md`.

Si conflit à la fusion :
- fin de `src/theme.css` (mon bloc est ajouté tout à la fin) : garder les deux blocs ;
- `src/markup.html` l.5 (logo) et le début de `#p1` ; `_bloc.marketing.accueil` de `src/app.js` ;
- `public/` : reconstruire avec `build_site.py` après les fusions.

Skills utilisés : `copywriting` (titre, phrase, textes des guides), `pricing` (mêmes chiffres partout, Tarifs lisibles par les
IA), `planche-contact` (vidéo de démo), `seo-audit` (vérification : un seul h1 par page, 404 hors du plan du site et en
`noindex`, descriptions, images de partage, plan du site inchangé à 16 adresses). Pas `hyperframes` : la vidéo est un vrai
export de l'app, pas un film monté.

Fichiers touchés : `src/markup.html`, `src/theme.css`, `src/app.js` (bloc Marketing), `src/pricing.css`, `build_site.py`,
`site_src/` (`pricing.html`, `fr/tarifs.html`, 6 guides, `triller-alternative.html`, `fr/alternative-triller.html`, `llms.txt`,
`404.html`, `fr/404.html`, 8 pages légales, `_headers`, `demo/`, `og/`), `site_drafts/make_pages.py`, `make_triller.py`,
`make_og.py` (nouveau), `out/`, `README.md`, `docs/marketing/DEMO.md` (nouveau), `SEO.md`, `US_FIRST.md`, `public/`
(reconstruit), `docs/STATUS.md`.
Migration SQL : aucune.

Tests (6/11, 20 h 30) :
- serveur 96/96, plans 35/35, audit 158/158, pied de page 402/402, liens_cmp 58/58, projet local 48/48 ;
- formules 136/137. Le seul échec, « export d'une vidéo gratuite : le filigrane est dans chaque image », échoue aussi sur
  `main` 5b947f3 (relancé seul 4 fois : 110 et 111 réussis, 81 et 89 ratés ; sur cette branche : 108, 114, 111 réussis, 74 et
  77 ratés). Il n'a rien à voir avec cette branche. Le Chromium des tests ne sait pas encoder l'AAC
  (`AudioEncoder.isConfigSupported('mp4a.40.2')` → non), donc l'app prend l'export en temps réel (MediaRecorder) : le nombre
  d'images dessinées dépend de la vitesse de la machine (2 processeurs ici), et le seuil du test est de 100. Sur l'export de
  `main`, le filigrane est bien sur chaque image (planche contact, 35 images). Sur cette machine, ces exports en temps réel n'ont
  que 48 à 73 images pour ~18 s. Sur un vrai Chrome ou Safari (avec AAC), l'export image par image est utilisé. Pour App : ce test
  pourrait viser l'export image par image, ou compter autrement sans AAC.
- Pendant l'export, la vidéo de l'accueil est cachée et en pause (vérifié).

Reste au propriétaire : regarder la maquette (accueil sur téléphone et ordinateur, Tarifs sur téléphone, un guide, une adresse
inconnue), puis donner son « ok ».
