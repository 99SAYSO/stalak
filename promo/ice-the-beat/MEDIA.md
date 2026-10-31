# Médias du projet (hors dépôt)

Sur décision du propriétaire, aucun fichier vidéo ni audio n'est dans le dépôt (`.gitignore`). Pour refaire un rendu, il faut remettre ces fichiers dans `assets/`, aux mêmes noms.

## Vidéos : `assets/takes/`

Fichiers H.264 1080 × 1920 à 30 i/s, sans son, transcodés depuis les 3 vidéos .MOV que le propriétaire a envoyées dans la conversation :

| Fichier | Source | Durée |
|---|---|---|
| `take1.mp4` | `a8bac8bb-31f1b9fa43414ccf8b143fe32af981f4.MOV` | 15,02 s |
| `take2.mp4` | `8c8c1dfb-77f1b536aa1b40858fe73aabc005504f.MOV` | 25,57 s |
| `take3.mp4` | `e93627d7-ce930b56685b437dbc9018a8ef9f9b6a.MOV` | 25,57 s |

Exemple : `ffmpeg -i SOURCE.MOV -an -c:v libx264 -crf 16 -pix_fmt yuv420p -r 30 assets/takes/take1.mp4`

## Images fixes : `assets/stills/`

Ce sont des images extraites des prises :
- `t1_000`, `t2_000`, `t3_000` : 1re image de chaque prise ;
- `t1_freeze`, `t2_freeze`, `t3_freeze` : image à 1,448 s de chaque prise (coupe à 2,9 s dans le film) ;
- `s6_a`, `s6_b`, `s6_c`, `s6_last` : trois moments du montage et sa dernière image (scène 6).

## Son : `assets/audio/`

- `song.mp3` : « neva die » de 99Sayso (`60884c1c-neva_die_v3_mp3cut.net.mp3`).
- `vo/vo01.wav` à `vo/vo12.wav` : la voix off choisie (`Fun_Video_App.wav`, faite avec Flora et le modèle Google Gemini TTS). Elle est d'abord normalisée en deux passes (`loudnorm`, −16 LUFS, −1,5 dBTP), puis coupée ainsi (`début` = position dans le fichier source) :

| Fichier | Texte | Début | Durée | Place dans le film |
|---|---|---|---|---|
| vo01 | Three takes. | 0,25 | 1,03 | 1,45 |
| vo02 | One track. | 1,85 | 0,89 | 2,95 |
| vo03 | No editing skills. | 3,16 | 1,44 | 3,85 |
| vo04 | Drop in your track. | 5,26 | 1,09 | 5,35 |
| vo05 | Add your takes. | 6,72 | 0,91 | 6,78 |
| vo06 | Stalak syncs your lips and cuts to the beat. | 7,73 | 2,97 | 7,88 |
| vo07 | Lyrics, effects, your vibe. | 11,20 | 2,55 | 11,00 |
| vo08 | Your video's ready in about a minute. | 14,13 | 1,65 | 15,20 |
| vo09 | No download. | 16,18 | 0,89 | 18,25 |
| vo10 | No sign-up. | 17,08 | 0,92 | 19,78 |
| vo11 | Stalak. | 18,25 | 0,66 | 21,33 |
| vo12 | Make your next snippet hit different. | 19,22 | 2,00 | 22,30 |

## Effets sonores : `assets/sfx/`

Sons de la bibliothèque fournie avec HyperFrames (skill media-use) : `impact-bass-1`, `impact-bass-2`, `whoosh`, `whoosh-short`, `sparkle`, `pop`, `riser` (.mp3).

## Fichiers déjà dans le dépôt

- Captures de la vraie app : `assets/ui/`.
- Logo : `assets/brand/`.
- Polices : `assets/fonts/`.
- GSAP : `assets/vendor/`.
