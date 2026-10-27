Statut : EN COURS
Branche : app/copie-legere-export

Résumé :
- Fait : croix ✕ pour supprimer une ligne de paroles (demande du propriétaire).
  - Elle est dans la liste des lignes calées (`#lyLines`), à l'étape « Paroles » : c'est la seule liste de lignes du site.
  - `lyricRemove(i)` retire la ligne et la sauvegarde.
  - `lyricsChanged()` met à jour la liste, la zone de texte et l'image, et refait le montage « par mots » si besoin.
  - Le message de statut propose « Annuler », qui remet la ligne à sa place. Après une suppression, le clavier reste sur la croix suivante.
  - Sur téléphone (≤ 520 px), le texte de la ligne passe sur sa propre rangée sous l'heure et les boutons : il était déjà coupé avant.
  - Textes FR/EN placés après `ly.listen` (repère `"_bloc.app.paroles"`) et style placé après `.lines .tm.none`, pour éviter un conflit avec `app/son-passage`, qui écrit en fin de fichier.
- En cours : export qui saccade et plus lent avec les prises filmées sur iPhone, et aperçu sans copie légère.
  - Le code fait pourtant passer ces prises par la copie légère, comme les vidéos importées : même chemin `addVideo` → `liveOrig` → `needProxy` → `queueProxy`.
  - Piste : le décodage des prises échoue encore sur iPhone. Le site retombe alors sur le lecteur vidéo de Safari, ce qui donne la saccade dans l'export (« images par le lecteur vidéo ») et l'absence de copie.
  - Journal iPhone demandé au propriétaire (2 prises, lecture, export).

Fichiers touchés : src/app.js, src/theme.css, public/index.html, public/en/index.html, tests/ui/paroles_suppr.py (nouveau), docs/STATUS.md, ce compte rendu.
Migration SQL : aucune.
Tests : `tests/ui/paroles_suppr.py` 44/44 (FR/EN, téléphone 390 px au doigt, ordinateur 1280 px) ; syntaxe et builds OK.
Reste au propriétaire : envoyer le journal iPhone (#debug, 2 prises filmées dans Stalak, lecture, export, « Copier les infos pour l'équipe »).
Skills utilisés : webapp-testing (scénarios navigateur).
