Statut : PRÊT
Branche : legal/pixel-influenceurs

Résumé :
Partie Juridique de `docs/handoff/chef-test-acquisition-payante.md`. Infos pour décider, pas un avis juridique. Détail : docs/juridique/INFLUENCEURS_ET_PIXEL.md.
1. Pixel TikTok : il **n'était pas** dans la page (elle disait « API serveur, pas encore active, aucun cookie »). Ajouté en FR/EN (`#tiktok-pixel` / `#pixel-tiktok`) : le pixel se charge seulement après « Accepter » ; TikTok reçoit visite, export, paiement ouvert, achat, adresse IP, navigateur, page ; cookies `_ttp` et `_tt_enable_cookie` (13 mois, à vérifier) ; `ttclid` gardé 30 jours ; achat aussi envoyé par le serveur avec e-mail haché ; ni nom, ni e-mail en clair, ni questionnaire, paroles ou vidéo ; TikTok peut s'en servir pour lui-même. Aussi mis à jour : « Your Privacy Choices » (partage), « qui reçoit », section États-Unis, date 25/11/2026.
2. Rappel #ad pour les influenceurs (document) : mention claire au début de la légende **et** dans la vidéo, réglage TikTok « Divulgation du contenu » / « Partenariat payant » activé, pas de #sp ni #collab ; Stalak est responsable des vidéos ; paragraphe en anglais à coller dans le message ; vérifier chaque vidéo, accord écrit, Spark Ads seulement avec l'accord et le code de l'influenceur, pas de mineurs, aucune promesse inventée.

À corriger par Comptes avant d'activer le pixel (`src/consent.js`) :
- Le texte du bandeau **ne nomme pas TikTok** : texte proposé dans le document (FR/EN).
- Les « Accepter » donnés avant le pixel ne valent pas pour TikTok : changer la version du consentement pour tout redemander.
- Un seul « Accepter » pour mesure et pub : acceptable si tout est nommé ; la CNIL préfère un choix par finalité (case « Publicité (TikTok) » à part) : à décider.
- Dans TikTok : désactiver la correspondance avancée automatique, pas d'audiences ni de retargeting tant que ce n'est pas décidé (et dit dans la page) ; rien envoyé avant l'accord ; accepter les conditions de traitement des données de TikTok Ads.

À trancher : choix de publicité séparé dans le bandeau (oui/non) ; le retargeting est-il prévu un jour (alors je l'écris avant).

Fichiers touchés :
- site_src/privacy.html, fr/confidentialite.html
- public/ : les 2 pages + sitemap.xml (build_site.py --domain stalak.app --email contact@stalak.app)
- docs/juridique/INFLUENCEURS_ET_PIXEL.md, docs/STATUS.md (section Juridique & business uniquement), docs/handoff/legal-pixel-influenceurs.md

Migration SQL : aucune

Tests : 137/137 tests serveur ; build_site.py et build.py ok ; 8 pages légales vérifiées à 390 px et 1280 px (pas de défilement horizontal, aucune erreur, aucun {{…}}). Aucun fichier de l'app ni du serveur touché.
Branche faite sur `main` ; `legal/coach-ia` n'y est pas encore (les deux touchent la confidentialité : fusion sans conflit de texte attendue, seul `public/sitemap.xml` se régénère avec build_site.py).

Reste au propriétaire : envoyer le message aux influenceurs avec le paragraphe #ad, vérifier chaque vidéo publiée, garder les accords et reçus ; saisir `TIKTOK_EVENTS_TOKEN` (prévu). Relecture par un professionnel avant de dépenser si possible.
