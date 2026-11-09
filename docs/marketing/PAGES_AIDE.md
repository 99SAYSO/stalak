# Pages d'aide pour Google (A7) : choix des 10 sujets

Demande : Chef de projet → Marketing, 9/11/2026 (décision du propriétaire du 9/11). Search Console sur 28 jours : 154 affichages,
40 clics, 100 % des recherches contiennent « stalak ». Google n'apporte donc aucun nouveau visiteur. Ces pages visent des
questions **sans le nom Stalak** que les rappeurs et chanteurs tapent dans Google.

Étape 1 (ce document) : la liste, validée par le propriétaire (« oui », 9/11). Étape 2 : une maquette d'une seule page, validée
(« ok », 9/11). Étape 3, faite : les 10 pages (anglais à la racine, français dans `/fr/`), écrites par `site_drafts/make_aide.py`.
Compte rendu : `docs/handoff/marketing-pages-aide.md`.

## Méthode (relevé du 9/11/2026)

- **Suggestions Google** : celles de la barre de recherche de Google, en anglais des États-Unis (`hl=en`, `gl=us`) et en
  français de France (`hl=fr`, `gl=fr`), relevées dans le navigateur.
- **« Autres questions posées »** (*People also ask*) : les questions affichées par Google sur la page de résultats, mêmes
  réglages.
- **Google Trends** : 12 derniers mois, États-Unis (ou France). Trends ne donne **pas de nombre de recherches** : il donne un
  intérêt relatif de 0 à 100 à l'intérieur d'une comparaison de 5 termes au plus. Pour comparer les sujets entre eux, chaque
  comparaison contient le même repère, « how to make a music video ». 0 = trop peu de recherches pour Trends.
- **Aucun volume de recherche n'est inventé** : il n'y en a aucun dans ce document.

### Google Trends, États-Unis, 12 mois

| Comparaison (moyenne sur 12 mois) | Résultat |
|---|---|
| how to make a music video / add lyrics to video / how to lip sync / promote music on tiktok / promote music on instagram | 67 / 15 / 38 / 0 / 0 |
| how to make a music video / low budget music video / sync audio and video / song snippet / music video aspect ratio | 67 / 1 / 24 / 17 / 0 |
| how to make a music video / music video on phone / how to tease a song / how long should a music video be / music video by yourself | 67 / 40 / 0 / 1 / 0 |
| how to make a music video / music video ideas / how to film a music video / promote your music / lip sync video | 61 / 34 / 10 / 8 / 44 |
| how to make a music video / how to make a lyric video / film yourself rapping / youtube shorts music / how to make a rap video | 57 / 1 / 0 / 58 / 0 |
| lyric video / lip sync / music video ideas / how to make a music video / promote music | 22 / 54 / 5 / 9 / 7 |

Presque tous ces termes sont plus bas sur les 3 derniers mois que sur les 3 premiers (exemple : « music video on phone » 53,5 →
22,2). Ce sont donc de petites recherches : on vise d'abord les variantes longues (« … on your phone for free », « … on tiktok »),
plus faciles à gagner pour un site jeune.

### Google Trends, France, 12 mois

| Comparaison | Résultat |
|---|---|
| faire un clip / clip de rap / mettre les paroles / promouvoir sa musique / synchroniser son et vidéo | 16 / 8 / 5 / 0 / 0 |
| faire un clip / idée de clip / faire un playback / snippet / se filmer seul | 7 / 0 / 0 / 32 / 0 |

« snippet » mélange d'autres sens (informatique, capture d'écran). « mettre les paroles » monte : 3,1 sur les 3 premiers mois,
14,8 sur les 3 derniers. En français, la demande est faible : les pages `/fr/` comptent surtout pour les francophones qui
arrivent déjà, et pour relier les deux langues.

## Ce qui est déjà couvert (écarté)

- Couper sur le temps, monter sur le beat : `/edit-video-to-the-beat`.
- Triller : `/triller-alternative` (seule page où un concurrent est nommé).
- Tout le morceau en clip 16:9 pour YouTube : page Clip en attente (`marketing/page-clip`, `/music-video` et `/fr/clip`).
- Les 5 autres guides, pour ne pas leur prendre leur place dans Google : `/how-to-make-a-lip-sync-video` (faire la vidéo en
  4 étapes), `/rap-snippet-video` (fabriquer un snippet), `/music-video-maker-for-rappers`, `/lip-sync-videos-for-singers`,
  `/lip-sync-video-editor`.
- Écartés parce que Stalak ne le fait pas (la page serait fausse ou hors sujet) : vidéo de paroles **sans** prises filmées
  (texte seul), visualiseur audio, Spotify Canvas, clip fait avec des photos, clip fait par une IA.
- Écarté parce qu'il faudrait citer des services tiers et des règles qu'on ne peut pas vérifier : « how to upload your own song
  to TikTok » (passe par un distributeur).

## Les 10 sujets proposés

