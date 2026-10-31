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

## Choix

- **Interface reconstruite** à partir de la vraie app plutôt que des captures collées, comme le demande le kit saas-motion-video. Ça reste net, ça s'anime, et les vraies étiquettes sont gardées.
- **Exception voulue à une règle du kit** (« pas de barre de progression ») : le propriétaire a demandé l'export avec la barre qui avance, et c'est le vrai écran de l'app.
- **Blocs 3D du catalogue HyperFrames** (WebGL, WebGPU) écartés pour un rendu sans carte graphique : la 3D est faite en CSS 3D + GSAP, ce qui donne la même image à chaque rendu.
- **Placement de chaque phrase** : la transcription automatique (whisper) n'a pas pu télécharger son modèle (huggingface.co est bloqué ici). Les phrases ont été placées d'après les silences et le nombre de syllabes de chaque morceau, pas à l'écoute.
- **Licence de l'instru** : le fichier s'appelle « free … type beat ». Le propriétaire a été prévenu de vérifier la licence avant une diffusion commerciale.
