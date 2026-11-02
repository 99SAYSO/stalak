# Relecture — film de lancement « façon Lovio » (YouTube 16:9, 60 s, 2/11/2026)

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

Voir la section « Film de lancement » de `docs/handoff/marketing-promo-youtube.md` (rendu, niveau mesuré, crêtes).
