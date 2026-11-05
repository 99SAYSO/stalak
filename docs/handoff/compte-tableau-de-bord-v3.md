Statut : PRÊT
Branche : compte/tableau-de-bord-v3
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` fe32131 (demande du propriétaire du 5/11 : tableau de bord v3, « que même un enfant comprenne »)
Maquette : https://compte-tableau-de-bord-v3.stalak-site.pages.dev/admin-demo/ (démo du tableau de bord avec de **fausses données** ;
le vrai tableau de bord reste seulement sur admin.stalak.app)

Résumé :
- **Bug réglé** : l'onglet « Aujourd'hui » n'affiche plus les boutons 7 j / 30 j / 90 j / Tout ; ils ne sont plus que sur Visiteurs
  et pays, Argent, Du visiteur à l'abonné et Santé du serveur.
- **Menu ☰** (tiroir à gauche, grand au doigt, fermé par Échap ou en touchant à côté ; animation 240 ms à l'ouverture, 180 ms à la
  fermeture, coupée si « réduire les animations ») : Accueil, Aujourd'hui, Nouveaux comptes, Visiteurs et pays, Argent, Du visiteur à
  l'abonné, Messages (avec le nombre de non lus), Santé du serveur.
- **Accueil** (page d'ouverture), 6 grosses cartes, une phrase sous chaque chiffre, flèche verte ou rouge (avec le mot, pas seulement
  la couleur) :
  - argent gagné ce mois-ci, net de Paddle (le net de Paddle s'il est connu, sinon estimé), comparé aux mêmes jours du mois dernier,
    et le **prochain versement** (Paddle verse vers le 15 du mois suivant dès 100 $, sinon le solde est reporté) ;
  - abonnés (Pro / Creator Plus), nouveaux aujourd'hui (vs hier) et en 7 jours (vs les 7 jours d'avant) ;
  - visiteurs et comptes créés aujourd'hui (vs hier) ;
  - d'où viennent les gens sur 7 jours (4 premières sources, en mots simples) ;
  - alertes : messages à traiter, erreurs du serveur, e-mails de code presque au maximum, Telegram pas relié ; sinon « Tout va bien ✅ ».
- **Nouveaux comptes** : une ligne par compte créé (date, drapeau et pays, provenance : TikTok, Instagram, YouTube, Google, Lien direct,
  Annuaire (nom), « ?ref=… », Site …), formule actuelle (Gratuit / Pro / Creator Plus), jamais l'e-mail ; « Voir plus ».
- **Provenance enregistrée à l'inscription** : à la première visite, la page garde la source dans le navigateur (`localStorage`
  « stalak:src ») ; à l'inscription (e-mail ou Google), elle l'envoie une fois (`POST /api/account/source`) dans `users.signup_source`.
  Les comptes créés avant cette version n'ont pas de provenance (« inconnue »).
- **Globe 3D** à la place de la carte : tourner au doigt ou à la souris, pincer / molette / + − pour zoomer, flèches du clavier, toucher
  un pays pour voir ses visiteurs, comptes créés et abonnés ; rotation lente au départ, qui s'arrête dès qu'on le touche. Fluide :
  45 à 58 images par seconde mesurées (dessin sur un canvas, sans bibliothèque externe chargée).
- **Facile à lire** : un « ? » à côté de chaque chiffre affiche sa phrase ; les détails de « Visiteurs et pays » sont repliés
  (« Voir plus de détails »).
- **Démo sur la maquette** : `/admin-demo/` n'existe que sur les maquettes (`*.stalak-site.pages.dev`) ; fausses données fabriquées
  par le vrai code du serveur sur une base de test (`node tools/admin_demo_data.mjs`), adresses `@demo.stalak`, aucune requête au
  serveur (`connect-src 'none'`). Le vrai tableau de bord ne contient pas la démo.

Skills utilisés : `dataviz` (une seule teinte de bleu en dégradé pour le globe, flèches avec mot + couleur, peu de chiffres par
carte), `ui-ux-pro-max` (cartes, menu, cibles de 48 px, contrastes, téléphone 390 px sans défilement horizontal), `motion-design`
(tiroir 240/180 ms, ease-out-quart, transform/opacity seulement, réduit si demandé), `appsec-review` (`docs/appsec-review-tableau-de-bord-v3.md`).

Fichiers touchés :
- nouveaux : `migrations/0011_signup_source.sql`, `functions/admin-demo/[[path]].js`, `functions/_lib/admin-globe.js` (bibliothèques
  d3-geo / topojson et frontières, généré), `functions/_lib/admin-demo-data.js` (fausses données, généré), `tools/admin_demo_data.mjs`,
  `tests/fixtures/dashboard-seed.mjs` (données de démonstration, sorties de `tests/ui/server.mjs`), `docs/appsec-review-tableau-de-bord-v3.md`
- modifiés : `functions/_lib/admin.js`, `functions/_lib/admin-page.js`, `functions/_lib/router.js`, `src/app.js`, `src/account.js`,
  `BACKEND.md` (13), `docs/STATUS.md`, `tests/backend/run.mjs`, `tests/ui/server.mjs`, `tests/ui/support_ui.py`, `public/` reconstruit

Migration SQL (à coller dans la console D1 « stalak » **avant** de publier) :
```sql
ALTER TABLE users ADD COLUMN signup_source TEXT;
```

Tests :
- `node tests/backend/run.mjs` : 90/90 (4 nouveaux : provenance — une seule fois, refusée si invalide, sans session ou après 1 h ;
  Accueil — net Paddle ou estimé, versement, abonnés, sources, alertes, aucune adresse e-mail ; liste des comptes ; prochain versement
  avec report sous 100 $ ; démo — 404 sur stalak.app / admin.stalak.app / stalak-site.pages.dev, `connect-src 'none'`, pas de vraie
  donnée, et la vraie page sans la démo).
- `tests/ui/support_ui.py` 51/51 (menu ☰, Accueil, pas de période sur Aujourd'hui, « ? », Nouveaux comptes, globe, aucune erreur CSP,
  aucun défilement horizontal sur les 8 pages au téléphone) ; `tests/ui/help_ui.py` 42/42.
- Démo regardée au téléphone (390) et à l'ordinateur (1280), clair et sombre : globe qui tourne, zoom, pays touché (France), 0 erreur.

Pour Juridique : **nouvelle donnée collectée** → mettre à jour la politique de confidentialité : « la provenance de la première visite
(lien `?ref=`, `utm_source`, type de site ou nom du site d'origine, jamais l'adresse complète), gardée dans le navigateur puis avec
le compte à l'inscription, pour savoir quelles publications amènent des comptes ».

Reste au propriétaire : regarder la maquette (lien ci-dessus) sur téléphone et ordinateur, puis donner son « ok ». Rien à saisir.
Reste au Chef de projet : la migration 0011 avant de publier.
