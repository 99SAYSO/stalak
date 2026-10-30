# Audit croissance et business — Stalak, marché américain (30/10/2026)

Rôle : audit en lecture seule (rien modifié dans le dépôt).
Skills utilisés : `seo-audit` (chargé et suivi : indexation, technique, international, page par page, contenu). Je me suis aussi appuyé sur ce que je sais de `pricing`, `growth-strategy` et `referrals`, sans les charger.

**Limite importante** : l'outil de lecture web a refusé d'ouvrir stalak.app (adresse non autorisée pour un sous-agent), et `curl` est bloqué par le proxy. J'ai donc audité **les fichiers construits** dans `public/en/`, `public/sitemap.xml`, `public/llms.txt` et `site_src/`. Ils sont censés être identiques au site en ligne (déploiement automatique depuis `main`), mais je n'ai pas pu le vérifier en direct.

Légende :
- **[Fait]** = vérifié, avec la source (fichier du dépôt ou lien web).
- **[Estimation]** = mon calcul ou mon avis.

---

## Classement des constats (le plus important en premier)

### 1. Aujourd'hui, Stalak ne peut encaisser aucun dollar : ni abonnement, ni pub
- **Ce que j'ai trouvé**
  - [Fait] Paddle est encore en **mode test (sandbox)** (STALAK_CONTEXTE §2, STATUS). Les vrais paiements attendent la structure juridique (nom légal, SIRET, validation du site par Paddle).
  - [Fait] La pub récompensée tourne avec une **unité de test** : `AD_UNIT` est encore à remplacer, et ni le compte Google Ad Manager ni l'outil de consentement n'existent (STATUS, 30/10 à 21 h).
  - [Fait] Pour ouvrir un compte Google Ad Manager, il faut **d'abord un compte AdSense validé**, ce qui prend « de quelques jours à plusieurs semaines » ([MonetizeMore](https://www.monetizemore.com/blog/how-to-sign-up-to-google-ad-manager/)). Les paiements et les infos fiscales doivent être au nom de la future structure (STATUS, Juridique).
- **Pourquoi c'est important** : si on lance la promo américaine maintenant, les premiers visiteurs, ceux qui ont le plus envie d'essayer, ne pourront ni payer ni regarder une vraie pub. Ce premier élan ne revient pas.
- **Action proposée**
  - Fixer l'ordre : 1) structure (micro-entreprise) ; 2) Paddle réel ; 3) demande AdSense, puis Ad Manager, à lancer tout de suite car c'est le plus long ; 4) seulement ensuite, la grosse promo (Reddit, thread X).
  - D'ici là, faire uniquement des vidéos « build in public » et ouvrir une liste d'attente Pro.
- **Effort** : moyen. **Responsable** : Propriétaire + Juridique & business.

### 2. Le filigrane « logo seul » casse le principal moteur d'acquisition gratuit (décision à risque, je le signale)
- **Ce que j'ai trouvé**
  - [Fait] La décision du 30/10 prévoit un filigrane avec **le logo seul**, sans adresse (STALAK_CONTEXTE §2).
  - [Fait] Le code actuel affiche encore le logo + « Clipped with stalak.app » (`src/app.js`, `WM_TEXT`, ligne 5013). Les textes de l'app le disent aussi (`wm.note`).
  - [Fait] La fin de vidéo de 3 s avec « stalak.app » est abandonnée.
- **Pourquoi c'est important**
  - Un spectateur sur TikTok ne peut pas taper un logo dans son navigateur. Seul un nom lisible le mène au site.
  - Le filigrane est la seule pub gratuite qui passe dans **chaque vidéo** exportée en gratuit. Sans l'adresse, on garde la gêne pour l'utilisateur, mais on perd l'acquisition.
  - [Estimation] C'est le levier de croissance le moins cher que possède Stalak.
- **Action proposée**
  - Garder le style discret façon ancien Triller, mais avec **« stalak.app » écrit en petit** à côté du logo (ou le logo qui contient le mot).
  - Mesurer avec `?ref=wm` : voir le constat 3.
  - C'est au propriétaire de trancher, puisque c'est une décision déjà prise.
- **Effort** : petit. **Responsable** : Propriétaire (décision), puis App & montage.

