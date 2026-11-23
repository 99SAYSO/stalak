Statut : PRÊT
Branche : legal/video-offerte

Résumé :
Décision du propriétaire du 23/11 (5 h 25) écrite dans les pages légales FR/EN : chaque compte a droit à une seule vidéo exportée sans filigrane, offerte, sans paiement ni carte, une fois. Infos pour décider, pas un avis juridique.
- Conditions (`/terms#free-video`, `/fr/conditions#video-offerte`) :
  - nouveau paragraphe dans la section 4 : une vidéo, une fois, sans paiement, carte ni abonnement ; il faut être connecté ; utilisée au premier export sans filigrane ; une par personne (plusieurs comptes ou compte recréé = pas de vidéo en plus) ; offre modifiable ou supprimable pour les nouveaux comptes ;
  - formule Gratuit, section 2 (« un compte est nécessaire pour t'abonner ou pour la vidéo offerte ») et motifs de suspension mis à jour.
- Confidentialité (`/privacy#free-video`, `/fr/confidentialite#video-offerte`) :
  - le serveur retient seulement si la vidéo a été utilisée ;
  - empreinte brouillée (hash) de l'e-mail gardée même après suppression du compte, effacée 12 mois après la suppression (chiffre proposé, à confirmer) ;
  - base : intérêt légitime (éviter l'abus d'une offre gratuite).
- Dates « dernière mise à jour » : 23/11/2026.

Point de droit à surveiller :
- Une empreinte d'e-mail n'est pas « anonyme » au sens du RGPD : c'est une donnée pseudonymisée, donc encore personnelle. Les pages disent « forme brouillée (empreinte) », pas « anonyme ». Elle est licite sous intérêt légitime si elle sert seulement à ça, et si sa durée est limitée et annoncée. D'où le chiffre de 12 mois après la suppression du compte (la durée de 3 ans du mail de remerciement serait aussi défendable ; à confirmer).
- Pour que ce soit vrai : clé secrète (HMAC), e-mail normalisé, effacement à 12 mois, rien d'autre gardé. Si Comptes ne peut pas, il faut me le dire pour changer les pages (pas l'inverse).
- Pas un « essai gratuit » : rien ne démarre et rien ne se renouvelle, donc pas de règles de renouvellement automatique pour cette vidéo.
- Cadeau annoncé : Marketing ne doit pas écrire « vidéo gratuite sans filigrane pour tout le monde » ni « sans inscription » (il faut un compte) ; le mot juste est « 1re vidéo sans filigrane offerte avec ton compte ».

Fichiers touchés :
- site_src/terms.html, site_src/privacy.html, site_src/fr/conditions.html, site_src/fr/confidentialite.html
- public/ : les 4 pages + sitemap.xml (build_site.py --domain stalak.app --email contact@stalak.app)
- docs/STATUS.md (section Juridique & business uniquement)
- docs/handoff/legal-video-offerte.md

Migration SQL : aucune (c'est à Comptes de prévoir où l'on retient « utilisée » et l'empreinte)

Tests :
- 115/115 tests serveur ; build_site.py et build.py ok.
- 8 pages légales vérifiées à 390 px et 1280 px : pas de défilement horizontal, aucune erreur, aucun {{…}} restant.
- Aucun fichier de l'app ni du serveur touché.

Reste au propriétaire : rien. Comptes et App doivent faire ce qui est annoncé avant la mise en ligne des pages.
