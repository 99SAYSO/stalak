# AppSec review — compte/heures (« Heure par heure » du tableau de bord)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/heures` partie de `main` be731f3 ; copie de travail locale.
Relu : `functions/_lib/admin.js` (`hourly`, route `hours`), `functions/_lib/metrics.js` (`bumpHour`, nettoyage),
`functions/_lib/admin-page.js` (page), `migrations/0013_hourly_counts.sql`, `tools/admin_demo_data.mjs`, données de démo.

Threat model: nouvelle route admin en lecture (`GET /api/admin/hours?period=&tz=`) ; nouvelle écriture anonyme : `POST /api/event`
`export_ok` ajoute +1 au compteur de l'heure (route déjà publique, déjà limitée à 120 par connexion et par heure).

Release advice: proceed within reviewed scope (migration 0013 avant de publier).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| H-1 (maîtrisé) | Faible / confirmé | `admin.js` `hourly` | Paramètres sur liste blanche (`today`/`7`/`30`, `paris`/`ny`, sinon valeurs par défaut) ; requêtes liées ; résultat agrégé (24 lignes de nombres), aucune donnée personnelle. Route derrière `requireAdmin`. | Test « hour by hour » : valeurs inconnues → today/paris ; refus sans Access. |
| H-2 (maîtrisé) | Faible / confirmé | `metrics.js` `bumpHour` | Compteur anonyme (heure + nom, ni IP ni compte ni appareil), seulement `export_ok` ; quelqu'un peut gonfler le chiffre comme avant (même limite par connexion). Table bornée : 24 lignes par jour, effacées après 90 jours. | Test : un export → +1 dans l'heure ; `export_start` ne compte pas. |
| H-3 (maîtrisé) | Faible / confirmé | `admin-page.js` | Affichage par `textContent` ; largeur des barres par CSSOM (compatible avec la CSP stricte). | `support_ui.py` : aucune erreur CSP, 24 barres réelles. |
| H-4 (maîtrisé) | Faible / confirmé | `admin-demo-data.js` | La démo n'a que des chiffres inventés (base de test) ; pas d'adresse. | Test « dashboard demo » et « hour by hour » (la démo a les heures). |

Données collectées : un compteur d'exports par heure, anonyme (aucune donnée personnelle) → pas de changement nécessaire dans la
politique de confidentialité, mais Juridique peut préciser « compteurs anonymes par heure » s'il liste déjà les compteurs par jour.

Dependencies: aucune. Secrets hygiene: rien d'ajouté (PASS).

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 94/94 (heure de Paris / New York, heure d'été et d'hiver, moyenne, plus forte heure, exports par heure) |
| Interface | PASS | `tests/ui/support_ui.py` | 60/60 |
