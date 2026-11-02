# SPEC — « The edit nobody sees » (vidéo YouTube de présentation, 2/11/2026)

Histoire A de `STORYLINES.md`, choisie par le propriétaire le 2/11 à 0 h 14 (« la A »). Voix Achird validée le 2/11 (0,013 $).

GOAL:    à la fin, l'artiste pense « c'est vrai que j'en aurais grave besoin » : il a vu le travail caché d'un snippet monté à la main, puis Stalak le faire en 3 gestes, et il sait ce que fait chaque geste.
OUTPUT:  HyperFrames 0.8.223, 1920 × 1080, 30 images/s (YouTube). Le Short : projet à part, 1080 × 1920 (voir `short/`).
TIME:    environ 62 s (le texte de la voix décide) × 30 = ~1860 images. Musique : l'instru de « neva die », 157 BPM (P = 0,38217 s = 11,465 images, mesure = 1,5287 s = 45,86 images). Le drop de l'instru tombe sur « This is Stalak. ».

LOOK:
- Deux mondes, jamais un fond noir vide :
  - **L'ancien monde : le tapis de découpe.** Un vrai tapis de découpe vert (#2f6a55, quadrillage 1 cm = 40 px en #4f8a73 à 60 %, graduations en #d9efe5, chiffres Rubik 600 18 px) vu en 3D (rotateX 52 à 62°), éclairé par une lampe de bureau (une tache chaude #fff3d6 à 18 % en haut à gauche, pas de halo ni de lueur). Dessus : la bande du son (papier blanc cassé #f4f1e8, forme d'onde encre #26303d, traits des temps), les 3 pellicules des prises (cadre noir #14181f, perforations, images tirées de ses vraies prises), un cutter et une règle en métal (#c9d1da, reflet #eef3f7). Étiquettes en ruban de masquage (#efe3c2, Rubik 700 22 px, majuscules écrites à la main dans le texte).
  - **Le monde Stalak : le ciel.** Bleu Stalak #1f6fd6, neige qui tombe (flocons blancs 2 à 6 px, 90 flocons, chute 60 à 140 px/s), cartes blanches #ffffff au contour d'encre #0a0d14 de 6 px, ombre d'encre décalée de 12 px, stalactites sous les cartes. Titres Lilita One, texte Rubik 500 à 800.
