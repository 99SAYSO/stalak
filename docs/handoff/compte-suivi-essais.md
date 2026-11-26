# Compte rendu — compte/suivi-essais
**Statut : PRÊT.** **Migration 0025** (`migrations/0025_user_day_counts.sql`) à lancer avant la mise en ligne.
Demande : `docs/handoff/chef-suivi-essais.md`.

## ⚠️ Correction urgente comprise dans cette branche : le tableau de bord en ligne est cassé sur 2 pages
- **Le problème :** la fusion du 25/11 (`fe2ebc2`, « Fusion compte/test-acquisition avec compte/sources-paiements ») a gardé le HTML des cartes « Paiements abandonnés », « Langue des visiteurs et des abonnés » et « Test payant ». Mais elle a **perdu leur code JavaScript** (`abLoad`, `langLoad`, `ptLoad`, et ce qui va avec). Il restait aussi 2 lignes en double au milieu des noms de sources.
- **Ce que ça fait sur `main` (vérifié sur la démo) :** ouvrir « Du visiteur à l'abonné » ou « Comptes et visites » provoque une erreur. Le menu reste ouvert par-dessus la page, et ces 3 cartes restent vides.
- **Correction :** le code a été remis tel qu'il était sur mes 2 branches, et les 2 lignes en double sont retirées. `tests/ui/support_ui.py` repasse : 64/64.
- **Pour la suite :** après une fusion qui touche `functions/_lib/admin-page.js`, relancer `tests/ui/support_ui.py`. Il ouvre toutes les pages du tableau de bord.

## La mise à jour de la base, à annoncer au propriétaire (en clair)
- **Nouvelle table `user_day_counts` : un petit compteur par compte et par jour.** Elle compte combien de fois le compte :
  - a ouvert l'app connecté ;
  - a fini une vidéo ;
  - a fini une vidéo sans filigrane.

  Elle garde aussi l'heure de la première et de la dernière fois de la journée, pour savoir si c'était dans les 24 h après le début de l'essai.
- **Rien d'autre :**
  - ni titre, ni son, ni vidéo, ni adresse IP ;
  - effacé avec le compte ;
  - effacé tout seul au bout de 120 jours, ce qui laisse le temps de voir le 2e mois après un essai.
- Il sert **seulement** à la carte « Essais Pro » du tableau de bord. Il ne sert pas à la publicité et n'est envoyé à personne.

