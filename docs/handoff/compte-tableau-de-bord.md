Statut : PRÊT
Branche : compte/tableau-de-bord
Conversation : 3. Comptes, paiements & serveur

Résumé :
1. Tableau de bord privé du propriétaire, `https://admin.stalak.app/admin/` (hors de l'app), réservé à son e-mail par
   Cloudflare Access. Il montre :
   - inscrits (total, vérifiés, 30 jours), abonnés Pro (mensuels, annuels, résiliés en cours), revenu mensuel estimé,
     encaissé sur 30 jours et depuis le début, remboursements ;
   - visiteurs en direct (FR / EN) ;
   - évolution jour par jour (7, 30 ou 90 jours) : visites, inscriptions, nouveaux Pro, encaissé, questions au glaçon,
     paroles auto, sauvegardes en ligne, nouveaux messages. Un graphique par mesure, info-bulle, vue en tableau ;
   - usage des fonctions (paroles auto, sauvegarde en ligne avec place prise, glaçon IA avec la limite du jour, messages) ;
   - derniers inscrits ;
   - messages des visiteurs : liste (nouveaux, en ligne), conversation, ce que montrait la page, compte et offre du visiteur,
     réponse (Ctrl + Entrée), envoi par e-mail « si absent / toujours / jamais », fermer, rouvrir, supprimer ;
     interrupteur « Je suis disponible », notifications du navigateur, titre de l'onglet avec le nombre de nouveaux messages.
2. Glaçon d'aide : bouton « Parler à un humain » (stalak.app seulement, pas sur claude.ai).
   - Propriétaire disponible (interrupteur + tableau de bord ouvert depuis moins de 3 min) : direct, e-mail facultatif.
   - Sinon : le visiteur laisse son e-mail ; le propriétaire reçoit un e-mail « Stalak : nouveau message » (sur contact@,
     au plus 1 par conversation toutes les 15 min et 50 par jour), avec le lien vers la conversation.
   - Réponse du propriétaire : affichée en direct dans la bulle, ou envoyée par e-mail si la page du visiteur ne l'a pas
     récupérée en 20 s (adresse de réponse contact@stalak.app). La conversation reste 30 jours sur l'appareil du visiteur.
3. Sécurité de l'accès : le serveur ne fait pas seulement confiance à Access. À chaque requête, il vérifie l'hôte
   (`ADMIN_HOST`), la signature RS256 du jeton Access (clés de l'équipe, rechargées si elles tournent), `iss`, `aud`, `exp`,
   `nbf` et l'e-mail (`ADMIN_EMAILS`). Ailleurs (stalak.app, pages.dev) : 404. Page sous CSP stricte à nonce, `no-store`,
   `noindex`, non intégrable. Écritures : JSON + Origin du tableau de bord.
4. Données nouvelles (migration 0006) : paiements et remboursements reçus de Paddle (le revenu part de la mise en ligne),
   visites (nombre au hasard par page ouverte, sans cookie ni IP, 90 jours), compteurs par jour (glaçon, sauvegardes,
   messages), conversations (effacées après 6 mois, avec le compte, ou par le bouton Supprimer).
5. Petite correction demandée dans STATUS : le guide anglais du glaçon dit maintenant « Music video (also called Clip mode) ».
6. Faux D1 des tests : `run()` renvoie maintenant les lignes d'un SELECT, comme le vrai D1 (nécessaire pour `batch`).

Skills utilisés : `context7` (docs Cloudflare Access, Paddle, Zero Trust), `dataviz` (graphiques : une mesure par graphique,
couleur validée par son script en clair et en sombre, info-bulle, vue tableau), `appsec-review` (revue de sécurité :
`docs/appsec-review-tableau-de-bord.md`, 2 points corrigés : écritures D1 trop fréquentes, réponse perdue si le visiteur
part juste avant).

Fichiers touchés :
- nouveaux : `functions/_lib/admin.js`, `functions/_lib/admin-page.js`, `functions/_lib/support.js`, `functions/_lib/metrics.js`,
  `functions/admin/[[path]].js`, `migrations/0006_admin_support.sql`, `tests/ui/support_ui.py`,
  `docs/appsec-review-tableau-de-bord.md`, `docs/handoff/compte-tableau-de-bord.md`
- modifiés : `functions/_lib/router.js` (routes admin, support, presence ; compteur de sauvegarde ; suppression de compte),
  `functions/_lib/paddle.js` (paiements, remboursements, événements `adjustment.*`), `functions/_lib/help.js` (compteurs),
  `functions/_lib/help-guide.js` (Clip mode), `functions/_lib/oauth.js` (`jwksFor` exporté), `src/app.js` (bloc d'aide :
  « Parler à un humain », signe de vie ; clés `help.h.*` et `help.human` à la fin des dictionnaires), `src/markup.html`
  (1 bouton), `src/theme.css` (styles avec commentaire du domaine), `site_src/confidentialite.html`, `site_src/en/privacy.html`,
  `wrangler.toml` (`ADMIN_HOST`), `BACKEND.md` (étape 13 + routes + sources), `docs/STATUS.md`, `tests/backend/run.mjs`,
  `tests/backend/fake-d1.mjs`, `tests/ui/server.mjs` (Access imité pour les tests), `public/` (reconstruit)

Migration SQL : **oui, `migrations/0006_admin_support.sql`**, à coller en entier dans la console D1 AVANT de publier.
Elle ne fait que créer des tables (`payments`, `refunds`, `visits`, `daily_counts`, `tickets`, `ticket_messages`,
`admin_state`) et des index, avec `IF NOT EXISTS` : sans danger pour l'existant. Le SQL complet est dans le fichier.

Tests (branche partie de main d997e9b) :
- `node tests/backend/run.mjs` : 62/62 (5 nouveaux : accès admin, conversation complète avec e-mails, compte et limites,
  visites, paiements et statistiques)
- `tests/ui/support_ui.py` : 34/34 (visiteur FR 390 px sans personne, tableau de bord 1280 px et 390 px, réponse par e-mail,
  direct en EN 1280 px, reprise après rechargement, pas de tableau de bord sans Access, version claude.ai)
- `tests/ui/help_ui.py` : 42/42 ; `tests/ui/lyrics_ui.py` : 85/85
- sans défilement horizontal, sans erreur de page (CSP stricte comprise), FR et EN
- non lancé : `tests/ui/test_cloud.py` (vidéos VP9 absentes du dépôt ; le seul ajout côté sauvegarde est un compteur,
  couvert par les tests serveur) ; vrai Cloudflare Access (à vérifier une fois configuré)

Ordre de mise en ligne (Chef de projet) :
1. migration 0006 dans la console D1 ;
2. fusion et publication (le tableau de bord reste éteint tant que les 2 secrets de l'étape 13.4 manquent : rien ne casse) ;
3. étapes 13.2, 13.4 et 13.5 de BACKEND.md (13.3 est faite) ;
4. vérifier : `https://admin.stalak.app/admin/` (code par e-mail puis tableau de bord), `https://stalak.app/admin/` (404),
   un message « Parler à un humain » envoyé depuis stalak.app arrive dans le tableau de bord et sur contact@.

Reste au propriétaire ou au Chef de projet (BACKEND.md, étape 13, environ 10 minutes) :
- Zero Trust et l'application Access « admin » : déjà faits le 27/10 (équipe `small-band-a6ef`, déjà dans `wrangler.toml`) ;
- vérifier que `admin.stalak.app` est bien un domaine personnalisé du projet Pages `stalak-site` (13.2) ;
- saisir 2 secrets dans Cloudflare : `ACCESS_AUD` (AUD Tag de l'application « admin ») et `ADMIN_EMAILS` (l'e-mail du propriétaire) ;
- Paddle : cocher `adjustment.created` et `adjustment.updated` dans la destination du webhook ;
- facultatif : règle de redirection admin.stalak.app/ → /admin/.

À signaler :
- Juridique : 3 paragraphes ajoutés à la politique de confidentialité FR/EN (paiements reçus de Paddle, statistiques de visite,
  « Parler à un humain »), à relire.
- Les conversations avec l'IA du glaçon ne sont toujours pas gardées (décision déjà prise) ; seuls les messages « Parler à un
  humain » le sont.
