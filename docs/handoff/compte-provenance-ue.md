Statut : PRÊT
Branche : compte/provenance-ue
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` be731f3 (demande urgente de Juridique du 5/11). **Note** : la branche `legal/provenance` n'était pas encore sur
GitHub ; cette branche n'en dépend pas (elle respecte la valeur « none » que le bouton de refus de la confidentialité écrit dans
`stalak:src`). Si le bouton écrit autre chose que « none » (ou « none|… »), me le dire.
Maquette : https://compte-provenance-ue.stalak-site.pages.dev/admin-demo/#signups (démo, fausses données)

Résumé :
- **Inscription depuis l'Europe** (UE, EEE, Royaume-Uni, Suisse, d'après le pays Cloudflare ; pays inconnu compris, par prudence) :
  la provenance n'est **pas** rattachée au compte. Le compte garde seulement « eu » ; on ajoute +1 au total anonyme de cette
  provenance pour le jour (`daily_counts` « src_eu:<provenance> »), une seule fois.
- **Ailleurs** : rattachée au compte comme avant.
- **Dans le navigateur** (`stalak:src`) :
  - gardé avec la date de la première visite, **jamais prolongé** par une nouvelle visite, **oublié après 13 mois** ;
  - **effacé après l'inscription** : remplacé par « done|date », qui ne contient plus de provenance et empêche d'en enregistrer une
    nouvelle (lui-même oublié après 13 mois) ;
  - « **none** » (refus sur la page de confidentialité) : jamais remplacé, jamais envoyé ;
  - les valeurs déjà enregistrées sans date (avant cette règle) sont datées du 5/11/2026.
- **Tableau de bord** → Nouveaux comptes : les comptes d'Europe affichent « Europe (anonyme) » ; en haut, un encadré « 🇪🇺 Comptes
  d'Europe : d'où ils viennent (30 jours) » montre les totaux anonymes, avec un « ? ».
- **Comptes déjà créés** : la migration 0014 transforme les provenances déjà gardées pour des comptes d'Europe en totaux anonymes.
- **Empreintes `thanks:`** (e-mail de remerciement) : effacées au bout de 3 ans par les tâches du jour (site et Worker quotidien).

Skills utilisés : `appsec-review` (`docs/appsec-review-provenance-ue.md`), `compliance-check` non lancé (les règles viennent de Juridique).

Fichiers touchés :
- nouveaux : `migrations/0014_provenance_eu.sql`, `tests/ui/provenance_ui.py`, `docs/appsec-review-provenance-ue.md`
- modifiés : `functions/_lib/router.js`, `functions/_lib/metrics.js`, `functions/_lib/admin.js`, `functions/_lib/admin-page.js`,
  `functions/_lib/thanks.js`, `functions/_lib/cloud.js`, `workers/cloud-cleanup/index.js`, `src/app.js`, `src/account.js`,
  `functions/_lib/admin-demo-data.js` (régénéré), `tests/fixtures/dashboard-seed.mjs`, `tests/backend/run.mjs`, `tests/ui/support_ui.py`,
  `BACKEND.md` (13), `docs/STATUS.md`, `public/` reconstruit

Migration SQL (à coller **en entier** dans la console D1 « stalak », **avant** de publier) : voir `migrations/0014_provenance_eu.sql`
(un `INSERT … SELECT` vers `daily_counts`, puis un `UPDATE users SET signup_source = 'eu'` pour les comptes d'Europe).

Worker quotidien : s'il est déployé, le redéployer pour l'effacement des empreintes (`npx wrangler deploy -c workers/cloud-cleanup/wrangler.toml`) ;
sinon le site le fait de lui-même (au plus toutes les 6 heures).

Tests :
- `node tests/backend/run.mjs` : 96/96 (nouveaux : Europe → « eu » + total anonyme, une fois, pour FR, CH, GB, NO et pays inconnu ;
  US inchangé ; « none » et « eu » ne gardent rien ; liste et totaux du tableau de bord ; migration 0014, relancée sans double compte ;
  empreintes `thanks:` effacées après 3 ans, branchées dans les deux tâches du jour).
- `tests/ui/provenance_ui.py` (nouveau) : 10/10 dans un vrai navigateur (date, pas de prolongation, oubli après 13 mois, ancienne valeur
  datée, « none » respecté et jamais envoyé, envoi unique à l'inscription puis effacement).
- `tests/ui/support_ui.py` : 57/57 (encadré Europe, « Europe (anonyme) »).

Pour Juridique : à vérifier dans la confidentialité : « pays inconnu = traité comme l'Europe » ; durée 13 mois non prolongée ;
« done » gardé après l'inscription (sans provenance) pour ne pas en réenregistrer une.

Reste au Chef de projet : migration 0014 avant de publier ; redéployer le Worker quotidien s'il est déployé.
