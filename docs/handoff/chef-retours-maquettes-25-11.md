# Retours du propriétaire sur les maquettes (25/11/2026, 0 h 59)

Captures annotées : `docs/audit/retours-2026-11-25/image-1.jpg` à `image-10.jpg` ; vidéo de la fin d'export (planche) : `video-fin-export-planche.jpg`.
Nouvelles règles dans « Mes goûts » : texte toujours lisible, graphique toujours légendé, fonds par étape, Clip choisi à l'étape 1 seulement, zéro bug sur les prises.

## App — `app/stats-analyse` + `app/fond-degrade` (maquette https://app-fond-degrade.stalak-site.pages.dev/fr/?demo=pro)
1. **Bouton « Mes stats TikTok »** (image 1) : trop fondu dans les cartes. Aux couleurs de TikTok (noir, cyan, rose, logo TikTok), et à un endroit logique (en haut de « Stats », à côté des chiffres TikTok, ou en tête d'une partie « TikTok »).
2. **« Tes sorties par mois »** (image 2) : on ne sait pas à quoi correspond chaque barre. Mois sous chaque barre, nombre de sorties au-dessus, une phrase de lecture (« 4 sorties en 6 mois, rien en août et en octobre »). Même règle pour tous les graphiques (« Tes auditeurs, semaine par semaine » : axe et valeurs lisibles).
3. **« Ton plan de la semaine »** (image 3) : remplacé par le coach IA, voir `docs/handoff/chef-coach-ia.md` (demande à part, App + Comptes).

## App — `app/suite-clarity` et l'éditeur en général (maquette https://app-suite-clarity.stalak-site.pages.dev/fr/)
4. **Fonds** (image 4 et suivantes) : l'éditeur est encore sur le bleu glace fade. Chaque étape (Son, Prises, Paroles, Montage, export, fin) a **son propre fond** dans la famille du dégradé A : dégradé + flocons blancs qui tombent, une teinte ou une lumière différente par étape. Textes posés sur le fond lisibles (blanc + contour, comme l'accueil).
5. **Mode Clip** (image 5) :
   - sans abonnement, toucher « Clip » ouvre le paywall, **aucun essai** (la maquette affiche encore « Mode Clip : essaie tout dans l'aperçu… » : à retirer, c'est l'ancienne règle) ;
   - même abonné, **on choisit snippet ou clip à l'étape 1 seulement** ; aux étapes suivantes, plus aucun moyen de changer de mode ;
   - le texte en haut de l'étape est illisible (blanc pâle sur bleu clair) : à refaire.
6. **Caméra** (image 6) : la barre du bas (vignette des prises, gros bouton rouge, « Terminer ») déborde de l'aperçu et on voit l'écran derrière en bas ; le message « Prise 1 enregistrée ✓ — tu peux enchaîner la prise 2 » est caché sous les boutons. Tout doit tenir dans l'écran de la caméra, rien derrière ; le message apparaît autrement (bulle en haut ou petite notification qui glisse puis disparaît).
7. **Crash à la 2e prise** (image 7) : écran noir, plus rien ne répond, il a dû fermer le site. **Zéro erreur exigé** : enregistrer 1, 2 ou 20 prises à la suite sur iPhone ne doit jamais bloquer. Trouver la cause (flux caméra pas relâché / rouvert, mémoire, enregistreur relancé trop tôt…), la corriger, et ajouter un test qui enchaîne au moins 10 prises (iPhone simulé) + le dire au propriétaire pour qu'il refasse l'essai sur son iPhone.
8. **Montage final** (image 8) : beaucoup de bugs d'affichage. En touchant le plan 1, le panneau « Changer de prise / Ajouter un plan / Garder ce plan / Exclure ce passage » s'ouvre, ne se ferme jamais et décale tout le bas (stalactites en travers, texte « Les vidéos gratuites portent le filigrane » coupé). Revoir l'écran : panneau en feuille qui monte du bas et se ferme (bouton, glisser, toucher à côté), rien ne se décale, rien ne se superpose. Fond de l'étape (point 4).
9. **Export** (image 9) : les étapes grises sont illisibles sur le bleu, c'est moche. Refaire l'écran : textes lisibles, et **une nouvelle animation de la mascotte faite avec HyperFrames** (règle du propriétaire : toutes les animations de l'app avec HyperFrames), maquette vidéo à montrer avant.
10. **Fin d'export** (vidéo du propriétaire, `video-fin-export-planche.jpg`) : après l'export, l'écran « Ta vidéo est prête » se met à défiler jusqu'au pied de page du site (liens, langues, « Tutos ») sur fond noir, avec par-dessus des restes de l'éditeur (« Filmer maintenant », « Plan 1 – prise 1 », « Changer de prise »…). « Super buggé, moche » : l'écran de fin est un écran d'appli à part entière, qui ne défile pas vers le site et n'affiche rien de l'éditeur derrière lui.

Tests : chaque point vérifié sur iPhone 13 et iPhone SE (390 et 375 px), FR et EN ; captures avant/après dans le compte rendu.

## Marketing — `marketing/clip-reserve-abonnes` (aperçu https://chef-apercu-tarifs.stalak-site.pages.dev/pricing)
11. **Retirer le panneau « Music video mode »** de la page Tarifs (image 10), en anglais et en français : il ne sert à rien. Puis reconstruire `public/` dans la branche (sinon la maquette de la branche ne s'ouvre pas).
