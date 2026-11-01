# « Your snippet is the problem » (promo v7) : REVIEW

## Ce que c'est
Une explication de 30 s racontée par une voix, sur le modèle de la vidéo envoyée par le propriétaire (1/11) : le problème (tout le monde poste le même snippet), ce que ça coûte, ce que font les snippets qu'on rejoue, Stalak, puis « Post it everywhere » et le logo (voir `SPEC.md`).
- 1080 × 1920, 30 i/s, 30,57 s (918 images), anglais américain.
- Fait avec HyperFrames 0.8.223. Tout le visuel est un seul moteur, `assets/engine.js` : chaque image est calculée à partir du temps (cartes, mots, pastilles, cercle). `build.py` place la musique, la voix, les sons et les vidéos sur la grille des temps de « neva die » (157 BPM).

## Les choix faits pour le propriétaire
| Choix | Pourquoi |
|---|---|
| Le crochet « Your song isn't the problem. Your snippet is. » | Il parle au rappeur de son problème à lui, dès la 1re image (les premiers mots sont déjà là). |
| Le snippet générique gris (une silhouette, « 1 take », « 0 cuts », « no lyrics ») | Montrer le problème sans montrer personne ni un vrai compte ; les seuls chiffres sont des zéros, pas des statistiques inventées. |
| Le drop du beat sur « differently » | Le moment où le film bascule du problème à la solution tombe sur le vrai drop de l'instru. |
| Les 3 pastilles dans le style de l'app (contour encre, ombre décalée, glaçons) | Ce sont les 3 choses que fait Stalak ; elles se jettent dans l'icône, qui s'ouvre en la vraie carte de montage (ses prises, ses 21 plans). |
| Son vrai snippet en grand, sa chanson (« I gotta bounce ») | La preuve, avec sa voix, 4 mesures. |
| « everywhere » entouré à la main | Le geste de l'exemple, sur le mot qui dit où poster. |

## Contrôles avant le rendu
- `lint` : 0 erreur, 0 avertissement. `check` : réussi. Restent des avertissements de lecture sur les textes secondaires de la carte de montage (les numéros des blocs, « 21 shots • 25.6 s », comme dans les v5 et v6 : c'est l'interface de l'app en miniature, la voix porte le message), « So people scroll right past it. » 1,6 s à l'écran (le temps de la voix) et les éléments du décor qui sortent du cadre (voulu).
- Images de contrôle : chaque carte (entrée, milieu, sortie), le défilement, les zéros, le point bleu sur le drop, chaque pastille, la fusion en icône, la carte de montage, le snippet en grand, le cercle, le logo.
- Corrigé pendant ces contrôles : l'étiquette « built differently » et la phrase « I gotta bounce » restaient affichées après leur carte (un élément visible se voit même dans une carte cachée) ; les étiquettes du snippet gris étaient trop petites (24 → 30 px) ; le crochet descendu au centre des notes ; le cercle coupait « it » et « song. » (il commence et finit maintenant à droite, avec plus de place autour du mot) ; le logo arrive un temps plus tard (sur la caisse claire) pour que le cercle reste visible ; le texte gris du graphique était trop pâle.
- Son, avant le rendu (mélange recalculé hors ligne à partir de `index.html`, comme le fait le rendu, qui additionne les pistes sans limiteur) : le mélange montait à +6,9 dB au-dessus du maximum (son snippet trop fort, et les deux musiques jouaient ensemble 24 ms à chaque raccord). Corrigé : tout le mélange baissé (× 0,68), sa chanson baissée, les impacts baissés, un fondu de 24 ms à chaque raccord de musique. Résultat : crête −1,35 dB, −17,9 LUFS avant le réglage final.
