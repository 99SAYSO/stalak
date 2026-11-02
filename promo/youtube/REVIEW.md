# Relecture — « The edit nobody sees » (YouTube 16:9) et son Short (9:16), 2/11/2026

Skills : `hyperframes` (contrat, `story.md`, `spec.md`, `review.md`), `saas-motion-video` (méthode : histoire → SPEC → construction → son → livraison), `media-use` (voix Flora, mixage).

## Ce qui a été vérifié avant le rendu

- `hyperframes lint` : 0 erreur. `hyperframes check` : lint, exécution, mouvement, son : OK. Mise en page : une seule erreur, voulue (la carte « Lyrics on screen » passe par-dessus « Your edit » : marquée `data-layout-allow-overlap`). Les chiffres de la règle et du tapis sont du décor (`data-layout-ignore`).
- Images de contrôle à chaque plan (plus de 120 images regardées), corrigé en route :
  - les objets d'un monde restaient visibles dans l'autre quand on sautait dans le temps (un parent caché ne cache pas un enfant marqué visible) : chaque couche se cache maintenant par son opacité ;
  - le gros plan restait affiché après son plan quand on sautait dans le temps : il est dessiné à chaque image ;
  - les pellicules commençaient par 40 cm de noir : les images démarrent juste après l'amorce ;
  - les morceaux du plan 2 cachaient les repères des plans 3 et 4 : ils tombent ailleurs ;
  - les plans 3 et 4 étaient trop loin : caméra plus proche, repères plus gros ;
  - la carte des paroles laissait passer les boutons de la carte « Your edit » : chaque carte a son propre plan ;
  - la 2e partie du gros plan montrait sa main devant la bouche : remplacée par la prise 3 à 12 s (visage dégagé) ;
  - le pack : 2 s de ciel vide avant les 30 vidéos : le badge « Creator Plus » et la bande du son arrivent, les vidéos en sortent ;
  - le résultat : deux des trois vidéos montraient parfois la même prise : maintenant, à chaque temps, les trois montrent trois prises différentes ;
  - l'icône Stalak repartait 0,3 s après le drop : elle reste jusqu'à la fin de « This is Stalak. ».
- Son, mesuré sur un mixage refait hors ligne à partir de `index.html` (comme le fait le rendu), avant correction : voix −19,9 LUFS et musique −31,4 dans la partie « problème » (musique trop basse), voix −19,2 et musique −23,7 dans la partie Stalak (musique trop haute pour la voix). Corrigé : musique +4,4 dB sous la partie problème, −2,8 dB sous la partie Stalak, sa chanson −1,2 dB.
