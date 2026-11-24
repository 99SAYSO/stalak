Statut : EN COURS

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
