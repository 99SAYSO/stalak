# Médias du projet (hors dépôt)

Sur décision du propriétaire, aucun fichier vidéo ni audio n'est dans le dépôt (`.gitignore`). Pour refaire un rendu : remettre les fichiers ci-dessous aux mêmes noms, lancer `python3 build.py`, puis `npx hyperframes render --quality delivery --fps 30 -o renders/before-midnight.mp4` (environ 15 minutes sans carte graphique).

| Fichier | D'où il vient |
|---|---|
| `assets/takes/take1.mp4`, `take2.mp4`, `take3.mp4` | Les 3 prises du propriétaire, identiques à celles de `promo/stalak-explainer` (voir le `MEDIA.md` de `promo/ice-the-beat` pour savoir quel .MOV donne quelle prise). |
| `assets/stills/*.jpg` | Les mêmes images fixes que dans `promo/ice-the-beat`. |
| `assets/thumbs/*.jpg` | Les mêmes 30 images que dans `promo/stalak-explainer`. |
| `assets/audio/inst.mp3` | L'instru de « neva die » du propriétaire, le même fichier que dans `promo/stalak-explainer`. Elle commence à 36,574 s dans l'instru (`c` dans `timing.json`), pour que la basse revienne sur un temps fort au moment des coupes (15,75 s). |
| `assets/audio/vo_raw.wav` | La voix off : Gemini 3.1 Flash TTS dans Flora, voix Achird, lecture « souriante, pub réseaux », choisie par le propriétaire entre deux lectures (0,013 $ chacune). Téléchargée par le propriétaire et renvoyée (l'hôte de Flora est bloqué ici). |
| `assets/audio/vo.wav` | La même voix normalisée en deux passes (`loudnorm` −16 LUFS, −1,5 dBTP), en 48 kHz mono. Les pauses ne sont pas coupées : elles font le rythme du film. |
| `assets/sfx/*.mp3` | Les sons de la bibliothèque fournie avec HyperFrames : click, click-soft, glitch-1, impact-bass-1 et 2, pop, riser, sparkle, typing, whoosh, whoosh-short, whoosh-cinematic. |

Dans le dépôt : les captures de la vraie app (`assets/ui/`), le logo (`assets/brand/`), les polices (`assets/fonts/`), GSAP et three.js en local (`assets/vendor/`), `kit.css`, `kit.js`, `trailer.css`, `trailer.js`, et `times.js` (généré).

Le texte de la voix off (anglais américain) :

> Your song drops at midnight. Your snippet isn't edited. That's forty minutes by hand. Cut. Trim. Sync. Again. You missed the drop. Rewind. Meet Stalak. Drop your song. Add your takes. Stalak cuts them on the beat, in sync with your lips. Add your lyrics. Pick your style. Done. Before midnight. Forty minutes by hand. Three with Stalak. No download. No sign-up. Stalak. Try it free at stalak.app.
