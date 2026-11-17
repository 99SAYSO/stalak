# Compte rendu — `levels/format-pilotes`

Statut : PRÊT

Conversation « 8. Vidéos LEVELS », 16/11/2026.

## Résumé
- **Analyse de la vidéo de référence** envoyée par le propriétaire (skill `analyse-format-video`) : 27 s, 5 niveaux de 3,0 / 4,0 / 6,0 / 2,0 / 7,5 s puis 4,4 s de pub ; habillage fixe en haut (titre, 5 cases, étiquette ✗/✓, jauge) ; un seul décor ; bulles écrites au rythme des voix ; pas de musique ; promo intégrée au niveau 5 sous forme de « quête », pub explicite seulement à la fin.
- **Mode d'emploi du format adapté à Stalak** : `docs/marketing/levels/FORMAT.md` (ce qu'on garde, ce qu'on change, écran, squelette des 5 niveaux, règles des coups de dessin animé, son, texte, règles).
- **3 styles de bonhomme bâton et de décor** en images fixes (A Glace, B Nuit, C Sticker), dessinés en code (`tools/levels/styles.html`, `tools/levels/render_styles.py`), déposés dans Studio Stalak : collection `univers`, fiche `levels-style` (`statut: a_choisir`, `compte: "levels"`).
- **5 scripts pilotes** (réécrits le 16/11 à 22 h selon les 10 piliers, avec le Videur du « Pour toi ») dans Studio Stalak, collection `videos`, `compte: "levels"`, `format: "LEVELS"`, `statut: "script"` : drill (18/11 slot 1), love (18/11 slot 2), triste (19/11 slot 1), sur ton ex (19/11 slot 2), de motivation (20/11 slot 1).
- Crédits : 0,117 $ (9 essais de voix) + 0,091 $ (7 voix du pilote drill) = **0,208 $**.
- **Fabrication** (16/11, 23 h 50) : moteur d'animation en code (`tools/levels/engine.html`, `engine.js`, `states.js`), épisodes (`tools/levels/episodes.py`), chaîne complète voix → timeline → bruitages faits en code → images → vidéo (`python3 tools/levels/fabrique.py <épisode> [voix|plan|son|images|mux|tout]`, dossier de travail `/home/claude/work/levels`, rien de lourd dans le dépôt). Voix choisies : Puck (rappeur), Orus (Videur), Enceladus (voix off). **Pilote 1 « drill » fini et déposé** (38 s, statut `video`, planche contact relue : 3 défauts corrigés, 0 restant, miniature). Les 4 autres attendent le retour du propriétaire sur le premier.
- **17/11, 0 h 15 : nouvelle mise en scène décidée par le propriétaire** (« Comment faire la promo de ton son … », la jauge HYPE remplace le Videur, coups qui viennent de la scène, personnages qui reviennent au niveau 5, stock de scénarios) et retours de look (HyperFrames + lumière ambiante, haut d'écran sur fond uni, titre tout blanc, contours épais, bruitage et animation des bulles, jauge qui bouge après chaque phrase, phrase qui dit ce qui est mal). Tout est dans `FORMAT.md` (partie 00) et dans « Mes goûts » (8 règles `levels-*`). Look en images fixes : fiche Univers `levels-look-2` (`tools/levels/look.html`), à valider. Nouveau script pilote : fiche `levels-v2-p1` (« … quand t'as 0 abonné », statut `script`). Les 5 anciennes fiches (Videur) repassent en `idee`, marquées « ancienne mise en scène ». Le moteur `engine.js`/`states.js` sera refait sur HyperFrames pour la nouvelle vidéo.
- **Décisions du propriétaire (16/11, 21 h 25)** : durée 30 à 40 s, voix Flora, **pas de musique**, horaires à tester (plan dans `FORMAT.md`). Les 3 styles ne lui plaisent pas (« le même style de dessin que la vidéo envoyée ») : **style D** ajouté (même rendu, nos personnages et décors). Règles ajoutées dans « Mes goûts » : `levels-duree`, `levels-voix`, `levels-pas-musique`. Fiches pilotes mises à jour (heure, durée, son).
- **Les 10 piliers du propriétaire (16/11, 21 h 29)** en tête de `FORMAT.md`, complétés par l'analyse de la référence, avec le minutage corrigé (niveau 1 en 4,5 s, niveau 4 le plus court, niveau 5 en 11,5 s, promo 2,5 s, question 2 s). **Vrais noms d'artistes autorisés dans les blagues** (ni visage, ni voix imitée, ni fausse déclaration). 3 idées de juge récurrent dessinées en style D (fiche Univers `levels-juge`). Règles `levels-piliers` et `levels-vrais-noms` dans « Mes goûts ». Les 5 pilotes ont été réécrits selon les piliers. **22 h 25** : style D choisi ; drill, triste et motivation validés, leurs images fixes (plateau commun + accessoires) déposées (statut `visuels`) ; love et ex réécrits avec les répliques du propriétaire (statut `script`) ; règle `levels-blague-niveau1` dans « Mes goûts ».
- **17/11, 5 h 30 : pilote « Quand t'as 0 abonné » fabriqué** (fiche `levels-v2-p1`, statut `video`, 39,9 s). Nouvelle chaîne HyperFrames dans `tools/levels/v2/` : `scene.js` dessine la scène image par image (contours épais, lumière ambiante, coups qui viennent de la scène, personnages qui reviennent au niveau 5) ; `ui.js` pose sur la timeline GSAP le haut de l'écran (titre blanc, 5 chiffres, phrase ✗/✓), la jauge HYPE (monte après chaque phrase du rappeur, retombe à chaque échec, se décroche au niveau 4, explose au niveau 5), les bulles (entrée/sortie animées + petit bruitage), les cartons de fin ; `build.py` fait voix → timeline → bruitages en code → rendu HyperFrames → son (`python3 tools/levels/v2/build.py tout --ep abo`). Voix de la mère choisie par le propriétaire : Sulafat. Rappeur accéléré ×1,15 pour tenir sous 40 s. Planche contact : 2 passes, défauts corrigés (bulles invisibles, message « Tata Josiane a quitté le groupe » caché, cartes et téléphones dans la zone droite, rien au tout premier instant), 0 restant.

## Fichiers touchés
- `docs/marketing/levels/FORMAT.md` (nouveau)
- `tools/levels/styles.html`, `tools/levels/render_styles.py`, `tools/levels/render_visuels.py` (nouveaux : styles, juges, plateau, accessoires des 5 pilotes)
- `tools/levels/engine.html`, `engine.js`, `states.js`, `episodes.py`, `fabrique.py` (nouveaux : fabrication des vidéos)
- `tools/levels/v2/scene.js`, `ui.js`, `index.html`, `build.py` (nouveaux : la nouvelle mise en scène sur HyperFrames)
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
2. Valider le nouveau look (`levels-look-2`) et le nouveau script pilote (`levels-v2-p1`).
3. Choisir les 3 voix dans l'onglet Univers (rappeur, Videur, voix off) : 9 essais déposés le 16/11 à 22 h 25, **0,117 $ dépensés** sur Flora (Gemini TTS, projet « Stalak — Ice the Beat (voix off) », la limite de projets Flora étant atteinte). Feu vert donné dans la conversation à 22 h 17.
4. Donner le feu vert (`lots/levels-2026-11-16`) une fois scripts et visuels validés.
