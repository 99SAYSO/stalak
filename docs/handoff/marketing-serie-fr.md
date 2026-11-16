# Branche `marketing/serie-fr` : la série animée de Stalak

> Marketing & croissance. Rien ne change sur le site : seulement `tools/serie/` et `docs/`.

## 16/11, 2 h 20 : la coupe de Liam refaite d'après l'image du propriétaire

- À 2 h 11, le propriétaire a écrit : « sa coupe ne va pas du tout. Surtout de profil on dirait qu'il a pas de cheveux sur le coté ». Il a joint une image de référence pour la coupe.
- La coupe est refaite dans `tools/serie/engine/liam.js`, la même dans les 4 versions :
  - des vanilles (twists) entièrement noires, raie au milieu ;
  - elles tombent jusqu'au menton et cachent les oreilles ;
  - de profil, les cheveux couvrent tout le côté de la tête.
- La règle est notée dans « Mes goûts » (`regle-liam-coupe`).
- Les 4 versions ne changent plus que le visage et la tenue : Le classique, Le sweat, Le sans-manches, Le deux-tons. Elles sont redéposées dans la fiche `liam`, en `a_choisir`, avec sa description mise à jour. Les 4 anciennes images sont retirées de la page.
- Coût : 0 $.
- Ce qui attend : son choix d'une version.
- **À signaler au propriétaire** : deux anciennes lignes de « Mes goûts » parlent encore de « locks » (`regle-heros`, `regle-liam-look`). La nouvelle ligne (`regle-liam-coupe`) passe avant. C'est lui qui retire ou modifie les anciennes, s'il le veut.

## 16/11, 2 h 04 : style validé, les 4 versions de Liam déposées

- Le propriétaire a validé la planche du Style 1 (fiche `style` en `choisi`).
- Les 4 versions de Liam sont dessinées en code (`tools/serie/engine/liam.js`) et déposées dans la fiche `liam`, en `a_choisir` : Le classique, Le chignon, Le bandeau, Le deux-tons. Chacune montre Liam de face, de profil et en 4 expressions.
- Coût : 0 $.
- Ce qui attend : son choix. Ensuite, les autres personnages (2 versions chacun), les décors, le bandeau, le logo, les voix du narrateur et la musique.

## 16/11, 1 h 52 : Style 1 retenu, Liam corrigé

- Le propriétaire a retenu **Style 1 · Anime US**.
- La planche est refaite avec ses corrections, toutes dans `tools/serie/engine/tcrazy.js` :
  - locks entièrement noires ;
  - pas de chaîne ;
  - le col de la doudoune ouvert, avec le cou visible ;
  - les yeux droits ;
  - à 2 h, un corps plus fin (« je trouve son corps trop large »).
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
