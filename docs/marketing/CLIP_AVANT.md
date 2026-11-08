# Le mode Clip mis en avant (Marketing, 7/11/2026)

> Demande du propriétaire (7/11, 15 h 19), d'après le rapport chiffres du 7/11 (`docs/stats/2026-11-07-rapport.md`, piste 3) :
> le mode Clip est la 1ʳᵉ raison d'ouvrir la page des formules (51 fois sur 116 du 3 au 7/11, 44 %). Le mettre en avant dans les
> vidéos promo du dimanche (au moins 2 sur 7), sur l'accueil et sur la page Tarifs.
> **Une étude complète du mode Clip arrive du Chef de projet : en attendant, on ne promet que ce que l'app fait déjà.**

## 1. Ce qu'on a le droit de dire (vérifié dans le code le 7/11)

Le nom : **« Music video » / « Music video mode »** en anglais (le bouton de l'étape 1 s'appelle « Music video »), **« Clip » /
« le mode Clip »** en français.

| Ce qu'on dit | D'où ça vient (`src/app.js`, sauf mention) |
|---|---|
| Tout le morceau, en paysage 16:9 pour YouTube ; on peut couper le début et la fin | `kind.hint.clip`, `isClip()` / `clipEndBar()` (coupe mesure par mesure) |
| Peut aussi sortir en vertical 9:16 | aide de l'app : « for a music video 16:9 (or 9:16) » |
| Des effets aux moments forts : drops, refrains, breaks | infobulle `fxl.sobre.tip` ; placement automatique `fxCands` (analyse de la musique) |
| Les effets : flash blanc, flash + zoom, zoom, secousse, noir, rafale de plans, ralenti | `FX_TYPES`, `fxn.*` |
| Sobre (Subtle) ou Intense ; toucher un effet pour le changer ou l'enlever ; « + Effet » pour en ajouter | `fxl.*`, aide de l'app (étape 4) |
| Pas de paroles à l'écran par défaut (on peut coller les siennes) | `ly.clipHint`, aide (étape 3) |
| **Gratuit : on l'essaie dans l'aperçu. L'export du clip 16:9 est avec Stalak Pro** (7,99 $/mois ou 49,99 $/an) | `ca.try`, `can('clip')`, `docs/STATUS.md` (audit 6/11, n° 18) |

**À ne pas dire** (n'existe pas ou pas prouvé) : « clip gratuit » (l'export est Pro), « IA », « scènes générées », « en un clic »,
4K ou une qualité précise, une durée de montage chiffrée, « le plus populaire » / « le préféré » (le chiffre de 44 % compte les
ouvertures de la page des formules, pas les ventes), un concurrent. Et rien de ce que l'étude du Chef de projet pourrait ajouter.

## 2. Sur le site (branche `marketing/clip-avant`)

- **Page Tarifs** (`/pricing`, `/fr/tarifs`) :
  - 1ʳᵉ ligne de la carte Pro, sur fond givré : « Music video mode: your whole song as a 16:9 YouTube video, with effects on the
    drops » / « Le mode Clip : tout ton morceau en clip YouTube 16:9, avec des effets sur les drops » ;
  - une section à elle sous les cartes (mascotte à lunettes, 3 points, bouton « Try it free » / « Essaie-le gratuitement » vers
    l'app, et « l'export est avec Stalak Pro ») ;
  - la ligne du tableau remontée sous les vidéos 9:16 ; une question de la FAQ « What is Music video mode? » / « C'est quoi, le
    mode Clip ? » ;
  - phrase du haut, descriptions Google et réseaux.
- **Accueil** (`/`, `/fr/`) : sous la phrase d'accueil, un bouton « Try Music video mode: your whole song in 16:9 » / « Essaie le
  mode Clip : tout ton morceau en 16:9 ». Il choisit « Clip » à l'étape 1 (le choix qui existe déjà) et l'amène sous les yeux ;
  l'app affiche alors son propre message (essai dans l'aperçu, export avec Pro). Dans « What is Stalak? » / « Stalak, c'est
  quoi ? », la ligne du mode Clip passe en 2ᵉ position, avec les mêmes mots que l'app.

