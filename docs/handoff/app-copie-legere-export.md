Statut : PRÊT
Branche : app/copie-legere-export

Résumé :
- Fait : croix ✕ pour supprimer une ligne de paroles (demande du propriétaire).
  - Elle est dans la liste des lignes calées (`#lyLines`), à l'étape « Paroles » : c'est la seule liste de lignes du site.
  - `lyricRemove(i)` retire la ligne et la sauvegarde.
  - `lyricsChanged()` met à jour la liste, la zone de texte et l'image, et refait le montage « par mots » si besoin.
  - Le message de statut propose « Annuler », qui remet la ligne à sa place. Après une suppression, le clavier reste sur la croix suivante.
  - Sur téléphone (≤ 520 px), le texte de la ligne passe sur sa propre rangée sous l'heure et les boutons : il était déjà coupé avant.
  - Textes FR/EN placés après `ly.listen` (repère `"_bloc.app.paroles"`) et style placé après `.lines .tm.none`, pour éviter un conflit avec `app/son-passage`, qui écrit en fin de fichier.
- Pas de changement pour l'export dans cette branche. Le journal iPhone du propriétaire (27/10, 23 h) montre que la version en ligne marche :
  - « 1012 échantillons repris au bon endroit » ;
  - copie légère 360×640 faite en 3 s, son des prises lu ;
  - lecture sans image lente ;
  - export de 25 s en 7,7 s par WebCodecs, 2 flux, aucun repli sur le lecteur vidéo.
  - Le « lag » encore ressenti est analysé à part, à partir de la vidéo exportée (nouvelle branche si une correction est nécessaire).

Fichiers touchés : src/app.js, src/theme.css, public/index.html, public/en/index.html, tests/ui/paroles_suppr.py (nouveau), docs/STATUS.md, ce compte rendu.
Migration SQL : aucune.
Tests : `tests/ui/paroles_suppr.py` 44/44 (FR/EN, téléphone 390 px au doigt, ordinateur 1280 px) ; syntaxe et builds OK.
Reste au propriétaire : après la mise en ligne, supprimer une ligne de paroles à l'étape « Paroles » sur iPhone, puis tester « Annuler ».
Skills utilisés : webapp-testing (scénarios navigateur).
