# Journal des données et des tests (@stalak_app, TikTok)

Règle du propriétaire (24/11/2026, 16 h 12, aussi dans « Mes goûts ») : **le contenu du jour (scripts + vidéos) se crée seulement le jour même**, après avoir regardé les chiffres de la veille et des jours d'avant. On analyse les données (très important), on améliore et on teste des choses différentes tous les jours. **Les 3 vidéos d'un même jour testent 3 choses différentes.** On continue jusqu'à ce qu'un TikTok performe beaucoup plus que les autres.

Méthode :
- Chaque jour, avant d'écrire : relever les vidéos publiées (Zernio, `analytics_get_analytics`, TikTok) et les ajouter au tableau ci-dessous.
- Chaque vidéo du jour change **une seule chose** par rapport à la base (le reste identique), et l'écrit dans sa fiche Studio (champ `test` et en tête du script).
- On compare surtout le **temps de visionnage moyen** et la **part de la vidéo regardée**, puis les vues, j'aime, partages, abonnements.
- Une différence de moins de 100 vues entre deux vidéos du « premier palier » (600 à 860 vues) ne prouve rien.

## Relevé du 24/11, 15 h (Zernio, synchronisé à 13 h 50 UTC)

| Publiée (Paris) | Vidéo | Durée | Vues | Temps moyen | Part vue | J'aime | Partages | Abonnés |
|---|---|---|---|---|---|---|---|---|
| 19/11 12 h 43 | Liam veut percer (T-Crazy) | 79 s | 811 | 17,1 s | 22 % | 53 | 6 | 1 |
| 19/11 18 h 02 | Sortir son son le jour de GTA 6 | 80 s | 798 | 13,3 s | 17 % | 83 | 4 | 0 |
| 19/11 21 h 57 | Les tee-shirts | 80 s | 832 | 8,6 s | 11 % | 40 | 0 | 0 |
| 20/11 12 h 31 | 6 h pour une vidéo de promo | 61 s | 755 | 14,2 s | 23 % | 55 | 0 | 7 |
| 20/11 18 h 04 | Sa mère a lu ses textes | 76 s | **860** | 16,2 s | 21 % | **88** | 0 | 0 |
| 20/11 21 h 00 | Le manager | 74 s | 677 | 7,9 s | 11 % | 44 | 0 | 0 |
| 21/11 11 h 30 | Clip comme dans GTA | 65 s | 697 | 9,5 s | 15 % | 64 | 0 | 2 |
| 21/11 16 h 03 | Triller | 80 s | 697 | 6,7 s | 8 % | 12 | 0 | 0 |
| 21/11 20 h 31 | Il fait nuit à 17 h | 77 s | 697 | 14,2 s | 18 % | 21 | 1 | 0 |
| 22/11 11 h 32 | Extrait à 3 h du matin | 74 s | 692 | 14,0 s | 19 % | 20 | 2 | 1 |
| 22/11 16 h 02 | Plus de voix | 80 s | 700 | 13,5 s | 17 % | 38 | 1 | 1 |
| 22/11 20 h 30 | Le clash | 75 s | 676 | 10,3 s | 14 % | 18 | 2 | 2 |
| 23/11 13 h 15 | BONNE IDÉE n° 1 : bloqué à 300 vues | 44 s | 642 | 9,9 s | 22 % | 34 | 4 | 0 |
| 23/11 18 h 03 | BONNE IDÉE n° 2 : feat à 0 abonné | 44 s | 655 | 11,9 s | 27 % | 31 | 2 | 0 |
| 23/11 21 h 03 | BONNE IDÉE n° 3 : hashtag chaton | 46 s | 604 | 8,9 s | 19 % | 23 | 0 | 0 |
| 24/11 07 h 48 | Carrousel « Le pire, c'est qu'on te les donne avec le sourire » (photos) | — | 671 | — | — | 11 | 0 | 0 |

Ce qu'on en tire (24/11) :
- **Aucune vidéo n'est sortie du premier palier** : toutes entre 600 et 860 vues. TikTok montre chaque vidéo à un premier groupe, puis s'arrête. Ce qui doit bouger d'abord, c'est le **temps de visionnage** (6,7 à 17,1 s) : presque personne ne va au bout (1 à 2 %).
- **Les meilleurs** : « Sa mère a lu ses textes » (le plus de vues et de j'aime, 16,2 s) et « Liam veut percer » (17,1 s, 30 visites du profil). Les histoires émotionnelles, où la mère est présente, marchent le mieux.
- **Les pires** : « Triller » (6,7 s), « Le manager » (7,9 s), « Les tee-shirts » (8,6 s), « Hashtag chaton » (8,9 s).
- **Les vidéos de 44 s** sont regardées sur une plus grande part (19 à 27 %) mais pas plus longtemps en secondes (9 à 12 s). Elles n'ont que 1 jour de recul.
- **L'heure** ne change presque rien jusqu'ici ; les vidéos de 18 h sont un peu au-dessus. Jamais testé : le soir tard (heure des États-Unis).

## Tests du 24/11 (bonne-idee-07 à 09)

| Heure | Vidéo | La seule chose qu'elle change |
|---|---|---|
| 19 h | n° 7 « Même sa mère le suit pas » | **Sujet** : la mère (la meilleure vidéo parlait d'elle) |
| 21 h | n° 8 « Posté à 3 h du mat » | **Durée** : environ 30 s au lieu de 44 |
| 22 h 30 | n° 9 « Payer une playlist » | **Type de hook** : une question criée (liste « Hooks à tester ») ; horaire 16 h 30 à New York |

Durées réelles : n° 7 46,6 s, n° 8 36,3 s (visé 30 s : les voix sont plus longues que prévu), n° 9 47,2 s. Voix : 21 générations, 0,27 $.

Résultats : à relever le 25/11 avant d'écrire les vidéos du jour.
