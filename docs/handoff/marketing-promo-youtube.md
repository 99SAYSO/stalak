# Compte rendu — branche `marketing/promo-youtube` (Marketing & croissance)

Statut : PRÊT (documents et sources des vidéos seulement ; rien à intégrer dans l'app ni le site)

## La demande

Le propriétaire, 2/11 à 0 h 09 : une vidéo YouTube de présentation de Stalak (16:9, environ 1 min, motion design, voix off, mouvement, zooms, 3D, déplacements de caméra ; créer le besoin : les problèmes, puis la solution ; tout le monde doit comprendre comment ça marche), plus un YouTube Short qui la condense. À 0 h 14 il a choisi l'histoire A « The edit nobody sees » (parmi 3, `promo/youtube/STORYLINES.md`) et la voix Achird (Flora, 0,013 $ payés). À 0 h 20, avec le fichier de la voix : « raccourcis les blancs trop longs, que ça reste dynamique ».

## Ce qui est fait

- **Le film (16:9, 1920 × 1080, 61,2 s)** : `promo/youtube/`.
  - Le problème, sur un tapis de découpe en 3D : ses 3 vraies prises en pellicules, le cutter qui les découpe en morceaux, une prise qui glisse contre la bande du son sans jamais tomber en face (« +27 frames »), une coupe à côté du temps (« OFF BEAT »), la plongée dans une image qui joue (la bouche et le mot « bounce » qui se décalent : « 1 frame off », « out of sync »), puis TUE, WED, THU, FRI : une nouvelle pile chaque jour.
  - Sur le drop de son instru (« This is Stalak. »), tout est aspiré, le tapis s'ouvre sur le ciel de Stalak, l'icône tombe.
  - La vraie interface, avec ses vrais mots : Pick your song (la bande du son tombe dans « Import your music », « Tempo detected: 157 BPM. »), Add your takes (Import my videos, Film now, Take 1/2/3), les prises calées sur la musique (« All the takes are synced. »), la barre « Your edit » coupée sur les temps pendant que l'aperçu passe d'une prise à l'autre, le cadenas de la synchro des lèvres, « Lyrics on screen » (Paste my lyrics, Sync by tapping, TAP), le rythme Chill → Punchy qui recoupe la barre, Export (vertical TikTok, Reels, Shorts ; clip YouTube 16:9 avec le badge PRO), le pack (badge Creator Plus, 30 vidéos qui sortent de la chanson, « Pack ready: 30 videos, all different. », puis une par jour MON → SUN).
  - Le résultat : trois vidéos du pack (MON, TUE, WED) sur sa chanson, chacune coupée à son rythme, toujours trois prises différentes à l'écran, « I gotta bounce » en même temps sur les trois.
  - « You film. Stalak edits. », puis l'icône, le logo, stalak.app, « Free · No download · No sign-up ».
- **Le Short (9:16, 1080 × 1920, 29,8 s)** : `promo/youtube/short/`, même moteur en mode portrait (cartes de l'app mises en hauteur), sous-titres incrustés (beaucoup regardent sans le son). Texte : « Now comes the part nobody sees: the edit. » → le temps raté → les lèvres décalées → une pile par jour → « This is Stalak. » sur le drop → le son → les prises → calées et coupées sur le temps → 2 mesures de sa chanson → « You film. Stalak edits. » → stalak.app.
- **La voix** : les silences de 1 à 2,8 s laissés par la synthèse sont ramenés à 0,04–0,2 s dans une phrase et ~0,3 à 0,4 s entre les phrases (`vo_cut.py`).
- Son : sa chanson et son instru (grille mesurée, 157 BPM), un bruitage par action, voix mesurée 7,5 LU au-dessus de la musique ; mastering −14 LUFS.
- Les deux vidéos ont été envoyées au propriétaire dans la conversation. **Aucun fichier vidéo ou audio dans le dépôt** (`MEDIA.md` dit d'où vient chaque fichier).

## Fichiers

- `promo/youtube/STORYLINES.md` (les 3 idées), `SPEC.md` (le film plan par plan, et ce qui a changé en route), `REVIEW.md` (contrôles), `MEDIA.md`.
- `promo/youtube/vo_align.py`, `vo_cut.py` (la voix), `build.py` (le film), `build_short.py` (le Short), `assets/engine.js` (le moteur, 16:9 et 9:16), `compositions/film.html`, `index.html`, `assets/times.js` (générés).
- `promo/youtube/short/` : `index.html`, `compositions/film.html`, `assets/times.js` (générés par `build_short.py`), `assets/engine.js` (copie du moteur) ; les dossiers de médias sont des liens vers `../assets/`.

## SQL, tests

Aucun (pas de code du site ni de l'app). Contrôles HyperFrames : `lint` 0 erreur pour les deux ; `check` : une seule erreur de mise en page, voulue (carte des paroles par-dessus la carte de montage, marquée).

## Pour le propriétaire

- **Avant de publier sur YouTube : vérifier que la licence de l'instru de « neva die » autorise YouTube** (sinon réclamation Content ID possible).
- Titre, description, miniature et publication sur la chaîne YouTube Stalak (quand elle existe) : Marketing peut les préparer à sa demande.
