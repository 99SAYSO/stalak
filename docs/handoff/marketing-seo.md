Statut : PRÊT
Branche : marketing/seo

Résumé : référencement du nom « Stalak » (pour passer devant le monstre de Dofus) et premières pages de la niche. Détail dans `docs/marketing/SEO.md`.
- Fiche de la marque pour Google (Organization) et liste `SOCIAL` pour les comptes officiels (`sameAs` + liens `rel="me"`). Elle est vide pour l'instant : il ne s'affiche rien tant que les adresses ne sont pas remplies.
- `llms.txt`.
- Plan du site complet : 14 pages au lieu de 4.
- Pages `/alternative-triller` et `/en/triller-alternative` : comparatif sourcé et daté, FAQ, données structurées, liens depuis le pied de page de l'accueil.
- Correction dans `src/app.js`, à relire par App : sur stalak.app, la page française reste en français au lieu de passer en anglais selon la langue du navigateur. Google lisait la page française en anglais.

Fichiers touchés : `build_site.py`, `site_src/llms.txt`, `site_src/alternative-triller.html`, `site_src/en/triller-alternative.html`, `src/app.js` (3 lignes dans la détection de la langue, avec un commentaire), `public/` (reconstruit), `docs/STATUS.md`, `docs/marketing/SEO.md`, `docs/handoff/marketing-seo.md`.

Migration SQL : aucune.

Tests :
- `node tests/backend/run.mjs` : 63/63 ; `node --check src/app.js` passe ; `build.py` passe, et la version claude.ai n'est pas concernée par la correction de langue (pas de balise canonical).
- Construction d'essai avec un compte rempli dans `SOCIAL` : `sameAs` et le lien du pied de page apparaissent.
- Playwright, langue de la page d'accueil : navigateur en-US et fr-FR → `/` en français, `/en/` en anglais.
- Playwright, nouvelles pages à 390 px et 1280 px en FR et EN : une seule balise H1, pas de défilement horizontal, aucune erreur.
- Données structurées : JSON valide.

Reste au propriétaire :
- Donner les adresses Instagram, TikTok et YouTube de Stalak.
- Envoyer une vraie vidéo montée avec Stalak (`site_src/demo/exemple.mp4`).
- Search Console, avec le compte propriétaire : vérifier l'envoi de `sitemap.xml`, puis demander l'indexation de `/`, `/en/` et des deux nouvelles pages.
- Bing Webmaster Tools.
- Annuaires : liste et textes dans le document claude.ai « Stalak — passer premier sur Google ».
