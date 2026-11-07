Statut : PRÊT
Branche : legal/video-par-email (nom historique : il n'y a pas d'envoi de la vidéo par e-mail)

Résumé :
Refait à 16 h pour correspondre exactement à compte/donnees-7-11 (docs/handoff/compte-donnees-7-11.md, optin.js, migration 0017).
Infos pour décider, pas un avis juridique.
- Confidentialité FR/EN, nouvelle section « Conseils par e-mail » / « Tips by email » (#conseils-email / #email-tips) :
  - encadré proposé une fois par appareil aux gratuits ; texte de la case cité mot pour mot (v1-2026-11-07) ;
  - confirmation par bouton dans un e-mail de login@stalak.app (Resend) ; effacement si pas de confirmation sous 7 jours ;
  - gardé : adresse, langue, version du texte, dates (ni compte, ni pays, ni IP, ni vidéo) ; base : consentement ;
  - 2 e-mails par mois au plus ; désinscription en un clic qui efface tout de suite ; effacement 3 ans après la confirmation ;
  - stalak:optin (date seulement) ; moins de 15 ans : accord d'un parent.
- Gardé et précisé : totaux par jour × provenance × pays × appareil (visites, étapes, fenêtre de paiement fermée par étape,
  paiements), stalak:vsrc à côté de stalak:ref, stalak:lastDay effacé à 13 mois.
- Retiré : tout ce qui parlait d'envoi de la vidéo par e-mail (section, « En bref », R2, Resend, section US).
- docs/juridique/EMAIL_VIDEO.md renommé en EMAIL_CONSEILS.md et réécrit : ce qui est validé, et les changements demandés à Comptes.

Changements demandés à Comptes (aucun ne bloque cette branche) :
1. Petit texte sous la case (opt.legal) : « On garde ton e-mail, ta langue et la date de ton accord » + lien vers
   #conseils-email / #email-tips (aujourd'hui : « seulement ton e-mail et ta langue », incomplet).
2. Si le propriétaire veut un jour des offres dans ces e-mails : ajouter « et des offres » dans la case (OPTIN_TEXT,
   OPTIN_CONSENT v2), et prévenir Juridique pour la page.
3. Avant les premiers envois : désinscription + List-Unsubscribe, adresse postale (CAN-SPAM), 2 par mois au plus.

Fichiers touchés :
- site_src/privacy.html, site_src/fr/confidentialite.html
- public/ (reconstruit : build_site.py --domain stalak.app --email contact@stalak.app)
- docs/juridique/EMAIL_CONSEILS.md (ex-EMAIL_VIDEO.md), docs/STATUS.md (section Juridique), docs/handoff/legal-video-par-email.md

Migration SQL : aucune ici (la 0017 est celle de Comptes)

Tests :
- 8 pages légales à 390 px et 1280 px, FR et EN : pas de défilement horizontal, aucune erreur, aucun {{…}} restant ;
- node tests/backend/run.mjs : 101/101 ; build.py passe.

Mise en ligne : EN MÊME TEMPS QUE compte/donnees-7-11.

Reste au propriétaire :
- Dire si les e-mails de conseils proposeront un jour des offres (Pro, promo).
- Choisir l'adresse postale du bas des e-mails (domiciliation conseillée) avant les premiers envois.
