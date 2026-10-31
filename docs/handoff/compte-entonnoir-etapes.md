Statut : PRÊT
Branche : compte/entonnoir-etapes
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` 1f1bba7

Résumé :
- `POST /api/event` accepte 2 noms de plus : `pro_offer` (l'offre Pro après la 1re vidéo s'affiche) et `ad_shown` (la pub
  s'affiche vraiment à l'écran). Toujours anonymes, sans cookie, `{ios: true}` possible comme les autres.
- Tableau de bord, bloc « Entonnoir » : Visites → Exports réussis → **Offre Pro vue** → **Pubs affichées** → Pubs regardées →
  Page des formules → Fenêtre de paiement → Premiers paiements, avec le % de l'étape d'avant ; la note donne aussi
  « Pubs demandées : x (affichées : y) ».
- Aucune migration (les compteurs vont dans la table `daily_counts` existante).

Pour App (noms à envoyer avec `acctEvent`, une ligne chacun) :
- `acctEvent('pro_offer')` au moment où l'offre Pro après la 1re vidéo est affichée (une fois par affichage) ;
- `acctEvent('ad_shown')` quand la pub est vraiment à l'écran : dans `adWatch`, sur `rewardedSlotReady`, juste après
  `e.makeRewardedVisible()`. (`ad_offer` reste « pub demandée », `ad_ok` « récompense accordée ».)
Tant qu'App ne les envoie pas, les deux cases affichent 0 ; rien ne casse.

Skills utilisés : `appsec-review` (relecture rapide : liste fermée de noms élargie de 2, mêmes limites, rien de personnel ;
aucun nouveau risque).

Fichiers touchés : `functions/_lib/metrics.js`, `functions/_lib/admin.js`, `functions/_lib/admin-page.js`, `src/account.js`
(commentaire), `src/app.js` (commentaire de `acctEvent`), `BACKEND.md` (15.5), `docs/STATUS.md`, `tests/backend/run.mjs`, `public/` reconstruit.

Migration SQL : aucune.

Tests :
- `node tests/backend/run.mjs` : 78/78 (le test de l'entonnoir envoie `pro_offer` et `ad_shown` et les retrouve au tableau de bord)
- `tests/ui/support_ui.py` (tableau de bord) : 39/39 ; un premier passage a raté une fois « the member shows as online »
  (attente trop courte, sans lien avec ce changement), réussi au passage suivant
- script de la page du tableau de bord analysé : sans erreur

Reste au propriétaire : rien.
