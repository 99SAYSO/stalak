# Compte rendu — compte/essai-gratuit
**Statut : PRÊT** (partie serveur). **Migration 0020** à lancer dans la console D1 avant la mise en ligne. Les prix d'essai sont à créer par le propriétaire dans Paddle (ci-dessous) ; tant que `PADDLE_PRICE_PRO_MONTH_TRIAL` / `_YEAR_TRIAL` sont vides, aucun essai n'est proposé (rien ne change sur le site).

## 1. Comment régler l'essai dans Paddle
Choix : **deux prix à part, avec une période d'essai de 7 jours**, sur le produit Stalak Pro.
- Pourquoi pas ajouter l'essai aux prix actuels : tout le monde l'aurait, même ceux qui ont déjà eu un abonnement ou un essai. Avec deux prix à part, le site propose l'essai seulement aux comptes qui y ont droit, et les autres paient tout de suite.
- Mêmes montants que les prix en vente : 7,99 $/mois et 49,99 $/an.
- Paddle demande la carte au début, ne prélève rien pendant 7 jours, puis prélève la formule choisie.
- Paddle envoie aussi son propre e-mail avant la fin de l'essai (on ne peut pas le régler finement) : la personne recevra donc le nôtre (2 jours avant) et celui de Paddle.

### Ce que le propriétaire clique lui-même dans Paddle (Sandbox d'abord, puis Live)
1. **Catalog → Products → Stalak Pro → New price**, deux fois :
   - « Stalak Pro – mensuel, essai 7 jours » : 7,99 USD, **Billing period : monthly**, **Trial period : 7 days** (carte demandée : laisser « requires payment method » coché si l'option apparaît) ; si le prix mensuel actuel a des prix par pays (« Price overrides »), recopier les mêmes ;
   - « Stalak Pro – annuel, essai 7 jours » : 49,99 USD, **yearly**, **Trial period : 7 days**, mêmes prix par pays que l'annuel actuel.
   - Ne pas toucher aux prix existants.
2. Copier les deux identifiants `pri_…` (Sandbox et Live) et les donner au Chef de projet : ils vont dans `wrangler.toml` (`PADDLE_PRICE_PRO_MONTH_TRIAL`, `PADDLE_PRICE_PRO_YEAR_TRIAL`). Ce ne sont pas des secrets.
3. **Developer tools → Notifications → la destination de Stalak → Edit** : vérifier que ces évènements sont cochés : `subscription.created`, `subscription.updated`, `subscription.activated`, `subscription.trialing`, `subscription.canceled`, `subscription.past_due`, `transaction.completed`, `adjustment.created`, `adjustment.updated`.
4. **Cloudflare → stalak-site → Variables and secrets (Production)** : vérifier que `AUTH_SECRET` existe (sinon le créer : une longue phrase au hasard, 40 caractères ou plus, tapée par le propriétaire). Il sert à l'empreinte de l'adresse et au lien d'annulation de l'e-mail.

## 2. Le serveur
- **Droit à l'essai** : `entitlements.trialEligible` (et `trialDays: 7`) dans `/api/me`. Oui seulement si le compte n'a jamais eu d'abonnement ni d'essai (ni un compte supprimé avec la même adresse), et si les prix d'essai existent. `/api/config` → `paddle.prices.proTrial = {month, year}`.
- **Contrôle du serveur** (le téléphone ne décide pas) : quand Paddle annonce un essai (webhook), le serveur réserve l'essai du compte en une seule opération. Un essai sans droit (prix d'essai forcé, deux paiements en même temps) est **arrêté tout de suite, sans rien prélever**, et ne donne jamais Pro. Choix : pas de prélèvement immédiat, car la personne a vu « gratuit 7 jours » dans le paiement.
- **État** : pendant l'essai, tout Pro ; `subscription.status = 'trialing'` et `subscription.trialEndsAt` (« en essai jusqu'au … » = date du 1er prélèvement). Annulé pendant l'essai : `cancelAt` rempli, Pro jusqu'à la fin, rien prélevé.
- **Webhooks** : début (`subscription.created` / `trialing`), annulation (`scheduled_change` « cancel », puis `subscription.canceled`), devenu payant (`subscription.activated`), 1er prélèvement raté (`subscription.past_due` : Pro coupé jusqu'au paiement ; puis `activated` → payant). Pas de changement de formule pendant l'essai (409 `in_trial`).
- **E-mail de rappel 2 jours avant le 1er prélèvement** : la date, le **montant exact** (taxes comprises, demandé à Paddle au moment d'envoyer ; sans lui, l'e-mail attend la tâche suivante) et un bouton « Annuler mon essai ». Le lien ouvre une page avec **un seul bouton** (ouvrir le lien n'annule rien : les antivirus de messagerie ouvrent les liens). Paddle annule alors à la fin de l'essai.
- **Une fois par personne après suppression du compte** : si le compte avait eu un abonnement ou un essai, une empreinte de l'adresse (HMAC avec `AUTH_SECRET`), **effacée 12 mois après la suppression** ; rien d'autre.
- **Téléphone du propriétaire** : « 🎁 Essai Pro commencé », « 💸 Essai Pro devenu payant », « Essai Pro annulé », « Essai Pro : 1er prélèvement raté ». Le remerciement part au 1er paiement.

## 3. Tableau de bord
Page Entonnoir, carte « 🎁 Essai gratuit de Pro (7 jours) » : essais commencés sur la période, devenus payants (avec le % des essais finis), annulés pendant l'essai, prélèvements ratés, en cours. Les essais refusés ne comptent pas.

## Pour App (contrat)
- Si `entitlements.trialEligible` : proposer « Essayer Pro gratuitement 7 jours » et ouvrir le paiement Paddle avec `config.paddle.prices.proTrial.month` ou `.year` (avec `customData.user_id` comme aujourd'hui). Sinon, les prix normaux.
- Pendant l'essai : afficher « Essai Pro jusqu'au <trialEndsAt> » (ou « annulé, Pro jusqu'au <cancelAt> ») et un bouton « Annuler l'essai » : `POST /api/trial/cancel {s: <id de l'abonnement>}` (connecté) ou le portail Paddle existant.
- Creator Plus : jamais d'essai.

## Juridique
- Durée de l'empreinte : **12 mois après la suppression du compte**, comme pour la vidéo offerte (à écrire dans la confidentialité).
- Conditions : essai de 7 jours, carte demandée, une fois par personne, prélèvement automatique au bout de 7 jours sauf annulation, rappel 2 jours avant, annulation pendant l'essai = rien prélevé et Pro jusqu'à la fin, 1er prélèvement raté = Pro coupé ; un essai pris sans y avoir droit est arrêté sans frais.

## Migration 0020
```sql
ALTER TABLE users ADD COLUMN trial_used_at INTEGER;
ALTER TABLE subscriptions ADD COLUMN trial_started_at INTEGER;
ALTER TABLE subscriptions ADD COLUMN trial_ends_at INTEGER;
ALTER TABLE subscriptions ADD COLUMN trial_result TEXT;
ALTER TABLE subscriptions ADD COLUMN trial_reminded_at INTEGER;
CREATE INDEX IF NOT EXISTS subscriptions_trial ON subscriptions(trial_ends_at) WHERE trial_ends_at IS NOT NULL;
```
(0019 a servi à la vidéo offerte annulée ; sa colonne reste en base.)

## Tests
- `node tests/backend/run.mjs` : 120/120. Les 5 nouveaux couvrent :
  - le droit à l'essai, Pro pendant l'essai et « jusqu'au » ;
  - un seul essai par compte, avec l'essai refusé sans frais et sans Pro (même quand deux paiements partent ensemble ou qu'un message arrive en retard) ;
  - l'empreinte HMAC après suppression (copies d'une même boîte, effacement à 12 mois, rien sans clé) ;
  - l'e-mail 2 jours avant (date, montant exact, une seule fois, attente si Paddle ne répond pas), la page à un bouton, l'annulation et la fin sans frais ;
  - le passage en payant, le 1er prélèvement raté puis réussi, l'annulation reprise, et les chiffres du tableau de bord.
- `tests/ui/support_ui.py` : 64/64.
- E-mail et page d'annulation vérifiés en 390 px (FR et EN), carte du tableau de bord sur téléphone et ordinateur.
- Relecture de sécurité : `docs/appsec-review-essai-gratuit.md`.
- **À faire par le Chef de projet** : un vrai essai en Sandbox une fois les prix créés, pour voir les vrais messages de Paddle.

## Reste
- **Propriétaire** : les étapes Paddle ci-dessus et `AUTH_SECRET`.
- **Chef de projet** : migration 0020, les identifiants dans `wrangler.toml`, un essai en Sandbox.
- **App** : les écrans.
- **Juridique** : les conditions.
- **Marketing** : l'accueil et Tarifs.
