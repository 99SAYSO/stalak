# Compte rendu — compte/mesure-et-offre-1-euro
**Statut : PRÊT.** Aucune migration. Rien ne change sur le site tant que les identifiants (Clarity, GA4, pixel TikTok) et le prix de l'offre ne sont pas remplis dans `wrangler.toml`.
Demande : `docs/handoff/chef-mesure-offre-1-euro.md`, partie « Pour Comptes » (décisions du propriétaire du 23/11).

## 1. Bandeau cookies (`src/consent.js`, toutes les pages de stalak.app)
- « Refuser » et « Accepter » : même taille, même aspect.
- **Rien n'est chargé ni déposé avant le choix.**
- Le choix est gardé 6 mois (cookie `stalak_cc`).
- « Gérer les cookies » du pied de page (déjà là, `data-ck`) rouvre le bandeau : **rien à changer pour App dans `src/footer.py`**.
- GPC (refus envoyé par le navigateur) = refus, sans bandeau.
- Refuser après avoir accepté efface les cookies de mesure.
- Texte (à relire par Juridique) : « Stalak utilise des cookies de mesure (Microsoft Clarity, Google Analytics) pour comprendre comment le site est utilisé et l'améliorer, et pour mesurer nos publicités. Rien n'est déposé si tu refuses. En savoir plus » (lien vers la section cookies de la confidentialité).

## 2. Clarity et GA4
- Chargés **seulement après « Accepter »**, avec les identifiants de `wrangler.toml` : `CLARITY_PROJECT_ID` et `GA4_MEASUREMENT_ID` (pas des secrets).
- **Le Chef de projet les remplit quand il les a.** Tant que c'est vide : ni bandeau, ni chargement.
- Clarity : tous les champs (e-mail, mot de passe…), les aperçus (`canvas`) et les vidéos sont masqués, même ceux qui apparaissent plus tard.
- **Propriétaire** : dans Clarity → Settings → Masking, choisir « Strict ».
- GA4 : cookies 13 mois au plus ; signaux Google et pub personnalisée coupés.

## 3. Entonnoir GA4 (après accord)
- Évènements envoyés : `accueil_vue`, `export_lance`, `export_ok`, `paywall_vu` (paramètre `endroit`), `checkout_ouvert`, `clip_ouvert`, `achat` (`formule`, `periode`, `offre`, `value`, `currency`).
- Ils reprennent les compteurs existants (correspondance dans `docs/stats/compteurs.md`), qui restent.
- **Pour App** : envoyer `StalakConsent.track('onboarding_etape_' + n)` à chaque écran du tutoriel, et `StalakConsent.track('montage_lance')` quand le montage commence. Ça ne fait rien sans accord.

## 4. API de conversion TikTok (prête, éteinte)
- Envoyée par le serveur au **1er vrai paiement** d'un abonnement confirmé par Paddle : un achat, le 1 € de l'offre, ou le 1er paiement après un essai gratuit. Jamais un renouvellement.
- **Seulement si la personne avait accepté les cookies** (la page le passe à Paddle).
- E-mail haché SHA-256, jamais en clair ; le `ttclid` de la pub TikTok s'il y en a un (gardé 30 jours après accord) ; pas d'IP.
- **Pour l'allumer** (quand le compte TikTok Ads existera) :
  - `TIKTOK_PIXEL_ID` dans `wrangler.toml` (Chef de projet) ;
  - le **secret** `TIKTOK_EVENTS_TOKEN` (TikTok Ads Manager → Events → Web events → Settings → « Generate access token »), **tapé par le propriétaire** dans Cloudflare → stalak-site → Variables and secrets (Production) ;
  - pour vérifier avant : `TIKTOK_TEST_EVENT_CODE` (onglet « Test events » de TikTok), puis le retirer.
- Tableau de bord : achats envoyés ou refusés par TikTok.

## 5. Offre à 1 € (écran de fin d'un export avec filigrane seulement)
- **Comment avec Paddle** : un « essai payant » (fonction de Paddle de 2026). C'est un prix à part : Stalak Pro mensuel, 7 jours à 1 USD (1 EUR dans la zone euro), carte demandée, puis le prix mensuel normal.
- **Ce que le propriétaire fait** : tableau de bord Stalak → Santé → **« Créer le prix « Pro, 7 jours à 1 € » dans Paddle »**. Le serveur le crée avec sa propre clé Paddle : rien à taper. Il le crée à partir du Pro mensuel en vente, avec les mêmes montants par pays et le même mode de taxe.
  - Le faire une fois sur la maquette (Sandbox) et une fois sur le vrai site (Live).
  - Donner l'identifiant `pri_…` au Chef de projet → `PADDLE_PRICE_PRO_OFFER1`.
  - Redemander donne le même prix.
