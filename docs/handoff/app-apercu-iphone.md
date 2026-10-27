Statut : EN COURS
Branche : app/apercu-iphone

Résumé :
- Test caméra iPhone du propriétaire (iOS 18.7, Safari 26.6.1, app sur l'écran d'accueil) : son après le décompte et sens du selfie OK, mais lecture saccadée et export lent.
- Journal de l'iPhone : les prises filmées dans Stalak (avc1.42c028, 1920×1080 tournées en 1080×1920, image clé toutes les 1 s) donnent « Decoder failure » partout :
  - copie légère impossible, alors qu'une dizaine d'images étaient déjà passées ;
  - analyse de l'image impossible ;
  - aperçu décodé en erreur dès la lecture, avec repli sur le lecteur vidéo de Safari, d'où la saccade.
  - Le son des prises est aussi refusé (« piste AAC refusée (null) »), mais le calage par l'horloge du tournage reste correct.
- Hors de cause : `remuxTake`. Un MP4 fragmenté fait comme celui de l'iPhone ressort identique à l'original, image par image (framemd5) et pour le son (md5).
- Piste principale : l'aperçu (`liveReq` → `FrameSource.frameAt`) repart d'une image clé au milieu du fichier à chaque coupe. Or le code note déjà que le décodeur de Safari échoue dans ce cas, et l'export s'en protège avec `seqOnly` (`SEQ_DECODE`) ; l'aperçu, non. L'export lent vient probablement du même échec (repli sur l'enregistrement en temps réel).
- En attente : le propriétaire lance « Tester le décodage pour l'export » (mode #debug) sur l'iPhone, puis importe une vidéo de l'appareil photo pour comparer. La correction suivra ces résultats.

Fichiers touchés : docs/STATUS.md, docs/handoff/app-apercu-iphone.md (aucun code pour l'instant).
Migration SQL : aucune.
Tests : aucun changement de code. Remux vérifié dans Chromium (Playwright) + ffmpeg sur un MP4 fragmenté H.264 baseline 1920×1080 + AAC 48 kHz.
Reste au propriétaire : les deux tests iPhone demandés dans la conversation App & montage.
Skills utilisés : aucun pour ce diagnostic (lecture du code et tests maison) ; `webapp-testing` et `superpowers` (débogage systématique) prévus pour la correction.
