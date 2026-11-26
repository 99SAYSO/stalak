Statut : EN COURS

# Branche `app/activation-rapide` — le « wow » en moins d'une minute (partie App)

Demande : `docs/handoff/chef-activation-rapide.md`, validée par le propriétaire le 26/11 à 16 h 16. Partie de main `25c5428`, avec `app/clarity-26-11` dedans : la reprise après un retour en arrière en a besoin. Si `app/clarity-26-11` est fusionnée avant, il ne reste que ce qui est décrit ici.

**Statut** : maquette envoyée au propriétaire, j'attends sa validation. Tout est déjà dans la branche et testé.

## Ce qui change
1. **Le wow avant l'effort** (n° 1).
   - Juste après le choix du son et du passage, « Continuer » montre **10 s de SON son coupé sur le rythme**, avec les 3 prises d'exemple de `demo/example` placées au début du passage. Une carte en bas affiche « Aperçu · 10 s », « Ton son, coupé sur le rythme », un gros bouton « Maintenant, filme les tiennes » et le lien « Revoir l'aperçu ».
   - Le bouton mène à l'étape des prises, **sans aucune prise d'exemple**. Rien de l'exemple n'est gardé dans le téléphone, et on ne peut pas exporter pendant l'aperçu.
   - Le wow arrive **une fois par son tout juste choisi** : jamais pour un projet repris, jamais pour l'exemple.
   - Les fichiers d'exemple (4 Mo) sont chargés dès que le son est choisi.
   - Le parcours ensuite ne change pas.
2. **Un parcours qu'on peut reprendre** (n° 2).
   - Le son seul (avec son passage) est déjà gardé dans le téléphone, avant toute prise.
   - « Reprendre » ramène à **l'étape où on était** : le son, les prises ou le montage.
   - Titre de la carte : « **Reprendre ton snippet ?** » (EN : « Pick up your snippet? »). Message de fin : « … est revenu, là où tu l'avais laissé ».
   - Après un retour en arrière, le montage revient tout seul (`app/clarity-26-11`). Un rechargement demande toujours (décision du 30/10).
3. **La caméra et le micro** (n° 3).
   - Avant la fenêtre d'iOS, un écran Stalak avec la mascotte :
     - titre : « Ta caméra et ton micro » ;
     - texte : « On a besoin de ta caméra et de ton micro pour filmer tes prises. Elles restent sur ton téléphone : rien n'est envoyé sans que tu le demandes. » ;
     - boutons : « Autoriser la caméra » / « Plutôt importer mes vidéos » / « Annuler ».
   - **Si c'est refusé** : « La caméra est bloquée ». L'écran explique comment la réautoriser dans Safari, propose « Réessayer » et l'import.
   - Une fois que la caméra a marché sur l'appareil, cet écran ne revient plus.
   - Je n'ai **pas repris mot pour mot** « Rien n'est envoyé, tout reste sur ton téléphone » : avec Creator Plus, la sauvegarde en ligne envoie les prises. **À vérifier par Juridique.**
4. **« Montages » vide** (n° 4) : une carte « Ton premier montage » avec la mascotte, le bouton « Choisir mon son » et le lien « Voir un exemple ». Elle s'affiche quand il n'y a aucun projet à montrer (sans sauvegarde en ligne, ou avec une liste vide).
5. **Les évènements d'étape** (n° 5). Chacun est envoyé une fois par visite, de façon anonyme, et jamais pour l'exemple seul :
   - `step_song`, `step_passage`, `step_take1`, `step_take3` ;
   - `step_preview`, l'activation : au wow, ou à la première fois qu'on voit le montage avec ses propres prises. Il porte la durée depuis l'arrivée en tranche : `s30`, `s60`, `s120`, `s300` ou `slong` ;
   - `step_lyrics`, `step_export_start`, `step_export_ok`.
   - Côté serveur (`functions/_lib/metrics.js`, **Comptes**) : ces noms sont ajoutés à la liste fermée. Ils sont comptés aussi par appareil (`ev_st_<ios|android|desktop>_<étape>`), et la durée du wow est comptée par tranche (`ev_step_preview_<tranche>`). Le tableau de bord (n° 6) revient à Comptes.
6. **Tutoriel** : il faisait **4 écrans**, il en fait maintenant **3**. Chacun a un seul titre et une seule phrase, avec « Passer » sur les deux premiers. Le 4e (« Exporte et poste ») est fondu dans le 3e : « Tout seul, lèvres synchro, prêt pour TikTok et Reels. »
7. Le questionnaire reste seulement sur « Stats » : je n'y ai pas touché.

## Tests
- Nouveau `tests/ui/activation_rapide_ui.py` : 28/28 (iPhone 13 FR, iPhone SE EN). Il vérifie :
  - le tutoriel en 3 écrans ;
  - « Montages » vide ;
  - le wow (moins de 15 s après « Continuer », 10 s de lecture, aucune prise d'exemple gardée, une fois par son) ;
  - la caméra, avant et après refus ;
  - les étapes envoyées une fois ;
  - « Reprendre ton snippet ? » avec le son seul, à l'étape des prises.
- Serveur : nouveau test des évènements d'étape. Résultat : 143/143.
- `refonte_mobile4_ui` : le tutoriel passe à 3 écrans.
- La série complète est en cours.

## Maquette
Dans `docs/audit/maquettes/activation-rapide-2026-11-26/` : planches FR et EN, puis les écrans un par un (tutoriel, Montages vide, « Où est ton son ? », passage, wow, prises, caméra avant et après refus, « Reprendre ton snippet ? »).

## À prévenir
- **Comptes** : `functions/_lib/metrics.js` (liste des évènements d'étape et comptages), plus le tableau de bord de l'entonnoir (n° 6) et la relance (n° 7) à faire de leur côté.
- **Juridique** : le texte de l'écran caméra (n° 3) et la relance (n° 8).
- **Marketing** : rien (`markup.html` ne change que par le titre de la carte « Reprendre »).
