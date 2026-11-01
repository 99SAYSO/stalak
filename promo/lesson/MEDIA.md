# Médias du projet (hors dépôt)

Comme pour les v5 et v6, aucun fichier vidéo ni audio n'est dans le dépôt (`.gitignore`), ni les images tirées des prises du propriétaire. Pour refaire un rendu : remettre les fichiers ci-dessous aux mêmes noms, lancer `python3 vo_cut.py` (une fois), puis `python3 build.py`, puis
`npx hyperframes render --quality delivery --fps 30 --page-motion-blur off -o renders/stalak-lesson-raw.mp4`,
puis le réglage du son (dans `REVIEW.md`).

| Fichier | D'où il vient |
|---|---|
| `assets/takes/take1.mp4`, `take2.mp4`, `take3.mp4` | Les 3 prises du propriétaire, les mêmes que `promo/one-shape` (temps de la prise = temps du son − 1,452 s). |
| `assets/audio/song.mp3`, `assets/audio/inst.mp3` | « neva die » de 99Sayso et son instru, les mêmes que `promo/one-shape` (instru = son + 23,13007 s). Licence de l'instru à vérifier avant une pub. |
| `assets/audio/vo/lesson_raw.wav` | La lecture des 9 phrases : Gemini 3.1 Flash TTS dans Flora, voix Achird (0,013 $, run `run_m17fxc03nqng0vmct584p1fx6h8hcen8`), téléchargée par le propriétaire le 1/11. `vo_cut.py` la normalise (−16 LUFS, −1,5 dBTP), recolle chaque phrase sans les longs blancs de la lecture, la coupe en `l1` … `l9` et mesure les mots (`lesson_clips.json`). |
| `assets/sfx/*.mp3` | Les sons de la bibliothèque fournie avec HyperFrames (Pixabay, voir `CREDITS.md`), copiés de `promo/one-shape` ; seuls `whoosh`, `whoosh-short`, `pop`, `impact-bass-1`, `impact-bass-2`, `sparkle`, `typing` et `riser` servent. `peaks.json` : où chaque son frappe. |

Dans le dépôt : `vo_cut.py`, `build.py`, `index.html` et `assets/times.js` (générés), `compositions/film.html`, `assets/engine.js` (le moteur), les polices (Lilita One, Rubik), le logo, l'icône et le grain de la marque, GSAP.

Rien n'est pris de la vidéo d'exemple (ni image, ni son, ni texte) : seulement sa façon de raconter (voir `SPEC.md`).
