# AppSec review — « Parler à un humain » réservé à Stalak Pro (branche `compte/humain-pro`)

Scope / authority: dépôt `99SAYSO/stalak`, base `main` @ `dc3919e`, cible = branche `compte/humain-pro`.
Serveur : `functions/_lib/support.js` (création et écriture réservées à Pro), `functions/_lib/admin.js` (badge Pro),
`functions/_lib/admin-page.js` (badge), `functions/_lib/help-guide.js` (texte). Client : bloc d'aide de `src/app.js`,
`src/markup.html` (ligne Pro), `src/theme.css`. Revue locale (faux D1, faux Access). Revue d'origine de la fonction :
`docs/appsec-review-tableau-de-bord.md`.

Threat model: inchangé, sauf la frontière d'autorisation : `POST /api/support/tickets` et `POST /api/support/tickets/:id/messages`
demandent maintenant une session (`stalak_s`) d'un compte Stalak Pro ; écrire demande en plus que la conversation soit celle
de ce compte. `GET /api/support/tickets/:id` reste lisible avec le jeton seul (l'ex-Pro garde les réponses reçues).

Release advice: **proceed within reviewed scope** (aucune migration).

| ID | Gravité / confiance | Fichier | Conditions / impact | Correction / test |
|---|---|---|---|---|
| H1 | Moyenne si absent / contrôle confirmé | `support.js` création | Sans contrôle serveur, l'écran « Réservé à Stalak Pro » du glaçon (client) se contournerait par un appel direct. | `requireUser` + `requirePro` côté serveur, **avant** toute limite ou écriture. Tests : 401 sans session, 403 `pro_required` en gratuit, rien créé, aucune ligne de limite. |
| H2 | Moyenne si absent / contrôle confirmé | `support.js` écriture | Un jeton de conversation seul ne doit pas suffire à écrire (appareil partagé, ex-Pro, autre compte). | Session Pro + `t.user_id === user.id`, sinon 404 ; ex-Pro → 403. Tests : sans session 401, autre compte Pro 404, ex-Pro 403, anciennes conversations sans compte 404. |
| H3 | Faible / hypothèse acceptée | `support.js` | Un membre Pro peut donner une autre adresse (`email`) pour les réponses : elles y partent quand tu réponds. Pas d'envoi automatique au visiteur, donc pas de relais de spam. | Accepté (comme avant, A6). L'interface n'envoie que l'adresse du compte. |
| H4 | Info | `app.js` | Sur un appareil partagé, la conversation d'un autre compte n'est plus montrée : le ticket local garde l'id du compte et s'efface si le compte change. | Inspection + scénario d'interface (ex-Pro sur le même appareil). |

Autres vérifications : badge Pro du tableau de bord calculé avec la même règle que le site (`subscriptionGivesPro`) ;
lecture des réponses par un ex-Pro (test) ; la page Pro s'ouvre avec la raison `support` ; aucun texte venant d'un visiteur
n'est inséré en HTML (le lien `mailto:` est construit avec `textContent` et l'adresse de la build).

Dependencies: aucune ajoutée. Secrets hygiene: aucun secret touché ni ajouté.

| Check | Statut | Commande | Résultat |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 62/62 (tests « Parler à un humain » réécrits pour la règle Pro) |
| Scénario complet | PASS | `tests/ui/support_ui.py` | 39/39 : déconnecté, gratuit, Pro absent, Pro en direct, ex-Pro, tableau de bord 1280 et 390, FR et EN |
| Bulle d'aide | PASS | `tests/ui/help_ui.py` | 42/42 |
| Version claude.ai | PASS | idem | se charge ; pas de bouton |

Coverage / residual risk: aucune nouvelle surface d'écriture. Les conversations ouvertes avant cette version par des
visiteurs sans compte restent lisibles par leur jeton et ne peuvent plus recevoir de message du visiteur (tu peux y répondre).

Handoff: Chef de projet (fusion, mise en ligne) ; Marketing (page Tarifs : ajouter « Parler à un humain » à Pro) ;
Chef de projet (STALAK_CONTEXTE.md, section 2 : l'offre Pro change).
