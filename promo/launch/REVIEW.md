# Relecture — film de lancement « façon Lovio » (YouTube 16:9, 60 s, 2/11/2026)

## v6 : planche contact (règle 10 du contexte, 5/11)

Aucune remarque du propriétaire sur la v5 : cette version vient de la nouvelle règle (skill `planche-contact`). Le reste du film ne change pas (temps, voix, musique, mixage, transitions de la v5).

**Planche contact** :
- **Planche de la v5** : `tools/contact_sheet.py`, une image toutes les 0,5 s, 121 images relues une par une. Les moments douteux ont été revus de plus près, une image toutes les 0,1 à 0,15 s, en pleine taille.
- **Problèmes trouvés, et corrections** (temps précis, relevés sur la vidéo) :
  - **30,7 → 31,5 s** : la fenêtre de son clip cachait le « y » de « Beautifully » et le « e » de « edited ». Les mots étaient placés pour 236 px (la hauteur de la fenêtre) au lieu de ses 420 px de large. Ils suivent maintenant les bords de la fenêtre.
  - **31,8 → 32,2 s** : même défaut, la fenêtre passait sur « ready » et « to post ». Les lettres arrivent maintenant à côté d'elle.
  - **43,0 → 44,3 s** : la poussée vers « Make the pack » (×2) coupait les lignes de la carte Export au bord de l'écran de l'ordinateur. La poussée est plus douce (×1,2), la carte reste entière et le curseur suit.
  - **45,0 → 45,5 s** : la carte Export de S9, centrée sur son bouton, coupait « Watch an ad (30 s) » à droite et ses dernières lignes en bas. Elle est maintenant entière et centrée ; l'entrée dans l'écran de l'ordinateur vise son milieu.
  - **46,0 → 48,5 s** : dans le carrousel, les noms des formats étaient coupés au bord de l'image (« Short », « ok »). Un nom s'efface maintenant avant d'atteindre le bord.
  - **46,05 s** : les autres formats sortaient de derrière TikTok en passant sous son accolade. Ils arrivent maintenant à côté.
  - **26,5 s** : « Take 3 » était à moitié caché derrière la carte du milieu, et les trois étiquettes duraient trop peu pour être lues (0,45 s). Elles sont retirées de ce flash.
  - **23,5 → 23,9 s** : la caméra sur la barre de montage (×1,5) coupait les rangées du haut de la carte. Elle pousse maintenant sur toute l'étape (×1,3) et rien n'est coupé.
  - **2,8 → 3,2 s** : « Import your music » sortait par le bord droit. La caméra suit maintenant la pilule pendant qu'elle s'allonge.
  - **3,7 → 3,95 s** : le titre « Your takes, cut on the beat. » apparaissait coupé en haut, pendant le recul de la caméra. Il arrive maintenant une fois entier dans l'image.
  - **15,35 → 15,8 s** : pendant la poussée dans la tablette, ses textes passaient coupés aux bords. Le reste de la tablette s'efface maintenant plus tôt.
  - **44,4 → 44,6 s** : les noms des jours passaient sur les textes de l'écran qui revenaient. Ils s'effacent maintenant quand les vidéos s'envolent, et l'écran revient après.
- **Vérifié et gardé exprès** (des mouvements de moins de 0,5 s, lisibles avant et après) :
  - les textes qui sortent pendant les mouvements rapides de caméra (9,5 s, 15,4 s) ;
  - les vidéos de la semaine qui passent devant la caméra (44,65 s) ;
  - le cristal qui éclate du mot « drop » sur le temps de la musique (55,25 s) ;
  - le nom « Stalak » qui se dévoile de gauche à droite (57,1 s) ;
  - le ciel seul entre le cristal et « What », calé sur la voix (40,0 → 40,4 s).
