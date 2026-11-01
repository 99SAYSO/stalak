# Paddle en réel, identité du vendeur, rétractation, médiateur (01/11/2026)

> Rôle Juridique & business. Infos pour décider, **pas un avis juridique**.
> Adresses vérifiées le 01/11/2026 sur le site en ligne : anglais à la racine, français dans `/fr/`. Les anciennes adresses
> (`/en/…`, `/conditions`…) redirigent en 301 vers les nouvelles.

## 1. Adresses à donner à Paddle (vérification du site, « Website approval »)

Le domaine à faire approuver est `stalak.app`. Ce sont les adresses anglaises qu'il faut donner, puisque c'est la langue principale.

| Ce que Paddle demande | Adresse |
|---|---|
| Site / description du produit | https://stalak.app/ |
| Prix | https://stalak.app/pricing |
| Conditions (Terms & Conditions, avec le nom légal) | https://stalak.app/terms |
| Politique de remboursement | https://stalak.app/refunds |
| Politique de confidentialité | https://stalak.app/privacy |
| Mentions légales (pas demandées par Paddle, utiles) | https://stalak.app/legal-notice |
| Versions françaises | https://stalak.app/fr/tarifs · /fr/conditions · /fr/remboursement · /fr/confidentialite · /fr/mentions-legales |
| Lien de paiement par défaut (Checkout settings) | https://stalak.app/ |

Vérifications faites :
- les 5 pages répondent en ligne ;
- elles sont reliées depuis le pied de page de l'accueil et de la page Tarifs ;
- le site est en HTTPS ;
- les conditions disent que Paddle est le revendeur officiel (Merchant of Record) et renvoient vers les conditions acheteur de Paddle.

Il manque une seule chose : **le nom légal dans les conditions**. Il s'affiche tout seul quand `vendeur.json` est rempli (voir 3).

**Textes à copier dans le formulaire Paddle** (en anglais) :
- *Product description* : « Stalak is a web app for musicians. It automatically cuts several lip-sync takes to the beat of
  a song, adds on-screen lyrics and exports vertical videos for TikTok, Reels and Shorts, or 16:9 music videos. Editing
  happens in the user's browser. »
- *What do you sell?* : « Software subscriptions (SaaS): Stalak Pro ($7.99/month or $49.99/year) and Stalak Creator Plus
  ($14.99/month or $99.99/year). A free plan with a watermark is also available. »
- *Delivery* : « Instant access in the web app after payment, linked to the customer's Stalak account. »
- *AI features* (si Paddle pose la question) : « Speech-to-text transcription of the user's own song lyrics (Cloudflare
  Workers AI, Whisper) and an AI help assistant. No AI-generated images, video, voices or music. »
- *Ads* (si Paddle pose la question) : « The free plan shows optional rewarded video ads from Google Ad Manager. We don't sell
  advertising ourselves. »

À éviter dans le formulaire et sur le site : toute promesse de « campagne », de « vues », d'« abonnés » ou de « promotion sur
les réseaux ». Les règles de Paddle du 13/04/2026 interdisent la vente de pub et le marketing automatisé sur les réseaux.

