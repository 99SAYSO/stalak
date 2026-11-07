Statut : PRÊT
Branche : marketing/clip-avant
Conversation : 5. Marketing & croissance
Partie de : `main` 4e15291 (rapport chiffres du 7/11, Chef de projet)
Maquette : https://marketing-clip-avant.stalak-site.pages.dev (accueil `/` et `/fr/` ; `/pricing` et `/fr/tarifs`)

Demande du propriétaire (7/11, 15 h 19), d'après `docs/stats/2026-11-07-rapport.md` (piste 3 : le mode Clip est la 1ʳᵉ raison
d'ouvrir la page des formules, 51 fois sur 116, 44 %) : mettre le mode Clip en avant dans les vidéos promo du dimanche (au moins 2
sur 7), sur l'accueil et sur la page Tarifs ; préparer les textes de la proposition « Reçois ta vidéo par e-mail » (avec Comptes et
Juridique). **L'étude complète du mode Clip arrive du Chef de projet : aucune nouvelle fonction**, seulement ce que l'app fait déjà,
vérifié dans `src/app.js` (liste et sources : `docs/marketing/CLIP_AVANT.md`, partie 1).

Résumé :
- **Page Tarifs** (`site_src/pricing.html`, `site_src/fr/tarifs.html`, styles à la fin de `src/pricing.css`) :
  - 1ʳᵉ ligne de la carte Pro, sur fond givré : « **Music video mode**: your whole song as a 16:9 YouTube video, with effects on
    the drops » / « **Le mode Clip** : tout ton morceau en clip YouTube 16:9, avec des effets sur les drops » (avant : 2ᵉ ligne,
    « Your full music video, edited for you ») ;
  - une section à elle sous les cartes (`#music-video` / `#mode-clip`) : la mascotte à lunettes (`/emoji/cool.webp`), 3 points
    (effets aux moments forts, Sobre ou Intense, le morceau entier), bouton « Try it free » / « Essaie-le gratuitement » vers l'app,
    et « Pick “Music video” at step 1. Exporting the video takes Stalak Pro. » ;
  - tableau : la ligne remontée juste sous « Vidéos 9:16 », renommée « Music video mode: the whole song in 16:9 for YouTube » /
    « Mode Clip : le morceau entier en 16:9 pour YouTube » (mêmes cases) ;
  - FAQ : « What is Music video mode? » / « C’est quoi, le mode Clip ? » (3ᵉ question) ; « Which plan should I pick? » commence par
    le clip ;
  - phrase du haut, description Google (156 et 160 caractères) et description des réseaux.
- **Accueil** (« version compacte » du 6/11 gardée) :
  - sous la phrase d'accueil, un bouton « Try **Music video mode**: your whole song in 16:9 » / « Essaie le **mode Clip** : tout
    ton morceau en 16:9 » (bloc Marketing de `#p1` dans `src/markup.html`, clé `hero.clip` dans `_bloc.marketing.accueil` de
    `src/app.js`, styles à la fin de `src/theme.css`). Il appuie sur le bouton « Clip » qui existe déjà à l'étape 1 (`#kindSeg`)
    et l'amène sous les yeux, clavier dessus ; l'app affiche alors son propre message (`ca.try` : essai dans l'aperçu, export avec
    Pro). Rien d'autre ne change dans l'app ;
  - « What is Stalak? » / « Stalak, c’est quoi ? » (`build_site.py`) : la ligne du mode Clip passe en 2ᵉ position, avec les mots
    de l'app (drops, refrains, breaks ; essai gratuit, export avec Pro) ;
  - français : espace insécable avant « : » dans la phrase d'accueil (« … sur ton son : Stalak … » commençait une ligne sur
    téléphone) et dans les nouvelles lignes.
- **Vidéos du dimanche** : `docs/marketing/CLIP_AVANT.md`, partie 3 : 2 vidéos sur 7 pour la séance du 8/11 (modèle D « Accroche
  + démo » et modèle C « Tuto express », le modèle E en réserve), avec accroche, déroulé, voix (Flora, Achird), légende et ce qu'il
  faut montrer (un vrai export 16:9 de l'app, effets Intense). La séance suit toujours `docs/social/TACHE_DIMANCHE.md`.
- **« Reçois ta vidéo par e-mail »** : `docs/marketing/RECOIS_TA_VIDEO.md`. C'est la **piste 5** du rapport (le propriétaire l'a
  appelée « 8 » ; la 8 est l'abandon au paiement). Textes FR/EN de la carte de l'écran de fin (clés `vbm.*` proposées), de
  l'e-mail de la vidéo, de la confirmation et de la désinscription des nouvelles, des pages du site à changer, et un brouillon pour
  la confidentialité. Questions ouvertes pour Comptes (lien ou pièce jointe, durée, taille, limite d'envois, abus, compteurs),
  Juridique (accord séparé et preuve, moins de 15 ans, adresse postale des e-mails commerciaux aux États-Unis, hébergement d'un
  fichier) et le propriétaire (fréquence des nouvelles, signature, ligne Pro). **Rien de construit.**

Pour App :
- le bouton de l'accueil clique `#kindSeg button[data-v="clip"]` (si ce sélecteur change, le bouton ne fait plus rien, sans
  erreur) ;
- en anglais, `ca.t` et `ca.try` disent « Clip mode » alors que le bouton de l'étape 1 et la page Tarifs disent « Music video » :
  à harmoniser si vous êtes d'accord (« Music video mode is a Pro feature », « Music video mode: try it in the preview. Exporting
  a 16:9 video is for Pro. »).

Fichiers : `site_src/pricing.html`, `site_src/fr/tarifs.html`, `src/pricing.css` (bloc Marketing à la fin), `src/markup.html`
(bloc Marketing de `#p1`), `src/theme.css` (fin), `src/app.js` (1 clé, `hero.clip`), `build_site.py` (texte « What is Stalak? »),
`public/` reconstruit, `docs/marketing/CLIP_AVANT.md` et `docs/marketing/RECOIS_TA_VIDEO.md` (nouveaux), `docs/STATUS.md`, ce
compte rendu. Migration SQL : aucune.

Tests : serveur `node tests/backend/run.mjs` 101/101 ; `tests/ui/audit611_ui.py` 91/91 (vrai titre, ligne d'accueil, pas sous la mascotte) ; `audit_ui.py` 158/158 ; `liens_cmp_ui.py` 58/58 ; `projet_local_ui.py` 48/48 ; `pied_de_page_ui.py` 402/402 (avec la version claude.ai) ; `node --check src/app.js` ; `python3 build.py` passe.

Vérifié à la main (390 px et 1280 px, FR et EN) : bouton de l'accueil au-dessus de la mascotte, il choisit bien « Clip », l'amène à
l'écran et met le clavier dessus ; pages Tarifs sans défilement horizontal, aucune erreur JavaScript.

Skills utilisés : `copywriting` (lignes, section et FAQ du mode Clip, bouton de l'accueil), `emails` (e-mails de la proposition).

Si conflit à la fusion :
- `src/pricing.css`, `src/theme.css` : mes blocs sont ajoutés tout à la fin, garder les deux côtés ;
- `src/markup.html` : le bouton et son petit script juste sous `.hero-s` ; `src/app.js` : une ligne dans `_bloc.marketing.accueil`.

Reste au propriétaire : regarder la maquette (accueil et Tarifs, sur téléphone) et dire « ok » ; pour la proposition par e-mail,
attendre les réponses de Comptes et de Juridique.
