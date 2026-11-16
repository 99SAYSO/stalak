# LEVELS — mode d'emploi du format

> Conversation « 8. Vidéos LEVELS », branche `levels/format-pilotes`, 16/11/2026.
> 2e compte TikTok de Stalak, en français, **un seul format**, 2 vidéos par jour.
> Ce document reprend la **mécanique** d'une vidéo de référence américaine (envoyée par le propriétaire le 16/11), **pas son contenu ni son dessin**. Rien n'est recopié : ni le texte, ni les personnages, ni le décor, ni la musique.

---

## 1. La vidéo de référence, seconde par seconde

**Fichier** : `.mov` 576 × 1024, 30 images/s, **27,0 s**, son AAC.
**Sujet** : « How to handle rejection » (comment réagir quand on se prend un râteau), compte de bonshommes animés. Un garçon (bonhomme blanc) invite une fille (bonhomme bleu clair, qui lit) dans une bibliothèque ; 5 niveaux de réaction, du pire au meilleur, puis la pub d'une appli.

Méthode (skill `analyse-format-video`) : toutes les images à 4 par seconde (108 images, toutes regardées), puis une image tous les 0,1 s autour de chaque changement de niveau ; détection des coupes ; mesure du volume par tranches de 0,1 s et spectrogramme du son. Pas d'outil de transcription ici : le texte dit vient des bulles, qui écrivent exactement ce que disent les voix (traduit en français ci-dessous).

### Ce qui reste à l'écran pendant toute la partie « niveaux » (0 → 22,5 s)

En haut, centré, dans la zone visible de TikTok :
1. **Le titre** : « How to handle rejection », blanc, gras, une ligne. Il ne change jamais.
2. **5 cases numérotées 1 à 5**. Une case devient **rouge** quand on entre dans son niveau ; les précédentes restent rouges. On sait toujours où on en est, et combien il en reste.
3. **Une étiquette** sous les cases : ce que fait le garçon à ce niveau, en 2-3 mots, avec une **croix rouge** (niveaux 1 à 3) ou une **coche verte** (niveaux 4 et 5).
4. **Une jauge** « HER » (elle) : ce qu'elle pense de lui. Rouge et presque vide aux niveaux 1-3, orange au 4, verte au 5, puis **jaune « MAX »** à la toute fin.

En dessous : **un seul décor fixe** (rayonnages de livres, lumière tamisée, deux lampes), **deux personnages** toujours à la même place, et **des bulles** blanches qui s'écrivent **lettre par lettre, au rythme de la voix**.

### Le déroulé

