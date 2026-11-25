# Compte rendu — compte/coach-ia (étape 1 : la proposition)
**Statut : À MONTRER AU PROPRIÉTAIRE** (pas encore PRÊT : rien n'est branché, aucun appel à l'IA, pas de migration).

## À montrer au propriétaire
1. **Le contrat** : `docs/contrats/coach-ia.md`. Il contient la route, ce que l'IA reçoit et rend, quand, les limites de coût, le coût et le juridique.
2. **Les consignes de l'IA** : `functions/_lib/coach-prompt.js` (`COACH_SYSTEM`, en français), et le format de la réponse (`COACH_SCHEMA`).
3. **2 exemples d'analyse** (données d'exemple, artistes inventés) :
   - `docs/coach-ia/exemple-1-donnees.json` → `exemple-1-analyse.json` : « Kenzo », drill, 8 vidéos, 3 sons, 1 240 auditeurs ;
   - `docs/coach-ia/exemple-2-donnees.json` → `exemple-2-analyse.json` : « Lyna », chant, 5 vidéos, aucun son sorti. Ce qui manque est dit comme manquant.
   - **Important :** ces 2 analyses ont été écrites en suivant les consignes, **pas encore produites par l'API**, car la clé n'est pas encore saisie. Une fois la clé saisie, je referai les 2 exemples avec le vrai modèle pour comparer.
4. **Coût estimé** : environ **0,13 $ par artiste Pro et par mois** avec Claude Sonnet 5.5, environ **0,07 $** avec la file « Batch » d'Anthropic (−50 %). Plafond de 0,50 $ par compte et par mois, plafond global réglable, alerte au propriétaire.

## Le garde-fou « aucun chiffre inventé » (déjà écrit et testé)
- `checkFigures(analyse, donnees)` : tout nombre de 2 chiffres ou plus écrit par l'IA doit se trouver dans les données.
- `node tools/coach_check_examples.mjs` vérifie les 2 exemples : format, chiffres, identifiants et tailles. **Les deux passent.**
- En écrivant l'exemple 2, il a attrapé un « sous 25 s » qui n'était pas dans les données : corrigé en « comme tes 2 meilleures (18 et 21 s) ».
- Il refuse aussi « 100k » et « +30 % » quand ils ne sont pas dans les données.

## Ce qui reste après l'accord du propriétaire
- Migration (table des analyses et des coûts), `GET /api/coach`, construction des « donnees » (TikTok, Spotify, sorties, profil, montages, calculs).
- Appel à l'API Claude avec le format imposé, 1 nouvel essai, file « Batch » le lundi, plafonds et alerte, carte « coût du coach » au tableau de bord, tests.
- Secret **`ANTHROPIC_API_KEY`** : saisi par le propriétaire dans Cloudflare (console.anthropic.com → API Keys). Il n'apparaît jamais dans le code.
- **Limite connue :** l'API TikTok ne donne pas le son utilisé dans chaque vidéo. L'IA le dit dans « manque » et s'appuie sur la légende et sur les montages Stalak.

## Au passage : `tests/ui/support_ui.py`
Relancé ici sur `main` (57e497d, avec la mesure du paiement) : **64/64**, réponse envoyée par e-mail au bout de **23,9 s**. Je n'ai pas réussi à reproduire le blocage.

Comment ça marche : la réponse part par e-mail quand la page du visiteur n'a plus rien demandé depuis 12 s (`CATCH_UP_MS`). Le tableau de bord la voit ensuite à son rafraîchissement suivant (toutes les 10 s).

Si l'attente de 90 s est dépassée chez toi, la cause la plus probable est que **la page du visiteur continue d'interroger le serveur**. Par exemple :
- le navigateur du test de l'étape d'avant n'est pas fermé ;
- un autre test tourne en même temps sur le même serveur, donc avec le même compte.

Pour vérifier, relancer seul sur un serveur neuf :
`node tests/ui/server.mjs public 8810` puis `python3 tests/ui/support_ui.py http://localhost:8810 shuffle-lab.html`.

Si ça bloque encore, envoie-moi les dernières lignes de la sortie : je regarderai ce que dit la page du visiteur.
