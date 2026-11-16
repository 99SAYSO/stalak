# Compte rendu — `levels/format-pilotes`

Statut : PRÊT

Conversation « 8. Vidéos LEVELS », 16/11/2026.

## Résumé
- **Analyse de la vidéo de référence** envoyée par le propriétaire (skill `analyse-format-video`) : 27 s, 5 niveaux de 3,0 / 4,0 / 6,0 / 2,0 / 7,5 s puis 4,4 s de pub ; habillage fixe en haut (titre, 5 cases, étiquette ✗/✓, jauge) ; un seul décor ; bulles écrites au rythme des voix ; pas de musique ; promo intégrée au niveau 5 sous forme de « quête », pub explicite seulement à la fin.
- **Mode d'emploi du format adapté à Stalak** : `docs/marketing/levels/FORMAT.md` (ce qu'on garde, ce qu'on change, écran, squelette des 5 niveaux, règles des coups de dessin animé, son, texte, règles).
- **3 styles de bonhomme bâton et de décor** en images fixes (A Glace, B Nuit, C Sticker), dessinés en code (`tools/levels/styles.html`, `tools/levels/render_styles.py`), déposés dans Studio Stalak : collection `univers`, fiche `levels-style` (`statut: a_choisir`, `compte: "levels"`).
- **5 scripts pilotes** (réécrits le 16/11 à 22 h selon les 10 piliers, avec le Videur du « Pour toi ») dans Studio Stalak, collection `videos`, `compte: "levels"`, `format: "LEVELS"`, `statut: "script"` : drill (18/11 slot 1), love (18/11 slot 2), triste (19/11 slot 1), sur ton ex (19/11 slot 2), de motivation (20/11 slot 1).
- Aucun crédit dépensé (pas de voix, pas de Flora, pas de rendu vidéo).
- **Décisions du propriétaire (16/11, 21 h 25)** : durée 30 à 40 s, voix Flora, **pas de musique**, horaires à tester (plan dans `FORMAT.md`). Les 3 styles ne lui plaisent pas (« le même style de dessin que la vidéo envoyée ») : **style D** ajouté (même rendu, nos personnages et décors). Règles ajoutées dans « Mes goûts » : `levels-duree`, `levels-voix`, `levels-pas-musique`. Fiches pilotes mises à jour (heure, durée, son).
- **Les 10 piliers du propriétaire (16/11, 21 h 29)** en tête de `FORMAT.md`, complétés par l'analyse de la référence, avec le minutage corrigé (niveau 1 en 4,5 s, niveau 4 le plus court, niveau 5 en 11,5 s, promo 2,5 s, question 2 s). **Vrais noms d'artistes autorisés dans les blagues** (ni visage, ni voix imitée, ni fausse déclaration). 3 idées de juge récurrent dessinées en style D (fiche Univers `levels-juge`). Règles `levels-piliers` et `levels-vrais-noms` dans « Mes goûts ». Les 5 pilotes ont été réécrits selon les piliers. **22 h 25** : style D choisi ; drill, triste et motivation validés, leurs images fixes (plateau commun + accessoires) déposées (statut `visuels`) ; love et ex réécrits avec les répliques du propriétaire (statut `script`) ; règle `levels-blague-niveau1` dans « Mes goûts ».

## Fichiers touchés
- `docs/marketing/levels/FORMAT.md` (nouveau)
- `tools/levels/styles.html`, `tools/levels/render_styles.py`, `tools/levels/render_visuels.py` (nouveaux : styles, juges, plateau, accessoires des 5 pilotes)
- `docs/STATUS.md` (section « En cours »)
- `docs/handoff/levels-format-pilotes.md` (ce fichier)

## Migration SQL
Aucune.

## Tests
Aucun code du site touché. Rendu des 6 images vérifié à l'œil (textes dans la zone visible, pas de chevauchement important). Pas de planche contact : aucune vidéo fabriquée pour l'instant.

## Maquette
Aucun changement visible sur le site : pas de maquette nécessaire (règle 9).

## Reste au propriétaire
1. Choisir le style, sans doute D (Univers → « LEVELS · Le bonhomme bâton et son décor »).
2. Revalider les 5 scripts en version 3 (seul le niveau 5 change : voix off, aucune musique) ; les images des 5 pilotes sont déjà validées.
3. Choisir la voix off parmi 3 propositions (au moment de la fabrication).
4. Donner le feu vert (`lots/levels-2026-11-16`) une fois scripts et visuels validés.
