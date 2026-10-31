# Médias du projet (hors dépôt)

Sur décision du propriétaire, aucun fichier vidéo ni audio n'est dans le dépôt (`.gitignore`). Pour refaire un rendu, il faut les remettre aux mêmes noms, puis lancer `python3 gen_index.py` et `npx hyperframes render`.

| Fichier | D'où il vient |
|---|---|
| `assets/takes/take1.mp4`, `take2.mp4`, `take3.mp4` | Les 3 prises du propriétaire, identiques à celles de `promo/ice-the-beat` (voir son `MEDIA.md` pour savoir quel .MOV donne quelle prise). |
| `assets/stills/*.jpg` | Les mêmes images fixes que dans `promo/ice-the-beat`. |
| `assets/thumbs/p01.jpg` à `p30.jpg` | 30 images des prises (200 × 356 px), à des moments différents. Pour i de 0 à 29 : prise = [2, 1, 3][i mod 3] ; t = 0,4 + ((i × 7,3) mod d), où d = 14,5 s pour la prise 1 et 25 s pour les prises 2 et 3. Commande : `ffmpeg -ss t -i takeN.mp4 -frames:v 1 -vf scale=200:356 -q:v 4 p(i+1).jpg`. |
| `assets/audio/inst.mp3` | L'instru de « neva die » envoyée par le propriétaire (`free-tana-untiljapan-type-beat-wakeup`, 134,8 s). |
| `assets/audio/vo.wav` | La voix Achird de Flora (`V2___Voix_2_Achird.wav`). Les pauses de plus de 0,26 s sont ramenées à 0,20 s (au milieu de chaque pause, fondus de 8 ms), puis la voix est normalisée en deux passes (`loudnorm` −16 LUFS, −1,5 dBTP), en 48 kHz mono. Version finale : du silence est ajouté à 3 endroits de ce fichier (temps dans le fichier : 21,435 s +0,30 s ; 22,335 s +0,24 s ; 23,163 s +0,34 s, avec des fondus de 5 ms), soit 39,22 s au total. |
| `assets/sfx/*.mp3` | Les sons de la bibliothèque fournie avec HyperFrames (impact-bass-1 et 2, pop, sparkle, whoosh, whoosh-short, riser). |

Dans le dépôt : les captures de la vraie app (`assets/ui/`, en JPEG), le logo (`assets/brand/`), les images de la mascotte tirées de l'app (`assets/mascot/`), les polices de l'app (`assets/fonts/`), GSAP (`assets/vendor/`), `kit.css` et `kit.js`.
