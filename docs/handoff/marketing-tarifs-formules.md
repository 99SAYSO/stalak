Statut : PRÊT
Branche : marketing/tarifs-formules

**À publier en même temps que la nouvelle offre côté Comptes et App** : 1 vidéo gratuite par jour, filtres, formules Basic / Pro / Max dans Paddle, « Parler à un humain » réservé à Max. Avant ça, la page annoncerait des fonctions et des achats qui ne marchent pas encore.

Résumé : nouvelle offre (section 2 de STALAK_CONTEXTE.md) affichée sur la page Tarifs FR/EN et dans l'écran des formules de l'app.
- 4 colonnes : Gratuit, Basic, Pro, Max. Max est mise en avant avec le ruban « Seulement 3 € de plus que Pro » (en annuel : « Seulement 30 € de plus que Pro par an », pour rester vrai). Aucun « le plus populaire ».
- Bouton Mensuel / Annuel sans JavaScript (boutons radio et `:has()`), mensuel par défaut. Prix annuels ramenés au mois : 3,25 €, 9,08 €, 11,58 € ; économies de 35 % (Basic) et 17 % (Pro et Max).
- Tableau comparatif à 5 colonnes, qui défile sur téléphone.
- FAQ mise à jour. Elle contient notamment :
  - « Une vidéo gratuite par jour, comment ça marche ? » ;
  - « Quelle formule choisir ? » ;
  - « Mon prix peut-il augmenter ? » ;
  - « Comment je parle à l'équipe Stalak ? » (Max).
- Sur téléphone, les cartes s'affichent dans l'ordre Max, Pro, Basic, Gratuit. Sur ordinateur : Gratuit, Basic, Pro, Max.
- Anciens textes « Stalak Pro 9,99 € / 79 € » retirés : écran de l'app, 66 anciennes clés anglaises inutilisées de l'écran Pro, page Tarifs, textes de l'accueil, `llms.txt`.
- Intègre la dernière version de `marketing/seo` : la page « Alternative à Triller » est à jour avec la nouvelle offre.
- Remplace `marketing/chat-pro`, qui ne doit pas être fusionnée.

Pour Comptes (détail dans `docs/STATUS.md`, section Marketing) :
- Basic et Max appellent `buy('basic_month')`, `buy('max_year')`… ; `ACCT.checkout` doit accepter ces noms et les relier aux prix Paddle sandbox.
- Les boutons Pro gardent `#apMonth` / `#apYear`, qui appellent encore les anciens prix : à passer sur `pro_month` / `pro_year`.

Fichiers touchés :
- `site_src/tarifs.html`, `site_src/en/pricing.html` (refaits) ;
- `src/markup.html` (section `#apPro`, entre `#apPromo` et `#apIsPro`) ;
- `src/app.js` :
  - bloc de traductions `_bloc.marketing.formules` ;
  - anciennes clés `pr.*` inutilisées retirées ;
  - `acct.proT` devient « Pick your plan » ; `acct.month` et `acct.year` passent aux nouveaux prix ;
  - 2 lignes pour les boutons Basic et Max, avec un commentaire ;
- `src/pricing.css` (section « les 4 formules » ajoutée à la fin) ;
- `build_site.py` (textes de l'accueil) ;
- `public/` (reconstruit) ;
- `docs/STATUS.md`, `docs/handoff/marketing-tarifs-formules.md`.

Migration SQL : aucune.

Tests :
- `node tests/backend/run.mjs` : 63/63 ; `node --check src/app.js` passe ; `build.py` et `build_site.py` passent.
- Playwright à 390 px et 1280 px, en FR et EN, sur `/tarifs`, `/en/pricing`, l'écran des formules de `/` et `/en/`, et `/alternative-triller` : pas de défilement horizontal, aucune erreur.
- Le bouton Mensuel / Annuel change bien les prix, les montants facturés, les économies, les boutons et le ruban de Max.
- Aucun « 9,99 € » ni « Stalak Pro » dans les pages publiées, sauf le prix de CapCut cité sur la page de comparaison.

Reste au propriétaire : rien pour ces textes. La relecture des conditions de vente revient à Juridique.
