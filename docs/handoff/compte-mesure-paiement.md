# Compte rendu — compte/mesure-paiement
**Statut : PRÊT.** Aucune migration. Demande : `docs/handoff/chef-suite-clarity.md` (partie Comptes).

## Le problème
Stalak donne l'e-mail du compte à Paddle (`customer: { email }`). Paddle crée donc le client dès l'ouverture de la fenêtre et envoie `checkout.customer.created` (parfois aussi `customer.updated`) **sans que la personne ait rien fait**. L'ancienne mesure passait alors à « details » : le compteur « Paiement fermé : après l'e-mail » comptait des gens qui avaient seulement regardé le prix.

## La correction (`src/account.js`, `onPaddleEvent`)
Jusqu'où la personne est allée avant de fermer sans acheter (on garde l'étape la plus loin) :

| Étape envoyée | Tableau de bord | Quand |
|---|---|---|
| `price` | A seulement vu le prix | la fenêtre s'est ouverte, rien n'a changé |
| `info` | A changé ses infos | e-mail, pays, code postal, ville, entreprise ou n° de TVA **différents** des premiers reçus |
| `method` | A choisi un moyen de paiement | `checkout.payment.selected` |
| `try` | A essayé de payer | `checkout.payment.initiated`, `payment.failed`, `payment.error` |

- Les premières infos client envoyées par Paddle servent seulement de **point de départ**. Rien n'est gardé ni envoyé au serveur : seulement le nom de l'étape.
- Les anciens noms (`start`, `details`, `payment`) restent comptés à part, pour les pages pas encore rechargées. Le tableau de bord les montre seulement s'il y en a sur la période, sous la ligne « Ancienne mesure (avant le 24/11, pas fiable) ».
- Libellés et explication (« ? ») de la carte « 💳 Paiement fermé sans acheter » réécrits.

## À vérifier sur le vrai Paddle `[HYPOTHÈSE]`
La doc de Paddle dit seulement « Emitted when a payment method is selected » pour `payment.selected`. Si Paddle l'envoie aussi tout seul en affichant la carte par défaut, « A choisi un moyen de paiement » sera trop haut. « A essayé de payer » reste sûr. À regarder dans quelques jours ; si besoin, je ne compterai `payment.selected` qu'après un changement de moyen.

## Fichiers
`src/account.js`, `functions/_lib/metrics.js` (`CLOSE_STAGES`, `CLOSE_STAGES_OLD`), `functions/_lib/admin.js`, `functions/_lib/admin-page.js`, `tests/fixtures/dashboard-seed.mjs` → `functions/_lib/admin-demo-data.js`, `tests/backend/run.mjs`, `tests/ui/achat_ui.py`, `BACKEND.md`, `public/` reconstruit.

## Tests
- `node tests/backend/run.mjs` : **132/132** (nouvelles étapes, anciens noms à part, nom inconnu → `price`).
- `tests/ui/achat_ui.py` : **26/26**. 6 cas :
  - e-mail rempli par Paddle seul → `price` ;
  - rien du tout → `price` ;
  - pays et code postal changés → `info` ;
  - e-mail changé → `info` ;
  - moyen choisi → `method` ;
  - paiement refusé puis infos changées → `try` (l'étape la plus loin reste).
- `tests/ui/support_ui.py` : **64/64**.

Source : [Paddle.js, liste des évènements](https://developer.paddle.com/paddlejs/events/overview).