- Couleurs des prises (celles de l'app) : prise 1 #d6336c, prise 2 #3a6fe0, prise 3 #e0952c. Rouge d'erreur (seulement dans l'ancien monde) : #ff4d5e. Accent : le bleu Stalak, une fois par plan.
- Texte à l'écran : le moins possible, jamais la phrase de la voix mot pour mot ; au moins 34 px ; les mots de l'app sont ceux de l'app (anglais).
- Grain : `brand/grain.png` à 3,5 %. Ombres : décalage 0 18 px, flou 40 px, 22 % d'opacité (ancien monde) ; ombre d'encre pleine (monde Stalak).

OBJECTS:
- La bande du son : du papier avec la vraie forme d'onde de « neva die » (tirée du fichier) et un trait par temps ; elle passe d'un monde à l'autre (c'est elle qu'on dépose dans « Import your music »).
- Les 3 pellicules : des images de ses 3 vraies prises (une image par seconde), cadre noir perforé, ruban de couleur de la prise au début.
- Le cutter : manche jaune #f2c230, lame argent ; la règle : métal gradué.
- La bouche décalée : gros plan d'une vraie image de sa prise ; le mot « bounce » de sa chanson glisse à côté de la bouche, un trait rouge marque l'écart.
- Les jours : des fiches de papier « TUE », « WED », « THU »… qui tombent sur le tapis, chacune avec une nouvelle pile de morceaux.
- L'interface de Stalak : refaite avec ses vrais mots (Pick your song, Import your music, Add your takes, Import my videos, Film now, Take 1/2/3, Your edit, Cuts Auto / On the words / Every bar, Pace Chill / Normal / Punchy, Lyrics on screen, Paste my lyrics, Export, Make the pack, 5 / 10 / 30 videos, Pack ready: 30 videos, all different.). Ses vraies prises jouent dans l'aperçu.
- La fin : l'icône et le mot « Stalak » officiels (`brand/icon.svg`, `brand/wordmark.svg`), jamais redessinés.

MOTION:
- Entrée : power3.out (0,45 s) ; déplacement : power2.inOut (0,6 s) ; sortie : power2.in (0,3 s) ; caméra : sine.inOut pour les travellings (1,2 à 3 s), expo.inOut pour les plongées (0,7 s).
- Pas de rebond ni d'élastique sur l'interface. Les objets de l'ancien monde peuvent tomber avec un petit rebond physique (back.out 1,4) : ce sont des objets, pas de l'interface.
- Un geste principal par plan ; les mouvements secondaires 60 % de l'ampleur, 0,12 s après.
- Coupes et changements sur les temps de l'instru (cut sur la mesure dans la partie Stalak).

SHOTS (les temps exacts viennent de la voix, voir `build.py`) :
1. 0 → l1 « You wrote the song. You filmed the takes. » — Vue plongeante sur le tapis : la bande du son et les 3 pellicules posées ; la caméra avance en travelling le long des bandes (sine.inOut 2,4 s). Les étiquettes « SONG », « TAKE 1 / 2 / 3 ».
2. l2 « …nobody sees: the edit. » — Le cutter entre par la droite, coupe une pellicule ; les morceaux s'éparpillent (une pile de 40 morceaux), la caméra recule et tourne de 12°.
3. l3 « Every take has to line up with the track. » — Plongée basse : une pellicule glisse le long de la bande du son, avance, recule, recule encore (3 essais), les repères ne tombent pas en face.
4. l4 « Every cut has to land on the beat. » — Les traits des temps s'allument un par un sur la bande ; la lame coupe… un poil à côté : un trait rouge « off beat ».
5. l5 « One frame off… » — Plongée (expo.inOut) dans une image de la pellicule jusqu'au gros plan de la bouche ; le mot « bounce » se décale de la bouche, le trait rouge s'ouvre.
6. l6 « And tomorrow?… » — La caméra remonte, les fiches TUE, WED, THU tombent sur le tapis, chacune avec sa pile ; le tapis disparaît sous les morceaux.
7. l7 « This is Stalak. » — Sur le drop : tous les morceaux sont aspirés dans un point ; le tapis s'ouvre et la caméra passe au travers vers le ciel bleu ; l'icône Stalak tombe, ses stalactites poussent.
8. l8 « Drop in your song. » — La carte « Pick your song » ; la bande du son (le même objet) tombe dans « Import your music » ; la ligne « neva die · 157.0 BPM » apparaît avec la forme d'onde.
9. l9 « Add a few takes… » — La carte « Add your takes » : les 3 pellicules tombent et deviennent « Take 1 / 2 / 3 » ; « Import my videos » puis « Film now » s'allument.
10. l10 « Stalak lines every take up… » — Les 3 formes d'onde des prises se calent sur celle du son (glissent et s'alignent), puis la barre de coupe se découpe sur les temps et l'aperçu passe d'une prise à l'autre sur le temps.
11. l11 « Your lip sync stays locked. » — Gros plan sur l'aperçu : la bouche et le mot ensemble, un cadenas se ferme.
12. l12 « Paste your lyrics… » — La carte « Lyrics on screen » : les lignes se collent, le bouton du tap clignote sur les temps, les temps se remplissent, la ligne apparaît dans l'aperçu.
13. l13 « Chill or punchy?… » — Le réglage Pace passe de Chill à Punchy, la barre de coupe se redécoupe (plus de plans).
14. l14 « Export… With Pro… » — Le bouton « Export » ; le téléphone 9:16 part sur la gauche (TikTok · Reels · Shorts), un écran 16:9 « Music video » + PRO arrive à droite.
15. l15 « And with Creator Plus… » — « Make the pack » ; 30 vidéos s'éventaillent, puis se rangent dans une semaine MON → SUN.
16. Le résultat (sans voix, 4 mesures de sa chanson) : ses vraies prises montées sur le temps, plein cadre 16:9 (Music video), « I gotta bounce » à l'écran.
17. l16 « You film. Stalak edits. » — Deux mots qui claquent sur le temps : une caméra, puis l'icône.
18. l17 « Free, in your browser… » — Écran de fin : l'icône portée par la neige, le mot « Stalak » qui se dévoile, « stalak.app », « Free · No download · No sign-up » ; tenu 2,5 s.

BANNED: fond noir ou bleu nuit vide, lueurs, particules décoratives (la neige est la neige de la marque), dégradés violets, cartes de verre, papier crème comme fond, trois cartes en ligne, logo dans un coin, texte qui bouge pendant qu'on le lit, tout qui monte en fondu, interface penchée en 3D (l'interface reste de face, seule la caméra bouge autour), barres de progression, bouton ou capacité inventés, chiffre inventé, concurrent cité.

QA (images à vérifier) : 0 s (vignette : le tapis et les bandes, lisible), milieu de chaque plan, l'aspiration et le passage dans le ciel, l'alignement des prises, le gros plan de la bouche verrouillée, le pack, le résultat (ses prises), le logo final ; aucune image noire, rien hors du cadre de sécurité (90 %), texte ≥ 34 px.

## Changements pendant la fabrication (2/11, nuit)

- **La voix** : les silences de la lecture (1 à 2,8 s après chaque phrase) sont ramenés à 0,04–0,2 s dans une phrase, ~0,27 s entre les phrases du problème et ~0,41 s entre celles de Stalak (demande du propriétaire : « raccourcir les blancs », « que ça reste dynamique »). Parole totale : 47,1 s ; film : 61,15 s (40 mesures).
- **Plan 5** : la caméra plonge dans une image de la pellicule, qui se met à jouer (sa prise 3, visage proche) ; à côté, une feuille « VOICE / LIPS » : la piste des lèvres glisse d'une image (« 1 frame off »), puis le mot « bounce » se décolle de la bouche (« out of sync »).
- **Plans 3 et 4** : faits sur des endroits propres de la bande (début et fin), pour que les morceaux du plan 2 ne cachent pas les repères.
- **Plan 6** : quatre fiches (TUE, WED, THU, FRI), chacune avec sa pile.
- **Plan 15** : le badge « Creator Plus », la bande du son au milieu, les 30 vidéos en sortent, « Pack ready: 30 videos, all different. » dans la carte, puis la semaine MON → SUN.
- **Plan 16 (le résultat)** : au lieu d'un 16:9 plein cadre (le recadrage coupait sa tête dans certaines prises), trois vidéos du pack (MON, TUE, WED) en 9:16, sur sa chanson : chacune coupée à son rythme, et à chaque temps les trois montrent trois prises différentes. « I gotta bounce » s'affiche en même temps sur les trois.
- **Taille du texte** : le plancher est 28 px (contrôle HyperFrames) ; le texte de lecture fait 34 px ou plus à l'écran, sauf les chiffres de la règle et du tapis (décor).
