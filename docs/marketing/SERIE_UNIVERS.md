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
- des locks courtes aux pointes givrées ;
- une doudoune bleu Stalak ouverte sur un tee-shirt blanc ;
- une chaîne avec un « T » en lettre bâton ;
- un jean large et des baskets blanches.

Il tient son casque d'une main et, de l'autre, son téléphone levé : il se filme. Dans la chambre :
- un matelas au sol et de la mousse scotchée de travers ;
- un micro avec un filtre anti-pop ;
- un ordi portable avec une appli d'enregistrement inventée, sans logo ;
- un néon bleu glace, une fenêtre givrée au coucher du soleil ;
- des posters de rappeurs inventés, sans texte.

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
