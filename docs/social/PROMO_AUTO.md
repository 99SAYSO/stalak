# Vidéos promo de Stalak : création chaque dimanche, publication après ton « ok »

> Conversation « 4. Réseaux sociaux ». Mis en place le 3/11/2026 à la demande du propriétaire.
> Le contenu suit le plan de Marketing : `docs/marketing/US_FIRST.md` (partie B) et le document « Stalak — plan de lancement et réseaux ».
> Comptes publiés : TikTok et Instagram **@stalak_app**, par **Zernio**.

## Comment ça marche

1. **Chaque dimanche après-midi (heure de Paris)**, une tâche programmée :
   - relève les chiffres des vidéos de la semaine passée et les note dans le journal ;
   - fabrique **7 vidéos** à partir des modèles validés (voir « Les modèles ») ;
   - écrit pour chacune : légende, hashtags, jour et heure prévus, réglages TikTok ;
   - te les envoie sur ton téléphone, et les dépose dans la **Salle de visionnage**.
2. **Toi** : tu regardes. Pour une remarque, utilise la Salle de visionnage, puis écris « c'est bon » : seuls ces points sont repris. Quand tout te va, écris **« ok »** dans la conversation de la tâche.
3. **Après ton « ok » seulement**, la tâche programme les 7 vidéos dans Zernio : une par jour, du lundi au dimanche suivants.

**Rien n'est publié sans ton « ok ».** Pas d'« ok » = rien n'est programmé, même si la semaine commence.
Un « ok » sur une partie seulement (« ok sauf la 4 ») ne programme que les vidéos validées.

## Ce que tu fais une fois

