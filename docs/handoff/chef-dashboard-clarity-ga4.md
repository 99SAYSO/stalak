# Clarity et Google Analytics dans le tableau de bord — demande du Chef de projet à « Comptes »

Date : 24/11/2026, 3 h 30. Demande du propriétaire : « sur le dashboard du site, je veux qu'on puisse voir toutes les infos venant de Clarity et de Google Analytics ». Branche : `compte/dashboard-clarity-ga4`. Domaine : `functions/_lib/admin*.js` (tableau de bord admin.stalak.app).

## Ce qu'il veut voir (une nouvelle page du menu, « 🔍 Clarity et Google Analytics », plus 2 tuiles sur l'Accueil)

**Google Analytics 4** (propriété `565628578`, flux `G-LY6HDYZKEK`), par la **GA4 Data API** (`runReport`, `runRealtimeReport`) :
- en direct : personnes sur le site maintenant, par pays et par page ;
- **l'entonnoir** (le plus important pour lui) : `accueil_vue` → `onboarding_etape_N` → `export_lance` → `export_ok` → `paywall_vu` → `checkout_ouvert` → `achat`, en nombre et en % d'une étape à l'autre, sur 1 / 7 / 30 jours, et **l'étape où l'on perd le plus de monde mise en rouge** ;
- d'où viennent les gens (source / support, dont TikTok), pays, appareil (téléphone / ordinateur), langue ;
- pages les plus vues, temps d'engagement moyen ;
- rappel visible : « seulement les visiteurs qui ont accepté les cookies » + la part estimée (comparée à nos compteurs `visits`, qui comptent tout le monde).

**Microsoft Clarity** (projet `zic7crm0mc`), par l'**API d'export de Clarity** (« Data Export » : `GET https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=1|2|3&dimension1=…`, jeton `Authorization: Bearer`). Limites à vérifier dans la doc officielle (skill `context7`) : 1 à 3 derniers jours seulement, peu d'appels par jour (environ 10) → **un relevé par jour gardé en base** (D1, nouvelle table) pour avoir l'historique, et l'affichage lit la base :
- sessions, pages par session, profondeur de défilement, temps passé ;
- **les signaux de friction** : clics de rage, clics morts, retours rapides, erreurs JavaScript, défilement excessif, par page et par appareil ;
- pour chaque signal : un lien **« Voir les enregistrements »** qui ouvre Clarity filtré (les vidéos restent chez Clarity : on ne les copie pas).

Tout en français simple, avec le bouton « Explication » comme les autres tuiles. Ne jamais afficher d'e-mail, d'IP ni d'identifiant de visiteur.

## Accès (secrets : saisis par le propriétaire, jamais dans le code)
- **Clarity** : le propriétaire génère le jeton dans Clarity → Paramètres → **Exportation de données** → « Générer un nouveau jeton d'API », puis le tape dans Cloudflare → stalak-site → Variables and secrets (Production) : **`CLARITY_API_TOKEN`**.
- **GA4** : un **compte de service** Google Cloud (projet « Stalak »), ajouté en **Lecteur** sur la propriété GA4 ; sa clé JSON tapée par le propriétaire dans **`GA4_SA_KEY`** (secret). Le Chef de projet prépare le compte de service et l'accès dans GA4 ; seule la clé reste au propriétaire. Signature JWT RS256 avec WebCrypto (pas de bibliothèque Node), jeton d'accès gardé en cache ~50 min.
- Mettre `GA4_PROPERTY_ID = "565628578"` dans `wrangler.toml` (pas un secret).
- Tant qu'un secret manque : la page dit simplement ce qu'il faut faire (comme « Relier mon Telegram »), sans erreur.

## Tests
Tests serveur avec des réponses Clarity et GA4 simulées (dont : secret absent, API en erreur, quota Clarity atteint → on garde le dernier relevé). Données de démonstration pour `/admin-demo`. Compte rendu `docs/handoff/compte-dashboard-clarity-ga4.md`, `Statut : PRÊT`, avec la migration SQL s'il y en a une.
