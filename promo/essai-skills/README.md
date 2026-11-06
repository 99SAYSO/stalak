# Essai des skills vidéo du 6/11/2026 : Earshot, Take One, Explainroo

Demande du propriétaire (6/11, 20 h 49) : essai encadré de trois skills vérifiés par le Chef de projet
(`docs/skills/vetting-2026-11-06-motion.md`), HyperFrames restant le moteur ; refaire une vidéo promo avec les trois et lui envoyer
la version d'avant et celle d'après.

- **Version d'avant** : le Short « The edit nobody sees » (`../youtube/short/`, 9:16, 31,4 s, voix Flora Achird), non modifié.
- **Version d'après** : ce dossier (version envoyée : v8, 32,9 s, voix Kokoro). `build_after.py` est une copie de
  `../youtube/build_short.py` ; chaque changement y est marqué « TRIAL ». Même histoire, même moteur (HyperFrames 0.8.223,
  `assets/engine.js` copié avec trois retouches : caméra de départ, « 1 frame off », « OFF BEAT »).

Versions des skills (celles du rapport du Chef de projet) : Earshot `4ac3d2a`, Take One `830621c`, Explainroo `e95232c`, installés
hors du dépôt. Modèles téléchargés une fois depuis Hugging Face après l'accord du propriétaire (6/11, 21 h 01) : CLAP et AST
(Earshot, ~1,1 Go), Kokoro 82M et Whisper base.en (Explainroo, ~400 Mo). Jamais `earshot llm`, aucune clé, aucune image
OpenRouter, aucun outil payant.

## Ce que chaque skill a changé

**Take One (méthode, avec HyperFrames)**
- « Montrer le vrai produit » : de 13,5 s à 21,4 s, les trois cartes redessinées en code (le son, les prises, le montage) sont
  remplacées par **la vraie app sur un téléphone** : captures de l'app pilotée avec son son et ses trois prises
  (`capture_app.py`), le son qui tombe dans « Import your music », les prises dans « Import my videos », les trois prises
  « Synced to the song », puis l'écran de montage où **l'aperçu joue le vrai export** de l'app (filigrane compris) et où une tête
  de lecture avance sur la vraie barre de coupe. Sortie : la caméra plonge dans l'aperçu, qui devient la vidéo plein cadre, coupé
  sur le temps (`phone.js`).
