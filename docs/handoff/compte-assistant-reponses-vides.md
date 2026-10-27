Statut : PRÊT
Branche : compte/assistant-reponses-vides
Conversation : 3. Comptes, paiements & serveur

Résumé :
Correction de « l'assistant d'aide renvoie des réponses vides environ 1 fois sur 3 » (STATUS, test en ligne du 27/10).
- Cause : Gemma 4 « réfléchit » par défaut (`chat_template_kwargs.enable_thinking` vaut vrai). Sa réflexion part dans un champ
  à part et use la même place que la réponse (450 jetons) : quand elle est longue, `content` arrive vide. C'est ce qu'ont constaté
  d'autres projets avec Gemma 4 sur Workers AI et ailleurs.
- Corrections dans `functions/_lib/help.js` :
  - réflexion coupée : `chat_template_kwargs: { enable_thinking: false }`, envoyé seulement aux modèles qui le lisent
    (Gemma 4, GLM 4.7, Qwen3) ; un autre `HELP_MODEL` ne le reçoit pas ;
  - place de réponse 450 → 700 jetons (les réponses en prennent ≈ 300 ; la marge sert si le modèle réfléchit quand même) ;
  - réponse vide ou appel en échec : un deuxième essai. Il compte dans le budget du jour (`HELP_DAILY_MAX`), qui reste
    un plafond strict d'appels au modèle (revue de sécurité, point R1) ;
  - la réflexion n'est jamais montrée : blocs `<think>`, `<|channel>thought` et champs `reasoning` ignorés ;
  - `help_failed` en **503** au lieu de 502 (Cloudflare remplaçait le 502 par sa page HTML) ; la bulle affiche déjà son message
    d'erreur avec l'adresse de contact pour ce code ;
  - journal `[stalak] help ai empty, try N finish=… content=… reasoning=… tokens=…` : la raison d'une réponse vide,
    sans la question, la réponse ni la réflexion.
- Rien de changé côté navigateur (`src/app.js` intact).
- Revue de sécurité (`appsec-review`) : `docs/appsec-review-assistant-reponses-vides.md`.
- Docs vérifiées (`context7`) : page du modèle Workers AI (le paramètre `chat_template_kwargs` y figure) et retours d'autres projets
  sur les réponses vides de Gemma 4 (voir les sources ci-dessous).

Fichiers touchés : `functions/_lib/help.js`, `tests/backend/run.mjs` (tests de l'aide mis à jour + nouveaux cas),
`BACKEND.md` (étape 12 et tableau des routes), `docs/STATUS.md`, `docs/appsec-review-assistant-reponses-vides.md`,
`docs/handoff/compte-assistant-reponses-vides.md`. `public/` reconstruit (aucune différence : le serveur seul change).

Migration SQL : aucune. Aucun nouveau secret, aucune nouvelle variable.

Tests :
- `node tests/backend/run.mjs` : 57/57 (nouveaux cas : réflexion coupée pour Gemma et pas pour un autre modèle ; vide puis bonne
  réponse → 200 au deuxième essai ; vide deux fois → 503 `help_failed` ; réflexion jamais renvoyée ; deuxième essai compté
  dans le budget ; dernier appel du jour non redemandé)
- `tests/ui/help_ui.py` : 42/42 (téléphone 390 px et ordinateur 1280 px, FR et EN, sans défilement horizontal, sans erreur ;
  version claude.ai chargée)
- `node --check`, `python3 build.py`, `python3 build_site.py --domain stalak.app --email contact@stalak.app` : OK
- Non testé : le vrai modèle (pas d'accès à Workers AI hors de Cloudflare).

Après la mise en ligne (Chef de projet) :
- poser une dizaine de questions au glaçon (FR et EN) ;
- dans Cloudflare → stalak-site → Functions → Real-time logs, chercher `[stalak] help ai empty`. Si des lignes avec
  `reasoning=…` apparaissent encore, Cloudflare ignore la coupure de la réflexion pour ce modèle : essayer un autre modèle
  avec la variable `HELP_MODEL` (par exemple `@cf/meta/llama-4-scout-17b-16e-instruct`), sans changer le code.

Reste au propriétaire : rien.

Sources :
- https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/
- https://github.com/AStrasler/WHOOP-Lens/pull/27 (Gemma 4 sur Workers AI : réponses vides, `enable_thinking: false`)
- https://github.com/genericmilk/peteyplan/pull/20 (même problème ailleurs : réflexion dans `reasoning_content`, `content` vide)
