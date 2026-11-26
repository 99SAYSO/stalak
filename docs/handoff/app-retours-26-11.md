Statut : PRÊT

# Branche `app/retours-26-11` — retours du propriétaire du 26/11, points 1 à 5, 7 et 8

Demande : `docs/handoff/chef-retours-26-11.md`. Le point 6 (bouton TikTok) est dans la branche à part `app/tiktok-masque`, déjà PRÊTE.

**Validé par le propriétaire (26/11, 1 h 57)** : les écrans et l'igloo (« tout est bon »), les 12 filtres Tendance (« ils me vont »), Braise et Craie gratuits. Parmi les anciens filtres, il ne garde que **Démon, Halloween, VHS et Golden hour**.
- Les autres ne sont plus proposés. Ils restent dans le code (`old: true`) pour que l'ordre des looks dans le shader ne bouge pas : un ancien projet garde son look.

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
   - Braise et Craie sont gratuits. Familles proposées : Tendance, Caméra (Démon, Halloween), Rétro (VHS), Esthétique (Golden hour).
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

## Point 10 (tests instables)
- `fin_export_belle_ui` : les confettis sont attendus jusqu'à 2,5 s, le temps que la bibliothèque d'animation arrive au premier export (iPhone SE). Résultat : 49/49, deux fois de suite.
- `refonte_stats_ui` : le parcours « questionnaire passé » ratait dès qu'on relançait le test sur le même serveur, car le compte de test avait déjà répondu. Il utilise maintenant un compte neuf à chaque passage, et « Passer » est touché une fois l'écran immobile. Résultat : 72/72, deux fois de suite.

## Tests
- Série complète :
  - `retours_26_11_ui` 29/29, `fin_export_belle_ui` 49/49 (×2), `export_igloo_ui` 21/21, `refonte_stats_ui` 72/72 (×2) ;
  - `refonte_mobile4_ui` 81/81, `refonte_mobile2_ui` 65/65, `refonte_mobile3_ui` 93/93 (adapté : 5 outils en Snippet), `refonte_mobile_ui` 102/102 ;
  - `fin_export_ui` 98/98, `animations_ui` 44/44, `clip1_ui` 95/95, `prises_ui` 24/24, `essai_pro_ui` 205/205 ;
  - `suite_clarity_ui` 24/24, `projet_local_ui` 76/76, `vente_ui` 63/63, `tiktok_ui` 224/224, `ou_est_ton_son_ui` 23/23.
- Un seul échec, déjà présent sur main : `formules_ui` 136/137, le compte du filigrane.
- `filtres_comparaison` : 349 vérifications passées, aucun échec. La capture finale de la page a dépassé le temps limite ; ce délai est maintenant allongé.
- Nouveau test `tests/ui/retours_26_11_ui.py` : 29/29 (iPhone 13 FR, iPhone SE EN, « réduire les animations »).
- `animations_ui` : 44/44.

## À prévenir
- **Marketing** : `src/bands.css` (survol seulement à la souris) et `tests/ui/animations_ui.py` (leurs animations autorisées, avec la raison).
