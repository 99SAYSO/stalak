Statut : INCLUSE dans app/formules (voir docs/handoff/app-formules.md pour l'état de cette branche ; la branche compte/formules garde son propre compte rendu)
Branche : compte/formules
Conversation : 3. Comptes, paiements & serveur
Contient : `main` (5941747) et `origin/app/formules` (11dfaca) fusionnées, puis l'adaptation à l'offre du 30/10 au soir.

Résumé (offre : Gratuit avec filigrane et pub récompensée + Stalak Pro + Stalak Creator Plus) :
1. Formules `free` / `pro` / `creator` avec les 4 nouveaux prix sandbox en dollars (`wrangler.toml`) : Pro 7,99 $ / 49,99 $,
   Creator Plus 14,99 $ / 99,99 $. Les anciens prix restent reconnus pour leurs abonnés (ils gardent leur prix) : Pro en euros
   (9,99 € / 79 €, 10,99 € / 109 €) et Basic → `pro`, Max → `creator` (`PADDLE_PRICES_OLD`). Seuls les 4 nouveaux se vendent.
   Le webhook déduit la formule du prix (ou du « custom data » `{"plan": …}` du prix ; `basic` / `max` convertis).
2. Supprimés : la vidéo gratuite du jour (route, table, compteur), l'e-mail de rappel (envoi, désabonnement, case à
   l'inscription et dans le compte, preuve du consentement), leurs horaires dans le Worker. Migration 0008 refaite : il ne reste
   que la formule de l'abonnement et la formule gardée jusqu'au renouvellement (3 colonnes).
3. `acctHas` selon le contrat : `nowm`, `clip`, `fx`, `text`, `filters`, `lyrics` → Pro ; `pack5`, `pack10`, `pack30`, `cloud`,
   `human` → Creator Plus (anciens noms : `nologo` → Pro, `unlimited` → tous). Sauvegarde en ligne (100 Go) et « Parler à un
   humain » : Creator Plus seulement (serveur, Galerie, glaçon, e-mail au propriétaire « Stalak Creator Plus : nouveau
   message »). Paroles auto : 20 par jour en Pro, 60 en Creator Plus. `acctOpen(why, {plan})` : `pro` ou `creator` (`basic` /
   `max` acceptés). `acctQuota` / `acctUseVideo` retirées (le code d'App les ignore quand elles n'existent pas).
4. Page des formules à 3 colonnes en dollars : Gratuit, Pro, Creator Plus (en premier sur téléphone, mis en avant « Tout
   Stalak »), mensuel / annuel (« jusqu'à −48 % »), comparaison à 4 colonnes, bandeau et FAQ à jour. Changement de formule
   inchangé dans ses règles (Juridique) : montée tout de suite au prorata avec le montant affiché avant, descente au
   renouvellement sans remboursement, annuel → mensuel refusé avec une explication.
5. `support_ui.py` qui bloquait à « reply e-mailed to the visitor who left » : un visiteur parti juste avant la réponse recevait
   l'e-mail après ≈ 30 s (attente de 20 s + passage du tableau de bord toutes les 10 s), au-delà des 50 s du test sur une machine
   plus lente. Attente ramenée à 12 s (la page du visiteur demande des nouvelles toutes les 5 s) : ≈ 20 s au total ; le test
   laisse 90 s et affiche le temps mesuré. Test serveur ajouté (rien à 10 s, envoi à 13 s).
6. Tableau de bord : abonnés et revenu par formule (Pro, Creator Plus), revenu mensuel par devise (dollars ; euros pour les
   anciens Pro) ; plus de vidéos gratuites du jour. Guide du glaçon d'aide et politique de confidentialité (FR/EN) à jour.

Skills utilisés : `appsec-review` (revue mise à jour : `docs/appsec-review-formules.md` ; 1 correction de fiabilité, délai de
l'e-mail de réponse ; limites acceptées et expliquées).

Fichiers touchés (depuis le compte rendu précédent) :
- supprimé : `functions/_lib/videos.js` ; renommé et réécrit : `migrations/0008_plans_free_video.sql` → `migrations/0008_plans.sql`
- modifiés : `functions/_lib/entitlements.js`, `paddle.js`, `router.js`, `cloud.js`, `support.js`, `help.js`, `help-guide.js`,
  `auth.js`, `profile.js`, `admin.js`, `admin-page.js`, `workers/cloud-cleanup/index.js` et son `wrangler.toml`, `wrangler.toml`,
  `src/account.js`, `src/app.js` (bloc compte ; bloc de textes `_bloc.compte.formules` réécrit ; quelques textes Galerie /
  « humain »), `src/markup.html` (page des formules, cases de rappel retirées), `src/theme.css` (bloc « les formules »),
  `site_src/confidentialite.html`, `site_src/en/privacy.html`, `BACKEND.md` (étape 14, section 11, routes), `docs/STATUS.md`,
  `tests/backend/run.mjs`, `tests/ui/plans_ui.py`, `tests/ui/cloud-server.mjs`, `tests/ui/support_ui.py`,
  `tests/ui/gallery_ui.py`, `public/` (reconstruit)

Migration SQL : **oui, `migrations/0008_plans.sql`**, à coller dans la console D1 AVANT de publier :

    ALTER TABLE subscriptions ADD COLUMN plan TEXT;
    ALTER TABLE subscriptions ADD COLUMN keep_plan TEXT;
    ALTER TABLE subscriptions ADD COLUMN keep_until INTEGER;

Trois colonnes vides : sans danger pour l'existant. À ne lancer qu'une fois. (L'ancienne version 0008 n'a jamais été appliquée.)

Tests (sur la branche) :
- `node tests/backend/run.mjs` : 67/67 (formules et prix, droits par formule, espace dépassé, changement de formule, tableau
  de bord par formule et par devise, délai de 12 s de l'e-mail de réponse)
- `tests/ui/plans_ui.py` : 30/30 — non connecté FR 390 px, gratuit EN 1280 px, Pro FR 1280 px (montant affiché avant
  « Confirmer »), Creator Plus EN 390 px (Pro au renouvellement), inscription sans case
- `tests/ui/support_ui.py` : 39/39 (e-mail de réponse en 19,7 s) ; `tests/ui/gallery_ui.py` : 40/40 ;
  `tests/ui/help_ui.py` : 42/42 (dont la version claude.ai)
- sans défilement horizontal, sans erreur de page, FR et EN
- non lancé : `tests/ui/formules_ui.py` d'App (encore sur l'offre Basic / Pro / Max), vrai Paddle sandbox

Ordre de mise en ligne (Chef de projet) :
1. migration 0008 dans la console D1 ;
2. fusion et publication (cette branche contient déjà `app/formules`) ;
3. vérifier (BACKEND.md 14.3) : config, un achat Pro sandbox, « Passer à Creator Plus » (montant affiché), tableau de bord.

Reste au propriétaire : rien à saisir (aucun nouveau secret).

À signaler :
- App & montage : son côté est encore sur Basic / Pro / Max : `FEAT_PLAN`, étiquettes BASIC / MAX, fin de 3 s (`outroOn`
  lit `nologo`, qui vaut maintenant Pro), écran « vidéo du jour » (inactif : `acctQuota` n'existe plus), `formules_ui.py` ;
  filigrane et pub récompensée à faire. Mon côté accepte déjà les anciens noms, donc rien ne casse en attendant.
- Marketing : textes de la page des formules dans l'app (`pl.*`, `pr.promo`) à relire ; page Tarifs du site.
- Juridique : conditions de vente à mettre à jour pour Pro / Creator Plus en dollars ; politique de confidentialité : paragraphe
  sur la pub récompensée (Google Ad Manager) à ajouter avec App.
