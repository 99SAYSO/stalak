# Ice the Beat — SPEC (pub Stalak, 25 s, 9:16)

Format : 1080 × 1920, 30 i/s, exactement 25,000 s, anglais américain. Brief : « Ice the Beat » (8 scènes), avec deux changements demandés par le propriétaire : « ZERO EDITING » devient « NO EDITING SKILLS. » ; ajout de « @stalak_app » sur la carte de fin.

## Règles tenues

- Vraie interface de Stalak seulement (captures faites sur l'app réelle), jamais inclinée en 3D ; seuls les éléments dessinés (cadres, éclats, illustrations) passent en 3D.
- Synchro des lèvres exacte : temps de la prise = temps du film − 1,452 s ; la vidéo n'est montrée que pour un temps du film compris dans [1,452 ; 13,45] ou dans [17,45 ; 24,45]. Partout ailleurs, ce sont des images fixes.
- Le plan de 9,04 s à 13,45 s reprend les plans 7 à 11 du vrai montage de Stalak (version 1 : 21 plans, 25,6 s).
- Phrase sur le temps : seulement « Your video's ready in about a minute » / « IN ABOUT A MINUTE. ». Aucun concurrent, aucun faux avis, aucun chiffre inventé.
- Logo : `assets/brand/icon.svg` et `wordmark.svg` repris tels quels (seul un reflet passe dessus, masqué à sa forme).
- Pas de filtre CSS sur les vidéos (entrées des cartes en profondeur, sans flou).

## Couleurs, polices, mesures

- Bleu #1f6fd6 (dominant), encre #0a0d14, blanc #ffffff, glace #d6ecff ; couleurs des prises : 1 #d6336c, 2 #3a6fe0, 3 #e0952c.
- Titres en Lilita One, contour encre de 7 px et ombre dure de 16 à 18 px ; textes secondaires en Rubik 700.
- Largeur des titres ≤ 860 px (zone sûre 80 %) ; bande sûre verticale : 168 à 1330 px.
- Perspective 3D : 900 à 1800 px ; caméra (poussées) : échelle 1 → 1,045 ou 1,05 ; secousses de 3 images.

## Plans (temps du film)

| Temps | Scène | Image | Voix off |
|---|---|---|---|
| 0–1,38 | S1 accroche | Écran presque noir ; fissure bleue qui grandit depuis le centre (déjà visible à l'image 0) ; tremblement à 1,05 | — |
| 1,382 | S1 choc | Flash blanc ; la plaque noire éclate en 27 éclats 3D qui volent vers la caméra ; fond bleu | — |
| 1,38–2,9 | S1 | 3 prises (cadres, pastilles 1-2-3) qui arrivent du fond (z −1200 → 0) ; « THREE » à 1,47, « TAKES. » à 1,83 (rotation 3D) ; poussée de caméra | « Three takes. » 1,45 |
| 2,9–5,3 | S2 promesse | Arrêt sur image + flash ; « ONE TRACK. » ; éclat de glace qui tourne en 3D ; les 3 cadres s'empilent en 3D ; « NO EDITING SKILLS. » mot à mot ; logo qui pivote + reflet ; coup de fouet à gauche | « One track. » 2,95 · « No editing skills. » 3,85 |
| 5,3–7,9 | S3 entrée | Vraies captures (choix du son, son chargé, prises) ; illustration « morceau » (note + forme d'onde du vrai son) qui tombe dans l'app ; 3 mini-prises qui volent et tombent dans l'app | « Drop in your track. » 5,35 · « Add your takes. » 6,78 |
| 7,9–9,04 | S4 synchro | « AUTO-SYNC. » ; vraie liste des 3 prises synchronisées ; ligne de synchro ; 3 formes d'onde (même son, 3 prises) décalées qui se calent ; zoom à travers la fenêtre | « Stalak syncs your lips and cuts to the beat. » 7,88 |
| 9,04–13,45 | Montage | Plans 7 à 11 du vrai montage, plein écran, flash à chaque coupe, deux poussées ; « CUT ON BEAT. » (rotation 3D) et vraie timeline (« Version 1 · 21 shots · 25.6 s ») | |
| 10,57–13,45 | S5 résultat | « LYRICS. EFFECTS. YOUR VIBE. » en karaoké (lignes qui basculent en 3D, éclats autour de « EFFECTS. ») | « Lyrics, effects, your vibe. » 11,0 |
| 13,45–18,17 | S6 récompense | La dernière image se fige et se fissure ; 3 cadres flottants à 3 profondeurs qui tournent (parallaxe) ; cristaux de glace ; « YOUR VIDEO. » / « IN ABOUT A MINUTE. » ; les cadres se rejoignent et la vidéo joue à 17,45 ; fouet vers le haut | « Your video's ready in about a minute. » 15,2 |
| 18,17–21,29 | S7 friction | Fenêtre de navigateur « stalak.app » qui se redresse en 3D ; « NO DOWNLOAD. » puis « NO SIGN-UP. » ; neige ; zoom à travers la fenêtre | « No download. » 18,25 · « No sign-up. » 19,78 |
| 21,29–25,0 | S8 marque | Fond bleu qui part du logo ; logo + nom qui basculent en 3D, reflet ; carte « MAKE YOUR NEXT SNIPPET HIT DIFFERENT. » (charnière 3D) ; stalactites + gouttes ; « stalak.app », « TRY IT FREE. », @stalak_app (Instagram, TikTok) affichés 2,1 à 2,6 s ; neige jusqu'à la fin | « Stalak. » 21,33 · « Make your next snippet hit different. » 22,3 |

## Son

- Musique : « neva die » de 99Sayso (`song.mp3`, sa voix incluse), baissée à 0,09–0,10 sous la voix off et remontée entre les phrases ; fondu de 1,2 s à la fin.
- Voix off : Flora, modèle Google Gemini TTS (le fichier choisi par le propriétaire, `Fun_Video_App.wav`), normalisée à −16 LUFS et −1,5 dBTP, coupée en 12 phrases.
- Effets (bibliothèque fournie avec HyperFrames) : basses sur les chocs (1,34, 7,09, 17,83, 18,21, 21,25), éclats « sparkle » (fissure, gel, stalactites), whooshs sur les fouets, « pop » sur les chutes dans l'app et les 3 formes d'onde qui se calent. Le pic de chaque effet tombe 1 image après l'action.
