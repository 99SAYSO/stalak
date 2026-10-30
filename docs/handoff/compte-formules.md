Statut : PRÊT
Branche : compte/formules
Conversation : 3. Comptes, paiements & serveur

Résumé (offre du 30/10/2026 : Gratuit + Basic / Pro / Max) :
1. Formules. `plan` = `free` / `basic` / `pro` / `max`. Un seul tableau dit quelle fonction va avec quelle formule :
   `functions/_lib/entitlements.js` (`FEATURES`, `LIMITS`). Le serveur demande `requirePlan(env, user, 'cloud')` ; la page
   `acctHas('clip')` (liste reçue avec `/api/me`). Appliqué partout :
   - paroles auto : Pro 20 par jour, Max 60 (minutes de son : 90 / 270, garde-fou de coût) ;
   - sauvegarde en ligne : Pro 20 Go, Max 100 Go ; Basic n'y a pas accès (règle « perd l'accès, gardé 6 mois » inchangée) ;
   - « Parler à un humain » : Max seulement (glaçon, textes, e-mail au propriétaire « Stalak Max : nouveau message ») ;
   - Basic et plus : vidéos illimitées, sans logo, toutes les tailles et apparitions du texte ; Pro et plus : Clip, packs de 5
     et 10, tous les filtres ; Max : packs de 30.
   Les abonnés de la première offre (9,99 € / 79 €) restent Pro à leur prix. Erreur `403 pro_required` avec `need`.
   `acctPro()` est gardé comme ancien nom (= Pro ou Max) pour la branche `app/filtres` en cours.
2. Gratuit : 1 vidéo par jour, compte obligatoire. Nouvelle route `POST /api/videos/claim` : avant un export gratuit, la page
   demande le « jeton du jour » ; le serveur compte (table `free_videos`, une ligne par compte et jour de Paris, effacée après
   100 jours) et remet le compteur à zéro à minuit, heure de Paris (été et hiver vérifiés). La même vidéo peut être réexportée
   le même jour (export raté ou annulé). Non connecté : l'export ouvre « Créer un compte ». Vidéo du jour déjà faite : la page
   des formules s'ouvre avec « Ta vidéo gratuite du jour est faite : la prochaine arrive à minuit (heure de Paris). Avec Stalak
   Basic, tes vidéos sont illimitées. » La page Compte le dit aussi.
3. E-mail de rappel « Ta vidéo gratuite du jour est disponible » (Resend, FR/EN) : case à l'inscription (décochée) et dans le
   compte ; lien de désabonnement dans chaque e-mail (page avec un bouton, et « Se désabonner » de Gmail / Apple Mail) ; au plus
   1 par jour, seulement le lendemain d'une vidéo gratuite, jamais après 7 jours sans visite, jamais à un abonné, entre 10 h et
   21 h (Paris). Envoyé par le Worker `workers/cloud-cleanup` (2 nouveaux horaires), par `POST /api/cron/reminders`, ou tout
   seul après les visites.
4. Paddle : le webhook déduit la formule du prix (les 6 prix dans `wrangler.toml`, ou `{"plan": …}` dans le « custom data » du
   prix). Ajout : un abonné change de formule sur le même abonnement (`POST /api/paddle/change`, prorata immédiat ; « Confirmer »
   demandé avant) : pas de double abonnement quand un Pro passe à Max.
5. Page des formules dans l'app (`#pro`) : mensuel / annuel, 4 cartes (Max en premier sur téléphone, Gratuit → Max sur
   ordinateur), Max mis en avant « Seulement 3 € de plus que Pro », tableau de comparaison à 5 colonnes, FAQ et bandeau mis
   à jour ; un abonné voit sa formule et ce qu'elle donne. Formule sans prix : « Bientôt ».
6. Tableau de bord : abonnés et revenu par formule (tableau « Par formule »), vidéos gratuites du jour (chiffre + graphique),
   badge de formule sur les conversations et les derniers inscrits.
7. Guide du glaçon d'aide et politique de confidentialité (FR/EN) mis à jour.

Skills utilisés : `appsec-review` (revue : `docs/appsec-review-formules.md` ; 1 point corrigé : le compteur des vidéos
gratuites est effacé après 100 jours ; 2 limites acceptées et expliquées). Doc Paddle consultée (champs du prix dans le
webhook, changement de formule `PATCH /subscriptions/{id}`).

Fichiers touchés :
- nouveaux : `functions/_lib/videos.js`, `migrations/0008_plans_free_video.sql`, `tests/ui/plans_ui.py`,
  `docs/appsec-review-formules.md`, `docs/handoff/compte-formules.md`
