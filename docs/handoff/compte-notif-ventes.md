Statut : PRÊT
Branche : compte/notif-ventes
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` b481916 (demande du propriétaire du 5/11 : notification ntfy à chaque vente)
Maquette : https://compte-notif-ventes.stalak-site.pages.dev (rien de visible côté site : le changement est dans le webhook Paddle et le
tableau de bord, qui n'existe que sur admin.stalak.app ; voir « Vérifier »)

Résumé :
- Nouveau `functions/_lib/notify.js` : notification ntfy (POST JSON sur https://ntfy.sh, 3 s au plus, erreurs avalées).
- Webhook Paddle (`paddle.js`) : après l'enregistrement d'un abonnement, et après la réponse à Paddle (`waitUntil`) :
  - **nouvel abonné** : « 💸 Nouvel abonné Creator Plus » / « 14,99 $ / mois · 🇺🇸 États-Unis » (formule ; prix et monnaie de
    Paddle ; mensuel ou annuel ; pays de l'inscription s'il est connu) ; priorité haute ;
  - **annulation** : « Abonnement Pro annulé » / « … (fin le 3 décembre) » ; priorité basse (discrète) ;
  - **une seule notif par achat** et **une seule par annulation**, même si Paddle envoie created + activated + updated, ou
    répète un événement (clé `ntfy:new:<abonnement>` / `ntfy:cancel:<abonnement>` dans `webhook_events`) ; le renouvellement d'un
    abonnement plus ancien n'est jamais annoncé comme nouveau ;
  - jamais l'e-mail, le nom ni les identifiants Paddle dans la notif ; préfixe « [TEST] » en sandbox.
- Secret `NTFY_TOPIC` (le nom du canal) : saisi par le propriétaire dans Cloudflare, jamais dans le code. Vide ou invalide : rien
  n'est envoyé. ntfy en panne ou lent : le webhook répond quand même 200 et le compte passe en Pro.
- Tableau de bord, onglet **Santé du serveur** : carte « Notifications sur ton téléphone » (Activées / Pas réglées) et bouton
  **Envoyer une notif de test** (`POST /api/admin/ntfy-test`, propriétaire seulement, 10 par heure).
- `BACKEND.md` 13.6 bis : la marche à suivre pour le propriétaire.

Skills utilisés : `appsec-review` (relecture : le nom du canal est traité comme un secret et jamais renvoyé ni écrit dans les
journaux ; aucune donnée personnelle dans la notif — vérifié par test ; envoi borné à 3 s et isolé de la réponse à Paddle ; route
de test derrière Cloudflare Access et limitée à 10 par heure ; le serveur ntfy n'est modifiable que par la variable `NTFY_SERVER`,
https seulement).

Fichiers touchés :
- nouveau : `functions/_lib/notify.js`
- modifiés : `functions/_lib/paddle.js`, `functions/_lib/router.js` (1 ligne : `ctx` passé au webhook), `functions/_lib/admin.js`,
  `functions/_lib/admin-page.js`, `BACKEND.md`, `docs/STATUS.md`, `tests/backend/run.mjs`, `public/` reconstruit

Migration SQL : aucune.

Tests :
- `node tests/backend/run.mjs` : 83/83 (3 nouveaux : une notif par achat malgré 3 événements, texte exact « 14,99 $ / mois ·
  🇺🇸 États-Unis », annuel « 49,99 $ / an », une notif par annulation, pas d'annonce pour un ancien abonnement, ni e-mail ni nom ;
  sans canal rien n'est envoyé ; ntfy en panne ou qui ne répond pas : webhook 200 en moins de 4,5 s et compte en Pro ; bouton de
  test : « pas réglé », envoi, accès propriétaire seulement, 10 par heure)
- `tests/ui/support_ui.py` : 43/43 (tableau de bord) ; bouton de test vérifié à 1280 et 390 px, sans erreur de page

Reste au propriétaire :
1. Installer l'appli **ntfy** et s'abonner à un nom de canal long et impossible à deviner (sur ntfy.sh, quiconque connaît le nom
   peut lire les notifs).
2. Cloudflare → stalak-site → *Variables and Secrets* → secret **`NTFY_TOPIC`** = ce nom.
3. Après la mise en ligne : tableau de bord → **Santé du serveur** → **Envoyer une notif de test**.

Vérifier : la maquette ne peut pas montrer ce changement (le webhook Paddle y est bloqué et le tableau de bord n'existe que sur
admin.stalak.app). Le test se fait donc après la mise en ligne, avec le bouton ; sans risque pour les ventes (une notif qui échoue
ne bloque rien).
