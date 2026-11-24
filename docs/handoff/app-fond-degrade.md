Statut : PRÊT

# Branche `app/fond-degrade` — le fond « A » sur les écrans à barre du bas (24/11)

Demande : `docs/handoff/chef-fond-degrade.md` (choix du propriétaire à 21 h 58, « je préfère le A »). Part de `app/stats-analyse` (contient les lots 3 et 4 et Stats, pour que « Stats » ait le même fond) + fusion de `main`.

## Ce qui change (téléphone)
- **Fond** d'Accueil, Montages, Stats et Compte : dégradé `#0b2f73` → `#1f6fd6` (48 %) → `#6fb6ff` (80 %) → `#cfe8ff`, fixe ; halo blanc doux (35 %) derrière la mascotte de l'accueil ; flocons **blancs** (motif d'origine de `theme.css`), les deux couches qui tombent, arrêtées avec « réduire les animations » (inchangé).
- **Textes posés sur le fond** passés au blanc :
  - titres : « Ton son est prêt… », « Salut … », « Galerie », le nom du profil, « Tes stats » → blanc avec contour noir épais (`-webkit-text-stroke` + `paint-order`, pas d'ombres empilées) ;
  - phrases : sous-titre de l'accueil, « Prêt pour ton prochain snippet ? », l'e-mail du profil, le nom sous « Tes stats » → blanc à 90 % ;
  - lien « Voir un exemple » → blanc ; messages d'état de l'accueil → blanc.
- **Compte** : l'en-tête garde les rayons et les glaçons, sans la colline bleu glace ; « Se déconnecter » devient un bouton blanc (le rouge sur le bleu clair ne se lisait pas).
- **Tirer pour rafraîchir** : son fond va du bleu au bleu nuit, comme le haut du dégradé.
- Cartes blanches, boutons, pastilles, barre du bas : inchangés. Éditeur, caméra, paywall « Salle », connexion, questionnaire et ordinateur : inchangés.

Maquette : https://app-fond-degrade.stalak-site.pages.dev/fr/ (Stats connecté : `?demo=gratuit` ou `?demo=pro`).

## Tests
- `refonte_mobile_ui` 102/102 (la vérification des flocons attend maintenant des flocons blancs, choix du propriétaire), `accueil_a_ui` 77/77, `refonte_mobile2_ui` 65/65, `refonte_stats_ui` 72/72, `refonte_mobile4_ui` 69/69.
- Captures iPhone 13 et iPhone SE de chaque écran à barre du bas : aucun texte foncé posé directement sur le dégradé.

## Ordre de fusion
`app/stats-analyse` d'abord (cette branche la contient), puis celle-ci.

## Pour les autres
- **Marketing** : rien dans `build_site.py` ni `site_src`.
- **Comptes** : rien dans `functions/` ni `account.js` ; seul l'habillage de l'écran Compte change (fond, couleur du nom et de l'e-mail, bouton « Se déconnecter »).
