# Stalak — film de lancement « façon Lovio » (2/11/2026)

**La demande.** Le propriétaire, le 2/11 à 14 h 41, a envoyé `Best_AI_Product_Video_for_SaaS__Lovio.mp4` (Zelios pour Lovio, 53 s) avec ce message :

> « en t'inspirant fortement de cette vidéo de lancement, crée une nouvelle vidéo de lancement en motion design pour Stalak. J'aimerais que t'imprègne des mouvements, effets, textes, voix, effet sonore, transitions, tout ce que propose cette vidéo […] en gardant les couleurs, environnements de stalak. […] Fais seulement une video format youtube, pas de shorts. »

Il a laissé le choix libre (« libre arbitre »). La structure suit donc celle de Lovio plan par plan ; il n'y a pas de choix entre 3 histoires.

## La référence décortiquée (Lovio, 53,06 s, 30 i/s)

**Le son :**
- une voix d'homme posée et chaleureuse, d'environ 2,1 mots/s ;
- une musique électronique aérienne vers 144 BPM, avec une intro planante de 2,3 s ;
- des bruitages d'interface : clics, frappe, whooshs sur les coupes, une montée avant le logo final.

**Les plans :**

| Instants | Ce qui se passe |
| --- | --- |
| 0–1,6 s | Une étincelle grandit et se change en logo, qui sert de fenêtre (masque) et s'ouvre sur un décor réel. |
| 1,6–5,2 s | Les éléments de l'interface, en verre, s'assemblent : bouton × → +, pilule, puis la boîte de saisie. |
| 5,2–6,3 s | La caméra entre dans la boîte, et « I have an idea » se tape en grand. |
| 6,3–9,3 s | Fond nuit avec des vagues : le mot « idea » se fond dans le logo, puis le nom glisse à côté. |
| 9,3–14,4 s | Le produit sur un ordinateur, un téléphone et une tablette. |
| 14,4–19,8 s | Une personne réelle, puis un écran partagé avec la saisie, le clic sur envoyer, « Generating… % » et le résultat. |
| 19,8–25,2 s | Une grille de créations qui se remplit, puis des flashs plein écran sur les temps. |
| 25,2–29,6 s | Un ordinateur en 3D, puis « Beautifully [fenêtre] designed », puis les lettres se mélangent en « ready to launch » avec un interrupteur. |
| 29,6–35,9 s | L'interrupteur devient une barre d'outils, puis l'interface, puis « in any direction » en 3D. L'image se referme dans une étoile. |
| 35,9–40,6 s | « What starts as an idea » mot par mot, puis un ordinateur qui monte. |
| 40,6–45,4 s | Un clic sur « Share », puis un carrousel de créations sélectionnées entre accolades { }. |
| 45,4–47,6 s | Un panneau de verre « More about what's next », avec des lignes-guides. |
| 47,6–49,6 s | Une traînée de lumière, puis « What will you create today ». |
| 49,6–53 s | Une fleur en 3D (le logo) éclot, se referme dans l'icône, puis le nom apparaît. |

## La version Stalak

**But.** À la fin, un rappeur se dit : « je filme mes prises, Stalak fait le clip, sur le temps, les lèvres calées », et il retient stalak.app.

**Format.** HyperFrames 0.8.223, 1920 × 1080, 30 i/s (60 i/s depuis la v3), 60 s. Pas de Short.

**Le vrai produit.** Les écrans sont de vraies captures de l'app : `capture_ui.py` construit le site depuis le dépôt, charge « Try with an example » et photographie chaque carte, en 2× :
- Pick your song ;
- Add your takes ;
- Your edit (Normal, Punchy, après Shuffle) ;
- l'aperçu avec Play et Shuffle ;
- Export, avec le pack Creator+.

Seul l'aperçu est remplacé par ses vraies prises, avec sa phrase dans le style de paroles « Classic » de l'app. Les boutons montrés existent tous.

**Les mondes,** couleurs de Stalak à la place de celles de Lovio :

