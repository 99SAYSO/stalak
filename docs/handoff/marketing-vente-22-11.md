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
