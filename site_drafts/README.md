# Pages anglaises par cas d'usage : publiées le 01/11/2026

Marketing & croissance. Écrites le 30/10/2026, publiées le 01/11/2026 sur la branche `marketing/en-racine` (décision du propriétaire du 31/10 : les 6 pages sont publiées, l'anglais passe à l'adresse principale).

**Les 6 pages** (en ligne à la racine du site, ex. `https://stalak.app/rap-snippet-video`) :
- `lip-sync-video-editor`
- `music-video-maker-for-rappers`
- `rap-snippet-video`
- `lip-sync-videos-for-singers`
- `how-to-make-a-lip-sync-video`
- `edit-video-to-the-beat`

**Pour les modifier :**
1. Changer le texte dans `site_drafts/make_pages.py`.
2. Régénérer : `python3 site_drafts/make_pages.py --base ""` (l'anglais est à la racine).
3. Copier `site_drafts/out/*.html` dans `site_src/`.
4. Reconstruire le site : `python3 build_site.py --domain stalak.app --email contact@stalak.app`.

`build_site.py` s'occupe du reste : plan du site (liste `GUIDES`, anglais seul), liens « Guides » dans le pied de page de l'accueil anglais, `{{URL}}`, et le bloc vidéo `<!--DEMO-->`, qui n'apparaît que si `site_src/demo/edit.mp4` existe. Depuis le 6/11, c'est un vrai montage Stalak des prises « neva die » du propriétaire, avec son accord (avant / après dans les 6 guides, la vidéo sur la page comparative ; voir `docs/marketing/DEMO.md`). Les images de partage des guides : `make_og.py`.

**Règles :**
- aucun concurrent cité (la seule page qui en parle est `/triller-alternative`, décision du 31/10) ;
- aucun chiffre inventé ;
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

Mêmes règles que les guides : aucun concurrent cité, aucun chiffre inventé, prix de la page Tarifs, boutons vers `?ref=seo`.
