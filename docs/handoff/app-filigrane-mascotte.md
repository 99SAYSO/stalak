Statut : PRÊT
Branche : app/filigrane-mascotte (créée depuis `main` du 6/11 : d3d7564, avec la maquette du Chef de projet). **Contient aussi `app/partager`** (fusionnée le 6/11 : l'écran de fin demandé a « Partager » sur téléphone) : intégrer cette branche suffit, `app/partager` n'est plus à fusionner à part.
Maquette : https://app-filigrane-mascotte.stalak-site.pages.dev (à faire valider par le propriétaire, règle 9).
Vidéo d'exemple : `docs/design/filigrane-mascotte-exemple.mp4` (export réel image par image de l'exemple de l'app, en Gratuit, filigrane à 14 %, 9:16, 20 s ; son converti en AAC après coup, le navigateur de test n'ayant pas d'encodeur AAC).

Résumé :
1. **Plus de pub** (décision du propriétaire du 6/11, 14 h) :
   - Retirés de l'app :
     - le bouton « Regarder une pub (30 s) » ;
     - la pub récompensée Google (chargement du script, `AD_UNIT`, la récompense « une vidéo sans filigrane ») ;
     - le message de consentement pub (`CMP_ON`, Funding Choices) ;
     - la fenêtre « Your Privacy Choices » (« Ne pas vendre ni partager », Global Privacy Control), qui ne servait qu'à la pub ;
     - leurs textes FR et EN et leurs styles (bouton bleu givré).
   - En Gratuit :
     - un seul bouton « Exporter » (sous-titre « avec filigrane ») ;
     - juste dessous, le lien **« Sans filigrane → Pro »** / « No watermark → Pro », qui ouvre l'écran des formules sur Pro.
   - Pro et Creator Plus : « Exporter », sans filigrane, sans note.
   - **Plus aucun script Google** n'est chargé par l'app (vérifié par les tests, même après une vidéo).
   - **Textes de l'app** qui disaient « ni pub ni filigrane » : maintenant « sans filigrane ». C'est le cas :
     - de l'écran des formules (bandeau, liste, tableau : la ligne Gratuit dit « Avec filigrane ») ;
     - de la fenêtre Pro après la 1ʳᵉ vidéo ;
     - de la page Pro ;
     - des messages des cadenas.
   - **Pied de page** : « Gérer les cookies » et « Your Privacy Choices » restent. Ce sont maintenant de simples liens vers la page Confidentialité.
2. **Nouveau filigrane** (maquette « C · Plus petit », `docs/design/filigrane-mascotte-maquette.jpg`) :
   - Il montre **le visage de la mascotte en blanc « pochoir »** : la forme blanche, avec les traits du dessin en creux (transparents).
     - Il est fait à partir de `site_src/emoji/focus.webp`, identique à `public/emoji/focus.webp`.
     - Nettoyé pour rester net en petit : les dreadlocks forment une seule masse et leurs perles blanches sont retirées ; les poussières et traits trop fins sont enlevés ; les traits du visage sont un peu élargis ; le buste de la parka (avec la moitié d'une lettre) est coupé.
     - Le contour est redessiné en courbes (potrace) : c'est un vrai fichier vectoriel, net à toutes les tailles : `site_src/icons/watermark.svg`.
   - **Dessous, « stalak.app »** en petit, blanc, en Rubik gras (700).
     - Le texte est transformé en tracés, donc il n'y a pas de police à charger : l'aperçu et l'export sont identiques sur tous les navigateurs.
     - Une **légère ombre** encre le rend lisible sur les fonds clairs (vérifié sur blanc, bleu pâle et beige).
   - **Taille : 14 % de la largeur de la vidéo** (demande du 6/11 après-midi, au lieu de 17 % ; de sa hauteur pour un clip 16:9). « stalak.app » est un peu plus large que le visage (1,12 fois) pour rester lisible en gras sur téléphone. Opacité 85 %.
   - **Comportement** :
     - il change de place toutes les 5 s, d'un coup, sans glisser ;
     - ses 4 places sont **les 4 coins de la partie visible sur TikTok et Instagram**, dans l'ordre haut droite, bas gauche, bas droite, haut gauche ;
     - il évite le haut (8 %), le bas (20 %) et le bord droit (12 %), comme les zones rouges de `tools/contact_sheet.py`.
     - Changement par rapport à l'ancien : l'ancien filigrane avait 2 places dans ces zones (en haut à droite contre le bord, en bas contre le bord). Sa 4ᵉ place, à gauche au tiers de la hauteur, touchait les paroles : la planche contact l'a montré, elle est remplacée par le coin en haut à gauche.
   - **Partout** :
     - l'aperçu, l'export simple et les packs utilisent tous le même dessin (`wmDraw`, avec la décision `S.wm = wmOn()` à l'export) ;
     - comme les packs sont réservés à Creator Plus (sans filigrane), le filigrane n'y apparaît que sur la version claude.ai, où tout est ouvert avec filigrane.
   - **Refaire le dessin** : `python3 tools/watermark_mascot.py` réécrit le SVG et le met dans `src/app.js` (entre `/*@WMSVG*/` et `/*WMSVG@*/`). Il faut `pip install opencv-python-headless potracer`.
3. **Guide d'aide** (`functions/_lib/help-guide.js`, FR et EN) : il décrit maintenant le nouveau filigrane, dit qu'il n'y a pas de pub, et que « sans filigrane » veut dire Pro ou Creator Plus. Avant, il parlait du logo, de « Clipped with stalak.app » et de la pub de 30 s.
4. **Animation (skill `motion-design`)** : aucune nouvelle. Le filigrane saute d'un coin à l'autre sans animation, comme avant (décision du 30/10). L'écran de fin et la question des paroles apparaissent sans animation, comme un changement d'étape.

Ajouts du 6/11 après-midi (même branche) :
5. **Bug : compte à rebours sans minuteur.** Pendant la mesure qui précède le passage, l'app affichait un décompte des temps (4, 3, 2, 1) même sans minuteur. Il ne s'affiche plus que si un minuteur (3 ou 5 s) est choisi. Sans minuteur, aucun chiffre à l'écran.
6. **Bug : numéro de prise après suppression.** Le bouton « Lancer la prise N », le message « Prise N enregistrée » et « N prises filmées » suivent maintenant les prises qui restent. Une prise filmée puis retirée redonne « Lancer la prise 1 ». À l'ouverture de la caméra, le numéro tient compte des prises déjà importées.
7. **Fluidité des vidéos exportées** (mesurée image par image, nouveau test `tests/ui/fluidite_ui.py`) :
   - **Méthode** : des prises de test portent leur numéro d'image en carrés noir et blanc. Dans chaque vidéo exportée, je relis ce numéro image par image : une image en double ou sautée se voit. Je vérifie aussi l'horodatage de chaque image. Le tout sur iPhone (émulé : façon de faire de Safari, dessin WebGL, décodage d'un trait) et sur ordinateur, en export simple (Gratuit, avec filigrane) et en pack de 5 (Creator Plus).
   - **Horodatages** : déjà parfaits (chaque image exactement 1/30 s après la précédente).
   - **Cause trouvée** : pour chaque image de la vidéo, l'export prenait dans la prise l'image la plus proche dans le temps.
     - Quand le calage de la prise (fixé par la synchro du son) tombe près du milieu entre deux images, la moindre irrégularité d'horodatage fait basculer ce choix d'une image à l'autre : une image montrée deux fois, la suivante sautée.
     - Ces irrégularités viennent d'un iPhone, d'un enregistreur ou d'une prise à 29,97 i/s.
     - **Mesuré sur la version en ligne** : 54 images en double et 54 sautées sur 200, soit plus d'une sur quatre, sur une prise à ± 4 ms. C'est l'impression de « petit ralenti par moments », qui dépend du calage de chaque prise.
   - **Correction** (`FrameSource.frameAt`, `src/app.js`) :
     - pour une prise à environ 30 i/s, chaque image de la vidéo prend l'image suivante de la prise, comme une caméra, tant qu'elle reste à moins d'une image du bon moment (la synchro des lèvres est gardée) ;
     - au-delà, c'est l'heure qui décide ;
     - deux images au même horodatage, ce qui arrive avec certains enregistreurs, sont prises l'une après l'autre.
   - **Mesuré après** : 0 image en double, 0 sautée, sur toutes les vidéos (iPhone et ordinateur, simple et pack). Le test se place dans le cas le plus dur : chaque prise est calée à mi-chemin entre deux images.
   - **À savoir** : les navigateurs sans encodeur audio AAC (Firefox, Chrome sous Linux) utilisent encore l'ancienne méthode « en temps réel », qui filme l'aperçu et ne peut pas être parfaitement régulière. Ce n'est pas le cas de Safari sur iPhone récent ni de Chrome sur Mac et Windows. Le chemin image par image sait déjà écrire du son Opus : on pourrait l'utiliser pour ces navigateurs, mais il faudrait d'abord vérifier que TikTok et Instagram acceptent l'Opus dans un MP4. Je ne l'ai pas fait.
8. **Question des paroles.**
   - Quand les prises sont prêtes, « Continuer » demande « Tu veux ajouter les paroles à la vidéo ? » / « Add the lyrics to your video? », avec Oui / Non, de même taille.
   - Non : directement au montage. Oui : l'onglet Paroles. Échap ou un toucher à côté : la question se ferme, rien ne change.
   - Des paroles déjà là (projet repris) : pas de question, l'onglet Paroles comme avant.
9. **Filigrane à 14 %** (voir le point 2).
10. **Écran de fin d'export simplifié.**
    - Une fois l'export fini, la page ne montre plus que la vidéo et l'essentiel, dans une seule carte : « Ta vidéo est prête ✓ ».
    - Dans l'ordre :
      - le gros bouton **« Enregistrer la vidéo »** ;
      - **« Partager »** sur téléphone ;
      - **« Copier la légende »** ;
      - en Gratuit, le lien **« Sans filigrane → Pro »** ;
      - le petit lien discret **« Modifier la vidéo »**, qui ramène au montage avec la vidéo gardée dans la carte Exporter.
    - Le montage, les onglets du haut, l'aperçu, le bouton flottant « Exporter », les liens vers les sites des réseaux et la bulle d'aide sont masqués.
    - Sur téléphone (390 px), les trois boutons tiennent dans l'écran sans défiler. L'explication du partage et le texte de la légende, que l'on peut modifier, sont dessous.
    - Pour un pack : « Ton pack est prêt ✓ » et « Enregistrer le pack (.zip) », sans légende ni partage.
    - **Changement par rapport à `app/partager`** : sur téléphone, « Enregistrer la vidéo » redevient le premier et le plus gros bouton, et « Partager » vient juste dessous, comme demandé. L'ancien petit lien « Télécharger le fichier » disparaît. Si le téléphone refuse le partage, l'explication s'affiche sous « Enregistrer la vidéo ».
11. **Guide d'aide** : décrit aussi la question des paroles, l'écran de fin, le partage et le filigrane à 14 %. Les packs démarrent à partir de 2 playbacks : le guide disait 3, contrairement à la décision du 30/10.

Planche contact (règle 10, skill `planche-contact`), sur la vidéo d'exemple (export réel, 20 s) :
- 6/11 après-midi, filigrane à 14 %, export image par image : 41 images vérifiées. Le filigrane reste hors des zones rouges, ne touche jamais les paroles, est lisible et change de coin toutes les 5 s ; le chronomètre de la prise avance bien de 0,5 s d'une image à l'autre. **0 problème.**
- Avant, à 17 % :
  - 1ʳᵉ version, 38 images vérifiées. **1 problème trouvé** : de 0:14.5 à 0:18.5, à la 4ᵉ place (à gauche, au tiers de la hauteur), le « stalak.app » du filigrane touchait la ligne de paroles « We cut on the beat, that's the way we write ». Corrigé : cette place devient le coin en haut à gauche.
  - 2ᵉ version, 35 images vérifiées : aucun chevauchement, le filigrane est toujours hors des zones rouges et lisible. **0 problème restant.**

Fichiers touchés :
- `src/app.js` :
  - le bloc du filigrane : `WM_SVG`, `wmDraw` avec ombre et image prête à la bonne taille, `wmPos` sur les 4 coins sûrs, `wmUI` à la place de `adUI` ;
  - le retrait de tout le code de pub et de consentement ;
  - les textes FR et EN.
- `src/markup.html` : la zone d'export, la fenêtre « Your Privacy Choices » retirée, les textes de l'écran des formules et de la fenêtre Pro.
- `src/theme.css` : les styles du bouton pub et de la fenêtre de confidentialité retirés.
- Nouveaux fichiers : `tools/watermark_mascot.py`, `site_src/icons/watermark.svg`, `docs/design/filigrane-mascotte-exemple.mp4`.
- `functions/_lib/help-guide.js` : les textes du guide.
- Tests : `formules_ui.py` (nouveau filigrane, plus de pub), `liens_cmp_ui.py` (plus de consentement pub, aucun script Google), `audit_ui.py`, `export_pub_ui.py`, `pied_de_page_ui.py` (« Your Privacy Choices » mène à la Confidentialité).
- Pas de migration.

Pour les autres conversations :
- **Marketing et Juridique** : les pages du site parlent encore de la pub et du « logo » en filigrane. Ce sont `pricing.html` / `fr/tarifs.html`, `llms.txt`, les 6 guides (« no ads, no watermark »), `terms` / `conditions`, `privacy` / `confidentialite`, `legal-notice` / `mentions-legales` et `refunds` / `remboursement`. Je n'y ai pas touché : STATUS les leur confie. Le nouveau filigrane, c'est la mascotte et « stalak.app ».
- **Juridique** : « Your Privacy Choices » et « Gérer les cookies » restent en bas de page, comme simples liens vers la Confidentialité. À vous de dire s'ils doivent rester maintenant qu'il n'y a plus de pub.
- **Comptes** : l'app n'envoie plus `ad_offer`, `ad_shown` ni `ad_ok`. Le serveur les accepte encore (`tests/backend/run.mjs`) et le commentaire de `acctEvent` dans `app.js` (bloc compte) les cite toujours. Les étapes pub de l'entonnoir du tableau de bord sont à retirer de votre côté.
- **Chef de projet** : `STALAK_CONTEXTE.md` (offre, filigrane « logo seul », pub récompensée) est à mettre à jour.

Tests (6/11 au soir, iPhone de 390 px et ordinateur de 1280 px, FR et EN) :
- **Nouveau `fluidite_ui.py`** : 30/30, sur 12 vidéos (iPhone et ordinateur ; export simple et pack de 5). Chaque vidéo a 600 images, toutes exactement à 1/30 s d'écart. Au total, 7 046 passages d'une image à la suivante vérifiés dans les plans : **0 image en double, 0 sautée**. Avant la correction, sur la version en ligne : 54 doubles et 54 sautées sur 200 dans le cas le plus dur.
- **Nouveau `fin_export_ui.py`** : 86/86. Il vérifie :
  - sans minuteur, aucun chiffre ; avec le minuteur, 3, 2, 1 (caméra simulée) ;
  - « Lancer la prise 1 », puis 2, puis de nouveau 1 après suppression ;
  - la question des paroles : Oui, Non, Échap, et pas de question quand il y a déjà des paroles ;
  - l'écran de fin : seulement l'essentiel, dans l'ordre, les boutons dans l'écran sur téléphone ;
  - « Modifier la vidéo » ; la fin d'un pack ;
  - pas de défilement de côté, aucune erreur.
- Tests adaptés :
  - `partager_ui.py` 74/74 (« Enregistrer la vidéo » d'abord, « Partager » dessous) ;
  - `formules_ui.py` 137/137 (filigrane à 14 %) ;
  - `audit_ui.py` 158/158 ;
  - `liens_cmp_ui.py` 58/58 ;
  - `pied_de_page_ui.py` 402/402 (dont la version claude.ai) ;
  - `plans_ui.py` 35/35 ;
  - `export_pub_ui.py` 22/22.
- Autres suites :
  - `son_passage.py` 86/86, `projet_local_ui.py` 48/48, `filtres_ui.py` 106/106, `animations_ui.py` 44/44 ;
  - `remux_frag.py` 10/10, `paroles_suppr.py` 44/44, `gallery_ui.py` 49/49, `help_ui.py` 42/42 ;
  - `tests/backend/run.mjs` 96/96.
- `support_ui.py` et `lyrics_ui.py` s'arrêtent comme sur `main`, y compris l'échec « M'envoyer l'e-mail de remerciement » du tableau de bord (Comptes), vérifié identique sur `main` du 6/11.

À tester par le propriétaire sur la maquette :
1. Importer un son et des prises (ou en filmer une sans minuteur : aucun chiffre ne doit s'afficher). Supprimer une prise filmée : le bouton revient à « Lancer la prise 1 ».
2. « Continuer » : la question « Tu veux ajouter les paroles à la vidéo ? » ; essayer Oui puis Non.
3. Exporter, sans être Pro : l'écran de fin ne montre que « Enregistrer la vidéo », « Partager » (téléphone), « Copier la légende », « Sans filigrane → Pro » et « Modifier la vidéo ».
4. Regarder la vidéo : le visage de la mascotte avec « stalak.app » (14 %) change de coin toutes les 5 s, et le mouvement est fluide d'un bout à l'autre, surtout sur une prise filmée à l'iPhone.
5. Ou regarder directement `docs/design/filigrane-mascotte-exemple.mp4` (envoyée aussi dans la conversation).
