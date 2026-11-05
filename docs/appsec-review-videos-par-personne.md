# AppSec review — compte/videos-par-personne (« Combien de vidéos par personne »)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/videos-par-personne` partie de `main` 176020f ; copie de travail locale.
Relu : `functions/_lib/metrics.js` (`event`, nettoyage), `functions/_lib/router.js` (route `event`, exclusion), `functions/_lib/admin.js`
(`videosPerPerson`, route `videos`), `functions/_lib/admin-page.js`, `src/app.js` (`VISIT_ID`, `acctEvent`), `src/account.js` (`event`),
`migrations/0015_video_counts.sql`.

Threat model: nouvelle donnée : un numéro de visite au hasard (`vid`, 24 caractères hexadécimaux, refait à chaque ouverture de page,
sans cookie) relié au nombre de vidéos du jour et à « iPhone oui/non ». Entrée : `POST /api/event` (public, déjà limité à 120 par
connexion et par heure, CSRF global). Sortie : route admin en lecture (agrégats seulement).

Release advice: proceed within reviewed scope (migration 0015 avant de publier).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| VP-1 (maîtrisé) | Faible / confirmé | `metrics.js` `event` | Seulement `export_ok` et `ad_ok`, seulement un `vid` au bon format (règle déjà utilisée pour les visites) ; rien sur le compte, l'e-mail ou l'IP n'est écrit. | Test : colonnes de `video_counts` = jour, vid, nom, n, ios ; mauvais vid / autre évènement → rien. |
| VP-2 (à savoir) | Faible / confirmé | `account.js` | Pour exclure le propriétaire et les agents de test, ces deux évènements partent avec la session (`credentials: 'same-origin'`). Le serveur lit la session uniquement pour comparer l'adresse à `ADMIN_EMAILS` / `STATS_EXCLUDE_EMAILS`, ne l'écrit nulle part. Les autres évènements restent sans session. | Test : propriétaire et agent connectés → non comptés ; un fan connecté → compté ; compteurs globaux inchangés. |
| VP-3 (maîtrisé) | Faible / confirmé | `metrics.js` | Une personne peut gonfler les chiffres avec de faux évènements (déjà vrai pour les compteurs) ; borné par la limite par connexion. Table effacée après 90 jours. | Test : ligne de 2020 effacée par le nettoyage. |
| VP-4 (maîtrisé) | Faible / confirmé | `admin.js` `videosPerPerson` | Route admin (`requireAdmin`), période sur liste blanche (7 / 30), requêtes liées, réponse agrégée. | Test : refus sans Access. |
| VP-5 (à savoir) | Info | — | Le `vid` est le même que celui des visites du même jour (`visits`, qui garde déjà pays, appareil, provenance de la visite) : en croisant les deux tables, on relie un nombre de vidéos à une visite (toujours sans compte). | À mentionner à Juridique. |

Dependencies: aucune. Secrets hygiene: rien d'ajouté (PASS) ; `STATS_EXCLUDE_EMAILS` n'est pas un secret (liste d'adresses de test).

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 96/96 (2 nouveaux) |
| Interface | PASS | `tests/ui/support_ui.py` | 62/62 |
| La page envoie le vid avec `export_ok` | PASS | Playwright sur le site construit | corps `{"name":"export_ok","vid":"…"}` ; `export_start` sans vid |