| Monde | Où on le voit | Ce qu'il remplace chez Lovio |
| --- | --- | --- |
| Le **ciel de Stalak** : dégradé #6db3f7 → #1f6fd6 → #1552a6, neige (70 flocons de 2 à 6 px), gros flocons flous au premier plan (8 flocons de 40 à 90 px, flou de 10 px, 30 %), stalactites en haut. | L'ouverture, l'interface, le carrousel, le panneau de texte. | Le mur de béton filmé. |
| La **nuit glacée** : #050c1f → #0b1d48, rubans d'aurore bleu glace (#1f6fd6, #3fb4ff, #9fdcff, flou de 50 px, 45 %), neige fine. | Le logo du milieu et la fin. | La nuit aux vagues violettes. |
| La **lumière bleue** : #0d2a6b → #1f6fd6, halo blanc-cyan #bfe9ff venu du bas. | La synchro, les textes, « drop today ». | Les dégradés bleu-violet. |
| Le **studio glacé** : mur #eef6ff → #d3e6fb, sol avec une ombre douce. | Les appareils. | Les pièces claires en 3D. |

**Le verre de glace :**
- fond blanc à 14 %, flou de 18 px derrière ;
- bord de 1,5 px blanc à 55 %, reflet en haut ;
- ombre 0 30 px 60 px, bleu nuit à 25 % ;
- coins de 36 px.

