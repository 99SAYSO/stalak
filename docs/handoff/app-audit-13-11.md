Statut : PRÊT
Branche : app/audit-13-11 (créée depuis `main` 9baa963 du 13/11, « Audit du site du 13/11 et STATUS »).
Maquette : https://app-audit-13-11.stalak-site.pages.dev (à faire valider par le propriétaire, règle 9).

Demande : audit du 13/11 (`docs/audit/2026-11-13-audit-site.md`), points pour App : 4 (vitesse de l'accueil), 10 (bouton pâle),
3 (compteur du mode Clip, avec Comptes) et les 2 plantages d'export sur iPhone.

## 1. Vitesse de l'accueil sur téléphone (audit n° 4)
**La cause.** Le plus grand texte du premier écran est affiché très tôt, vers 1,2 s sur un téléphone lent simulé. Mais quand
le script de l'appli arrivait, il remettait la langue de la page (`<html lang="en">`) à la même valeur. Le navigateur refaisait
alors la mise en forme de tous les textes, et la phrase sous « TikTok / Clip » comptait comme si elle venait d'apparaître.
Lighthouse / PageSpeed en déduisaient que l'affichage attendait les 305 Ko du script, ce qui donnait 4,4 s sur une 4G lente.
Ce n'était ni la vidéo, ni les polices.

**Les corrections**, sans rien changer à ce qu'on voit :
- `src/app.js` : la langue de la page n'est remise que si elle change vraiment. C'est la correction qui compte.
- `src/app.js` : la phrase sous « TikTok / Clip » n'est réécrite que si son texte change.
- `build_site.py`, **pour Marketing** :
  - les deux bibliothèques vidéo et l'appli ne sont plus dans la page en « defer ». Un petit script les charge juste après
    le premier affichage, dans le même ordre ;
  - la vidéo de l'accueil n'est plus téléchargée en même temps. On voit son image tout de suite, et elle se lance une fois
    la page chargée ;
  - si le téléphone demande moins d'animations, la vidéo reste sur son image. Elle tournait jusqu'ici, car le réglage de
    l'appli visait l'ancien identifiant `#heroVid`.
- `src/markup.html` : la vidéo de l'accueil n'a plus `autoplay`, et `preload="none"`.
- Essayé puis abandonné : écrire la liste des polices dans la page. Le premier affichage n'était pas plus rapide.

**La mesure avant / après** (Lighthouse 12, téléphone comme PageSpeed, même serveur local compressé comme Cloudflare,
médiane de 5 passages) :

| | Score | Premier affichage | Plus grand élément | Blocage | Plus grand élément, les 5 passages |
|---|---|---|---|---|---|
| Avant (`main`) | 90 | 1,4 s | 2,4 s | 184 ms | 4,0 · 1,5 · 4,4 · 2,4 · 2,4 s |
| Après | 97 | 1,8 s | 2,1 s | 83 ms | 2,3 · 2,2 · 2,1 · 2,1 · 2,1 s |

- Avant, 2 passages sur 5 basculaient à 4 s et plus : c'est ce que PageSpeed a vu (4,5 s). Après, le résultat ne bascule
  plus, il reste toujours sous la cible de 2,5 s.
- Sur stalak.app avant correction, la même mesure donnait 4,4 s.
- Le premier affichage calculé par Lighthouse monte un peu (1,4 → 1,8 s), car le script arrive plus tard dans son calcul.
- Sur un vrai téléphone lent simulé (réseau 1,6 Mbit/s, processeur 4 fois plus lent, médiane de 3), rien ne change pour
  la personne. Premier affichage : 0,84 s avant, 0,87 s après. Plus grand élément : 1,22 → 1,24 s. Appli prête à
  l'emploi : 5,53 → 5,46 s.
- **La suite possible** : ces 5,5 s avant que l'appli réponde viennent du poids du script (305 Ko compressés, dont 200 Ko
  inutiles au premier écran). Les réduire demande de découper l'appli en morceaux chargés à la demande. C'est un plus gros
  chantier, à décider.

## 2. Bouton de choix pâle sur téléphone (audit n° 10)
Tous les survols simples de l'appli sont réservés aux appareils avec souris (`@media (hover:hover)`) : 18 règles dans
`src/theme.css` et 2 dans `src/style.css`.
- Sur un écran tactile, un bouton touché ne reste plus « survolé ».
- Le bouton choisi reste blanc sur bleu, les autres redeviennent normaux.
- Restent tels quels : les survols partagés avec la touche Tab du clavier (menus) et l'étiquette PRO.

