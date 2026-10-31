# Stalak — comment ça marche : REVIEW

## Contrôles

- `npx hyperframes lint` : 0 erreur, 0 avertissement.
- `npx hyperframes check` : aucune erreur. Restent :
  - des avertissements `rotation_pivot_drift` sur les objets du fond : ils se déplacent en tournant, c'est voulu ;
  - des avertissements de lecture sur des petits textes d'interface vus en passant (« Analyzing the sound… », « Filmed with the song playing out loud »…). Ils ne portent pas le message.
- Images de contrôle regardées à 28 moments du film, dont chaque transition. Les 4 images clés ont été envoyées au propriétaire.

## Défauts trouvés et corrigés

1. **Objets du fond noirs** : le CSS n'atteint pas les copies créées par `<use>`. Les couleurs sont maintenant écrites dans les attributs SVG.
2. **« PART. » remplacé par la forme d'onde** : le mot servait aussi de marque de remplacement dans le gabarit. Corrigé.
3. **Polices des paroles perdues** : des guillemets dans l'attribut `style` cassaient les 5 polices. Les paroles passaient aussi sur deux lignes ; la taille est maintenant réglée police par police.
4. **Titres trop larges** pour la zone sûre (EDITING?, BUILT FOR RAPPERS., COMPUTER., AUTOMATICALLY., OF CONTENT?, EVERYWHERE.) : tailles réduites.
5. **Carte de fin** : la phrase passait sur 3 lignes et débordait de sa carte. Elle tient maintenant en 2 lignes.
6. **Bouton Export** qui chevauchait l'écran d'export : il disparaît dès que l'écran le couvre.
7. **Musique** : le format de l'automatisation du volume faisait échouer le mix audio au rendu. Il suit maintenant le format `{"version":1,"lanes":[…]}`. La durée de la voix off est réglée sur sa vraie longueur.
8. **Démonstration des polices** : elle commence quand la deuxième ligne de paroles apparaît, pour que les paroles restent calées sur la voix du rappeur.
9. **Bouton « Make the pack CREATOR+ »** sur deux lignes (vu sur le premier rendu) : police à 34 px, sans retour à la ligne, puis nouveau rendu.

## Choix

- **Interface reconstruite** à partir de la vraie app plutôt que des captures collées, comme le demande le kit saas-motion-video. Ça reste net, ça s'anime, et les vraies étiquettes sont gardées.
- **Exception voulue à une règle du kit** (« pas de barre de progression ») : le propriétaire a demandé l'export avec la barre qui avance, et c'est le vrai écran de l'app.
- **Blocs 3D du catalogue HyperFrames** (WebGL, WebGPU) écartés pour un rendu sans carte graphique : la 3D est faite en CSS 3D + GSAP, ce qui donne la même image à chaque rendu.
- **Placement de chaque phrase** : la transcription automatique (whisper) n'a pas pu télécharger son modèle (huggingface.co est bloqué ici). Les phrases ont été placées d'après les silences et le nombre de syllabes de chaque morceau, pas à l'écoute.
- **Licence de l'instru** : le fichier s'appelle « free … type beat ». Le propriétaire a été prévenu de vérifier la licence avant une diffusion commerciale.

## Version finale : retours du propriétaire (31/10)

1. **Zone sûre** : les 13 scènes sont replacées pour que rien d'important ne passe sous la photo de profil, la description ou les boutons de TikTok, Reels et Shorts (cadre x 80–920, y 220–1400, voir `SPEC.md`).
   - Titres à partir de y = 222–230 ; téléphones réduits (échelle 0,66) ; cartes de 840 px de large au plus, entre x = 80 et x = 920 ; rien d'important sous y = 1400.
   - « BUILT FOR RAPPERS. » passe à 90 px (il faisait 1 008 px de large).
   - Contrôle : les images d'une cinquantaine de moments regardées avec le cadre et les zones des plateformes dessinés par-dessus.
2. **« Synced to the song » (scène 6)** : chaque ligne de prise a été refaite. Le nom est en haut, le statut sur sa propre ligne et la forme d'onde est une bande en bas. Le texte vert n'est plus caché.
3. **Paroles en anglais américain** : « After all this time, baby » et « I gotta bounce », tapées lettre par lettre (largeurs mesurées) en scène 7, puis sur la vidéo en scène 8.
4. **Polices, couleurs, effets (scène 8)** : refaits pour qu'on voie mieux les options.
   - Un seul panneau avec les 3 rangées de l'app (FONT, COLOR, FILTER) reste à l'écran 3,2 s. Avant, chaque rangée restait seule 0,3 à 0,7 s.
   - La rangée dont parle la voix s'allume. Chaque choix reste 0,28 à 0,36 s (avant : 0,11 à 0,17 s).
   - Les choix sont calés sur les mots de la voix : avant, l'image avait de l'avance sur la voix.
   - Les filtres se voient sur la vidéo (Frost, 35 mm film, Black & white, faits avec `media-treatment`).
   - La voix a 0,88 s de pauses en plus dans cette phrase, et la vidéo dure 41,63 s.
   - La ligne « After all this time, baby » ne clignote plus au début du plan.

Contrôles de cette version :
- `lint` : 0 erreur, 0 avertissement.
- `check` : aucune erreur. Restent les avertissements de lecture des petits textes vus en passant, et le message WebGL « GPU stall due to ReadPixels » (les filtres de la scène 8 passent par WebGL, sans effet sur l'image).
- Corrigés en route :
  - la tête de lecture qui touchait le titre « neva-die » (scène 4) et « Version 1 » (scène 6) ;
  - les sous-titres des cartes « Film now » et « Import my videos » cachés par les images (scène 5) ;
  - deux animations qui se chevauchaient sur le téléphone de la scène 11 ;
  - un doublon vidéo signalé par le lint (scène 8).

## Rendu final (31/10, `npx hyperframes render --quality delivery --fps 30`)

- Fichier : `renders/stalak-explainer.mp4` (hors dépôt, envoyé au propriétaire).
- Format : 40,77 s, 1080 × 1920, 30 i/s, 1 223 images, H.264 + AAC 48 kHz stéréo, 43,6 Mo.
- Décodage complet par ffmpeg sans erreur.
- Son : −16,4 LUFS intégrés, crête −1,5 dBTP, LRA 4,1 LU.
- 24 images du rendu regardées, de 0,6 à 40,5 s : les vidéos jouent, la 3D et les animations sont bien rendues, le bouton du pack tient sur une ligne.
