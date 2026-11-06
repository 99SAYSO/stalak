Statut : PRÊT
Branche : legal/audit-6-11

Résumé :
Audit du 6/11 (docs/audit/2026-11-06-audit-complet.md), point 12, partie Juridique : confidentialité FR/EN mise en accord avec
ce que le code fait, et avec ce que Comptes va corriger. Infos pour décider, pas un avis juridique.
- « Ton compte » / « Your account » :
  - type d'appareil à l'inscription (iPhone/iPad, Android, ordinateur) ;
  - cookie stalak_d (appareil reconnu 90 jours ; seule l'empreinte est gardée, effacée à l'expiration, au changement de mot de passe et à la suppression du compte) ;
  - cookie stalak_o (connexion Google, 10 minutes).
- E-mail de remerciement : annulé si le compte est supprimé avant l'envoi.
- Cookies : la liste des 3 cookies (stalak_s, stalak_d, stalak_o), tous nécessaires, d'où l'absence de bandeau.
- Statistiques de visite : type d'appareil, provenance de la visite (stalak:ref, onglet), « déjà venu » (stalak:lastDay).
- Prestataires : ntfy (ntfy.sh) à côté de Telegram, même contenu (formule, prix, pays).
- Durées : paroles auto 90 jours au plus et effacées avec le compte ; empreintes d'IP effacées sous 2 jours.
- Section US (« What we collect ») : cookies de connexion, type d'appareil.

Fichiers touchés :
- site_src/privacy.html, site_src/fr/confidentialite.html
- public/ (reconstruit : build_site.py --domain stalak.app --email contact@stalak.app)
- docs/STATUS.md (section Juridique), docs/handoff/legal-audit-6-11.md

Migration SQL : aucune

Tests :
- 8 pages légales à 390 px et 1280 px : pas de défilement horizontal, aucune erreur, aucun {{…}} restant ;
- node tests/backend/run.mjs : 96/96 ; build.py : ok.

À fusionner avec la branche Comptes du point 12. La page annonce des durées que le code n'applique pas encore :
- paroles auto 90 j + suppression avec le compte ;
- purge réelle des empreintes d'IP sous 2 jours ;
- empreintes « déjà remercié » 3 ans ;
- annulation de l'e-mail programmé.
Liste précise dans docs/STATUS.md.

Reste au propriétaire : rien.
