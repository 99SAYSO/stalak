# Stalak — comment ça marche (vidéo explicative, 9:16)

**Message et ton** : montrer ce qu'est Stalak, comment il marche et à qui il s'adresse, d'un ton amical et énergique, pour que l'artiste se dise que sa vidéo de promo peut se faire en quelques minutes.

## Format

- 1080 × 1920, 30 i/s, 41,63 s, anglais américain.
- Pour TikTok, Reels et Shorts.
- **Zone sûre** (version finale, demandée par le propriétaire) : tout ce qui compte tient entre x = 80 et x = 920, et entre y = 220 et y = 1400. On évite ainsi la photo de profil, la description et les boutons (like, commentaire, partage) de TikTok, Reels et Shorts. Le bas (sous 1400) et la colonne de droite (au-delà de 920, sous y = 900) restent au décor. Repères : marges de TikTok 108 / 320 / 60 / 120 px (haut, bas, gauche, droite), de Reels 210 / 310 / 0 / 84, de Shorts 120 / 300 / 0 / 96 (guide adaptlypost 2026). Seuls le fond, la neige et les objets en mouvement de passage en sortent.

## Règles tenues

- Vraie interface uniquement :
  - captures de la vraie app (version mobile et version ordinateur), faites sur la version de `main` ;
  - les captures d'écran du propriétaire servent de référence ;
  - les éléments reconstruits (lignes des prises, timeline, polices, filtres, Shuffle, Export, pack, écran d'export) reprennent les vrais textes, les vraies couleurs et le vrai dessin de l'app. L'igloo de l'export suit la même géométrie que `src/app.js`, avec les mêmes messages.
- Fonctions présentées avec leur formule : « Auto transcription » marquée PRO ; packs de 5 à 30 vidéos marqués Creator Plus (CREATOR+). « Try it free » vaut pour la version gratuite : pas de téléchargement, pas d'inscription.
- Temps : seulement « Your video's ready in about a minute ».
- Aucun concurrent, aucun avis inventé, aucun chiffre inventé. « N°1 » et « 10x plus rapide » ont été refusés faute de preuve.
- Paroles : les paroles du propriétaire traduites en anglais américain à sa demande (« After all this time, baby » pour « Depuis tout ce temps baby », « I gotta bounce » pour « Faut j'me taille »), aux temps trouvés par la synchro automatique de l'app (0:05.83 et 0:09.50). Sur la vidéo, elles s'affichent quand il les chante.
- Vidéos : le vrai montage de Stalak (version 1, 21 plans). Elles sont calées sur le rythme de l'instru : temps de la prise = temps du film + 37,289 − 49,041.
- Logos officiels seulement. YouTube Shorts est écrit en toutes lettres, sans logo.

## Scènes (temps du film, réglés par `timing.json` et `gen_index.py`)

| # | Début | Voix off | Ce qu'on voit |
|---|---|---|---|
| 1 | 0,00 | Tired of editing your promo videos? | Une timeline de montage surchargée (illustration) ; la mascotte se tape le front ; tout gèle et éclate |
| 2 | 2,33 | Meet Stalak: the promo video tool built for rappers. | Le vrai logo pivote avec un reflet, puis le nom ; la mascotte salue ; 3 prises du rappeur montent |
| 3 | 5,80 | It runs on your phone and on your computer. | Un iPhone en 3D (vraie app) qui pivote et devient un Mac (vraie version ordinateur), puis plongée dans l'écran |
| 4 | 7,81 | Drop in your song and pick the part you want. | Le fichier du son tombe dans l'app ; le sélecteur de passage (poignées, tête de lecture) sur la vraie forme d'onde |
| 5 | 9,92 | Then film your takes right in the app, or import the ones you already shot. | « Film now » (enregistrement) et « Import my videos » sortent du téléphone ; les 3 prises entrent ; liste synchronisée |
| 6 | 13,43 | Stalak syncs every take to the music, and cuts between them on the beat. | 3 prises qui passent de « Analyzing the sound » à « Synced to the song » (le statut a sa propre ligne, la forme d'onde est une bande en dessous) ; puis le montage joue avec sa timeline (sur le retour du rythme, 15,53) |
| 7 | 17,23 | Add your lyrics: type them yourself, or get them automatically with Pro. | « Lyrics on screen » ; les paroles se tapent lettre par lettre, en anglais ; « Auto transcription PRO » ; chaque ligne reçoit son temps |
| 8 | 20,87 | Pick your font, your colors, your effects. Shuffle for a brand-new edit. | Un seul panneau avec les 3 rangées de l'app (FONT, COLOR, FILTER), à l'écran pendant 3,2 s. La rangée dont parle la voix s'allume et son choix bouge : Typewriter, Handwritten, Impact (0,3 s chacune) ; rose, bleu, jaune ; Frost, 35 mm film, Black & white, appliqués à la vidéo. Puis « Shuffle » : version 2 |
| 9 | 25,62 | Hit export, and your video's ready in about a minute. | Bouton Export, puis l'écran d'export de l'app : l'igloo, le pourcentage, la barre, « Igloo finished! » |
| 10 | 28,41 | Need a month of content? Creator Plus builds a pack of up to thirty different videos. | Un mois de 30 jours ; le vrai réglage du pack (10, 20, 30 vidéos, CREATOR+) ; 30 images différentes remplissent le mois |
| 11 | 32,66 | No download. No sign-up. | Le Mac et l'iPhone avec la vraie app ; deux tampons |
| 12 | 34,41 | All that's left is to post it, everywhere. | La vidéo part vers TikTok, Instagram et YouTube Shorts ; mascotte |
| 13 | 36,04 | Stalak. Make your next snippet hit different. | Logo et nom en grand, phrase, stalactites, stalak.app, TRY IT FREE., @stalak_app, flocons 3D ; tout est affiché à 37,7 s et reste jusqu'à la fin |

Fond permanent (`compositions/world.html`) : dégradé bleu, halos, glaçons, boules de neige, cristaux et flocons en 3D sur 3 plans de profondeur. Ils bougent en continu et glissent (parallaxe) à chaque changement de scène. La neige (bloc du catalogue) passe par-dessus.

## Son

- **Instru** : celle de « neva die », fournie par le propriétaire. Elle démarre à 37,289 s, si bien que la reprise du rythme après la coupure (52,814 s dans l'instru) tombe à 15,53 s, au moment où le montage démarre. Le volume est à 0,13 sous la voix, avec une remontée sur ce retour et à la fin, puis un fondu de 1,4 s.
- **Voix off** : Flora, modèle Google Gemini TTS, voix Achird, choisie par le propriétaire. Les pauses de plus de 0,26 s ont été ramenées à 0,20 s (40,48 s → 38,34 s), puis la voix a été normalisée à −16 LUFS et −1,5 dBTP. Elle commence à 0,25 s. Version finale : dans la phrase 8, trois courtes pauses sont ajoutées après « your font », « your colors » et « your effects » (+0,30, +0,24 et +0,34 s, soit +0,88 s), pour laisser le temps de voir les options (39,22 s).
- **Filtres de la scène 8** : appliqués en direct par `npx hyperframes media-treatment` (attribut `data-color-grading`) sur 4 copies du plan en cours, sans nouveau fichier vidéo. Frost : plus froid, plus clair, moins saturé ; 35 mm film : plus chaud, contraste, grain, vignette, poussières ; Black & white : préréglage `mono-clean`, contraste, grain, vignette. Ce sont des approximations des filtres de l'app (`src/app.js`, filtres 1, 7 et 9).
- **Effets** : la bibliothèque fournie avec HyperFrames, sur chaque action visible (tableau `SFX` de `gen_index.py`). Le pic de chaque son tombe une image après l'action.
