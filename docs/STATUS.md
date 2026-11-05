# Stalak — état du projet

> Tenu à jour par le Chef de projet. Chaque conversation le lit avant de commencer et met à jour sa section sur sa branche à la fin de chaque tâche.
> Dernière mise à jour : 30/10/2026 à 21 h (offre hybride fusionnée et en ligne : App, Comptes, Juridique, Marketing ; migration 0008 appliquée).

## Décisions récentes du propriétaire
- **5/11, 12 h 20 : en ligne `compte/notif-ventes`** (notif ntfy au propriétaire : nouvel abonné / annulation, une par achat, bouton de test au tableau de bord → Santé du serveur). Sans maquette (règle 9 : rien de visible sur le site). Tests serveur 83/83. Reste au propriétaire : secret `NTFY_TOPIC` dans Cloudflare (nom de canal long et secret, pas celui écrit dans la conversation), puis le bouton de test.
- **5/11, 11 h 30 : fusionné `marketing/promo-youtube` (film de lancement v6, planche contact, 12 défauts corrigés ; sources seulement, rien sur le site).** `tools/contact_sheet.py` corrigé : chaque image est maintenant prise exactement à son horodatage (avant : ~0,23 s plus tard, remarque de Marketing).
- **5/11, 0 h 20 : règle 10 du contexte, planche contact obligatoire** avant l'export final de chaque vidéo (skill `planche-contact`, script `tools/contact_sheet.py` : une image toutes les 0,5 s avec horodatage et zones masquées par TikTok / Instagram en rouge).
- **5/11, minuit : nouvelle règle 9 du contexte, « maquette avant le vrai site »** : chaque branche a sa maquette (`https://<branche-avec-tirets>.stalak-site.pages.dev`, créée par Cloudflare à chaque push) ; le lien va dans le compte rendu (`Maquette : …`) ; le Chef de projet ne met en ligne qu'après le « ok » du propriétaire sur la maquette.
- **4/11 : PREMIÈRES VENTES RÉELLES** (vrais clients, pas des tests) : Pro annuel 52,49 $ TTC et Pro mensuel 8,70 $ TTC, webhooks livrés (15 h 43 et 17 h 10, heure Paddle). Environ 54 $ net après taxes et frais Paddle (estimation). AdSense : site toujours « Getting ready » (compte soundslikesayso@gmail.com), ads.txt bien en ligne.
- **4/11, 1 h : vidéo YouTube « Introducing Stalak: the edit nobody sees » et son Short publiés** sur @stalak_app (titres, descriptions en anglais avec `stalak.app/?ref=youtube`, tags, langue anglais US, catégorie Science & Technologie, ni promotion payée ni IA déclarée). Liens de description non cliquables et miniature perso impossibles tant que la chaîne n'est pas vérifiée par téléphone (à faire par le propriétaire). Cette semaine, le Chef de projet programme dans Zernio les vidéos promo déjà faites par Marketing (choisies par le propriétaire), en attendant le circuit du dimanche.
- **4/11, 0 h 20 : compte Zernio prêt** (stalak.alaska@gmail.com, usage « moi-même », offre gratuite) : **Instagram et TikTok @stalak_app reliés**. Connecteur Zernio ajouté dans Claude ; « Publish a post immediately » (`posts_publish_now`) mis sur **Bloqué** par le Chef de projet (0 h 25). Les autres outils d'écriture restent sur « Nécessite une approbation » (attention : « Create a social media post » peut aussi publier tout de suite, toujours demander un horaire programmé). Ensuite Réseaux sociaux (4) fait le premier essai avec Marketing (5).
- **4/11, minuit : en ligne `app/pied-de-page` (dernier commit : bandeau `.sitefoot` retiré) et `marketing/promo-youtube` (sources de la vidéo YouTube et du Short, rien sur le site).** Tests : serveur 80/80, pied_de_page 396, liens_cmp 98, audit 158, formules 169, projet local 48. Zernio : le propriétaire crée son compte (plan de `social/promo-auto`, encore EN COURS).
- **3/11, 23 h 35 : on GARDE le bouton « pub 30 s → export sans filigrane »** en attendant la vraie pub, même s'il affiche pour l'instant la pub d'exemple de Google (`AD_UNIT` de test, 0 revenu) : habituer les gens à la pub pour pousser vers Pro. Ne pas le masquer.
- **3/11, 23 h 30 : AUCUNE bannière publicitaire sur le site.** Seule pub : la vidéo récompensée de ~30 s, facultative, pour exporter gratuitement SANS filigrane (sinon export gratuit avec filigrane, ou Pro). Dans AdSense : laisser les « annonces automatiques » DÉSACTIVÉES. Après validation AdSense : Ad Manager (bloc récompensé + message RGPD), puis `CMP_ON=true` et `AD_UNIT`.
- **3/11, 23 h 25 : vrais paiements testés de bout en bout** (achat réel Pro mensuel à 0,90 $ avec code `TESTSTALAK`, 3 webhooks livrés, compte passé en Pro, tableau de bord à jour ; annulation programmée au 3/12 ; propriétaire garde les 0,90 $, remboursement non testé). Bug corrigé : étiquettes TEST du tableau de bord (`.test[hidden]`). Codes Paddle réels (1 utilisation chacun, jusqu'au 3/12) : `MERCISTALAK` (1er mois offert Pro/Creator mensuel, pour la testeuse Desiree, brouillon d'e-mail dans stalak.alaska, envoi par le propriétaire), `TESTGRATUIT` et `TESTPRO38` (tests, à archiver). Paddle refuse un code qui ramène le total sous ~0,40 $. Les abonnements de test (sandbox) ne donnent plus rien depuis le passage en production.
- **3/11, 22 h 35 : VRAIS PAIEMENTS EN LIGNE.** `wrangler.toml` (et `workers/cloud-cleanup/wrangler.toml`) en `production`, jeton `live_…a632f`, 4 prix réels, anciens prix de test vidés ; `/api/config` vérifié en ligne. Côté Paddle réel : jeton client « stalak.app checkout », webhook `https://stalak.app/api/paddle/webhook` (11 événements). Secrets `PADDLE_API_KEY` et `PADDLE_WEBHOOK_SECRET` remplacés par le propriétaire dans Cloudflare. Reste : achat réel de test + remboursement ; Worker `cloud-cleanup` à redéployer s'il est déployé ; forfaits Workers Paid / Resend (propriétaire, plus tard) ; `vendeur.json` au SIRET.
- **3/11, 22 h : Paddle RÉEL validé** (« Your account is live — you can now take payments ») ; domaine stalak.app approuvé (Checkout + Apple Pay) ; lien de paiement par défaut `https://stalak.app` enregistré. Prochaine étape : passage en vrais paiements (`docs/PADDLE_PRODUCTION.md`, étapes 2 à 5), à décider avec le propriétaire (forfaits Workers Paid / Resend, `vendeur.json` dès le SIRET).
- **3/11, 16 h 30 : catalogue Paddle RÉEL créé** (taxes en plus du prix, `custom data` `plan`). Identifiants publics à mettre dans `wrangler.toml` le jour du passage (`docs/PADDLE_PRODUCTION.md` étape 3) : `PADDLE_PRICE_PRO_MONTH = pri_01m6gz2fm03av5gmreyh8d4n6v` (7,99 $), `PADDLE_PRICE_PRO_YEAR = pri_01m6gz30pd9aec87fvy833wdgj` (49,99 $), `PADDLE_PRICE_CREATOR_MONTH = pri_01m6gyzb1ddqj8egyahphxgtd4` (14,99 $), `PADDLE_PRICE_CREATOR_YEAR = pri_01m6gz1aabr7h5tyyfwkbgvjpk` (99,99 $). Produits : Stalak Pro `pro_01m6gyxpx0hx8ja23f0swc5sxc`, Stalak Creator Plus `pro_01m6gyy6ygv0mvdws4v60zd1h2`. Attention : dans Paddle avec Chrome en français, taper les prix avec une virgule (14,99), sinon 14.99 devient 1 499 $.
- **3/11, 16 h : compte Paddle RÉEL créé (stalak.alaska@gmail.com) et vérification envoyée** : Entreprise Individuelle, nom commercial Stalak, domaine stalak.app, pages /pricing /terms /privacy /refunds, début d'activité 02/11/2026, sans numéro de TVA (franchise). Paddle n'a pas demandé de SIRET à cette étape. En attente : avis de Paddle par e-mail. Reste avant les vrais paiements : catalogue réel (2 produits, 4 prix), coordonnées bancaires (propriétaire), `vendeur.json` dès le SIRET reçu (nom, SIRET, adresse, téléphone), puis `docs/PADDLE_PRODUCTION.md`.
- **3/11 : micro-entreprise déposée** sur le Guichet unique (INPI), formalité n° J00297450447 : entrepreneur individuel, micro-entrepreneur, activité commerciale « Traitement de données, hébergement et activités connexes » (application web Stalak en abonnement), nom commercial Stalak, déclarations trimestrielles, sans versement libératoire, franchise de TVA, début d'activité 02/11/2026, non-diffusion Sirene demandée. En attente : validation du Greffe puis SIRET (1 à 4 semaines). Ensuite : remplir `vendeur.json`, demander l'ACRE à l'URSSAF **avant le 01/01/2027** (60 jours), puis Paddle en réel (`docs/PADDLE_PRODUCTION.md`).
- **2/11, 0 h 40 : en ligne `app/pied-de-page`** (bandeau de pied de page commun à toutes les pages, FR/EN). `SOCIAL` et `GUIDES` sont maintenant dans `src/footer.py` ; YouTube @stalak_app ajouté. Tests : serveur 80/80, interface pied_de_page 396, liens_cmp 98, audit 158, formules 169, projet local 48.
- **2/11, 0 h 20 : contact@stalak.app arrive maintenant sur stalak.alaska@gmail.com** (Cloudflare Email Routing ; adresse vérifiée par le propriétaire ; avant : soundslikesayso@gmail.com). La conversation « 7. Mails » voit donc les mails de contact.
- **2/11, 0 h 15 : chaîne YouTube créée et personnalisée** (compte Stalak, https://www.youtube.com/@stalak_app) : photo = logo rond, bannière bleue à stalactites (« Your takes, cut to the beat. In a minute. » + stalak.app), description en anglais, liens stalak.app / Instagram / TikTok, contact contact@stalak.app, filigrane logo sur toute la vidéo, mots-clés, pays France, « pas conçue pour les enfants ». Logo YouTube ajouté au pied de page du site (`SOCIAL`) et au `sameAs`. Chaîne prévue pour les tutos (Stalak, montage, motion design).
- **1/11, minuit : en ligne `app/liens-cmp`** (adresse qui suit la langue `/` ↔ `/fr/`, consentement pub prêt mais éteint `CMP_ON=false`, liens « Gérer les cookies » / « Cookie settings » / « Your Privacy Choices »). Conflits avec Juridique sur `fr/conditions.html` et `terms.html` : texte de Juridique (daté du 1er novembre) + pied de page d'App. Tests : serveur 80/80, interface liens_cmp 98, audit 158, formules 169, projet local 48 (tout réussi). Vérifié en ligne. En attente : bandeau de pied de page (App).
- **1/11, 23 h 40 : Google Cloud (connexion Google), fait** : liens de la fiche de consentement passés à `https://stalak.app/privacy` et `https://stalak.app/terms` (avant : `/confidentialite`, `/conditions`), revérifiés par Google et publiés.
- **1/11, 23 h 20 : en ligne** `compte/tableau-de-bord-v2` (tableau de bord refait : 6 onglets, carte du monde, provenance, appareils ; migration 0010 appliquée), `legal/adresses-vendeur` (adresses vérifiées, `vendeur.json` à remplir, pays dans la confidentialité), `marketing/annuaires` (documents). En cours : `app/liens-cmp`.
- **1/11, 23 h : annuaires (Chef de projet + propriétaire)** : envoyés en file gratuite : contentcreators.com, The Music Industry Toolkit, Buzzsonic (captcha par le propriétaire), AlternativeTo (fiche + alternative : CapCut ; Triller n'existe pas sur AlternativeTo), SaaSHub (concurrents : CapCut, CapCut Web, InShot ; vérification par e-mail @stalak.app possible pour passer devant). Launching Next rempli (reste la question anti-robot du propriétaire). Restent (compte à créer par le propriétaire) : Uneed, Tinyshelf, PeerPush, WebCatalog, Peerlist. Rien n'a été payé.
- **1/11, 22 h 45 : Bing Webmaster Tools fait** (site déjà présent depuis le 27/10) : `sitemap.xml` renvoyé, `sitemap-old.xml` ajouté, 12 adresses soumises (accueils, tarifs, page Triller FR/EN, 6 guides). Reste au propriétaire : Crawler Hints dans Cloudflare (facultatif), puis les annuaires.
- **1/11, 22 h 40** : `compte/emails-da` en ligne (e-mails aux couleurs de Stalak ; liens `FR_HOME = /fr/`, `EN_HOME = /`). **Annuaires** : Stalak présenté comme « alternative à Triller » sur AlternativeTo / SaaSHub (sur leurs sites) = **oui** ; **aucun lien vers un autre site en bas de stalak.app** : Twelve Tools et Fazier sont sautés. **Nouveau chantier Comptes** : tableau de bord privé refait (plus beau, mieux rangé, beaucoup de données, carte des pays où les comptes sont créés).
- **1/11, 22 h 30 : l'anglais est à l'adresse principale (en ligne).** Fusionnés : `marketing/en-racine` (anglais à `/`, français dans `/fr/`, redirections 301, 6 guides, page Triller, plan du site) ; le Chef de projet a fait le point 5 de Comptes (liens des e-mails vers `/fr/#compte` et `/#account`, langue par défaut de la connexion Google = anglais sauf `/fr`, test serveur adapté). `marketing/promo-machine` (sources de la promo v8). Comptes n'a plus à faire le point 5. Vérifié en ligne : `/en/` → `/`, `/en/pricing?x=1` → `/pricing?x=1`, `/tarifs` → `/fr/tarifs`, anciennes pages Triller → nouvelle page, accueil en `lang=en`. Search Console (compte soundslikesayso) : `sitemap.xml` et `sitemap-old.xml` soumis le 1/11, indexation demandée pour `/`, `/fr/` et `/triller-alternative`. Retirer `sitemap-old.xml` vers le 15/12.
- **1/11 : le propriétaire veut créer une chaîne YouTube Stalak pour poster des tutos en motion design.** Quand elle existe : ajouter le lien au site (`SOCIAL` dans `build_site.py`), Marketing prépare les tutos (skills `code-motion-video` / `saas-motion-video`).
- **À RAPPELER AU PROPRIÉTAIRE au moment du passage aux vrais paiements (sa demande du 1/11)** : payer Cloudflare **Workers Paid** (5 $/mois, + alertes de dépense) et le forfait payant **Resend**. Il les paiera à ce moment-là, pas avant. Option à reproposer à ce moment-là : **Uneed Fast-track (14,99 $)**, le lancement gratuit étant prévu le 27/05/2027.
- **1/11 au soir, fait par le propriétaire avec le Chef de projet** : Turnstile actif (clé publique dans `wrangler.toml`, secret dans Cloudflare) ; Cloudflare Pages lance `node tests/backend/run.mjs` avant chaque mise en ligne (Node 22 via `.node-version`) ; alertes à `stalak.alaska@gmail.com` (`ALERT_EMAIL`) ; AdSense créé avec stalak.alaska@gmail.com (`ca-pub-2317718448369640`, `ads.txt` et balise en ligne), **examen Google en cours** ; ensuite Ad Manager pour la pub récompensée. Reste : Workers Paid, Resend payant, 3 secrets GitHub (copie de la base).
- **31/10, 20 h 15 : décisions du propriétaire (référencement).** 1) **L'anglais passe à l'adresse principale** (`/`, `/pricing`…), le français dans `/fr/` : plan de `docs/marketing/US_FIRST.md` partie A, mise en ligne coordonnée Marketing + App + Comptes (+ vérification Juridique). 2) **Les 6 pages par cas d'usage sont publiées.** 3) **Triller : option B, une seule page comparative neutre et vraie est autorisée** (`/triller-alternative`, et `/fr/alternative-triller`) : exception à la règle « aucun concurrent cité », limitée à cette page (rien sur l'accueil, la page Tarifs ni dans l'app). 4) Annuaires d'outils et Bing Webmaster Tools : textes préparés par Marketing, comptes créés par le propriétaire. Search Console (31/10) : plan du site lu le 31/10, 12 pages, succès ; nouvelle soumission et indexation demandées par le Chef de projet après la bascule.
- **31/10, 20 h : en ligne** `app/animations` (avec `app/audit-fix` : Galerie débloquée, offre Pro au milieu de l'écran, animations revues avec `motion-design`), `compte/entonnoir-etapes` (`pro_offer`, `ad_shown` au tableau de bord ; le Chef de projet a branché `acctEvent('ad_shown')` dans `adWatch`), `marketing/promo-explainer` (sources des vidéos promo « Ice the Beat » et « Stalak, comment ça marche » dans `promo/`, vidéos envoyées au propriétaire, pas dans le dépôt). Tous les tests passent (`gallery_ui` 49/49, `audit_ui` 158/158).
- **31/10 : comptes officiels créés, Instagram et TikTok `@stalak_app`.** Ajoutés au pied de page de l'accueil et à la fiche Google (`SOCIAL` dans `build_site.py`). YouTube : pas encore.
- **31/10, 4 h : le texte d'accueil du premier écran (« Tes prises, montées sur le rythme », vidéo d'exemple, pastilles) est retiré à la demande du propriétaire** (trop de place, mal placé sur ordinateur). Ne pas le remettre ; la vidéo `site_src/demo/hero.mp4` n'est plus utile.
- **31/10, 3 h : audit fusionné et en ligne** (`app/audit` avec `app/export-pub`, `compte/audit`, `marketing/audit-us`), migration 0009 appliquée. Compteurs de l'entonnoir : un seul chemin, `acctEvent` (Comptes) ; `evt()` d'App ne fait plus rien (son test `audit_ui.py` attend encore ses anciens noms : 12 échecs attendus, à adapter par App). **Bug à corriger par App** : ouvrir un projet depuis la Galerie reste bloqué sur « Je remets ton montage en place… » (`gallery_ui.py`, étape « en-1280 Pro: the project opens » ; passe sur `compte/audit` seule, échoue sur `app/audit` seule).
- **30/10 au soir : audit complet** par le Chef de projet, en 3 parties : `docs/audit/2026-10-30-ux.md`, `docs/audit/2026-10-30-technique.md`, `docs/audit/2026-10-30-croissance.md`. Chaque point indique la conversation responsable. Les tâches sont données par le propriétaire.
- **30/10, 21 h : nouvelles demandes du propriétaire.** Marché visé : **États-Unis d'abord** (anglais langue principale). **Aucun concurrent cité sur le site.** Packs dès 2 playbacks. Filigrane : logo seul, plus discret, style ancien Triller, change de place sans glisser. Sauvegarde en ligne automatique pour Creator Plus (plus de bouton). Bouton pub bleu « givré » à côté d'Exporter. Cadenas visible sur « Générer le pack ». Choix du passage du son libre (sans aimant) et curseur de lecture déplaçable au doigt. Ensuite : audit complet par le Chef de projet.
- **30/10, 21 h : offre hybride en ligne.** Fusionnées : `app/formules` (filtres, filigrane, pub récompensée de test, cadenas Pro / Creator Plus), `compte/formules`, `legal/nouvelle-offre`, `marketing/tarifs-formules` (contient `marketing/seo`). Écran des formules dans l'app : version de Comptes (branchée sur Paddle et le changement de formule) ; celle de Marketing n'est pas reprise, la page Tarifs du site l'est. `marketing/chat-pro` abandonnée. Reste au propriétaire : compte Google Ad Manager (unité « rewarded » web, puis remplacer `AD_UNIT`), outil de consentement, test sur iPhone (filigrane, pub de test).
- **30/10 au soir : l'offre change encore. Elle remplace « Gratuit 1 vidéo par jour + Basic / Pro / Max »** (voir STALAK_CONTEXTE.md, section 2) : Gratuit illimité avec filigrane et pub récompensée, Pro 7,99 $ / 49,99 $, Creator Plus 14,99 $ / 99,99 $. On reprend le travail fait sur `compte/formules`, `app/formules`, `marketing/tarifs-formules` et `legal/nouvelle-offre` (tableau des formules, Paddle, changement de formule, cadenas, pages), et on l'adapte. Ces branches ne seront pas fusionnées telles quelles. Les nouveaux prix Paddle sandbox seront créés par le Chef de projet et notés ici.
  - **Prix Paddle sandbox de l'offre hybride (créés le 30/10 à 19 h 35 par le Chef de projet, en dollars ; Paddle convertit selon le pays)** :
    | Formule | Produit | Mensuel | Annuel |
    |---|---|---|---|
    | Pro | `pro_01m5ygd6ra9bhd5vzy2v1rrk70` | 7,99 $ `pri_01m671bncd9qm3dqxjyqf127gn` | 49,99 $ `pri_01m671cexysycbr7wz1av55cvy` |
    | Creator Plus | `pro_01m671d5b8wbm0dmmvjn7x8vx9` | 14,99 $ `pri_01m671dtkv0d5m0r2a4ek02a3e` | 99,99 $ `pri_01m671eex11hq295vhmsj723wm` |
    - Anciens prix (tous encore actifs, abonnements de test seulement) : le webhook compte les prix Pro en euros (9,99 €, 79 €, 10,99 €, 109 €) et Basic comme `pro`, les prix Max comme `creator`. Ils seront archivés plus tard, avec l'accord du propriétaire.
  - **Contrat App / Comptes pour l'offre hybride** (remplace le contrat Basic/Pro/Max ci-dessous) :
    - Formules : `free`, `pro`, `creator`. Gratuit **sans compte obligatoire**, montage illimité, plus de vidéo du jour, plus d'e-mail de rappel, plus de fin Stalak de 3 s.
    - `acctHas(feat)` : `nowm` (pas de filigrane ni de pub), `clip`, `fx` (effets premium), `text` (mot par mot / karaoké), `filters` (filtres pro), `lyrics` (paroles auto) → Pro et Creator Plus ; `pack5`, `pack10`, `pack30`, `cloud`, `human` → Creator Plus seulement.
    - `acctOpen(why, { plan })` avec `plan` = `pro` ou `creator`. `acctQuota` et `acctUseVideo` ne servent plus.
    - Filigrane : ajouté par l'App dans le navigateur à l'export pour Gratuit (logo + « Clipped with stalak.app », qui bouge). La pub récompensée (Google Ad Manager, format « rewarded » pour le web) l'enlève pour **cette** vidéo. Pas de vérification côté serveur : Google n'en propose pas pour le web.
    - Paroles auto : proposition 20 par jour en Pro, 60 en Creator Plus ; sauvegarde en ligne 100 Go en Creator Plus.
