Statut : PRÊT
Branche : compte/audit-6-11
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` 5b947f3 (audit complet du 6/11, `docs/audit/2026-11-06-audit-complet.md`, points 1, 2, 3 puis 12, 14, 15, 16, 17, 20)
Maquette : https://compte-audit-6-11.stalak-site.pages.dev/ (l'app ; le paiement réel et le webhook ne marchent pas sur une maquette)

Résumé :
- **1. Remboursement** : un remboursement complet approuvé (ou une contestation bancaire) d'un paiement d'abonnement **arrête
  l'abonnement tout de suite** chez Paddle et ici (le compte repasse en Gratuit à l'instant), une seule fois, avec une notif
  Telegram « ↩️ Remboursement (7,99 USD) : abonnement Pro arrêté ». Si Paddle refuse l'arrêt : le compte est quand même en Gratuit
  et la notif dit de l'arrêter à la main. Remboursement d'un **changement de formule** : rien ne s'arrête, notif « remettre
  l'ancienne formule dans Paddle ». Remboursement partiel : notif discrète. Tableau de bord : les remboursements du jour comptent
  aussi les dollars.
- **2. Un seul « Choose Pro »** : la formule et la durée choisies (page Tarifs ou page des formules de l'app) sont gardées pendant
  la création du compte / la connexion (30 min, même onglet, y compris par Google) ; la fenêtre de paiement **s'ouvre toute seule**
  dès le code validé. Déjà connecté : le bouton de la page Tarifs ouvre le paiement directement. Si on se connecte ailleurs
  (bouton du compte), l'ancien choix est oublié.
- **3. Signe de vie** : un signe de vie moins de 4 min après le précédent n'écrit plus rien (la page en envoie un toutes les 5 min).
- **12. Données gardées** : paroles automatiques (`lyrics_usage`) 90 jours et effacées avec le compte ; empreintes « déjà remercié »
  effacées après 3 ans ; compteurs de limites (empreintes d'IP / d'e-mail) effacés chaque jour (avant : au hasard) ; l'e-mail de
  remerciement encore en attente chez Resend est **annulé** si le compte est supprimé avant l'envoi.
- **14.** Guide de l'assistant : packs « à partir de 2 playbacks » (FR et EN).
- **15.** Deux messages Paddle simultanés : le plus ancien n'écrase plus le plus récent.
- **16.** Un client Paddle déjà relié à un compte n'est jamais remplacé (paiement avec l'e-mail de quelqu'un d'autre).
- **17.** Assistant d'aide : 6 questions par connexion toutes les 10 min et **10 par jour** (avant 15 et 60).
- **20.** Fenêtre de paiement bloquée (bloqueur de pub) : message « La fenêtre de paiement a été bloquée, souvent par un bloqueur
  de pub. Désactive-le pour stalak.app (ou essaie un autre navigateur), puis réessaie. » ; « Sans filigrane » n'est plus dit deux
  fois sur la page des formules : l'étiquette de la carte Pro (choix du 6/11) le garde, le bandeau du haut dit seulement
  « Pro dès 4,17 $/mois en annuel » (comme la page Tarifs).

Skills utilisés : `appsec-review` (`docs/appsec-review-audit-6-11.md`).

Fichiers touchés :
- nouveaux : `functions/_lib/retention.js`, `migrations/0016_thanks_mail_id.sql`, `tests/ui/achat_ui.py`, `docs/appsec-review-audit-6-11.md`
- modifiés : `functions/_lib/paddle.js`, `functions/_lib/metrics.js`, `functions/_lib/thanks.js`, `functions/_lib/router.js`,
  `functions/_lib/help.js`, `functions/_lib/help-guide.js`, `functions/_lib/admin.js`, `functions/_lib/cloud.js`,
  `workers/cloud-cleanup/index.js`, `src/app.js`, `src/account.js`, `src/markup.html`, `tests/backend/run.mjs`, `tests/ui/help_ui.py`
  (une « connexion » par écran), `tests/ui/server.mjs` (un test peut jouer plusieurs connexions), `BACKEND.md` (15.6), `docs/STATUS.md`,
  `public/` reconstruit

Migration SQL (à coller dans la console D1 « stalak » **avant** de publier) :
```sql
ALTER TABLE users ADD COLUMN thanks_mail_id TEXT;
```

**Pour le Chef de projet (fusion)** : `purgeOldThanks` (fin de `functions/_lib/thanks.js`) est identique à celui de
`compte/provenance-ue` (pas encore intégrée) ; si les deux arrivent, garder une seule copie et, dans `cloud.js` / le Worker,
`dailyRetention` (qui l'appelle déjà) suffit : retirer l'appel direct à `purgeOldThanks` de `compte/provenance-ue`.
Worker quotidien : le redéployer s'il est en service (`npx wrangler deploy -c workers/cloud-cleanup/wrangler.toml`).

Tests :
- `node tests/backend/run.mjs` : 101/101 (5 nouveaux : remboursement complet / changement de formule / partiel / refus de Paddle,
  une seule notif, Free tout de suite, dollars au tableau de bord ; signe de vie 50 fois → 0 écriture ; durées de conservation et
  annulation du remerciement en attente ; ordre des messages Paddle et client jamais remplacé ; « 2 playbacks » ; assistant 6 / 10 min
  et 10 / jour).
- `tests/ui/achat_ui.py` (nouveau) 12/12 : Tarifs → connexion → paiement Pro annuel tout seul ; déjà connecté → paiement direct ;
  page des formules → connexion → paiement Pro mensuel ; connexion ailleurs → rien ; paddle.js bloqué / fenêtre muette → message
  « bloqueur de pub » ; « Sans filigrane » dit une seule fois.
- `plans_ui.py` 35/35, `formules_ui.py` 137/137, `audit_ui.py` 158/158, `help_ui.py` 42/42, `support_ui.py` 63/63.

**Pour Juridique (point 12)** : à ajouter / vérifier dans la confidentialité : les cookies `stalak_d` (appareil de confiance, 90 j)
et `stalak_o` (connexion Google en cours, 10 min) ; le type d'appareil enregistré avec le compte ; ntfy (si utilisé) ; paroles
automatiques : compteur d'usage par jour gardé 90 jours ; empreintes « déjà remercié » 3 ans ; compteurs de limites 24 h.

**Reste au propriétaire (point 3)** :
1. Cloudflare → *stalak.app* → *Security* → *WAF* → *Rate limiting rules* → *Create rule* : nom « API » ; si *URI Path* commence
   par `/api/` **et** ne commence pas par `/api/cloud/` **et** n'est pas égal à `/api/paddle/webhook` ; 60 requêtes par 10 secondes
   par IP → *Block* 10 secondes. (Gratuit.)
2. Passer en **Workers Paid** (5 $/mois) : déjà prévu dans `docs/PADDLE_PRODUCTION.md`.
3. Après la mise en ligne, en sandbox : acheter Pro avec le compte de test puis le rembourser dans Paddle → la notif Telegram
   arrive et le compte repasse en Gratuit.
Reste au Chef de projet : migration 0016 avant de publier.
