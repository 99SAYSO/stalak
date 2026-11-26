# Retours du propriétaire, 26/11/2026 (0 h 49) — pour App

Le propriétaire a testé la version en ligne (fusion du 25/11 22 h 15). Pour chaque point : une maquette ou des captures d'abord, sa validation, puis la fusion (règle 9). Respecter `docs/marketing/PROMESSE.md` : un snippet dynamique et stylé.

1. **« Meilleure prise auto » désactivée par défaut.** `state.bestTake` doit valoir `false` au départ. À côté de l'interrupteur, une courte explication entre parenthèses (FR/EN) :
   - ce que fait l'option : elle choisit les prises les plus réussies ;
   - et ce qu'elle change : elle peut réduire le nombre de coupes et laisser moins de place aux autres prises qu'en mode désactivé.
2. **Après « Enregistrer la vidéo »** (écran de fin), un bouton bien visible **« Retour au menu principal »** (EN : « Back to home ») qui ramène à l'accueil. La vidéo reste dans « Montages ».
3. **Filtres refaits pour retrouver les looks des filtres TikTok** (« faut vraiment essayer de faire les mêmes »). Les 13 captures du propriétaire et la description de chaque rendu sont dans `docs/audit/retours-2026-11-26/filtres-tiktok/` (LISEZMOI.md). On reproduit l'étalonnage (couleur, grain, flou, vignette, trame VHS), avec des noms à nous, sans les effets AR. Maquette : chaque filtre sur une vraie prise sombre, avant de remplacer les actuels.
4. **Mode Snippet : pas de bouton « Effets ».** Il ne s'affiche qu'en mode Clip.
5. **Animation de l'export : la mascotte doit travailler.** Aujourd'hui elle reste immobile avec sa glace. Elle doit faire des allers-retours entre le tas de blocs de glace et l'igloo, poser un bloc à chaque voyage, et l'igloo monte au rythme de la progression. Règles `motion-design` : transform et opacity, pas de rebond, mouvement réduit respecté.

**Vu par le Chef de projet pendant la vérification du 26/11 :**

6. **« Publier sur TikTok » est proposé à tout le monde sur l'écran de fin, alors que l'appli TikTok est encore en Sandbox.** Seul le compte testeur @stalak_app peut la relier, et la publication reste en « Seulement moi ». Un vrai abonné qui clique tombera sur une erreur TikTok. **Décision du propriétaire (26/11, 0 h 55) : masquer le bouton pour tout le monde tant que TikTok n'a pas validé l'appli, puis le remettre.** Réglage simple côté serveur, par exemple une variable `TIKTOK_PUBLIC = "0"` dans `wrangler.toml`, lue par `/api/config` (à voir avec Comptes). Le compte testeur doit pouvoir le voir pour tourner la vidéo de démo (`docs/social/DEMO_TIKTOK.md`). **Urgent** : à faire en premier, dans une petite branche à part.
7. Écran de construction (igloo) : le texte « Encore environ 1 s » est gris sur bleu, peu lisible. Le passer en blanc (règle « texte toujours lisible »).
8. Deux tests de style ratent déjà avant le 25/11 :
   - `animations_ui` : durées de plus de 300 ms et animation de width/stroke-dashoffset ;
   - `clip1_ui` : `.band-frost a:hover` hors `@media (hover: hover)`.

   Les corriger ou mettre à jour les tests, en accord avec Marketing pour `bands.css`.

9. **RÉGRESSION trouvée par la vérification complète du 26/11 (urgent, à corriger avec le point 6).** `tests/ui/son_passage.py` passe à **78/86 sur main** (fusion du 25/11 22 h 15), contre **86/86 juste avant** (b20bd6a). Sur **téléphone, FR et EN** :
   - glisser le curseur **change le passage choisi** (le début passe de 18 s à 10,28 s) ;
   - « Écouter le passage » et la lecture ne partent plus du début du passage.

   Un rappeur qui choisit son passage puis touche le curseur perd sa sélection. Vient très probablement d'`app/retours-25-11` ou d'`app/fin-export-belle` (puces « 15 s / 30 s / Refrain » ?). Corriger, puis repasser `son_passage` à 86/86.
10. Autres résultats de la série : `fin_export_belle_ui` 48/49 (les confettis de l'offre, iPhone SE EN) et `refonte_stats_ui` 67/68 une fois sur deux (parcours « skipped », délai dépassé) : à regarder.

Compte rendu : `docs/handoff/app-retours-26-11.md`, Statut PRÊT / EN COURS, et un aperçu `app-retours-26-11`.
