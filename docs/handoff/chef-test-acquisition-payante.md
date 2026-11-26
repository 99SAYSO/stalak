# Demande du Chef de projet : premier test d'acquisition payante (25/11)

**Décision du propriétaire (25/11, 22 h 22, « oui on fait ça »)**
- **Budget du test : 150 € maximum sur 2 semaines.** 100 € restent de côté. On ne dépasse jamais, même si ça marche ; la suite se décide avec les chiffres.
  - **80 € de pubs TikTok** en **anglais**, visant les **États-Unis**, sur iPhone.
  - **70 € pour 2 ou 3 créateurs qui conseillent les rappeurs** (marketing musical, beatmakers ; 5 000 à 50 000 abonnés), pas des rappeurs.
- **Rien n'est payé avant** :
  1. la vérification que les exports iPhone remontent après la correction du 25/11 (Chef de projet) ;
  2. l'explication des paiements abandonnés (`chef-sources-et-paiements.md`, Comptes) ;
  3. l'activation du suivi TikTok (pixel).
- **Pourquoi l'anglais :** 9 abonnés payants sur 10 sont anglophones, surtout sur iPhone.
- **Règles de décision, fixées avant de dépenser :**
  - on suit le coût par export et le coût par abonné payant ;
  - **au moins 1 abonné pour 150 €** : on continue avec le budget du mois suivant ;
  - des exports mais aucun paiement : on revoit le prix ou la page de paiement, pas la pub ;
  - aucun export : on revoit le message ou la cible.

## Marketing (avec Réseaux sociaux pour la fabrication)

**1. La vidéo de pub en anglais (9:16, 15 à 25 s).**
- Elle montre l'app, pas la série. Un rappeur filme 3 prises, Stalak coupe sur le rythme, on voit le clip fini, et le texte appelle à l'action vers `stalak.app`.
- Texte à l'écran dès la première seconde, dans la zone visible.
- Propose 2 accroches, sans aucune promesse inventée (pas de « 1 million de vues »). **L'une des deux est la comparaison « Artiste A / Artiste B »** (le propriétaire adore, 25/11 22 h 47) : « Artiste A poste son son avec une photo. Artiste B poste un snippet monté sur le rythme. » ; l'autre peut être l'avant / après (3 prises brutes → clip monté).
- Règles habituelles : `stalak-da`, Mes goûts, planche contact, validation du propriétaire avant fabrication.
- Lien de la pub : `https://stalak.app/?ref=ttads`.

**2. Une liste de 10 créateurs anglophones qui CONSEILLENT les rappeurs** (décision du propriétaire, 25/11, 22 h 38 : « c'est ça qu'il faut viser, pas les rappeurs ») : chaînes et comptes « comment promouvoir sa musique », marketing musical, conseils aux artistes indépendants, et beatmakers qui vendent des prods à des rappeurs (5 000 à 50 000 abonnés ; US d'abord, puis UK et Canada ; TikTok, Instagram ou YouTube). **Pas de rappeurs** : ils ne font pas de pub pour des apps (image d'artiste). Pour chacun :
- le lien du profil, le nombre d'abonnés, les vues moyennes de leurs 10 dernières vidéos ;
- pourquoi il colle à Stalak ;
- le prix probable.

Uniquement des comptes publics trouvés à la main : pas de scraping, pas de données privées.

**3. Le message de contact en anglais** : court, honnête, avec un prix fixe proposé (25 à 35 € la vidéo).
- Il propose une vidéo où le créateur montre Stalak comme conseil à son public (par ex. « comment teaser ton son en 5 minutes »), avec une vraie démo de l'app.
- Il demande la mention de partenariat (#ad), obligatoire.
- Il propose aussi la **pub en partenariat** (Spark Ads de TikTok) : le créateur nous donne le code de sa vidéo et Stalak paie sa diffusion depuis son compte (validé par le propriétaire, 25/11 22 h 47).
- Chaque influenceur reçoit un lien à son nom : `https://stalak.app/?ref=<nom>`.
- C'est le propriétaire qui envoie les messages et qui paie.

**Compte rendu :** `docs/handoff/marketing-test-acquisition.md`. Le script et la liste vont dans le Studio pour être validés.

## Comptes

**1. Suivi TikTok.** Vérifier ce qui part vers TikTok après « Accepter » :
- côté navigateur : le pixel ;
- côté serveur : l'API de conversion déjà prête.

Événements à envoyer : **visite, export réussi, ouverture du paiement, paiement**. La campagne s'optimise sur l'export si les paiements sont trop rares.

Écrire au propriétaire le pas-à-pas exact : où trouver l'identifiant du pixel et où taper le secret `TIKTOK_EVENTS_TOKEN` dans Cloudflare. Le Chef de projet met `TIKTOK_PIXEL_ID` dans `wrangler.toml`.

**2. Une carte « Test payant » dans le tableau de bord.** Pour `ref:ttads` et chaque `ref:<influenceur>` :
- visites, exports, paiements ouverts, abonnés, revenus ;
- l'argent dépensé, saisi à la main par le propriétaire dans le tableau de bord ;
- le coût par export et le coût par abonné.

**3. Vérifier que `?ref=` survit** à l'inscription et au paiement : la source est gardée sur le compte, comme `signup_source`.

**Compte rendu :** `docs/handoff/compte-test-acquisition.md`.

## Juridique

Une ligne dans la confidentialité (FR/EN) si le pixel TikTok côté navigateur n'y figure pas encore. Rappeler au propriétaire la mention obligatoire de partenariat pour les influenceurs.

## Avant de fabriquer la pub (Chef de projet, 25-26/11)
Relevé des pubs qui tournent depuis longtemps dans notre domaine (TikTok Creative Center, bibliothèque de pubs de Meta) : `docs/marketing/pubs-concurrents-2026-11.md`. Marketing s'en sert pour les accroches et le format de la vidéo de pub, sans rien recopier.
