Statut : PRÊT

# Branche `app/aide-glacon` — deux vrais boutons Stalak dans le glaçon d'aide

Demande : `docs/handoff/chef-aide-glacon-26-11.md`. Bug signalé par le propriétaire le 26/11 à 8 h 39 : sur iPhone, « Talk to a human » ressemblait à un onglet collé, et « Copy info for the team » à un bloc en pointillés.

Partie de main `2ecbe93`.

## Pourquoi c'était cassé
Les deux boutons gardaient leur ancien style d'ordinateur, prévu pour le bas d'un panneau : un trait noir au-dessus et un fond gris pour l'un, des pointillés et un fond blanc pour l'autre. La version téléphone du glaçon (`mobile4.js`) ne faisait que les centrer.

## Ce qui change
**Sur téléphone** (`src/mobile4.js`) :
- **« Parler à un humain » / « Talk to a human »** devient un vrai bouton Stalak : bleu `#1f6fd6`, contour noir de 3 px tout autour, ombre dure, coins arrondis, icône 💬. Il fait 52 px de haut, a la même largeur que la zone de question et se place juste dessous. Il s'enfonce quand on appuie.
- **« Copier les infos pour l'équipe » / « Copy info for the team »** devient un lien discret, souligné et centré, sans contour, sans pointillés et sans bloc blanc. La zone à toucher fait 44 px.
- **« Découvrir Creator Plus »**, dans la bulle qu'on voit avec un compte gratuit, passe du bouton noir au bouton bleu Stalak (contour noir, ombre dure).

**Sur ordinateur** (`src/theme.css`) : les deux mêmes styles, en plus petit, au bas du panneau d'aide.

Les textes ne changent pas.

## Tests
- Nouveau test `tests/ui/aide_glacon_ui.py` : 12/12, sur iPhone 390 px en français et en anglais. Il vérifie :
  - le bouton bleu avec son contour complet et sa largeur ;
  - le lien discret ;
  - « Découvrir Creator Plus » en bleu ;
  - que rien ne déborde et qu'il n'y a aucune erreur.
- `help_ui` : 42/42.
- `refonte_mobile4_ui` : 81/81.

## Maquette
Dans `docs/audit/maquettes/aide-glacon-2026-11-26/` :
- la planche iPhone : fermé, ouvert en anglais, compte gratuit en anglais, ouvert en français, « Parler à un humain » en français ;
- les captures une par une ;
- la vue ordinateur.

## À prévenir
- Personne d'autre : seuls l'aide et son style changent (`mobile4.js`, `theme.css`).
