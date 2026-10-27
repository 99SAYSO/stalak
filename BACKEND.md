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
| Avantages Pro | Pas d'outro Stalak à la fin des exports, mode Clip (16:9, chanson entière), packs de vidéos (5, 10 ou 30 vidéos différentes d'un coup), sauvegarde des projets en ligne et transcription automatique des paroles (à venir). |
| Gérer / résilier | Un lien vers l'espace client Paddle. |
| Supprimer son compte | Le compte et toutes ses données sont effacés, et l'abonnement en cours est arrêté. Les boutiques d'apps, Meta et TikTok l'exigent. |
| Publication TikTok / Instagram | Seulement préparée, **désactivée**. Rien à faire pour l'instant. |

Fichiers ajoutés :

- `functions/` contient le code serveur (Cloudflare Pages Functions). Il est placé **à la racine du dépôt** et non dans `public/`, comme Cloudflare le demande : « Make sure that the `/functions` directory is at the root of your Pages project (and not in the static root) » ([doc Cloudflare](https://developers.cloudflare.com/pages/functions/get-started/)).
- `migrations/0001_init.sql` crée les tables de la base de données ; `0002_…` et `0003_…` les complètent.
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

## Pour le développeur

### Routes (`/api/…`)
Toutes les réponses sont en JSON. Les erreurs ont la forme `{"error":"code","message":"…"}`.

| Méthode et chemin | Rôle |
|---|---|
| `GET /api/config` | Réglages publics : `paddle.environment`, `paddle.clientToken`, `paddle.prices.month` et `.year` ; `auth.providers` = les services de connexion configurés (`google`, `microsoft`, `apple`). |
| `GET /api/me` | `{user, session, entitlements, subscription}`. `user` = `{id, email, lang, createdAt, displayName, avatarUrl, hasPassword, passwordSetAt, emailVerified, providers}` ; `session` = `{method, recentCode}` (`method` : `signup`, `password`, `password+code`, `reset`, `oauth:google`…, ou `code` pour une session d'avant la v3) ; `entitlements` = `{plan, outro, cloudSave, clipMode, autoLyrics, packs}`. |
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
| `GET /api/projects` | Liste des projets (sans leur contenu). |
| `GET /api/projects/:id` | `{id, name, state, updatedAt}`. |
| `PUT /api/projects/:id` | `{name, state}`, 256 Ko maximum, 200 projets maximum. **Pro uniquement** : sinon `403 pro_required`. |
| `DELETE /api/projects/:id` | Supprime un projet. |
| `DELETE /api/account` | `{confirm:true}`. Arrête l'abonnement Paddle, puis efface toutes les données (dont le pseudo, la photo et le mot de passe, qui sont dans la ligne `users`). |
| `GET /api/connect/{tiktok,instagram}/{start,callback}` | Ébauches : `404 not_enabled` tant que `SOCIAL_CONNECT_ENABLED` ne vaut pas `"1"`, puis `501`. |

Codes d'erreur : `not_logged_in` (401), `pro_required` (403), `bad_origin` (403), `json_required` (415), `rate_limited` (429, avec `retryAfter`),
`invalid_code` (avec `attemptsLeft`), `code_expired`, `too_many_attempts`, `email_taken` (409), `invalid_login` (401), `invalid_email`, `invalid_name`,
`invalid_signature`, `too_large` (413), `not_found`, `method_not_allowed`, `gone` (410).

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
Il faut Node 22.5 ou plus récent, sans aucune installation. Les tests utilisent la base SQLite intégrée à Node à la place de D1, et simulent Resend, Paddle
et Google / Apple / Microsoft (clés RSA et EC créées pour le test, `id_token` signés, client secret Apple vérifié).

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
- OpenID Connect chez Google (points d'accès, `id_token`, `email_verified`) : <https://developers.google.com/identity/openid-connect/openid-connect>
- Microsoft identity platform, OIDC et validation des jetons multi-locataires (`iss` avec `{tid}`, revendication `xms_edov`) : <https://learn.microsoft.com/entra/identity-platform/v2-protocols-oidc>, <https://learn.microsoft.com/entra/identity-platform/optional-claims-reference>
- Sign in with Apple, REST API (paramètres de `/auth/token`, sans `code_verifier`) et secret client ES256 : <https://developer.apple.com/documentation/signinwithapplerestapi/generate-and-validate-tokens>, <https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret>
