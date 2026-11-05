Statut : PRÊT
Branche : compte/heures
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` be731f3 (demande du propriétaire du 5/11 : vue « Heure par heure »)
Maquette : https://compte-heures.stalak-site.pages.dev/admin-demo/#hours (démo, fausses données)

Résumé :
- Nouvelle page du tableau de bord, menu ☰ → **Heure par heure** : une ligne par heure (0 h–1 h … 23 h–0 h) avec les **visites**
  (une barre, pour voir d'un coup d'œil), les **comptes créés**, les **exports de vidéos** et les **nouveaux abonnements**.
- L'heure qui a le plus de visites est mise en avant : « 🔥 Le plus de monde : 20 h–21 h (heure de New York) » et sa ligne en orange.
- Période : **Aujourd'hui** (depuis minuit dans la ville choisie ; l'heure en cours est marquée « maintenant », les suivantes « plus
  tard ») / **7 j** / **30 j** (la moyenne d'une journée, pour voir l'habitude).
- Bouton **🇫🇷 Paris / 🇺🇸 New York** (heure d'été et d'hiver prises en compte ; le choix est retenu sur l'appareil).
- Un « ? » explique la page en une phrase ; le bandeau « TEST » s'affiche si les abonnements sont de test.
- **Ce qu'on enregistre en plus** : l'heure de chaque export (avant : seulement un total par jour). Visites, comptes et abonnements
  avaient déjà leur heure, donc leurs chiffres remontent dans le passé (90 jours pour les visites). Les **exports par heure ne
  s'afficheront qu'à partir de la mise en ligne** (la page le dit). Compteur anonyme, effacé après 90 jours.

Skills utilisés : `dataviz` (une seule couleur pour les barres, l'heure la plus forte en orange + 🔥 + le mot, chiffres alignés),
`ui-ux-pro-max` (une ligne lisible au téléphone : heure, barre, visites, puis les 3 autres chiffres en dessous), `appsec-review`
(`docs/appsec-review-heures.md`).

Fichiers touchés :
- nouveaux : `migrations/0013_hourly_counts.sql`, `docs/appsec-review-heures.md`
- modifiés : `functions/_lib/admin.js` (`hourly`, route `hours`), `functions/_lib/metrics.js` (`bumpHour`, nettoyage 90 jours),
  `functions/_lib/admin-page.js` (page, menu, démo), `functions/_lib/admin-demo-data.js` (régénéré), `tools/admin_demo_data.mjs`,
  `tests/fixtures/dashboard-seed.mjs` (fausses données avec des heures réalistes : soirées US et France), `tests/backend/run.mjs`,
  `tests/ui/support_ui.py`, `BACKEND.md` (13, 13.6 quater), `docs/STATUS.md`

Migration SQL (à coller dans la console D1 « stalak » **avant** de publier) :
```sql
CREATE TABLE IF NOT EXISTS hourly_counts (
  hour INTEGER NOT NULL,
  name TEXT NOT NULL,
  n    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (hour, name)
);
```

Tests :
- `node tests/backend/run.mjs` : 94/94 (nouveau : placement des heures à Paris et à New York, y compris le passage à l'heure d'hiver
  de New York le 1er novembre et l'heure d'été de juillet ; « aujourd'hui » = depuis minuit dans la ville ; moyenne sur 7 jours ;
  heure la plus forte ; abonnements de test non comptés en production ; un export compté dans son heure ; route réservée au
  propriétaire ; la démo contient les heures).
- `tests/ui/support_ui.py` : 60/60 (24 lignes avec de vraies barres, 🔥, 7 j = moyenne, bascule New York, « ? », menu à 9 pages,
  pas de défilement horizontal au téléphone).

Pour Juridique : rien de personnel en plus (un compteur anonyme d'exports par heure). Si la confidentialité parle des « compteurs
par jour », écrire « par jour et par heure ».

Reste au propriétaire : regarder la maquette (téléphone et ordinateur), puis donner son « ok ».
Reste au Chef de projet : la migration 0013 avant de publier.
