Statut : PRÊT
Branche : legal/video-par-email

Résumé :
Rapport chiffres du 7/11 : piste 1 (provenance et pays de chaque visite, en totaux anonymes) et piste « Reçois ta vidéo
par e-mail » (recontacter les gratuits). Infos pour décider, pas un avis juridique.
- docs/juridique/EMAIL_VIDEO.md (nouveau) : règles pour Comptes et App.
  - Totaux anonymes sans vid, compte ni IP ; stalak:lastDay effacé à 13 mois.
  - Envoi de la vidéo (base : la demande ; supprimée au bout de 7 jours).
  - Nouvelles de Stalak = case non cochée avec texte exact, confirmation par e-mail, preuve gardée, désinscription en un clic sans connexion + List-Unsubscribe, adresse postale (CAN-SPAM), empreinte après désinscription, suppression après 3 ans sans ouverture ni clic, moins de 15 ans : accord d'un parent ; anti-abus.
- Confidentialité FR/EN :
  - nouvelle section « Recevoir ta vidéo par e-mail » / « Get your video by email » ;
  - totaux par jour × provenance × pays × appareil dans « Statistiques de visite » ; durée de stalak:lastDay ;
  - « En bref », prestataires (R2, Resend) et section US (« Why ») mis à jour.

Fichiers touchés :
- site_src/privacy.html, site_src/fr/confidentialite.html
- public/ (reconstruit : build_site.py --domain stalak.app --email contact@stalak.app)
- docs/juridique/EMAIL_VIDEO.md (nouveau), docs/STATUS.md (section Juridique), docs/handoff/legal-video-par-email.md

Migration SQL : aucune ici (tables d'envoi, de nouvelles et de totaux : à faire par Comptes)

Tests :
- 8 pages légales à 390 px et 1280 px, FR et EN : pas de défilement horizontal, aucune erreur, aucun {{…}} restant ;
- node tests/backend/run.mjs : 101/101 ; build.py passe.

Mise en ligne : EN MÊME TEMPS QUE Comptes (et App pour l'écran de fin), pas avant. La page décrit la case, la confirmation,
les 7 jours et le désabonnement. Si Comptes choisit d'autres durées ou un autre fonctionnement (pièce jointe au lieu d'un
lien, par exemple), prévenir Juridique : la page sera corrigée sur cette branche.

Reste au propriétaire :
- Choisir l'adresse postale qui apparaîtra en bas des e-mails de nouvelles (domiciliation conseillée).
