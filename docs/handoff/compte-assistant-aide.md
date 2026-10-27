Statut : PRÊT
Branche : compte/assistant-aide
Conversation : 3. Comptes, paiements & serveur

Résumé :
Le glaçon d'aide répond maintenant sur stalak.app (avant : « l'assistant arrive bientôt »).
- Nouvelle route `POST /api/help/chat` : ouverte à tous, sans compte. Elle fait écrire la réponse par Workers AI
  (modèle `@cf/google/gemma-4-26b-a4b-it`, même branchement `AI` que les paroles automatiques).
- Ce que sait l'assistant (étapes, boutons, comptes, Stalak Pro, prix, résiliation, remboursement 14 jours) est côté serveur,
  dans `functions/_lib/help-guide.js` : le navigateur ne peut pas le changer. Le serveur indique aussi au modèle si la personne
  est non connectée, gratuite ou Pro (jamais son e-mail ni son identifiant).
- Rien n'est gardé : ni question ni réponse. Seuls des compteurs servent aux limites.
- Limites : 15 questions par 10 min et 60 par jour par connexion ; 60 par jour pour tout le site (variable `HELP_DAILY_MAX`,
  0 = assistant coupé), pour protéger le quota gratuit des paroles automatiques (≈ 50 neurons par question, 62 au plus).
- Bulle d'aide (`src/app.js`) : sur stalak.app, elle appelle la route ; message « réponses écrites par une IA, peuvent se tromper » ;
  messages d'erreur FR/EN (trop de questions, pause du jour, pas de connexion) avec l'adresse contact@stalak.app.
  La version claude.ai ne change pas (elle utilise toujours Claude).
- Clés de traduction : groupées à la fin des deux dictionnaires sous le préfixe `help.s.` (pas de commentaire possible :
  `build_site.py` lit ces blocs comme du JSON). Le code ajouté porte le commentaire « domaine Comptes, paiements & serveur ».
- Politique de confidentialité FR/EN : un paragraphe « Assistant d'aide » et Cloudflare listé pour l'assistant.
  À faire relire par la conversation Juridique.
- Revue de sécurité (`appsec-review`) : `docs/appsec-review-assistant-aide.md`. Un point corrigé (taille de conversation bornée
  à 6 000 caractères, pour le coût). Points acceptés : un robot à multiples IP peut épuiser le budget du jour de l'aide
  (seule l'aide est touchée) ; empreinte d'IP sans sel dans les compteurs, comme pour les paroles (à saler plus tard).
- `main` (jusqu'à 393307a) est déjà fusionné dans la branche ; `public/` reconstruit.

Fichiers touchés :
- nouveaux : `functions/_lib/help.js`, `functions/_lib/help-guide.js`, `tests/ui/help_ui.py`,
  `docs/appsec-review-assistant-aide.md`, `docs/handoff/compte-assistant-aide.md`
- modifiés : `functions/_lib/router.js` (1 import + 1 `case`), `src/app.js` (bloc de l'aide + 5 clés `help.s.*` par langue),
  `site_src/confidentialite.html`, `site_src/en/privacy.html`, `tests/backend/run.mjs` (2 tests), `tests/ui/server.mjs`
  (faux modèle de chat + `/__test/helpmax`), `BACKEND.md` (étape 12 + route), `docs/STATUS.md`, `.gitignore`
  (`shuffle-lab.probe.html`, laissé par les tests d'interface), `public/` (reconstruit)

Migration SQL : aucune. Aucun nouveau secret.

Tests (sur la branche, après fusion de main) :
- `node tests/backend/run.mjs` : 51/51
- `tests/ui/help_ui.py` : 42/42 (téléphone 390 px et ordinateur 1280 px, FR et EN, sans défilement horizontal, sans erreur ;
  la version claude.ai se charge et la bulle s'ouvre)
- `tests/ui/lyrics_ui.py` : 85/85 (avant la dernière fusion de main)
- `node --check src/app.js`, `python3 build.py`, `python3 build_site.py --domain stalak.app --email contact@stalak.app` : OK
- Non testé : les vraies réponses du modèle (pas d'accès à Workers AI hors de Cloudflare).

Après la mise en ligne (Chef de projet) :
- poser 2 ou 3 questions au glaçon sur stalak.app, en FR (`/`) et en EN (`/en/`), et vérifier qu'une réponse arrive.

Reste au propriétaire :
- rien d'obligatoire ;
- après la mise en ligne, poser 4 ou 5 vraies questions pour juger la qualité des réponses ;
- plus tard, si l'aide affiche souvent « pause » : passer au forfait Workers à 5 $/mois, puis monter `HELP_DAILY_MAX`.

À signaler au Chef de projet (hors de mon domaine, non modifié) :
- `docs/handoff/check.sh` ne trouve aucun compte rendu « PRÊT » quand la langue du système n'est pas UTF-8
  (cas de l'espace de travail de Claude : `LANG` vide). Le `Ê` de `PR[ÊE]T` y est lu comme deux octets.
  Contournement : `LC_ALL=C.UTF-8 sh docs/handoff/check.sh` (il trouve alors compte/assistant-aide, legal/etat-des-lieux,
  marketing/audit-site et social/connexion-comptes). Correction possible : `export LC_ALL=C.UTF-8` en tête du script,
  ou chercher `Statut *: *PR` puis `T` sans accent dans le motif.
