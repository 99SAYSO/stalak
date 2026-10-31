# Stalak — « Unfreeze your snippet » (promo v3, 9:16)

GOAL : un rappeur qui scrolle se reconnaît dans les 2 premières secondes (40 min de montage pour 15 s), comprend en 3 étapes ce que fait Stalak, voit le vrai résultat, et sait exactement quoi faire : ouvrir stalak.app, sans rien installer.

OUTPUT : HyperFrames, 1080 × 1920, 30 i/s.

TIME : 28,0 s × 30 = 840 images. Instru de « neva die » à 157 BPM : un temps = 0,3822 s = 11,47 images, une mesure = 1,5287 s.
- La musique commence à 40,095 s dans l'instru. Les mesures tombent donc aux temps du film suivants : 0,443 · 1,971 · 3,500 · 5,029 · 6,557 · 8,086 · 9,615 · 11,143 · 12,672 · 14,201 · 15,729 · 17,258 · 18,787 · 20,316 · 21,844 · 23,373 · 24,902 · 26,430 · 27,959.
- Coupure de la basse : de 8,685 à 11,908. Retour de la basse : 11,908. Grosse mesure : 12,672.
- Les vidéos du rappeur sont calées sur l'instru : temps de la prise = temps du film − 8,946 (même calage que la v2). La ligne « After all this time, baby » (0:05.83) tombe ainsi à 14,776 s.

LOOK :
- **Sol** : le monde de glace de Stalak, en 3D réaliste (retour du propriétaire : « trop carton, jouet, trop cubique »).
  - Un ciel froid tout autour : bleu Stalak #1f6fd6 à l'horizon, presque blanc en haut (#d4ecff), bleu nuit en bas (#051c4f). La lumière vient d'en haut à gauche, avec des rayons très discrets.
  - Des morceaux de glace aux formes cassées et irrégulières (bords fondus, faces planes), jamais de cubes ni de boules ; de la poussière de glace et une neige légère.
- **Encre** : #0a0d14 (contours de 6 px, comme l'app) ; blanc #f6faff ; glace #cfe6ff.
- **Accent** : #ffe14d (jaune), un seul mot par plan : « 40 min », « stalak.app », « beat », « done ».
- **Titres** : Lilita One (mots-clés, contour encre 6 px) et Rubik 700/400 (phrases), 84 à 150 px.
- **Matières** :
  - mascotte 3D (Meshy 7, en couleurs, avec squelette) éclairée par une lumière principale chaude en haut à gauche et un contre-jour froid ;
  - le bloc de glace : vraie réfraction (transmission 1, IOR 1,31, épaisseur 0,16), givre sur les arêtes, bulles d'air, fissure fine qui accroche la lumière ;
  - les morceaux et les éclats : shader léger (le ciel vu à travers la glace, un rebond intérieur, reflets, éclats des lumières, arêtes givrées) ;
  - la crevasse (dans la fissure) : murs de glace bleue en relief, lumière au fond ;
  - l'objectif : profondeur de champ (la mise au point suit le sujet), halo seulement sur les reflets plus clairs que le blanc, tonalité neutre, léger vignettage ;
  - la lumière : des « softbox » pour les reflets, une lumière principale chaude en haut à gauche, un contre-jour froid à droite ;
  - interface : les vraies captures de l'app et les cartes « appcard » de la v2 (fond blanc, bord encre 6 px, ombre dure de 12 px).
