# L'exemple du propriétaire, image par image

Vidéo : https://x.com/twoclipping/status/2103273003555402193 (zero, @twoclipping). Regardée le 1/11 dans le navigateur, une image toutes les 0,5 s puis toutes les 0,1 s pendant les transformations. On garde la grammaire (comment ça bouge), jamais le contenu ni les textes.

## Ce que c'est
- Carré 1440 × 1440, 14,06 s, en boucle (la dernière image est la première).
- Musique libre de droits vers 120 BPM, 7 mesures, et il se passe quelque chose sur chaque temps. Des petits sons d'interface posés sur chaque clic. Pas de voix.
- Tout est fait en code (pas d'After Effects), d'après le texte du post.

## La forme unique
Un seul objet, jamais coupé : la même forme change de taille, d'arrondi et de couleur, et son contenu change avec un court flou.
Suite des états : bouton « Generate » → rond qui charge → coche → « Dynamic Island » (pochette + barres de son) → lecteur de musique (play devient pause) → on fait glisser la barre de lecture → curseur de volume, qui s'étire quand on tire trop loin → interrupteur → son bouton devient l'indicateur d'onglets (Day / Week / Month) → les onglets s'ouvrent en graphique qui se dessine, avec une bulle au survol → barre de recherche → palette de commandes, on tape « frame » pour filtrer → Entrée → notification « Every frame is code » avec une coche → retour au bouton.

## Comment ça bouge
- **Un curseur fait tout** : vrais clics, vrais glissés. Chaque changement a une cause visible.
- **Ressorts partout** (pas d'animation linéaire, pas de rebond de dessin animé), à peine un dépassement.
- **Le contenu sort en flou (environ 0,1 s), puis le nouveau entre en flou** pendant que la forme change de taille.
- **Flou de mouvement** sur ce qui va vite (le post parle de 4 sous-images par image, mélangées, en 60 i/s).
- **La caméra zoome** pour que chaque état remplisse bien l'image.
- L'indicateur d'onglets s'étire : son bord avant va plus vite que son bord arrière.
- Rien d'immobile : pas de temps mort.

## Le look
- Fond gris chaud très clair, un peu plus sombre dans les coins : #f0f0ec au centre, #ebece7 aux bords.
- Composants noir pur (#000000) puis blanc (#fffffd) à partir des onglets, ombres douces sous la forme.
- Une seule police d'interface (Geist), textes courts, icônes au même trait.
- Interdits dans son texte : rebonds, explosions de particules, halos lumineux, dégradés sur l'interface, icônes mal assorties, temps morts, tout ce qui fait « modèle tout fait ».

## Ce qu'on en garde pour Stalak
- Une seule forme qui devient chaque étape de la vraie app, sur chaque temps du son.
- Les vrais textes de l'app (captures dans `promo/stalak-explainer/assets/ui/` et `src/app.js`), jamais un bouton inventé.
- Ressorts, flou au changement de contenu, flou de mouvement, caméra qui suit, boucle parfaite.
- En plus de l'exemple, à la demande du propriétaire : de la 3D (voir `STORYLINES.md`).
