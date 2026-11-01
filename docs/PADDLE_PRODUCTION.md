# Passer Paddle en vrais paiements : la marche à suivre

> Pour le propriétaire et le Chef de projet. Écrit par Comptes, paiements & serveur le 1/11/2026.
> Tout ce qui est secret (clé API, secret du webhook) se tape **dans Cloudflare** par le propriétaire, jamais dans le code ni dans la conversation.
> Le code est déjà prêt : il suffit de changer des réglages. Les abonnements de test s'effacent tout seuls de l'affichage (migration 0009).

## Avant de commencer (une fois)

1. **Compte Paddle réel validé.** Sur <https://vendors.paddle.com> (pas sandbox) : identité de l'entreprise, coordonnées bancaires,
   et *Website approval* pour `stalak.app`. Paddle vérifie que le site a : mentions légales, confidentialité, conditions, politique de
   remboursement, prix visibles. Tout est en ligne (`/legal-notice`, `/privacy`, `/terms`, `/refunds`, `/pricing`).
2. **Payer les deux forfaits** (rappel demandé par le propriétaire le 1/11) : Cloudflare **Workers Paid** (5 $/mois, avec les alertes
   de dépense) et un forfait payant **Resend** (les e-mails de code). Puis mettre `EMAIL_DAILY_MAX` à la limite du jour du forfait Resend.
3. **Faire une copie de la base** : GitHub → *Actions* → « Copie de la base » → *Run workflow* (BACKEND.md 15.3).

## Le jour du passage (dans cet ordre, le même jour, environ 45 minutes)

### 1. Dans Paddle réel : créer le catalogue (propriétaire)
Mêmes réglages qu'en sandbox (BACKEND.md étape 4), dans le compte **réel** :
- 2 produits : **Stalak Pro** et **Stalak Creator Plus**, catégorie fiscale *Standard digital goods* (ou *SaaS*) ;
- 4 prix en dollars : Pro **7,99 $ / mois** et **49,99 $ / an** ; Creator Plus **14,99 $ / mois** et **99,99 $ / an** ;
  dans chaque prix, *custom data* : `{"plan": "pro"}` ou `{"plan": "creator"}` ;
- noter les 4 identifiants `pri_…` (publics) et donner-les au Chef de projet.

### 2. Dans Paddle réel : les clés et le webhook (propriétaire)
- *Developer tools → Authentication* : un **jeton côté client** `live_…` (public : à donner au Chef de projet) et une **clé API**
  (secrète : permissions *Customer portal sessions: write*, *Subscriptions: read + write*, *Customers: read*) ;
- *Developer tools → Notifications → New destination* : webhook `https://stalak.app/api/paddle/webhook`, événements `subscription.*`
  (created, updated, activated, canceled, past_due, paused, resumed, trialing), `transaction.completed`, `adjustment.created`,
  `adjustment.updated` ; copier la **clé secrète** (`pdl_ntfset_…`) ;
- même page : activer l'**e-mail en cas d'échec de livraison** du webhook ;
- *Checkout settings* : lien de paiement par défaut `https://stalak.app/`.

### 3. Dans le code (Chef de projet, une seule mise en ligne)
Dans `wrangler.toml` **et** `workers/cloud-cleanup/wrangler.toml` (les deux) :
- `PADDLE_ENV = "production"` ;
- `PADDLE_CLIENT_TOKEN = "live_…"` ;
- les 4 prix réels dans `PADDLE_PRICE_PRO_MONTH`, `PADDLE_PRICE_PRO_YEAR`, `PADDLE_PRICE_CREATOR_MONTH`, `PADDLE_PRICE_CREATOR_YEAR` ;
- vider `PADDLE_PRICES_OLD`, `PADDLE_PRICE_MONTH` et `PADDLE_PRICE_YEAR` (ce sont des prix de test).

### 4. Dans Cloudflare (propriétaire, juste avant la mise en ligne)
*Workers & Pages → stalak-site → Settings → Variables and Secrets* (onglet **Production**) : remplacer `PADDLE_API_KEY` et
`PADDLE_WEBHOOK_SECRET` par les valeurs réelles. Puis le Chef de projet publie l'étape 3 tout de suite après (entre les deux,
les paiements ne marchent pas : quelques minutes). Si le Worker `cloud-cleanup` est déployé : le redéployer
(`npx wrangler deploy -c workers/cloud-cleanup/wrangler.toml`).

### 5. Vérifier (propriétaire + Chef de projet)
1. <https://stalak.app/api/config> : `"environment":"production"`, le jeton `live_…`, les 4 nouveaux prix ;
2. le tableau de bord : le bandeau « paiements de test » et les étiquettes **TEST** ont disparu ; abonnés et revenu à 0 ;
3. un **vrai achat** de Stalak Pro mensuel (7,99 $) avec ta carte : la page passe en Pro en quelques secondes ; le tableau de bord
   montre 1 abonné, le paiement et 1 « premier paiement » dans l'entonnoir ;
4. rembourser cet achat dans Paddle (*Transactions → … → Refund*) : il apparaît dans « Remboursements » ;
5. supprimer l'abonnement de test de ton compte si besoin : *Mon compte → Gérer mon abonnement*.

### 6. Ensuite (facultatif)
- Effacer pour de bon les lignes de test (après une copie) : la requête SQL est dans BACKEND.md 7.1.
- Archiver les anciens prix sandbox dans Paddle sandbox (avec l'accord du propriétaire).

## Si quelque chose ne va pas
- **Le paiement passe mais le compte ne devient pas Pro** : le webhook n'arrive pas. Paddle → *Notifications* → la destination →
  *Logs* : une erreur 401 = mauvais `PADDLE_WEBHOOK_SECRET` ; 404 = mauvaise adresse. Corriger dans Cloudflare, puis *Retry* dans Paddle.
- **La fenêtre de paiement ne s'ouvre pas** : jeton `live_…` ou prix faux dans `wrangler.toml` (vérifier `/api/config`).
- **Revenir en arrière** : remettre les valeurs sandbox (wrangler.toml + 2 secrets) et republier. Les abonnements réels restent
  dans la base, marqués `production`, et reviennent dès qu'on repasse en production.
