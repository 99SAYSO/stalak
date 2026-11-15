# Branche `marketing/serie-fr` : série animée « Studio Chambre », étape 1

> Marketing & croissance, 15/11/2026, d'après les messages du Chef de projet du 15/11 (21 h 19, 21 h 30 et 21 h 51).
> Rien ne change sur le site : seulement `tools/serie/` et `docs/`. L'aperçu de la branche montre donc le même site que `main`.

## Ce qui est fait

1. **Les 3 pilotes réécrits au format du 15/11 à 21 h 51.** Chacun dure environ 1 min 15 (estimation sur le texte). Chacun suit la même structure : un cri dès la première seconde, le bandeau du titre, puis le narrateur qui présente et alterne avec les personnages ; chaque réplique est écrite avec le nom de celui qui parle.
   - Épisode 1, « LE SON DE L'ANNÉE » : la vidéo de promo calée à la main jusqu'à 3 h 47, l'écran noir, la mascotte à la fenêtre.
   - Épisode 2, « MA MÈRE ENTRE PENDANT LA PRISE » : le cri du poulet tombe sur le temps, puis le clip « feat. Maman ».
   - Épisode 3, « LE FEAT GRATUIT » : Big Banquise, les notes vocales, le couplet échangé contre des vidéos.
   - Les 3 fiches sont dans Studio Stalak, en statut `script`, avec le script complet, la légende, les mots-clés, la durée et le format « Histoire animée ».
   - Source mot pour mot : `tools/serie/episodes/pilotes.py`. Elle sert à la fois aux fiches et à la voix.
2. **La maquette en images fixes**, 17 planches déposées dans la page et rangées dans le champ `visuels` des fiches. Tout est dessiné en code : rien n'a été dépensé.
   - À choisir par le propriétaire (dans la fiche de l'épisode 1) : le style de dessin (A sticker givré, conseillé ; B glaçon ; C papier découpé) et le look du bandeau et des sous-titres (1 carte givrée ; 2 glaçon ; 3 ruban bleu).
   - Les personnages, les expressions de Yanis et les décors de chaque épisode.
3. **Le moteur de la série** (`tools/serie/`) :
   - `engine/` dessine les personnages et les décors image par image ;
   - `maquette.py` refait les images fixes et les planches ;
   - `build.py` fabrique un épisode : plan, images, son, montage, planche contact.
   - Les rendus et les voix ne sont jamais dans le dépôt.
4. **La bible** : `docs/marketing/SERIE_BIBLE.md` (personnages, décors, format, règles, rythme et coût, 30 idées d'épisodes).
5. **Le skill `stalak-videos-reseaux`** : une mise à jour a été proposée au propriétaire (carte de validation). Elle ajoute la structure des épisodes, la façon d'estimer la durée, les images faites en code et la voix groupée par personnage.

## Rythme et coût (demandés avant de lancer la série)

- **Coût par épisode : moins de 0,10 $.**
  - La voix coûte 0,05 à 0,08 $. Une génération Gemini coûte 0,013 $ quelle que soit sa longueur, donc on fait une génération par personnage et par façon de parler.
  - Les images, la musique et le rendu coûtent 0 $.
  - Les 3 pilotes demandent 15 générations, soit environ 0,20 $.
  - À 14 épisodes par semaine, la voix revient à environ 1 $. Le solde Flora, environ 3 $, tient environ 3 semaines.
- **Rythme tenable : 2 épisodes par jour.** La première semaine, 1 par jour, le temps de faire la bibliothèque de poses et de décors. Pas 3 : ce serait 63 validations par semaine pour le propriétaire, et la qualité baisserait.

## Ce qui attend le propriétaire (Studio Stalak, onglet « À valider »)

1. Lire les 3 scripts.
2. Dans la fiche de l'épisode 1, écrire son choix, par exemple « style A, bandeau 2 », puis valider ou demander une correction.
3. Ensuite, Marketing passe les fiches en `visuels` : les images sont déjà prêtes, à refaire dans le style choisi si ce n'est pas le A. Le propriétaire valide les images, puis donne le feu vert.
4. Alors seulement : les voix (une seule fois), les vidéos, les planches contact, le dépôt en version allégée 720 × 1280, puis le statut `video`.

## À savoir

- **Juridique** : l'épisode 1 dit « Enregistré sur BandLab » (le nom seulement, jamais le logo ni l'écran). En attendant leur avis, la phrase de secours est « sur son ordi ».
- **Lecture du 15/11 à 21 h 51** : les 3 pilotes suivent aussi la nouvelle étape « images fixes, puis vidéo ». La vidéo et la voix ne se font donc qu'après le choix du style et la validation. L'exception de la maquette évite seulement d'attendre le feu vert de toute la semaine. À corriger si ce n'est pas ce que veut le propriétaire.
- **Ce qui reste pour Marketing** : la bible en anglais, puis les posts et stories Instagram dans le même style. Le kit du programme artistes américains ne change pas.

Skills utilisés : `stalak-videos-reseaux`, `stalak-da`, `reels-scripting`, `hook-generator`, `saas-motion-video`, `code-motion-video`, `planche-contact` (pour les vidéos, à la production).
