# Stalak : le serveur (comptes, abonnement Pro, sauvegarde en ligne)

Ce document explique **ce que tu dois créer et cliquer** pour mettre en route le serveur de Stalak.
Le code est déjà écrit. Il te reste à créer trois comptes de services et à recopier quelques identifiants.

Compte environ 1 h 30 la première fois, plus le délai de validation de Paddle (quelques jours).

---

## 0. Ce que fait le serveur

| Fonction | Comment |
|---|---|
| Connexion sans mot de passe | L'utilisateur tape son e-mail et reçoit un code à 6 chiffres, valable 10 min, avec 5 essais au maximum. L'e-mail part en français ou en anglais. |
| Session | Un cookie `stalak_s` sécurisé (HttpOnly, Secure, SameSite=Lax) qui reste valable 60 jours. |
| Abonnement Pro | 9,99 € / mois ou 79 € / an, payé via **Paddle**. Paddle est le revendeur officiel : c'est lui qui encaisse, gère la TVA et envoie les factures. |
| Avantages Pro | Pas d'outro Stalak à la fin des exports, sauvegarde des projets en ligne, mode Clip (16:9, chanson entière) et transcription automatique des paroles (à venir). |
| Gérer / résilier | Un lien vers l'espace client Paddle. |
| Supprimer son compte | Le compte et toutes ses données sont effacés, et l'abonnement en cours est arrêté. Les boutiques d'apps, Meta et TikTok l'exigent. |
| Publication TikTok / Instagram | Seulement préparée, **désactivée**. Rien à faire pour l'instant. |

Fichiers ajoutés :

