Statut : PRÊT
Branche : marketing/us-first

Résumé : décisions du propriétaire du 30/10 à 21 h (STALAK_CONTEXTE.md : États-Unis d'abord, aucun concurrent cité sur le site).

1. **Aucun concurrent sur le site.**
   - `site_src/alternative-triller.html` et `site_src/en/triller-alternative.html` sont supprimées.
   - Nouveau fichier `site_src/_redirects` (Cloudflare Pages) : `/alternative-triller` → `/` et `/en/triller-alternative` → `/en/`, en 301, avec ou sans `.html`.
   - `build_site.py` : pages retirées du plan du site (`SITEMAP_PAIRS`), du pied de page et des boucles de construction ; plus de « dans l'esprit de Triller » sur l'accueil.
   - `llms.txt` réécrit sans concurrent.
   - Glaçon d'aide : « façon Triller » / « Triller style » retiré du guide, côté serveur (`functions/_lib/help-guide.js`) et dans la version claude.ai (`HELP_GUIDE` dans `src/app.js`).
   - Vérifié : plus aucun « Triller », « CapCut » ni « camrip » dans `public/` (pages, plan du site, `llms.txt`, données structurées) ni dans `shuffle-lab.html`.
2. **Anglais américain.**
   - Textes anglais refaits : accueil (titre, description, « What is Stalak? »), page Pricing (cartes, tableau, FAQ, description), `llms.txt`.
   - Page Tarifs FR/EN à jour avec l'offre de 21 h : filigrane = petit logo qui change de place, packs dès 2 prises, sauvegarde en ligne automatique, taxes américaines.
   - `src/app.js` : 8 textes de l'app passent à l'orthographe américaine (« canceled », « analyzed ») ; seules les valeurs du dictionnaire anglais changent, aucune clé.
   - **Proposition, non appliquée** : l'anglais à la racine et le français dans `/fr/`, avec les adresses, les redirections, les risques et le travail de chaque conversation. Voir `docs/marketing/US_FIRST.md`, partie A. J'attends l'accord du propriétaire.
3. **Plan de croissance aux États-Unis, sans budget, au nom de 99Sayso** : `docs/marketing/US_FIRST.md`, partie B, et le document claude.ai « Stalak — États-Unis d'abord ». Il contient les réseaux, les communautés, les mots-clés (Google Trends US), un calendrier, les textes et les réponses types. `PLAN_TRILLER.md` est marqué comme remplacé.

Fichiers touchés :
- supprimés : `site_src/alternative-triller.html`, `site_src/en/triller-alternative.html` ;
- nouveau : `site_src/_redirects` ;
- modifiés :
  - `site_src/tarifs.html`, `site_src/en/pricing.html`, `site_src/llms.txt` ;
  - `build_site.py` ;
  - `functions/_lib/help-guide.js` (2 mots) ;
  - `src/app.js` (2 mots dans `HELP_GUIDE`, 8 textes anglais) ;
  - `public/` (reconstruit) ;
- docs : `docs/STATUS.md`, `docs/marketing/US_FIRST.md` (nouveau), `docs/marketing/PLAN_TRILLER.md`, `docs/marketing/SEO.md`.

Migration SQL : aucune.

Tests :
- `node tests/backend/run.mjs` : 67/67 ; `node --check src/app.js` passe ; `build.py` et `build_site.py` passent.
- Playwright à 390 px et 1280 px sur `/tarifs`, `/en/pricing`, `/` et `/en/` : pas de défilement horizontal, aucune erreur, le bouton Mensuel / Annuel marche.
- Les redirections de `_redirects` ne marchent qu'une fois en ligne : à vérifier après le déploiement (`curl -I https://stalak.app/alternative-triller` doit répondre 301 vers `/`).

Reste au propriétaire :
- Décider de passer l'anglais à la racine (partie A).
- Décider de citer ou non des concurrents dans ses propres posts.
- Donner les adresses des comptes TikTok, Instagram et YouTube.
