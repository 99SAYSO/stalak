# Pages anglaises par cas d'usage : brouillons, NON publiés

Marketing & croissance, 30/10/2026. Ce dossier n'est pas copié dans `public/` : rien n'est en ligne.

**Les 6 pages :**
- `lip-sync-video-editor`
- `music-video-maker-for-rappers`
- `rap-snippet-video`
- `lip-sync-videos-for-singers`
- `how-to-make-a-lip-sync-video`
- `edit-video-to-the-beat`

**À publier seulement après la décision du propriétaire** sur l'anglais à l'adresse principale (`docs/marketing/US_FIRST.md`, partie A). Ensuite :

1. Régénérer les pages pour le bon emplacement :
   - si l'anglais passe à la racine : `python3 site_drafts/make_pages.py --base ""` ;
   - sinon : `python3 site_drafts/make_pages.py --base /en`.
2. Copier `site_drafts/out/*.html` dans `site_src/` (anglais à la racine) ou dans `site_src/en/`.
3. Dans `build_site.py` :
   - ajouter ces pages au plan du site (anglais seul, sans page française jumelle) ;
   - les ajouter à la boucle qui remplace `{{URL}}` ;
   - leur appliquer le retrait du bloc `<!--DEMO-->`, qui n'apparaît que si `site_src/demo/exemple.mp4` existe ;
   - ajouter les liens dans le pied de page de l'accueil anglais.
4. Le mieux est d'attendre une vraie vidéo d'exemple : sans elle, les pages perdent leur principal argument.

**Règles :**
- aucun concurrent cité ;
- aucun chiffre inventé ;
- les prix sont ceux de la page Tarifs ;
- les boutons mènent à l'accueil avec `?ref=seo`.
