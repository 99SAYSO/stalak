# Médias de la vidéo YouTube « The edit nobody sees » et de son Short (2/11/2026)

Aucun fichier vidéo ou audio n'est dans le dépôt (demande du propriétaire) : ils sont listés ici, avec leur origine, pour pouvoir les remettre.

| Fichier (dans `assets/`) | D'où il vient |
| --- | --- |
| `audio/vo/yt_raw.wav` | La voix off : Gemini 3.1 Flash TTS dans Flora, voix **Achird**, une seule lecture du texte de l'histoire A (run `run_m17cx2bneez1227r8g9nrkpnsh8hc180`, 0,013 $), téléchargée par le propriétaire le 2/11 (`97444003-gen-m17cx2bneez1227r8g9nrkpnsh8hc180-0.wav`). |
| `audio/vo/yt_norm.wav`, `L01.wav` à `L17.wav`, `S09.wav`, `yt_clips.json`, `yt_pieces.json` | Faits par `vo_align.py` (les 38 morceaux de parole et leurs mots, alignement pocketsphinx) puis `vo_cut.py` : limitée puis normalisée en deux passes (−16 LUFS, −1,5 dBTP, 48 kHz mono), coupée en 17 phrases ; **les silences de 1 à 2,8 s laissés par la synthèse sont ramenés à 0,04–0,2 s** (demande du propriétaire). `S09` = « Add a few takes. » seul, pour le Short. |
| `audio/inst.mp3`, `audio/song.mp3` | L'instru et un extrait de « neva die » (99Sayso), repris de `promo/one-shape` (grille mesurée : 157 BPM, voir `../one-shape/SPEC.md`). **À vérifier par le propriétaire : la licence de l'instru doit permettre YouTube** (sinon réclamation Content ID possible). |
| `takes/take1.mp4` à `take3.mp4` | Ses 3 prises de « neva die » (1080 × 1920, 30 images/s, 15 s), reprises de `promo/one-shape`. Calage : temps de la prise = temps de la chanson − 1,452 s. |
| `stills/t1_00.jpg` … `t3_13.jpg` | Images de ses prises (270 × 480, une par seconde à partir de 0,5 s), reprises de `promo/lesson`. `stills/cu.jpg` : la prise 3 à 5,62 s (540 × 960), l'image où la caméra plonge. |
| `sfx/*.mp3`, `sfx/CREDITS.md` | Bruitages de la bibliothèque HyperFrames (licence Pixabay, voir `CREDITS.md`). |
| `sfx/slice.wav`, `thud.wav`, `scatter.wav` | Faits par `build.py` (synthèse) : le cutter, une fiche qui tombe, des morceaux qui s'éparpillent. `tick.wav`, `tock.wav`, `shatter*.wav` : faits par `../wyr/build.py`. |
| `brand/icon.svg`, `brand/wordmark.svg`, `brand/grain.png`, `fonts/` | La marque Stalak et ses polices (Lilita One, Rubik), reprises de `promo/lesson`. |

Le Short (`short/`) utilise les mêmes fichiers : ses dossiers de médias sont des liens vers `../assets/`.
