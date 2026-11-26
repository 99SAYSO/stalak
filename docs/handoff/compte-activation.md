# Compte rendu — compte/activation
**Statut : PRÊT.** **Migration 0026** (`migrations/0026_activation.sql`) à lancer avant la mise en ligne.
Demandes : `docs/handoff/chef-activation-rapide.md` (points 6 et 7) et `docs/handoff/chef-question-source.md` (partie Comptes).

**Ordre de fusion :** `compte/suivi-essais` d'abord (il répare le tableau de bord et ajoute la migration 0025). Cette branche part de `compte/suivi-essais` et la contient. Fusionner seulement celle-ci suffit donc.

## La mise à jour de la base, à annoncer au propriétaire (en clair)
- **Sur chaque compte, 3 nouvelles cases pour « Comment tu as connu Stalak ? » :**
  - la réponse (ChatGPT, Google, Autre IA, TikTok, Instagram, YouTube, Un ami, Autre, ou « passé ») ;
  - le petit texte de « Autre » (60 caractères au plus, nettoyé) ;
  - la date de la réponse.

  La question n'est posée qu'une fois : la première réponse reste.
- **Sur chaque compte, 4 cases pour les e-mails de rappel :**
  - « accepte les rappels et conseils » (oui / non / jamais demandé) ;
  - la date du choix ;
  - la version du texte accepté (la preuve du consentement) ;
  - la date de la relance envoyée (pour n'en envoyer qu'une).
- **2 petites tables anonymes pour l'entonnoir :**
  - `step_visits` : quelles étapes une **visite** a passées (numéro de visite au hasard, jamais le compte), pour compter chaque étape une seule fois ;
  - `wow_times` : le temps en secondes entre l'arrivée et le 1er montage vu, avec l'appareil (iPhone, Android, ordinateur).

  Les deux sont effacées toutes seules au bout de 90 jours.
- Rien n'est effacé ni modifié dans les données existantes.

## Point 6 — carte « 🪜 Du son au wow » (page « Du visiteur à l'abonné », juste sous « Essais Pro »)
- Les étapes de l'éditeur, dans l'ordre :
  1. arrivée sur Stalak (les visites) ;
  2. son choisi ;
  3. passage choisi ;
  4. 1re prise filmée ;
  5. 3e prise filmée ;
  6. **montage vu (le wow)** ;
  7. paroles ajoutées (facultatif, en gris) ;
  8. export lancé ;
  9. vidéo exportée.
