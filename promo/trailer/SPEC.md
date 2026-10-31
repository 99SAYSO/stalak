# Stalak — « Before midnight » (bande-annonce v4, 9:16)

GOAL : un rappeur qui scrolle se reconnaît (son son sort, son snippet n'est pas monté), voit le temps passer puis revenir, comprend ce que fait Stalak en 3 étapes, et retient un chiffre vrai : 40 min à la main, 3 min avec Stalak. Il sait quoi faire : ouvrir stalak.app, sans rien installer.

OUTPUT : HyperFrames, 1080 × 1920, 30 i/s. Voix off (Gemini 3.1 Flash TTS, voix Achird, anglais américain), instru de « neva die » à 157 BPM.

TIME : environ 35 s (la longueur exacte vient de la voix, `timing.json`). Un temps = 0,3822 s = 11,47 images.

STYLE DE RÉFÉRENCE : la pub « Spenda 2.0 » de WizzEdits. On reprend : noir et blanc en alternance, mots qui arrivent un par un avec la voix, un seul mot en couleur, écho sur le mot clé, anneau lumineux en fil rouge, iPhone 3D réaliste, objets en orbite autour d'un mot, carré qui devient le logo, fin tapée. Thème : le temps (l'horloge de l'idée 2).

LOOK :
- **Sol** : noir #0e0f13 (plat, 1,5 % de grain) et blanc #f5f6f8 (plat), en alternance par plan. La vraie prise du rappeur, assombrie à 55 %, ouvre le film.
- **Encre** : blanc #f5f6f8 sur le noir, noir #0e0f13 sur le blanc.
- **Accent** : le bleu Stalak #2f6fd6, sur un seul mot par plan : « 40 MIN », « beat », « 3 MIN », « Try it free ».
- **Titres** : TikTok Sans 800 (police de l'app), 118 px pour les mots clés, 76 px pour les phrases, interlettrage −2 %. Mots clés en écho : 7 copies empilées, décalées de ±1 ligne, flou 6 px, opacité qui décroît de 0,45 à 0,08, en bleu.
- **L'anneau** : un cercle de 760 px de diamètre, trait de 14 px, dégradé conique blanc → bleu → transparent, flou lumineux 40 px à 35 %. C'est l'horloge : une aiguille blanche de 10 px (les minutes), une courte de 14 px (l'heure), un cadran sans chiffres.
- **L'iPhone 3D** : three.js. Un iPhone titane, bords arrondis 0,13 u, Dynamic Island, écran avec les vraies captures de l'app, lumière principale chaude en haut à gauche, contre-jour froid à droite, reflets d'un environnement de studio. Il arrive en tournant de 35° à 0°.
- **Profondeur** : ombre portée du téléphone 0/60/120 px à 55 %, flou de l'arrière-plan 10 px quand une carte est au premier plan, vignettage 6 %.

OBJECTS :
- **L'horloge** : l'anneau avec deux aiguilles et un affichage « 11:42 PM » (TikTok Sans 600, 64 px, tabulaire) sous l'anneau.
- **La timeline à la main** : une barre grise de 2 300 px, où des coupes tombent une à une, lentement, avec des sons de clic : le montage manuel.
- **Le carré** : un carré noir de 140 px, qui tourne sur lui-même et dont les coins s'arrondissent jusqu'à devenir l'icône Stalak (`assets/brand/icon.svg`), avec 24 rayons fins de 1 px.
- **Le fichier son** : une carte « neva die · MP3 » avec une note.
- **Les 3 prises** : 3 cartes vidéo 9:16 de 250 × 444 px, bord blanc 8 px, qui tournent en orbite autour du mot.
- **La timeline Stalak** : la barre, les 7 segments colorés par prise (1 rose #d6336c, 2 bleu #3a6fe0, 3 orange #e0952c), les coupes sur les temps 11,908 + k × 0,3822, et l'anneau réduit en tête de lecture.
- **La vidéo finie** : le vrai montage de Stalak (EDL de 21 plans, prise = film − OFF), avec les paroles « After all this time, baby » en TikTok Sans 800.
- **La barre d'adresse** : Safari, « stalak.app » tapé lettre par lettre.
- **Le bouton** : « Try it free », 420 × 88 px, bleu, texte blanc.

MOTION :
- Mots : arrivent en 0,13 s, flou 6 → 0 px, 20 px vers le haut, `expo.out`, un mot toutes les 0,08 s, calés sur la voix (chaque mot au moment où il est dit, à ±0,1 s).
- Écho : les copies apparaissent en 0,2 s et s'écartent de 0 à ±48 px, `power2.out`, puis restent.
- Caméra 3D : push de 0,5 s, `power2.inOut`.
- Téléphone : rotation Y 35° → 0° en 0,7 s, `expo.out`.
- Orbite : 3 cartes, 2,2 s pour un tour, rayon 380 px, inclinaison 28°.
- Coupes : chaque coupe tombe en 0,07 s, `power3.in`, avec un éclair blanc de 0,18 s.
- Sorties : 40 à 50 % de la durée de l'entrée. Un titre posé ne bouge plus.
- Transitions : chaque plan donne l'objet du suivant (la prise devient les morceaux, les morceaux deviennent une carte, la carte entre dans le téléphone…). Flash blanc de 2 images sur les passages noir → blanc.

SHOTS (les temps exacts viennent de la voix ; cibles) :

| # | Temps | Image | Texte | Voix | Son | Passage |
|---|---|---|---|---|---|---|
| 1 | 0–2 | La vraie prise, assombrie, l'anneau-horloge dessus à 11:42 PM | Your song drops at midnight | « Your song drops at midnight. » | tic-tac, instru étouffée | la prise s'efface dans le noir |
| 2 | 2–5 | Noir, l'anneau reste, l'aiguille tourne vite ; « 40 MIN » claque en bleu avec l'écho | Your snippet? Not edited. / **40 MIN** | « Your snippet isn't edited. That's forty minutes by hand. » | grave sur 40 MIN | flash blanc |
| 3 | 5–8 | Blanc : cut. trim. sync. again., un mot par temps, l'heure avance 11:52 → 12:22 AM | cut. trim. sync. again. / 12:22 AM | « Cut. Trim. Sync. Again… You missed the drop. » | clic sur chaque mot | noir |
| 4 | 8–11 | Noir : l'aiguille rembobine à 11:42 ; le carré tourne, devient l'icône, rayons, « Stalak » | Rewind. / Stalak | « Rewind. Meet Stalak. » | rembobinage, impact sur le logo | l'icône rétrécit et devient l'écran du téléphone |
| 5 | 11–14 | L'iPhone 3D arrive en tournant ; la vraie app « Pick your song » ; le fichier tombe, la forme d'onde se déroule ; petite horloge 11:42 en haut | Drop your song | « Drop your song. » | souffle, pop | le téléphone se met de profil |
| 6 | 14–16 | Les 3 prises en orbite autour du mot | Add your takes | « Add your takes. » | souffles courts | les cartes se posent en file |
| 7 | 16–20 | La timeline en gros plan, l'anneau en tête de lecture, une coupe par temps, le beat revient en entier | It cuts on the **beat** | « Stalak cuts them on the beat, in sync with your lips. » | clics, impact | la tête de lecture s'ouvre sur la vidéo |
| 8 | 20–23 | Sur la vraie vidéo : les paroles, puis police, couleur, filtre | Lyrics. Font. Filter. | « Add your lyrics. Pick your style. » | pops | la vidéo sort du téléphone |
| 9 | 23–26 | La vidéo finie plein écran, sur le beat ; la petite horloge dit 11:45 PM | Done. / 11:45 PM | « Done. Before midnight. » | instru pleine | blanc |
| 10 | 26–29 | Blanc : « 40 min » barré, « 3 MIN » claque en bleu avec l'écho | ~~40 min~~ / **3 MIN** with Stalak | « Forty minutes by hand. Three with Stalak. » | grave | trait fin |
| 11 | 29–32 | Blanc, un trait fin horizontal | No download. / No sign-up. | « No download. No sign-up. » | pops | noir |
| 12 | 32–35 | Noir : l'anneau se referme en icône, « stalak.app » tapé, bouton « Try it free » | Stalak / stalak.app / Try it free | « Stalak. Try it free at stalak.app. » | frappe, impact | tient 2 s |

Les « 11:45 PM » : 11:42 + 3 min, le vrai temps du propriétaire (mesuré le 31/10 : 3 minutes pour un snippet avec Stalak).

Zone sûre : texte et produit entre y = 168 et y = 1330, et x = 80 à 920. Seuls le fond, l'anneau et les cartes en vol en sortent.

BANNED :
- les réglages par défaut du guide ;
- la mascotte (demande du propriétaire) ;
- les chiffres non mesurés : seuls 40 min, 3 min, 11:42 / 11:45 PM (11:42 + 3) ;
- le nom d'un concurrent ;
- un faux avis ;
- les boutons App Store / Google Play (Stalak est un site) ;
- les textes qui bougent pendant qu'on les lit ;
- les fondus enchaînés : chaque passage est un flash, une coupe sur le beat, ou un objet qui devient le suivant.

QA (images à vérifier) : 0 (la prise et l'horloge lisibles), 100 (« 40 MIN » et l'écho), 190 (« again. » et 12:22 AM), 300 (le logo), 380 (le téléphone de face avec la vraie app), 450 (l'orbite), 560 (une coupe sur le beat), 690 (la vidéo finie), 820 (« 3 MIN »), 950 (« No sign-up. »), 1020 (la fin). Pour chaque : zone sûre, texte ≥ 28 px, rien de coupé.
