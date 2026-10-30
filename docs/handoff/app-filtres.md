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
Tests :
- `tests/ui/filtres_comparaison.py` : 125/125. Chaque filtre compile, change l'image, garde un rendu lisible et donne le même aspect à demi-taille et à pleine taille, sur 3 images, en 9:16 et en 16:9.
- `tests/ui/filtres_ui.py` (FR/EN, téléphone 390 px au doigt, ordinateur 1280 px) :
  - 14 vignettes en 3 thèmes, toutes dessinées et différentes ; 10 marquées PRO ; choix au doigt, à la souris et aux flèches ;
  - limite Pro : export ou pack avec un filtre Pro → `acctOpen('filters')`, rien pour un filtre gratuit ;
  - rendu identique : aperçu = export 2D (écart moyen ≤ 3,8/255, dû au grain), et export WebGL = export 2D (écart 0,0), image à l'endroit, pour les 14 réglages ;
  - filtre sauvegardé dans le projet (`clCollect`).
  - Dernier passage : 75/80, puis 32/32 pour la partie moteur. Les 4 échecs « aperçu en gris » venaient du test, qui mesurait sous l'étiquette colorée de la prise ; corrigé après ce passage. Le 5e venait d'un filtre Pro utilisé pour mesurer la vitesse, remplacé par des filtres gratuits ; la partie moteur repasse ensuite à 32/32.
- Vitesse d'export : pas mesurable ici. Le navigateur de test n'a ni carte graphique ni encodeur AAC, donc l'export passe par l'enregistrement en temps réel. Images exportées vérifiées à l'œil : filtre appliqué, paroles intactes. À mesurer sur iPhone, ligne « rendu par prise … i/s » du journal, sans filtre puis avec Noir & blanc.
- `node tests/backend/run.mjs` 63/63 ; `paroles_suppr.py` 44/44 ; `remux_frag.py` 10/10 ; syntaxe et builds OK.
Reste au propriétaire : valider le rendu sur la page « Filtres Stalak », puis tester sur iPhone après la mise en ligne.
Skills utilisés : webapp-testing, artifact-design (page de comparaison).