- `functions/` contient le code serveur (Cloudflare Pages Functions). Il est placé **à la racine du dépôt** et non dans `public/`, comme Cloudflare le demande : « Make sure that the `/functions` directory is at the root of your Pages project (and not in the static root) » ([doc Cloudflare](https://developers.cloudflare.com/pages/functions/get-started/)).
- `migrations/0001_init.sql` crée les tables de la base de données.
- `wrangler.toml` contient la configuration Cloudflare (base `DB`, réglages publics).
- `src/account.js` est le petit module côté site (`window.StalakAccount`).
- `tests/backend/` contient les tests automatiques.

> ⚠️ **Important : ne fusionne pas la branche `backend` dans `main` avant d'avoir fait l'étape 2.**
> Le fichier `wrangler.toml` contient `REPLACE-WITH-D1-DATABASE-ID`. Tant que tu n'as pas mis le vrai
> identifiant de la base à la place, Cloudflare refusera de publier le site.

---

## 1. Ordre conseillé

1. Cloudflare : créer la base de données (étape 2).
2. Resend : configurer l'envoi des e-mails (étape 3).
3. Paddle **sandbox** (mode test, faux paiements) : produit, prix, clés et webhook (étape 4).
4. Cloudflare : saisir les secrets et fusionner la branche (étape 5).
5. Tester avec une fausse carte (étape 6).
6. Paddle **production** (vrais paiements), une fois le compte validé par Paddle (étape 7).

---

## 2. Cloudflare : la base de données D1

1. Va sur <https://dash.cloudflare.com>, puis dans le menu de gauche **Storage & Databases → D1 SQL Database**.
2. Clique sur **Create Database**. Nom : `stalak`. Laisse les autres réglages par défaut, puis clique sur **Create**.
3. Sur la page de la base, copie le **Database ID** (une suite du type `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
4. Dans le fichier `wrangler.toml`, remplace `REPLACE-WITH-D1-DATABASE-ID` par cet identifiant.
5. Crée les tables : sur la page de la base, ouvre l'onglet **Console**. Colle **tout** le contenu de `migrations/0001_init.sql`, puis clique sur **Execute**.
   Vérifie ensuite dans l'onglet **Tables** que tu vois `users`, `login_codes`, `sessions`, `rate_limits`, `subscriptions`, `webhook_events` et `projects`.

> Le stockage R2 (`MEDIA`), qui servira plus tard aux vidéos, est volontairement laissé en commentaire dans `wrangler.toml`.
> Ne l'active que le jour où on en aura besoin : il faudra d'abord créer un bucket `stalak-media`.

---

## 3. Resend : l'envoi des e-mails de connexion

1. Crée un compte sur <https://resend.com>.
2. Va dans **Domains → Add Domain** et saisis `stalak.app`.
3. Resend affiche des enregistrements DNS (MX, TXT/SPF, DKIM). Comme le domaine est chez Cloudflare, tu peux utiliser le bouton de configuration automatique s'il apparaît. Sinon, ajoute-les à la main dans Cloudflare (**stalak.app → DNS → Records → Add record**).
4. Attends que le domaine passe en **Verified** (de quelques minutes à quelques heures).
5. Va dans **API Keys → Create API Key**. Nom : `stalak-site`. Permission : **Sending access**, limitée au domaine `stalak.app`.
6. Copie la clé (`re_…`). Elle ne s'affiche qu'une seule fois. Tu la saisiras à l'étape 5 sous le nom `RESEND_API_KEY`.

Les e-mails partent de **Stalak &lt;login@stalak.app&gt;**. Il n'est pas nécessaire de créer une vraie boîte mail à cette adresse.

---

## 4. Paddle (d'abord en mode test : « sandbox »)

Paddle propose deux espaces séparés : **sandbox** (faux argent, pour tester) et **production** (vrais paiements).
Fais tout d'abord en sandbox : <https://sandbox-vendors.paddle.com> (crée un compte sandbox, c'est gratuit et immédiat).

### 4.1 Le produit et les deux prix
1. Va dans **Catalog → Products → New product**. Nom : `Stalak Pro`. Catégorie fiscale : **Standard digital goods** (ou « Software as a service »).
2. Dans ce produit, ajoute un prix avec **New price** :
   - Prix 1 : **9,99 EUR**, type **Recurring**, période **Monthly**. Description : « Mensuel ».
   - Prix 2 : **79,00 EUR**, type **Recurring**, période **Yearly**. Description : « Annuel ».
3. Copie l'identifiant de chaque prix (`pri_…`).

### 4.2 Les clés
Va dans **Developer tools → Authentication** :
1. **Client-side tokens → New client-side token**. Copie le jeton (`test_…`). Il est public et peut être affiché sur le site.
2. **API keys → New API key**. Nom : `stalak-site`. Permissions minimales : **Customer portal sessions : write**, **Subscriptions : read + write** (pour l'arrêt de l'abonnement quand quelqu'un supprime son compte) et **Customers : read**.
   Copie la clé (`pdl_sdbx_apikey_…`). Elle est **secrète**.

### 4.3 Le lien de paiement par défaut
Va dans **Checkout → Checkout settings → Default payment link** et saisis `https://stalak.app/`, puis enregistre.
Paddle exige ce réglage pour que le paiement s'ouvre sur le site. En production, le domaine devra aussi être **approuvé** par Paddle (étape 7).

### 4.4 Le webhook (Paddle prévient Stalak qu'un abonnement a changé)
1. Va dans **Developer tools → Notifications → New destination**.
2. Type : **Webhook**. URL : `https://stalak.app/api/paddle/webhook`.
3. Coche ces événements :
   `subscription.created`, `subscription.updated`, `subscription.activated`, `subscription.canceled`,
   `subscription.past_due`, `subscription.paused`, `subscription.resumed`, `subscription.trialing`, `transaction.completed`.
4. Enregistre, puis ouvre la destination et copie la **clé secrète** (*secret key*, `pdl_ntfset_…`). Elle est **secrète**.

### 4.5 Recopier les réglages publics dans `wrangler.toml`
Dans la section `[vars]` :

```toml
PADDLE_ENV = "sandbox"
PADDLE_CLIENT_TOKEN = "test_…"      # étape 4.2-1
PADDLE_PRICE_MONTH = "pri_…"        # prix 9,99 €
PADDLE_PRICE_YEAR = "pri_…"         # prix 79 €
```

> Comme `wrangler.toml` est présent dans le dépôt, Cloudflare s'en sert comme référence pour ces réglages :
> ils se modifient **dans ce fichier**, pas dans le tableau de bord. Les secrets, eux, se règlent dans le tableau de bord (étape 5).

---

## 5. Cloudflare : les secrets, puis la mise en ligne

1. Sur <https://dash.cloudflare.com>, va dans **Workers & Pages → stalak-site → Settings → Variables and Secrets**.
2. Pour l'environnement **Production**, ajoute ces valeurs avec le type **Secret** :

| Nom | Valeur | Obligatoire |
|---|---|---|
| `RESEND_API_KEY` | la clé `re_…` (étape 3) | oui |
| `PADDLE_API_KEY` | la clé `pdl_…apikey…` (étape 4.2-2) | oui |
| `PADDLE_WEBHOOK_SECRET` | la clé `pdl_ntfset_…` (étape 4.4) | oui |
| `AUTH_SECRET` | une longue phrase aléatoire (40 caractères ou plus) | conseillé |

   `AUTH_SECRET` renforce le chiffrement des codes de connexion en base. Une fois choisi, **ne le change plus** pendant que des codes sont en attente.
3. Ajoute les mêmes secrets pour l'environnement **Preview** si tu veux tester sur les adresses `…stalak-site.pages.dev`.
4. Vérifie que le `wrangler.toml` contient le bon Database ID (étape 2) et les réglages Paddle (étape 4.5).
5. Fusionne la branche `backend` dans `main` sur GitHub (ou demande-le à Claude). Cloudflare publie automatiquement.
6. Vérifie que tout répond : ouvre <https://stalak.app/api/config>. Tu dois voir un texte qui commence par `{"paddle":{"environment":"sandbox",…`.

> Le module `src/account.js` doit aussi être ajouté à la page du site par `build_site.py`.
> C'est une petite modification à faire après la version anglaise (voir « Pour le développeur » plus bas).

---

## 6. Tester un abonnement (sandbox)

1. Sur le site, connecte-toi avec ton e-mail et le code reçu.
2. Lance le passage à Pro. Dans la fenêtre Paddle, utilise la carte de test **4242 4242 4242 4242**, avec n'importe quelle date future et le CVC `100`.
3. Quelques secondes plus tard, le compte passe en Pro. Tu peux le vérifier sur `https://stalak.app/api/me` : la réponse doit contenir `"plan":"pro"`.
4. Teste « Gérer mon abonnement » : le lien ouvre l'espace client Paddle. Résilie depuis cet espace.
   Le compte **reste Pro jusqu'à la fin de la période payée**, puis repasse en Free automatiquement.
5. Dans Paddle, **Developer tools → Notifications → (ta destination) → Logs** affiche chaque envoi.
   Un code 200 veut dire que l'envoi est arrivé. Un code 401 veut dire que la clé secrète du webhook est fausse.

---

## 7. Passer aux vrais paiements (production)

1. Crée le compte **live** sur <https://vendors.paddle.com>. Remplis l'identité de l'entreprise et les coordonnées bancaires, et demande la **vérification du site** (*Website approval*) pour `stalak.app`.
   Paddle vérifie que le site a des mentions légales, une politique de confidentialité, des CGV ou conditions d'utilisation, une politique de remboursement et des prix visibles. Il faudra donc ajouter les CGV et une page de tarifs.
2. Une fois le compte validé, refais les étapes **4.1 à 4.4** dans le compte live. Les identifiants y sont différents : `live_…` et `pdl_live_apikey_…`.
3. Dans `wrangler.toml`, mets `PADDLE_ENV = "production"` ainsi que le nouveau `PADDLE_CLIENT_TOKEN` et les nouveaux `pri_…`.
4. Dans Cloudflare (étape 5), remplace `PADDLE_API_KEY` et `PADDLE_WEBHOOK_SECRET` par leurs versions live.
5. Fais un vrai achat avec ta carte, puis rembourse-le depuis Paddle.

---

## 8. Ce qu'il ne faut pas faire

- Ne jamais mettre une clé **secrète** (`re_…`, `pdl_…apikey…`, `pdl_ntfset_…`, `AUTH_SECRET`) dans `wrangler.toml`, dans le code ou dans un message public.
  Seuls le jeton client (`test_…` ou `live_…`) et les `pri_…` sont publics.
- Si une clé a fuité, révoque-la dans Resend ou Paddle, crées-en une nouvelle et mets-la à jour dans Cloudflare.

---

## Pour le développeur

### Routes (`/api/…`)
Toutes les réponses sont en JSON. Les erreurs ont la forme `{"error":"code","message":"…"}`.

| Méthode et chemin | Rôle |
|---|---|
| `GET /api/config` | Réglages publics : `paddle.environment`, `paddle.clientToken`, `paddle.prices.month` et `.year`. |
| `GET /api/me` | `{user, entitlements, subscription}`. `entitlements` = `{plan, outro, cloudSave, clipMode, autoLyrics}`. |
| `POST /api/auth/send-code` | `{email, lang}`. Limites : 1 code toutes les 30 s et 5 par heure pour un même e-mail, 20 par heure pour une même IP. |
| `POST /api/auth/verify` | `{email, code}`. Pose le cookie et renvoie la même chose que `/api/me`. Limite : 30 essais par IP toutes les 10 min. |
| `POST /api/auth/logout` | Supprime la session. |
| `POST /api/paddle/webhook` | Pour Paddle uniquement (signature vérifiée). |
| `POST /api/paddle/portal` | `{url, cancelUrl, updatePaymentUrl}` : liens temporaires vers l'espace client Paddle. |
| `GET /api/projects` | Liste des projets (sans leur contenu). |
| `GET /api/projects/:id` | `{id, name, state, updatedAt}`. |
| `PUT /api/projects/:id` | `{name, state}`, 256 Ko maximum, 200 projets maximum. **Pro uniquement** : sinon `403 pro_required`. |
| `DELETE /api/projects/:id` | Supprime un projet. |
| `DELETE /api/account` | `{confirm:true}`. Arrête l'abonnement Paddle, puis efface toutes les données. |
| `GET /api/connect/{tiktok,instagram}/{start,callback}` | Ébauches : `404 not_enabled` tant que `SOCIAL_CONNECT_ENABLED` ne vaut pas `"1"`, puis `501`. |

Codes d'erreur : `not_logged_in` (401), `pro_required` (403), `bad_origin` (403), `json_required` (415), `rate_limited` (429, avec `retryAfter`),
`invalid_code` (avec `attemptsLeft`), `code_expired`, `too_many_attempts`, `invalid_signature`, `too_large` (413), `not_found`, `method_not_allowed`.

Protection CSRF : sur POST, PUT et DELETE, le serveur exige `Content-Type: application/json` et un en-tête `Origin` égal à `APP_ORIGIN` (`https://stalak.app`).
Des origines supplémentaires peuvent être autorisées avec `EXTRA_ORIGINS` (liste séparée par des virgules). `localhost` n'est accepté qu'en mode dev
(`DEV_MODE=1`, ou `APP_ORIGIN` en `http://localhost…`). En mode dev, sans `RESEND_API_KEY`, le code est écrit dans la console et renvoyé dans `devCode`.

Choix à connaître :
- `past_due` (paiement en échec, que Paddle retente) **garde Pro** pendant les relances. `paused` et `canceled` repassent en Free.
  Garde-fou : si les webhooks se perdent, un abonnement « actif » dont la période est finie depuis plus de 3 jours n'est plus compté comme Pro.
- Une résiliation programmée arrive par `subscription.updated` avec `scheduled_change.action = "cancel"` : le compte reste Pro.
  Ensuite, `subscription.canceled` le fait passer en Free à la date de fin.
- Un événement plus ancien que le dernier appliqué est ignoré (comparaison sur `occurred_at`). Les doublons sont ignorés grâce à `event_id`.
- Le lien entre un paiement et un compte se fait par `customData.user_id`, transmis au paiement. Si ce champ manque, le lien se fait par `customer_id`.
- La signature du webhook est acceptée avec un écart de 5 minutes au maximum (les SDK de Paddle utilisent 5 s par défaut). Plusieurs `h1` sont acceptés, pour la rotation des clés.
- Lire et supprimer ses projets reste possible après la fin du Pro, pour que l'utilisateur récupère ses données. Seul l'enregistrement exige Pro.

### Intégrer `src/account.js` au site
`build_site.py` ne le connaît pas encore. Il faut soit l'insérer dans le `<script>` de la page, soit le copier dans `public/account.js` et ajouter
`<script src="/account.js" defer></script>`. Ensuite, côté application :

```js
StalakAccount.onChange(s => { /* s.entitlements.outro, s.entitlements.clipMode… */ });
StalakAccount.me();
await StalakAccount.sendCode(email);          // langue prise dans <html lang>
await StalakAccount.verify(email, code);
StalakAccount.checkout('month');              // ou 'year' : ouvre la fenêtre Paddle
const { url } = await StalakAccount.portal(); // gérer / résilier
```

Le module charge Paddle.js (`https://cdn.paddle.com/paddle/v2/paddle.js`) seulement au moment du paiement.
Si une politique CSP est ajoutée un jour, il faudra autoriser `cdn.paddle.com` et les domaines de paiement de Paddle.

### Tests
```
node tests/backend/run.mjs
```
Il faut Node 22.5 ou plus récent, sans aucune installation. Les tests utilisent la base SQLite intégrée à Node à la place de D1, et simulent Resend et Paddle.

### Développement local (facultatif)
`npx wrangler pages dev`, avec un fichier `.dev.vars` (`DEV_MODE=1`, `APP_ORIGIN=http://localhost:8788`, etc.).
**Ajoute `.dev.vars` au `.gitignore`** avant de t'en servir.
Pour la base locale : `npx wrangler d1 migrations apply stalak --local`.

### Sources (documentation consultée le 27/10/2026)
- Signature des webhooks Paddle (`Paddle-Signature: ts=…;h1=…`, HMAC-SHA256 de `ts:corps brut`, plusieurs `h1` possibles) : <https://developer.paddle.com/webhooks/about/signature-verification>
- Événement `subscription.canceled`, résiliation immédiate ou programmée (`scheduled_change`) : <https://developer.paddle.com/webhooks/subscriptions/subscription-canceled>
- Autres événements : <https://developer.paddle.com/webhooks/subscriptions/subscription-past-due>, <https://developer.paddle.com/webhooks/subscriptions/subscription-activated>, <https://developer.paddle.com/webhooks/subscriptions/subscription-updated>
- Espace client (`POST /customers/{customer_id}/portal-sessions`, `urls.general.overview`) : <https://developer.paddle.com/api-reference/customer-portals/create-customer-portal-session>
- Paiement en fenêtre superposée avec Paddle.js (`Paddle.Environment.set`, `Paddle.Initialize({token})`, `Paddle.Checkout.open`) : <https://developer.paddle.com/build/checkout/build-overlay-checkout>
- Emplacement du dossier `functions/` : <https://developers.cloudflare.com/pages/functions/get-started/>
- Configuration `wrangler.toml` pour Pages (`pages_build_output_dir`, D1) : <https://developers.cloudflare.com/pages/functions/wrangler-configuration/>
- Envoi d'e-mail avec Resend : <https://resend.com/docs/api-reference/emails/send-email>
