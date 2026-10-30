Statut : EN COURS (adaptation à l'offre hybride du 30/10 au soir : Pro / Creator Plus, filigrane, pub récompensée)
Branche : app/formules. Contient `app/filtres` (validée par le propriétaire le 30/10) et `compte/formules` : une seule fusion suffit.

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

Fusions (30/10, demandées par le propriétaire) :
- `app/filtres` est fusionnée : les 26 filtres validés. Les 13 « Couleurs » restent Pro, comme les 10 autres filtres Pro.
- `origin/compte/formules` est fusionnée. Comptes a livré le contrat : `acctHas`, `acctQuota`, `acctUseVideo`, `acctOpen(why, { plan })`. Les noms correspondent (`pack5`, `pack10`, `pack30` existent côté serveur).
- Conflits réglés :
  - `src/app.js` : textes `acct.why.*` (raisons des cadenas) côté App ; `acct.proRenew`, `acct.proEnds`, `acct.proOn` (`{plan}`), `pr.promo`, `pr.sub` côté Comptes ; dans `acctSync`, la ligne de Comptes (`paid`) plus `planTags()` à la place des anciennes bascules « PRO » ;
  - `src/theme.css` : les deux blocs gardés, ils ne se chevauchent pas ;
  - `public/` : reconstruit.
- Vérifié après la fusion : aucune clé de texte en double ; un seul contrôle par cadenas ; la vidéo du jour est demandée avant l'export et comptée une seule fois après.

Fichiers touchés : src/app.js (bloc formules, filtres, export, texte, Clip, fin Stalak ; 4 lignes du bloc compte : `acctSync` appelle `planTags()`, `#outroPro`, la restauration d'un projet Clip), src/markup.html (écran #dayDone, lien de la fin), src/theme.css (étiquettes BASIC/PRO/MAX, écran), public/ (reconstruit), tests/ui/formules_ui.py (nouveau), docs/STATUS.md, ce compte rendu.
Migration SQL : aucune côté App (le compteur journalier est côté Comptes).
Tests (après les fusions) :
- `node tests/backend/run.mjs` : 70/70.
- `plans_ui.py` (Comptes) : 38/38. `gallery_ui.py` : 40/40. `help_ui.py` : 42/42.
- `formules_ui.py` : 128/128. Il tourne maintenant sur les vraies fonctions de Comptes, remplacées formule par formule, puis remises.
- `filtres_ui.py` : 106/106. Adapté à l'offre : sans compte, un export ouvre la création du compte gratuit ; l'export y est mesuré avec un compte sans limite.
- `filtres_comparaison.py` : 242/242. `son_passage.py` : 62/62. `paroles_suppr.py` : 44/44. `remux_frag.py` : 10/10.
- Syntaxe de `src/app.js` OK ; `build.py` et `build_site.py` OK.
- `support_ui.py` (Comptes) : s'arrête sur un délai d'attente dépassé, dans le tableau de bord, à l'étape « réponse envoyée par e-mail ». Le blocage est identique sur `origin/compte/formules` seule, sans cette fusion : il ne vient pas de cette branche. À voir par Comptes.

Reste au propriétaire : après la mise en ligne, sur iPhone, avec un compte gratuit : faire un 1er export, puis vérifier que le 2e ouvre l'écran « vidéo du jour ». Toucher chaque cadenas pour vérifier qu'il ouvre la bonne formule.
Skills utilisés : webapp-testing.
