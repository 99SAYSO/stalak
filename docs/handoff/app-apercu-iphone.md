Statut : FUSIONNÉ (en ligne le 27/10)
Branche : app/apercu-iphone

Résumé :
- Problème (test du propriétaire sur iPhone, iOS 18.7 / Safari 26.6.1) : lecture saccadée et export lent avec les prises filmées dans Stalak.
- Diagnostic sur l'iPhone (« Tester le décodage pour l'export ») : les 10 façons de décoder échouent toutes au même endroit (image 9, « Decoder failure »), y compris le décodeur sans la puce. Les données des prises étaient donc abîmées, pas la façon de les lire. L'aperçu retombait sur le lecteur vidéo de Safari (saccade), et l'export sur l'enregistrement en temps réel (lenteur).
- Cause : le MP4 en morceaux écrit par l'enregistreur de Safari ne donne pas la position de départ des données de chaque piste. La norme dit alors que la 2e piste d'un morceau suit la 1re ; MP4Box 0.5.2 la lisait depuis le début du morceau. `remuxTake` recopiait donc des octets faux.
- Correction (`src/app.js`, à côté de `readMp4`) :
  - `fragSamples(buf)` relit les morceaux (moof/traf/tfhd/trun, avec les valeurs par défaut de trex) en suivant la norme : position de départ écrite, ou début du morceau (default-base-is-moof), ou fin des données de la piste précédente ;
  - `fragFix` remet sur chaque échantillon de MP4Box les bons octets et l'indicateur d'image clé. Il n'agit que sur les fichiers en morceaux et laisse tout tel quel si le nombre d'échantillons ne correspond pas (ligne dans les infos techniques).
  - Nouvelle ligne de journal quand une correction a lieu : « lecture MP4 : N échantillons repris au bon endroit ».
- Le nombre de copies légères, l'aperçu et l'export ne changent pas : ils retrouvent simplement des prises lisibles.

Fichiers touchés : src/app.js (2 fonctions ajoutées + 2 lignes dans readMp4), public/index.html et public/en/index.html (reconstruits), tests/ui/remux_frag.py (nouveau), docs/STATUS.md, ce compte rendu.
Migration SQL : aucune.

Tests :
- Nouveau `python3 tests/ui/remux_frag.py public` : 5 dispositions de MP4 en morceaux (ffmpeg), images et son comparés à l'original. Avant la correction : 8/10, les deux cas « 2e piste sans position » échouent comme sur l'iPhone. Après : 10/10.
- `node tests/backend/run.mjs` : 57/57 (après remise à jour sur main f4be097).
- Syntaxe de `src/app.js` OK, `build.py` et `build_site.py` OK.
- Chargement sans erreur ni défilement horizontal : site FR et EN + version claude.ai, à 390 px et 1280 px.
- `tests/ui/lyrics_ui.py` : s'arrête sur un délai d'attente de 15 s, à l'identique sur `main` sans ce changement. Ce problème existait déjà et n'est pas lié à cette branche, à regarder à part.

Reste au propriétaire : après la mise en ligne, refilmer 2 prises sur iPhone et vérifier que la lecture est fluide et l'export rapide. Copier les infos techniques s'il reste un souci : la ligne « échantillons repris au bon endroit » doit y apparaître.
Skills utilisés : superpowers (P6 débogage systématique + P5 test d'abord). webapp-testing n'a pas été chargé : les tests Playwright ont été écrits directement.
