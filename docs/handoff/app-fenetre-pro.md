Statut : EN COURS (tests en cours)
Branche : app/fenetre-pro (créée depuis `main` 5c7d0ed du 23/11, « Fusion app/vente-22-11 »).
Maquette de la branche : https://app-fenetre-pro.stalak-site.pages.dev (à faire valider par le propriétaire, règle 9).
Maquette dessinée avant de coder : artifact « Maquette app Stalak 22/11 », partie 6 (validée le 23/11, 0 h 28).

Demande : message du Chef de projet du 23/11 (0 h 30). Le propriétaire trouve la fenêtre « Belle vidéo ! La prochaine, sans
filigrane ? » fade. À refaire.

Choix du propriétaire (23/11, 0 h 28) : la règle d'ouverture proposée ; on garde la fenêtre **et** la comparaison de l'écran
de fin ; le bouton dit « Passer à Pro ».

## Quand elle s'ouvrait
Une seule fois par appareil, après la 1re vidéo de la personne (Gratuit, jamais l'exemple ni un pack). Sur téléphone, après le
toucher sur « Enregistrer la vidéo ». Sur ordinateur, 1 s après la fin de l'export, donc **avant** l'enregistrement.

## Quand elle s'ouvre maintenant
- **Jamais avant « Enregistrer la vidéo »**, sur téléphone comme sur ordinateur. Elle vient environ 1,5 s après la fin de
  l'enregistrement (liste de partage refermée, ou téléchargement lancé).
- **À partir de la 2e vidéo enregistrée** sur l'appareil. À la 1re, l'écran de fin montre déjà la comparaison.
- **Une fois par jour au plus.**
- **Plus jamais après 3 fermetures** sans « Passer à Pro » (« Plus tard », la croix, Échap, un toucher à côté).
- Comme avant : Gratuit seulement, jamais pour l'exemple, un pack ou un abonné, jamais pendant un export, pas sur claude.ai.
- Elle ne s'ouvre que pour une vidéo qui porte le logo, et dont les deux images de l'écran de fin sont prêtes.
- Sur l'appareil, trois petites notes servent à cette règle : le nombre de vidéos enregistrées, la date de la dernière
  ouverture, le nombre de « Plus tard ». Rien n'est envoyé au serveur en plus du compteur `pro_offer` qui existait déjà.

## Ce qu'elle montre
- **Sa vidéo, en grand** : la même image avec le logo (petite, un peu ternie) et sans le logo (grande, légèrement penchée,
  ombre bleue, étiquette PRO). Ce sont les deux images de l'écran de fin. La mascotte est contre la vidéo, pas posée au-dessus.
- **Un seul message** : « Ta vidéo, sans le logo », puis « La même vidéo, prête à poster : elle finit sur toi, pas sur le logo
  Stalak. » La liste à coches est supprimée.
- **Le prix**, comme sur l'écran des formules : 7,99 $ barré, **4,17 $/mois à la même taille qu'avant (30 px)**, « 5 mois
  offerts », et « 49,99 $ facturés une fois par an · annulable à tout moment ». Tout est calculé à partir des vrais prix.
- **« Passer à Pro »** (ouvre les formules sur Pro), puis **« Plus tard », un vrai bouton de la même largeur**, qui ferme tout
  de suite. La croix est un vrai bouton rond de 44 px.
- Une petite ligne en bas : « Aussi avec Pro : le mode Clip 16:9 et tous les filtres. »
- **Relief** : carte couleur glace, contour noir épais, ombre dure.
- **Entrée animée** : le fond s'assombrit (0,18 s), la carte monte et grossit un peu (0,24 s), puis la mascotte glisse en
  place (0,18 s). Le reflet givré de 0,7 s est supprimé. Rien si l'appareil demande moins d'animations.
- **Tout tient dans l'écran sans défiler** : iPhone 12 (664 px), iPhone SE (568 px, où la phrase et la petite ligne sont
  masquées pour garder la place), ordinateur (images à gauche, texte à droite).
- Pas de compte à rebours ni de fausse urgence. Rien de Pro n'est présenté comme gratuit.

## Fichiers
`src/app.js` (règle d'ouverture, contenu, textes `pp.*` FR/EN), `src/markup.html` (`#proPop`), `src/theme.css`.
Tests : nouveau `tests/ui/fenetre_pro_ui.py` ; `audit_ui.py` et `audit611_ui.py` adaptés (les anciennes vérifications de la
fenêtre sont remplacées par « pas de fenêtre avant l'enregistrement ni à la 1re vidéo »).
Rien pour Marketing. Pour Comptes : la fenêtre lit les prix avec `plAmounts` et `plMonths`, comme l'écran des formules.

## Résultats des tests
(à venir)
