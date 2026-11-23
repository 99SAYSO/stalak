Statut : EN COURS (tests en cours)
Branche : app/accueil-A (créée depuis `main` ead6f07 du 23/11, « Maquette A choisie pour l'accueil téléphone »).
Maquette de la branche : https://app-accueil-a.stalak-site.pages.dev (à faire valider par le propriétaire, règle 9).

Demande : message du Chef de projet du 23/11 (1 h 35). Le propriétaire a choisi la maquette A pour le premier écran de l'accueil
sur téléphone (`docs/audit/maquettes/2026-11-23-accueil-telephone-A.png`).

## Ce qui change, sous 900 px, tant qu'aucun son n'est importé
Tout est centré, dans cet ordre :
1. la mascotte qui fait coucou, 90 px de large (64 px sur un écran de moins de 600 px de haut) ;
2. le titre sur 2 lignes : « Ton son est prêt. » / « Ton snippet, pas encore ? » (EN : « Your song is done. » / « Where's the
   snippet? ») ;
3. la phrase courte : « Filme quelques prises. Stalak les coupe sur le rythme, lèvres synchro. » ;
4. un seul gros bouton noir « Choisir mon son », qui ouvre le choix du fichier comme avant ;
5. « Voir un exemple » en lien souligné avec un petit rond ▶, qui lance l'exemple comme avant (zone de toucher de 48 px) ;
6. une pastille blanche : étoiles, « 4,7/5 · 275 vidéos montées ».

Les deux chiffres de la pastille sont lus pour de vrai :
- **la note** : la moyenne de `site_src/avis.json`, calculée par `build_site.py` comme pour la bande d'avis de Marketing (4,74,
  affichée « 4,7/5 ») ;
- **le total** : `/api/stats/exports`, demandé une fois au chargement.
- Si le total ne se charge pas, la pastille montre seulement la note. S'il n'y a ni note ni total, il n'y a pas de pastille.

Retirés de ce premier écran : la petite vidéo à côté du titre (elle n'est plus téléchargée sur téléphone) et la pastille
« Essaie le mode Clip ». Le choix TikTok / Clip reste dans la carte.
Une seule mascotte : tant que ce haut est affiché, celle posée sur la carte « Choisis ton son » est cachée.

**Ordinateur (900 px et plus) : rien ne change.** L'accueil de Marketing reste tel quel.

## Mesuré
| Écran | Bas du bouton « Choisir mon son » | Hauteur visible |
|---|---|---|
| iPhone 12, FR | 503 px | 664 px |
| iPhone SE, FR | 447 px | 568 px |
| iPhone SE, EN (avec le bandeau « Version française ») | 503 px | 568 px |

Sur iPhone 12, tout le bloc tient dans le premier écran, pastille comprise (jusqu'à 607 px).

## Fichiers
- `src/markup.html` (le haut de l'accueil, `.hero`), `src/theme.css`, `src/app.js` (`heroProof`, textes FR/EN).
- **Pour Marketing** :
  - `build_site.py` : la moyenne des avis est aussi écrite dans la pastille (`data-mean`), et la petite vidéo n'est plus
    lancée quand elle est cachée ;
  - `src/markup.html`, bloc `.hero` : le titre contient un retour à la ligne (`<br class="hero-br">`) qui ne joue que sous
    900 px. L'animation mot par mot de l'ordinateur n'est pas touchée.
- Tests : nouveau `tests/ui/accueil_a_ui.py`.

## Résultats des tests
(à venir)
