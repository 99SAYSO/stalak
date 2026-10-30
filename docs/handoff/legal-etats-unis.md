Statut : PRÊT
Branche : legal/etats-unis

Résumé :
Cible États-Unis d'abord (décision du 30/10, 21 h). Infos pour décider, pas un avis juridique.
- Nouveau document docs/juridique/ETATS_UNIS.md : micro-entreprise + Paddle pour vendre aux États-Unis, CCPA/CPRA et
  lois des autres États, COPPA, renouvellement automatique (Californie et autres États), ce qui change dans les pages
  et le bandeau.
- Pages anglaises adaptées :
  - Terms : encadré « Automatic renewal, in short » ; accord au renouvellement ; rappels (annuel 15 à 45 jours avant,
    mensuel une fois par an) ; avertissement de 7 à 30 jours avant un changement de montant ; « Cancel anytime, online » ;
    lois des États ; public général, pas destiné aux moins de 13 ans, pas d'âge minimum.
  - Privacy : pub ciblée = « sale/sharing » au sens des lois américaines ; section « Your Privacy Choices » (lien, GPC,
    e-mail) ; « Your US privacy rights » (catégories, sources, usages, destinataires, durée, droits, 45 jours, mandataire,
    recours) ; « Children » (COPPA) ; Stalak géré depuis la France ; l'anglais n'est plus présenté comme une traduction.
  - Refunds : arrêt en ligne précisé. Legal notice : filigrane = logo seul.
  - Pied de page des 4 pages légales anglaises : lien « Your Privacy Choices » (vers /en/privacy#choices).
- Corrigé aussi en FR (faits de la décision de 21 h) : filigrane logo seul, packs dès 2 playbacks, sauvegarde automatique
  (plus de bouton), annuel → mensuel en deux temps (comme l'app de Comptes).
- Tâches pour Comptes, App et Marketing : docs/STATUS.md, section Juridique & business.

Fichiers touchés :
- site_src/en/terms.html, en/privacy.html, en/refunds.html, en/legal-notice.html
- site_src/conditions.html, confidentialite.html, mentions-legales.html (faits seulement)
- public/ : les 7 mêmes pages (build_site.py --domain stalak.app --email contact@stalak.app)
- docs/juridique/ETATS_UNIS.md (nouveau)
- docs/STATUS.md (section Juridique & business uniquement)
- docs/handoff/legal-etats-unis.md

Migration SQL : aucune

Tests :
- 8 pages légales vérifiées à 390 px et 1280 px : pas de défilement horizontal, aucune erreur, aucun {{…}} restant.
- Ancres #choices, #us et #cookies présentes.
- Aucun fichier de l'app ni du serveur touché.

Attention :
- Les pages annoncent un lien « Your Privacy Choices » et le respect de GPC. Côté App ou Comptes, ils doivent être
  branchés avant d'activer la vraie pub (aujourd'hui unité de test).
- Les pages annoncent aussi un rappel annuel aux abonnés mensuels. Côté Comptes, il doit être prêt avant les vrais paiements.

Reste au propriétaire :
- Choisir : pub personnalisée avec refus possible (ce qu'écrivent les pages), ou pub non personnalisée pour tous les
  Américains (plus prudent pour les mineurs, moins de revenu).
- À l'inscription Google Ad Manager : remplir les informations fiscales américaines (W-8BEN) au nom de la micro-entreprise.
- Faire relire les pages par un pro avant les vrais paiements et la vraie pub.
