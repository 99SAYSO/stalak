Statut : PRÊT
Branche : compte/donnees-7-11
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` 4e15291 (rapport chiffres du 7/11, `docs/stats/2026-11-07-rapport.md` ; demande du propriétaire : ses pistes
1, 2, 7 et 8 = celles du rapport 1, 2, 8 et 5)
Maquette : https://compte-donnees-7-11.stalak-site.pages.dev/admin-demo/#funnel (démo, fausses données)

Résumé :
- **1. Provenance et pays de chaque visite** : chaque nouvelle visite ajoute +1 au total du jour de sa provenance et de son pays
  (Cloudflare). La provenance est calculée par la page à partir de `?ref=`, puis `utm_source`, puis du site d'origine (TikTok,
  Instagram, YouTube, Google, Discord, Triller, X, Reddit, Facebook, Bing, autre site, lien direct) ; un `?ref=` qui contient le nom
  d'une plateforme (`seo-triller`) compte pour elle. Gardée seulement le temps de l'onglet ; rien n'est relié à une personne.
- **2. Entonnoir par source** : tableau de bord → Du visiteur à l'abonné → « 🧭 D'où viennent les gens, et jusqu'où ils vont » :
  une ligne par source avec Visites, Vidéo faite, Formules vues, Paiement ouvert, Payé (et le % des visites de la source) ; les
  sources à une seule visite sont regroupées dans « Autres ». Et « 🌍 Pays des visites » (10 premiers).
- **7. Paiement fermé sans acheter** : la page compte chaque fermeture de la fenêtre Paddle sans achat, et à quel moment : tout de
  suite / après l'e-mail (et le pays) / en payant (carte remplie ou paiement essayé). Carte « 💳 Paiement fermé sans acheter » avec
  le nombre de fenêtres ouvertes. Un achat fini est aussi compté (« Payé » par source).
- **8. E-mails des gratuits** : à la fin d'une vidéo (gratuits seulement, pas pour l'exemple, une fois par appareil), un encadré
  facultatif « 📩 Reçois des conseils pour tes prochaines vidéos par e-mail » : champ e-mail, case **non cochée** « J'accepte de
  recevoir par e-mail des conseils pour mes vidéos et des nouvelles de Stalak (au plus 2 par mois). Je peux me désinscrire à tout
  moment avec le lien de chaque e-mail. », bouton « Recevoir les conseils ». Ensuite un e-mail « Confirme ton e-mail » avec un
  bouton (double confirmation) et un lien « Me désinscrire ». Seuls les e-mails confirmés comptent. Carte « 📩 E-mails récoltés »
  (confirmés, dont cette semaine, en attente). **Pas d'envoi en masse.**
  - **Écart avec la demande** : la phrase demandée « Reçois **ta vidéo** et tes prochains conseils » n'est pas reprise : envoyer
    la vidéo par e-mail demanderait de l'envoyer sur nos serveurs (stockage, poids, coûts) — à décider à part. Le texte promet
    seulement les conseils.
- Liste de tous les compteurs et comment les lire : **`docs/stats/compteurs.md`** (nouveau).
- Non fait ici : la piste 7 du rapport (« retirer les tests des statistiques ») n'était pas dans la demande ; « vidéos par
  personne » les retire déjà ; le reste peut suivre.

Skills utilisés : `appsec-review` (`docs/appsec-review-donnees-7-11.md`), `dataviz` (tableau par source avec %, barres d'une seule
couleur, mots simples).

Fichiers touchés :
- nouveaux : `functions/_lib/optin.js`, `migrations/0017_email_optins.sql`, `docs/stats/compteurs.md`, `docs/appsec-review-donnees-7-11.md`
- modifiés : `functions/_lib/metrics.js`, `functions/_lib/router.js`, `functions/_lib/admin.js`, `functions/_lib/admin-page.js`,
  `functions/_lib/retention.js`, `functions/_lib/admin-demo-data.js` (régénéré), `src/app.js`, `src/account.js`, `src/markup.html`,
  `src/theme.css`, `tests/fixtures/dashboard-seed.mjs`, `tests/backend/run.mjs`, `tests/ui/achat_ui.py`, `tests/ui/support_ui.py`,
  `tests/ui/audit_ui.py` (les évènements peuvent porter `src` et `stage`), `BACKEND.md` (15.7), `docs/STATUS.md`, `public/` reconstruit

Migration SQL (à coller dans la console D1 « stalak » **avant** de publier) : `migrations/0017_email_optins.sql`
```sql
CREATE TABLE IF NOT EXISTS email_optins (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, lang TEXT NOT NULL DEFAULT 'en', consent TEXT NOT NULL,
  token_hash TEXT NOT NULL, created_at INTEGER NOT NULL, confirmed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_email_optins_token ON email_optins (token_hash);
```

Tests :
- `node tests/backend/run.mjs` : 103/103 (nouveaux : visites par source et pays, une seule fois par page ; étapes par source ;
  source inconnue refusée ; fermetures par étape ; tableau de bord ; e-mail : accord obligatoire, e-mail de confirmation, le lien
  ouvert ne confirme pas / le bouton oui, même réponse pour une adresse déjà inscrite, désinscription efface, limites, durées).
- `tests/ui/achat_ui.py` : 23/23 (source de l'onglet, fermeture tout de suite / après l'e-mail / en payant, achat, encadré d'e-mail :
  non coché, rien sans la case, envoyé avec l'accord, pas redemandé, jamais pour un abonné). Le site doit porter la sonde des
  tests (voir l'en-tête du fichier).
- `audit_ui.py` 158/158, `audit611_ui.py` 91/91, `formules_ui.py` 137/137, `plans_ui.py` 35/35, `support_ui.py` 64/64.

**Pour Juridique** (règle CNIL en attente respectée : rien de nouveau n'est relié à une personne sans son accord) :
1. Valider le texte de la case et de l'encadré (FR/EN ci-dessus, `src/markup.html` et `src/app.js` « opt.* » ; même texte dans
   `functions/_lib/optin.js` `OPTIN_TEXT`). « au plus 2 par mois » est une promesse à tenir ; l'enlever si besoin.
2. Confidentialité : e-mails donnés pour les conseils (adresse, langue, version du texte accepté, dates ; 7 jours sans confirmation,
   3 ans après ; désinscription = effacement ; envoi par Resend) ; totaux anonymes de provenance / pays des visites ;
   `sessionStorage` « stalak:vsrc » (provenance de l'onglet) et `localStorage` « stalak:optin » (encadré déjà rempli).

Reste au propriétaire : regarder la maquette ; après la mise en ligne, laisser son e-mail une fois à la fin d'une vidéo pour voir
l'e-mail de confirmation.
Reste au Chef de projet : migration 0017 avant de publier.
