Statut : EN COURS (ajouts du 6/11 en cours)
Branche : app/filigrane-mascotte (créée depuis `main` du 6/11 : d3d7564, avec la maquette du Chef de projet).
Maquette : https://app-filigrane-mascotte.stalak-site.pages.dev (à faire valider par le propriétaire, règle 9).
Vidéo d'exemple : `docs/design/filigrane-mascotte-exemple.mp4` (export réel de l'exemple de l'app, en Gratuit, 9:16, 20 s).

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
   - **Taille : 17 % de la largeur de la vidéo** (de sa hauteur pour un clip 16:9). Opacité 85 %.
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
4. **Animation (skill `motion-design`)** : aucune nouvelle. Le filigrane saute d'un coin à l'autre sans animation, comme avant (décision du 30/10).

Planche contact (règle 10, skill `planche-contact`), sur la vidéo d'exemple (export réel, 20 s) :
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

Tests (6/11, iPhone et ordinateur, FR et EN) :
- `formules_ui.py` 137/137 (adapté). Il vérifie :
  - un seul « Exporter » et « Sans filigrane → Pro » juste à côté ;
  - le filigrane à ~17 % de la largeur, plus haut que large (mascotte + texte) ;
  - les sauts toutes les 5 s, dans les 4 coins, tous hors des zones TikTok / Instagram ;
  - l'aperçu identique à l'export 2D et WebGL ;
  - un vrai export avec le filigrane dans chaque image ;
  - aucun script de pub Google chargé.
- `liens_cmp_ui.py` 58/58 (adapté : plus de consentement pub, aucun script Google même après une vidéo, « Your Privacy Choices » mène à la Confidentialité).
- `pied_de_page_ui.py` 402/402, `audit_ui.py` 158/158, `plans_ui.py` 35/35 (texte « Sans filigrane »), `export_pub_ui.py` 22/22.
- `son_passage.py` 86/86, `projet_local_ui.py` 48/48, `filtres_ui.py` 106/106, `animations_ui.py` 44/44, `remux_frag.py` 10/10, `paroles_suppr.py` 44/44.
- `gallery_ui.py` 49/49, `help_ui.py` 42/42, `tests/backend/run.mjs` 96/96.
- `support_ui.py` et `lyrics_ui.py` s'arrêtent comme sur `main`. `support_ui.py` a aussi un échec sur « M'envoyer l'e-mail de remerciement » (tableau de bord, Comptes) : vérifié identique sur `main` du 6/11, sans lien avec cette branche.
- `partager_ui.py` n'est pas sur cette branche : `app/partager` n'est pas encore fusionnée. Les deux branches touchent `postShow` / la zone d'export à des endroits différents ; à fusionner l'une après l'autre.

À tester par le propriétaire sur la maquette :
1. Faire une vidéo (l'exemple suffit), sans être Pro. Il n'y a qu'un bouton « Exporter », avec le lien « Sans filigrane → Pro » juste dessous, qui ouvre les formules.
2. Exporter et regarder la vidéo : le visage de la mascotte avec « stalak.app » change de coin toutes les 5 s.
3. Ou regarder directement `docs/design/filigrane-mascotte-exemple.mp4` (envoyée aussi dans la conversation).
