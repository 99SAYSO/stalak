Statut : EN COURS (points 1 à 3 faits et testés ; série de non-régression avec celle des lots 3 et 4 ; maquette à montrer)
Branche : app/suite-clarity, partie de `app/refonte-mobile-lot4` (elle touche la caméra et l'éditeur du lot 3) : **elle contient
les lots 3 et 4**. À fusionner après eux.
Maquette de la branche : https://app-suite-clarity.stalak-site.pages.dev/fr/
Demande : `docs/handoff/chef-suite-clarity.md` (analyse `docs/audit/clarity-2026-11-24.md`), points 1 à 3. **Le point 4
(onboarding après la création du compte) n'est pas fait : il est remplacé par la demande « Stats »** (branche `app/stats-analyse`).

## 1. Caméra « Filmer maintenant »
- **La prise s'arrête toute seule à la fin du passage** : c'était déjà le cas (fin du passage + 0,3 s) ; vérifié par le test.
- **Le temps restant pendant la prise** : « ● encore 8 s » (avant : le temps écoulé). Sur téléphone, il est dans la pastille du
  haut de la caméra (lot 3) : « Prise 4 · ● encore 8 s ».
- **La caméra ne démarre pas** : les refus avaient déjà leur message (autorisation, caméra prise par une autre appli…). Nouveau :
  une caméra ouverte qui **n'affiche aucune image au bout de 4 s** le dit (« La caméra n'affiche rien. Ferme les autres applis qui
  l'utilisent (FaceTime, Instagram…), puis rouvre-la. Tu peux aussi importer une vidéo filmée avec l'appareil photo. »).
- **En haut à droite de l'aperçu sur iPhone** : il n'y avait rien d'utile (le compteur « n prises filmées »), d'où les taps
  perdus. Avec le lot 3, c'est maintenant le bouton **caméra avant / arrière** (48 px), et juste dessous le minuteur et le flash :
  ce que les visiteurs cherchaient sans doute.

## 2. Choix du passage
- **Le son se lit depuis la poignée dès qu'on la lâche** : poignée de début → depuis le début du passage ; poignée de fin → ses
  3 dernières secondes.
- **Choix rapides « 15 s / 30 s / Refrain »** sous l'onde (TikTok / Reels ; pas en mode Clip, qui prend tout le son) : 15 s ou
  30 s depuis le début du passage (reculé si le son finit avant) ; « Refrain » = le 1er refrain trouvé par l'analyse du son (30 s au
  plus), grisé avec « Pas de refrain trouvé dans ce son » sinon. Le passage choisi se fait entendre tout de suite.

## 3. Export trop lent à l'œil
- **La barre avance en continu** : le vrai chiffre est la cible ; la barre glisse vers lui et, quand il traîne, continue d'avancer
  de plus en plus doucement, jamais plus de 3,5 points devant, jamais 100 % avant la fin.
- **Temps restant estimé** sous la barre (« Encore environ 40 s », « Encore environ 1 min 20 »), calculé sur la vitesse mesurée
  pendant les 12 dernières secondes, affiché après 3 s.
- **Les étapes ne ressemblent plus à des boutons** : une simple liste, sans cadre ni ombre.
- Corrigé en passant : la barre de l'écran d'export ne suit plus que l'export (un autre travail en arrière-plan pouvait la faire
  sauter).
- **Pas fait** : l'aperçu de la vidéo qui se construit, et l'accélération réelle de la fabrication des images sur iPhone. Il faut
  mesurer sur un vrai iPhone où part le temps (décodage, dessin, encodage) avant de changer le moteur d'export ; je propose de le
  faire à part, avec un iPhone du propriétaire et le journal technique (« Copier les infos pour l'équipe »).

## Tests
- Nouveau `tests/ui/suite_clarity_ui.py` : **24/24** (iPhone 12 FR, ordinateur EN).

## Pour les autres
- **Marketing** : rien. **Comptes** : rien (la mesure du paiement est à leur branche).

## Fichiers
`src/app.js` (temps restant, caméra sans image, poignée qui joue, choix rapides `segQuick`, barre d'export lissée `EXP_SM` et
temps restant), `src/markup.html` (`#segQuick`, `#expEta`), `src/theme.css`, `tests/ui/suite_clarity_ui.py`.
