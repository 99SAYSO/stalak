Statut : EN COURS
Branche : social/promo-auto

## Résumé
Vidéos promo de Stalak créées chaque dimanche par Marketing (5), envoyées au propriétaire, puis programmées par Marketing dans Zernio (une par jour, TikTok et Instagram @stalak_app) **seulement après son « ok »**.
Documents seulement pour l'instant : rien à mettre en ligne, rien dans l'app ni le site.

## Fichiers touchés
- `docs/social/PROMO_AUTO.md` (nouveau) : fonctionnement, ce que fait le propriétaire, règles de TikTok et d'Instagram vérifiées le 3/11, réglages de chaque vidéo, plan de tests (heures, modèles, accroches).
- `docs/social/TACHE_DIMANCHE.md` (nouveau) : consigne du rappel du dimanche, pour Marketing (réglages Zernio exacts vérifiés le 4/11).
- `docs/social/TACHE_SAMEDI.md` (nouveau) : consigne de la tâche du samedi 20 h 31 (chiffres et bilan, lecture seule sur Zernio), créée le 4/11.
- `docs/social/PREMIER_ESSAI.md` (nouveau) : premier essai d'une vidéo par Zernio, pour Marketing.
- `docs/social/promo-journal.csv` (nouveau) : en-tête du journal. Le journal vivant est sur la branche `social/promo-journal`, **à ne jamais fusionner**.
- `promo/series/README.md` (nouveau) : où ranger les modèles validés.
- `docs/STATUS.md` (section Réseaux sociaux).

## Migration SQL
Aucune.

## Tests
Aucun code modifié.

## Changement du 7/11
- Heure des vidéos : **16 h 30, heure de New York**, tous les jours (rapport chiffres du 7/11, piste 6). Fini les créneaux tournants. Fichiers : `PROMO_AUTO.md`, `TACHE_DIMANCHE.md`, `PREMIER_ESSAI.md`, `TACHE_SAMEDI.md`.
- Premier essai pas encore fait (aucune publication dans Zernio le 7/11) : nouvelle date, le premier jour possible après l'« ok » du propriétaire, à 16 h 30 heure de New York.

## Reste à faire
- Propriétaire : mettre l'outil `call_tool` du connecteur Zernio sur « Nécessite une approbation ». Fait le 4/11 : comptes reliés, connecteur ajouté, publication immédiate bloquée, création d'une publication sur « Nécessite une approbation ».
- Marketing (5) : le premier essai (`docs/social/PREMIER_ESSAI.md`, le premier jour possible après l’« ok », à 16 h 30 heure de New York), puis les modèles avec le propriétaire et le rappel du dimanche (`docs/social/TACHE_DIMANCHE.md`). Programmer dans Zernio seulement après son « ok ».
- Réseaux sociaux (4) : lire le compte rendu du premier essai et corriger les consignes si besoin. La tâche du samedi tourne déjà.
- Pour le Chef de projet : rien à fusionner tant que ce compte rendu dit EN COURS (documents seulement).
