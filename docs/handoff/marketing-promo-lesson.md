Statut : PRÊT (le film est fini et envoyé au propriétaire ; dans le dépôt, seulement les sources et les notes : rien à intégrer dans l'app ni le site)
Branche : marketing/promo-lesson (partie de `marketing/promo-wyr`, qu'elle contient, elle-même partie de `marketing/promo-one-shape` : l'intégrer après elles, ou à leur place)

Résumé : promo v7 « Your snippet is the problem », demandée par le propriétaire le 1/11 sur le modèle d'une vidéo qu'il a envoyée (une explication de 28 s sur X). Script proposé avant de faire, validé (« oui c'est bon »), avec le look clair aux couleurs de Stalak et une nouvelle voix (0,013 $).
- **L'idée** : une explication calme, racontée par une voix dont les mots s'écrivent à l'écran un par un, sur des cartes blanches qui arrivent penchées et se posent (la façon de raconter de l'exemple ; rien de son contenu, de sa marque ni de ses images).
- **Le film** (9:16, 1080 × 1920, 30 i/s, 30,6 s, anglais américain) :
  - « Your song isn't the problem. Your snippet is. » (dès la 1re image) ;
  - le snippet de tout le monde : 3 snippets gris identiques (« 1 take », « 0 cuts », « no lyrics »), un fil qu'on fait défiler, des vues plates, 0 replays, 0 shares ;
  - « The snippets people replay are built differently. » : un point qui monte et frappe sur le vrai drop du beat ;
  - les 3 choses, dans le style de l'app (contour encre, glaçons) : « Cut on the beat », « Switch between takes », « Lyrics on screen » ;
  - « That used to take an hour of editing. Stalak does it in three minutes. » : les 3 pastilles deviennent l'icône, qui s'ouvre en la vraie carte de montage (ses prises, 21 plans) ;
  - son vrai snippet en grand, avec sa chanson (« I gotta bounce ») ;
  - « Drop your song. Post it everywhere. » (« everywhere » entouré à la main), puis le logo et stalak.app.
- **Voix** : Gemini 3.1 Flash TTS dans Flora, voix Achird (la même que les v5 et v6), une lecture des 9 phrases (0,013 $, accord du propriétaire), téléchargée par lui.
- **Son** : l'instru de « neva die » (son intro, sa basse, puis le drop sur « differently »), baissée sous la voix ; sa chanson sous son snippet ; des sons sur ce qui bouge (bibliothèque HyperFrames).
- **Rien d'inventé** : pas d'avis, pas de statistiques (les seuls chiffres sont les zéros du snippet générique et les vrais 21 plans de son montage), pas de concurrent nommé, la vraie interface pour la partie Stalak.

Fichiers touchés :
- `promo/lesson/` : `SPEC.md`, `REVIEW.md`, `MEDIA.md`, `vo_cut.py`, `build.py`, `index.html` et `assets/times.js` (générés), `compositions/film.html`, `assets/engine.js`, polices (Lilita One, Rubik), logo, icône, grain, GSAP, `.gitignore` ;
- `docs/STATUS.md` ;
- `docs/handoff/marketing-promo-lesson.md`.

Aucun fichier de l'app ni du site n'est touché. Aucune vidéo, aucun son, aucune image tirée des prises dans le dépôt (demande du propriétaire) : le film lui est envoyé directement.

Migration SQL : aucune.

Tests : `hyperframes lint` (0 erreur, 0 avertissement) et `hyperframes check` (réussi) ; deux rendus regardés (une image par temps sur tout le film, 10 images de suite autour de chacun des 18 changements, la planche à la largeur d'un téléphone) : le 1er rendu montrait une prise sans sa carte pendant 6 images avant le montage et 2 images après le snippet, corrigé dans le 2e (seules ces 8 images changent) ; aucune image noire ; son mesuré : −15,0 LUFS, crête −1,9 dB, son snippet 3 LU au-dessus de la voix (détail dans `promo/lesson/REVIEW.md`).

Reste au propriétaire :
- Regarder le film et dire s'il le valide.
- Vérifier la licence de l'instru de « neva die » avant d'en faire une pub (comme pour les v5 et v6).
