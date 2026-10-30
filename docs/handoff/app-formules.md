Statut : PRÊT
Branche : app/formules. Contient `app/filtres` (filtres validés le 30/10), `compte/formules` et `main` du 30/10 au soir. Une seule fusion suffit.
La copie de `docs/handoff/compte-formules.md` dans cette branche est marquée « INCLUSE » ; `compte/formules` garde son propre compte rendu.

Résumé (offre hybride du 30/10 au soir, contrat App / Comptes de docs/STATUS.md) :
1. Table des formules `FEAT_PLAN` (src/app.js, bloc « formules »), tout passe par `can(feat)` → `acctHas(feat)` :
   - Pro : `nowm` (ni filigrane ni pub), `clip`, `fx` (effets premium du Clip), `text` (mot par mot, karaoké, toutes les tailles), `filters` (filtres pro ; 3 gratuits : Givre, Film 35 mm, Noir & blanc), `lyrics` (paroles auto) ;
   - Creator Plus : `pack5`, `pack10`, `pack30` (à partir de 3 playbacks : message « Le pack demande au moins 3 playbacks », dit avant tout le reste), `cloud`, `human`.
   - Sur claude.ai (pas de comptes) : tout est ouvert, sauf le filigrane, qui reste sans pub possible.
2. Supprimés :
   - l'écran « vidéo du jour » (balisage, styles, textes, `dayGate` / `dayUsed`) et la fin Stalak de 3 s (`outroOn()` renvoie `false`) ;
   - le Gratuit exporte sans compte ;
   - l'app n'appelle plus `acctQuota` ni `acctUseVideo` : à Comptes de les retirer de son bloc.
3. Filigrane des vidéos gratuites (`wmDraw`) : le logo Stalak (icon.svg intégré au code, donc aussi sur claude.ai) et « Clipped with stalak.app », sur une pastille sombre transparente.
   - Taille : environ 30 px de texte en 1080 px, lisible sur un téléphone.
   - Position : il change de place toutes les 6 s (glissement de 1,2 s) entre 4 endroits (haut droite, gauche, bas droite, gauche). Il commence en haut à droite pour ne pas passer sous le nom de la prise dans l'aperçu.
   - Rendu : dessiné par-dessus les paroles, dans l'aperçu et dans l'export (canvas 2D, WebGL de Safari, temps réel), d'après le temps du morceau : même image partout.
   - Décision : prise au début de l'export (`S.wm`).
4. Pub récompensée (`adWatch`), Google Publisher Tag, d'après l'exemple officiel de Google « display-rewarded-ad » :
   - Bouton « Regarder une pub (30 s) pour enlever le filigrane » et lien « ou passe à Pro », sous Lecture / Régénérer, pour les gratuits sur stalak.app.
   - Le script de Google n'est chargé qu'au toucher du bouton.
   - Unité de test de Google `/22639388115/rewarded_web_example` (constante `AD_UNIT`, à remplacer par la vraie quand le compte Ad Manager existera).
   - Format `OutOfPageFormat.REWARDED`. `rewardedSlotReady` → `makeRewardedVisible()` ; `rewardedSlotGranted` → récompense ; `rewardedSlotClosed` → fin ; `slotRenderEnded` vide → « Pas de pub disponible » ; créneau `null` → « Les pubs ne peuvent pas passer sur cet appareil » ; délai de 15 s.
   - Mode « pubs limitées » (`setPrivacySettings({ limitedAds: true })`) tant qu'il n'y a pas d'outil de consentement.
   - La récompense vaut pour CETTE vidéo : l'export suivant sort sans filigrane, puis le filigrane revient. Si la vidéo était déjà faite avec le filigrane, elle est refaite tout de suite sans.
5. Cadenas : `acctOpen(why, { plan: 'pro' | 'creator' })`. Étiquettes PRO / CREATOR+. Raisons `nowm`, `fx`, `text`, `clip`, `filters`, `lyrics`, `pack` ; les textes `acct.why.*` / `ap.whyIn.*` nomment Pro ou Creator Plus (FR/EN).

Pour les autres conversations :
- Comptes : côté serveur, `acctHas` doit répondre avec les noms du contrat (`nowm`, `fx`…). Retirer `acctQuota`, `acctUseVideo`, la migration et l'e-mail de la vidéo du jour. Mettre à jour la page des formules (Pro / Creator Plus ; son test `plans_ui.py` porte encore sur Basic / Pro / Max). Le bouton du haut dit encore « Stalak Pro ».
- Juridique : la confidentialité doit parler des pubs Google (Ad Manager) ; il faut un outil de consentement (CMP certifié par Google) avant des pubs personnalisées en Europe. D'ici là, mode « pubs limitées ».
- Propriétaire : créer le compte Google Ad Manager et une unité « rewarded » web, puis donner son chemin pour remplacer `AD_UNIT`.

Fichiers touchés : src/app.js, src/markup.html, src/theme.css, public/ (reconstruit), tests/ui/formules_ui.py (réécrit), tests/ui/filtres_ui.py, docs/STATUS.md, docs/handoff/compte-formules.md (copie marquée « INCLUSE »), ce compte rendu.
Migration SQL : aucune côté App.
Tests (simulation d'iPhone 15 Pro dans Chromium + ordinateur, FR/EN) :
- `formules_ui.py` (réécrit pour l'offre hybride) : 133/133. Il vérifie :
  - le gratuit sans compte, sans écran du jour ni fin Stalak ;
  - le filigrane : présent, qui bouge, discret (moins de 6 % de l'image), identique dans l'aperçu, l'export 2D et l'export WebGL ;
  - les cadenas Pro / Creator Plus et les étiquettes ;
  - la pub, avec l'interface de Google imitée car son script est injoignable d'ici : récompense, pub fermée trop tôt, pas de pub, appareil non compatible, vidéo refaite sans filigrane ;
  - un vrai export après une pub : sans filigrane, puis le filigrane revient ;
  - Pro, Creator Plus (pack à partir de 3 playbacks), et les vraies fonctions de Comptes.
- `node tests/backend/run.mjs` 70/70 ; `plans_ui.py` (Comptes) 38/38 ; `gallery_ui.py` 40/40 ; `help_ui.py` 42/42.
- `filtres_ui.py` 106/106 ; `filtres_comparaison.py` 242/242 ; `son_passage.py` 62/62 ; `paroles_suppr.py` 44/44 ; `remux_frag.py` 10/10 ; syntaxe et builds OK.
- `support_ui.py` (Comptes) : délai dépassé à l'étape « réponse envoyée par e-mail » du tableau de bord ; le même blocage existe sur `compte/formules` seule, il ne vient pas de cette branche.
- Pas testé ici : un vrai iPhone et une vraie pub Google (réseau de pub injoignable depuis la machine de test). C'est au propriétaire de le faire (ci-dessous).
Reste au propriétaire : après la mise en ligne, sur iPhone, sans compte :
1. exporter une vidéo et vérifier que le filigrane bouge ;
2. toucher « Regarder une pub », regarder la pub de test de Google jusqu'au bout, puis vérifier que la vidéo refaite n'a pas de filigrane ;
3. vérifier que la vidéo suivante a de nouveau le filigrane.
Skills utilisés : context7 (documentation et exemple officiels de Google Publisher Tag), webapp-testing.
