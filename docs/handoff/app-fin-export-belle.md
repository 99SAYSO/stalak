Statut : PRÊT

# Branche `app/fin-export-belle` — une vraie belle page de fin d'export, et l'igloo pendant l'export

Demandes :
- Chef, `docs/handoff/chef-fin-export-belle-page.md` (main `b20bd6a`). Retour du propriétaire, 2e fois : « l'écran pour enregistrer la vidéo est tout noir et moche ».
- Propriétaire, 25/11, 8 h 10, sur la maquette `docs/audit/maquettes/export-igloo-2026-11-25` : « Oui mais enlève l'ours ».

**Point de départ** : `app/retours-25-11` + `main`. L'intégrer après `app/retours-25-11` ; si `app/retours-25-11` est déjà fusionnée, la branche ne contient en plus que ce qui est décrit ici.

## 1. La fin d'export (téléphone, `src/mobile4.js`)
Le même écran pour tous les cas : avec l'offre à 1 €, sans l'offre (exports 2 à 9) et pour un abonné.
- **Fond**
  - Un calque fixe dans la famille du dégradé A : bleu nuit `#0e3f8f` en haut, puis bleu roi, puis bleu clair `#d6ecff` en bas. Il couvre toute la hauteur, même en faisant défiler, et n'est jamais plus sombre que `#0e3f8f`.
  - Des flocons blancs tombent doucement (ils restent immobiles avec « réduire les animations »).
  - Le noir `#0a0d14` de l'ancien écran est supprimé.
- **Halo doré** derrière la vidéo, avec une lueur dorée autour.
- **La mascotte qui fête** (le sticker étoile, `/emoji/star.webp`) à côté de « ✓ Ta vidéo est prête », titre blanc au contour noir.
- **Animation d'arrivée** (GSAP, comme les démos HyperFrames) : la mascotte saute et 46 confettis tombent une seule fois, puis disparaissent. Rien de tout ça avec « réduire les animations ».
- **Les cartes blanches**, toutes identiques (contour noir, ombre dure) et espacées de 14 px :
  - **avec l'offre** :
    - la carte de l'offre : « Retire le filigrane pour 1 € » ;
    - le bouton bleu « Retirer pour 1 € » ;
    - les conditions ;
    - le bouton blanc « Enregistrer gratuitement (avec filigrane) ».
  - **sans l'offre** :
    - la carte avec le gros bouton bleu « Enregistrer la vidéo » ;
    - le petit lien « Retirer le filigrane » ;
    - la vidéo reste affichée (avant, elle disparaissait dans ce cas).
  - **ensuite** : la légende, les conseils par e-mail, puis « Modifier la vidéo » dans une petite carte.
- **Fin de la page** : elle s'arrête à la dernière carte, 18 px plus bas. Plus de grand vide.
- Le texte « Enregistrer gratuitement (avec filigrane) » ne déborde plus du bouton. La légende se lit en entier.

## 1 bis. Retours du propriétaire sur l'aperçu (25/11, 9 h 13)
- **« Quand on remonte on voit le fond bleu en bas »** : sur iPhone, quand la barre de Safari change de taille, une bande bleu uni apparaissait en bas. Corrigé :
  - le ciel a maintenant la hauteur du plus grand écran possible (`100lvh`) ;
  - derrière, la couleur de la page est le bleu clair du bas du ciel (`#d6ecff`) : plus aucune bande d'une autre couleur.
- **« Y'a pas le bouton pour upload sur TikTok direct ? »** : le bouton « Publier sur TikTok » existe déjà (Pro, `src/tiktok.js`). Il n'apparaît que là où TikTok est activé : sur stalak.app oui, mais pas sur les aperçus `pages.dev`, qui n'ont pas les clés TikTok.
  - Il est maintenant dans la carte blanche, juste sous « Enregistrer », à la même largeur, avec et sans l'offre.
  - Pour le voir sur l'aperçu : ouvrir le lien avec `?ttkdemo` à la fin.
- En passant, un bug d'avant corrigé dans `src/app.js` : à la fin de l'export, la dernière étape se décochait parfois une fraction de seconde (« ddnt » après « dddd »). Une fois l'export fini, les 4 étapes restent cochées. Le test `vente_ui` échouait pour ça sur ordinateur ; il est maintenant à 63/63.

## 2. L'igloo pendant l'export (téléphone, `src/mobile3.js`)
La maquette validée, sans l'ours.
- Ciel de nuit avec une aurore douce et de la neige qui tombe.
- **Titre** :
  - pendant l'export : « Stalak construit ton igloo » ;
  - à la fin : « Igloo terminé ! Ta vidéo est prête ».
  - Pour un pack de plusieurs vidéos, le titre de l'app est gardé.
- La mascotte porte les blocs en se balançant.
- L'igloo se construit bloc par bloc avec le vrai avancement, et chaque bloc arrive avec un petit rebond.
- Grand pourcentage au contour noir, barre de progression givrée, étapes dans la carte blanche.
- **À la fin** : la porte devient dorée et brille, la mascotte fête en sautant et des confettis jaillissent de l'igloo. Pas de confettis avec « réduire les animations ».
- Sur les petits écrans (iPhone SE), tout est un peu plus serré.

## Tests
- Nouveau test `tests/ui/fin_export_belle_ui.py` : 49/49 (avec le bouton TikTok dans la carte et le ciel qui couvre tout l'écran).
  - Cas testés : iPhone 13 en français et iPhone SE en anglais, avec et sans l'offre, plus « réduire les animations ».
  - Il vérifie qu'aucune bande de plus de 40 px de haut n'a un fond plus sombre que `#0e3f8f`, du haut jusqu'en bas de la page.
  - Il vérifie aussi :
    - la mascotte, le halo et les flocons ;
    - les confettis une seule fois ;
    - les cartes espacées pareil ;
    - la page qui s'arrête à la dernière carte ;
    - le même rendu avec et sans l'offre.
- Nouveau test `tests/ui/export_igloo_ui.py` : 21/21.
- `refonte_mobile4_ui` : la vérification « sans l'offre » attend maintenant la vidéo affichée, et toujours pas la comparaison Pro.
- `refonte_mobile4_ui` : la vérification « sans le droit à l'offre » accepte maintenant la carte blanche sans titre d'offre : 81/81.
- **Série complète**, tout réussi sauf deux échecs déjà présents sur main :
  - `refonte_mobile3_ui` 93/93, `refonte_mobile_ui` 102/102, `refonte_mobile2_ui` 65/65 ;
  - `refonte_stats_ui` 72/72, `fin_export_ui` 98/98, `prises_ui` 24/24 ;
  - `tiktok_ui` 224/224, `vente_ui` 63/63 ;
  - `essai_pro_ui` 205/205, `suite_clarity_ui` 24/24, `projet_local_ui` 76/76, `ou_est_ton_son_ui` 23/23 ;
  - déjà présents sur main : `formules_ui` 136/137 (le compte du filigrane) et `clip1_ui` (`.band-frost a:hover`, côté Marketing).

## Captures (avant PRÊT, demandées par le Chef)
Dans `docs/audit/maquettes/fin-export-belle-2026-11-25/` :
- 3 captures iPhone 13 (haut, milieu, bas) avec l'offre et sans l'offre : `fin-offre-…` et `fin-sans-offre-…` ;
- les planches assemblées ;
- l'igloo pendant l'export.

## À prévenir
- **Marketing** : rien (`build_site.py` et `site_src` ne changent pas).
- **Comptes** : rien côté serveur.
- **Juridique** : rien. Les textes de l'offre ne changent pas.
