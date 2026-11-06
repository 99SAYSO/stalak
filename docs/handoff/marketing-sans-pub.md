Statut : PRÊT
Branche : marketing/sans-pub
Conversation : 5. Marketing & croissance
Partie de : `main` d3d7564 (décision du propriétaire du 6/11, 14 h : plus de pub du tout ; STATUS)
Maquette : https://marketing-sans-pub.stalak-site.pages.dev/pricing (et `/fr/tarifs`, les guides, `/triller-alternative`, l'écran des formules : `/#pro`)
Mise en ligne : **en même temps que `app/filigrane-mascotte`** (demande du propriétaire). Pas avant, sinon le site dit « aucune pub » alors que l'app propose encore « Regarder une pub (30 s) ».

Résumé :
- La nouvelle offre est dans tous les textes de Marketing : Gratuit = vidéos illimitées, sans pub, toujours avec le petit
  filigrane (« le visage de la mascotte et stalak.app », les mêmes mots que Juridique) ; sans filigrane = Stalak Pro ou
  Creator Plus. Je n'écris plus que le filigrane « change de place » : rien n'est décidé pour le nouveau.
- **Page Tarifs EN/FR** (`site_src/pricing.html`, `site_src/fr/tarifs.html`) :
  - description Google : « no ads » / « sans pub » ; Pro « with no watermark » / « sans filigrane » ;
  - carte Gratuit : « No ads, no download, no sign-up » / « Aucune pub, aucun téléchargement, aucune inscription » ; ligne du
    filigrane réécrite ; la ligne « Watch a ~30-second ad… » / « Une pub d'environ 30 s… » est retirée ;
  - carte Pro : ruban et 1re ligne « No watermark » / « Sans filigrane » (avant : « No ads, no watermark ») ;
  - tableau : « Watermark (our mascot + stalak.app) : On every video / None / None » ; « Ads : None » dans les 3 colonnes ;
  - FAQ : « Is it really free? » dit « no ads » ; « How does the ad remove the watermark? » est remplacée par
    « How do I remove the watermark? » (Pro ou Creator Plus ; les vidéos exportées avant l'abonnement gardent leur filigrane,
    comme dans les conditions de Juridique) ; « Which plan should I pick? » sans « no ads ».
- **6 guides** (`site_drafts/make_pages.py`, régénérés et copiés dans `site_src/`) : la ligne « Free », la ligne « Stalak Pro » et
  la FAQ « Is Stalak free? » (et son JSON-LD) ; `dateModified` 2026-11-06. Le pied de page du générateur est aligné sur celui du
  site (il est de toute façon remplacé au build).
- **Page Triller EN/FR** (`site_drafts/make_triller.py`) : tableau (« Free, with a small watermark »), « What Stalak doesn't do »,
  FAQ « Is Stalak free? » ; « Updated November 6, 2026 » ; `dateModified` séparé de `datePublished` (le 1/11 reste la date de
  publication). Les faits sur Triller ne changent pas (sources non revérifiées, « Checked on November 1 » reste juste).
