# AppSec review — compte/video-offerte (« 1re vidéo sans filigrane offerte »)
Scope / authority : dépôt `99SAYSO/stalak`, branche `compte/video-offerte` contre `origin/main` (ec52a24), arbre de travail. Fichiers serveur : `functions/_lib/freevideo.js` (nouveau), `entitlements.js`, `router.js` (`POST /api/free-video`), `retention.js`, `admin.js` / `admin-page.js`, `migrations/0019_free_video.sql`. Tests locaux seulement (faux D1), aucun service réel touché.

Threat model :
- Biens : le droit à une vidéo sans filigrane (valeur commerciale : c'est ce que vend Pro) ; les adresses e-mail (seule leur empreinte est gardée).
- Acteurs : compte gratuit honnête, compte gratuit qui veut des vidéos offertes en série, visiteur sans compte, page d'un autre site (CSRF).
- Entrées : `POST /api/free-video`, `GET /api/me`.
- Frontière : le serveur dit oui ou non ; **la vidéo est fabriquée dans le téléphone**, c'est l'app qui pose ou non le filigrane.

Release advice : **proceed within reviewed scope** (les limites ci-dessous sont des choix produit, pas des failles du serveur).

| ID | Sévérité / confiance | Fichier | Conditions / impact | Correction / test |
|---|---|---|---|---|
| F1 | Moyen / confirmé (corrigé) | freevideo.js `claimFreeVideo` | Deux exports en même temps auraient pu recevoir deux « oui » avec un « lire puis écrire ». | Une seule requête SQL qui n'écrit que si le compte ET l'adresse n'ont rien pris (`UPDATE … WHERE free_nowm_at IS NULL AND NOT EXISTS …`). Test « two exports start at the same time ». |
| F2 | Moyen / confirmé (corrigé) | freevideo.js `freeVideoMark` | Supprimer son compte puis le recréer avec la même adresse, ou utiliser nom+1@…, n.o.m@gmail.com, pour reprendre une vidéo. | Empreinte de l'adresse ramenée à une seule forme (sans « +… », sans les points Gmail), gardée après la suppression du compte. Tests « deleted then re-created » et « copies of one mailbox ». |
| F3 | Faible / confirmé (protégé) | router.js | Appel depuis un autre site ou sans compte. | Compte obligatoire (401), JSON obligatoire et origine vérifiée (415 / 403, règle commune), 30 demandes par heure. Test 401 / 415. |
| F4 | Info / hypothèse | app (hors serveur) | Une app modifiée à la main peut exporter sans filigrane sans demander au serveur : la vidéo est faite dans le téléphone. Aucun serveur ne peut l'empêcher sans fabriquer la vidéo lui-même. | Accepté. Le serveur garde le compte exact des vidéos offertes données. |
| F5 | Info / hypothèse | — | De nouvelles adresses réelles (ou les adresses relais « Masquer mon e-mail » d'Apple) donnent de nouvelles vidéos : chaque compte doit valider un code par e-mail ou passer par Google / Apple / Microsoft. | Accepté (règle : une par compte). À surveiller sur le tableau de bord. |
| F6 | Info | — | Si l'export rate après le « oui », la vidéo offerte est perdue. Pas d'adresse pour la « rendre » : elle permettrait d'en obtenir à l'infini. | Décision produit pour le Chef de projet / App (voir compte rendu). |
| F7 | Info | — | La maquette d'une branche utilise la vraie base : y prendre sa vidéo offerte la consomme vraiment. | À savoir pour les essais. |

Dependencies : aucune ajoutée ni changée.
Secrets hygiene : aucun secret ajouté ; aucune adresse en clair gardée pour cette fonction (empreinte SHA-256 seulement, vérifiée par le test).

| Check | Statut | Commande | Résultat |
|---|---|---|---|
| Tests serveur | PASS | `node tests/backend/run.mjs` | 118/118 |
| Tableau de bord + support (page) | PASS | `tests/ui/support_ui.py` sur `server.mjs` | 64/64 |
| Carte du tableau de bord (390 / 1280 px) | PASS | Playwright sur `/admin-demo/#funnel` | aucune erreur, pas de défilement de côté |
| Vraie base D1 | NOT RUN | — | migration 0019 à lancer par le Chef de projet |

Coverage / residual risk : l'app (App) n'appelle pas encore l'adresse ; le filigrane reste posé par le téléphone (F4).
CEO handoff : Chef de projet (migration 0019, intégration) ; App (appeler `POST /api/free-video` et lire `freeNoWm`) ; Juridique (durée de 3 ans des empreintes dans la page de confidentialité).
