# Série « T-Crazy » : l'univers, comment il est fabriqué

> Marketing & croissance, 15/11/2026, d'après la décision du propriétaire du 15/11 à 22 h 26 et le message du Chef de projet de 22 h 42.
> Les choix se font dans Studio Stalak, onglet **Univers** (collection `univers`). Aucun script avant que l'univers soit choisi.

## Décision du propriétaire, 15/11 à 23 h : tout est dessiné par Claude

« Je ne veux pas que tu génères sur Flora le visuel, seulement les voix. » Les personnages, les décors, le bandeau et le logo sont donc tous **dessinés par Claude, en code**. Flora ne sert qu'aux voix. Cette règle est notée dans « Mes goûts » (`regle-visuels-claude`).

Les 3 premières planches de style avaient été générées sur Flora (0,42 $). Elles ont été retirées de la page et remplacées par les planches dessinées.

## Étape 1 : le style (en attente du choix du propriétaire)

Le même Liam dans la même chambre-studio, dessiné de 3 façons : `tools/serie/engine/tcrazy.js`, page `tcrazy.html?s=1|2|3`, planches 3:4 faites par `tools/serie/univers.py`.

| Option | Ce qui le distingue |
|---|---|
| Style 1 · Anime US | traits fins avec un contour extérieur plus épais, regards plissés, mâchoire anguleuse, ombres franches en aplats, lumière chaude de fin de journée |
| Style 2 · Sticker givré | gros contours, liseré blanc d'autocollant, grosse tête, couleurs vives bleu Stalak et glace : le plus proche de la mascotte |
| Style 3 · BD imprimée | traits irréguliers comme au pinceau, trame de points dans les ombres, grain de papier, bleu nuit, glace et orange |

Liam y porte :
- des locks courtes (entièrement noires depuis le 16/11 ; remplacées ensuite par une casquette à l'envers et une coupe courte : voir l'étape 2a) ;
- une doudoune bleu Stalak ouverte sur un tee-shirt blanc ;
- un jean large et des baskets blanches.

Il tient son casque d'une main et, de l'autre, son téléphone levé : il se filme. Dans la chambre :
- un matelas au sol et de la mousse scotchée de travers ;
- un micro avec un filtre anti-pop ;
- un ordi portable avec une appli d'enregistrement inventée, sans logo ;
- un néon bleu glace, une fenêtre givrée au coucher du soleil ;
- des posters de rappeurs inventés, sans texte.

**16/11, 1 h 52 : Style 1 · Anime US retenu.** Corrections du propriétaire sur Liam (notées dans « Mes goûts », `regle-liam-look`) :
- locks entièrement noires, sans aucune mèche blanche ;
- pas de chaîne ;
- le col de la doudoune ne cache pas le cou ;
- les deux yeux regardent dans la même direction.

À 2 h, nouvelle remarque : « je trouve son corps trop large ». Liam est donc plus fin (doudoune, manches, jean, baskets) : un ado de 15 ans dans une doudoune trop grande. La planche corrigée est redéposée dans la fiche `style` (`a_choisir`). Les planches des styles 2 et 3 sont retirées. Les 4 versions de Liam viennent après sa validation.

**16/11, 2 h 04 : planche validée par le propriétaire** (fiche `style` en `choisi`).

## Étape 2a : les 4 versions de Liam (à choisir)

Des planches personnage sont dessinées en code (`tools/serie/engine/liam.js`, page `liam.html?v=1..4`). Sur chacune : Liam de face, de profil et en 4 expressions (frime, colère, panique, fierté). Les 4 planches sont dans la fiche `liam`, en `a_choisir`.

La coiffure a changé deux fois le 16/11 :
1. **2 h 11** : la première coupe (des locks) « ne va pas du tout », surtout de profil. Avec une image de référence, elle devient des vanilles (twists) noires, raie au milieu, jusqu'au menton (`regle-liam-coupe` dans « Mes goûts »).
2. **2 h 24** : « j'aime toujours pas du tout sa coupe ». Le propriétaire demande **une casquette à l'envers, dans le style des casquettes qu'il envoie** (une snapback à visière plate), **et une coupe super simple en dessous**. La règle est notée dans « Mes goûts » (`regle-liam-casquette`). Elle passe avant `regle-liam-coupe`.

Ce qui est dessiné maintenant, pareil dans les 4 versions :
- **La casquette, à l'envers.** C'est une snapback haute et rigide, à visière plate. De face, on voit l'arrière de la casquette : la languette à pressions et l'ouverture sur le front, où on voit ses cheveux. De profil, la visière plate pointe vers l'arrière. On garde la forme des casquettes de référence, sans leurs logos (équipes de baseball, marque) : la nôtre a seulement un petit flocon brodé sur le côté.
- **La coupe, très simple** : des cheveux noirs courts. On voit des pattes nettes et les tempes de face. De profil, on voit les cheveux au-dessus et derrière l'oreille, avec une ligne nette à la nuque. Les oreilles sont dégagées.

| Version | Visage | Casquette | Tenue |
|---|---|---|---|
| 1 · Le classique | anguleux | bleu roi (la plus proche de sa référence) | doudoune ouverte, tee blanc, jean large, baskets basses |
| 2 · Le sweat | rond | bleu nuit | doudoune courte sur un sweat gris, cargo beige, baskets montantes |
| 3 · Le sans-manches | long | noire (gris anthracite, pour qu'on lise la languette) | doudoune sans manches sur un tee manches longues glace, jogging noir |
| 4 · Le deux-tons | large, sourcil fendu, petite boucle d'oreille | glace, visière et languette bleues | doudoune bleue aux épaules glace, tee noir, jean clair |

Dans les 4 versions : la même casquette et la même coupe, pas de chaîne, le cou visible, les yeux droits, un corps fin, la doudoune bleu Stalak. Le propriétaire peut mélanger les versions, par exemple prendre le visage d'une version avec la casquette d'une autre.

Les 4 planches sont redéposées dans la fiche `liam`, en `a_choisir`. Les images des versions précédentes sont retirées de la page.

À noter pour la suite : la planche de style validée (`tcrazy.js`) montre encore Liam avec ses premières locks. Les scènes de la série seront redessinées avec la version de Liam choisie.

## Étape 2 : tout l'univers dans le style choisi (après le choix)

- Liam : 4 versions, chacune de face, de profil et avec 4 expressions (frime, colère, panique, fierté).
- Nadia, Deuce, Maya, Big Mo, M. Reyes, la mascotte redessinée : 2 versions chacun.
- Les 6 décors : 2 versions chacun, plus la chambre de nuit.
- Le bandeau et les sous-titres, le logo de la série : 3 versions chacun.
- Le narrateur : 3 voix sur la même phrase (Flora).
- Les musiques : le générique et les 4 ambiances, 2 ou 3 propositions chacune (`type: "audio"`). D'abord les beats du propriétaire ou d'ALASKA (demandés le 15/11). Sinon, Pixabay (usage commercial permis), sans les titres marqués d'un bouclier, avec la source notée pour chaque titre. Jamais de morceau connu.

## Coûts

- **Visuels : 0 $** (dessinés en code).
- **Voix (Flora, Gemini), 0,013 $ par génération** :
  - narrateur : 3 essais, 0,04 $ ;
  - voix de Liam, Nadia, Deuce et Maya : 0,16 $ ;
  - ensuite, environ 0,05 à 0,08 $ par épisode (une génération par personnage et par façon de parler, découpée ensuite).
- **Musique : 0 $** (beats du propriétaire ou Pixabay).
- Solde Flora au 15/11 : 2,76 $, après les 0,42 $ des planches générées puis retirées.