## 3. Les vidéos du dimanche : au moins 2 sur 7 sur le mode Clip

Pour la séance du dimanche 8/11 (semaine 1), qui suit `docs/social/TACHE_DIMANCHE.md` (branche `social/promo-auto`). Les règles
de cette consigne restent toutes valables (rien n'est programmé sans l'« ok » du propriétaire, 7 vidéos différentes, au moins
4 modèles, aucune mention d'IA, « stalak.app » dans la vidéo et la légende).

**Style** : celui que le propriétaire a gardé le 6/11 (le Short « The edit nobody sees », cartes de l'app redessinées en code)
et la **voix Flora (Achird)**. L'essai « vraie app sur un téléphone » n'a pas été retenu.

**Le vrai résultat à montrer** : un export 16:9 de l'app en mode Clip, effets Intense, sur ses prises « neva die »
(`promo/youtube/MEDIA.md`). La version sans compte de l'app (`python3 build.py` → `shuffle-lab.html`) exporte le mode Clip, avec
le petit filigrane ; c'est la vraie sortie de l'app, on peut le montrer tel quel. Une vidéo 9:16 montre le clip 16:9 en entier
(bandeau en haut de l'image, sous-titres en dessous, hors des zones que TikTok et Reels recouvrent).

### Vidéo Clip 1 : modèle D « Accroche + démo » (20 à 25 s)

- **Accroche** (0 à 2 s, à l'écran et à la voix) : « You made a whole song. Why post 15 seconds of it? »
- 2 à 6 s : le choix « TikTok / Reels | Music video PRO », le doigt sur « Music video ».
- 6 à 15 s : le clip 16:9 qui joue ; sur le drop, le flash + zoom ; une rafale de plans ; un ralenti dans le break. Les points des
  effets au-dessus des plans, comme dans l'app.
- 15 à 19 s : Sobre / Intense.
- Fin : « Music video mode. The whole song, in 16:9. » puis « Try it free at stalak.app · export with Pro ».
- **Voix** : « You made a whole song. Post the whole song. Pick Music video, add your takes, and Stalak cuts the full video in
  16:9, with the effects on the drops. Try it free at stalak.app. »
- **Légende** (proposition) : « The whole song, not just the hook. Music video mode cuts your takes into a 16:9 video for YouTube,
  with effects on the drops. Try it free at stalak.app #musicvideo #rapper #indieartist #youtubemusic »

### Vidéo Clip 2 : modèle C « Tuto express » (25 à 30 s)

- **Accroche** : « Your song → a YouTube music video, in 3 steps »
- 1 : « Pick Music video, drop in your song » (tout le morceau ; début et fin à couper si besoin).
- 2 : « Add a few takes » (des playbacks du même son, filmés avec le son qui joue).
- 3 : « Pick Subtle or Intense » : les effets tombent sur les drops, les refrains et les breaks ; on touche un effet pour le
  changer. Puis l'export 16:9 (avec Pro).
- Fin : « stalak.app ».
- **Voix** : « Here's how to turn your song into a YouTube music video. One: pick Music video and drop in your song. Two: add a
  few takes. Three: pick Subtle or Intense, and the effects land on your drops. That's it. stalak.app. »
- **Légende** (proposition) : « Your song to a full YouTube music video in 3 steps. Music video mode on stalak.app. Try it free,
  export with Pro. #musicvideo #rapper #youtubemusic #indieartist »

### En réserve : modèle E « Would you rather »

« Would you rather post 15 seconds of your song… or the whole music video? » → le mode Clip.

**À noter pour la séance** : mettre les 2 vidéos Clip sur des jours non consécutifs ; dans le tableau envoyé au propriétaire,
marquer leur modèle `modele-D-clip` / `modele-C-clip`, pour comparer leurs vues aux autres dans le journal.
