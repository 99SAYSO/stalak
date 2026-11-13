# Tour du site et audit — 13/11/2026 (Chef de projet)

Méthode : visite automatique des 54 pages en ligne de stalak.app (plan du site + tous les liens internes), chacune ouverte dans un vrai navigateur en taille téléphone et ordinateur (84 visites) ; essai de l'exemple en FR et EN ; tests serveur ; PageSpeed de Google (mobile) ; Search Console ; lecture de la base (compteurs du 7 au 13/11). Skills : `seo-audit`, `webapp-testing`.
Non testé ici : l'export d'une vraie vidéo (le navigateur de test ne lit pas le H.264) et un vrai paiement.

## Ce qui va bien
- 54 pages sur 54 répondent ; 0 lien interne cassé ; 39 fichiers (images, vidéos, scripts) tous présents.
- 0 erreur dans le navigateur et 0 page qui déborde, sur téléphone comme sur ordinateur.
- L'exemple va jusqu'à « Ton montage / Exporter » en FR et en EN, sans erreur.
- Google : plan du site à jour (38 pages), balises FR/EN réciproques, une seule balise H1 par page, vraie page 404, anciennes adresses bien redirigées, http → https.
- PageSpeed mobile de l'accueil : Accessibilité 98, Bonnes pratiques 100, SEO 100, Performances 84.
- Tests serveur : 105/105.

## À corriger

| # | Constat | Gravité | Pour qui |
|---|---|---|---|
| 1 | `www.stalak.app` affiche une erreur au lieu d'aller sur stalak.app | Moyenne | Chef de projet, dans Cloudflare, avec l'accord du propriétaire |
| 2 | La copie de la base échoue toujours (2 lundis de suite) : les 3 secrets GitHub manquent | Moyenne | Propriétaire |
| 3 | On ne mesure plus l'intérêt pour le mode Clip : `ev_plans_why_clip` = 0 depuis le 7/11 (67 avant), `why_other` = 21. Soit la raison est mal rangée depuis `marketing/clip-avant` / `app/clip-1`, soit personne ne lance d'export Clip. Ajouter aussi un compteur « a ouvert le mode Clip » | Moyenne | Comptes + App |
| 4 | Accueil lent sur téléphone en 4G lente : plus grand élément affiché en 4,5 s (cible : 2,5 s). Script de 305 Ko compressé, dont environ 200 Ko inutiles au premier écran | Moyenne | App |
| 5 | Erreur 500 du 12/11 sur `POST /api/projects/:id/files/:id/complete` : l'appel R2 `complete()` n'est pas protégé (`functions/_lib/cloud.js` l. 347). Un seul cas | Faible | Comptes |
| 6 | Bas de page français : 6 liens vers des guides qui n'existent qu'en anglais | Faible | Marketing |
| 7 | 4 titres un peu longs pour Google (66 à 69 caractères) : accueil, rappers, snippet, singers | Faible | Marketing |
| 8 | Conditions et remboursement : pas d'image de partage | Faible | Marketing |
| 9 | Pas d'en-tête Content-Security-Policy | Faible | Comptes |
| 10 | Bouton de choix pâle sur téléphone après un toucher (`src/theme.css` l. 171), signalé le 9/11 | Faible | App |

Toujours en attente depuis l'audit du 6/11 : migration 0014, Workers Paid, `cloud-cleanup`, base séparée pour les aperçus, SIRET.

## Chiffres du 7 au 13/11
- Exports : 71 lancés, 60 réussis (85 %). 6 échecs : 4 annulations, 2 plantages sur iPhone. 59 exports sur 60 viennent d'un iPhone.
- Offres : 47 ouvertures ; paiement ouvert 9 fois, fermé sans payer 5 fois, payé 3 fois.
- Visites par source : direct 369, triller 25, google 22, instagram 18, tiktok 0.
- Search Console (7 j) : 28 clics, 111 affichages, uniquement sur « stalak ».
