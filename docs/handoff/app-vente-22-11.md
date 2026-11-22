Statut : EN COURS (tests en cours)
Branche : app/vente-22-11 (créée depuis `app/fin-et-minuteur` le 22/11, puis `origin/main` ae45268 fusionnée : fin-et-minuteur et le
bouton TikTok déjà en ligne).
Maquette de la branche : https://app-vente-22-11.stalak-site.pages.dev (à faire valider par le propriétaire, règle 9).
Maquette dessinée avant de coder (validée le 22/11, 22 h 18) : artifact « Maquette app Stalak 22/11 ».

Demande : message du Chef de projet du 22/11 (22 h 05), d'après `docs/audit/2026-11-22-audit-visuel-mobile.md` et
`docs/audit/2026-11-22-audit-ameliorations-vente.md`. Les points 1 (minuteur) et 2 (« Enregistrer la vidéo » = partage) étaient
déjà faits dans `app/fin-et-minuteur`, maintenant en ligne. Puis le message de 22 h 50 : « Enregistrer la vidéo » sous le bas
de l'écran de fin.

Choix du propriétaire sur la maquette (22/11, 22 h 18) :
1. « Enregistrer la vidéo » (avec le logo) reste le 1er bouton, « Exporter sans le logo » juste dessous ;
2. « Choisir mon son » ouvre directement le choix du fichier ;
3. le bouton plein sur Creator Plus.

