# Marketing & croissance — accueil, Tarifs, avis et compteur (22/11/2026)

Branche : `marketing/vente-22-11`. Demande du Chef de projet du 22/11 (22 h 06), décisions du propriétaire du 22/11 (22 h 15) sur les avis et le compteur.

## Ce qui change
- **Accueil** (`src/markup.html`, `src/app.js` pour l'anglais) : titre « Ton son est prêt. Ton snippet, pas encore ? » ; phrase « … ton snippet est prêt à poster ce soir » ;
  bouton « Monter mon snippet, gratuit » (ouvre le choix du son, comme « Importer mon son ») ; lien « Essayer avec un exemple (son et prises fournis) » (lance `#demoBtn`).
  « Importer la musique » devient « Importer mon son ». Le bouton « mode Clip » du premier écran ne change pas.
- **Avant / après, avis clients, compteur** (`build_site.py`, juste au-dessus de « Stalak, c'est quoi ? », sous l'éditeur pour ne pas le pousser plus bas sur téléphone) :
  - deux cartes « Sans Stalak » / « Avec Stalak » ;
  - « Avis clients » : lus dans `site_src/avis.json`, recopiés mot pour mot avec pseudo, note et formule ; note moyenne et nombre calculés sur tous les avis du fichier ;
    pas de badge « achat vérifié ». Fichier vide = pas de bande ;
  - « Déjà N vidéos montées avec Stalak » : lit `GET /api/stats/exports` (nouveau, `functions/_lib/metrics.js` `exportTotal`, `router.js`) = somme de `ev_export_ok`
    dans `daily_counts` depuis le lancement, tests du propriétaire compris ; cache 5 minutes ; la ligne reste cachée si le chiffre ne vient pas.
- **Texte de présentation** raccourci (FR et EN, 2 paragraphes), **pied de page** : la colonne Tutos est repliée (« Tutos (10) », s'ouvre d'un geste).
- **Tarifs** (`site_src/fr/tarifs.html`, `site_src/pricing.html`, `src/pricing.css`) : ordre Creator Plus, Pro, Gratuit (téléphone et ordinateur) ; en annuel, le prix
  mensuel barré à côté (taille du « 4,17 $ » et du montant annuel inchangée) ; « 5 mois offerts » à la place de « Économise 47 / 44 % » et de « Meilleur prix » ;
  question « Mensuel ou annuel » réécrite avec les vrais montants (95,88 $ et 179,88 $ pour 12 mois) ; bloc « Ce que Pro fait pour toi » avant la liste ;
  un avis sous chaque formule (le premier de `avis.json` pour cette formule, sinon rien) ; bouton du gratuit « Monter mon snippet, gratuit ».

## Format de `site_src/avis.json`
```json
[{"pseudo": "…", "note": 5, "texte": "… mot pour mot …", "formule": "pro"}]
```
`formule` : `free`, `pro` ou `creator` (celle que la personne a utilisée). Le build refuse une note hors 1 à 5 ou une formule inconnue.
Après avoir collé les avis : `python3 build_site.py --domain stalak.app --email contact@stalak.app`.

## Vérifié
- Tests serveur : 113/113 (nouveau test : total, cache, rien d'autre).
- Captures téléphone (390 px) et ordinateur (1280 px), FR et EN, avec 3 avis d'essai jamais enregistrés : rien de coupé, aucune erreur dans la page ;
  le compteur affiche « Déjà 275 vidéos montées avec Stalak » avec une réponse simulée.

## Les avis (22/11, 22 h 35)
Les 30 avis envoyés par le propriétaire sont dans `site_src/avis.json`, textes et pseudos inchangés. La formule est celle que chaque personne cite (15 Pro, 15 Creator Plus ; ceux passés de Pro à Creator Plus comptent pour Creator Plus). Notes telles que données, avec décimales (« 4,8/5 »), étoiles arrondies ; moyenne 4,74 → « 4,7 sur 5 · 30 avis clients ». Vérifié : les 30 textes du site sont identiques au fichier envoyé ; les fonctions citées existent (dont les 60 paroles automatiques par jour de Creator Plus). Tarifs : l’avis de bloody sous Creator Plus, celui de Nasko sous Pro, aucun sous Gratuit.

## Retours du propriétaire sur la maquette (23/11, 0 h 10)
- **Ordinateur, premier écran** (`src/theme.css`, bloc ≥ 900 px à la fin) : une colonne centrée, titre (1 ligne), phrase (2 lignes), carte « Choisis ton son »,
  un seul « Essayer avec un exemple » (le `#demoBtn` qui existait). Cachés sur ordinateur : la vidéo du hero et la pastille « mode Clip ».
  Mes boutons « Monter mon snippet, gratuit » / « Essayer avec un exemple (…) » du 22/11 sont retirés du code.
- **Téléphone, premier écran** : non touché (App & montage, `app/vente-22-11`, boutons « Choisir mon son » / « Voir un exemple »).
- **Vidéo d'exemple** : sur ordinateur, à côté de « Avec Stalak » (`BA_VIDEO` dans `build_site.py`, ne se charge que quand elle est visible).
- **Avis** (`RV_JS` dans `build_site.py`, `.rv-view` dans `theme.css`) : toute la largeur de l'écran, fondu aux deux bords, cartes de même hauteur ;
  défilement continu vers la gauche par `transform` (liste doublée, les copies `aria-hidden`), vitesse 34 px/s, la vitesse descend à 0 en douceur sous la souris
  ou le doigt, glissement à la main (pointeur), arrêt quand la bande n'est pas à l'écran ; « moins d'animations » ou sans script : liste à faire glisser.
  Mesuré : pas constant de 0,57 px par image, période = moitié exacte de la liste (pas de saut), pas de défilement horizontal de la page (390, 1280, 1440 px).
- **Même axe, même largeur** (700 px) : avant / après, avis (titre et note centrés), compteur, « Stalak, c'est quoi ? ».
- Skills : stalak-da (goûts « tout centré, une chose à regarder, rien de coupé » et « les avis défilent seuls »), taste, motion-design (temps = linéaire, transform seul).

## Compteur mis en avant (23/11, 0 h 20, demande du propriétaire : « il est trop caché »)
`COUNT` dans `build_site.py`, `.proof-n` dans `theme.css` : le compteur est le premier élément de la partie sous l'éditeur, le chiffre en très gros
(police de titre, 64 à 104 px), « Déjà » au-dessus et « vidéos montées avec Stalak » dessous. Il compte de 0 au total en 0,9 s à son arrivée à l'écran
(rien avec « moins d'animations »). Sans réponse de `/api/stats/exports` : toujours caché.

## Audit Marketing du 23/11 : points 1 à 4 (23/11, 1 h)
Audit : `docs/audit/2026-11-23-audit-marketing.md`. Décisions du propriétaire : 5, 7, 8 refusés ; 10 pris par le Chef de projet ; 6 et 9 plus tard.
- **1** `build_site.py` `PAGE[...]['desc']` FR et EN : le résultat d'abord (« Ton son est prêt, pas ton snippet ? … Prêt à poster ce soir »), 157 et 154 caractères. Titres inchangés.
- **2** `site_src/*.html` et `site_src/fr/*.html` : texte des 76 boutons `a.cta` (liens et suivi `?ref=seo` inchangés).
- **3** et **4** `site_src/fr/tarifs.html`, `site_src/pricing.html`, `src/pricing.css` (`.p4-fold`).
- Fusion de `main` : `src/markup.html` (mon titre + les boutons `.hero-go` d'App & montage), `src/theme.css` (les deux blocs gardés), `public/` reconstruit.
- Propositions « un site beau dès l'arrivée » : page claude.ai « Stalak, idées d'animations » (6 maquettes animées, à choisir par le propriétaire). Rien de codé.

## Les 6 animations (23/11, 1 h 30, choix du propriétaire sur la page « Stalak, idées d'animations »)
| # | Quoi | Où dans le code | Limites |
|---|---|---|---|
| 1 | Titre de l'accueil, un mot par temps (190 ms), une fois ; le texte simple est remis ensuite | script après le `h1` dans `src/markup.html`, `.hw` dans `theme.css` | Ordinateur (≥ 900 px) |
| 2 | Le vrai montage `demo/edit.mp4` + `demo/takes.jpg` (une image par prise, allumée quand elle est à l'écran : ordre 1, 2, 3, 2) + 4 mesures et tête de lecture calée sur `currentTime` | `BA_VIDEO` dans `build_site.py`, `.mx-*` | Ordinateur et téléphone (sous l'éditeur) ; la vidéo ne se charge que visible |
| 3 | « Importer mon son » : tirets qui avancent, égaliseur, plus vifs au survol | script après `#songDrop` dans `src/markup.html`, `.drop-live` | Ordinateur avec souris |
| 4 | Note des avis : étoiles qui se remplissent, chiffre qui monte ; suit la langue de la page | `RV_NUM_JS` dans `build_site.py`, `.rv-fill` | Une fois, à l'arrivée à l'écran |
| 5 | Blocs qui montent en douceur (0,5 s, décalés de 90 ms) | `src/fx.js`, `src/fx.css` | Seulement ceux sous le premier écran ; jamais cachés sans script |
| 6 | Neige à l'appui sur `a.cta` et `.pr-cta` (12 flocons, 0,65 s) | `src/fx.js` | Pages du site (Tarifs, aide) ; pas les boutons de l'éditeur |

Tout s'arrête avec « moins d'animations ». Vérifié au navigateur (1440 et 390 px) : pas d'erreur, pas de débordement, le titre redevient du texte simple,
la prise allumée suit la vidéo, 12 flocons puis 0. Petite vidéo de démonstration envoyée au propriétaire.
