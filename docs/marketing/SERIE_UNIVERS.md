# Série « T-Crazy » : l'univers, comment il est fabriqué

> Marketing & croissance, 15/11/2026, d'après la décision du propriétaire du 15/11 à 22 h 26 et le message du Chef de projet de 22 h 42.
> Les choix se font dans Studio Stalak, onglet **Univers** (collection `univers`). Aucun script avant que l'univers soit choisi.

## Décision du propriétaire, 15/11 à 23 h : tout est dessiné par Claude

« Je ne veux pas que tu génères sur Flora le visuel, seulement les voix. » Les personnages, les décors, le bandeau et le logo sont donc tous **dessinés par Claude, en code**. Flora ne sert qu'aux voix. Cette règle est notée dans « Mes goûts » (`regle-visuels-claude`).

Les 3 premières planches de style avaient été générées sur Flora (0,42 $). Elles ont été retirées de la page et remplacées par les planches dessinées.

## Étape 1 : le style (en attente du choix du propriétaire)

Le même Liam dans la même chambre-studio, dessiné de 3 façons : `tools/serie/engine/tcrazy.js`, page `tcrazy.html?s=1|2|3`, planches 3:4 faites par `tools/serie/univers.py`.

| Option | Ce qui le distingue |
|---|---|
| Style 1 · Anime US | traits fins avec un contour extérieur plus épais, regards plissés, mâchoire anguleuse, ombres franches en aplats, lumière chaude de fin de journée |
| Style 2 · Sticker givré | gros contours, liseré blanc d'autocollant, grosse tête, couleurs vives bleu Stalak et glace : le plus proche de la mascotte |
| Style 3 · BD imprimée | traits irréguliers comme au pinceau, trame de points dans les ombres, grain de papier, bleu nuit, glace et orange |

Liam y porte :
- des locks courtes (entièrement noires depuis le 16/11 ; remplacées ensuite par une casquette à l'envers et une coupe courte : voir l'étape 2a) ;
- une doudoune bleu Stalak ouverte sur un tee-shirt blanc ;
- un jean large et des baskets blanches.

Il tient son casque d'une main et, de l'autre, son téléphone levé : il se filme. Dans la chambre :
- un matelas au sol et de la mousse scotchée de travers ;
- un micro avec un filtre anti-pop ;
- un ordi portable avec une appli d'enregistrement inventée, sans logo ;
- un néon bleu glace, une fenêtre givrée au coucher du soleil ;
- des posters de rappeurs inventés, sans texte.

**16/11, 1 h 52 : Style 1 · Anime US retenu.** Corrections du propriétaire sur Liam (notées dans « Mes goûts », `regle-liam-look`) :
- locks entièrement noires, sans aucune mèche blanche ;
- pas de chaîne ;
- le col de la doudoune ne cache pas le cou ;
- les deux yeux regardent dans la même direction.

À 2 h, nouvelle remarque : « je trouve son corps trop large ». Liam est donc plus fin (doudoune, manches, jean, baskets) : un ado de 15 ans dans une doudoune trop grande. La planche corrigée est redéposée dans la fiche `style` (`a_choisir`). Les planches des styles 2 et 3 sont retirées. Les 4 versions de Liam viennent après sa validation.

**16/11, 2 h 04 : planche validée par le propriétaire** (fiche `style` en `choisi`).

## Étape 2a : les 4 versions de Liam (version 4 choisie le 16/11)

Des planches personnage sont dessinées en code (`tools/serie/engine/liam.js`, page `liam.html?v=1..4`). Sur chacune : Liam de face, de profil et en 4 expressions (frime, colère, panique, fierté). Les 4 planches sont dans la fiche `liam`, en `a_choisir`.

La coiffure a changé deux fois le 16/11 :
1. **2 h 11** : la première coupe (des locks) « ne va pas du tout », surtout de profil. Avec une image de référence, elle devient des vanilles (twists) noires, raie au milieu, jusqu'au menton (`regle-liam-coupe` dans « Mes goûts »).
2. **2 h 24** : « j'aime toujours pas du tout sa coupe ». Le propriétaire demande **une casquette à l'envers, dans le style des casquettes qu'il envoie** (une snapback à visière plate), **et une coupe super simple en dessous**. La règle est notée dans « Mes goûts » (`regle-liam-casquette`). Elle passe avant `regle-liam-coupe`.

