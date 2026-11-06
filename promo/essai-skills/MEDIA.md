# Médias de l'essai des skills (6/11/2026)

Aucun fichier vidéo, son ou image tiré des prises n'est dans le dépôt (règle du propriétaire ; pour Earshot : « jamais de fichiers son
dans le dépôt »). Voici ce qui manque et comment le refaire.

| Dans `short/assets/` | Ce que c'est | Comment le refaire |
| --- | --- | --- |
| `takes`, `stills`, `sfx`, `clip`, `audio/inst.mp3`, `audio/song.mp3`, `audio/takes_song.wav`, `audio/vo/` | Liens vers `../../youtube/assets/` : ses prises, l'instru, la voix Flora (Achird), les bruitages de la version d'avant | Voir `../youtube/MEDIA.md` |
| `app/01_home.jpg` … `06_edit.jpg` | La vraie app (le site construit), sur un téléphone Pixel 7, avec son son et ses 3 prises : accueil, son importé (157,1 BPM après le TAP, comme un utilisateur), prises (avant et après l'import), montage | `python3 capture_app.py <public/> <dossier> "<neva die.wav>" take1.mp4 take2.mp4 take3.mp4` avec `TAP=12.145,0.38217 START=12.145 BARS=4 SEED=8` ; `04_takes.jpg` = la capture pleine page coupée à 1100 px CSS |
| `app/edit.mp4` | Le vrai export de l'app (4 mesures, tirage n° 8, filigrane), réduit en 540 × 960 | Export fait pour la vidéo de démo du 6/11 (`docs/marketing/DEMO.md` sur `marketing/audit-6-11`), puis `ffmpeg -vf scale=540:960 -crf 18 -g 10 -an` |
| `audio/vo_kokoro/` | La voix Kokoro (am_fenrir) : 10 WAV + `yt_clips.json` (mots et temps) | Explainroo (`e95232c`) : projet avec les 10 phrases (`script.md`, une scène par phrase, `"voice": "am_fenrir"`, `"speed": 1.0`), `explainroo voice`, puis `python3 make_vo_kokoro.py <projet> short/assets/audio/vo_kokoro` |
| `sfx_es/` | 9 bruitages de la banque d'Earshot (`4ac3d2a`), faits en code, licence MIT : `tap` (click/soft), `tap_up` (click/tink), `ui_pop` (ui_pop/soft), `hit_punch` (cut_hit/punch), `cut_air` (cut_hit/air), `cut_kick` (cut_hit/kick), `shutter` (shutter/dslr), `tick_cut` (fit/click/floss_lid, ajusté sur un enregistrement CC0), `swipe_rise` (swipe/glide, 0,6 s, sommet à 0,3 s) | `earshot sfx render <id> -o short/assets/sfx_es/<nom>.wav` (`--dur 0.6 --apex 0.3` pour `swipe_rise`) |
| `renders/` | Les rendus | `cd short && HYPERFRAMES_BROWSER_PATH=<chrome-headless-shell> npx --yes hyperframes@0.8.223 render -o renders/apres.mp4` |
