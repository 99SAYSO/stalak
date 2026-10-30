Statut : PRÊT
Branche : legal/nouvelle-offre

Résumé :
Pages légales mises à jour pour la nouvelle offre du 30/10 (Gratuit 1 vidéo par jour + Basic / Pro / Max), en FR et en EN.
Infos pour décider, pas un avis juridique.
- Conditions (12 sections au lieu de 9) :
  - compte obligatoire, un seul compte gratuit par personne ;
  - les 4 formules avec prix et contenu ;
  - « tu gardes ton prix » : tant que l'abonnement continue, même formule et même période ;
  - changement de formule : montée immédiate au prorata, descente au prochain renouvellement ;
  - perte de la sauvegarde en passant à Basic ; Max → Pro au-delà de 20 Go ;
  - section « E-mails » (rappel quotidien seulement si accepté) ;
  - médiateur mentionné en EN aussi.
- Remboursement : couvre Basic, Pro et Max et le paiement d'un changement de formule ; ce qui se passe après un remboursement ; descente en gamme et arrêt sans remboursement passé 14 jours.
- Confidentialité :
  - compte pour tous ;
  - compteur de la vidéo du jour ;
  - rappel quotidien (consentement, preuve, désabonnement sans connexion) ;
  - Resend envoie aussi le rappel ;
  - « Parler à un humain » passe en Max, paroles auto et sauvegarde en Pro et Max (100 Go en Max).
- Règles à suivre par Comptes (heure de remise à zéro, prorata, changement programmé, prix gardé, e-mail de rappel) : listées dans docs/STATUS.md, section Juridique & business.

Fichiers touchés :
- site_src/conditions.html, site_src/remboursement.html, site_src/confidentialite.html
- site_src/en/terms.html, site_src/en/refunds.html, site_src/en/privacy.html
- public/ (les 6 mêmes pages, reconstruites avec build_site.py --domain stalak.app --email contact@stalak.app)
- docs/STATUS.md (section Juridique & business uniquement)
- docs/handoff/legal-nouvelle-offre.md

Migration SQL : aucune

Tests :
- node tests/backend/run.mjs : 63/63
- build.py passe
- 6 pages vérifiées à 390 px et 1280 px : pas de défilement horizontal, aucune erreur, aucun {{…}} restant.

À fusionner en même temps que (ou après) la branche Comptes de la nouvelle offre : les pages décrivent les formules Basic / Pro / Max.
La page Tarifs (Marketing) affiche encore l'ancienne offre.

Reste au propriétaire :
- Valider les règles choisies pour les changements de formule (montée immédiate au prorata, descente au renouvellement) et l'heure de remise à zéro (minuit, heure de Paris).
- Décider pour les moins de 15 ans (rappel quotidien).
