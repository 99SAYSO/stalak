# Stalak : le serveur (comptes, abonnement Pro, sauvegarde en ligne)

Ce document explique **ce que tu dois créer et cliquer** pour mettre en route le serveur de Stalak.
Le code est déjà écrit. Il te reste à créer trois comptes de services et à recopier quelques identifiants.

Compte environ 1 h 30 la première fois, plus le délai de validation de Paddle (quelques jours).

---

## 0. Ce que fait le serveur

| Fonction | Comment |
|---|---|
| Créer un compte | E-mail + mot de passe (8 caractères minimum, les plus courants refusés) + pseudo facultatif. Stalak envoie un code à 6 chiffres (valable 10 min, 5 essais) pour vérifier l'adresse ; le compte n'existe qu'une fois le code tapé. Une adresse déjà utilisée est signalée, avec « Se connecter » et « Mot de passe oublié ? ». |
| Se connecter | E-mail + mot de passe. Sur un navigateur jamais vu pour ce compte, un code est ensuite envoyé par e-mail ; une fois tapé, ce navigateur est reconnu pendant 90 jours (cookie `stalak_d`). Message identique si l'e-mail n'existe pas ou si le mot de passe est faux ; blocage 15 min après 5 erreurs. |
| Mot de passe oublié | E-mail → code → nouveau mot de passe → connecté. Les autres appareils sont déconnectés. Sert aussi aux comptes créés avant avec un code seul (sans mot de passe) : « Crée ton mot de passe ». |
| Google, Apple, Microsoft | Boutons « Continuer avec … », affichés seulement pour les services configurés (étape 8). Le compte est relié par l'e-mail vérifié, ou créé. Pas de code à taper. |
| Profil | Un pseudo (2 à 30 caractères) et une photo (recadrée et réduite à 256 × 256 dans le navigateur, 80 Ko maximum côté serveur). |
| Session | Un cookie `stalak_s` sécurisé (HttpOnly, Secure, SameSite=Lax) qui reste valable 60 jours. |
| Abonnement Pro | 9,99 € / mois ou 79 € / an, payé via **Paddle**. Paddle est le revendeur officiel : c'est lui qui encaisse, gère la TVA et envoie les factures. |
| Avantages | Formules Gratuit / Pro / Creator Plus : voir l'étape 14 (tableau unique dans `functions/_lib/entitlements.js`). |
| Sauvegarde en ligne | Pro : un projet entier (son, prises, paroles, montage) gardé dans le compte, 20 Go par compte, rouvert sur n'importe quel appareil (étape 11). |
| Gérer / résilier | Un lien vers l'espace client Paddle. |
| Supprimer son compte | Le compte et toutes ses données sont effacés, et l'abonnement en cours est arrêté. Les boutiques d'apps, Meta et TikTok l'exigent. |
| Publication TikTok / Instagram | Seulement préparée, **désactivée**. Rien à faire pour l'instant. |

Fichiers ajoutés :