- **Sur l'écran** : le bouton « Exporter sans le logo » devient « **Retire le filigrane pour 1 €** ». Juste dessous, en clair (14 px, encre) : « **1 € aujourd'hui, puis 7,99 $/mois dans 7 jours. Annulable à tout moment.** »
  - Les deux montants sont ceux que Paddle prélèvera, **taxes comprises et dans la monnaie de la personne** (ex. « 1,20 € aujourd'hui, puis 9,59 $US/mois »). « 1 € » et « 7,99 $ » ne servent que si Paddle ne répond pas.
  - **À décider (Juridique / propriétaire)** : si les prix Paddle sont hors taxes, le bouton dira « 1,20 € » en France. Pour afficher « 1 € » pile, il faut des prix TTC dans Paddle.
- **Une fois par personne** : un seul essai par compte, gratuit **ou** à 1 € (`entitlements.offer1Eligible`). C'est vérifié encore par le serveur au webhook : une offre prise sans droit est arrêtée tout de suite, **le 1 € est remboursé**, et elle ne donne pas Pro. Remboursements : les mêmes (14 jours), le 1 € est un vrai paiement.
- **Sans compte** : l'offre est montrée, et le bouton demande d'abord de se connecter. **Sans droit** : l'écran reste comme avant (essai gratuit si le compte y a droit, sinon Pro).
- Après le paiement, le compte est Pro et l'écran propose de refaire la même vidéo sans filigrane (déjà là).
- Tableau de bord : ligne « 💶 Offre à 1 € » (prises, passées à Pro mensuel avec le %, annulées, en cours).

## 6. Choisir le moyen de paiement (pour App)
**Oui**, Paddle le permet : `settings.allowedPaymentMethods` (ex. `['apple_pay']`, `['google_pay']`, `['card']`, `['paypal']`). Paddle ne montre alors que ces moyens, quand ils existent pour ce prix et ce pays (Apple Pay sur les appareils Apple, Google Pay sur Chrome / Android). `StalakAccount.checkout(plan, interval, { methods: ['apple_pay'] })` le passe déjà. Pour savoir lesquels proposer dans un pays, utiliser `available_payment_methods` de `Paddle.PricePreview`.

## 7. Après un achat réussi (pour App)
La page envoie l'évènement `window` **`stalak:purchase`** (`detail: { plan, interval, offer, trial }`) dès que Paddle dit « payé ». C'est le moment de l'écran « Bienvenue dans Stalak Pro » (démo `08-achat-confettis.mp4`). Le compte devient Pro quelques secondes après (`StalakAccount.onChange`).

## Trouvé en passant (corrigé)
L'app (branche `app/essai-pro`, déjà sur `main`) lit l'essai dans `/api/config` sous la forme `trial: {days, plans}` et paie avec `{ trial: true }`. Le serveur ne donnait ni l'un ni l'autre : l'essai gratuit ne s'affichait donc jamais. Ajoutés tous les deux.

## Tests
- `node tests/backend/run.mjs` : 125/125, dont 5 nouveaux :
  - config ;
  - TikTok : accord, hachage, une seule fois, refus, éteint ;
  - offre à 1 : droit, refus remboursé, tableau de bord ;
  - création du prix ;
  - compteurs du bandeau.
- `tests/ui/mesure_ui.py public` : 98/98 (iPhone 12 et ordinateur, FR et EN). Il couvre :
  - le bandeau, rien avant le choix, le refus gardé, « Gérer les cookies », l'accord, les identifiants ;
  - le masquage Clarity, l'entonnoir GA4, l'effacement au refus, GPC ;
  - l'offre à 1 € avec et sans droit ;
  - pas de défilement de côté, aucune erreur.
- Non-régression : `essai_pro_ui.py`, `audit_ui.py`, `support_ui.py` (résultats dans la réponse finale).
- Relecture de sécurité : `docs/appsec-review-mesure-et-offre-1-euro.md`.

## Reste
- **Chef de projet** : identifiants Clarity / GA4 (puis pixel TikTok) dans `wrangler.toml` ; `PADDLE_PRICE_PRO_OFFER1` ; un essai réel en Sandbox.
- **Propriétaire** :
  - le bouton « Créer le prix » (Sandbox puis Live) ;
  - Clarity « Strict » ;
  - plus tard, le secret `TIKTOK_EVENTS_TOKEN`.
- **Juridique** :
  - texte du bandeau, confidentialité (Clarity, GA4, TikTok), taxes du 1 € ;
  - conditions de l'offre (un seul essai par personne, gratuit ou à 1 €).
- **App** : `onboarding_etape_N`, `montage_lance`, l'écran « Bienvenue » sur `stalak:purchase`, le choix du moyen de paiement.
