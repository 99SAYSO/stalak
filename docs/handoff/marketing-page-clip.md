Statut : PRÊT
Branche : marketing/page-clip
Conversation : 5. Marketing & croissance
Partie de : `marketing/clip-avant` 84476d6 (elle-même partie de `main` 4e15291), comme demandé. Depuis, `main` a 2 commits (étude du
mode Clip, ligne de STATUS) : seulement des documents, la fusion passe sans conflit (vérifié avec `git merge-tree`).
Maquette : https://marketing-page-clip.stalak-site.pages.dev (`/music-video` et `/fr/clip` ; liens depuis le pied de page, la
section Clip de `/pricing` et `/fr/tarifs`, et « What is Stalak? » de l'accueil)

**À publier en même temps que l'étape 1 d'App, pas avant** : la FAQ dit que l'aperçu gratuit montre tout le clip, effets et
paroles compris, avec le filigrane (décision du propriétaire du 7/11, n° 2 de l'étude). Aujourd'hui, en Gratuit, l'aperçu du Clip
ne pose aucun effet : la phrase serait fausse.

Demande du propriétaire (7/11, 16 h 04) : « Le mode Clip devient le cœur de Pro (étude `docs/clip/2026-11-07-etude-mode-clip.md`).
App va utiliser ton vrai exemple (`site_src/demo/example/`) en TikTok et en 16:9 : vérifie qu'il marche bien en clip (le morceau,
les 3 prises, les paroles). Ajoute une prise horizontale si possible. Prépare aussi une page « Clip » du site, avec le vrai exemple
16:9 et le message « tout ton morceau en clip YouTube », pour la mise en ligne de l'étape 1 d'App. Aucun concurrent cité. »

