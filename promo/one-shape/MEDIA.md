# Médias du projet (hors dépôt)

Sur décision du propriétaire, aucun fichier vidéo ni audio n'est dans le dépôt (`.gitignore`), ni les images tirées de ses prises (son visage). Pour refaire un rendu : remettre les fichiers ci-dessous aux mêmes noms, lancer `python3 build.py`, puis `npx hyperframes render --quality delivery --fps 30 -o renders/one-take.mp4`.

| Fichier | D'où il vient |
|---|---|
| `assets/takes/take1.mp4`, `take2.mp4`, `take3.mp4` | Les 3 prises du propriétaire, identiques à celles de `promo/ice-the-beat` (temps de la prise = temps du son − 1,452 s). |
| `assets/audio/song.mp3` | « neva die » de 99Sayso, avec sa voix (`60884c1c-neva_die_v3_mp3cut.net.mp3`). |
| `assets/audio/inst.mp3` | L'instru de « neva die » (« free tana untiljapan type beat wakeup »). Calée à l'échantillon : instru = son + 23,13007 s (corrélation 0,99 sur les basses). Licence à vérifier avant une pub. |
| `assets/audio/vo/vo01.wav` à `vo14.wav` | La voix off : Gemini 3.1 Flash TTS dans Flora, voix Achird, une lecture (0,013 $, run `run_m17dkqycysna0dgp53gb40fwch8hcg6m`), téléchargée par le propriétaire. Limitée puis normalisée en deux passes (−16 LUFS, −1,5 dBTP), coupée en 14 phrases (14 silences d'au moins 1,2 s ; durées et nombre de syllabes vérifiés). `vo_clips.json` : début, durée et décalage de chaque phrase. |
| `assets/sfx/*.mp3` | Les sons de la bibliothèque fournie avec HyperFrames (`CREDITS.md`). `peaks.json` : où chaque son frappe. |
| `assets/stills/freeze_hook.jpg` | L'image de la prise 1 à 10,618 s (la vidéo qui se fige au clic). |
| `assets/stills/f_none.jpg`, `f_frost.jpg`, `f_film.jpg`, `f_bw.jpg`, `thumb_src.jpg` | Les vignettes de la rangée de filtres, tirées de la prise 1 à 5 s (approximations des filtres de l'app pour des vignettes ; l'aperçu, lui, utilise le vrai traitement Frost). |
| `assets/stills/take*_pose.jpg` | Images de référence (non utilisées dans le film). |

Dans le dépôt : `build.py`, `index.html` et `assets/times.js` (générés), `compositions/film.html`, `assets/engine.js` (le moteur), les polices, le logo, GSAP.

Le texte de la voix off (anglais américain), une phrase par fichier :

> Still editing snippets by hand? / Drop your song. / Stalak finds the beat. / Add your takes. / They sync up by themselves. / Paste your lyrics. / Then it cuts between your takes, on the beat. / Shuffle for a new edit. / Pick a look. / And export. / Forty minutes by hand. / Three with Stalak. / Free, right in your browser. / Stalak dot app.
