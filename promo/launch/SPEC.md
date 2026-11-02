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

**Format.** HyperFrames 0.8.223, 1920 × 1080, 30 i/s, 60 s. Pas de Short.

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
- la musique : une musique générée « façon Lovio » (3 essais : Stable Audio 3 ×2, Lyria 3.5), choisie par le propriétaire, montée sur ses mesures et baissée sous la voix ;
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
| S4 | 16,0–24,0 | Lui en plein écran (« No editing skills needed »), puis dans un panneau à droite ; la boîte de verre (avec la vraie phrase du site) reçoit « neva die.mp3 » sur « song », Take 1, 2, 3 sur « takes » ; clic sur → sur « Stalak » ; « Analyzing the takes… » puis « All the takes are synced. » pendant « syncs them to the music » ; la vraie carte « Your edit », sa barre de coupes se construit. | pops, clic |
| S5 | 24,0–28,8 | La grille de ses vidéos (TikTok avec Frost, son clip YouTube PRO, Black & white, 35 mm film, Lyrics on screen avec sa phrase sur sa voix), puis 4 flashs sur les temps : son clip plein écran (« a full music video »), ses 3 prises côte à côte au même instant de la chanson, un 9:16 avec « scars worth millions. » sur sa voix, la vraie barre de coupes en très gros (« on the beat »). | 4 whooshs alternés |
| S6 | 28,8–33,6 | L'ordinateur en 3D joue son clip ; l'écran devient une fenêtre entre « Beautifully » et « edited » (sur la voix) ; les lettres de « ready to post » arrivent dans le désordre ; le curseur allume l'interrupteur après « post ». | 2 touches, clic |
| S7 | 33,6–40,0 | Les pilules (les vraies commandes) sortent de l'interrupteur ; plongée dans « Punchy ». La vraie carte « Your edit » : clic sur Punchy (35,0), sa phrase sur l'aperçu, calée sur sa voix (35,75), clic sur ↻ Shuffle sur « shuffle » (36,45) : une autre prise, au même instant de la chanson, la phrase continue. « in any direction » en 3D mot par mot ; l'image se referme dans un flocon. | 2 clics, whooshs |
| S8 | 40,0–44,8 | « What starts as » mot par mot, qui monte quand « a few takes » arrive ; l'ordinateur monte avec la vraie carte Export ; clic sur « Make the pack » (CREATOR+) sur « week » ; 7 vidéos, MON → SUN. | whoosh, clic, 2 pops |
| S9 | 44,8–49,6 | Clic sur Export sur « Export » ; le carrousel TikTok, Reels, Shorts (9:16), YouTube (16:9, PRO, son clip) ; les accolades { } prennent chaque format quand la voix le dit, puis YouTube avance. | clic, whooshs |
| S10 | 49,6–53,6 | Ciel flouté, lignes-guides, panneau de verre : « Less time editing. » se tape sur la voix, se sélectionne, et « More time making music. » le remplace (pendant la pause de la musique). | frappe, touches |
| S11 | 53,6–55,2 | Une traînée de lumière glacée (la musique repart) ; « What will you drop today » sur une ligne, mot par mot sur la voix. | whoosh |
| S12 | 55,2–60,0 | La musique saute à sa fin (sur une mesure). Un cristal de glace éclot, tourne, se referme dans l'icône ; « Stalak » se dévoile sur le mot « Stalak » (57,05) ; « stalak.app » et « Free · No download · No sign-up », tenus 2 s. | montée → impact, étincelle, pop |

**Le mixage** : voix à 0,78 ; musique à 0,5 entre les phrases et 0,2 sous la voix (rampes de 0,25 s), 0,62 sur la fin ; chaque bruitage environ 9 dB sous la voix ; l'ensemble remis à −14 LUFS (crête −1,4 dBFS).

## Interdit

- Rebonds, secousses, pulsations sur les temps, titres qui bougent une fois posés.
- Boutons inventés, faux chiffres, faux avis, concurrent cité (TikTok, Reels, Shorts et YouTube sont des plateformes, nommées seulement).
- Le logo collé dans un coin, des anneaux de clic.
- Un fond noir vide.
- Un fondu enchaîné entre deux mondes.

## À vérifier

- Une image juste après le début et une au milieu de chaque plan, plus chaque coupe à −0,2 / +0,2 s.
- Le texte lisible à 360 px de large.
- Aucune image noire.
- La voix au-dessus de la musique.
- −14 LUFS.
