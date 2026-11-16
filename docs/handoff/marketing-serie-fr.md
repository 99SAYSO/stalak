# Branche `marketing/serie-fr` : la série animée de Stalak

> Marketing & croissance. Rien ne change sur le site : seulement `tools/serie/` et `docs/`.

## 16/11, 4 h 40 : décors choisis (poster de la chambre en attente), bandeau et logo déposés

- Vers 4 h, le propriétaire a choisi ses décors :
  - le placard-studio (chambre, version 2), **à refaire** pour le poster ;
  - la cuisine ;
  - la rue pavillonnaire ;
  - le terrain grillagé ;
  - le couloir du lycée ;
  - le toit aménagé.
- **Le poster de la chambre est en attente.**
  - Le propriétaire veut un poster de Pop Smoke : c'est sa note sur la fiche, ajoutée automatiquement dans « Mes goûts ».
  - Il a ensuite envoyé dans la conversation une photo retravaillée de l'artiste, avec le titre de son album.
  - Marketing ne l'a ni dessinée ni intégrée : c'est l'image d'un vrai artiste sur le compte de la marque, sans les droits, comme les vrais morceaux connus.
  - Le propriétaire a répondu qu'il décide et qu'il en prend la responsabilité. Marketing a maintenu qu'il ne le ferait pas lui-même.
  - 3 idées proposées : un rappeur inventé, T-Crazy lui-même, ou une pochette du propriétaire (son image à lui). On attend son choix.
- **Le bandeau et le logo, 3 versions chacun**, sont dans les fiches `bandeau` et `logo-serie`, en `a_choisir`.
  - Nouveau fichier `tools/serie/engine/frame.js` (page `frame.html?f=…`) : il compose une vraie image de la série (décor, personnages placés par leurs pieds, habillage).
  - `liam.js` et `cast.js` donnent maintenant un personnage entier avec l'expression voulue : `LIAM.figure()` et `CAST.figure()`.
  - Les planches sont faites par `python3 tools/serie/univers.py habillage`.
  - Le détail est dans `docs/marketing/SERIE_UNIVERS.md`, étape 2d.
  - Les textes sont des exemples.
  - Tout reste dans la zone visible des réseaux.
  - Aucun logo ne porte le nom de Stalak.
- La mascotte officielle attend toujours la validation du propriétaire.
- Coût : 0 $.
- Ce qui attend :
  - le choix du poster, du bandeau et du logo, et la validation de la mascotte ;
  - ensuite, les 3 voix du narrateur (Flora, environ 0,04 $, seulement après son accord) et la musique (ses beats, sinon Pixabay) ;
  - puis la bible en une page et les scripts.

## 16/11, 3 h 55 : personnages choisis, mascotte officielle, les 6 décors déposés

- À 3 h 27, le propriétaire a écrit « c'est bon j'ai fait mes choix ». Ses choix dans l'onglet Univers :
  - Deuce : version 1, « Le manager » ;
  - Maya : version 1, « Les tresses » ;
  - Big Mo : version 1, « Le boss du quartier » ;
  - M. Reyes : version 1, « L'épicier ».
- **La mascotte n'est pas redessinée.** Sa note sur la fiche : « je veux garder la mascotte de Stalak de base, pas de personnage ». Elle est déjà ajoutée automatiquement dans « Mes goûts ».
  - La fiche `mascotte` montre maintenant la mascotte officielle avec ses vrais autocollants (`site_src/emoji`), dans l'écran du téléphone de Liam. Seul le téléphone est dessiné (`mascotSheet()` dans `tools/serie/engine/cast.js`).
  - Elle reste en `a_choisir` : il reste au propriétaire à la valider.
  - Le code de la mascotte redessinée est retiré de `cast.js`.
- **Les 6 décors sont dessinés en code, 2 versions chacun**, et déposés dans les fiches `decor-*`, en `a_choisir` :
  - le moteur : `tools/serie/engine/decors.js`, page `decors.html?d=<lieu>&v=1|2&t=jour|nuit|soir` ;
  - les planches : `python3 tools/serie/univers.py decors` (textes et gros plans dans `DECOR_BOARDS`) ;
  - la chambre-studio est montrée de jour et de nuit ;
  - le détail des versions est dans `docs/marketing/SERIE_UNIVERS.md`, étape 2c.
- La cuisine et le salon sont 2 pièces, le couloir du lycée et le bus sont 2 lieux : pour ces deux fiches, le propriétaire peut garder les deux versions.
- Toutes les enseignes sont inventées (« REYES », « GLAÇONS », « PROMO », « OUVERT », « SORTIE », « STUDIO ») : aucune vraie marque.
- Petites retouches :
  - `tcrazy.js` : le soleil de la chambre peut changer de couleur (`P.sun`), pour la chambre de nuit ;
  - `univers.py` : les guillemets restent collés à leur mot dans les planches.
- Coût : 0 $.
- Ce qui attend :
  - le choix des décors et la validation de la mascotte par le propriétaire ;
  - ensuite, le bandeau et le logo (3 versions chacun), les 3 voix du narrateur (Flora, environ 0,04 $, seulement après son accord) et la musique (ses beats, sinon Pixabay) ;
  - puis la bible en une page et les scripts.