- Première image : les étiquettes SONG, TAKE 1, 2, 3 ne sont plus coupées par le bord (caméra de départ décalée).
- Téléphone placé sous les sous-titres (deux lignes vont jusqu'à ~400 px) ; zooms ancrés en haut du téléphone ; la barre de coupe
  reste au-dessus des 20 % du bas que TikTok et Instagram recouvrent.
- Inchangé, déjà conforme : sous-titres complets (compréhensible sans le son), aucun texte sur son visage, une idée et une chute
  (« You film. Stalak edits. »).
- Note sur 10 face à une référence (le film de lancement de Lovio) : 6,5 avant, 7,5 après. C'est ma note, pas celle d'un
  relecteur neuf. Reste : les petits textes de l'app sont illisibles sur un téléphone (ex. « 157.1 BPM »), le décor du tapis
  de découpe est toujours dessiné en code.
- Ses trois contrôles automatiques (`text-audit`, `edge-audit`, `audit-faces`) sont faits pour des films dessinés sur un canvas :
  ils ne lisent pas une page HyperFrames. Remplacés par le contrôle de HyperFrames et la planche contact (règle 10).

**Explainroo (la voix seulement)**
- La voix off est lue par Kokoro (`am_fenrir`), sur la machine, avec les mêmes dix phrases que la lecture Flora (Achird) ; mots
  et temps vérifiés par Whisper. Choisie parmi trois voix d'homme américaines comme la plus proche d'Achird (hauteur médiane
  146 Hz contre 157 ; Earshot : la plus proche des trois). Un peu de graves ajoutés (+4 dB sous 220 Hz, −2 dB au-dessus de
  5,5 kHz) et chaque phrase au volume de la phrase d'Achird, sans limiteur : Earshot entendait une version limitée bien plus loin
  d'Achird (z −6,4 contre −3,9) (`make_vo_kokoro.py`). Elle reste mesurablement différente d'Achird (plus claire, moins de graves).
- Whisper confirme tous les mots sauf un « And » ; ni Achird ni Kokoro ne disent « Stalak » d'une façon que Whisper reconnaît.
- Conséquences : les premières phrases démarrent 0,2 s plus tard (Kokoro dit « This is » plus vite, « Stalak » reste sur le
  drop) ; la dernière phrase est plus lente : la vidéo passe de 31,4 à 32,9 s.

**Earshot (l'écoute)**
- Sur la version d'avant : « launch-grade » (23 mesures sur 23 dans la plage de 7 films de lancement pros), mais une coupe sans
  son (0:08,8 ; un repère de plus sans coup à 0:12,3), trois moments servis seulement par une montée de volume (0:06,7 ; 0:23,7 ;
  0:24,4, « You film. »), pas de « stop-down » avant le coup le plus fort, musique à baisser sous la voix (voix dans 86 % du film).
- Changé : la musique baisse de 9 dB pendant 0,5 s avant le drop et revient sur le coup ; un coup court sur la coupe de 0:08,5
  et sur le drop ; « You film. » a un coup sec et un obturateur d'appareil photo ; le glitch des lèvres et le son de 0:08,5
  avancés ; musique 1,4 dB plus bas sous la voix ; tous les nouveaux sons du téléphone (taps, pop, tic de la tête de lecture,
  montée du téléphone) viennent de sa banque (faits en code, licence MIT) ; master final à −14 LUFS comme la version d'avant.
- **Résultat, à sa propre mesure (v8) : pas nettement mieux.** Note globale inchangée : « launch-grade » 23/23 avant et après, −14,0 LUFS. Mieux : les coupes qui ont un son juste dessus (à 100 ms près) passent de 64 % à 82 % ; des trois moments servis seulement par une montée de volume, il n'en reste qu'un (« You film. », 0:24,4). Pas mieux : la coupe de 0:08,5 n'a toujours pas de coup net (le son arrive 0,19 s après) ; « You film. » reste faible à son écoute (repéré de justesse en v6, plus du tout en v8) ; ma baisse de la musique avant le drop ne compte pas pour lui comme un stop-down (il veut une vraie coupure du son de 0,2 à 1 s) ; il conseille toujours de baisser la musique sous la voix (voix dans 100 % du film contre 86 % avant). Sur mes repères (48 après, 43 avant), 85 % ont un son à 100 ms près, contre 88 % avant.
- À retenir : utile pour contrôler (volume, synchro image par image, voix) et pour sa banque de sons ; ses conseils appliqués
  n'ont pas tous « pris » à sa propre écoute.

**Planche contact (règle 10, hors skills)** : défauts trouvés sur la planche et corrigés dans la version d'après (les deux
premiers sont aussi dans la version d'avant, laissée telle quelle) :
- « 1 frame off » / « out of sync » (0:06,5 à 0:08,0) était dans les 20 % du bas que TikTok et Instagram recouvrent : remonté
  au-dessus du mot « bounce ».
- La fin de « OFF BEAT » (0:04,5 à 0:05,5) était dans la bande de droite que couvrent les boutons de TikTok, son cadre dépassait
  le bord de l'image : décalé vers la gauche sur la bande de son.
- « Stalak edits. » et « Free · No download · No sign-up » touchaient cette bande (la carte de fin grandit de 4,5 % jusqu'à la
  fin) : un peu plus petits (−7 % et −8 %), toujours centrés.

## Refaire la version d'après

1. Les médias : voir `MEDIA.md` (rien de tout cela n'est dans le dépôt).
2. `python3 build_after.py` (`VOICE=flora` pour la voix Flora d'avant).
3. `cd short && HYPERFRAMES_BROWSER_PATH=<chrome-headless-shell> npx --yes hyperframes@0.8.223 check`, puis `render -o renders/apres.mp4`.
4. Master : `python3 master.py short/renders/apres.mp4 apres_master.mp4` (gain puis limiteur, −14 LUFS comme la version
   d'avant ; le mode dynamique de `loudnorm`, essayé d'abord, écrasait les coups : Earshot en entendait moins sur leur image).
5. Planche contact (`tools/contact_sheet.py`, règle 10) et écoute Earshot (`earshot critique`, `timeline --cues`, `sheet`).
