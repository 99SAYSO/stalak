Statut : PRÊT
Branche : marketing/audit-13-11
Conversation : 5. Marketing & croissance
Partie de : `main` 9baa963
Maquette : https://marketing-audit-13-11.stalak-site.pages.dev/fr/remboursement (le bas de page français ; pour les images de partage : https://marketing-audit-13-11.stalak-site.pages.dev/og-en.png et https://marketing-audit-13-11.stalak-site.pages.dev/og/refunds.jpg)

Demande du Chef de projet (13/11, audit `docs/audit/2026-11-13-audit-site.md`, points 6, 7 et 8 + le constat Search Console).

## 1. Bas de page français : les 6 guides anglais retirés (point 6)

**Choix : les retirer du bas de page français, ne pas traduire les guides.** C'est le mieux pour Google :
- une page française ne doit pas envoyer vers des pages en anglais : le visiteur français tombe sur de l'anglais et repart ;
- les 6 sujets existent déjà en français dans la colonne « Tutos » (playback, clip au téléphone, se filmer, teaser un son,
  synchro, paroles, format) : traduire les guides ferait des pages françaises en double, qui se disputeraient les mêmes
  recherches ;
- la demande française est faible sur ces sujets : dans Google Trends (France, 12 mois, relevé du 9/11,
  `docs/marketing/PAGES_AIDE.md`), « faire un playback », « idée de clip » et « se filmer seul » sont à 0, c'est-à-dire trop peu
  de recherches pour que Trends les compte ;
- c'est cohérent avec la décision du 31/10 : les 6 guides restent en anglais seulement.

Fait : `src/footer.py`, les guides sont dans le pied de page **anglais seulement** (le français garde Tarifs, Le mode Clip,
Alternative à Triller et les 10 tutos). Le pied de page de l'app française suit (même source). Le test `pied_de_page_ui` vérifie
maintenant que les 6 guides sont dans le pied de page anglais **et absents** du français. Plus aucune page française du site ne
renvoie vers un guide anglais (vérifié sur les 44 pages construites).

## 2. Titres : tous à 60 caractères au plus (point 7)

Les 4 titres de l'audit, et **5 autres de 61 à 65 caractères** que l'audit n'avait pas comptés (même problème, même correction) :

| Page | Avant | Après |
|---|---|---|
| `/` | Stalak: free lip-sync video editor that cuts your takes to the beat (67) | Stalak: free lip-sync video editor that cuts to the beat (56) |
| `/music-video-maker-for-rappers` | Music Video Maker for Rappers: Cut Your Takes on the Beat \| Stalak (66) | Music Video Maker for Rappers: Cut on the Beat \| Stalak (55) |
| `/rap-snippet-video` | Make a Rap Snippet Video From Your Takes, Cut on the Beat \| Stalak (66) | Rap Snippet Video: Your Takes, Cut on the Beat \| Stalak (55) |
| `/lip-sync-videos-for-singers` | Performance Videos for Singers: Multi-Take Edits on the Beat \| Stalak (69) | Performance Videos for Singers: Multi-Take Edits \| Stalak (57) |
| `/lip-sync-video-editor` | Lip-Sync Video Editor That Cuts Your Takes to the Beat \| Stalak (63) | Lip-Sync Video Editor: Your Takes, Cut to the Beat \| Stalak (59) |
| `/how-to-make-a-lip-sync-video` | How to Make a Lip-Sync Video in 4 Steps (Free, No App) \| Stalak (63) | How to Make a Lip-Sync Video in 4 Steps (Free) \| Stalak (55) |
| `/triller-alternative` | Triller Alternative: Cut Your Lip-Sync Takes on the Beat \| Stalak (65) | Triller Alternative: Lip-Sync Takes Cut on the Beat \| Stalak (60) |
| `/fr/alternative-triller` | Alternative à Triller : tes prises montées sur le rythme \| Stalak (65) | Alternative à Triller : ton playback sur le rythme \| Stalak (59) |
| `/fr/clip` | Tout ton morceau en clip YouTube, monté sur le temps \| Stalak (61) | Ton morceau en clip YouTube, monté sur le temps \| Stalak (56) |

Le mot-clé principal reste en tête de chaque titre. Le titre de partage (`og:title`) et le nom dans les données structurées suivent,
car ils viennent de la même source (`build_site.py`, `site_drafts/make_pages.py`, `site_drafts/make_triller.py`). Le texte des
pages ne change pas. Vérifié : **0 titre de plus de 60 caractères** sur les 44 pages du site.

## 3. Images de partage (point 8)

- **Conditions et remboursement, FR et EN** : balises de partage (titre, description, adresse, image 1200 × 630, carte
  « grande image ») et une image à chaque page, dans sa langue, au style des guides (`site_drafts/make_og.py`) : « Refund policy —
  14 days to change your mind, full refund », « Remboursement — 14 jours pour changer d'avis, remboursement intégral », etc.
- **Confidentialité et mentions légales, FR et EN** : même manque, même correction (4 pages de plus ; elles restent en `noindex`).
- **Trouvé en faisant ce point** : l'image de partage principale `og.png` est **en français** (« Ton playback, monté sur le
  rythme. ») et c'était celle de l'accueil anglais, des Tarifs anglais et de la page Triller anglaise : un lien stalak.app partagé
  aux États-Unis montrait du français. Nouvelle image `og-en.png` : la même image, avec « Your lip sync, cut to the beat. » à la
  place (même police, taille et ombre : refaire la ligne française de cette façon redonne `og.png` au pixel près ; script
  `site_drafts/make_og_en.py`). Utilisée par l'accueil anglais (partage, X, données structurées), `/pricing` et
  `/triller-alternative`. Les pages françaises gardent `og.png`.

