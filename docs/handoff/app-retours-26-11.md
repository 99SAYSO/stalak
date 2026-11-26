Statut : EN COURS

# Branche `app/retours-26-11` — retours du propriétaire du 26/11, points 1 à 5, 7 et 8

Demande : `docs/handoff/chef-retours-26-11.md`. Le point 6 (bouton TikTok) est dans la branche à part `app/tiktok-masque`, déjà PRÊTE.

**Statut** : maquette envoyée au propriétaire, j'attends sa validation (règle 9). Tout est déjà dans la branche et testé. Il ne reste qu'à corriger ce qu'il demandera.

Partie de main `a7aebd0`. Aperçu : https://app-retours-26-11.stalak-site.pages.dev

## Ce qui change (téléphone)
1. **« Meilleure prise auto » désactivée par défaut.**
   - `S.bestTake` vaut `false` au départ. L'option reste allumée seulement si la personne l'a allumée elle-même.
   - Un projet déjà enregistré garde son réglage.
   - À côté de l'interrupteur, une explication entre parenthèses :
     - FR : « (choisit tes prises les plus réussies ; peut faire moins de coupes et laisser moins de place à tes autres prises) » ;
     - EN : « (picks your best-looking takes; can mean fewer cuts and less room for your other takes) ».
2. **« Retour au menu principal »** (EN : « Back to home »).
   - C'est un gros bouton jaune dans la carte blanche de fin. Il apparaît dès qu'on touche « Enregistrer la vidéo ».
   - Il garde d'abord le montage dans le téléphone (`lpSave(true)`), puis revient à l'accueil, sans demander de confirmation.
   - `StalakM.ed.goHome`, `src/mobile4.js`.
3. **12 filtres « Tendance »**, les looks des filtres TikTok du propriétaire, avec des noms à nous :
   - **Braise** (aries), **Brume** (HNY), **Lilas** (2016), **Craie** (White Shadow), **Minuit** (Aurora), **Rubis** (Glow) ;
   - **Charbon** (#normalcutegirl, sans les cœurs), **Webcam** (ArCaReOn5), **Écran** (tokyo : trame, couleurs décalées), **Caméscope** (Green filter), **Coton** (holuu), **Clarté** (Brightness).
   - « STAY SOBER » n'est pas fait : c'est un effet texte, une idée pour plus tard.
   - Les filtres sont dans le même shader que les autres : ce qu'on voit est ce qui est exporté. La famille « Tendance » est la première de la liste.
   - Braise et Craie sont gratuits. **Les anciens filtres sont gardés pour l'instant** : le propriétaire dira s'il faut les retirer.
   - Comparaison avec ses captures, sur sa prise sombre : `docs/audit/maquettes/retours-26-11/filtres-tendance-vs-tiktok.jpg`.
4. **Mode Snippet : pas de bouton « Effets »** (5 outils). Le bouton revient en mode Clip.
5. **La mascotte travaille.**
   - Elle prend un bloc sur le tas, le porte sur la tête jusqu'à l'igloo, le pose, se retourne et revient les mains vides, en boucle.
   - L'igloo monte avec le vrai avancement.
   - Animation en transform et opacity seulement, sans rebond. Avec « réduire les animations », rien ne bouge.
7. **« Encore environ 1 s »** est maintenant en blanc, lisible sur le bleu.
8. **Tests de style** :
   - `clip1_ui` : `.band-frost a:hover` est mis sous `@media (hover: hover)` dans `src/bands.css` (fichier de Marketing).
   - `animations_ui` : les 6 animations du site choisies par le propriétaire le 22/11 sont autorisées dans le test, avec la raison écrite. Il s'agit du titre, de la note qui se remplit, de la zone d'import vivante, de l'éclat de neige et des blocs qui arrivent. Résultat : 44/44.

## Tests
- Nouveau test `tests/ui/retours_26_11_ui.py` : 29/29 (iPhone 13 FR, iPhone SE EN, « réduire les animations »).
- `animations_ui` : 44/44.

## À prévenir
- **Marketing** : `src/bands.css` (survol seulement à la souris) et `tests/ui/animations_ui.py` (leurs animations autorisées, avec la raison).
