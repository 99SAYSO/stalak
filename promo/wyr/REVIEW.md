# « Would you rather » (promo v6) : REVIEW

## Ce que c'est
L'idée du propriétaire (1/11) : un jeu « Tu préfères » de TikTok dont la 3e question est un piège, puis la promo Stalak (voir `SPEC.md`).
- 1080 × 1920, 30 i/s, 45,00 s (1350 images), anglais américain.
- Fait avec HyperFrames 0.8.223. Tout le visuel est un seul moteur, `assets/engine.js` (celui de la v5, `../one-shape`) : chaque image est calculée à partir du temps. Le jeu est dessiné dans un canvas (fond, options, chrono, votes), puis découpé en éclats au BOOM. `build.py` place la musique, la voix, les sons et les vidéos sur la grille des temps de « neva die » (157 BPM).

## Les choix faits pour le propriétaire (il a dit « à toi d'écrire le texte, mettre les images, les % »)
| Question | Pourquoi |
|---|---|
| Q1 « Stop time » / « Move things with your mind » (64 % / 36 %) | Une question de super-pouvoir, le classique des jeux TikTok : elle accroche dès la première image. Elle parle déjà du temps, comme la question 3. Votes réels (29 204). |
| Q2 « A world without music » / « A world without TV » (24 % / 76 %) | Une question sur la musique pour des rappeurs : 76 % gardent la musique. Votes réels (228 186, version française d'origine du même jeu). |
| Q3 « Spend an hour editing your snippet » / « 3 minutes with Stalak » | Le piège, avec « an hour » comme dans son texte (« 1h à faire un montage »). |

- Le passage de la v5 « 40 min by hand / 3 min with Stalak » est retiré : il aurait contredit « an hour » de la question 3, qui fait déjà la comparaison.
- Q3 : le chrono part comme pour les deux autres et explose pendant le « 2 » (ce que j'avais proposé ; le propriétaire voulait « pas de chrono de 3 s » : il ne va pas au bout).
- Le cercle « OR » de son image est la forme unique de la v5 : plat et noir pendant le jeu, il devient de la glace au BOOM puis l'icône de Stalak.

## Contrôles
- `lint` : 0 erreur, 0 avertissement. `check` : réussi. Restent les avertissements de lecture de la v5 sur les textes d'interface secondaires (la voix porte le message), et « canvas au bord » pour le fond du jeu (voulu : il remplit l'écran).
- Images de contrôle avant le rendu : chaque question (début, chrono 3 / 2, résultat, transition), le BOOM (fissures, éclats, neige), le retournement en icône, le sablier, la zone, la démo, le repli final et la fin.
- Corrigé pendant ces contrôles : le panneau « interdit » cachait le casque et la télé (remplacé par un anneau rouge barré dessiné par-dessus l'objet) ; « 36 % » et « 76 % » touchaient le texte du dessous ; pendant les retournements, le dos de la forme était un bloc noir (il montre maintenant l'icône) ; le repli final tournait en plein écran (il se replie d'abord, puis tourne).
- Son, avant le rendu (mélange recalculé hors ligne à partir de `index.html`) : la musique du jeu était trop basse pendant le chrono (−23,6 LUFS) ; montée à 1,0 entre les phrases et 0,5 sous la voix, tic-tac plus fort ; les sons du BOOM baissés.

## Rendu final (1/11, 16 h)
- Fichier : 1080 × 1920, 30 i/s, 1350 images, 45,0 s, H.264 + AAC, 39,9 Mo, qualité « delivery » (25 min de rendu). Le son est ensuite monté de 1,1 dB avec un limiteur à −1 dB (l'image n'est pas réencodée). Envoyé au propriétaire (`stalak-would-you-rather.mp4`), pas dans le dépôt.
- **Regardé** : le jeu (chaque question : début, « or », chrono 3 / 2 / 1, résultat, transition), le BOOM image par image (36 images), une image par temps après le BOOM (70), une bande de 12 images autour de chacun des 19 changements d'état, la planche à la largeur d'un téléphone. La première image montre déjà la question 1 ; aucune image noire (vérifié aussi par ffmpeg) ; le fichier tombe sur « drop » ; le disque devient l'icône sur « Stalak ».
- **Mesuré, pas écouté** (je ne peux pas entendre le son) : −15,0 LUFS au total, crête −1,0 dB (comme la v5). Avant le réglage final : le jeu −17,3 LUFS, le BOOM −13,1, les réponses −16,6, la démo −15,8, son snippet −11,3, la fin −16,3 : le jeu est un peu plus calme (l'intro du beat, sans batterie) et le BOOM arrive avec le drop. Aucun blanc de plus de 0,25 s.

## Les points les plus faibles
- Le film dure 45 s : 18 s de jeu (2 questions avec un vrai chrono de 3 s, comme demandé) avant la marque. Si c'est trop long pour une pub, on peut enlever la question 2 (−6,9 s).
- Les questions sont lues 1,12 × plus vite que les autres phrases (rythme des jeux TikTok) : à vérifier à l'oreille.
- Au repli final, une image montre le côté sombre de la forme pendant qu'elle tourne (1 image sur 30).
- Comme dans la v5, la carte du montage apparaît vide une fraction de seconde avant son contenu.
