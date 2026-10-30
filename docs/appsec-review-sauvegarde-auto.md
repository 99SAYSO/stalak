# AppSec review — compte/sauvegarde-auto (sauvegarde automatique Creator Plus, anglais d'abord, guide sans concurrent)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/sauvegarde-auto` partie de `main` 5ea00e4 ; copie de travail locale.
Serveur relu : `functions/_lib/router.js` (`PUT /api/projects/:id`), `auth.js` (`normalizeLang`, langue du code), `email.js`,
`cloud.js` (e-mail des 6 mois), `support.js` (langue des tickets et de l'e-mail de réponse), `help.js`, `help-guide.js`, `metrics.js`,
`oauth.js`, `admin-page.js`. Page : `src/account.js`, bloc compte de `src/app.js` (objet `AS`), `src/markup.html`.
Environnement : tests locaux (faux D1 node:sqlite, faux R2, Paddle et Resend imités). Exclus : vrai Cloudflare, vrai Paddle.

Threat model:
- Biens : les projets et fichiers en ligne d'un compte (R2 + D1), l'espace de 100 Go, le nom des projets, les compteurs du tableau de bord.
- Acteurs : abonné Creator Plus (sa propre page, qui enregistre seule), compte gratuit, site tiers (CSRF), page modifiée à la main.
- Entrées : `PUT /api/projects/:id` désormais appelé automatiquement (toutes les 4 s au plus si le projet change), champ `lang`
  des inscriptions, connexions, mot de passe oublié, tickets et visites.
- Frontières : navigateur → Functions (cookie + Origin + JSON, `requirePlan('cloud')`), Functions → D1 / R2 / Resend.

Release advice: proceed within reviewed scope (aucune migration).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| F-1 (corrigé) | Faible / confirmé | `functions/_lib/router.js` PUT projet | Avec la sauvegarde automatique, une page modifiée (ou un bug) pourrait envoyer des enregistrements sans fin : charge D1 et compteur `cloud_save` gonflé. | Limite de 900 enregistrements par heure et par compte (`429`) ; `cloud_save` compté pour un **nouveau** projet seulement. Test « automatic saving : … rate limit per account ». |
| F-2 (par conception) | Info / confirmé | `functions/_lib/router.js` PUT projet | `name` absent ou `null` garde le nom en ligne (`COALESCE`) ; un nouveau projet sans nom reçoit un nom vide (la Galerie affiche alors la date). Aucun accès à un autre compte : la clé est toujours `(user_id, id)`. | Test « PUT without a name keeps the name ». |
| F-3 (accepté) | Faible / confirmé | `functions/_lib/auth.js` `normalizeLang` | Langue par défaut passée de `fr` à `en` : un compte créé avant avec une langue autre que `en` est enregistré `fr` ; il reçoit ses e-mails en français jusqu'à sa prochaine connexion depuis la page (la langue est alors mise à jour). Pas un problème de sécurité. | Test « English first : code e-mails in English unless the page is in French ». |
| F-4 (accepté) | Info / confirmé | `src/app.js` `asTick` | L'arrêt pendant un export est fait par la page (comme toute la page) ; une page modifiée peut enregistrer pendant un export, sans autre effet qu'un export plus lent chez elle. | Test d'interface : rien d'envoyé pendant 10 s d'export, enregistrement juste après. |

Contrôles vérifiés :
- Droits inchangés : `requirePlan(env, user, 'cloud')` sur toutes les routes `/api/projects*` (Creator Plus) ; refus `403 pro_required` pour un
  compte gratuit (test existant). Fichiers : seulement ceux du compte (`u/<compte>/…`), empreinte et taille vérifiées (tests existants).
- Requêtes SQL liées (`bind`), aucune concaténation. CSRF : JSON + Origin inchangés.
- Langue : la valeur reçue n'est jamais recopiée, elle devient `fr` ou `en` (`normalizeLang`, tickets, visites, aide, OAuth) ; le `lang` du HTML
  des e-mails vient de cette valeur fixe.
- Paddle : la fenêtre de paiement reçoit `locale` = langue de la page (`fr` ou `en`), rien d'autre ne change dans le paiement.
- Guide d'aide : aucun nom d'application concurrente (test serveur), règle « ne cite et ne compare aucune autre application » en FR et EN.

Dependencies: aucune dépendance ajoutée ni modifiée. Contrôle d'avis de sécurité : NOT RUN (sans objet).

Secrets hygiene: aucune clé ni mot de passe ajouté. Inspection du diff : PASS. La sonde de test `window.__ev` n'est ajoutée que par le serveur
de test `tests/ui/cloud-server.mjs` (comme `tests/ui/server.mjs`), jamais dans `public/` (vérifié : 0 occurrence).

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 70/70 |
| Sauvegarde automatique + Galerie (390 px FR, 1280 px EN) | PASS | `tests/ui/gallery_ui.py` sur `tests/ui/cloud-server.mjs` | 49/49 |
| Formules / Paddle imité | PASS | `tests/ui/plans_ui.py` | 30/30 |
| « Parler à un humain » + tableau de bord | PASS | `tests/ui/support_ui.py` | 39/39 (e-mail de réponse en 19,3 s) |
| Glaçon d'aide + version claude.ai | PASS | `tests/ui/help_ui.py` | 42/42 |
| Lecture du diff serveur | PASS | `git diff origin/main -- functions/` | voir ci-dessus |
| Vrai Cloudflare R2 / vrai Paddle | NOT RUN | — | à vérifier après publication |

Coverage / residual risk: comportement sur un vrai iPhone (onglet mis en arrière-plan pendant un envoi : l'envoi reprend au retour, par
morceaux) non vérifié ici ; coût R2 : chaque fichier n'est envoyé qu'une fois par projet, l'état JSON est petit (256 Ko au plus).

CEO handoff: Chef de projet — fusionner et publier (aucune migration) ; vérifier sur iPhone avec un compte Creator Plus : charger l'exemple,
voir « Enregistré ✓ », le retrouver dans la Galerie, le renommer, le modifier, vérifier que le nom reste.
