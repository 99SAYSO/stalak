Statut : EN COURS (étape 2 faite : maquette d'une page, à valider par le propriétaire)
Branche : marketing/pages-aide
Conversation : 5. Marketing & croissance
Partie de : `main` 2e84cb8
Maquette : https://marketing-pages-aide.stalak-site.pages.dev/how-to-make-a-music-video-on-your-phone
(et en français : https://marketing-pages-aide.stalak-site.pages.dev/fr/faire-un-clip-avec-son-telephone)

Demande du Chef de projet (9/11, décision du propriétaire du 9/11) : lancer A7, des pages d'aide pour Google, en anglais d'abord
puis en français dans `/fr/`. D'abord la liste des 10 sujets, appuyée sur de vraies données ; puis une maquette d'une seule page ;
puis les 10 pages.

Étape 1, faite et validée (« oui » du propriétaire, 9/11, 13 h 20) : la liste des 10 sujets, avec ses preuves (suggestions
Google, « Autres questions posées », Google Trends du 9/11, sans volume inventé) dans `docs/marketing/PAGES_AIDE.md`. Maquette
sur le n° 1, comme proposé.

Étape 2, la maquette (n° 1, en anglais et en français) :
- `/how-to-make-a-music-video-on-your-phone` « How to Make a Music Video on Your Phone by Yourself » et
  `/fr/faire-un-clip-avec-son-telephone` « Comment faire un clip avec son téléphone, tout seul » (titres de 60 caractères,
  descriptions de 155).
- Le vrai mode d'emploi, en questions réelles (chaque titre est une question, avec une réponse directe juste dessous) : ce qu'il
  faut, préparer seul, filmer, monter les prises ensemble, vertical ou horizontal. Puis « Stalak in one minute » / « Stalak en
  une minute » : les 4 étapes avec **4 vraies captures de l'app** en taille téléphone (gratuit, l'exemple « neva die » et ses
  3 prises, les 2 lignes de paroles connues), et le bouton « Try it free » / « Essaie gratuitement » (`/?ref=seo`,
  `/fr/?ref=seo`). Puis ce qui est gratuit et Pro (mots exacts de `/pricing` et `/fr/tarifs`), la FAQ, le mot de 99Sayso, les
  liens vers les guides.
- Même modèle que les 6 guides (mêmes styles, avant / après de la démo, mot du fondateur) ; pied de page commun.
- **Pied de page : nouvelle colonne « Tutorials » / « Tutos »** (liste `AIDE` de `src/footer.py`), entre Produit et Légal, dans
  la langue de la page ; FR / EN mène à la même page dans l'autre langue. `src/footer.css` : 5 colonnes sur ordinateur (avant 4).
- Plan du site : les 2 adresses avec leurs liens FR / EN (`build_site.py` ajoute la liste `AIDE` à `SITEMAP_PAIRS`). Balises
  `hreflang` en / fr / x-default sur les 2 pages, canonique, données structurées WebPage + BreadcrumbList + HowTo + FAQPage.
  `llms.txt` : une partie « Tutorials ». Images de partage `og/<adresse>.jpg` (même style que les guides, ligne du bas dans la
  langue de la page).
- Tout ce qui est écrit, l'app le fait déjà : formats acceptés, tempo trouvé, « Film now » / « Filmer maintenant », « Synced to
  the song » / « Calée sur le son », coupes et rythme, export sur l'appareil en pleine qualité, 9:16 en 1080 × 1920 (vrai export
  vérifié), mode Clip 16:9 en 1920 × 1080 (`FORMATS` de `src/app.js`), prises verticales entières sur leur copie floutée (vérifié
  le 7/11). Aucun concurrent cité, aucun chiffre inventé.

Fichiers :
- nouveaux : `site_drafts/make_aide.py` (écrit les pages d'aide EN + FR et leurs images de partage), `site_drafts/aide_shots.py`
  (les captures de l'app, à refaire si l'app change), `site_src/how-to-make-a-music-video-on-your-phone.html`,
  `site_src/fr/faire-un-clip-avec-son-telephone.html`, `site_src/aide/` (8 captures, ~0,5 Mo), `site_src/og/` (2 images) ;
- changés : `src/footer.py` (liste `AIDE`, colonne, paires FR / EN), `src/footer.css` (5 colonnes), `build_site.py` (plan du
  site), `site_src/llms.txt`, `tests/ui/pied_de_page_ui.py` (5 colonnes, la colonne Tutos, les nouvelles pages, lus dans
  `src/footer.py`), `docs/marketing/PAGES_AIDE.md`, `docs/STATUS.md`, `public/` reconstruit ;
- `src/app.js` : rien. Le paquet de l'app change de nom (`app.374d5e2cb7.js` → nouveau) parce que le pied de page est dedans :
  c'est normal.

Tests : serveur `node tests/backend/run.mjs` 103/103 ; `tests/ui/pied_de_page_ui.py` 442/442 (avec les 2 nouvelles pages, la colonne
Tutos, les 5 colonnes, et la version claude.ai) ; `tests/ui/liens_cmp_ui.py` 58/58 ; `python3 build_site.py` et `python3 build.py` passent.
Vérifié à la main (iPhone 15 Pro émulé et ordinateur 1366 px, FR et EN) : pas de défilement horizontal, aucune erreur JavaScript, aucune
adresse en erreur, toutes les images chargées, une seule h1 ; titre 60 caractères, description 155, canonique, hreflang réciproques,
les 2 adresses dans `sitemap.xml` avec leurs liens FR / EN, pas de `noindex`.

**Pour App (trouvé en faisant les captures)** : sur téléphone, après avoir touché un bouton d'un sélecteur (`.seg` : « Music
video », Coupes, Rythme, Format…), le bouton choisi reste pâle avec son texte blanc, presque illisible, tant qu'on ne touche pas
ailleurs. Cause : `src/theme.css` ligne 171, `.seg button:hover:not([disabled]){background:var(--ice)}` passe devant
`.seg button[aria-pressed="true"]` (ligne 172) et le survol « colle » au doigt sur téléphone. Correction possible : mettre la
règle de survol dans `@media (hover:hover){…}` (comme le pied de page) ou lui ajouter `:not([aria-pressed="true"])`.

Si conflit à la fusion avec `marketing/page-clip` (pas encore fusionnée) :
- `src/footer.py` : `page-clip` ajoute l'entrée `clip` à `TXT` et un lien dans la colonne Produit ; celle-ci ajoute `aide` à
  `TXT`, la liste `AIDE`, la colonne et les paires : garder les deux ;
- `tests/ui/pied_de_page_ui.py` : garder les pages des deux branches et les 5 colonnes ;
- `build_site.py`, `site_src/llms.txt`, `docs/STATUS.md` : garder les deux ajouts.

Reste à faire : « ok » du propriétaire sur la maquette, puis les 9 autres pages (même générateur), leurs captures, les liens
entre elles, les tests, et ce compte rendu complet.

Skills utilisés : `programmatic-seo` (une vraie demande et une vraie valeur par page, un seul modèle pour les 10), `ai-seo`
(titres en questions réelles, réponse directe sous chaque titre, données structurées, `llms.txt`), `seo-audit` (titre,
description, canonique, hreflang, plan du site, une seule h1, pas de `noindex`), `copywriting` (textes EN et FR, sans tics
d'IA), `built-in-browser` (relevés Google et Trends de l'étape 1).
