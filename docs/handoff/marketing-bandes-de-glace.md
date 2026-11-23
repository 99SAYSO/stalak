# Marketing & croissance — « Bandes de glace » (23/11/2026)

Branche : `marketing/bandes-de-glace` (partie de `main` du 23/11, 4 h 15). Demande du Chef de projet du 23/11 (4 h 15), maquette choisie par le
propriétaire : `docs/audit/maquettes/2026-11-23-separations-1-bandes-de-glace.png`. Goût noté : stalak-da « site-bandes-de-glace ».

## Ce qui change
- **`src/bands.css`** (nouveau, ajouté au style de l'app et à `/site.css`) : `.bands` (enfant de `<body>`, mêmes marges négatives que le pied de page,
  donc pleine largeur sans `100vw`), `.band` + `.band-night` (#0e3f8f, texte blanc), `.band-frost` (#d6ecff, texte noir encre, liens bleu nuit),
  `.band-blue`. Chaque bande a en `::before` un rebord de la couleur de la partie du dessus, son bord noir, et une rangée de stalactites de cette
  couleur au contour noir (même dessin que le pied de page). Le pied de page qui suit des bandes prend la même rangée, couleur de la dernière bande.
- **Accueil** (`build_site.py`) : `PROOF` (compteur + avant / après) reste dans la colonne, sur le bleu. `RV_BAND` (avis) et la bande glace
  (« Stalak, c'est quoi ? » + `#byAlaska`, que `app.js` trouve toujours par son id) sont dans `BANDS`, posé juste avant le pied de page.
  Le fondu des bords des avis : deux voiles bleu nuit (`.rv-edge::before/::after`) au lieu du masque qui rendait les cartes transparentes.
  Les règles de largeur de la bande d'avis liées à la colonne (≤ 1100 px, `.wrap:has(.rv-view)`) sont retirées : plus utiles hors de la colonne.
  `body.isdone > .bands{display:none}` (comme le reste sous l'éditeur avant).
- **Tarifs** (`site_src/fr/tarifs.html`, `site_src/pricing.html`, `src/pricing.css`) : comparaison sur bande bleu nuit, questions sur bande glace.
- **Pages d'aide** : non (un seul article dans une carte blanche).

## Vérifié
Pleine largeur et bandes collées (bord bas d'une bande = bord haut de la suivante = haut du pied de page) à 320, 390, 1280 et 1440 px, accueil FR/EN
et Tarifs FR/EN, aucun défilement horizontal, aucune erreur dans la page. Tests : serveur 115/115 ; tests d'écran : voir le compte rendu.
