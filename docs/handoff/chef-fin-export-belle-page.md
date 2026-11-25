# Demande du Chef : l'écran de fin d'export (25/11/2026, 8 h 03)

Retour du propriétaire sur https://app-retours-25-11.stalak-site.pages.dev (captures `docs/audit/retours-2026-11-25c/`) : **« encore une fois l'écran pour enregistrer la vidéo est tout noir et moche. Je veux une belle page comme les autres. Sinon tout est nickel. »** C'est la 2e fois (règle `app-fin-export-belle-page` dans Mes goûts).

## Ce qui ne va pas
Le fond de « Ta vidéo est prête » est un noir presque uni (#0a0d14) avec des points blancs : sous les cartes, de grands vides noirs. Les autres écrans ont un vrai fond (dégradé A, ciel par étape) ; celui-ci a l'air d'une page cassée.

## Ce qu'il faut
- **Fond** : dans la famille du dégradé A, comme une fin de fête : bleu nuit en haut → bleu roi → bleu clair en bas, avec un **halo doré** derrière la vidéo et des flocons blancs qui tombent. Aucune zone noire, nulle part, même en faisant défiler jusqu'en bas (le fond couvre toute la hauteur du contenu).
- **La mascotte qui fête** (sticker `docs/marque/mascotte/sticker-star.png` ou un sticker ChatGPT « hype » fidèle au chara design) à côté de « Ta vidéo est prête », et quelques confettis à l'arrivée sur l'écran (HyperFrames pour l'animation, une seule fois, respect de « réduire les animations »).
- Les cartes blanches restent (offre à 1 €, bouton gratuit, aide, légende, conseils par e-mail), espacées régulièrement, rien qui flotte.
- La fin de la page s'arrête à la dernière carte (+ une petite marge), pas de grand vide en dessous.
- Même rendu quand l'offre à 1 € n'est pas affichée (exports 2 à 9).

## Avant de dire PRÊT
Envoyer au Chef 3 captures iPhone 13 (haut, milieu, bas de la page) **avec** et **sans** l'offre à 1 €, et un test qui vérifie qu'aucune bande de plus de 40 px de haut n'a un fond plus sombre que #0e3f8f.