## 16/11, 3 h 30 : les 6 autres personnages, 2 versions chacun

- À 2 h 54, le propriétaire a écrit « ok suivant ». Les autres personnages sont dessinés en code :
  - Nadia, Deuce, Maya, Big Mo, M. Reyes et la mascotte ;
  - le dessin vient d'un nouveau moteur, `tools/serie/engine/cast.js`, page `cast.html?c=…&v=1|2` ;
  - chaque planche montre le personnage de face, de profil et en 4 expressions.
- Les planches sont déposées dans les fiches de l'onglet Univers, en `a_choisir`, au fur et à mesure. Le détail des versions est dans `docs/marketing/SERIE_UNIVERS.md`, étape 2b.
- **Nadia est déjà choisie** par le propriétaire (3 h 09) : version 2, « Le chignon » (fiche `nadia` en `choisi`).
- Mascotte : elle reste fidèle aux autocollants officiels de `site_src/emoji` :
  - capuche fourrée, locks à perles blanches, moufles, logo AA ;
  - ses expressions reprennent les signes des autocollants.
- Coût : 0 $.
- Ce qui attend :
  - les choix du propriétaire pour Deuce, Maya, Big Mo, M. Reyes et la mascotte ;
  - ensuite, les décors (2 versions chacun, plus la chambre de nuit), le bandeau, le logo, les voix du narrateur et la musique.

## 16/11, 2 h 50 : Liam choisi (version 4, « Le deux-tons »), casquette baissée

- À 2 h 44, le propriétaire a choisi la **version 4, « Le deux-tons »** (fiche `liam` : `choix` 3, statut `choisi`) :
  - visage large, sourcil fendu, petite boucle d'oreille ;
  - casquette glace à visière bleue, portée à l'envers ;
  - doudoune bleue aux épaules glace, tee noir, jean clair, baskets basses.
- Il a demandé : « baisse un peu la hauteur de sa casquette ». Le haut de la casquette est descendu d'environ 30 unités, de face comme de profil (`capFront` et `headProfile` dans `tools/serie/engine/liam.js`). Elle couvre toujours le crâne.
- La planche de la version 4 est redéposée dans la fiche, qui reste en `choisi`. Les autres versions gardent leurs anciennes images : elles ne servent plus.
- La remarque est notée dans « Mes goûts » (`pas-casquette-haute`).
- Coût : 0 $.
- Ce qui attend : les autres personnages (Nadia, Deuce, Maya, Big Mo, M. Reyes, la mascotte), 2 versions chacun, dans le même style que Liam.

## 16/11, 2 h 45 : profil de Liam, crâne raccourci

- À 2 h 40, le propriétaire a écrit : « l'arrière de son crâne en vue de profil est trop long ».
- Dans `headProfile` (`tools/serie/engine/liam.js`), l'arrière de la tête est raccourci d'environ 30 unités. La casquette, les cheveux et la nuque suivent, et la visière est un peu plus courte. La tête de profil est maintenant compacte derrière l'oreille. La vue de face ne change pas.
- La remarque est notée dans « Mes goûts » (`pas-crane-long`).
- Les 4 planches sont redéposées dans la fiche `liam`, en `a_choisir`. Les précédentes sont retirées de la page.
- Coût : 0 $.

## 16/11, 2 h 40 : Liam en casquette à l'envers, coupe courte

- À 2 h 24, le propriétaire a écrit : « j'aime toujours pas du tout sa coupe, fais plutôt une casquette à l'envers dans le style de celle que je t'envoie, et fais une coupe super simple en dessous ». Il a joint deux images de casquettes (des snapbacks à visière plate).
- Dessiné dans `tools/serie/engine/liam.js`, pareil dans les 4 versions :
  - une snapback à l'envers : de face, la languette à pressions et l'ouverture sur le front ; de profil, la visière plate vers l'arrière ;
  - aucun logo d'équipe ni de marque, seulement un petit flocon brodé sur le côté ;
  - une coupe très simple : cheveux noirs courts, pattes nettes, oreilles dégagées, ligne nette à la nuque.
- Les 4 versions changent le visage, la couleur de la casquette et la tenue :
  - 1 · Le classique : bleu roi ;
  - 2 · Le sweat : bleu nuit ;
  - 3 · Le sans-manches : noire ;
  - 4 · Le deux-tons : glace et bleue, avec une petite boucle d'oreille.
- Les 4 planches sont redéposées dans la fiche `liam`, en `a_choisir`, et sa description est mise à jour. Les images des vanilles sont retirées de la page.
- Nouvelle règle dans « Mes goûts » : `regle-liam-casquette`. Elle passe avant `regle-liam-coupe` (les vanilles).
- Coût : 0 $.
- Ce qui attend : le choix d'une version par le propriétaire. Il peut mélanger les versions.
- **À signaler au propriétaire** : trois anciennes lignes de « Mes goûts » décrivent encore les cheveux longs (`regle-heros` « à locks », `regle-liam-look` « locks entièrement noires », `regle-liam-coupe` les vanilles). C'est lui qui les retire ou les modifie, s'il le veut.

## 16/11, 2 h 20 : la coupe de Liam refaite d'après l'image du propriétaire (remplacée à 2 h 24)

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
