Statut : PRÊT
Branche : compte/sans-pub
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` d3d7564 (décision du propriétaire du 6/11, 14 h : plus de pub du tout ; STATUS)
Maquette : https://compte-sans-pub.stalak-site.pages.dev/admin-demo/#funnel (démo, fausses données)

Résumé :
- Tableau de bord → **Du visiteur à l'abonné** :
  - retirée la carte « Pubs » (Demandées / Affichées / Regardées) ; il reste « Vidéos exportées » et « Ce qui ouvre la page des
    formules », côte à côte ;
  - retiré le petit graphique jour par jour « Pubs regardées » (restent « Vidéos exportées » et « Exports ratés »).
  - Les étapes de l'entonnoir lui-même (Visites → Vidéos exportées → Offre Pro vue → Page des formules → Fenêtre de paiement →
    Abonnés) n'avaient déjà plus d'étape pub : inchangées.
- Carte **« Combien de vidéos par personne »** : retirée la partie « Vidéos propres via la pub » ; restent la phrase, les 3 barres
  des vidéos exportées et la part d'iPhone.
- Provenance : l'étiquette « (pub/utm) » devient « (lien utm) » (c'est un lien de campagne, pas la pub vidéo).
- **Serveur inchangé** : il accepte toujours les anciens évènements pub (`ad_offer`, `ad_shown`, `ad_ok`) et les compte, sans les
  afficher. Rien à supprimer dans la base.

Skills utilisés : aucun nouveau (petit retrait d'affichage) ; `dataviz` pour garder la mise en page lisible à 2 cartes.

Fichiers touchés : `functions/_lib/admin-page.js`, `tests/ui/support_ui.py`, `BACKEND.md` (13.6 quinquies), `docs/STATUS.md`.
Migration SQL : aucune.

Tests :
- `node tests/backend/run.mjs` : 96/96 (inchangés : le serveur accepte toujours les évènements pub).
- `tests/ui/support_ui.py` : 63/63 (nouveau : plus aucun mot « pub » ni carte / graphique pub sur la page, 2 graphiques).

Pour Juridique : rien (affichage du tableau de bord seulement).
Reste au propriétaire : regarder la maquette, puis donner son « ok ».
