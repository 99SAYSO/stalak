# Médias du projet (hors dépôt)

Comme pour la v5, aucun fichier vidéo ni audio n'est dans le dépôt (`.gitignore`), ni les images tirées des prises du propriétaire. Pour refaire un rendu : remettre les fichiers ci-dessous aux mêmes noms, lancer `python3 vo_cut.py` (une fois), puis `python3 build.py`, puis
`npx hyperframes render --quality delivery --fps 30 --page-motion-blur off -o renders/wyr-v1.mp4`.

| Fichier | D'où il vient |
|---|---|
| `assets/takes/take1.mp4`, `take2.mp4`, `take3.mp4` | Les 3 prises du propriétaire, les mêmes que `promo/one-shape` (temps de la prise = temps du son − 1,452 s). |
| `assets/audio/song.mp3`, `assets/audio/inst.mp3` | « neva die » de 99Sayso et son instru, les mêmes que `promo/one-shape` (instru = son + 23,13007 s). Licence de l'instru à vérifier avant une pub. |
| `assets/audio/vo/vo03.wav` … `vo10.wav`, `vo13.wav`, `vo14.wav`, `vo_clips.json` | Les phrases de la voix off de la v5 (même voix Achird), copiées de `promo/one-shape/assets/audio/vo/`. |
| `assets/audio/vo/wyr_raw.wav` | La nouvelle lecture : Gemini 3.1 Flash TTS dans Flora, voix Achird (0,013 $, run `run_m176pp4ft9svwwc5nfv8e0xrmx8hcahz`), téléchargée par le propriétaire le 1/11. `vo_cut.py` la normalise (−16 LUFS, −1,5 dBTP), la coupe en 6 phrases (`wyr_q1` … `wyr_a3`) et mesure les mots (`wyr_clips.json`). |
| `assets/sfx/*.mp3` | Les sons de la bibliothèque fournie avec HyperFrames (Pixabay, voir `CREDITS.md`), copiés de `promo/one-shape`. `peaks.json` : où chaque son frappe. |
| `assets/sfx/tick.wav`, `tock.wav`, `shatter.wav`, `shatter-s.wav` | Faits par `build.py` (synthèse : le tic-tac du chrono, le verre qui casse). |
| `assets/stills/f_none.jpg`, `f_frost.jpg`, `f_film.jpg`, `f_bw.jpg` | Les vignettes de la rangée de filtres de la v5 (tirées de la prise 1), copiées de `promo/one-shape`. |

Dans le dépôt : `vo_cut.py`, `build.py`, `index.html` et `assets/times.js` (générés), `compositions/film.html`, `assets/engine.js` (le moteur), les polices (Lilita One, Rubik ; Nunito Black et Open Sans ExtraBold pour le jeu, licence OFL), le logo et l'icône, GSAP, les images du jeu `assets/wyr/` (Microsoft Fluent Emoji 3D, licence MIT : `LICENSE-fluent-emoji.txt`).

Sources des pourcentages (vérifiées le 1/11/2026) :
- Q1 : https://www.would-you-rather-game.com/q/47954/would-you-rather-move-objects-by-thought-or-stop-time : « Out of 29,204 votes, 36% of players chose "Move objects by thought" and 64% preferred "Stop time". »
- Q2 : https://www.jeu-tu-preferes.fr/q/14936/tu-preferes-un-monde-sans-musique-ou-un-monde-sans-tele : « Sur 228 186 votes, 24 % des joueurs ont choisi « Un monde sans musique » et 76 % ont préféré « Un monde sans télé ». » (la même question sur le site anglais, https://www.would-you-rather-game.com/q/47958/, n'a que 69 votes).
