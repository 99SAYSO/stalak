Statut : PRÊT
Branche : legal/sans-pub

Résumé :
Décision du propriétaire du 6/11, 14 h (plus de pub du tout) appliquée aux pages légales FR/EN. Infos pour décider, pas un avis juridique.
- Conditions FR/EN :
  - Gratuit = filigrane toujours présent ; sans filigrane = Pro ou Creator Plus seulement ;
  - section 4 réduite à « Filigrane / Watermark » : visage de la mascotte + « stalak.app », pas de contournement, les vidéos déjà exportées gardent leur filigrane ;
  - retirés : pub de 30 s, « pub indisponible », fraude à la pub, « ni pub » dans Pro.
- Confidentialité et cookies FR/EN :
  - retirés : Google Ad Manager, partenaires pub, fenêtre de consentement, choix gardé 6 mois, règle des moins de 15 ans pour les cookies pub, liens Google sur la pub, « Do Not Sell or Share » à exercer ;
  - #cookies : seulement les cookies et le stockage nécessaires, d'où l'absence de bandeau ;
  - #choices (EN) : « we don't sell or share », GPC respecté. Les ancres restent pour les liens du pied de page ;
  - « Your US privacy rights » : catégories, usages et destinataires sans la pub ;
  - ajoutés, parce que déjà en ligne mais seulement dans legal/provenance (en attente) :
    - e-mail de remerciement (#thanks / #merci) ;
    - Telegram dans les prestataires ;
    - compteurs « vidéos par visite » (migration 0015 : nombre au hasard de la visite + iPhone/iPad, 90 jours).
- Mentions légales FR/EN : description du nouveau filigrane.
- docs/juridique/PADDLE.md (réponse « No ads » pour Paddle) et docs/juridique/ETATS_UNIS.md (note : les parties pub sont sans objet).

Fichiers touchés :
- site_src/terms.html, privacy.html, legal-notice.html
- site_src/fr/conditions.html, fr/confidentialite.html, fr/mentions-legales.html
- public/ (reconstruit : build_site.py --domain stalak.app --email contact@stalak.app)
- docs/juridique/PADDLE.md, docs/juridique/ETATS_UNIS.md, docs/STATUS.md (section Juridique), docs/handoff/legal-sans-pub.md

Migration SQL : aucune

Tests :
- node tests/backend/run.mjs : 96/96 ; build.py passe ;
- 8 pages légales à 390 px et 1280 px : pas de défilement horizontal, aucune erreur, aucun {{…}} restant ;
- plus aucune mention de pub dans les pages légales, sauf pour dire qu'il n'y en a pas.

Mise en ligne : EN MÊME TEMPS QUE App (app/filigrane-mascotte : nouveau filigrane + retrait de la pub et du consentement).
Publiée seule, la page dirait « pas de pub » alors que le bouton pub serait encore dans l'app.
Pied de page commun (src/footer.py, App) : « Gérer les cookies / Cookie settings » à retirer ou renommer (voir STATUS).
legal/provenance (en attente) : à refaire sur cette base, ne pas la fusionner telle quelle.

Reste au propriétaire : rien.