- `functions/` contient le code serveur (Cloudflare Pages Functions). Il est placé **à la racine du dépôt** et non dans `public/`, comme Cloudflare le demande : « Make sure that the `/functions` directory is at the root of your Pages project (and not in the static root) » ([doc Cloudflare](https://developers.cloudflare.com/pages/functions/get-started/)).
- `migrations/0001_init.sql` crée les tables de la base de données ; `0002_…`, `0003_…` et `0004_cloud_save.sql` (sauvegarde en ligne) les complètent.
- `functions/_lib/cloud.js` : la sauvegarde en ligne (fichiers dans R2, espace de 100 Go en Creator Plus, règle des 6 mois) ; `workers/cloud-cleanup/` : le Worker planifié de la règle des 6 mois.
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
7. Facultatif, quand tu veux : les boutons « Continuer avec Google / Apple / Microsoft » (étape 8).

---

## 2. Cloudflare : la base de données D1

1. Va sur <https://dash.cloudflare.com>, puis dans le menu de gauche **Storage & Databases → D1 SQL Database**.
2. Clique sur **Create Database**. Nom : `stalak`. Laisse les autres réglages par défaut, puis clique sur **Create**.
3. Sur la page de la base, copie le **Database ID** (une suite du type `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
4. Dans le fichier `wrangler.toml`, remplace `REPLACE-WITH-D1-DATABASE-ID` par cet identifiant.
5. Crée les tables : sur la page de la base, ouvre l'onglet **Console**. Colle **tout** le contenu de `migrations/0001_init.sql`, puis clique sur **Execute**.
   Vérifie ensuite dans l'onglet **Tables** que tu vois `users`, `login_codes`, `sessions`, `rate_limits`, `subscriptions`, `webhook_events` et `projects`.
6. Puis, toujours dans la **Console**, colle **tout** le contenu de `migrations/0002_profile_password.sql` et clique sur **Execute** (une seule fois :
   relancer ce fichier donne l'erreur « duplicate column name », sans danger). Il ajoute le pseudo, la photo et le mot de passe.
   **À faire avant de publier la version qui contient la page Compte**, sinon `/api/me` répond une erreur.
7. Enfin, colle **tout** le contenu de `migrations/0003_auth_v3.sql` et clique sur **Execute** (une seule fois, elle aussi).
   Elle ajoute la vérification de l'e-mail, les codes d'inscription, les navigateurs reconnus et les comptes Google / Apple / Microsoft.
   **À faire avant de publier la version « comptes v3 »**, sinon l'inscription et la connexion répondent une erreur.
   Les comptes et les sessions existants continuent de marcher ; les comptes créés avec un code seul choisissent un mot de passe avec « Mot de passe oublié ? ».

> La sauvegarde en ligne demande en plus `migrations/0004_cloud_save.sql` et le bucket R2 `stalak-media` : voir l'étape 11.

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

1. Sur le site, crée un compte (e-mail, mot de passe, puis le code reçu).
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

## 8. Connexion avec Google, Apple et Microsoft (facultatif)

Les boutons « Continuer avec Google », « Continuer avec Apple » et « Continuer avec Microsoft » n'apparaissent sur le site
**que lorsque leurs clés sont enregistrées dans Cloudflare**. Tu peux donc les activer un par un, quand tu veux.
Tant que rien n'est configuré, le site marche normalement avec l'e-mail et le mot de passe.

Pour chacun, l'idée est la même : tu crées une « application » chez Google, Microsoft ou Apple, tu lui donnes l'adresse de retour
de Stalak, et tu recopies deux ou quatre identifiants dans Cloudflare (étape 8.4).

Les adresses de retour (*redirect URI*) à recopier **exactement** :

| Service | Adresse de retour |
|---|---|
| Google | `https://stalak.app/api/auth/oauth/google/callback` |
| Microsoft | `https://stalak.app/api/auth/oauth/microsoft/callback` |
| Apple | `https://stalak.app/api/auth/oauth/apple/callback` |

### 8.1 Google (gratuit, environ 15 minutes)

1. Va sur <https://console.cloud.google.com> et connecte-toi avec le compte Google de Stalak.
2. En haut à gauche, clique sur le sélecteur de projet, puis **Nouveau projet**. Nom : `Stalak`. Clique sur **Créer**, puis sélectionne ce projet.
3. Menu ☰ → **API et services** → **Écran de consentement OAuth** (la page s'appelle aussi **Google Auth Platform**). Clique sur **Commencer** :
   - Nom de l'application : `Stalak` ; adresse e-mail d'assistance : ton adresse.
   - Audience : **Externe**.
   - Coordonnées : ton adresse. Accepte le règlement, puis **Créer**.
4. Dans **Branding** (Image de marque) :
   - Page d'accueil : `https://stalak.app`
   - Règles de confidentialité : `https://stalak.app/confidentialite`
   - Conditions d'utilisation : `https://stalak.app/conditions`
   - Domaines autorisés : ajoute `stalak.app`. Enregistre.
   - Ne mets **pas** de logo pour l'instant : un logo oblige Google à vérifier l'application (plusieurs jours). Sans logo, c'est immédiat.
5. Dans **Audience**, clique sur **Publier l'application** puis confirme : le statut passe à **En production**.
   (En « Test », seules les adresses ajoutées à la main pourraient se connecter.) Stalak ne demande que le nom, l'e-mail et la photo :
   ce sont des autorisations « non sensibles », Google ne demande pas de vérification.
6. Dans **Clients**, clique sur **Créer un client** :
   - Type d'application : **Application Web**. Nom : `Stalak site`.
   - Origines JavaScript autorisées : `https://stalak.app`
   - URI de redirection autorisés : `https://stalak.app/api/auth/oauth/google/callback`
   - Clique sur **Créer**.
7. Une fenêtre affiche l'**ID client** (`…apps.googleusercontent.com`) et le **Code secret du client** (`GOCSPX-…`).
   Copie les deux tout de suite (ou clique sur **Télécharger le JSON**) : le code secret ne sera plus affiché ensuite.
   → `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` (étape 8.4).

### 8.2 Microsoft (gratuit, environ 15 minutes)

Les comptes Microsoft personnels (Outlook, Hotmail, Live, Xbox) et les comptes d'entreprise ou d'école peuvent se connecter.

1. Va sur <https://entra.microsoft.com> et connecte-toi avec un compte Microsoft.
   Si on te dit que ton compte n'a pas d'annuaire (*tenant*), crée d'abord un compte Azure gratuit sur <https://azure.microsoft.com/free>
   avec le même compte, puis reviens.
2. Menu de gauche : **Identité** → **Applications** → **Inscriptions d'applications** → **Nouvelle inscription** :
   - Nom : `Stalak`
   - Types de comptes pris en charge : **Comptes dans un annuaire d'organisation (tout annuaire Microsoft Entra ID - multilocataire) et comptes Microsoft personnels (par exemple, Skype, Xbox)**.
   - URI de redirection : plateforme **Web**, adresse `https://stalak.app/api/auth/oauth/microsoft/callback`
   - Clique sur **S'inscrire**.
3. Sur la page **Vue d'ensemble**, copie l'**ID d'application (client)** (une suite du type `xxxxxxxx-xxxx-…`). → `MICROSOFT_CLIENT_ID`
4. **Certificats et secrets** → **Secrets client** → **Nouveau secret client**. Description : `Stalak site` ; expiration : **24 mois**. Clique sur **Ajouter**.
   Copie tout de suite la colonne **Valeur** (pas l'« ID du secret ») : elle ne sera plus affichée. → `MICROSOFT_CLIENT_SECRET`
   ⚠️ Note dans ton agenda la date d'expiration : il faudra créer un nouveau secret avant, et le remplacer dans Cloudflare.
5. **Configuration du jeton** → **Ajouter une revendication facultative** → type **ID** → coche `email` et `xms_edov` → **Ajouter**
   (si une case « Activer l'autorisation Microsoft Graph email » apparaît, coche-la).
   Pourquoi : pour les comptes d'entreprise, Microsoft ne garantit pas toujours l'adresse e-mail. Stalak n'accepte l'adresse d'un compte
   d'entreprise que si Microsoft confirme qu'elle appartient bien à l'entreprise (`xms_edov`). Les comptes personnels sont toujours acceptés.
6. **Personnalisation et propriétés** (Branding) : URL de la page d'accueil `https://stalak.app`, conditions `https://stalak.app/conditions`,
   confidentialité `https://stalak.app/confidentialite`. Enregistre.
   Tant que l'éditeur n'est pas « vérifié », Microsoft affiche « non vérifié » sur sa page de consentement pour les comptes d'entreprise.
   Ce n'est pas bloquant. La vérification (*Publisher verification*) demande un compte Microsoft Partner : à faire plus tard si besoin.

Réglage facultatif `MICROSOFT_TENANT` : `common` par défaut (tous les comptes). `consumers` = seulement les comptes personnels,
`organizations` = seulement les comptes d'entreprise.

### 8.3 Apple (payant : Apple Developer Program, 99 $ par an)

« Se connecter avec Apple » demande un abonnement au **Apple Developer Program** (<https://developer.apple.com/programs/>),
à prendre au nom de la personne ou de l'entreprise qui publie Stalak. L'inscription peut prendre de quelques heures à quelques jours.

Une fois le compte actif, va sur <https://developer.apple.com/account> → **Certificates, Identifiers & Profiles**.

1. **Ton Team ID** : il est affiché en haut à droite de la page (10 caractères, par exemple `A1B2C3D4E5`), et dans **Membership details**. → `APPLE_TEAM_ID`
2. **L'App ID** : **Identifiers** → bouton **+** → **App IDs** → **Continue** → type **App** → **Continue**.
   - Description : `Stalak` ; Bundle ID : **Explicit**, `app.stalak`
   - Dans la liste **Capabilities**, coche **Sign In with Apple**. Clique sur **Continue**, puis **Register**.
3. **Le Services ID** (c'est l'identifiant du site) : **Identifiers** → **+** → **Services IDs** → **Continue**.
   - Description : `Stalak web` ; Identifier : `app.stalak.web` → **Continue** → **Register**.
   - Ouvre ce Services ID dans la liste, coche **Sign In with Apple**, puis clique sur **Configure** à côté :
     - Primary App ID : `app.stalak`
     - Domains and Subdomains : `stalak.app`
     - Return URLs : `https://stalak.app/api/auth/oauth/apple/callback`
     - **Next** → **Done** → **Continue** → **Save**.
   - → `APPLE_CLIENT_ID` = `app.stalak.web`
4. **La clé** : **Keys** → **+**. Key Name : `Stalak Sign in with Apple`. Coche **Sign In with Apple**, clique sur **Configure**,
   choisis `app.stalak` comme Primary App ID, **Save** → **Continue** → **Register**.
   - Clique sur **Download** : tu obtiens un fichier `AuthKey_XXXXXXXXXX.p8`. **Il ne peut être téléchargé qu'une fois** : garde-le en lieu sûr.
   - Note le **Key ID** (10 caractères, aussi dans le nom du fichier). → `APPLE_KEY_ID`
   - Ouvre le fichier `.p8` avec un éditeur de texte (TextEdit, Bloc-notes) et copie **tout** son contenu, lignes
     `-----BEGIN PRIVATE KEY-----` et `-----END PRIVATE KEY-----` comprises. → `APPLE_PRIVATE_KEY`
5. **Les e-mails vers les adresses masquées** : avec Apple, l'utilisateur peut cacher son adresse. Stalak reçoit alors une adresse
   du type `xxxx@privaterelay.appleid.com`, qui fait suivre les e-mails… seulement s'ils viennent d'un expéditeur déclaré.
   Dans **Certificates, Identifiers & Profiles** → **Services** → **Sign in with Apple for Email Communication** → **Configure** :
   ajoute le domaine `stalak.app` et l'adresse `login@stalak.app`, puis enregistre. Apple vérifie le SPF du domaine (déjà réglé pour Resend à l'étape 3).
   Sans cette étape, les codes envoyés à ces adresses (mot de passe oublié) n'arriveraient pas.

Bon à savoir : Apple ne donne le prénom et le nom **qu'à la toute première connexion**. Stalak les enregistre comme pseudo à ce moment-là.
Le « secret » demandé par Apple n'est pas fixe : Stalak le fabrique et le signe lui-même à chaque connexion avec la clé `.p8`.

### 8.4 Recopier les clés dans Cloudflare

1. <https://dash.cloudflare.com> → **Workers & Pages** → **stalak-site** → **Settings** → **Variables and Secrets**.
2. Pour l'environnement **Production**, clique sur **Add** pour chaque ligne ci-dessous, avec le type **Secret** (même pour les identifiants qui ne sont pas secrets : c'est plus simple) :

| Nom | Valeur | Pour |
|---|---|---|
| `GOOGLE_CLIENT_ID` | l'ID client `…apps.googleusercontent.com` (8.1-7) | Google |
| `GOOGLE_CLIENT_SECRET` | le code secret `GOCSPX-…` (8.1-7) | Google |
| `MICROSOFT_CLIENT_ID` | l'ID d'application (client) (8.2-3) | Microsoft |
| `MICROSOFT_CLIENT_SECRET` | la **Valeur** du secret client (8.2-4) | Microsoft |
| `MICROSOFT_TENANT` | facultatif : `common` (par défaut), `consumers` ou `organizations` | Microsoft |
| `APPLE_CLIENT_ID` | le Services ID, `app.stalak.web` (8.3-3) | Apple |
| `APPLE_TEAM_ID` | le Team ID (8.3-1) | Apple |
| `APPLE_KEY_ID` | le Key ID (8.3-4) | Apple |
| `APPLE_PRIVATE_KEY` | tout le contenu du fichier `.p8` (8.3-4) | Apple |

3. Les nouveaux réglages ne s'appliquent qu'à la **prochaine mise en ligne** : dans **Deployments**, ouvre le dernier déploiement et clique sur **Retry deployment**
   (ou publie n'importe quelle modification).
4. Vérifie sur <https://stalak.app/api/config> : la ligne `"auth":{"providers":[…]}` doit lister `"google"`, `"microsoft"` et/ou `"apple"`.
   Un service n'apparaît que si **toutes** ses clés sont là (Apple : les quatre).
5. Essaie chaque bouton sur le site, en navigation privée.

En cas de problème, le site revient avec un message (« La connexion n'a pas marché ») et le détail technique est dans
**Workers & Pages → stalak-site → Functions → Real-time logs** (lignes `[stalak] oauth …`). Les causes habituelles :
adresse de retour mal recopiée (une lettre ou un `/` de trop), secret expiré (Microsoft) ou mauvais Team ID / Key ID (Apple).

---

## 9. Ce qu'il ne faut pas faire

- Ne jamais mettre une clé **secrète** (`re_…`, `pdl_…apikey…`, `pdl_ntfset_…`, `AUTH_SECRET`, `GOCSPX-…`, le secret Microsoft, le fichier `.p8` d'Apple) dans `wrangler.toml`, dans le code ou dans un message public.
  Seuls le jeton client (`test_…` ou `live_…`) et les `pri_…` sont publics.
- Si une clé a fuité, révoque-la dans Resend, Paddle, Google, Microsoft ou Apple, crées-en une nouvelle et mets-la à jour dans Cloudflare.

---

## 10. Paroles automatiques (Stalak Pro, Cloudflare Workers AI)

« Transcription auto » (étape 3 Paroles) envoie le son du passage choisi, découpé en morceaux de 30 s au plus
(WAV mono 16 kHz), à `POST /api/lyrics/transcribe`, qui le fait écrire par le modèle Whisper
`@cf/openai/whisper-large-v3-turbo` de **Cloudflare Workers AI** et renvoie les mots avec leurs temps.

1. Rien à créer : `wrangler.toml` contient déjà `[ai] binding = "AI"`, la mise en ligne branche Workers AI tout seul.
   (Si le déploiement refuse ce réglage : **Workers & Pages → stalak-site → Settings → Bindings → Add → Workers AI**,
   nom de variable `AI`, puis redéployer.)
2. Colle une fois `migrations/0004_lyrics_usage.sql` dans la console D1 (**Execute**), comme les autres migrations.
3. Coût : 10 000 « neurons » gratuits par jour pour tout le compte Cloudflare, soit environ 210 minutes de son par jour
   (46,63 neurons par minute de son, 0,0005 $ la minute). Au-delà, il faut le forfait **Workers Paid** (5 $ / mois),
   sinon les transcriptions échouent jusqu'au lendemain (message « pas disponible pour le moment »).
4. Limites par compte Pro : 20 transcriptions et 90 minutes de son par jour (UTC), 8 minutes au plus par transcription ;
   300 requêtes par heure par connexion, 200 par heure par compte. Elles se règlent en haut de `functions/_lib/lyrics.js`.
   Le son n'est jamais gardé ; seule la table `lyrics_usage` compte transcriptions et secondes par jour.
5. Sans le binding `AI`, la route répond `503 ai_unavailable` et l'app affiche « pas disponible pour le moment ».

---

## 11. Sauvegarde en ligne (Stalak Creator Plus, stockage R2)

Un abonné Creator Plus peut sauvegarder un projet entier (son, prises, paroles et leurs temps, montage, effets, format, style du texte)
avec « Sauvegarder en ligne » (étape Montage, ou Galerie dans le menu du compte), puis le rouvrir sur n'importe quel appareil.
La **Galerie** montre les projets en grille, chacun avec sa couverture : une image du montage (300 px de large, 64 Ko au plus),
faite par la page à chaque sauvegarde et rangée dans R2 à côté du projet (`u/<compte>/p/<projet>/cover`).
Le petit état du projet (JSON) est dans D1 ; le son et les vidéos sont dans **Cloudflare R2**, dans le bucket privé `stalak-media`.

| Règle | Valeur |
|---|---|
| Espace par compte | 100 Go en Creator Plus (son + prises + projets). Réglable avec la variable `CLOUD_QUOTA_BYTES` (en octets). Au-dessus (après un changement) : rien n'est effacé, les nouvelles sauvegardes attendent. |
| Taille d'un fichier | 4 Go au plus. Au-delà de 8 Mo, il est envoyé en morceaux de 8 Mo (envoi « multipart » de R2). |
| Projets | 200 au plus par compte, 64 fichiers au plus par projet. |
| Fichier déjà envoyé | Pas renvoyé : chaque fichier a une empreinte (nom, taille, date, début et fin du fichier). |
| Coupure réseau | Chaque morceau est réessayé (6 fois, attente croissante) ; « Réessayer » reprend où l'envoi s'était arrêté. |
| Sans Creator Plus | Aucun accès : la Galerie affiche « La sauvegarde en ligne est réservée à Stalak Creator Plus » (bouton vers la page des formules). Un ancien abonné retrouve ses projets s'il reprend Creator Plus ; ils sont gardés (règle des 6 mois). |
| 6 mois | Un projet ni ouvert ni sauvegardé depuis 6 mois est supprimé avec ses fichiers, **après un e-mail de rappel** envoyé au moins 14 jours avant. Sans e-mail envoyé, rien n'est supprimé. |
| Suppression | Supprimer un projet efface ses fichiers R2 et sa couverture ; supprimer son compte efface tout (et arrête les envois en cours). |

### 11.1 Mise en route (à faire une fois)
1. **R2** : dans Cloudflare, **R2 Object Storage** (un moyen de paiement doit être enregistré, R2 a une offre gratuite de 10 Go-mois).
   Crée le bucket `stalak-media`, accès public **désactivé** (aucun domaine public, aucune « r2.dev URL »). C'est fait.
2. **Base** : dans la **Console** de la base D1 `stalak`, colle **tout** `migrations/0004_cloud_save.sql` et clique sur **Execute** (une seule fois),
   **avant** de publier cette version (sinon la page Compte et la sauvegarde répondent une erreur).
   Pour la Galerie (couvertures), colle de même `migrations/0007_project_covers.sql` (une ligne) **avant** de publier la version
   qui l'utilise : sans elle, la Galerie répond une erreur.
3. **Liaison** : `wrangler.toml` contient déjà
   ```toml
   [[r2_buckets]]
   binding = "MEDIA"
   bucket_name = "stalak-media"
   ```
   Cloudflare relie le bucket au site à la publication suivante. Vérifie ensuite <https://stalak.app/api/config> : `"cloudSave":true`.
   Pour couper la fonction, mets ces 3 lignes en commentaire : le site affiche alors « bientôt » à la place, rien d'autre ne change.
4. **Le rappel des 6 mois** : Pages Functions n'a pas de tâche planifiée. Trois façons, au choix (elles peuvent coexister) :
   - rien à faire : le site lance le nettoyage lui-même, au plus toutes les 6 heures, quand quelqu'un ouvre la Galerie ;
   - **conseillé** : le petit Worker planifié `workers/cloud-cleanup` (tous les jours à 3 h 17 UTC) :
     `npx wrangler deploy -c workers/cloud-cleanup/wrangler.toml`, puis `npx wrangler secret put RESEND_API_KEY -c workers/cloud-cleanup/wrangler.toml` ;
   - ou un service de cron externe qui appelle `POST https://stalak.app/api/cron/cloud-cleanup` avec l'en-tête
     `Authorization: Bearer <CRON_SECRET>` (secret `CRON_SECRET` de 16 caractères ou plus, à ajouter dans Cloudflare).
   Les e-mails partent de `login@stalak.app` (Resend). Sans `RESEND_API_KEY`, aucun rappel ne part, donc aucun projet n'est supprimé.

---

## 12. Assistant de la bulle d'aide (tout le monde, Cloudflare Workers AI)

Le glaçon en bas à droite répond aux questions sur Stalak. Sur claude.ai, c'est Claude ; sur stalak.app, c'est la route
`POST /api/help/chat`, qui fait écrire la réponse par le modèle `@cf/google/gemma-4-26b-a4b-it` de **Workers AI**
(le même branchement `AI` que les paroles automatiques). Ce que l'assistant sait est dans `functions/_lib/help-guide.js`
(à mettre à jour, comme `HELP_GUIDE` dans `src/app.js`, quand un bouton, un prix ou une règle change).

1. **Rien à créer** : pas de clé, pas de migration. Ça marche dès la mise en ligne.
2. **Coût** : environ 50 neurons par question (70 au plus). La « réflexion » de Gemma 4 est coupée (`enable_thinking: false`) : sinon elle mangeait
   la place de la réponse, qui arrivait vide (1 fois sur 3 en ligne). Une réponse vide est redemandée une fois ; ce deuxième essai compte
   dans les 60 du jour. Pour garder le quota gratuit des paroles, l'aide s'arrête après
   **60 questions par jour pour tout le site** (le visiteur voit « l'assistant fait une pause, réessaie demain » et l'adresse e-mail).
   Pour changer ce nombre : variable `HELP_DAILY_MAX` dans `wrangler.toml` (`[vars]`). 0 = assistant coupé.
   Avec le forfait Workers payant (5 $ / mois), on peut le monter sans souci (1 000 questions ≈ 0,55 $).
3. **Limites par connexion** : 15 questions par 10 minutes, 60 par jour.
4. **Changer de modèle** (facultatif) : variable `HELP_MODEL`, un nom de modèle Workers AI qui commence par `@cf/`.
5. **Vie privée** : la question, les derniers messages et quelques infos sur l'écran partent chez Workers AI ; rien n'est gardé,
   seuls des compteurs servent aux limites. La politique de confidentialité le dit.

---

## 13. Ton tableau de bord privé (admin.stalak.app) et « Parler à un humain »

Le tableau de bord montre les inscrits, les abonnés Pro (mensuels, annuels) et le revenu, les visiteurs en direct, l'évolution
jour par jour, l'usage des fonctions et les messages des visiteurs, auxquels tu réponds depuis la page.
Il est à `https://admin.stalak.app/admin/`, réservé à ton e-mail par **Cloudflare Access**. Le serveur vérifie lui-même,
à chaque requête, la signature d'Access, l'adresse `admin.stalak.app` et ton e-mail : ailleurs (stalak.app, pages.dev),
ces pages n'existent pas. Tant que les 2 secrets de l'étape 13.4 manquent, le tableau de bord est éteint.

### 13.1 La base (avant de publier)
Dans la **Console** de la base D1 `stalak`, colle **tout** `migrations/0006_admin_support.sql` et clique sur **Execute** (une seule fois).

### 13.2 L'adresse admin.stalak.app
**Workers & Pages → stalak-site → Custom domains → Set up a custom domain** → `admin.stalak.app` → **Continue** → **Activate domain**.
Cloudflare crée l'enregistrement DNS tout seul. (Ne visite pas encore l'adresse : fais d'abord 13.3.)

### 13.3 Cloudflare Access (gratuit jusqu'à 50 personnes)
**Déjà fait le 27/10** : Zero Trust Free, équipe `small-band-a6ef` (`https://small-band-a6ef.cloudflareaccess.com`, déjà dans
`wrangler.toml`), application Access « admin » sur `admin.stalak.app`, code par e-mail pour le propriétaire seul.
Il reste à copier son AUD : **Zero Trust → Access controls → Applications → admin → Configure → Additional settings →
Application Audience (AUD) Tag**. Pour refaire ailleurs :
1. Dans le tableau de bord Cloudflare, ouvre **Zero Trust**. La première fois : choisis un **nom d'équipe** (par exemple `stalak`),
   puis l'offre **Free**. Cloudflare demande un moyen de paiement même pour l'offre gratuite, sans rien prélever.
   Ton adresse d'équipe sera `https://<nom-d-équipe>.cloudflareaccess.com` (visible dans **Settings**).
2. **Access** (ou **Access controls**) → **Applications** → **Add an application** → **Self-hosted** :
   - nom : `Stalak admin` ; durée de session : `24 hours` ;
   - domaine : sous-domaine `admin`, domaine `stalak.app`, chemin vide ;
   - règle (**policy**) : nom `Moi seul`, action **Allow**, sélecteur **Emails**, valeur : ton adresse e-mail ;
   - méthode de connexion : **One-time PIN** (un code envoyé à ton e-mail). Elle est active par défaut
     (**Settings → Authentication → Login methods**).
   Enregistre.
3. Ouvre l'application (**Configure**) → **Additional settings** (ou **Overview**) : copie l'**Application Audience (AUD) Tag**.

### 13.4 Les réglages, dans Cloudflare
**Workers & Pages → stalak-site → Settings → Variables and Secrets**, environnement **Production**, type **Secret** :

| Nom | Valeur |
|---|---|
| `ACCESS_AUD` | l'AUD Tag de l'application « admin » (13.3) |
| `ADMIN_EMAILS` | ton adresse e-mail (plusieurs : séparées par des virgules) |
| `SUPPORT_EMAIL` (facultatif) | où recevoir les nouveaux messages ; par défaut `contact@stalak.app` (qui arrive sur ton Gmail) |

`ADMIN_HOST = "admin.stalak.app"` et `ACCESS_TEAM_DOMAIN` (l'adresse de l'équipe) sont déjà dans `wrangler.toml`. Les réglages s'appliquent à la publication suivante.

### 13.5 Paddle : les remboursements
Pour que les remboursements comptent dans le revenu : Paddle → **Developer tools → Notifications** → ta destination →
coche aussi `adjustment.created` et `adjustment.updated`, puis enregistre. (Le revenu part de la mise en ligne de cette version :
les paiements d'avant ne sont pas rattrapés.)

### 13.6 Facultatif : arriver directement sur le tableau de bord
**stalak.app → Rules → Redirect Rules → Create rule** : si le nom d'hôte est `admin.stalak.app` et le chemin est `/`,
rediriger (302) vers `https://admin.stalak.app/admin/`. Sinon, garde le favori `https://admin.stalak.app/admin/`.

### 13.7 Vérifier
- `https://admin.stalak.app/admin/` : Cloudflare demande ton e-mail, envoie un code, puis le tableau de bord s'affiche.
- `https://stalak.app/admin/` : « Not found ».
- Sur stalak.app, ouvre le glaçon → **Parler à un humain** → écris un message avec ton autre adresse e-mail :
  il apparaît dans le tableau de bord, et un e-mail « Stalak : nouveau message » arrive sur contact@stalak.app.

### Comment marche « Parler à un humain » (Stalak Pro)
- Réservé à **Stalak Pro** (décision du 27/10). Sans Pro, déconnecté ou gratuit, le bouton du glaçon affiche
  « Réservé à Stalak Pro », un bouton vers la page Pro (`acctOpen('support')`) et l'adresse contact@stalak.app.
  Le serveur l'impose : créer une conversation ou y écrire demande une session d'un compte Creator Plus (offre du 30/10 au soir) (`401` / `403 pro_required`),
  et écrire demande que la conversation soit celle de ce compte (`404` sinon).
- Un ex-Pro ne peut plus écrire, mais garde les réponses déjà reçues (lecture par le jeton de la conversation, sur son appareil).
- Les réponses par e-mail vont à l'adresse du compte, annoncées « sous 24 h ». Badge « Pro » / « ex-Pro » / « invité » sur
  chaque conversation du tableau de bord.
- Interrupteur **Je suis disponible** allumé **et** tableau de bord ouvert (moins de 3 minutes) : le glaçon propose le direct
  et tu réponds en direct.
- Sinon : la réponse partira par e-mail « sous 24 h », et tu reçois un e-mail pour chaque nouvelle conversation
  (au plus un par conversation toutes les 15 minutes, 50 par jour).
- Ta réponse part par e-mail si le visiteur n'est plus sur la page (sa page ne l'a pas récupérée en 20 s), avec
  `contact@stalak.app` en adresse de réponse. Le menu « Par e-mail » : *si absent* (par défaut), *toujours*, *jamais*.
- La conversation reste sur l'appareil du visiteur 30 jours : il retrouve tes réponses en rouvrant le glaçon.
- Effacement : 6 mois après le dernier message, avec le compte, ou avec le bouton **Supprimer** du tableau de bord.
- Limites : 5 nouvelles conversations par heure et 20 par jour par connexion, 200 par jour pour le site ; messages de 2 000 caractères.

### Les visites
Chaque page ouverte envoie un signe de vie par minute (un nombre au hasard, sans cookie ni IP). « En direct » = vu dans les
2 dernières minutes. Une page rechargée compte comme une nouvelle visite. Coût : 1 écriture D1 et 1 requête par minute et par
page ouverte (offre gratuite : 100 000 de chaque par jour, soit environ 1 600 heures de visite par jour).
L'audience détaillée (pays, appareils) reste dans **Web Analytics**.

---

## 14. Les formules : Gratuit + Stalak Pro + Stalak Creator Plus (offre du 30/10/2026 au soir)

Ce que débloque chaque formule est dans **un seul tableau** : `functions/_lib/entitlements.js` (`FEATURES` : fonction → plus
petite formule ; `LIMITS` : chiffres par formule). La page le reçoit avec `/api/me` (`entitlements.features`) et demande
`acctHas('clip')`… ; le serveur demande `requirePlan(env, user, 'cloud')`.

| Formule | Prix (dollars, Paddle convertit et ajoute la TVA) | Ce qu'elle ajoute |
|---|---|---|
| Gratuit | 0, sans compte obligatoire | montage illimité, paroles en phrases entières taille M, 3 filtres ; filigrane (ajouté par l'app) qu'une pub récompensée enlève pour une vidéo |
| Pro | 7,99 $/mois ou 49,99 $/an | `nowm` (ni pub ni filigrane), `clip`, `fx` (effets premium), `text` (mot par mot, karaoké, toutes les tailles), `filters`, `lyrics` (20 par jour) |
| Creator Plus | 14,99 $/mois ou 99,99 $/an | `pack5` / `pack10` / `pack30` (générateur de packs), `cloud` (100 Go), `human`, paroles auto 60 par jour |

La vidéo gratuite du jour, l'e-mail de rappel et la fin de 3 s sont abandonnés. Les anciens prix restent reconnus pour leurs
abonnés (ils gardent leur prix) : Pro en euros (9,99 € / 79 € et 10,99 € / 109 €) et Basic → `pro`, Max → `creator`
(`PADDLE_PRICE_MONTH` / `PADDLE_PRICE_YEAR` et `PADDLE_PRICES_OLD` dans `wrangler.toml`). Seuls les 4 nouveaux prix se vendent.

### 14.1 La base (avant de publier)
Dans la **Console** de la base D1 `stalak`, colle **tout** `migrations/0008_plans.sql` et clique sur **Execute** (une fois).
Elle ajoute 3 colonnes vides à `subscriptions` : rien d'existant ne change.

### 14.2 Paddle
Les 4 prix sandbox (créés le 30/10 par le Chef de projet) sont dans `wrangler.toml` : `PADDLE_PRICE_PRO_MONTH`, `…_PRO_YEAR`,
`PADDLE_PRICE_CREATOR_MONTH`, `…_CREATOR_YEAR`. En réel : les remplacer. Une formule sans prix affiche « Bientôt ».
Facultatif : dans chaque prix, « Custom data » `{"plan": "pro"}` ou `{"plan": "creator"}` (le serveur s'en sert si un prix
manque dans `wrangler.toml`).

Changement de formule, sur le même abonnement (règles des conditions de vente) :
- vers Creator Plus (ou de mensuel à annuel) : tout de suite, au prorata ; le montant est montré avant de confirmer ;
- vers Pro : au prochain renouvellement, rien n'est remboursé ; Creator Plus reste jusque-là ;
- d'annuel à mensuel : refusé, la page explique d'arrêter le renouvellement puis de reprendre une formule à la fin (Paddle ne
  sait pas programmer ce changement).
Un remboursement de changement de formule (14 jours) se fait à la main : rembourser dans Paddle, puis remettre l'ancienne formule.

### 14.3 Vérifier
- `https://stalak.app/api/config` : `paddle.prices.pro.month`… remplis, `plans.pro.month.amount` = `7.99` (USD).
- Un achat Pro sandbox : le compte passe en Pro ; « Passer à Creator Plus » (montant affiché) ; tableau de bord : « Par formule ».

---

## Pour le développeur

### Routes (`/api/…`)
Toutes les réponses sont en JSON. Les erreurs ont la forme `{"error":"code","message":"…"}`. Une fonction réservée à une formule répond `403 pro_required` avec `need` (`pro` ou `creator`) et `plan` (la formule du compte).

| Méthode et chemin | Rôle |
|---|---|
| `GET /api/config` | Réglages publics : `paddle.environment`, `paddle.clientToken`, `paddle.prices.month` et `.year` ; `auth.providers` = les services de connexion configurés (`google`, `microsoft`, `apple`). |
| `GET /api/me` | `{user, session, entitlements, subscription}`. `user` = `{id, email, lang, createdAt, displayName, avatarUrl, hasPassword, passwordSetAt, emailVerified, providers}` ; `session` = `{method, recentCode}` (`method` : `signup`, `password`, `password+code`, `reset`, `oauth:google`…, ou `code` pour une session d'avant la v3) ; `entitlements` = `{plan: 'free'|'pro'|'creator', features: [...], limits: {lyricsPerDay, lyricsMinutesPerDay, cloudBytes}, outro, cloudSave, clipMode, autoLyrics, packs}` (étape 14). |
| `PATCH /api/me` | `{displayName}` : 2 à 30 caractères (espaces regroupés, caractères invisibles retirés), `null` ou `""` pour l'effacer. Renvoie la même chose que `/api/me`. Erreur `invalid_name`. |
| `PUT /api/me/avatar` | Corps = l'image brute, `Content-Type: image/jpeg`, `image/webp` ou `image/png` (vérifié avec les premiers octets du fichier), 80 Ko maximum, 20 changements par heure. Renvoie `{avatarUrl}`. Erreurs `invalid_image` (415), `too_large` (413). |
| `GET /api/me/avatar?v=…` | La photo, **seulement pour la personne connectée** (sinon 401 / 404). `Cache-Control: private, max-age=31536000, immutable` : l'adresse change à chaque nouvelle photo (`v` = date de mise à jour). |
| `DELETE /api/me/avatar` | Retire la photo. |
| `POST /api/auth/signup` | `{email, password, displayName?, lang}`. Vérifie le mot de passe (8 à 200 caractères, pas parmi les plus courants, différent de l'e-mail) et le pseudo, puis envoie un code. Renvoie `{ok, needCode: true, expiresIn, resent}`. Rien n'est créé avant le code. `409 email_taken` si l'adresse a déjà un compte. Limite : 20 demandes par heure et par IP. |
| `POST /api/auth/signup/verify` | `{email, code}`. Crée le compte (e-mail vérifié), pose les cookies `stalak_s` et `stalak_d`, renvoie la même chose que `/api/me`. |
| `POST /api/auth/login` | `{email, password}`. Navigateur reconnu : pose le cookie et renvoie la même chose que `/api/me`. Navigateur inconnu : envoie un code et renvoie `{needCode: true, expiresIn}`, sans session. Réponse unique `401 invalid_login` (« Wrong email or password. ») que l'e-mail existe ou non, ait un mot de passe ou non. Limites : 30 essais par IP et 10 par e-mail toutes les 10 min ; après 5 mauvais mots de passe d'affilée pour un e-mail, `429 too_many_attempts` pendant 15 min (même pour un e-mail inconnu). |
| `POST /api/auth/login/verify` | `{email, code}`. Le code n'existe que si le mot de passe était juste. Pose `stalak_s` et `stalak_d` (navigateur reconnu 90 jours), renvoie la même chose que `/api/me`. |
| `POST /api/auth/forgot` | `{email, lang}`. Envoie un code si le compte existe ; la réponse `{ok, needCode, expiresIn}` est **la même** dans tous les cas. |
| `POST /api/auth/reset` | `{email, code}` : vérifie le code sans le consommer (`{ok, codeOk: true}`), pour passer à l'écran suivant. `{email, code, password}` : enregistre le nouveau mot de passe, ferme toutes les autres sessions, oublie les autres navigateurs, connecte et renvoie la même chose que `/api/me`. |
| `GET /api/auth/oauth/{google,microsoft,apple}/start?return=/en/&to=account\|pro[&popup=1]` | Redirige vers le service (OpenID Connect : `state`, `nonce`, PKCE S256 sauf Apple). Pose un cookie de liaison `stalak_o` (10 min, `SameSite=None` car Apple revient par un POST d'un autre site). Service non configuré : retour au site avec `#auth-err-not_enabled`. |
| `GET\|POST /api/auth/oauth/{provider}/callback` | Vérifie `state` (une seule fois, 10 min) et le cookie `stalak_o`, échange le code contre l'`id_token`, vérifie sa signature avec les clés publiées du service (RS256 ; Apple : ES256 ou RS256), `iss`, `aud` (et `azp`), `exp`, `iat`, `nonce`. Relie au compte qui a le même e-mail vérifié, ou crée le compte. Pose `stalak_s` et `stalak_d`, puis renvoie sur la page de départ avec `#auth-ok-account` / `#auth-ok-pro`, ou `#auth-err-<code>` (`cancelled`, `state_mismatch`, `oauth_failed`, `oauth_email_unverified`, `oauth_no_email`, `not_enabled`). Avec `popup=1` : une petite page qui prévient l'onglet de Stalak et se ferme. |
| `POST /api/auth/password` | `{password, currentPassword?}` (connecté). Choisir ou changer le mot de passe : mêmes règles qu'à l'inscription. Changer un mot de passe existant demande `currentPassword`, **sauf** si la session vient de « mot de passe oublié » il y a moins de 15 min. Un compte sans mot de passe (Google, Apple, Microsoft, ou créé avec un code avant la v3) en choisit un sans `currentPassword`. Les autres sessions sont fermées et les autres navigateurs devront retaper un code. Erreurs `password_too_short`, `password_too_common`, `password_too_long`, `reauth_required` (403), `wrong_password`, `too_many_attempts`. |
| `POST /api/auth/send-code`, `POST /api/auth/verify` | Connexion par code seul de la v2 : **supprimée**, répond `410 gone`. |
| `POST /api/auth/logout` | Supprime la session. |
| `POST /api/paddle/webhook` | Pour Paddle uniquement (signature vérifiée). |
| `POST /api/paddle/portal` | `{url, cancelUrl, updatePaymentUrl}` : liens temporaires vers l'espace client Paddle. |
| `POST /api/paddle/change` | `{plan: 'pro'|'creator', interval: 'month'|'year', preview?}` : un abonné change de formule sur le **même** abonnement. Plus grande : tout de suite au prorata ; plus petite : au renouvellement (formule payée gardée). `preview: true` : `{kind, amount (centimes), currency, effectiveAt}` sans rien changer. `404 no_subscription`, `409 same_plan` / `subscription_ending` / `not_configured` / `change_at_renewal`. 30 par heure (aperçus compris). La formule change au webhook. |
| `GET /api/projects` | `{projects: [{id, name, size, mediaBytes, createdAt, updatedAt, openedAt, coverUrl}], storage: {available, used, quota, partSize, maxFile}}` (sans le contenu). `available` = le bucket R2 est relié. |
| `GET /api/projects/:id` | `{id, name, state, updatedAt, mediaBytes, files: [{id, name, type, size}]}`. Compte comme une ouverture (règle des 6 mois). |
| `PUT /api/projects/:id` | `{name, state, files?}`, 256 Ko maximum, 200 projets maximum. **Creator Plus** : sinon `403 pro_required` (avec `need`). `files` = les ids des fichiers de cette version : tous doivent être envoyés (`409 files_missing`, avec `missing`) ; les autres fichiers du projet sont effacés. Sans `files`, les fichiers ne changent pas. |
| `PATCH /api/projects/:id` | `{name}` : renomme. |
| `PUT /api/projects/:id/cover` | Couverture de la Galerie : corps brut `image/jpeg` ou `image/webp`, 64 Ko au plus (`413 too_large`), vérifiée par ses premiers octets (`415 invalid_image`), 120 par heure. Répond `{coverAt, coverUrl}`. |
| `GET /api/projects/:id/cover?v=` | L'image, **pour son propriétaire seulement** ; `?v=` change à chaque nouvelle couverture (`Cache-Control: private, immutable`, `nosniff`, `CSP sandbox`). `404` s'il n'y en a pas. |
| `DELETE /api/projects/:id` | Supprime un projet et ses fichiers R2. |
| `POST /api/projects/:id/files` | `{fileId, name, type, size}` (**Pro**, R2). Réserve la place dans l'espace de 20 Go (`413 quota_exceeded` avec `used`, `quota`, `needed`). `type` : `audio/*` ou `video/*` (`415 invalid_media_type`), 4 Go au plus (`413 file_too_large`). Répond `{status: 'ready'}` si le fichier est déjà là, sinon `{status: 'uploading', multipart, partSize, parts, uploadedParts}`. |
| `PUT /api/projects/:id/files/:fileId` | Corps brut (`Content-Type: application/octet-stream`, `Content-Length` = la taille annoncée) : un fichier de 8 Mo au plus, d'un coup. |
| `PUT /api/projects/:id/files/:fileId/parts/:n` | Corps brut : le morceau `n` (1, 2, …) d'un gros fichier ; tous font 8 Mo sauf le dernier. |
| `POST /api/projects/:id/files/:fileId/complete` | Termine un envoi en morceaux (`409 parts_missing` avec `missing`). |
| `GET /api/projects/:id/files/:fileId` | Le fichier, lu depuis R2, **pour son propriétaire seulement** ; accepte `Range` (réponse `206`, `416` hors limites). `Cache-Control: private, no-store`, `nosniff`, `Content-Security-Policy: sandbox`, `Content-Disposition: attachment`. |
| `DELETE /api/projects/:id/files/:fileId` | Abandonne un envoi ou efface un fichier. |
| `POST /api/help/chat` | `{lang: 'fr'\|'en', messages: [{role: 'user'\|'assistant', content}], context}` (sans compte). 10 derniers tours, 6 000 caractères au plus, le dernier de l'utilisateur ; `context` (4 000 caractères) = ce que montre la page. Renvoie `{answer}` (texte simple). Erreurs `invalid_messages`, `rate_limited` (429, `retryAfter`), `help_busy` (503, budget du jour épuisé), `ai_unavailable` (503), `help_failed` (503 : un 502 serait remplacé par la page d'erreur de Cloudflare ; la réponse vide est redemandée une fois avant). |
| `POST /api/presence` | `{vid, lang}` : la page est ouverte (signe de vie, 1 par minute). `vid` = 16 à 40 lettres ou chiffres tirés au hasard par la page. 60 nouvelles visites par heure et par connexion (`429` au-delà). |
| `GET /api/support/status` | `{available}` : l'équipe propose le direct (interrupteur allumé et tableau de bord ouvert depuis moins de 3 min). |
| `POST /api/support/tickets` | **Stalak Creator Plus.** `{lang, message, email?, context?}` ; réponses à l'e-mail du compte (ou `email`). Renvoie `{id, token, available, email, messages}`. Erreurs `not_logged_in` (401), `pro_required` (403), `invalid_email`, `invalid_message`, `rate_limited`, `support_busy` (503). |
| `GET /api/support/tickets/:id?after=<id>` | En-tête `X-Ticket-Token`. `{status, available, email, messages: [{id, from: 'user'\|'admin', text, at, emailed}]}`. Mauvais jeton = `404`. |
| `POST /api/support/tickets/:id/messages` | **Stalak Creator Plus**, conversation de ce compte. En-tête `X-Ticket-Token`, `{text, email?, after?}`. Rouvre une conversation fermée. Erreurs `401`, `403 pro_required`, `404` (pas sa conversation). |
| `GET\|POST\|DELETE /api/admin/*` | Tableau de bord (hôte `ADMIN_HOST` + jeton Cloudflare Access ; écritures : JSON + `Origin` du tableau de bord) : `me`, `stats?days=7..120`, `live`, `available`, `tickets[?status=open\|closed\|all]`, `tickets/:id` (GET, DELETE), `tickets/:id/messages` (`{text, email: 'auto'\|'yes'\|'no'}`), `tickets/:id/status`. Ailleurs : `404`. |
| `POST /api/cron/cloud-cleanup` | Règle des 6 mois, pour un cron externe : `Authorization: Bearer <CRON_SECRET>` (sinon `404`). |
| `DELETE /api/account` | `{confirm:true}`. Arrête l'abonnement Paddle, puis efface toutes les données (dont le pseudo, la photo et le mot de passe, qui sont dans la ligne `users`). |
| `GET /api/connect` | Comptes TikTok / Instagram reliés : `{providers, accounts: [{provider, username, displayName, avatarUrl, accountType, status, connectedAt}]}` (jamais les jetons). Tout `/api/connect…` répond `404 not_enabled` tant que `SOCIAL_CONNECT_ENABLED` ne vaut pas `"1"`. |
| `GET /api/connect/{tiktok,instagram}/start?return=/en/&popup=1` | Navigation : `302` vers TikTok / Instagram (state, cookie `stalak_c`). Retour sur l'app : `#social-ok-<réseau>` ou `#social-err-<code>` (`not_signed_in`, `not_enabled`, `state_mismatch`, `cancelled`, `missing_permission`, `connect_failed`). Avec `popup=1`, petite page qui prévient l'app (`BroadcastChannel('stalak-social')`) et se ferme. |
| `GET /api/connect/{tiktok,instagram}/callback` | Retour de TikTok / Instagram : jetons échangés côté serveur et rangés **chiffrés** (table `social_accounts`, clé `SOCIAL_TOKEN_KEY`). |
| `DELETE /api/connect/{tiktok,instagram}` | Délie le compte (TikTok : jeton révoqué aussi). |
| `POST /api/connect/instagram/{deauthorize,data-deletion}` | Appels de Meta, signés (`signed_request`, secret `INSTAGRAM_APP_SECRET`) : efface le compte Instagram relié. `GET /api/connect/instagram/deletion?code=` : page de suivi demandée par Meta. |

Sans le bucket R2 (`MEDIA`), les routes de fichiers répondent `503 cloud_unavailable` ; le reste marche (dont l'ancien `PUT` sans `files`).

Codes d'erreur : `not_logged_in` (401), `pro_required` (403), `cloud_unavailable` (503), `quota_exceeded` (413), `file_too_large` (413), `invalid_media_type` (415), `files_missing` (409), `parts_missing` (409), `size_mismatch`, `length_required` (411), `bad_origin` (403), `json_required` (415), `rate_limited` (429, avec `retryAfter`),
`invalid_code` (avec `attemptsLeft`), `code_expired`, `too_many_attempts`, `email_taken` (409), `invalid_login` (401), `invalid_email`, `invalid_name`,
`invalid_signature`, `too_large` (413), `not_found`, `method_not_allowed`, `gone` (410), `invalid_messages`, `help_busy` (503), `help_failed` (503).

Les codes par e-mail (table `auth_codes`) : un par e-mail et par usage (`signup`, `login`, `reset`), hachés avec l'usage, valables 10 min, 5 essais.
Redemandé moins de 30 s après, le même code est gardé et aucun nouvel e-mail ne part. Limites : 5 codes par heure pour un e-mail, 20 par heure pour une IP.
Navigateurs reconnus (table `trusted_devices`) : le cookie `stalak_d` (HttpOnly, Secure, SameSite=Lax, `Path=/api/auth`, 90 jours) contient un jeton
aléatoire par navigateur ; seul son SHA-256 est en base, une ligne par compte. Comptes Google / Apple / Microsoft : table `identities` (`provider`, `subject` unique).

Protection CSRF : sur POST, PUT, PATCH et DELETE, le serveur exige `Content-Type: application/json` (ou une image pour `PUT /api/me/avatar`) et un en-tête `Origin` égal à `APP_ORIGIN` (`https://stalak.app`).
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
- Mots de passe : PBKDF2-SHA256 (WebCrypto), 100 000 itérations (le maximum accepté par Cloudflare Workers), sel aléatoire de 16 octets, comparaison en temps constant.
  Le nombre d'itérations est enregistré avec chaque hash (`password_iter`) : on pourra l'augmenter plus tard sans casser les anciens.
  Un essai de connexion calcule toujours un PBKDF2, même si le compte n'existe pas, pour que la durée de la réponse ne trahisse rien.
  Le compteur d'échecs est dans `rate_limits` (clé `pwfail:` + e-mail haché).
- La photo est stockée en base64 dans `users.avatar` (80 Ko maximum, en pratique moins de 60 Ko). Pas de R2 nécessaire.
- `sessions.method` retient si la session vient d'un code ou d'un mot de passe (les sessions d'avant la migration ont `NULL`).

### Intégrer `src/account.js` au site
`build_site.py` ne le connaît pas encore. Il faut soit l'insérer dans le `<script>` de la page, soit le copier dans `public/account.js` et ajouter
`<script src="/account.js" defer></script>`. Ensuite, côté application :

```js
StalakAccount.onChange(s => { /* s.entitlements.outro, s.entitlements.clipMode… */ });
StalakAccount.me();
await StalakAccount.signup(email, password);  // puis signupVerify(email, code)
const r = await StalakAccount.login(email, password); // r.needCode : loginVerify(email, code)
await StalakAccount.forgot(email);            // puis resetCheck(email, code), reset(email, code, nouveauMotDePasse)
location.href = StalakAccount.oauthUrl('google', 'account');
StalakAccount.checkout('month');              // ou 'year' : ouvre la fenêtre Paddle
const { url } = await StalakAccount.portal(); // gérer / résilier
```

Le module charge Paddle.js (`https://cdn.paddle.com/paddle/v2/paddle.js`) seulement au moment du paiement.
Si une politique CSP est ajoutée un jour, il faudra autoriser `cdn.paddle.com` et les domaines de paiement de Paddle.

### Tests
```
node tests/backend/run.mjs
```
Il faut Node 22.5 ou plus récent, sans aucune installation. Les tests utilisent la base SQLite intégrée à Node à la place de D1, un faux bucket R2
en mémoire (`tests/backend/fake-r2.mjs` : envoi en morceaux compris), et simulent Resend, Paddle
et Google / Apple / Microsoft (clés RSA et EC créées pour le test, `id_token` signés, client secret Apple vérifié).

Tests de l'interface de la sauvegarde en ligne (Python + Playwright) : voir l'en-tête de `tests/ui/test_cloud.py`
(un petit serveur Node, `tests/ui/cloud-server.mjs`, sert le site construit et les vraies Functions sur SQLite + faux R2).

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
- R2 depuis un Worker (`get` avec `range`, `put`, `delete` de 1000 clés au plus, `list`, `createMultipartUpload` / `resumeMultipartUpload`, `uploadPart`, `complete`, `abort`) : <https://developers.cloudflare.com/r2/api/workers/workers-api-reference/>, <https://developers.cloudflare.com/r2/api/workers/workers-multipart-usage/>
- Limites de l'envoi en morceaux (5 Mio minimum sauf le dernier, morceaux de même taille, 10 000 au plus, envois inachevés abandonnés après 7 jours) : <https://developers.cloudflare.com/r2/objects/multipart-objects/>
- Taille maximale d'une requête (100 Mo en offre Free et Pro) : <https://developers.cloudflare.com/workers/platform/limits/>
- Limites D1 (2 Mo par ligne, 100 paramètres, 1000 requêtes par appel en offre payante, 50 en Free) : <https://developers.cloudflare.com/d1/platform/limits/>
- Liaison R2 d'un projet Pages (`context.env.<BINDING>`) : <https://developers.cloudflare.com/pages/functions/bindings/>
- Configuration `wrangler.toml` pour Pages (`pages_build_output_dir`, D1) : <https://developers.cloudflare.com/pages/functions/wrangler-configuration/>
- Modèle de texte Workers AI `@cf/google/gemma-4-26b-a4b-it` (`messages` avec les rôles system / user / assistant, `max_completion_tokens`, sortie `choices[]`) : <https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/> ; prix (9 091 neurons par million de jetons en entrée, 27 273 en sortie) : <https://developers.cloudflare.com/workers-ai/platform/pricing/>
- Vérifier le jeton de Cloudflare Access (`Cf-Access-Jwt-Assertion`, RS256, `iss` = adresse d'équipe, `aud` = AUD Tag, clés sur `/cdn-cgi/access/certs`) : <https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/>
- Création de l'organisation Zero Trust (offre Free, moyen de paiement demandé sans prélèvement) : <https://developers.cloudflare.com/learning-paths/zero-trust-web-access/initial-setup/create-zero-trust-org/>
- Paiements Paddle (`transaction.completed`, montants en centimes dans `details.totals`) : <https://developer.paddle.com/webhooks/transactions/transaction-completed> ; remboursements (`adjustment.created` / `adjustment.updated`) : <https://developer.paddle.com/webhooks/adjustments/adjustment-updated>
- Envoi d'e-mail avec Resend : <https://resend.com/docs/api-reference/emails/send-email>
- OpenID Connect chez Google (points d'accès, `id_token`, `email_verified`) : <https://developers.google.com/identity/openid-connect/openid-connect>
- Microsoft identity platform, OIDC et validation des jetons multi-locataires (`iss` avec `{tid}`, revendication `xms_edov`) : <https://learn.microsoft.com/entra/identity-platform/v2-protocols-oidc>, <https://learn.microsoft.com/entra/identity-platform/optional-claims-reference>
- Sign in with Apple, REST API (paramètres de `/auth/token`, sans `code_verifier`) et secret client ES256 : <https://developer.apple.com/documentation/signinwithapplerestapi/generate-and-validate-tokens>, <https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret>
