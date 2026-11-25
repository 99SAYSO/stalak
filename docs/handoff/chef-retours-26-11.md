# Retours du propriétaire, 26/11/2026 (0 h 49) — pour App

Le propriétaire a testé la version en ligne (fusion du 25/11 22 h 15). Pour chaque point : une maquette ou des captures d'abord, sa validation, puis la fusion (règle 9). Respecter `docs/marketing/PROMESSE.md` : un snippet dynamique et stylé.

1. **« Meilleure prise auto » désactivée par défaut.** `state.bestTake` doit valoir `false` au départ. À côté de l'interrupteur, une courte explication entre parenthèses (FR/EN) :
   - ce que fait l'option : elle choisit les prises les plus réussies ;
   - et ce qu'elle change : elle peut réduire le nombre de coupes et laisser moins de place aux autres prises qu'en mode désactivé.
2. **Après « Enregistrer la vidéo »** (écran de fin), un bouton bien visible **« Retour au menu principal »** (EN : « Back to home ») qui ramène à l'accueil. La vidéo reste dans « Montages ».
3. **Filtres refaits, du niveau de ceux de TikTok.** Le propriétaire envoie des captures d'écran des filtres TikTok qu'il aime. On s'en inspire pour le rendu (couleur, grain, contraste) sans les copier. Proposer de nouveaux filtres, avec des aperçus sur une vraie prise, avant de remplacer les actuels.
4. **Mode Snippet : pas de bouton « Effets ».** Il ne s'affiche qu'en mode Clip.
5. **Animation de l'export : la mascotte doit travailler.** Aujourd'hui elle reste immobile avec sa glace. Elle doit faire des allers-retours entre le tas de blocs de glace et l'igloo, poser un bloc à chaque voyage, et l'igloo monte au rythme de la progression. Règles `motion-design` : transform et opacity, pas de rebond, mouvement réduit respecté.

**Vu par le Chef de projet pendant la vérification du 26/11 :**

6. **« Publier sur TikTok » est proposé à tout le monde sur l'écran de fin, alors que l'appli TikTok est encore en Sandbox.** Seul le compte testeur @stalak_app peut la relier, et la publication reste en « Seulement moi ». Un vrai abonné qui clique tombera sur une erreur TikTok. **Proposer au propriétaire** de masquer le bouton ou de l'afficher en « Bientôt », jusqu'à la validation de TikTok (après la vidéo de démo et le « Submit for review »).
7. Écran de construction (igloo) : le texte « Encore environ 1 s » est gris sur bleu, peu lisible. Le passer en blanc (règle « texte toujours lisible »).
8. Deux tests de style ratent déjà avant le 25/11 :
   - `animations_ui` : durées de plus de 300 ms et animation de width/stroke-dashoffset ;
   - `clip1_ui` : `.band-frost a:hover` hors `@media (hover: hover)`.

   Les corriger ou mettre à jour les tests, en accord avec Marketing pour `bands.css`.

Compte rendu : `docs/handoff/app-retours-26-11.md`, Statut PRÊT / EN COURS, et un aperçu `app-retours-26-11`.
