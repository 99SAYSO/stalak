# Médias du projet (hors dépôt)

Comme pour les v5 à v7, aucun fichier vidéo ni audio n'est dans le dépôt (`.gitignore`). Pour refaire un rendu : remettre les fichiers ci-dessous aux mêmes noms, lancer `python3 build.py` (qui fabrique aussi les sons `assets/sfx/gen_*.wav`), puis
`npx hyperframes render --quality delivery --fps 30 --page-motion-blur off -o renders/machine-raw.mp4`,
puis le réglage du son (dans `REVIEW.md`).

| Fichier | D'où il vient |
|---|---|
| `assets/takes/take1.mp4`, `take2.mp4`, `take3.mp4` | Les 3 prises du propriétaire, les mêmes que `promo/one-shape` (temps de la prise = temps du son − 1,452 s). |
| `assets/audio/song.mp3`, `assets/audio/inst.mp3` | « neva die » de 99Sayso et son instru, les mêmes que `promo/one-shape` (instru = son + 23,13007 s). Licence de l'instru à vérifier avant une pub. |
| `assets/sfx/*.mp3` | Les sons de la bibliothèque fournie avec HyperFrames (Pixabay, voir `CREDITS.md`), copiés de `promo/one-shape`. `peaks.json` : où chaque son frappe. |
| `assets/sfx/gen_*.wav` | Faits par `build.py` (synthèse) : domino, lame, tranche qui tombe, tampon, canon à neige, chrono, pince, glace qui craque, moteur, bip. |

Dans le dépôt : `build.py`, `index.html` et `assets/times.js` (générés), `compositions/film.html`, `assets/engine.js` (le moteur 3D isométrique), les polices (Lilita One, Rubik), le logo, l'icône et le grain de la marque, GSAP. Tout le décor (l'île, la machine, la neige, les îles au loin) est dessiné par `engine.js` : aucune image.