- 27/10 : « Parler à un humain » devient un avantage **Stalak Pro** : chat en direct si le propriétaire est disponible, sinon réponse par e-mail sous 24 h. Ne jamais écrire « 24 h/24 ». Les gratuits gardent le glaçon IA et contact@stalak.app (obligation légale de pouvoir joindre le vendeur). Comptes fait la restriction côté serveur et dans le glaçon ; Marketing a écrit les textes (branche `marketing/chat-pro`, à fusionner en même temps que la branche Comptes).
- 27/10 : **menu du compte** (en haut à droite) et **Galerie** des projets en ligne, en grille avec couvertures, comme l'app Photos de l'iPhone → Comptes.

- 30/10 : **filtres vidéo** à l'étape Montage, comme les filtres des stories Instagram → App & montage. Liste choisie par le propriétaire :
  - Caméra : Givre, Grain vintage « LA », Vision nocturne, Démon, Halloween ;
  - Rétro : VHS, Film 35 mm, Super 8, Noir & blanc ;
  - Esthétique : Golden hour, Rêve, Y2K, Pastel.
  - Stalak Pro sauf 3 filtres gratuits (Noir & blanc, Givre, Film 35 mm), réglage modifiable. Les filtres « Clip rap » qui suivent le beat ne sont pas retenus pour l'instant.