- Créer ton compte Zernio et y relier TikTok et Instagram @stalak_app (gratuit jusqu'à 2 comptes).
- Dans Claude : **Paramètres → Connecteurs → Ajouter un connecteur personnalisé**.
  - Nom : `Zernio` ;
  - adresse : `https://mcp.zernio.com/mcp` ;
  - puis « Se connecter » avec ton compte Zernio.
  - Si une clé est demandée, tu la tapes **à cet endroit seulement**, jamais dans une conversation.
- Dans les réglages des outils du connecteur Zernio, mets **`posts_publish_now` sur « Bloqué »**. C'est une deuxième sécurité : rien ne peut partir tout de suite, même par erreur.
- Bio Instagram : `stalak.app/?ref=ig`. Bio TikTok : `stalak.app/?ref=tiktok`, une fois les 1 000 abonnés atteints (avant, le lien de la bio n'est pas cliquable).
- Pour les formats qui montrent de vraies prises : déposer tes prises dans un dossier Google Drive « Stalak promo — prises ». Pour celles d'autres artistes, il faut leur accord écrit.

## Ce que TikTok et Instagram autorisent (vérifié le 3/11/2026)

| Règle | TikTok | Instagram |
|---|---|---|
| Programmer par un outil officiel (Zernio) | Oui, par l'API officielle (Content Posting API) | Oui, par l'API officielle (Content Publishing) |
| Limite | 15 vidéos par jour et par compte (Zernio met le reste en attente) | 100 publications par 24 h |
| Ton accord avant envoi | **Obligatoire** : voir la vidéo, choisir soi-même la visibilité et les options, puis accepter | Pas exigé, mais on garde la même règle |
| Pub pour ton propre produit | Mention **« Ta marque »** obligatoire : la vidéo affiche « Contenu promotionnel » | « Partenariat rémunéré » réservé aux marques tierces : pas pour nous |
| Voix off IA (ton choix du 3/11) | Étiquette **« contenu généré par IA »**, ou mention claire dans la vidéo ou la légende | Étiquette IA obligatoire pour une voix réaliste faite par IA (Meta peut sanctionner sinon) |
| Interdit | Contenu recopié ou répétitif (exclu du fil « Pour toi »), comptes gérés en masse par des robots, contenu commercial en très grand nombre | Faux avis, faux chiffres, comportement inauthentique |
| Musique | Tes sons ou une musique libre de droits, jamais un son connu | Pareil |

**Ce qu'on fait pour respecter tout ça :**
- 7 vidéos toutes différentes chaque semaine ;
- « AI voiceover » écrit en petit sur la fin de chaque vidéo **et** dans la légende, en plus de l'étiquette IA quand Zernio permet de la cocher ;
- « Ta marque » toujours activé sur TikTok ;
- aucun faux avis, aucun chiffre inventé, aucun concurrent cité. Des avis des bêta-testeurs (Bloody, Kazzy, h€r) seulement avec leurs vrais mots, leurs pseudos et sans leur photo ;
- des liens non cliquables dans les légendes (c'est le cas sur les deux réseaux) : « stalak.app » est écrit dans la vidéo et dans la légende.

### Réglages proposés pour chaque vidéo (à confirmer par ton « ok »)

- **TikTok** :
  - visibilité « Tout le monde » ;
  - commentaires oui, Duo non, Collage non ;
  - « Ta marque » oui ;
  - étiquette IA oui.
- **Instagram** : Reel partagé aussi dans le fil, étiquette IA si Zernio le permet.

Tu peux changer n'importe quel réglage pour une vidéo (« la 3 : Duo oui »).
TikTok demande que rien ne soit choisi à ta place : ces réglages te sont montrés à chaque fois, et c'est ton « ok » qui les valide.

## Les modèles (« modèles + variations », ton choix du 3/11)

On crée ensemble 3 ou 4 modèles une seule fois, avec les skills `code-motion-video` et `saas-motion-video`, et tu les valides dans la Salle de visionnage. Ensuite, chaque dimanche, la tâche les remplit avec du nouveau : accroche, nouveautés de la semaine, tes prises, musique.
Propositions de modèles, d'après les 5 types de vidéos du plan :

| Code | Modèle | Ce qui change chaque semaine |
|---|---|---|
| A | **Avant / après** : « 3 takes → 1 edit » | Tes prises (dossier Drive) |
| B | **Build in public** : « Here's what I added this week » | Les vraies nouveautés de la semaine (historique du dépôt) |
| C | **Tuto express** : comment faire un snippet en 3 étapes | L'étape ou la fonction mise en avant |
| D | **Accroche + démo** : une phrase choc, puis l'app en action | L'accroche (liste du plan, puis les nouvelles qui marchent) |
| E | **Tu préfères** (format de la promo v6, que tu avais validée) | Les questions |

Les modèles validés sont rangés dans `promo/series/<code>/` (sources seulement, jamais les vidéos ni les musiques).

## Les tests : trouver ce qui marche (ta demande du 3/11)

On fait varier **une chose à la fois de manière organisée**, et on note tout.

**Heures** : 7 créneaux, heure de New York. La vidéo part à la même heure sur TikTok et Instagram.

| Créneau | New York | Paris (heure d'hiver) |
|---|---|---|
| 1 | 7 h 30 | 13 h 30 |
| 2 | 11 h | 17 h |
| 3 | 13 h 30 | 19 h 30 |
| 4 | 16 h | 22 h |
| 5 | 18 h | minuit |
| 6 | 19 h 30 | 1 h 30 |
| 7 | 21 h 30 | 3 h 30 |

Chaque semaine, chaque créneau sert **une fois**. Les créneaux décalent d'un jour d'une semaine à l'autre : en 7 semaines, chaque créneau est passé par chaque jour, et on sépare l'effet du jour de celui de l'heure.
Semaine 1 (lundi 9/11) : lun 19 h 30, mar 21 h 30, mer 7 h 30, jeu 11 h, ven 13 h 30, sam 16 h, dim 18 h. Semaine 2 : on décale d'un cran (lun 21 h 30, mar 7 h 30…).

**Types et accroches** : chaque semaine, au moins 4 modèles différents sur les 7 vidéos, et 7 accroches différentes.

**Ce qu'on note** (journal `docs/social/promo-journal.csv` sur la branche `social/promo-journal`, mis à jour par la tâche chaque dimanche) :
- n° de semaine, date, jour, créneau, heure de New York ;
- réseau, modèle, accroche, durée ;
- puis, relevés dans Zernio : vues, j'aime, commentaires, partages, enregistrements, à 3 jours et à 7 jours.

Les visites du site par réseau (`ref=tiktok`, `ref=ig`) se lisent dans ton tableau de bord, jour par jour.

**Quand on décide** :
- Pas avant **4 semaines** (28 vidéos par réseau). Avant, les chiffres sont trop petits pour conclure.
- On compare les **médianes** (la valeur du milieu), pas les records : un seul gros succès ne prouve rien.
- Il faut au moins 3 vidéos par cas comparé.
- Ensuite : **70 %** des vidéos sur ce qui marche le mieux, **30 %** pour continuer à tester. Le rapport du dimanche le propose ; c'est toi qui décides.

## Points à vérifier au premier essai

- L'envoi du fichier vidéo vers Zernio depuis l'espace de travail de Claude. Si ça bloque, solution de secours : un lien de partage Google Drive que Zernio va chercher.
- Les noms exacts des réglages TikTok et de l'étiquette IA dans les outils de Zernio : ils seront visibles une fois le connecteur relié.
- La voix off IA : voix de Google Flora, comme les promos précédentes, avec le prix en dollars indiqué dans le rapport.

## Sources (consultées le 3/11/2026)

- TikTok : [règles de partage de contenu (Direct Post)](https://developers.tiktok.com/doc/content-sharing-guidelines), [règles de la communauté, intégrité et authenticité](https://www.tiktok.com/community-guidelines/integrity-authenticity/), [Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started).
- Instagram : [Content Publishing, limite de 100 publications par 24 h](https://developers.facebook.com/docs/instagram-platform/content-publishing), [étiquette IA exigée par Meta (Axios)](https://www.axios.com/2024/02/06/meta-ai-labeling-fix-oversight-board).
- Zernio : [MCP pour les réseaux sociaux](https://zernio.com/blog/social-media-mcp), [plugin Claude](https://github.com/zernio-dev/zernio-claude-plugin), [API TikTok de Zernio](https://zernio.com/tiktok-api).
