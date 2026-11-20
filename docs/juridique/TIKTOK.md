# TikTok : ce que disent la confidentialité et les conditions, ce que Réseaux sociaux doit garder vrai (21/11/2026)

> Rôle Juridique & business. Infos pour décider, **pas un avis juridique**. Pages : `/privacy#tiktok`, `/fr/confidentialite#tiktok`,
> `/terms#tiktok`, `/fr/conditions#tiktok`. L'équipe TikTok lira ces pages pendant la validation : le code doit faire exactement ça.

## 1. Ce que les pages promettent (à respecter dans le code)
| Promesse | Aujourd'hui dans le code | À faire (Réseaux sociaux) |
|---|---|---|
| Profil : nom affiché + lien de la photo, gardés tant que le compte est relié | oui (`social_accounts`) | — |
| Stats du compte (abonnés, likes, nb de vidéos) + liste des vidéos publiques (vues, likes) | pas encore (scopes `user.info.stats`, `video.list` à ajouter) | demander ces scopes ; ne rien récupérer d'autre |
| Stats et liste : demandées à l'ouverture de « Mes stats », **gardées 24 h au plus** puis effacées | — | cache de 24 h maximum, effacé au-delà et à la déliaison. **Si l'analyse Pro veut un historique** (évolution sur plusieurs jours), prévenir Juridique : la page doit changer avant |
| Stats visibles **par la personne seule** ; jamais pour la pub ni croisées avec d'autres données | — | jamais dans le tableau de bord admin sous forme individuelle, jamais dans les statistiques globales |
| Jetons **chiffrés** (AES-GCM), jamais affichés | oui | — |
| Publication **seulement quand la personne touche « Publier »**, jamais automatique | — | aucune publication programmée ni en lot sans action de la personne |
| Vidéo envoyée à TikTok, **pas gardée** par Stalak | — | si la vidéo passe par nos serveurs (R2), l'effacer dès la fin de l'envoi (et au plus tard 24 h après) |
| État de publication (date, publish_id, réussie/erreur) gardé **30 jours** | — | purge quotidienne à 30 jours, et à la déliaison |
| « Délier » = révocation chez TikTok + **effacement immédiat** de tout (jetons, nom, photo, stats, états) | révocation + suppression de la ligne : oui | effacer aussi le cache des stats et les états de publication |
| Suppression du compte Stalak = la même chose | oui (`deleteSocialAccounts`) | idem cache et états |
| Accès retiré depuis l'appli TikTok ou lien expiré : **effacement sous 30 jours** | non : la ligne reste en `status = 'expired'` | purge quotidienne des liens expirés ou refusés par TikTok depuis plus de 30 jours |
| Cookie `stalak_c` 10 min, effacé au retour | oui | — |
| Libellés : Compte → TikTok → « Délier » / Account → TikTok → « Unlink » ; bouton « Publier » / « Post » ; page « Mes stats » / « My stats » | interface pas encore faite | utiliser ces mots (ou prévenir Juridique) |

## 2. Règles de TikTok pour l'écran de publication (Direct Post), à respecter pour la validation
Source : TikTok for Developers, « Content Sharing Guidelines ».
- Afficher le nom du compte TikTok qui va recevoir la vidéo (infos du créateur relues à chaque ouverture) ; arrêter si le compte ne peut pas publier ; vérifier la durée maximale.
- **Public (privacy level)** : liste déroulante **sans valeur par défaut**, avec seulement les choix renvoyés par TikTok.
- Commentaires / Duo / Collage : **décochés par défaut**, grisés si le créateur les a coupés.
- Contenu commercial : interrupteur **éteint par défaut**, avec « Ta marque » / « Contenu de marque » et les messages imposés ; « Contenu de marque » ne peut pas être privé.
- Phrase obligatoire avant le bouton : « En publiant, tu acceptes la Confirmation d'utilisation de la musique de TikTok » (lien https://www.tiktok.com/legal/page/global/music-usage-confirmation/en), et la Politique de contenu de marque si besoin.
- Aperçu de la vidéo avant publication ; rien n'est envoyé avant le consentement exprès ; dire que le traitement peut prendre quelques minutes ; suivre l'état de la publication.
- **Légende ou hashtags pré-remplis : permis, mais modifiables par la personne avant publication.**
- **Pas de filigrane ni de logo de l'appli sur la vidéo publiée** : « should not superimpose … any brand name, logo, watermark ». Voir 3.

## 3. Filigrane : DÉCIDÉ (21/11, 0 h 24)
**La publication directe sur TikTok est réservée à Pro et Creator Plus** (vidéos sans filigrane), à cause de la règle de TikTok
qui interdit à une appli d'ajouter son logo ou son filigrane aux vidéos publiées par son outil. Ça remplace « ouverte à tout le
monde » (21/11, 0 h 20).
- Conditions FR/EN : publication TikTok et stats ajoutées à la formule Pro (section 3) ; paragraphe « Publier sur TikTok (Pro et Creator Plus) » (section 9) : clips publiés sans filigrane ; si l'abonnement s'arrête, plus de publication ni de stats jusqu'au réabonnement, et le compte TikTok reste relié jusqu'à ce qu'il soit délié.
- Confidentialité FR/EN : liaison « avec Stalak Pro ou Creator Plus » ; nom et photo gardés même si l'abonnement s'arrête, jusqu'à la déliaison.
- **Pour Réseaux sociaux** :
  - bouton « Relier TikTok », « Publier » et « Mes stats » réservés aux abonnés (gratuits : `acctOpen('tiktok')` vers les formules) ;
  - contrôle côté serveur (`requirePro`) sur la liaison, la publication et les stats ;
  - **jamais de filigrane** sur une vidéo envoyée à TikTok ;
  - abonnement terminé : refuser publication et stats, garder la liaison ; la purge à 30 jours des liens expirés s'applique.
