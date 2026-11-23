Statut : PRÊT
Branche : legal/mesure-et-offre-1-euro

Résumé :
Réponse à `docs/handoff/chef-mesure-offre-1-euro.md` (partie « Pour Juridique »). Infos pour décider, pas un avis juridique. Textes et règles complets : docs/juridique/MESURE_ET_OFFRE_1_EURO.md.
- Confidentialité FR/EN :
  - Cookies : cookies nécessaires (sans accord) et facultatifs (seulement après « Accepter », rien avant) ; Microsoft Clarity (replays, champs et paroles masqués, vidéos jamais), Google Analytics (13 mois / 14 mois), conversion TikTok « pas encore active » (e-mail haché, aucun cookie, redemandé à l'activation) ; choix gardé 6 mois, GPC = refus, changement via « Gérer les cookies », moins de 15 ans (16 aux États-Unis) avec un parent.
  - « En bref », prestataires (Microsoft, Google Analytics, TikTok), transferts hors UE, droits (retrait du consentement), « Your Privacy Choices » (envoi à TikTok = « partage » aux États-Unis, seulement après accord, refus possible) et section États-Unis (EN).
  - Offre à 1 € (`#intro-offer` / `#offre-1-euro`) : carte chez Paddle, indicateur « utilisée », e-mails de service.
- Conditions FR/EN : paragraphe « Offre retirer le filigrane (1 €) » (7 jours de Pro puis Pro mensuel 7,99 $, prix aujourd'hui et ensuite au même endroit que le bouton, annulation, une fois par compte, remboursement 14 jours sur chaque paiement). Remboursement FR/EN : paragraphe 1 €.
- Relu : le bandeau et l'offre n'existent pas encore dans le dépôt ; j'ai écrit les textes proposés (bandeau FR/EN, libellé et mention de l'offre).

À dire à Comptes / App (détail dans le document) :
- Bandeau : Refuser = Accepter, rien avant le choix, 6 mois, version du consentement à changer quand on ajoute TikTok.
- Clarity : masquer champs, paroles, aperçu ; pas d'identifiant de compte ; charger après accord. GA4 : 14 mois, cookie 13 mois, signaux Google et pub désactivés, pas d'e-mail.
- TikTok : le serveur doit connaître le choix au moment de l'achat (compte ou `custom_data` Paddle) ; choix inconnu = rien envoyé ; e-mail minuscules, sans espace, SHA-256.
- Offre : libellé « 7 jours de Pro pour 1 € » (pas « pour 1 € » : trompeur par omission) ; prix ensuite et date lisibles à côté du bouton ; devises cohérentes (prix en euros à régler dans Paddle) ; pas de compte à rebours ; e-mail de confirmation avec prix ensuite et date.

Manque pour la CNIL (Clarity) : masquage vérifié dans un vrai replay, pas d'identifiant, consentement avant chargement, durée annoncée. États-Unis : risque de procès « écoute illicite » (Californie) si Clarity ou les envois à des tiers partent avant l'accord ; consentement préalable et masquage le limitent.

À trancher :
- L'essai gratuit et l'offre à 1 € se cumulent-ils ? (pas écrit dans les pages)
- Relecture par un professionnel avant d'activer TikTok (transferts) et avant les vrais paiements.
- Page Tarifs : phrase proposée dans le document (domaine de Marketing, non modifiée).

Complément du 23/11 (23 h) :
- Confidentialité FR/EN : nouvelle section « Ton profil d'artiste » (`#artist-profile` / `#profil-artiste`) : nom d'artiste, genres, liens Spotify / Apple Music / SoundCloud / Instagram, auditeurs déclarés (tranche puis chiffre hebdomadaire), où il publie, blocages, objectifs. Sert au plan, à la courbe « Stats », aux décisions produit regroupées ; jamais envoyé à GA4, Clarity, TikTok ; pas de connexion aux comptes ni de lecture des pages ; durée = jusqu'à modification ou suppression du compte (sans compte : navigateur seulement). Ajouté aussi à la liste des données de la section États-Unis.
- Relu (maquettes `14-paywall`, `15-offre-1-euro`, onboarding) : détail dans le § 8 du document. À corriger par App : carte bancaire non mentionnée sur le paywall ; prix annuel plus petit que « 4,17 $/mois » ; ligne du bas trop petite et peu contrastée ; date réelle du 1er prélèvement ; offre à 1 € : « 7 jours de Pro pour 1 € » et non « pour 1 € » ; « On s'en sert pour suivre tes écoutes » est faux (on ne lit pas ces pages) : « On garde ces liens sur ton profil » ; avis « Nirox » : vérifier qu'il est un vrai abonné payant et d'accord (pas un ami présenté comme client).
- Comptes Clarity et GA4 : conditions RGPD de Google acceptées (à garder). À régler avant la mise en ligne : GA4 conservation 14 mois, « interactions avec les formulaires » désactivées, signaux Google désactivés ; Clarity masquage « Strict ». Après installation, noms réels des cookies à vérifier et à mettre dans la page.

Fichiers touchés :
- site_src/privacy.html, terms.html, refunds.html, fr/confidentialite.html, fr/conditions.html, fr/remboursement.html
- public/ : les mêmes pages + sitemap.xml (build_site.py --domain stalak.app --email contact@stalak.app)
- docs/juridique/MESURE_ET_OFFRE_1_EURO.md, docs/STATUS.md (section Juridique & business uniquement), docs/handoff/legal-mesure-et-offre-1-euro.md

Migration SQL : aucune

Tests : 121/121 tests serveur ; build_site.py et build.py ok ; 8 pages légales vérifiées à 390 px et 1280 px (pas de défilement horizontal, aucune erreur, aucun {{…}}). Aucun fichier de l'app ni du serveur touché.

Reste au propriétaire : créer les comptes Clarity et GA4 (c'est prévu) ; relecture par un pro avant d'activer TikTok. Les pages annoncent le bandeau : elles ne doivent pas être publiées avant lui.
