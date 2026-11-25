# Compte rendu — compte/test-acquisition
**Statut : PRÊT.** **Migration 0024** (`migrations/0024_paid_test.sql`) à lancer avant la mise en ligne.
Demande : `docs/handoff/chef-test-acquisition-payante.md` (partie Comptes).
Cette branche part de `main` : elle ne contient pas `compte/sources-paiements`. Si les deux sont fusionnées, il y aura de petits conflits sur `docs/STATUS.md`, `BACKEND.md` et `admin-page.js` (ajouts côte à côte : garder les deux).

## 1. Le suivi TikTok — ce qui part vers TikTok, et seulement après « Accepter »
**Dans le navigateur, avec le pixel TikTok** (`src/consent.js`) :
- il n'est chargé qu'après « Accepter », et seulement si `TIKTOK_PIXEL_ID` est réglé ;
- le bandeau dit alors « (Microsoft Clarity, Google Analytics, **pixel TikTok**) ».

| Étape Stalak | Évènement TikTok |
|---|---|
| visite | `page` (PageView) |
| export réussi | `Download` (évènement standard, utilisable pour une campagne « Ventes » : la campagne peut s'optimiser dessus si les paiements sont trop rares) |
| ouverture du paiement | `InitiateCheckout` |
| paiement | `Purchase` avec le montant et la devise, et l'`event_id` = numéro de transaction Paddle. C'est le même que côté serveur, donc **TikTok ne le compte qu'une fois** |
| essai gratuit (0 aujourd'hui) | `StartTrial` (pas `Purchase`) |

- **« Refuser » après « Accepter » :** le consentement est retiré à TikTok (`revokeConsent`), ses cookies (`_ttp`, `_tt_enable_cookie`, `ttcsid…`) sont effacés, et plus rien ne part.
- **Côté serveur** (API de conversion, `functions/_lib/conversions.js`, déjà prête) :
  - le paiement est envoyé avec le nom actuel **`Purchase`** (avant : `CompletePayment`), avec le même `event_id` que le navigateur ;
  - toujours seulement avec le consentement (`customData.mc = 1`), l'e-mail haché, jamais en clair ;
  - `/api/config` donne maintenant l'identifiant du pixel (public) au lieu de « oui / non ». Jamais le secret.

## 2. Le pas-à-pas pour le propriétaire (à lui transmettre)
**A. Créer le pixel** (TikTok Ads Manager, ads.tiktok.com) :
1. En haut : **Outils** → **Évènements** (« Events Manager »).
2. **Connecter une source de données** → **Web** → donne le site `stalak.app`.
3. Choisis **« Configurer manuellement »** puis **« Pixel TikTok + API Évènements »**. Nom du pixel : `Stalak site`.
4. L'**identifiant du pixel** s'affiche en haut de la page du pixel : une suite de lettres majuscules et de chiffres, souvent 20, qui commence en général par « C ». **Ce n'est pas un secret** : envoie-le au Chef de projet, qui le met dans `wrangler.toml` (`TIKTOK_PIXEL_ID`).
5. **Ne colle pas** le « code de base » que TikTok propose : Stalak le charge déjà lui-même, après « Accepter ».

**B. Créer le jeton de l'API Évènements (secret) :**
1. Toujours sur la page du pixel : onglet **Paramètres** → **API Évènements** → **Générer un jeton d'accès**.
2. Copie le jeton. **C'est un secret** : ne l'envoie à personne, ne le colle dans aucune conversation.
3. **Cloudflare** (dash.cloudflare.com) → **Workers et Pages** → **stalak-site** → **Paramètres** → **Variables et secrets** → **Ajouter** :
   - Type : **Secret** ;
   - Nom : `TIKTOK_EVENTS_TOKEN` ;
   - Valeur : le jeton ;
   - puis **Enregistrer**.
4. Le secret sert au **prochain déploiement**. Dis au Chef de projet de remettre le site en ligne, ou attends la prochaine fusion.

**C. Vérifier avant de payer :**
1. Sur la page du pixel : onglet **Tester les évènements**. Copie le **code de test** (« TEST12345 » par exemple).
2. Dans Cloudflare, ajoute la variable `TIKTOK_TEST_EVENT_CODE` avec ce code. Ce n'est pas un secret. Elle est facultative et sert seulement à vérifier.
3. Ouvre `https://stalak.app/?ref=ttads` sur ton iPhone et touche « Accepter ». Exporte une vidéo, ouvre le paiement.
4. Dans « Tester les évènements », tu dois voir **PageView, Download, InitiateCheckout**.
5. Retire ensuite `TIKTOK_TEST_EVENT_CODE` (sinon le paiement côté serveur reste en « test »).

**D. Dans la campagne :**
- objectif **Ventes** (« Website conversions »), évènement **Download** pour démarrer, puis **Purchase** s'il y a assez de paiements ;
- lien : `https://stalak.app/?ref=ttads`.

## 3. Carte « 💸 Test payant » (tableau de bord → Du visiteur à l'abonné)
- **Pour chaque lien suivi** (`ttads`, puis un lien par influenceur), depuis son jour de début : visites, exports, paiements ouverts, essais gratuits, **abonnés payants**, argent reçu, **argent dépensé** (tapé à la main), **coût par export**, **coût par abonné**.
- **En haut :** « Dépensé : X € sur 150 € (budget du test) », en rouge et avec ⚠️ si on dépasse.
- **Le formulaire de la carte :**
  - ajouter un lien (code, nom, dépensé en tout, date de début), le modifier ou le retirer (2 touches : « Retirer » puis « Sûr ? ») ;
  - les règles de décision du 25/11 sont dans le « ? ».
- **Codes des influenceurs :** `src/app.js` transforme un `?ref=` qui ressemble à une plateforme (« igor » → Instagram, « ytbeats » → YouTube). Un tel code ne serait jamais compté comme lien, donc **la carte le refuse et propose `inf-<nom>`**. **Conseil à Marketing : donner à chaque influenceur un lien `?ref=inf-<nom>`.**
- **Routes :** `GET /api/admin/paid-tests` et `POST /api/admin/paid-tests` (`{ref, label, spent, startedOn}` ou `{ref, remove: true}`), module `functions/_lib/paidtest.js`.

## 4. `?ref=` survit à l'inscription et au paiement
- **Inscription :** déjà le cas. La 1re visite avec `?ref=ttads` est gardée dans le navigateur (`stalak:src`) et enregistrée sur le compte à l'inscription (`users.signup_source = 'ref:ttads'`).
- **Paiement (nouveau) :** la page envoie aussi cette source à Paddle (`customData.src`). Le serveur la garde sur le paiement (`payments.source`, migration 0024), et les renouvellements la reprennent.
  - Un paiement sans source est compté pour le lien d'inscription de son compte.
  - Une source qui n'a pas la bonne forme est ignorée.
- Rien ne relie une personne à une pub au tableau de bord : seulement des totaux par lien.

## Tests
- `node tests/backend/run.mjs` : **138/138**, dont 1 nouveau :
  - liens ajoutés, refusés, retirés ;
  - visites, exports et paiements par lien, source du paiement gardée ou ignorée ;
  - essai gratuit à part, coût par export et par abonné, budget dépassé ;
  - `Purchase` côté serveur, identifiant du pixel dans `/api/config`.
- `tests/ui/mesure_ui.py` : **132/132**, dont 18 nouvelles vérifications du pixel (iPhone en anglais, ordinateur en français) :
  - rien avant le choix, le bandeau le nomme, chargé avec son identifiant ;
  - visite, Download, InitiateCheckout ;
  - Purchase à 7,99 USD avec le même `event_id` que le serveur, StartTrial pour un essai ;
  - « Refuser » ensuite : consentement retiré, cookies effacés, plus rien envoyé ;
  - aucune erreur.
- `tests/ui/audit611_ui.py` (scripts après le premier affichage) : **93/93**.
- Démo `/admin-demo/` : carte « Test payant » sur ordinateur et téléphone, sans défilement de côté, sans erreur.

## Juridique
- La page de confidentialité (FR/EN) doit citer le **pixel TikTok** : il dépose des cookies `_ttp` et `_tt_enable_cookie` après « Accepter », sert à mesurer nos publicités, et les données vont à TikTok.
- Rappeler aux influenceurs la mention de partenariat obligatoire (#ad, « collaboration commerciale »).

## Ce qui reste
- **Propriétaire :** créer le pixel et taper `TIKTOK_EVENTS_TOKEN` (pas-à-pas ci-dessus).
- **Chef de projet :** mettre `TIKTOK_PIXEL_ID` dans `wrangler.toml`, lancer la migration 0024.
- **Propriétaire, dans le tableau de bord :** ajouter les liens `ttads` et `inf-…` le jour du lancement, et taper l'argent dépensé au fur et à mesure.
