# AppSec review — compte/provenance-ue (provenance de la première visite et règles CNIL)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/provenance-ue` partie de `main` be731f3 (la branche `legal/provenance`
n'était pas encore sur GitHub) ; copie de travail locale.
Relu : `functions/_lib/router.js` (`account/source`), `functions/_lib/metrics.js` (`EUROPE`, `isEurope`), `functions/_lib/admin.js`
(`euSources`), `functions/_lib/admin-page.js`, `functions/_lib/thanks.js` (`purgeOldThanks`), `functions/_lib/cloud.js`,
`workers/cloud-cleanup/index.js`, `src/app.js` (`FIRST_SRC`), `src/account.js` (`sendSource`), `migrations/0014_provenance_eu.sql`.

Threat model: donnée personnelle concernée : la provenance de la première visite rattachée à un compte. Entrées : `POST /api/account/source`
(personne connectée, inchangé : CSRF, 256 octets, liste blanche, une fois, dans l'heure) ; lecture admin `GET /api/admin/signups`.

Release advice: proceed within reviewed scope (migration 0014 avant de publier).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| PU-1 (maîtrisé) | Moyenne (conformité) / confirmé | `router.js` `account/source` | Le pays vient de la base (Cloudflare à l'inscription), sinon de la requête ; inconnu = Europe. Compte d'Europe : seulement « eu » + compteur anonyme (`src_eu:<source>`, +1 une seule fois grâce à la même écriture conditionnelle). | Test « source from Europe » (FR, CH, GB, NO, pays inconnu ; une seule fois ; US inchangé). |
| PU-2 (maîtrisé) | Faible / confirmé | idem | « none » (refus) et « eu » envoyés par le navigateur ne gardent rien. | Même test. |
| PU-3 (maîtrisé) | Faible / confirmé | `migration 0014` | Les provenances déjà gardées pour des comptes d'Europe deviennent des totaux anonymes ; relancée par erreur, elle ne compte pas deux fois. | Test « migration 0014 ». |
| PU-4 (maîtrisé) | Faible / confirmé | `src/app.js`, `src/account.js` | Valeur datée, non prolongée, oubliée après 13 mois ; remplacée par « done|date » après l'inscription (plus aucune provenance dans le navigateur) ; « none » jamais remplacé ni envoyé. | `tests/ui/provenance_ui.py` 10/10. |
| PU-5 (maîtrisé) | Faible / confirmé | `thanks.js` `purgeOldThanks` | Empreintes `thanks:` effacées après 3 ans (tâches du jour du site et du Worker), seulement `event_type = 'thanks'`. | Test « thank-you hashes ». |
| PU-6 (à savoir) | Info | `admin.js` | Le nombre de comptes d'Europe d'une provenance rare sur un jour peut être 1 ; il n'est pas relié à un compte précis dans l'interface (liste « Europe (anonyme) », totaux sur 30 jours). | — |

Dependencies: aucune. Secrets hygiene: rien d'ajouté (PASS).

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 96/96 (3 nouveaux) |
| Navigateur (provenance) | PASS | `tests/ui/provenance_ui.py` | 10/10 |
| Tableau de bord | PASS | `tests/ui/support_ui.py` | 57/57 |
