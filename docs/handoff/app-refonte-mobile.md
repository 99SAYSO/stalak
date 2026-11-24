Statut : PRÊT (lots 1 et 2 ; lots 3 et 4 à venir sur la même branche)
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

## Demande renvoyée le 24/11 (1 h 13) : écrans 13 à 15 ajoutés aux lots
Lot 1 déjà fait (ci-dessous). Répartition proposée au propriétaire pour la suite, sur la même branche :
- **Lot 2** : connexion, profil (langue, cookies, liens légaux), tirer pour rafraîchir, **onboarding (n° 13)** au premier
  lancement après l'ouverture (avec Comptes : réponses gardées sur le compte).
- **Lot 3** : éditeur en 4 étapes et caméra (avec le flash).
- **Lot 4** : tutoriel, glaçon d'aide, écran après achat, choix du paiement, **paywall (n° 14)** et **offre à 1 € sur
  l'écran de fin (n° 15)** (avec Comptes ; la demande du Chef dit ces deux écrans « en attente du ok final du propriétaire »).

# Lot 2 : connexion, profil, tirer pour rafraîchir, onboarding (24/11)

Accord du propriétaire le 24/11 à 1 h 17 (maquette du lot 1 : « oui » ; onboarding au lot 2, paywall et offre à 1 € au lot 4 : « oui »).
Tout est sous 900 px et seulement sur stalak.app (la version claude.ai n'a pas de compte). Skills : stalak-da, motion-design,
taste, webapp-testing.

## Ce qui est fait
1. **Connexion / inscription en plein écran** (démo n° 2) : scène bleue (rayons, neige, glace en haut), mascotte sur sa
   butte avec une bulle, la barre du bas part. **L'e-mail d'abord**, puis « Continuer » fait arriver le reste du **même
   formulaire** (mot de passe, « Mot de passe oublié ? », pseudo à l'inscription). Google / Apple / Microsoft passent sous
   le formulaire, après « ou ». Les règles des comptes ne changent pas : mêmes champs, mêmes boutons, même envoi au serveur.
2. **Profil, son écran à lui** (démo n° 3) : photo dans un rond, nom, formule, e-mail ; cartes « Ma formule » (ouvre les
   formules, ou « Gérer » pour un abonné ; **la phrase d'abonnement du compte y reste écrite en entier** : renouvellement,
   essai et date du 1er prélèvement, annulation) et « TikTok » (si TikTok est proposé) ; une liste : Mes montages, Langue
   (FR / EN), Aide, « Photo, pseudo, mot de passe », « Infos légales et guides » ; « Se déconnecter » en bas.
   - La roue en haut à droite (et la ligne « Photo, pseudo, mot de passe ») ouvre **les réglages** : ce sont les cartes
     d'avant, toutes là (photo, pseudo, e-mail, mot de passe, comptes liés, abonnement, galerie, langue, se déconnecter,
     supprimer mon compte). « Retour » revient au profil.
   - **« Infos légales et guides »** : une feuille qui reprend les liens du pied de page du site (tarifs, conditions,
     confidentialité, remboursement, mentions légales, guides…), lus dans la page : toujours les mêmes qu'en bas du site.
     « Gérer les cookies » est le lien vers la page de confidentialité, comme dans le pied de page.
3. **Tirer pour rafraîchir sur « Montages »** (démo n° 4) : la page descend, fond bleu et flocons derrière, la capuche de
   la mascotte dépasse, surgit au seuil (« Quoi de neuf ? »), regarde à gauche et à droite pendant que la liste est
   redemandée au serveur, replonge, les vignettes reviennent.
4. **Onboarding** (démo n° 13) : au premier lancement sur ce téléphone, après l'ouverture. Une question par écran, barre
   jaune, la mascotte change de tête et répond dans sa bulle, plusieurs choix là où c'est dit, retour en arrière, puis
   l'écran de chargement (cercle jaune, une phrase par réponse) et « Ton plan est prêt, <nom> ! » → « Faire ma 1re vidéo ».
   Jamais deux fois ; jamais par-dessus un montage, une page du compte ou un lien.

## Textes des démos (décision du propriétaire du 24/11, 4 h 48 à 4 h 58)
Les textes des démos validées sont repris **mot pour mot** (voir la section « Lot 2, suite du 24/11 (4 h 54) » en bas).
Les écarts que cette section listait sont annulés, sauf le bouton « Passer » et le profil, validés tels quels.
Aucun texte d'une démo validée ne se change sans demander au propriétaire.

## Pour Comptes (rien de `functions/` ni `account.js` n'est touché)
- **Réponses de l'onboarding** : gardées sur le téléphone (`localStorage`, clé `stalak:onb` :
  `{ v: 1, done | skipped: <date>, a: { name, genres[], onPlatforms: 'oui'|'non'|'', links: { spotify, apple, soundcloud,
  instagram }, listeners: 'a'..'d'|'', posts[], blocks[], target: 'a'..'d'|'', goals[] } }`). **Contrat attendu** : si
  `StalakAccount.onboarding(answers)` existe et que la personne est connectée, l'app l'appelle une fois (puis note `sent`) ;
  sinon rien n'est envoyé. À Comptes de créer cette fonction et la route (par exemple `PUT /api/me/onboarding`).
