# « Stats » et analyse de l'artiste : Apify, Spotify, champ libre, liens (24/11/2026)

> Rôle Juridique & business. Infos pour décider, **pas un avis juridique**. À faire relire par un pro avant d'activer le relevé Apify.
> Les pages (confidentialité FR/EN, `#artist-profile` / `#profil-artiste`, et section 10 des conditions) décrivent ce qui est prévu dans `docs/handoff/chef-stats-analyse.md`. Elles ne doivent pas être publiées avant que Comptes et App aient fait ce qui est annoncé.

## 1. Relevé hebdomadaire des chiffres publics Spotify par Apify : le point sensible
- **Changement de position à signaler.** Le 23/11 j'avais écrit (et c'est resté dans la page jusqu'à aujourd'hui) « nous ne lisons pas ces pages », parce que lire la page publique Spotify est **contraire aux conditions de Spotify** (accès automatisé interdit). Le Chef de projet décide maintenant de le faire par un robot Apify. Je n'ai pas remis en cause la décision, mais le risque reste :
  - **Risque contractuel** : Spotify peut bloquer le robot, couper l'accès développeur Spotify de Stalak (qui sert aux sorties) et, au pire, résilier le compte. Ce n'est pas un délit pénal pour des chiffres publics sur la page de l'artiste lui-même, mais c'est une rupture de leurs conditions.
  - **Fragilité** : Spotify change sa page, le robot casse, les chiffres manquent. D'où la règle : **jamais de chiffre inventé ou estimé**, message « chiffres pas mis à jour cette semaine » (écrit dans la page).
  - **Atténuation conseillée** : ne relever que la page de **l'artiste qui a donné son propre lien** (c'est le cas : « à sa demande »), une fois par semaine, sans contourner de blocage, et prévoir de **s'arrêter sans casse** si Spotify s'y oppose. Le texte de la page ne promet pas un relevé garanti.
- **RGPD** : les chiffres d'un artiste qui est une personne physique sont des données personnelles. Base = **la demande de la personne** (elle donne le lien pour avoir l'analyse), arrêt possible à tout moment (retirer le lien). Apify est un **sous-traitant** : il faut son **accord de traitement des données (DPA)** : à accepter dans le compte Apify (comme pour Google). Apify est tchèque (UE) mais peut employer des prestataires aux États-Unis : écrit dans la page.
- **Ce qu'Apify reçoit** : **seulement l'adresse publique de la page d'artiste** (pas de nom, d'e-mail, d'identifiant de compte). À respecter par Comptes : rien d'autre dans l'appel.
- **Durée chez Apify** : Apify garde les résultats de ses exécutions un certain temps. Comptes doit **récupérer le résultat puis supprimer** l'exécution et le jeu de données (ou régler la durée au minimum) ; la page dit « nous effaçons ensuite la copie qu'il garde ».
- **Durée chez nous** : les chiffres hebdomadaires sont gardés avec le profil, **jusqu'à retrait du lien Spotify ou suppression du compte** (effacés alors). Pas de règle pour les comptes inactifs : si on en veut une, je l'ajoute.
- Secret `APIFY_TOKEN` : saisi par le propriétaire, jamais dans le code ni la conversation (règle du projet).

