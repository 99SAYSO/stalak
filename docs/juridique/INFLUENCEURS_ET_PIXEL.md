# Test d'acquisition payante : pixel TikTok et mention de partenariat (#ad) (25/11/2026)

> Rôle Juridique & business. Infos pour décider, **pas un avis juridique**.
> Demande : `docs/handoff/chef-test-acquisition-payante.md` (partie Juridique).

## 1. Pixel TikTok : le point était manquant dans la page
La page parlait seulement de l'API de conversion côté serveur, « pas encore active », « aucun cookie ». Avec le pixel côté navigateur, c'était **faux**. Corrigé en FR/EN (`#tiktok-pixel` / `#pixel-tiktok`) :
- **Ce que TikTok reçoit** : visite, export réussi, fenêtre de paiement ouverte, achat ; **adresse IP, type de navigateur, page** ; cookies de TikTok `_ttp` et `_tt_enable_cookie` (13 mois au plus : **à vérifier** dans le navigateur à la mise en ligne et corriger la page si les noms ou durées diffèrent).
- **Identifiant de clic `ttclid`** : gardé 30 jours (`stalak_ttclid`) après « Accepter », envoyé avec l'achat.
- **Achat** : l'API serveur envoie aussi formule, montant, heure, **e-mail haché** (SHA-256). Doublon pixel/serveur : Comptes déduplique avec un identifiant d'évènement (côté technique).
- **Pas envoyé** : nom, e-mail en clair, réponses du questionnaire, paroles, vidéo.
- **Usage** : mesurer et améliorer nos pubs ; **TikTok peut aussi s'en servir pour ses besoins** (c'est ce que disent ses conditions : en Europe, l'éditeur et TikTok sont en général considérés comme **responsables conjoints** pour le pixel) : la page le dit, avec le lien vers sa politique.
- **États-Unis** : le pixel et les achats envoyés à TikTok = « partage » pour de la publicité ciblée ; déjà couvert par « Your Privacy Choices » (refus, GPC) ; texte mis à jour.
- Le pixel ne se charge **qu'après « Accepter »** ; refuser ou retirer l'accord l'arrête.

### À corriger par Comptes avant d'activer (`src/consent.js`)
1. **Texte du bandeau** : il dit « cookies de mesure (Microsoft Clarity, Google Analytics) … et pour mesurer nos publicités ». **TikTok n'est pas nommé** : une personne qui accepte ne sait pas qu'un pixel TikTok part. Proposition :
   - FR : « Avec ton accord, Stalak utilise Microsoft Clarity et Google Analytics pour comprendre comment le site est utilisé, et le pixel TikTok pour mesurer nos pubs sur TikTok. Rien n'est déposé si tu refuses. »
   - EN : “With your permission, Stalak uses Microsoft Clarity and Google Analytics to understand how the site is used, and the TikTok pixel to measure our ads on TikTok. Nothing is stored if you refuse.”