## 3. Premier écran et bouton « Exporter » (audit mobile n° 1 et 3)
- **Deux boutons dans la présentation** : « Choisir mon son » (gros, ouvre le choix du fichier du son) et « Voir un exemple »
  (lance l'exemple, comme « Essayer avec un exemple »). EN : « Choose my song », « See an example ».
  - Mesuré sur iPhone 12 (664 px visibles) : boutons entre 331 et 447 px. Sur iPhone SE (568 px) : entre 374 et 490 px.
    Avant, le cadre « Choisis ton son » commençait à 667 px et l'exemple à 905 px.
  - L'en-tête et les étapes n'ont pas eu besoin d'être réduits, contrairement à la maquette.
  - Sur ordinateur, ces boutons ne s'affichent pas : la carte du son et « Essayer avec un exemple » sont déjà dans le premier
    écran.
- **« Exporter » devient une barre pleine largeur collée en bas** (étape Montage) :
  - à gauche du bouton, ce qui sera exporté (« 9:16 · 0:24 », « 3 prises ») ;
  - le glaçon d'aide passe au-dessus de la barre ;
  - en bas de page, aucun lien du pied de page n'est sous la barre ;
  - comme avant, la barre disparaît quand la carte Exporter est à l'écran.

## 4. Ce que fait Stalak, et l'offre Pro à la fin (audit vente n° 4)
- **« Stalak monte ta vidéo »** : une carte avec les vraies étapes, cochées au fur et à mesure.
  - Les étapes : écoute du son (temps forts), calage de chaque prise (« 1 sur 2 »), analyse de l'image (« 60 % »), coupes.
  - Où : à l'étape Prises sous la liste, et en haut de l'étape Montage.
  - Elle reste 2 s toutes cases cochées, puis s'en va.
  - La ligne « Je regarde tes prises » n'apparaît que là où cette analyse tourne vraiment : elle ne tourne pas quand le
    navigateur ne décode pas lui-même les vidéos, comme sur iPhone.
- **Écran d'export** : les phrases d'igloo sont remplacées par les 4 vraies étapes, cochées au fur et à mesure. L'igloo et le
  pourcentage restent.
  - Les étapes : prises préparées, images fabriquées, image et son assemblés, fichier MP4 fini.
  - Les messages « J'arrête… » (annulation) et « Igloo terminé ! » (fin) restent.
- **Fin d'un export gratuit avec le logo** :
  - le montage de la personne avec et sans le logo, côte à côte : « Avec le logo · Gratuit » et « Sans le logo PRO » ;
  - puis « Enregistrer la vidéo » (la sortie gratuite, toujours en premier) ;
  - puis « Exporter sans le logo PRO », qui ouvre les formules sur Pro, avec « Pro dès 4,17 $/mois en annuel · annulable à tout
    moment » (prix lu dans la configuration, pas écrit en dur).
  - **Écart avec la maquette** : les deux images sont **le même instant du montage**, dessiné par l'aperçu une fois avec le logo
    et une fois sans. À gauche, c'est la vraie vidéo exportée, qui se lit avec cette image en couverture. Les deux ne jouent donc
    pas en même temps.
  - Rien de Pro n'est présenté comme gratuit. Le logo de fin (3 s) n'est pas dans l'image.
  - Pas pour l'exemple, un pack, un abonné, ni sur claude.ai.
  - Le petit lien « Sans filigrane → Pro » est remplacé par ce bouton quand la comparaison s'affiche.

## 5. Écran des formules dans l'app (décision du 22/11 ; code de Comptes)
- Ordre Creator Plus, Pro, Gratuit : en colonne sur téléphone, de gauche à droite sur ordinateur.
- **Bouton plein (noir) sur Creator Plus**, qui est aussi mis en avant (cadre et reflet). Pro garde son étiquette « Sans
  filigrane ».
- En annuel :
  - **le prix mensuel barré à côté** (14,99 $ à côté de 8,33 $ ; 7,99 $ à côté de 4,17 $) ;
  - **« 5 mois offerts »** sur les cartes et sur le bouton Annuel, à la place de « Économise 47 % » et « jusqu'à −47 % ».
  - Le calcul : 12 − annuel ÷ mensuel, arrondi vers le bas, à partir des vrais prix (Pro 5,7 → 5 ; Creator Plus 5,3 → 5). Si
    les deux formules donnaient un nombre différent : « jusqu'à N mois offerts ».
  - En mensuel : ni prix barré, ni mois offerts.
- **« Ce que ça change pour toi »** (2 ou 3 lignes de résultats) avant les listes de fonctions, désormais repliées sous « Tout
  ce qui est inclus ».
- **Inchangé** : la taille du « 4,17 $ » (52 px) et celle du montant annuel.

## Correction du 22/11, 22 h 50 : « Enregistrer la vidéo » sous le bas de l'écran de fin
- **Cause** : la case « Reçois des conseils… par e-mail » (Comptes) était en haut de l'écran de fin.
- **Correction** :
  - la case est maintenant sous la légende (ordre d'affichage seulement, rien d'autre ne change pour Comptes) ;
  - sur téléphone, les deux images avec / sans logo sont un peu plus petites, et leur phrase d'explication est masquée.
- **Mesuré**, avec l'offre Pro et un bouton « Publier sur TikTok » :

  | Écran | « Enregistrer la vidéo » | « Publier sur TikTok » |
  |---|---|---|
  | iPhone 12 (664 px) | 464 → 526 px | 589 → 647 px |
  | iPhone SE (568 px) | 441 → 503 px | sous l'écran |
  | Ordinateur (860 px) | 648 → 710 px | sous l'écran |

  Le bouton principal est donc visible en entier, sans défiler, dans les trois cas.
- `fin_export_ui` et `partager_ui` passent : 98/98 et 92/92.

## Fichiers
- `src/app.js`, `src/markup.html`, `src/theme.css`.
- **Pour Marketing** : `src/markup.html`, deux boutons ajoutés dans la présentation de l'accueil (`.hero`). Ni ses textes ni
  `build_site.py` ne changent.
- **Pour Comptes** :
  - l'écran des formules (`#apPro`, `plRender`) : ordre, bouton plein, prix barré, mois offerts, résultats, listes repliées ;
  - la case e-mail est déplacée sous la légende sur l'écran de fin (CSS seulement) ;
  - clé `pl.int.save` supprimée, nouvelles clés `pl.months`, `pl.monthsUpTo`, `pl.res.*`, `pl.all`.
- Tests :
  - nouveau `tests/ui/vente_ui.py` (premier écran, barre, étapes du montage et de l'export, écran de fin) ;
  - mis à jour : `plans_ui.py` (ordre, bouton plein, prix barré, mois offerts, résultats avant les listes, taille du prix),
    `fin_export_ui.py` (avec / sans logo, même image sauf le logo, ordre des boutons, bouton principal dans l'écran),
    `partager_ui.py`, `audit_ui.py` (glaçon au-dessus de la barre), `audit611_ui.py`.

## Résultats des tests (22/11 au soir, sur la branche à jour)
(écrits ci-dessous une fois la série finie)
