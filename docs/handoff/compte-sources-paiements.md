# Compte rendu — compte/sources-paiements
**Statut : PRÊT** (aucune migration). Demande : `docs/handoff/chef-sources-et-paiements.md`.

## 1. Source « ai » (assistants IA) — ce que le serveur accepte, pour App
| Où | Valeur à envoyer | Exemples |
|---|---|---|
| `src` (VISIT_SRC : visites, étapes de l'entonnoir) | `ai:chatgpt` · `ai:perplexity` · `ai:claude` · `ai:gemini` · `ai:copilot` · `ai:other` (ou `ai` seul) | chatgpt.com, chat.openai.com, `utm_source=chatgpt.com` → `ai:chatgpt` ; gemini.google.com → `ai:gemini` (avant la règle `google.`) |
| `ref` (VISIT_REF, colonne `visits.source`) | le code tel quel, **points permis**, 40 caractères | `chatgpt.com`, `perplexity` |
| source d'inscription (FIRST_SRC → `POST /api/account/source`) | `ai:chatgpt`…, et `utm:` / `ref:` / `dir:` avec points | `ai:chatgpt`, `utm:chatgpt.com` |

- Tout autre `ai:…` est refusé et compte comme « direct ». Rien n'est inventé.
- `ref:` accepte maintenant `[a-z0-9._-]`, 40 caractères au plus.
- Fichiers : `functions/_lib/metrics.js` (`AI_ASSISTANTS`, `SRC_PLATFORMS`, `VISIT_SRC`, `SOURCE`) et `functions/_lib/router.js` (`SIGNUP_SOURCE`).

## 2. Tableau de bord
- **« D'où viennent les gens, et jusqu'où ils vont »** : une ligne « 🤖 Assistants IA » (jamais rangée dans « Autres »), suivie d'une ligne par assistant (« ↳ ChatGPT »…).
- **« D'où viennent les visites »** et **« Derniers inscrits »** :
  - les noms ChatGPT, Perplexity, Claude, Gemini et Copilot sont reconnus ;
  - nouvelle colonne **Source** dans « Derniers inscrits » (« 🤖 IA (ChatGPT) »).
- **Nouvelle carte « 🗣️ Langue des visiteurs et des abonnés »** (page Comptes et visites, visible sans déplier) :
  - anglais et français, sur 7 et sur 30 jours ;
  - lignes : visites, visites restées 5 min ou plus, nouveaux comptes, premiers paiements ;
  - et les abonnés payants d'aujourd'hui ;
  - route `GET /api/admin/languages`.
- **Nouvelle carte « 🧾 Paiements abandonnés : ce que Paddle sait »** (page Du visiteur à l'abonné), sur 7 ou 30 jours :
  - lue chez Paddle, en lecture seule : `GET /transactions`, origine « web », avec l'adresse ;
  - pour chaque paiement ouvert et pas payé :
    - formule (essai 7 j, prix normal, offre à 1 €), montant affiché taxes comprises et devise ;
    - pays de l'adresse ;
    - jusqu'où la personne est allée (vu le prix / adresse donnée / moyen choisi / paiement essayé) ;
    - **la raison du refus donnée par Paddle** (carte refusée, 3D Secure raté, solde insuffisant…) ;
  - route `GET /api/admin/paddle/abandoned?days=7|30`, module `functions/_lib/abandoned.js` ;
  - **jamais d'e-mail, de nom, d'identifiant Paddle ni de numéro de carte** (testé).

## 3. Les 4 paiements abandonnés des 23 et 24/11 — ce qu'on sait déjà (base D1, totaux anonymes)
| | 23/11 | 24/11 |
|---|---|---|
| Formules vues | 6 | 13 |
| Paiements ouverts | 3 (iPhone : 3) | 1 (iPhone : 1) |
| Fermés sans payer | 3 : « details » 2, « payment » 1 | 1 : « details » 1 |
| Source | direct (3) | direct (1) |
| Comptes créés ce jour-là | 1 (anglais, iPhone, US) | 4 (anglais, iPhone : US 2, SK 1, FR 1) |

Ce qu'on peut en dire :
- **Tous sur iPhone**, tous arrivés en « direct ». Langue : les comptes créés ces jours-là sont tous en anglais. Comme le paiement demande un compte, les 4 viennent très probablement de visiteurs anglais (ce n'est pas mesuré personne par personne, exprès).
- **Étape :** ces jours-là, la mesure fausse comptait encore (« details » = Paddle remplissait l'e-mail tout seul ; corrigée le 25/11 à 1 h 20). « details » veut donc seulement dire **« a vu le prix, n'a peut-être rien tapé »** : 3 fois sur 4.
  - **1 personne (le 23/11) est allée jusqu'au paiement** (« payment » : moyen choisi, ou paiement essayé). C'est la seule où la raison exacte existe chez Paddle, et la nouvelle carte la montrera.
- **Ce n'est pas forcément anormal :** du 8 au 25/11, 23 ouvertures de paiement ont donné 5 achats, soit environ 1 sur 5. Sur 4 ouvertures, on pouvait attendre environ 1 achat, donc 0 reste dans le hasard possible.
- **Ce qui a changé juste avant :** l'essai gratuit de 7 jours (carte demandée, en ligne le 23/11) et l'offre à 1 € (24/11).
- **La formule, l'essai ou non, la devise, les taxes et la raison ne sont pas dans notre base.** Ils sont chez Paddle. La nouvelle carte les lira dès qu'elle sera en ligne, avec la clé Paddle déjà sur le serveur.

## 4. Propositions (rien n'est changé à l'offre sans l'accord du propriétaire)
1. **Après la mise en ligne**, ouvrir la carte « Paiements abandonnés » sur 30 jours. On y lit, pour les 4 de cette semaine et les suivants : formule, essai, devise, montant taxes comprises et raison du refus.
2. **Apple Pay** : presque tous nos acheteurs sont sur iPhone. À vérifier dans Paddle (Checkout → Payment methods) qu'Apple Pay est activé et que le domaine stalak.app est approuvé. Sur iPhone, sans Apple Pay, il faut taper une carte : c'est souvent là qu'on perd du monde.
3. **Devise** : nos prix principaux sont en dollars. À vérifier dans Paddle si les prix Pro (normal et essai) ont un prix en euros pour l'Europe, comme l'offre à 1 €. Sinon, un visiteur européen voit des dollars, plus la conversion et les taxes.
4. **Essai avec carte** : la fenêtre affiche « 0 aujourd'hui » mais demande une carte. Si la carte « Paiements abandonnés » montre surtout des « essai 7 j » fermés à « Vu le prix », on peut tester une phrase plus claire avant d'ouvrir Paddle (« Carte demandée, rien n'est prélevé avant 7 jours, annulable en 1 clic »). **Texte à valider par le propriétaire et Juridique.**
5. La mesure corrigée du 25/11 (vu le prix / infos changées / moyen choisi / essai de payer) donne la bonne étape à partir de maintenant.

## Tests
- `node tests/backend/run.mjs` : **140/140**, dont 3 nouveaux :
  - « ai:chatgpt » et les points comptés partout, une seule ligne IA avec son détail, source d'inscription ;
  - langues sur 7 et 30 jours ;
  - paiements abandonnés lus chez Paddle (lecture seule, aucune personne, sans clé : « off »).
- `tests/ui/support_ui.py` (tableau de bord) : **64/64**. La réponse est partie par e-mail en 23,4 s.
- Démo `/admin-demo/` sur ordinateur et téléphone : pas de défilement de côté, aucune erreur ; les nouvelles cartes s'affichent.

## Juridique
Rien de nouveau n'est collecté : les sources restent des totaux anonymes. La carte Paddle lit des paiements déjà gardés par Paddle et n'en montre aucune donnée personnelle.

## À faire par App
`src/app.js` (FIRST_SRC, VISIT_REF, VISIT_SRC) : envoyer les valeurs du tableau de la partie 1, et accepter les points dans `utm_source` / `ref`.
