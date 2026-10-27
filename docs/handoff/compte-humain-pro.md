Statut : PRÊT
Branche : compte/humain-pro
Conversation : 3. Comptes, paiements & serveur

Résumé :
Décision du propriétaire (27/10) : « Parler à un humain » devient une fonction Stalak Pro.
- Serveur (`functions/_lib/support.js`) :
  - créer une conversation : session + Stalak Pro (`requireUser` + `requirePro`), vérifiés avant toute limite ou écriture ;
    401 `not_logged_in`, 403 `pro_required` ; les réponses vont à l'e-mail du compte ;
  - écrire dans une conversation : session Pro **et** conversation de ce compte (sinon 404) ; un ex-Pro reçoit 403 ;
  - lire : inchangé (jeton de la conversation) → un ex-Pro garde les réponses déjà reçues ;
  - les anciennes conversations sans compte restent lisibles, plus modifiables par le visiteur (le propriétaire peut y répondre) ;
  - e-mail au propriétaire : « Stalak Pro : nouveau message ».
- Glaçon (`src/app.js`, bloc `_bloc.compte.aide`) :
  - non connecté ou gratuit : petit écran « Réservé à Stalak Pro » + bouton « Découvrir Stalak Pro » (`acctOpen('support')`,
    la page Pro dit pourquoi) + « Tu peux aussi toujours écrire à contact@stalak.app » (lien mailto) ;
  - Pro : direct si le propriétaire est disponible, sinon « la réponse t'arrivera par e-mail à <adresse du compte>, sous 24 h » ;
    plus de champ e-mail à remplir ;
  - ex-Pro sur le même appareil : la conversation et les réponses restent affichées, avec « Pour écrire de nouveau, il faut
    Stalak Pro » ; la zone de texte repasse à l'assistant IA ;
  - la conversation gardée sur l'appareil porte l'id du compte : un autre compte sur le même appareil ne la voit pas.
- Tableau de bord : badge « Pro », « ex-Pro » ou « invité » sur chaque conversation (liste et conversation ouverte),
  calculé avec la même règle que le site.
- Page Stalak Pro de l'app : ligne « Parler à un humain (réponse en direct, ou par e-mail sous 24 h) » dans le tableau
  Gratuit / Pro, et dans la liste « Tu es Pro ».
- Guide de l'assistant IA (FR/EN) : il sait que la fonction est Pro et renvoie vers contact@stalak.app sinon.
- Politique de confidentialité FR/EN : paragraphe « Parler à un humain (Stalak Pro) », adresse du compte.

Skills utilisés : `appsec-review` (`docs/appsec-review-humain-pro.md` : contrôles serveur confirmés, aucun nouveau problème).

Fichiers touchés : `functions/_lib/support.js`, `functions/_lib/admin.js`, `functions/_lib/admin-page.js`,
`functions/_lib/help-guide.js`, `src/app.js`, `src/markup.html`, `src/theme.css`, `site_src/confidentialite.html`,
`site_src/en/privacy.html`, `tests/backend/run.mjs` (tests « Parler à un humain » réécrits), `tests/ui/support_ui.py`
(scénario réécrit), `tests/ui/server.mjs` (route de test `/__test/unpro`), `BACKEND.md`, `docs/STATUS.md`,
`docs/appsec-review-humain-pro.md`, `docs/handoff/compte-humain-pro.md`, `public/` (reconstruit).

Migration SQL : aucune. Aucun nouveau secret.

Tests (branche partie de main dc3919e) :
- `node tests/backend/run.mjs` : 62/62
- `tests/ui/support_ui.py` : 39/39 (déconnecté FR 390, gratuit EN 1280, Pro absent FR 390, tableau de bord 1280 avec badge,
  réponse par e-mail, Pro en direct EN 1280, ex-Pro EN 390 sur le même appareil, tableau de bord 390, sans Access, claude.ai)
- `tests/ui/help_ui.py` : 42/42
- sans défilement horizontal, sans erreur de page, FR et EN

Reste au propriétaire : rien.

À signaler :
- Chef de projet : l'offre Stalak Pro change → mettre à jour STALAK_CONTEXTE.md, section 2 (« Parler à un humain »).
- Marketing : page Tarifs du site (`site_src/tarifs.html` et `en/pricing.html`) à compléter avec cette ligne Pro ; la page Pro
  de l'app l'a déjà.
- Juridique : paragraphe de confidentialité modifié (« Stalak Pro », adresse du compte).
