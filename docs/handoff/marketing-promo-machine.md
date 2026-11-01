Statut : EN COURS (le film est en train d'être rendu et vérifié)
Branche : marketing/promo-machine (partie de `marketing/promo-lesson`, qu'elle contient, elle-même partie de `marketing/promo-wyr` et `marketing/promo-one-shape` : l'intégrer après elles, ou à leur place)

Résumé : promo v8 « The Snippet Machine », demandée par le propriétaire le 1/11 : une vidéo en motion design, en 3D isométrique, « pour montrer tes capacités », faite uniquement avec HyperFrames, sur un script original. Trois idées proposées, il a choisi la première (« 1 »).
- **L'idée** : une île de glace flotte dans le ciel bleu ; dessus, une machine en réaction en chaîne monte son snippet toute seule, chaque pièce sur son beat. La caméra la suit d'un seul plan, plonge dans le téléphone (son vrai snippet), puis recule : l'île était l'icône Stalak en 3D, qui se tourne vers nous et devient le logo.
- **Le film** (9:16, 1080 × 1920, 30 i/s, 29 s, anglais américain, sans voix) :
  - « This machine edits your snippet. » : un bloc de glace avec la vraie forme d'onde de sa chanson tombe (« Drop your song. ») ;
  - 8 dominos, un par temps, « 157 BPM » (« It finds every beat. ») ;
  - 3 bobines aux couleurs des prises, avec ses vraies prises sur des cartes (« Drop your takes. ») ;
  - sur le vrai drop du beat, la lame coupe 21 fois, une par demi-temps, dans l'ordre réel de son montage (« Every cut, on the beat. ») ;
  - l'arche de synchro (« Lips stay in sync. »), le tampon « I · GOTTA · BOUNCE » (« Lyrics on screen. »), le canon à neige (« Add the Frost. »), le chrono à 03:00 (« 3 minutes. Not an hour. ») ;
  - la plongée dans le téléphone : son vrai snippet en plein écran, avec sa chanson ;
  - le recul : l'icône Stalak, le logo, stalak.app, « Free · in your browser ».
- **Fait uniquement avec HyperFrames** : tout le décor est dessiné en code (un petit moteur 3D isométrique dans `promo/machine/assets/engine.js`) ; aucune image ni vidéo générée par un autre outil. Pas de voix : titres, musique et sons.
- **Son** : l'instru de « neva die », le drop sur la lame, sa chanson sous son snippet ; des sons sur chaque action (faits par `build.py` ou de la bibliothèque HyperFrames).
- **Rien d'inventé** : 157 BPM, 21 plans, 3 minutes et « an hour » sont les vrais ; pas de concurrent ; ses vraies prises jamais penchées en 3D.

Fichiers touchés :
- `promo/machine/` : `STORYLINES.md`, `SPEC.md`, `REVIEW.md`, `MEDIA.md`, `build.py`, `index.html` et `assets/times.js` (générés), `compositions/film.html`, `assets/engine.js`, polices (Lilita One, Rubik), logo, icône, grain, GSAP, `.gitignore` ;
- `promo/lesson/REVIEW.md` (une erreur corrigée : son snippet dure une mesure de 4 temps, pas 4 mesures) ;
- `docs/STATUS.md` ;
- `docs/handoff/marketing-promo-machine.md`.

Aucun fichier de l'app ni du site n'est touché. Aucune vidéo, aucun son, aucune image tirée des prises dans le dépôt (demande du propriétaire) : le film lui est envoyé directement.

Migration SQL : aucune.

Tests : TESTS

Reste au propriétaire :
- Regarder le film et dire s'il le valide.
- Vérifier la licence de l'instru de « neva die » avant d'en faire une pub (comme pour les v5 à v7).