**Le texte :**
- Rubik 500, blanc, de 64 à 170 px selon le plan, interlettrage −1 % ;
- le mot important dans un dégradé de glace (#ffffff → #cfe8ff → #7cc0ff) ;
- la frappe en Rubik 400 de 96 px, avec un curseur de 6 px ;
- le logo : `icon.svg` et `wordmark.svg` de la marque.

**Le mouvement :**
- les arrivées en expo.out ou power4.out (0,5 à 0,7 s) ;
- la caméra en power2.inOut (1,2 à 2,5 s) ;
- les sorties en power3.in (0,3 s) ;
- les mots qui sortent du flou : de 8 px à 0 en 0,15 s, un mot toutes les 0,08 s ;
- **aucun rebond, aucune secousse** (sa demande pour le 1er film) ;
- le curseur fait 72 px, et le clic le fait passer à 0,9 pendant 0,1 s, sans anneau.

**Le son :**
- la voix : Achird (Gemini 3.1 Flash TTS dans Flora), 12 phrases, chacune posée à sa place ;
- la musique : v1 et v2, une musique générée « façon Lovio » (3 essais : Stable Audio 3 ×2, Lyria 3.5), choisie par le propriétaire ; **depuis la v3, l'instru de son « neva die »** (voir « v3 »), montée sur ses mesures et baissée sous la voix ;
- les bruitages de la bibliothèque HyperFrames (licence Pixabay), chacun sur son geste :
  - étincelle ;
  - whoosh sur les coupes, en alternant 3 versions ;
  - clic sur les vrais clics ;
  - frappe sur le texte tapé ;
  - pop sur les pastilles ;
  - une seule montée vers l'impact, sur le logo final ;
- le niveau final à −14 LUFS.

## Le texte de la voix (anglais américain)

1. What if making a music video felt as easy as having a song?
2. Meet Stalak.
3. The app that turns your takes into music videos. Cut on the beat, lips in sync.
4. No editing skills needed. Just drop in your song and your takes, and Stalak syncs them to the music.
5. From a TikTok to a full music video, every cut lands right on the beat.
6. Beautifully edited, and ready to post.
7. Change the pace, add your lyrics, shuffle the cuts. Take it in any direction.
8. What starts as a few takes becomes a whole week of videos.
9. Export it for TikTok, Reels, Shorts, or YouTube.
10. Spend less time editing, and more time making music.
11. So, what will you drop today?
12. Start creating with Stalak.

Chaque promesse est vraie :
- calage sur le temps et lèvres synchro : c'est le cœur de l'app ;
- paroles : import et calage au tap, en gratuit ;
- rythme Chill / Normal / Punchy et bouton Shuffle : ils existent ;
- export TikTok / Reels / Shorts : en gratuit ; clip YouTube 16:9 : avec Pro (badge PRO à l'écran) ;
- « une semaine de vidéos » : le pack de 5 à 30 vidéos, avec Creator Plus (badge CREATOR+ à l'écran).

## Les plans (temps définitifs, dans `build.py`)

La voix mène : chaque plan commence sur un temps de la musique (150 BPM, un temps = 0,4 s) près de sa phrase, et chaque geste nommé par la voix tombe sur son mot (`K` dans `build.py`, tiré des temps des mots de `lines.json`). Le film dure **60 s**.

| Plan | Temps (s) | Ce qu'on voit | Son |
| --- | --- | --- | --- |
| S0 | 0–1,6 | Nuit glacée. Un éclat de glace grandit, devient la silhouette de l'icône Stalak, qui s'ouvre comme une fenêtre sur le ciel. | étincelle, whoosh long |
| S1 | 1,6–5,2 | Ciel. Le bouton × tourne en +, la pilule « ♫ Import your music » en sort (sur le groove, 2,4 s). La caméra recule : le vrai titre « Your takes, cut on the beat. » et sa phrase, la boîte de verre. Voix 1 (1,6 s). | pop |
| S1b | 5,2–6,4 | La caméra entre dans la boîte ; « I have a song. » se tape pendant « …having a song? ». | frappe |
| S2 | 6,4–9,6 | Nuit et aurore. « song » flou, qui avance, fond dans l'icône ; l'icône brille, glisse ; « Stalak » se dévoile sur le mot « Stalak » (8,35 s). | whoosh, étincelle |
| S3 | 9,6–16,0 | Studio glacé : l'ordinateur avec le vrai accueil (9,6), le téléphone avec une prise dans la vraie app (12,0), la tablette (13,6, sur « Cut on the beat, lips in sync »). | 3 whooshs différents |
| S4 | 16,0–24,0 | Lui dans sa carte 9:16 (l'aperçu de la tablette venu vers nous, v2), au milieu (« No editing skills needed »), puis à droite de la boîte ; la boîte de verre (avec la vraie phrase du site) reçoit « neva die.mp3 » sur « song », Take 1, 2, 3 sur « takes » ; clic sur → sur « Stalak » ; « Analyzing the takes… » puis « All the takes are synced. » pendant « syncs them to the music » ; la vraie carte « Your edit », sa barre de coupes se construit. | pops, clic |
| S5 | 24,0–28,8 | La grille de ses vidéos (TikTok avec Frost, son clip YouTube PRO, Black & white, 35 mm film, Lyrics on screen avec sa phrase sur sa voix), puis 4 flashs sur les temps : son clip plein écran (« a full music video »), ses 3 prises côte à côte au même instant de la chanson, un 9:16 avec « scars worth millions. » sur sa voix, la vraie barre de coupes en très gros (« on the beat »). | 4 whooshs alternés |
| S6 | 28,8–33,6 | L'ordinateur en 3D joue son clip ; l'écran devient une fenêtre entre « Beautifully » et « edited » (sur la voix) ; les lettres de « ready to post » arrivent dans le désordre ; le curseur allume l'interrupteur après « post ». | 2 touches, clic |
| S7 | 33,6–40,0 | Les pilules (les vraies commandes) sortent de l'interrupteur ; plongée dans « Punchy ». La vraie carte « Your edit » : clic sur Punchy (35,0), sa phrase sur l'aperçu, calée sur sa voix (35,75), clic sur ↻ Shuffle sur « shuffle » (36,45) : une autre prise, au même instant de la chanson, la phrase continue. « in any direction » en 3D mot par mot ; l'image se referme dans un flocon. | 2 clics, whooshs |
| S8 | 40,0–44,8 | « What starts as » mot par mot, qui monte quand « a few takes » arrive ; l'ordinateur monte avec la vraie carte Export ; clic sur « Make the pack » (CREATOR+) sur « week » ; 7 vidéos, MON → SUN. | whoosh, clic, 2 pops |
| S9 | 44,8–49,6 | Clic sur Export sur « Export » ; le carrousel TikTok, Reels, Shorts (9:16), YouTube (16:9, PRO, son clip) ; les accolades { } prennent chaque format quand la voix le dit, puis YouTube avance. | clic, whooshs |
| S10 | 49,6–53,6 | Ciel flouté, lignes-guides, panneau de verre : « Less time editing. » se tape sur la voix, se sélectionne, et « More time making music. » le remplace (pendant la pause de la musique). | frappe, touches |
| S11 | 53,6–55,2 | Une traînée de lumière glacée (la musique repart) ; « What will you drop today » sur une ligne, mot par mot sur la voix. | whoosh |
| S12 | 55,2–60,0 | La musique saute à sa fin (sur une mesure). Un cristal de glace éclot, tourne, se referme dans l'icône ; « Stalak » se dévoile sur le mot « Stalak » (57,05) ; « stalak.app » et « Free · No download · No sign-up », tenus 2 s. | montée → impact, étincelle, pop |

**Le mixage** : voix à 0,78 ; musique (normalisée à −16 LUFS) à 0,75 entre les phrases et 0,42 sous la voix en v1 et v2, **0,95 et 0,33 depuis la v3** (le beat de « neva die » est plus dense) ; rampes de 0,25 s, 0,8 sur la fin ; chaque bruitage environ 9 dB sous la voix ; l'ensemble remis à −14 LUFS (crête −1,4 dBFS).

## v2 : ses retours du 2/11 (Salle de visionnage, 17 h 03 et 17 h 06)

**Ses 5 remarques à l'image près :**

| Remarque | Ce qui change |
| --- | --- |
| 16,0 s : « le gros plan sur ma tête faut changer. » | Plus de gros plan sur son visage : il est dans une carte 9:16 au milieu (sa prise 2, plan taille), qui va à droite de la boîte de verre pendant l'import, puis sort. |
| 23,07, 28,20 et 36,23 s : « le bouton export est sur le texte de derrière » | Le bouton flottant « Export ↓ » de l'app (`#expFab`, fixé en bas de la fenêtre) tombait sur la ligne « Lyrics: 4 lines… » des cartes capturées. `capture_ui.py` le cache maintenant sur toutes les captures (cartes et écrans), puis les captures ont été refaites. |
| 29,70 s : « les bords de l'ordinateur sont trop longs par rapport à l'écran » | Le socle de l'ordinateur 3D était plus large que l'écran et la perspective l'élargissait encore : il fait maintenant la largeur de l'écran, vu un peu d'en haut avec un objectif plus long (le clavier se voit). Pareil pour les ordinateurs de S3 et S8. |

**Sa remarque sur toute la vidéo :** « des transitions plus fluides, limite on ne les voit pas venir, ça se fond dans le décor ; c'est trop sec des fois ». Chaque coupe sèche devient un passage qui garde le mouvement ou un élément du décor :

| Instant | Avant | Maintenant |
| --- | --- | --- |
| 6,4 s | coupe : ciel → nuit | la caméra entre dans le mot « song » tapé ; il devient le « song » du plan suivant ; le ciel s'éteint en nuit autour |
| 9,6 s | coupe : logo → ordinateur | plongée dans le bleu de l'icône ; on ressort du même bleu, celui du ciel de la page d'accueil sur l'écran de l'ordinateur |
| 12,0 et 13,6 s | coupes entre les 3 appareils | panoramiques filés : les 3 appareils sont dans le même studio, flou de mouvement horizontal, la lumière du studio glisse derrière |
| 16,0 s | coupe : tablette → lui en gros plan | la tablette se redresse et vient vers nous ; son aperçu devient sa carte 9:16, la même prise continue ; le studio passe au bleu derrière |
| 24,0 s | coupe : carte de montage → grille | la caméra file à travers la barre de coupes et ressort dans la grille |
| 25,6 s | coupe : grille → son clip plein écran | la caméra entre dans la case YouTube, qui remplit l'image et devient son clip |
| 26,4 / 27,2 / 28,0 s | flashs secs | chaque flash part en poussant vers nous et le suivant arrive encore en mouvement, sur le temps |
| 28,8 s | coupe : barre → ordinateur 3D | la caméra file à travers le dernier flash jusqu'à l'ordinateur |
| 44,8 s | coupe : la semaine → Export | glissé vers le haut, comme pour passer à la vidéo suivante d'un fil |
| 49,6 s | coupe : carrousel → panneau tapé | la caméra file dans son clip YouTube et ressort dans le ciel flouté du panneau |
| 53,6 s | coupe sous la traînée | la traînée de lumière efface le panneau de haut en bas |
| 55,2 s | coupe bleu → nuit | la nuit arrive en fondu sous le cristal (0,3 s) |

## v3 : ses retours du 2/11 (Salle de visionnage, 19 h 13)

**Sa remarque à 7,1 s** : « la lettre "g" est coupée en bas ». Le dégradé de glace des mots forts (`.ice`) est découpé sur le texte, et la boîte du mot s'arrêtait au-dessus du jambage. Elle descend maintenant plus bas (`padding-bottom: 0.26em`). C'est corrigé partout : « song », « drop », « takes », « direction », « music ».

**Sa remarque sur toute la vidéo** : « toujours pas assez fluide, les mouvements un peu trop linéaires ; la musique beaucoup trop calme et mignonne, il faut quelque chose plus comme la musique qu'on utilisait avant ; plus d'éléments liés à Stalak, genre des flocons en fond ».

- **La musique** : l'instru de « neva die », celle de nos vidéos d'avant (`promo/youtube`, `promo/one-shape`). Elle passe de 157 à 150 BPM avec rubberband (même hauteur), pour que chaque coupe reste sur son temps. Le montage suit ses parties, à chaque raccord sur une barre, dans la même phase de sa boucle de 8 mesures :

  | Film | L'instru | Ce que ça fait |
  | --- | --- | --- |
  | 0 → 2,4 s | son intro | l'ouverture, calme |
  | 2,4 → 8,8 s | les 4 dernières mesures avant son drop | la basse 808 entre pendant que l'interface se construit |
  | 8,8 s | **son drop** | sur « Meet Stalak. », avec un éclat de neige et de glace qui part du logo |
  | 8,8 → 50,4 s | 26 mesures du beat plein | sous la voix |
  | 50,4 → 53,6 s | 2 mesures de sa partie calme | une coupure sous « less time editing, more time making music » |
  | 53,6 s | le beat revient | sur « So, what will you drop today? » et la traînée de lumière |
  | 55,2 → 60 s | ses 3 dernières mesures | sous le cristal et le logo ; elle finit avec le film |

  La musique est à 10 dB sous la voix quand elle parle, et à 4 à 5 dB sous elle entre les phrases (mesuré avec `mix.py`).

  **À vérifier par le propriétaire avant de publier** : la licence de l'instru doit permettre YouTube (même point que pour `promo/youtube`).
- **Fluidité** :
  - **60 images par seconde** ;
  - plus aucun zoom lent et régulier. Les poussées lentes (le texte tapé, l'ordinateur, sa carte, la grille, la carte YouTube) donnaient l'effet « linéaire » ;
  - les arrivées finissent sur une longue fin douce (`expo`) puis se tiennent ;
  - les mouvements se chevauchent (la tablette monte et vient vers nous en même temps) ;
  - les mouvements rapides ont un flou de mouvement dans leur sens : sa carte qui part, la boîte qui arrive, le carrousel ;
  - « in any direction » se pose en 3D puis ne bouge plus.
- **Plus de Stalak** :
  - de grands cristaux de neige (le flocon à 6 branches de la marque) tournent lentement en fond, dans tous les mondes et tous les ciels ;
  - de gros flocons flous passent devant, dans les plans larges ;
  - les stalactites de l'app (glace #d6ecff, contour encre) sont sur la boîte de verre, sous le panneau tapé et en haut de l'écran de fin ;
  - l'éclat de neige part du logo sur le drop.

## Interdit

- Rebonds, secousses, pulsations sur les temps, titres qui bougent une fois posés.
- Boutons inventés, faux chiffres, faux avis, concurrent cité (TikTok, Reels, Shorts et YouTube sont des plateformes, nommées seulement).
- Le logo collé dans un coin, des anneaux de clic.
- Un fond noir vide.
- Un simple fondu enchaîné à la place d'une transition. Depuis la v2 (sa demande), on passe d'un monde à l'autre caché par un mouvement ou un élément du décor : un mot, la couleur de l'icône, l'aperçu d'un appareil, une case, un panoramique, une traînée de lumière.

## À vérifier

- Une image juste après le début et une au milieu de chaque plan, plus chaque coupe à −0,2 / +0,2 s.
- Le texte lisible à 360 px de large.
- Aucune image noire.
- La voix au-dessus de la musique.
- −14 LUFS.
