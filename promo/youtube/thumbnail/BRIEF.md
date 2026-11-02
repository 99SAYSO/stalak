# Miniature YouTube du film Stalak (2/11/2026)

**La demande.** Le propriétaire, le 2/11 à 13 h 48 : « une miniature captivante, qui marche avec les codes d'aujourd'hui ».

**Le style.** À 14 h 14, il a envoyé 3 exemples, avec le message « je veux une miniature dans ce style là » :
- Apple, « Introducing Apple Creator Studio » ;
- Google, « Introducing Google Vids » ;
- Lovio, « an idea ».

Leur style commun : un fond sobre, la marque ou deux mots en très grand, et le produit en vedette. Il n'y a ni visage en gros plan ni texte criard. La première piste, son visage en très gros plan avec « 1 FRAME OFF », est donc abandonnée.

**Le titre.** Titre conseillé, dans l'esprit de ses exemples : « Introducing Stalak: the edit nobody sees ».

**Ce que la miniature doit faire penser :** « une app qui monte mes prises sur le temps, toute seule ? »

**Où elle sera vue.** La chaîne est neuve : surtout dans la recherche et les vidéos suggérées, puis sur l'accueil.

**La fabrication.**
- `make_media.py` tire de vraies images de ses 3 prises, depuis ses fichiers .MOV.
- `thumb.html` assemble la miniature en HTML, avec les polices Lilita One et Rubik et le logo de Stalak.
- `render.py` la photographie dans Chromium au double de la taille, puis la réduit en JPG de 1280 × 720 (moins de 2 Mo ; les 3 font entre 44 et 129 Ko).
- `feed.html` sert à la vérification : la miniature dans un faux fil YouTube, en clair et en sombre (`out/feed.png`).

## Version 3 : « on beat. » sur l'écran de montage (style Lovio), celle à mettre

- **Composition :** « on beat. » en très grand en haut (Rubik gras, du blanc au bleu glace, avec une lueur). Dessous, la vraie carte « Your edit » du film, inclinée en perspective et coupée par le bas. On y voit :
  - l'aperçu de sa prise 3 ;
  - Cuts sur Auto et Pace sur Punchy ;
  - la barre coupée sur les temps, prises 1, 2 et 3 ;
  - les boutons Play, Shuffle et Export.
- **Ce qu'on montre :** l'app elle-même, telle qu'elle est dans le film (0:26 à 0:36).
- **Texte :** « on beat. » (2 mots, aucun mot du titre).
- **Couleurs :** bleu Stalak vers indigo, lueur blanche. Elle se détache sur YouTube en mode clair comme en mode sombre. Pas de rouge, la couleur de YouTube.
- **Curiosité :** réussie. Elle dit ce que fait l'app, et le titre dit que c'est le travail que personne ne voit.
- **Sur téléphone (168 × 94) :** réussie. « on beat. » se lit et la barre colorée se voit. La durée (1:03) ne cache que le coin de la carte.
- **Note : 9/10** (clarté 3, curiosité 2, contraste 2, accord avec le titre 2).

## Version 1 : le logo sur un éventail de ses clips (style Apple)

- **Composition :** le logo Stalak (icône et nom) en blanc en haut, sur un fond bleu nuit avec une neige très légère. Dessous, 7 vidéos verticales en éventail : celle du centre est la plus grande, devant, et chaque carte vers les bords est plus petite, plus en arrière et plus sombre, comme les icônes d'Apple.
- **Ce qu'on montre :** 7 vraies images de ses 3 prises, alternées (le champ, le chalet, la montagne).
- **Texte :** le logo « Stalak ».
- **Couleurs :** bleu nuit plutôt que noir, pour se détacher aussi de YouTube en mode sombre. Le rouge de son pull et de son bonnet revient sur chaque carte.
- **Curiosité :** à moitié réussie. On voit une marque et des clips d'un rappeur, mais pas encore ce que fait l'app.
- **Sur téléphone (168 × 94) :** réussie. « Stalak » se lit et on voit des vidéos verticales.
- **Note : 7/10** (clarté 2, curiosité 2, contraste 2, accord avec le titre 1, car « Stalak » est aussi dans le titre, comme chez Apple et Google).

## Version 2 : un grand bouton en verre « ↻ Shuffle » (style Google)

- **Composition :** un bouton géant en verre glacé au centre, sur un fond très clair bleu glace, avec un liseré bleu sur un côté et un pointeur qui clique.
- **Ce qu'on montre :** le vrai bouton de l'app, « ↻ Shuffle », qui « crée un nouveau montage ». Le pointeur est l'icône « cursor-pointer » de Material Design Icons (licence Apache 2.0).
- **Texte :** « Shuffle ».
- **Couleurs :** très claire. Elle se détache bien en mode sombre, moins en mode clair.
- **Curiosité :** à moitié réussie. On ne sait pas ce que fait le bouton.
- **Sur téléphone (168 × 94) :** réussie. « Shuffle » se lit.
- **Note : 5/10** (clarté 1, curiosité 2, contraste 1, accord avec le titre 1).

## Verdict

**À lancer : la version 3.** C'est la seule qui dit en un regard ce que fait Stalak et qui montre l'app.

**Le test, avec l'outil de YouTube.** L'outil « Tester et comparer » de YouTube Studio marche sur ordinateur, si la chaîne a les fonctions avancées (vérification d'identité). Y mettre la 3 et la 1. YouTube garde celle qui apporte le plus de temps de visionnage, en 1 à 2 semaines. Sur une chaîne neuve, deux versions donnent un résultat plus vite que trois.

**Le test, sans cet outil.** Garder la 3 jusqu'à 1 000 impressions. Si le taux de clics est alors sous 4 %, passer à la 1.

**Une seule chose change entre les deux :** ce qu'on montre en vedette, l'écran de l'app ou ses clips.

**Les fichiers :** `out/Stalak_thumbnail_1.jpg`, `_2.jpg` et `_3.jpg`. Ils sont hors du dépôt (ils contiennent des images de ses prises) et envoyés au propriétaire.
