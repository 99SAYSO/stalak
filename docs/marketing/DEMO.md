# Vidéo de démo et exemple réel de l'app (6/11/2026, audit du 6/11, points 6, 7 et 13)

**Accord du propriétaire (6/11, 20 h)** : ses prises de « neva die » peuvent être sur le site et dans le dépôt, pour ces fichiers
seulement (exception à sa règle « aucune vidéo, aucun son, aucune image tirée des prises dans le dépôt »). Il a les droits de l'instru.
Toute autre utilisation de ses prises reste soumise à la règle.
**7/11, 16 h** : il demande une page « Clip » du site « avec le vrai exemple 16:9 » → `clip.mp4` et `clip.jpg` (mêmes prises, même
version du morceau ; branche `marketing/page-clip`).

## Les fichiers (`site_src/demo/`, publiés dans `/demo/`)

| Fichier | Ce que c'est | Où il sert |
| --- | --- | --- |
| `edit.mp4` (408 Ko) | **Un vrai montage Stalak** : l'app elle-même (version en ligne du 6/11) a monté ses 3 prises sur 4 mesures (6,1 s), une coupe par mesure, en Gratuit (avec le filigrane mascotte). 432 × 768, H.264 + AAC, 30 images/s. | Accueil (petite vidéo en boucle, sans le son), guides et page Triller (« après », avec le son) |
| `edit.jpg` | Son image d'affiche (0,4 s). | Accueil, guides, page Triller |
| `takes.jpg` (71 Ko) | « Avant » : une image de chacune des 3 prises brutes (montagnes, grenier, jardin). | Guides |
| `example/` (4,1 Mo) | L'exemple réel pour l'app : `song.mp3` (8 mesures de « neva die », 12,2 s, la version que ses lèvres suivent) et `take1.mp4` à `take3.mp4` (576 × 1024, calées à 0 sur le son ; la prise 1 s'arrête après 2 mesures), `example.json` (tempo, premier temps fort, durées). | **À brancher par App** (point 7) |
| `clip.mp4` (4,1 Mo) | **Un vrai clip Stalak en 16:9** (7/11) : l'app a monté ses 3 prises sur le passage entier de 25,5 s (17 mesures), mode Clip, effets sur Intense : 14 coupes et 5 effets (zoom 0:06, rafale 0:12,5 sur le roulement de charleston, flash 0:15,2 au début de la 2ᵉ partie, secousse 0:18,2, fondu au noir à la fin). 1280 × 720, H.264 + AAC, 30 images/s. | Page « Clip » (`/music-video`, `/fr/clip`) |
| `clip.jpg` (59 Ko) | Son image d'affiche (8,0 s, prise du jardin). | Page « Clip » |
| `../og/*.jpg` | Une image de partage par guide (1200 × 630, la marque seulement, aucune image des prises) ; `site_drafts/make_og.py` (`music-video.jpg` et `clip.jpg` pour la page « Clip » ; `python3 site_drafts/make_og.py music-video clip` ne refait que celles-là). | Aperçus de liens des guides et de la page « Clip » |

## Comment `edit.mp4` a été fait

1. Le site construit (`public/`), ouvert dans Chromium ; import de `takes_song.wav` (le son de ses prises, voir
   `promo/youtube/MEDIA.md`) et de ses 3 prises (`promo/youtube/assets/takes/`), comme un utilisateur.
2. **Tempo** : l'app a lu 89,7 BPM au lieu de 157 sur ce son de 25 s (voir plus bas). Corrigé comme un utilisateur le ferait :
   « Les coupes ne tombent pas en rythme ? » → TAP (16 tapes à 157 BPM sur le temps fort de 12,145 s) → Appliquer ; l'app
   affine elle-même sur le son (156,8 BPM).
3. Passage : 4 mesures à partir de 12,145 s (là où son visage se voit le mieux). 60 tirages de « Shuffle » listés ; gardé le
   n° 8 : prise 1 (montagnes), prise 2 (grenier), prise 3 (jardin), prise 2, une par mesure.
4. Export de l'app (1080 × 1920), puis réduit pour le web avec ffmpeg (CRF 32, son AAC 80 kb/s). Rien d'autre n'est changé.
5. **Planche contact** (skill `planche-contact`, `tools/contact_sheet.py`, une image toutes les 0,5 s) : 13 images relues sur le
   tirage n° 5 → 1 problème (0:05.0, le bonnet cache tout le visage, tête au bord gauche) ; corrigé en prenant un autre tirage
   (n° 8) ; 13 images relues sur le fichier final : 0 problème restant, ni image noire ni image figée (ffmpeg blackdetect /
   freezedetect).

Les scripts (hors dépôt, dans le dossier de travail de la conversation Marketing) : `export_demo.py` (pilote l'app avec
Playwright, `TAP=` pour le tempo, `SCAN=` pour lister les tirages). Les refaire à partir de `tests/ui/fluidite_ui.py` si besoin.

## Comment `clip.mp4` a été fait (7/11)

1. Le site construit (`public/` de `marketing/page-clip`), ouvert dans Chromium ; à l'étape 1, « Clip » (16:9) ; import de
   `takes_song.wav` et des 3 prises entières, les mêmes fichiers que pour `edit.mp4`.
2. **Droits Pro simulés dans ce navigateur de test** (`can = () => true`, le même moteur que pour un abonné) : aujourd'hui, en
   Gratuit, l'aperçu du Clip ne pose aucun effet, et l'export du Clip est réservé à Pro. Décision du 7/11 : effets et paroles
   visibles en Gratuit dans l'aperçu (n° 2 d'App).