| Temps | Niveau (étiquette) | Ce qui se passe | Remarques |
|---|---|---|---|
| 0,0 → 2,9 s | **1** · ✗ « gets angry » | Lui : « Tu veux sortir un de ces jours ? » (0 → 1,0 s) — Elle : « J'ai un copain. » (1,25 → 2,0 s) — Lui, le doigt pointé : « T'es une s… » (2,25 → 2,75 s) | **Coupé au milieu du mot** par le passage au niveau 2 : la chute est la coupe elle-même. Dès la 1re image : titre, cases, bulle déjà en train de s'écrire. |
| 3,0 → 6,9 s | **2** · ✗ « argues » | « Pourquoi ? Je suis un mec bien. Donne-moi juste une chance. » — Elle : « Toujours non. » | Gestes : bras écartés. Une gouttelette de sueur à 6,5 s. |
| 7,0 → 12,9 s | **3** · ✗ « makes it weird » | « Non, ouais, carrément. Je rigolais. Évidemment. Je vais… ouais. » Main derrière la tête. En reculant, il fait **tomber un livre de l'étagère** derrière lui (10,8 s), qui finit par terre (12,0 s). Elle : « … Okay. » (12,3 → 12,8 s) | Le gag visuel du niveau. C'est le niveau le plus long (6 s) : le malaise est étiré exprès. |
| 13,0 → 14,9 s | **4** · ✓ « accepts it » | « Ah, pas de souci. Bonne journée. » — « Toi aussi. » | Le plus court (2 s) : « correct », mais sans surprise. La jauge remonte un peu (orange). |
| 15,0 → 22,5 s | **5** · ✓ « accepts it + stays kind + leaves first » | « Il a de la chance. Bonne lecture. » Il se retourne pour partir. **À 15,0 s, une carte « TODAY'S QUEST : Hear a no and stay kind / Practice in the Unmute App. Link in bio »** glisse en bas. **À 16,6 s, la case se coche et la carte passe au vert** (son « ding »). Elle : « Attends… En fait j'ai pas de copain. » Lui : « Alors je redemande. Un café un de ces jours ? » Elle : « Ouais, d'accord. » **La jauge passe à « MAX »** (21,5 s). | Le retournement : la bonne attitude rapporte **plus** que prévu. La pub arrive **à 55 % de la vidéo**, mais déguisée en « quête » du jeu, pas en pub. |
| 22,6 → 27,0 s | Fin | Gros plan : une main de bonhomme tient un téléphone, l'écran de l'appli (la quête « Make a stranger laugh », puis une carte « Quest complete »). Texte fixe en bas : « PRACTICE THESE SCENARIOS AND REACH LEVEL 5 WITH UNMUTE. » (nom de l'appli en rouge). **26,0 s : pastille rouge « LINK IN BIO »**. | La seule **vraie coupe** de toute la vidéo (22,6 s). 4,4 s seulement de pub explicite. |

Durée des niveaux : **3,0 – 4,0 – 6,0 – 2,0 – 7,5 s**, puis 4,4 s de fin. Les échecs ne sont pas égaux : le niveau 3 (le plus drôle) dure le plus longtemps, le 4 (« bien, sans plus ») est expédié, le 5 a toute la place.

### Le son

- **Pas de musique de fond.** Le volume tombe à presque zéro à 3,0 s (silence entre deux niveaux) : seules les voix portent la vidéo.
- **Deux voix doublées** (lui, elle), jeu naturel, débit rapide, aucune voix off.
- **Bruitages rares et utiles** (vus sur le spectrogramme, sons tenus et réguliers) : un « ding » quand la quête se coche (≈ 16,6 s), un son de « niveau max » quand la jauge se remplit (≈ 21,5 s). Probablement un petit bruit pour la chute du livre.
- Le passage d'un niveau à l'autre se fait **sur un blanc de voix**, sans son de transition.

### Les transitions

- **Aucune coupe de plan** entre les niveaux : même décor, mêmes places. Seuls l'**étiquette**, la **case rouge** et la **jauge** changent, d'un coup, entre deux images.
- La bulle de texte s'efface et la suivante recommence à s'écrire.
- Seule coupe franche : le passage à l'écran de l'appli, à la fin.

### Pourquoi ça retient l'attention

1. **La promesse est visible dès la 1re image** : 5 niveaux à passer. On veut voir le 5. Les cases qui rougissent une par une font une barre de progression : on sait que « ça arrive bientôt ».
2. **Zéro effort pour comprendre** : un seul décor, deux personnages, un texte qui dit ce qui se passe. Un enfant peut suivre (règle « Mes goûts »).
3. **Chaque niveau dure moins de 8 s**, et le niveau 1 se termine en **3 s**, coupé au milieu d'un mot : premier rire avant que le pouce ne fasse défiler.
4. **On se reconnaît** dans les mauvaises réactions (« argues », « makes it weird ») : on rit de soi, on partage à un ami.
5. **La récompense du niveau 5 dépasse l'attente** (« en fait, je n'ai pas de copain ») : fin satisfaisante, on revoit la vidéo.
6. **La pub fait partie du jeu** : la « quête » cochée rend l'appli logique (elle sert à « passer au niveau 5 ») au lieu d'interrompre. La pub explicite ne dure que 4 s, à la fin.
7. **Format en série** : même titre, même mise en page à chaque vidéo, seul le sujet change. On reconnaît le compte en une image.