## 4. Le constat : Google ne montre le site que sur « stalak »

C'est normal à ce stade, et rien ne bloque Google de notre côté :
- les pages d'aide sont en ligne depuis le 9/11 au soir, donc 4 jours sur les 7 jours mesurés. Google le dit lui-même : « Crawling
  can take anywhere from a few days to a few weeks » (developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) ;
- Search Console ne compte une recherche que si une page a été montrée. Une page pas encore indexée, ou classée trop loin, ne
  donne rien. Le site est jeune et a peu de liens venant d'autres sites, donc il passera d'abord sur des questions précises avant
  les recherches générales comme « how to lip sync » ;
- vérifié le 13/11 au soir sur le vrai site : `robots.txt` autorise tout ; `sitemap.xml` liste les 38 pages, dont les 20 pages
  d'aide ; les pages d'aide répondent 200 à Googlebot, sans `noindex` ni en-tête qui l'interdise.

**À faire par le propriétaire (Search Console, 10 minutes ; Claude peut le faire dans le navigateur une fois connecté) :**
1. Sitemaps : vérifier que `sitemap.xml` est « Opération effectuée » avec 38 pages découvertes.
2. Inspection de l'URL sur `https://stalak.app/how-to-make-a-music-video-on-your-phone` : si « L'URL n'est pas sur Google »,
   cliquer « Demander l'indexation ». Faire de même pour les 10 pages d'aide anglaises, sur 1 ou 2 jours (Google limite le
   nombre de demandes par jour, et redemander la même page n'accélère rien).
3. Indexation → Pages : noter combien de pages sont « Détectée, actuellement non indexée » ou « Explorée, actuellement non indexée ».
4. Bing Webmaster Tools : soumettre aussi les 20 adresses des pages d'aide (le 1/11, seules 12 adresses ont été soumises).

**Ce qui fera venir Google plus vite** : des liens venant d'autres sites. Par exemple, les descriptions des vidéos YouTube de
Stalak, qui renvoient vers le tuto qui correspond, des réponses utiles aux mêmes questions sur les forums de musiciens (au nom du
fondateur, en respectant les règles de chaque forum) et les annuaires déjà prévus (`docs/marketing/ANNUAIRES.md`).
Proposition, pas faite ici (changement visible, à valider) : dans « What is Stalak? » de l'accueil anglais, 3 ou 4 liens dans le
texte vers les tutos. L'accueil est la page la plus forte du site, et un lien dans le texte compte plus qu'un lien de bas de page.
**Mesurer à nouveau vers le 1/12** dans Search Console, page par page (onglet « Pages »), et pas seulement par recherche.

## Fichiers

- changés : `src/footer.py`, `build_site.py` (titre de l'accueil anglais, image de partage selon la langue),
  `site_drafts/make_pages.py` (4 titres), `site_drafts/make_triller.py` (2 titres, image anglaise),
  `site_drafts/make_og.py` (8 images des pages légales), `site_src/` (les 8 pages légales, 6 guides régénérés, page Triller FR/EN
  régénérée, `fr/clip.html`, `pricing.html`), `site_drafts/out/` (les guides), `tests/ui/pied_de_page_ui.py`, `docs/STATUS.md` ;
- nouveaux : `site_src/og-en.png`, `site_src/og/{terms,refunds,privacy,legal-notice,conditions,remboursement,confidentialite,mentions-legales}.jpg`
  (~0,5 Mo en tout), `site_drafts/make_og_en.py` ;
- `public/` reconstruit (`build_site.py --domain stalak.app --email contact@stalak.app`) et `shuffle-lab.html` (`build.py`). Le
  paquet de l'app change de nom parce que le pied de page est dedans : c'est normal. `src/app.js` : rien.

## Tests

Serveur `node tests/backend/run.mjs` 105/105 ; `tests/ui/pied_de_page_ui.py` 842/842 (dont : les 6 guides dans le pied de page
anglais et absents du français, sur les pages et dans l'app, aussi après le changement de langue ; version claude.ai) ;
`tests/ui/liens_cmp_ui.py` 58/58 ; `node --check src/app.js`, `python3 build_site.py` et `python3 build.py` passent.
Vérifié à la main (iPhone 15 Pro émulé et ordinateur 1366 px, FR et EN) sur les 10 pages changées : pas de défilement
horizontal, aucune erreur, aucune adresse en erreur, une seule h1. Contrôlé par script sur les 44 pages construites : 0 titre de
plus de 60 caractères, 0 lien d'une page française vers un guide anglais, chaque image de partage existe avec une adresse
complète, aucune page anglaise avec l'image française.

## Si conflit à la fusion

- `src/footer.py`, `tests/ui/pied_de_page_ui.py` : garder les ajouts des deux côtés ; ici, seules la ligne des guides (`guides`) et
  leur vérification (`guides_ok`) changent ;
- `build_site.py` : ici, le titre anglais de l'accueil et la variable `og` dans `meta()` ;
- pages légales (`site_src/`, domaine Juridique) : ici, seulement le bloc de partage ajouté sous la description, le texte ne change pas ;
- `public/` : le reconstruire après la fusion, ne pas fusionner les fichiers à la main.

## Skills utilisés

`seo-audit` (titres de 60 caractères au plus, partie internationale pour le choix du pied de page, vérification de ce qui peut
bloquer l'indexation, balises de partage), `copywriting` (nouveaux titres, lignes des images de partage).
