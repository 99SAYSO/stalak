Statut : PRÊT
Branche : compte/mail-merci
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` 18c4589 (demande du propriétaire du 5/11 : e-mail de remerciement automatique à chaque nouvel abonnement)
Maquette : https://compte-mail-merci.stalak-site.pages.dev/admin-demo/ (démo → Santé du serveur : le nouveau bouton, réponse factice ;
le vrai envoi ne marche que sur admin.stalak.app)

Résumé :
- **Quand** : même déclencheur que la notif Telegram (un nouvel abonnement Pro ou Creator Plus, mensuel ou annuel ; jamais un
  renouvellement), seulement en vrais paiements (jamais en sandbox), **une seule fois par personne** : par compte, et par adresse
  e-mail même si le compte est supprimé puis recréé. Envoyé **environ 3 heures après l'achat** (envoi programmé de Resend) ; il part
  après la réponse à Paddle et ne bloque jamais le webhook ; si Resend ne répond pas, l'évènement Paddle suivant du même achat réessaie.
- **Pas aux clients actuels** : la migration 0012 marque tous les comptes qui ont déjà un abonnement réel (les 3 clients, et ton
  propre compte de test à 0,90 $).
- **Forme** : texte simple, sans mise en page ni image ni bouton ; expéditeur « 99sayso de Stalak » (`99sayso@stalak.app`) ;
  réponse vers contact@stalak.app. Langue du compte (français en tutoyant, sinon anglais). Le texte change selon la formule
  (Stalak Pro / Creator Plus) et ajoute « for a full year » / « pour un an entier » si c'est annuel.
  Objet : « Thank you, from 99sayso » / « Merci, de la part de 99sayso ».
- **Tableau de bord → Santé du serveur** : bouton « M'envoyer l'e-mail de remerciement » ; il t'envoie tout de suite, à ton adresse
  (celle de Cloudflare Access), la version française (Creator Plus, un an) et la version anglaise (Stalak Pro, mensuel).

Skills utilisés : `appsec-review` (`docs/appsec-review-mail-merci.md`), `emails` non utilisé volontairement (e-mail perso,
pas marketing) ; texte anglais du propriétaire repris mot pour mot, traduction française au tutoiement.

Fichiers touchés :
- nouveaux : `functions/_lib/thanks.js`, `migrations/0012_thanks_mail.sql`, `docs/appsec-review-mail-merci.md`
- modifiés : `functions/_lib/paddle.js` (webhook), `functions/_lib/notify.js` (`isNewPurchase`, déclencheur partagé),
  `functions/_lib/admin.js` (route `thanks-test`), `functions/_lib/admin-page.js` (carte + bouton, réponse de démo),
  `tests/backend/run.mjs`, `tests/ui/support_ui.py`, `BACKEND.md` (13 et 13.6 ter), `docs/STATUS.md`

Migration SQL (à coller dans la console D1 « stalak » **avant** de publier) :
```sql
ALTER TABLE users ADD COLUMN thanked_at INTEGER;
UPDATE users SET thanked_at = CAST(strftime('%s', 'now') AS INTEGER) * 1000
  WHERE id IN (SELECT user_id FROM subscriptions WHERE env = 'production' AND user_id IS NOT NULL);
```
Vérification après : `SELECT COUNT(*) FROM users WHERE thanked_at IS NOT NULL;` doit donner le nombre de clients actuels (3 ou 4 avec
ton compte de test).

Tests :
- `node tests/backend/run.mjs` : 93/93 (3 nouveaux : un seul e-mail pour 3 évènements Paddle, ~3 h plus tard, en français avec
  Creator Plus pour un an, expéditeur et réponse ; rien pour un renouvellement, un réabonnement ou un compte recréé ; texte anglais
  Stalak Pro mensuel mot pour mot ; rien en sandbox ; rien pour un client marqué par la migration ; Resend en panne → webhook 200,
  compte Pro, nouvel essai réussi ; bouton : propriétaire seulement, 2 e-mails envoyés tout de suite à son adresse).
- `tests/ui/support_ui.py` : 55/55 (bouton dans Santé du serveur, message « Envoyés à … »).

Pour Juridique : la confidentialité doit dire qu'après un abonnement, le client reçoit **un** e-mail de remerciement de 99sayso
(avec 3 questions facultatives, auxquelles il peut répondre ou non), et que ses réponses sont lues par le propriétaire pour améliorer
Stalak. Aucune nouvelle donnée collectée (seulement la date d'envoi).

Reste au propriétaire : après la mise en ligne, toucher « M'envoyer l'e-mail de remerciement » et relire les deux e-mails ; vérifier
qu'une réponse arrive bien dans ta boîte Gmail (via contact@stalak.app).
Reste au Chef de projet : la migration 0012 avant de publier.
