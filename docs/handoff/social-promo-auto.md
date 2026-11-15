Statut : PRÊT
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

## Mise à jour du 15/11 : série animée en français (décision du propriétaire)
**Documents seulement**, rien à mettre en ligne, pas de maquette nécessaire (changements invisibles).
- `docs/social/SERIE_FR.md` (nouveau) :
  - programmation de 3 vidéos par jour (12 h 30, 18 h, 21 h, Paris) dans Zernio, en « attente d'approbation » ; le propriétaire approuve chaque lot dans Zernio ;
  - ce que Marketing livre pour chaque lot ;
  - les bios françaises ;
  - le rapport du samedi vidéo par vidéo ;
  - à décider : YouTube Shorts.
- `docs/social/BOOST_FR.md` (nouveau) : réglages du boost TikTok et Instagram ciblés France, budget de 100 à 150 $ par mois (200 $ au plus), rien n'est lancé.
- `docs/social/TACHE_SAMEDI.md` réécrit, et la tâche du samedi mise à jour avec le même texte.
- `docs/social/serie-journal.csv` (nouveau, en-tête du journal).
- `PROMO_AUTO.md`, `TACHE_DIMANCHE.md`, `PREMIER_ESSAI.md` : marqués « Remplacé le 15/11 ».
- `docs/STATUS.md` : section Réseaux sociaux.

Tests : aucun code modifié.
Reste au propriétaire :
- coller les bios ;
- décider pour YouTube Shorts (6 $ par mois chez Zernio) ;
- approuver le premier lot dans Zernio quand Marketing l'aura livré.

## Mise à jour du 15/11, 21 h 30 : Studio Stalak (règles 11 et 12)
- `docs/social/SERIE_FR.md`, partie 1 réécrite :
  - on programme seulement les fiches `valide` de la page « Studio Stalak » ;
  - on télécharge la vidéo depuis la page, puis on l'envoie à Zernio ;
  - les publications sont créées « en attente d'approbation » ;
  - la fiche passe ensuite en `programme`, puis en `publie`.
- `docs/social/TACHE_SAMEDI.md` : nouvelle étape 6, qui passe en `publie` les fiches `programme` déjà publiées. La tâche du samedi a été mise à jour avec ce texte.
- **Pour le Chef de projet** : Réseaux sociaux ajoute le champ `zernioId` dans les fiches `videos` (identifiant de la publication Zernio). À ajouter au format de `docs/studio/STUDIO_STALAK.md` si tu es d'accord.
- Aucune fiche n'existe encore dans la page (15/11, 21 h 30), aucune n'a été modifiée. Aucun crédit dépensé.
