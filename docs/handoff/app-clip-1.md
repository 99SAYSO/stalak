Statut : PRÊT
Branche : app/clip-1. Elle est **créée à partir de `app/exports-rates`** (prête, pas encore intégrée), avec `main` du 7/11
16 h (étude du Clip et décision) fusionné dedans. Les deux branches touchent l'export (`exportOne`) au même endroit : il vaut
mieux intégrer `app/exports-rates` d'abord, puis celle-ci, ou celle-ci seule, puisqu'elle contient les deux.
Maquette : https://app-clip-1.stalak-site.pages.dev (et `/admin-demo/`, onglet « Entonnoir », pour les nouveaux compteurs).
À faire valider par le propriétaire (règle 9).

Demande : mode Clip « irréprochable », étape 1 (étude `docs/clip/2026-11-07-etude-mode-clip.md`, décision du propriétaire dans
STATUS, 7/11 16 h).

## Ce qui change
1. **N° 2, essai complet en Gratuit.**
   - Dans l'aperçu du Clip, les effets (Sobre / Intense) se posent et se choisissent sans Pro : `fxOn` n'exige plus
     `can('fx')`, et « Intense » n'ouvre plus la page de paiement.
   - Les paroles ne sont plus coupées en passant en Clip.
   - Le filigrane est dans l'aperçu, comme avant.
   - Seul l'export du Clip demande Pro (`clipGate` / `clipAsk`, inchangés).
   - Le message « Mode Clip : essaie tout dans l'aperçu, effets et paroles compris. L'export d'un clip 16:9 est pour Pro. »
     apparaît quand un compte Gratuit choisit Clip.
2. **N° 5, son en qualité YouTube** pour tout le monde : AAC stéréo à 384 kbit/s (le conseil de YouTube). Si l'encodeur du
   navigateur refuse, on passe à 320, puis 256, puis les 192 d'avant. L'enregistrement en temps réel demande 320 kbit/s. Le
   calcul de mémoire en tient compte.
3. **N° 6, Clip ↔ TikTok à l'étape Montage** : une ligne « Vidéo : TikTok / Reels | Clip » en haut de « Ton montage ». On change
   sans revenir à l'étape 1, et les deux sélecteurs restent d'accord.
4. **N° 3, vrai exemple**, en TikTok et en Clip, sur stalak.app :
   - le son et les 3 prises de « neva die » de 99Sayso, d'après les fichiers de Marketing (`site_src/demo/example/`,
     `docs/marketing/DEMO.md`, avec son accord du 6/11) ;
   - le tempo est imposé depuis `example.json` (157 BPM, premier temps fort à 0), pas détecté ;
   - les prises sont calées à 0 et nommées « Prise d'exemple 1 à 3 » ;
   - en TikTok, l'exemple fait 8 mesures ; en Clip, les prises verticales sont cadrées « Remplir, centré sur le visage » ;
   - si l'exemple ne se télécharge pas, c'est l'ancien exemple dessiné. La page claude.ai (sans dossier `/demo/`) garde aussi
     l'exemple dessiné.
   - **Paroles de l'exemple : je n'en ai pas mis.** On ne connaît qu'une ligne (`docs/marketing/DEMO.md`), et les anciennes
     paroles inventées ne collaient pas à ses lèvres. **À demander au propriétaire** : les 8 mesures de paroles de « neva die ».
5. **N° 4, cadrage des prises verticales** dans un clip 16:9 : « Cadrage : Entière + flou | Remplir | Zoom ».
   - « Entière + flou » : comme avant.
   - « Remplir » : l'image remplit l'écran, le visage un peu au-dessus du milieu.
   - « Zoom » : entre les deux, 1,6 fois plus grand, un peu de flou sur les côtés.
   - **Le visage** : le détecteur de visage du navigateur n'existe presque nulle part, et la couleur de peau seule se trompait
     (un plafond en bois ou un pull rouge ont la même couleur). La hauteur du visage est donc cherchée dans ce qui bouge :
     le rappeur bouge, la pièce non. C'est mesuré pendant l'analyse des prises déjà faite en fond, et lissé sur 3 s : le
     cadre glisse, il ne saute pas. Vérifié sur les 3 prises de l'exemple : le visage est trouvé entre 30 et 33 % de la
     hauteur, il est cadré correctement.
   - Le cadrage n'apparaît qu'en 16:9 avec au moins une prise verticale. Il est visible et essayable en aperçu par tous,
     avec « PRO » sur Remplir et Zoom en Gratuit. L'export d'un clip étant déjà Pro, il n'y a rien de plus à bloquer.
6. **Mesure** (anonyme) :
   - `export_start` et `export_ok` portent la sorte de vidéo (clip / reel) ;
   - nouvel événement `clip_ask` : le choix à la question du Clip sans Pro (Passer à Pro / Exporter en TikTok / Annuler) ;
   - dans le tableau de bord, onglet Entonnoir, deux cartes : « Clips 16:9 et vidéos TikTok » (lancés, réussis) et
     « Clip exporté sans Pro : le choix ».
