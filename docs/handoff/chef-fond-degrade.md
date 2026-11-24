# Demande du Chef : nouveau fond de l'app, le dégradé « A » (24/11/2026)

Décision du propriétaire, 24/11 à 21 h 58 : parmi 6 maquettes, il choisit **A · Dégradé** (« je préfère le A »). Il trouvait le fond actuel (bleu glace clair + flocons bleus) trop fade, accueil compris.

Référence : `docs/audit/maquettes/fonds-2026-11-24/A-degrade-ciel.png` (sur la planche `planche-fonds.png`) ; le CSS de la maquette est dans `mk.js` du même dossier (variante `A-degrade-ciel`).

## Ce qui change (téléphone, stalak.app, branche `app/fond-degrade`)
- **Fond** de tous les écrans à barre du bas (Accueil, Montages, Stats, Compte) : dégradé vertical `#0b2f73` (haut) → `#1f6fd6` (≈ 48 %) → `#6fb6ff` (≈ 80 %) → `#cfe8ff` (bas), fixe pendant le défilement, plus un halo blanc doux (radial, ≈ 35 % d'opacité) derrière la mascotte de l'accueil.
- **Flocons** : blancs (le motif `--flakes` d'origine de `theme.css`), toujours les deux couches qui tombent, arrêtés avec « réduire les animations ».
- **Textes posés sur le fond** : titres en blanc avec un contour noir épais (même rendu que la maquette, mais propre : `-webkit-text-stroke` ou `paint-order`, pas un empilement d'ombres qui fait des créneaux) ; phrases en blanc à ~90 % ; liens (« Voir un exemple ») en blanc. Les cartes blanches, boutons et pastilles ne changent pas.
- Vérifier la lisibilité de **chaque** écran à barre du bas (Montages vide, Stats, Compte, tirer pour rafraîchir) : tout texte posé directement sur le fond doit passer au blanc.
- L'éditeur en 4 étapes, la caméra, le paywall « Salle », la connexion et l'ordinateur ne changent pas.

## Maquette
Comme d'habitude : maquette sur la branche, le propriétaire la valide sur son téléphone avant la fusion.
