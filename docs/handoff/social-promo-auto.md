Statut : EN COURS
Branche : social/promo-auto

## Résumé
Vidéos promo de Stalak créées chaque dimanche par une tâche programmée, envoyées au propriétaire, puis programmées par Zernio (une par jour, TikTok et Instagram @stalak_app) **seulement après son « ok »**.
Documents seulement pour l'instant : rien à mettre en ligne, rien dans l'app ni le site.

## Fichiers touchés
- `docs/social/PROMO_AUTO.md` (nouveau) : fonctionnement, ce que fait le propriétaire, règles de TikTok et d'Instagram vérifiées le 3/11, réglages de chaque vidéo, plan de tests (heures, modèles, accroches).
- `docs/social/TACHE_DIMANCHE.md` (nouveau) : consigne exacte de la tâche du dimanche.
- `docs/social/promo-journal.csv` (nouveau) : en-tête du journal. Le journal vivant est sur la branche `social/promo-journal`, **à ne jamais fusionner**.
- `promo/series/README.md` (nouveau) : où ranger les modèles validés.
- `docs/STATUS.md` (section Réseaux sociaux).

## Migration SQL
Aucune.

## Tests
Aucun code modifié.

## Reste à faire
- Propriétaire : créer le compte Zernio, y relier TikTok et Instagram @stalak_app, ajouter le connecteur Zernio dans Claude, bloquer `posts_publish_now`.
- Réseaux sociaux : créer les modèles avec le propriétaire, puis la tâche du dimanche (après le connecteur Zernio), puis faire un premier essai.
- Pour le Chef de projet : rien à fusionner tant que ce compte rendu dit EN COURS.