Ordre = priorité proposée (demande mesurée, puis lien avec ce que fait l'app).

### 1. How to Make a Music Video on Your Phone

- Adresse : `/how-to-make-a-music-video-on-your-phone` ; FR « Comment faire un clip avec son téléphone »,
  `/fr/faire-un-clip-avec-son-telephone`.
- Suggestions : « how to make a music video on your phone for free », « how to make a music video by yourself for free »,
  « how to make a music video with your phone by yourself », « how to make a music video at home with a phone », « how to make
  your own music video on iphone ».
- Autres questions posées : « How to film a music video on your phone? », « Can I make a music video myself? », « What is the
  best free app to make a music video? ».
- Trends : « music video on phone » 40 (repère 67).
- FR : « comment faire un clip avec son telephone », « comment tourner un clip avec son telephone », « comment faire un clip de
  rap avec son téléphone » ; questions : « Comment créer son propre clip ? », « Quelle application pour faire un clip ? ».
- La page apprend : tout le parcours d'un clip fait seul (préparer, filmer plusieurs prises, monter, exporter en 9:16 ou
  16:9). Proche du guide `/music-video-maker-for-rappers` (l'outil) : celle-ci est le mode d'emploi, avec un lien vers lui.

### 2. Music Video Ideas You Can Shoot on a Phone

- Adresse : `/music-video-ideas` ; FR « Idées de clip sans budget », `/fr/idees-de-clip`.
- Suggestions : « music video ideas at home », « music video ideas low budget », « music video ideas rap », « music video ideas
  with friends », « how to make a music video with no budget ».
- Autres questions posées : « What are some creative ideas for low-budget music videos? », « What are some cool ideas for music
  videos? », « How much should a low budget music video cost? ».
- Trends : « music video ideas » 34 (repère 61).
- FR : « idée de clip original », « idee clip rap », « comment faire un clip sans budget » ; question : « Comment faire un clip
  rap ? ».
- La page apprend : des idées réalisables avec un téléphone et sans équipe (un lieu, plusieurs tenues, plusieurs prises…), et
  comment les monter.

### 3. How to Lip Sync Perfectly

- Adresse : `/how-to-lip-sync` ; FR « Comment faire un playback », `/fr/comment-faire-un-playback`.
- Suggestions : « how to lip sync perfectly on tiktok », « how to lip sync on tiktok step by step », « how to match lip sync and
  song on tiktok », « how to lip sync good », « how to fix lip sync on tiktok ».
- Autres questions posées : « How to do a perfect lip sync? », « How to get good at lip syncing? », « How to correct lip sync
  problems? ».
- Trends : « how to lip sync » 38 (repère 67), « lip sync video » 44 (repère 61).
- FR : « comment faire un playback sur tiktok », « comment faire un playback sur instagram » ; questions : « Comment fait-on un
  playback ? », « Quelle est la meilleure application pour faire des playback ? ».
- La page apprend : bien jouer le playback (connaître le texte, faire passer le son, la bouche, le souffle, le regard).
  **Attention** : proche de `/how-to-make-a-lip-sync-video`, qui explique la vidéo en 4 étapes ; celle-ci parle de la
  performance devant la caméra. Les deux pages se renvoient l'une à l'autre.

### 4. How to Film Yourself Rapping or Singing

- Adresse : `/how-to-film-yourself-rapping` ; FR « Comment se filmer seul en train de rapper », `/fr/se-filmer-en-train-de-rapper`.
- Suggestions : « how to film yourself rapping », « how to record yourself rapping », « how to record yourself singing with
  music on iphone », « how to record yourself singing on your phone », « how to record yourself singing on tiktok ».
- Autres questions posées : « What is the best way to film myself? », « How do you record yourself singing on your phone? »,
  « How do people record themselves singing? ».
- Trends : trop peu de données sur ces phrases exactes.
- FR : « comment se filmer seul avec un iphone », « comment se filmer seul avec un smartphone », « comment se filmer seul sur
  tiktok ».
- La page apprend : se filmer sans caméraman (poser le téléphone, cadrer, la lumière, le son qui joue pendant qu'on filme,
  plusieurs prises). Différente du n° 1 : ici, seulement le tournage.

### 5. How to Sync Your Video With Your Song

- Adresse : `/sync-video-to-music` ; FR « Synchroniser la vidéo et la musique », `/fr/synchroniser-video-et-musique`.
- Suggestions : « how to sync video to music », « how to sync video clips to music », « how to sync audio and video recorded
  separately », « how to sync video to audio ».
- Autres questions posées : « How to sync separate audio and video files? », « How to delay video to sync with audio? », « How
  to fix a video with audio that is out of sync? ».
- Trends : « sync audio and video » 24 (repère 67).
- FR : « synchroniser video et son », « comment synchroniser le son et l'image d'une vidéo », « synchroniser musique et video
  reel instagram ».
- La page apprend : remettre le son studio sur une prise filmée avec le téléphone, et corriger une bouche en décalage.
  Différente de `/edit-video-to-the-beat` (couper sur le temps) : ici, caler l'image sur le son.

### 6. How to Add Lyrics to a Video

- Adresse : `/add-lyrics-to-video` ; FR « Mettre les paroles sur une vidéo », `/fr/mettre-les-paroles-sur-une-video`.
- Suggestions : « how to add lyrics to a video on instagram », « … on tiktok », « … on youtube », « … on phone », « … free »,
  « how to put lyrics on tiktok video automatically », « how to add lyrics to instagram reels », « how to make a lyric video for
  my song ».
- Autres questions posées : « How can I add text to a video for free? », « What app puts words on video? », « How can I add
  words to a video on iPhone? ».
- Trends : « add lyrics to video » 15 (repère 67) ; « lyric video » 22 (repère « lip sync » 54).
- FR : « comment mettre les paroles sur une video tiktok », « comment mettre les paroles d'une chanson sur une video »,
  « comment mettre les paroles sur un reel instagram », « comment faire une lyrics video » ; Trends FR « mettre les paroles » en
  hausse.
- La page apprend : afficher ses paroles ligne par ligne et bien calées, et (Pro) mot par mot ou en karaoké, écrites
  automatiquement. La vidéo de paroles « texte seul » est expliquée honnêtement (Stalak met les paroles sur tes prises).

### 7. How to Promote Your Music on TikTok

- Adresse : `/promote-your-music-on-tiktok` ; FR « Promouvoir sa musique sur TikTok », `/fr/promouvoir-sa-musique-sur-tiktok`.
- Suggestions : « how to promote your own music on tiktok », « best way to promote your music on tiktok », « how to market my
  music on tiktok », « how to promote a new song on tiktok ».
- Autres questions posées : « How do I promote my own music on TikTok? », « Is TikTok promotion worth it for music? ».
- Trends : faible sur la phrase exacte (« promote your music » 8, repère 61).
- FR : « promouvoir ma musique sur tiktok », « partager sa musique sur tiktok » ; questions : « Comment mettre sa propre musique
  sur TikTok ? », « Comment puis-je promouvoir ma musique gratuitement ? ».
- La page apprend : un plan simple avec des vidéos de soi qui interprète le morceau (rythme de publication, les premières
  secondes, plusieurs passages du même son). Sans chiffre de vues promis.

### 8. How to Promote Your Music on Instagram Reels

- Adresse : `/promote-your-music-on-instagram` ; FR « Promouvoir sa musique sur Instagram »,
  `/fr/promouvoir-sa-musique-sur-instagram`.
- Suggestions : « how to promote your music on instagram for free », « how to promote a new song on instagram », « how to promote
  a music video on instagram », « how to promote a song on instagram story ».
- Autres questions posées : « What is the best way to promote my music? », « How do I distribute my music to Instagram? ».
- FR : « promouvoir sa musique sur instagram », « comment partager sa musique sur instagram ».
- La page apprend : Reels, Stories et profil pour un nouveau son, avec les vidéos faites dans Stalak.

### 9. How to Tease a New Song

- Adresse : `/how-to-tease-a-song` ; FR « Teaser un son avant sa sortie », `/fr/teaser-un-son`.
- Suggestions : « how to tease a song on instagram », « how to tease a song on tiktok », « how to tease a song release », « how
  long should a song snippet be », « how to make a teaser video for a song », « how long should a music video teaser be ».
- Autres questions posées : « How do I announce a song release? », « What is a snippet of a song? ».
- Trends : « song snippet » 17 (repère 67).
- FR : aucune suggestion pour « teaser un son » : demande faible en français.
- La page apprend : quoi publier avant la sortie, quand, et combien de temps doit durer un extrait. **Attention** : proche de
  `/rap-snippet-video` (fabriquer un snippet) ; celle-ci parle du calendrier, avec un lien vers lui.

### 10. Music Video Size and Length for YouTube, TikTok, Reels and Shorts

- Adresse : `/music-video-format` ; FR « Format et durée d'un clip », `/fr/format-video-clip`.
- Suggestions : « best aspect ratio for music video », « best resolution for music video », « best aspect ratio for youtube
  music video », « how long should a music video be on tiktok ».
- Autres questions posées : « What aspect ratio should a music video be? », « Is 1920x1080 or 1280x720 better? », « What is the
  average length of a music video? », « Is a 2 minute video too long? ».
- Trends : faible (« how long should a music video be » 1, repère 67).
- FR : « format vidéo tiktok », « durée vidéo tiktok », « resolution video tiktok », « format vidéo réel instagram », « format
  vidéo youtube », « combien de temps doit durer un short youtube ».
- La page apprend : 9:16 ou 16:9, la résolution, la durée selon le réseau. Les règles des réseaux seront vérifiées sur leurs
  pages d'aide officielles le jour de la rédaction.

## Ensuite

- Le propriétaire valide, retire ou remplace des sujets.
- Maquette proposée : le n° 1 (la demande la plus forte et le cœur de l'app), sauf autre choix du propriétaire.
- Chaque page : mode d'emploi réel avec des captures de la vraie app, puis « Stalak en une minute » et « Try it free » ; même
  modèle et même pied de page que les guides ; liens entre les pages ; `sitemap.xml`, `llms.txt` et balises FR/EN.
