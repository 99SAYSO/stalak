# Test du relevé Spotify par Apify (24/11/2026)

Robot : `beatanalytics/spotify-play-count-scraper` (Apify), lancé depuis la console Apify du compte `stalak_app`, sur https://open.spotify.com/artist/16DsE2FfUtuGnIBXcBjKuU (99Sayso), avec « Follow albums » et « Follow singles ».
Durée : 5 s. Coût : 0,016 $ (4 liens lus : l'artiste + 3 singles).

| Donnée | Robot | Spotify (référence du propriétaire) | Verdict |
|---|---|---|---|
| Auditeurs mensuels | 190 | 190 (page publique et Spotify for Artists, 28 jours) | exact |
| Abonnés | 58 | 58 (Spotify for Artists) | exact |
| Écoutes « cash only » | 2 249 | 2 249 (page publique) | exact |
| Écoutes « backwoods », « neva die » | **0** | « < 1 000 » (page publique) ; « neva die » = 78 dans Spotify for Artists | **piège** : 0 veut dire « moins de 1 000 », jamais l'afficher comme 0 |
| Dates de sortie | 04/09, 16/10, 23/10/2026 | — | utilisable (rythme de sortie) |
| Villes principales | Abidjan 14, Paris 13, Montréal 3, Lille 3, Bruxelles 3 | — | bonus |

Non disponible par ce moyen : streams des 7 ou 28 derniers jours, auditeurs actifs, sources d'écoute, âge et genre (seulement dans Spotify for Artists).

## Règles pour le branchement (Comptes)
- `streamCount = 0` → afficher « moins de 1 000 écoutes », jamais « 0 ».
- Relevé de l'artiste (1 lien) chaque semaine ; relevé des sorties (1 lien par sortie) une fois par mois ou à chaque nouvelle sortie, pour limiter le coût (≈ 0,004 $ par lien).
- Si le robot échoue ou renvoie un format inattendu : ne rien écraser, afficher « chiffres pas mis à jour cette semaine ».
- Le robot peut cesser de marcher sans prévenir (dépend des pages publiques de Spotify) : alerte au propriétaire si 2 relevés de suite échouent.
