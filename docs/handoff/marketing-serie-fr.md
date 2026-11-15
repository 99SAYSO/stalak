# Branche `marketing/serie-fr` : la série animée de Stalak

> Marketing & croissance. Rien ne change sur le site : seulement `tools/serie/` et `docs/`.

## 15/11, 22 h 42 : l'univers d'abord (série « T-Crazy », héros Liam)

Ce qui est fait :
- **Étape 1, le style.** Trois planches sont dans la fiche « Le style de dessin » de l'onglet Univers, en statut `a_choisir` :
  - Style 1 · Anime US ;
  - Style 2 · Sticker givré ;
  - Style 3 · BD imprimée.
  
  Elles montrent le même Liam dans la même chambre-studio. Comment elles sont faites (modèles, consignes, coûts) : `docs/marketing/SERIE_UNIVERS.md`.
- **Le coût annoncé au propriétaire** : environ 2,70 $ pour tout l'univers. Dépensé à l'étape 1 : 0,42 $. Solde Flora : 2,76 $.
- **La musique** : demande faite au propriétaire pour ses beats ou ceux d'ALASKA. Sinon, ce sera Pixabay.
- **Les 3 anciennes fiches « Studio Chambre »** (héros Yanis) sont repassées en `idee`, pour qu'elles sortent de « À valider ». Elles seront réécrites avec Liam une fois l'univers choisi.
- **L'ancienne bible** (`docs/marketing/SERIE_BIBLE.md`) est marquée comme remplacée.

Ce qui attend : **le choix du style par le propriétaire.** Ensuite, Marketing fait tout l'univers dans ce style (étape 2 de `SERIE_UNIVERS.md`). Puis viendront la bible en une page et les scripts.

Ce qui sert toujours du travail d'avant :
- le moteur `tools/serie/engine` (bandeau, sous-titres avec le nom, mouvements de caméra, son, planche contact) ;
- `tools/serie/build.py`.

Les dessins de Yanis faits en code (`perso.js`, `maquette.js`) ne servent plus pour la série.

Skills utilisés : `stalak-da`, `stalak-videos-reseaux`, `image`.
