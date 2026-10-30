Statut : PRÊT
Branche : compte/formules
Conversation : 3. Comptes, paiements & serveur
À fusionner avec : `app/formules` (App), qui appelle les fonctions livrées ici (contrat du 30/10 dans STATUS).

Résumé (offre du 30/10/2026 : Gratuit + Basic / Pro / Max) :
1. Formules. `plan` = `free` / `basic` / `pro` / `max`. Un seul tableau dit quelle fonction va avec quelle formule :
   `functions/_lib/entitlements.js` (`FEATURES`, `LIMITS`). Serveur : `requirePlan(env, user, 'cloud')` ; page :
   `acctHas('clip')` (liste reçue avec `/api/me`). Appliqué :
   - paroles auto : Pro 20 par jour, Max 60 (minutes de son 90 / 270, garde-fou de coût) ;
   - sauvegarde en ligne : Pro 20 Go, Max 100 Go ; Basic n'y a pas accès (« perd l'accès, gardé 6 mois » inchangé) ;
     au-dessus de l'espace (Max → Pro) : rien d'effacé, nouvelles sauvegardes bloquées ;
   - « Parler à un humain » : Max seulement (serveur, glaçon, e-mail au propriétaire « Stalak Max : nouveau message ») ;
   - Basic+ : `unlimited`, `nologo`, `text` ; Pro+ : `filters`, `clip`, `packs` / `pack5` / `pack10`, `lyrics`, `cloud` ;
     Max : `pack30`, `human`. Les abonnés de la première offre (9,99 € / 79 €) restent Pro à leur prix. Refus `403 pro_required`
     avec `need`.
2. Contrat App / Comptes livré sous les noms exacts (bloc compte de `app.js`) : `acctHas(feat)`, `acctQuota()` →
   `{left, resetAt}` (gratuit connecté) ou `null`, `acctUseVideo()` → promesse qui compte la vidéo du jour sur le serveur,
   `acctOpen(why, {plan})` (page des formules ouverte sur la bonne carte ; `daily` non connecté → « Créer un compte »).
   Les lignes de l'app que `app/formules` remplace (texte, Clip, packs, export, restauration d'un Clip, textes `acct.why.*`
   d'App) sont laissées comme sur main pour éviter les conflits. `acctPro()` reste (= Pro ou Max) pour `app/filtres`.
3. Gratuit : 1 vidéo par jour, compte obligatoire. Route `POST /api/videos/claim` = le « jeton du jour » : une ligne par compte
   et jour de Paris (minuit, heure de Paris ; été / hiver / changement d'heure vérifiés), la même vidéo peut être redemandée,
   la 2e est refusée (`429 daily_video_used` + heure de la suivante). Lignes effacées après 100 jours. La page Compte le dit.
4. E-mail de rappel « Ta vidéo gratuite du jour est disponible » (Resend, FR/EN), selon Juridique : case décochée au texte
   exact « Me prévenir par e-mail quand ma vidéo du jour est disponible » (inscription et page Compte), preuve gardée (date,
   texte, langue, origine) ; au plus 1 par jour, le lendemain d'une vidéo gratuite, arrêt après 7 jours sans visite, jamais à
   un abonné, 10 h-21 h (Paris) ; rien d'autre dans l'e-mail ; lien « Ne plus recevoir ce rappel » qui arrête tout de suite sans
   connexion, plus `List-Unsubscribe` / un clic. Envoi : Worker `workers/cloud-cleanup` (2 nouveaux horaires),
   `POST /api/cron/reminders`, ou après les visites.
5. Paddle : les 6 prix sandbox du Chef de projet sont dans `wrangler.toml` ; le webhook en déduit la formule (ou du
   « custom data » `{"plan": …}` du prix). Changement de formule sur le même abonnement (`POST /api/paddle/change`), selon
   Juridique : plus grande (ou mensuel → annuel) tout de suite au prorata, **montant affiché avant de confirmer** (aperçu Paddle) ;
   plus petite au prochain renouvellement, rien de remboursé, formule payée gardée jusque-là ; remonter dans la même période
   vers une formule déjà payée ne recoûte rien ; prix du moment.
6. Page des formules dans l'app (`#pro`) : mensuel / annuel, 4 cartes (Max en premier sur téléphone, Gratuit → Max sur
   ordinateur), Max « Seulement 3 € de plus que Pro », comparaison à 5 colonnes, bandeau et FAQ à jour ; un abonné voit sa
   formule, ce qu'elle donne, et change de formule en 2 touches (prix ou date d'effet, puis « Confirmer »).
7. Tableau de bord : abonnés et revenu par formule, vidéos gratuites du jour (chiffre + graphique), formule sur les
   conversations et les derniers inscrits.
8. Guide du glaçon d'aide et politique de confidentialité (FR/EN) mis à jour.

