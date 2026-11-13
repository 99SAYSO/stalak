# Compte rendu — compte/audit-13-11
**Statut : PRÊT** — aucune migration SQL.

## 1. Erreur 500 du 12/11 (fin d'envoi d'un fichier en ligne)
`functions/_lib/cloud.js` : l'assemblage R2 (`complete()`) est maintenant protégé. Selon l'erreur :
- déjà assemblé (la 1ʳᵉ réponse s'était perdue) → réussite ;
- envoi expiré ou disparu chez R2 → un nouvel envoi est créé, réponse `409 parts_missing` (tous les morceaux, `restarted: true`) : l'app renvoie le fichier toute seule ;
- morceau refusé → morceaux oubliés, `409 parts_missing` : l'app les renvoie ;
- autre panne → `503 storage_busy` (réessayer dans 5 s) : l'app réessaie seule.
Plus jamais de 500 sur cette route. Test : « audit 13/11 n°5 » (4 cas).

## 2. Raisons d'ouverture des formules
- **Pourquoi `why_clip` = 0 depuis le 7/11** : ce n'est pas une panne. Depuis le 7/11, un Clip sans Pro ouvre d'abord une question (Pro / TikTok-Reels / Annuler). La page des formules (raison `clip`) ne s'ouvre que si la personne choisit « Pro ». Les réponses sont déjà au tableau de bord (`ev_clip_ask_*`).
- **Pourquoi `other` = 21** : toutes les ouvertures sans fonction précise y tombaient. Elles sont maintenant rangées : `menu` (menu du compte ou bouton Pro en haut), `account` (page Mon compte), `pricing` (page Tarifs « Choose Pro »), `link` (lien `#pro`). `other` ne garde que le reste (retour en arrière…).
- Fichiers : `src/app.js` (`apGo(..., { from })`), `functions/_lib/metrics.js` (`EVENT_REASONS`), `functions/_lib/admin-page.js` (noms en français).
- **Nouveau compteur « A ouvert le mode Clip »** (`ev_clip_open`) : le serveur l'accepte et le tableau de bord l'affiche dans la carte « Clip exporté sans Pro : le choix » (0 tant qu'App ne l'envoie pas).
- **Pour App** : envoyer `acctEvent('clip_open')` **une fois par page**, quand la personne choisit Clip (par ex. dans `setKind('clip')`, pas au chargement silencieux).

## 3. Abandons au paiement (5 fermetures sur 9 ouvertures) — réponse, pas de code
Ce que le tableau de bord sait déjà :
- fenêtre ouverte (`ev_checkout_open`), achat fini vu par la page (`ev_checkout_done`) et vrai paiement (`paid_first`) ;
- **l'étape** de la fermeture sans achat : tout de suite / après l'e-mail et le pays / en payant (`ev_checkout_close_*`) ;
- la **provenance** (TikTok, Google…) de chaque étape de l'entonnoir (`fs:…`), et la part iPhone de certaines étapes ;
- le pays des **visites** (pas des abandons).
Ce qui manque :
- la **formule** (Pro ou Creator Plus) et la **durée** (mois ou an) de l'abandon ;
- le **pays** de l'abandon ;
- l'**appareil** (iPhone ou non) de l'abandon ;
- la **raison** d'un paiement refusé par Paddle (`checkout.payment.failed`) ;
- la devise et le prix affiché.
Faisable en compteurs anonymes (aucune donnée personnelle), environ une demi-journée, si vous le voulez.

## 4. Content-Security-Policy (plus tard)
Pas fait. Plan proposé : d'abord l'en-tête `Content-Security-Policy-Report-Only` (rien n'est bloqué, on regarde), puis la vraie règle. Le site a des scripts et styles écrits dans la page : il faudra des « hash » ou « nonces ».

## Tests
`node tests/backend/run.mjs` 107/107 ; `plans_ui.py` 35/35 ; `audit_ui.py public` 158/158 ; `support_ui.py` 64/64.

## Juridique
Rien de nouveau : nouveaux compteurs anonymes seulement (aucun compte, e-mail ni IP).

## Reste
App : envoyer `clip_open`. Propriétaire : décider du point 3 (compteurs en plus) et du point 4.