Ce qui est dessiné maintenant, pareil dans les 4 versions :
- **La casquette, à l'envers.** C'est une snapback haute et rigide, à visière plate. De face, on voit l'arrière de la casquette : la languette à pressions et l'ouverture sur le front, où on voit ses cheveux. De profil, la visière plate pointe vers l'arrière. On garde la forme des casquettes de référence, sans leurs logos (équipes de baseball, marque) : la nôtre a seulement un petit flocon brodé sur le côté.
- **La coupe, très simple** : des cheveux noirs courts. On voit des pattes nettes et les tempes de face. De profil, on voit les cheveux au-dessus et derrière l'oreille, avec une ligne nette à la nuque. Les oreilles sont dégagées.

| Version | Visage | Casquette | Tenue |
|---|---|---|---|
| 1 · Le classique | anguleux | bleu roi (la plus proche de sa référence) | doudoune ouverte, tee blanc, jean large, baskets basses |
| 2 · Le sweat | rond | bleu nuit | doudoune courte sur un sweat gris, cargo beige, baskets montantes |
| 3 · Le sans-manches | long | noire (gris anthracite, pour qu'on lise la languette) | doudoune sans manches sur un tee manches longues glace, jogging noir |
| 4 · Le deux-tons | large, sourcil fendu, petite boucle d'oreille | glace, visière et languette bleues | doudoune bleue aux épaules glace, tee noir, jean clair |

Dans les 4 versions : la même casquette et la même coupe, pas de chaîne, le cou visible, les yeux droits, un corps fin, la doudoune bleu Stalak. Le propriétaire peut mélanger les versions, par exemple prendre le visage d'une version avec la casquette d'une autre.

**2 h 40** : « l'arrière de son crâne en vue de profil est trop long ». De profil, l'arrière de la tête est raccourci, et la casquette, les cheveux, la nuque et la visière suivent. La remarque est notée dans « Mes goûts » (`pas-crane-long`).

Les 4 planches sont redéposées dans la fiche `liam`, en `a_choisir`. Les images des versions précédentes sont retirées de la page.

**16/11, 2 h 44 : Liam est choisi.** Le propriétaire prend la **version 4, « Le deux-tons »** :
- visage large, sourcil fendu, petite boucle d'oreille ;
- casquette glace à visière bleue, portée à l'envers ;
- doudoune bleue aux épaules glace, tee noir, jean clair, baskets basses.

À sa demande (« baisse un peu la hauteur de sa casquette »), le haut de la casquette est descendu, de face comme de profil. La remarque est notée dans « Mes goûts » (`pas-casquette-haute`). La fiche `liam` est en `choisi`, avec la planche corrigée. C'est cette planche qui sert de référence pour toute la série.

À noter pour la suite : la planche de style validée (`tcrazy.js`) montre encore Liam avec ses premières locks. Les scènes de la série seront redessinées avec la version de Liam choisie.

## Étape 2b : les autres personnages (choisis le 16/11 à 3 h 27)

Après « ok suivant » (16/11, 2 h 54), les 6 autres personnages sont dessinés en code, 2 versions chacun.
- Le dessin est fait par `tools/serie/engine/cast.js`, page `cast.html?c=nadia|deuce|maya|bigmo|reyes|mascotte&v=1|2`.
- Chaque planche montre le personnage de face, de profil et en 4 expressions (frime, colère, panique, fierté).
- Les planches sont dans les fiches de l'onglet Univers, en `a_choisir`.

| Personnage | Version 1 | Version 2 |
|---|---|---|
| Nadia | L'infirmière : puff et bandeau corail, tenue bleu-vert, long gilet beige, sabots, mug | **Le chignon (choisie le 16/11 à 3 h 09)** : chignon et pince glace, tenue lilas, longue doudoune bleu nuit, café à emporter |
| Deuce | Le manager : dégradé avec raie rasée, blazer sur sweat à capuche, sacoche, oreillette | Le revendeur : bob beige, survêtement vert à liseré blanc, boîte de baskets |
| Maya | Les tresses : queue haute et chouchou lilas, créoles, sweat lilas, casque au cou | Le carré : carré noir à frange, lunettes rondes, pull moutarde, jean droit |
| Big Mo | Le boss du quartier : coupe rase, barbe, lunettes noires, doudoune noire, pendentif flocon | Le flashy : crâne rasé, grosse barbe, lunettes violettes, blouson universitaire « M » |
| M. Reyes | L'épicier : dégarni, moustache, lunettes de lecture, chemise à carreaux, tablier vert | Le vétéran des 90s : casquette plate, bouc gris, coupe-vent rétro, cure-dent |
| La mascotte | Taille personnage, fidèle à ses autocollants (capuche fourrée, locks à perles, moufles, logo AA) | Dans le téléphone : ronde et petite comme ses autocollants, elle fait coucou parmi des flocons et des glaçons |

Ce qui a compté dans « Mes goûts » :
- tout est dessiné en code ;
- les têtes de profil restent compactes (`pas-crane-long`) ;
- aucun logo de marque ni d'équipe : le « M » de Big Mo est inventé, et le logo AA est la marque du propriétaire, déjà sur la mascotte officielle ;
- rien n'est repris de « The Boondocks ».

Les expressions de la mascotte reprennent les signes de ses autocollants :
- frime : les lunettes et l'étincelle ;
- colère : le signe de colère ;
- panique : « !! » ;
- fierté : des traits de joie.

Ses locks gardent les perles blanches de l'officielle. La remarque « pas de blanc » concernait Liam.

**16/11, 3 h 27 : les choix du propriétaire** (« c'est bon j'ai fait mes choix ») :
- Deuce : version 1, « Le manager » ;
- Maya : version 1, « Les tresses » ;
- Big Mo : version 1, « Le boss du quartier » ;
- M. Reyes : version 1, « L'épicier ».

**La mascotte n'est pas redessinée.** Sa note sur la fiche : « je veux garder la mascotte de Stalak de base, pas de personnage » (notée automatiquement dans « Mes goûts »). Les 2 versions dessinées sont donc retirées. Ce qui la remplace :
- la mascotte officielle, telle quelle, avec ses vrais autocollants (`site_src/emoji`), sans retouche ;
- elle vit dans l'écran du téléphone de Liam, et seul le téléphone est dessiné dans le style de la série ;
- elle ne parle pas : elle réagit avec ses autocollants (cool, colère, choc, hype pour les 4 expressions) ;
- elle arrive à la fin de l'épisode, quand Liam ouvre Stalak.

La fiche `mascotte` montre cette planche (`mascotSheet()` dans `cast.js`, page `cast.html?c=mascotte`), en `a_choisir`. Il reste au propriétaire à la valider.

## Étape 2c : les décors (déposés le 16/11, à choisir)

Les décors sont dessinés en code, vides, prêts pour les personnages, en 1080 × 1920 (9:16) :
- le moteur est `tools/serie/engine/decors.js`, page `decors.html?d=<lieu>&v=1|2&t=jour|nuit|soir` ;
- les planches 3:4 sont faites par `python3 tools/serie/univers.py decors` (textes et gros plans dans `DECOR_BOARDS`).

Chaque fiche de l'onglet Univers a 2 versions, en `a_choisir`. Toutes les enseignes sont inventées : aucune vraie marque, aucun vrai logo.

| Fiche | Version 1 | Version 2 |
|---|---|---|
| La chambre-studio de Liam (de jour et de nuit) | Le studio sous la fenêtre : la chambre de la planche de style, vide (matelas au sol, mousse de travers, micro, ordi avec une appli inventée) ; la nuit, néon bleu glace, lune et ville allumée | Le placard-studio : le placard en cabine de chant (couettes, micro, pancarte « STUDIO »), bureau, boîtes de baskets, lit sous une fenêtre à stores ; la nuit, une bande LED bleu glace |
| La cuisine et le salon | La cuisine : frigo couvert de factures et de magnets, évier plein de vaisselle, cafetière de Nadia, lumière de fin d'après-midi | Le salon : canapé usé avec une pièce cousue, plaid, photos de famille, télé, table basse pleine de courrier, lumière à travers les stores |
| La rue et l'épicerie de M. Reyes | La rue pavillonnaire, l'après-midi : petites maisons, poteau et fils électriques, l'épicerie « REYES » (store rayé, « PROMO », « OUVERT », coffre « GLAÇONS ») | La rue en ville, le soir : immeubles en briques, escaliers de secours, l'épicerie au pied avec son enseigne lumineuse |
| Le terrain de basket grillagé | Le terrain grillagé en fin de journée : panier au cercle tordu, filet déchiré, immeubles derrière, banc | Sous le pont, la nuit : sous l'autoroute entre deux piliers, un seul lampadaire orange, la ville au loin |
| Le lycée et le bus scolaire jaune | Le couloir : casiers bleus (quelques rouges), néons, sol qui brille, porte « SORTIE » | Le bus jaune, vu de l'intérieur : rangées de sièges verts, allée, grandes fenêtres, porte de secours au fond |
| Le toit au coucher du soleil | Le château d'eau, au coucher du soleil : climatiseurs, chaise pliante, ville et ciel orange | Le toit aménagé, au crépuscule : vieux canapé vert, guirlande lumineuse, enceinte, plantes, glacière bleue au flocon |

Pour le lycée, les 2 versions sont 2 lieux différents : le propriétaire peut garder les deux.

**16/11, vers 4 h : les choix du propriétaire.**

| Décor | Version choisie |
|---|---|
| La chambre | 2 · Le placard-studio, **à refaire** (voir le poster ci-dessous) |
| La cuisine et le salon | 1 · La cuisine |
| La rue | 1 · La rue pavillonnaire |
| Le terrain | 1 · Le terrain grillagé |
| Le lycée | 1 · Le couloir |
| Le toit | 2 · Le toit aménagé |

**Le poster de la chambre est en attente.** Sur la fiche, le propriétaire a demandé que le poster du haut soit un poster de Pop Smoke. Sa note a été ajoutée automatiquement dans « Mes goûts ». Il a ensuite envoyé dans la conversation une photo retravaillée de l'artiste, avec le titre de son album.

Marketing n'a dessiné ni intégré ce poster : c'est l'image d'un vrai artiste, sur le compte de la marque, sans les droits. C'est la même règle que pour les vrais morceaux connus. Le propriétaire a répondu qu'il décide et qu'il prend la responsabilité. Marketing a maintenu qu'il ne le ferait pas lui-même.

3 idées sont proposées à la place :
- un rappeur inventé ;
- T-Crazy lui-même ;
- une pochette du propriétaire, avec son image à lui.

On attend son choix.

## Étape 2d : le bandeau et le logo (déposés le 16/11, à choisir)

Dessinés en code dans `tools/serie/engine/frame.js` (page `frame.html?f=<image>`). Ce fichier compose aussi une vraie image de la série : un décor, les personnages placés par leurs pieds, puis l'habillage.
- Les personnages sont dessinés par `LIAM.figure()` et `CAST.figure()`, avec l'expression voulue.
- Les planches sont faites par `python3 tools/serie/univers.py habillage`.

Tout reste dans la zone visible de TikTok, Reels et Shorts. Rien n'est placé :
- dans les 8 % du haut ;
- dans les 20 % du bas ;
- sur le bord droit, entre 35 % et 80 % de la hauteur.

Les textes sont des exemples, puisqu'aucun script n'est encore écrit :
- le titre « LA VAISSELLE OU LA GLOIRE » ;
- la phrase de Nadia ;
- la phrase du narrateur reprise de sa fiche.

| Fiche | Version 1 | Version 2 | Version 3 |
|---|---|---|---|
| Le bandeau et les sous-titres (dans la cuisine : l'accroche avec le bandeau, puis le narrateur sans le bandeau) | La carte glacée : carte blanche de Stalak, gros contour, ombre dure, glaçons dessous ; sous-titres sur une carte blanche, le nom dans une étiquette à sa couleur | La bande bleue : bande penchée de bord à bord, neige posée dessus ; sous-titres en grosses lettres blanches cernées de noir, le nom au-dessus | L'étiquette glace : ticket glace, numéro de l'épisode à gauche en bleu nuit ; sous-titres dans un cadre bleu nuit bordé de glace, le nom dans une pastille |
| Le logo de la série (seul et sur une miniature) | « T-CRAZY » : badge rond bleu glacé en haut, la casquette de Liam posée dessus | « LE PROCHAIN » : lettres bleues nappées de glace, « 15 ans · 0 abonné » dessous | « 0 ABONNÉ » : un gros « 0 » en glace avec ses glaçons, « ABONNÉ » sur une étiquette bleue |

Les logos ne portent pas le nom de Stalak : Stalak n'arrive qu'à la fin de l'épisode (`pas-pub-debut`). Le propriétaire peut mélanger le dessin d'un logo avec le titre d'un autre. La piste « Hustle d'hiver » reste possible s'il la préfère.

**16/11, 4 h 24 : les retours du propriétaire.**
- La mascotte officielle est validée (fiche `mascotte` en `choisi`).
- Le bandeau : « les sous-titres sont bons, mais je veux la bande de titre de la version 2 ». Sa note a été ajoutée automatiquement dans « Mes goûts ». La version 4, « Ton mélange », réunit la bande bleue de la version 2 et les sous-titres de la version 1. Elle est dans la fiche `bandeau`, en `a_choisir`.
- **Pas de générique** : « je veux pas de générique ». Les épisodes commencent directement par l'accroche, sans intro ni musique de générique. C'est noté dans « Mes goûts » (`pas-generique`), et la fiche « Le générique » est marquée comme abandonnée.
- Le logo n'est pas choisi. On lui demande s'il en veut un pour les miniatures, maintenant qu'il n'y a pas de générique.

**16/11, 4 h 28 : ses réponses.**
1. **Les miniatures** : « je veux que tu me crées les miniatures des TikTok à chaque fois en même temps que tu génères la vidéo, et je pourrai les retrouver dans Studio Stalak ». La règle est notée dans « Mes goûts » (`regle-miniatures`). Chaque vidéo aura donc sa miniature, faite en même temps qu'elle et déposée avec elle dans la page. Le logo devient optionnel : la fiche le dit, et il ne sert que si le propriétaire veut le voir sur les miniatures.
2. **Pas de poster** dans la chambre. C'est noté dans « Mes goûts » (`pas-poster-chambre`), et ça remplace sa note précédente sur le poster. Le poster est retiré du placard-studio (`decors.js`). La planche est redéposée dans la fiche `decor-chambre`, en `a_choisir`.
3. **Les voix du narrateur : « oui ».** Les 3 voix sont générées sur Flora avec Gemini 3.1 Flash TTS, en français, sur la même phrase : « Voici Liam. 15 ans. Zéro abonné. Persuadé d'être le prochain. » Elles coûtent 0,039 $ pour les 3.

| Voix | Ce que Google en dit | Durée | Pauses entre les phrases |
|---|---|---|---|
| 1 · Charon | informative | 6,7 s | environ 0,6 s |
| 2 · Algenib | rocailleuse | 7,1 s | environ 0,4 s, la plus fluide |
| 3 · Algieba | douce | 7,7 s | environ 0,75 s |

Elles sont dans la fiche `narrateur`, en `a_choisir`. Aucune pause n'a été ajoutée (`pas-voix-pauses`). La page n'accepte pas les fichiers .mp3 : les voix sont donc déposées en .mp4 audio (AAC), que le lecteur de la page lit.

**16/11, 4 h 36 : ses réponses.**
- **Le bandeau est choisi** : la version 4, « Ton mélange ».
- **La chambre sans poster** : « ok ». D'après cette réponse, la fiche `decor-chambre` passe en `choisi` (version 2).
- **La miniature est faite par Claude, dans le même style que la vidéo** (`regle-miniatures-style`).
  - Un exemple est dessiné dans `frame.js` (image `miniature-exemple`, planche `univers.py habillage miniature`).
  - Il est déposé dans une nouvelle fiche `miniature`, en `a_choisir`.
  - Le titre et les visages restent dans le centre 3:4 que garde la grille d'un profil TikTok (de y 240 à y 1680).
- **Le narrateur : la voix 3, Algieba, « un peu plus rapide »** (`regle-narrateur-voix`).
  - La même lecture est accélérée sans changer la voix, avec ffmpeg `atempo`, pour 0 $ : ×1,1 (7,0 s) et ×1,2 (6,4 s), à côté de l'originale (7,7 s), dans la fiche `narrateur`.
  - Pour les épisodes, chaque réplique du narrateur sera générée avec Algieba, puis accélérée de la vitesse choisie.

## Étape 2e : les ambiances musicales (déposées le 16/11, à choisir)

Le propriétaire n'a pas envoyé de beats : « cherche par toi-même » (16/11, 4 h 40). Les musiques viennent donc de Pixabay.
- L'usage commercial est permis, sans mention obligatoire.
- Les titres sont gardés seulement s'ils ne sont pas enregistrés au Content ID (pas de bouclier) et s'ils sont faits par des humains, pas par une IA.
- La recherche est faite dans le navigateur, avec les données de la page Pixabay (`hasYoutubeContentId`, `isAiGenerated`).
- Les fichiers sont téléchargés sur `cdn.pixabay.com`. Le tempo et la tonalité sont mesurés avec librosa, car Claude ne peut pas les écouter.

La fiche unique `musique-fonds` est remplacée par 4 fiches, une par ambiance, pour que le propriétaire puisse choisir chacune. Il y a 2 titres par fiche.

| Ambiance | A | B |
|---|---|---|
| 1 · Galère (`musique-galere`) | « it only rains when you're gone », Sam_Kamau : piano et cordes, environ 70 BPM, ré mineur — https://pixabay.com/music/solo-piano-it-only-rains-when-youx27re-gone-179560/ | « Remember Lofi Sad », AudiolistProduction : lo-fi, environ 89 BPM, la mineur — https://pixabay.com/music/beats-remember-lofi-sad-20831/ |
| 2 · Plan foireux (`musique-plan`) | « Dusty Trail Jams », Rockot : hip-hop comique, environ 99 BPM — https://pixabay.com/music/beats-dusty-trail-jams-comedy-cinematic-hip-hop-315882/ | « Sneeze », Rockot : hip-hop comique — https://pixabay.com/music/alternative-hip-hop-sneeze-comedy-hip-hop-beat-603287/ |
| 3 · Hustle (`musique-hustle`) | « Jazzy Hip-Hop Upbeat », BombinSound : environ 96 BPM — https://pixabay.com/music/old-school-hip-hop-jazzy-hip-hop-upbeat-joyful-mood-631776/ | « Game Show », Kulakovka : environ 92 BPM — https://pixabay.com/music/old-school-hip-hop-game-show-618590/ |
| 4 · Victoire (`musique-victoire`) | « Funk Vintage », BerryDeep : funk soul, environ 112 BPM — https://pixabay.com/music/old-school-funk-funk-vintage-613023/ | « Funk Upbeat », Loksii : funk, environ 118 BPM — https://pixabay.com/music/funk-funk-funk-upbeat-240482/ |

Les fichiers sont déposés en .mp4 audio (AAC 128 kbit/s), en entier. Il n'y a plus de générique, donc pas de musique de générique.

**16/11, 4 h 51 : les choix du propriétaire.**
- Plan foireux : B, « Sneeze » (Rockot).
- Hustle : B, « Game Show » (Kulakovka).
- Victoire : B, « Funk Upbeat » (Loksii).
- Galère : **à refaire**, « c'est trop calme » (note ajoutée automatiquement dans « Mes goûts »).

Pour la galère, 3 beats hip-hop tristes avec une vraie batterie sont proposés. La part de batterie mesurée est de 0,44 à 0,72, contre 0,03 et 0,16 pour les 2 premiers. Tous sont sans Content ID et faits par des humains.

| Galère, nouvelle série | Titre, auteur, lien |
|---|---|
| A | « Boom-bap Emotional Storytelling », onesevenbeatxs : boom bap en mineur, environ 86 BPM — https://pixabay.com/music/beats-boom-bap-emotional-storytelling-rap-beat-prod-by-onesevenbeatxs-311099/ |
| B | « Scars », viavebeatz : piano triste sur un beat qui tape, environ 92 BPM — https://pixabay.com/music/beats-sad-hip-hop-piano-type-beat-scars-535161/ |
| C | « Where I'm From », TouchProRecords : mélancolique et plus dur, environ 80 BPM — https://pixabay.com/music/alternative-hip-hop-where-ix27m-from-hip-hop-instrumental-603511/ |

Les fichiers des 2 premiers titres de la galère, et des voix Charon et Algenib qui n'ont pas été retenues, sont retirés de la page.

**16/11, 4 h 56 : l'univers est complet.**
- La galère : B, « Scars » (viavebeatz).
- Le narrateur : Algieba à ×1,2 (`regle-narrateur-vitesse` dans « Mes goûts »).
- Le logo reste optionnel.

La bible en une page est écrite : `docs/marketing/SERIE_BIBLE.md`. Les voix de Liam, Nadia, Deuce et Maya restent à choisir, de la même façon que celle du narrateur.

**16/11, 11 h 18 : « oui » pour les voix des personnages.**

12 voix sont générées sur Flora (Gemini 3.1 Flash TTS, en français) : 3 par personnage, sur une phrase qui lui ressemble. Elles coûtent 0,156 $, et le solde Flora est d'environ 2,57 $. Elles sont dans 4 nouvelles fiches, en `a_choisir`. Aucune pause n'a été ajoutée.

| Fiche | Phrase | Voix proposées (ce que Google en dit) |
|---|---|---|
| `voix-liam` | « Moi, c'est T-Crazy. Retiens bien ce nom, parce que l'année prochaine, tout le monde va le crier. » | Puck (enjouée), Fenrir (excitée), Zubenelgenubi (décontractée) |
| `voix-nadia` | « T-Crazy mange pas si T-Crazy a pas fait la vaisselle ! » | Kore (ferme), Gacrux (mature), Pulcherrima (directe) |
| `voix-deuce` | « Écoute-moi bien, frérot : on va scaler ta street-cred. » | Umbriel (tranquille), Schedar (posée), Enceladus (soufflée) |
| `voix-maya` | « Tu sais que ta bouche est décalée sur toute la vidéo, là ? » | Leda (jeune), Callirrhoe (décontractée), Despina (douce) |

Les voix de Big Mo et de M. Reyes seront choisies quand un épisode validé les fera parler.

## Étape 2 : tout l'univers dans le style choisi (après le choix)

- Liam : 4 versions, chacune de face, de profil et avec 4 expressions (frime, colère, panique, fierté).
- Nadia, Deuce, Maya, Big Mo, M. Reyes : 2 versions chacun. La mascotte reste l'officielle (décision du 16/11 à 3 h 27).
- Les 6 décors : 2 versions chacun, plus la chambre de nuit.
- Le bandeau et les sous-titres, le logo de la série : 3 versions chacun.
- Le narrateur : 3 voix sur la même phrase (Flora).
- Les musiques : les 4 ambiances, 2 ou 3 propositions chacune (`type: "audio"`). Plus de générique depuis le 16/11 (décision du propriétaire). D'abord les beats du propriétaire ou d'ALASKA (demandés le 15/11). Sinon, Pixabay (usage commercial permis), sans les titres marqués d'un bouclier, avec la source notée pour chaque titre. Jamais de morceau connu.

## Étape 3 : les storyboards des épisodes (après les scripts validés, 16/11)

- Une image par moment du script, dessinée avec l'univers choisi : personnages, décors, bandeau v4 et sous-titres v1.
- Le code : `tools/serie/engine/storyboard.js`, chargé par `frame.html`.
  - Chaque plan est une entrée de `FRAMES` : `set`, `chars`, `over`.
  - Les options d'un plan : `zoom`, `dim`, `shade`, `setOver`, `front`, `plain`.
  - Les options d'un personnage : `pose`, `clip`, `after`, `sil`, `flip`.
- Les planches : `SERIE_WORK=<dossier> python3 tools/serie/univers.py storyboard ep1 [ep2 …]`. Elles sont déposées dans le champ `visuels` de la fiche de l'épisode.
- Les écrans de téléphone montrent les vraies captures de Stalak (`site_src/aide/fr-*.jpg`) et les autocollants officiels de la mascotte.
- Les autres écrans sont notre propre interface : jamais celle d'une vraie application.
- GTA 6 : le nom seulement. Le jeu n'est jamais montré (une lumière d'écran sur le mur suffit).
- Le numéro à l'écran et le « prochain épisode » suivent l'ordre de sortie (proposé le 16/11, à confirmer par le propriétaire).

## Étape 4 : la fabrication des épisodes (16/11)

- Le pipeline : `SERIE_WORK=<dossier> python3 tools/serie/tcrazy.py <ep> <étape>`, avec les étapes `prompts`, `voices`, `plan`, `frames [a b]`, `encode`, `audio`, `mux`, `sheet`, `thumb`, `deliver`. Les plans de chaque épisode sont dans `tools/serie/episodes/tcrazy_eps.py`, et les images dans `tools/serie/engine/storyboard.js`.
- **Version 3 (16/11, 18 h)**, d'après les remarques du propriétaire, pour toute la série :
  - `anim.js` : les petites actions d'un plan, écrites `K({...})` dans le storyboard, en secondes depuis le début du plan. On peut faire apparaître, bouger, rouler, clignoter, et dessiner l'onde d'un doigt qui appuie ;
  - le passage par le noir (`dip=True`) à chaque changement de moment ou de lieu, avec au moins 1 s avant la première réplique ;
  - les écrans dessinés : l'éditeur où Liam fait glisser sa vidéo (« DÉCALÉ »), la page « Nouvelle vidéo » avec son bouton « Publier », et le fil façon TikTok, sans logo (cœur, commentaires, partage, pseudo), avec la notification qui tombe et les commentaires qui montent ;
  - la boule d'herbes sèches qui roule sur un lieu vide ;
  - le zoom d'un décor ne dépasse plus ses bords (avant, une bande noire pouvait apparaître, comme en bas du plan où Liam tombe dans « Le manager ») ;
  - plus de blanc : `plan` n'ajoute plus que de toutes petites pauses (0,15 s avant une réplique, 0,2 s après), et jamais dans un plan aux actions calées (`fixed=True`).
- **Voix vérifiées** : une réplique d'un seul mot est comparée au son attendu (la voyelle de la fin), avec le script `formants.py` du dossier de travail. Le « Non. » de Maya (épisode 2), qui disait « ouais », est refait (2 essais, le bon gardé).
- **Version 4 (16/11, 20 h)**, d'après la remarque du propriétaire sur « Le manager » (« des lumières plus réalistes… utilise aussi hyperframes »), pour toutes les vidéos à venir :
  - `engine/lights.js` : le réglage de lumière de chaque décor, à chaque heure. La partie `under` est dessinée avec le décor, derrière les personnages (le soleil, le cœur des lampes, l'enseigne « OUVERT » qui grésille, les reflets des vitres, les scintillements du décor) ; la partie `over` passe par-dessus le décor et les personnages (la couleur de l'heure, la lueur large des lumières fortes, les rayons, les reflets de l'objectif). Fait pour la rue (jour, après-midi, coucher de soleil), le terrain de basket (jour, après-midi), la chambre de Liam (jour : le soleil passe par les stores et dessine des bandes au sol ; nuit : la bande LED, les écrans et la lune éclairent, et la nuit tombe aussi sur les personnages), la cuisine (jour : la fenêtre, le robinet, le frigo qui brillent) et le couloir du lycée (les plafonniers, « SORTIE » en vert). Un décor montré en bande (`band()`) a aussi ses lumières ;
  - ce qui brille porte la classe `shiny` dans le dessin (boucles d'oreilles, lunettes de soleil, chaîne et pendentif, sachets de glaçons, objectif d'un téléphone, vitres du bus) et un écran la classe `screen` : `LIGHTS.attach` y pose un scintillement, à la bonne taille, qui suit le personnage ;
  - `anim.js` : de nouvelles petites actions (`tw` scintille, `flk` grésille, `sweep` fait passer un reflet, `walk` fait marcher un personnage avec ses pas, `tilt` le fait tomber) ;
  - la rue a un lampadaire sur son poteau, éteint le jour, allumé le soir ; `rue` à l'heure `coucher` : le soleil se couche derrière les maisons, la vitrine et les fenêtres s'allument ;
  - l'étape `hf` : l'épisode devient un projet HyperFrames (`<travail>/<ep>/hf/index.html`) dont notre moteur est le runtime (HyperFrames demande l'image d'un instant avec `hf-seek`, le moteur la dessine), plus deux éléments du catalogue HyperFrames, installés à la volée et jamais dans le dépôt : `organic-light-leak-overlay` sur chaque passage par le noir et `vignette` le soir. Le rendu : `npx hyperframes render` avec `HYPERFRAMES_BROWSER_PATH` sur le Chrome déjà installé (le téléchargement de Chrome par HyperFrames est bloqué ici). Environ 12 à 15 min par épisode (2 processeurs), contre 5 min avec `frames` ;
  - un sous-titre trop court (« Pas mal. » restait 0,3 s) est recoupé avec son voisin en deux moitiés lisibles (relevé par la vérification HyperFrames) ;
  - sur une carte de sous-titre, jamais un mot seul sur la dernière ligne : les deux lignes sont recoupées là où elles sont le plus égales (`wrapEven`), et « GTA 6 » ne se coupe plus en deux (relevé sur les planches contact) ;
  - les bruits de pas (`steps.wav`) sont fabriqués par le pipeline ; un bruitage peut se placer depuis la fin d'un plan (temps négatif).

## Coûts

- **Visuels : 0 $** (dessinés en code).
- **Voix (Flora, Gemini), 0,013 $ par génération** :
  - narrateur : 3 essais, 0,039 $ (dépensés le 16/11) ;
  - voix de Liam, Nadia, Deuce et Maya : 0,156 $ (dépensés le 16/11) ;
  - ensuite, environ 0,05 à 0,08 $ par épisode (une génération par personnage et par façon de parler, découpée ensuite).
- **Musique : 0 $** (Pixabay, choisie le 16/11 faute de beats du propriétaire).
- Solde Flora au 15/11 : 2,76 $, après les 0,42 $ des planches générées puis retirées.
- 16/11 : 0,039 $ pour les 3 voix du narrateur ; solde Flora environ 2,72 $.
- 16/11, fabrication : épisode 1 v2 0,091 $, épisode GTA 6 0,169 $ puis 0,078 $, épisode 2 0,039 $ puis 0,026 $ (le « Non » de Maya, 2 essais), « Le manager » 0,143 $, « Le clip façon GTA » 0,156 $.
- 16/11 à 20 h : « Le manager » v3, 2 répliques ajoutées pour Liam, 0,026 $. Les lumières et HyperFrames : 0 $.
