Statut : PRÊT (essai : le propriétaire choisit entre la version d'avant et celle d'après, et entre les deux voix)
Branche : marketing/essai-skills-video
Conversation : 5. Marketing & croissance
Partie de : `main` 5e98322 (vetting des skills vidéo, Chef de projet)
Maquette : aucune (rien ne change sur le site ni dans l'app ; les vidéos ont été envoyées au propriétaire, hors du dépôt)

Demande du propriétaire (6/11, 20 h 49) : essai encadré de trois skills vérifiés par le Chef de projet
(`docs/skills/vetting-2026-11-06-motion.md`), HyperFrames restant le moteur : Earshot (`4ac3d2a`) pour écouter, Take One
(`830621c`) comme guide de méthode, Explainroo (`e95232c`) pour la voix off seulement. Refaire une vidéo promo avec les trois,
envoyer la version d'avant et celle d'après, dire ce que chaque skill a vraiment changé.

Déroulé :
- Skills récupérés aux commits du rapport, hors du dépôt (empreintes des deux SKILL.md d'Earshot identiques à celles du rapport).
  Logiciels installés depuis PyPI et npm. **Modèles bloqués au début** (Hugging Face refusé par le réseau de l'espace de travail,
  erreur 403) : dit au propriétaire, rien contourné. À 21 h 01, il a ouvert `huggingface.co` et `*.hf.co` dans les réglages réseau
  de son compte ; modèles téléchargés une fois (Earshot : CLAP + AST, ~1,1 Go ; Explainroo : Kokoro 82M + Whisper base.en, ~400 Mo).
- Jamais `earshot llm` (aucune clé), aucune image OpenRouter, aucun outil payant (0 $).
- Vidéo choisie : le Short « The edit nobody sees » (`promo/youtube/short/`, 31,4 s, voix Flora Achird), laissé tel quel. La
  version d'après est dans `promo/essai-skills/` (copie du script de construction, changements marqués « TRIAL » ; détail et
  « refaire » dans `promo/essai-skills/README.md`, médias dans `MEDIA.md`). Version envoyée : **v8** (32,9 s).

Ce que chaque skill a changé (détail dans `promo/essai-skills/README.md`) :
- **Take One** (le plus gros changement) : la vraie app sur un téléphone à la place des cartes redessinées (13,5 → 21,4 s) :
  captures de l'app pilotée avec son son et ses prises, l'aperçu qui joue le vrai export, raccord sur le temps vers la vidéo plein
  cadre ; première image sans étiquettes coupées. Note (la mienne, pas
  d'un relecteur extérieur) face au film Lovio : 6,5/10 → 7,5/10 ; reste : les petits textes de l'app illisibles sur un téléphone
  (ex. « 157.1 BPM »), le décor du tapis toujours dessiné en code. Ses trois contrôles automatiques visent les films dessinés sur
  un canvas : ils ne lisent pas une page HyperFrames ; remplacés par `hyperframes check` (0 erreur) et la planche contact. Non
  faits : sa salle de revue, `POSTS.md`, un relecteur neuf (pas demandés).
- **Explainroo** : voix Kokoro `am_fenrir` (la plus proche d'Achird parmi trois voix d'homme américaines ; hauteur 146 Hz contre
  157), mêmes dix phrases, même volume phrase par phrase, un peu de graves ajoutés, sans limiteur (Earshot : limitée, elle
  s'éloignait d'Achird, z −6,4 contre −3,9). Whisper confirme tous les mots sauf un « And » ; ni Achird ni Kokoro ne disent
  « Stalak » d'une façon que Whisper reconnaît (« Stolic » / « Stalock »). Kokoro reste mesurablement différente d'Achird (plus
  claire, moins de graves). Vidéo : 31,4 → 32,9 s (la dernière phrase est plus lente).
- **Earshot** : sur la version d'avant, il a trouvé une coupe sans son (0:08,8), « You film. » et deux autres moments servis
  seulement par une montée de volume, pas de stop-down avant le coup le plus fort, la musique à baisser sous la voix. Ajouté :
  coups sur les coupes et le drop, baisse de 9 dB pendant 0,5 s avant le drop, musique 1,4 dB plus bas sous la voix, un coup et
  un obturateur sur « You film. », tous les sons du téléphone tirés de sa banque (faits en code, MIT), master à −14 LUFS.
  **Résultat, à sa propre mesure : pas nettement mieux.** Note globale inchangée : « launch-grade » 23/23 avant et après, −14,0 LUFS. Mieux : les coupes qui ont un son juste dessus (à 100 ms près) passent de 64 % à 82 % ; des trois moments servis seulement par une montée de volume, il n'en reste qu'un (« You film. », 0:24,4). Pas mieux : la coupe de 0:08,5 n'a toujours pas de coup net (le son arrive 0,19 s après) ; « You film. » reste faible à son écoute (repéré de justesse en v6, plus du tout en v8) ; ma baisse de la musique avant le drop ne compte pas pour lui comme un stop-down (il veut une vraie coupure du son de 0,2 à 1 s) ; il conseille toujours de baisser la musique sous la voix (voix dans 100 % du film contre 86 % avant). Sur mes repères (48 après, 43 avant), 85 % ont un son à 100 ms près, contre 88 % avant.
- Erreur à moi trouvée en relisant la v6 : un commentaire mal placé dans `build_after.py` avait supprimé le coup de basse et
  l'étincelle sur « Stalak edits. » (présents dans la version d'avant). Corrigé en v7.

Planche contact (skill `planche-contact`, `tools/contact_sheet.py`, une image toutes les 0,5 s) :
- v1 : 66 images, 1 problème : de 0:21,5 à 0:24,0, sa phrase « I put gold / on my wounds, / scars worth millions. » et le cadre
  d'encre de la vidéo avaient disparu (le calque du téléphone cachait leur visibilité) → corrigé.
- v2 : 66 images, 1 problème : de 0:06,5 à 0:08,0, « 1 frame off » / « out of sync » dans les 20 % du bas que TikTok et Instagram
  recouvrent (**le même défaut est dans la version d'avant**) → remonté au-dessus du mot « bounce ».
- v3 : rendu arrêté avant la fin (pas de vidéo). v4, v5, v6 : 66 images chacune ; j'y avais noté 0 problème, à tort (voir v7).
- v7 (= v6 + les deux sons de « Stalak edits. ») : 66 images ; en mesurant les zones sur les images elles-mêmes : de 0:04,5 à
  0:05,5, la fin de « OFF BEAT » (« AT ») était dans la bande de droite que les boutons de TikTok recouvrent et son cadre
  dépassait le bord de l'image (**déjà dans la version d'avant**, raté dans mes relectures v4 à v6) ; la fin de « Stalak edits. »
  (0:25,5) et de « No sign-up » (0:29 à la fin, la carte grandit de 4,5 %) touchait cette bande → « OFF BEAT » décalé vers la
  gauche sur la bande de son (bord droit à 85 % de la largeur au plus, au lieu du bord de l'image), les deux lignes de fin un peu
  plus petites (−7 % et −8 %), toujours centrées (bord droit à 86 %).
- v8 : 66 images, **0 problème restant** (« OFF BEAT » à 85 % de la largeur au plus une fois posé ; il ne touche la bande que pendant les 2 images de son apparition en fondu, de 3 pixels) ; aucune image noire ; seuls arrêts d'image : les textes de la carte de fin tenus 0,5 à 0,8 s, comme dans la version d'avant. `hyperframes check` : 0 erreur ; 2 avertissements : « music » (sous-titre mot à mot) et « on my wounds, » (parole de sa chanson) restent moins d'une demi-seconde à l'écran.

Fichiers : `promo/essai-skills/` (nouveau : `build_after.py`, `phone.js`, `capture_app.py`, `make_vo_kokoro.py`, `master.py`,
`README.md`, `MEDIA.md`, `.gitignore`, `short/` : le projet HyperFrames construit, sans médias), `docs/STATUS.md`, ce compte rendu.
Aucun média dans le dépôt. Rien à intégrer dans l'app ni le site. Migration SQL : aucune. Tests : sans objet (rien du site ni de
l'app n'a changé).

Reste au propriétaire : regarder les deux vidéos et dire laquelle il garde ; écouter la comparaison des voix
(« Voix_Flora_puis_Kokoro.mp3 »). S'il préfère la voix Flora avec le reste de la version d'après : `VOICE=flora python3
build_after.py`, puis rendu (environ 6 min), master, planche contact.