### 3. Rien n'est mesuré : on ne saura pas quel réseau marche
- **Ce que j'ai trouvé**
  - [Fait] Le plan US_FIRST §8 compte sur des liens `?ref=tiktok`, `?ref=reddit`, etc.
  - [Fait] Je n'ai trouvé **aucune lecture du paramètre `ref`** dans `functions/` ni dans `src/` : aucune trace de `ref` dans le code serveur ni dans l'app. Le tableau de bord ne peut donc pas les compter.
  - [Fait] Il n'existe pas non plus d'entonnoir « visite → premier export → pub regardée → page Pro → achat », pourtant demandé dans STATUS (« À mesurer dès la bêta »).
- **Pourquoi c'est important** : sans budget, le temps du propriétaire est la seule ressource. Il faut savoir en 2 semaines si Reddit ou TikTok rapporte des exports et des abonnés, pas seulement des vues.
- **Action proposée**
  - Enregistrer `ref` à la première visite (stockage local), puis l'envoyer avec les événements : export, pub vue, page Pro ouverte, achat (passé dans `custom_data` de Paddle).
  - Afficher dans le tableau de bord, par `ref` : visites, exports, achats.
  - Ajouter le pays (Cloudflare le donne) pour suivre la part des États-Unis.
- **Effort** : moyen. **Responsable** : Comptes / paiements / serveur.

### 4. Aucune preuve visuelle : pas de vidéo de démo, pas de comptes sociaux
- **Ce que j'ai trouvé**
  - [Fait] Le dossier `site_src/demo/` n'existe pas, donc le bloc vidéo de l'accueil ne s'affiche pas (SEO.md).
  - [Fait] La liste `SOCIAL` de `build_site.py` est vide : pas de `sameAs` dans les données structurées, ni de lien vers TikTok, Instagram ou YouTube.
- **Pourquoi c'est important**
  - Un rappeur américain décide en 3 secondes, en voyant le résultat. « Cuts your takes to the beat » ne se comprend vraiment qu'en vidéo.
  - Une vidéo est aussi nécessaire pour YouTube (recherches « how to… ») et pour la donnée `VideoObject`, qui permet d'apparaître dans les résultats vidéo de Google.
- **Action proposée**
  - Filmer une vidéo de 20 à 30 s : 3 prises → le montage final, avec un son de 99Sayso.
  - La mettre en haut de l'accueil anglais (sans lecture automatique avec le son), sur YouTube et sur TikTok.
  - Créer les 3 comptes et donner leurs adresses à Marketing.
- **Effort** : petit. **Responsable** : Propriétaire (tournage, comptes), puis Marketing & croissance.

### 5. Le site anglais n'a que 2 vraies pages : il manque les pages qui attirent les recherches
- **Ce que j'ai trouvé**
  - [Fait] `sitemap.xml` liste 12 adresses : accueil, tarifs et 4 pages légales, en FR et en EN. Il n'y a aucune page de cas d'usage. Les pages de comparaison ont été retirées le 30/10 (`_redirects`).
  - [Fait] Les mots-clés de US_FIRST §5 (« lip sync video editor », « rap snippet editor », « how to make a lip sync video for TikTok », « edit multiple takes to the beat ») n'ont **aucune page dédiée**.
  - [Fait] Le passage de l'anglais à l'adresse principale (US_FIRST, partie A) attend toujours l'accord du propriétaire.
- **Pourquoi c'est important**
  - Google classe des pages, pas des sites. Avec une seule page d'app, Stalak ne peut sortir que sur « stalak ».
  - [Estimation] Les recherches visées sont rares mais précises : les quelques visiteurs qu'elles amènent sont des rappeurs prêts à essayer.
- **Action proposée**
  - **Oui au passage de l'anglais à la racine** : je suis d'accord avec la recommandation de Marketing. Il faut le faire **avant** la promo et **avant** de créer les pages, pour ne pas les déplacer deux fois.
  - Puis créer les 4 pages prévues, chacune avec une vraie vidéo, des étapes et une FAQ courte :
    - `/lip-sync-video-editor` ;
    - `/music-video-maker-for-rappers` ;
    - `/how-to-make-a-lip-sync-video` ;
    - `/edit-video-to-the-beat`.
  - En ajouter 2 qui collent au vocabulaire US (voir le constat 6) :
    - `/rap-snippet-video` ;
    - `/multi-take-performance-video`.
  - Aucune page « vs » (décision respectée).
