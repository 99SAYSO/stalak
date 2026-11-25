# Pages anglaises par cas d'usage : publiées le 01/11/2026

Marketing & croissance. Écrites le 30/10/2026, publiées le 01/11/2026 sur la branche `marketing/en-racine` (décision du propriétaire du 31/10 : les 6 pages sont publiées, l'anglais passe à l'adresse principale).

**Les 6 pages** (en ligne à la racine du site, ex. `https://stalak.app/rap-snippet-video`) :
- `lip-sync-video-editor`
- `music-video-maker-for-rappers`
- `rap-snippet-video`
- `lip-sync-videos-for-singers`
- `how-to-make-a-lip-sync-video`
- `edit-video-to-the-beat`

**Depuis le 25/11/2026, les 6 guides existent aussi en français** (point SEO/AEO du Chef) : `/fr/editeur-video-playback`, `/fr/faire-un-clip-de-rap`, `/fr/snippet-rap`, `/fr/videos-pour-chanteurs`, `/fr/comment-faire-une-video-playback`, `/fr/monter-une-video-sur-le-rythme`, avec leurs liens FR / EN (liste `GUIDES_FR` de `src/footer.py`).

**Pour les modifier :**
1. Changer le texte anglais dans `site_drafts/make_pages.py`, le français dans `site_drafts/guides_fr.py`.
2. Régénérer : `python3 site_drafts/make_pages.py` (écrit directement `site_src/<page>.html` et `site_src/fr/<page>.html`).
3. Reconstruire le site : `python3 build_site.py --domain stalak.app --email contact@stalak.app`.

`build_site.py` s'occupe du reste : plan du site (liste `GUIDES`, anglais seul), liens « Guides » dans le pied de page de l'accueil anglais, `{{URL}}`, et le bloc vidéo `<!--DEMO-->`, qui n'apparaît que si `site_src/demo/edit.mp4` existe. Depuis le 6/11, c'est un vrai montage Stalak des prises « neva die » du propriétaire, avec son accord (avant / après dans les 6 guides, la vidéo sur la page comparative ; voir `docs/marketing/DEMO.md`). Les images de partage des guides : `make_og.py`.

**Règles :**
- les prix sont ceux de la page Tarifs ;
- les boutons mènent à l'accueil avec `?ref=seo` (la page comparative : `?ref=seo-triller`).

# Pages d'aide pour Google (A7) : en anglais et en français

Marketing & croissance, depuis le 09/11/2026 (décision du propriétaire du 9/11). Sujets choisis sur de vraies données :
`docs/marketing/PAGES_AIDE.md`. Contrairement aux 6 guides, chaque page d'aide existe **en anglais (racine) et en français
(`/fr/`)**, avec les balises FR / EN.

**Pour les modifier ou en ajouter une :**
1. Le texte est dans `site_drafts/make_aide.py` (liste `PAGES`, une entrée par sujet avec `en` et `fr`).
2. La même page doit être dans la liste `AIDE` de `src/footer.py` (colonne « Tutorials » / « Tutos » du pied de page, plan du
   site, lien FR / EN) : `make_aide.py` vérifie que les deux listes sont pareilles.
3. Les captures de l'app (si l'app a changé) : construire le site, puis `python3 site_drafts/aide_shots.py public en` et
   `python3 site_drafts/aide_shots.py public fr` (écrit `site_src/aide/`).
4. `python3 site_drafts/make_aide.py` : écrit les pages dans `site_src/` et `site_src/fr/`, et leurs images de partage dans
   `site_src/og/` (`--no-og` pour ne pas refaire les images).
5. Reconstruire le site : `python3 build_site.py --domain stalak.app --email contact@stalak.app`.

Mêmes règles que les guides : prix de la page Tarifs, boutons vers `?ref=seo`.

# Pages « percer » : en anglais et en français (25/11/2026)

Marketing & croissance, point SEO/AEO du Chef (`docs/audit/seo-aeo-2026-11-25.md`). 4 pages qui répondent aux questions des rappeurs indés sur « percer », avec une réponse de 40 à 60 mots sous chaque titre (ce que les IA citent), des sources et nos propres chiffres. Elles ne promettent jamais de faire percer.

- `/how-to-blow-up-as-a-rapper` · `/fr/comment-percer-dans-le-rap`
- `/how-to-make-a-song-go-viral-on-tiktok` · `/fr/faire-decoller-un-son-sur-tiktok`
- `/how-many-snippets-before-a-release` · `/fr/combien-de-snippets-avant-une-sortie`
- `/miss-the-rage-snippet-story` · `/fr/histoire-snippet-miss-the-rage`

**Pour les modifier :** le texte est dans `site_drafts/make_percer.py` (la liste doit être la même que `PERCER` dans `src/footer.py`). `python3 site_drafts/make_percer.py` vérifie que chaque réponse fait 40 à 60 mots, écrit les pages et leurs images de partage (`--no-og` pour ne pas les refaire), puis reconstruire le site. Nos chiffres (compte TikTok @stalak_app, compteur de vidéos) sont datés dans la page : les mettre à jour en même temps.
