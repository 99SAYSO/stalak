Statut : PRÊT
Branche : app/export-pub (créée depuis `main` du 30/10 à 21 h). Une seule fusion suffit.

Résumé (demandes du propriétaire du 30/10, 21 h) :
1. Deux boutons d'export côte à côte en Gratuit (`#expRow`) :
   - « Exporter » (petit texte « avec filigrane ») : la vidéo sort tout de suite, avec le filigrane ;
   - « Regarder une pub (30 s) » (petit texte « sans filigrane ») : bleu, avec un reflet de givre qui passe et des cristaux qui scintillent (immobile si l'appareil demande moins d'animations). À la fin de la pub récompensée, l'export sans filigrane démarre tout seul (`adReward` → `exportOne()`).
   - En Pro / Creator Plus : un seul bouton « Exporter », sans texte de filigrane.
   - Sous les boutons : « Les vidéos gratuites portent un petit logo Stalak en filigrane. » et « Sans filigrane ni pub : passe à Pro ».
2. Bug d'export :
   - au début d'un export, la vidéo précédente est mise en pause et lâche son fichier (`resultPark`) ;
   - si on annule (ou si l'export échoue), elle revient telle quelle, et c'est toujours elle qu'on enregistre (`resultBack`) ; avant, une annulation remplaçait la vidéo à enregistrer par un bout de vidéo ;
   - l'ancien fichier n'est libéré qu'une fois la nouvelle vidéo prête (`resultDone`).
   - 2e export lent : cause la plus probable, la vidéo précédente continuait de jouer pendant l'export, avec son son et le décodeur vidéo de l'iPhone (il n'y en a qu'un nombre limité) ; c'est corrigé. Sur la machine de test, deux vrais exports de suite prennent le même temps (5,5 s). À confirmer sur un vrai iPhone.
3. Étape Son : les poignées de début et de fin sont libres, au centième de seconde, sans aimant (`S.segA` / `S.segB`, gardés dans le projet). Le montage est fait sur les mesures qui couvrent le passage, donc les coupes à l'intérieur restent sur le rythme, puis il est coupé pile aux poignées (`segClamp`). Les boutons ‹ › et le menu Durée remettent le passage sur les mesures.
4. Curseur rouge sur l'onde : on le fait glisser au doigt (ou on touche l'onde ailleurs que sur une poignée), et le son joue à partir de l'endroit où on le lâche. Le bouton rond rouge du haut attrape toujours le curseur, même quand il est posé sur la poignée de début. Textes d'aide FR/EN mis à jour.
5. Filigrane (`wmDraw`) : le logo Stalak seul (le S et la stalactite dans un carré arrondi), blanc à 60 % avec une ombre légère, environ 8,5 % du petit côté de l'image (92 px en 1080 px, 0,4 % de l'image). Il reste fixe 5 s puis apparaît directement ailleurs, sans glisser : haut droite → bas gauche → bas droite → gauche au tiers. Même image dans l'aperçu et dans l'export (2D, WebGL de Safari, temps réel).
6. « Générer le pack » sans Creator Plus : cadenas 🔒 devant et étiquette « CREATOR+ » violette bien visible. Avant, l'étiquette était cachée par la bulle d'aide du bouton (les deux utilisaient la même place) : réparé.
7. Packs dès 2 playbacks (au lieu de 3). Ligne de conseil sous le bouton : « Dès 2 playbacks. Plus tu as de prises, plus les vidéos sont variées. » Message avec 1 seul playback : « Le pack demande au moins 2 playbacks (prises chantées). Plus tu as de prises, plus les vidéos sont variées. » Textes `acct.why.pack` et `pl.f.packs` passés à 2, en FR et en EN. Clé `pack.need3` supprimée, `pack.need2` et `pack.tip` utilisées.
8. Plus aucun concurrent cité dans l'app : « façon Triller » / « Triller style » retiré des consignes de l'assistant d'aide (FR/EN). TikTok, Instagram et YouTube restent : ce sont les endroits où l'on poste, pas des concurrents.

Tests passés (Playwright, iPhone 15 Pro émulé et ordinateur, FR et EN) : voir la fin de ce fichier.

Pour le Chef de projet :
- Le site (hors app) cite encore Triller : `site_src/alternative-triller.html`, `site_src/en/triller-alternative.html` et `site_src/llms.txt`. Ce n'est pas mon domaine (Marketing).
- Le « Contrat App / Comptes » de `docs/STATUS.md` décrit encore le filigrane « logo + Clipped with stalak.app, qui bouge » : c'est maintenant le logo seul, qui change de place sans glisser.

À tester par le propriétaire sur un vrai iPhone (impossible ici : pas d'iPhone ni de vraie pub Google) :
- deux exports de suite : le 2e doit être aussi rapide que le 1er ; annuler un export : la vidéo précédente revient ;
- le bouton pub : la pub de test de Google, puis l'export sans filigrane qui part tout seul ;
- le filigrane dans la vidéo exportée (petit logo qui saute d'un coin à l'autre) ;
- l'étape Son : poignées libres au doigt, et curseur rouge qu'on fait glisser pour écouter.

Tests (30/10 au soir, iPhone 15 Pro émulé + ordinateur, FR + EN) :
- `tests/ui/formules_ui.py` (mis à jour : deux boutons, pub bleue givrée, export qui part tout seul après la pub, filigrane logo seul qui saute toutes les 5 s, cadenas CREATOR+ visible, packs dès 2 playbacks) : 169/169
- `tests/ui/export_pub_ui.py` (nouveau : vidéo précédente coupée et libérée, rendue si on annule, deux vrais exports de suite) : 22/22
- `tests/ui/son_passage.py` (mis à jour : poignées libres au doigt, coupes pile aux poignées, curseur rouge glissé → lecture, ‹ › remet sur les mesures) : 86/86
- `filtres_ui.py` 106/106, `remux_frag.py` 10/10, `paroles_suppr.py` 44/44, `plans_ui.py` 30/30, `gallery_ui.py` 40/40, `help_ui.py` 42/42, `tests/backend/run.mjs` 67/67
- `support_ui.py` et `lyrics_ui.py` : s'arrêtent sur une attente trop longue, exactement pareil sur `main` (vérifié pour support_ui) : sans lien avec cette branche.
