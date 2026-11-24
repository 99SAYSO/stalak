# Contrat Comptes ↔ App : « Stats » et analyse de l'artiste (24/11)
Branche Comptes : `compte/stats-analyse`. Branche App : `app/stats-analyse`. Les noms ci-dessous sont ceux du serveur ; App les reprend tels quels.

## 1. Profil — `GET /api/artist`, `PUT /api/artist` (JSON ; on n'envoie que les champs qui changent)
Champs déjà là : `artistName`, `genres` (`rap` | `drill` | `chant` | `autre`), `onPlatforms` (true / false / null), `listenersNow`, `postsOn`, `blockers`, `listenersGoal`, `goals`.
Nouveaux :
- `genreOther` : texte libre court (60 caractères), à envoyer quand « Autre » est choisi (« Dis-nous ce que tu fais »). `''` l'efface.
- `links.tiktok` : `https://www.tiktok.com/@nom`, un lien tiktok.com / vm.tiktok.com, ou `@nom` (le `@` est obligatoire).
- `links.youtube` : un lien youtube.com / youtu.be / music.youtube.com, ou `@nom`.
- Comme avant : `links.spotify`, `links.appleMusic`, `links.soundcloud`, `links.instagram`.
- Un lien d'un autre site → **400** `{ error: 'bad_link', field: '<nom>' }` : rien n'est changé, afficher l'erreur sous le champ `field`.
- **Spotify** : pour l'analyse, il faut le lien du **profil d'artiste** (`open.spotify.com/artist/…`). Un lien de son ou un lien court est accepté dans le profil, mais `GET /api/stats` répond alors `spotify.state = 'not_artist_link'`.
- Dès qu'un nouveau lien d'artiste Spotify est enregistré, le serveur lit tout de suite ses sorties et ses chiffres, en arrière-plan (environ 5 à 15 s). C'est le moment de l'écran de chargement d'environ 9 s ; ensuite, appeler `GET /api/stats`. Si `spotify.state` vaut encore `pending`, redemander 2 ou 3 fois toutes les 3 s.

## 2. `GET /api/stats?lang=fr|en` (connecté ; sinon 401)
```js
{
  plan: 'free' | 'pro' | 'creator',
  pro: { … } | null,        // null pour un compte gratuit : la partie Pro n'est jamais envoyée → aperçu flouté inventé côté App
  locked: true | false,      // true = afficher la partie Pro floutée avec le cadenas
  ready: true | false,       // questionnaire rempli ET liens obligatoires présents
  missing: ['tiktok', 'spotify'],   // liens obligatoires manquants (TikTok pour tous ; Spotify si onPlatforms === true)
  tiktokLinked: true | false,       // compte TikTok relié : chiffres TikTok via la route des stats TikTok déjà existante
  spotify: {
    state: 'ok' | 'pending' | 'stale' | 'failed' | 'off' | 'no_link' | 'not_artist_link',
    updatedAt: ISO | null, week: '2026-W48' | null,
    releasesState: 'ok' | 'pending' | 'failed' | 'off' | null
  },
  summary: {
    sentences: ['…', '…', '…'],     // le bilan gratuit : 3 phrases au plus, déjà écrites dans la langue demandée
    facts: {
      listeners: { n, source: 'spotify' | 'artist', week } | null,   // 'artist' = le chiffre tapé par l'artiste
      listenersChange4w: number | null, followers: number | null,
      lastRelease: { name, date, daysAgo, kind } | null,
      releasesPerMonth6: number | null, releaseCount: number,
      topSong: { id, name, releaseId, streams: number | null, under1000: bool } | null,
      topCity: { city, country, listeners } | null, songsMonth: '2026-11' | null
    }
  }
}
```
Partie `pro` (Pro et Creator Plus seulement) :
```js
{
  weeks: [{ week, listeners, followers }],          // relevé Spotify, semaine par semaine (52 au plus)
  given: [{ week, listeners }],                     // chiffres tapés par l'artiste
  songs: [{ id, name, releaseId, streams, under1000, previous }],   // du plus écouté au moins écouté (relevé du mois)
  releases: [{ id, name, kind, date, tracks }],     // les plus récentes d'abord
  byMonth: [{ month: '2026-11', releases, songs }], // 12 mois, pour « nombre de sons par mois »
  rhythm: { daysSinceLast, lastGapDays, avgGapDays },
  cities: [{ city, country, listeners }]
}
```
`previous` vaut l'écoute du mois d'avant, `null` si elle était sous 1 000, absent si le son n'était pas encore relevé.

## 3. Règles d'affichage (obligatoires)
- **`under1000: true` → écrire « moins de 1 000 écoutes »**, jamais « 0 ». Le serveur n'envoie jamais `streams: 0`.
- `spotify.state` :
  - `stale` : afficher les derniers chiffres **avec** « Chiffres pas mis à jour cette semaine » et la date `updatedAt` ;
  - `failed` : aucun chiffre ; proposer de saisir ses auditeurs (`PUT /api/artist/listeners`, déjà existant) ;
  - `off` : l'accès Spotify n'est pas encore branché ; même chose que `failed`, sans parler de panne ;
  - `pending` : « On lit tes sorties Spotify… » ;
  - `not_artist_link` : « Colle le lien de ton profil d'artiste (open.spotify.com/artist/…) ».
- **Aucun chiffre estimé présenté comme vrai.** Pour l'aperçu flouté d'un compte gratuit, ne pas mettre ses vrais chiffres (le serveur ne les envoie pas). Utiliser une forme générique, illisible sous le flou.
- `listeners.source === 'artist'` : dire que c'est le chiffre qu'il a donné.
- Le conseil de rythme et le plan de la semaine se calculent dans App à partir de `rhythm` et `byMonth`. Toute phrase de conseil doit se présenter comme un conseil, pas comme une mesure.
