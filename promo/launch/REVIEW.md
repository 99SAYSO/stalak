# Relecture — film de lancement « façon Lovio » (YouTube 16:9, 60 s, 2/11/2026)

## v4 (sa remarque du 2/11 à 20 h 28 : à 53,27 s, « le mot "drop" arrive trop tôt, il est donc sur le texte »)

- **La cause, une erreur de la v3** : j'avais donné au drop de la musique (8,8 s) le nom déjà pris par le mot « drop » de S11 (`K["drop"]`). Le mot s'affichait donc dès que S11 arrivait, sous le panneau tapé. Le drop de la musique s'appelle maintenant `K["beatDrop"]` (`K["beatBack"]` pour le retour du beat), et le mot arrive à 54,6 s, sur la voix.
- **Le fichier** :
  - seul le passage 52 → 56 s a été refait (`render --start 52 --end 56`), puis recollé à l'image près dans la v3, et le son a été gardé ;
  - aux deux raccords, les images sont identiques à celles de la v3 (seul le bruit de compression diffère) ;
  - 60 i/s, 3600 images, 60,0 s, −14,1 LUFS, aucune image noire.
- **Livré** : envoyé au propriétaire, mis dans la Salle de visionnage (`stalak-lancement-v4`), avec une réponse sous sa remarque.

## v3 (ses retours dans la Salle de visionnage, 2/11 à 19 h 13)

- **Ce qui a changé** : ses 2 remarques (le tableau est dans `SPEC.md`, « v3 »).
  - Le « g » coupé.
  - La remarque sur toute la vidéo : fluidité, musique, éléments de Stalak. Pour ça :
    - la musique est l'instru de « neva die » ;
    - le film passe en 60 i/s, sans zooms lents ;
    - il y a des cristaux, des flocons, des stalactites et un éclat de neige sur le drop.
  
  Les temps, la voix, les bruitages et les écrans n'ont pas changé.
- **Le son, mesuré avec `mix.py`** (pas écouté) :
  - la musique est à −25,3 LUFS sous la voix, qui est à −15,0 : 10 dB dessous ;
  - entre les phrases, elle est à −19,7 : 4,7 dB sous la voix ;
  - chaque raccord de l'instru tombe sur une barre : le drop à 8,8 s (+7,5 dB), la coupure à 50,4 s, le retour à 53,6 s (+15 dB), la fin à 55,2 s.
- **Regardé image par image** : chaque élément nouveau, à l'endroit où il apparaît (2,9 à 58,5 s), et le « g » de « song » à 7,1 s en pleine taille.
- **`hyperframes check`** : 0 erreur. Les avertissements sont les mêmes que pour la v2, plus des nouveaux, voulus :
  - les cristaux « tournent sans rester en place » : ils tournent en descendant ;
  - les gros flocons sortent de l'image : ils passent devant et reviennent de l'autre côté.
- **Le fichier livré** : `renders/Stalak_lancement_YouTube.mp4` (la v1 et la v2 sont gardées à côté). Ses caractéristiques :
  - 1920 × 1080, **60 i/s**, 60,0 s, 60 Mo ;
  - rendu en 21 min 53 s, puis `master.sh` ;
  - mesuré : −14,1 LUFS, crête −1,1 dBFS ;
  - aucune image noire, aucun silence, aucune image figée plus de 1 s ;
  - son du rendu identique au mixage hors ligne à 1,3 dB près, partout (marge de HyperFrames, rattrapée par `master.sh`).

  Il a été envoyé au propriétaire et mis dans la Salle de visionnage (`stalak-lancement-v3`), avec une réponse sous ses 2 remarques.

## v2 (ses retours dans la Salle de visionnage, 2/11 à 17 h 03 et 17 h 06)

- **Ce qui a changé** : seulement ses 6 points (le tableau est dans `SPEC.md`, « v2 »). Ce sont 5 remarques à l'image près et une remarque sur toute la vidéo (les transitions). Le reste du film est le même : temps, voix, musique, bruitages, mixage. Seul changement de son : le whoosh de 16 s est avancé à 15,4 s, sur la poussée de la tablette.
- **Regardé image par image** :
  - chaque nouvelle transition, avant, pendant et après ;
  - les passages où rien ne doit se voir, image par image : « song » tapé → « song » de la nuit (6,33–6,50 s), le bleu de l'icône → le bleu de l'écran (9,53–9,63 s), l'aperçu de la tablette → sa carte (15,93–16,03 s), la case YouTube → son clip (25,57–25,60 s) ;
  - ses 5 images remarquées, refaites.
- **`hyperframes check`** : 0 erreur. Il reste 14 avertissements, les mêmes sortes que pour la v1 : des textes lus en même temps que la voix, et des badges « PRO » de 20 px. S'y ajoute l'étiquette « YouTube · Music video » (1,1 s), qui s'efface pendant que la caméra entre dans la case.
- **Le plus fragile** : le panoramique filé entre les appareils dure 0,4 s avec un fort flou. S'il le trouve trop appuyé, il suffit de le raccourcir (`HW` dans `r3`, `engine.js`).
- **Le fichier livré** : `renders/Stalak_lancement_YouTube.mp4` (la v1 est gardée à côté, en `_v1`). Ses caractéristiques :
  - 1920 × 1080, 30 i/s, 60,0 s, 50 Mo ;
  - rendu en 10 min 25 s, puis `master.sh` ;
  - mesuré : −14,1 LUFS, crête −1,2 dBFS ;
  - aucune image noire, aucun silence, aucune saturation ;
  - images du fichier rendu vérifiées à chaque transition : elles sont identiques aux images de contrôle.

  Il a été envoyé au propriétaire et mis dans la Salle de visionnage (`stalak-lancement-v2`), avec une réponse sous chacune de ses 6 remarques.

