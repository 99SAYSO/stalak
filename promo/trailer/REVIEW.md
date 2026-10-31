# Stalak — « Before midnight » (bande-annonce v4) : REVIEW

## Ce que c'est

La quatrième promo, repartie de zéro à la demande du propriétaire (31/10, 23 h) : sans mascotte, avec une voix off, dans le style de son exemple (la pub « Spenda 2.0 » de WizzEdits). Il a choisi le thème de l'horloge (idée 2) avec le motion design de l'idée 1. Les 3 idées de départ sont dans `STORYLINES.md`, le plan dans `SPEC.md`.

- 1080 × 1920, 30 i/s, 37,5 s (1 125 images), anglais américain.
- La voix (Gemini 3.1 Flash TTS, voix Achird, lecture « souriante ») décide des temps : `timing.json` (12 lignes, mots clés), `build.py` écrit `index.html` et `assets/times.js`.
- Chiffres : 40 min (le vrai temps de montage à la main du propriétaire) et 3 min (son vrai temps avec Stalak, mesuré le 31/10). L'horloge va de 11:42 PM à 11:45 PM avec Stalak, et jusqu'à 12:22 AM à la main.

## Contrôles

- `npx hyperframes lint` : 0 erreur, 0 avertissement.
- `npx hyperframes check` : les seules erreurs étaient des chevauchements voulus (les copies floues de l'écho, et les deux scènes qui se passent le relais) : marqués `data-layout-allow-overlap`. Reste le message WebGL « GPU stall due to ReadPixels » (sans effet sur l'image) et un avertissement de contraste sur un mot pendant qu'il s'efface.
- Images : 21 puis 12 puis 7 images de contrôle pendant la fabrication ; le premier rendu complet regardé toutes les 0,25 s (150 images).

## Défauts vus sur le premier rendu, corrigés

1. Les captures de l'app étaient mal cadrées sur l'écran de l'iPhone 3D (les UV de la forme arrondie) : corrigé, la vraie app s'affiche en entier.
2. La vidéo finie ne jouait pas dans les scènes 8 et 9 : le calage des prises donnait un temps négatif. Le point de départ de l'instru est recalé (`c` = 36,574 s) : la basse revient sur un temps fort au moment des coupes, et les prises sont dans leur plage.
3. L'horloge de la scène « cut. trim. sync. again. » repartait de 11:45 : elle reste maintenant sur 12:22 AM, le temps perdu, et le rembobinage repart de là.
4. « Done. Before midnight. » couvrait le visage : le texte est descendu sous le visage, l'heure est remontée en haut.
5. Le téléphone passait sous le titre « Drop your song » et cachait « in sync with your lips » : il est plus bas pendant le son et les prises, et sort par le bas pendant la timeline.
6. Les cartes des prises en orbite étaient minuscules, puis énormes au premier plan : perspective adoucie, cartes de 312 × 554 px.
7. Un premier filtre « Frost » en CSS a été remplacé par le vrai traitement `media-treatment` (le même réglage que la v2, approuvé), fondu en 0,25 s avec « Filter ». `build.py` le garde à chaque reconstruction.

## Choix

- **Le style de l'exemple, pas une copie** : mêmes procédés (noir / blanc, mots un par un, écho, anneau, iPhone 3D, orbite, carré → logo, fin tapée), mais nos textes, nos couleurs, notre produit.
- **Pas de boutons App Store** : Stalak est un site, et c'est l'argument de la fin (« No download. No sign-up. », puis stalak.app tapé).
- **La voix** : deux lectures générées (0,026 $), le propriétaire a choisi la souriante. Les pauses de la voix sont gardées : elles donnent le rythme.
- **Le temps** : seuls les chiffres du propriétaire (40 min, 3 min). L'horloge fait 11:42 → 11:45 avec Stalak.
- **Hors dépôt** : la voix, la musique et les vidéos (`MEDIA.md`).
