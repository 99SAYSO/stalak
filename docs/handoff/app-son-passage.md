Statut : PRÊT
Branche : app/son-passage

Résumé :
- Glisser-déposer du son (ordinateur) :
  - le carré « Importer la musique » accepte un fichier lâché dessus ;
  - pendant le survol, il passe en givre (fond glace, contour plein, « Lâche ton fichier ici » qui frissonne, sans animation si le système le demande) ;
  - le fichier suit exactement le même chemin que le bouton d'import (`loadSongFile`, extrait de l'ancien `#songFile.onchange`) ;
  - un fichier lâché ailleurs sur la page ne fait plus quitter le site.
- Choix du passage :
  - les deux poignées de l'onde, jusqu'ici réservées au Clip, servent maintenant aussi en TikTok/Reels. Début = `S.startBar` ; fin = `S.startBar + S.nBars`, avec `S.nBars = 0` pour « jusqu'à la fin ». Le Clip garde `S.clipEnd` ;
  - elles s'accrochent aux mesures, comme avant, pour que les coupes restent en rythme ;
  - poignées plus grandes, zone tactile invisible de 44 px, `touch-action:none` : le doigt fait glisser la poignée sans faire défiler la page ;
  - pendant le glissement, seule l'onde est redessinée (fluide sur téléphone) ; le montage est refait une seule fois, au lâcher ;
  - toucher l'onde hors des poignées garde le comportement d'avant : en Reels, le passage se déplace et se lance ; en Clip, l'écoute part de là.
- Le menu « Durée » ajoute une ligne pour une longueur faite aux poignées (« 7 mesures » / « 7 bars »). Les boutons « Fin ‹ › » sont visibles et marchent dans les deux modes (`segMove`).
- Bouton « ▶ Écouter le passage » : `listenStart(from, seg)` joue du début à la fin du passage sans l'élargir à tout le son ; un deuxième appui arrête ; le libellé suit la langue.
- Textes : nouvelles clés dans un bloc à part en FR et EN (repère `"_bloc.app.son"`, car les dictionnaires sont lus comme du JSON, sans commentaires) ; `wave.hint.reel` réécrit.

Fichiers touchés : src/app.js, src/markup.html, src/theme.css (bloc en fin de fichier), public/index.html et public/en/index.html (reconstruits), tests/ui/son_passage.py (nouveau), docs/STATUS.md, ce compte rendu.
Migration SQL : aucune.

Tests :
- Nouveau `python3 tests/ui/son_passage.py public` : 62/62. FR et EN ; téléphone 390 px (vrais événements tactiles) et ordinateur 1280 px (souris). Il couvre :
  - le survol et le dépôt du fichier ;
  - les poignées de fin et de début, calées sur une mesure ;
  - les libellés, le montage refait ;
  - « Écouter le passage » (départ au début, arrêt au deuxième appui, arrêt tout seul à la fin) ;
  - le Clip (poignée, « Fin ‹ », « Fin › » jusqu'au bout) ;
  - l'absence de défilement horizontal et d'erreur.
- `node tests/backend/run.mjs` : 57/57. `tests/ui/remux_frag.py` : 10/10.
- Syntaxe de `src/app.js` OK ; `build.py` et `build_site.py` OK ; version claude.ai chargée sans erreur à 390 px et 1280 px.

Reste au propriétaire : après la mise en ligne, essayer sur iPhone (tirer les deux poignées au doigt, « Écouter le passage ») et sur ordinateur (glisser un MP3 sur le carré).
Skills utilisés : superpowers (test d'abord), webapp-testing (scénarios navigateur).
