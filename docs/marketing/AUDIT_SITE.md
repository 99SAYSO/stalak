# Audit du site — 27/10/2026 (conversation Marketing & croissance)

Skills utilisés : `seo-audit`, `copywriting`, `webapp-testing`.

## Ce qui va bien
- `robots.txt` et `sitemap.xml` en place, avec les versions FR/EN reliées (hreflang) et une version par défaut (`x-default` → /en/).
- Chaque page a son adresse canonique, sa langue (`lang`), son titre et ses données structurées (WebApplication, Product).
- Aucune image sans texte alternatif ; pas de défilement horizontal à 390 px ni à 1280 px.

## Corrigé sur la branche `marketing/audit-site`
| Problème | Correction |
|---|---|
| Descriptions Google trop longues (178 à 190 caractères, coupées dans les résultats) | Ramenées à 135–151 caractères (accueil FR/EN, tarifs FR/EN) |
| Page Tarifs sans aperçu de partage (pas d'`og:` ni `twitter:`) | Ajoutés, avec l'image `og.png` |
| Titre Tarifs peu cherché (« Stalak Pro — tarifs ») | « Tarifs Stalak : gratuit, ou Pro dès 6,58 €/mois » (+ EN) |
| FAQ Tarifs : « Mes vidéos sont-elles envoyées ? Non » oubliait les paroles automatiques (le son part vers Workers AI) | Réponse exacte, avec lien vers la confidentialité |
| Accueil : « rien n'est envoyé » (même oubli) | Corrigé FR/EN |
| Accueil : « paroles style karaoké » présenté comme gratuit | Karaoké et mot par mot marqués Stalak Pro |
| Limites Pro absentes des Tarifs (20 paroles/jour, 8 min, 20 Go, effacement après 6 mois) | Ajoutées dans les cartes et une question « Y a-t-il des limites ? » |
| « On les garde 6 mois » (projets d'un ancien Pro) | « jusqu'à 6 mois après leur dernière ouverture » (conforme à la règle) |
| Formules exagérées (« sortie d'un studio », « comme si un monteur pro ») | Remplacées par un fait : la vidéo se termine sur toi, sans les 3 s de logo |
| Texte de l'accueil court pour Google | Ajout de « Comment faire un playback avec Stalak » (3 étapes) et de la liste complète des fonctions |

## À décider ou à faire par d'autres rôles
- **Chef de projet** : la page Tarifs vend Pro alors que Paddle est en sandbox. Avant toute promo, soit Paddle en réel, soit boutons « Pro arrive bientôt ».
- **App & montage** : le H1 de l'accueil n'est que « Stalak » ; ajouter les mots « montage de playback » aiderait Google (fichier `src/markup.html`, hors de mon domaine).
- **App & montage** : l'accueil pèse ~900 Ko de HTML non mis en cache (JS et CSS dans la page). Les sortir dans des fichiers en cache accélérerait l'affichage sur téléphone.
- **Comptes** : case « recevoir les nouveautés » (non cochée) à l'inscription, nécessaire pour les e-mails d'annonce.
- Plus tard : ajouter les pages légales au `sitemap.xml` (faible priorité).

## Logo pour l'écran de connexion Google
Fichier prêt : `docs/marketing/logo-google-120.png` (120 × 120, PNG, moins de 1 Mo, carré).
