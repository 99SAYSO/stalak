Statut : EN COURS (prêt côté App ; attend `acctHas`, `acctQuota`, `acctUseVideo` et le paramètre `plan` d'`acctOpen`, côté Comptes)
Branche : app/formules (part de app/filtres : à fusionner après elle)

Résumé :
- Ce que débloque chaque formule, dans l'app, décrit dans une seule table `FEAT_PLAN` (src/app.js, bloc « formules », juste avant les filtres) :
  - Basic : nologo (pas de fin Stalak), text (toutes les tailles et apparitions du texte), unlimited (plus d'1 vidéo par jour) ;
  - Pro : filters (tous les filtres ; Gratuit et Basic en ont 3), clip (mode Clip 16:9), pack5, pack10 ;
  - Max : pack30.
- Tous les contrôles passent par `can(feat)` :
  - `acctHas(feat)` si la fonction existe ;
  - sinon la règle d'avant (`acctPro()`), pour que rien ne change tant que Comptes n'a pas livré ;
  - sur claude.ai (pas de comptes) : tout est ouvert, comme avant.
- Cadenas : chaque cadenas appelle `lockOpen(feat)`, c'est-à-dire `acctOpen(raison, { plan: 'basic' | 'pro' | 'max' })`, pour ouvrir la page des formules sur la bonne formule.
  - Les étiquettes affichent le nom de la formule (BASIC, PRO, MAX) : tailles de texte, mode Clip, pack (PRO ou MAX selon 5/10/30), filtres.
  - Le lien de la fin Stalak devient « L'enlever avec Basic ».
- Vidéo du jour (Gratuit) :
  - avant un export, `dayGate()` lit `acctQuota()` ; si `left` vaut 0, l'écran « Ta vidéo du jour est faite ✓ » s'ouvre à la place de l'export ;
  - l'écran affiche « Reviens demain, ou passe à Basic pour des vidéos illimitées », le temps restant avant la prochaine vidéo gratuite (mis à jour toutes les 15 s), « Passer à Basic » (formule Basic) et « Revenir demain » ;
  - il est fermable avec Échap, le focus reste dedans, en FR et en EN ;
  - une personne non connectée qui exporte voit la création de compte s'ouvrir (raison `daily`) ;
  - quand la vidéo est prête, `dayUsed()` appelle `acctUseVideo()` pour la compter.
- Textes : les raisons des cadenas nomment désormais la bonne formule (texte et logo : dès Basic ; Clip, filtres, packs 5/10 : Pro ; packs 30 : Max). Nouvelles clés dans un bloc « App & montage : formules » (`day.*`, `acct.why.daily`, `acct.why.pack30`, `acct.outroBasic`…).

Ce que Comptes doit livrer (noms utilisés ici, à garder tels quels) :
1. `acctHas(feat)` → `true` ou `false`, pour : `nologo`, `text`, `unlimited`, `filters`, `clip`, `pack5`, `pack10`, `pack30`.
2. `acctQuota()` → `{ left, resetAt }` pour un compte gratuit connecté : vidéos gratuites restantes aujourd'hui, et heure (ms) de la prochaine vidéo gratuite. `null` pour une formule payante.
3. `acctUseVideo()` → compte la vidéo du jour côté serveur. Elle peut renvoyer une promesse.
4. `acctOpen(why, { plan })` : ouvrir la page des formules sur `plan`. Raisons nouvelles : `daily`, `pack30`, `filters`.
   - Les textes `acct.why.*` et `ap.whyIn.*` correspondants sont déjà écrits ici.
   - La raison `daily` d'une personne non connectée doit ouvrir la création de compte.
   - Les fonctions 1 à 3 peuvent être globales ou dans le bloc compte de `app.js` : l'app les cherche par leur nom.

Fichiers touchés : src/app.js (bloc formules, filtres, export, texte, Clip, fin Stalak ; 4 lignes du bloc compte : `acctSync` appelle `planTags()`, `#outroPro`, la restauration d'un projet Clip), src/markup.html (écran #dayDone, lien de la fin), src/theme.css (étiquettes BASIC/PRO/MAX, écran), public/ (reconstruit), tests/ui/formules_ui.py (nouveau), docs/STATUS.md, ce compte rendu.
Migration SQL : aucune côté App (le compteur journalier est côté Comptes).
Tests :
- Nouveau `tests/ui/formules_ui.py` : 128/128, en FR et EN, sur téléphone 390 px et ordinateur 1280 px. Comptes y est simulé formule par formule (Gratuit, Basic, Pro, Max). Il vérifie :
  - logo ;
  - tailles de texte, Clip, packs 5/10/30 ;
  - 3 filtres pour Gratuit et Basic, tous pour Pro ;
  - chaque cadenas ouvre la bonne formule ;
  - écran « vidéo du jour » : texte, temps restant, focus, Échap, « Passer à Basic » ;
  - vidéo comptée une fois faite ;
  - création de compte si non connecté ;
  - comportement d'avant sans `acctHas`.
- `node tests/backend/run.mjs` 63/63 ; `tests/ui/paroles_suppr.py` 44/44 ; syntaxe et builds OK ; version claude.ai chargée sans erreur à 390 px et 1280 px.
Reste au propriétaire : rien tant que Comptes n'a pas livré ; ensuite, tester un compte gratuit sur iPhone (2e export du jour).
Skills utilisés : webapp-testing.
