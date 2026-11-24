# Compte rendu — compte/dashboard-clarity-ga4
**Statut : PRÊT.** **Migration 0022** (`migrations/0022_clarity_snapshots.sql`) à lancer dans la console D1 avant la mise en ligne.
Demande : `docs/handoff/chef-dashboard-clarity-ga4.md` (24/11, 3 h 33).
Démo avec de fausses données : `https://<aperçu de la branche>/admin-demo/` → ☰ → « 🔍 Clarity et Google Analytics ».

## Ce que voit le propriétaire
- **Nouvelle page « 🔍 Clarity et Google Analytics »** dans le menu ☰, et **2 tuiles sur l'Accueil** :
  - « Sur le site en ce moment » (GA4) ;
  - « Plus gros souci repéré » (Clarity).
- En haut de la page, toujours visible : « ne voient que les visiteurs qui ont accepté les cookies : environ X % des visites », calculé avec les visites GA4 divisées par notre compteur sans cookie, sur les mêmes jours.
- **Google Analytics** (aujourd'hui / 7 j / 30 j) :
  - **en direct** : nombre de personnes, pays, pages ; mis à jour chaque minute ;
  - **l'entonnoir étape par étape** : nombre de personnes et % de l'étape d'avant. **La plus grosse perte est en rouge.** Les étapes `onboarding_etape_N` n'apparaissent qu'une fois envoyées par l'app ;
  - sources / support (TikTok repéré 🎵), pays, appareils, langues, pages les plus vues avec le temps passé, temps moyen par personne.
- **Clarity** :
  - le relevé du jour : sessions sans robots, pages par session, défilement, temps actif, appareils, canaux, sessions des 14 derniers jours ;
  - les **6 signaux de friction** en totaux, puis **par page et appareil**, du plus fréquent au moins fréquent ;
  - sous chaque signal, un lien **« ▶ Voir les enregistrements »** qui ouvre Clarity dans un nouvel onglet, avec le filtre à choisir écrit dessous ;
  - le bouton « Relever maintenant ».
- Chaque carte a son bouton « ? » qui ouvre une explication.
- **Sans secret**, la page donne les étapes à suivre, sans erreur. C'est le même principe que « Relier mon Telegram ».

## Limites des API (vérifiées dans la doc officielle le 24/11)
- **Clarity** :
  - **10 appels par projet et par jour** ;
  - seulement les **1 à 3 derniers jours** ;
  - 3 dimensions et 1 000 lignes au plus, sans pagination ;
  - le code 429 veut dire « limite du jour atteinte ».
- **Ce qu'on fait pour Clarity** :
  - **un relevé par jour UTC** (les 24 h d'avant), soit **3 appels**, gardé 400 jours en base ;
  - jamais plus de 8 appels par jour ;
  - après un 429, plus aucun appel jusqu'au lendemain, et **le dernier relevé reste affiché** ;
  - la page lit la base, elle n'appelle jamais Clarity.
- **GA4** (propriété standard) : 200 000 jetons par jour, 40 000 par heure, 14 000 par projet et par heure, 10 requêtes à la fois, 10 erreurs serveur par heure. Le temps réel a les mêmes limites, comptées à part.
- **Ce qu'on fait pour GA4** : environ 4 rapports par chargement (~10 jetons chacun), gardés 10 min en mémoire (1 min pour le direct).

## À faire avant que ça marche (secrets : c'est le propriétaire qui les tape, jamais dans le code)
1. **Chef de projet** : dans Google Cloud, créer un compte de service et activer « Google Analytics Data API ». Ensuite :
   - créer une clé JSON pour ce compte ;
   - dans GA4 → Admin → Gestion des accès à la propriété **565628578**, ajouter son adresse comme **Lecteur**.
2. **Propriétaire** : dans Cloudflare → stalak-site → Paramètres → Variables et secrets, ajouter le secret **`GA4_SA_KEY`** et y coller tout le fichier JSON.
3. **Propriétaire** : dans Clarity → Paramètres → Exportation de données, cliquer « Générer un nouveau jeton d'API ». Ensuite :
   - ajouter le secret **`CLARITY_API_TOKEN`** au même endroit dans Cloudflare ;
   - si on veut que le Worker de nuit fasse aussi le relevé : `npx wrangler secret put CLARITY_API_TOKEN -c workers/cloud-cleanup/wrangler.toml`. C'est facultatif : le site le fait déjà toutes les 6 h au plus.
4. Ouvrir la page et toucher « Relever maintenant ».

`GA4_PROPERTY_ID = "565628578"` est dans `wrangler.toml` : ce n'est pas un secret.

## Un point à vérifier (non trouvé dans la doc)
- **Le format d'adresse d'un filtre dans Clarity n'est pas documenté.** Le lien ouvre donc la page des enregistrements du projet, et le filtre à choisir est écrit sous le lien (ex. « Dead clicks · URL contient « / » · Device : Mobile · 3 derniers jours »).
- Pour pré-remplir le filtre : filtrer une fois dans Clarity et m'envoyer l'adresse affichée. Je l'ajouterai.
- Les noms exacts des champs de Clarity ne sont documentés que pour « Traffic ». Pour les autres, la lecture est prudente : un champ inconnu ne casse rien, il affiche « — ».

## Fichiers
- **Nouveaux** :
  - `functions/_lib/ga4.js` : jeton du compte de service, rapports, entonnoir ;
  - `functions/_lib/clarity.js` : relevé du jour, nettoyage, lecture ;
  - `migrations/0022_clarity_snapshots.sql` ;
  - `tests/fixtures/analytics-fake.mjs` ;
  - `tests/ui/analytics_ui.py`.
- **Modifiés** :
  - `functions/_lib/admin.js` : 4 routes ;
  - `functions/_lib/admin-page.js` : page, tuiles, démo ;
  - `functions/_lib/cloud.js` : tâches du jour ;
  - `functions/_lib/router.js` : route cron ;
  - `workers/cloud-cleanup/index.js` ;
  - `wrangler.toml` ;
  - `tools/admin_demo_data.mjs` et `functions/_lib/admin-demo-data.js` ;
  - `tests/backend/run.mjs` ;
  - `tests/ui/support_ui.py` : 8 tuiles et 10 pages au lieu de 6 et 9 ;
  - `BACKEND.md`.

## Tests
- Serveur : `node tests/backend/run.mjs`, **132/132**, dont 6 nouveaux :
  - secret absent (rien n'est envoyé à Google ni à Clarity) ;
  - jeton JWT vérifié (signature et portée lecture seule) ;
  - entonnoir et plus grosse perte ;
  - erreurs GA4 403 / 429 / clé refusée / 500 ;
  - relevé Clarity (une fois par jour, `?code` et e-mail jamais gardés) ;
  - 429 : plus d'appel ce jour-là et dernier relevé gardé ; jeton refusé ; 8 appels au plus ;
  - route cron et « Relever maintenant ».
- Interface : `tests/ui/analytics_ui.py`, **76/76**. Démo et vrai tableau sans secret, sur ordinateur et téléphone : pas de défilement de côté, aucune erreur, les « ? » marchent.
- `tests/ui/support_ui.py` : **64/64**.

## Juridique
- Rien de nouveau n'est collecté : ces deux outils sont déjà chargés après « Accepter ».
- Le tableau de bord ne lit que des totaux. Il n'affiche jamais d'e-mail, d'IP ni d'identifiant de visiteur.
- Google et Microsoft restent les sous-traitants déjà listés dans la page de confidentialité.

## Ce qui reste
- Les secrets ci-dessus (propriétaire, plus le compte de service par le Chef de projet).
- Le format d'adresse filtrée de Clarity, si on veut un lien pré-filtré.
- **App** doit envoyer `onboarding_etape_N` pour que ces étapes apparaissent dans l'entonnoir.