---

## 2. Le format LEVELS de Stalak

### L'idée en une phrase

Un rappeur bonhomme bâton essaie de faire la promo de son son. Aux niveaux 1 à 4, il s'y prend mal et se fait recaler, avec une blague liée au genre du son, et chaque refus finit par **un coup de dessin animé**. Au niveau 5, il poste un **snippet monté avec Stalak** : ça marche.

### Ce qu'on reprend de la référence, et ce qu'on change

| On reprend (la mécanique) | On change (pour que ce soit à nous) |
|---|---|
| Titre fixe + 5 cases + étiquette ✗/✓ + jauge, en haut | Habillage Stalak : cases en cartes blanches à contour encre et ombre dure, polices Lilita One / Rubik, bleu `#1f6fd6`, glace. La jauge s'appelle **« HYPE »**, sans chiffre |
| Un seul décor, mêmes places | Le décor change **selon le genre** (rue la nuit pour la drill, parc pour la love…), un par vidéo |
| Niveaux de durées inégales, le 5 le plus long | Chaque refus finit par **un coup** façon dessin animé (la référence n'en a pas) |
| Bulles écrites au rythme de la voix | Bulles blanches contour encre, comme les cartes de Stalak |
| Retournement au niveau 5 | Le retournement, c'est **le snippet qui marche** : les gens s'arrêtent de faire défiler |
| Promo intégrée au niveau 5, pub explicite courte à la fin | La promo, c'est l'**écran de Stalak qui monte le snippet** sur le rythme, puis une carte de fin « Le niveau 5 se fait sur stalak.app » |

### L'écran (1080 × 1920)

```
┌─────────────────────────────┐  ← 0 à 130 px : zone cachée par TikTok (rien d'important)
│ COMMENT POSTER TON SNIPPET  │  ← titre, Lilita One, 2 lignes max, centré
│   POUR UN SON  TRISTE       │    le genre en bleu, dans une pastille glace
│   [1][2][3][4][5]           │  ← cases : grises → rouges (échec) / vertes (niveau 5)
│   ✗ il chante dans la rue   │  ← étiquette, Rubik gras, 6 mots max
│   HYPE ▓▓░░░░░░░░           │  ← jauge
├─────────────────────────────┤
│                             │
│   (bulle)      (bulle)      │
│    O              O         │  ← le rappeur à gauche, la cible à droite,
│   /|\            /|\        │    toujours aux mêmes places
│   / \            / \        │
│          décor              │
│                             │  ← bas de l'écran et colonne de droite :
└─────────────────────────────┘    zones cachées par TikTok (légende, boutons)
```

Personnages entre 35 % et 80 % de la hauteur ; rien d'important dans les 20 % du bas ni dans les 120 px de droite (boutons de TikTok). Vérifié à chaque vidéo sur la planche contact (`tools/contact_sheet.py` montre ces zones en rouge).

### Les personnages

- **Le rappeur** (héros, le même dans toutes les vidéos) : bonhomme bâton, un signe distinctif qui le rend reconnaissable (à choisir dans les styles proposés). Pas de nom de vrai rappeur, pas de visage ni de tenue d'une vraie personne.
- **La cible** de chaque niveau : un passant, son pote, une fille, son ex, « le public » qui fait défiler son téléphone… Selon le genre. Bonhommes bâton aussi, dans une autre couleur.
- Aucune vraie personne, aucun rappeur connu, ni son visage ni sa voix.

### Les 5 niveaux (squelette commun)

Le squelette ne change pas d'une vidéo à l'autre : c'est ce qui fait la série. Seules les blagues (et donc le décor, la cible et le coup) changent avec le genre.

| Niveau | Ce que fait le rappeur (idée de base) | Fin | Durée visée |
|---|---|---|---|
| **1** | Il fait sa promo **en vrai**, à la mauvaise personne ou au mauvais moment (il chante son son à quelqu'un) | **Grosse baffe** | 3,5 – 4 s |
| **2** | Il **force** : spam de messages, vocal de 3 min, « écoute juste 30 s » | **Coup de pied mal placé** (hors champ ou caché par une étoile « BONK ») | 4 – 5 s |
| **3** | Il poste son son **sur une image fixe** (photo floue, écran noir) : personne ne s'arrête | **Un objet tombe du ciel** (enclume, piano, pot de fleurs) — le gag le plus long | 5 – 6 s |
| **4** | Il monte un snippet **avec « une appli de montage classique »** : coupes au hasard, **lèvres pas synchro**, ça se voit | **Coup de poêle** (ou tarte, ou boule de neige géante, dans l'esprit glace de Stalak) | 4 – 5 s |
| **5** | Il filme plusieurs prises, met son son dans **Stalak**, qui coupe sur le rythme, **lèvres synchro**. Il poste : la cible s'arrête de faire défiler, hoche la tête, partage | **Pas de coup** : la jauge HYPE passe à **MAX** | 9 – 11 s |
| Fin | Carte de fin : « Le niveau 5, tu le fais sur **stalak.app** » + « Gratuit, sans téléchargement » | — | 3 – 3,5 s |

**Durée totale visée : 30 à 35 s** (la référence fait 27 s). La règle « 1 min 05 à 1 min 20 » vaut pour la série T-Crazy, pas pour LEVELS : **à confirmer par le propriétaire.**

Le niveau 4 ne nomme jamais une appli : on dit « une appli de montage classique », et on ne dessine aucune interface reconnaissable.

### Les coups de dessin animé (règles)

- Toujours **dessin animé** : étoiles qui tournent autour de la tête, oiseaux, yeux en spirale, onomatopée en grosses lettres (« BAF ! », « BONK ! », « CLANG ! »), le bonhomme qui s'aplatit puis reprend sa forme. **Jamais** de sang, de blessure, d'os, de réalisme.
- Le coup tombe **sur la chute de la blague**, comme la coupe au milieu du mot dans la référence : il remplace la fin de la phrase.
- Durée du coup : **0,6 à 0,9 s** (anticipation 0,15 s, impact avec petit tremblement de l'écran, 0,4 s d'étoiles), puis passage direct au niveau suivant.
- Le coup du niveau 2 (« mal placé ») se fait **caché** : l'impact est couvert par l'étoile « BONK ! », on voit seulement la réaction (yeux qui sortent, voix aiguë). Rien de vulgaire.
- La gradation fait rire : chaque coup est plus gros que le précédent.

### Le niveau 5 et la promo

- Pas de pub avant le niveau 5 (goût du propriétaire : « pas de pub dès la première seconde »).
- Au niveau 5, l'écran de **Stalak dessiné** (son, prises, coupes sur le rythme), 2 secondes, pour qu'on comprenne **ce que fait l'appli** : pas un logo, une démonstration.
- Puis le **snippet lui-même**, 4 à 5 s, dans un téléphone dessiné façon fil TikTok (sans logo TikTok) : le rappeur rappe en playback, les coupes tombent **exactement sur les temps**, les lèvres sont **synchro** (règle « Mes goûts » : toute vidéo montée montrée est synchro avec la musique). C'est la preuve.
- La cible réagit (elle s'arrête, la tête bouge sur le rythme, « c'est qui ? »), la jauge passe à MAX avec un son de niveau gagné.
- **Carte de fin** : « Le niveau 5, tu le fais sur stalak.app » ; « Gratuit, sans téléchargement ». Le spectateur doit se dire « moi aussi j'ai ce problème » (règle « appel à l'action intelligent »).

### Le son

- **Voix** : comme la référence, des bulles **et** des voix courtes. Une voix pour le rappeur (la même dans toutes les vidéos), une ou deux pour les cibles. Voix de synthèse Flora (Gemini), générées **une seule fois** après validation et feu vert. Environ 6 à 8 répliques par vidéo (une génération par réplique), soit **environ 0,10 $ par vidéo** (0,013 $ la génération au 15/11). Option gratuite : pas de voix, seulement bulles + bruitages (à choisir par le propriétaire).
- **Musique** : contrairement à la référence, on a besoin de musique, puisqu'on fait la promo d'un son. **Le son du rappeur** (un extrait du genre de la vidéo) est **uniquement** un son dont on a les droits : beats du propriétaire ou d'ALASKA en priorité, sinon une musique Pixabay (usage commercial permis) qui colle au genre. Jamais un morceau connu. Il revient à chaque niveau (dans la rue, dans le vocal, sous l'image fixe, dans le mauvais montage) et sonne enfin bien au niveau 5.
- **Bruitages** : baffe, « bonk », sifflement de chute + « clang », poêle, « ding » à chaque case qui change, son de niveau gagné au MAX. Bruitages libres de droits (Pixabay ou faits en code).
- Pas de générique, pas de jingle : la vidéo commence directement par le niveau 1.

### Le texte

- Titre : « Comment poster ton snippet pour un son **[genre]** ». Seul le genre change. Formes retenues : « drill », « love », « triste », « sur ton ex », « de motivation »…
- Étiquettes de niveau : 6 mots au plus, au présent, en français parlé (« ✗ il chante dans le bus »).
- Bulles : une phrase courte à la fois, écrite au rythme de la voix ; un cri s'écrit en grand, mot par mot, au milieu de l'écran (goût du propriétaire).
- Ton : « tu », français parlé, pas de gros mots (les coupes au milieu des mots font le travail, comme dans la référence).

### Les règles à ne jamais oublier

- Pas de vraie personne : ni rappeur connu, ni son visage, ni sa voix.
- Pas de concurrent nommé : au niveau 4, « une appli de montage classique », et aucune interface reconnaissable.
- Seulement des sons dont on a les droits.
- Les coups restent du dessin animé.
- Aucun chiffre inventé (pas de « 2 millions de vues » ; la jauge HYPE n'a pas de chiffre).
- Chaque vidéo a sa miniature, dessinée dans le style de la série.
- Chaque vidéo passe par le skill `planche-contact` avant d'être montrée.
- Scripts validés, puis styles et décors validés en images fixes, puis feu vert (`lots/levels-<lundi>`) avant toute voix ou tout rendu.

### Légende et publication

- 2 vidéos par jour (`slot` 1 et 2 dans Studio Stalak, `compte: "levels"`).
- Légende : une phrase + 4 à 6 mots-clés (« Le niveau 4 m'a fait mal 💀 #rap #snippet #rappeur #drill »).
- Champ `format` des fiches : toujours **« LEVELS »**, pour l'onglet Résultats.

---

## 3. Ce que le propriétaire doit trancher

1. **Durée** : 30 à 35 s (proposé) au lieu de 1 min 05 – 1 min 20.
2. **Voix** : voix Flora (≈ 0,10 $ par vidéo) ou seulement bulles + bruitages (gratuit).
3. **Le style** du bonhomme bâton et du décor : 3 planches (A Glace, B Nuit, C Sticker) dans Studio Stalak, onglet Univers, fiche « LEVELS · Le bonhomme bâton et son décor ». Dessinées en code : `tools/levels/styles.html`, rendu avec `python3 tools/levels/render_styles.py DOSSIER`.
5. **Les 5 scripts pilotes** (drill, love, triste, sur ton ex, de motivation) : Studio Stalak, onglet À valider, compte Levels, 18 au 20/11. Copie dans `docs/marketing/levels/pilotes.json`.
4. **Les sons** : quels beats à lui ou d'ALASKA on peut utiliser, genre par genre.
