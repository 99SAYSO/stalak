Statut : PRÊT
Branche : app/refonte-mobile-lot3 (créée depuis `origin/main` 5c348be le 24/11).
Maquette de la branche : https://app-refonte-mobile-lot3.stalak-site.pages.dev/fr/ (sur un téléphone : « Voir un exemple »,
puis la flèche de retour en haut pour remonter les étapes).
Demande : `docs/handoff/chef-refonte-mobile-app.md` (démos n° 7 et 11, validées le 23/11), et le propriétaire le 24/11 à 16 h :
« commence le lot 3 et le reste, il faut finir le plus rapidement possible ».

## Ce qui est fait (téléphone, sur stalak.app)
Tout est dans un fichier à part, `src/mobile3.js` (servi `/assets/mobile3.<hash>.js`, chargé seulement sur un téléphone et
seulement sur stalak.app, comme celui du lot 2). `index.html` : 395,3 Ko (limite 400). Sur ordinateur et dans la version
claude.ai, rien ne change.
- **En haut** : retour (étape d'avant ; à l'étape 1, la question « quitter le projet ? » habituelle), 4 traits d'étapes,
  le glaçon d'aide (ouvre l'aide habituelle). L'en-tête du site (logo, étapes, compte) n'est plus affiché dans l'éditeur.
- **« Étape n sur 4 » et la question**, mot pour mot comme la démo : « Choisis ton passage », « Tes prises » (« Plus tu en
  as, plus le montage est varié. »), « Des paroles à l'écran ? ». L'étape Montage n'a pas de titre (comme la démo).
- **Un seul bouton bleu en bas** (« Continuer », puis « Exporter ma vidéo » avec format, durée et prises en petit dessous).
- **La bulle jaune de la mascotte, la première fois seulement** : étape 1 « Glisse les deux poignées pour garder ton
  meilleur passage. », étape 2 « Filme le même passage sous plusieurs angles. ».
- **1. Son** : TikTok / Clip ; la carte du son (nom, BPM, onde avec ses 2 poignées, « Écouter » et « Écouter le passage ») ;
  « Changer de son » en lien dessous.
- **2. Prises** : les prises en vignettes (image de la prise, n°, état du calage, étoiles de qualité, et leurs boutons
  ⇄ − + ×), la case « + » (importer), « Filmer une prise » au-dessus de « Continuer ».
- **La caméra** (démo n° 11) : son propre écran plein écran ; en haut l'avancée du son pendant la prise, « Prise n · temps »,
  fermer, caméra avant / arrière ; à droite le minuteur (sans / 3 s / 5 s) et le **flash** ; le gros bouton rouge (carré
  pendant la prise, ✕ pendant le compte à rebours) ; à gauche la pile des prises filmées ; « Terminer ». Pas de paroles qui
  défilent (refusé).
- **Le flash** (décision du 23/11, n° 6) : la torche du téléphone quand la caméra en a une (souvent la caméra arrière sur
  Android) ; sinon (caméra avant, iPhone) un cadre blanc lumineux autour de l'image, qui éclaire le visage. Retenu pour les
  prises suivantes. Ajouté aussi sur ordinateur (bouton « ⚡ Flash » à côté de « Caméra avant / arrière »).
- **3. Paroles** : 3 grands choix (Automatiques avec PRO si pas abonné, Je colle mon texte, Sans paroles), textes de la démo.
  Dessous, comme avant : coller, « Importer un .txt », caler automatiquement ou au tap, la langue chantée, la liste à
  corriger. Sur téléphone, la petite fenêtre « Tu veux ajouter les paroles ? » avant cette étape n'apparaît plus : l'étape
  pose déjà la question (« Sans paroles » puis « Continuer » = pareil que « Non »).
- **4. Montage** : l'aperçu avec un gros ▶, la bande des plans, et **6 outils** qui ouvrent une feuille :
  Coupes (Coupes, Rythme, Meilleure prise auto, Ambiance pour un ancien projet), Effets (Aucun / Sobre / Intense dans un
  clip ; en TikTok la feuille dit « Les effets se posent dans un clip 16:9 (mode Clip). »), Filtres, Paroles (tout le style
  du texte : position, police, couleur, contour, taille, apparition, surlignage, et « Modifier les paroles » qui ramène à
  l'étape 3), Remixer (= « Régénérer »), Format (TikTok / Clip, 9:16 / 4:5 / 1:1 / 16:9, Cadrage).
  Toucher un plan ou un effet ouvre ses actions (Changer de prise, Ajouter un plan, Garder ce plan, + Effet, Exclure ce
  passage ; Changer / Supprimer / Voir) dans une carte en bas, au-dessus du bouton. La carte « Exporter » (pack Creator Plus,
  « Sans filigrane → Pro », légende…) reste dessous, inchangée.

## Aucun réglage ne disparaît
Le test vérifie que les 63 réglages de l'éditeur sont toujours dans la page (liste dans `tests/ui/refonte_mobile3_ui.py`),
et qu'ils agissent encore depuis leur nouvelle place (format, rythme, paroles, remixer, minuteur, flash).
Ce qui ne rentrait pas dans la démo et où c'est allé :
- **Début / fin à la mesure près (‹ ›), Durée, « Les coupes ne tombent pas en rythme ? »** (TAP, bips) : dans un pli
  « Début, durée et rythme » sous la carte du son (la démo ne les montrait pas).
- **Format et Cadrage** : un 6ᵉ outil « Format » (la démo en avait 5). À 320 px (iPhone SE), la rangée défile.
- **Rythme et « Meilleure prise auto »** : dans l'outil Coupes.
- **Style du texte** : déplacé de l'étape 3 vers l'outil Paroles de l'étape 4 (comme proposé dans l'inventaire du lot 1).
- **« Écouter » (tout le son)** à côté de « Écouter le passage » (la démo n'a qu'un ▶).

## Tests
- Nouveau `tests/ui/refonte_mobile3_ui.py` : **91/91** (iPhone 12 FR, iPhone SE EN, ordinateur, et « sous test sans le
  drapeau »).
- Sous test automatique (`navigator.webdriver`), ce nouvel éditeur reste éteint sauf si le test le demande
  (`window.__stalakM3on`), comme l'ouverture et l'onboarding : les anciens tests gardent la page qu'ils connaissent.

## Pour les autres
- **Marketing** : `build_site.py` sert un fichier de plus (`mobile3`, `window.STALAK_M3`).
- **Comptes** : rien de `functions/` ni `account.js`.

## Fichiers
- `src/mobile3.js` (nouveau), `src/app.js` (flash ; `StalakM.ed` pour lire l'étape, les prises, la caméra ; chargement de
  `mobile3` ; « Continuer » de l'étape 2 sans la petite fenêtre sur téléphone ; l'état du téléphone suit aussi les étapes
  2 à 4), `src/markup.html` (bouton `#recFlash`), `build_site.py`, `tests/ui/refonte_mobile3_ui.py`.

## Série de non-régression (24/11, soir)
Tout passe sauf les échecs déjà présents sur `main` : `audit611_ui` 89/93 et `partager_ui` 88/92 (Comptes), `clip1_ui` 83/87 (`.band-frost a:hover`, Marketing), `formules_ui` 136/137, `lyrics_ui` 62/73. Le reste : `refonte_mobile3_ui` 91/91, `refonte_mobile4_ui` 69/69, `refonte_mobile2_ui` 142/142, `refonte_mobile_ui` 102/102, `essai_pro_ui` 193/193, `tiktok_ui` 224/224, `pied_de_page_ui` 842/842, `backend` 132/132, etc.