## La carte « 🧪 Essais Pro » (en haut de « Du visiteur à l'abonné », 7 ou 30 jours)
1. **Activation J1** : parmi les essais commencés dont les 24 premières heures sont passées, la part qui a fini au moins une vidéo **sans filigrane** dans ces 24 h. Dessous : au moins une vidéo, quelle qu'elle soit.
2. **Conversion à la fin de l'essai** : parmi les essais terminés sur la période, la part **payée**, **résiliée pendant l'essai** et **paiement échoué** (plus « en attente de Paddle » si la réponse n'est pas encore arrivée).
   - Puis **encore payants au 2e mois** : un 2e paiement, compté 32 jours après la fin.
   - Un tableau **par semaine de début** donne les essais, les terminés, les payés, les résiliés, les échecs et les payants au 2e mois.
3. **Actifs pendant l'essai** :
   - les essais en cours aujourd'hui, et combien sont venus **ces 3 derniers jours** (app ouverte connectée ou vidéo finie) ;
   - la part revenue **au moins 2 jours différents** pendant l'essai ;
   - les **vidéos par essai** en moyenne.
- **La liste des essais en cours** donne pour chacun :
  - le jour (J1…J7) et « résiliation demandée » s'il y a lieu ;
  - « sans filigrane dans les 24 h » (oui / non / pas encore) ;
  - le nombre de vidéos et « venu ces 3 jours » ;
  - la **source** mesurée ;
  - **« Comment il a connu Stalak »**, dès que la colonne `users.heard_from` existe (demande `chef-question-source.md`). Avant, un tiret ; la carte marche sans elle.
- **L'e-mail est masqué** (« t•••@gmail.com ») : la carte n'a pas besoin de savoir qui c'est.
- **Route :** `GET /api/admin/trials`, module `functions/_lib/trialstats.js`. Elle se calcule à partir de `subscriptions` (début, fin et résultat de l'essai, déjà enregistrés par `trial.js`), de `payments` et de `user_day_counts`.
- **Les 3 essais du 26/11 :** ils sont dans la liste. Leurs vidéos sont comptées **à partir de la mise en ligne** de cette branche. Avant, rien n'était relié au compte, donc leur J1 restera vide ou partiel.

## Comment les vidéos et les ouvertures sont reliées au compte (vu avec App)
- **Ouverture de l'app connectée : rien à faire côté App.** Le serveur la compte quand la page demande le compte (`GET /api/me`, à chaque ouverture).
- **Vidéo finie : rien d'obligatoire côté App.**
  - La page envoie déjà la session avec « export_ok », pour « vidéos par personne ». Le serveur relie donc la vidéo au compte connecté.
  - « Sans filigrane » se déduit des droits du compte : Pro et l'essai n'ont jamais de filigrane.
- **Demande à App, une ligne, facultative mais plus juste :** dans `src/app.js`, ajouter `wm: !!S.lastWm` aux évènements `acctEvent('export_ok', { cat: … })` (export simple et packs). `src/account.js` transmet déjà `wm` au serveur, et le serveur prend alors ce que la page dit.
- **Compte non connecté :** rien par compte. Les compteurs anonymes restent comme avant.

## Phrase proposée pour la confidentialité (à valider par Juridique)
- **FR :** « Quand tu es connecté, nous comptons chaque jour, pour ton compte, combien de fois tu ouvres Stalak et combien de vidéos tu termines (avec ou sans filigrane). Ces compteurs ne contiennent ni tes vidéos, ni tes sons, ni ton adresse IP. Ils servent seulement à mesurer si l'essai gratuit et Stalak Pro sont utiles, jamais à la publicité, et sont effacés au bout de 120 jours ou avec ton compte. »
- **EN :** « When you are signed in, we count each day, for your account, how many times you open Stalak and how many videos you finish (with or without the watermark). These counters contain none of your videos, sounds or IP address. They are only used to measure whether the free trial and Stalak Pro are useful, never for advertising, and are deleted after 120 days or with your account. »
- **Base légale proposée :** intérêt légitime (mesure et amélioration du service), comme les autres compteurs. À confirmer par Juridique.

## Tests
- `node tests/backend/run.mjs` : **144/144**, dont 2 nouveaux :
  - **compteurs par compte :**
    - l'ouverture, une vidéo avec filigrane, une sans (dit par la page, ou déduit d'un compte Pro) ;
    - rien quand la personne n'est pas connectée ;
    - la table n'a aucune autre colonne ;
    - effacés avec le compte ;
  - **les 3 chiffres sur des essais inventés :**
    - activation J1, dont une vidéo à 23 h comptée et une à 25 h pas comptée ;
    - payé / résilié / échoué, 2e mois ;
    - essais en cours : jours, sources, e-mails masqués.
- `tests/ui/support_ui.py` (tableau de bord complet) : **64/64**. L'ancien test « plus de pub sur cette page » a demandé de reformuler la carte Test payant en « publicités TikTok ».
- **Démo `/admin-demo/` :** la carte s'affiche sur ordinateur et téléphone, sans défilement de côté ni erreur. La navigation entre les pages marche à nouveau.

## Fichiers
- **Nouveaux :** `migrations/0025_user_day_counts.sql`, `functions/_lib/trialstats.js`, `tests/fixtures/trials-seed.mjs`.
- **Modifiés :**
  - `functions/_lib/metrics.js` : `bumpUserDay`, paramètre `who` de `event()` ;
  - `functions/_lib/router.js` : `/api/me`, `/api/event`, suppression du compte ;
  - `functions/_lib/retention.js` : 120 jours ;
  - `functions/_lib/admin.js` : route ;
  - `functions/_lib/admin-page.js` : carte, et le code perdu remis ;
  - `src/account.js` : `wm` ;
  - `tools/admin_demo_data.mjs` → `admin-demo-data.js`, `tests/backend/run.mjs`, `tests/ui/support_ui.py` (inchangé), `public/` reconstruit.