- Pour chaque étape : le nombre et la part de l'étape d'avant. « Export lancé » est comparé à « Montage vu », parce que les paroles sont facultatives.
- **L'étape qui perd le plus est en rouge**, avec « plus grosse perte ».
- Boutons **7 j / 30 j** et **Tous / iPhone / Android / Ordinateur**.
- Dessous, **le temps jusqu'au wow** : la médiane, la moitié du milieu (« entre 58 s et 1 min 50 s »), la part sous une minute et le nombre de montages vus. L'objectif de 60 s est rappelé.
- Chaque étape est comptée **une fois par visite**. Un retour arrière ou une 2e prévisualisation ne gonfle pas les chiffres.
- Tant que l'app n'envoie pas les évènements, la carte le dit (« Pas encore d'étape enregistrée… »).
- **Route :** `GET /api/admin/steps?days=7|30&device=all|ios|android|desktop` (module `functions/_lib/activation.js`).

## Point 7 — la relance d'un projet pas fini
- **Qui la reçoit :** un compte qui a filmé des prises **et** n'a fini aucune vidéo depuis. Il faut aussi :
  - soit avoir coché la case « rappels et conseils » (jamais cochée d'avance) ;
  - soit avoir déjà confirmé son e-mail pour les conseils (la liste du 7/11, confirmée par un lien).
- **Quand :** entre 24 h et 72 h après ses dernières prises. Jamais une relance tardive.
- **Combien :** **une seule fois par compte, pour toujours.**
- **L'e-mail (FR et EN) :**
  - objet « Tes 3 prises t'attendent » si les 3 prises sont faites, sinon « Ton snippet t'attend » ;
  - un bouton « Reprendre mon snippet » qui ouvre l'app avec `?resume=1` ;
  - le rappel que les prises sont sur le téléphone où il a filmé ;
  - le lien de désinscription.
- **Désinscription en un clic :**
  - le lien est signé avec le secret du serveur (`AUTH_SECRET`), donc personne ne peut désinscrire quelqu'un d'autre ;
  - la page demande de confirmer avec un bouton, pour qu'un anti-virus qui ouvre le lien ne désinscrive pas la personne ;
  - Gmail et Apple Mail ont leur bouton « Se désabonner » (en-têtes `List-Unsubscribe` et `List-Unsubscribe-Post`) ;
  - les e-mails du compte (codes, paiements) continuent.
- **Éteinte tant que Juridique n'a pas validé.** Elle s'allume avec la variable `NUDGE_EMAIL = "1"` dans `wrangler.toml` (ce n'est pas un secret). Sans elle, rien ne part.
- Elle tourne avec les tâches du jour : 20 comptes au plus par passage. Si l'envoi échoue, elle réessaie au passage suivant.

## « Comment ils nous ont connus » (demande `chef-question-source.md`)
- **Carte sur la page « Comptes et visites »**, 7 ou 30 jours. Par réponse :
  - les comptes créés ;
  - les essais Pro commencés ;
  - les premiers paiements (« Payants »).

  Dessous : combien de comptes n'ont pas encore répondu, et les textes tapés dans « Autre » sur 30 jours (pour repérer une nouvelle source).
- **« Derniers inscrits »** : nouvelle colonne « Comment il a connu Stalak », à côté de la source mesurée.
- La liste des essais en cours de la carte « Essais Pro » l'affiche aussi.
- **Les 3 essais du 26/11 :** rien ne leur est envoyé. Ils verront la question à leur prochaine visite, quand App aura mis la carte.
- **Route :** `GET /api/admin/heard` (module `functions/_lib/heard.js`).

## Contrat pour App
1. **Les évènements d'étape** : `acctEvent` / `POST /api/event` avec `name` parmi `step_song`, `step_passage`, `step_take1`, `step_take3`, `step_preview`, `step_lyrics`, `step_export_start`, `step_export_ok`.
   - **Toujours avec `vid`** (le numéro de visite de la page, déjà envoyé pour les autres évènements) : sans lui, chaque envoi compte.
   - **`step_preview` avec `ms`** : les millisecondes depuis l'arrivée sur la page. `src/account.js` transmet `extra.ms` et envoie la session pour les `step_*`. Exemple : `acctEvent('step_preview', { ms: Date.now() - T0 })`.
   - `step_take1` et `step_take3` d'un compte connecté servent aussi à la relance (compteur `takes` / `takes3` du compte). Rien de plus à faire.
2. **La carte de la question** : `POST /api/account/heard` avec `{ answer, text? }`.
   - `answer` ∈ `chatgpt`, `google`, `other_ai`, `tiktok`, `instagram`, `youtube`, `friend`, `other`, `skip`.
   - `text` : seulement avec `other`, 60 caractères (le serveur coupe et nettoie).
   - `GET /api/me` donne `user.heardAsked` : la montrer seulement s'il vaut `false`.
   - Réponse : `{ saved, heardAsked: true }`. Une 2e réponse ne change rien.
3. **La case des rappels** (sous les prises, ou dans le compte), **jamais cochée d'avance** : `PUT /api/account/emails` avec `{ tips: true|false, lang: 'fr'|'en' }`.
   - `GET /api/me` donne `user.emailTips` (`true`, `false` ou `null` si jamais demandé).
   - Le texte de la case est **exactement** celui de `TIPS_TEXT` (`functions/_lib/activation.js`), validé par Juridique. S'il change, changer aussi `TIPS_CONSENT` (la version gardée comme preuve).
     - FR : « M'envoyer un rappel si je laisse un montage pas fini, et des conseils pour mes vidéos (au plus 2 e-mails par mois). Je peux me désinscrire à tout moment. »
     - EN : « Send me a reminder if I leave an edit unfinished, and tips for my videos (2 e-mails a month at most). I can unsubscribe at any time. »
4. **`?resume=1`** : le lien de la relance ouvre l'accueil de l'app avec `?resume=1&utm_…`. App le relie à son point 2 (« Reprendre ton snippet ? ») : ouvrir directement le projet en cours.

## Pour Juridique (point 8)
- **Consentement :**
  - la case n'est jamais cochée d'avance ;
  - le texte accepté et sa date sont gardés ;
  - la relance part seulement avec ce oui, ou avec l'inscription « conseils » déjà confirmée par lien (double confirmation du 7/11).
  - **Question à trancher :** la liste du 7/11 avait accepté « des conseils ». Une relance de projet est-elle couverte ? Si non, retirer cette 2e voie (une ligne dans `projectNudges`).
- **Une seule relance par compte**, désinscription en un clic dans chaque e-mail, et l'expéditeur reste Stalak.
- **Phrase proposée pour la confidentialité :**
  - FR : « Si tu l'acceptes, nous t'envoyons un seul rappel quand tu laisses un montage pas fini (24 h après tes prises), puis au plus 2 conseils par mois. Pour cela, nous notons sur ton compte que tu as filmé des prises et la date. Tu peux te désinscrire à tout moment par le lien de chaque e-mail. Nous comptons aussi, sans savoir qui tu es, les étapes passées dans l'éditeur et le temps jusqu'au premier montage, effacés au bout de 90 jours. »
  - EN : « If you agree, we send you a single reminder when you leave an edit unfinished (24 h after your takes), then at most 2 tips a month. For this, we note on your account that you filmed takes and when. You can unsubscribe at any time with the link in every e-mail. We also count, without knowing who you are, the steps taken in the editor and the time to the first edit, deleted after 90 days. »
- La réponse à « Comment tu as connu Stalak ? » est facultative (« Skip »). Elle reste sur le compte et part avec lui.
- **`NUDGE_EMAIL` reste éteint** tant que Juridique n'a pas dit oui.

## Corrigé au passage
- **Les boutons des pages « Confirmer mon e-mail » et « Me désinscrire » de la liste « conseils » (7/11) étaient refusés (erreur 415).** Ce sont des formulaires HTML simples, et le serveur n'acceptait que le JSON. Ils passent maintenant ; un autre site reste refusé (contrôle d'origine). Test ajouté.

## Tests
- `node tests/backend/run.mjs` : **148/148**, dont 4 nouveaux :
  - **étapes :**
    - une fois par visite et par appareil ;
    - les secondes jusqu'au wow (un temps absurde n'est pas gardé) ;
    - les prises d'un compte connecté comptées pour la relance ;
    - les parts, la plus grosse perte et la médiane ;
    - accès refusé sans Cloudflare Access.
  - **question :**
    - une fois, les 8 réponses ou « skip », mauvaise réponse refusée ;
    - le texte de « Autre » nettoyé et coupé ;
    - `heardAsked`, la carte, « Derniers inscrits ».
  - **relance :**
    - consentement seulement, entre 24 h et 72 h ;
    - pas si une vidéo est finie depuis, une seule fois ;
    - éteinte sans `NUDGE_EMAIL`, réessai si Resend est en panne ;
    - en-têtes de désinscription ;
    - page qui demande, POST en un clic, mauvaise signature sans effet.
  - **formulaires de la liste « conseils » :** acceptés, un autre site toujours refusé.
- `tests/ui/support_ui.py` : **64/64** (toutes les pages du tableau de bord). `analytics_ui.py` : **76/76**. `mesure_ui.py` : **132/132**.
- La démo (`/admin-demo/`) montre les 2 cartes avec de fausses données (`tests/fixtures/activation-seed.mjs`), vérifiées sur ordinateur et sur téléphone : rien ne dépasse de l'écran, aucune erreur.
