Statut : EN COURS (lot 1 fait, tests en cours ; lots 2 à 4 à venir)
Branche : app/refonte-mobile (créée depuis `origin/main` efbb0c0 le 23/11).
Maquette de la branche : https://app-refonte-mobile.stalak-site.pages.dev (à faire valider par le propriétaire, règle 9).

Demande : `docs/handoff/chef-refonte-mobile-app.md` (23/11), démos validées dans `docs/audit/maquettes/mobile-2026-11-23/`.
4 lots, une maquette par lot. Skills : stalak-da (goûts `app-*` relus avant et après), motion-design, taste, webapp-testing.

## Décisions du propriétaire sur le lot 1 (23/11, 22 h 55)
1. **DM Sans aussi sur ordinateur** : oui. Fait (le texte de l'app est en DM Sans partout ; Lilita One pour les titres).
2. **Liens légaux et langue dans le profil** (lot 2), et plus de pied de page sur l'accueil du téléphone : oui. À faire au lot 2.
3. **Le glaçon d'aide reste au-dessus de la barre** sur l'accueil : oui.
4. **« Voix seule (a cappella) » : retirée.** Fait : le lien sous « Écrire mes paroles » n'est plus proposé.
5. **« Plans d'ambiance » : retirés.** Fait : « + Plans d'ambiance » n'est plus proposé à l'étape Prises. Un ancien projet
   qui en contient les joue toujours, et son réglage « Ambiance » (étape Montage) reste affiché pour lui seulement.
6. **Un flash dans la caméra : oui, à ajouter.** Prévu au lot 3, avec le nouvel écran de la caméra. Ce qui est possible
   dans un navigateur : la **torche du téléphone** pour la caméra arrière quand le téléphone le permet, et pour la caméra
   avant (ou sans torche) un **cadre blanc lumineux autour de l'image** qui éclaire le visage.

## Retours du propriétaire sur la maquette (23/11, 23 h 13) — faits
- **« C'est fade, juste le bleu clair »** : des flocons tombent maintenant sur l'accueil (bleus, pour qu'on les voie sur le
  fond glace), comme la neige du reste du site.
- **« Ça reste le site, on peut slider vers le bas »** : sur téléphone, l'accueil est **un seul écran, comme une appli**. On ne
  descend plus vers le compteur, « Sans / Avec Stalak », les avis, « Stalak, c'est quoi ? », « by Alaska », « Installe Stalak
  comme une app » ni le pied de page : ils sont cachés sur téléphone (toujours là sur ordinateur, et toujours dans la page
  pour Google). Si le contenu dépasse sur un petit téléphone (derniers montages), il défile à l'intérieur de l'écran.
- Notés dans « Mes goûts » (`app-fond-flocons-pas-uni`, `app-pas-un-site-qui-defile`).
- **Conséquences à connaître (pour le Chef de projet, Marketing et Juridique)** :
  - sur téléphone, un visiteur ne voit plus **les avis ni le compteur** en descendant ; il reste la pastille « 4,7/5 · N
    vidéos montées » du premier écran. La plupart des visiteurs viennent de TikTok, donc sur téléphone : à suivre dans le
    relevé du lundi. Proposition : remettre 2 ou 3 avis dans l'écran des formules ou dans le tutoriel (lot 4) ;
  - les **liens légaux** (conditions, remboursement, confidentialité, mentions) restent accessibles sur téléphone par l'écran
    des formules (pastille « Stalak Pro ») et à l'inscription ; **« Gérer les cookies », le choix de la langue et les
    guides** ne le sont plus depuis l'accueil du téléphone tant que le profil du lot 2 n'est pas fait ;
  - les textes cachés restent dans la page : rien ne change pour le référencement en théorie, à surveiller dans la Search
    Console (Google lit la version téléphone).

# Lot 1 : police, barre du bas, accueil, ouverture

La barre, l'accueil et l'ouverture sont sous 900 px : sur ordinateur, seule la police change (vérifié par le test : ni barre,
ni ouverture, en-tête comme avant).

## 1. Police
- Le texte de l'app passe en **DM Sans** (à la place de Rubik), sur téléphone et sur ordinateur (décision du 23/11) ; les
  titres et les boutons restent en Lilita One.
- Les pages à part (Tarifs, pages légales, guides) gardent Rubik : elles sont à Marketing (`site.css`). **Pour Marketing** :
  à passer en DM Sans si le propriétaire veut la même police partout.
- Les polices des vidéos exportées (paroles à l'écran) ne changent pas.

## 2. Barre du bas (démo n° 9)
- Accueil, Montages, « + » bleu au centre, Stats, Compte (tête de la mascotte, ou la photo du compte).
- Ce que fait chaque bouton :
  - **Accueil** : ferme la page ouverte, remonte en haut ;
  - **Montages** : ouvre la Galerie (la page existante de Comptes) ; déconnecté : la connexion d'abord ;
  - **« + »** : ouvre le choix du son, comme « Choisir mon son » ;
  - **Stats** : « Mes stats » TikTok (l'entrée du menu de Réseaux sociaux ; relie le compte TikTok d'abord s'il ne l'est
    pas) ; déconnecté, ou TikTok pas proposé : la page du compte ;
  - **Compte** : la page du compte ; déconnecté : la connexion.
- Elle reste affichée sur « Montages » et « Compte » (l'onglet est marqué), et s'en va pour la connexion et les formules
  (plein écran).
- **Cachée pendant l'éditeur, la caméra, l'export et l'écran de fin** : dès qu'un son ou une prise est là.
- Chaque bouton fait au moins 44 px ; en bas de page, rien du pied de page ne passe dessous ; le glaçon d'aide est au-dessus.

## 3. Accueil (démo n° 9, et premier écran « A » choisi le 23/11)
- **Fond glace** `#d6ecff` avec une lumière en haut, comme les démos (l'éditeur garde son fond bleu et sa neige).
- Plus d'en-tête sur l'accueil (logo, étapes, bouton du compte) : la barre du bas les remplace. Ils reviennent dans
  l'éditeur, comme avant, jusqu'au lot 3.
- En haut à droite, la pastille de la formule : « Stalak Pro » (ouvre les formules) ou le nom de la formule (ouvre le compte).
- **Déconnecté** : le premier écran choisi le 23/11 (mascotte, titre, phrase, un seul gros bouton, « Voir un exemple » en
  lien, la note). Le bouton principal est maintenant **bleu, contour noir, ombre dure noire** (règle `app-*`), sans glaçons.
  Les textes ne changent pas (ceux de Marketing).
- **Connecté** : « Salut <pseudo> », « Prêt pour ton prochain snippet ? », la carte bleue **« Nouveau montage »** (toute la
  carte est le bouton, elle ouvre le choix du son), « Voir un exemple » dessous.
- **« Tes derniers montages »** :
  - le montage gardé sur ce téléphone (« Reprendre ton dernier montage ? », la carte qui existait) ;
  - pour Creator Plus, les 3 derniers projets en ligne (la même liste que la Galerie, demandée une fois), avec leur
    couverture ; un toucher ouvre le projet (la même question qu'avant de quitter un montage en cours).
- La carte « Choisis ton son » (TikTok / Clip, cadre d'import, « Essayer avec un exemple », « Continuer ») n'est plus sur
  l'accueil : elle revient **entière** dès qu'un son est choisi (étape Son). Ses messages d'erreur restent visibles.
- Rien sous ce premier écran sur téléphone (voir les retours du 23/11 ci-dessus).

## 4. Ouverture « le glaçon » (démo n° 1)
- La même timeline GSAP que la démo HyperFrames, rejouée sur la vraie page (`src/splash.js`, servi à part :
  `/assets/splash.<version>.js` ; la page ne porte que quelques lignes qui décident et affichent le rideau) : le glaçon tombe, la
  mascotte dort dedans, se réveille, il éclate, elle saute et fait coucou, « Stalak » lettre par lettre, le rideau bleu se
  lève sur l'accueil, la mascotte rejoint sa place (celle du titre, ou celle de la carte « Nouveau montage »), puis le titre,
  le bouton et la barre du bas entrent.
- **Éclats accélérés** (retour du propriétaire) : 0,62 s au lieu de 1,1 s. Le rideau se lève à 4 s (4,35 s dans la démo).
  Mesuré : 5,4 s en tout, chargement et entrée de l'accueil compris.
- **Une fois par session** (retenu dans l'onglet) ; **jamais** quand la page est ouverte pour autre chose (adresse avec
  `#…` : inscription, retour de paiement ou de TikTok ; projet en cours de réouverture) ; **un toucher la passe** (le reste
  défile 5 fois plus vite) ; **pas d'ouverture avec « réduire les animations »**, ni sur ordinateur, ni dans la version
  claude.ai.
- Si la bibliothèque n'arrive pas en 3 s (réseau lent), le rideau s'efface simplement.
- **GSAP 3.15 est servi par le site** (`/vendor/gsap-3.15.0.min.js`, 73 Ko, gardé un an par le navigateur), chargé
  seulement sur téléphone et jamais avec « réduire les animations ». Aucun appel à une adresse extérieure (vérifié).
- Les autres mouvements du lot (la barre qui descend quand le montage commence et remonte ; le haut de l'accueil qui entre
  quand on se connecte) sont aussi des timelines GSAP. Seule exception : l'enfoncement d'un bouton sous le doigt (0,12 s),
  en CSS.

## Ce qui ne rentre pas / à décider
1. **Image de la mascotte** : toujours en 266 px. Dans l'ouverture elle fait environ 210 px de large à l'écran, donc un peu
   floue sur un iPhone (écran ×3). Les images « dort » et « surprise » du glaçon font 256 px : même limite.
2. **Liens légaux, cookies, langue** : plus de pied de page sur l'accueil du téléphone ; ils passent dans le profil au
   lot 2 (décidé). D'ici là, voir « Conséquences à connaître ».
3. **Glaçon d'aide** : il reste au-dessus de la barre sur l'accueil (décidé).
4. **« Stats » déconnecté ou sans TikTok** : ouvre le compte. À voir avec Réseaux sociaux si l'onglet doit proposer
   directement « Relier TikTok ».
5. **Temps avant le premier affichage** : pendant l'ouverture, le rideau bleu est la première chose affichée ; le titre
   de l'accueil n'apparaît qu'après (environ 4,5 s, une fois par session). À surveiller dans Lighthouse (score mobile).

## Inventaire pour le lot 3 : les réglages de l'éditeur face à la démo n° 7
Rien n'est retiré au lot 1. Voici ce que la démo de l'éditeur ne montre pas et où je propose de le mettre :
- **Son** (démo : TikTok / Clip, onde avec 2 poignées, lecture, « Changer de son ») : manquent **la durée** (liste), les
  flèches **« une mesure plus tôt / plus tard »** (début, et fin pour un clip), et **« Corriger le rythme »** (TAP, bips de
  vérification, ÷2, ×2, décaler). Proposition : un lien « Régler le rythme » sous la carte, qui ouvre une feuille.
- **Prises** (démo : vignettes, « + », « Filmer une prise ») : manquent, sur chaque
  prise, retirer / l'état de la synchro (« + Plans d'ambiance » est retiré, décision du 23/11). Les étoiles de la démo existent déjà (qualité de l'image de chaque prise).
- **Caméra** (démo n° 11) : le minuteur existe (Sans / 3 s / 5 s), la caméra avant / arrière aussi. La démo montre un
  **éclair (flash)** : à ajouter (décision du 23/11), voir le point 6 des décisions.
- **Paroles** (démo : Automatiques, Je colle mon texte, Sans paroles) : manquent **la langue chantée**, **« Importer un
  .txt »**, l'écran de **calage** (automatique ou au tap, recaler) et le **style du texte**
  (position, police, couleur, contour, taille, apparition, surlignage). Proposition : un 2e écran après le choix, et le
  style dans l'outil « Paroles » de l'étape Montage.
- **Montage** (démo : aperçu, bande des plans, 5 outils Coupes / Effets / Filtres / Paroles / Remixer, « Exporter ma
  vidéo ») : **ne rentrent pas dans 5 outils** : **Format** (16:9, 9:16, 4:5, 1:1) et **Cadrage** (Entière + flou, Remplir,
  Zoom), **Rythme** (Posé, Normal, Nerveux), **« Meilleures prises »**, le **zoom de
  la bande**, les actions sur un plan (**Changer de prise, Ajouter un plan, Garder ce plan, + Effet, Exclure ce passage**),
  et à l'export le **générateur de packs** (Creator Plus) et « Sans filigrane → Pro ».
  Proposition : un 6e outil **« Format »** (format + cadrage) ; Rythme et « Meilleures prises » dans « Coupes » ;
  les actions sur un plan dans une feuille qui monte quand on touche un plan ; le pack dans la feuille « Exporter ».
  **6 outils tiennent sur une ligne à 390 px (52 px chacun) mais pas à 320 px (iPhone SE) : la rangée défilera.**

## Fichiers
- Nouveaux : `src/mobile.css`, `src/splash.js`, `site_src/vendor/gsap-3.15.0.min.js`, `tests/ui/refonte_mobile_ui.py`.
- `src/markup.html` : haut de l'accueil (`#mhTop`, `#mhNew`, `#mhEx`, `#mhLastT`, `#mhList`) et la barre (`#tabBar`).
- `src/app.js` : bloc « refonte mobile, lot 1 » à la fin (`mobUi`, `mobList`, `mobTab`, `mobInit`), une ligne dans
  `updateNav`, les clés `tab.*` et `mh.*`.
- `build.py`, `build_site.py` : `mobile.css` ; pour le site, `splash.js` en tête de `<body>` et l'adresse de GSAP.
- **Pour Marketing** : les guides qui parlent du bouton « + Plans d'ambiance » ou de la voix seule sont à mettre à jour
  (`site_src/` : idées de clip, images `aide/*-broll.jpg`). `build_site.py` modifié ; sur téléphone, le haut de l'accueil (`.hero`) change de couleurs (texte
  noir sur glace, bouton bleu), ses textes non ; le compteur et « Sans / Avec Stalak » passent en texte noir sur l'accueil
  téléphone ; la première bande (avis) accroche ses glaçons couleur glace.
- **Pour Comptes** : la transcription depuis une voix seule n'est plus appelée par l'app (rien à changer côté serveur) ;
  la barre reste au-dessus de la Galerie et du compte (marge en bas de `.acctpage`) ; la pastille ouvre
  `apGo('pro', {from: 'menu'})` ; l'accueil appelle `clLoadList()` une fois pour Creator Plus. Aucun fichier de
  `functions/` ni `account.js` touché.
- **Pour Réseaux sociaux** : l'onglet « Stats » clique l'entrée `[data-am="tiktok"]` du menu du compte.

## Résultats des tests
(en cours)
