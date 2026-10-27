# AppSec review — assistant d'aide (branche `compte/assistant-aide`)

Scope / authority: dépôt `99SAYSO/stalak`, base `main` @ `f3e38fc` (fusionné dans la branche), cible = branche `compte/assistant-aide` (arbre de travail).
Revue défensive locale (tests Node + Playwright sur faux D1 / faux Workers AI). Aucun service réel appelé. Exclus : le reste de l'API (inchangé), Cloudflare lui-même, la qualité des réponses du vrai modèle.

Threat model:
- Biens : quota gratuit Workers AI (10 000 neurones/jour, partagé avec les paroles auto), réputation (réponses fausses ou hors sujet), données de la page envoyées (noms de fichiers, journal), base D1 (compteurs).
- Acteurs : visiteur anonyme, abonné, robot qui change d'IP, site tiers (CSRF), contenu de la page (texte injecté dans le contexte).
- Entrée : `POST /api/help/chat` `{lang, messages[], context}` — ouverte sans compte.
- Frontières : navigateur → Pages Function (validation, limites) → Workers AI (modèle sans outil) → réponse texte → affichée avec `textContent`.

Release advice: **proceed within reviewed scope** (aucune migration : pas de nouvelle table).

| ID | Gravité / confiance | Fichier | Conditions / impact | Correction / test |
|---|---|---|---|---|
| H1 | Moyenne / confirmé, **corrigé** | `functions/_lib/help.js` | Une conversation longue (10 tours de 1 000–2 000 caractères) coûtait ≈ 90 neurones ; 60 questions/jour pouvaient prendre > 50 % du quota gratuit des paroles. | Total de la conversation limité à 6 000 caractères (`TURNS_CHARS_MAX`) ; pire cas ≈ 62 neurones, 60/jour ≈ 3 700. Test : « whole conversation bounded ». |
| H2 | Faible / hypothèse acceptée | `help.js` (`help:all:<jour>`) | Un robot avec beaucoup d'IP peut épuiser le budget du jour (60 questions) : l'aide répond « pause » jusqu'au lendemain. N'affecte ni les paroles ni le reste du site. | Accepté pour le lancement. Si ça arrive : monter `HELP_DAILY_MAX`, ou réserver l'aide aux comptes connectés. |
| H3 | Faible / hypothèse acceptée | `help.js` | Contournement des consignes (« oublie tes règles ») : le visiteur n'obtient que du texte pour lui-même, sans outil, sans donnée d'autrui ; coût borné par les limites. Les consignes et l'état du compte sont côté serveur. | Le navigateur ne peut pas envoyer de rôle `system` (test) ; le bloc `<page>` ne peut pas être refermé de l'intérieur (test). |
| H4 | Faible / existant | `help.js`, `lyrics.js` | Les compteurs utilisent `sha256('ip:'+IP)` sans sel : quelqu'un qui lit la base pourrait retrouver une IPv4 par force brute. Même schéma que les paroles. | Plus tard, pour les deux : saler avec `AUTH_SECRET`. |

Vérifications sans finding : CSRF (JSON + `Origin` exigés comme les autres routes, testé) ; XSS (réponse affichée en `textContent`, testé visuellement) ; taille du corps (32 Ko, 413 testé) ; aucune question ni réponse écrite en base ni dans les journaux (seul le message d'erreur du modèle, tronqué, est journalisé) ; `HELP_MODEL` n'accepte qu'un nom `@cf/…` ; aucun e-mail ni identifiant envoyé au modèle (testé) ; le modèle n'a aucun outil.

Dependencies: aucune ajoutée (pas de `package.json`). Workers AI est déjà relié (`[ai] binding = "AI"`).
Secrets hygiene: aucun secret ajouté ; recherche de motifs de clés sur le dépôt : seuls des exemples de documentation et du code de lecture de clé, déjà présents.

| Check | Statut | Commande | Résultat |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 51/51 après fusion de `main` (2 nouveaux) |
| Interface téléphone + ordinateur, FR + EN | PASS | `tests/ui/help_ui.py` sur `tests/ui/server.mjs` | 42/42 |
| Version claude.ai se charge | PASS | idem (fichier `shuffle-lab.html`) | aide ouverte, aucune erreur |
| Syntaxe `src/app.js`, `build.py`, `build_site.py` | PASS | `node --check`, builds | OK |
| Paroles auto (interface), après fusion de `main` | PASS | `tests/ui/lyrics_ui.py` | 85/85 |
| Vrai modèle Gemma 4 | NOT RUN | — | Pas d'accès à Workers AI ici : qualité des réponses à vérifier après mise en ligne. |

Coverage / residual risk: qualité réelle des réponses (fausses infos possibles malgré les consignes ; l'avertissement « IA » est affiché) ; comportement du modèle si Cloudflare change son format de sortie (lecture tolérante, 502 sinon).

Handoff: Chef de projet (fusion, vérification sur stalak.app) ; Juridique (relire le paragraphe ajouté à la politique de confidentialité) ; Comptes (H4 plus tard).
