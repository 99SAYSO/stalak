# Demande du Chef : questionnaire dans « Stats » et analyse de l'artiste (24/11/2026)

Décisions du propriétaire du 24/11 (16 h 27 à 17 h 14). Elles **remplacent** celle de 16 h 17 (« onboarding après la création du compte »).

## Le parcours
1. Premier lancement : **le tutoriel** (lot 4), plus le questionnaire.
2. On touche **« Stats »** dans la barre du bas → **le questionnaire** (celui du lot 2, avec les changements ci-dessous), au lieu de demander tout de suite de créer un compte.
3. Fin du questionnaire → **écran de chargement d'environ 9 s**, au rythme irrégulier (des étapes rapides, une ou deux qui « traînent » 2 à 3 s, par ex. « On analyse ton TikTok… », « On lit tes sorties Spotify… »).
4. **« Ton analyse est prête »** avec un aperçu flouté + cadenas → **« Crée ton compte pour la voir »**.
5. Compte créé → « Stats » montre **le bilan gratuit** ; le reste (graphiques, classement des vidéos, plan de la semaine…) est **affiché flouté avec un cadenas**, débloqué par l'abonnement.

## Changements du questionnaire
- « Tu fais quoi ? » : si **« Autre »** est choisi, un champ libre apparaît (« Dis-nous ce que tu fais ») ; la réponse est gardée dans le profil et servira à l'analyse.
- « Colle tes liens » : **TikTok obligatoire pour tout le monde** ; **Spotify obligatoire si « Oui, déjà en ligne »** ; Apple Music, SoundCloud, Instagram, YouTube facultatifs.
- « Combien d'auditeurs aujourd'hui » : seulement pour ceux qui n'ont pas donné de lien Spotify.
- « Passer » reste, mais sans les liens obligatoires « Stats » ne peut pas faire l'analyse : le dire clairement.

## Données (Comptes)
- Profil : ajouter `genreOther` (texte court), `links.tiktok`, `links.youtube` (même vérification de lien que les autres).
- **Sorties Spotify** : liste des albums et singles via l'API officielle (`GET /artists/{id}/albums`, toujours disponible) → nombre de sons par mois, date du dernier son. Accès développeur Spotify à créer par le propriétaire (Premium exigé depuis février 2026).
- **Auditeurs mensuels, abonnés, écoutes des sons** : en test avec un robot Apify (secret `APIFY_TOKEN`, saisi par le propriétaire), relevé 1 fois par semaine et par artiste. Si le relevé échoue : l'écran le dit (« chiffres pas mis à jour cette semaine ») et l'artiste peut saisir ses auditeurs. Aucun chiffre inventé ou estimé affiché comme vrai. À ne brancher qu'après le test du Chef (comparaison avec Spotify for Artists).
- TikTok : stats déjà disponibles avec la liaison TikTok.

## Ce que montre « Stats » (à valider en maquette avec le propriétaire)
- Gratuit : un bilan en 3 phrases à partir de ses vraies données.
- Pro (flouté + cadenas sinon) : courbes TikTok / YouTube / Spotify semaine par semaine, classement de ses vidéos et ce qui marche, rythme de sortie conseillé, plan de la semaine.

## Qui fait quoi
- **App** : parcours, questionnaire, chargement, écrans « Stats » gratuit / flouté (branche `app/stats-analyse`).
- **Comptes** : champs du profil, sorties Spotify, relevé hebdomadaire, routes de « Stats » (branche `compte/stats-analyse`).
- **Juridique** : confidentialité (liens TikTok/YouTube, relevé de chiffres publics, champ libre).
- Maquette au propriétaire avant toute fusion.