- 30/10 : **nouvelle offre, 1 gratuit + 3 abonnements** (remplace « Gratuit illimité + Stalak Pro ») :
  - Gratuit : **1 vidéo par jour**, compte gratuit obligatoire, avec logo, 3 filtres. E-mail de rappel « ta vidéo du jour est disponible » (case à cocher, 1 par jour au plus, arrêt après 7 jours sans visite).
  - **Basic 4,99 €/mois (39 €/an)** : vidéos illimitées sans logo, toutes tailles et apparitions du texte, 3 filtres.
  - **Pro 10,99 €/mois (109 €/an)** : Basic + tous les filtres, mode Clip 16:9, packs de 5 et 10, paroles auto 20 par jour, sauvegarde en ligne 20 Go.
  - **Max 13,99 €/mois (139 €/an)** : Pro + packs de 30, paroles auto 60 par jour, sauvegarde 100 Go, « Parler à un humain ». Carte mise en avant : « seulement 3 € de plus que Pro ».
  - Un abonné garde son prix. Aujourd'hui, il n'y a que des abonnements de test (sandbox).
  - **Prix Paddle sandbox créés le 30/10 par le Chef de projet** (taxe : réglage du compte, catégorie « Standard digital goods ») :
    | Formule | Produit | Mensuel | Annuel |
    |---|---|---|---|
    | Basic | `pro_01m66r6h2rkefmaxn31gckec3n` | 4,99 € `pri_01m66r80jxszc4yxggqvwak5p5` | 39 € `pri_01m66r8g1bhvhnk6x1z9m0x894` |
    | Pro | `pro_01m5ygd6ra9bhd5vzy2v1rrk70` | 10,99 € `pri_01m66r4d7mtzps3wmycfmv8pk9` | 109 € `pri_01m66r5nakxvg6cxjcgc1vv7j7` |
    | Max | `pro_01m66r71dy61a2qaqsrrxgq12n` | 13,99 € `pri_01m66r9m12ckfttnrr5h3vhfgc` | 139 € `pri_01m66r9tmrfg7fxfrb5dpnk5s3` |
    - Anciens prix Pro, toujours actifs pour les abonnés existants : 9,99 € `pri_01m5ygermd2pjw66mgdsh4f4rw` et 79 € `pri_01m5ygfwqdq8h2ax297c6qagjs`. Le webhook doit les compter comme « pro ».
  - **Contrat entre App et Comptes (30/10, à respecter tel quel par Comptes)** : App a déjà écrit son côté sur la branche `app/formules`, encore à l'état EN COURS. Comptes doit fournir dans le bloc compte de `app.js`, sous ces noms exacts :
    1. `acctHas(feat)` → `true` ou `false` pour `nologo`, `text`, `unlimited` (Basic) ; `filters`, `clip`, `pack5`, `pack10` (Pro) ; `pack30` (Max). Ajouter aussi `cloud`, `lyrics` et `human` côté serveur.
    2. `acctQuota()` → `{ left, resetAt }` pour un gratuit connecté (vidéos restantes aujourd'hui, heure en ms de la prochaine), `null` pour une formule payante.
    3. `acctUseVideo()` → compte la vidéo du jour côté serveur (peut renvoyer une promesse).
    4. `acctOpen(why, { plan })` → ouvre la page des formules sur `plan` (`basic`, `pro` ou `max`). Nouvelles raisons : `daily`, `pack30` et `filters`. `daily` pour une personne non connectée ouvre la création de compte.
    - Juridique a écrit les règles côté serveur (remise à zéro, prorata, changement programmé, prix gardé) dans `docs/STATUS.md` de la branche `legal/nouvelle-offre` (`git show origin/legal/nouvelle-offre:docs/STATUS.md`), section Juridique : à appliquer.
  - Travail : Comptes (formules, compteur, e-mail de rappel, Paddle), App (ce que débloque chaque formule, écran « vidéo du jour utilisée »), Marketing (page Tarifs à 4 colonnes), Juridique (conditions de vente). Prix Paddle sandbox créés par le Chef de projet.

## En ligne (stalak.app)
- App de montage FR/EN : son, prises, paroles, montage, export, packs, effets, mode Clip.
- Caméra iPhone : minuteur, message « prise enregistrée », miroir de la caméra selfie, fichier vidéo remis en ordre.
- Comptes v3 :
  - e-mail + mot de passe, code de vérification, appareils de confiance ;
  - Google ;
  - profil avec photo et pseudo ;
  - page compte, page Stalak Pro, remerciement et slides après l'achat.
- Stalak Pro (Paddle **sandbox**) :
  - fonctions réservées : sans logo, Clip, packs, tailles et apparitions du texte, paroles auto, sauvegarde en ligne ;
  - un ancien Pro perd l'accès à ses projets en ligne.
- Paroles automatiques (Workers AI, Whisper large-v3-turbo) : marchent bien sur de vraies chansons.
- Sauvegarde en ligne (R2 `stalak-media`) : en place, à faire tester par le propriétaire.
- Assistant IA de la bulle d'aide (Workers AI, Gemma 4) : ouvert à tous, 60 questions par jour pour tout le site (`HELP_DAILY_MAX`).
- Connexion TikTok / Instagram côté serveur : en place mais **éteinte** (`SOCIAL_CONNECT_ENABLED = "0"`), en attente des applis TikTok/Meta et des 5 secrets.
- Pages : tarifs, conditions, remboursement, confidentialité, mentions légales (FR/EN), avec des animations glacées.

## En cours
- **Notifs de ventes par Telegram** (branche `compte/notif-telegram`, compte rendu `docs/handoff/compte-notif-telegram.md`, Statut : PRÊT, aucune migration ; maquette https://compte-notif-telegram.stalak-site.pages.dev) : message Telegram à chaque nouvel abonné et message silencieux à chaque annulation ; secret `TELEGRAM_BOT_TOKEN` ; bouton « Relier mon Telegram » (après /start au bot) ; ntfy gardé en option (`NTFY_TOPIC`).
- **Notif ntfy des ventes** (branche `compte/notif-ventes`, compte rendu `docs/handoff/compte-notif-ventes.md`, Statut : PRÊT, aucune migration ; maquette https://compte-notif-ventes.stalak-site.pages.dev) : notification sur le téléphone du propriétaire à chaque nouvel abonné (formule, prix, mensuel/annuel, pays) et à chaque annulation, jamais d'e-mail ni de nom ; secret `NTFY_TOPIC` à saisir ; bouton « Envoyer une notif de test » (Santé du serveur).
- **Nouveau tableau de bord** (branche `compte/tableau-de-bord-v2`, compte rendu `docs/handoff/compte-tableau-de-bord-v2.md`, Statut : PRÊT, **migration 0010**) : 6 onglets (Aujourd'hui, Utilisateurs, Argent, Entonnoir, Messages, Santé du serveur), période 7 j / 30 j / 90 j / tout, chaque chiffre expliqué, carte du monde (comptes et visites par pays, pays Cloudflare seulement), e-mail ou Google, appareils, langues, provenance, retours, désabonnements, limites du jour, chiffres de test marqués TEST. **Pour Juridique** : phrase à ajouter dans la confidentialité (pays et appareil, mesure « déjà venu »). Marche à suivre Paddle réel : `docs/PADDLE_PRODUCTION.md`.
- **E-mails aux couleurs de Stalak** (branche `compte/emails-da`, compte rendu `docs/handoff/compte-emails-da.md`, Statut : PRÊT, aucune migration) : un seul modèle (`functions/_lib/mail-layout.js`) pour les codes, la réponse de « Parler à un humain », l'avertissement de suppression et le rappel annuel, FR et EN : fond bleu, carte blanche à contour encre avec glaçons, logo et mascotte en PNG sur stalak.app (`/icons/mail/`), code en très gros, bouton bleu, pied de page stalak.app + @stalak_app + raison ; tableaux, styles en ligne, mode sombre, version texte. Captures envoyées au propriétaire. À la bascule de l'anglais à la racine : passer `FR_HOME` à `'/fr/'` et `EN_HOME` à `'/'` dans `mail-layout.js`.
- **Entonnoir : 2 étapes de plus** (branche `compte/entonnoir-etapes`, compte rendu `docs/handoff/compte-entonnoir-etapes.md`, Statut : PRÊT, aucune migration) : `/api/event` accepte `pro_offer` (offre Pro après la 1re vidéo) et `ad_shown` (pub vraiment à l'écran) ; tableau de bord : « Offre Pro vue » et « Pubs affichées ». **Pour App** : envoyer `acctEvent('pro_offer')` quand l'offre Pro après la 1re vidéo s'affiche, et `acctEvent('ad_shown')` quand la pub est vraiment à l'écran (événement `rewardedSlotReady`, après `makeRewardedVisible()`).
- **Audit du 30/10, côté Comptes** (branche `compte/audit`, compte rendu `docs/handoff/compte-audit.md`, Statut : PRÊT, **migration 0009**) :
  - signe de vie des visites toutes les 5 min (au lieu de 1) ;
  - e-mails de code : plafond du jour `EMAIL_DAILY_MAX` avec alertes, Turnstile prêt (inscription, mot de passe oublié ; clés à saisir), le « code envoyé » jamais parti corrigé ;
  - compteurs anonymes `/api/event` et ligne « Entonnoir » au tableau de bord (visite → export → pub → formules → paiement), appels posés dans l'export et la pub ;
  - avant les vrais paiements : tests GitHub + commande de build Cloudflare, garde des aperçus (`preview_readonly`) et bloc `[env.preview]` prêt, abonnements de test séparés (`env`), suppression de compte non bloquée par Paddle, copie chiffrée de la base chaque lundi, alertes e-mail (erreurs 5xx, Resend, plafond) ;
  - écran des formules aligné sur la page Tarifs (Annuel par défaut, Pro en premier, −47 %, « 2 takes », « 100 GB », raison visible sur la carte) ;
  - rappel annuel par e-mail aux abonnés mensuels.
- Rien. La précision des paroles auto est en ligne : voix mise en avant, contexte entre les morceaux, import de la voix seule. Seuils à vérifier sur de vraies chansons via les infos techniques (« centre / mix »).
- Rien.
- **Assistant d'aide, réponses vides** (branche `compte/assistant-reponses-vides`, compte rendu `docs/handoff/compte-assistant-reponses-vides.md`, Statut : PRÊT) : réflexion de Gemma 4 coupée, place de réponse 450 → 700 jetons, un deuxième essai si la réponse est vide (compté dans le budget du jour), erreur en 503 au lieu de 502, raison des réponses vides dans les journaux. Aucune migration.

- **Tableau de bord privé + « Parler à un humain »** (**en marche depuis le 27/10 à 23 h 34** : connexion du propriétaire vérifiée ; domaine, secrets et événements Paddle `adjustment.*` en place) :
  - `https://admin.stalak.app/admin/`, réservé à l'e-mail du propriétaire par Cloudflare Access (jeton vérifié aussi par le serveur) : inscrits, Pro mensuels/annuels, revenu, visiteurs en direct, jour par jour, usage des fonctions, messages ;
  - glaçon : « Parler à un humain » (direct si le propriétaire est disponible, sinon e-mail du visiteur et réponse par e-mail) ;
  - migration 0006 appliquée ; reste au propriétaire : 2 secrets (`ACCESS_AUD`, `ADMIN_EMAILS`), domaine personnalisé admin.stalak.app sur Pages, événements Paddle `adjustment.*` (BACKEND.md, étape 13). L'équipe Access est déjà dans `wrangler.toml`.

- **Menu du compte + Galerie** (en ligne le 28/10) : un appui sur le compte en haut à droite ouvre un menu (Galerie, Mon compte, Stalak Pro ou « Gérer mon abonnement », Aide, Se déconnecter) ; la Galerie remplace « Mes projets » : grille avec couverture (image du montage, 300 px, rangée dans R2 avec le projet), nom dessous, appui = ouvrir, appui long ou « … » = renommer / supprimer. Sans Pro : « La sauvegarde en ligne est réservée à Stalak Pro ». Migration 0007 appliquée. À vérifier par le propriétaire sur iPhone : sauvegarder en ligne, puis voir la couverture dans la Galerie.
- **« Parler à un humain » réservé à Stalak Pro** (branche `compte/humain-pro`, compte rendu `docs/handoff/compte-humain-pro.md`, Statut : PRÊT) : création et écriture réservées à Pro côté serveur ; sans Pro, écran « Réservé à Stalak Pro » (page Pro + contact@stalak.app) ; un ex-Pro garde les réponses reçues ; réponse « sous 24 h » par e-mail quand tu n'es pas là ; badge Pro dans le tableau de bord. Textes de vente : `marketing/chat-pro`, à fusionner ensemble. Aucune migration.

- **Sauvegarde automatique + anglais d'abord** (branche `compte/sauvegarde-auto`, compte rendu `docs/handoff/compte-sauvegarde-auto.md`, Statut : PRÊT) :
  - Creator Plus : chaque projet s'enregistre tout seul en ligne (toutes les 4 s si quelque chose a changé ; seulement ce qui a changé ; rien pendant un export) ; indicateur « Enregistré ✓ » en haut ; bouton « Sauvegarder en ligne » supprimé ; Galerie adaptée (« il s'enregistre tout seul ») ;
  - e-mails (codes, support, rappel des 6 mois) et fenêtre de paiement Paddle en anglais par défaut, en français seulement si la page est en français ;
  - aucun concurrent cité dans le guide de l'assistant d'aide (règle ajoutée en FR et EN) ;
  - aucune migration.

- **Offre du 30/10 au soir côté Comptes** (branche `compte/formules`, avec `main` et `app/formules` fusionnées, compte rendu `docs/handoff/compte-formules.md`, Statut : PRÊT) :
  - formules `free` / `pro` / `creator` ; tableau unique (`functions/_lib/entitlements.js`) selon le contrat de l'offre hybride ; sauvegarde en ligne (100 Go) et « Parler à un humain » en Creator Plus seulement ; paroles auto 20 / 60 par jour ;
  - 4 prix en dollars dans `wrangler.toml` ; anciens prix reconnus (euros et Basic → `pro`, Max → `creator`) ;
  - vidéo du jour, compteur et e-mail de rappel supprimés ; page des formules à 3 colonnes en dollars ; tableau de bord par formule (Pro, Creator Plus) ;
  - migration 0008 (`migrations/0008_plans.sql`, 3 colonnes) appliquée le 30/10 au soir.

## Base de données D1
- Migrations appliquées : 0001, 0002, 0003, 0004_lyrics_usage, 0004_cloud_save, 0005_social_accounts (27/10), 0006_admin_support (27/10), 0007_project_covers (28/10), 0008_plans (30/10), 0009_audit (31/10), 0010_dashboard (1/11).
- En attente : aucune.

## À faire, par rôle

### Chef de projet
- **Bascule « anglais à la racine »** (`marketing/en-racine`, PRÊT, relue par un agent indépendant) : la mettre en ligne en même temps que les liens d'e-mails de Comptes (ci-dessous) ; ensuite Search Console : soumettre `sitemap.xml` et `sitemap-old.xml`, demander l'indexation de `/` et `/fr/` ; prévenir le propriétaire pour Bing (document annuaires). `STALAK_CONTEXTE.md` dit encore « FR sur `/`, EN sur `/en/` » pour le build : à corriger.
- Supprimer l'ancien projet Cloudflare « stalak » en double.

### App & montage
- Prêt (branche `app/pied-de-page`, 2/11) : **vrai pied de page, le même sur toutes les pages** (app, Tarifs, pages légales, 6 guides, page Triller), FR et EN. Bande encre pleine largeur avec glaçons, tout en bas (jamais fixe) ; 4 colonnes sur ordinateur (Stalak / Produit / Légal / Tes choix), empilées sur téléphone ; « © 2026 Stalak · Made by 99Sayso ». Une seule source : `src/footer.py` (contenu) + `src/footer.css` (style), utilisés par `build_site.py` et `build.py`. **Marketing : les 6 guides et les comptes officiels (`GUIDES`, `SOCIAL`) sont maintenant dans `src/footer.py`.** Détails : `docs/handoff/app-pied-de-page.md`.
- Prêt (branche `app/liens-cmp`, 1/11) : liens de l'app relus après la bascule. Tout pointait déjà au bon endroit. Le sélecteur FR / EN fait maintenant suivre l'adresse (`/` ↔ `/fr/`, canonique, manifeste), sans recharger. Consentement pour la pub : message RGPD certifié de Google Ad Manager au moment de la première pub ; interrupteur `CMP_ON` à activer une fois le message publié ; « Gérer les cookies » ; « Your Privacy Choices » et GPC ; lien cookies en bas des pages Tarifs et légales. Réglages à faire par le propriétaire dans Ad Manager et points à relire par Juridique dans `docs/handoff/app-liens-cmp.md`.
- **Relire** les liens changés par `marketing/en-racine` dans les fichiers partagés (`src/markup.html` : `/fr/tarifs`, `/fr/conditions`, `/fr/remboursement`, `/fr/confidentialite` ; `I18N_EN` : `/pricing`, `/terms`, `/refunds`, `/privacy`). La langue suit la balise `lang` de la page (rien à changer dans `app.js`). Le bandeau « Version française → » et la langue de l'app installée sont ajoutés par `build_site.py` (site seulement).
- Prêt (branche `app/animations`, 31/10, contient `app/audit-fix`) : tour complet des animations avec le skill `motion-design`. Réglages communs de durées et de courbes dans le CSS. Seulement `transform` et `opacity`, sans rebond ni flou. Les animations sans rôle sont retirées : stalactites qui poussent, tremblements au survol, trois boucles sans fin du bouton Pro, neige du carré d'import, flocons de « Régénérer ». « Réduire les animations » est respecté partout, y compris pour les défilements. 60 images/s sur iPhone émulé avec le processeur ralenti 4 fois. Tableau de chaque animation dans `docs/handoff/app-animations.md`.
- Prêt (branche `app/audit-fix`, 31/10) : Galerie bloquée sur « Je remets ton montage en place… » corrigée. Cause : le projet « Démo glace » est l'exemple, dont le son est fabriqué à chaque ouverture (5 s sur la machine de test, 46 s quand elle est chargée, au-delà des 20 s du test). Le son de l'exemple est maintenant fait en 4 parties en parallèle (1,1 s, même son) et gardé dans l'appareil (instantané ensuite) ; sous la même charge, l'ouverture prend 3 à 7 s. Aussi : un export arrêté parce qu'on a quitté Stalak est compté « hidden » (et non « cancel ») ; `audit_ui.py` et `formules_ui.py` adaptés (`acctEvent`, « takes »). Détail dans `docs/handoff/app-audit-fix.md`. Même branche : l'offre Pro après la 1re vidéo devient une fenêtre au milieu de l'écran (mascotte, 3 avantages, 4,17 $/mois, « Passer à Pro » / « Plus tard », une seule fois) ; Comptes doit ajouter `pro_offer` à `EVENTS`.
- Prêt (branche `app/audit`, audit du 30/10, priorités 1 à 10 du propriétaire ; contient `app/export-pub`) : projet gardé dans le téléphone (« Reprendre ton dernier montage ? »), mémoire des exports et des packs selon l'appareil, écran gardé allumé et page quittée pendant l'export, bouton « Exporter » toujours à portée, « Enregistrer dans Photos / Partager » en premier sur iPhone, offre Pro douce après la 1re vidéo, « Exporter sans ce filtre », légende #madewithstalak, erreurs dans le carré concerné, bulle d'aide, moins d'étiquettes PRO, compteurs anonymes (route `/api/event` à faire par Comptes). Détail dans `docs/handoff/app-audit.md`.
- Test caméra iPhone par le propriétaire (27/10) : son après le décompte OK, sens du selfie OK ; **lecture saccadée** et **export lent**.
- **En ligne depuis le 27/10 (22 h 20)** : prises filmées sur iPhone réparées. Cause : le fichier en morceaux de Safari ne dit pas où commencent les données de chaque piste (cas prévu par la norme) ; la bibliothèque MP4Box les lisait au mauvais endroit, d'où des vidéos abîmées dès le tournage (« Decoder failure » dans l'aperçu, la copie légère, l'analyse et l'export, sur les 10 façons de décoder testées). Le site recalcule maintenant lui-même la place de chaque image et de chaque son (`fragSamples` / `fragFix`). Nouveau test `tests/ui/remux_frag.py`.
- À vérifier après mise en ligne : nouveau test caméra sur iPhone (lecture fluide, vitesse d'export, ligne « échantillons repris au bon endroit » dans les infos techniques).
- À regarder : `tests/ui/lyrics_ui.py` s'arrête au bout de 15 s d'attente, déjà sur `main` avant cette branche.
- À décider ensuite : baisser la qualité d'export (720p) seulement si l'export reste lent une fois le décodage réparé.
- En ligne (27/10, branche `app/son-passage`) : étape Son.
  - Sur ordinateur, on peut glisser le fichier audio sur le carré d'import, qui passe en « givre » avec « Lâche ton fichier ici » pendant le survol. Un fichier lâché à côté n'ouvre plus le fichier à la place du site.
  - Deux poignées sur l'onde, en TikTok/Reels comme en Clip, pour le début et la fin du passage. Elles s'accrochent aux mesures. Au doigt, chaque poignée a une zone tactile de 44 px.
  - Le menu Durée affiche les longueurs choisies avec les poignées (« 7 mesures »), et les boutons « Fin ‹ › » marchent aussi en TikTok/Reels.
  - Nouveau bouton « ▶ Écouter le passage » : il joue la partie choisie et s'arrête à sa fin.
  - Nouveau test `tests/ui/son_passage.py`.
- À regarder (non corrigé) : sur téléphone, la bulle d'aide fixée en bas à droite peut couvrir la poignée de fin quand l'onde est tout en bas de l'écran.
- En ligne (27/10, branche `app/copie-legere-export`) : croix ✕ pour supprimer une ligne de paroles. Elle est dans la liste des lignes calées, à l'étape « Paroles », la seule où les lignes sont listées. Le message propose « Annuler ». Sur téléphone, le texte de la ligne passe sous les boutons. Test `tests/ui/paroles_suppr.py`.
- Confirmé sur iPhone par le journal du 27/10 à 23 h : prises filmées lisibles, copie légère 360×640 faite en 3 s, son des prises lu (calage automatique), lecture sans image lente, export de 25 s en 7,7 s par WebCodecs (aucun repli sur le lecteur vidéo).
- En cours : « un peu de lag » dans la vidéo exportée, signalé par le propriétaire. La cause n'est pas visible dans le journal. Vidéo exportée et précisions demandées au propriétaire : saccade continue, à chaque coupe, ou lèvres en retard.

- Prêt (dans `app/formules`) : 26 filtres vidéo validés par le propriétaire le 30/10, plus « Aucun » : 4 thèmes, dont « Couleurs », avec 13 retouches façon stories Instagram sous des noms Stalak. Gratuits : Givre, Film 35 mm, Noir & blanc.

- Prêt (branche `app/formules`) : offre hybride du 30/10 au soir dans l'app. Pro / Creator Plus (`can(feat)`), filigrane qui bouge sur les vidéos gratuites (« Clipped with stalak.app »), pub récompensée Google (unité de test) qui l'enlève pour une vidéo. Plus d'écran du jour ni de fin Stalak ; le gratuit exporte sans compte. Détail et suites pour Comptes et Juridique dans `docs/handoff/app-formules.md`.

- Prêt (branche `app/export-pub`, demandes du 30/10 à 21 h) : deux boutons côte à côte en Gratuit, « Exporter » (avec filigrane) et « Regarder une pub (30 s) » (bleu, givré ; à la fin de la pub l'export sans filigrane part tout seul) ; bug d'export (la vidéo précédente est coupée et libérée avant un nouvel export, elle revient si on annule) ; poignées du passage libres (sans aimant) et curseur rouge déplaçable au doigt ; filigrane = logo seul, petit, qui saute d'un coin à l'autre toutes les 5 s ; cadenas et CREATOR+ visibles sur « Générer le pack » ; packs dès 2 playbacks avec le conseil « plus tu as de prises, plus les vidéos sont variées » ; plus aucun concurrent cité dans l'app. Détail dans `docs/handoff/app-export-pub.md`.

### Comptes, paiements & serveur
- **Bascule « anglais à la racine »** (avec `marketing/en-racine`) : `functions/_lib/cloud.js` l. 433 → `https://stalak.app/fr/#compte`, l. 439 → `https://stalak.app/#compte` ; `functions/_lib/reminders.js` l. 19 → `${site}/fr/#compte` (fr) et `${site}/#account` (en) ; `oauth.js` l. 175 : langue par défaut `ret.startsWith('/fr') ? 'fr' : 'en'` ; commentaires `/en/` de `oauth.js`, `social.js` et `reminders.js` l. 1 (`site_src/terms.html`).
- Audit du 30/10 : fait sur `compte/audit` (voir « En cours »). Reste au propriétaire (BACKEND.md 3.1, 7.1, 15) : Workers Paid + alertes Cloudflare, forfait Resend et `EMAIL_DAILY_MAX`, clés Turnstile, commande de build `node tests/backend/run.mjs` (+ `NODE_VERSION` = 22), 3 secrets GitHub pour la copie, base `stalak-preview`, redéployer le Worker `cloud-cleanup`.
  - Pour App : `acctEvent('export_start' | 'export_ok' | 'export_fail', {cat})`, `acctEvent('ad_offer' | 'ad_ok')` sont posés (une ligne chacun dans `beginExport`, `exportOne`, `exportPackRun`, `adWatch`, `adReward`) : à garder en modifiant ces fonctions. Le texte `pack.need3` (« au moins 3 playbacks ») reste à App avec le passage à 2.
  - Pour Juridique : la politique de confidentialité doit citer les compteurs anonymes de l'entonnoir et Cloudflare Turnstile.
  - Reste de l'audit pour Comptes (non demandé ici) : corps sans taille lus en entier (n° 12), CSP / HSTS (n° 11), plafond global des paroles auto (n° 14).
- Sauvegarde automatique, anglais d'abord, guide sans concurrent : fait sur `compte/sauvegarde-auto` (voir « En cours »).
  - Pour App : les lignes du guide d'aide sur les packs (« au moins 3 playbacks ») et le filigrane sont à changer quand les packs dès 2 playbacks et le filigrane logo seul seront livrés (`functions/_lib/help-guide.js`, FR et EN).
- Offre du 30/10 au soir (`compte/formules`) : fait (voir « En cours »). Au Chef de projet : migration 0008 ; plus besoin de redéployer le Worker (aucun horaire ajouté).
  - Contrat livré : `acctHas(feat)` (`nowm`, `clip`, `fx`, `text`, `filters`, `lyrics` → Pro ; `pack5`, `pack10`, `pack30`, `cloud`, `human` → Creator Plus ; anciens noms `nologo` → Pro, `unlimited` → tous), `acctOpen(why, {plan})` avec `pro` ou `creator` (`basic` / `max` acceptés et convertis). `acctQuota` / `acctUseVideo` supprimées.
  - Pour App : `FEAT_PLAN`, étiquettes BASIC/MAX, fin de 3 s (`outroOn` lit encore `nologo`) et `tests/ui/formules_ui.py` sont encore sur l'offre Basic / Pro / Max : à passer à Pro / Creator Plus.
  - Règles de Juridique gardées : montée immédiate au prorata avec le montant affiché avant ; descente au renouvellement sans remboursement ; annuel → mensuel refusé avec une explication (limite Paddle) ; remboursement d'un changement à la main.
  - Pour Marketing : textes de la page des formules dans l'app (clés `pl.*`, `pr.promo`) à relire.
- Paddle en réel une fois la structure créée : nouveaux produits, prix, clés et webhook, puis `PADDLE_ENV=production`.
- Microsoft (création du compte bloquée, à retenter) et Apple (programme développeur à 99 $/an).
- Ménage quotidien automatique des projets (Worker `workers/cloud-cleanup`, à déployer avec wrangler depuis un ordinateur). Pour l'instant, le ménage se fait quand quelqu'un ouvre la Galerie.
- Assistant IA de la bulle d'aide : fait (branche `compte/assistant-aide`). Après la mise en ligne : poser quelques vraies questions pour juger les réponses ; ajuster `HELP_DAILY_MAX` si besoin.
- Assistant d'aide, réponses vides (1 sur 3 en ligne) : corrigé sur `compte/assistant-reponses-vides`. Après la mise en ligne : poser une dizaine de questions et regarder les journaux Cloudflare (lignes `[stalak] help ai empty`, qui donnent la raison sans le texte).
- Assistant d'aide : la correction des réponses vides est en ligne depuis le 27/10. Test en ligne : 8 questions sur 8 ont reçu une réponse, en 1,5 à 5 s, justes en FR et en EN.
  - « What is Clip mode? » en anglais : corrigé sur `compte/tableau-de-bord` (le guide anglais dit « also called Clip mode »).
- **Tableau de bord privé : la protection est prête (27/10).** Cloudflare Zero Trust Free est activé (équipe `small-band-a6ef`, donc `small-band-a6ef.cloudflareaccess.com`). L'application Access « admin » protège `admin.stalak.app` : seul le propriétaire peut l'ouvrir, avec un code reçu par e-mail. Le tableau de bord est branché sur ce nom par `compte/tableau-de-bord` (ligne suivante). Côté serveur, les routes d'administration doivent vérifier l'en-tête `Cf-Access-Jwt-Assertion` (clés publiques de l'équipe + « AUD » de l'application « admin », visible dans Zero Trust → Access controls → Applications → admin). Ne jamais s'en remettre au seul fait d'être sur ce nom de domaine.
- Tableau de bord + « Parler à un humain » : fait sur `compte/tableau-de-bord` (le jeton Access est vérifié par le serveur : hôte, signature des clés de l'équipe, AUD, e-mail). Reste : 2 secrets, domaine personnalisé, événements Paddle `adjustment.*` (BACKEND.md, étape 13).
- Si des faux messages arrivent : Cloudflare Turnstile sur « Parler à un humain ».
- Tableau de bord et « Parler à un humain » : fusionnés et en ligne le 27/10, migration 0006 appliquée. Le tableau de bord est en marche (connexion du propriétaire vérifiée le 27/10). Les chiffres Pro et revenu viennent pour l'instant des abonnements de test Paddle (sandbox).
  - Réglé (Comptes, `compte/formules`) : `tests/ui/support_ui.py` s'arrêtait à « reply e-mailed to the visitor who left ». Cause : un visiteur parti juste avant la réponse recevait l'e-mail après ≈ 30 s (attente de 20 s + passage du tableau de bord toutes les 10 s), au-delà des 50 s du test sur une machine lente. L'attente passe à 12 s (≈ 20 s au total) et le test laisse 90 s.
- Galerie : les projets sauvegardés avant cette version n'ont pas de couverture (carré de couleur avec un numéro) ; ils en reçoivent une à la prochaine sauvegarde.
- Plus tard : saler l'empreinte des IP des compteurs (paroles, aide, visites, messages) avec `AUTH_SECRET`.
- Plus de 210 minutes de transcription par jour : passer au forfait Workers payant (5 $/mois).

### Réseaux sociaux
- **Fait et en ligne (éteint)** : connexion des comptes TikTok et Instagram côté serveur.
  - `functions/_lib/social.js` : relier / délier un compte, jetons chiffrés en base, renouvellement automatique, appels de suppression de Meta.
  - Migration `0005_social_accounts.sql` appliquée le 27/10.
  - 7 nouveaux tests serveur (55/55 passent). Revue sécurité : `docs/appsec-review-social-connect.md`.
  - La fonction reste éteinte (`SOCIAL_CONNECT_ENABLED = "0"`).
  - Compte rendu : `docs/handoff/social-connexion-comptes.md` (Statut : PRÊT).
- **Au propriétaire** : créer les applis TikTok et Meta en suivant `docs/SOCIAL_SETUP.md`, puis saisir 5 secrets dans Cloudflare (`TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `SOCIAL_TOKEN_KEY`).
- Reste à faire : boutons « Relier TikTok / Instagram » et écran « Publier » dans l'app, envoi de la vidéo (adresse temporaire sur R2), page de confidentialité à compléter (TikTok / Instagram), dossiers de validation, vidéo de démo.
- À décider : la publication directe est-elle réservée à Stalak Pro ou ouverte à tous ? Meta risque de demander une vérification d'entreprise (lien avec la LLC).

### Marketing & croissance
- **Prêt (branche `marketing/promo-youtube`, 2/11, outil de travail)** : page « Salle de visionnage » demandée par le propriétaire le 2/11 à 16 h 43 (artifact privé, à lui). Il y fait ses remarques sur nos vidéos à l'image près, sur une timeline, et entoure au crayon sur l'image. Depuis la v2 de la page (ses demandes de 17 h 04 et 17 h 06), il peut aussi faire une remarque sur toute la vidéo. Quand il a fini, il écrit « c'est bon » dans la conversation qui lui a envoyé la vidéo (la page ne crée plus de nouvelle conversation). Claude lit alors la base de la page et ne reprend que ces points. **Toutes les conversations qui lui envoient une vidéo l'y ajoutent** (`promo/retours/README.md`). Rien à intégrer dans l'app ni le site.
- **Prêt (branche `marketing/promo-youtube`, 2/11, film de lancement)** : film de lancement de Stalak « façon Lovio » (YouTube 16:9, 60 s, pas de Short), demandé par le propriétaire le 2/11 à 14 h 41 avec la vidéo de lancement de Lovio : sa structure plan par plan (étincelle, logo-fenêtre, interface en verre, appareils, import, grille et flashs, « ready to post », pilules, « in any direction », carrousel entre accolades, panneau tapé, logo), aux couleurs et dans les mondes de Stalak, avec les vraies cartes de l'app, ses prises et son clip, sa phrase calée sur sa voix, la voix Achird et **la musique qu'il a choisie** (Lyria 3.5) coupée sur ses mesures ; chaque clic tombe sur le mot de la voix qui le nomme. Flora : 0,21 $ en tout (accord du propriétaire à 14 h 51). **v2 (ses retours de 17 h 03 et 17 h 06 dans la Salle de visionnage)** :
  - plus de gros plan sur son visage ;
  - le bouton flottant « Export » de l'app ne passe plus sur le texte des captures ;
  - le socle des ordinateurs fait la largeur de l'écran ;
  - toutes les coupes sèches sont devenues des transitions qui se fondent dans le décor.
  
  **v3 (ses retours de 19 h 13)** :
  - la musique devient l'instru de son « neva die » (celle des vidéos d'avant), avec son drop sur « Meet Stalak » ;
  - 60 images par seconde, et plus de zooms lents ;
  - des cristaux de neige, des flocons et des stalactites de Stalak ;
  - le « g » coupé est réparé.
  
  **v4 (sa remarque de 20 h 28)** : le mot « drop » n'arrive plus trop tôt sur le panneau tapé.
  
  **v6 (5/11, planche contact, règle 10)** : la v5 relue image par image (121 images) ; 12 problèmes corrigés (textes coupés au bord de l'image, mots cachés par la fenêtre de son clip, étiquettes trop courtes) ; planche du fichier final : 0 problème restant.
  
  **v5 (ses retours du 3/11 à 0 h 30)** :
  - sa vidéo ne déborde plus du cadre de l'aperçu de l'app (téléphone, tablette, étapes de montage) ;
  - toutes les transitions simples (panoramiques, glissés, coupes) sont refaites avec un élément à l'écran, comme dans la vidéo de référence : l'ordinateur qui devient le téléphone puis la tablette, sa carte qui devient la pastille « Take 2 », la barre de montage dont les plans deviennent les cases, les cartes qui s'emboîtent jusqu'à l'ordinateur 3D, la caméra qui entre dans l'écran jusqu'au bouton Export, la carte YouTube qui devient le panneau de verre.
  
  **À vérifier par le propriétaire avant de publier : la licence de l'instru pour YouTube.** Vidéo envoyée au propriétaire (pas dans le dépôt). Sources : `promo/launch/`. Rien à intégrer dans l'app ni le site. Détail : `docs/handoff/marketing-promo-youtube.md`.
- **Prêt (branche `marketing/promo-youtube`, 2/11, v4 + miniature)** : vidéo YouTube de présentation « The edit nobody sees » (16:9, 63 s, voix off Achird en anglais) et son Short (9:16, 31 s), avec sous-titres en motion design, demandées par le propriétaire le 2/11 (il a choisi l'histoire A parmi 3, et la voix ; 0,013 $ dans Flora). D'abord le problème, sur un tapis de découpe en 3D : ses vraies prises en pellicules, découpées en morceaux, qui ne tombent jamais en face du son, une coupe à côté du temps, la bouche décalée d'une image, une nouvelle pile chaque jour. Sur le drop, le tapis s'ouvre sur le ciel de Stalak : la vraie interface (Pick your song, Add your takes, prises calées sur la musique, barre coupée sur les temps, paroles calées en tapant, rythme Chill / Punchy, export TikTok / Reels / Shorts et clip YouTube avec Pro, pack de 30 vidéos avec Creator Plus), puis trois vidéos du pack sur sa chanson, « You film. Stalak edits. » et stalak.app. Les silences de la voix sont raccourcis (sa demande du 2/11). **v3 (ses remarques de 2 h 28)** : sous-titres animés dans le décor (ruban adhésif sur le tapis, mots cernés et pastilles dans le ciel, autre typo sur les mots importants), « OFF BEAT » tenu environ 1,4 s, logo du drop corrigé (stalactites collées sous l'icône, plus d'image parasite), plus aucun rebond ni secousse après le drop, son vrai clip dans l'écran « format clip ». **v4 (sa remarque de 3 h 52)** : les 3 vidéos du résultat sont synchro : elles jouent le son de ses prises (une autre version de « neva die », même beat, autre voix : ses lèvres suivent celle-là), sur un passage où on voit son visage, avec sa phrase traduite à l'écran (« I put gold on my wounds, scars worth millions. ») ; pareil à la fin du Short. Vidéos envoyées au propriétaire (pas dans le dépôt). Sources : `promo/youtube/` (le film) et `promo/youtube/short/` (le Short, même moteur en portrait). Rien à intégrer dans l'app ni le site. **À vérifier par le propriétaire avant de publier : la licence de l'instru de « neva die » pour YouTube.** **Miniature YouTube** (sa demande de 13 h 48 ; à 14 h 14, il a demandé le style « lancement de produit » de 3 exemples : Apple, Google, Lovio) : 3 versions envoyées au propriétaire, hors du dépôt. La conseillée : « on beat. » en très grand sur la vraie carte « Your edit » du film. Les deux autres : le logo sur un éventail de ses clips, et le bouton « ↻ Shuffle » en verre. Sources dans `promo/youtube/thumbnail/` ; titre conseillé : « Introducing Stalak: the edit nobody sees ». Détail : `docs/handoff/marketing-promo-youtube.md`.
- **Prêt (branche `marketing/annuaires`, 1/11, documents seulement)** : décisions du propriétaire du 1/11 (22 h 40) appliquées au plan des annuaires (`docs/marketing/ANNUAIRES.md` et document claude.ai « Stalak — annuaires d'outils et Bing ») : Stalak présenté comme « alternative à Triller » sur AlternativeTo et SaaSHub (champ des alternatives : Triller seulement, plus une phrase neutre en fin de description) ; Twelve Tools et Fazier retirés (ils exigent un lien vers eux en bas de stalak.app) ; tableau renuméroté (16 sites) ; Bing : la bascule est en ligne, le propriétaire peut le faire maintenant ; Google noté comme fait (Search Console, 1/11). Ensuite : Marketing aide le propriétaire à remplir les annuaires un par un, à sa demande. Pour Comptes (affichage des visites par `ref`) : ajouter `seo-triller` aux valeurs prévues (bouton de la page Triller). Détail : `docs/handoff/marketing-annuaires.md`.
- **En ligne depuis le 1/11, 22 h 30 (branche `marketing/en-racine`, fusionnée) — décisions du 31/10, 20 h 15 (référencement)** :
  - **L'anglais à l'adresse principale, le français dans `/fr/`** (plan `docs/marketing/US_FIRST.md` partie A) : accueil anglais sur `/`, français sur `/fr/` ; `/pricing`, `/terms`, `/refunds`, `/privacy`, `/legal-notice` et `/fr/tarifs`, `/fr/conditions`… ; `hreflang` (fr → `/fr/`, en et x-default → `/`) ; **redirections 301 directes** de chaque ancienne adresse (`/en/…`, `/tarifs`…, anciennes pages Triller) dans `site_src/_redirects` ; un manifest par langue (`/manifest.webmanifest` anglais, `/fr/manifest.webmanifest` français) ; bandeau « Version française → » sur l'accueil anglais pour un téléphone en français (fermable, choix retenu, sans redirection automatique, sans décalage de la page) ; les apps déjà installées gardent le français sur un téléphone en français ; liens Tarifs / Conditions / Remboursement / Confidentialité de l'app mis à jour (fichiers partagés, minimum : `src/markup.html`, `I18N_EN` de `src/app.js`) ; chemins des tests `tests/ui/` mis à jour.
  - Textes corrigés partout (accueil anglais, `llms.txt`, guides, page Triller, annuaires) : les coupes suivent la musique phrase par phrase, « On the words » coupe au début des lignes et sur les rimes, « Every bar » à chaque mesure (plus de « every beat, every word »).
  - **Les 6 guides anglais publiés** (`/lip-sync-video-editor`, `/music-video-maker-for-rappers`, `/rap-snippet-video`, `/lip-sync-videos-for-singers`, `/how-to-make-a-lip-sync-video`, `/edit-video-to-the-beat`), liés depuis le pied de page de l'accueil anglais.
  - **Page comparative Triller (option B)** : `/triller-alternative` et `/fr/alternative-triller`, neutre, datée, sourcée (Triller Group, juin 2026 : ancienne appli arrêtée), Triller seulement ; liée depuis aucune autre page (plan du site seulement).
  - Plan du site : 16 adresses (sans les pages « noindex » confidentialité et mentions légales), `lastmod` = vraie date de modification ; `sitemap-old.xml` (anciennes adresses) à soumettre après la bascule puis retirer après ~6 semaines.
  - **Annuaires et Bing** : document « Stalak — annuaires d'outils et Bing » (https://claude.ai/artifact/EbcSbWg4zfAhNLrN6XWDn9) et `docs/marketing/ANNUAIRES.md` : 18 sites vérifiés le 1/11 dans l'ordre, textes anglais prêts, étapes Bing ; logo carré et 5 captures dans `docs/marketing/annuaires/`.
  - **Mise en ligne coordonnée** avec Comptes (liens des e-mails, voir « Comptes » plus bas) ; rien ne casse si Marketing part seul (301), mais les e-mails français mèneraient à l'accueil anglais. Détail : `docs/handoff/marketing-en-racine.md`.
- **Prêt (branche `marketing/promo-machine`, 1/11)** : promo v8 « The Snippet Machine », demandée par le propriétaire (motion design en 3D isométrique, « pour montrer tes capacités », uniquement avec HyperFrames, script original ; il a choisi la 1re de 3 idées). Une île de glace où une machine en réaction en chaîne monte son snippet sur son beat (dominos, bobines des prises, lame qui coupe sur le drop, arche de synchro, tampon des paroles, canon à neige, chrono sur l'écran du téléphone), puis la caméra plonge dans le téléphone (son vrai snippet, sa chanson) et recule : l'île était l'icône Stalak en 3D, qui devient le logo. Film de 29 s en anglais, sans voix, tout dessiné en code (`promo/machine/assets/engine.js`), envoyé au propriétaire (pas de média dans le dépôt). Sources dans `promo/machine/` (`STORYLINES.md`, `SPEC.md`, `REVIEW.md`, `MEDIA.md`, `build.py`). Rien à intégrer dans l'app ni le site. La branche part de `marketing/promo-lesson` (elle la contient). Détail dans `docs/handoff/marketing-promo-machine.md`.
- **Prêt (branche `marketing/promo-lesson`, 1/11)** : promo v7 « Your snippet is the problem », demandée par le propriétaire sur le modèle d'une vidéo qu'il a envoyée (une explication de 28 s) ; script proposé puis validé. Une voix calme dont les mots s'écrivent à l'écran, sur des cartes blanches aux couleurs de Stalak : le snippet de tout le monde (une prise, pas de coupe, pas de paroles : personne ne le rejoue), ce que font les snippets qu'on rejoue (coupés sur le temps, plusieurs prises, les paroles à l'écran ; le drop du beat sur « differently »), puis la vraie carte de montage de Stalak, son vrai snippet avec sa chanson, « Post it everywhere » et le logo. Film de 30,6 s en anglais, envoyé au propriétaire (pas de média dans le dépôt). Sources dans `promo/lesson/` (`SPEC.md`, `REVIEW.md`, `MEDIA.md`, `build.py`, `assets/engine.js`, `compositions/film.html`). Rien à intégrer dans l'app ni le site. La branche part de `marketing/promo-wyr` (elle la contient). Détail dans `docs/handoff/marketing-promo-lesson.md`.
- **Prêt (branche `marketing/promo-wyr`, 1/11)** : promo v6 « Would you rather », l'idée du propriétaire : la vidéo commence comme un jeu « Tu préfères » de TikTok (2 questions avec de vrais pourcentages de votes et un chrono de 3 s), la 3e (« an hour editing your snippet, or 3 minutes with Stalak? ») explose en neige sur le drop du beat, le cercle « OR » devient l'icône de Stalak, puis la démo de la v5 « One take ». Film de 45 s en anglais, envoyé au propriétaire (pas de média dans le dépôt). Sources dans `promo/wyr/` (`SPEC.md`, `REVIEW.md`, `MEDIA.md`, `build.py`, `assets/engine.js`, `compositions/film.html`). Rien à intégrer dans l'app ni le site. La branche part de `marketing/promo-one-shape` (elle la contient). Détail dans `docs/handoff/marketing-promo-wyr.md`.
- **Prêt (branche `marketing/promo-one-shape`, 1/11)** : promo v5 « One take » (une seule forme 3D qui devient chaque étape de la vraie app), repartie de zéro à la demande du propriétaire, sur le modèle d'une vidéo qu'il a choisie (@twoclipping). Il a choisi l'idée A : HyperFrames, voix off, 3D, beaucoup de mouvement, aux couleurs de Stalak. Version 2 après une relecture indépendante, version 3 avec les 6 retours du propriétaire (1/11 après-midi). Film de 25,2 s envoyé au propriétaire (pas de média dans le dépôt). Sources dans `promo/one-shape/` (`SPEC.md`, `REVIEW.md`, `build.py`, `assets/engine.js`, `compositions/film.html`). Rien à intégrer dans l'app ni le site. Détail dans `docs/handoff/marketing-promo-one-shape.md`.
  - Les promos v3 « Unfreeze your snippet » (`marketing/promo-unfreeze`) et v4 « Before midnight » (`marketing/promo-trailer`) ont été refusées par le propriétaire : **ne pas les intégrer** (comptes rendus marqués ABANDONNÉ sur leurs branches).
- **Fait (branche `marketing/promo-explainer`, 31/10)** : vidéo explicative « Stalak, comment ça marche » (40,75 s, 9:16, anglais américain), faite avec HyperFrames et le kit saas-motion-video. C'est la version 2 de la promo, refaite à la demande du propriétaire. Détail dans `docs/handoff/marketing-promo-explainer.md`.
  - Version finale après ses retours : tout est dans la zone sûre de TikTok, Reels et Shorts, « Synced to the song » est lisible, les paroles sont en anglais américain et le moment polices / couleurs / filtres est plus clair (voix off d'origine).
  - Contenu : à qui sert l'app, iPhone puis Mac, son, prises (filmer ou importer), synchro, coupes sur le rythme, paroles (à la main ou automatiques avec Pro), polices, couleurs, filtres, Shuffle, export avec l'igloo, packs de 30 vidéos (Creator Plus), sans téléchargement ni inscription, publication partout.
  - Images : vraies captures et interface reconstruite d'après l'app, 3D, fond de glace animé. Voix off : Flora, voix Achird. Musique : l'instru de « neva die ».
  - La vidéo et la voix off ont été envoyées au propriétaire et ne sont pas dans le dépôt. Rien à mettre en ligne sur le site.
  - Cette branche contient aussi `marketing/promo-ice-the-beat` (la version 1).
- **Fait (branche `marketing/promo-ice-the-beat`, 31/10)** : vidéo promo « Ice the Beat » (25 s, 9:16, anglais américain), faite avec HyperFrames. Détail dans `docs/handoff/marketing-promo-ice-the-beat.md`.
  - Contenu : vraies prises de 99Sayso, vraies captures de l'app et vrai montage de Stalak ; 3D, zooms et illustrations de glace.
  - Voix off : Flora (Google Gemini TTS). Textes : « No editing skills » à la place de « Zero editing » ; @stalak_app sur la carte de fin.
  - La vidéo et la voix off ont été envoyées directement au propriétaire et ne sont pas dans le dépôt. Le projet est dans `promo/ice-the-beat/` (médias à remettre : `MEDIA.md`).
  - Rien à mettre en ligne sur le site.
- **Fait (branche `marketing/audit-us`, 30/10, 23 h)** : les priorités Marketing de l'audit du 30/10. Détail dans `docs/handoff/marketing-audit-us.md`.
  - Données structurées de l'accueil en USD, avec Free, Pro et Creator Plus. `x-default` ajouté sur Tarifs et dans le plan du site.
  - Anglais de l'app :
    - « takes » au lieu de « playbacks » ;
    - drapeau américain dans le choix de langue ;
    - plus de messages en « je » sans qu'on sache qui parle (« Stalak stopped it… », « send it to the Stalak team »).
  - Premier écran (étape Son) :
    - une phrase qui dit ce que fait Stalak ;
    - « Pas besoin de compte » et « En gratuit, tes vidéos ne quittent pas ton appareil » ;
    - une vidéo finie en boucle, qui n'apparaît que si `site_src/demo/hero.mp4` existe ;
    - « Essayer avec un exemple » devient un vrai bouton ;
    - sur l'écran de connexion, « You don't need an account to make videos ».
  - `?ref=` : l'app le lit, le retire de l'adresse, le garde pour l'onglet (`sessionStorage` « stalak:ref ») et l'envoie dans `/api/presence`. Sans `ref`, elle note le site d'où vient la visite.
  - 6 pages anglaises par cas d'usage, **en brouillon** dans `site_drafts/` (non publiées).
  - Plan US mis à jour (`docs/marketing/US_FIRST.md` et document claude.ai) : lien TikTok à 1 000 abonnés, Reddit 90/10, beatmakers « type beats », tutos YouTube longs.
- **Pour Comptes (compteur des `ref`)** :
  - `/api/presence` reçoit maintenant `ref` (1 à 24 caractères `a-z 0-9 _ -`, en minuscules), ou rien.
  - À faire :
    1. l'enregistrer à la première ligne de la visite (migration : colonne `ref` dans `visits`) ;
    2. afficher les visites par jour et par `ref` dans le tableau de bord ;
    3. au paiement, passer `sessionStorage.getItem('stalak:ref')` dans le `customData` Paddle, puis compter les achats par `ref` ;
    4. si possible, compter aussi les exports par `ref`.
  - Valeurs prévues : tiktok, ig, yt, x, reddit, discord, beat, seo, seo-triller (page `/triller-alternative`, 1/11), wm, google, bing, other.
- **Pour App** :
  - les packs passent à 2 prises : les textes `pack.need3`, `acct.why.pack` et `pl.f.packs` disent encore « 3 takes », comme le code (`readyTakes().length < 3`), à changer en même temps ;
  - vérifier la place de la phrase d'accueil (`#heroPitch`) et le bouton « Essayer avec un exemple ».
- **Pour Juridique** : la politique de confidentialité peut mentionner que la visite garde, pour l'onglet seulement, le réseau d'où elle vient (aucune donnée sur la personne).
- **À faire par le propriétaire** : filmer une vraie vidéo finie et la déposer dans `site_src/demo/hero.mp4` (5 à 8 s, 9:16, sans son), et une version de 20 à 30 s dans `site_src/demo/exemple.mp4`.
- **Fait (branche `marketing/audit-site`)** : audit SEO et textes de l'accueil et des Tarifs, FR/EN. Détail dans `docs/marketing/AUDIT_SITE.md`. Descriptions raccourcies, aperçus de partage sur Tarifs, limites Pro affichées, FAQ « données envoyées » corrigée (paroles auto), karaoké marqué Pro, section « comment faire un playback » sur l'accueil.
- **Fait** : plan de lancement en 4 phases, calcul de l'objectif, idées de vidéos, calendrier réseaux 2 → 29 nov. avec légendes FR/EN, messages testeurs et e-mail Pro (document « Stalak — plan de lancement et réseaux » dans claude.ai).
- **Fait et en ligne** : logo 120 × 120 sur l'écran de connexion Google. Envoyé dans Google Cloud → Stalak → Branding par le Chef de projet le 27/10 ; marque vérifiée et publiée par Google.
- **À décider** : boutons Pro de la page Tarifs pendant que Paddle est en sandbox (« bientôt » ou Paddle réel) avant toute promo.
- **À demander** : case « recevoir les nouveautés » à l'inscription (Comptes) ; mots « montage de playback » dans le H1 et JS/CSS en fichiers cachés (App).
- **Fait (branche `marketing/idees-croissance`)** : recherche « idées de croissance » (concurrents, fonctions, Stalak Pro, acquisition), classée par impact et effort. Document « Stalak — idées de croissance » dans claude.ai ; résumé dans `docs/marketing/IDEES_CROISSANCE.md`.
- **Fait (branche `marketing/seo`, 30/10)** : référencement du nom « Stalak » et de la niche. Détail dans `docs/marketing/SEO.md` ; plan complet dans le document claude.ai « Stalak — passer premier sur Google ».
  - Fiche de la marque pour Google (Organization : logo, e-mail, noms) ; liste `SOCIAL` dans `build_site.py` pour les comptes officiels (déclarés en `sameAs` et en liens `rel="me"` dans le pied de page) — **vide pour l'instant, en attente des adresses du propriétaire**.
  - `llms.txt` pour les IA de recherche ; plan du site passé de 4 à 14 pages (pages légales + comparatif).
  - Nouvelles pages **`/alternative-triller`** et **`/en/triller-alternative`** : comparatif sourcé et daté Stalak / Triller / CapCut / camrip, FAQ, données structurées Article + FAQ + fil d'Ariane, liens depuis le pied de page de l'accueil. Vidéo d'exemple affichée seulement si `site_src/demo/exemple.mp4` existe.
  - **Correction (touche `src/app.js`, à relire par App)** : sur stalak.app, la page française passait en anglais selon la langue du navigateur, donc Google la lisait en anglais (titre anglais sur la recherche « stalak » en France). Elle reste maintenant en français ; l'anglais reste disponible par le bouton FR / EN et `/en/`. La version claude.ai n'est pas touchée.
- **Au propriétaire** : adresses des comptes Instagram / TikTok / YouTube de Stalak ; une vraie vidéo montée avec Stalak ; vérifier dans Search Console (compte propriétaire) que `sitemap.xml` est envoyé et demander l'indexation ; Bing Webmaster Tools ; inscriptions aux annuaires (liste et textes dans le document).
- **Suivant (Marketing)** : pages « faire un playback » (FR), « cut multiple takes to the beat » (EN/FR), « lip-sync videos for musicians » (EN), « paroles sur une vidéo TikTok » (FR/EN).
- **À regarder (App)** : proposer aux visiteurs dont le navigateur est en anglais un petit lien « English version » sur la page française, plutôt que de changer la langue tout seul.
- **Fait (branche `marketing/us-first`, 30/10, 21 h)** : aucun concurrent cité sur le site, et les textes anglais réécrits en anglais américain. Détail dans `docs/handoff/marketing-us-first.md`.
  - Pages « Alternative à Triller » FR/EN supprimées, avec une redirection 301 vers l'accueil (`site_src/_redirects`). Elles sont aussi retirées du plan du site, du pied de page et de `build_site.py`.
  - Triller retiré de l'accueil, de `llms.txt` et du guide du glaçon d'aide (`functions/_lib/help-guide.js` et `HELP_GUIDE` dans `src/app.js` : 2 mots chacun).
  - Textes anglais réécrits : accueil, page Pricing, `llms.txt`. Dans l'app, 8 textes passent à l'orthographe américaine (canceled, analyzed).
  - Page Tarifs mise à jour : filigrane = petit logo qui change de place, packs dès 2 prises, sauvegarde en ligne automatique.
  - Plan « États-Unis d'abord » : `docs/marketing/US_FIRST.md` et document claude.ai « Stalak — États-Unis d'abord ». Il remplace `PLAN_TRILLER.md`.
- **À décider (propriétaire)** :
  - passer l'anglais à l'adresse principale et le français dans `/fr/` : proposition et risques dans `US_FIRST.md`, partie A ; rien n'est appliqué ;
  - citer ou non des concurrents dans ses propres posts sur les réseaux.
- **Si l'anglais passe à la racine** : à faire en une seule mise en ligne, avec App (langue choisie d'après l'adresse) et Comptes (`oauth.js`, `email.js` et `social.js` prennent le français par défaut).
- **Fait (branche `marketing/tarifs-formules`, 30/10 au soir)** : l'offre hybride affichée partout, en dollars. Remplace la version Basic / Pro / Max de la même branche. Détail dans `docs/handoff/marketing-tarifs-formules.md`.
  - Page Tarifs FR/EN et écran des formules de l'app (`#apPro`) : 3 colonnes Gratuit / Stalak Pro (7,99 $ ou 49,99 $) / Creator Plus (14,99 $ ou 99,99 $), générées d'une seule source.
  - Bouton Mensuel / Annuel, **annuel coché par défaut**, avec le badge « Meilleur prix » (pas de « le plus populaire »). Pro est mise en avant avec le ruban « Ni pub ni filigrane ».
  - Tableau comparatif et FAQ refaits : gratuit sans compte, filigrane, pub de 30 s, prix en dollars et taxes par pays, compte nécessaire seulement pour s'abonner, sauvegarde en ligne dans Creator Plus.
  - Page « Alternative à Triller » FR/EN, `llms.txt` et accueil à jour. Sur l'accueil : « Aucun téléchargement, aucune inscription : 3 étapes et c'est posté ».
  - Plan pour récupérer le public de Triller au nom de 99Sayso : `docs/marketing/PLAN_TRILLER.md`, et document « Stalak — récupérer le public de Triller » dans claude.ai.
  - La branche `marketing/chat-pro` est **abandonnée** : ne pas la fusionner.
- **À publier en même temps que l'offre hybride côté Comptes et App** : la page annonce le gratuit sans compte, le filigrane, la pub qui l'enlève, et Creator Plus.
- **Pour Comptes (boutons de l'écran des formules)** :
  - chaque bouton porte `data-plan` (`pro`, `creator`) et `data-cycle` (`month`, `year`) ; les cartes s'appellent `.p4-free`, `.p4-pro` et `.p4-creator` (pour `acctOpen(why, { plan })`) ;
  - Creator Plus appelle `buy('creator_month')` et `buy('creator_year')` ; Pro garde `#apMonth` / `#apYear`, qui appellent `buy('month')` / `buy('year')` : à relier aux nouveaux prix Paddle en dollars ;
  - sur le site, les boutons mènent à `/?plan=pro-year#pro`, `/?plan=creator-month#pro`, etc. (ou `/en/?plan=…#pro`) ;
  - encore à mettre à jour, hors de mon domaine : avantages d'un abonné (`acct.perk*`) selon la formule, prix dans `functions/_lib/help-guide.js`, `functions/_lib/router.js` et le revenu du tableau de bord.
- **À décider (propriétaire)** : afficher les limites des paroles auto (20 par jour en Pro, 60 en Creator Plus) et les 100 Go de sauvegarde. Ce ne sont encore que des propositions dans le contrat App / Comptes, donc la page ne donne pas ces chiffres.
- **Pour Juridique** : `site_src/conditions.html` parle encore de « Stalak Pro 9,99 € ou 79 € ».
- **Pour App** : les messages qui ouvrent l'écran des formules (`acct.why.*`) disent encore « Stalak Pro » seul.
- **À regarder (Juridique)** : la page de comparaison est de la publicité comparative ; elle ne compare que des faits vérifiables, sourcés et datés. Revoir les prix des concurrents tous les 3 mois.

## Idées de croissance recommandées (à répartir par le propriétaire)

> Issues de la recherche du 27/10/2026. Impact et effort estimés, pas mesurés sur Stalak. Le rôle proposé est une suggestion. Les codes (A1, P1, F1…) renvoient au document.

**À faire d'abord (fort impact, peu d'effort)**
1. **A1 — Outro lisible et légende à copier.** Les 3 s de fin affichent « stalak.app » en grand ; bouton « copier la légende » (avec @stalak.app) à l'export ; lien `stalak.app/?ref=outro` pour mesurer. → App & montage (écran d'export) + Marketing (textes).
2. **P1 — Présenter Pro juste après le premier export réussi.** La même vidéo sans logo et en karaoké, bouton « Continuer en gratuit » bien visible, une fois par session au plus. → Comptes (page Pro) + App (moment d'affichage) + Marketing (textes).
3. **F1 + F2 — Texte hook / POV et hook choisi une fois.** Une phrase en haut de l'écran dès la 1re seconde, qui change d'une vidéo à l'autre dans un pack ; l'artiste choisit une fois son passage de 15-30 s et le pack fait toutes ses variantes dessus, avec une boucle propre. → App & montage.
4. **A2 + A3 — Vidéos de fondateur et bêta Discord.** Avant / après, « je monte ton snippet », défi de la semaine dans #stalak-beta. → Propriétaire + Marketing (déjà dans le plan de lancement).

**Ensuite**
5. **P2 — Nouveaux formats dans Pro** : F4 mode pochette / visualiseur (sans filmer), F5 export multi-plateforme (TikTok / Reels / Shorts en un clic), F6 export Spotify Canvas (boucle 3-8 s). → App & montage.
6. **F7 — Looks préréglés** (VHS, film, glitch, et un look « glace » maison). → App & montage.
7. **A4 — Parrainage à deux** : 1 mois de Pro chacun, donné après le premier export de l'ami ; seulement quand Paddle est en réel. → Comptes.
8. **F3 — Calendrier de sortie** (avant / pendant / après la sortie, rappels le soir), puis publication programmée réservée à Pro. → Réseaux sociaux + Comptes.

**À trancher par le propriétaire (change l'offre déjà décidée)**
- P3 : pack de sortie à l'unité sans abonnement (par exemple 10 vidéos d'un son, 4,99 à 7,99 €).
- P4 : Pro complet offert sur le premier son, sans carte (demande un compte).
- P7 : annuel plus bas ou essai de 7 jours avec carte sur l'annuel.

**Nouveau concurrent direct (27/10) : camrip** (camrip.app). Il fait déjà le montage automatique de 1 à 4 prises coupées sur le temps, avec la synchro. Détail dans `docs/marketing/IDEES_CROISSANCE.md`.
- À mettre en avant (Marketing) : ce que camrip n'a pas (paroles à l'écran, karaoké, paroles écrites automatiquement, packs, clip 16:9, français) et le prix (Pro à 9,99 € sans limite de vidéos, contre 14,99 $ pour 30 vidéos chez camrip).
- À étudier (App & montage) : choisir automatiquement la meilleure prise à chaque coupe (visage net et bien cadré), et des zooms automatiques sur les plans qui durent.
- Renforce P3 (pack à l'unité) : camrip vend 5 vidéos 4,99 $ sans abonnement.

**Plus tard** : P6 prix locaux via Paddle (Comptes) ; A6 affiliation après Pro ; A7 dizaine de pages SEO FR/EN (Marketing) ; A8 Product Hunt un dimanche (Marketing) ; F9 détourage, F10 stats par variante, F11 modèles partagés.

**À mesurer dès la bêta** : visites → premier export → affichage de Pro → achat, et visites venues de `?ref=outro`.

## Stratégie vers 30 000 € par mois (28/10/2026, à répartir par le propriétaire)

> Objectif du propriétaire : 30 000 € de revenu **par mois**, d'ici 6 mois. Document complet : « Stalak — stratégie vers 30 000 € par mois » dans claude.ai ; résumé dans `docs/marketing/STRATEGIE_REVENUS.md`.

**Point bloquant à lever d'abord (Juridique + Comptes).** Les règles de Paddle (13/04/2026) interdisent la vente de publicité, le marketing automatisé sur les réseaux et les places de marché. Les campagnes de son et le « son à la une » ne pourront pas passer par Paddle.
- Demander à Paddle, par écrit, ce qu'il accepte, en particulier la « campagne faite pour toi ».
- Prévoir une facturation directe par une société et un autre moyen de payer les créateurs.
- À prendre en compte dans le choix du statut : à 30 000 € par mois, on dépasse les plafonds de la micro-entreprise.

**À trancher par le propriétaire (change l'offre déjà décidée)**
- Studio : 49 €/mois pour 5 artistes.
- Label : 149 €/mois pour 20 artistes.
- Pack de sortie : 19 € une fois.
- Prix en dollars aux États-Unis (par exemple 12,99 $/mois).
- Campagnes de son : à partir de 500 €, Stalak garde 25 %.
- Son à la une : par exemple 300 à 500 € la semaine.
- Campagne faite pour toi : 149 €.

**Recommandé, par rôle**
1. **Comptes** : formules Studio et Label (plusieurs artistes par compte) et pack de sortie dans Paddle, une fois validés ; prix en dollars aux États-Unis. Ensuite, le tableau de bord suit le revenu par source.
2. **Marketing** : page Tarifs avec les formules Studio et Label ; argumentaire pour les labels ; 3 campagnes pilotes en janvier avec des artistes ou labels connus, si la société existe.
3. **App & montage** : écran « campagnes » (un label dépose un son, les artistes font des vidéos dessus, avec la mention « Collaboration commerciale » ajoutée automatiquement) ; « son à la une » avec les paroles déjà calées. À faire seulement après le pilote à la main.
4. **Juridique** : loi influenceurs du 9 juin 2023 (mention pendant toute la vidéo, contrat écrit, responsabilité de l'intermédiaire ; vérifier si elle a changé depuis) ; mois Pro donnés en récompense ; mineurs (accord des parents avant 15 ans pour les données, âge minimum de Paddle) ; statut de la société.

**Exemple de répartition à 30 000 € par mois** (hypothèses, pas une prévision) :

| Source | Hypothèse | Revenu par mois |
|---|---|---|
| Campagnes de son | 20 × 2 000 € à 25 % | 10 000 € |
| Pro | 1 000 abonnés | 8 500 € |
| Studio / Label | 60 Studio + 15 Label | 5 175 € |
| Packs de sortie | 150 packs | 2 850 € |
| Campagnes faites pour toi | 15 campagnes | 2 235 € |
| Son à la une | 4 semaines | 1 600 € |

Ces montants sont avant TVA et frais. Réaliste : 10 000 € par mois en avril 2027.

### Juridique & business
- **Fait (branche `legal/adresses-vendeur`, 01/11)** : détail dans `docs/juridique/PADDLE.md`.
  - **Adresses vérifiées** après la bascule :
    - pages légales, app, e-mails et liens externes : tout répond ; anciennes adresses en 301 ;
    - `BACKEND.md` corrigé (fiches Google/Microsoft : `/privacy`, `/terms`) ;
    - « Account → Manage my subscription » aligné sur le bouton de l'app ;
    - adresses et textes à donner à Paddle prêts.
  - **Bouton « Renoncer au contrat ici »** : l'obligation pèse d'abord sur Paddle (vendeur légal), mais rien n'est sûr pour un revendeur. Recommandé : demander par écrit à Paddle s'il le fournit ; sinon Comptes l'ajoute (cahier des charges dans `PADDLE.md`, partie 2).
  - **Identité de la micro-entreprise prête** : remplir `vendeur.json` (nom, SIRET, adresse, téléphone, médiateur) puis relancer `build_site.py`. Mentions légales et conditions FR/EN passent seules du « particulier » au « micro-entrepreneur EI ».
  - **Confidentialité FR/EN** : pays à l'inscription et sur les visites ; compteurs de l'entonnoir ; Cloudflare Turnstile ; signe de vie toutes les 5 min (et non 1) ; empreinte d'IP pour les limites.
- **À faire par Comptes (tableau de bord, pays)** : la confidentialité annonce exactement ceci, à respecter :
  - pays = `request.cf.country` (2 lettres, par exemple `US`), **jamais** la ville, la région, le code postal, la latitude/longitude ni l'adresse IP ;
  - comptes : enregistré **une fois, à l'inscription**, pas mis à jour ensuite, effacé avec le compte ;
  - visites : une colonne pays sur la ligne de visite (nombre au hasard + langue), effacée avec elle au bout de 90 jours ;
  - si Cloudflare ne donne pas de pays (`XX`, `T1` pour Tor, vide) : stocker `null` ;
  - sur la carte et les tableaux du tableau de bord : seulement des totaux par pays.
  - Si autre chose est enregistré (ville, région…), prévenir Juridique avant la mise en ligne : la page devra changer.
- **À faire (propriétaire)** :
  - demander à Paddle s'il fournit le bouton de rétractation (texte prêt dans `PADDLE.md`) ;
  - adhérer à un médiateur de la consommation (liste CECMC, environ 25 à 50 €/an), puis le noter dans `vendeur.json` ;
  - changer les adresses dans Google Cloud → Stalak → Branding (`/privacy`, `/terms`).
- **À faire (Chef de projet)** : couper « Email Address Obfuscation » dans Cloudflare (Scrape Shield). Sans JavaScript, les pages légales affichent « [email protected] » au lieu de l'adresse de contact.
- ~~Lien « Your Privacy Choices » dans le pied de page de l'accueil anglais~~ : fait (`app/liens-cmp`, puis le pied de page commun `app/pied-de-page`).
- **Fait (branche `legal/etat-des-lieux`)** : état des lieux du statut, de Paddle en réel et des pages légales (infos pour décider, pas un avis juridique).
- **À décider (propriétaire)** : statut. La LLC prévue est remise en question : pour un résident français, elle ne supprime ni l'impôt ni les cotisations en France et ajoute des obligations (formulaire américain 5472, 25 000 $ d'amende si oublié ; compte étranger à déclarer). La micro-entreprise paraît plus simple. Rendez-vous avec un expert-comptable avant de créer quoi que ce soit (BIC ou BNC, ACRE).
- **Fait (branche `legal/nouvelle-offre`, 30/10 au soir)** : pages légales FR/EN adaptées à l'offre Gratuit (filigrane + pub récompensée) / Pro / Creator Plus en dollars. Tout ce qui parlait de la vidéo du jour, de l'e-mail de rappel et de Basic / Max est retiré.
  - Conditions : Gratuit sans compte ; formules et prix en dollars (conversion et taxes par Paddle, variation possible avec le taux de change) ; nouvelle section 4 « Filigrane et publicité récompensée » ; prix gardé ; changement de formule ; anti-fraude.
  - Remboursement : Pro et Creator Plus, retour du filigrane en Gratuit.
  - Confidentialité devient « Confidentialité et cookies » : section `#cookies` (pub Google Ad Manager, choix accepter/refuser, pub limitée si refus, durée 6 mois, liens Google) ; Google ajouté aux prestataires (connexion, pub, boîte contact@) ; sauvegarde 100 Go et « Parler à un humain » en Creator Plus.
  - Mentions légales : phrase sur le filigrane (marque de Stalak, aucun droit sur la vidéo).
- **Fait (branche `legal/etats-unis`, 30/10, 21 h)** : état des lieux « vendre et diffuser des pubs aux États-Unis avec une micro-entreprise et Paddle » dans `docs/juridique/ETATS_UNIS.md` (CCPA et autres États, COPPA, renouvellement automatique, pages, bandeau). Pages anglaises adaptées aux États-Unis : conditions (encadré renouvellement automatique, rappels, arrêt en ligne), confidentialité (« Your Privacy Choices », GPC, « Your US privacy rights », enfants), lien « Your Privacy Choices » en bas des pages légales anglaises. Corrigé aussi en FR : filigrane logo seul, packs dès 2 playbacks, sauvegarde automatique, annuel → mensuel en deux temps.
- **À décider (propriétaire)** : pub **personnalisée avec possibilité de refuser** (ce qu'écrivent les pages ; plus de revenu) ou **pub non personnalisée pour tous les visiteurs américains** (RDP dans Ad Manager ; presque plus de risque avec les moins de 13/16 ans ; moins de revenu). Les pages se changent en une phrase.
- **À faire par Comptes (renouvellement automatique, règles de Californie appliquées à tous les Américains)** :
  - à l'écran des formules, près du bouton d'achat : « $7.99/month, renews automatically until you cancel. Cancel anytime in Account. » (même chose pour chaque prix) ;
  - e-mail de confirmation après l'achat (formule, prix, fréquence, comment arrêter, lien) si le reçu Paddle ne le dit pas déjà : **à vérifier sur un achat sandbox** ;
  - **rappel une fois par an aux abonnés mensuels** (Paddle ne le fait pas) : formule, prix, fréquence, lien pour arrêter ;
  - abonnés annuels : vérifier que Paddle envoie bien le rappel 30 jours avant pour les Américains ; sinon l'envoyer nous-mêmes 15 à 45 jours avant ;
  - « Gérer mon abonnement » → arrêt en 1 ou 2 appuis, sans offre de rétention (ou avec le bouton « Arrêter » juste à côté) ; un e-mail « cancel » à contact@ doit suffire (à traiter sous 1 jour ouvré) ;
  - garder la preuve de l'accord (date, formule, prix, texte affiché) 3 ans.
- **À faire par App ou Comptes (vie privée, États-Unis)** :
  - lien « Your Privacy Choices » en bas de l'app et de la page Tarifs, vers un vrai bouton de refus (message « États américains » de Google « Confidentialité et messages », ou petite page maison qui enregistre le refus) ;
  - respecter **GPC** (`navigator.globalPrivacyControl`) : si actif, pub non personnalisée (drapeau RDP de GPT) ;
  - un refus enregistré (navigateur, et compte si connecté) → RDP sur toutes les pubs ;
  - Europe : bandeau inchangé (TCF). États-Unis : pas de fenêtre d'accord, refus par le lien ou GPC.
- **À faire par Marketing** : la page Tarifs et les pages « alternative » parlent encore du filigrane « Clipped with stalak.app » et citent Triller (décision 30/10 : aucun concurrent cité) ; lien « Your Privacy Choices » dans leur pied de page.
- **À suivre par Comptes (règles écrites dans les conditions)** :
  - montée en gamme (Pro → Creator Plus, mensuel → annuel) **immédiate, au prorata**, montant affiché avant confirmation ;
  - descente en gamme (Creator Plus → Pro) **au prochain renouvellement** ; annuel → mensuel en deux temps (arrêter l'annuel puis prendre le mensuel), comme le fait déjà Comptes, sans remboursement (changement programmé) ;
  - prix gardé tant que l'abonnement continue, même formule et même période ; un changement de formule prend le prix du moment ;
  - remboursement d'un paiement de changement de formule = retour à la formule d'avant jusqu'à la fin de la période ;
  - **à vérifier dans Paddle sandbox** : si un abonné payant en euros voit le montant de son renouvellement changer avec le taux de change, ou si Paddle fige le montant converti. Les conditions annoncent une « légère variation possible » ; me dire si c'est faux.
  - paroles auto 20 par jour (Pro) et 60 (Creator Plus), 8 min max, sauvegarde 100 Go : écrits tels quels dans les conditions. Me prévenir si les limites changent.
- **À faire par App (pub récompensée et filigrane)**, règles de Google et de la CNIL :
  - filigrane : logo + « Clipped with stalak.app », visible et qui bouge, ajouté à l'export en Gratuit seulement ;
  - **aucun script Google (GPT) ni fenêtre de cookies avant que l'utilisateur touche « Regarder une pub pour retirer le filigrane »** : rien ne se charge pour Pro, Creator Plus ou un gratuit qui ne choisit pas la pub ;
  - avant la pub, écran d'accord qui dit clairement l'action et la récompense (« Regarde une pub d'environ 30 s pour retirer le filigrane de cette vidéo »), avec « Non merci » aussi visible ; pas de texte qui pousse (interdit par Google : « regarde pour nous soutenir ») ;
  - si l'utilisateur ferme la pub avant la fin : lui confirmer qu'il perd la récompense ; filigrane retiré seulement à l'événement `rewardedSlotGranted` ; l'utilisateur ferme la pub lui-même ;
  - **décidé (propriétaire, 30/10)** : la pub est obligatoire pour exporter sans filigrane. Si aucune pub n'est disponible : message « Pas de pub disponible pour l'instant », bouton « Réessayer », et la vidéo s'exporte avec filigrane si l'utilisateur continue ;
  - le refus ne doit jamais bloquer l'export avec filigrane.
- **À faire par App ou Comptes : bandeau de consentement (CMP)**, nécessaire pour la pub en Europe, au Royaume-Uni et en Suisse :
  - outil **certifié par Google et compatible IAB TCF v2.2**, obligatoire pour des pubs personnalisées. Le plus simple : le message RGPD gratuit de Google Ad Manager (« Confidentialité et messages »). Sans outil certifié, seules des pubs limitées sont possibles ;
  - s'affiche au moment de la première pub (pas à l'ouverture du site), seulement pour ces pays ;
  - boutons « Tout accepter », « Tout refuser » et « Personnaliser » au même niveau (même taille, même couleur) ; pas de case pré-cochée ;
  - choix gardé 6 mois au plus, puis reposé ; refus = pub limitée (le filigrane peut quand même être retiré) ;
  - lien « Gérer les cookies » en bas des pages (app, Tarifs et pages légales) qui rouvre la fenêtre ; à défaut tant que ce n'est pas branché, lien « Cookies » vers `/confidentialite#cookies` ;
  - **décidé (propriétaire, 30/10) : pas d'âge minimum.** Les conditions disent « ouvert à tous ; si tu es mineur, demande l'accord d'un parent avant de t'abonner », et la confidentialité « moins de 15 ans : demande à un parent avant d'accepter les cookies publicitaires, ou refuse ». Stalak n'est pas un site fait pour les enfants : ne pas le déclarer « destiné aux enfants » dans Ad Manager. Si un utilisateur dit avoir moins de 13 ans (par exemple dans l'aide), ne lui servir que des pubs non personnalisées.
- **À faire (propriétaire)** : compte Google Ad Manager (paiement et informations fiscales au nom de la future structure : même nom que Paddle et la banque).
- **À faire (Marketing)** : la page Tarifs doit reprendre exactement les prix et contenus des conditions (en dollars, avec la mention « prix final avec taxes affiché avant le paiement »). En Europe, le prix montré au consommateur doit être le prix final taxes comprises : afficher les prix localisés de Paddle (aperçu des prix) plutôt que « 7,99 $ » seul.
- **À faire (Comptes)** : bouton de rétractation « Renoncer au contrat ici », obligatoire depuis le 19/06/2026 (ordonnance n° 2026-2) : visible pendant 14 jours après l'achat, gratuit, avec accusé de réception par e-mail. Cahier des charges à écrire par Juridique.
- Mineurs : réglé par la décision « pas d'âge minimum » (phrases sur l'accord d'un parent dans les conditions et la confidentialité). Google (connexion, pub, boîte contact@) est maintenant dans la confidentialité.
- **À faire une fois la structure créée** : nom, adresse (ou domiciliation) et SIRET dans les mentions légales ; nom légal dans les conditions (`--seller`) ; médiateur de la consommation désigné et nommé ; responsable du traitement nommé ; validation du site par Paddle (même nom sur le site, le compte Paddle et la banque).
