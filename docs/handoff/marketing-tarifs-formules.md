Statut : PRÊT
Branche : marketing/tarifs-formules

**À publier en même temps que l'offre hybride côté Comptes et App** : gratuit sans compte, filigrane, pub récompensée, prix Paddle en dollars de Pro et Creator Plus. Sinon, la page annonce des choses qui ne marchent pas encore.

Résumé : l'offre du 30/10 au soir (STALAK_CONTEXTE.md, section 2), en dollars. Elle remplace la version Basic / Pro / Max de cette même branche.
- **Page Tarifs FR/EN et écran des formules de l'app** : 3 colonnes Gratuit / Stalak Pro / Creator Plus, générées d'une seule source.
  - Pro : 7,99 $/mois ou 49,99 $/an (4,17 $/mois, −47 %) ; Creator Plus : 14,99 $/mois ou 99,99 $/an (8,33 $/mois, −44 %).
  - Bouton Mensuel / Annuel, annuel coché par défaut, avec le badge « Meilleur prix ». Aucun « le plus populaire ».
  - Pro est mise en avant (ruban « Ni pub ni filigrane »). Sur téléphone, l'ordre est Pro, Creator Plus, Gratuit ; sur ordinateur, Gratuit, Pro, Creator Plus.
  - Tableau comparatif (15 lignes et les prix) et FAQ en 12 questions : gratuit, pub, quelle formule, mensuel ou annuel, dollars et taxes, compte, prix gardé, arrêt, humain, paiement, remboursement, vidéos.
  - Données structurées (JSON-LD) en USD, sans « TVA comprise », puisque Paddle ajoute les taxes.
- **« Alternative à Triller » FR/EN** et **`llms.txt`** : nouvelle offre, « sans téléchargement ni inscription », et le créateur (99Sayso) dans `llms.txt`.
- **Accueil** (`build_site.py`) :
  - le paragraphe « Aucun téléchargement, aucune inscription : 3 étapes et c'est posté » ;
  - les meta descriptions ;
  - les formules dans « Ce que tu peux faire ».
  - J'ai écrit « 3 étapes » et non « 3 clics » : en vrai, il faut aussi choisir les fichiers et appuyer sur « Suivant ».
- **Plan Triller au nom de 99Sayso** : `docs/marketing/PLAN_TRILLER.md`. Il contient les règles, où est le public, un calendrier de 4 semaines, des posts Reddit/X/TikTok/Instagram FR et EN, et des réponses types. Aucun faux compte ni faux avis.
- **`marketing/chat-pro` abandonnée**, avec un compte rendu « Statut : ABANDONNÉE » sur cette branche. Ne pas la fusionner.

Pour Comptes (détail dans `docs/STATUS.md`, section Marketing) :
- Creator Plus appelle `buy('creator_month')` / `buy('creator_year')`.
- Pro garde `#apMonth` / `#apYear` (`buy('month')` / `buy('year')`) : à relier aux prix en dollars.
- Les cartes s'appellent `.p4-free`, `.p4-pro` et `.p4-creator`.

Fichiers touchés :
- `site_src/tarifs.html`, `site_src/en/pricing.html` (refaits) ;
- `site_src/alternative-triller.html`, `site_src/en/triller-alternative.html`, `site_src/llms.txt` ;
- `src/markup.html` (section `#apPro`, entre le commentaire Marketing et `#apIsPro`) ;
- `src/app.js` :
  - bloc anglais `_bloc.marketing.formules` remplacé ;
  - `acct.month` et `acct.year` en dollars ;
  - commentaire du bouton Creator Plus ;
- `src/pricing.css` (section « les 3 formules ») ;
- `build_site.py` (textes de l'accueil) ;
- `public/` (reconstruit) ;
- `docs/STATUS.md`, `docs/marketing/PLAN_TRILLER.md`, ce compte rendu.

Migration SQL : aucune.

Tests :
- `node tests/backend/run.mjs` : 63/63 ; `node --check src/app.js` passe ; `build.py` et `build_site.py` passent.
- Playwright à 390 px et 1280 px :
  - pages vérifiées : `/tarifs`, `/en/pricing`, l'écran des formules sur `/` et `/en/`, `/alternative-triller` et `/en/triller-alternative` ;
  - aucun défilement horizontal, aucune erreur ;
  - le bouton Mensuel / Annuel change bien les prix (0 / 4,17 / 8,33 $, puis 0 / 7,99 / 14,99 $).
- Plus aucun « Basic », « Max », « 1 vidéo par jour » ni prix en euros dans les pages publiées, sauf `conditions.html` (Juridique).

Reste au propriétaire :
- Décider si la page doit afficher les limites des paroles auto et les 100 Go (encore des propositions).
- Publier les posts du plan Triller une fois l'offre en ligne, depuis ses propres comptes.