## Les choix

- **La structure de Lovio, plan par plan** (sa demande : « en t'inspirant fortement de cette vidéo… libre arbitre ») : étincelle → logo-fenêtre → interface en verre → « I have a song. » tapé → nom → l'app sur 3 appareils → une vraie personne et l'import → grille + 4 flashs → ordinateur 3D et « Beautifully [fenêtre] edited » → « ready ○ to post » → pilules → « in any direction » → « What starts as » → carrousel entre accolades → panneau tapé → traînée → « What will you drop today » → cristal → logo. Pas de choix entre 3 histoires : il a laissé le choix libre.
- **Ses couleurs et ses mondes à la place de ceux de Lovio** : ciel de Stalak (neige, gros flocons flous), nuit glacée à aurores, lumière bleue, studio glacé ; verre de glace ; Rubik et le dégradé de glace sur les mots forts.
- **Le vrai produit** : toutes les cartes et tous les boutons sont des captures de l'app construite depuis le dépôt (`capture_ui.py`) ; seuls ses aperçus sont remplacés par ses vraies prises et son clip.
- **Sa phrase, synchro avec sa voix** (« I put gold on my wounds, scars worth millions. », en anglais à sa demande) : dans la case « Lyrics on screen », le 3e flash et l'aperçu de S7. Après Shuffle, une autre prise **au même instant de la chanson** : la phrase continue, comme dans l'app.
- **Le 2e flash** montre ses 3 prises au même instant de la chanson, sans paroles : la prise 1 (15 s) ne contient pas sa phrase, donc la mettre dessus aurait été faux.
- **La musique est coupée sur ses mesures** : elle entre sur son groove (2,4 s), garde sa pause sous « More time making music. », repart sur « What will you drop today » et saute à sa fin pour le logo (sur une mesure, fondu de 40 ms).
- **Aucun rebond, aucune secousse** (sa remarque sur le 1er film).

## Ce qui a été mesuré, et ce qui ne l'a pas été

- `hyperframes check` : 0 erreur (lint, exécution, mise en page, contraste, son). 11 avertissements gardés (ci-dessous).
- Regardé image par image : chaque plan au début et au milieu, chaque coupe, les clics (curseur sur le bon bouton au bon mot), les mots tapés, les accolades, la fin.
- **Le son a été mesuré, pas écouté** (je ne peux pas entendre) : niveau final, crêtes, présence de la voix au-dessus de la musique (voir « Le fichier livré »).
- Personne n'a vérifié : le rendu sur un vrai téléphone, l'avis d'un œil neuf.

## Avertissements gardés exprès

- « Your takes, cut on the beat. » 1,4 s, et sa phrase 2,8 s (S1) : la caméra entre dans la boîte sur la voix ; le titre est dit plus tard par la voix (« Cut on the beat »).
- « I have a son… » 1,0 s : tapé pendant que la voix dit « a song? », lu avec elle.
- La phrase d'aide de la boîte (S4) 1,1 s : déjà vue en S1, remplacée par la pastille du son.
- « Analyzing the takes… » 0,5 s et « All the takes are synced. » 1,0 s : calés sur « syncs them to the music ».
- Paroles « I put gold » 0,7 s et « on my wounds, » 0,4 s : c'est le vrai débit de sa phrase.
- « ready » / « to post » 0,3 s au début de S7 : la suite des mêmes mots de S6 (visibles depuis 31,7 s).
- Badges « PRO » à 20 px : décor, comme dans l'app.

## Le plan le plus faible

- **S6 → S7 (31,6 s et 33,7 s)** : deux passages chargés de 0,2 s (les lettres de « ready » arrivent pendant que « Beautifully / edited » partent ; les pilules sortent pendant que « ready / to post » s'effacent). Avec plus de temps : faire partir les mots avant que les lettres arrivent, et faire glisser les pilules depuis l'interrupteur.
- **S11 (53,9–54,1 s)** : 0,2 s de ciel vide après la traînée.

## Le fichier livré

- `renders/Stalak_lancement_YouTube.mp4` (hors dépôt, envoyé au propriétaire) : 1920 × 1080, 30 i/s, 60,0 s, H.264 + AAC 48 kHz, 54 Mo. Rendu HyperFrames en qualité « delivery », puis son remis à −14 LUFS avec un limiteur (image recopiée sans réencodage, `master.sh`).
- Mesuré sur ce fichier : −14,0 LUFS intégré, court terme max −12,2, crête −1,2 dBTP, aucune saturation, aucun silence ; aucune image noire ; les arrêts d'image de plus de 1 s sont les tenues voulues (le bouton au début, la carte d'analyse, « ready ○ to post », « What starts », le panneau tapé).
- Les niveaux ont été réglés avec `mix.py` (le mixage d'`index.html` refait hors ligne ; sur le 1er rendu, 0,1 dB d'écart avec HyperFrames, fenêtre par fenêtre) : la voix environ 10 dB au-dessus de la musique quand elle parle, la musique 4 à 5 dB sous la voix entre les phrases (comme dans la vidéo de Lovio, mesurée : −18,9 LUFS sans voix contre −15,6 avec), chaque clic, whoosh et pop au niveau de la musique autour ou au-dessus.
