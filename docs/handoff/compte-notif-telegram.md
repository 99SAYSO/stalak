Statut : PRÊT
Branche : compte/notif-telegram
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` 3047418 (demande du propriétaire du 5/11 : passer les notifs de ventes à Telegram)
Maquette : https://compte-notif-telegram.stalak-site.pages.dev (rien de visible côté site : le changement est dans le webhook
Paddle et le tableau de bord, qui n'existe que sur admin.stalak.app)

Résumé :
- Nouveau `functions/_lib/telegram.js` : envoi par l'API Bot de Telegram (`sendMessage`), 3 s au plus, erreurs avalées, la clé
  du bot jamais écrite dans les journaux.
- Les notifs de ventes (`notify.js`) partent maintenant sur Telegram, et aussi sur ntfy seulement si `NTFY_TOPIC` est rempli :
  - nouvel abonné : « 💸 Nouvel abonné Creator Plus » / « 14,99 $ / mois · 🇺🇸 États-Unis » (formule, prix, mensuel ou annuel,
    pays), un seul message par achat ;
  - annulation : « Abonnement Pro annulé » / « Fin le 3 décembre. », message **silencieux**, un par abonnement ;
  - jamais l'e-mail, le nom ni les identifiants du client ; « [TEST] » devant en sandbox ; ne bloque jamais le webhook.
- Tableau de bord, onglet **Santé du serveur**, carte « Notifications sur ton téléphone » :
  - état : « Telegram relié (prénom) », « pas encore relié » ou « Clé du bot manquante » ; ligne ntfy (facultatif) ;
  - **Relier mon Telegram** : le serveur lit les derniers messages du bot (`getUpdates`) et garde seulement la discussion
    **privée** qui a envoyé `/start` dans les 15 dernières minutes (refus si plusieurs personnes l'ont fait) ; message de
    confirmation dans Telegram ;
  - **Envoyer une notif de test** : passe par Telegram (et ntfy s'il est réglé) ;
  - **Délier**.
- Nouvelles routes admin : `POST /api/admin/telegram-link`, `telegram-unlink`, `notify-test` (`ntfy-test` reste accepté).
- `BACKEND.md` 13.6 bis réécrit : création du bot avec @BotFather, secret, /start, relier, tester.

Skills utilisés : `appsec-review` (revue : `docs/appsec-review-notif-telegram.md` : protection contre un inconnu qui enverrait
/start, clé jamais dans les journaux, rien de bloquant, aucune donnée client).

Fichiers touchés :
- nouveaux : `functions/_lib/telegram.js`, `docs/appsec-review-notif-telegram.md`
- modifiés : `functions/_lib/notify.js`, `functions/_lib/admin.js`, `functions/_lib/admin-page.js`, `BACKEND.md`, `docs/STATUS.md`,
  `tests/backend/run.mjs`, `public/` reconstruit

Migration SQL : aucune (l'identifiant de discussion va dans la table `admin_state` existante).

Tests :
- `node tests/backend/run.mjs` : 86/86 (3 nouveaux : relier — groupes, anciens /start et autres textes ignorés, plusieurs personnes
  refusées, clé refusée, accès propriétaire seulement, délier ; un message par achat avec le texte exact, annulation silencieuse,
  ntfy en plus quand il est réglé, aucune donnée client ; Telegram en panne, lent ou qui refuse : webhook 200, compte Pro, aucune
  clé dans les journaux)
- `tests/ui/support_ui.py` : 43/43 ; carte Telegram vérifiée à 1280 et 390 px, sans erreur ni défilement de côté

Reste au propriétaire (BACKEND.md 13.6 bis) :
1. Dans Telegram, écrire à **@BotFather** : `/newbot`, un nom, un identifiant finissant par `bot` ; garder la clé (secrète).
2. Cloudflare → stalak-site → *Variables and Secrets* → secret **`TELEGRAM_BOT_TOKEN`** = cette clé (puis publication).
3. Ouvrir le bot dans Telegram et envoyer **/start**.
4. Dans les 15 minutes : tableau de bord → **Santé du serveur** → **Relier mon Telegram**, puis **Envoyer une notif de test**.
(Le secret `NTFY_TOPIC` peut être supprimé s'il ne sert plus.)