- **`site_src/llms.txt`** : nouvelle ligne « No ads, on any plan (free included). », filigrane décrit, Pro « no watermark ».
- **App, textes seulement** (fichiers partagés : seulement des lignes de texte, rien d'autre) :
  - écran des formules (bloc Comptes) : `pr.promo`, `pl.rib.pro`, `pl.f.nowm`, `pl.f.wm`, `pl.r.nowm`, `pl.p.nowm`, en anglais et
    en français (`src/app.js` et `src/markup.html`). Dans le tableau, la case Gratuit de la ligne « No watermark » devient un
    tiret « Non », comme les autres lignes : la clé `pl.v.ad` (« An ad removes it ») est retirée ;
  - fenêtre Pro et raisons : `pp.l1`, `acct.why.nowm`, `ap.whyIn.nowm` (« No watermark with Pro. » / « Pas de filigrane avec Pro. »).
  - **Laissé à App** (le bouton pub et son écran, qu'App retire) : `ad.btn`, `ad.sub`, `ad.or`, `ad.load`, `ad.ok`, `ad.okRe`,
    `ad.closed`, `ad.none`, `ad.na`, `wm.passed`, `pc.p` (fenêtre « Your Privacy Choices »). Deux textes à revoir par App :
    `ad.or` (« No watermark, no ads: go Pro ») → « No watermark: go Pro » / « Sans filigrane : passe à Pro » si le lien reste,
    et `wm.note` (« Free videos carry a small Stalak logo as a watermark. ») qui décrit l'ancien filigrane.
- **Assistant d'aide** (`functions/_lib/help-guide.js`, domaine Comptes, 3 lignes FR + 3 EN) : plus de pub de 30 s ; « Il n'y a
  aucune pub sur Stalak : l'ancien bouton « Regarder une pub » n'existe plus » ; filigrane = visage de la mascotte et
  « stalak.app » ; sans filigrane = Pro ou Creator Plus. Une vérification ajoutée au test serveur du guide (il ne promet plus la pub).
- **Textes marketing** (`docs/marketing/`) : `ANNUAIRES.md` (ligne « Pricing » du texte B, avec une note), `PLAN_TRILLER.md` et
  `US_FIRST.md` (posts Reddit / X et réponses types).

Si conflit à la fusion :
- `src/app.js` / `src/markup.html` : si `app/filigrane-mascotte` a aussi changé `acct.why.nowm` / `ap.whyIn.nowm` (ou le
  commentaire `_bloc.app.formules` juste au-dessus), garder une seule version : le sens est le même.
- `tests/ui/audit_ui.py` (ligne 131, les 3 avantages de la fenêtre Pro) et `tests/ui/plans_ui.py` (ruban Pro) : ils attendent
  maintenant « No watermark » / « Sans filigrane ».
- `public/` (dont `sitemap.xml`, aussi changé par `legal/sans-pub`) : reconstruire avec `build_site.py` après les fusions.

Skills utilisés : `copywriting` (modifications ciblées, mêmes mots que le reste du site), `pricing` (page Tarifs claire et lisible
par les IA : prix en texte, FAQ, `llms.txt`).

Fichiers touchés : `site_src/pricing.html`, `site_src/fr/tarifs.html`, `site_src/llms.txt`, `site_src/` (6 guides,
`triller-alternative.html`, `fr/alternative-triller.html`), `site_drafts/make_pages.py`, `site_drafts/make_triller.py`,
`site_drafts/out/` (6 guides), `src/app.js`, `src/markup.html`, `functions/_lib/help-guide.js`, `tests/backend/run.mjs`,
`tests/ui/audit_ui.py`, `tests/ui/plans_ui.py`, `docs/marketing/ANNUAIRES.md`, `docs/marketing/PLAN_TRILLER.md`,
`docs/marketing/US_FIRST.md`, `public/` (reconstruit), `docs/STATUS.md`.
Migration SQL : aucune.

Tests (sur la branche, `public/` reconstruit) :
- `node tests/backend/run.mjs` : 96/96 (avec la nouvelle vérification du guide d'aide).
- `tests/ui/plans_ui.py` : 35/35 · `tests/ui/audit_ui.py` : 158/158 · `tests/ui/pied_de_page_ui.py` : 402/402 ·
  `tests/ui/liens_cmp_ui.py` : 98/98.
- Captures à 390 px et 1280 px, en FR et en EN (Tarifs, un guide, page Triller, écran des formules de l'app) : pas de défilement
  horizontal, aucune erreur, plus aucun ancien texte de pub.
- `python3 build.py` (version claude.ai) passe, syntaxe de `src/app.js` vérifiée.
- Ce qui parle encore de la pub après ma branche : l'app (bouton pub, à App) et les pages légales (à `legal/sans-pub`).

Reste à faire :
- Marketing, après la mise en ligne d'App : film de lancement v7. La v6 montre l'ancien écran Export (« Watch an ad (30 s) ») et
  l'ancien filigrane dans l'aperçu : nouvelles captures de l'app, puis planche contact (règle 10). Mieux vaut ne pas publier
  la v6 d'ici là.
- Propriétaire (ou Chef de projet dans Chrome, une fois le propriétaire connecté) : sur les fiches AlternativeTo et SaaSHub
  (texte B du 1/11), remplacer la phrase sur la pub de 30 s par la nouvelle ligne « Pricing » de `docs/marketing/ANNUAIRES.md`.
- Pas touché : la balise `google-adsense-account` de `build_site.py` et `ads.txt` (le STATUS dit que `ads.txt` peut rester).

Reste au propriétaire : regarder la maquette, puis donner son « ok ».
