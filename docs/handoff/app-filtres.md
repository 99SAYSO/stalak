Statut : EN COURS (attend la validation du rendu par le propriétaire)
Branche : app/filtres

Résumé :
- 13 filtres vidéo plus « Aucun » à l'étape Montage :
  - Caméra : Givre, Grain vintage « LA », Vision nocturne, Démon, Halloween ;
  - Rétro : VHS, Film 35 mm, Super 8, Noir & blanc ;
  - Esthétique : Golden hour, Rêve, Y2K, Pastel.
- Moteur unique : bloc `/*@FILTERS*/ … /*FILTERS@*/` de `src/app.js`. Il ne dépend pas du reste de l'app.
  - Un shader WebGL (`FILT_FRAG`) et `filtOverlay`, en 2D, pour la date VHS et les étoiles Y2K.
  - Tailles exprimées en pixels de la vidéo finale, mouvements calés sur le temps du morceau : même rendu dans l'aperçu (demi-taille) et dans l'export.
- Aperçu et export 2D : `filtPass(c, t)` est appelé dans `drawFrame` et `drawComposite`, entre la vidéo et les paroles. Les paroles restent au-dessus, sans filtre. La fin Stalak n'est pas filtrée.
- Export WebGL (Safari) : `expGL` exécute le même programme dans son propre contexte. La vidéo passe par une texture (fbo), puis le filtre, puis les paroles. Si le fbo est impossible, l'image passe par le canvas 2D, qui a le filtre. Le passage direct d'une image décodée (`passOk`) est coupé quand un filtre est actif.
- Vignettes : une copie réduite de l'image sous la tête de lecture, prise hors lecture, passe dans chaque filtre (`filtThumbs`). Rangée en `radiogroup`, flèches au clavier, marque PRO pour les gratuits.
- Stalak Pro : Givre, Film 35 mm et Noir & blanc sont gratuits. Les 10 autres s'essaient dans l'aperçu, mais `exportOne` et `exportPack` ouvrent `acctOpen('filters')`. Textes `acct.why.filters` et `ap.whyIn.filters` ajoutés (FR/EN).
- Sauvegarde : `set.filter` dans `clCollect`, relu à l'ouverture. Deux lignes touchées dans le bloc compte de `app.js`, à signaler à Comptes.
- Journal : « filtre : X », « export : filtre X », coût moyen du filtre dans la ligne « lecture : ».

Fichiers touchés : src/app.js, src/markup.html, src/theme.css (bloc en fin de fichier), public/index.html, public/en/index.html, tests/ui/filtres_comparaison.py (nouveau), tests/ui/filtres_ui.py (nouveau), docs/STATUS.md, ce compte rendu.
Migration SQL : aucune.
Tests : `tests/ui/filtres_comparaison.py` 125/125 (chaque filtre compile, change l'image, même rendu à demi et pleine taille, sur 3 images en 9:16 et 16:9). `tests/ui/filtres_ui.py` en cours.
Reste au propriétaire : valider le rendu sur la page « Filtres Stalak », puis tester sur iPhone après la mise en ligne.
Skills utilisés : webapp-testing, artifact-design (page de comparaison).
