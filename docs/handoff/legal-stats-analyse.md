Statut : PRÊT
Branche : legal/stats-analyse

Résumé :
Deux relectures demandées par le Chef de projet (24/11). Infos pour décider, pas un avis juridique. Détail : docs/juridique/STATS_ANALYSE.md.
1. Mode Clip réservé aux abonnés : les conditions FR/EN, le remboursement et les mentions légales **ne promettent aucun essai gratuit du mode Clip** ; l'essai Pro de 7 jours (carte, prélèvement, annulation) reste correct. **Les pages de Marketing, elles, le promettent encore** (pas modifiées par moi) : `pricing.html` l.107 ; `fr/tarifs.html` l.107 et 145 ; `music-video.html` l.94 et 98 ; `fr/clip.html` méta description, l.56, 94, 98 ; `music-video-maker-for-rappers` à relire. Promettre un essai qui n'existe plus est trompeur ; écrire « Essai gratuit de Stalak Pro, 7 jours, carte demandée ».
2. Confidentialité FR/EN (`#artist-profile` / `#profil-artiste`, réécrite) :
   - liens TikTok et YouTube du profil (seulement gardés ; les stats TikTok viennent de la liaison du compte) ;
   - champ libre « ce que tu fais » (gardé tel quel, ne rien écrire de sensible) ;
   - relevé hebdomadaire des chiffres publics Spotify par Apify (auditeurs, abonnés, écoutes) : Apify ne reçoit que l'adresse publique de la page, jamais de nom ni d'e-mail ; la copie est effacée ; si le relevé échoue, aucun chiffre inventé ;
   - sorties Spotify par l'API officielle (comptes et dates gardés, pas les pochettes ni le son) ;
   - durée : jusqu'à retrait du lien (les relevés s'arrêtent, chiffres effacés) ou suppression du compte ; sans compte, navigateur seulement ;
   - Apify ajouté aux prestataires, à « d'où ça vient » et « qui reçoit » ; la phrase « nous ne lisons pas ces pages » est remplacée (elle devenait fausse pour Spotify).
   - Conditions, section 10 : les chiffres de « Stats » peuvent être incomplets, en retard ou faux, ne sont ni un conseil ni une promesse de résultats.

Point sensible : lire la page publique Spotify par un robot est contraire aux conditions de Spotify (j'avais dit le contraire le 23/11 ; décision du Chef de projet respectée, risque signalé : blocage, perte de l'accès développeur). Atténuation : seulement la page de l'artiste qui donne son lien, 1 fois par semaine, arrêt sans casse, jamais de chiffre inventé.

À faire (avant la mise en ligne des pages) :
- Comptes : n'envoyer à Apify que l'adresse publique ; supprimer l'exécution après lecture ; ne garder que les comptes et dates des sorties ; champ libre limité et masqué dans Clarity ; aucun de ces champs vers GA4 ou TikTok. Le propriétaire saisit `APIFY_TOKEN` et accepte les conditions de traitement des données d'Apify.
- App : dire avant la saisie des liens « On relève chaque semaine tes chiffres publics Spotify » ; messages de chargement vrais (« On lit tes sorties Spotify… » seulement si le lien est donné ; « On analyse ton TikTok… » seulement avec la liaison).
- Chef de projet : dire si l'analyse est écrite par une IA (alors je l'écris dans la page).

Fichiers touchés :
- site_src/privacy.html, terms.html, fr/confidentialite.html, fr/conditions.html (dates 24/11/2026)
- public/ : les 4 pages + sitemap.xml (build_site.py --domain stalak.app --email contact@stalak.app)
- docs/juridique/STATS_ANALYSE.md, docs/STATUS.md (section Juridique & business uniquement), docs/handoff/legal-stats-analyse.md

Migration SQL : aucune

Tests : 132/132 tests serveur ; build_site.py et build.py ok ; 8 pages légales vérifiées à 390 px et 1280 px (pas de défilement horizontal, aucune erreur, aucun {{…}}). Aucun fichier de l'app ni du serveur touché.

Reste au propriétaire : saisir `APIFY_TOKEN` et accepter les conditions d'Apify ; relecture par un professionnel avant d'activer le relevé et avant les vrais paiements.
