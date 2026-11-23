# Refonte de l'interface mobile — demande du Chef de projet à « App & montage »

Date : 23/11/2026. Demande du propriétaire : « ça ne fait pas assez appli mobile sur iPhone ». Toutes les démos ci-dessous ont été **validées par lui** le 23/11. Branche à créer : `app/refonte-mobile` (un lot = une maquette Cloudflare à lui montrer avant fusion, règle 9).

## Les règles (dans « Mes goûts », collection `da`, entrées `app-*`)

- Vraie appli iPhone : beaucoup d'espace vide, texte lisible, **un seul bouton d'action principal par écran**, peu de boutons, tout pour les pouces (bouton principal en bas, toujours au même endroit).
- Rien n'apparaît ni ne se coupe d'un coup (texte, logo, écran) : tout entre et sort en animation, fluide.
- Pas d'écran « fade, plat » : relief = scène bleue (lumière, neige, stalactites), cartes blanches à contour noir épais et ombre dure, bouton principal **bleu `#1f6fd6`, contour noir, ombre dure noire**.
- Polices : **Lilita One** (titres, boutons) + **DM Sans** pour le texte, à la place de Rubik (déjà dans `public/fonts/`).
- **Animations faites avec HyperFrames** (skill `heygen-com/hyperframes`). Les démos sont des compositions HyperFrames = HTML + une timeline **GSAP** : la même timeline se rejoue dans l'app. GSAP doit être servi depuis le site (pas de CDN), chargé seulement quand il sert ; respecter `prefers-reduced-motion` (pas d'animation, affichage direct).
- Ne concerne que le téléphone (jusqu'à 900 px). L'ordinateur ne change pas dans ce chantier. Français et anglais partout. La version claude.ai doit toujours se charger.

## Les démos validées

Dossier `docs/audit/maquettes/mobile-2026-11-23/` (images et vidéos) et `sources/` (le HTML de chaque démo, les timelines GSAP dans `sources/<nom>/index.html`).

| N° | Écran | Fichier | À retenir |
|---|---|---|---|
| 1 | Ouverture de l'app | `01-ouverture-glacon.mp4` | Glaçon qui tombe, la mascotte dort dedans, se réveille, il éclate, elle saute et fait coucou, « Stalak » lettre par lettre, le rideau bleu se lève sur l'accueil et la mascotte rejoint sa place. Environ 4 s ; **une fois par session au plus**, jamais pendant un montage en cours, passable d'un toucher. Le propriétaire trouve les éclats un peu lents : les accélérer. |
| 2 | Connexion / inscription | `02-connexion.jpg` | Plein écran (plus une fenêtre). Les règles des comptes ne changent pas (e-mail + mot de passe + code, Google). |
| 3 | Profil | `03-05-profil-paiement.jpg` (gauche) | Plein écran : photo, nom, formule, 2 cartes (Ma formule, TikTok), une liste, « Se déconnecter » en bas. |
| 4 | Tirer pour rafraîchir | `04-tirer-pour-rafraichir.mp4` | Sur « Montages » : la capuche de la mascotte dépasse derrière la page, fond bleu et flocons. |
| 5 | Choix du paiement | `03-05-profil-paiement.jpg` (droite) | **Avec Comptes** : voir si Paddle permet d'ouvrir un moyen de paiement précis (`allowedPaymentMethods`). Sinon l'écran s'arrête au rappel de la formule et Paddle prend le relais. Les conditions de l'abonnement restent écrites en clair. |
| 6 | Glaçon d'aide | `06-glacon-aide.jpg` | Vraie conversation, réponses toutes prêtes à toucher. Les textes de la démo sont des exemples : garder les vraies réponses. « Parler à un humain » reste Creator Plus. |
| 7 | Éditeur : Son, Prises, Paroles, Montage | `07-11-editeur-camera.jpg` | Barre de progression en haut (retour à gauche, glaçon d'aide à droite), une question par écran, bouton bleu en bas, bulle jaune de la mascotte **la première fois seulement**. **Aucun réglage existant ne disparaît** : l'étape Montage de la démo a été redessinée de mémoire, vérifier qu'il ne manque rien et me dire ce qui ne rentre pas. |
| 8 | Après un achat | `08-achat-confettis.mp4` | Feuille qui monte, mascotte contente, confettis (bleus, blancs, jaune, rose), un seul bouton « Faire un montage ». |
| 9 | Barre du bas | `09-barre-du-bas-accueil.jpg` (droite) | Accueil, Montages, « + » bleu au centre (nouveau montage), Stats (TikTok), Compte (tête de la mascotte). Cachée pendant l'éditeur et la caméra. |
| 10 | Tutoriel | `10-tutoriel.mp4` | 4 écrans, barre en haut qui se remplit, « Passer », « Suivant ». Au premier lancement, et depuis Profil → « Revoir le tutoriel ». |
| 11 | Caméra | `07-11-editeur-camera.jpg` (droite) | Son propre écran, plein écran : avancée du son en haut, numéro de la prise, minuteur à droite, gros bouton rouge, prises déjà filmées à gauche, « Terminer ». **Pas de paroles qui défilent** (refusé pour l'instant). |
| 12 | Police du texte | `12-polices-choix-B.jpg` | DM Sans. |

## Ordre proposé (un lot = une maquette)

1. Socle : DM Sans, barre du bas, accueil, GSAP en local, ouverture de l'app.
2. Connexion, profil, tirer pour rafraîchir (avec Comptes pour le bloc compte).
3. Éditeur (4 étapes) et caméra.
4. Tutoriel, glaçon d'aide, écran après achat, choix du paiement (avec Comptes).

## Limites

- La mascotte n'existe qu'en petit (266 px) : floue en grand. Le propriétaire a été prévenu ; s'il envoie le dessin en grande taille, je le transmets.
- À la fin de chaque lot : tests habituels (serveur, écran 390 px et 1280 px, FR et EN), `docs/STATUS.md`, compte rendu `docs/handoff/app-refonte-mobile.md` avec le lien de la maquette.
