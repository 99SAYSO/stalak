Statut : PRÊT (code, tests et série de non-régression faits ; maquette à montrer au propriétaire)
Branche : app/clip-reserve-abonnes (créée depuis `origin/main` 5c348be le 24/11).
Maquette de la branche : https://app-clip-reserve-abonnes.stalak-site.pages.dev (à montrer au propriétaire, règle 9).
Demande : `docs/handoff/chef-clip-reserve-abonnes.md` (décision du propriétaire du 24/11 à 7 h 55, remplace celle du 7/11).

## Ce qui change
- **« Clip » sans abonnement** (ni Pro, ni Creator Plus, ni essai Pro en cours ; connecté ou non) : à l'étape 1 comme à
  l'étape Montage, toucher « Clip » ouvre la page des formules sur Pro, avec en haut « Le mode Clip 16:9 est réservé aux
  abonnés. » / « Music video mode (16:9) is for subscribers. » (`acct.why.clip`). Le montage reste en TikTok / Reels : rien
  ne change, rien n'est perdu. L'étiquette PRO sur le bouton « Clip » reste.
- **Essai Pro en cours = abonné** : le mode Clip est ouvert (le serveur donne les mêmes droits qu'à Pro ; vérifié dans
  `essai_pro_ui`).
- **Plus d'aperçu gratuit** : le message `ca.try` (« essaie tout dans l'aperçu ») est supprimé, ainsi que le chemin qui
  passait en Clip sans abonnement. `ca.p` (question à l'export) dit maintenant « Le mode Clip 16:9 est réservé aux abonnés.
  Passe à Pro pour exporter ton clip, ou exporte ta vidéo au format TikTok / Reels. ».
- **La question à l'export reste** (`clipGate`), pour un seul cas : un abonnement qui se termine pendant le montage d'un clip.
- **Bouton de l'accueil « Essaie le mode Clip »** (`hero.clip`) : il est déjà caché partout depuis la maquette A du 23/11
  (téléphone et ordinateur) et n'avait plus d'action. Proposition : il reste caché ; son texte ne promet plus d'essai (« Le
  **mode Clip** : tout ton morceau en 16:9, pour les abonnés ») et, s'il revient un jour, il fait la même chose que « Clip »
  (abonné : le mode Clip ; sinon : les formules). → **Marketing** (bloc de l'accueil).
- **Version claude.ai** (pas de compte) : inchangée, le mode Clip y reste ouvert.

## Un clip déjà commencé en gratuit : rien n'est perdu
- Un projet Clip (gardé dans le téléphone, ou en ligne) ouvert sans abonnement s'ouvre en TikTok / Reels 9:16, avec le
  message « « {nom} » est un clip : le mode Clip est réservé aux abonnés, il s'ouvre donc en TikTok / Reels. Ton clip est
  gardé : il revient quand tu passes à Pro et choisis Clip. ».
- Le clip lui-même (passage, format, effets choisis à la main, montage, plans verrouillés) est gardé à part (`S.clipKept`),
  et **enregistré avec le projet** (`clipKept` dans l'état sauvegardé) : il survit aux reprises suivantes.
- Une fois abonné, toucher « Clip » le remet **comme il était** (le montage seulement si les prises n'ont pas changé ; sinon
  le passage et les réglages, et le montage est refait). Choisir un autre son l'oublie.

## Tests
- `clip1_ui` 91/95 : Gratuit → « Clip » ouvre les formules et reste en 9:16, plus d'effet de clip ; abonné → Clip, effets,
  paroles, cadrages sans étiquette PRO ; abonnement fini pendant le montage → la question à l'export. Les 4 échecs restants
  sont ceux de `main` (`.band-frost a:hover`, Marketing).
- `audit611_ui` 89/93 : le cas Clip adapté (formules au lieu de l'aperçu) passe ; les 4 échecs sont ceux de `main`
  (scripts du bandeau cookies, Comptes).
- `formules_ui` 136/137 : « Clip » gratuit → formules (Clip, Pro) ; l'échec restant est celui de `main` (filigrane).
- `projet_local_ui` : nouveau cas « clip gardé » (un abonné fait un clip ; rouvert sans abonnement → TikTok 9:16 et le
  message ; gardé et rouvert encore → le clip est toujours là ; « Clip » sans abonnement → formules ; abonné → le clip revient
  à l'identique : passage, 16:9, montage).
- `essai_pro_ui` : en plus, « essai en cours = abonné : le mode Clip est ouvert ».

## Pour les autres
- **Marketing** : `site_src/pricing.html` (« Try it free — Pick “Music video” at step 1 ») et les pages Clip
  (`/music-video`, `/fr/clip`, `music-video-maker-for-rappers`) promettent encore un essai gratuit du mode Clip. Le bouton
  caché `hero.clip` de l'accueil (voir plus haut).
- **Juridique** : conditions et Tarifs, aucune promesse d'essai gratuit du mode Clip (l'essai Pro de 7 jours reste).
- **Comptes** : rien à faire (`FEAT_PLAN.clip = 'pro'`, l'essai donne déjà le mode Clip). L'événement `clip_open` est
  toujours envoyé quand quelqu'un touche « Clip », abonné ou non : il compte maintenant les personnes intéressées.

## Fichiers
- `src/app.js` : `kindPick` (abonné ou formules), `clipBack` et `cutsBack`, `S.clipKept` (dans `clApply`, `clCollect`,
  `setSong`, `setKind`), textes `ca.p`, `acct.why.clip`, `cl.clipNoPro`, `hero.clip` (EN), `ca.try` supprimé, action de
  `#heroClip`.
- `src/markup.html` : texte FR de `#heroClip` (bouton caché).
- Tests : `clip1_ui.py`, `audit611_ui.py`, `formules_ui.py`, `projet_local_ui.py`, `essai_pro_ui.py`.

## Série de non-régression (24/11, sur la branche, site reconstruit dans une copie à part)
- Passent : `essai_pro_ui` 205/205 (dont « essai en cours = mode Clip ouvert »), `projet_local_ui` 76/76 (dont « clip gardé »,
  4 appareils et langues), `audit_ui` 122/122, `accueil_a_ui` 77/77, `refonte_mobile_ui` 102/102, `refonte_mobile2_ui`
  142/142, `filtres_ui` 106/106, `fin_export_ui` 98/98, `exports_rates_ui` 80/80, `vente_ui` 63/63, `fenetre_pro_ui` 84/84,
  `plans_ui` 39/39, `achat_ui` 23/23, `gallery_ui` 48/48, serveur 132/132.
- `clip1_ui` 91/95, `formules_ui` 136/137 : seuls les échecs déjà sur `main` restent (`.band-frost a:hover` de Marketing ;
  filigrane de l'export gratuit).
- `audit611_ui` 89/93 et `partager_ui` 88/92 : échecs déjà sur `main` depuis la fusion de Comptes (bandeau cookies ; bloc de
  l'offre à 1 €) → Comptes.