- **Effort** : moyen. **Responsable** : Marketing & croissance, avec App et Comptes pour la bascule de la racine.

### 6. Le message parle « lip-sync », les rappeurs américains parlent « snippet »
- **Ce que j'ai trouvé**
  - [Fait] Le titre de l'accueil est « Stalak: free lip-sync video editor that cuts your takes to the beat ».
  - [Fait] SEO.md note que sur « lip sync app », Google montre surtout des **outils d'IA qui fabriquent une fausse bouche**.
  - [Fait] Les recherches confirment : ce sont des pages d'outils de synchro labiale par IA (sync.so, LipDub…) qui sortent ([sync.so](https://sync.so/blog/best-ai-lip-sync-tools-for-video-editors), [lipdub.ai](https://lipdub.ai/pricing)).
- **Pourquoi c'est important**
  - « Lip-sync » attire aussi les gens qui veulent faire parler une photo avec l'IA : ils repartent aussitôt.
  - [Estimation] Un rappeur américain dit plutôt :
    - « snippet » (l'extrait qu'il poste avant la sortie) ;
    - « performance video », « multi-angle » ;
    - « cut on the beat », « rollout » (la promo d'une sortie).
- **Action proposée**
  - Garder « lip-sync » dans la balise de titre, pour Google.
  - Écrire le titre visible (H1) et l'accroche autour du résultat. Par exemple : « Turn your takes into a snippet cut on the beat » ; sous-titre : « Drop your song + 3 takes. Stalak cuts between them on the beat, mouth perfectly in sync. Free, in your browser. »
  - Ajouter partout la précision « your real takes, no AI face », pour se distinguer des outils d'IA.
- **Effort** : petit. **Responsable** : Marketing & croissance.

### 7. L'accueil est lourd et son texte est enterré : risque pour le classement et pour le premier affichage sur iPhone
- **Ce que j'ai trouvé**
  - [Fait] `public/en/index.html` pèse **1,02 Mo**, dont **777 Ko de JavaScript écrit dans la page** ; il est servi avec `Cache-Control: no-cache` (`_headers`). Le téléphone revérifie donc la page à chaque visite.
  - [Fait] Le titre principal (H1) est le **bouton du logo** (« Stalak »), sans aucun mot-clé.
  - [Fait] Le texte « What is Stalak? » commence après environ 200 Ko de code.
  - [Fait] Dans les données structurées de l'accueil, l'offre gratuite est en **EUR** (`"priceCurrency": "EUR"`), alors que la page tarifs est en USD. Les offres Pro n'y figurent pas.
  - [Fait] Côté technique, le reste est propre :
    - `canonical` sur chaque page ;
    - `hreflang` réciproques, avec `x-default` sur l'accueil ;
    - `robots.txt` qui pointe vers le plan du site ;
    - `llms.txt` clair, sans concurrent cité.
  - Seul petit manque : pas de `x-default` sur les paires tarifs et pages légales.
- **Pourquoi c'est important**
  - [Estimation] Sur une 4G américaine moyenne, 1 Mo à décoder avant l'affichage retarde l'apparition de l'écran (mesure LCP). Les visiteurs venus de TikTok sont très impatients.
  - Google lit le H1 et le début du texte pour comprendre de quoi parle la page.
- **Action proposée**
  - Passer `priceCurrency` en USD et ajouter les offres Pro et Creator Plus à `WebApplication`.
  - Donner un vrai H1 texte (le logo peut rester à côté).
  - Mettre le JavaScript de l'app dans un fichier `.js` séparé, mis en cache longtemps avec un nom versionné.
  - Mesurer avant et après avec PageSpeed Insights sur mobile.
  - Vérifier que le plan du site est bien envoyé dans Search Console : SEO.md dit que ça n'a pas pu être vérifié.
- **Effort** : moyen. **Responsable** : App & montage (découpage du JS) + Marketing & croissance (H1, données structurées).

### 8. La pub récompensée rapportera très peu : la traiter comme un tremplin vers Pro, pas comme une source de revenu
- **Ce que j'ai trouvé**
  - [Fait] Une source spécialisée annonce environ **4 $ et plus pour 1 000 vues** de pubs vidéo récompensées sur le web (jeux web, moyenne mondiale, septembre 2026), contre 0,50 à 2 $ pour une bannière. Ses taux de participation sont des exemples, pas des mesures ([AppLixir](https://www.applixir.com/?p=4387)).
  - [Fait] D'autres disent « 2 à 3 fois une bannière » et visent plus de 80 % de vidéos vues jusqu'au bout ([Ezoic](https://www.ezoic.com/blog/setting-up-rewarded-ads-in-web-apps-and-websites-a-technical-guide)).
  - [Fait] Aucune source sérieuse ne donne de **taux de remplissage** (la part des demandes pour lesquelles une pub est vraiment disponible) pour le web mobile américain. Google demande que la pub reste visible au moins 7 s et qu'une page d'accord (« opt-in ») soit construite par l'éditeur ([Google Ad Manager](https://support.google.com/admanager/answer/9116812?hl=en)).
  - [Fait] Solution de repli : l'**Offerwall AdSense** permet de proposer une pub récompensée sans compte Ad Manager ([Ezoic](https://www.ezoic.com/blog/setting-up-rewarded-ads-in-web-apps-and-websites-a-technical-guide), [Search Engine Land](https://searchengineland.com/google-offerwall-launches-457591)).
  - [Fait] Paddle prend **5 % + 0,50 $** par paiement ([Dodo Payments](https://dodopayments.com/blogs/paddle-fees-explained)). Un Pro mensuel à 7,99 $ rapporte donc environ **7,09 $**.
- **[Estimation] Le calcul**
  - Hypothèses : 5 à 15 $ pour 1 000 vues aux États-Unis, en partie remplies seulement sur Safari iPhone (Safari limite le suivi publicitaire).
  - Une vue de pub rapporte donc environ 0,5 à 1,5 centime.
  - **Un seul abonné Pro mensuel vaut 500 à 1 400 vues de pub.**
  - Avec 1 000 exports gratuits par jour et 30 % de personnes qui regardent la pub : environ 45 à 135 $ par mois.
- **Pourquoi c'est important** : si la pub est trop facile, elle remplace l'abonnement au lieu d'y mener.
- **Action proposée**
  - Garder la pub (décision respectée), mais à chaque fois, afficher à côté du bouton : « Or never see ads again: Pro $4.17/mo ».
  - Après 3 pubs regardées dans le mois, proposer Pro avec la vidéo d'aperçu sans filigrane.
  - Prévoir un message clair quand aucune pub n'est disponible (fréquent sur iPhone).
  - Choisir pub personnalisée ou non pour les États-Unis (STATUS, Juridique) en sachant que la pub non personnalisée rapporte nettement moins.
- **Effort** : petit. **Responsable** : App & montage + Marketing & croissance.

### 9. Les prix sont raisonnables face au marché, la remise annuelle est très forte
- **Ce que j'ai trouvé**
  - [Fait] Prix du marché :
    - CapCut : Standard 9,99 $/mois, Pro 19,99 $/mois sur l'App Store américain (environ 179,99 $/an) ([hooked.so](https://www.hooked.so/compare/capcut-pricing), [CreatorFlow](https://creatorflow.so/blog/best-video-editing-app-instagram-reels/)) ;
    - Captions : Pro 9,99 $/mois ;
    - **Edits (Meta) : gratuit, sans filigrane** ;
    - CapCut gratuit exporte tes propres images sans filigrane ([CreatorFlow](https://creatorflow.so/blog/best-video-editing-app-instagram-reels/)).
  - [Fait] Prix de Stalak :
    - Pro : 7,99 $/mois ou 49,99 $/an (**−47 %**) ;
    - Creator Plus : 14,99 $ ou 99,99 $/an (**−44 %**) ;
    - l'annuel est coché par défaut.
- **[Estimation] Lecture**
  - 7,99 $ est sous les éditeurs connus : c'est cohérent pour un outil spécialisé, je ne remets pas le prix en cause.
  - Le filigrane en gratuit n'est acceptable que parce que la **coupe automatique sur le rythme** n'existe pas gratuitement ailleurs. Le site doit montrer ça en premier.
  - Une remise de 44 à 47 % est au-dessus de l'habituel (environ 15 à 40 %). Elle rapporte de la trésorerie, mais un artiste qui ne publie que pendant ses sorties prendra peut-être le mois seulement.
  - Creator Plus vend des « packs » : sa valeur se comprend mieux autour d'une sortie (« 30 snippets for your release, in one click ») que comme « Creator ».
- **Action proposée**
  - Ne rien changer avant d'avoir 4 semaines de vrais paiements.
  - Ensuite, regarder la part d'annuels et les remboursements.
  - Si l'annuel domine, tester 59,99 $/an (−37 %) pour les **nouveaux** abonnés seulement (les abonnés gardent leur prix).
  - Reformuler Creator Plus autour de la sortie d'un morceau (« for your release week »).
- **Effort** : petit. **Responsable** : Marketing & croissance (puis Propriétaire pour toute décision de prix).

### 10. Les moments qui donnent envie de passer à Pro ne sont pas encore construits
- **Ce que j'ai trouvé**
  - [Fait] Les cadenas existent : Clip 16:9, karaoké, packs (STATUS).
  - [Fait] L'idée « P1 : présenter Pro juste après le premier export réussi, avec la même vidéo sans logo et en karaoké » est notée mais pas faite (STATUS, Marketing).
  - [Fait] Aucun essai gratuit de Pro n'est prévu.
- **Pourquoi c'est important**
  - [Estimation] Le meilleur moment pour vendre, c'est juste après « wow, ma vidéo est prête ».
  - Un aperçu de 3 secondes du mode karaoké ou du clip 16:9 sur **sa propre vidéo** convainc mieux qu'un tableau.
- **Action proposée**
  - Après le 1er export : écran « Here's your video without the watermark + karaoke lyrics », avec un aperçu animé de 3 s, un bouton Pro et un bouton « Keep free » bien visible. Une fois par session au plus.
  - Laisser **voir** le clip 16:9 et un pack de 5 en aperçu, avec le filigrane et sans export.
  - Plus tard, un essai de 7 jours sur l'annuel. Paddle gère les essais, à voir avec Comptes.
- **Effort** : moyen. **Responsable** : App & montage + Comptes / paiements / serveur.

### 11. Partage et bouche-à-oreille : il manque la légende prête à copier et un tag commun
- **Ce que j'ai trouvé**
  - [Fait] Le bouton de partage vers TikTok, Instagram et YouTube existe (`post.share`).
  - [Fait] Il n'y a pas de **légende à copier** avec « stalak.app » et un hashtag : l'idée A1 de STATUS n'est pas faite.
  - [Fait] Il n'y a pas de parrainage.
- **Pourquoi c'est important**
  - [Estimation] Chaque vidéo postée par un utilisateur peut amener de nouveaux rappeurs si la légende cite l'outil.
  - Un hashtag commun (#madewithstalak) crée une galerie publique sur TikTok et Instagram, sans budget.
- **Action proposée**
  - À l'export, proposer une légende modifiable, copiée en un appui : « Cut with stalak.app 🧊 #madewithstalak ». Elle doit être facultative et ne jamais être ajoutée sans l'accord de l'utilisateur.
  - Après les vrais paiements, ajouter un parrainage simple : « Give a friend 1 month of Pro, get 1 month free ». C'est géré par Comptes avec des codes Paddle.
  - Repartager les meilleures vidéos #madewithstalak, **avec l'accord écrit** de l'artiste.
- **Effort** : petit (légende) / moyen (parrainage). **Responsable** : App & montage + Marketing & croissance, puis Comptes pour le parrainage.

### 12. Les gratuits n'ont pas de compte : aucun moyen de les faire revenir
- **Ce que j'ai trouvé**
  - [Fait] Le gratuit se fait sans compte, et l'e-mail de rappel quotidien est abandonné (décision respectée).
  - [Fait] L'invitation à installer l'app sur l'écran d'accueil existe (`install.ios`).
- **Pourquoi c'est important**
  - [Estimation] Un rappeur sort un morceau toutes les quelques semaines. S'il ne pense pas à Stalak pour le suivant, on l'a perdu.
  - Les e-mails sont le seul canal qu'on possède vraiment, sans l'algorithme d'un réseau.
- **Action proposée**
  - Après un export, proposer une case **facultative** : « Get new features & tips for your next release (1 email/month) ». C'est différent du rappel quotidien abandonné.
  - Respecter la loi américaine sur les e-mails (CAN-SPAM) : lien de désinscription et adresse postale dans chaque e-mail.
  - Mettre en avant l'installation sur l'écran d'accueil juste après le 1er export réussi.
  - À suivre : la part des visiteurs qui reviennent dans les 30 jours.
- **Effort** : petit à moyen. **Responsable** : Marketing & croissance + Comptes / paiements / serveur.

### 13. Le plan de diffusion sans budget est bon, mais il a 3 pièges et 2 manques
- **Ce que j'ai trouvé**
  - [Fait] **TikTok** : il faut **1 000 abonnés** pour avoir un lien cliquable dans la bio avec un compte personnel. Un compte Business l'a tout de suite, mais avec moins de musiques disponibles : à éviter pour un outil musical ([Stan](https://stan.store/blog/tiktok-link-bio-requirements-2026-guide/)).
  - [Fait] **Reddit** : la règle d'usage est environ 90 % de participation pour 10 % de promo. Il est conseillé de participer 2 à 4 semaines avant de promouvoir, et poster le même lien dans plusieurs groupes le même jour mène à un bannissement de tout le site ([Redship](https://redship.io/blog/reddit-self-promotion-rules-2026)).
  - [Fait] **Triller** : ses services ne marchent plus depuis août 2026 et l'app n'est plus téléchargeable ([Wikipedia](https://en.wikipedia.org/wiki/Triller_(app))). Son public existe encore, mais le site ne le cite plus.
- **Pièges**
  - Sur TikTok, au début, mettre « stalak.app » **dans la vidéo et la légende**, pas seulement dans la bio.
  - Sur Reddit, commencer à participer **dès maintenant** avec le compte de 99Sayso, pour qu'il ait un historique le jour du post.
  - Pour « I'm editing your snippet » : accord écrit de chaque artiste (déjà prévu), et ne jamais réutiliser son morceau ailleurs.
- **Manques**
  - [Estimation] **Les beatmakers de « type beats » sur YouTube** : leurs clients sont exactement des rappeurs. Proposer Creator Plus offert à 5 à 10 producteurs, contre une démo honnête, mentionnée comme cadeau (règles FTC : « gifted », #ad). C'est un partenariat déclaré, pas une pub déguisée.
  - [Estimation] **YouTube en format long** (tutos de 5 à 8 min, « how to make a rap snippet video from 3 takes ») : ces vidéos restent trouvables des années, contrairement à TikTok.
- **Action proposée** : ajouter ces 2 canaux au calendrier de 4 semaines de US_FIRST, et commencer Reddit par 2 semaines de simple participation.
- **Effort** : petit. **Responsable** : Propriétaire + Marketing & croissance.

### 14. Structure juridique : le plafond de la micro-entreprise est loin de l'objectif, et les documents se contredisent
- **Ce que j'ai trouvé**
  - [Fait] Le contexte de cette tâche parle d'une **micro-entreprise française** (plafond d'environ 83 600 € par an pour les services).
  - [Fait] Mais STALAK_CONTEXTE §2 dit encore « **une LLC américaine est prévue** », alors que STATUS (Juridique) la remet en question et penche pour la micro-entreprise.
  - [Fait] L'objectif écrit dans STRATEGIE_REVENUS est de **30 000 € par mois**.
- **[Estimation] Le calcul**
  - 83 600 € par an, c'est environ **7 000 € par mois**.
  - Avec environ 7,09 $ net par Pro mensuel, le plafond est atteint vers 1 000 à 1 100 abonnés Pro.
  - Ce n'est pas un problème à court terme, mais il faut prévoir le passage à une autre forme de société si la croissance arrive.
- **Action proposée**
  - Mettre STALAK_CONTEXTE à jour avec une seule version de la structure.
  - En parler à l'expert-comptable : quand changer de forme, et comment la TVA s'applique quand Paddle revend.
  - Ouvrir AdSense et Paddle au **même nom**.
- **Effort** : petit. **Responsable** : Juridique & business + Propriétaire.

### 15. Le filigrane retiré par la pub n'est vérifié que dans le navigateur
- **Ce que j'ai trouvé**
  - [Fait] « Pas de vérification côté serveur : Google n'en propose pas pour le web » (STATUS).
- **[Estimation]** Un utilisateur habile pourra enlever le filigrane sans regarder la pub. Ce n'est pas grave à cette échelle : le vrai risque est surtout de perdre quelques vues de pub, pas des abonnés.
- **Action proposée** : rien pour l'instant. À regarder seulement si le tableau de bord montre beaucoup d'exports sans filigrane pour peu de pubs vues.
- **Effort** : petit. **Responsable** : App & montage.

---

## Les chiffres à suivre chaque semaine
1. Visites venues des États-Unis, par `ref` (réseau).
2. Part des visiteurs qui font un **1er export** (activation).
3. Exports gratuits : avec filigrane / avec pub regardée. Plus les pubs demandées sans réponse (remplissage).
4. Ouvertures de la page Pro → achats (conversion), mensuel ou annuel, et remboursements sous 14 jours.
5. Visiteurs qui reviennent dans les 30 jours (rétention).
6. Visites venues de `?ref=wm` ou d'une légende copiée (boucle du filigrane).
7. Search Console : recherches américaines qui amènent des clics (elles diront quelles pages créer ensuite).

## Faits et estimations, en résumé
- **Faits sourcés** :
  - prix CapCut, Captions et Edits ;
  - frais Paddle ;
  - conditions des pubs récompensées Google et accès à Ad Manager ;
  - règles du lien TikTok et de Reddit ;
  - état de Triller ;
  - contenu des fichiers du dépôt.
- **Estimations (à vérifier avec de vraies données)** :
  - revenu par vue de pub et revenu publicitaire mensuel ;
  - effet du poids de la page ;
  - vocabulaire « snippet » ;
  - niveau « habituel » de remise annuelle ;
  - nombre d'abonnés au plafond de la micro-entreprise ;
  - intérêt des beatmakers.

## Sources
- Google Ad Manager, pubs récompensées pour le web : https://support.google.com/admanager/answer/9116812?hl=en
- MonetizeMore, accès à Ad Manager (AdSense requis) : https://www.monetizemore.com/blog/how-to-sign-up-to-google-ad-manager/
- AppLixir, revenus des pubs récompensées sur le web (sept. 2026) : https://www.applixir.com/?p=4387
- Ezoic, pubs récompensées web et Offerwall AdSense : https://www.ezoic.com/blog/setting-up-rewarded-ads-in-web-apps-and-websites-a-technical-guide
- Search Engine Land, Google Offerwall : https://searchengineland.com/google-offerwall-launches-457591
- hooked.so, prix CapCut 2026 : https://www.hooked.so/compare/capcut-pricing
- CreatorFlow, Edits / CapCut / Captions 2026 : https://creatorflow.so/blog/best-video-editing-app-instagram-reels/
- Dodo Payments, frais Paddle 2026 : https://dodopayments.com/blogs/paddle-fees-explained
- Stan, lien dans la bio TikTok 2026 : https://stan.store/blog/tiktok-link-bio-requirements-2026-guide/
- Redship, règles d'autopromotion Reddit 2026 : https://redship.io/blog/reddit-self-promotion-rules-2026
- Wikipedia, Triller (app) : https://en.wikipedia.org/wiki/Triller_(app)
- Résultats « lip sync » dominés par l'IA : https://sync.so/blog/best-ai-lip-sync-tools-for-video-editors , https://lipdub.ai/pricing
- Fichiers du dépôt : `docs/STALAK_CONTEXTE.md`, `docs/STATUS.md`, `docs/marketing/*.md`, `public/en/index.html`, `public/en/pricing.html`, `public/sitemap.xml`, `public/llms.txt`, `public/_headers`, `public/_redirects`, `src/app.js` (lignes 5013-5040), `build_site.py`.
- Non consulté (refusé par l'outil) : https://stalak.app/en/ , https://stalak.app/en/pricing , https://stalak.app/llms.txt , https://stalak.app/sitemap.xml , https://camrip.app