2. **Les accords déjà donnés ne valent pas pour TikTok** : un « Accepter » donné avant l'ajout du pixel ne couvre que Clarity et GA4. Changer la **version** du consentement (`stalak_cc` : par exemple `y2`) pour **redemander** à tous. Un `y` ancien ne doit pas charger le pixel.
3. **Un seul bouton pour tout** : mesure d'audience et publicité sont mélangées dans un « Accepter » unique. Acceptable seulement si le texte nomme tout (point 1) ; **la CNIL préfère un choix par finalité** : idéalement une case « Publicité (TikTok) » à part sous « Personnaliser ». À décider ; je ne bloque pas pour le test, mais c'est le point de la CNIL le plus exposé.
4. **Réglages du pixel dans TikTok** : **désactiver la « correspondance avancée automatique »** (elle lit les champs de formulaire, dont l'e-mail), ne pas activer les audiences ni le retargeting tant qu'on ne l'a pas décidé (et le dire dans la page), n'envoyer que visite, export, ouverture du paiement, achat.
5. **Pas de pixel dans la fenêtre de paiement Paddle** (c'est Paddle qui la gère) ; l'achat vient de Paddle côté serveur.
6. **Rien avant l'accord** : aucun appel à TikTok, même sans cookie, avant « Accepter » (l'adresse IP part dès que le script charge).
7. **TikTok Ads** : accepter dans le compte TikTok Ads les conditions de traitement des données (« Data Processing Terms ») ; garder une copie.

## 2. Mention de partenariat obligatoire pour les influenceurs
**Principe** : une publication payée (ou offerte) par Stalak est une **publicité** ; le public doit le voir **tout de suite**, sans clic ni recherche. **L'annonceur (Stalak) est responsable** des publications de l'influenceur : il ne suffit pas de le demander une fois.

### Ce qu'il faut exiger de chaque influenceur (à écrire dans le message)
- **États-Unis (FTC)** : divulguer le lien commercial (« material connection ») **clairement et visiblement** : « #ad » ou « Paid partnership with Stalak », **au début** de la légende (avant le « voir plus »), **et** dans la vidéo (à l'écran et/ou à l'oral) pour une vidéo. Les mots vagues ne suffisent pas : **#sp, #collab, #partner, #thanks, « sponsored by » caché au milieu d'hashtags**. L'amende peut dépasser **50 000 $ par infraction** (le plafond est relevé chaque année) et la FTC vise aussi l'annonceur.
- **TikTok** : activer l'option **« Divulgation du contenu » / « Branded content »** (« Content disclosure setting ») dans les paramètres de publication : elle met l'étiquette « Partenariat payant » ; **obligatoire** aussi pour les règles de TikTok. Sans elle, TikTok peut retirer la vidéo.
- **Instagram** : l'outil **« Partenariat rémunéré »** (« Paid partnership label ») et/ou « #ad » au début.
- **Royaume-Uni, Canada** : même principe (« #ad » bien visible au début) ; au Royaume-Uni la CMA peut infliger de lourdes amendes depuis 2025.
- **France** : si l'audience est en France, la loi sur les influenceurs (2023) impose un **contrat écrit** et la mention « **Publicité** » ou « **Collaboration commerciale** » : **non nécessaire pour des comptes américains** ; à retenir si on contacte des Français.
- **Contenu honnête** : l'influenceur montre **vraiment** Stalak sur **son propre son** (c'est déjà demandé) ; **aucune promesse inventée** (« j'ai fait 1 M de vues grâce à Stalak », « gratuit pour toujours » si faux) ; ne dire que ce que l'app fait. Pas de faux avis, pas d'avis écrit à sa place sans qu'il soit vrai.
- **Âge** : pas de contrat avec une personne de moins de 18 ans (elle ne peut pas s'engager seule).

### Paragraphe à coller dans le message de contact (EN)
> “Paid partnership disclosure is required. Please post it with TikTok’s ‘Content disclosure setting’ (Branded content) switched on, and start the caption with #ad (not #sp or #collab). Also say or show on screen that it’s a paid partnership with Stalak. Only show what the app really does, and don’t promise results. I’ll pay [25–35 €] per video after it’s posted. I may ask you to fix the caption if the disclosure is missing.”

### À faire par le propriétaire (il envoie les messages et il paie)
1. **Un accord par écrit** (le message accepté suffit : prix, une vidéo, mention #ad, date de publication, droit de demander une correction). Garder les échanges.
2. **Vérifier chaque vidéo après publication** (mention présente, étiquette TikTok, rien de faux) et **demander la correction le jour même** sinon ; garder une capture.
3. **Utiliser la vidéo comme pub TikTok (« Spark Ads »)** : il faut le **code d'autorisation de l'influenceur** et son **accord écrit** (durée) ; ne pas réutiliser sa vidéo comme pub sans cela.
4. **Paiement** : par PayPal ou virement après publication, **garder un reçu ou une facture** de l'influenceur pour la comptabilité de la micro-entreprise (à voir avec l'expert-comptable ; les dépenses de pub sont des charges, mais le micro-entrepreneur à la franchise ne les déduit pas du chiffre d'affaires : **information**, pas conseil fiscal).
5. **Lien à son nom** (`?ref=<nom>`) : rien de personnel dedans ; ne pas y mettre son vrai nom si l'influenceur préfère un pseudo.
6. Ne pas offrir d'avantage en échange d'un **avis positif** sur un site d'avis ; ici, on paie une vidéo de présentation, pas un avis.

## 3. Pour la pub TikTok elle-même
- **Aucune promesse** de résultat dans la vidéo et la page d'arrivée (pas de « 1 million de vues », pas de chiffre inventé) : cohérent avec la demande.
- La page d'arrivée (`/?ref=ttads`) montre le bandeau ; rien n'est chargé avant le choix.
- Cible : **États-Unis**. Les pages anglaises sont donc les pages de référence ; mineurs : pas d'âge minimum (décision du 30/10) ; la pub ne cible pas les enfants (cibler 18+ dans TikTok Ads : réglage simple et prudent).
- Prix et essai affichés exactement comme sur le paywall (voir `MESURE_ET_OFFRE_1_EURO.md` § 8) : c'est la page où arrivent les clics payés, donc le point le plus regardé.
