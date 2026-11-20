# Branche `marketing/serie-fr` : la série animée de Stalak

> Marketing & croissance. Rien ne change sur le site : seulement `tools/serie/` et `docs/`.

Statut : PRÊT (outils et documents ; rien sur le site). 20/11, 19 h 40 : la partie Stalak du format « BONNE IDÉE VS MAUVAISE IDÉE » est fabriquée avec les vrais enregistrements d'écran du propriétaire (aperçu envoyé) ; les 6 scripts (23 et 24/11) sont à jour dans Studio Stalak, la vidéo 1 réécrite selon sa décision de 18 h 10 (« Bloqué à 300 vues ») ; rien d'autre n'est fabriqué avant sa validation. Série T-Crazy : versions de publication 1 à 15 faites (19/11) ; versions corrigées de 8, 10 et 11 en pause. Tests : planche contact de la partie Stalak relue (2 défauts corrigés), `node --check` sur le moteur, faits vérifiés à la source.

## 20/11, 19 h 40 : la partie Stalak avec ses vrais enregistrements ; la vidéo 1 devient « Bloqué à 300 vues »

- **Sa demande (20/11, 18 h 52)** : ses enregistrements d'écran de stalak.app/fr sur iPhone (Son, Prises, Paroles, Montage, fabrication, vidéo prête) et la vidéo finie, pour les 20-22 s « L'explication de Stalak » : sur le téléphone de Big Mo, découpés et accélérés si besoin, sans rien inventer ; garder l'igloo de fabrication et la vidéo finie qui tourne. Décision du même jour dans le mode d'emploi (main, f9101b2) : sous le téléphone, une carte façon App Store.
- **Fait** : `tools/serie/stalak_part.py` (plan, screen, bg, hf, sheet ; détail dans son en-tête) et les images `bima-stalak-01` à `06` de `engine/storyboard.js` (Big Mo à gauche, le décor de chaque vidéo assombri derrière lui). Les enregistrements vont dans `<work>/stalak_part/src/` (r1, r2, r3, r4, r5, final), jamais dans le dépôt.
  - Le temps vient des phrases de Big Mo : estimé sur le texte tant que sa voix n'existe pas, puis lu sur `<work>/voice/bima-stalak/LNN.wav` ; chaque morceau d'enregistrement suit sa phrase (un morceau à vitesse normale garde sa vitesse et son son ; le morceau « élastique » de la phrase est accéléré ou ralenti pour remplir le reste).
  - 11 morceaux : l'accueil ; 1 Son (« neva die v3 », les poignées de 65 à 12 mesures) ; 2 Prises (« Importer mes vidéos », « Filmer maintenant ») ; 3 Paroles (« Coller mes paroles », puis les phrases calées) ; 4 Montage qui joue (son son) ; l'igloo (×13,7) ; « Ta vidéo est prête ✓ » ; la vidéo finie (contenue entière dans l'écran, avec son filigrane, son son), puis en grand avec « stalak.app ».
  - Pas de zoom dans l'écran : les textes du site vont d'un bord à l'autre, tout zoom les coupait (vu sur la première planche).
  - HyperFrames assemble tout : le fond rendu par le moteur, le téléphone et l'écran, la carte, les étapes, les mots de Big Mo (style des sous-titres de la série), « stalak.app » ; sous l'image, le son des morceaux à vitesse normale et de petits bruitages (souffle, pops), sans la voix.
- **Aperçu** : décor de la vidéo 1 (cuisine, le soir), 22,6 s avec la voix estimée (la vraie voix fixera la durée). Planche contact relue : 2 défauts corrigés (les étapes passaient sous les mots en haut → au-dessus de la tête de Big Mo ; un écran bleu vide 0,5 s avant « Ta vidéo est prête » → coupé), 0 problème restant. Envoyé au propriétaire.
- **Les 6 fiches** : leur passage Stalak décrit ses enregistrements et la carte ; le son en parle. **Vidéo 1 réécrite** (décision du propriétaire de 18 h 10 dans `docs/STATUS.md`) : « Bloqué à 300 vues » (Liam a payé 10 000 vues, zéro j'aime ; des vues achetées, ce sont de faux comptes ; le vrai problème, sa vidéo où rien ne bouge ; sur TikTok, le temps passé sur la vidéo compte souvent le plus ; fin « demain, je filme plusieurs prises »). Aucune promesse de percer. Statut `script` pour les 6.
- **Reste** : sa validation des scripts, puis le rendu du passage dans le décor de chaque vidéo (`stalak_part.py bg N` puis `hf N`, environ 5 min chacun), la voix de Big Mo une seule fois, et la suite habituelle.

## 20/11, 5 h : les 6 premiers scripts « BONNE IDÉE VS MAUVAISE IDÉE » (à valider)

- **Sa demande (20/11, 4 h 31, puis deux corrections à 4 h 33)** : nouveau format dès le lundi 23/11 sur le même compte ; 6 scripts tout de suite pour lundi 23 et mardi 24 (12 h 30 / 18 h / 21 h), pris dans les 20 sujets, Big Mo comme « grand », nos personnages validés, chaque verdict vérifié, la partie Stalak sur de vraies captures, rien de promis que le site ne fait pas. Le format s'appelle « BONNE IDÉE VS MAUVAISE IDÉE » (barre verte · VS · rouge, tampon « BONNE IDÉE » ou « MAUVAISE IDÉE ») ; la partie Stalak suit la section « L'explication de Stalak » du mode d'emploi (20 à 22 s, texte de base, 4 étapes Son, Prises, Paroles, Montage, rien de Pro présenté comme gratuit).
- **Lu** : `docs/marketing/FORMAT_BONNE_IDEE_VS_MAUVAISE_IDEE.md`, `docs/marketing/ANALYSE_FORMAT_DEBAT.md`, toute la collection `da` (86 lignes, dont la règle du 20/11), `docs/STATUS.md`, `docs/studio/STUDIO_STALAK.md`, `STALAK_CONTEXTE.md`.
- **Écrit** : fiches `videos/bonne-idee-01` à `06` (statut `script`, `format` « Bonne idée vs mauvaise idée », `compte` principal, champs en plus : `verdict`, `sujet`, `sources`, et `remplace` pour les 3 du lundi). Tableau, faits, sources et plan de fabrication : `docs/marketing/BONNE_IDEE_SUIVI.md`.
- **Les choix** :
  - 2 verdicts surprenants sur 6 (le feat à 0 abonné, le même refrain tous les jours) ; le Black Friday (27/11) pour l'actualité du premier.
  - « Acheter des abonnés » plutôt que « des vues » : les chiffres officiels de TikTok portent sur les faux abonnés.
  - Pas de narrateur ni de bandeau-titre T-Crazy : le format n'en a pas (la règle du 20/11 est la plus récente).
  - Partie Stalak : le texte de base, une seule retouche (la phrase des paroles avant celle des coupes, pour suivre les 4 étapes du site), dite au propriétaire.
  - Fonctions gratuites et Pro relues dans `src/markup.html`, `src/app.js` et la page Tarifs : les paroles collées et calées sont gratuites, la « Transcription auto » est Pro ; l'export gratuit garde le filigrane (plus de pub depuis le 6/11), donc le snippet de Big Mo et l'export montré le gardent aussi.
  - TikTok, Instagram et Spotify sont nommés (le texte de base du mode d'emploi dit « TikTok et Insta »), jamais dessinés avec leur logo.
- **Reste** : sa validation des scripts ; puis visuels (dessinés en code, vraies captures du site une seule fois pour les 6), feu vert, voix (environ 1 $ pour les 6 : les répliques communes une seule fois), vidéos, planches, miniatures, versions de publication.

## 19/11, après-midi : versions de publication (haute qualité) de tous les épisodes programmés

- **Sa demande (19/11, 13 h 17, urgent)** : les vidéos publiées sont floues sur TikTok, parce que les fichiers déposés dans Studio Stalak sont allégés (environ 1,5 Mbit/s, limite de 20 Mo) et que ce sont eux qui partaient dans Zernio. Pour chaque épisode programmé, puis pour chaque nouvel épisode : une version de publication déposée chez Zernio, son adresse dans le champ `videoHDUrl` de la fiche ; il remplace lui-même les fichiers dans Zernio. Règle complète : skill `stalak-videos-reseaux` (mis à jour) et `docs/STATUS.md`.
- **Nouvelle étape** `tcrazy.py <épisode> hd` → `<épisode>-hd.mp4` : H.264 High (niveau 4.1), 1080 × 1920, 30 images/s, deux passes à 11 Mbit/s en moyenne (12 au plus), AAC 192 kbit/s, `-movflags +faststart`, BT.709. Source : l'image de la version de la fiche (`video.mp4`, le master) et `mix.wav` ; `SERIE_HD_SRC` choisit un autre fichier du dossier de l'épisode. Environ 3 min par épisode, 85 à 112 Mo. Vérifié sur l'épisode 4 : image identique au master (PSNR 62 dB).
- **Dépôt chez Zernio** : `media_get_media_presigned_url` (`video/mp4`, avec la taille), puis envoi du fichier en PUT sur `uploadUrl` depuis l'espace de travail (`curl -T`, HTTP 200, 4 à 9 s), puis `validate_media` sur le `publicUrl` (fichier valide, sous les limites de TikTok et d'Instagram), puis `publicUrl` dans `videoHDUrl` (rien d'autre ne change sur la fiche).
- **Avant chaque export, la vidéo de la fiche comparée à celle du dossier de travail** (empreinte sha256 de la version allégée déposée) : identiques pour 2, 4 à 10 et 12 à 15. Deux exceptions :
  - 3 (« Le manager ») : la fiche a la version 2 validée (16/11, 20 h 40) ; le dossier de travail contient un rendu plus récent (20 h 58, sous-titres coupés autrement) qui n'a jamais été déposé. La version de publication est faite à partir de la vidéo de la fiche elle-même (identique à la version validée : PSNR 59 dB ; la version allégée est quasi identique au master, 43 à 46 dB, donc la qualité est la même) ;
  - 11 : la fiche a la version 1 validée ; le dossier contient la version au cri corrigé (pas encore validée sur la fiche). Version de publication faite à partir du rendu complet d'origine (`video_hf.mp4`), vérifiée contre la vidéo de la fiche.
- **Fait pour les 15 épisodes**, dans l'ordre de passage (4 et 7 d'abord : prévenu à 13 h 31), puis 2, 9, 3, 5, 6, 8, 10, 11, 12, 13, puis 14 et 15 (validés ce matin) et 1 (déjà publié et reposté à la main par le propriétaire, pour qu'il ait le fichier) : 82 à 106 Mo, 10,8 à 11,2 Mbit/s, chaque `publicUrl` vérifié par Zernio et écrit dans `videoHDUrl`. Rien d'autre n'a changé sur les fiches (statuts, vidéos de visionnage). Pour la suite : chaque nouvel épisode a sa version de publication dès son dépôt ; une vidéo corrigée a ses deux versions refaites (`videoUrl` et `videoHDUrl`) et le Chef de projet est prévenu par `progression.etape`.
- Les adresses `media.zernio.com/temp/…` sont celles que donne Zernio pour un envoi direct ; elles servent à créer ou modifier les publications.

## 18/11, nuit : épisodes 10 à 15 fabriqués ; cartes de fin des épisodes 7 et 8 refaites

- **Le calendrier du Chef de projet** (18/11, 18 h 15, programmé dans Zernio) : 19/11 : 1, GTA 6 (n° 3), 7 ; 20/11 : 2, 9, « Le manager » (n° 4) ; 21/11 : 5, 6, 8 ; 22/11 : 10, 11, 12 ; 23/11 : 13, 14, 15. Tableau à jour : `docs/marketing/SERIE_BIBLE.md`, « La semaine du 16/11 ».
- **Sa demande (18/11, 21 h)** : « vérifié si y'a des vidéos à creer » : les fiches 10 à 15 étaient en `visuels_ok`. **Ses réponses** : faire les voix sur le nouveau compte Flora (« Oui, utilise ce compte ») ; épisode 14 : garder « Dans cinq jours » ; refaire la carte de fin de l'épisode 8, puis de l'épisode 7 (« Oui, refais-la ») ; épisode 15 : « Prochain épisode : bientôt ». Il a aussi demandé de continuer (22 h 32 : « Tu continue les épisodes ? »). Pas de document `lots/2026-11-23` pour les épisodes 13 à 15 (datés du 23/11) : fabriqués à sa demande.
- **Cartes de fin, d'après sa règle « la carte de fin annonce la vidéo qui sort juste après »** :
  - 7 → « Il a passé la nuit sur sa vidéo de promo » (l'épisode 2, 20/11 à 12 h 30) ; 8 → « Son extrait a marché, mais le son n'est pas fini » (le 10, 22/11 à 12 h 30). Seule la carte de fin est refaite et recollée (`splice.py`, alignement vérifié sur les images d'avant), mêmes voix, même durée. Nouvelles vidéos, planches et miniatures sur leurs fiches, qui restent en `programme` ; l'ancienne vidéo est gardée dans `videoAvantCarteFin`. **À faire par le Chef de projet : remplacer ces deux vidéos dans Zernio** (7 : `zernioId` 6afdeae59d7cfe7047246089, le 19/11 à 21 h ; 8 : 6afdeb1f55040513d70014cf, le 21/11 à 21 h).
  - 11 → « Il a clashé le rappeur le plus connu du quartier » (le 12) ; 13 → « Il veut une caméra de pro pour le Black Friday » (le 14) ; 15 → « bientôt ». Le 10, le 12 et le 14 annonçaient déjà le bon.
  - Les épisodes 1 à 6 gardent leur carte (sa décision du 17/11). Avec ce calendrier, celle de l'épisode 2 (20/11) annonce GTA 6, sorti la veille : signalé au propriétaire, rien changé.
- **Épisodes 10 à 15 fabriqués** et déposés en `video` (vidéo, planche, miniature) ; le propriétaire a validé le 10 et le 11 le 19/11 vers 0 h 10 :
  - 100 voix générées une fois sur le texte validé (1,30 $), sur le nouveau compte Flora (l'ancien espace n'est plus accessible). Relues par transcription (Whisper « small », puis « medium » et la mesure des voyelles en cas de doute) : une réplique refaite (épisode 13, Liam disait « Eh » au lieu de « Une », 0,013 $) ; trois petits sons ajoutés par la voix au début d'une réplique coupés pour coller au texte (« Hum » de Big Mo et « Ah » de Maya dans l'épisode 12, « Ha ! » de Liam dans l'épisode 14) ;
  - durées : 10, 1 min 13,8 ; 11, 1 min 19,9 ; 12, 1 min 14,8 ; 13, 1 min 16,5 ; 14, 1 min 19,5 ; 15, 1 min 19,0 (règle : 1 min 05 à 1 min 20). Les épisodes 14 et 15 ont 19 répliques : pour rester sous 1 min 20 sans toucher au texte, leurs voix sont 3 % plus rapides et les écarts entre répliques un peu plus courts (`tempo`, `gap`, `cut` dans `tcrazy_eps.py`) ; les entrées en marchant gardent 2,1 s au moins ; l'épisode 11 a deux temps d'action un peu resserrés ;
  - épisode 15 : l'image de la prise devient blanche pile sur le « boum » de Deuce (1,85 s au lieu de 2,2 s dans le storyboard) ;
  - planches contact relues en entier (une image toutes les 0,5 s) avant chaque dépôt. Épisode 10 : 0 problème. Sur les autres, des lignes coupées au mauvais endroit (jamais une ligne finie par un petit mot, règle du 16/11) et des défauts d'image, corrigés dans la source ; seuls les plans touchés ont été refaits et recollés (`splice.py`, alignement vérifié), puis relus :
    - 11 : le cri de Deuce finissait une ligne par « et » (« T'as plus de voix et / on tourne demain ?! ») ; vu après le dépôt de la version 1, que le propriétaire a validée à 0 h 08 ; corrigé dans la source (`glue`) ; sa version corrigée (avec aussi « trois / prises ») est à faire à la reprise ;
    - 12 : le bandeau finissait une ligne par « LE » (« … LE RAPPEUR LE / PLUS CONNU… ») ; un sous-titre de Maya laissait « Commence » seul sur sa ligne : recoupé aux deux-points, ce qui ne suffisait pas, puis gardé sur une ligne (nouvelle règle de `frame.js` : une carte de deux lignes dont une n'a qu'un mot passe sur une ligne quand le texte tient dans une carte un peu plus large, 872 px au plus, loin des boutons de droite) ; un sous-titre de Deuce coupait le nombre (« Plus que trois cent / soixante-quatre. ») : écrit « Plus que 364. » ;
    - 14 : le bandeau coupait « BLACK / FRIDAY » ; dans la pub des promos, l'étiquette du prix cachait « Caméra pro » (étiquette passée dans le coin) ; un sous-titre coupait « et avec / l'argent » ; la carte de fin finissait une ligne par « UN » ; l'écran de Stalak disait « Tes vidéos » au-dessus des trois prises, au lieu de « Tes prises » comme dans tous les autres épisodes (corrigé aussi dans le 15 avant son rendu) ; sur la miniature, la pub (« BLACK FRIDAY », « 900 € ») était à moitié cachée derrière la tête de Nadia : c'est maintenant Nadia qui la tient devant elle, comme dans l'accroche ;
    - 13 : le cri (« … sur / ta fiche ») et le bandeau (« … SUR / SA FICHE ») corrigés avant le rendu ; sur la planche, pendant que Liam dit « Et j'ai mis “le prochain” entre parenthèses », son sous-titre cachait justement « RAPPEUR (le prochain) » sur la fiche que Nadia tient à la taille : la fiche passe en gros plan au-dessus de la cuisine assombrie, comme les téléphones (Nadia ne la tient plus pendant ce plan) ; un sous-titre de Maya séparait « trois / fois » ;
    - 15 : la sangle du sac de Nadia partait de son visage (un trait noir en travers, de 0:21 à 0:28) : remplacée par une poignée courte au-dessus du sac ; un sous-titre du narrateur finissait une ligne par « d'une » (« … passe d'une / prise… », la seule coupure qui tenait en deux lignes) : coupé en trois lignes ;
    - nouvelles règles de `frame.js` (titres, cartes de fin, sous-titres) : jamais de coupure juste après un petit mot élidé (« d'une », « l'un ») ni juste après un nombre, qui reste avec ce qu'il compte (« trois / prises », « vingt / personnes », « Zéro / abonné ») ; sur les épisodes 12, 13 et 14, les sous-titres ainsi coupés ont été refaits (« … de vingt / personnes », « Tu te filmes trois / fois… », « Voici Liam. 15 ans. Zéro / abonné… ») ;
    - nouvel outil `tools/serie/check_lines.py` : il passe chaque bloc de texte d'un épisode (bandeau, cri, sous-titres, carte de fin) dans le moteur lui-même et signale une ligne finie par un petit mot, un nombre ou un petit mot élidé, ou un mot seul sur sa ligne ; à lancer avant chaque rendu. Avec lui (et une vérification des 304 sous-titres avec les règles du moteur au moment où chaque plan a été rendu), 12 à 15 : plus rien après les derniers recollages. Dans les épisodes déjà validés, il reste : 7 : le bandeau « SON POTE A IMPRIMÉ DES / TEE-SHIRTS… », « Solution : cent / tee-shirts », « les trois / prises » ; 8 : le bandeau « … À 17 H ET IL / DEVAIT… », « Zéro / abonné », « tes trois / prises » ; 9 : le cri « Tu rappes sur / moi ?! », « à six / heures », « gratuitement. » seul sur sa ligne ; 10 : « à trois / heures », « quatre / heures », « trois / fois » ; 11 : le cri (« voix et / on tourne »), « tes trois / prises ». Corrigé dans la source (bandeaux 7 et 8, cri du 9 : `storyboard.js`, `tcrazy_eps.py`) et refait (seuls ces plans, mêmes voix, même durée, 0 $). **Sa réponse (19/11, vers 2 h 35) : « Oui, toutes »** : les versions corrigées remplacent les versions validées sur les fiches (statut inchangé, l'ancienne vidéo gardée dans `videoAvantCorrection`) : faites pour 13, 7 et 9 (relues sur la planche) ; **8, 11 et 10 à la reprise** (la pause est tombée pendant le recollage du 8 ; leurs fiches gardent la version validée) : `tcrazy.py <épisode> hfproject`, puis `splice.py` avec les plans 0 1 2 9 et le dernier pour le 8 (la carte de fin du 18/11 est dans le dernier), 0 et 10 pour le 11, 2 6 8 pour le 10, puis `mux`, `sheet`, `deliver`, `thumb`, relire les plans changés, déposer et remplacer sur les fiches. Les voix et rendus sont dans le dossier de travail de cette session (`$SERIE_WORK`), pas dans le dépôt : s'il est effacé, ces trois corrections demanderaient de refaire des voix (payant), les versions validées restent valables ; **pour 7, 8 et 9, déjà programmés, le Chef de projet doit remplacer les vidéos dans Zernio** (la 7 sort le 19/11 à 21 h) ;
  - incidents de la nuit, rien de perdu : le disque de la machine s'est rempli (rendus des épisodes 13 et 15 et un recollage du 12 arrêtés : fichiers temporaires effacés, 12 Go libérés, rendus relancés) ; la file des rendus a atteint sa durée maximale (relancée) ; le recollage du 13 a manqué de mémoire (6 Go : l'outil gardait trop d'images à la fois) : `splice.py` recolle maintenant les morceaux un par un, et il est ajouté au dépôt ; enfin, un recollage repart toujours du rendu complet : les corrections d'un épisode se recollent en une seule fois (sur le 12, un recollage partiel avait remis d'anciens sous-titres : refait d'un coup, planche relue) ;
- Fichiers : `tools/serie/episodes/tcrazy_eps.py` (épisodes 12 à 15 ; par épisode, des mots gardés ensemble dans le cri et les sous-titres, `glue`, dont le cri du 9, et un sous-titre coupé à la main, `subs`), `tools/serie/engine/storyboard.js` (cartes de fin 7, 8, 11, 13 et 15 ; dates de sortie ; le flash de farine ; bandeaux 12, 13 et 14 ; la pub des promos ; « Tes prises » dans 14 et 15 ; la fiche en gros plan dans le 13 ; la poignée du sac de Nadia dans le 15 ; bandeaux 7 et 8 ; la miniature du 14), `tools/serie/tcrazy.py` (tempo, écarts et coupes réglables par épisode ; `glue` et `subs`), `tools/serie/engine/frame.js` (une carte de sous-titre avec un mot seul sur une ligne passe sur une ligne quand elle tient ; jamais de coupure juste après un nombre ni après un petit mot élidé), `tools/serie/splice.py` (nouveau dans le dépôt : refaire seulement quelques plans d'un épisode et les recoller dans le rendu complet), `tools/serie/check_lines.py` (nouveau : vérifier toutes les lignes de texte d'un épisode avant le rendu).
- Coût du 18/11 : 1,313 $ de voix ; 19/11 : 0 $ (les corrections ne refont que des images, avec les mêmes voix). Solde Flora le 18/11 à 23 h 15 : environ 5,60 $.
- Ensuite : sa validation des épisodes 14 et 15 dans Studio Stalak ; à la reprise, les versions corrigées de 8, 11 et 10 ; la programmation de 10 à 15 par le Chef de projet ; le premier épisode de la semaine prochaine (la carte de fin du 15 dit « bientôt »).
- Skills : `stalak-videos-reseaux`, `stalak-da`, `planche-contact`, `hyperframes`.

## 17/11, 6 h 45 : épisodes 7, 8 et 9 fabriqués ; storyboards 12 à 15 déposés

- **Ses réponses** : les 9 scripts validés (4 h 55) ; les numéros des 6 épisodes validés ne changent pas (« Non, garde-les telles quelles ») : les nouveaux sont 7 à 15 dans l'ordre de sortie, et leur carte de fin annonce la vidéo qui sort juste après ; les storyboards 7 à 11 validés (5 h 18).
- **Feu vert** : `lots/2026-11-16` est à `true` (donné le 16/11 pour 5 vidéos) et les fiches 7 à 11 sont en `visuels_ok` : la fabrication a commencé, coûts annoncés avant chaque génération.
- **Épisodes 7 (« Les tee-shirts », 18/11 18 h) et 8 (« Nuit à 17 h », 18/11 21 h) fabriqués** et déposés en `video` (vidéo, planche, miniature) :
  - 36 voix générées une fois sur le texte validé (0,468 $), relues par transcription (Whisper « small ») : 2 répliques de l'épisode 7 mal dites (M. Reyes : « Pour » au lieu de « Pas » ; Maya : « Orion » au lieu de « Rien ») refaites (0,026 $) ; un « Ha ! » ajouté par la voix au début d'une réplique de Liam coupé ;
  - durées : 1 min 19,8 et 1 min 16,8 (règle : 1 min 05 à 1 min 20). Pour rester sous 1 min 20, l'épisode 7 a des temps d'action un peu resserrés (le départ de M. Reyes, les prises, la publication), mais l'entrée de Maya garde ses 2,1 s (remarque sur l'épisode 3 : « trop rapide ») ;
  - planches contact relues en entier (une image toutes les 0,5 s). Relevé sur l'épisode 8 : sous le lampadaire, Liam ne paraissait pas orange, alors que le narrateur le dit et que Maya le lui demande. Corrigé avec une nouvelle option `sodium` des personnages (`frame.js`, la lumière orange du lampadaire), rendu refait et planche relue : 0 problème restant.
- **Épisode 9 (« Le cahier de rap », 19/11 21 h)** : 16 voix (0,208 $), relues ; 1 min 16,3 ; planche relue (0 problème), déposé en `video` avec sa miniature.
- Le 17/11 vers 6 h 10, la machine a redémarré pendant le rendu : rien de perdu (le dossier de travail est resté), le rendu des épisodes 8 et 9 a été relancé.
- **Épisodes 10 et 11 (20/11)** : storyboards validés, voix pas encore faites : le solde Flora (environ 0,13 $ après l'épisode 9, partagé avec la série LEVELS) ne suffit pas (0,40 $ pour les deux). **Il faut recharger Flora** : environ 1,30 $ pour finir la semaine (10 à 15).
- **Storyboards 12 à 15 déposés** (statut `visuels`) :
  - 12 : corrigé avant dépôt : on voit le téléphone de Big Mo sur le banc pendant toute la scène, l'écran de Stalak montre le vrai bouton de l'appli (« Générer le pack », et non « Programmer » : Stalak ne publie pas à ta place) ;
  - 13 : légendes raccourcies, le carton « Le lendemain, au coucher du soleil · le toit » tient dans l'image (taille réduite automatiquement quand un carton est trop long) ;
  - 14 (« Le Black Friday ») : dessiné ; la cuisine le soir au lieu du salon (pas dans les décors choisis), une pub de caméra sans marque, la boîte de baskets vide de Deuce ;
  - 15 (« Les effets spéciaux ») : dessiné ; Liam blanchi par la farine (nouvelle option `flour` des personnages), le nuage dans le rayon de soleil, les balais de Nadia, Stalak réglé sur « Nerveux ». Carte de fin : « LA SEMAINE PROCHAINE », en attendant son choix du premier épisode de la semaine prochaine.
- Fichiers : `tools/serie/episodes/tcrazy_eps.py` (plans, temps et directions de jeu des épisodes 7, 8 et 9), `tools/serie/engine/storyboard.js` (épisodes 12 à 15, carton qui s'ajuste), `tools/serie/engine/frame.js` (option `flour`).
- Épisodes 10 et 11 : plans, temps et jeu déjà écrits dans `tcrazy_eps.py`, demandes de voix prêtes (`prompts`) : il ne reste qu'à générer les voix (0,403 $) puis lancer le rendu.
- Ensuite : les voix des épisodes 10 et 11 dès que Flora est rechargée ; 12 à 15 après validation de leurs storyboards.
- Skills : `stalak-videos-reseaux`, `stalak-da`, `planche-contact`, `hyperframes`.

## 17/11, 5 h : 9 nouveaux scripts pour avoir 3 vidéos par jour (à valider)

- **Sa demande (17/11, 3 h 57)** : « on a pas nos 3 vidéos par jours sur la semaine, commence à me créer les scripts ».
- **9 scripts écrits et déposés dans Studio Stalak** (`tcrazy-ep7` à `tcrazy-ep15`, statut `script`, onglet « À valider »), pour les créneaux de 18 h et de 21 h, du 18 au 22/11. Les 6 épisodes validés gardent leur jour et leur créneau de 12 h 30 ; GTA 6 reste le 19/11 à 18 h (son créneau 2). Rien le 17/11 : un script passe par sa validation, puis celle du storyboard, avant la fabrication.
- Ordre de sortie, numéros, bandeaux, cris et cartes de fin : tableau « La semaine du 16/11 » de `docs/marketing/SERIE_BIBLE.md`. Les 9 : « Les tee-shirts » (n° 2), « Nuit à 17 h » (3), « Le cahier de rap » (6), « L'extrait de 3 h du matin » (8), « La voix perdue » (9), « Le clash au terrain » (11, celui qu'annonce déjà la carte de fin du « Clip façon GTA »), « La fiche d'orientation » (12), « Le Black Friday » (14), « Les effets spéciaux » (15).
- Chaque script suit les règles de « Mes goûts » (85 lignes relues le 17/11) : un cri qui choque ou pose une question, celui qui crie au centre ; un bandeau descriptif jusqu'à la première phrase du narrateur ; tout est sous-titré avec le nom ; un carton et le noir à chaque changement de lieu ou d'heure ; celui qui arrive entre en marchant et dit bonjour ; un seul décor à la fois ; des lumières réalistes ; Stalak dans la deuxième moitié (sauf « Le clash au terrain », dont l'histoire est le secret de Big Mo) ; Liam qui parle de SA galère à celui qui regarde ; la carte de fin avec le prochain épisode dans l'ordre de sortie. Les cris sont répartis (Nadia 3, Liam 3, M. Reyes, Big Mo, Deuce), et les lieux varient d'un créneau à l'autre.
- Durée estimée : 1 min 14 à 1 min 17 chacun (l'estimation du pipeline par réplique, `(0,3 + caractères / 15) / vitesse`, plus environ 13 s d'images, recalée sur les 6 épisodes validés).
- Ce que montre Stalak, vérifié sur la page Tarifs et dans l'app (`src/markup.html`) : le montage automatique sur les temps (toutes les formules), les paroles à l'écran collées puis calées au tap (gratuit), le filtre Noir & blanc (gratuit), le Rythme « Nerveux » (« coupes rapides, jusqu'à chaque temps », gratuit), les vidéos illimitées en gratuit, et une fois Creator Plus, avec ce qu'il fait vraiment (packs de 5 à 30 vidéos aux coupes différentes, à partir de 2 playbacks). Les effets sur les drops ne sont pas utilisés : ils viennent du mode Clip, exporté avec Pro.
- Actualité : le Black Friday (vendredi 27/11, cinq jours après l'épisode du 22/11) ; la nuit qui tombe vers 17 h en novembre (coucher du soleil vers 17 h 05 à Paris le 19/11). Aucune marque, aucun vrai artiste.
- Continuité : Deuce est « son pote » avant « Le manager » (n° 7), puis « son manager ».
- Coût : 0 $ (des scripts). Voix prévues : 152 répliques, environ 2 $, générées seulement après sa validation et son feu vert (celui de `lots/2026-11-16` couvrait 5 vidéos). **Solde Flora le 17/11 à 4 h 50 : 0,84 $**, de quoi faire les voix d'environ 4 épisodes : il faudra recharger au moins 1,20 $ (2 $ pour garder de la marge) avant la fabrication des 9.
- **Question posée au propriétaire (réglée à 5 h : il garde les numéros)** : changer, sur les 6 épisodes validés, le numéro à l'écran (2, 3, 4, 5 et 6 deviennent 4, 5, 7, 10 et 13) et la carte de fin des épisodes 1, GTA 6, « Le manager » et « L'appli a fermé » (qui annonçait « … »). Seulement du texte : le premier plan, la carte de fin et la miniature refaits et recollés, 0 $.
- Fichiers : `tools/serie/episodes/scripts_semaine_16-11.py` refait les 9 fiches telles qu'elles ont été déposées (vérifié : identiques), `tools/serie/episodes/estimer_duree.py` estime la durée parlée d'un script. Une fois que le propriétaire modifie une fiche, c'est Studio qui fait foi.
- Ensuite, après sa validation : les storyboards (statut `visuels`), puis les voix et le rendu, en commençant par les deux épisodes du 18/11.
- Skills : `stalak-videos-reseaux`, `stalak-da`, `hook-generator`, `reels-scripting`.

## 16/11, 23 h : épisodes 1, 2 et GTA 6 déposés avec les lumières ; épisode 6 fabriqué ; titres coupés en lignes égales

- **Épisodes 1, 2 et GTA 6 refaits et déposés** dans Studio Stalak (statut `video`, tour + 1) : ils étaient validés, le propriétaire a dit oui pour les refaire avec les lumières (21 h 21), ils sont donc à revalider. L'ancienne version de chaque fiche est gardée dans `videoAvantLumieres` (vidéo, planche, miniature, durée).
- **Planches contact** (une image toutes les 0,5 s) relues en entier pour les 4 vidéos, environ 600 images. Relevé et corrigé : les titres et cartes de fin avec un mot seul en fin de ligne (épisodes 1 et 2) ; dans l'épisode 6, le téléphone de l'accroche cachait le visage de Liam (règle « celui qui crie est au centre, rien ne cache son visage ») : il est maintenant tenu plus bas, à côté de lui ; et le bandeau partait avant la première phrase du narrateur (Liam parle une fois de plus avant lui) : il reste maintenant jusqu'au narrateur, sans bouger à la coupe (`data-cont`, `anim.js`). 0 problème restant, à part la carte de fin de l'épisode 6 qui attend son choix.
- **Titres, cartes de fin et sous-titres coupés en lignes égales** (`wrapEven`, `frame.js`) : même nombre de lignes qu'avant, jamais une ligne finie par un petit mot, de préférence après un point ou une virgule ; « PROCHAIN ÉPISODE : » sur sa propre ligne. Relevé sur les planches : « SA MÈRE A CRIÉ EN PLEINE / PRISE », « IL A PASSÉ LA NUIT SUR SA / VIDÉO DE PROMO », « IL SORT SON SON LE / JOUR DE GTA 6 ». Pour les épisodes 1 et 2, déjà rendus, seuls le premier plan et la carte de fin ont été refaits et recollés image par image ; GTA 6 et l'épisode 6 sont rendus avec. Le storyboard de l'épisode 6 est redéposé avec les nouvelles coupes (même contenu).
- **Épisode 6 (« Triller n'est plus sur l'App Store ») fabriqué**, après la validation de son storyboard (`visuels_ok`, 21 h 40) et avec le feu vert de la semaine (`lots/2026-11-16`) :
  - 19 voix, générées une seule fois (0,26 $ au plus : le filtre de Flora a bloqué une fois la phrase du narrateur, relancée telle quelle) ; voix relues par transcription automatique, un « Oh oh ! » ajouté par la voix avant « On dirait un vrai clip ! » est coupé ;
  - écrans animés : le snippet qui joue puis se fige, la caméra de Stalak (3, 2, 1, puis enregistrement), le montage dans Stalak (les prises entrent, puis le clip coupé sur le temps, petit logo de la version gratuite, autocollant « hype »), la publication avec les deux « a aimé ta vidéo » et le commentaire d'un inconnu ;
  - Liam rappe sur la musique pendant les prises (`rap: 'liam'`), Maya arrive en marchant dans la prise 2 ;
  - 1 min 20 (la limite) ; déposé en `video`, avec sa planche et sa miniature (Liam et Maya).
- **À décider par le propriétaire** : le prochain épisode annoncé par la carte de fin de l'épisode 6 (aujourd'hui « PROCHAIN ÉPISODE : … ») et par celle de l'épisode 5 (« Le clash au terrain », qui n'existe pas encore). Changer une carte de fin coûte 0 $ et environ 3 min (seul ce plan est refait).

## 16/11, 21 h 30 : ses réponses ; épisodes 1, 2 et GTA 6 refaits avec les lumières ; storyboard de l'épisode 6

- **Ses réponses (21 h 21)** : on garde « Le manager » validé (la version aux sous-titres mieux coupés n'est pas utilisée) ; on refait les épisodes 1, 2 et GTA 6 avec les lumières ; on lance l'épisode 6.
- **Lumières de tous les décors des pilotes** (`lights.js`) : la chambre de Liam (jour : le soleil à travers les stores, des bandes de lumière au sol ; nuit : la bande LED, les écrans et la lune, la nuit tombe aussi sur les personnages), la cuisine (la fenêtre, le robinet, les poignées du frigo, l'horloge), le couloir du lycée (plafonniers, « SORTIE » vert qui grésille). Un décor montré en bande (`band()`) a ses lumières.
- **Épisodes 1, 2 et GTA 6 refaits** (rendu HyperFrames) : la règle « personne n'apparaît d'un coup » s'applique aussi : dans l'épisode 1, Nadia arrive en marchant avant de parler ; dans l'épisode GTA 6, Maya arrive en marchant. L'épisode 1 passe aussi par le noir à chaque changement de moment (la v4 qui attendait son accord). Durées : épisode 1 1 min 19, épisode 2 1 min 01, GTA 6 1 min 20.
- **Épisode 6, storyboard** (`storyboard.js`, `ep6`, 17 plans, `univers.py storyboard ep6`) déposé dans Studio Stalak, fiche en `visuels`. Écrans dessinés : la recherche « Triller » sans résultat (aucun logo de magasin ni de Triller), l'ancien snippet qui se fige et devient gris, la caméra de Stalak (« PRISE 1 », point rouge, 3), le clip monté avec le petit logo de la version gratuite (`stalakApp({ wm: true })`), le fil avec les cœurs et le commentaire d'un inconnu. Prises au terrain : `takeScene('terrain')` et `'terrain-maya'`. Deuce et Maya sont debout près de l'épicerie : pas encore de pose assise. La carte de fin laisse le prochain épisode à choisir.

## 16/11, 20 h : lumières réalistes et HyperFrames pour toute la série, « Le manager » v3, « Le clip façon GTA » v2

- **Sa remarque globale sur « Le manager » (19 h 32), pour toutes les vidéos à venir** : « Je veux que les lumières soient plus réalistes : si y'a une lumière, y'a un halo lumineux, si y'a un truc qui brille… Hésite pas à utiliser internet. Utilise aussi HyperFrames. »
  - `engine/lights.js` (nouveau) : un réglage de lumière par décor et par heure. `under` est dessiné avec le décor, derrière les personnages (soleil, lampes, enseigne qui grésille, reflets des vitres, scintillements du décor) ; `over` passe par-dessus tout le monde (couleur de l'heure, lueur large des lumières fortes, rayons, reflets de l'objectif). Fait pour la rue (jour, après-midi, coucher) et le terrain (jour, après-midi).
  - Ce qui brille porte la classe `shiny` (boucles d'oreilles, lunettes de soleil, chaîne de Big Mo, sachets de glaçons, objectif du téléphone, vitres du bus), un écran la classe `screen` : `LIGHTS.attach` y pose un scintillement à la bonne taille. Ombre douce sous les pieds de chaque personnage.
  - La rue a un lampadaire (éteint le jour, allumé le soir) et une heure `coucher` : soleil derrière les maisons, vitrine et fenêtres allumées.
  - `anim.js` : nouvelles actions `tw` (scintille), `flk` (grésille), `sweep` (reflet qui passe), `walk` (marche, avec le corps qui balance), `tilt` (chute).
  - **HyperFrames** : étape `hf` de `tcrazy.py`. Le projet est construit dans le dossier de travail (`<ep>/hf/`), notre moteur en est le runtime (`hf-seek`, timeline GSAP enregistrée), avec deux éléments du catalogue installés à la volée (jamais dans le dépôt) : `organic-light-leak-overlay` à chaque passage par le noir et `vignette` le soir. Rendu avec `HYPERFRAMES_BROWSER_PATH` pointé sur le Chrome de Playwright (HyperFrames ne peut pas télécharger le sien ici), environ 12 à 15 min par épisode. `npx hyperframes check` passe (restent des alertes de contraste sur les textes du décor et des ombres de texte voulues).
  - Internet : rien de plus n'a été nécessaire (tout est dessiné en code, GSAP vient du CDN pour les éléments du catalogue).
- **« Le manager » v3 (ses 2 remarques)** : Big Mo arrive en marchant avec ses suiveurs, Liam (d'abord tranquille, puis tout content) dit « Wouah, c'est Big Mo, le rappeur le plus connu de chez moi ! », ils échangent, Big Mo repart en marchant. Liam, seul et dégoûté : « Trois clips en un matin… Mais comment il fait ? » (réplique ajoutée par Marketing pour qu'on comprenne, à valider avec la vidéo), puis il s'effondre. Maya arrive en marchant, s'arrête, son étiquette apparaît, puis elle parle. 1 min 14. Script de la fiche passé en version 3, voix renumérotées (rien n'est repayé), 2 voix nouvelles : 0,026 $.
- **« Le clip façon GTA » v2 (ses 2 remarques)** : le rêve de Deuce est plus petit et coupé au bord de la bulle ; les 12 cases de la galerie montrent chaque prise dans son décor ; le soir est la rue au coucher du soleil (lumière sur les personnages aussi) ; Maya arrive en marchant (sa remarque sur « Le manager » vaut pour toute la série). 1 min 05.
- Sous-titres : un morceau trop court (« Pas mal. », 0,3 s) est recoupé avec son voisin ; sur une carte, plus de mot seul sur la dernière ligne (« de GTA » / « 6. » devient « Il a vu la bande-annonce » / « de GTA 6. »).
- Planches contact : relues en entier pour les deux vidéos (une image toutes les 0,5 s) ; les mots seuls en fin de carte relevés sur la première version sont corrigés et les deux vidéos refaites, 0 problème restant.
- **Studio Stalak** : « Le manager » déposé en v2 (tour 2) à 20 h 40, **validé par le propriétaire à 21 h 05**. « Le clip façon GTA » déposé en v2 (tour 2) à 21 h 16, en `video`. Les 4 remarques sont `traitée`, chacune avec sa réponse. L'ancienne version de chaque vidéo est gardée dans `videoV1`.
- Après sa validation, une version de « Le manager » aux sous-titres mieux coupés a été rendue (même image, seules les cartes changent : « Voici Deuce, le meilleur / pote de Liam. » au lieu de « … pote de / Liam. »). Elle est dans le stockage de la page, mais **ne remplace pas la vidéo validée** : à lui de dire.
- **À décider par le propriétaire** :
  - remplacer « Le manager » validé par la version aux sous-titres mieux coupés ?
  - refaire avec les lumières les épisodes déjà validés (1, 2 et GTA 6) ? (0 $, environ 15 min de rendu chacun) ;
  - la réplique ajoutée de Liam (« Trois clips en un matin… Mais comment il fait ? ») : validée avec la vidéo ;
  - la suite : le storyboard de l'épisode 6 (script validé à 19 h 37).

## 16/11, 18 h 45 : version 3 (ses remarques sur les épisodes 1, 2 et GTA 6), « Le manager » et « Le clip façon GTA » fabriqués, script de l'épisode 6

- **Épisode 1 : validé par le propriétaire (v3, 16 h 52).** Ses 3 remarques du 2e tour sont faites : Nadia au centre dès la première image, le texte de 0:18 en sous-titre normal, Maya derrière la vitre. Une v4 existe aussi, avec le passage par le noir à chaque changement de moment, mais **elle n'est pas déposée**. On ne remplace pas une vidéo validée sans son accord (question posée).
- **Sa règle (16 h 04) : « un enfant doit pouvoir comprendre »**, pour toutes les vidéos (`regle-comprendre-enfant` dans « Mes goûts »). Appliquée à toute la série :
  - chaque changement de moment ou de lieu passe par le noir (`dip=True`), avec son carton lu avant la première réplique ;
  - la lumière reste celle du moment : le matin en plein jour, la nuit jusqu'au carton suivant ;
  - un seul décor à la fois ;
  - on voit qui prend le téléphone avant son écran ;
  - les écrans bougent pour qu'on comprenne l'action.
- **Épisode 2 : version 3 (ses 8 remarques).**
  - blancs coupés à 0:08, 0:27 et 1:01 ;
  - l'écran de l'ordi est animé : Liam fait glisser sa vidéo pour mettre chaque bouche ouverte en face de son mot, et « DÉCALÉ » revient à chaque « Non » ;
  - la publication est montrée : il prend son téléphone, appuie sur « Publier », voit « Vidéo publiée ! », puis la notification de maya et son commentaire ;
  - tout reste de nuit après « SIX HEURES PLUS TARD » ;
  - le « Non. » de Maya est refait : elle disait « ouais ». Il y a eu 2 essais et le bon est gardé, vérifié sur la voyelle.
- **Épisode GTA 6 (n° 3) : version 2 (ses 2 remarques).**
  - un seul décor à la fois : le couloir du lycée vide, puis le terrain vide où roule une boule d'herbes sèches, avec un coup de vent ;
  - le téléphone montre un fil façon TikTok, sans logo : il publie son son avec juste une image fixe, et tout reste à 0 (cœur, commentaires, partages, « 0 écoute »).
- **« Le manager » (n° 4) et « Le clip façon GTA » (n° 5) : fabriqués** avec toutes les règles :
  - celui qui crie est au centre (les sachets portés plus bas, son visage reste visible) ;
  - le téléphone qu'on voit sortir ;
  - Liam qui tombe sur le trottoir (avant, il flottait devant la vitrine) ;
  - le passage par le noir.
- **Pas de blanc, mais une durée plus courte.** Le propriétaire ne veut pas de blanc (« il faut cut à ce moment la séquence »). `plan` n'ajoute donc plus que 0,15 s avant une réplique et 0,2 s après. Le temps vient des actions qu'on voit : la publication, le clip qui joue sur le rythme, la boule d'herbes. Résultat, les épisodes durent un peu plus d'une minute :
  - épisode 2 : 1 min 00,6 ;
  - manager : 1 min 01 ;
  - clip façon GTA : 1 min 01 ;
  - GTA 6 : 1 min 18.

  **Question posée au propriétaire** : sa règle dit 1 min 05 au moins. Pour y arriver sans blanc, il faut ajouter une ou deux répliques par épisode, ce qui veut dire un script à revalider et environ 0,03 $ de voix par épisode.
- **Moteur** :
  - `anim.js` : les actions d'un plan, `K({...})`, en secondes depuis son début ;
  - `storyboard.js` :
    - `editor()` animé ;
    - `publish()` : la page « Nouvelle vidéo », le doigt, « Vidéo publiée ! » ;
    - `feed()` : un fil façon TikTok, sans logo ;
    - `notifTop()`, `comments()`, `tumbleweed()`, `stillPic()`, `myClip()` ;
    - `phoneBig(…, {dl})` : le téléphone arrive après qu'on a vu qui le tient ;
  - `frame.js` : le zoom d'un décor ne dépasse plus ses bords (une bande noire de 248 px apparaissait en bas du plan où Liam tombe, dans « Le manager ») ;
  - `tcrazy.py` : petites pauses seulement, et `fixed=True` pour un plan aux actions calées sur la voix.
- **Épisode 6, « L'appli a fermé » (l'idée du propriétaire du 16/11, 17 h 27)** : le script est dans Studio Stalak (`tcrazy-ep6`, `script`, le 22/11 à confirmer). Choix faits, écrits en tête du script pour sa validation :
  - l'appli qui ferme n'est pas nommée : aucun concurrent cité, et Triller n'a pas fermé officiellement (retiré du Nasdaq, l'appli ne charge plus les vidéos) ;
  - « installer » devient « aller sur stalak.app » : rien à télécharger ;
  - Deuce filme avec la caméra de Stalak (le son passe après le décompte) ;
  - Liam publie lui-même sur TikTok, car la publication directe n'existe pas encore ;
  - Stalak arrive vers le milieu, car l'histoire est sa découverte.

  18 répliques à générer après validation, environ 0,23 $. **À décider avec lui** : la carte de fin de l'épisode 5 annonce « Le clash au terrain ». Elle annoncera celui-ci s'il sort le 22.
- **Coûts du 16/11 après 16 h** :
  - épisode 2 : 0,039 $, puis 0,026 $ pour le « Non » ;
  - GTA 6 : 0,078 $ ;
  - manager : 0,143 $ ;
  - clip façon GTA : 0,156 $.
- Skills utilisés : `stalak-da`, `stalak-videos-reseaux`, `planche-contact`.

## 16/11, 16 h 10 : version 2 de toute la série (les remarques du propriétaire sur l'épisode 1)

- **La fabrication (13 h 45 → 15 h 20).** Feu vert donné (`lots/2026-11-16`). Voix réplique par réplique (« réplique par réplique mais faut que ça reste réaliste »), Liam ×1,1. Ordre de sortie confirmé : « ordre comme tu veux mais je veux celle sur GTA 6 le 19 ». Épisodes 1 et 2 fabriqués, relus sur planche contact et déposés (`video`, avec `miniatureUrl` et `plancheUrl`). L'épisode GTA 6 était à 85 % quand le propriétaire a tout arrêté (15 h 23).
- **Ses 10 remarques sur l'épisode 1** (salle de visionnage, note de `tcrazy-ep1`, ajoutée seule à « Mes goûts ») et sa demande : « applique tout ça sur les prochaines et même celle que tu m'as déjà envoyée ». C'est noté comme règle générale : `regle-remarques-toute-serie`. Ce qui est fait :
  1. **Musique de la galère** : « Scars » retirée (trop sérieuse, trop triste). 4 musiques « dessin animé » sans Content ID proposées dans `musique-galere`. Le propriétaire a finalement envoyé la sienne : « Urban Hip Hop » (alex_makemusic, Pixabay 351577). **Elle a le bouclier Content ID** : il a choisi de la garder quand même (question posée à 16 h 01). Certificat pour contester une réclamation : https://pixabay.com/music/351577/license/. Elle est ajoutée comme option E de la fiche ; `choix` n'est pas touché.
  2. **Les cris s'écrivent en grand**, mot par mot, vers le milieu ou le haut de l'écran, avec le nom à côté, puis retour aux sous-titres : `FRAME.cri` (frame.js), `kind: 'cri'` dans le plan (tcrazy.py, réplique marquée « (crie) » dans le script), animation dans anim.js. Les plans des cris sont recadrés pour ne couvrir ni le bandeau ni un visage.
  3. **L'accent de « ÉPISODE »** ne touche plus le titre du bandeau (frame.js, style 2 : plus d'espace entre les deux lignes).
  4-6. **Ses 3 répliques**, reprises mot pour mot : « Maman, on t'entend dans mon enregistrement ! », « Il réécoute. Et au final, le cri de sa mère sonne plutôt bien dans sa musique. », « Wouah, ça tue ! Je vais le garder dans mon refrain ! ».
  7-8. **Les transitions** : un carton à chaque changement de lieu ou de moment (`carton`), un bonjour et une étiquette avec le rôle pour qui arrive (« MAYA, LA VOISINE »), « TOC TOC ! » à la fenêtre (`knock`, avec un bruit de coups fait en code). Dans l'épisode 1, Liam fait la vaisselle (sa mère l'a demandé), sort son téléphone, et le narrateur dit pourquoi il lui faut un clip. Même travail dans les 4 autres épisodes.
  9. **L'écran de Stalak est dessiné par nous** (`stalakApp`, storyboard.js) avec un exemple fait des vidéos de Liam : son son et ses prises entrent, « Montage du clip… », puis le clip passe d'une prise à l'autre toutes les 2 temps de la musique (tempo mesuré avec librosa, `beats_of`), la bouche de Liam bouge sur le rythme. Les options montrées sont celles de l'app. Plus aucune vraie capture ni image du propriétaire (`stalakScreen` supprimé). HyperFrames n'était pas nécessaire : tout est dans le même moteur que la série.
  10. **Les voix sont plus rapides** : narrateur ×1,35, Nadia et Maya ×1,15, Deuce ×1,25, M. Reyes ×1,2, Big Mo ×1,15, Liam ×1,1 inchangé. Les pauses dans une réplique ne dépassent plus 0,3 s (`squeeze`). Rien à régénérer pour ça.
- Aussi : sous-titres d'une phrase entière quand elle tient, calés sur les pauses de la voix (`chunks`, `chunk_times`) ; l'écran partagé de l'épisode GTA 6 remplit toute la largeur ; dans l'épisode du manager, le clap « PRISE 12 » passe sur le plan du chien.
- **Les 5 scripts v2** (en tête de chaque script, la liste de ce qui change ; répliques nouvelles marquées « (nouveau) ») : validés par le propriétaire à 15 h 40-15 h 43. **Les 5 storyboards v2** : déposés à 16 h 02 (`visuels`), avec 2 images en grand pour l'épisode 1 (le cri, l'écran de Stalak).
- Les anciennes vidéos des épisodes 1 et 2 sont retirées des fiches (gardées dans `videoV1`) pour ne pas embrouiller « À valider ».
- Voix à générer après la validation des visuels : seulement les répliques nouvelles, 39 en tout (épisode 1 : 7, épisode 2 : 3, GTA 6 : 6, manager : 11, clip façon GTA : 12), soit environ 0,51 $. Les répliques inchangées sont gardées (`prompts` saute une réplique déjà enregistrée). Épisode du manager : M. Reyes et Big Mo gardent les essais choisis.
- Skills utilisés : `stalak-da`, `stalak-videos-reseaux`, `planche-contact`.

## 16/11, 14 h 15 : les storyboards des 5 épisodes

- À 13 h 40, le propriétaire a validé les 5 scripts (« j'ai validé c'est bon », fiches en `script_ok`).
- **Étape « visuels » faite pour les 5 épisodes.** Chaque storyboard montre une image par moment du script (12 ou 13 plans), avec les personnages, les décors, le bandeau et les sous-titres choisis. Une planche par épisode est déposée dans le champ `visuels` de sa fiche, en statut `visuels`.
  - Dessin : `tools/serie/engine/storyboard.js`, chargé par `frame.html` (`?f=ep1-01`…).
  - Planches : `SERIE_WORK=<dossier> python3 tools/serie/univers.py storyboard ep1 [ep2 …]`.
  - Rendus et planches : dans le dossier de travail, jamais dans le dépôt.
- **À 14 h, le propriétaire a validé les épisodes 1 et 2** (`visuels_ok`). Les épisodes GTA 6, manager et clip façon GTA sont en `visuels` et attendent sa validation.
- **Ajouts au moteur, tous dessinés en code :**
  - un bras levé pour Liam (`pose: {raise: 'r'}`) qui tient l'éponge ou le téléphone ;
  - Liam fatigué (`+cerne`) et ému (`+larme`) ;
  - pour les plans : zoom sur un décor (`zoom`), assombrir (`dim`), un personnage vu par une fenêtre (`clip`), des silhouettes anonymes (`sil`), un décor sans le micro du placard (`nomic`), un écran partagé entre deux décors (`band`) ;
  - les accessoires : casque, micro, éponge, sachets de glaçons, scooter vu de face, ventilateur, chien, bus, clap « PRISE n », pancarte « FERMÉ », lumière d'écran sur le mur (le jeu n'est jamais montré), le rêve de Deuce (voiture, palmiers, hélicoptère : nos dessins), le téléphone de dos ;
  - les écrans de notre interface : l'enregistrement, le montage, le post avec commentaire, le son avec une image fixe, la galerie de 12 prises ;
  - les écrans Stalak : les vraies captures de `site_src/aide` et les autocollants officiels de la mascotte ;
  - la carte de fin avec le logo rond officiel (`site_src/icons/icon.svg`). Son texte est celui du script, sans phrase ajoutée.
- **L'ordre de sortie : question posée au propriétaire (14 h 05).** L'épisode GTA 6 sort le 19 au soir, avant celui du manager (20/11). Or, les cartes de fin validées suivent l'ordre des scripts (1 → 2 → 3 → 4 → 5). Marketing propose de suivre l'ordre de sortie :
  - l'épisode 2 annonce GTA 6 ;
  - l'épisode GTA 6 porte le n° 3 à l'écran et annonce le manager ;
  - le manager porte le n° 4 et annonce « Il voulait un clip comme dans GTA ».
  - Les storyboards GTA 6 et manager sont faits ainsi. L'épisode 2 a été validé avec son ancienne carte de fin, et sa fiche n'est pas touchée : la carte ne changera à la fabrication que si le propriétaire le confirme.
- **Une erreur de méthode, signalée au propriétaire.** Avant cette étape, Marketing a posé `choix` sur deux fiches de l'Univers (`narrateur`, `decor-chambre`) d'après ses réponses dans la conversation. Il a aussi effacé `choix` en reproposant `bandeau`, `decor-chambre` et `voix-liam`. Or, `choix` est réservé au propriétaire. Désormais, Marketing n'y touche plus.
- **Décision du 16/11, 13 h 42 (Chef de projet)** : pendant la fabrication, mettre à jour `progression` à chaque étape et toutes les 15 minutes au plus tard, puis déposer chaque vidéo dès qu'elle est finie. Ce sera appliqué dès le feu vert.
- Coût : 0 $. Date de GTA 6 revérifiée en ligne : 19/11/2026.
- Ce qui attend :
  - la validation des visuels GTA 6, manager et clip façon GTA ;
  - la réponse sur l'ordre de sortie ;
  - la vitesse de la voix de Liam (×1,1 ou ×1,2, fiche `voix-liam`) ;
  - le feu vert de la semaine (`lots/2026-11-16`) ;
  - puis la fabrication, vidéo par vidéo (épisode 1 pour le 18/11).
- Skills utilisés : `stalak-da`, `stalak-videos-reseaux`.

## 16/11, 13 h 30 : un narrateur plus clair

- À 13 h 23, le propriétaire a écrit : « persuadé d'être le prochain », ce n'est pas assez clair, il faut dire « le prochain rappeur qui va percer ». C'est noté dans « Mes goûts » comme une règle générale (`regle-narrateur-clair`) : les phrases du narrateur sont claires tout de suite, sans sous-entendu.
- Les phrases corrigées dans les scripts (fiches restées en `script`) :
  - épisode 1 : « Persuadé d'être le prochain rappeur à percer. » ;
  - épisode 2 : « il découvre le vrai boss de fin : caler sa bouche sur son son » (au lieu de « la synchro ») ;
  - épisode 4 : « Le 19 novembre, jour de la sortie de GTA 6, tout le quartier a disparu » ;
  - épisode 5 : « Il a vu la bande-annonce de GTA 6 ».
- Même correction dans la bible et dans la phrase d'exemple de `frame.js`. Les planches déjà choisies ne sont pas refaites.
- Coût : 0 $.

## 16/11, 13 h 30 : bandeaux descriptifs, cris d'ouverture plus forts

- À 13 h 18, le propriétaire a écrit : « retiens que les titres sur le bandeau doivent être plus descriptifs, donner plus de contexte ». Ses exemples : « il a rencontré un gros problème », « LUI IL A LE DROIT, PAS ELLE », « ELLE DOUTE APRÈS L'ENTERREMENT », « ELLE EST TOUJOURS SUR SON TÉLÉPHONE ». C'est noté dans « Mes goûts » (`regle-bandeau-descriptif`).
- Sur le script 1, il avait aussi écrit, en `script_refaire` : « la phrase du hook n'est pas assez accrocheuse, il faut quelque chose qui choque ou qui fait directement se poser des questions ». Sa note a été ajoutée automatiquement dans « Mes goûts ».
- Les 5 scripts sont corrigés et repassés en `script` :

| Épisode | Nouveau bandeau | Cri d'ouverture |
|---|---|---|
| 1 | SA MÈRE A CRIÉ EN PLEINE PRISE | Nadia : « Tu m'as enregistrée sans me le dire ?! » (la scène de la fin, montrée d'abord) |
| 2 | IL A PASSÉ LA NUIT SUR SA VIDÉO DE PROMO | Liam : « Pourquoi ma bouche est décalée ?! » (gardé) |
| 3 | SON POTE S'EST NOMMÉ SON MANAGER | Liam : « Mon manager m'a fait acheter douze sachets de glaçons ! » |
| 4 | IL SORT SON SON LE JOUR DE GTA 6 | Deuce : « Sortir ton son le jour de GTA 6 ?! T'es fou ! » (gardé) |
| 5 | IL VOULAIT UN CLIP COMME DANS GTA | M. Reyes : « Rendez-moi ma plante ! » |

- Chaque cri revient plus tard dans l'épisode, avec le même enregistrement : c'est là qu'on comprend la scène. Les cartes de fin annoncent l'épisode suivant avec son nouveau bandeau.
- La bible est mise à jour : la règle du cri, la règle du bandeau, et le tableau d'idées avec des bandeaux descriptifs.
- Coût : 0 $.

## 16/11, 12 h 30 : voix choisies, scripts réécrits avec un appel à l'action, 2 épisodes GTA 6

- À 12 h 11, le propriétaire a choisi les voix :
  - Nadia : Pulcherrima ;
  - Deuce : Schedar ;
  - Maya : Despina ;
  - Liam : Fenrir, mais « doit parler un peu plus vite ». La même lecture est accélérée (×1,1 et ×1,2, 0 $) dans la fiche `voix-liam`, en `a_choisir`. Les deux voix de Liam non retenues sont retirées de la page.
- **Nouvelle règle (`regle-cta-intelligent` dans « Mes goûts »)** : chaque épisode finit par un appel à l'action. Stalak est la solution, amenée intelligemment : celui qui regarde doit se reconnaître dans la galère de Liam et avoir envie de l'utiliser parce que ça lui serait utile.
  - Les 3 scripts pilotes sont réécrits en ce sens.
  - La galère est montrée comme celle du spectateur : des vidéos qui dorment dans la galerie, des nuits à recaler sa bouche, pas de manager ni de budget.
  - À la fin, Liam se tourne vers celui qui regarde.
  - La carte de fin dit « Gratuit, sans téléchargement ni inscription », comme le site.
- **GTA 6** (`aime-actualite`) : le jeu sort le 19/11/2026, date vérifiée en ligne. 2 nouveaux scripts sont en `script` :
  - `tcrazy-ep4`, « Le jour de GTA 6 », le 19/11 au soir ;
  - `tcrazy-ep5`, « Le clip façon GTA », le 21/11.
  - Ils n'en gardent que le nom : ni logo, ni image, ni musique, ni personnage du jeu, aucune imitation de jaquette ou de bande-annonce, on ne voit jamais le jeu, et Liam (15 ans) n'y joue pas.
  - **À faire vérifier par Juridique**, comme le nom de BandLab.
- La bible (`SERIE_BIBLE.md`) est mise à jour : l'appel à l'action, les voix, la règle sur GTA 6 et les 2 idées d'épisodes.
- Coût : 0 $.
- Ce qui attend :
  - la vitesse de la voix de Liam ;
  - la validation des 5 scripts ;
  - pour que « Le jour de GTA 6 » sorte le 19/11, il faut le valider vite, puis faire les images fixes, le feu vert et la production.

## 16/11, 11 h 35 : les voix des personnages et les 3 scripts pilotes

- À 11 h 18, le propriétaire a dit « oui » pour les voix.
- **Les voix des 4 personnages** : 12 voix sur Flora (3 par personnage, sur une phrase qui lui ressemble), pour 0,156 $. Le solde Flora est d'environ 2,57 $. Elles sont dans 4 nouvelles fiches, `voix-liam`, `voix-nadia`, `voix-deuce` et `voix-maya`, en `a_choisir`. Le détail est dans `SERIE_UNIVERS.md`.
- **Les 3 scripts pilotes** sont dans Studio Stalak (collection `videos`), en `script`, à valider :
  1. `tcrazy-ep1`, « La vaisselle ou la gloire », le 18/11 : Nadia, Liam, Maya ; le cri de sa mère devient son refrain.
  2. `tcrazy-ep2`, « Le son de l'année », le 19/11 : la vidéo de promo décalée ; Maya lui montre Stalak.
  3. `tcrazy-ep3`, « Le manager », le 20/11 : Deuce, M. Reyes et Big Mo ; douze prises devant l'épicerie.
- Les scripts suivent les règles :
  - environ 1 min 10 chacun ;
  - pas de générique ;
  - le cri et le bandeau à 0:00 ;
  - le narrateur ensuite ;
  - Stalak seulement dans le dernier tiers, avec les vraies captures et ce que dit le site : « importe ton son et tes prises, Stalak coupe sur le rythme en gardant la synchro des lèvres » ;
  - le clip montré est synchronisé ;
  - une fin qui annonce l'épisode suivant.
- Les heures de publication sont « 12 h 30 (à confirmer) ». C'est Réseaux sociaux qui décide.
- Ce qui attend :
  - le choix des 4 voix et la validation des 3 scripts par le propriétaire ;
  - ensuite, les images fixes des nouveaux plans (étape `visuels`), puis le feu vert, puis la production : voix générées une seule fois, vidéo, planche contact, miniature.

## 16/11, 5 h 30 : l'univers est complet, la bible est écrite

- À 4 h 56, le propriétaire a choisi :
  - pour la galère, « Scars » ;
  - pour le narrateur, la voix Algieba à ×1,2 (`regle-narrateur-vitesse` dans « Mes goûts » ; fiche `narrateur` en `choisi`, d'après sa réponse).
- **La bible en une page** est dans `docs/marketing/SERIE_BIBLE.md`. Elle remplace celle de « Studio Chambre ». Elle contient :
  - l'idée et le format, sans générique ;
  - les personnages, les décors et les musiques choisis ;
  - les règles ;
  - le chemin d'un épisode et son coût ;
  - 7 idées d'épisodes.
- Coût : 0 $.
- Ce qui attend :
  - les voix de Liam, Nadia, Deuce et Maya : 3 voix chacun sur la même phrase, environ 0,16 $ sur Flora, seulement après l'accord du propriétaire ;
  - les 3 scripts pilotes dans Studio Stalak, en `script`.

## 16/11, 5 h 25 : 3 musiques choisies, la galère refaite

- À 4 h 51, le propriétaire a choisi 3 ambiances :
  - Plan foireux : « Sneeze » ;
  - Hustle : « Game Show » ;
  - Victoire : « Funk Upbeat ».
- Pour la galère : « c'est trop calme » (sa note, ajoutée automatiquement dans « Mes goûts »). 3 nouveaux beats hip-hop tristes, avec une vraie batterie, sont dans la fiche `musique-galere`, en `a_choisir`. Ils sont sans Content ID et faits par des humains. Les sources sont dans `SERIE_UNIVERS.md`, étape 2e.
- Ménage dans la page : 5 de mes fichiers qui ne servaient plus sont supprimés (l'ancienne planche de la chambre avec le poster, les voix Charon et Algenib, les 2 premières musiques de la galère).
- Coût : 0 $.
- Ce qui attend : la musique de la galère, la vitesse du narrateur (×1,1 ou ×1,2), et le logo, qui est optionnel. Ensuite, la bible en une page et les scripts.

## 16/11, 5 h 10 : les 4 ambiances musicales, 2 titres Pixabay chacune

- À 4 h 40, le propriétaire a écrit « cherche par toi-même » : il n'envoie pas de beats.
- 8 titres ont été trouvés sur Pixabay :
  - l'usage commercial est permis ;
  - aucun n'est enregistré au Content ID ;
  - tous sont faits par des humains, pas par une IA.
- Comment ils ont été choisis : recherche dans le navigateur, lecture des données de la page (`hasYoutubeContentId`, `isAiGenerated`), téléchargement sur `cdn.pixabay.com`, tempo et tonalité mesurés avec librosa.
- Ils sont déposés en .mp4 audio dans 4 nouvelles fiches : `musique-galere`, `musique-plan`, `musique-hustle` et `musique-victoire`. Chacune a 2 titres et est en `a_choisir`.
- La fiche `musique-fonds` est marquée « remplacée ». Le titre, l'auteur et le lien de chaque musique sont dans `docs/marketing/SERIE_UNIVERS.md`, étape 2e.
- Claude ne peut pas écouter les titres : il les a choisis d'après leur description, leur tempo et leur tonalité. Le propriétaire tranche à l'oreille.
- Coût : 0 $.
- **Pour le Chef de projet** : les fiches `musique-fonds` (remplacée) et `musique-generique` (abandonnée) peuvent être retirées de la page.
- Ce qui attend : les choix du propriétaire (musiques, vitesse du narrateur, miniature type). Ensuite, la bible en une page et les scripts.

## 16/11, 4 h 50 : bandeau choisi, chambre validée, une miniature type, le narrateur plus rapide

- À 4 h 36, le propriétaire a répondu.
  - **Le bandeau est choisi** : la version 4, « Ton mélange ».
  - **La chambre sans poster** : « ok ». D'après cette réponse, la fiche `decor-chambre` passe en `choisi` (version 2).
  - **La miniature est faite par Claude, dans le même style que la vidéo** (`regle-miniatures-style` dans « Mes goûts »). Une miniature type est dessinée (`frame.js`, image `miniature-exemple`) et déposée dans une nouvelle fiche `miniature` (habillage), en `a_choisir`. Titre et visages restent dans le centre 3:4 que garde la grille d'un profil TikTok.
  - **Le narrateur** : il préfère la voix 3, Algieba, mais « un peu plus rapide » (`regle-narrateur-voix`). La même lecture est accélérée avec ffmpeg `atempo`, pour 0 $ : ×1,1 et ×1,2. Les deux versions sont dans la fiche `narrateur`, à côté de l'originale, en `a_choisir`.
- Coût : 0 $.
- Ce qui attend : sa vitesse du narrateur et son avis sur la miniature type. Ensuite, les 4 ambiances musicales (ses beats, sinon Pixabay), puis la bible et les scripts.

## 16/11, 4 h 45 : miniatures avec chaque vidéo, pas de poster, les 3 voix du narrateur

- À 4 h 28, le propriétaire a répondu.
  1. **Les miniatures** : « je veux que tu me crées les miniatures des TikTok à chaque fois en même temps que tu génères la vidéo, et je pourrai les retrouver dans Studio Stalak ». C'est la règle `regle-miniatures` dans « Mes goûts ». Le logo devient optionnel : il ne sert que s'il veut le voir sur les miniatures (c'est écrit dans la fiche `logo-serie`).
  2. **Pas de poster** dans la chambre (`pas-poster-chambre` dans « Mes goûts »). Le poster est retiré du placard-studio dans `decors.js`. La planche est redéposée, et la fiche `decor-chambre` est en `a_choisir`. Son ancienne note sur Pop Smoke reste dans « Mes goûts » : c'est lui qui la retire.
  3. **Les voix du narrateur : « oui ».** 3 voix sur la même phrase (Flora, Gemini 3.1 Flash TTS, en français) : Charon, Algenib et Algieba. Elles coûtent 0,039 $, et le solde Flora est d'environ 2,72 $. Elles sont dans la fiche `narrateur`, en `a_choisir`.
- La page n'accepte pas les .mp3 : les voix sont déposées en .mp4 audio (AAC). Le lecteur `<audio>` de la page les lit.
- **Pour le Chef de projet (miniatures)** : il faut une place pour la miniature dans les fiches vidéo de la page, par exemple un champ `miniatureUrl` affiché à côté de `videoUrl` et `plancheUrl`. Il faut aussi la mentionner dans `docs/studio/STUDIO_STALAK.md` et dans l'étape 5 du skill `stalak-videos-reseaux`.
- Ce qui attend :
  - les choix du propriétaire : le bandeau (version 4), la chambre sans poster et la voix du narrateur ;
  - ensuite, les 4 ambiances musicales (ses beats, sinon Pixabay) ;
  - puis la bible en une page et les scripts.

## 16/11, 4 h 35 : pas de générique, le bandeau en version mélangée

- À 4 h 24, le propriétaire a écrit « c'est bon j'ai fait mes choix, par contre je veux pas de générique ».
  - **La mascotte officielle est validée** (fiche `mascotte` en `choisi`).
  - **Le bandeau** : il garde les sous-titres de la version 1 et veut la bande de titre de la version 2 (sa note, ajoutée automatiquement dans « Mes goûts »). La version 4, « Ton mélange », est dessinée (`frame.js`, images `bandeau-4-*`) et déposée dans la fiche `bandeau`, en `a_choisir`.
  - **Pas de générique** : c'est noté dans « Mes goûts » (`pas-generique`). Les épisodes commencent directement par l'accroche. La fiche « Le générique » (`musique-generique`) est marquée « abandonné ». Le Chef de projet peut la retirer de la page s'il le souhaite.
  - **Le logo** n'est pas choisi : on lui demande s'il en veut un pour les miniatures.
  - **Le poster de la chambre** attend toujours son choix (un rappeur inventé, T-Crazy lui-même ou une de ses pochettes).
- Coût : 0 $.
- Ce qui attend : son choix du bandeau et sa réponse pour le logo et le poster. Ensuite, les voix du narrateur (Flora, environ 0,04 $, seulement après son accord) et les 4 ambiances musicales (ses beats, sinon Pixabay).

## 16/11, 4 h 40 : décors choisis (poster de la chambre en attente), bandeau et logo déposés

- Vers 4 h, le propriétaire a choisi ses décors :
  - le placard-studio (chambre, version 2), **à refaire** pour le poster ;
  - la cuisine ;
  - la rue pavillonnaire ;
  - le terrain grillagé ;
  - le couloir du lycée ;
  - le toit aménagé.
- **Le poster de la chambre est en attente.**
  - Le propriétaire veut un poster de Pop Smoke : c'est sa note sur la fiche, ajoutée automatiquement dans « Mes goûts ».
  - Il a ensuite envoyé dans la conversation une photo retravaillée de l'artiste, avec le titre de son album.
  - Marketing ne l'a ni dessinée ni intégrée : c'est l'image d'un vrai artiste sur le compte de la marque, sans les droits, comme les vrais morceaux connus.
  - Le propriétaire a répondu qu'il décide et qu'il en prend la responsabilité. Marketing a maintenu qu'il ne le ferait pas lui-même.
  - 3 idées proposées : un rappeur inventé, T-Crazy lui-même, ou une pochette du propriétaire (son image à lui). On attend son choix.
- **Le bandeau et le logo, 3 versions chacun**, sont dans les fiches `bandeau` et `logo-serie`, en `a_choisir`.
  - Nouveau fichier `tools/serie/engine/frame.js` (page `frame.html?f=…`) : il compose une vraie image de la série (décor, personnages placés par leurs pieds, habillage).
  - `liam.js` et `cast.js` donnent maintenant un personnage entier avec l'expression voulue : `LIAM.figure()` et `CAST.figure()`.
  - Les planches sont faites par `python3 tools/serie/univers.py habillage`.
  - Le détail est dans `docs/marketing/SERIE_UNIVERS.md`, étape 2d.
  - Les textes sont des exemples.
  - Tout reste dans la zone visible des réseaux.
  - Aucun logo ne porte le nom de Stalak.
- La mascotte officielle attend toujours la validation du propriétaire.
- Coût : 0 $.
- Ce qui attend :
  - le choix du poster, du bandeau et du logo, et la validation de la mascotte ;
  - ensuite, les 3 voix du narrateur (Flora, environ 0,04 $, seulement après son accord) et la musique (ses beats, sinon Pixabay) ;
  - puis la bible en une page et les scripts.

## 16/11, 3 h 55 : personnages choisis, mascotte officielle, les 6 décors déposés

- À 3 h 27, le propriétaire a écrit « c'est bon j'ai fait mes choix ». Ses choix dans l'onglet Univers :
  - Deuce : version 1, « Le manager » ;
  - Maya : version 1, « Les tresses » ;
  - Big Mo : version 1, « Le boss du quartier » ;
  - M. Reyes : version 1, « L'épicier ».
- **La mascotte n'est pas redessinée.** Sa note sur la fiche : « je veux garder la mascotte de Stalak de base, pas de personnage ». Elle est déjà ajoutée automatiquement dans « Mes goûts ».
  - La fiche `mascotte` montre maintenant la mascotte officielle avec ses vrais autocollants (`site_src/emoji`), dans l'écran du téléphone de Liam. Seul le téléphone est dessiné (`mascotSheet()` dans `tools/serie/engine/cast.js`).
  - Elle reste en `a_choisir` : il reste au propriétaire à la valider.
  - Le code de la mascotte redessinée est retiré de `cast.js`.
- **Les 6 décors sont dessinés en code, 2 versions chacun**, et déposés dans les fiches `decor-*`, en `a_choisir` :
  - le moteur : `tools/serie/engine/decors.js`, page `decors.html?d=<lieu>&v=1|2&t=jour|nuit|soir` ;
  - les planches : `python3 tools/serie/univers.py decors` (textes et gros plans dans `DECOR_BOARDS`) ;
  - la chambre-studio est montrée de jour et de nuit ;
  - le détail des versions est dans `docs/marketing/SERIE_UNIVERS.md`, étape 2c.
- La cuisine et le salon sont 2 pièces, le couloir du lycée et le bus sont 2 lieux : pour ces deux fiches, le propriétaire peut garder les deux versions.
- Toutes les enseignes sont inventées (« REYES », « GLAÇONS », « PROMO », « OUVERT », « SORTIE », « STUDIO ») : aucune vraie marque.
- Petites retouches :
  - `tcrazy.js` : le soleil de la chambre peut changer de couleur (`P.sun`), pour la chambre de nuit ;
  - `univers.py` : les guillemets restent collés à leur mot dans les planches.
- Coût : 0 $.
- Ce qui attend :
  - le choix des décors et la validation de la mascotte par le propriétaire ;
  - ensuite, le bandeau et le logo (3 versions chacun), les 3 voix du narrateur (Flora, environ 0,04 $, seulement après son accord) et la musique (ses beats, sinon Pixabay) ;
  - puis la bible en une page et les scripts.

## 16/11, 3 h 30 : les 6 autres personnages, 2 versions chacun

- À 2 h 54, le propriétaire a écrit « ok suivant ». Les autres personnages sont dessinés en code :
  - Nadia, Deuce, Maya, Big Mo, M. Reyes et la mascotte ;
  - le dessin vient d'un nouveau moteur, `tools/serie/engine/cast.js`, page `cast.html?c=…&v=1|2` ;
  - chaque planche montre le personnage de face, de profil et en 4 expressions.
- Les planches sont déposées dans les fiches de l'onglet Univers, en `a_choisir`, au fur et à mesure. Le détail des versions est dans `docs/marketing/SERIE_UNIVERS.md`, étape 2b.
- **Nadia est déjà choisie** par le propriétaire (3 h 09) : version 2, « Le chignon » (fiche `nadia` en `choisi`).
- Mascotte : elle reste fidèle aux autocollants officiels de `site_src/emoji` :
  - capuche fourrée, locks à perles blanches, moufles, logo AA ;
  - ses expressions reprennent les signes des autocollants.
- Coût : 0 $.
- Ce qui attend :
  - les choix du propriétaire pour Deuce, Maya, Big Mo, M. Reyes et la mascotte ;
  - ensuite, les décors (2 versions chacun, plus la chambre de nuit), le bandeau, le logo, les voix du narrateur et la musique.

## 16/11, 2 h 50 : Liam choisi (version 4, « Le deux-tons »), casquette baissée

- À 2 h 44, le propriétaire a choisi la **version 4, « Le deux-tons »** (fiche `liam` : `choix` 3, statut `choisi`) :
  - visage large, sourcil fendu, petite boucle d'oreille ;
  - casquette glace à visière bleue, portée à l'envers ;
  - doudoune bleue aux épaules glace, tee noir, jean clair, baskets basses.
- Il a demandé : « baisse un peu la hauteur de sa casquette ». Le haut de la casquette est descendu d'environ 30 unités, de face comme de profil (`capFront` et `headProfile` dans `tools/serie/engine/liam.js`). Elle couvre toujours le crâne.
- La planche de la version 4 est redéposée dans la fiche, qui reste en `choisi`. Les autres versions gardent leurs anciennes images : elles ne servent plus.
- La remarque est notée dans « Mes goûts » (`pas-casquette-haute`).
- Coût : 0 $.
- Ce qui attend : les autres personnages (Nadia, Deuce, Maya, Big Mo, M. Reyes, la mascotte), 2 versions chacun, dans le même style que Liam.

## 16/11, 2 h 45 : profil de Liam, crâne raccourci

- À 2 h 40, le propriétaire a écrit : « l'arrière de son crâne en vue de profil est trop long ».
- Dans `headProfile` (`tools/serie/engine/liam.js`), l'arrière de la tête est raccourci d'environ 30 unités. La casquette, les cheveux et la nuque suivent, et la visière est un peu plus courte. La tête de profil est maintenant compacte derrière l'oreille. La vue de face ne change pas.
- La remarque est notée dans « Mes goûts » (`pas-crane-long`).
- Les 4 planches sont redéposées dans la fiche `liam`, en `a_choisir`. Les précédentes sont retirées de la page.
- Coût : 0 $.

## 16/11, 2 h 40 : Liam en casquette à l'envers, coupe courte

- À 2 h 24, le propriétaire a écrit : « j'aime toujours pas du tout sa coupe, fais plutôt une casquette à l'envers dans le style de celle que je t'envoie, et fais une coupe super simple en dessous ». Il a joint deux images de casquettes (des snapbacks à visière plate).
- Dessiné dans `tools/serie/engine/liam.js`, pareil dans les 4 versions :
  - une snapback à l'envers : de face, la languette à pressions et l'ouverture sur le front ; de profil, la visière plate vers l'arrière ;
  - aucun logo d'équipe ni de marque, seulement un petit flocon brodé sur le côté ;
  - une coupe très simple : cheveux noirs courts, pattes nettes, oreilles dégagées, ligne nette à la nuque.
- Les 4 versions changent le visage, la couleur de la casquette et la tenue :
  - 1 · Le classique : bleu roi ;
  - 2 · Le sweat : bleu nuit ;
  - 3 · Le sans-manches : noire ;
  - 4 · Le deux-tons : glace et bleue, avec une petite boucle d'oreille.
- Les 4 planches sont redéposées dans la fiche `liam`, en `a_choisir`, et sa description est mise à jour. Les images des vanilles sont retirées de la page.
- Nouvelle règle dans « Mes goûts » : `regle-liam-casquette`. Elle passe avant `regle-liam-coupe` (les vanilles).
- Coût : 0 $.
- Ce qui attend : le choix d'une version par le propriétaire. Il peut mélanger les versions.
- **À signaler au propriétaire** : trois anciennes lignes de « Mes goûts » décrivent encore les cheveux longs (`regle-heros` « à locks », `regle-liam-look` « locks entièrement noires », `regle-liam-coupe` les vanilles). C'est lui qui les retire ou les modifie, s'il le veut.

## 16/11, 2 h 20 : la coupe de Liam refaite d'après l'image du propriétaire (remplacée à 2 h 24)

- À 2 h 11, le propriétaire a écrit : « sa coupe ne va pas du tout. Surtout de profil on dirait qu'il a pas de cheveux sur le coté ». Il a joint une image de référence pour la coupe.
- La coupe est refaite dans `tools/serie/engine/liam.js`, la même dans les 4 versions :
  - des vanilles (twists) entièrement noires, raie au milieu ;
  - elles tombent jusqu'au menton et cachent les oreilles ;
  - de profil, les cheveux couvrent tout le côté de la tête.
- La règle est notée dans « Mes goûts » (`regle-liam-coupe`).
- Les 4 versions ne changent plus que le visage et la tenue : Le classique, Le sweat, Le sans-manches, Le deux-tons. Elles sont redéposées dans la fiche `liam`, en `a_choisir`, avec sa description mise à jour. Les 4 anciennes images sont retirées de la page.
- Coût : 0 $.
- Ce qui attend : son choix d'une version.
- **À signaler au propriétaire** : deux anciennes lignes de « Mes goûts » parlent encore de « locks » (`regle-heros`, `regle-liam-look`). La nouvelle ligne (`regle-liam-coupe`) passe avant. C'est lui qui retire ou modifie les anciennes, s'il le veut.

## 16/11, 2 h 04 : style validé, les 4 versions de Liam déposées

- Le propriétaire a validé la planche du Style 1 (fiche `style` en `choisi`).
- Les 4 versions de Liam sont dessinées en code (`tools/serie/engine/liam.js`) et déposées dans la fiche `liam`, en `a_choisir` : Le classique, Le chignon, Le bandeau, Le deux-tons. Chacune montre Liam de face, de profil et en 4 expressions.
- Coût : 0 $.
- Ce qui attend : son choix. Ensuite, les autres personnages (2 versions chacun), les décors, le bandeau, le logo, les voix du narrateur et la musique.

## 16/11, 1 h 52 : Style 1 retenu, Liam corrigé

- Le propriétaire a retenu **Style 1 · Anime US**.
- La planche est refaite avec ses corrections, toutes dans `tools/serie/engine/tcrazy.js` :
  - locks entièrement noires ;
  - pas de chaîne ;
  - le col de la doudoune ouvert, avec le cou visible ;
  - les yeux droits ;
  - à 2 h, un corps plus fin (« je trouve son corps trop large »).
- Elle est redéposée seule dans la fiche `style`, en `a_choisir`. Les anciennes planches sont retirées de la page.
- Ce qui attend : sa validation, puis les 4 versions de Liam (de face, de profil, 4 expressions).

## 15/11, 23 h : l'univers « T-Crazy », tout dessiné par Claude

**Décision du propriétaire (23 h) :** aucun visuel généré sur Flora. Claude dessine tout lui-même en code, et Flora ne sert qu'aux voix. Elle est notée dans « Mes goûts » (`regle-visuels-claude`). **À reporter par le Chef de projet** dans les décisions de `docs/STATUS.md` et dans `docs/studio/STUDIO_STALAK.md`.

Ce qui est fait :
- **Étape 1, le style.** 3 planches dessinées en code sont dans l'onglet Univers, fiche « Le style de dessin », en statut `a_choisir` : Style 1 Anime US, Style 2 Sticker givré, Style 3 BD imprimée. Elles montrent le même Liam dans la même chambre-studio.
  - Dessin : `tools/serie/engine/tcrazy.js` (page `tcrazy.html?s=1|2|3`).
  - Planches : `tools/serie/univers.py`.
  - Détails : `docs/marketing/SERIE_UNIVERS.md`.
- **Les 3 planches générées sur Flora** (0,42 $, avant la décision de 23 h) sont retirées de la fiche et de la page. Solde Flora : 2,76 $.
- **Coût de l'univers maintenant :**
  - environ 0,20 $ de voix seulement (narrateur 0,04 $, puis Liam, Nadia, Deuce et Maya 0,16 $) ;
  - visuels et musique : 0 $.
- **La musique** : demande faite au propriétaire pour ses beats ou ceux d'ALASKA. Sinon, ce sera Pixabay.
- **Les 3 anciennes fiches « Studio Chambre »** (Yanis) sont repassées en `idee`. L'ancienne bible est marquée comme remplacée.

Ce qui attend :
1. le choix du style par le propriétaire ;
2. tout l'univers dans ce style (étape 2 de `SERIE_UNIVERS.md`) ;
3. la bible en une page et les scripts.

Skills utilisés : `stalak-da`, `stalak-videos-reseaux`.
