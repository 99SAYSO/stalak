# AppSec review — compte/mesure-et-offre-1-euro
Scope / authority : dépôt `99SAYSO/stalak`, branche `compte/mesure-et-offre-1-euro` contre `origin/main` (efbb0c0), arbre de travail. Fichiers : `src/consent.js` (nouveau), `src/account.js`, bloc compte de `src/app.js` + `src/markup.html` + `src/theme.css` (offre à 1 €), `build_site.py`, `functions/_lib/conversions.js` (nouveau), `paddle-offer.js` (nouveau), `paddle.js`, `trial.js`, `entitlements.js`, `router.js`, `metrics.js`, `admin.js` / `admin-page.js`, `wrangler.toml`. Tests locaux (faux Paddle, faux TikTok, outils de mesure simulés). Aucun service réel touché.

Threat model :
- Biens : la vie privée des visiteurs (consentement RGPD / CNIL : rien avant l'accord), l'e-mail des acheteurs, l'argent (offre à 1 € une fois par personne), le jeton TikTok, la clé Paddle du serveur.
- Acteurs : visiteur, acheteur, personne qui veut l'offre plusieurs fois, scripts tiers (Clarity, Google), TikTok, Paddle (webhooks signés), propriétaire (tableau de bord derrière Cloudflare Access).
- Frontières : la page (choix du visiteur) → `customData` Paddle → webhook signé → serveur → TikTok ; tableau de bord → API Paddle avec la clé du serveur.

Release advice : **proceed within reviewed scope** (rien ne s'allume tant que les identifiants et prix ne sont pas remplis).

| ID | Sévérité / confiance | Fichier | Conditions / impact | Correction / test |
|---|---|---|---|---|
| M1 | Élevé / confirmé (protégé) | consent.js | Charger Clarity / GA4 ou déposer leurs cookies avant l'accord = infraction CNIL. | Aucun script ni cookie de mesure avant « Accepter » (vérifié par requêtes réseau et cookies), GPC = refus sans bandeau, Refuser efface les cookies `_ga*`, `_clck`, `_clsk`… et coupe l'envoi ; boutons de même taille. Test `mesure_ui.py` (98 vérifications, 4 écrans). |
| M2 | Élevé / confirmé (protégé) | consent.js | Clarity enregistre l'écran : e-mails, mots de passe, vidéos des gens. | Tous les champs, `canvas` et `video` marqués `data-clarity-mask`, y compris ceux ajoutés plus tard (MutationObserver). **À faire par le propriétaire** : réglage de masquage « Strict » dans Clarity. Test « champs, aperçus et vidéos masqués ». |
| M3 | Moyen / confirmé (protégé) | conversions.js | Envoyer l'e-mail en clair ou sans accord à TikTok. | Seulement si `customData.mc = 1` ; e-mail en minuscules haché SHA-256, identifiant du compte haché ; pas d'IP ; test « jamais en clair », « sans accord : rien ». Le `mc` vient de la page (c'est le choix du visiteur ; un client modifié ne peut qu'ajouter ses propres données). |
| M4 | Moyen / confirmé (protégé) | conversions.js, paddle.js | Un envoi lent à TikTok ralentirait ou ferait échouer le webhook Paddle (paiements rejoués). | Envoi après la réponse à Paddle (`waitUntil`), délai de 10 s, erreurs comptées, jamais d'échec du webhook. Une seule fois par paiement (event_id = id de transaction, 1er paiement de l'abonnement seulement). Tests. |
| M5 | Moyen / confirmé (protégé) | trial.js | L'identifiant du prix à 1 € est public : quelqu'un qui a déjà eu un essai peut le forcer dans Paddle. | Même contrôle au webhook que l'essai gratuit (une seule requête SQL) : arrêt immédiat, **1 € remboursé en entier** (ajustement Paddle), jamais de Pro. Tests. |
| M6 | — | — | (24/11) Le bouton du tableau de bord qui créait le prix Paddle est **retiré** avec sa route : le prix a été créé à la main ; plus aucune écriture dans le catalogue Paddle depuis le site. | — |
| M7 | Info / décidé (24/11) | offre à 1 € | Un montant faux à côté d'un bouton de paiement. | Montants lus chez Paddle sur le prix de l'offre pour le pays de la personne (aujourd'hui, puis le mensuel de ce prix) ; si Paddle ne répond pas, l'offre n'est pas montrée. Test `mesure_ui.py` : France, États-Unis (FR et EN), Allemagne, Paddle muet. |
| M9 | Moyen / confirmé (protégé) | artist.js | Réponses de l'onboarding et auditeurs = données personnelles ; liens fournis par l'utilisateur (risque de lien piégé affiché plus tard). | Compte obligatoire, chaque compte ne lit et n'écrit que les siennes ; listes fermées ; liens réécrits en https et limités à open.spotify.com, music.apple.com, soundcloud.com, instagram.com (pas de `javascript:`, pas d'identifiants dans l'URL) ; nom nettoyé (caractères de contrôle et d'inversion de sens retirés, 60 caractères) ; JSON obligatoire ; limites 120 / 60 par heure ; supprimé avec le compte ; tableau de bord en totaux seulement (test : aucun nom ni lien dans la réponse). |
| M8 | Info | consent.js | Scripts tiers chargés après accord = code de Microsoft et Google dans la page. | Accepté (décision du propriétaire). Pas de CSP aujourd'hui ; quand elle viendra (audit 13/11 n° 4), autoriser `www.clarity.ms`, `*.clarity.ms`, `www.googletagmanager.com`, `*.google-analytics.com`. |

Dependencies : aucune ajoutée (scripts tiers chargés à la demande, pas dans le dépôt).
Secrets hygiene : `TIKTOK_EVENTS_TOKEN` lu dans l'environnement, jamais dans `/api/config` (test) ni dans le code ; valeur factice dans les tests. Identifiants Clarity / GA4 / pixel publics.

| Check | Statut | Commande | Résultat |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 127/127 (7 nouveaux) |
| Bandeau, outils, entonnoir, offre à 1 € | PASS | `tests/ui/mesure_ui.py public` | 98/98 (iPhone 12 et ordinateur, FR / EN) |
| Essai gratuit (non-régression) | voir compte rendu | `tests/ui/essai_pro_ui.py public` | |
| Compteurs de la page | voir compte rendu | `tests/ui/audit_ui.py public` | |
| Vrais Clarity / GA4 / TikTok / prix Paddle | NOT RUN | — | identifiants et prix pas encore créés |

Coverage / residual risk : la forme exacte des réponses de l'API TikTok et de `PricePreview` pour un essai payant est celle de la documentation : à confirmer en Sandbox / « Test events ».
CEO handoff : Chef de projet (identifiants, prix, essais réels) ; propriétaire (Clarity « Strict », secret TikTok) ; Juridique (textes, taxe du 1 €) ; App (écran « Bienvenue », onboarding).