## 2. Sorties Spotify par l'API officielle
- Appel public au catalogue (`GET /artists/{id}/albums`) : aucune donnée sur l'utilisateur ne part vers Spotify, et on ne lit aucun compte d'utilisateur Spotify. C'est la voie **autorisée**.
- **Gardé** : nombre de sorties par mois et date de la dernière. **Pas** les pochettes ni l'audio (c'est écrit : si Comptes garde aussi les titres, il faut me le dire pour changer la page).
- **Conditions développeur Spotify** (à vérifier par le propriétaire à la création de l'accès, car elles ont changé en 2026 : Premium exigé, accès limité en mode « développement ») : un service payant comme Stalak peut avoir besoin d'une **demande d'accès étendu** ; respecter leurs règles d'affichage (ne pas laisser croire à un partenariat : la page dit que Stalak n'est pas affilié) et de conservation des données.

## 3. Champ libre « ce que tu fais » (si « Autre »)
- Du texte libre peut contenir **n'importe quoi** (santé, opinions, noms de tiers). La page demande de ne rien écrire de sensible. Côté Comptes : **limite de longueur (par exemple 100 caractères)**, pas d'envoi à GA4, Clarity ni TikTok, et **masqué dans Clarity** (champ de saisie).
- **Si l'analyse est écrite par une IA** (Workers AI ou autre) à partir de ce texte et des chiffres, il faut le **dire** (la page parle déjà de Workers AI pour les paroles et l'aide) : à confirmer par le Chef de projet ; sinon rien à ajouter.

## 4. Liens TikTok et YouTube
- **YouTube** : seulement le lien gardé, rien n'est lu (écrit).
- **TikTok** : le lien seul ne donne que le lien ; les statistiques TikTok viennent **uniquement de la liaison du compte** (déjà couverte par la section TikTok). **À confirmer** : la maquette dit « On analyse ton TikTok… » avant la création de compte. Si ce message sous-entend de lire la page TikTok par le lien (sans liaison), c'est un **relevé public non autorisé** de plus (conditions de TikTok) et la page serait fausse : le message doit rester vrai (« On prépare ton analyse… ») ou passer par la liaison.
- **Chaque message du chargement doit être vrai** (règle déjà posée) : ne pas écrire « On lit tes sorties Spotify… » si le lien n'a pas été donné.

## 5. Parcours : compte après le questionnaire
- Le questionnaire se fait **avant** la création du compte : les réponses restent **dans le navigateur** (écrit), puis passent au compte à la création. Informer à l'écran avant la saisie des liens : « On relève chaque semaine tes chiffres publics Spotify pour ton analyse », avec un lien vers la page `#profil-artiste`. C'est l'information « au moment de la collecte » que le RGPD demande ; la page seule ne suffit pas pour une collecte nouvelle et automatique.
- « Passer » : dire clairement que « Stats » ne peut pas analyser sans les liens (fait dans le parcours demandé).
- **Mineurs** : pas d'âge minimum (décision du 30/10) ; ce relevé ne cible personne et ne sert pas à la publicité : pas de point nouveau, mais une raison de plus de ne rien envoyer à TikTok ou GA4.
- **Floutage + cadenas** de l'analyse : permis, tant qu'on ne cache pas l'essentiel d'une obligation (prix, essai, annulation) ; le bilan gratuit en 3 phrases doit être **vrai** et issu de **vraies données** (pas d'exemple présenté comme le sien). L'aperçu flouté avant création du compte ne doit pas montrer de **fausses valeurs présentées comme les siennes** ; mieux : un aperçu clairement générique.
- **Paywall** : mêmes règles que l'offre 1 € (voir `MESURE_ET_OFFRE_1_EURO.md` § 8).

## 6. Mode Clip réservé aux abonnés : vérification des pages
- **Conditions FR/EN, remboursement, mentions légales** : **aucune promesse d'essai gratuit du mode Clip**. Le mode Clip n'y apparaît que dans la liste de ce que contient Pro (« le mode Clip 16:9 ») et l'essai gratuit de 7 jours est bien celui de **Stalak Pro** (carte demandée, prélèvement, annulation), donc inchangé.
- **Pages de Marketing** (pas modifiées par moi) qui promettent encore l'essai du Clip gratuit : `site_src/pricing.html` ligne 107 (« Try it free », « Pick “Music video” at step 1 ») ; `site_src/fr/tarifs.html` lignes 107 (« Essaie-le gratuitement ») et 145 (« Essaie-le gratuitement dans l'aperçu ») ; `site_src/music-video.html` ligne 94 (« Try it free ») et ligne 98 (« watch your whole music video in the preview ») ; `site_src/fr/clip.html` méta description (« Essai gratuit »), lignes 56, 94 et 98 (« Je peux l'essayer gratuitement ? Oui… »). Aussi la page de l'autre langue du clip pour rappeurs (`music-video-maker-for-rappers`), à relire.
- **Pourquoi c'est un point de droit** : promettre un essai gratuit qui n'existe plus est une pratique commerciale trompeuse. Et le mot « essai gratuit » seul est ambigu avec l'essai Pro de 7 jours (carte demandée) : il faut écrire « **Essai gratuit de Stalak Pro, 7 jours, carte demandée** » avec les conditions du paywall à côté.
- **Un projet Clip déjà commencé par un gratuit** : ne rien lui retirer sans prévenir (demandé à App) ; pas de point de droit tant qu'il garde ses fichiers (ils sont sur son appareil).