- **Mélange 2D / 3D** :
  - en 2D : la mascotte quand elle joue (poses de l'app), les clips à plat, les textes, les traits et flashs dessinés ;
  - en 3D : la glace, les éclats, la mascotte aux grands moments, le téléphone et le logo.

OBJECTS :
- **La mascotte** : parka bleue, capuche de fourrure blanche, dreadlocks perlées, moufles noires, pull « AA », bottes noires.
- **Les clips** : cartes 9:16 avec une vraie image des prises et un bord blanc de 5 px.
- **L'iPhone** : bord titane, Dynamic Island, la vraie app dans Safari, avec la barre d'adresse.
- **Le fichier son** : une carte « neva die · MP3 » avec une icône de note.
- **La timeline** : les vrais plans de Stalak (21 coupes, couleurs des prises 1, 2 et 3).
- **Les bulles d'avis** : bulles de glace, avatar en glace avec l'initiale, pseudo, étiquette « beta tester ».

MOTION :
- **Courbes** : entrée `expo.out` ; caméra `power2.inOut` ; plongée et sortie `power3.in` ; ressort sur la mascotte et les tampons `back.out(1.6)` (amortissement d'environ 0,5).
- **Durées** :
  - mots qui arrivent : flou de 6 px vers 0 en 0,13 s, un mot toutes les 0,067 s ;
  - un titre posé ne bouge plus ;
  - les sorties durent 40 à 50 % du temps de leur entrée.
- **Transitions** :
  - chaque fois, un objet du plan devient le plan suivant, sur un temps du beat ;
  - au maximum 1 coupe franche sur 3 ;
  - flou de mouvement de 6 à 12 px sur les mouvements rapides.

SHOTS (images à 30 i/s) :

| # | Images | Mouvement principal | Ce qu'on lit (durée) | Son | Passage au plan suivant |
|---|---|---|---|---|---|
| 1 | 0–60 | Mascotte 3D gelée dans un bloc de glace, clips 2D empilés ; la caméra tourne de 8° par seconde et avance de 6 % | « me spending **40 min** / editing a 15 sec snippet », déjà à l'écran à l'image 0 (2 s) | instru étouffée (passe-bas 600 Hz), craquement de glace | la caméra entre dans une fissure (0,35 s, `power3.in`) |
| 2 | 60–105 | Dans la fissure : une crevasse de glace en 3D, lumière au fond ; des clips coupés à la main tombent en désordre | « cut. » × 3, sur les temps 2,354 / 2,736 / 3,118 | clic sur chaque « cut », montée | la fissure s'ouvre en flash blanc sur la mesure 3,500 |
| 3 | 105–151 | Le bloc explose : 150 éclats de glace cassée vers la caméra, de la poudre de glace, la mascotte sort en faisant un tour, puis le logo STALAK claque | **STALAK** | impact, l'instru s'ouvre | les éclats retombent et dessinent le contour de l'iPhone |
| 4 | 151–243 | L'iPhone pivote (35° → 0), « stalak.app » se tape (10 lettres, 0,07 s chacune), l'app s'ouvre | « just open **stalak.app** » (2,5 s) | frappe au clavier, clic | plongée dans l'écran, son bleu devient le décor |
| 5 | 243–288 | Le fichier son tombe et sa forme d'onde se déroule en ruban de glace | « 1. drop your song » | la basse coupe à 8,685, quand le fichier se pose | le ruban s'enroule en bord de carte |
| 6 | 288–334 | 3 cartes de prises arrivent en tournant (décalage de 0,08 s) | « 2. add your takes » | souffles courts | les cartes basculent à plat et forment la timeline |
| 7 | 334–426 | Timeline vue de dessus. À 11,908, la basse revient et une coupe tombe sur chaque temps (6 coupes), avec un éclat de glace ; la caméra glisse le long de la timeline | « 3. it cuts on the **beat** » | clics sur les coupes, impact à 12,672 | la caméra glisse jusqu'à la tête de lecture, qui s'ouvre sur la vidéo |
| 8 | 426–518 | La vraie vidéo plein cadre (bords arrondis) ; les paroles arrivent à 14,776 | « your snippet. **done.** » ; « After all this time, baby » | instru pleine | sur la mesure 17,258, l'image se divise en 3 |
| 9 | 518–564 | 3 téléphones 3D en éventail (−18°, 0°, 18°), 3 prises différentes en même temps | « hit shuffle → a brand-new edit » | souffle | les téléphones s'écartent, des bulles montent entre eux |
| 10 | 564–701 | 3 bulles d'avis qui montent et restent (18,9 / 19,9 / 20,9) | les 3 vrais avis (jusqu'à 23,0) | notification sur chaque bulle | les bulles éclatent en flocons qui recouvrent l'écran |
| 11 | 701–840 | Les flocons forment le logo ; tampons « no download. » et « no sign-up. » ; URL géante avec curseur ; la mascotte 3D danse (animation Meshy), puis regèle à 27,3 : retour à l'image 0 | **stalak.app** (24,3 → 27,3) · « try it free » · @stalak_app | impact sur 23,373, craquement final, fondu de la musique | boucle |

**Les 3 avis** (traduits fidèlement de leurs vrais messages, avec leur accord) :
- **Bloody** : « I was so done editing everything myself. This is a lifesaver, you're a boss ❤️❤️ »
- **haeine** : « stalak is crazy, it saved me so much time on my edits 🙏 »
- **Kazzy** : « got my next 30 tiktoks ready already lmao, took me 5 min, it's insane »

Pas de photo de profil : avatar en glace avec l'initiale. Étiquette « beta tester » sur chaque bulle, parce que ce sont des testeurs de la bêta et des proches du propriétaire. Aucune note en étoiles : il n'en existe pas.

**Zone sûre** :
- Le texte et le produit restent entre y = 168 et y = 1330, et entre x = 80 et x = 920 : rien sous la colonne de boutons à droite, ni sous la description en bas. C'est le cadre du guide vertical de HyperFrames, plus strict en bas que la v2 (1400).
- Seuls le fond, la neige, les éclats en vol et la glace sortent de ce cadre.

BANNED :
- les réglages par défaut du guide (`references/spec.md`) ;
- « 5 étoiles » ou tout avis inventé ;
- le nom d'une autre app ;
- tout chiffre que le propriétaire n'a pas donné. Les chiffres autorisés : 40 min (son vrai temps de montage), 15 sec, 30 (le pack, cité dans l'avis de Kazzy) ;
- les textes qui bougent pendant qu'on les lit ;
- les fondus enchaînés entre deux mondes ;
- les halos et les particules décoratives, sauf la neige, la poussière de glace et les éclats qui ont une cause ; le halo de l'objectif seulement sur les vrais reflets ;
- les cubes, les boules, les formes de jouet et l'éclairage plat (retour du propriétaire).

QA (images à vérifier) :
- 0 : le hook est déjà lisible ;
- 30 : la mascotte est dans la glace ;
- 96 : « cut. » ;
- 112 : l'explosion ;
- 200 : « stalak.app » se tape ;
- 270 : le fichier son ;
- 315 : les cartes ;
- 360 : la tension ;
- 390 : une coupe sur le beat ;
- 450 : la vidéo et les paroles ;
- 540 : les 3 téléphones ;
- 650 : les 3 avis lisibles ;
- 760 : la carte de fin (URL) et la danse ;
- 839 : la mascotte regelée.

Pour chaque image : zone sûre respectée, texte d'au moins 28 px, pas de texte coupé.