Résumé :
- **L'exemple réel, vérifié en mode Clip** (16:9, Intense, dans le site construit) : il marche, avec 2 choses à faire par App et
  une limite. Détail et chiffres : `docs/marketing/DEMO.md`, partie « En mode Clip (16:9) : vérifié le 7/11 ».
  - **Le morceau** : lu en entier (12,2 s, 8 mesures, 157 BPM), mais la grille de l'app tombe sur le 3ᵉ temps et 90 ms trop tard.
    → **App impose le tempo d'`example.json`** (avec ce tempo, la grille tombe à 29 ms près, moins d'une image).
  - **Les 3 prises** : calées à 0 toutes seules ; verticales, donc posées entières au centre sur leur copie floutée (≈ 32 % de la
    largeur, n° 4 de l'étude). La prise 1 s'arrête après 2 mesures.
  - **Les paroles** : aucune dans l'exemple ; les 2 lignes connues s'affichent bien en 16:9. En Clip, l'app coupe les paroles par
    défaut → **App les garde affichées pour l'exemple**. Les autres lignes sont demandées au propriétaire.
  - **La limite** : ces 8 mesures n'ont ni drop ni break, donc 2 ou 3 effets seulement. **Proposition** : pour l'exemple en Clip,
    le passage entier de 25,5 s des mêmes prises (5 effets, 14 à 16 coupes, comme la vidéo de la page), environ 10 Mo. Il faut
    l'accord du propriétaire pour ces fichiers : rien n'est ajouté à `example/`.
  - **Prise horizontale** : il n'y en a aucune (ses prises sont verticales, `mv.mp4` est un extrait monté sans le son). Demandée au
    propriétaire le 7/11. À son arrivée, Marketing la cale et l'ajoute à l'exemple.
- **Nouvelle page « Clip »** : `/music-video` (« Your whole song as a YouTube music video ») et `/fr/clip` (« Tout ton morceau en
  clip YouTube »), sources `site_src/music-video.html` et `site_src/fr/clip.html`.
  - Haut de page : le titre, une phrase, le bouton « Make my music video » / « Faire mon clip » vers l'app, et « Pick “Music video”
    at step 1. Try it free; exporting the video takes Stalak Pro. » / « Choisis « Clip » à l'étape 1. Essaie-le gratuitement ;
    l'export du clip est avec Stalak Pro. »
  - **La vraie vidéo 16:9** : `site_src/demo/clip.mp4` (4,1 Mo, 25,5 s, 1280 × 720) et son affiche `clip.jpg`. C'est un export de
    l'app, sans retouche : ses 3 prises de « neva die », mode Clip, Intense, 14 coupes et 5 effets (zoom, rafale, flash, secousse,
    fondu au noir). Fabrication et planche contact : `docs/marketing/DEMO.md`.
  - Puis « Comment ça marche » (3 étapes), « Ce que tu obtiens », « Conseils pour filmer », la carte Pro (7,99 $/mois ou 49,99 $/an,
    soit 4,17 $/mois) et 5 questions. Tout ce qui est écrit, l'app le fait déjà (vérifié dans `src/app.js` : 7 effets de
    `FX_TYPES`, couper le début et la fin, filmer dans Stalak, format vertical possible en Clip), sauf l'aperçu gratuit complet
    (n° 2). Aucun concurrent cité, aucun chiffre inventé, aucun avis.
  - Les paroles : la page ne dit pas si elles sont affichées ou non par défaut en Clip (« colle-les… ou n'en mets pas »), pour
    rester juste quel que soit le choix d'App au n° 2.
  - Référencement : titre et description (151 et 156 caractères), canonique, hreflang FR/EN, images de partage
    `/og/music-video.jpg` et `/og/clip.jpg` (`site_drafts/make_og.py`), données structurées WebPage + VideoObject, plan du site,
    `llms.txt`.
- **Liens vers la page** : pied de page de toutes les pages, colonne Produit, juste sous Tarifs (« Music video mode » / « Le mode
  Clip », `src/footer.py`) ; section Clip de la page Tarifs (« See a real example » / « Voir un vrai exemple ») ; « What is
  Stalak? » de l'accueil (« Music video mode » / « Mode Clip » devient un lien, `build_site.py`).

Pour App :
- l'exemple : imposer le tempo d'`example.json` et garder les paroles affichées en Clip (voir plus haut) ;
- le pied de page est aussi dans le paquet de l'app (`site.footer`) : le fichier `public/assets/app.<empreinte>.js` change de nom
  (`app.c877fc72b6.js` → `app.9aaa661e23.js`), c'est normal ;
- si l'étape 1 contient aussi le **n° 4** (cadrage des prises verticales) ou le **n° 6** (changer Clip ↔ TikTok au montage), dites-le
  à Marketing : la page dit aujourd'hui « Stalak les montre en entier, au milieu, sur une copie floutée » et « Choisis
  « TikTok / Reels » à l'étape 1 ». Textes prêts, à caler sur vos vrais noms de boutons :
  - n° 4, question « Je peux utiliser des prises filmées à la verticale ? » : « Oui. Dans un clip 16:9, choisis comment s'affiche
    chaque prise verticale : en entier sur une copie floutée d'elle-même, ou en plein cadre, centrée sur ton visage (Stalak Pro).
    Les prises horizontales remplissent toute l'image. » / « Yes. In a 16:9 music video, pick how each vertical take shows: whole,
    over a blurred copy of itself, or filling the frame, centered on your face (Stalak Pro). Horizontal takes fill the whole
    frame. » (et la même idée dans « Conseils pour filmer ») ;
  - n° 6, question « Je peux aussi le poster sur TikTok ou Reels ? » : « Passe en « TikTok / Reels », à l'étape 1 ou directement au
    montage, pour une vidéo verticale 9:16… » / « Switch to “TikTok / Reels”, at step 1 or right in the edit step, for a vertical
    9:16 video… ».
- n° 1 (export d'un long morceau sur téléphone) : la page ne promet rien sur le téléphone. Quand vous aurez choisi comment
  « prévenir en attendant », Marketing peut ajouter une question (« Je peux exporter sur mon téléphone ? ») avec vos mots.

Fichiers :
- nouveaux : `site_src/music-video.html`, `site_src/fr/clip.html`, `site_src/demo/clip.mp4`, `site_src/demo/clip.jpg`,
  `site_src/og/music-video.jpg`, `site_src/og/clip.jpg`, ce compte rendu ;
- changés : `src/footer.py` (1 lien), `build_site.py` (plan du site, liens de « What is Stalak? »), `site_src/pricing.html` et
  `site_src/fr/tarifs.html` (1 lien), `site_src/llms.txt`, `site_drafts/make_og.py` (2 images, une ligne du bas au choix, choix des
  images à refaire), `tests/ui/pied_de_page_ui.py` (les 2 nouvelles pages et le nouveau lien), `docs/marketing/DEMO.md`,
  `docs/STATUS.md`, `public/` reconstruit ;
- `src/app.js` : rien. Migration SQL : aucune.

Tests : serveur `node tests/backend/run.mjs` 101/101 ; `tests/ui/pied_de_page_ui.py` 442/442 (avec les 2 nouvelles pages et la
version claude.ai) ; `audit611_ui.py` 91/91 ; `audit_ui.py` 158/158 ; `liens_cmp_ui.py` 58/58 ; `projet_local_ui.py` 48/48 ;
`node --check src/app.js` ; `python3 build.py` passe.

Vérifié à la main (390 px et 1280 px, FR et EN) : pas de défilement horizontal, aucune erreur JavaScript, la vidéo se charge
(1280 × 720), FR ↔ EN mène à la même page dans l'autre langue, pied de page présent. Données structurées lues sans erreur, page
dans le plan du site avec ses 2 langues, pas de `noindex`.

Planche contact (skill `planche-contact`) de `clip.mp4` : 52 images relues, 0 problème restant (détail dans `DEMO.md`).

Skills utilisés : `copywriting` (textes de la page, relecture finale), `planche-contact` (vidéo de la page), `seo-audit` (titre,
description, canonique, hreflang, plan du site, données structurées), `cro` (un seul bouton principal répété, objections dans la
FAQ, prix et remboursement près du bouton), `paywalls` (« essaie gratuitement dans l'aperçu, l'export est avec Pro » : montrer
avant de demander).

Si conflit à la fusion :
- `src/footer.py` : une entrée `clip` dans `TXT` (FR et EN), une paire dans `PAIRS`, un lien dans la colonne Produit ;
- `build_site.py` : une paire dans `SITEMAP_PAIRS`, 2 liens dans les puces de « What is Stalak? » ;
- `docs/STATUS.md` : mon entrée est juste sous celle de `marketing/clip-avant`.

Reste au propriétaire : regarder la maquette sur son téléphone et dire « ok » ; envoyer, s'il le peut, une prise horizontale
(passage de 25 s en entier, même version) et les paroles des 8 mesures de l'exemple ; dire s'il est d'accord pour un exemple Clip
de 25 s (environ 10 Mo de plus dans le dépôt).