3. **Tempo** : TAP à 157 BPM sur le temps fort de 1,444 s, comme pour `edit.mp4`. L'app affine à 156,98 BPM, grille à 13 ms près.
4. **Réglages** : effets Intense, rythme normal, « Meilleure prise auto » (attendu la fin de l'analyse des 3 prises). Pas de
   paroles (coupées par défaut en Clip), pas de filtre.
5. **Tirage** : les tirages de « Shuffle » passés en revue (`SCAN=`), en regardant 5 moments (entre 0:09 et 0:21) où son visage
   ne se voit que dans une des prises. Gardé le n° 20 : visage visible aux 5 moments, et le plus d'effets (5). Les coupes et les
   effets sont ceux de l'app, rien n'est changé à la main.
6. **Export de l'app** (1920 × 1080, 10 Mbit/s), réduit pour le web avec ffmpeg (1280 × 720, x264 CRF 29, son AAC 128 kb/s,
   `faststart`). Le Chromium de test n'a pas d'encodeur AAC : l'export y a un son Opus, ré-encodé en AAC (même son, vérifié par
   corrélation). Affiche : l'image à 8,0 s.
7. **Planche contact** (skill `planche-contact`, `tools/contact_sheet.py`, une image toutes les 0,5 s) :
   - premier rendu (tirage par défaut, sans attendre « Meilleure prise auto ») : visage caché de 0:09,5 à 0:12. Corrigé par le
     tirage n° 20 ;
   - fichier final : 52 images relues, **0 problème restant**. Ni image noire ni image figée (ffmpeg `blackdetect` /
     `freezedetect`) ; la dernière image est le fondu au noir voulu ;
   - gardés, car ce sont ses gestes de chorégraphie et pas un défaut du montage : main devant le visage vers 0:10 et 0:22,5
     (moins d'une seconde), tête baissée vers 0:07,5 et 0:21,5, et, de 0:16,8 à 0:17,0, la tête qui sort à gauche du cadre de sa
     prise du jardin (il se penche ; dans la prise du grenier, au même moment, il baisse la tête : changer de prise n'aide pas).
     Le zoom de 0:06,5 à 0:08,5 coupe le haut du bonnet : c'est l'effet zoom, le visage reste entier.

Script (hors dépôt, dossier de travail de la conversation Marketing) : `example_clip.py` (mêmes réglages par variables : `FX=`,
`TAP=`, `SEED=`, `SCAN=` avec `WANT=`, `LYR=`, `EXPORT=1`).

## Pour App : brancher l'exemple réel (point 7)

- Remplacer le son fabriqué et les visages dessinés (`demoLoad`, `demoTakes`, `drawDemo`) par `/demo/example/` :
  son `song.mp3`, prises `take1.mp4` à `take3.mp4` (calage 0, déjà vérifié : l'app les cale toute seule à 0,000 s).
- **Tempo à imposer** (`example.json`) : 157 BPM, temps = 0,38217 s, premier temps fort à 0 s, 8 mesures. Sur ce fichier de
  12,2 s l'app lit bien 157,07 BPM, mais elle place la grille sur le 3ᵉ temps et 90 ms trop tard (vérifié le 7/11, voir « En mode
  Clip » ci-dessous) : ne pas dépendre de la détection.
- Paroles de l'exemple : à demander au propriétaire (on connaît seulement « j'ai mis de l'or sur mes plaies, cicatrices valent
  des millions », vers 9,1 s de l'extrait).
- La version claude.ai n'a pas accès à ces fichiers : y garder l'exemple fabriqué.
- Ensuite « Now try it with your song » / « Maintenant, essaie avec ton son » sur l'écran de fin de l'exemple (audit, point 7).

### En mode Clip (16:9) : vérifié le 7/11

Demande du propriétaire (7/11) : App va utiliser cet exemple en TikTok et en 16:9 (n° 3 de `docs/clip/2026-11-07-etude-mode-clip.md`).
Vérifié dans le site construit de `marketing/page-clip` : mode Clip, 16:9, effets Intense, droits Pro simulés (ce que le Gratuit
verra dans l'aperçu après le n° 2).

| | Résultat | À faire |
| --- | --- | --- |
| **Le morceau** | Lu en entier : 12,227 s, 8 mesures, 157,07 BPM. Mais la grille tombe sur le 3ᵉ temps et 90 ms trop tard : mesures de l'app à 0,854 s, 2,382 s, 3,910 s, etc. ; les vraies sont à 0 s, 1,529 s, 3,057 s, etc. L'analyse des attaques donne raison à `example.json` : grosse caisse sur le 1ᵉʳ temps à 0 s (à 15 ms près), caisse claire sur le 3ᵉ. | App : imposer le tempo d'`example.json`. Avec un TAP à ce tempo, l'app recale la grille à 29 ms près (moins d'une image). |
| **Les 3 prises** | Calées à 0,000 s toutes seules. Toutes verticales (576 × 1024) : en 16:9, chacune est posée entière au centre sur une copie floutée (≈ 32 % de la largeur). La prise 1 (montagnes) s'arrête après 2 mesures : sur les 8 mesures, le clip alterne surtout le grenier et le jardin. | Rien pour le calage. Le cadrage, c'est le n° 4 de l'étude (App). |
| **Les effets** | L'analyse de la musique ne trouve ni drop, ni montée, ni break (2 parties « couplet ») : en Intense, 2 ou 3 effets seulement (un flash au début de la 2ᵉ partie, parfois une secousse, le fondu au noir de la fin). C'est juste, mais ça montre peu ce que le Clip apporte. | Voir la proposition ci-dessous. |
| **Les paroles** | `example.json` n'en a pas. Les 2 lignes connues s'affichent bien en 16:9 (au centre, lisibles, pas coupées) : « j'ai mis de l'or sur mes plaies, » à 9,115 s et « cicatrices valent des millions » à 10,415 s. En Clip, l'app coupe les paroles par défaut (`setKind`). | App : pour l'exemple, garder les paroles affichées, comme quand l'utilisateur les a choisies (`S.lyrUser`). Les autres lignes : demandées au propriétaire le 7/11. |
| **Prise horizontale** | Aucune : ses 3 prises sont verticales, et `promo/youtube/assets/clip/mv.mp4` est un extrait de son clip monté, sans le son (pas une prise). Rien sur le Drive. | Demandée au propriétaire le 7/11 : téléphone à l'horizontale, même version du morceau, le passage de 25 s en entier, un 4ᵉ endroit. À son arrivée, Marketing la cale et l'ajoute à `example/`. |

**Proposition (à décider par le Chef de projet, accord du propriétaire nécessaire)** : pour l'exemple en Clip, prendre le passage
entier de 25,5 s (17 mesures) des mêmes prises, comme `clip.mp4` : 14 à 16 coupes et 5 effets (zoom, rafale sur le roulement de
charleston, flash, secousse, fondu). Les 3 prises y sont jusqu'à 15 s (la prise 1 s'arrête là). Environ 10 Mo avec le même encodage
qu'`example/`. Les 8 mesures restent très bien pour l'exemple TikTok.

## Remarque pour App : détection du tempo

Sur `takes_song.wav` (25,5 s, « neva die », voix enregistrée avec la prise), l'app lit **89,7 BPM** au lieu de **157** (le rapport
fait 7/4 : ni la moitié ni le double, donc les boutons ½× et 2× ne corrigent pas). Sur l'extrait de 12,2 s du même son, elle lit
157,07 BPM. Un vrai utilisateur avec ce genre de morceau trap aurait des coupes à côté du temps jusqu'à ce qu'il tape le tempo.
