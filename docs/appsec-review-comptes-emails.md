# AppSec review — compte/comptes-emails (e-mail et pseudo dans « Nouveaux comptes »)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/comptes-emails` partie de `main` d801153 ; copie de travail locale.
Relu : `functions/_lib/admin.js` (`signupList`), `functions/_lib/admin-page.js` (liste), `tests/fixtures/dashboard-seed.mjs`,
`tools/admin_demo_data.mjs` et `functions/_lib/admin-demo-data.js` (démo).

Threat model: l'e-mail et le pseudo des comptes (données personnelles) sortent maintenant de la base vers le tableau de bord,
à la demande du propriétaire. Seule entrée concernée : `GET /api/admin/signups` (propriétaire, Cloudflare Access + jeton vérifié
par le serveur, inchangé).

Release advice: proceed within reviewed scope.

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| CE-1 (maîtrisé) | Faible / confirmé | `admin.js` `signupList` | E-mail et pseudo renvoyés seulement par cette route admin (`requireAdmin`), au plus 100 lignes par appel ; l'Accueil (`home`) n'en renvoie pas. | Test « dashboard v3 » : e-mail et pseudo présents dans la liste, aucun « @ » ni pseudo dans `home`, refus sans Access. |
| CE-2 (maîtrisé) | Faible / confirmé | `admin-page.js` `signups` | Pseudo choisi par l'utilisateur : affiché par `textContent` (aucun `innerHTML`), donc pas d'injection dans la page. | `support_ui.py` : aucune erreur CSP. |
| CE-3 (maîtrisé) | Moyenne si raté / confirmé | `admin-demo-data.js` | La démo publique (maquettes) ne contient que des adresses inventées `fanN_K@demo.stalak` et des pseudos inventés (base de test). | Test « dashboard demo » : toutes les adresses de la démo sont `@demo.stalak`, aucune sur l'Accueil de la démo. |
| CE-4 (inchangé) | Info | `notify.js` | Les notifs Telegram / ntfy n'envoient toujours ni e-mail ni nom. | Test Telegram existant (« never e-mail, name or ids »). |

Dependencies: aucune. Secrets hygiene: aucun secret ajouté (PASS).

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 90/90 |
| Interface | PASS | `tests/ui/support_ui.py` | 54/54 (pseudo ou « — » + e-mail, e-mail sous le pseudo au téléphone, pas d'« @ » sur l'Accueil) |

Coverage / residual risk: quiconque a accès au tableau de bord voit les e-mails (aujourd'hui : le propriétaire seul, par Access).
Rien de nouveau n'est collecté : la politique de confidentialité n'a pas à changer.
