# Bandeau cookies, Clarity, GA4, TikTok, offre à 1 € — relecture et règles (23/11/2026)

> Rôle Juridique & business. Infos pour décider, **pas un avis juridique** : à faire relire par un pro avant d'activer Clarity, GA4 et surtout TikTok.
> Le texte du bandeau et celui de l'offre à 1 € **n'existent pas encore dans le dépôt** : voici les textes que je propose, pour Comptes et App. Les pages (confidentialité, conditions, remboursement FR/EN) disent déjà ce qui suit.

## 1. Texte proposé du bandeau (App/Comptes)
Premier niveau, **deux boutons de même taille, même couleur de poids** : « Refuser » et « Accepter », et un lien « Personnaliser ». Pas de croix qui vaut accord, pas de mur (le site marche si on refuse).

**FR** — *Titre* : « Tes cookies, ton choix ». *Texte* : « Avec ton accord, nous utilisons Microsoft Clarity (voir où les gens bloquent : tes champs et tes paroles sont masqués, jamais tes vidéos) et Google Analytics (compter les visites) pour améliorer Stalak. Tu peux refuser : Stalak marche pareil. Ton choix est gardé 6 mois et se change dans « Gérer les cookies ». » *Boutons* : [Refuser] [Accepter] · *Lien* : Personnaliser · En savoir plus (→ `/fr/confidentialite#cookies`).

**EN** — *Title*: “Your cookies, your choice”. *Text*: “With your permission, we use Microsoft Clarity (to see where people get stuck: your fields and lyrics are masked, never your videos) and Google Analytics (to count visits) to improve Stalak. You can refuse: Stalak works the same. Your choice is kept for 6 months and can be changed in “Cookie settings”.” *Buttons*: [Refuse] [Accept] · *Link*: Customize · Learn more (→ `/privacy#cookies`).

Second niveau « Personnaliser » : une case par finalité, **décochées par défaut** : « Mesure et amélioration (Clarity, Google Analytics) » ; « Publicité : mesure de nos pubs TikTok » **n'apparaît qu'à l'activation** de TikTok.

**Règles à respecter (CNIL / ePrivacy)**
- Rien n'est chargé ni déposé avant le choix (Clarity, GA4, et aucun script de ces services dans la page).
- Refuser aussi simple qu'accepter ; pas de case précochée ; pas de formulation culpabilisante.
- Choix gardé **6 mois** puis redemandé ; retrait aussi facile que l'accord : lien « Gérer les cookies » dans le pied de page de chaque page (déjà prévu par App).
- Le signal **GPC** compte comme un refus.
- **Texte à jour** : si on ajoute TikTok, ou tout autre outil, on **change la version du consentement** et on redemande (un accord donné pour Clarity et GA4 ne couvre pas TikTok).
- Moins de 15 ans (France) : l'accord d'un parent est nécessaire ; la page le dit. On ne peut pas le vérifier : on ne cible pas les enfants et on ne les identifie pas.

