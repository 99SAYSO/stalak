Statut : PRÊT
Branche : legal/provenance

Résumé :
Relecture de la phrase du Chef de projet sur la provenance de la première visite, et règles sur les traceurs (CNIL).
Infos pour décider, pas un avis juridique.
- Constat : stalak:src est écrit pour tous les visiteurs, n'expire jamais et est rattaché au compte, puis croisé avec la
  formule payée dans le tableau de bord. La CNIL ne dispense de consentement que la mesure d'audience qui donne des statistiques
  anonymes, sans recoupement (recommandation : 13 mois, sans prolongation). En Europe, ce stockage demande donc aujourd'hui un
  consentement. Aux États-Unis, pas de problème.
- Correction écrite dans la confidentialité FR/EN :
  - « Ton compte » renvoie vers une nouvelle sous-section « D'où tu viens » / « Where you came from » ;
  - inscription depuis l'Europe (UE, EEE, Royaume-Uni, Suisse) = total anonyme par provenance et par jour, jamais rattaché au compte ; ailleurs = avec le compte ;
  - 13 mois maximum, sans prolongation ; effacée du navigateur après l'inscription ;
  - bouton « Ne pas enregistrer d'où je viens » / « Don't record where I came from » : fonctionne déjà, il met localStorage stalak:src à « none » ;
  - le paragraphe des visites mentionne stalak:ref (onglet) et stalak:lastDay (retour) ;
  - section « Your US privacy rights » : provenance ajoutée à « internet activity ».
- Consigne pour Comptes et App : docs/STATUS.md, section Juridique & business.

Fichiers touchés :
- site_src/privacy.html, site_src/fr/confidentialite.html (texte, petit bouton + 1 script en ligne, 1 règle de style)
- public/ (reconstruit : build_site.py --domain stalak.app --email contact@stalak.app)
- docs/STATUS.md (section Juridique & business), docs/handoff/legal-provenance.md

Migration SQL : aucune ici. Celle du total par jour est à faire par Comptes.

Tests :
- bouton testé (Playwright) à 390 px et 1280 px, FR et EN : stalak:src = « none », message affiché, bouton grisé après rechargement, aucune erreur ;
- 8 pages légales à 390 px et 1280 px : pas de défilement horizontal, aucun {{…}} restant.

À fusionner en même temps que la branche Comptes qui applique la règle « Europe = total anonyme, 13 mois, none/- ». La page décrit
ce fonctionnement : la publier seule annoncerait quelque chose que le code ne fait pas encore. Le bouton, lui, est utile tout
de suite : le code actuel renvoie « none », que le serveur accepte, et aucune vraie provenance n'est enregistrée.

Reste au propriétaire :
- Valider la règle (Europe = anonyme, ailleurs = par compte), ou choisir le total anonyme pour tout le monde.
