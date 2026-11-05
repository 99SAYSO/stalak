# AppSec review — compte/tableau-de-bord-v3 (Accueil, menu ☰, provenance des comptes, globe 3D, démo sur la maquette)

Scope / authority: dépôt `99SAYSO/stalak`, branche `compte/tableau-de-bord-v3` partie de `main` fe32131 ; copie de travail locale.
Relu : `functions/_lib/router.js` (route `account/source`, `SIGNUP_SOURCE`), `functions/_lib/admin.js` (`home`, `signupList`,
`nextPayout`, `subsByCountry`), `functions/_lib/admin-page.js` (page, `DEMO_API`, globe), `functions/admin-demo/[[path]].js` (nouvelle
page de démo), `functions/_lib/admin-globe.js` et `admin-demo-data.js` (fichiers générés), `migrations/0011_signup_source.sql`,
`src/app.js` (`FIRST_SRC`), `src/account.js` (`sendSource`), `tools/admin_demo_data.mjs`.
Exclus : vrai Cloudflare Access, vrai hôte de maquette (non joignable depuis l'atelier).

Threat model:
- Biens : données des comptes (vie privée), chiffres de l'entreprise (revenu), tableau de bord réservé au propriétaire.
- Entrées nouvelles : `POST /api/account/source` (personne connectée, valeur venant de son navigateur) ; `GET /api/admin/home`,
  `GET /api/admin/signups?before=&limit=` (propriétaire) ; `GET /admin-demo/` (public, mais seulement sur les maquettes).
- Frontières : navigateur → API (session + contrôle CSRF global du routeur) ; propriétaire → admin (Access + jeton vérifié, inchangé) ;
  visiteur de la maquette → page de démo statique, sans aucun appel au serveur.

Release advice: proceed within reviewed scope (migration 0011 d'abord).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| V3-1 (maîtrisé) | Faible / confirmé | `router.js` `account/source` | Valeur choisie par le navigateur : une personne peut mentir sur sa provenance (fausse le chiffre, rien d'autre). Bornes : connecté seulement, CSRF global, corps ≤ 256 octets, liste blanche `SIGNUP_SOURCE` (lettres, chiffres, `_-.:`, ≤ 48), écrit **une fois** et seulement dans l'heure qui suit la création du compte (requête liée). | Test « signup source: sent once… » (400 si invalide, 401 sans session, une seule écriture, refus après 1 h). |
| V3-2 (maîtrisé) | Faible / confirmé | `admin-page.js` `sourceName`, `signups` | Texte venu de la base affiché : toujours par `textContent` (`el()`), aucun `innerHTML`. | `support_ui.py` « no page error (strict CSP) ». |
| V3-3 (maîtrisé) | Faible / confirmé | `admin.js` `home`, `signupList` | Nouvelles routes derrière `requireAdmin` ; aucune adresse e-mail renvoyée (la liste donne date, pays, source, mode, formule) ; `limit` borné (1–100), `before` numérique ; requêtes liées. | Test « dashboard v3 » : pas d'e-mail dans `home` ni `signups`, 403 sans Access. |
| V3-4 (maîtrisé) | Moyenne si raté / confirmé | `functions/admin-demo/[[path]].js` | La démo est servie sur `*.stalak-site.pages.dev` à 3 niveaux (maquettes) et localhost seulement ; 404 sur `stalak.app`, `admin.stalak.app` et `stalak-site.pages.dev`. Elle ne contient **que de fausses données** (générées sur une base de test, adresses `@demo.stalak`) et `connect-src 'none'` : elle ne peut rien demander au serveur, même sur une maquette reliée à la vraie base. GET/HEAD seulement, `noindex`. | Test « dashboard demo » (hôtes, CSP, pas de vraie donnée, page réelle sans démo). |
| V3-5 (maîtrisé) | Faible / confirmé | `admin-page.js` | La vraie page (`ADMIN_HTML`) a `DEMO = false` et ne contient pas les fausses données (deux pages construites à part). | Même test : `var DEMO = false`, ni « DÉMO avec », ni `@demo.stalak`. |
| V3-6 (à signaler) | Info | `src/app.js` `FIRST_SRC`, migration 0011 | **Nouvelle donnée collectée** : la provenance de la première visite (`?ref=`, `utm_source`, type de site d'origine, nom d'annuaire ou nom de domaine du site d'origine — jamais l'adresse complète) gardée dans le navigateur (`localStorage 'stalak:src'`) puis, à l'inscription, dans `users.signup_source`. À ajouter à la politique de confidentialité (Juridique). | — |
| V3-7 (maîtrisé) | Faible / confirmé | `admin-globe.js` | Code tiers exécuté dans la page admin : d3-array 3.2.4, d3-geo 3.1.1, topojson-client 3.1.0 (ISC), fichiers minifiés officiels copiés tels quels, dans le script à nonce (aucun CDN). Aucune entrée utilisateur ne leur arrive (seulement les frontières et des nombres). | Les versions sont écrites en tête du fichier. |

Dependencies: aucune dépendance npm ajoutée au site. Bibliothèques embarquées : d3-array 3.2.4, d3-geo 3.1.1, topojson-client 3.1.0
(sans avis de sécurité connu pour ces versions à ma connaissance ; recherche d'avis en ligne : NOT RUN). Frontières : world-atlas 2.0.2
(Natural Earth, domaine public).

Secrets hygiene: aucun secret ajouté. Le faux jeton de bot dans `tools/admin_demo_data.mjs` (`12345:demo…`) n'est pas une clé réelle
(il sert à afficher « Telegram relié » dans la démo). Inspection : PASS.

| Check | PASS / FAIL / NOT RUN | Command or inspection | Sanitized evidence |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 90/90 (4 nouveaux) |
| Interface (tableau de bord, bulle) | PASS | `tests/ui/support_ui.py`, `tests/ui/help_ui.py` | 51/51, 42/42 ; aucune erreur CSP sur ordinateur et téléphone |
| Démo : aucune requête, aucune erreur | PASS | Playwright sur `/admin-demo/` (390 et 1280, clair et sombre) | 0 erreur console, globe 45–58 images/s |
| Avis de sécurité en ligne des bibliothèques | NOT RUN | — | pas d'accès à une base d'avis à jour |
| Vrai hôte de maquette | NOT RUN | — | non joignable depuis l'atelier ; vérifié par test sur les noms d'hôte |

Coverage / residual risk: la provenance déclarée par le navigateur n'est pas une preuve (statistique seulement). Le globe tourne
dans le navigateur du propriétaire, sans effet côté serveur.

CEO handoff: Juridique — ajouter la provenance de la première visite (V3-6) à la politique de confidentialité ; Chef de projet —
appliquer la migration 0011 avant de publier.
