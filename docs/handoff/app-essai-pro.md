Statut : EN COURS (tests en cours)
Branche : app/essai-pro (créée depuis `origin/main` 1f62c8b le 23/11).
Maquette de la branche : https://app-essai-pro.stalak-site.pages.dev (à faire valider par le propriétaire, règle 9).

Demande : message du Chef de projet du 23/11 (7 h 14). La « vidéo offerte » est retirée de `main` ; à la place, un essai
gratuit de Stalak Pro : 7 jours, carte demandée, prélevé au bout de 7 jours sauf annulation, une seule fois par personne, Pro
seulement. Comptes fait le serveur et Paddle (droit `trialEligible`). Skills : stalak-da, taste, paywalls.

## Ce qui change dans l'app
1. **Avec le droit à l'essai**, partout où Pro est proposé, le bouton devient « Essayer Pro 7 jours gratuits »
   (EN « Try Pro free for 7 days ») :
   - l'écran des formules (carte Pro) ;
   - la fenêtre Pro (après une vidéo enregistrée) ;
   - l'écran de fin d'un export gratuit (le bouton « Exporter sans le logo PRO » ; l'étiquette PRO est cachée) ;
   - les fonctions Pro verrouillées : la fenêtre des filtres Pro et celle du mode Clip.
   Juste dessous, toujours visible (même taille de texte partout, 13 à 13,5 px) :
   « Puis 4,17 $/mois, facturé 49,99 $ par an. Annulable à tout moment avant la fin de l'essai. »
   - En mensuel (écran des formules, bouton Mensuel choisi) : « Puis 7,99 $/mois, facturé chaque mois. »
   - **Avant de payer** (écran des formules, là où le paiement s'ouvre) : « Aujourd'hui : 0 $. 1er prélèvement le
     30 novembre 2026 : 49,99 $. » (date = aujourd'hui + 7 jours, montant de la formule choisie).
   - Les montants sont lus dans la configuration du serveur, jamais écrits en dur.
   - Dans la fenêtre Pro, la ligne « 49,99 $ facturés une fois par an · annulable à tout moment » de l'encadré du prix est
     cachée pendant l'offre d'essai : elle redisait la même chose que les lignes sous le bouton, et la fenêtre ne tenait plus
     dans l'écran de l'iPhone 12.
   - **Inchangé** : la taille du 4,17 $ (52 px sur l'écran des formules au téléphone, 44 px sur ordinateur comme sur `main` ;
     30 px dans la fenêtre Pro), le prix barré, « 5 mois offerts ».
2. **Sans droit à l'essai** (déjà eu un essai, déjà abonné) : tout est comme aujourd'hui, aucun mot sur l'essai.
3. **Pendant l'essai** :
   - dans le compte : « Essai Pro : encore 3 jours · 1er prélèvement le 26 novembre 2026 · Gérer ou annuler » (le lien ouvre
     le portail Paddle, comme « Gérer mon abonnement ») ; s'il est annulé : « … se termine le …, rien ne sera prélevé » ;
   - dans la carte Pro du compte, la même phrase ;
   - dans le menu du compte : « Essai Pro : encore 3 jours » à la place de « Gérer mon abonnement » ;
   - « 1 jour » au singulier ; le nombre de jours est arrondi au jour supérieur (jamais « 0 jour »).
4. **Rien de caché** : le montant et la date du 1er prélèvement sont écrits sur l'écran des formules, juste sous le bouton,
   avant que la fenêtre de paiement s'ouvre. Toutes les autres entrées (fenêtre Pro, écran de fin, fonctions verrouillées)
   mènent à cet écran.

## À faire par Comptes (le contrat attendu par l'app)
- `/api/config` : `trial: { days: 7, plans: ['pro'] }`. Sans ce champ (ou `days` à 0), l'app ne montre l'essai nulle part :
  on peut donc fusionner cette branche avant le serveur sans rien afficher de faux.
- `/api/me` : `entitlements.trialEligible` = `true` si la personne n'a jamais eu d'essai (une seule fois par personne).
- Pendant l'essai : `subscription.status = 'trialing'`, avec `subscription.trialEndsAt` (sinon l'app prend
  `currentPeriodEnd`) et `cancelAt` si l'essai est annulé. Le plan de la personne est `pro` pendant l'essai.
- `ACCT.checkout('pro', 'year' | 'month', { trial: true })` : **`account.js` ignore aujourd'hui ce 3e argument** ; c'est à
  Comptes de le passer à Paddle (prix avec période d'essai) et de refuser l'essai côté serveur si la personne n'y a plus droit.
- **Choix à valider** : une personne **déconnectée** voit l'offre d'essai (si le serveur dit que l'essai existe), puisqu'on
  ne sait pas encore qui elle est. Le droit est vérifié après la connexion : si elle a déjà eu un essai, le bouton redevient
  « Choisir Pro » sur l'écran des formules, avant le paiement.

## Choix faits (à signaler)
- Les lignes sous le bouton de la fenêtre Pro, de l'écran de fin et des fonctions verrouillées donnent le prix **annuel**
  (le prix affiché dans ces fenêtres) ; la date et le montant exacts du 1er prélèvement sont sur l'écran des formules, selon
  Annuel / Mensuel choisi.
- La date est écrite comme les autres dates du compte (`acctDate`) : en anglais « 30 November 2026 ».

## Fichiers
- `src/app.js` (`trialDays`, `trialOn`, `trialThen`, `trialFirst`, `trialLeft`, `trialUi` ; `plRender`, `plBuy`,
  `apSubLine`, `apRender`, le menu du compte, `ppOpen`, `doneUi`), `src/markup.html` (les lignes `.tr-terms`),
  `src/theme.css`.
- **Pour Comptes** : l'écran des formules (`plRender`, `plBuy`), la ligne d'abonnement du compte et le menu ; nouvelles clés
  `tr.*`. Aucun fichier de `functions/` ni `account.js` touché.
- Nouveau test `tests/ui/essai_pro_ui.py` (serveur imité : avec droit, sans droit, déconnecté, essai en cours 3 jours /
  1 jour / annulé ; iPhone 12, iPhone SE, ordinateur ; FR et EN).

## Résultats des tests (23/11)
(en cours)
