Statut : PRÊT
Branche : legal/tiktok

Résumé :
Demande du Chef de projet (21/11, 0 h 17) : ajouter TikTok à la confidentialité et aux conditions avant la validation de l'appli
par TikTok. Infos pour décider, pas un avis juridique.
- Confidentialité FR/EN, nouvelle section « TikTok (facultatif) » (#tiktok) :
  - ce qu'on reçoit : nom affiché, lien de la photo, stats (abonnés, likes, nb de vidéos), vidéos publiques avec vues et likes, jetons ;
  - à quoi ça sert : publier les clips choisis, seulement sur « Publier » ; stats visibles par la personne seule, jamais pour la pub ni croisées ;
  - durées :
    - jetons chiffrés AES-GCM (24 h / 365 j chez TikTok) ;
    - nom et photo tant que relié ;
    - stats et liste 24 h au plus ;
    - vidéo pas gardée ;
    - état de publication 30 j ;
  - délier : Compte → TikTok → « Délier » = révocation + effacement immédiat ; même chose à la suppression du compte ; depuis l'appli TikTok : effacement sous 30 jours ; ou par e-mail ;
  - rien n'est vendu, loué ni partagé ; lien vers la politique de TikTok ; pas d'affiliation avec TikTok ;
  - ailleurs dans la page : « En bref », cookie stalak_c (4 cookies), TikTok dans les prestataires, section US (catégories, sources, destinataires).
- Conditions FR/EN, section 9, paragraphe « Publier sur TikTok » (#tiktok) :
  - publication seulement sur action de la personne, avec ses réglages ;
  - conditions, règles de la communauté et Confirmation d'utilisation de la musique de TikTok ;
  - pas de garantie de publication ; « Délier » ; pas d'affiliation.
- docs/juridique/TIKTOK.md (nouveau) :
  - partie 1 : tableau « promesse de la page / état du code / à faire » ;
  - partie 2 : les règles de TikTok pour l'écran de publication ;
  - partie 3 : le problème du filigrane.

ATTENTION, à décider avant la demande de validation :
Les règles de TikTok (Content Sharing Guidelines) interdisent à une appli d'ajouter son logo ou son filigrane aux vidéos publiées
par son outil (« should not superimpose … any brand name, logo, watermark »). Or la publication directe est ouverte aux gratuits,
dont les vidéos ont le filigrane mascotte + stalak.app. Choix :
(1) publier sans filigrane via « Publier sur TikTok », même en Gratuit (les conditions, section 4, devront le dire) ;
(2) réserver la publication directe à Pro et Creator Plus.
Garder le filigrane = risque sérieux de refus.

Fichiers touchés :
- site_src/privacy.html, site_src/fr/confidentialite.html, site_src/terms.html, site_src/fr/conditions.html
- public/ (reconstruit : build_site.py --domain stalak.app --email contact@stalak.app)
- docs/juridique/TIKTOK.md (nouveau), docs/STATUS.md (section Juridique), docs/handoff/legal-tiktok.md

Migration SQL : aucune

Tests :
- 8 pages légales à 390 px et 1280 px, FR et EN : pas de défilement horizontal, aucune erreur, aucun {{…}} restant ;
- node tests/backend/run.mjs : 107/107 ; build.py passe.

Mise en ligne : peut partir dès maintenant (TikTok lira les pages pendant la validation). Avant de soumettre l'appli, le code de
Réseaux sociaux doit tenir les promesses du tableau (TIKTOK.md, partie 1), surtout le cache de 24 h, la purge à 30 jours et la
suppression des liens expirés.

Reste au propriétaire :
- Trancher la question du filigrane avec le Chef de projet (partie 3 de TIKTOK.md).