- **Juridique** : ces réponses (liens Spotify / Apple Music / SoundCloud / Instagram, auditeurs déclarés) sont des données
  personnelles dès qu'elles partent sur le compte : à ajouter à la politique de confidentialité avant d'activer l'envoi.
- Les écrans du compte sont **habillés**, pas réécrits : `src/mobile2.js` range et décore les éléments existants
  (`#apLogin`, `#apAccount`) et clique sur les boutons existants (`#apOut`, `#apSubGo`, `#ttkStats`…). Un changement de
  Comptes dans ces écrans continue de marcher ; s'il ajoute une carte au compte, elle apparaît dans « réglages ».
- L'app expose `window.StalakM` (lecture seule) pour ce fichier.

## Fichiers du lot 2
- **Nouveau** `src/mobile2.js` → servi à part (`/assets/mobile2.<version>.js`), chargé par l'app **seulement sur
  téléphone et sur stalak.app** ; il porte son style et ses textes FR / EN. `index.html` ne grossit presque pas.
- `src/app.js` (`mobTell`, `window.StalakM`, chargement du fichier), `src/mobile.css` (la barre part sur les écrans plein
  écran), `build_site.py` (le fichier à part, `window.STALAK_M2`) → **Marketing** prévenu ici.
- Images de la mascotte : `/emoji/*.webp` déjà servies par le site (256 px : un peu floues sur un écran ×3).
- Nouveau test `tests/ui/refonte_mobile2_ui.py` (serveur de test avec de vrais comptes).

