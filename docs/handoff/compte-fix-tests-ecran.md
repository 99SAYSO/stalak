# Compte rendu — compte/fix-tests-ecran
**Statut : PRÊT.** Aucune migration. Demande du Chef de projet (24/11, 15 h 37) : 2 séries d'écran cassées sur `main` depuis la fusion de l'offre à 1 €.

## 1. audit611_ui (89/93 → 93/93) : « scripts à part chargés après le premier affichage »
- Cause : `build_site.py` ajoutait `<script defer src="/assets/consent.….js">` dans le `<head>` de toutes les pages, y compris les 2 pages de l'appli (`/` et `/fr/`). Or la règle de l'audit du 13/11 (n° 1) veut **aucun script « defer » dans le HTML** de ces pages : tout est ajouté par la page juste après son premier affichage.
- Correction (`build_site.py`) : sur ces 2 pages, `consent.js` entre dans la liste du chargeur (`app_loader`), **en premier** (`async = false` garde l'ordre : le bandeau et `StalakConsent` sont là avant l'appli). Les autres pages (tarifs, aide, guides…) gardent le `defer`, qui ne pose aucun problème.
- Le comportement du bandeau ne change pas : rien de chargé avant le choix, Clarity et GA4 seulement après « Accepter ». Le bandeau arrive une fraction de seconde après le premier affichage, au lieu de juste après la lecture du HTML.
- Le « script en ligne de plus » de la liste : ce n'était pas une erreur. Le test vérifie seulement qu'aucun script en ligne ne dépasse 20 000 caractères, et c'est toujours le cas. L'échec venait du seul script `defer`.

## 2. partager_ui (88/92 → 92/92) : « l'explication et la légende à copier »
- Cause : le test vérifie ce qui précède l'encadré d'explication (`#shareBox`) : le bouton, ou les conditions du bouton payant (`dvCmpP`, `dvTrial`). Le texte de l'offre à 1 € (`#dvOffer1`, ses conditions « 1 € aujourd'hui, puis 7,99 €/mois… ») a été placé juste après eux, voulu ainsi (« juste dessous » le bouton, décision du 24/11).
- Correction (`tests/ui/partager_ui.py`) : `dvOffer1` est accepté avec les autres conditions du bouton payant. L'écran ne change pas (même ordre à l'affichage, `order:3` dans `theme.css`).

## Tests (sur `public/` reconstruit)
- `tests/ui/audit611_ui.py` : **93/93**
- `tests/ui/partager_ui.py` : **92/92**
- `tests/ui/mesure_ui.py` (bandeau cookies, offre à 1 €) : **114/114** (le bandeau marche toujours, chargé après le premier affichage)
- `node tests/backend/run.mjs` : **132/132**

## Fichiers
`build_site.py`, `public/index.html`, `public/fr/index.html` (reconstruits), `tests/ui/partager_ui.py`, `docs/STATUS.md`.
