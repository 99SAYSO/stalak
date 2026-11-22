Statut : PRÊT
Branche : app/fin-et-minuteur (créée depuis `main` 73f9be2 du 22/11, « TikTok : essai réussi »).
Maquette : https://app-fin-et-minuteur.stalak-site.pages.dev (à faire valider par le propriétaire, règle 9).

Demande : deux retours du propriétaire sur l'appli (22/11), transmis par le Chef de projet.

## 1. Le compte à rebours réapparaissait pendant le tournage
**Ce qu'il a vu** : avec le minuteur de 3 ou 5 s, le compte à rebours se fait, la musique démarre, puis un compte à rebours
réapparaît une 2ᵉ fois.

**La cause** : il n'y avait ni double déclenchement, ni ancien minuteur oublié. La musique de la prise part une mesure avant le
passage choisi. Pendant cette mesure, `startTake()` affichait aussi les 4 temps (4, 3, 2, 1) dans `#recCount`, mais seulement
quand un minuteur était réglé (choix du 6/11 : « sans minuteur, aucun chiffre »). On voyait donc 3, 2, 1, puis 4, 3, 2, 1.

**La correction** (`src/app.js`, `startTake`) : plus aucun chiffre une fois la musique partie. Le compte à rebours ne s'affiche
qu'une fois, avant la musique. Sans minuteur, il n'y a toujours aucun chiffre. Le bip de chaque seconde du minuteur ne change pas.

**Vérifié** dans `tests/ui/fin_export_ui.py`. Le passage commence à 6 s, donc une mesure entière est jouée avant :
- sur `main`, le défaut est reproduit : l'écran montre 3, 2, 1 puis 4, 3, 2, 1 après le départ de la musique ;
- sur la branche, on voit 3, 2, 1 puis plus rien (iPhone et ordinateur, FR et EN).

**Limite** : Safari d'iPhone n'est pas disponible ici. J'ai testé avec Chromium en taille iPhone. La cause ne dépend pas du
navigateur : c'est l'appli elle-même qui affichait ces chiffres.

## 2. Fin d'export : « Enregistrer la vidéo » et « Partager » fusionnés
- **Un seul bouton, « Enregistrer la vidéo »**, gros et en premier, comme avant.
- **Sur téléphone et tablette qui savent partager un fichier**, il ouvre la fenêtre de partage du téléphone avec la vidéo
  (`navigator.share`), ce que faisait « Partager ». Sur iPhone, on y touche « Enregistrer la vidéo » pour l'avoir dans Photos.
  L'explication dessous le dit :
  - iPhone : « Dans la liste, touche « Enregistrer la vidéo » pour la garder dans Photos. Ou choisis TikTok ou Instagram… » ;
  - Android : « Dans la liste, choisis où la garder (Photos, Fichiers…). Ou choisis TikTok ou Instagram… ».
- **Sur Android, un petit lien « Ou télécharger le fichier »** reste sous le bouton. C'est un choix de ma part, à valider par le
  propriétaire : la liste de partage d'Android ne propose pas toujours d'enregistrer le fichier. Ce lien n'existe pas sur iPhone,
  où un téléchargement irait dans Fichiers, pas dans Photos.
- **Sans partage de fichier** (ordinateur, vieux navigateur, pack .zip) : téléchargement, comme avant.
- **Si le partage échoue** : la vidéo est téléchargée tout de suite, avec le message « La liste de partage ne s'est pas ouverte :
  la vidéo est téléchargée à la place. » Les fois suivantes, le bouton télécharge directement. Fermer la liste sans choisir ne
  fait rien.
- **Le bouton « Partager » est supprimé**, ainsi que ses textes (`post.share`, `post.shareMain`, `post.sharePhotos`).
- Mis à jour aussi : `post.shareHintIos`, `post.shareHintPhone` et l'aide « Poster ta vidéo » / « Post your video »
  (connaissances de l'aide, FR et EN).
- **« Publier sur TikTok » n'est pas touché.** Il se place toujours sous la zone de partage (`#shareBox`, gardée). Le test
  `tiktok_ui` réussit (184/184).

## Fichiers
`src/app.js`, `src/markup.html`, `src/theme.css`. Tests :
- `tests/ui/partager_ui.py`, réécrit pour le bouton unique (iPhone, Android, ordinateur, FR/EN, gratuit/Pro, partage fermé ou
  refusé, téléphone sans partage de fichier) ;
- `tests/ui/fin_export_ui.py` (compte à rebours une seule fois, écran de fin sans « Partager ») ;
- `tests/ui/audit_ui.py` (« Enregistrer » ouvre le partage sur iPhone).
Rien pour Marketing ni Comptes.

## Résultats des tests (22/11, sur la branche, lancés un par un)
- serveur `tests/backend/run.mjs` **112/112**, `audit_ui` **158/158**, `tiktok_ui` **184/184**, `audit611_ui` **91/91**,
  `clip1_ui` **87/87**, `exports_rates_ui` **80/80**, `pied_de_page_ui` **842/842**.
- `partager_ui` 90/92 et `fin_export_ui` 82/86 : ce sont les mêmes échecs que sur `main`, sans lien avec cette branche. La case
  « Reçois des conseils pour tes prochaines vidéos par e-mail » (Comptes) est en haut de l'écran de fin et pousse « Enregistrer
  la vidéo » sous le bas de l'écran sur iPhone. C'est signalé depuis le 13/11 et toujours à décider avec Comptes. La suppression
  de « Partager » fait gagner un peu de place, mais pas assez.
