# Proposition « Reçois ta vidéo par e-mail » : les textes (Marketing, 7/11/2026)

> Demande du propriétaire (7/11, 15 h 19) : préparer les textes de la proposition « Reçois ta vidéo par e-mail », avec Comptes et
> Juridique. C'est la **piste 5** du rapport chiffres du 7/11 (`docs/stats/2026-11-07-rapport.md`). Le propriétaire l'a appelée
> « piste 8 » ; dans le rapport, la 8 est l'abandon au paiement.
> Constat du rapport : presque tout le monde utilise Stalak sans compte ; les gratuits ne laissent pas d'e-mail, on ne peut pas les
> recontacter.
> **Ce document ne contient que des textes.** Rien n'est construit. Les choix qui appartiennent à Comptes, App, Juridique ou au
> propriétaire sont marqués **[À DÉCIDER : qui]**. Ce n'est pas un avis juridique.

## 1. L'idée en deux lignes

Après l'export d'une vidéo, un gratuit sans compte peut taper son e-mail pour recevoir **un lien de téléchargement** de cette
vidéo (pratique quand on monte sur ordinateur et qu'on poste depuis son téléphone). Une **case à part, non cochée**, propose en plus
les nouvelles de Stalak. C'est cette case qui permet de le recontacter ; l'e-mail de la vidéo seul ne le permet pas.

Ce que ça change : la vidéo quitte l'appareil (envoyée sur notre stockage pour le lien). Aujourd'hui, la confidentialité dit
« Stalak ne reçoit pas tes vidéos » : il faudra une exception écrite par Juridique (partie 6).

## 2. Dans l'app : la carte de l'écran de fin

**Où** [À DÉCIDER : App] : sur l'écran de fin (« Your video is ready ✓ » / « Ta vidéo est prête ✓ »), sous « Save video » /
« Enregistrer la vidéo ». Seulement pour un gratuit sans compte, jamais pour l'exemple. Après « No thanks », ne plus la montrer
pendant [30 jours] [À DÉCIDER : App].

Clés proposées : bloc `_bloc.marketing.mailvideo`, préfixe `vbm.` (libre dans `src/app.js` le 7/11).

| Clé | Anglais | Français |
|---|---|---|
| `vbm.t` | Send it to your email | Reçois-la par e-mail |
| `vbm.p` | We’ll email you a link to download it, so you can grab it on your phone or any other device. | On t’envoie un lien pour la télécharger, sur ton téléphone ou n’importe quel autre appareil. |
| `vbm.label` | Your email | Ton e-mail |
| `vbm.ph` | you@example.com | toi@exemple.com |
| `vbm.go` | Email me the video | Envoie-moi la vidéo |
| `vbm.news` | Also send me Stalak news: new features and tips, [about once a month]. Unsubscribe in one click. | Envoie-moi aussi les nouvelles de Stalak : nouveautés et astuces, [environ une fois par mois]. Désinscription en un clic. |
| `vbm.fine` | We only use your email to send this link. Your video goes to our storage for it and is deleted after [7 days]. [Privacy policy] | On se sert de ton e-mail seulement pour t’envoyer ce lien. Ta vidéo passe sur notre stockage pour ça, puis elle est effacée au bout de [7 jours]. [Confidentialité] |
| `vbm.no` | No thanks | Non merci |

La case `vbm.news` n'est **jamais cochée d'avance**, et la vidéo part même si elle reste vide.
La fréquence entre crochets est [À DÉCIDER : propriétaire]. La durée de [7 jours] est [À DÉCIDER : Comptes].

**Pendant l'envoi, après, en cas d'erreur**

| Clé | Anglais | Français |
|---|---|---|
| `vbm.up` | Sending your video… {pct}% | Envoi de ta vidéo… {pct} % |
| `vbm.upKeep` | Keep this page open until it’s done. | Garde cette page ouverte jusqu’à la fin. |
| `vbm.ok` | Sent to {email}. Check your inbox (and your spam folder, just in case). | C’est envoyé à {email}. Regarde ta boîte de réception (et tes spams, au cas où). |
| `vbm.okNews` | A second email asks you to confirm Stalak news. | Un deuxième e-mail te demande de confirmer les nouvelles de Stalak. |
| `vbm.bad` | That email doesn’t look right. | Cette adresse e-mail n’a pas l’air bonne. |
| `vbm.fail` | We couldn’t send your video. Check your connection and try again. | Ta vidéo n’a pas pu partir. Vérifie ta connexion et réessaie. |
| `vbm.big` | This video is too big to send by email ({size}). Save it on this device instead. | Cette vidéo est trop lourde pour l’e-mail ({size}). Enregistre-la plutôt sur cet appareil. |
| `vbm.many` | You’ve sent a lot of videos in a row. Try again in a little while. | Tu as envoyé beaucoup de vidéos d’affilée. Réessaie dans un moment. |

`vbm.okNews` ne sert que si Juridique choisit la double confirmation (partie 4). `vbm.big` et `vbm.many` ne servent que s'il y a une
taille maximale et une limite d'envois [À DÉCIDER : Comptes].

## 3. L'e-mail de la vidéo (transactionnel)

Dans le modèle commun des e-mails (`functions/_lib/mail-layout.js` : carte blanche, glaçons, mascotte, bouton bleu, version texte).
Mascotte proposée : « cool ».

- **Expéditeur** : « Stalak » <[videos@stalak.app ou login@stalak.app]> [À DÉCIDER : Comptes] ; réponses vers contact@stalak.app.
- **Objet** : « Your Stalak video is ready » / « Ta vidéo Stalak est prête »
- **Aperçu** : « Download it on any device. The link works until {date}. » / « Télécharge-la sur n’importe quel appareil. Le lien
  marche jusqu’au {date}. »
- **Titre** : « Here’s your video » / « Voilà ta vidéo »
- **Texte** :
  - EN : « Tap the button to download the video you just made on Stalak ({format}, {duration}). »
  - FR : « Touche le bouton pour télécharger la vidéo que tu viens de faire sur Stalak ({format}, {durée}). »
- **Bouton** : « Download my video » / « Télécharger ma vidéo » → le lien du fichier.
- **Sous le bouton** :
  - EN : « This link works until {date}. After that, the video is deleted from our servers. »
  - FR : « Ce lien marche jusqu’au {date}. Ensuite, la vidéo est effacée de nos serveurs. »
- **Lien secondaire** : « Make another one: stalak.app » / « En faire une autre : stalak.app »
- **Ligne Pro, facultative** [À VALIDER : Juridique, voir 6] :
  - EN : « Want your next videos without the watermark? With Stalak Pro, every video you export comes out clean. »
  - FR : « Tes prochaines vidéos sans filigrane ? Avec Stalak Pro, chaque vidéo que tu exportes sort sans. »
  - Vrai d'après la page Tarifs : un abonnement ne retire pas le filigrane d'une vidéo déjà exportée, d'où « tes prochaines vidéos ».
- **« Pourquoi cet e-mail ? »** :
  - EN : « You asked Stalak to email you a video from stalak.app on {date}. We won’t email you again unless you asked for Stalak news. »
  - FR : « Tu as demandé à Stalak de t’envoyer une vidéo depuis stalak.app le {date}. On ne t’écrira plus, sauf si tu as demandé les
    nouvelles de Stalak. »
- **Si l'adresse n'est pas la sienne** (quelqu'un a tapé son e-mail) :
  - EN : « Didn’t ask for this? Just ignore this email: the video will be deleted on {date}. »
  - FR : « Tu n’as rien demandé ? Ignore cet e-mail : la vidéo sera effacée le {date}. »

## 4. Les nouvelles de Stalak : confirmation et désinscription

**E-mail de confirmation** (si double confirmation [À DÉCIDER : Juridique]) :
- **Objet** : « Confirm Stalak news » / « Confirme les nouvelles de Stalak »
- **Aperçu** : « One tap and you’re in. Didn’t ask? Ignore this email. » / « Un appui et c’est bon. Tu n’as rien demandé ? Ignore cet
  e-mail. »
- **Texte** :
  - EN : « You asked for Stalak news at {email}: new features and tips, [about once a month]. Tap below to confirm. »
  - FR : « Tu as demandé les nouvelles de Stalak à {email} : nouveautés et astuces, [environ une fois par mois]. Touche le bouton
    pour confirmer. »
- **Bouton** : « Yes, send me Stalak news » / « Oui, envoie-moi les nouvelles »
- **Page après le clic** :
  - EN : « Done: Stalak news will come to {email}. You can unsubscribe from any of them. »
  - FR : « C’est fait : les nouvelles de Stalak arriveront à {email}. Tu peux te désinscrire depuis chacune. »

**Pied de chaque e-mail de nouvelles** :
- EN : « You get Stalak news because you asked for it on {date}. Unsubscribe in one click. » + [adresse postale : voir 6]
- FR : « Tu reçois les nouvelles de Stalak parce que tu les as demandées le {date}. Désinscription en un clic. » + [adresse postale]

**Page de désinscription** :
- EN : « You’re unsubscribed. No more Stalak news at {email}. »
- FR : « C’est fait : plus de nouvelles de Stalak à {email}. »

## 5. Textes du site à changer le jour où ça sort

- **FAQ de la page Tarifs**, « Are my videos sent to your servers? » / « Mes vidéos sont-elles envoyées sur vos serveurs ? » : ajouter
  l'exception « a video you ask us to email you, kept for [7 days] » / « une vidéo que tu nous demandes de t’envoyer par e-mail,
  gardée [7 jours] ».
- **Accueil** (« What is Stalak? » / « Stalak, c’est quoi ? », dans `build_site.py`) : même exception dans la phrase « your videos
  stay on your device » / « tes vidéos restent sur ton appareil ».
- **Confidentialité** : partie 6.

## 6. Pour Juridique (à vérifier, pas un avis juridique)

1. **Confidentialité** (FR et EN) : une partie « Vidéo par e-mail », par exemple : « Si tu nous demandes de t’envoyer une vidéo par
   e-mail, nous envoyons cette vidéo (et seulement elle) sur notre stockage (Cloudflare R2) et nous t’envoyons un lien de
   téléchargement à l’adresse que tu as tapée, avec Resend. Nous gardons la vidéo et ton adresse [7 jours], puis nous les effaçons.
   Si tu coches aussi « les nouvelles de Stalak », nous gardons ton adresse, la date et le texte de ton accord, jusqu’à ta
   désinscription. » Et l’exception dans la phrase « En bref : Stalak ne reçoit pas tes vidéos… ».
2. **Accord pour les nouvelles** : case non cochée, séparée de l’envoi de la vidéo (la vidéo part même sans la case) ; garder la
   preuve (date, texte affiché, langue) ; double confirmation ou non.
3. **Âge** : en France, l’accord en ligne d’un mineur de moins de 15 ans demande aussi celui d’un parent. Que fait-on pour la case
   des nouvelles ? (Voir aussi l’âge minimum des conditions.)
4. **États-Unis (CAN-SPAM)** : un e-mail commercial doit porter une adresse postale valable et un lien de désinscription. Le
   propriétaire ne veut pas afficher l’adresse de chez ses parents : boîte postale ou domiciliation ? Et la ligne Pro de l’e-mail
   de la vidéo : acceptable dans un e-mail transactionnel, ou à retirer ?
5. **Hébergement** : Stalak garderait [7 jours] un fichier fourni par l’utilisateur, accessible par un lien privé. Ce que ça
   implique (statut d’hébergeur, signalement d’un contenu).

## 7. Pour Comptes (questions, pas des décisions)

1. **Lien ou pièce jointe** : un lien vers le fichier sur R2, valable [7 jours], plutôt qu’une pièce jointe (les grosses pièces
   jointes sont souvent refusées par les boîtes mail, et un clip 16:9 du morceau entier est lourd).
2. **Taille maximale**, **limite d’envois** (par adresse et par appareil), **expéditeur**, effacement automatique après [7 jours].
3. **Abus** : n’importe qui peut taper l’adresse d’un autre. D’où la phrase « Tu n’as rien demandé ? » et la limite d’envois.
   Relecture `appsec-review` conseillée.
4. **Avec un compte** : proposer « M’envoyer la vidéo à {e-mail du compte} » en un appui ?
5. **Compteurs** (totaux anonymes par jour, comme les autres) : carte montrée, vidéos envoyées, case des nouvelles cochée, accord
   confirmé, lien ouvert. C’est ce qui dira si la piste marche : la part des gratuits qui laissent un e-mail.

## 8. Pour le propriétaire

- La fréquence et le contenu des nouvelles (Marketing les écrirait), et qui signe : « Stalak » ou « 99sayso de Stalak », comme
  l’e-mail de remerciement ?
- La ligne Pro dans l’e-mail de la vidéo : oui ou non (après l’avis de Juridique).
