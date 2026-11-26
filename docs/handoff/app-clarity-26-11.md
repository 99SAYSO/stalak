Statut : EN COURS

# Branche `app/clarity-26-11` — deux points vus dans Clarity le 26/11

Demande : fin de `docs/handoff/chef-aide-glacon-26-11.md` (ajout du Chef de projet, `docs/audit/clarity-2026-11-26.md`, points 1 et 4).

Partie de main `e03c8f5`.

## 1. Tap sur « Stats » qui ne fait rien (iPhone, visiteur pas connecté)
**Reproduit** : quand la page est prête, le tap sur « Stats » ouvre bien la connexion. En revanche, sur un réseau lent, la barre du bas s'affiche avant que l'app (`app.js`) soit arrivée. Un tap à ce moment-là était perdu : rien ne se passait, même après le chargement. C'est le clic mort de Clarity, à 9 s de l'arrivée.

**Corrigé** :
- `src/markup.html` : un tout petit script juste après la barre garde le dernier tap fait pendant le chargement. Le bouton touché devient pâle pour montrer qu'il attend (`aria-busy`, `src/mobile.css`).
- `src/app.js` (`mobInit`) : dès que l'app est prête, ce tap est fait. Pour « Stats » ou « Compte », la connexion s'ouvre.

## 2. Projet perdu après un retour en arrière
**Reproduit** : le montage en cours est gardé dans le téléphone toutes les 3 s et quand on quitte la page. Mais quand on revenait sur l'app avec « retour » et que le navigateur devait recharger la page, on retombait sur l'accueil, avec seulement la carte « Reprendre ton dernier montage ? ». C'est le cas dans l'app Google et dans beaucoup de navigateurs intégrés. Le visiteur Américain de Clarity ne l'a pas vue, ou pas comprise, et a tout recommencé.

**Corrigé** (`src/app.js`, partie « projet gardé dans le téléphone ») :
- Quand on quitte la page avec un montage à l'écran, l'onglet le note (`sessionStorage`).
- Si on revient par « retour » (navigation `back_forward`) dans les 6 h, **le montage revient tout seul**, sans question : prises, son, passage, coupes, étape 4.
- Un rechargement pose toujours la question « Reprendre ton dernier montage ? ». C'est la décision du 30/10, et je n'y touche pas.
- Si on part exprès à l'accueil (« Retour au menu principal », `homeGo`), rien ne revient tout seul.

## Tests
- Nouveau `tests/ui/stats_tap_ui.py` : 15/15.
  - Cas testés : iPhone 13 sur un réseau lent, « Stats » en anglais et en français, « Compte », puis une fois l'app prête.
  - Il vérifie que la connexion s'ouvre et que le bouton montre qu'il attend.
- Nouveau `tests/ui/retour_arriere_ui.py` : 10/10.
  - Cas testés : iPhone et ordinateur, avec une page rechargée au retour ou une page gardée par le navigateur.
  - Il vérifie que le montage revient tout seul, que le rechargement demande toujours, et que rien ne revient si on est parti exprès à l'accueil.
- Les autres tests : voir STATUS.

## À prévenir
- **Marketing** : `src/markup.html` (le petit script après la barre, environ 330 octets ; `index.html` est à 399 662 octets, sous la limite de 400 000).
- **Marketing** : les transitions de page du site lèvent une erreur « Transition was aborted because of invalid state. ViewTransition opt-in disabled » quand on revient vite en arrière. Ce n'est pas bloquant, mais c'est à regarder de leur côté.
