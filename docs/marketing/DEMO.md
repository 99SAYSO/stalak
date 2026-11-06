# Vidéo de démo et exemple réel de l'app (6/11/2026, audit du 6/11, points 6, 7 et 13)

**Accord du propriétaire (6/11, 20 h)** : ses prises de « neva die » peuvent être sur le site et dans le dépôt, pour ces fichiers
seulement (exception à sa règle « aucune vidéo, aucun son, aucune image tirée des prises dans le dépôt »). Il a les droits de l'instru.
Toute autre utilisation de ses prises reste soumise à la règle.

## Les fichiers (`site_src/demo/`, publiés dans `/demo/`)

| Fichier | Ce que c'est | Où il sert |
| --- | --- | --- |
| `edit.mp4` (408 Ko) | **Un vrai montage Stalak** : l'app elle-même (version en ligne du 6/11) a monté ses 3 prises sur 4 mesures (6,1 s), une coupe par mesure, en Gratuit (avec le filigrane mascotte). 432 × 768, H.264 + AAC, 30 images/s. | Accueil (petite vidéo en boucle, sans le son), guides et page Triller (« après », avec le son) |
| `edit.jpg` | Son image d'affiche (0,4 s). | Accueil, guides, page Triller |
| `takes.jpg` (71 Ko) | « Avant » : une image de chacune des 3 prises brutes (montagnes, grenier, jardin). | Guides |
| `example/` (4,1 Mo) | L'exemple réel pour l'app : `song.mp3` (8 mesures de « neva die », 12,2 s, la version que ses lèvres suivent) et `take1.mp4` à `take3.mp4` (576 × 1024, calées à 0 sur le son ; la prise 1 s'arrête après 2 mesures), `example.json` (tempo, premier temps fort, durées). | **À brancher par App** (point 7) |
| `../og/*.jpg` | Une image de partage par guide (1200 × 630, la marque seulement, aucune image des prises) ; `site_drafts/make_og.py`. | Aperçus de liens des guides |

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

## Pour App : brancher l'exemple réel (point 7)

- Remplacer le son fabriqué et les visages dessinés (`demoLoad`, `demoTakes`, `drawDemo`) par `/demo/example/` :
  son `song.mp3`, prises `take1.mp4` à `take3.mp4` (calage 0, déjà vérifié : l'app les cale toute seule à 0,000 s).
- **Tempo à imposer** (`example.json`) : 157 BPM, temps = 0,38217 s, premier temps fort à 0 s, 8 mesures. Sur ce fichier de
  12,2 s l'app lit bien 157,07 BPM, mais mieux vaut ne pas dépendre de la détection (voir plus bas).
- Paroles de l'exemple : à demander au propriétaire (on connaît seulement « j'ai mis de l'or sur mes plaies, cicatrices valent
  des millions », vers 9,1 s de l'extrait).
- La version claude.ai n'a pas accès à ces fichiers : y garder l'exemple fabriqué.
- Ensuite « Now try it with your song » / « Maintenant, essaie avec ton son » sur l'écran de fin de l'exemple (audit, point 7).

## Remarque pour App : détection du tempo

Sur `takes_song.wav` (25,5 s, « neva die », voix enregistrée avec la prise), l'app lit **89,7 BPM** au lieu de **157** (le rapport
fait 7/4 : ni la moitié ni le double, donc les boutons ½× et 2× ne corrigent pas). Sur l'extrait de 12,2 s du même son, elle lit
157,07 BPM. Un vrai utilisateur avec ce genre de morceau trap aurait des coupes à côté du temps jusqu'à ce qu'il tape le tempo.
