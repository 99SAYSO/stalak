# SEO — nom « Stalak » et recherches de la niche (30/10/2026)

Plan complet, avec le classement des recherches, le tableau des annuaires et les textes prêts à copier : document « Stalak — passer premier sur Google » dans claude.ai (https://claude.ai/artifact/YbAGap5KoT5siSTbWVfP7W).

Skills utilisés : `seo-audit`, `ai-seo`, `directory-submissions`, `competitors`, `programmatic-seo`, `content-strategy`, `webapp-testing`.

## Constat (30/10/2026)
- Sur la recherche « stalak » en France, stalak.app sort 5e, derrière 4 pages sur le monstre de Dofus. Son titre s'affiche en anglais.
- La cause du titre anglais : la page française passait en anglais selon la langue du navigateur, et le robot de Google lit en anglais. C'est corrigé dans `src/app.js`.
- `sitemap.xml` est en ligne et valide. Son envoi dans Search Console n'a pas pu être vérifié : le navigateur était connecté à un autre compte Google que celui du propriétaire.

## Changements
- `build_site.py` :
  - fiche Organization (logo, e-mail, noms) ;
  - liste `SOCIAL` pour les comptes officiels, déclarés en `sameAs` et en liens `rel="me"`. Elle est vide tant que le propriétaire n'a pas donné les adresses ;
  - `SITEMAP_PAIRS` : le plan du site passe de 4 à 14 pages ;
  - lien « Alternative à Triller » dans le pied de page de l'accueil ;
  - bloc vidéo affiché seulement si `site_src/demo/exemple.mp4` existe.
- `site_src/llms.txt` : présentation de Stalak pour les IA de recherche.
- ~~`site_src/alternative-triller.html` et `site_src/en/triller-alternative.html`~~ : **retirées le 30/10 à 21 h** (aucun concurrent cité sur le site), redirigées vers l'accueil par `site_src/_redirects`.
- `src/app.js` : sur stalak.app (balise canonical présente et `lang="fr"`), la page française reste en français.

## Recherches de la niche
Indice Google Trends relatif sur 12 mois. Ce ne sont pas des volumes : aucun outil de volumes n'était disponible.
- Faible concurrence et très pertinentes : « alternative à Triller », « triller alternative », « montage playback », « application playback », « beat sync video multiple takes ». Elles sont trop rares pour que Trends les mesure.
- Très cherchées mais difficiles :
  - « lip sync app » (indice 55) : les résultats sont surtout des outils d'IA qui fabriquent une fausse bouche, pas des outils de montage comme Stalak ;
  - « beat sync video » (21).
- À éviter : « camrip » est aussi un terme de piratage, donc son indice Trends ne mesure pas le concurrent.
