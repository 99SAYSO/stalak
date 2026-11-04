# Compte rendu — branche `marketing/promo-youtube` (Marketing & croissance)

Statut : PRÊT, v4 du 2/11 + miniature YouTube + film de lancement « façon Lovio » (v6 : ses retours appliqués + planche contact) + page de retours « Salle de visionnage » (v2) (documents et sources des vidéos et de la miniature seulement ; rien à intégrer dans l'app ni le site)

## Film de lancement v6 : planche contact (règle 10, 5/11)

- **Pourquoi** : la nouvelle règle 10 du contexte (skill `planche-contact`), appliquée tout de suite à la dernière vidéo livrée (la v5). Le propriétaire n'avait pas fait de remarque sur la v5.
- **Planche contact** : 121 images de la v5 relues (une toutes les 0,5 s, `tools/contact_sheet.py`), puis les moments douteux revus de plus près. 12 problèmes trouvés et corrigés :
  - textes coupés au bord de l'image ou de l'écran : « Import your music », le titre du début, les textes de la tablette, la carte de montage, la carte Export (deux fois), les noms des formats du carrousel ;
  - mots cachés par la fenêtre de son clip : « Beautifully … edited », « ready … to post » (une erreur de placement depuis la v1) ;
  - « Take 3 » à moitié caché (les étiquettes de ce flash sont retirées) ;
  - les noms des jours passaient sur l'écran ;
  - les formats passaient sous l'accolade.

  Planche du fichier final : 121 images, **0 problème restant**. Le détail, avec les temps, est dans `promo/launch/REVIEW.md` (« v6 »).
- **Remarque pour le Chef de projet** : chaque image de `tools/contact_sheet.py` montre la vidéo environ 0,23 s après son horodatage (filtre `fps` d'ffmpeg, arrondi au plus proche). Ce n'est pas gênant pour relire, mais les temps donnés dans un rapport sont un peu en avance. Je n'ai pas touché au script.
- **Coût Flora : 0 $.**
- **Livré** le 5/11 : envoyé dans la conversation (60 s, 60 i/s, −14,1 LUFS, pas dans le dépôt) et ajouté à la Salle de visionnage (`stalak-lancement-v6`).

## Film de lancement v5 : ses retours dans la Salle de visionnage (3/11, 0 h 30)

- **À 15,7 s, « la vidéo sort du cadre de Stalak, les contours de la vidéo sont visibles »** : corrigé. La capture de l'écran de la tablette était un peu étirée en hauteur, et la vidéo couvrait la bordure de l'aperçu de l'app. Maintenant, les captures gardent leurs proportions et ses vidéos sont posées dans la bordure, avec l'arrondi de l'app : sur le téléphone, la tablette et les étapes de montage (vers 23 s et 35 s).
- **Sur toute la vidéo** : « des transitions trop simples, juste vers le côté ; je veux que toutes les transitions soient avec un élément de ce qu'il y a à l'écran, qu'elles se fondent dans le décor, comme dans la vidéo de référence ; tout doit être plus fluide, souple ». 14 transitions sont refaites (le tableau est dans `promo/launch/SPEC.md`, « v5 ») :
  - l'ordinateur devient le téléphone, puis le téléphone devient la tablette : un seul appareil qui change de forme ;
  - la boîte de verre sort de derrière sa carte, puis sa carte vole dans la boîte et devient la pastille « Take 2 » ;
  - la barre de chargement devient la barre de montage, et cinq plans de cette barre deviennent les cases de la grille ;
  - les flashs passent de carte en carte, et la dernière se rabat dans l'écran de l'ordinateur 3D ;
  - les pilules volent à leur place dans l'écran de montage ;
  - la caméra sort de l'écran de l'ordinateur, puis y rentre jusqu'au bouton Export, qui devient la carte TikTok ;
  - la carte YouTube devient le panneau de verre.

  Les mouvements sont plus longs, avec des débuts et des fins doux, et se chevauchent. La voix, la musique et le mixage ne changent pas (un whoosh léger en plus, sous le vol de sa carte).
- **Coût Flora : 0 $.**
- **Livré** le 3/11 :
  - la vidéo est envoyée dans la conversation (60 s, 60 i/s, −14,1 LUFS, aucune image noire, pas dans le dépôt) ;
  - elle est ajoutée à la Salle de visionnage (`stalak-lancement-v5`) ;
  - une réponse est écrite sous ses 2 remarques, passées à « traitée ».

## Film de lancement v4 : sa remarque de 20 h 28

- **À 53,27 s, « le mot "drop" arrive trop tôt, il est donc sur le texte »** : corrigé. C'était une erreur de la v3 : le mot utilisait le réglage de temps du drop de la musique (8,8 s). Il arrive maintenant à 54,6 s, sur la voix.
- Seul ce passage (52 → 56 s) a été refait, puis recollé dans la v3. Livré dans la conversation et dans la Salle de visionnage (`stalak-lancement-v4`), avec une réponse sous sa remarque.

## Film de lancement v3 : ses retours dans la Salle de visionnage (2/11, 19 h 13)

- **À 7,1 s, « la lettre "g" est coupée en bas »** : corrigé. Le dégradé de glace des mots forts s'arrêtait au-dessus du jambage. C'est réparé partout, aussi sur le « p » de « drop ».
- **Sur toute la vidéo** : « toujours pas assez fluide, mouvements trop linéaires ; la musique beaucoup trop calme et mignonne, il faut quelque chose plus comme la musique qu'on utilisait avant ; plus d'éléments liés à Stalak, genre des flocons en fond ».
  - **Musique** : l'instru de son « neva die », celle de nos vidéos d'avant, ralentie de 157 à 150 BPM pour rester sur les coupes. Elle est découpée sur ses mesures :
    - son intro au début ;
    - **son drop sur « Meet Stalak. »** ;
    - une coupure sous « more time making music » ;
    - le beat qui revient sur « What will you drop today » ;
    - ses dernières mesures sur le logo.
    
    **À vérifier par le propriétaire avant de publier : la licence de l'instru pour YouTube.**
  - **Fluidité** :
    - 60 images par seconde ;
    - plus de zooms lents et réguliers ;
    - des arrivées qui ralentissent doucement ;
    - des mouvements qui se chevauchent ;
    - du flou de mouvement sur les gestes rapides.
  - **Plus de Stalak** :
    - de grands cristaux de neige qui tournent lentement en fond ;
    - de gros flocons flous qui passent devant ;
    - les stalactites de l'app sur la boîte de verre, sous le panneau tapé et en haut de l'écran de fin ;
    - un éclat de neige qui part du logo sur le drop.
- **Coût Flora : 0 $.**
- **Livré** le 2/11 vers 20 h :
  - la vidéo est envoyée dans la conversation (60 s, 60 i/s, −14,1 LUFS, aucune image noire, pas dans le dépôt) ;
  - elle est ajoutée à la Salle de visionnage (`stalak-lancement-v3`) ;
  - une réponse est écrite sous ses 2 remarques, passées à « traitée ».

## Film de lancement v2 : ses retours dans la Salle de visionnage (2/11, 17 h 03 et 17 h 06)

- **Ses 5 remarques à l'image près**, toutes corrigées :
  - 16,0 s, « le gros plan sur ma tête faut changer » : il est maintenant dans une carte 9:16 (sa prise 2, plan taille) ;
  - 23,07 s, 28,20 s et 36,23 s, « le bouton export est sur le texte de derrière » : c'était le bouton flottant « Export ↓ » de l'app (`#expFab`), pris dans les captures. `capture_ui.py` le cache maintenant, et toutes les captures ont été refaites ;
  - 29,70 s, « les bords de l'ordinateur sont trop longs par rapport à l'écran » : le socle fait la largeur de l'écran, vu un peu d'en haut. Pareil pour les ordinateurs de S3 et S8.
- **Sa remarque sur toute la vidéo** : « des transitions plus fluides, limite on ne les voit pas venir, ça se fond dans le décor ; c'est trop sec des fois ». Les 13 coupes sèches sont devenues des passages qui gardent le mouvement ou un élément du décor (tableau dans `promo/launch/SPEC.md`, « v2 »). Par exemple :
  - on entre dans le mot « song » ;
  - on plonge dans le bleu du logo et on ressort de l'écran de l'ordinateur ;
  - panoramiques filés entre les appareils ;
  - l'aperçu de la tablette devient sa carte ;
  - la case YouTube devient son clip ;
  - un glissé vers le haut comme dans un fil ;
  - la traînée de lumière efface le panneau.
- **Une règle du 1er film est changée, à sa demande** : « pas de fondu entre deux mondes » devient « on passe d'un monde à l'autre caché par un mouvement ou par le décor ». Rien d'autre n'a changé : même voix, musique, bruitages et mixage. Seul le whoosh de 16 s est avancé sur la poussée de la tablette.
- **Coût Flora : 0 $.**
- **Livré** le 2/11 vers 18 h 10 :
  - la vidéo est envoyée dans la conversation (60 s, −14,1 LUFS, aucune image noire, pas dans le dépôt) ;
  - elle est ajoutée à la Salle de visionnage (`stalak-lancement-v2`) ;
  - une réponse est écrite sous chacune de ses 6 remarques, qui sont passées à « traitée ».

## Salle de visionnage : ses retours sur nos vidéos (sa demande du 2/11, 16 h 43)

- **Sa demande** : « une interface qui me permet de te faire des remarques sur les vidéos que tu me crées, avec une timeline […] une sorte de crayon qui me permet d'entourer ce dont je parle sur la frame en question […] et de retravailler seulement sur les points que j'ai parlé […] directement ici dès que tu m'envoies des vidéos ».
- **Fait** : la page « Salle de visionnage » (artifact privé du propriétaire, https://claude.ai/artifact/JihUFRUHrYGrHnoRZyoVXo). Elle contient :
  - la vidéo, avec une timeline où l'on voit les plans nommés, les images et le son ;
  - une remarque à l'image près, au crayon sur l'image, sur un instant ou sur un passage ;
  - la liste de ses remarques, avec la réponse de Claude sous chacune ;
  - le bouton « J'ai fini mes remarques ».
  
  Le film de lancement y est, en v1 puis en v2 (copies de relecture en 720p).
- **v2 de la page (ses demandes de 17 h 04 et 17 h 06)** :
  - **« J'ai fini » n'ouvre plus de nouvelle conversation** : l'ancien envoi à Claude (`comments`, `sendToClaude`) en créait une, qu'il a supprimée. Maintenant, la page marque ses remarques « Pour Claude » et copie leur résumé. Elle lui dit d'écrire « c'est bon » (ou de coller ce résumé) dans la conversation où on lui a envoyé la vidéo. Capacités de la page : `db` et `assets`.
  - **Bulle « Remarque sur toute la vidéo »**, pour un avis sur l'ensemble, sans instant ni crayon. Elle est en tête de liste.
- **Côté Claude** : `promo/retours/` (`README.md` : la base de la page et la boucle ; `prepare.py` : préparer une vidéo pour la page ; `frames.py` : voir ses traits sur l'image exacte en pleine qualité ; `salle.html` : la source de la page ; `test_server.py` : serveur local pour la tester).
- **À faire à chaque vidéo envoyée au propriétaire** : l'ajouter à la page (`promo/retours/README.md`, étape 1).

## Film de lancement « façon Lovio » (sa demande du 2/11, 14 h 41)

- **Sa demande.** Avec `Best_AI_Product_Video_for_SaaS__Lovio.mp4` (la vidéo de lancement de Lovio, 53 s) : « en t'inspirant fortement de cette vidéo de lancement, crée une nouvelle vidéo de lancement en motion design pour Stalak […] mouvements, effets, textes, voix, effet sonore, transitions […] en gardant les couleurs, environnements de stalak […] Fais seulement une video format youtube, pas de shorts youtube cette fois. » Choix libre (« libre arbitre »).
- **Fait : un film de 60 s en 16:9** (1920 × 1080, 30 i/s), qui suit la vidéo de Lovio plan par plan, aux couleurs et dans les mondes de Stalak (ciel de neige, nuit glacée à aurores, lumière bleue, studio glacé, verre de glace). Étincelle → l'icône sert de fenêtre → l'interface en verre → « I have a song. » tapé → le nom → l'app sur ordinateur, téléphone et tablette → lui qui rappe, l'import du son et de ses prises, « All the takes are synced. », la barre coupée sur les temps → la grille de ses vidéos et 4 flashs sur les temps → « Beautifully [fenêtre] edited » → « ready ○ to post » → les vraies commandes en pilules, Punchy, ses paroles, Shuffle → « in any direction » → « What starts as a few takes » → le pack et une semaine de vidéos → Export, TikTok / Reels / Shorts / YouTube entre accolades → « More time making music. » → « What will you drop today » → le cristal, le logo, stalak.app.
- **Le vrai produit** : toutes les cartes et les boutons sont des captures de l'app construite depuis le dépôt ; ses prises et son clip passent dans les aperçus ; sa phrase (« I put gold on my wounds, scars worth millions. ») est calée sur sa voix ; après Shuffle, une autre prise au même instant de la chanson. Les filtres montrés (Frost, Black & white, 35 mm film) sont les gratuits de l'app.
- **Chaque geste tombe sur le mot qui le nomme** : la pastille du son sur « song », les prises sur « takes », le clic sur « Stalak », Punchy après « Change the pace », Shuffle sur « shuffle », le pack sur « week », Export sur « Export », chaque format quand la voix le dit, le nom sur « Stalak ».
- **Le son** : la voix Achird (12 phrases, silences raccourcis) ; **la musique qu'il a choisie** (Lyria 3.5), coupée sur ses mesures (150 BPM) : elle entre sur son groove, fait sa pause sous « More time making music. », repart sur « What will you drop today » et saute à sa fin pour le logo ; elle est baissée sous la voix (environ 10 dB dessous) ; des bruitages sur chaque coupe et chaque clic (3 whooshs différents, clics, pops, frappe), une seule montée vers l'impact du logo. Final mesuré : −14 LUFS, crête −1,2 dBTP, aucune saturation.
- **Coût Flora : 0,21 $** (accord du propriétaire à 14 h 51 pour 0,30 $ au plus) : la voix 0,013 $, 3 musiques à essayer (Stable Audio 3 ×2 à 0,044 $, Lyria 3.5 à 0,105 $).
- **Vérifié** : `hyperframes check` sans erreur (11 avertissements gardés exprès, dans `promo/launch/REVIEW.md`), chaque plan et chaque coupe regardés image par image, aucune image noire dans le fichier rendu, le son présent du début à la fin ; les niveaux de chaque bruitage réglés avec `mix.py`, qui reproduit le mixage de HyperFrames (vérifié sur un 1er rendu : 0,1 dB d'écart). **Le son a été mesuré, pas écouté.**
- La vidéo a été envoyée au propriétaire dans la conversation ; **aucun fichier vidéo, audio ou image tirée de ses vidéos dans le dépôt** (`promo/launch/MEDIA.md` dit d'où vient chaque fichier).
- **Sources** : `promo/launch/` (`SPEC.md` : la référence décortiquée et les plans ; `REVIEW.md` ; `MEDIA.md` ; `capture_ui.py` : les vraies cartes ; `vo_align.py`, `vo_cut.py` : la voix ; `build.py` : les temps, les clips, la musique, les bruitages ; `mix.py` : le mixage ; `compositions/film.html`, `assets/engine.js` : le film).

## Miniature YouTube (sa demande du 2/11, 13 h 48 et 14 h 14)

- **Sa demande.** À 13 h 48 : « une miniature captivante, qui marche avec les codes d'aujourd'hui ». À 14 h 14, avec 3 exemples (Apple « Introducing Apple Creator Studio », Google « Introducing Google Vids », Lovio « an idea ») : « je veux une miniature dans ce style là ». C'est un style de lancement de produit : fond sobre, marque ou deux mots en très grand, l'app en vedette, pas de visage en gros plan.
- **3 versions faites**, une par exemple, en 1280 × 720 (JPG de 44 à 129 Ko). Elles ont été envoyées au propriétaire et ne sont pas dans le dépôt, car elles contiennent des images de ses prises.
  - **Version 3 (conseillée, 9/10).** « on beat. » en très grand sur la vraie carte « Your edit » du film (aperçu de sa prise, barre coupée sur les temps, Play / Shuffle / Export), en perspective, sur un dégradé bleu.
  - **Version 1 (7/10).** Le logo Stalak au-dessus d'un éventail de 7 vraies images de ses 3 prises, sur bleu nuit.
  - **Version 2 (5/10).** Le vrai bouton « ↻ Shuffle » en verre glacé, avec un pointeur, sur fond très clair.
- **Vérifiées** dans un faux fil YouTube, sur ordinateur (168 × 94) et sur téléphone (recherche et accueil), en clair et en sombre : le texte se lit partout, et rien d'important n'est sous la durée « 1:03 ».
- **Titre conseillé**, dans le même esprit : « Introducing Stalak: the edit nobody sees ».
- **Le test.** Avec l'outil « Tester et comparer » de YouTube Studio : la 3 et la 1. Sinon, passer à la 1 si le taux de clics est sous 4 % après 1 000 impressions.
- **Sources :** `promo/youtube/thumbnail/` (`BRIEF.md` : les 3 idées, leurs notes, le test ; `make_media.py`, `thumb.html`, `render.py`, `feed.html`).

## La demande

Le propriétaire, 2/11 à 0 h 09 : une vidéo YouTube de présentation de Stalak (16:9, environ 1 min, motion design, voix off, mouvement, zooms, 3D, déplacements de caméra ; créer le besoin : les problèmes, puis la solution ; tout le monde doit comprendre comment ça marche), plus un YouTube Short qui la condense. À 0 h 14 il a choisi l'histoire A « The edit nobody sees » (parmi 3, `promo/youtube/STORYLINES.md`) et la voix Achird (Flora, 0,013 $ payés). À 0 h 20, avec le fichier de la voix : « raccourcis les blancs trop longs, que ça reste dynamique ».

## v4 : les 3 vidéos du résultat synchro (sa remarque du 2/11, 3 h 52)

- À 0:49, les 3 vidéos (MON, TUE, WED) ne collaient pas au son. Cause : ses prises portent leur propre son, une **autre version de « neva die »** (même beat, autre voix) ; ses lèvres suivent ce son-là, pas le fichier `neva_die_v3` utilisé jusque-là. Et le passage choisi le montrait surtout de dos ou la main devant la bouche.
- Le résultat joue maintenant le son des prises, sur un passage où son visage se voit (prises 2 et 3). Il a validé la synchro sur un test (11 h 27).
- Paroles à l'écran : sa phrase, traduite à sa demande en anglais américain courant : « I put gold on my wounds, scars worth millions. »
- Même correction à la fin du Short. Rien d'autre n'a changé (sa demande).
- **Pour l'app (information, rien à faire dans cette branche)** : si des prises ont été filmées sur une autre version du son (même beat, autre voix), le calage automatique par le son tombe juste sur le beat mais les lèvres suivent l'ancienne voix. Cas réel vu ici avec ses prises de démo.

## v3 : ses remarques du 2/11 à 2 h 28, toutes appliquées

- **Sous-titres en motion design** (film et Short, `promo/youtube/caps.py`) : la voix à l'écran, mot par mot, dans la matière du décor. Sur le tapis : bouts de ruban de masquage, les mots importants sur ruban rouge dans une autre typo (Lilita One). Dans le ciel de Stalak : mots blancs cernés d'encre, les mots importants dans des pastilles blanches en Lilita One bleu (comme les boutons de l'app). En bas en 16:9, en haut dans le Short ; les cadrages de l'interface ont été reculés pour leur laisser la place.
- **« OFF BEAT » (0:10)** : le drop passe une mesure plus loin et une pause de 1 s suit « …land on the beat. » : l'étiquette claque sur la bande et reste environ 1,4 s, jusqu'au gros plan.
- **Le logo au drop (0:18)** : les stalactites sont collées sous l'icône et bougent avec elle ; la petite image qui passait sur le logo (le tas de morceaux aspirés, grossi par la caméra) est supprimée.
- **Plus aucun rebond ni secousse après le drop** : tout se pose en douceur, plus de pulsation sur les temps, plus d'inclinaison de caméra, l'écran de fin ne flotte plus.
- **Format clip (0:39)** : l'écran 16:9 montre **son clip** (celui qu'il a envoyé), plus une prise du 9:16.
- En route : la carte du pack ne chevauche plus (« Make the pack » passait sur « 30 videos »).
- Durées : film 62,7 s, Short 31,3 s.

## Ce qui est fait

- **Le film (16:9, 1920 × 1080, 62,7 s)** : `promo/youtube/`.
  - Le problème, sur un tapis de découpe en 3D : ses 3 vraies prises en pellicules, le cutter qui les découpe en morceaux, une prise qui glisse contre la bande du son sans jamais tomber en face (« +27 frames »), une coupe à côté du temps (« OFF BEAT »), la plongée dans une image qui joue (la bouche et le mot « bounce » qui se décalent : « 1 frame off », « out of sync »), puis TUE, WED, THU, FRI : une nouvelle pile chaque jour.
  - Sur le drop de son instru (« This is Stalak. »), tout est aspiré, le tapis s'ouvre sur le ciel de Stalak, l'icône tombe.
  - La vraie interface, avec ses vrais mots : Pick your song (la bande du son tombe dans « Import your music », « Tempo detected: 157 BPM. »), Add your takes (Import my videos, Film now, Take 1/2/3), les prises calées sur la musique (« All the takes are synced. »), la barre « Your edit » coupée sur les temps pendant que l'aperçu passe d'une prise à l'autre, le cadenas de la synchro des lèvres, « Lyrics on screen » (Paste my lyrics, Sync by tapping, TAP), le rythme Chill → Punchy qui recoupe la barre, Export (vertical TikTok, Reels, Shorts ; clip YouTube 16:9 avec le badge PRO), le pack (badge Creator Plus, 30 vidéos qui sortent de la chanson, « Pack ready: 30 videos, all different. », puis une par jour MON → SUN).
  - Le résultat : trois vidéos du pack (MON, TUE, WED) sur sa chanson (le son de ses prises, v4), chacune coupée à son rythme, ses paroles à l'écran en même temps sur les trois.
  - « You film. Stalak edits. », puis l'icône, le logo, stalak.app, « Free · No download · No sign-up ».
- **Le Short (9:16, 1080 × 1920, 31,3 s)** : `promo/youtube/short/`, même moteur en mode portrait (cartes de l'app mises en hauteur), mêmes sous-titres animés, en haut (beaucoup regardent sans le son). Texte : « Now comes the part nobody sees: the edit. » → le temps raté → les lèvres décalées → une pile par jour → « This is Stalak. » sur le drop → le son → les prises → calées et coupées sur le temps → 2 mesures de sa chanson → « You film. Stalak edits. » → stalak.app.
- **La voix** : les silences de 1 à 2,8 s laissés par la synthèse sont ramenés à 0,04–0,2 s dans une phrase et ~0,3 à 0,4 s entre les phrases (`vo_cut.py`).
- Son : sa chanson et son instru (grille mesurée, 157 BPM), un bruitage par action, voix mesurée 7,5 LU au-dessus de la musique ; mastering −14 LUFS.
- Les deux vidéos ont été envoyées au propriétaire dans la conversation. **Aucun fichier vidéo ou audio dans le dépôt** (`MEDIA.md` dit d'où vient chaque fichier).

## Fichiers

- `promo/youtube/STORYLINES.md` (les 3 idées), `SPEC.md` (le film plan par plan, et ce qui a changé en route), `REVIEW.md` (contrôles), `MEDIA.md`.
- `promo/youtube/vo_align.py`, `vo_cut.py` (la voix), `build.py` (le film), `build_short.py` (le Short), `caps.py` (les sous-titres des deux), `assets/engine.js` (le moteur, 16:9 et 9:16), `compositions/film.html`, `index.html`, `assets/times.js` (générés).
- `promo/youtube/short/` : `index.html`, `compositions/film.html`, `assets/times.js` (générés par `build_short.py`), `assets/engine.js` (copie du moteur) ; les dossiers de médias sont des liens vers `../assets/`.

## SQL, tests

Aucun (pas de code du site ni de l'app). Contrôles HyperFrames : `lint` 0 erreur pour les deux ; `check` : une seule erreur de mise en page, voulue (carte des paroles par-dessus la carte de montage, marquée).

## Pour le propriétaire

- **Avant de publier sur YouTube : vérifier que la licence de l'instru de « neva die » autorise YouTube** (sinon réclamation Content ID possible).
- **Miniature** : choisir parmi les 3 (la 3 est conseillée). Pour mettre une miniature perso, YouTube demande une chaîne vérifiée (par téléphone). Pour l'outil « Tester et comparer », il faut les fonctions avancées (vérification d'identité), sur ordinateur.
- Titre conseillé : « Introducing Stalak: the edit nobody sees ». Description et publication sur la chaîne @stalak_app : Marketing peut les préparer à sa demande.
- **Film de lancement** : titre conseillé « Introducing Stalak » ; la miniature 3 (« on beat. ») va aussi avec lui. Sa musique a été faite dans Flora (Lyria 3.5) : **vérifier dans les conditions de Flora que l'usage commercial sur YouTube est permis** avant de publier.
