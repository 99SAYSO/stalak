# Audit visuel sur téléphone — 22/11/2026 (Chef de projet)

Méthode : vrai site stalak.app ouvert dans un navigateur en taille iPhone 15 Pro (393 × 659 visibles) et iPhone SE, FR et EN : accueil, exemple, étapes 2 à 4, carte Exporter, page Tarifs. Mesures prises dans la page (positions, tailles des boutons, hauteurs). Skills : `taste`, `stalak-da`, `webapp-testing`.
Non testé : caméra réelle, vrai export iPhone, écrans d'un compte connecté (galerie, publier sur TikTok), vitesse en 4G.

Note : 7,2/10 (couleurs 9, polices 8, espacements 7, lisibilité 6, hiérarchie 6). Aucun débordement horizontal, aucune erreur JS.

| # | Constat | Mesure | Gêne | Pour qui |
|---|---|---|---|---|
| 1 | Le premier écran ne montre aucun bouton pour commencer | `#songDrop` commence à 667 px pour 659 px visibles ; `#demoBtn` à 905 px ; la seule bulle cliquable est « mode Clip » (Pro) | Forte | App |
| 2 | À l'étape Montage, le texte « Stalak, c'est quoi ? » et le pied de page restent sous l'éditeur | page de 5 145 px dont 1 718 px pour `#p4` ; `.about` 1 024 px, `#siteFoot` 1 559 px | Forte | App |
| 3 | Le bouton flottant « Exporter ↓ » (`#expFab`) recouvre les réglages et reste par-dessus le pied de page ; le glaçon d'aide recouvre des fins de phrase | captures | Moyenne | App |
| 4 | Mur de texte sur l'accueil | `.about` : 283 mots, 14,5 px, blanc sur bleu avec la neige derrière | Moyenne | Marketing |
| 5 | Boutons trop petits | prises : « − + × » 34 × 42 px collés (× supprime) ; case « Meilleure prise auto » 16 px ; lien « Mode Clip » 18 px de haut | Moyenne | App |
| 6 | Pied de page de 2,4 écrans, 23 liens ; « Your Privacy Choices » en anglais sur la page FR | 1 559 px | Faible | Marketing |
| 7 | Bandeau « Installe Stalak comme une app » dès la première visite, entre « Continuer » et la suite | capture | Faible | App |
| 8 | Étapes 2-4 grisées peu lisibles ; « Sur les mots » grisé sans explication | `rgba(10,13,20,.6)` sur `rgba(214,236,255,.45)` | Faible | App |
| 9 | Tarifs : clair, mais long ; « Gratuit » en 3e | — | Faible | Marketing |

Corrections proposées : deux gros boutons (« Essayer avec un exemple », « Importer mon son ») dans le premier écran ; cacher `.about` et réduire le pied de page dès qu'un son ou l'exemple est chargé ; barre « Exporter » pleine largeur en bas ; 4 cartes illustrées à la place du mur de texte (texte complet replié) ; cibles de 44 px, « × » séparé ; pied de page en volets.

Page avec les captures : artifact « Audit mobile Stalak ». En attente du choix du propriétaire avant d'envoyer aux conversations.
