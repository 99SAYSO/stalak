Statut : PRÊT
Branche : app/audit-6-11 (créée depuis `main` du 6/11 au soir, après « plus de pub »).
Maquette : https://app-audit-6-11.stalak-site.pages.dev (à faire valider par le propriétaire, règle 9).

**Suite du 6/11 au soir, après la mise en ligne de 21 h 45** (`main` 77b64ed fusionnée dans la branche ; le titre de l'accueil
de Marketing, choisi par le propriétaire, est gardé tel quel). Ce qui reste à intégrer est petit :
- **Défaut corrigé** (`src/app.js`, une ligne) : après « Enregistrer sans filigrane », la vidéo refaite sortait bien sans
  filigrane, mais le bouton restait affiché, parce que l'écran de fin se mettait à jour avant de noter que la nouvelle vidéo
  n'a pas de filigrane. Maintenant il disparaît et « Enregistrer la vidéo » redevient le bouton principal.
- **Tests adaptés** (l'exemple a maintenant son propre écran de fin, « Essaie avec ton son ») :
  - `fin_export_ui.py` et `partager_ui.py` testent la fin d'export avec sa propre vidéo ;
  - `formules_ui.py` remet exactement le passage après l'essai de « Clip » (sinon la vidéo exportée ensuite était plus courte) ;
  - `audit611_ui.py` attend la fin de l'écran d'export (1,6 s) et le rechargement après « Essaie avec ton son ».
- Résultats : voir la fin de ce compte rendu.

Ce qui suit est le compte rendu de la première partie, déjà en ligne.

Résumé (audit du 6/11, `docs/audit/2026-11-06-audit-complet.md`, points 4, 5, 6, 7, 10, 18 et 22) :

1. **n° 4 — « Enregistrer sans filigrane » après le paiement.** Si on passe à Pro alors que la vidéo de l'écran de fin a le
   filigrane, un grand bouton « Enregistrer sans filigrane » / « Save without watermark » apparaît en premier. Il refait la
   même vidéo sans filigrane, puis disparaît. Le bouton du dessous devient « Enregistrer celle-ci (avec filigrane) ».
   Après la fenêtre de remerciement Pro, le clavier va sur ce bouton.
2. **n° 5 — Fenêtre « Passer à Pro ».**
   - Elle ne s'ouvre jamais pour l'exemple.
   - Sur téléphone, elle vient seulement après le toucher sur « Enregistrer la vidéo » : elle ne cache plus ce bouton.
   - Sur ordinateur, rien ne change (1 s après la 1ʳᵉ vidéo).
3. **n° 6 — Vrai titre H1 sur l'accueil.**
   - Au-dessus du formulaire : « Free lip-sync video editor for rappers » / « Montage vidéo lip-sync gratuit pour rappeurs ».
   - Une ligne d'accroche dessous : « Drop your song and your takes. Stalak cuts them on the beat, lips in sync. » /
     « Importe ton son et tes prises : Stalak les coupe sur le rythme, les lèvres bien synchro. »
   - Le logo n'est plus un titre. Le H1 et l'accroche disparaissent une fois le son choisi.
   - La courte vidéo en boucle est prête dans le code, mais n'apparaît que si `site_src/demo/hero.mp4` existe (9:16, 5 à 8 s,
     sans son). Elle reste immobile si « Réduire les animations » est activé.
4. **n° 7 — Fin de l'exemple : « Now try it with your song » / « Essaie avec ton son ».**
   - Ce bouton remplace le lien Pro sur l'écran de fin de l'exemple.
   - Il ramène au choix du son : le carré d'import est mis en avant 6 s, avec le clavier dessus et le message « Choisis ton
     son : Stalak fait le reste. ».
5. **n° 10 — Vitesse.**
   - mp4box et mp4-muxer sont chargés en `defer`.
   - Le JS de l'app est dans deux fichiers versionnés, `/assets/app.<version>.js` et `/assets/account.<version>.js`.
     `index.html` passe de 1,17 Mo à 281 Ko. Le JS est le même en FR et en EN : il est chargé une seule fois.
   - Les polices sont en WOFF2, réduites aux lettres utilisées (latin avec accents, grec, cyrillique, ponctuation, symboles).
     Rubik passe de 173 à 65 Ko, TikTok Sans de 705 à 309 Ko.
     - Les noms des fichiers sont versionnés (`rubik.<version>.woff2`) et `fonts.css?v=`.
     - L'outil est `tools/fonts_woff2.py`, à relancer si une police change.
     - Les TTF restent, car les e-mails et le tableau de bord s'en servent.
   - Le vrai export a été vérifié après le `defer` : vidéo 1080×1920 de 20 s, sans erreur.
6. **n° 18 — « Clip » / « Music video » sans Pro.**
   - On voit l'aperçu 16:9 et on peut essayer, sans page de paiement. Un message dit que l'export en 16:9 est pour Pro.
   - À l'export, une question « Le mode Clip est réservé à Pro » propose trois choix : « Passer à Pro », « Exporter en
     TikTok / Reels » (la vidéo sort en 9:16) ou « Annuler ».
   - Même chose pour un pack. C'est le même principe que pour les filtres Pro.
7. **n° 22 — Clavier et pied de page.**
   - Après « Essayer avec un exemple », le clavier va sur « Lecture ».
   - Les liens du pied de page font 44 px de haut sur toutes les pages (`src/footer.css`).

Fichiers : `src/markup.html`, `src/app.js`, `src/theme.css`, `src/footer.css`, `build_site.py`, `site_src/_headers`,
`site_src/fonts/` (WOFF2 + `fonts.css`), `tools/fonts_woff2.py`.
Tests :
- nouveau test `tests/ui/audit611_ui.py` (tous les points ci-dessus, iPhone 390 px et ordinateur 1280 px, FR et EN) ;
- nouvel outil `tests/ui/_probe.py`, la sonde des tests, qui se pose maintenant dans `/assets/app.*.js`. Les 14 tests qui la
  posaient eux-mêmes l'utilisent, et `server.mjs` / `cloud-server.mjs` la posent aussi dans le fichier JS ;
- tests adaptés : `fin_export_ui.py`, `audit_ui.py` (la fenêtre Pro avec sa propre vidéo) et `formules_ui.py` (Clip →
  aperçu).

**Pour Marketing & croissance :**
- `build_site.py` est modifié. Il écrit le JS dans `/assets/` (au lieu de le mettre dans la page), ajoute `defer` aux deux
  bibliothèques et versionne `fonts/fonts.css`.
- Les textes du H1 et de l'accroche sont dans `src/app.js` (`hero.h1`, `hero.tag`, EN) et dans `src/markup.html` (FR). Ils
  sont à relire ou changer par vous. Le H1 anglais est celui de l'audit.
- La vidéo de l'accueil apparaîtra dès que `site_src/demo/hero.mp4` sera déposée (un vrai extrait du propriétaire).

**Pour Comptes, paiements & serveur :**
- `site_src/_headers` a une nouvelle règle : `/assets/*` est gardé un an (`immutable`). Ces fichiers sont versionnés, donc
  c'est sans risque.
- Les fichiers `site.css` et `pricing.css` (versionnés par `?v=`) pourraient avoir la même règle. Je n'y ai pas touché.

Planche contact (skill `planche-contact`) :
- Vidéo vérifiée : un vrai export de l'exemple depuis le site construit sur cette branche, en Gratuit (9:16, 20 s).
- 41 images vérifiées, aucun problème trouvé :
  - le filigrane reste hors des zones TikTok / Instagram ;
  - les paroles sont lisibles et non coupées ;
  - il n'y a aucune image noire.
- 0 problème restant.
