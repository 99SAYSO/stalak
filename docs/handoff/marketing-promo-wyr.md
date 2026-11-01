Statut : PRÊT (le film est fini et envoyé au propriétaire ; dans le dépôt, seulement les sources et les notes : rien à intégrer dans l'app ni le site)
Branche : marketing/promo-wyr (partie de `marketing/promo-one-shape`, qu'elle contient : l'intégrer après elle, ou à sa place)

Résumé : promo v6 « Would you rather », l'idée du propriétaire (1/11).
- **Ce qu'il voulait** : une vidéo qui commence comme un jeu « Tu préfères » de TikTok, pour que les gens croient que c'en est un. Deux questions normales (voix, chrono de 3 s, pourcentage de réponses), puis la 3e : « une heure de montage ou 3 minutes avec Stalak ? », et BOOM, la vidéo explose en neige et la pub Stalak se lance aux couleurs du site, avec sa phrase « bah oui, la réponse c'est forcément Stalak… ». En anglais, sur son image rouge / bleu ; textes, images et pourcentages trouvés par Marketing.
- **Le film** (9:16, 1080 × 1920, 30 i/s, 45 s, anglais américain) :
  - Le jeu (0-18,3 s) : son fond redessiné net (son fichier fait 415 × 739) aux mêmes couleurs, « OR » au milieu. Q1 « Stop time » / « Move things with your mind » → 64 % / 36 % (29 204 votes). Q2 « A world without music » / « A world without TV » → 24 % / 76 % (228 186 votes). Les options sont à l'écran dès le début, la voix les lit, un chrono de 3 s (3, 2, 1, tic-tac sur le temps), puis les pourcentages (le gagnant en vert) et le nombre de votes.
  - Q3 « Spend an hour editing your snippet » / « 3 minutes with Stalak » (la vraie icône) : le chrono part comme les autres et, pendant le « 2 », sur le vrai drop du beat : BOOM. L'écran se fend en 137 éclats qui givrent et deviennent de la neige ; le cercle « OR » devient un disque de glace en 3D.
  - « Well, yeah. The answer is obviously Stalak. » : le disque se retourne et devient l'icône. « The days of spending an hour editing a snippet are over. » : un sablier apparaît puis éclate en neige. « Now, you just drop your song. » : l'icône devient la zone d'import et la démo de la v5 « One take » reprend (le fichier tombe sur « drop »).
  - La démo de la v5, telle quelle (son 157 BPM, prises, synchro, paroles, montage de 21 plans, Shuffle, Frost, export, son snippet sur le drop), puis la fin : l'icône, le logo, « Free · in your browser · no sign-up », stalak.app. Le passage « 40 min by hand / 3 min with Stalak » est retiré : la question 3 dit déjà « an hour » contre « 3 minutes ».
- **Les pourcentages sont réels** : votes des joueurs de would-you-rather-game.com et de sa version française d'origine, Jeu Tu Préfères (liens et phrases exactes dans `promo/wyr/MEDIA.md` et `build.py`).
- **Images** : Microsoft Fluent Emoji 3D (licence MIT, fichier de licence joint) ; aucune photo de personne ; l'icône et le logo officiels.
- **Voix** : Gemini 3.1 Flash TTS dans Flora, voix Achird (la même que la v5), une nouvelle lecture de 6 phrases (0,013 $, accord du propriétaire), téléchargée par lui ; + 10 phrases de la v5. Les questions sont jouées 1,12 × plus vite (rythme des jeux TikTok) ; pas de blanc après le BOOM.
- **Son** : l'instru de « neva die » en continu sous le jeu (son intro), coupée un demi-temps avant le BOOM, qui tombe sur le vrai drop du beat ; puis la musique de la v5. Tic-tac, pops, ping, verre qui casse (faits ici ou bibliothèque HyperFrames).

Fichiers touchés :
- `promo/wyr/` : `SPEC.md`, `REVIEW.md`, `MEDIA.md`, `vo_cut.py`, `build.py`, `index.html` et `assets/times.js` (générés), `compositions/film.html`, `assets/engine.js`, images du jeu `assets/wyr/`, polices (Nunito Black, Open Sans ExtraBold en plus de celles de la v5), logo, icône, GSAP, `.gitignore` ;
- `docs/STATUS.md` ;
- `docs/handoff/marketing-promo-wyr.md`.

Aucun fichier de l'app ni du site n'est touché. Aucune vidéo, aucun son, aucune image tirée des prises dans le dépôt (demande du propriétaire) : le film lui est envoyé directement.

Migration SQL : aucune.

Tests : `hyperframes lint` (0 erreur, 0 avertissement) et `hyperframes check` (réussi) ; rendu final regardé (le jeu, le BOOM image par image, une image par temps ensuite, chaque changement d'état, la planche téléphone), aucune image noire ; son mesuré : −15,0 LUFS, crête −1,0 dB (détail dans `promo/wyr/REVIEW.md`).

Reste au propriétaire :
- Regarder le film et dire s'il le valide.
- Vérifier la licence de l'instru de « neva die » avant d'en faire une pub (comme pour la v5).
- Dire si 45 s c'est bon, ou s'il faut enlever la question 2 (−6,9 s).
