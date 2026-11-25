# Demande du Chef : le coach IA « blow up » (25/11/2026)

Décision du propriétaire (25/11, 0 h 59), sur « Ton plan de la semaine » : « il faut un truc plus poussé, une vraie analyse de son contenu… mettre une IA derrière… personnalisée sur l'analyse des comptes de rappeur, ce qui marche… une IA exprès pour ce côté "blow up" du rappeur, ça doit être une grosse partie importante de Stalak. On doit vendre l'appli comme une alternative [à Triller], mais aussi comme la meilleure appli pour aider les rappeurs sur les réseaux, leur marketing. »

## L'idée
Dans « Stats », une partie **« Ton coach »** (Pro) : chaque semaine, une analyse écrite par une IA à partir des **vraies données** de l'artiste, et un plan concret.
- Ce qu'elle lit : ses vidéos TikTok (liaison TikTok : vues, likes, partages, commentaires, durée, heure de publication, légende et hashtags de chaque vidéo), ses chiffres Spotify (relevé Apify), ses sorties, ses réponses au questionnaire (style, objectif, ce qui le bloque), ses montages Stalak.
- Ce qu'elle rend (court, en tutoyant, dans sa langue) :
  1. **Ce qui marche** chez lui (ses 3 meilleures vidéos et pourquoi : accroche, durée, heure, son, format) ;
  2. **Ce qui ne marche pas** et quoi arrêter ;
  3. **Le plan de la semaine** : 3 à 5 idées de vidéos précises (accroche écrite, format, quel son et quel passage, jour et heure), avec un bouton « Monter cette idée » qui ouvre l'éditeur sur ce son ;
  4. **Le rythme de sortie** et le prochain son à pousser.
- Plus tard (pas dans la v1) : discuter avec le coach (le glaçon d'aide), analyse des images des vidéos.

## Règles
- **Aucun chiffre inventé** dans l'analyse : l'IA ne reçoit que les données réelles et ne cite que celles-là ; ce qui manque est dit comme manquant. Les conseils sont présentés comme des conseils, jamais comme une promesse de résultats.
- Pro / Creator Plus seulement ; les gratuits voient la partie floutée avec le cadenas (comme le reste de « Stats »).
- Une analyse par semaine et par artiste (plus une à la première ouverture), gardée en base : pas d'appel à l'IA à chaque ouverture de l'écran. Limite de coût par compte et par mois, alerte au propriétaire si elle est dépassée.

## Qui fait quoi
- **Comptes** (`compte/coach-ia`) : route `GET /api/coach` ; tâche hebdomadaire ; appel à l'API Claude d'Anthropic (secret `ANTHROPIC_API_KEY`, **saisi par le propriétaire dans Cloudflare**, jamais dans le code) ; consignes de l'IA écrites pour l'analyse de comptes de rappeurs ; réponse en JSON structuré (les 4 parties) ; contrat pour App dans `docs/contrats/coach-ia.md` ; estimation du coût par artiste et par mois. Proposer d'abord le contrat et 2 exemples d'analyse sur des données d'exemple, avant de tout brancher.
- **App** (`app/coach-ia`) : la partie « Ton coach » dans « Stats » (remplace « Ton plan de la semaine »), maquette avec `?demo=pro` d'abord, validée par le propriétaire.
- **Juridique** : confidentialité (données envoyées à Anthropic pour l'analyse, durée, Anthropic ajouté aux prestataires), mention « analyse écrite par une IA », conditions (conseils, pas de promesse de résultats).
- **Marketing** : le positionnement change (« la meilleure appli pour aider les rappeurs à percer sur les réseaux », en plus de l'alternative à Triller) ; proposer au propriétaire les nouveaux textes d'accueil et de tarifs avant de les mettre.
