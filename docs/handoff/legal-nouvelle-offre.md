Statut : PRÊT
Branche : legal/nouvelle-offre

Résumé :
Pages légales FR/EN adaptées à l'offre du 30/10 au soir : Gratuit (filigrane + pub récompensée Google Ad Manager),
Pro (7,99 $ / 49,99 $), Creator Plus (14,99 $ / 99,99 $). `main` a été fusionnée dans la branche, sans conflit.
Tout ce qui parlait de la vidéo du jour, de l'e-mail de rappel et de Basic / Max est retiré.
Infos pour décider, pas un avis juridique.
- Conditions :
  - Gratuit sans compte ;
  - formules et prix en dollars (Paddle convertit et ajoute les taxes ; variation possible avec le taux de change) ;
  - section 4 « Filigrane et publicité récompensée » : ce que fait la pub, pub toujours facultative, pas de contournement ;
  - prix gardé ; changement de formule (montée immédiate au prorata, descente au renouvellement) ;
  - fraude à la pub ajoutée aux motifs de suspension.
- Remboursement : Pro et Creator Plus ; retour du filigrane en Gratuit après un remboursement.
- Confidentialité devient « Confidentialité et cookies » :
  - section #cookies : pub chargée seulement si l'utilisateur la choisit ; consentement en Europe, au Royaume-Uni et en Suisse ; pub limitée si refus ; choix gardé 6 mois ; liens Google ;
  - Google ajouté aux prestataires ; sauvegarde 100 Go et « Parler à un humain » en Creator Plus.
- Mentions légales : phrase sur le filigrane.
- Cahier des charges pour App / Comptes (écran de la pub, bandeau de consentement certifié TCF, lien « Gérer les cookies ») :
  dans docs/STATUS.md, section Juridique & business.

Fichiers touchés :
- site_src/conditions.html, remboursement.html, confidentialite.html, mentions-legales.html
- site_src/en/terms.html, en/refunds.html, en/privacy.html, en/legal-notice.html
- public/ : les 8 mêmes pages (build_site.py --domain stalak.app --email contact@stalak.app)
- docs/STATUS.md (section Juridique & business uniquement)
- docs/handoff/legal-nouvelle-offre.md

Migration SQL : aucune

Tests :
- 8 pages vérifiées à 390 px et 1280 px : pas de défilement horizontal, aucune erreur, aucun {{…}} restant.
- Aucune trace de « vidéo du jour », « rappel quotidien », Basic ou Max dans site_src.
- Aucun fichier serveur ni de l'app touché.

À fusionner avec (ou après) les branches App et Comptes de l'offre hybride. Les pages annoncent le filigrane, la pub et le
bandeau de consentement, et le lien « Gérer les cookies » doit exister quand la pub est en ligne.
La page Tarifs (Marketing) doit afficher les mêmes prix.

Reste au propriétaire :
- Décider si le filigrane est retiré quand aucune pub n'est disponible.
- Décider de l'âge minimum (public jeune, règles de Google sur les moins de 13 ans).
- Créer le compte Google Ad Manager, au même nom que Paddle et la banque une fois la structure créée.
