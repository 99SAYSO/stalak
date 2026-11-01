Statut : PRÊT
Branche : compte/tableau-de-bord-v2
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` ff69d15 (demande du propriétaire du 1/11 : refaire le tableau de bord privé)

Résumé :
- Page refaite (`functions/_lib/admin-page.js`) dans le style de Stalak, en plus sobre : bandeau bleu avec le logo, cartes blanches
  au contour encre, gros chiffres, bleu de la marque ; clair et sombre ; ordinateur et téléphone.
- 6 onglets : **Aujourd'hui**, **Utilisateurs**, **Argent**, **Entonnoir**, **Messages**, **Santé du serveur** ; un lien d'e-mail
  `#t=…` ouvre directement la conversation. Choix de la période : 7 j, 30 j, 90 j, tout (2 ans au plus).
- Chaque chiffre a sa phrase d'explication simple. Les chiffres venus des paiements de test (Paddle sandbox) sont marqués
  **TEST** partout, avec un bandeau.
- Données nouvelles (`/api/admin/stats`, fonction `insights`) :
  - carte du monde : comptes et visites par pays (bascule Comptes / Visites) + liste des pays avec les nombres ;
  - inscriptions par jour, e-mail ou Google (les anciens comptes Google sont reconnus), langues, appareils (iPhone/iPad,
    Android, ordinateur) ;
  - visites : provenance (`?ref=`, Google, TikTok, Instagram…, déjà envoyée par la page depuis Marketing), appareils, langues,
    visites de retour (oui/non) ; comptes revenus (reconnexion un autre jour que l'inscription) ;
  - entonnoir avec taux de passage (visite → vidéo exportée → offre Pro → page des formules → fenêtre de paiement → abonnés),
    exports ratés et pourquoi, pubs demandées / affichées / regardées, ce qui ouvre la page des formules ;
  - argent : abonnés par formule, revenu mensuel, encaissé sur la période, nouveaux abonnés, désabonnements et arrêts prévus,
    remboursements ;
  - santé : erreurs serveur, alertes, limites du jour (e-mails de code, glaçon IA, minutes de paroles auto), stockage ;
  - messages en attente (badge sur l'onglet).
- Pays : seul le pays donné par Cloudflare (`request.cf.country`, 2 lettres) est enregistré, à l'inscription (e-mail ou Google) et
  sur les visites ; **jamais l'adresse IP ni la ville**. L'appareil est une simple catégorie lue dans le nom du navigateur.
- « Déjà venu » : la page garde dans le navigateur la date de la dernière visite et envoie seulement oui/non (1 ligne dans
  `src/app.js`, à côté du signe de vie).
- Carte : fichier de données `functions/_lib/admin-map.js` (174 pays, noms en français, 83 Ko), généré une fois (Natural Earth,
  domaine public) ; aucun script externe (la CSP stricte du tableau de bord est gardée).
- En plus (demandé « si tu as le temps ») : **`docs/PADDLE_PRODUCTION.md`**, la marche à suivre pour passer Paddle en vrais paiements.
  Le bouton « Renoncer au contrat ici » attend le cahier des charges de Juridique (pas encore écrit dans STATUS).

Captures : envoyées au propriétaire dans la conversation (les 6 onglets sur ordinateur et téléphone, plus 2 en mode sombre), avec
des données de démonstration (`/__test/seed-dashboard` du serveur de test).

Skills utilisés : `dataviz` (une mesure par graphique, une seule couleur, listes à barres légendées au lieu de couleurs à décoder,
dégradé bleu pour la carte, info-bulles, vue en tableau) ; `appsec-review` (revue : `docs/appsec-review-tableau-de-bord-v2.md`).

Fichiers touchés :
- nouveaux : `functions/_lib/admin-map.js`, `migrations/0010_dashboard.sql`, `docs/PADDLE_PRODUCTION.md`, `docs/appsec-review-tableau-de-bord-v2.md`
- modifiés : `functions/_lib/admin-page.js` (réécrit), `functions/_lib/admin.js` (`insights`, période « tout »), `functions/_lib/metrics.js`
  (`countryOf`, `deviceOf`, visites), `functions/_lib/auth.js`, `functions/_lib/oauth.js` (pays, appareil, façon de s'inscrire),
  `src/app.js` (oui/non « déjà venu » dans le signe de vie), `BACKEND.md` (étape 13), `docs/STATUS.md`,
  `tests/backend/run.mjs`, `tests/ui/support_ui.py`, `tests/ui/server.mjs` (données de démonstration), `public/` reconstruit

Migration SQL : **oui, `migrations/0010_dashboard.sql`**, à coller dans la console D1 AVANT de publier :

    ALTER TABLE users ADD COLUMN country TEXT;
    ALTER TABLE users ADD COLUMN device TEXT;
    ALTER TABLE users ADD COLUMN signup_method TEXT;
    ALTER TABLE visits ADD COLUMN country TEXT;
    ALTER TABLE visits ADD COLUMN device TEXT;
    ALTER TABLE visits ADD COLUMN source TEXT;
    ALTER TABLE visits ADD COLUMN came_back INTEGER;

Sept colonnes vides, rien d'effacé. À ne lancer qu'une fois. Les comptes et visites d'avant restent « pays inconnu ».

Tests :
- `node tests/backend/run.mjs` : 80/80 (nouveau : pays et appareil à l'inscription et sur les visites, jamais d'IP ni de ville, provenance,
  façon de s'inscrire, retours, limites, périodes, « test » en sandbox et pas en production)
- `tests/ui/support_ui.py` : 43/43 (6 onglets, chiffres expliqués, carte, graphiques, tableau, TEST, messages, téléphone sans
  défilement de côté sur les 6 onglets, aucune erreur avec la CSP stricte) ; `tests/ui/help_ui.py` : 42/42 (dont la version claude.ai)
- correction d'un test instable (« the member shows as online » attend maintenant jusqu'à 12 s)

Ordre de mise en ligne (Chef de projet) : migration 0010 → fusion → publication → ouvrir admin.stalak.app et regarder les 6 onglets.

Reste au propriétaire : rien à saisir.

À signaler :
- **Juridique** : ajouter à la politique de confidentialité (FR et EN) une phrase du genre : « Pour nos statistiques, nous enregistrons
  le pays (déduit par notre hébergeur Cloudflare, jamais l'adresse IP ni la ville) et le type d'appareil lors de l'inscription et des
  visites, ainsi que, dans ton navigateur, la date de ta dernière visite pour savoir si tu es déjà venu. » À adapter.
- **App** : une ligne ajoutée dans le signe de vie de `src/app.js` (`VISIT_BACK`) ; rien d'autre de son domaine.