- modifiés : `functions/_lib/entitlements.js` (réécrit), `paddle.js`, `router.js`, `cloud.js`, `lyrics.js`, `support.js`,
  `help.js`, `help-guide.js`, `profile.js`, `auth.js`, `admin.js`, `admin-page.js`, `workers/cloud-cleanup/index.js` et
  `wrangler.toml`, `wrangler.toml` (6 prix vides), `src/account.js`, `src/app.js` (bloc compte ; remplacement des `acctPro()`
  par `acctHas('…')` ; export gratuit ; clés de texte dans le bloc `_bloc.compte.formules` à la fin des dictionnaires, quelques
  textes « Stalak Pro » du compte devenus « Stalak {plan} »), `src/markup.html` (page des formules, cases à cocher),
  `src/theme.css` (bloc « les formules » à la fin), `site_src/confidentialite.html`, `site_src/en/privacy.html`, `BACKEND.md`
  (étape 14 + routes), `docs/STATUS.md`, `tests/backend/run.mjs`, `tests/ui/cloud-server.mjs`, `tests/ui/server.mjs`,
  `tests/ui/support_ui.py`, `public/` (reconstruit)

Migration SQL : **oui, `migrations/0008_plans_free_video.sql`**, à coller en entier dans la console D1 AVANT de publier :

    ALTER TABLE subscriptions ADD COLUMN plan TEXT;
    ALTER TABLE users ADD COLUMN reminders INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE users ADD COLUMN last_seen_at INTEGER;
    ALTER TABLE users ADD COLUMN reminder_day TEXT;
    ALTER TABLE users ADD COLUMN reminder_key TEXT;
    CREATE TABLE IF NOT EXISTS free_videos (
      user_id TEXT NOT NULL,
      day TEXT NOT NULL,
      video TEXT NOT NULL,
      token TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, day)
    );
    CREATE INDEX IF NOT EXISTS free_videos_day ON free_videos(day);

Elle n'ajoute que des colonnes vides et une table : sans danger pour l'existant. À ne lancer qu'une fois.

Tests (sur la branche, à partir de main b5731a4) :
- `node tests/backend/run.mjs` : 70/70 (7 nouveaux : table des formules, droits et limites par formule, webhook → formule,
  changement de formule, vidéo du jour, heure de Paris, rappels et désabonnement, tableau de bord par formule)
- `tests/ui/plans_ui.py` (nouveau) : 38/38 — non connecté FR 390 px, gratuit EN 1280 px (vrai export, 2e refusé, compte, case),
  Basic FR 390 px (2 exports), Pro FR 1280 px (« Ta formule », « Passer à Max » demande confirmation), Max EN 390 px, inscription
- `tests/ui/support_ui.py` : 39/39 (« Parler à un humain » en Max) ; `tests/ui/help_ui.py` : 42/42 (dont la version claude.ai) ;
  `tests/ui/gallery_ui.py` : 40/40
- sans défilement horizontal, sans erreur de page, FR et EN
- non lancé : vrai Paddle (achat, changement de formule), vrai envoi Resend ; `tests/ui/lyrics_ui.py` (s'arrête déjà sur main)

Ordre de mise en ligne (Chef de projet) :
1. migration 0008 dans la console D1 ;
2. Paddle sandbox : 3 produits, 6 prix (BACKEND.md, étape 14.2), identifiants dans `wrangler.toml` et dans STATUS ;
   tant qu'ils sont vides, les boutons disent « Bientôt » (rien ne casse, les Pro actuels restent Pro) ;
3. fusion et publication ; redéployer le Worker : `npx wrangler deploy -c workers/cloud-cleanup/wrangler.toml` ;
4. vérifier (étape 14.4) : config, un export gratuit puis un 2e, un achat Basic sandbox, « Passer à Pro », un rappel reçu le
   lendemain et le lien « Ne plus recevoir ces rappels ».

Reste au propriétaire : rien à saisir (aucun nouveau secret). Tester sur iPhone : la page des formules et la vidéo du jour.

À signaler :
- App & montage : écran « vidéo du jour utilisée » à faire si voulu (fonction `acctFreeVideo()` prête ; aujourd'hui la page
  des formules s'ouvre avec la raison) ; pour les filtres, `acctHas('filters')`.
- Marketing : textes de la page des formules dans l'app (clés `pl.*`, bandeau `pr.promo`) à relire ; page Tarifs du site à
  4 colonnes à faire.
- Juridique : un paragraphe ajouté à la politique de confidentialité (vidéo du jour et rappel) ; conditions de vente à mettre
  à jour pour les 3 formules et le changement de formule au prorata.
- Limite connue : l'export se fait sur l'appareil ; le serveur compte et refuse, mais une page modifiée à la main pourrait
  ignorer la limite (comme le logo de fin). Si le serveur ne répond pas, l'export n'est pas bloqué.
