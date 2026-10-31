# Médias du projet (hors dépôt)

Sur décision du propriétaire, aucun fichier vidéo ni audio n'est dans le dépôt (`.gitignore`). Le modèle 3D de la mascotte n'y est pas non plus : c'est un fichier de 5,4 Mo, et le dépôt est public.

Pour refaire un rendu :
1. remettre les fichiers ci-dessous aux mêmes noms ;
2. lancer `python3 build.py` ;
3. lancer `npx hyperframes render --quality delivery --fps 30 -o renders/unfreeze.mp4`.

Le rendu prend environ 40 minutes sans carte graphique, à cause de la 3D réaliste.

| Fichier | D'où il vient |
|---|---|
| `assets/takes/take1.mp4`, `take2.mp4`, `take3.mp4` | Les 3 prises du propriétaire. Ce sont les mêmes fichiers que dans `promo/stalak-explainer` et `promo/ice-the-beat` (voir le `MEDIA.md` de `ice-the-beat` pour savoir quel .MOV donne quelle prise). |
| `assets/stills/*.jpg` | Les mêmes images fixes que dans `promo/ice-the-beat`. |
| `assets/thumbs/p01.jpg` à `p30.jpg` | Les mêmes 30 images que dans `promo/stalak-explainer` (la recette est dans son `MEDIA.md`). |
| `assets/audio/music.wav` | L'instru de « neva die » (`inst.mp3` de `promo/stalak-explainer`), prise à partir de 40,095 s pendant 28 s, en 48 kHz stéréo. Avant l'explosion (0 à 3,5 s), elle passe dans un filtre passe-bas : l'instru est étouffée, puis elle s'ouvre sur le premier temps fort. Le fichier exact a été envoyé au propriétaire. |
| `assets/sfx/*.mp3` | Les sons de la bibliothèque fournie avec HyperFrames : click, click-soft, glitch-1, glitch-2, impact-bass-1, impact-bass-2, key-press, notification, pop, riser, sparkle, typing, whoosh, whoosh-cinematic, whoosh-short. |
| `assets/mascot3d/mascot.glb` | La mascotte en 3D, faite avec Meshy 7 dans Flora à partir du dessin de l'app : en couleurs, avec un squelette et l'animation « FunnyDancing_01 ». Le propriétaire a le fichier : c'est lui qui l'a téléchargé et envoyé. |

Dans le dépôt :
- les captures de la vraie app (`assets/ui/`) ;
- le logo (`assets/brand/`) ;
- les images de la mascotte tirées de l'app (`assets/mascot/`) ;
- les polices de l'app (`assets/fonts/`) ;
- GSAP et three.js 0.184, copiés en local (`assets/vendor/`), car le CDN est bloqué ici ;
- `kit.css`, `kit.js` et `beats.js`.

Toutes les textures de la glace sont calculées dans la page (bruit avec une graine fixe) : il n'y a aucune image à fournir pour la 3D.
