# Bug signalé par le propriétaire (26/11, 8 h 39) — pour App

**Le glaçon d'aide** (le cube en bas à droite, `help.*` dans `src/app.js`) : sur iPhone, en anglais, quand on l'ouvre, les deux boutons sous la zone « Ask your question… » sont mal dessinés. Capture : `docs/audit/retours-2026-11-26/aide-glacon-boutons.jpg`.

- « **Talk to a human** » ressemble à un onglet collé, avec un trait noir épais au-dessus, un fond gris clair et aucun contour.
- « **Copy info for the team** » a un contour pointillé bleu et un fond blanc à part. On dirait deux bouts d'interface empilés au hasard.

Probablement un style d'onglet ou de bouton d'une autre partie de l'app (fusions du 25-26/11) qui s'applique ici.

**À faire :**
- deux vrais boutons Stalak, propres et alignés : le principal (« Talk to a human », ou « Discover Creator Plus » pour les comptes gratuits) et un lien discret « Copy info for the team » ;
- capture iPhone 390 px FR et EN, ouvert et fermé ;
- vérifier `help_ui` ;
- maquette au propriétaire, puis branche `app/aide-glacon` et compte rendu.
