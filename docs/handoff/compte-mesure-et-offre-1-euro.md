# Compte rendu — compte/mesure-et-offre-1-euro
**Maquette : https://compte-mesure-et-offre-1-eur.stalak-site.pages.dev** (Cloudflare coupe le nom de la branche à 28 caractères : l'adresse avec « …-1-euro » donne 404 ; le déploiement, lui, a réussi).

**Statut : PRÊT.** **Migration 0021** (réponses de l'onboarding et auditeurs) à lancer dans la console D1 avant la mise en ligne.
- Mise à jour du 23/11, 23 h : identifiants Clarity (`zic7crm0mc`) et GA4 (`G-LY6HDYZKEK`) **mis dans `wrangler.toml`** : le bandeau apparaîtra dès la mise en ligne.
- Ajoutés aussi : l'enregistrement des réponses de l'onboarding, et la saisie hebdomadaire des auditeurs (sections 8 et 9).
- Le prix de l'offre (`PADDLE_PRICE_PRO_OFFER1`) et le pixel TikTok restent à remplir.
Demande : `docs/handoff/chef-mesure-offre-1-euro.md`, partie « Pour Comptes » (décisions du propriétaire du 23/11).

## Mise à jour du 24/11, 2 h 30 (prix de l'offre créé à la main)
- Le prix de l'offre est **`pri_01m85jpx3p0vmnxevfyysgtj1h`**, créé à la main par le Chef de projet. Le bouton du tableau de bord avait échoué, car Paddle refuse un essai en euros quand le prix mensuel n'existe qu'en dollars.
  - Ses réglages : 7,99 € par mois dans 25 pays, 7,99 $ ailleurs ; essai de 7 jours à 1 € (ou 1 $) ; taxes automatiques selon le pays ; données `stalak=stalak_offer1`.
- **Le bouton « Créer le prix … dans Paddle » est retiré** du tableau de bord, avec son adresse serveur (`paddle-offer.js` supprimé). En retrouvant ce prix, il l'aurait passé en « taxes comprises » partout, et les revenus aux États-Unis auraient baissé. La section 5 ci-dessous (bouton, taxes comprises) n'est plus d'actualité.
- **L'écran de fin écrit les montants exacts de ce prix**, lus chez Paddle (`PricePreview`) pour le pays de la personne :
  - France : « Retire le filigrane pour 1 € » / « 1 € aujourd'hui, puis 7,99 €/mois dans 7 jours. Annulable à tout moment. »
  - États-Unis : « Retire le filigrane pour 1 $ » / « 1 $ aujourd'hui, puis 7,99 $/mois … » (« $1 today, then $7.99/month … » en anglais).
  - Allemagne en anglais : « €1 … €7.99/month ».
  - Le montant mensuel est celui de ce prix, pour le pays de la personne, et pas celui du Pro en vente. Pas de « ,00 » ni de « US ».
- **Si Paddle ne répond pas**, l'offre n'est pas montrée et l'écran garde son bouton habituel : jamais un montant deviné à côté d'un bouton de paiement. Le prix est redemandé au plus 3 fois.
- Aux États-Unis, la taxe locale éventuelle s'ajoute au paiement (taxes « automatiques ») ; la fenêtre Paddle l'affiche avant de payer.

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
  - **Décision du propriétaire du 24/11 : « 1 € » pile.** Le prix de l'offre est créé **taxes comprises** (`tax_mode: internal`) par le bouton du tableau de bord ; s'il avait déjà été créé hors taxes, le bouton le passe en taxes comprises. Le bouton écrit « 1 € » (et non « 1,00 € »).
  - **Conséquence à connaître** : Paddle n'a qu'un mode de taxe par prix (pas un pour l'essai et un pour la suite). Après les 7 jours, ces abonnés paient donc **7,99 $/mois taxes comprises**, alors que le Pro en vente coûte 7,99 $ **plus** la taxe du pays (environ 17 % de moins encaissé en France sur ces abonnés). Le texte sous le bouton affiche ce vrai montant (lu sur le prix de l'offre, pas sur le Pro en vente). Autre possibilité si le propriétaire le préfère : garder le prix hors taxes et régler le montant de l'essai pays par pays (0,83 € en France, 0,84 € en Allemagne…) pour tomber sur 1 € ; c'est plus fragile (à refaire quand un taux change).
- **Une fois par personne** : un seul essai par compte, gratuit **ou** à 1 € (`entitlements.offer1Eligible`). C'est vérifié encore par le serveur au webhook : une offre prise sans droit est arrêtée tout de suite, **le 1 € est remboursé**, et elle ne donne pas Pro. Remboursements : les mêmes (14 jours), le 1 € est un vrai paiement.
- **Sans compte** : l'offre est montrée, et le bouton demande d'abord de se connecter. **Sans droit** : l'écran reste comme avant (essai gratuit si le compte y a droit, sinon Pro).
- Après le paiement, le compte est Pro et l'écran propose de refaire la même vidéo sans filigrane (déjà là).
- Tableau de bord : ligne « 💶 Offre à 1 € » (prises, passées à Pro mensuel avec le %, annulées, en cours).

## 6. Choisir le moyen de paiement (pour App)
**Oui**, Paddle le permet : `settings.allowedPaymentMethods` (ex. `['apple_pay']`, `['google_pay']`, `['card']`, `['paypal']`). Paddle ne montre alors que ces moyens, quand ils existent pour ce prix et ce pays (Apple Pay sur les appareils Apple, Google Pay sur Chrome / Android). `StalakAccount.checkout(plan, interval, { methods: ['apple_pay'] })` le passe déjà. Pour savoir lesquels proposer dans un pays, utiliser `available_payment_methods` de `Paddle.PricePreview`.

## 7. Après un achat réussi (pour App)
La page envoie l'évènement `window` **`stalak:purchase`** (`detail: { plan, interval, offer, trial }`) dès que Paddle dit « payé ». C'est le moment de l'écran « Bienvenue dans Stalak Pro » (démo `08-achat-confettis.mp4`). Le compte devient Pro quelques secondes après (`StalakAccount.onChange`).

## 8. Réponses de l'onboarding gardées sur le compte (refonte mobile, point 13)
- **Migration 0021**, table `artist_profiles`. Une ligne par compte : nom d'artiste, genres, déjà sur les plateformes, liens Spotify / Apple Music / SoundCloud / Instagram, auditeurs aujourd'hui, où il poste, ce qui le bloque, auditeurs visés, objectifs.
- **Listes fermées**, reprises des choix de la démo `13-onboarding-v3` :
  - genres `rap` `drill` `chant` `autre` ;
  - auditeurs aujourd'hui `lt100` `100_1k` `1k_10k` `gt10k` ;
  - plateformes `tiktok` `reels` `shorts` ;
  - blocages `few_views` `editing_time` `no_ideas` ;
  - auditeurs visés `1k` `10k` `100k` `1m` ;
  - objectifs `song_launch` `post_more` `fill_concerts`.
  - Une autre valeur est ignorée. Pour ajouter un choix, il faut le dire à Comptes.
- **Liens** : seulement vers leur site (open.spotify.com, music.apple.com, soundcloud.com, instagram.com ; « @nom » accepté pour Instagram). Sinon 400 `bad_link`.
- **Adresses** : `GET /api/artist` ; `PUT /api/artist` (les champs envoyés seulement). Compte obligatoire.
- **Pour App** : `StalakAccount.artist()`, `StalakAccount.saveArtist({...})`.
  - Si l'onboarding a lieu **avant** la connexion, garder les réponses dans le téléphone et les envoyer juste après la connexion.
  - Les messages de l'écran de chargement viennent de ces réponses.
- **Tableau de bord** (Entonnoir), carte « 🎤 Profils d'artistes » : **totaux seulement**, jamais les réponses d'une personne. Elle montre le nombre de profils, combien sont déjà en ligne, et chaque choix de chaque question.
- **Suppression du compte** : tout part avec lui.

## 9. Auditeurs mensuels de la semaine, dans « Stats »
- Spotify ne donne plus ce chiffre par son API (février 2026) : **c'est l'artiste qui le tape** (Spotify for Artists).
- **Migration 0021**, table `listener_counts` : une valeur par semaine ISO (« 2026-W48 »), Spotify pour l'instant.
- **Adresse** : `PUT /api/artist/listeners {listeners, week?}`.
  - Cette semaine par défaut, ou une des 8 dernières pour corriger. Un nombre entier, ou les chiffres tapés.
  - `null` efface la valeur. La même semaine renvoyée remplace l'ancienne valeur.
- **`GET /api/artist`** rend :
  - la courbe (52 dernières semaines) ;
  - `listenersDue: true` tant que la semaine en cours n'a pas de chiffre : « Stats » pose la question une fois par semaine.
- **Pour App** : `StalakAccount.saveListeners(1200)`, puis tracer `listeners`.
- **Tableau de bord** : combien ont donné leurs auditeurs cette semaine et sur 4 semaines.

## Trouvé en passant (corrigé)
L'app (branche `app/essai-pro`, déjà sur `main`) lit l'essai dans `/api/config` sous la forme `trial: {days, plans}` et paie avec `{ trial: true }`. Le serveur ne donnait ni l'un ni l'autre : l'essai gratuit ne s'affichait donc jamais. Ajoutés tous les deux.

## Tests
- `node tests/backend/run.mjs` : 127/127. Les 2 derniers couvrent les réponses de l'onboarding et les auditeurs (listes fermées, liens, champs partiels, totaux seulement, suppression ; semaines, nombres, correction, effacement, autre compte). Les 5 de la 1re partie :
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
- **Chef de projet** : **migration 0021** ; `PADDLE_PRICE_PRO_OFFER1` ; plus tard le pixel TikTok ; un essai réel en Sandbox. (Clarity et GA4 : faits.)
- **Propriétaire** :
  - le bouton « Créer le prix » (Sandbox puis Live) ;
  - Clarity « Strict » ;
  - plus tard, le secret `TIKTOK_EVENTS_TOKEN`.
- **Juridique** :
  - texte du bandeau, confidentialité (Clarity, GA4, TikTok), taxes du 1 € ;
  - conditions de l'offre (un seul essai par personne, gratuit ou à 1 €).
- **App** : `onboarding_etape_N`, `montage_lance`, l'écran « Bienvenue » sur `stalak:purchase`, le choix du moyen de paiement, l'envoi des réponses de l'onboarding (`saveArtist`) et la question hebdomadaire dans « Stats » (`saveListeners`, `listenersDue`).
- **Juridique** (en plus) : confidentialité, données de profil d'artiste (réponses de l'onboarding, liens publics, auditeurs déclarés) gardées tant que le compte existe ; finalités : statistiques de l'artiste, conseils, analyse interne en totaux.