**Autres adresses vérifiées** (corrigées sur cette branche quand il le fallait) :
- dans l'app (FR/EN), liens vers conditions, confidentialité, remboursement et tarifs : bons (`/terms`, `/privacy`, `/refunds`, `/pricing` et `/fr/…`) ;
- liens externes des pages légales : conditions acheteur de Paddle, politique de confidentialité de Paddle, paddle.net, page « How Google uses information », My Ad Center, cnil.fr, cloudflare.com : tous ouverts le 01/11 ;
- `BACKEND.md` (fiches Google et Microsoft de « connexion avec… ») : passent de `/confidentialite` et `/conditions` à `/privacy` et `/terms` (les anciennes adresses marchaient encore grâce aux redirections). **À changer aussi par le propriétaire dans Google Cloud → Stalak → Branding** (et chez Microsoft le jour où c'est configuré) ;
- `functions/_lib/reminders.js` : un commentaire cite encore `site_src/en/terms.html` (rien de visible ; à corriger par Comptes un jour).

**Remarque (Chef de projet)** : Cloudflare remplace l'adresse e-mail des pages par un lien codé (« Email Obfuscation »). Sans
JavaScript, on lit « [email protected] » au lieu de contact@stalak.app. Pour les pages légales (et le contrôle de Paddle), il
vaut mieux couper ce réglage : Cloudflare → stalak.app → Scrape Shield → Email Address Obfuscation → Off.

## 2. Le bouton « Renoncer au contrat ici » quand Paddle est le vendeur

**La règle** : depuis le 19/06/2026 (ordonnance n° 2026-2), tout **professionnel** qui conclut un contrat à distance avec un
**consommateur de l'UE** par une interface en ligne doit proposer une fonction de rétractation :
- un bouton « Renoncer au contrat ici » (ou équivalent clair) ;
- visible pendant tout le délai de 14 jours ;
- un accusé de réception sur support durable (e-mail).

Ça ne concerne que les achats où un droit de rétractation existe, et pas les clients américains.

**Avec Paddle** : le contrat de vente est conclu entre le client et Paddle, qui est le vendeur légal (Merchant of Record). Les
conditions acheteur de Paddle (section 15) prévoient le droit de rétractation de 14 jours pour l'UE et le Royaume-Uni, à
exercer selon la politique de remboursement de Paddle, par paddle.net ou help@paddle.com. **Juridiquement, l'obligation
pèse d'abord sur Paddle.** Mais :
- l'achat se fait sur stalak.app (fenêtre Paddle ouverte dans le site) et l'abonnement se gère dans le compte Stalak ;
- les textes et les premiers commentaires ne disent rien des revendeurs : personne ne sait encore comment l'autorité (DGCCRF) lira un montage avec revendeur ;
- les conditions de Stalak accordent elles-mêmes 14 jours de remboursement sans justification, même après avoir commencé à utiliser l'abonnement : le droit de rétractation existe donc bien pour les clients de Stalak.

**Conclusion pour décider** : on ne peut pas dire avec certitude que le bouton est inutile. Le plus sûr, et peu coûteux :
1. **Écrire à Paddle** (support vendeur) : « Do you provide the EU withdrawal function (Directive 2023/2673, art. 11a) for
   subscriptions sold through Paddle Checkout on our site, or should we add it ourselves? » Garder la réponse écrite.
2. **En attendant, ou si Paddle ne le fait pas : l'ajouter dans Stalak** (Comptes) :
   - dans Compte → « Gérer mon abonnement », pendant 14 jours après chaque paiement et seulement pour l'UE (pays de facturation Paddle) ;
   - bouton « Renoncer au contrat ici » / « Withdraw from contract here », bien distinct de « Arrêter l'abonnement » ;
   - formulaire court déjà rempli : nom, e-mail du compte, contrat (formule, date du paiement), puis « Confirmer la renonciation » ;
   - effet : remboursement intégral par l'API Paddle et arrêt immédiat de l'abonnement ;
   - **accusé de réception par e-mail** tout de suite (date et heure, contrat concerné) ;
   - garder la trace (date, contrat, e-mail envoyé).

Ce bouton fait la même chose que notre remboursement de 14 jours : il le rend seulement accessible en un clic, comme la loi
le demande. Les clients hors UE gardent le remboursement par e-mail.

## 3. Nom, SIRET et adresse de la micro-entreprise : prêts à être remplis

Il suffit de remplir **`vendeur.json`** (à la racine du dépôt) puis de relancer `build_site.py` :

```json
{ "nom": "Prénom Nom", "siret": "123 456 789 00012", "adresse": "N°, rue, code postal, ville, France",
  "telephone": "+33 …", "mediateur": { "nom": "…", "site": "https://…" } }
```

- Tant que les 4 premières cases sont vides, le site reste en « éditeur particulier ». Le build refuse un fichier à moitié rempli.
- Une fois remplies :
  - les **mentions légales** (FR/EN) affichent le nom, « entrepreneur individuel (EI), micro-entrepreneur, inscrit au RNE », le SIRET, l'adresse, le téléphone, l'e-mail et le directeur de la publication ;
  - les **conditions** (FR/EN) affichent le nom légal (« Prénom Nom, entrepreneur individuel (EI) »), ce que Paddle demande. L'option `--seller` du build reste possible et passe avant.
- **Adresse** : celle du domicile, ou une adresse de domiciliation (quelques euros par mois) si tu ne veux pas publier celle de tes parents. Elle doit être la même que celle déclarée à l'INSEE / au RNE.
- **Téléphone** : la loi le demande pour un éditeur personne physique. Un second numéro (carte SIM ou numéro virtuel pas cher) évite de publier ton numéro perso.
- **Nom** : la mention « EI » ou « entrepreneur individuel » est obligatoire à côté du nom depuis 2022. Le site l'ajoute tout seul.
- TVA : en franchise (sous 37 500 € de chiffre d'affaires), rien à afficher sur le site. La mention « TVA non applicable, art. 293 B du CGI » va sur les factures de la micro-entreprise à Paddle, à confirmer avec l'expert-comptable.

## 4. Médiateur de la consommation

- **Obligation** : tout professionnel qui vend à des consommateurs doit leur offrir l'accès gratuit à un **médiateur de la consommation agréé** (liste officielle de la CECMC sur economie.gouv.fr). Amende administrative possible (jusqu'à 3 000 € pour une personne physique).
- **Avec Paddle** : Paddle vend les abonnements, mais Stalak conclut aussi un contrat de service avec les utilisateurs (conditions d'utilisation, offre gratuite avec pub) et se présente comme le service. Le plus prudent est **d'adhérer à un médiateur**, même si l'obligation pourrait être discutée.
- **Coût** : environ 25 à 50 € par an d'adhésion, plus un forfait si un dossier arrive (souvent 100 à 300 €). C'est toi qui paies, jamais le client.
- **Où l'afficher** : nom et site du médiateur dans les **conditions** et les **mentions légales** (fait automatiquement par `vendeur.json`), et sur les factures ou devis s'il y en a.
- **Plateforme européenne de règlement en ligne des litiges (RLL)** : fermée le 20/07/2025. Aucun lien à mettre (le site n'en a pas).
- **Pour choisir** : un médiateur généraliste « e-commerce / services » de la liste officielle, avec une adhésion annuelle simple. Vérifie qu'il accepte les micro-entrepreneurs et les services numériques.
- **Clients américains** : pas de médiateur obligatoire. Les conditions anglaises ne le proposent qu'aux résidents de l'UE.
