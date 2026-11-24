# Compte rendu — compte/stats-analyse
**Statut : PRÊT.** **Migration 0023** (`migrations/0023_artist_stats.sql`) à lancer avant la mise en ligne.
Demandes : `docs/handoff/chef-stats-analyse.md`, `docs/audit/test-apify-spotify-2026-11-24.md`.
**Contrat pour App (noms des champs, réponses, règles d'affichage) : `docs/contrats/stats-analyse.md`.** App n'avait pas encore de branche et aucune autre conversation n'était joignable : le contrat reprend les noms déjà utilisés par le profil (`links.*`, camelCase). À transmettre à App.

## Ce qui est fait
1. **Profil** (`functions/_lib/artist.js`) :
   - `genreOther` : texte court, nettoyé comme le nom d'artiste ;
   - `links.tiktok` et `links.youtube` : liens de leur propre site seulement, ou `@nom` ;
   - un autre site → 400 `bad_link`, comme pour les autres liens.
2. **Sorties Spotify, API officielle** (`functions/_lib/spotify.js`) :
   - `GET /v1/artists/{id}/albums?include_groups=album,single&market=FR&limit=10`, 5 pages au plus ;
   - jeton d'application « client credentials », gardé environ 50 min ;
   - en sortent le nombre de sons par mois (12 mois) et le dernier son.
3. **Relevé Apify** (`beatanalytics~spotify-play-count-scraper`, secret `APIFY_TOKEN`) :
   - **l'artiste chaque semaine** : 1 lien, jusqu'à 10 artistes par lancement. On garde les auditeurs mensuels, les abonnés et les 5 premières villes ;
   - **les sons une fois par mois**, ou tout de suite à une nouvelle sortie : 1 lien par sortie, 20 sorties au plus ;
   - **`streamCount = 0` est gardé comme 0, mais toujours envoyé comme `under1000: true`**. Le bilan dit « moins de 1 000 écoutes » ;
   - **relevé raté ou réponse bizarre : rien n'est écrasé**. L'écran dit « pas pu être mis à jour cette semaine » (état `stale` avec la date du dernier relevé, ou `failed` sans aucun chiffre) ;
   - **2 relevés ratés de suite → une alerte** au propriétaire (Telegram / ntfy), une fois par jour au plus ;
   - un artiste raté est réessayé le lendemain, pas à chaque tâche ;
   - limite de coût par lancement (`maxTotalChargeUsd`, 0,01 $ par lien) et attente de 25 s au plus.
4. **Nouveau lien d'artiste Spotify** dans le profil :
   - les chiffres de l'ancien artiste sont effacés ;
   - les sorties et les chiffres du nouveau sont lus tout de suite, en arrière-plan, pour l'écran de chargement ;
   - 5 fois par jour et par compte au plus.
5. **`GET /api/stats`** (`functions/_lib/stats.js`) :
   - **bilan gratuit en 3 phrases** (fr / en), écrites seulement à partir de vraies données ; ce qui manque est dit comme manquant ;
   - liens obligatoires manquants (`missing`) ;
   - **la partie Pro n'est envoyée qu'aux Pro / Creator Plus** (`pro: null`, `locked: true` sinon).
6. **Tâches du jour** : le relevé passe par `maybeCleanup`, la route cron et le Worker de nuit.
7. **Suppression du compte** : les 4 nouvelles tables partent avec lui.

## Secrets (tapés par le propriétaire, jamais dans le code)
- `APIFY_TOKEN` : déjà dans Cloudflare (Production). Pour que le Worker de nuit relève aussi, à ajouter sur le Worker : `npx wrangler secret put APIFY_TOKEN -c workers/cloud-cleanup/wrangler.toml`.
- **`SPOTIFY_CLIENT_ID` et `SPOTIFY_CLIENT_SECRET`** : sur developer.spotify.com (Premium exigé), créer une app, puis copier son « Client ID » et son « Client secret » dans Cloudflare → Variables et secrets. **Sans eux, pas de sorties** (`releasesState: 'off'`), donc pas de relevé des sons : les auditeurs et les abonnés marchent quand même.
- `SPOTIFY_MARKET = "FR"` dans `wrangler.toml` : pays utilisé pour lister les sorties. Ce n'est pas un secret.

## Coût Apify (≈ 0,004 $ par lien)
Par artiste, environ 4 artistes × 0,004 $ par mois, plus ses sorties une fois par mois (20 au plus × 0,004 $). Cela fait **au plus environ 0,10 $ par mois et par artiste**, plus 0,004 $ par nouvelle sortie. Le relevé est fait pour **tout compte qui a donné un lien d'artiste Spotify**. Si le coût monte, on peut le limiter aux Pro, ou aux comptes actifs du mois : c'est au propriétaire de décider.

## Tests
- `node tests/backend/run.mjs` : **136/136**, dont 4 nouveaux :
  - profil : `genreOther`, liens TikTok / YouTube et refus d'un autre site ;
  - `/api/stats` : non connecté, ce qui manque, lien de son au lieu du profil, robot éteint, chiffre tapé par l'artiste ;
  - réponses du test du Chef (190 auditeurs, 58 abonnés, 2 249 écoutes, 0 → « moins de 1 000 ») :
    - jeton client, pages de 10 et marché ;
    - artiste seul, puis 3 sorties ;
    - pas de second relevé la même semaine ;
    - nouvelle partie Pro, et rien de Pro pour un compte gratuit ;
    - changement de lien, suppression du compte ;
  - échecs :
    - le dernier vrai chiffre reste, état `stale` ;
    - pas de nouvel essai avant 20 h ;
    - alerte au 2e échec, une fois par jour ;
    - 1er relevé raté → `failed`, aucun chiffre.

## Juridique (à relire)
- Chiffres **publics** du profil Spotify de l'artiste, lus par un robot tiers (Apify, aux États-Unis) **sur demande de l'artiste** (il colle son lien), gardés avec son compte et effacés avec lui.
- Liens TikTok / YouTube et champ libre « ce que tu fais » : gardés dans le profil, servent à l'analyse.
- La page de confidentialité doit citer Apify et l'API Spotify.

## Ce qui reste
- App : écrans (contrat ci-dessus) ; maquette au propriétaire avant fusion.
- Les courbes TikTok semaine par semaine viennent de la liaison TikTok (route existante). **YouTube : seulement le lien pour l'instant**, aucune donnée lue.
- Le plan de la semaine et le conseil de rythme sont à écrire côté App (ou Marketing), à partir de `rhythm` et `byMonth`.
