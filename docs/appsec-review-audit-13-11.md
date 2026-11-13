# AppSec review — compte/audit-13-11
Scope / authority : dépôt `99SAYSO/stalak`, branche `compte/audit-13-11` (arbre de travail) contre `origin/main`. Fichiers serveur : `functions/_lib/cloud.js` (fin d'envoi en morceaux), `functions/_lib/metrics.js` (raisons d'ouverture des formules, évènement `clip_open`), `functions/_lib/admin.js` / `admin-page.js` (affichage). Côté page : `src/app.js` (raison `from`). Tests locaux uniquement (faux R2, faux D1), aucun service réel touché.

Threat model : biens = fichiers des abonnés dans R2, lignes `project_files` / `file_parts`, compteurs anonymes `daily_counts`. Acteurs = abonné connecté (envoi), visiteur anonyme (`POST /api/event`), propriétaire (tableau de bord). Entrées = `POST /api/projects/:id/files/:fileId/complete` (compte requis, la ligne doit appartenir au compte : `uploadingRow` inchangé) et `POST /api/event` (liste blanche).

Release advice : **proceed within reviewed scope**.

| ID | Sévérité / confiance | Fichier | Conditions / impact | Correction / test |
|---|---|---|---|---|
| A1 | Faible / confirmé (corrigé) | cloud.js `complete` | Une erreur R2 à l'assemblage donnait une 500 sans issue (12/11, 7 h 27 UTC). | Erreur rangée : déjà assemblé → 200 ; envoi disparu → nouvel envoi, 409 `parts_missing` ; morceau refusé → 409 ; autre → 503 `storage_busy`. Test backend « audit 13/11 n°5 » (4 cas). |
| A2 | Info / vérifié | cloud.js `completeFailed` | Le nouvel envoi R2 et l'effacement des morceaux ne touchent que la ligne du compte connecté (`user_id`, `project_id`, `id` venant de `uploadingRow`). Le message d'erreur R2 n'est jamais renvoyé à la page (seulement 120 caractères dans le journal). | Revue de code. |
| A3 | Info / vérifié | metrics.js | `why` et `clip_open` : liste blanche, toute autre valeur → `other` ; aucune donnée personnelle. | Test backend « audit 13/11 : plan openings… » (`DROP TABLE` → `other`). |
| A4 | Info / hypothèse | — | Pas d'en-tête Content-Security-Policy (point 4, plus tard). | Plan dans le compte rendu : d'abord `Content-Security-Policy-Report-Only`. |

Dependencies : aucune ajoutée ni changée.
Secrets hygiene : aucun secret ajouté ; aucune clé dans les fichiers modifiés (inspection du diff).

| Check | Statut | Commande | Résultat |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 107/107 |
| Formules (page) | PASS | `tests/ui/plans_ui.py` sur `cloud-server.mjs` | 35/35 |
| Compteurs envoyés par la page | PASS | `tests/ui/audit_ui.py public` | 158/158 |
| Support + tableau de bord | PASS | `tests/ui/support_ui.py` sur `server.mjs` | 64/64 |
| Vrai R2 en production | NOT RUN | — | messages d'erreur réels de R2 non vus ; le cas inconnu donne 503 (jamais 500) |

Coverage / residual risk : les textes exacts des erreurs R2 réelles peuvent différer ; un texte inconnu retombe sur 503 « réessayer », pas sur une perte de fichier.
CEO handoff : Chef de projet (intégration) ; App (envoyer `clip_open`).