## 3. Compteur du mode Clip (audit n° 3), pour Comptes
- **Les offres ouvertes depuis l'export du Clip envoient bien la raison `clip`** : vérifié dans le navigateur, avec
  `clip_ask` « pro » puis `plans_open` « clip ».
- **Pourquoi `ev_plans_why_clip` est à 0 depuis le 7/11.** Depuis `app/clip-1`, choisir Clip n'ouvre plus les offres : on
  essaie d'abord tout en aperçu, et les offres ne s'ouvrent qu'à l'export d'un clip sans Pro. Avant, chaque toucher sur
  « Clip » en Gratuit comptait comme une ouverture des offres pour Clip. Le 0 veut dire qu'aucun compte Gratuit n'a demandé
  l'export d'un clip. Le compteur `clip_ask` du tableau de bord le confirme.
- **Les 21 « autre »** sont surtout des ouvertures sans fonction payante derrière : le bouton « Tarifs » de l'en-tête, un
  forfait choisi sur la page Tarifs du site, et le menu du compte. Ils sont maintenant rangés en `tarifs` et `menu`.
  « Autre » ne garde que le reste.
- **Nouvel événement `clip_open`**, « a ouvert le mode Clip » : compté une fois par visite, quand la personne choisit Clip
  elle-même (à l'étape 1 ou au Montage), en Gratuit ou en Pro.
- Le tableau de bord, onglet Entonnoir, carte « Clips 16:9 et vidéos TikTok », affiche « Mode Clip ouvert (visites) », en
  Gratuit et en Pro. La liste « Ce qui ouvre la page des formules » montre « Bouton ou page Tarifs » et « Menu du compte ».
- Fichiers : `functions/_lib/metrics.js` (`clip_open`, raisons `tarifs` et `menu`), `functions/_lib/admin.js` (`clipOpen`),
  `functions/_lib/admin-page.js`, les chiffres de démo, un nouveau test serveur. Pas de migration.

## 4. Plantages d'export sur iPhone (2 cas : 9:16, plus de 60 s, étape « frames », après environ 10 s)
- Je ne peux pas lancer Safari d'iPhone ici. J'ai reproduit la même situation dans Chromium, en suivant la mémoire de
  l'onglet toutes les 0,5 s : 4 prises 1080×1920 de 80 s (environ 150 Mo chacune, comme un iPhone), tout le morceau (70 s),
  en 9:16.
  - **De la façon habituelle**, toutes les prises sont décodées en même temps et dessinées par la carte graphique. La
    mémoire monte de **500 Mo dans les 5 premières secondes des images**, puis reste vers 1,2 Go, avec un pic à 1,25 Go.
  - **De la façon sûre**, une prise à la fois et dessin en 2D, elle monte doucement et plafonne vers 0,9 Go, avec un pic à
    0,98 Go. L'export n'est pas plus lent, il a même été plus rapide ici.
  - Un onglet Safari d'iPhone est fermé autour de 1 à 1,5 Go selon le modèle. Le moment et l'étape correspondent aux 2 cas.
- **La correction** : sur téléphone, une vidéo de plus de 45 s est faite de la façon sûre dès le départ. L'encodeur et la
  qualité restent les mêmes.
- **Ce que je ne peux pas promettre** : c'est mesuré dans Chromium, pas sur un vrai iPhone. Le compteur
  `ev_xf_ios_crash` dira dans les jours qui viennent si ces plantages disparaissent.

## Fichiers
`src/app.js`, `src/markup.html`, `src/theme.css`, `src/style.css`, `build_site.py` (Marketing), `functions/_lib/metrics.js`,
`functions/_lib/admin.js`, `functions/_lib/admin-page.js`, `functions/_lib/admin-demo-data.js` et
`tests/fixtures/dashboard-seed.mjs` (Comptes).
Tests :
- `tests/backend/run.mjs` (nouveau test) ;
- `tests/ui/clip1_ui.py` (`clip_open` une fois par visite, survols, bouton après un toucher) ;
- `tests/ui/exports_rates_ui.py` (vidéo de 70 s sur téléphone de la façon sûre, et sur ordinateur comme d'habitude) ;
- `tests/ui/audit611_ui.py` (scripts chargés après le premier affichage).

Pour le propriétaire : il manque toujours les paroles des 8 premières mesures de « neva die » pour l'exemple.

## Résultats des tests
(complétés en fin de travail)
