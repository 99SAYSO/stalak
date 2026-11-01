# « One take » (promo v5) : REVIEW

## Ce que c'est
L'idée A choisie par le propriétaire le 1/11 : une seule forme 3D qui ne coupe jamais et devient chaque étape de la vraie app, aux couleurs de Stalak, avec une voix off (voir `SPEC.md`, `STORYLINES.md`, `REFERENCE.md`).
- 1080 × 1920, 30 i/s, 29,43 s (883 images), anglais américain.
- Fait avec HyperFrames 0.8.223. Tout le visuel est un seul moteur, `assets/engine.js` : chaque image est calculée à partir du temps (ressorts fermés, aucune animation qui dépend de l'image précédente). `build.py` place la musique, la voix, les sons et les vidéos sur la grille des temps de « neva die » (157 BPM).

## La synchro (le défaut de la v4)
- La voix off a été générée en une lecture puis coupée en 14 phrases : 14 silences d'au moins 1,2 s, et pour chaque morceau une durée et un nombre de syllabes cohérents avec sa phrase. Chaque phrase commence à un temps choisi ; l'image est réglée sur ces mêmes temps. Il n'y a plus rien à deviner.
- Musique : son et instru calés à l'échantillon (instru = son + 23,13007 s, corrélation 0,99 sur les basses, 0,92 sur tout le spectre). Aux 3 raccords (0:01,53, 0:18,34, 0:22,93), aucune coupure dans le volume mesuré par tranches de 10 ms.
- Lèvres : temps de la prise = temps du son − 1,452 s (le calage de la v1, validé). Le snippet du début et celui du drop jouent la vraie voix du propriétaire au bon endroit, avec le vrai montage de Stalak.

## Contrôles
- `lint` : 0 erreur.
- Brouillon 1 rendu en entier (19 min 35 s) et regardé : une image par temps (76), une bande de 12 images autour de chaque changement d'état, la planche à 360 px de large. Son : −14,9 LUFS, crête −1,6 dBFS.
- Relecture par un relecteur indépendant (agent séparé, qui n'a pas fabriqué le film) : notes ci-dessous.

## Corrigé après le brouillon 1
1. 1,9-3,5 s trop calme pendant « Still editing snippets by hand? » : le fichier arrive plus tôt avec le curseur, des flocons tombent dans la zone d'import.
2. Une image noire dans l'aperçu à 15,3 s (les vidéos s'arrêtaient avant la fin du fondu) : prolongées.
3. La barre de montage était noire tant qu'elle se remplissait : fond clair, comme l'app.
4. La carte de montage avait un grand vide : les deux vrais boutons de l'app, « ▶ Play » et « ↻ Shuffle », sont là dès le début.
5. Plus de 3D : un coup de 3D (bascule amortie) à chaque transformation, pendant que le contenu est flou.
6. La musique remontait un instant entre deux phrases rapprochées (effet de pompe) : elle reste baissée quand les phrases sont à moins de 0,9 s.
7. Le snippet du drop était 8-10 dB plus fort que le reste : baissé.
8. « 40 min » compte de 0 à 40 pendant que la voix le dit, puis redescend à 3.
9. Le passage de la vidéo figée à la zone d'import passait par une carte foncée : la carte s'éclaircit plus tôt.