## 2. Clarity (enregistrement de sessions) — ce qu'il manque pour la CNIL
Clarity n'est **pas** dans la dispense de consentement de la CNIL pour la mesure d'audience (il enregistre et rejoue des sessions) : le consentement est bien nécessaire, d'où le bandeau. Pour que ce soit propre :
1. **Masquer** : tous les champs de saisie (e-mail, mot de passe, pseudo, discussion d'aide), **tout le texte de l'éditeur** (paroles) et le contenu de Compte ; ne **jamais** enregistrer les vidéos, photos ni le canvas de l'aperçu (`data-clarity-mask="true"` ou réglage « Strict » de Clarity). Vérifier dans un vrai replay avant de mettre en ligne.
2. **Ne pas** envoyer d'identifiant de compte ni d'e-mail à Clarity (pas d'« identify »).
3. Charger Clarity **après** l'accord seulement ; si Clarity fournit un réglage de consentement (Consent API / Consent Mode), lui transmettre le choix (Microsoft l'attend pour l'Espace économique européen, le Royaume-Uni et la Suisse : à vérifier dans le compte).
4. **Durée** : Clarity garde 13 mois au plus (annoncé dans la page) ; régler les enregistrements au plus court proposé et le noter.
5. Retrait de l'accord : arrêter Clarity tout de suite et effacer son cookie (`_clck`, `_clsk`).
6. Page de confidentialité : écrit (finalité, cookies, masquage, durée, États-Unis, base = consentement).

## 3. GA4
- Après accord seulement. Réglages à faire : **conservation des données 14 mois** (pas 2 ans ou plus) ; cookie `_ga` limité à **13 mois** (`cookie_expires`) ; **signaux Google et personnalisation de la pub désactivés** ; pas de User-ID, pas d'e-mail ni de nom envoyés ; pas de partage des données avec les produits Google (Google Ads, etc.) ; anonymisation d'adresse IP déjà par défaut en GA4.
- Évènements : `accueil_vue`, `onboarding_etape_N`, `montage_lance`, `export_ok`, `paywall_vu`, `checkout_ouvert`, `achat` : rien de personnel dedans (formule et montant seulement).
- Transferts vers les États-Unis : Google est certifié « Data Privacy Framework » (à vérifier sur dataprivacyframework.gov à la mise en ligne) ; c'est dit dans la page.

## 4. API de conversion TikTok (côté serveur)
- Seulement si la personne a **accepté** : le serveur doit **savoir** le choix au moment de l'achat. Le webhook Paddle n'a pas le navigateur : Comptes doit enregistrer le choix (oui/non, version) **sur le compte ou dans `custom_data` du paiement Paddle** avant le paiement. **Choix inconnu = on n'envoie rien.**
- E-mail **haché en SHA-256**, après passage en minuscules et sans espaces (comme TikTok l'exige), **jamais en clair**. Pas d'autre donnée (ni nom, ni adresse IP, ni pays précis).
- Un e-mail haché reste une **donnée personnelle** : l'envoi à TikTok est un transfert à un tiers pour de la publicité. Base : consentement. États-Unis : à ranger comme **« sharing » pour de la publicité ciblée** : d'où la mention dans « Your Privacy Choices » et le droit de refuser.
- Retrait de l'accord : on cesse d'envoyer les prochains évènements ; ceux déjà envoyés ne se rappellent pas (la page le dit en demandant d'écrire à l'e-mail de contact).
- **Point à surveiller** : TikTok a été sanctionné en 2025 par l'autorité irlandaise (amende de 530 M€) pour des transferts de données vers la Chine. Je l'ai écrit prudemment (« TikTok traite aussi des données dans d'autres pays »). À relire avec un pro avant d'**activer**.
- **Pas de pixel TikTok** dans le navigateur ici (c'est mieux : rien n'est déposé). Si on en ajoute un, il faut le dire et ajouter son cookie.

## 5. États-Unis
- **Californie (CCPA/CPRA)** : l'envoi de l'achat à TikTok pour des pubs = « partage » (cross-context behavioral advertising) ; pas de vente pour de l'argent. Obligations couvertes : lien « Your Privacy Choices » (qui ouvre les réglages cookies), GPC = refus, section « Your US privacy rights » mise à jour. Les seuils de la CCPA ne sont pas atteints aujourd'hui (voir `ETATS_UNIS.md`), mais on s'y conforme déjà.
- **Moins de 16 ans** : pas de partage pour la pub sans accord (opt-in) : la page dit « avec l'accord d'un parent ». Comme on demande l'accord à tout le monde, c'est cohérent.
- **Risque spécifique aux États-Unis : « écoute illicite » (loi californienne CIPA)** : des procès visent les sites qui enregistrent les sessions (replays) ou envoient des données à des tiers **sans accord préalable**. Charger Clarity/GA4/TikTok seulement après « Accepter », masquer les champs, et le dire dans la page : c'est ce qui limite le risque. Ne pas charger Clarity avant le choix, même pour les visiteurs américains.
- **COPPA** : si on apprend qu'un enfant de moins de 13 ans utilise Stalak (via Clarity par exemple : un replay qui le montre), il faut ne pas garder ces données. Pas d'âge minimum, mais pas de collecte « en connaissance de cause » : rien à changer, juste le savoir.

## 6. Relecture de l'offre à 1 € (écran de fin d'export avec filigrane)
Ce qui est bon : prix, durée, prix ensuite, annulation **au même endroit que le bouton** ; une fois par compte ; remboursements de 14 jours.

À corriger ou décider :
1. **Libellé « Retire le filigrane pour 1 € » : trompeur par omission.** Il laisse croire à un achat unique alors que c'est **7 jours de Pro** puis un abonnement. Proposition : **« Retire le filigrane : 7 jours de Pro pour 1 € »**. À côté, en clair et lisible (pas en gris clair, pas en petits caractères) :
   - FR : « 1 € aujourd'hui, puis 7,99 $/mois à partir du [date, dans 7 jours]. Annulable à tout moment, en ligne. »
   - EN : “$1 today (or the equivalent), then $7.99/month starting [date, in 7 days]. Cancel anytime, online.”
2. **Devises** : « 1 € » mélangé avec « 7,99 $ » prête à confusion. Paddle vend en dollars et convertit ; un prix « 1 € » exact demande un **prix en euros réglé dans Paddle** (remplacement de prix par pays). Sinon afficher **exactement ce que l'écran de paiement affichera**. Pour l'UE, le prix doit être **taxes comprises** (Paddle le fait si le prix est réglé « taxes incluses »).
3. **Pas de pression** : pas de compte à rebours, pas de « dernière chance », pas de phrase culpabilisante sur le bouton de refus. Le choix « Exporter avec le filigrane » doit rester visible, de même poids.
4. **E-mail de confirmation immédiat** (obligatoire en Californie pour les renouvellements automatiques) avec : prix payé, **prix ensuite et date**, comment annuler (lien direct). Il remplace l'avis de changement de prix de 7 à 30 jours (impossible à respecter pour une offre de 7 jours). Le rappel 2 jours avant reste (e-mail de service, sans offre).
5. **Article d'obligation de payer (UE)** : le bouton de l'écran ouvre le paiement Paddle ; le vrai bouton « commande avec obligation de paiement » est celui de Paddle : y vérifier le texte (« Commencer 7 jours à 1 €, puis 7,99 $/mois »).
6. **Même abonnement qu'après** : « 7 jours de Pro » puis **Pro mensuel seulement** (pas d'annuel) : le dire (fait dans les conditions).
7. **Lien avec l'essai gratuit** : à décider. Une personne qui a déjà pris l'essai gratuit peut-elle prendre l'offre à 1 € ? et l'inverse ? Les pages disent seulement « une fois par compte » pour l'offre à 1 €. Si les deux ne se cumulent pas, il faut l'écrire dans les conditions (dis-moi la décision).
8. **Droit de rétractation (UE)** : les 14 jours de remboursement après **chaque** paiement (1 € puis 7,99 $) couvrent le délai légal ; écrit dans les conditions (section 5 et 8) et la page remboursement.
9. **Mineurs** : pas d'âge minimum ; les conditions demandent l'accord d'un parent pour s'abonner ; l'offre à 1 € suit la même règle. Pas de ciblage des enfants dans l'écran.
10. **Paddle** : confirmer que l'offre (prix d'essai payant, puis abonnement) est permise par ses règles et réglée comme annoncé.

## 7. Page Tarifs (Marketing)
À compléter par Marketing avec une phrase proche des conditions : « Offre sur l'écran de fin d'export : 7 jours de Pro pour 1 €, puis 7,99 $/mois, annulable à tout moment. Une fois par compte. » et un lien vers `/terms#intro-offer`. Je n'ai pas modifié la page Tarifs (domaine de Marketing).