Skills utilisés : `appsec-review` (`docs/appsec-review-formules.md` : 1 point corrigé, compteur effacé après 100 jours ;
limites acceptées et expliquées). Documentation Paddle consultée (champs du prix dans le webhook, changement de formule,
modes de prorata, aperçu).

Fichiers touchés :
- nouveaux : `functions/_lib/videos.js`, `migrations/0008_plans_free_video.sql`, `tests/ui/plans_ui.py`,
  `docs/appsec-review-formules.md`, `docs/handoff/compte-formules.md`
- modifiés : `functions/_lib/entitlements.js` (réécrit), `paddle.js`, `router.js`, `cloud.js`, `lyrics.js`, `support.js`,
  `help.js`, `help-guide.js`, `profile.js`, `auth.js`, `admin.js`, `admin-page.js`, `workers/cloud-cleanup/index.js` et son
  `wrangler.toml`, `wrangler.toml` (6 prix), `src/account.js`, `src/app.js` (bloc compte ; clés dans `_bloc.compte.formules`),
  `src/markup.html` (page des formules, cases), `src/theme.css` (bloc « les formules » à la fin), `site_src/confidentialite.html`,
  `site_src/en/privacy.html`, `BACKEND.md` (étape 14 + routes), `docs/STATUS.md`, `tests/backend/run.mjs`,
  `tests/ui/cloud-server.mjs` (formules, Paddle imité), `tests/ui/server.mjs`, `tests/ui/support_ui.py`, `public/` (reconstruit)

Migration SQL : **oui, `migrations/0008_plans_free_video.sql`**, à coller en entier dans la console D1 AVANT de publier :

    ALTER TABLE subscriptions ADD COLUMN plan TEXT;
    ALTER TABLE subscriptions ADD COLUMN keep_plan TEXT;
    ALTER TABLE subscriptions ADD COLUMN keep_until INTEGER;
    ALTER TABLE users ADD COLUMN reminders INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE users ADD COLUMN reminders_proof TEXT;
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

Uniquement des colonnes vides et une table : sans danger pour l'existant. À ne lancer qu'une fois.

Tests (sur la branche, après fusion de main f488683) :
- `node tests/backend/run.mjs` : 70/70 (7 nouveaux : table des formules ; droits et limites par formule et espace dépassé ;
  changement de formule : aperçu, montée, descente au renouvellement, retour sans double paiement, annuel → mensuel refusé ;
  vidéo du jour ; heure de Paris ; rappels, preuve du consentement et désabonnement ; tableau de bord par formule)
- `tests/ui/plans_ui.py` (nouveau) : 38/38 — non connecté FR 390 px, gratuit EN 1280 px (1 vidéo par jour, compte, case),
  Basic FR 390 px, Pro FR 1280 px (prix du jour avant « Confirmer », Basic au renouvellement), Max EN 390 px, inscription
- `tests/ui/support_ui.py` : 39/39 (« Parler à un humain » en Max) ; `tests/ui/help_ui.py` : 42/42 (dont la version claude.ai) ;
  `tests/ui/gallery_ui.py` : 40/40 ; sans défilement horizontal, sans erreur de page, FR et EN
- non lancé : vrai Paddle sandbox (achat, aperçu, changement), vrai Resend ; `tests/ui/formules_ui.py` d'App (sur sa branche)

Ordre de mise en ligne (Chef de projet) :
1. migration 0008 dans la console D1 ;
2. fusionner `compte/formules` puis `app/formules` (en cas de conflit dans les lignes texte / Clip / packs / export : garder
   la version d'App) ; publier ;
3. redéployer le Worker : `npx wrangler deploy -c workers/cloud-cleanup/wrangler.toml` ;
4. vérifier (BACKEND.md 14.4) : config, 2 vidéos gratuites le même jour, achat Basic sandbox, « Passer à Pro » (montant affiché),
   « Passer à Basic » depuis Pro (date du renouvellement), un rappel reçu le lendemain et son lien.

Reste au propriétaire : rien à saisir (aucun nouveau secret). Tester sur iPhone la page des formules et la vidéo du jour.

À signaler :
- Juridique : descente vers une formule facturée autrement (annuel → mensuel) refusée avec une explication, car Paddle ne sait
  pas la programmer ; remboursement d'un changement de formule à faire à la main (rembourser dans Paddle, remettre l'ancienne
  formule). Âge minimum pour la case de rappel (avant 15 ans) : à décider par le propriétaire.
- Marketing : textes de la page des formules dans l'app (`pl.*`, `pr.promo`) à relire ; page Tarifs du site à 4 colonnes.
- Bouton de rétractation « Renoncer au contrat ici » : pas encore fait (attend le cahier des charges de Juridique).
- Limite connue : l'export se fait sur l'appareil ; le serveur compte et refuse, mais une page modifiée à la main pourrait
  ignorer la limite (comme le logo de fin).
