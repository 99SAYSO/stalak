Statut : PRÊT
Branche : compte/videos-par-personne
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` 176020f (demande du propriétaire du 5/11 : savoir combien de vidéos fait chaque personne, pour décider plus tard
d'une limite « 1 vidéo propre par jour » en gratuit)
Maquette : https://compte-videos-par-personne.stalak-site.pages.dev/admin-demo/#funnel (démo, fausses données)

Résumé :
- La page joint aux évènements `export_ok` (vidéo exportée) et `ad_ok` (vidéo propre via la pub) le **numéro de visite au hasard**
  qu'elle crée déjà (`vid`). Rien d'autre : ni compte, ni e-mail, ni adresse IP. Le serveur garde par jour et par numéro : le
  nombre de vidéos et « iPhone oui/non » (table `video_counts`), **90 jours au plus**, comme les visites.
- Tableau de bord → **Du visiteur à l'abonné** → carte « 🎬 Combien de vidéos par personne » (7 j / 30 j) :
  - la part des gens qui ont fait 1 vidéo, 2 vidéos, 3 ou plus dans la journée (une barre par groupe) ;
  - les mêmes chiffres pour les vidéos propres via la pub ;
  - la part d'iPhone ;
  - une phrase automatique : « La plupart des gens font 1 vidéo par jour (60 %) ; 40 % en font 2 ou plus. » ou « 35 % des gens
    font 2 vidéos ou plus par jour. », avec « Encore peu de monde : à revoir plus tard » sous 30 personnes ;
  - un « ? » qui explique.
- **Limite à connaître** : une « personne » = une page ouverte. Si elle recharge la page dans la journée, elle compte pour deux
  (donc la part de « 2 vidéos ou plus » est plutôt sous-estimée).
- **Ton compte et ceux des agents de test ne sont pas comptés** : ton adresse (`ADMIN_EMAILS`) l'est d'office ; pour les agents de
  test, mettre leurs adresses dans la variable `STATS_EXCLUDE_EMAILS` (Cloudflare, séparées par des virgules, pas secrète). Ça ne
  marche que si on est connecté au compte au moment de l'export.
- Les chiffres ne commencent qu'à la mise en ligne.

Skills utilisés : `dataviz` (barres d'une seule couleur avec % et nombre, phrase de conclusion en premier), `appsec-review`
(`docs/appsec-review-videos-par-personne.md`).

Fichiers touchés :
- nouveaux : `migrations/0015_video_counts.sql`, `docs/appsec-review-videos-par-personne.md`
- modifiés : `functions/_lib/metrics.js`, `functions/_lib/router.js`, `functions/_lib/admin.js`, `functions/_lib/admin-page.js`,
  `functions/_lib/admin-demo-data.js` (régénéré), `tools/admin_demo_data.mjs`, `src/app.js`, `src/account.js`,
  `tests/fixtures/dashboard-seed.mjs`, `tests/backend/run.mjs`, `tests/ui/support_ui.py`, `BACKEND.md` (13, 13.6 quinquies),
  `docs/STATUS.md`, `public/` reconstruit

Migration SQL (à coller dans la console D1 « stalak » **avant** de publier). Numéro 0015 car 0014 est pris par `compte/provenance-ue`
(pas encore intégrée) ; les deux sont indépendantes.
```sql
CREATE TABLE IF NOT EXISTS video_counts (
  day  TEXT NOT NULL,
  vid  TEXT NOT NULL,
  name TEXT NOT NULL,
  n    INTEGER NOT NULL DEFAULT 0,
  ios  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, vid, name)
);
```

Tests :
- `node tests/backend/run.mjs` : 96/96 (nouveaux : vid joint seulement à export_ok / ad_ok et au bon format ; rien sur la personne ;
  propriétaire et agent de test exclus, un fan compté ; effacement après 90 jours ; parts 1 / 2 / 3+, pub, iPhone, sur 7 et 30 jours ;
  les deux phrases ; route réservée au propriétaire ; la démo a la carte).
- `tests/ui/support_ui.py` : 62/62 (carte, phrase, 3 barres, bascule 30 j, part d'iPhone, aucun défilement horizontal).
- Vérifié dans le navigateur que la page envoie bien le `vid` avec `export_ok` (et pas avec les autres évènements).

**Pour Juridique (ça change ce qu'on collecte)** : par jour et par numéro de visite au hasard (sans compte, sans e-mail, sans IP),
on garde le nombre de vidéos exportées et de vidéos propres via la pub, et si c'est un iPhone ; 90 jours au plus. Ce numéro est le
même que celui des visites du jour (qui garde déjà pays, appareil et provenance de la visite). Pour exclure le propriétaire et les
comptes de test, la session est lue au moment de l'export, sans rien en garder.

Reste au propriétaire : (facultatif) mettre les adresses des agents de test dans `STATS_EXCLUDE_EMAILS`.
Reste au Chef de projet : la migration 0015 avant de publier.
