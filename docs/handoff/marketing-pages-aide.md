Statut : PRÊT (étapes 1, 2 et 3 faites : les 10 pages d'aide, en anglais et en français). À publier par le Chef de projet après
l'accord du propriétaire.
Branche : marketing/pages-aide
Conversation : 5. Marketing & croissance
Partie de : `main` 2e84cb8
Maquette : https://marketing-pages-aide.stalak-site.pages.dev/how-to-make-a-music-video-on-your-phone (les 20 adresses
ci-dessous marchent sur le même aperçu, en remplaçant la fin de l'adresse)

Demande du Chef de projet (9/11, décision du propriétaire du 9/11) : lancer A7, des pages d'aide pour Google, en anglais d'abord
puis en français dans `/fr/`. D'abord la liste des 10 sujets, appuyée sur de vraies données ; puis une maquette d'une seule page ;
puis les 10 pages.

- Étape 1, validée (« oui » du propriétaire, 9/11, 13 h 20) : la liste des 10 sujets et ses preuves (suggestions Google, « Autres
  questions posées », Google Trends du 9/11, sans volume inventé) dans `docs/marketing/PAGES_AIDE.md`.
- Étape 2, validée (« ok » du propriétaire, 9/11, 13 h 41) : la maquette sur le n° 1.
- Étape 3, faite : les 9 autres pages sur le même modèle.

## Les 10 pages (anglais / français)

| N° | Anglais | Français |
|---|---|---|
| 1 | `/how-to-make-a-music-video-on-your-phone` | `/fr/faire-un-clip-avec-son-telephone` |
| 2 | `/music-video-ideas` | `/fr/idees-de-clip` |
| 3 | `/how-to-lip-sync` | `/fr/comment-faire-un-playback` |
| 4 | `/how-to-film-yourself-rapping` | `/fr/se-filmer-en-train-de-rapper` |
| 5 | `/sync-video-to-music` | `/fr/synchroniser-video-et-musique` |
| 6 | `/add-lyrics-to-video` | `/fr/mettre-les-paroles-sur-une-video` |
| 7 | `/promote-your-music-on-tiktok` | `/fr/promouvoir-sa-musique-sur-tiktok` |
| 8 | `/promote-your-music-on-instagram` | `/fr/promouvoir-sa-musique-sur-instagram` |
| 9 | `/how-to-tease-a-song` | `/fr/teaser-un-son` |
| 10 | `/music-video-format` | `/fr/format-video-clip` |

Chaque page, sur le modèle validé :
- le vrai mode d'emploi, en questions réelles (chaque titre est une question, avec une réponse directe juste dessous), environ
  600 à 1 000 mots par page ;
- puis « Stalak in one minute » / « Stalak en une minute » : 3 ou 4 étapes avec de **vraies captures de l'app** en taille téléphone
  (gratuit, l'exemple « neva die » et ses 3 prises), et le bouton « Try it free » / « Essaie gratuitement » (`/?ref=seo`) ;
- ce qui est gratuit et Pro (mots exacts de `/pricing` et `/fr/tarifs`), la FAQ, le mot de 99Sayso, puis « More guides » : 4 autres
  tutos liés + des guides existants (ou les tarifs en français) ;
- titre de 60 caractères au plus, description de 140 à 160, une seule h1, canonique, `hreflang` en / fr / x-default, données
  structurées WebPage + BreadcrumbList + HowTo + FAQPage, image de partage `og/<adresse>.jpg` (ligne du bas dans la langue de la page).

Partout sur le site : le pied de page a la colonne « Tutorials » / « Tutos » avec les 10 pages (liste `AIDE` de `src/footer.py`), dans
la langue de la page. Les 20 adresses sont dans `sitemap.xml` avec leurs liens FR / EN, et dans `llms.txt` (partie « Tutorials »).

## Ce qui est vérifié (aucune affirmation inventée)

- **Dans l'app** (`src/app.js`) : − / + décalent une prise d'une image ; − / + à côté d'une phrase de paroles la décalent un peu
  (0,05 s) ; « Sync automatically » / « Caler automatiquement » est gratuit (non bloqué) ; « Auto transcription » est Pro, 20 par
  jour (60 avec Creator Plus, comme sur `/pricing`) ; packs de 5, 10 ou 30 vidéos avec Creator Plus ; formats 9:16 en 1080 × 1920,
  4:5 en 1080 × 1350 et 1:1 en 1080 × 1080, gratuits (seul l'export du mode Clip est bloqué, l. 7790) ; mode Clip 16:9 en
  1920 × 1080 avec Pro ; le bouton de pack s'appelle « Make the pack » / « Générer le pack ».
- **Réseaux** (sources officielles, vérifiées le 9/11) : Shorts YouTube jusqu'à 3 minutes, carrés ou verticaux, et un Short de plus
  d'une minute avec une revendication de droits d'auteur active est bloqué (support.google.com/youtube/answer/15424877) ; Reels
  importés jusqu'à 3 minutes depuis le 18/01/2025 (annonce d'Adam Mosseri, reprise par Social Media Today) ; les Reels d'essai sont
  montrés d'abord à des non-abonnés, résultats au bout d'environ 24 h (creators.instagram.com/blog/instagram-trial-reels) ; sticker
  « Compte à rebours » et posts en collab. Aucune durée chiffrée pour TikTok (rien d'officiel et de stable).
- Aucun concurrent cité, aucun chiffre de vues ou de résultat, pas de faux avis.

## Fichiers

- nouveaux : `site_src/<adresse>.html` et `site_src/fr/<adresse>.html` pour les 10 pages (écrits par `site_drafts/make_aide.py`,
  ne pas les modifier à la main), `site_src/aide/` (18 captures, ~1,2 Mo), `site_src/og/` (20 images), `site_drafts/make_aide.py`,
  `site_drafts/aide_shots.py` (refaire les captures si l'app change : `python3 site_drafts/aide_shots.py public en`, puis `fr`) ;
- changés : `src/footer.py` (liste `AIDE` de 10 pages, colonne, paires FR / EN), `src/footer.css` (5 colonnes sur ordinateur),
  `build_site.py` (plan du site), `site_src/llms.txt`, `tests/ui/pied_de_page_ui.py` (la colonne Tutos, les 5 colonnes, les 20
  pages lues dans `src/footer.py`), `site_drafts/README.md`, `docs/marketing/PAGES_AIDE.md`, `docs/STATUS.md`, `public/` reconstruit ;
- `src/app.js` : rien. Le paquet de l'app change de nom parce que le pied de page est dedans : c'est normal.

Pour reconstruire : `python3 site_drafts/make_aide.py` (pages + images de partage ; `--no-og` sans les images), puis
`python3 build_site.py --email contact@stalak.app` et `python3 build.py`.

## Tests

Serveur `node tests/backend/run.mjs` 103/103 ; `tests/ui/pied_de_page_ui.py` 802/802 (les 20 pages d'aide, la colonne Tutos avec
ses 10 liens, les 5 colonnes, et la version claude.ai) ; `tests/ui/liens_cmp_ui.py` 58/58 ; `python3 build_site.py` et `python3 build.py`
passent.

Vérifié à la main sur les 20 pages (iPhone 15 Pro émulé et ordinateur 1366 px) : pas de défilement horizontal (le tableau de la
page 10 tient sur téléphone), aucune erreur JavaScript, aucune adresse en erreur, toutes les images chargées, une seule h1. Contrôlé
par script : canonique, `hreflang` réciproques, les 20 adresses dans `sitemap.xml` (avec leurs liens FR / EN) et dans `llms.txt`,
pas de `noindex`, tous les liens internes mènent à une page qui existe, données structurées lisibles sur les 20 pages.

## Pour App (trouvé en faisant les pages)

1. Sur téléphone, après avoir touché un bouton d'un sélecteur (`.seg` : « Music video », Coupes, Rythme, Format…), le bouton choisi
   reste pâle avec son texte blanc, presque illisible, tant qu'on ne touche pas ailleurs. Cause : `src/theme.css` ligne 171,
   `.seg button:hover:not([disabled]){background:var(--ice)}` passe devant `.seg button[aria-pressed="true"]` (ligne 172) et le
   survol « colle » au doigt sur téléphone. Correction possible : mettre la règle de survol dans `@media (hover:hover){…}` (comme le
   pied de page) ou lui ajouter `:not([aria-pressed="true"])`.
2. **L'assistant d'aide (le glaçon en bas à droite) donne une mauvaise formule** : son texte (`HELP_GUIDE`, `src/app.js` l. 9115-9116
   en français, `HELP_GUIDE_EN` l. 9167-9168 en anglais) dit que les packs et « Sauvegarder en ligne » sont « avec Stalak Pro », alors
   que l'app (`FEAT_PLAN` : `pack5/10/30` et `cloud` = `creator`) et `/pricing` les mettent dans **Creator Plus**. Un abonné Pro à qui
   l'assistant répond ça ne les trouvera pas. Correction : « Creator Plus » à ces 4 endroits.

## Si conflit à la fusion avec `marketing/page-clip` (pas encore fusionnée)

- `src/footer.py` : `page-clip` ajoute l'entrée `clip` à `TXT` et un lien dans la colonne Produit ; celle-ci ajoute `aide` à `TXT`,
  la liste `AIDE`, la colonne et les paires : garder les deux ;
- `tests/ui/pied_de_page_ui.py` : garder les pages des deux branches et les 5 colonnes ;
- `build_site.py`, `site_src/llms.txt`, `docs/STATUS.md` : garder les deux ajouts ;
- `public/` : le reconstruire après la fusion (`build_site.py --email contact@stalak.app`), ne pas fusionner les fichiers à la main.

## Skills utilisés

`programmatic-seo` (une vraie demande et une vraie valeur par page, un seul modèle pour les 10, liens entre les pages, pas de page
creuse), `ai-seo` (titres en questions réelles, réponse directe sous chaque titre, données structurées, `llms.txt`), `seo-audit`
(titre, description, canonique, hreflang, plan du site, une seule h1, pas de `noindex`), `copywriting` (textes EN et FR, sans tics
d'IA, rien d'invérifiable), `built-in-browser` (relevés Google et Trends de l'étape 1).