7. **Avant le n° 1, tout de suite** : `exportOne` respecte maintenant `mp.ok`. Une vidéo trop longue pour la mémoire de
   l'appareil n'est plus lancée, même au débit le plus bas. Le message le dit, avec la durée la plus longue possible (chiffres d'exemple) : « Cette
   vidéo de 214 s est trop longue pour la mémoire de cet appareil : la page risquerait de se fermer en route. Choisis un passage
   de 120 s au plus (étape 1), ou exporte-la sur un ordinateur. » C'est compté `export_refused` (mémoire), comme les packs.
8. Petit défaut corrigé au passage : un bouton choisi (Remplir, Clip…) devenait pâle, blanc sur bleu glace, sous le doigt ou
   la souris. Il garde maintenant sa couleur.

## Fichiers
- App : `src/app.js`, `src/markup.html` (lignes Vidéo et Cadrage de l'étape 4), `src/theme.css`.
- Serveur et tableau de bord, **pour Comptes** :
  - `functions/_lib/metrics.js` : `clip_ask` et la sorte de vidéo avec `export_start` / `export_ok` ;
  - `functions/_lib/admin.js` (`clipAsk`) et `functions/_lib/admin-page.js` (les deux cartes) ;
  - les chiffres inventés de la démo, `tests/fixtures/dashboard-seed.mjs` et `admin-demo-data.js`.
  - Pas de migration.
- Tests :
  - nouveau `tests/ui/clip1_ui.py` (iPhone 390 px et ordinateur 1280 px, FR et EN, plus la page claude.ai) ;
  - nouveau test serveur dans `tests/backend/run.mjs`.

Après la planche contact sur un vrai clip exporté :
- « Remplir » ne montre qu'un tiers de la hauteur d'une prise verticale. Sur l'exemple, à 0:05, il ne gardait que le bonnet
  quand il se penche vers la caméra.
- L'exemple démarre donc en **« Zoom »**, où la tête reste entière sur toutes les images. La personne peut toujours choisir
  « Remplir ».
- Le visage est suivi sur 2 s au lieu de 3.
- Le montage de l'exemple ne se refait plus tout seul quand l'analyse des prises finit : il ne change pas sous les yeux de
  celui qui le regarde, et n'est pas enregistré une 2ᵉ fois en ligne.

Tests d'autres domaines adaptés au vrai exemple, sans changer ce qu'ils vérifient :
- `fin_export_ui.py` donne une ligne de paroles (l'exemple n'en a pas encore) ;
- `animations_ui.py` attend la fin de l'analyse des prises avant de mesurer la fluidité, comme il attendait déjà la fin de
  l'étape d'avant. Avec les visages dessinés, il n'y avait rien à analyser.

## Résultats des tests (7/11 au soir)
- **Série complète** sur la branche, par deux en même temps :
  - son_passage 86/86, audit_ui 158/158, projet_local_ui 48/48, export_pub_ui 22/22, filtres_ui 106/106 ;
  - paroles_suppr 44/44, remux_frag 10/10, liens_cmp_ui 58/58, pied_de_page_ui 402/402, partager_ui 74/74 ;
  - fluidite_ui 30/30, plans_ui 35/35, help_ui 42/42 ;
  - clip1_ui 73/73, exports_rates_ui 76/76, audit611_ui 91/91, serveur 103/103.
- **Relancés seuls** après les corrections ci-dessus : fin_export_ui 86/86, animations_ui 44/44, formules_ui 137/137
  (le « filigrane dans chaque image » de la série échoue seulement quand la machine est chargée), clip1_ui 73/73,
  gallery_ui 49/49.
- `support_ui` et `lyrics_ui` échouent comme sur `main`, pour des causes sans lien avec cette branche : l'envoi d'e-mail de
  test (« Pas envoyés : access ») et le compte Pro de test du serveur.

## Fusion avec `main` (8/11, demandée par le Chef de projet)
J'ai fusionné `origin/main` (1f19a29, qui contient `compte/donnees-7-11`) dans la branche, en gardant les deux côtés :
- `metrics.js` : les événements des deux, d'un côté `export_retry`, `export_saved`, `export_refused` et `clip_ask`, de
  l'autre `checkout_close` et `checkout_done`, la provenance `src` et l'étape `stage` ;
- `admin.js` : les détails des exports et du Clip, plus `bySource`, `visitCountries`, `checkoutClose` et `optins` ;
- `admin-page.js` : les cartes des exports ratés et du Clip, plus le tableau par source, les pays, la fenêtre de paiement et
  les e-mails ;
- `src/account.js` : il envoie `src` et `stage` (Comptes) et les détails `x` (App) ;
- `audit_ui.py` : les champs anonymes permis sont `src`, `stage` et `x` ;
- `admin-demo-data.js` est refait par `node tools/admin_demo_data.mjs`.
Le site est reconstruit. Le tableau de bord de démo affiche toutes les cartes, sans erreur.
Tests après la fusion, lancés un par un : serveur **105/105**, `audit_ui` **158/158**, `clip1_ui` **73/73**,
`exports_rates_ui` **76/76**.

## Planche contact
Faite avant la précision de la règle 10 (7/11, 18 h : plus de planche pour les exports de test). Elle a quand même trouvé le
problème de « Remplir » décrit plus haut. Clip 16:9 de l'exemple, Pro, 12 s, 25 images : la tête reste entière en
« Zoom », sauf à 0:05.0 où il sort lui-même du bord de sa prise d'origine. La fin en fondu au noir est l'effet « noir », voulu.
