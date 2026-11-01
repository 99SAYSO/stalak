Statut : PRÊT (le film est fini et envoyé au propriétaire ; dans le dépôt, seulement les sources et les notes : rien à intégrer dans l'app ni le site)
Branche : marketing/promo-one-shape

Résumé : promo v5 « One take », repartie de zéro le 1/11 à la demande du propriétaire, après le refus des v3 et v4.
- **Ce qu'il voulait** : une vidéo en motion design qui présente ce qu'on fait avec Stalak, inspirée d'une vidéo de @twoclipping (une seule forme qui reste la même et se transforme en chaque élément d'interface), au niveau d'une vidéo de portfolio, pour convaincre des rappeurs.
- **Son choix (1/11)** : l'idée A « One take », faite avec HyperFrames, avec une voix off, beaucoup de mouvement et de 3D, un motion design poussé, aux couleurs de Stalak, avec des transitions fluides.
- **Le film** (9:16, 1080 × 1920, 30 i/s, 25,2 s, anglais américain) : une seule forme 3D (un bloc extrudé aux stalactites de l'app) devient chaque étape de la vraie app sous le curseur. Le snippet fini en plein écran ; au clic il se fige, ses images défilent et les mots « STILL / EDITING / SNIPPETS / BY / HAND? » se verrouillent autour ; sur « Stalak », le logo claque à l'écran ; la zone « Import your music » ; le son « neva-die » dont le tempo est trouvé (157 BPM) ; la carte des prises qui grandit ; les 3 prises qui sortent en profondeur, décalées avec leur forme d'onde, puis s'alignent d'un coup ; les paroles collées ; le vrai montage de 21 plans posé sur le temps, Shuffle ; le filtre Frost qui balaie l'aperçu ; l'export ; le snippet en plein écran au drop ; « 40 min by hand » → « 3 min with Stalak » ; la forme fait un tour et devient l'icône de l'app, puis le logo et stalak.app.
- **Version 2** : après le brouillon 1, une relecture indépendante (un agent séparé) a noté le film ; ses remarques sont appliquées.
- **Version 3 (1/11 après-midi)** : les 6 retours du propriétaire. Début plus engageant. « STILL / EDITING / SNIPPETS / BY / HAND? » en gros mots qui s'assemblent, certains à la verticale. Logo Stalak sur le mot « Stalak ». Voix sans blanc. Snippet final de 1,53 s (2 s au plus demandé). Film plus dynamique (25,2 s au lieu de 29,8 s, mots de la voix un par un, coups de caméra). Détail dans `promo/one-shape/REVIEW.md`.
- **Le son** : « neva die » et son instru calés à l'échantillon ; la voix de 99Sayso sur les snippets (lèvres synchro), l'instru sous la voix off. La voix off (Gemini TTS dans Flora, voix Achird, 0,013 $) est coupée en 14 phrases, chacune posée sur un temps.
- **Les vrais éléments** : les vraies prises, le vrai montage de Stalak, les vrais textes de l'app, le vrai filtre Frost (traitement HyperFrames), le logo et l'icône officiels. Chiffres : 40 min et 3 min (les temps du propriétaire). « No sign-up » : même promesse que sur le site.

Fichiers touchés :
- `promo/one-shape/` : `REFERENCE.md`, `STORYLINES.md`, `SPEC.md`, `REVIEW.md`, `MEDIA.md`, `build.py`, `index.html` et `assets/times.js` (générés), `compositions/film.html`, `assets/engine.js`, polices, logo, GSAP, `.gitignore` ;
- `docs/STATUS.md` ;
- `docs/handoff/marketing-promo-one-shape.md`.

Aucun fichier de l'app ni du site n'est touché. Aucune vidéo, aucun son, aucune image tirée des prises dans le dépôt (demande du propriétaire) : le film lui a été envoyé directement.

Migration SQL : aucune.

Tests : `hyperframes lint` (0 erreur, 0 avertissement) et `hyperframes check` (réussi) ; rendu final regardé une image par temps, autour de chaque changement d'état et en largeur téléphone ; son mesuré (détail dans `promo/one-shape/REVIEW.md`).

Reste au propriétaire :
- Regarder le film et dire s'il le valide.
- Vérifier la licence de l'instru de « neva die » avant d'en faire une pub.
