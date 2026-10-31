# Stalak — « Unfreeze your snippet » (promo v3) : REVIEW

## Retour du propriétaire sur la première 3D (31/10)

> « Ça fait trop carton, jouet, même en termes de lumière… les formes sont trop carrées, pas assez réaliste. Ça fait trop cubique. »

La 3D a été refaite pour avoir l'air vraie. Le scénario, le texte, la musique et le timing ne changent pas.

| Avant | Maintenant |
|---|---|
| Cristaux à facettes, cubes arrondis et boules de neige | Morceaux de glace aux formes cassées et irrégulières : faces planes, bords fondus, un peu de relief |
| Glace en plastique bleu, à moitié transparente, éclairage plat | Shader de glace : le ciel vu à travers et déformé, un rebond de lumière à l'intérieur, reflets, éclats des lumières, arêtes givrées |
| Bloc gelé : une boîte arrondie et transparente | Bloc en vraie glace réfractive (IOR 1,31). Le givre vient des arêtes, il y a des bulles d'air prises dans la glace et des coins cassés. La fissure est faite de fines lignes avec une toile d'araignée autour du point d'impact. Une lumière s'échappe de la fissure pendant la plongée. |
| Intérieur de la fissure : deux murs plats en 2D (zigzag) | Une vraie crevasse de glace en 3D (murs en relief, glace bleue, lumière au fond) ; les murs s'écartent sur le temps fort |
| Éclats de l'explosion : petits icosaèdres | Éclats de glace cassée (plaques et aiguilles à faces nettes), plus un nuage de poudre de glace |
| Fond : dégradé CSS plat | Ciel froid en 3D tout autour, rayons de lumière discrets, poussière de glace, brouillard |
| Lumière : 3 lampes simples | Studio de « softbox » pour les reflets, lumière principale chaude en haut à gauche, contre-jour froid à droite |
| Image brute | Objectif : profondeur de champ (la mise au point suit le sujet), halo sur les reflets plus clairs que le blanc, tonalité neutre (garde le bleu Stalak), léger vignettage, anti-crénelage |

La mascotte reste le personnage de l'app, mais elle est éclairée comme une figurine : reflet doux du tissu (« sheen ») et contre-jour.

## Contrôles

- `npx hyperframes lint` : 0 erreur, 1 avertissement. `stage.html` fait 585 lignes. C'est voulu : c'est un seul monde three.js (une seule toile WebGL), qu'on ne peut pas couper en plusieurs compositions.
- `npx hyperframes check` :
  - Corrigés :
    - « Favorites » de Safari restait sous l'app une fois la page chargée : il est maintenant masqué ;
    - les flocons de la fin avaient deux animations qui se chevauchaient : elles s'enchaînent maintenant.
  - Ce qui reste :
    - des avertissements de débordement sur les reflets qui balayent les titres et le téléphone (voulu) ;
    - le message WebGL « GPU stall due to ReadPixels » (sans effet sur l'image) ;
    - le contrôle n'a pas fini dans son délai de 120 s, car chaque image de la 3D réaliste prend plusieurs secondes sans carte graphique. Les images ont donc été vérifiées à la main (ci-dessous).
- Images de contrôle :
  - le monde 3D seul à 11 moments ;
  - le film entier à 13 moments : hook, fissure, crevasse, explosion, téléphone, les 3 étapes, la vidéo finie, Shuffle, avis, fin, boucle ;
  - le premier rendu complet, regardé toutes les 0,2 s (140 images) et à chaque transition.
- Défauts vus sur le premier rendu, corrigés, puis nouveau rendu :
  - dans la crevasse, « CUT. » s'affichait 0,35 s avant la première coupe, puis disparaissait pour revenir. Il est maintenant caché jusqu'à la coupe ;
  - le trait de coupe était déjà dessiné sur chaque clip avant sa coupe. Il se trace maintenant au moment de la coupe.

## Rendu final (vérifié)

- Format : 1080 × 1920, 30 i/s, 840 images, 28,0 s, H.264 + AAC 48 kHz stéréo, 33 Mo.
- Lecture complète sans erreur, aucune image noire.
- Son : −12,6 LUFS intégrés, crête à −1,7 dBFS.
- La dernière image retombe sur le cadrage de la première : la vidéo boucle.
- Le rendu a pris 29 minutes sans carte graphique.

## Temps de calcul

Sans carte graphique, chaque image coûte entre 1,2 s (vol dans le monde de glace) et 5 à 9 s (bloc de glace en gros plan).

Pour tenir dans un rendu d'environ 40 minutes :
- seul le bloc de glace utilise la vraie transmission de three.js, et seulement quand on le voit ;
- les morceaux de glace et les éclats utilisent un shader léger ;
- les effets d'objectif sont faits en quelques passes légères, à demi et quart de taille ;
- pas de multi-échantillonnage : l'anti-crénelage (FXAA) se fait dans la dernière passe.

## Choix

- **Avis** : uniquement les 3 vrais messages de Bloody, haeine et Kazzy (avec leur accord, sans photo de profil). Pas de « 5 étoiles » : il n'existe pas de système de notes.
- **« 40 min »** : le vrai temps de montage du propriétaire pour un snippet.
- **Hors dépôt** : la mascotte 3D, la musique et les vidéos (voir `MEDIA.md`).
