Statut : PRÊT
Branche : app/partager (créée depuis `main` du 5/11 : 2779364).
Maquette : https://app-partager.stalak-site.pages.dev (à faire valider par le propriétaire sur son téléphone avant la fusion, règle 9).

Résumé :
- **Sur téléphone (iPhone, iPad, Android), un grand bouton « Partager »**, en premier, dès que la vidéo est prête.
  - Il ouvre le menu de partage du téléphone avec le fichier vidéo : la vidéo faite, en MP4, celle-là même.
  - On choisit TikTok ou Instagram, et l'appli s'ouvre avec la vidéo déjà importée. Il ne reste qu'à coller la légende et poster.
  - Sur iPhone, le même menu propose aussi « Enregistrer la vidéo » pour la mettre dans Photos (c'est dit dans l'explication).
  - Juste dessous : **« Copier la légende »**, puis une phrase d'explication, puis le texte de la légende, que l'on peut modifier.
  - Le téléchargement reste disponible en petit lien : « Télécharger le fichier ».
  - Les liens vers les sites de TikTok, Instagram et YouTube sont masqués sur ces téléphones, puisque le menu de partage les remplace.
  - Quand la vidéo est prête, la page descend pour que « Partager » arrive juste sous l'aperçu, bien visible (avant, l'aperçu collé en haut pouvait le cacher).
- **Sur ordinateur, ou sur un téléphone qui ne sait pas partager un fichier** : « Enregistrer sur l'appareil » reste le bouton principal, comme aujourd'hui, avec la légende à copier.
  - Changement à noter : sur un ordinateur dont le navigateur sait partager (Safari sur Mac, Chrome sur Windows), le petit bouton de partage n'apparaît plus. La demande était « sur ordinateur, garder Télécharger ».
- **Si le téléphone refuse le partage du fichier**, le bouton de téléchargement redevient le bouton principal, avec une explication. Si on ferme le menu sans rien choisir, rien ne change.
- **Légende** : texte court, par exemple
  - « 🎤 titre du son » (sauf pour l'exemple) ;
  - les mots-dièse habituels, avec `#madewithstalak` (décision de l'audit du 30/10) ;
  - « made with stalak.app » : c'est la nouvelle formule, en FR comme en EN. Avant, le français disait « Fait avec stalak.app ».
- **Pour tout le monde, gratuit et Pro.** Rien ne change pour le filigrane ni pour la pub de 30 s du gratuit : c'est le même fichier qui est partagé ou téléchargé.
- **Textes**, en FR et EN :
  - le bouton : « Partager » / « Share » ;
  - l'explication : « Choisis TikTok ou Instagram : l'appli s'ouvre avec ta vidéo déjà importée. Colle la légende dessous et poste. » ;
  - le lien : « Télécharger le fichier » / « Download the file ».
- **Animation (skill `motion-design`)** : aucune nouvelle. Le bouton garde son effet d'appui habituel, et « Légende copiée ✓ » est un simple texte.

Fichiers touchés :
- `src/markup.html` : la zone `#shareBox` en haut du résultat ; `#saveRow` ; le libellé du bouton.
- `src/app.js` :
  - `PHONE_DEV` (iPhone, iPad, Android) ;
  - `postShow` (le bouton principal sur téléphone) ;
  - après l'export, le défilement vers « Partager » ;
  - en cas de refus de partage, le retour au téléchargement ;
  - les textes `post.shareMain`, `post.shareHintPhone`, `post.shareHintIos`, `save.file`, `post.share` et `cap.made`.
- `src/theme.css` : la mise en page de `.sharebox`.
- Tests : nouveau `tests/ui/partager_ui.py` ; `tests/ui/audit_ui.py` adapté au nouveau libellé « Partager ».
- Pas de migration, rien côté serveur.

Tests (5/11, iPhone 12 de 390 px et Pixel 7 Android émulés, ordinateur de 1280 px, FR et EN) :
- **Nouveau `partager_ui.py`** : 78/78. Il vérifie :
  - « Partager » en grand, en premier, et visible à l'écran quand la vidéo est prête ;
  - l'explication et la légende juste dessous, le petit lien de téléchargement, plus de liens vers les réseaux ;
  - la légende courte avec « made with stalak.app », et « Copier la légende » qui la copie ;
  - le partage reçoit un seul fichier MP4, la vidéo faite, puis « Envoyé ! » s'affiche ;
  - fermer le menu ne change rien ;
  - Pro donne le même affichage ;
  - un partage refusé fait revenir le téléchargement ;
  - un téléphone sans partage de fichier, et l'ordinateur (gratuit et Pro), gardent « Enregistrer sur l'appareil » ;
  - pas de défilement de côté, aucune erreur.
- Le vrai menu de partage du téléphone ne peut pas s'ouvrir dans un test : il est remplacé par une imitation qui note ce que Stalak lui donne. **À vérifier par le propriétaire sur la maquette.**
- Les autres suites :
  - `audit_ui.py` 158/158, `formules_ui.py` 169/169, `son_passage.py` 86/86, `filtres_ui.py` 106/106 ;
  - `projet_local_ui.py` 48/48, `export_pub_ui.py` 22/22, `animations_ui.py` 44/44, `liens_cmp_ui.py` 98/98, `pied_de_page_ui.py` 402/402 ;
  - `remux_frag.py` 10/10, `paroles_suppr.py` 44/44, `plans_ui.py` 35/35, `gallery_ui.py` 49/49, `help_ui.py` 42/42 ;
  - `tests/backend/run.mjs` 80/80.
- `support_ui.py` et `lyrics_ui.py` s'arrêtent au même endroit que sur `main` (délai dépassé en attendant la page), sans lien avec ce changement.
- La maquette s'ouvre (vérifié le 5/11 : page de Stalak avec son pied de page). Le bouton « Partager » n'apparaît qu'après un export : c'est au propriétaire de le tester sur son téléphone.

À tester par le propriétaire, sur la maquette, avec son téléphone :
1. Ouvrir https://app-partager.stalak-site.pages.dev, faire une vidéo (l'exemple suffit) et l'exporter.
2. Toucher « Copier la légende », puis « Partager », puis choisir TikTok : l'appli s'ouvre avec la vidéo. Coller la légende. Ne pas forcément poster.
3. Pareil avec Instagram (Reels).
4. Sur iPhone : dans le même menu, « Enregistrer la vidéo » la met dans Photos.
5. Sur ordinateur : « Enregistrer sur l'appareil » comme avant.
- Attention : la maquette utilise la même base de données que le vrai site (règle 9). Ce test ne touche ni aux comptes ni aux paiements.
