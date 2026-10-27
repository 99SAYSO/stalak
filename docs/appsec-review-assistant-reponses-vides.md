# AppSec review — assistant d'aide, réponses vides (branche `compte/assistant-reponses-vides`)

Scope / authority: dépôt `99SAYSO/stalak`, base `main` @ `6388f57`, cible = branche `compte/assistant-reponses-vides`.
Seul fichier serveur modifié : `functions/_lib/help.js`. Revue locale (faux D1, faux Workers AI). Aucun service réel appelé.
Revue complète de la route : `docs/appsec-review-assistant-aide.md`.

Threat model: inchangé (route ouverte à tous `POST /api/help/chat` → Workers AI → texte affiché en `textContent`).
Ce qui change : (1) `chat_template_kwargs: { enable_thinking: false }` envoyé aux modèles Gemma 4 / GLM 4.7 / Qwen3 ;
(2) jusqu'à 2 appels au modèle par question ; (3) erreur `help_failed` en 503 au lieu de 502 ; (4) une ligne de journal
quand la réponse est vide.

Release advice: **proceed within reviewed scope**.

| ID | Gravité / confiance | Fichier | Conditions / impact | Correction / test |
|---|---|---|---|---|
| R1 | Moyenne / confirmé, **corrigé** | `help.js`, boucle des essais | Le deuxième essai doublait le nombre d'appels possibles : quelqu'un qui pousse le modèle à répondre vide aurait pu faire jusqu'à 120 appels par jour (≈ 8 400 neurons) au lieu de 60, et manger le quota gratuit des paroles. | Chaque nouvel essai compte dans `help:all:<jour>` ; budget épuisé = pas de nouvel essai. Tests : « the second try counts in the day », « the last call of the day is not retried ». |
| R2 | Faible / confirmé, **évité** | `answerText` | La « réflexion » du modèle (`reasoning`, `reasoning_content`, blocs `<think>` ou `<\|channel>thought`) peut répéter les consignes. Elle n'est jamais renvoyée, même quand la réponse est vide. | Test : la réponse d'erreur ne contient jamais le texte de réflexion. |
| R3 | Info | journaux | La ligne `[stalak] help ai empty` ne contient que des formes et des tailles (`finish`, longueurs, nombre de jetons) : ni question, ni réponse, ni réflexion. | Inspection de `emptyInfo`. |

Dependencies: aucune ajoutée.
Secrets hygiene: aucun secret touché ni ajouté.

| Check | Statut | Commande | Résultat |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 57/57 |
| Bulle d'aide, téléphone + ordinateur, FR + EN | PASS | `tests/ui/help_ui.py` | 42/42 |
| Version claude.ai se charge | PASS | idem | OK |
| Vrai modèle (taux de réponses vides) | NOT RUN | — | Pas d'accès à Workers AI ici : à vérifier en ligne (une dizaine de questions + journaux). |

Coverage / residual risk: si Cloudflare ignorait `chat_template_kwargs` pour ce modèle, la marge (700 jetons) et le deuxième essai
réduisent les vides sans les supprimer ; la ligne de journal dira alors `finish=length reasoning=…`. Piste suivante dans ce cas :
`HELP_MODEL` vers un modèle sans réflexion (aucun code à changer).

Handoff: Chef de projet (fusion, mise en ligne, essai d'une dizaine de questions, lecture des journaux).
