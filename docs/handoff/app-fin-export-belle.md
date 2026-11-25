Statut : EN COURS

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
- Nouveau test `tests/ui/fin_export_belle_ui.py` : 39/39.
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
- Série complète : voir le résultat dans STATUS.

## Captures (avant PRÊT, demandées par le Chef)
Dans `docs/audit/maquettes/fin-export-belle-2026-11-25/` :
- 3 captures iPhone 13 (haut, milieu, bas) avec l'offre et sans l'offre : `fin-offre-…` et `fin-sans-offre-…` ;
- les planches assemblées ;
- l'igloo pendant l'export.

## À prévenir
- **Marketing** : rien (`build_site.py` et `site_src` ne changent pas).
- **Comptes** : rien côté serveur.
- **Juridique** : rien. Les textes de l'offre ne changent pas.
