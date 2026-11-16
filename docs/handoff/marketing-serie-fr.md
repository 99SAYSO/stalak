# Branche `marketing/serie-fr` : la série animée de Stalak

> Marketing & croissance. Rien ne change sur le site : seulement `tools/serie/` et `docs/`.

## 16/11, 1 h 52 : Style 1 retenu, Liam corrigé

- Le propriétaire a retenu **Style 1 · Anime US**.
- La planche est refaite avec ses corrections, toutes dans `tools/serie/engine/tcrazy.js` :
  - locks entièrement noires ;
  - pas de chaîne ;
  - le col de la doudoune ouvert, avec le cou visible ;
  - les yeux droits.
- Elle est redéposée seule dans la fiche `style`, en `a_choisir`. Les anciennes planches sont retirées de la page.
- Ce qui attend : sa validation, puis les 4 versions de Liam (de face, de profil, 4 expressions).

## 15/11, 23 h : l'univers « T-Crazy », tout dessiné par Claude

**Décision du propriétaire (23 h) :** aucun visuel généré sur Flora. Claude dessine tout lui-même en code, et Flora ne sert qu'aux voix. Elle est notée dans « Mes goûts » (`regle-visuels-claude`). **À reporter par le Chef de projet** dans les décisions de `docs/STATUS.md` et dans `docs/studio/STUDIO_STALAK.md`.

Ce qui est fait :
- **Étape 1, le style.** 3 planches dessinées en code sont dans l'onglet Univers, fiche « Le style de dessin », en statut `a_choisir` : Style 1 Anime US, Style 2 Sticker givré, Style 3 BD imprimée. Elles montrent le même Liam dans la même chambre-studio.
  - Dessin : `tools/serie/engine/tcrazy.js` (page `tcrazy.html?s=1|2|3`).
  - Planches : `tools/serie/univers.py`.
  - Détails : `docs/marketing/SERIE_UNIVERS.md`.
- **Les 3 planches générées sur Flora** (0,42 $, avant la décision de 23 h) sont retirées de la fiche et de la page. Solde Flora : 2,76 $.
- **Coût de l'univers maintenant :**
  - environ 0,20 $ de voix seulement (narrateur 0,04 $, puis Liam, Nadia, Deuce et Maya 0,16 $) ;
  - visuels et musique : 0 $.
- **La musique** : demande faite au propriétaire pour ses beats ou ceux d'ALASKA. Sinon, ce sera Pixabay.
- **Les 3 anciennes fiches « Studio Chambre »** (Yanis) sont repassées en `idee`. L'ancienne bible est marquée comme remplacée.

Ce qui attend :
1. le choix du style par le propriétaire ;
2. tout l'univers dans ce style (étape 2 de `SERIE_UNIVERS.md`) ;
3. la bible en une page et les scripts.

Skills utilisés : `stalak-da`, `stalak-videos-reseaux`.