## Ajouts du 24/11 (après la série complète des tests)
- **« Essaie avec ton son »** (fin de l'exemple) : sur téléphone, le carré d'import n'est plus sur l'accueil ; c'est le gros
  bouton de l'accueil (« Choisir mon son » ou la carte « Nouveau montage ») qui est mis en avant, avec le clavier dessus.
- **Version claude.ai sur téléphone** (pas de compte, donc pas de profil à venir) : elle garde son pied de page léger sous
  l'écran (choix de la langue), et sa barre n'a que « Accueil » et « + » (pas d'onglet qui ne fait rien).
- **Sur téléphone, le menu du compte n'est plus affiché sur l'accueil** : Galerie, Stats et Profil sont dans la barre ;
  « Se déconnecter » et « Gérer mon abonnement » sont dans le profil ; l'aide reste sur le glaçon. Dans l'éditeur, l'en-tête
  et le pied de page du site sont encore là (jusqu'au lot 3).
- **Pour les lots suivants** : l'ajout du Chef du 23/11 à 23 h (onboarding n° 13, paywall n° 14, offre à 1 € n° 15) est lu ;
  rien n'en est fait dans le lot 1.

## Résultats des tests (24/11, sur la branche, site reconstruit)
- nouveau `refonte_mobile_ui` **102/102** (seul ; lancé en même temps que d'autres séries, la durée de l'ouverture peut
  dépasser la borne de 7,5 s : 7,75 s mesuré une fois sous charge, 5,4 s machine au repos) ;
- serveur `tests/backend/run.mjs` **121/121** ;
- `accueil_a_ui` **77/77**, `vente_ui` **63/63**, `audit_ui` **122/122**, `audit611_ui` **93/93**, `projet_local_ui` **52/52**,
  `essai_pro_ui` **187/187**, `fenetre_pro_ui` **84/84**, `fin_export_ui` **98/98**, `partager_ui` **92/92**,
  `tiktok_ui` **220/220**, `exports_rates_ui` **80/80**, `apercu_depart_ui` **10/10**, `fluidite_ui` **30/30**,
  `filtres_ui` **106/106**, `export_pub_ui` **22/22**, `liens_cmp_ui` **58/58**, `pied_de_page_ui` **842/842**,
  `plans_ui` **39/39**, `achat_ui` **23/23**, `gallery_ui` **48/48**, `help_ui` **42/42**, `support_ui` **64/64** ;
- **tests adaptés au nouvel accueil du téléphone** (ils cherchaient le menu du compte, le carré d'import ou le pied de page
  sur l'accueil du téléphone) : `audit611_ui`, `tiktok_ui` (l'onglet « Stats » ouvre « Mes stats »), `gallery_ui` (barre du
  bas, déconnexion par le profil), `pied_de_page_ui` (pas de pied de page sur l'accueil du téléphone, il est mesuré dans
  l'éditeur), et le contrôle « l'accroche ne passe pas sous la mascotte » (ordinateur) qui regarde maintenant ligne par
  ligne (avec DM Sans la phrase tient sur 2 lignes, la 2e est centrée et loin de la mascotte) ;
- **comme sur `main`** (vérifié en lançant le même test sur `main`) :
  - `animations_ui` 28/44 (animations de Marketing) et `formules_ui` 136/137 (filigrane dans chaque image) ;
  - `clip1_ui` 83/87 : `.band-frost a:hover` de `src/bands.css` (Marketing) n'est pas dans `@media (hover:hover)` ;
  - `lyrics_ui` 62/73 : l'exemple ne dure plus que 12 s (le test attend un passage de plus de 30 s coupé en morceaux) et
    la page des formules n'affiche plus la phrase « Les paroles automatiques font partie de Stalak Pro ».
- À lancer avec `http://localhost:…` pour `lyrics_ui` et `support_ui` (leur cookie de test est posé sur `localhost`).

## Lot 2 : résultats des tests (24/11, sur la branche, site reconstruit)
- nouveau `refonte_mobile2_ui` **124/124** (connexion, profil, tirer pour rafraîchir, onboarding, mouvements réduits,
  ordinateur inchangé, version claude.ai).
- `refonte_mobile_ui` 102/102, `audit611_ui` 93/93, `audit_ui` 122/122, `accueil_a_ui` 77/77, `vente_ui` 63/63,
  `projet_local_ui` 52/52, `fenetre_pro_ui` 84/84, `fin_export_ui` 98/98, `partager_ui` 92/92, `exports_rates_ui` 80/80,
  `apercu_depart_ui` 10/10, `fluidite_ui` 30/30, `filtres_ui` 106/106, `export_pub_ui` 22/22, `liens_cmp_ui` 58/58,
  `pied_de_page_ui` 842/842, `plans_ui` 39/39, `achat_ui` 23/23, `help_ui` 42/42, `support_ui` 64/64, serveur 121/121.
- **Trois tests adaptés au profil du téléphone** (sur téléphone, les anciennes cartes du compte sont derrière la roue
  « Réglages ») : `essai_pro_ui` **193/193** (vérifie en plus que la carte de la formule du profil écrit « Essai Pro : encore
  3 jours », puis ouvre les réglages pour « Gérer ou annuler »), `tiktok_ui` **224/224** (carte TikTok du profil, puis
  réglages pour « Relier » / « Délier »), `gallery_ui` **48/48** (ligne « Mes montages » et « Se déconnecter » du profil).
- **Un vrai défaut trouvé et corrigé** par `tiktok_ui` : la carte TikTok du profil restait cachée quand TikTok répondait
  après l'ouverture du profil. Le profil suit maintenant les cartes du compte qui arrivent en retard.
- Échecs identiques sur `main` (pas des régressions) : `animations_ui` 28/44, `formules_ui` 136/137, `clip1_ui` 83/87
  (`.band-frost a:hover`, Marketing), `lyrics_ui` 62/73.
- À savoir : lancés à plusieurs en même temps, `refonte_mobile_ui` (durée de l'ouverture) et `audit611_ui` peuvent échouer
  sur une machine chargée ; seuls, ils passent.
- `index.html` : 394,6 Ko (limite 400).

## Lot 2, suite du 24/11 (3 h 22) : les réponses de l'onboarding vont sur le compte
Demande du Chef : ne pas attendre `StalakAccount.onboarding`, utiliser ce que Comptes a mis en ligne (`saveArtist`, `artist`,
`PUT /api/artist`, section 8 de `docs/handoff/compte-mesure-et-offre-1-euro.md`). `origin/main` (10e90da) est fusionné.
- **Noms et listes fermées de Comptes** repris tels quels dans `src/mobile2.js` : `artistName`, `genres`, `onPlatforms`
  (vrai / faux), `links` (`spotify`, `appleMusic`, `soundcloud`, `instagram`), `listenersNow` (`lt100` `100_1k` `1k_10k`
  `gt10k`), `postsOn`, `blockers` (`few_views` `editing_time` `no_ideas`), `listenersGoal` (`1k` `10k` `100k` `1m`), `goals`
  (`song_launch` `post_more` `fill_concerts`).
- **Envoi** dès que la personne est connectée, et à sa connexion si elle a répondu avant. Une seule fois (`sent` dans
  `localStorage 'stalak:onb'`, version 2).
- **Seulement ce qui a été répondu** est envoyé : une question passée n'efface rien. Après « Passer », les réponses déjà
  données partent aussi.
- **Liens** : même règle que Comptes, vérifiée dans le téléphone. Un lien d'un autre site est dit sous le champ avant de
  continuer (« Ce n'est pas un lien Spotify. Corrige-le ou efface-le. »). Si le serveur refuse quand même (`bad_link`), le
  reste est renvoyé sans les liens.
- **Autre téléphone, même compte** : si `artist()` rend un profil déjà répondu, rien n'est redemandé. Limite : si le compte
  n'est pas encore chargé quand l'onboarding se décide (premier lancement), il peut s'afficher une fois.
- Décision du propriétaire remplacée le 24/11 à 4 h 54 : voir la section suivante.
- Pas fait ici (reste « App » de Comptes, pour les lots suivants) : `onboarding_etape_N`, `montage_lance`, la question
  hebdomadaire des auditeurs dans « Stats » (`saveListeners`, `listenersDue`).

### Résultats de la série complète (24/11, après la fusion de main, site reconstruit)
- `refonte_mobile2_ui` **145/145** (en plus : envoi à la connexion avec les noms de Comptes, envoi après « Passer », lien
  refusé, autre téléphone). Le serveur de test fait tourner les vraies routes de Comptes.
- Passent : `refonte_mobile_ui` 102/102, `audit_ui` 122/122, `accueil_a_ui` 77/77, `vente_ui` 63/63, `mesure_ui` 114/114,
  `essai_pro_ui` 193/193, `tiktok_ui` 224/224, `gallery_ui` 48/48, `projet_local_ui` 52/52, `fenetre_pro_ui` 84/84,
  `fin_export_ui` 98/98, `exports_rates_ui` 80/80, `apercu_depart_ui` 10/10, `fluidite_ui` 30/30, `filtres_ui` 106/106,
  `export_pub_ui` 22/22, `liens_cmp_ui` 58/58, `pied_de_page_ui` 842/842, `plans_ui` 39/39, `achat_ui` 23/23, `help_ui`
  42/42, `support_ui` 64/64, serveur 126/126.
- **Deux séries cassées sur `main` depuis la fusion de Comptes** (mêmes échecs sur `origin/main` 10e90da reconstruit seul,
  donc pas de ce lot) — **à transmettre à Comptes** :
  - `audit611_ui` 89/93 : « les scripts à part, chargés après le premier affichage » (le nouveau `/assets/consent.*.js` et
    un script en ligne de plus) ;
  - `partager_ui` 88/92 : « l'explication et la légende à copier » (le bloc de l'offre à 1 €, `dvOffer1`, est maintenant
    placé avant).
- Échecs anciens, identiques sur `main` : `animations_ui` 28/44, `formules_ui` 136/137, `clip1_ui` 83/87, `lyrics_ui` 62/73.
- `index.html` : 395,1 Ko (limite 400).

## Lot 2, suite du 24/11 (4 h 54) : textes des démos validées, mot pour mot
Demande du Chef (décisions du propriétaire, 4 h 48 à 4 h 58). `origin/main` fusionné (commits ff8195a et b1d4222 compris).
- **Connexion** (démo n° 2) : titre « Connecte-toi pour **garder tes montages** », dessous « Retrouve-les sur tous tes
  appareils. ». Sur cet écran, cette phrase remplace « Pas besoin de compte… » (qui reste sur « Créer un compte »).
- **« Colle tes liens »** (démo n° 13) : « On s'en sert pour suivre tes écoutes ».
- **Chargement** : « Tu pars de **100 à 1 000** auditeurs par mois », « Rap et drill : coupes calées sur des tempos
  rapides », « Format **9:16** pour TikTok et Reels », « Objectif : **10 000 auditeurs** par mois ».
- **Plan** : « Rap et drill, sur TikTok et Reels », « De 100-1 000 à 10 000 auditeurs par mois », « 3 vidéos par semaine,
  coupées sur le rythme », « Tes auditeurs suivis chaque semaine dans « Stats » », « Ta 1re vidéo en 1 minute ».
- Les parties qui viennent des réponses (genres, réseaux, auditeurs) suivent ce que la personne a choisi ; le reste est
  fixe. Quelqu'un qui ne répond à rien voit les 3 dernières lignes du plan.
- **Inchangés** (validés) : le bouton « Passer », le profil.
- Anglais : traduction directe des mêmes phrases.

### Résultats de la série complète (24/11, 6 h 30, après la fusion de main et les textes des démos, site reconstruit)
- `refonte_mobile2_ui` **142/142** (les textes des démos sont vérifiés mot pour mot : connexion, liens, chargement, plan).
- Passent : `refonte_mobile_ui` 102/102, `audit_ui` 122/122, `accueil_a_ui` 77/77, `vente_ui` 63/63, `mesure_ui` 114/114,
  `analytics_ui` 76/76, `essai_pro_ui` 193/193, `tiktok_ui` 224/224, `gallery_ui` 48/48, `projet_local_ui` 52/52,
  `fenetre_pro_ui` 84/84, `fin_export_ui` 98/98, `exports_rates_ui` 80/80, `apercu_depart_ui` 10/10, `fluidite_ui` 30/30,
  `filtres_ui` 106/106, `export_pub_ui` 22/22, `liens_cmp_ui` 58/58, `pied_de_page_ui` 842/842, `plans_ui` 39/39,
  `achat_ui` 23/23, `help_ui` 42/42, `support_ui` 64/64, serveur 132/132.
- Toujours cassés sur `main` depuis la fusion de Comptes (pas de ce lot, à transmettre à Comptes) : `audit611_ui` 89/93,
  `partager_ui` 88/92.
- Échecs anciens, identiques sur `main` : `animations_ui` 28/44, `formules_ui` 136/137, `clip1_ui` 83/87, `lyrics_ui` 62/73.
- `index.html` : 395,1 Ko (limite 400).
- **Maquette validée par le propriétaire** le 24/11 à 6 h 46 (« oui elle me va ») : lots 1 et 2 prêts à fusionner.