- **Planche du fichier final** : 121 images relues, **0 problème restant**.
- **Remarque sur l'outil** : chaque image de `tools/contact_sheet.py` est la dernière image avant son horodatage + 0,25 s. Par exemple, l'image « 0:55.0 » montre 55,23 s (filtre `fps` d'ffmpeg, arrondi au plus proche). Les temps ci-dessus ont été relevés image par image.

**`hyperframes check`** : 0 erreur. Les avertissements sont les mêmes sortes que pour la v5 ; « Take 1/2/3 » a disparu.

**Le fichier livré** : `renders/Stalak_lancement_YouTube.mp4` (la v5 est gardée à côté, en `_v5`) :
- 1920 × 1080, 60 i/s, 3600 images, 60,0 s, 62 Mo ; rendu en 15 min 17 s, puis `master.sh` ;
- −14,1 LUFS, crête −1,1 dBFS ;
- aucune image noire, aucun silence ; images figées plus de 1 s : seulement les deux tenues voulues (32,6 s et 52,3 s).

Il a été envoyé au propriétaire et mis dans la Salle de visionnage (`stalak-lancement-v6`).

## v5 (ses retours dans la Salle de visionnage, 3/11 à 0 h 30)

- **Ce qui a changé** : ses 2 remarques (le tableau est dans `SPEC.md`, « v5 »).
  - À 15,7 s, sa vidéo débordait du cadre de l'aperçu. Elle est maintenant posée dans la bordure de l'app, avec son arrondi : sur le téléphone, la tablette et les deux étapes de montage. Les captures ne sont plus étirées.
  - La remarque sur toute la vidéo : 14 transitions sont refaites, chacune avec un élément à l'écran, sur le modèle des transitions de Lovio (revues image par image).

  Les temps des scènes, la voix, la musique et le mixage n'ont pas changé. Un whoosh léger est ajouté à 19,87 s. Le 4e flash (le gros plan de la barre) est remplacé par la carte qui s'élargit jusqu'à l'ordinateur 3D.
- **Regardé image par image** :
  - chaque transition refaite, avant, pendant et après : 11,7 → 16,0 s, 17,8 → 20,5 s, 22,4 → 24,8 s, 25,6 → 29,8 s, 34,2 → 35,3 s, 39,8 → 46,4 s, 48,5 → 50,6 s ;
  - le cadre de l'aperçu à 15,7 s, en pleine taille : bordure encre, cadre crème, ombre du bas, sa vidéo dedans avec le même arrondi ;
  - les raccords qui doivent être invisibles : 16,0 s (la tablette → sa carte : même image, à 1 px près) et 44,75 s (la carte Export de l'ordinateur et celle de S9 au même endroit, plus de texte en double).
- **`hyperframes check`** : 0 erreur. Les avertissements :
  - les mêmes sortes que pour la v4 : des textes lus avec la voix, les cristaux qui tournent en descendant ;
  - nouveaux, voulus : les étiquettes des cases de la grille (0,8 s), « Take 1 / 2 / 3 » (0,45 s) et « On the words » (1,0 s). Ce sont des étiquettes qui passent avec le mouvement.
- **Le son, mesuré avec `mix.py`** (pas écouté) : la même chose que pour la v3 et la v4, la voix vers −15 LUFS et la musique 9 à 11 dB dessous quand elle parle.
- **Le plus fragile** :
  - le passage de l'ordinateur au téléphone (11,7 → 12,4 s) : la page d'accueil se resserre et se floute pendant que l'écran change de forme. S'il le trouve trop rapide, il suffit d'allonger `qaw` / `qah` dans `r3` (`engine.js`) ;
  - les pilules qui volent vers l'étape de montage (34,35 → 34,95 s) se croisent un instant.
- **Le fichier livré** : `renders/Stalak_lancement_YouTube.mp4` (la v4 est gardée à côté, en `_v4`) : 1920 × 1080, **60 i/s**, 3600 images, 60,0 s, 62 Mo ; rendu en 20 min 9 s, puis `master.sh`.
  - Mesuré : −14,1 LUFS, crête −1,1 dBFS ; aucune image noire, aucun silence ; les images figées plus de 1 s sont les deux tenues voulues (« ready ○ to post » à 32,6 s, le panneau tapé à 52,3 s).
  - Son du rendu identique au mixage hors ligne à 1,3–1,4 dB près, dans chaque fenêtre de 4 s (marge de HyperFrames, rattrapée par `master.sh`).
  - Images du fichier rendu vérifiées à 18 instants des transitions : identiques aux images de contrôle.

  Il a été envoyé au propriétaire et mis dans la Salle de visionnage (`stalak-lancement-v5`), avec une réponse sous ses 2 remarques.

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
