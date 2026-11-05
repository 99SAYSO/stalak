Statut : PRÊT
Branche : compte/comptes-emails
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` d801153 (demande du propriétaire du 5/11 : e-mail et pseudo dans « Nouveaux comptes »)
Maquette : https://compte-comptes-emails.stalak-site.pages.dev/admin-demo/#signups (démo, fausses données)

Résumé :
- Tableau de bord → **Nouveaux comptes** : chaque ligne montre maintenant le **pseudo** (en gras ; « — » s'il n'y en a pas) et
  l'**e-mail**, en plus de la date, du pays, de la provenance et de la formule. Sur téléphone, l'e-mail passe sous le pseudo.
- Inchangé : aucun e-mail ni pseudo sur l'Accueil, dans les notifs Telegram / ntfy ni dans la démo de la maquette (qui garde ses
  fausses adresses `@demo.stalak`, avec des pseudos inventés).

Skills utilisés : `appsec-review` (`docs/appsec-review-comptes-emails.md`), `ui-ux-pro-max` (mise en page de la ligne au téléphone).

Fichiers touchés :
- nouveaux : `docs/appsec-review-comptes-emails.md`
- modifiés : `functions/_lib/admin.js` (`signupList` renvoie `email` et `name`), `functions/_lib/admin-page.js` (liste et styles),
  `functions/_lib/admin-demo-data.js` (régénéré), `tests/fixtures/dashboard-seed.mjs` (pseudos inventés), `tests/backend/run.mjs`,
  `tests/ui/support_ui.py`, `BACKEND.md` (13), `docs/STATUS.md`

Migration SQL : aucune (le pseudo et l'e-mail existent déjà dans la base).

Tests :
- `node tests/backend/run.mjs` : 90/90. Le test « aucune adresse e-mail » vaut maintenant pour l'Accueil (ni « @ » ni pseudo),
  Telegram (inchangé) et la démo (toutes les adresses `@demo.stalak`, aucune sur l'Accueil de la démo) ; la liste, elle, doit donner
  l'e-mail et le pseudo, et `null` (affiché « — ») sans pseudo.
- `tests/ui/support_ui.py` : 54/54 (pseudo ou « — » + e-mail sur chaque ligne, e-mail sous le pseudo au téléphone, pas d'« @ » sur
  l'Accueil, aucun défilement horizontal, aucune erreur CSP).

Pour Juridique : rien ne change dans ce qui est collecté (seul le propriétaire voit ces données sur son tableau de bord).

Reste au propriétaire : regarder la maquette, puis donner son « ok ».
