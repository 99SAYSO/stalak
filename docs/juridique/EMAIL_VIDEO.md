# « Reçois ta vidéo par e-mail » et totaux de visites — règles pour Comptes (07/11/2026)

> Rôle Juridique & business. Infos pour décider, **pas un avis juridique**. La confidentialité FR/EN (branche
> `legal/video-par-email`) décrit exactement ce qui suit : tout écart doit être signalé à Juridique avant la mise en ligne.

## A. Totaux de visites par provenance et par pays (rapport du 7/11, piste 1)
- **Autorisé sans consentement** : totaux **anonymes** par jour × provenance × pays × type d'appareil (et, pour l'entonnoir, exports / formules ouvertes / paiements par provenance). C'est de la mesure d'audience dispensée par la CNIL, tant que :
  - aucune ligne de total ne contient le numéro de visite (`vid`), un compte, un e-mail ou une empreinte d'IP ;
  - la provenance d'un paiement vient du `stalak:ref` de l'onglet (envoyé avec le compteur), jamais d'un rapprochement avec un compte ;
  - les totaux ne servent qu'aux statistiques de Stalak (pas de partage, pas de pub).
- **À corriger au passage (App)** : `stalak:lastDay` est réécrit à chaque visite, donc il ne s'efface jamais. La CNIL recommande 13 mois au plus, sans prolongation. Garder aussi la date de première écriture et effacer au-delà de 13 mois. La page l'annonce.

## B. « Reçois ta vidéo par e-mail » (écran de fin, utilisateurs gratuits)
Deux choses différentes, qu'il ne faut jamais mélanger :

### B1. Envoyer la vidéo (ce que la personne demande)
- Base : la demande de la personne. Pas besoin de case.
- Vidéo déposée dans R2 (privé), lien de téléchargement à durée limitée. **La vidéo, le lien et l'adresse e-mail liée à cet envoi sont supprimés au bout de 7 jours** (tâche du jour).
- Un seul e-mail : la vidéo. Pas de promo dedans, sauf le bloc de confirmation des nouvelles (B2) quand la case a été cochée.
- Anti-abus (quelqu'un peut taper l'adresse d'un autre) : Turnstile et une limite d'envois par connexion et par adresse (par exemple 5 par jour).

### B2. Recontacter (« nouvelles de Stalak ») = prospection : consentement explicite
- **Case non cochée par défaut**, à côté du champ e-mail, séparée du bouton d'envoi. Texte exact :
  - FR : « Envoie-moi les nouvelles de Stalak par e-mail (nouvelles fonctions, astuces et offres). Désinscription en un clic à tout moment. »
  - EN : « Send me news from Stalak by email (new features, tips and offers). Unsubscribe anytime in one click. »
- **La vidéo est envoyée que la case soit cochée ou non** : pas de consentement forcé.
- **Confirmation (double opt-in)** : si la case est cochée, l'e-mail de la vidéo contient un bouton « Oui, je veux les nouvelles » / « Yes, send me news ». Seules les adresses confirmées reçoivent des nouvelles. Sans clic, l'adresse est supprimée avec la vidéo au bout de 7 jours.
- **Preuve à garder** : adresse, date et heure de la case et du clic de confirmation, texte exact de la case (version), langue.
- **Chaque e-mail de nouvelles** :
  - lien « Se désinscrire » / « Unsubscribe » qui marche en un clic, sans connexion, et arrête tout de suite ;
  - en-têtes `List-Unsubscribe` et `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (Gmail, Yahoo) ;
  - expéditeur clair (99sayso / Stalak), objet honnête ;
  - **adresse postale de l'entreprise en bas de l'e-mail** (loi américaine CAN-SPAM : adresse de domiciliation ou boîte postale acceptée) ;
  - en cas de doute aux États-Unis, une mention discrète du type « You’re getting this because you asked for Stalak news. »
- **Après la désinscription** : supprimer l'adresse et ne garder qu'une empreinte (liste « ne plus écrire »). Une nouvelle inscription n'est possible que par une nouvelle case cochée et confirmée.
- **Durée** : adresse supprimée après 3 ans sans ouverture ni clic sur un e-mail de nouvelles (recommandation CNIL : 3 ans après le dernier contact).
- **Rythme annoncé** : « quelques e-mails par mois au plus ».
- **Pas de lien avec un compte** : cette liste reste séparée des comptes (la page le dit).
- **Mineurs** : pas d'âge minimum (décision du propriétaire). La page demande aux moins de 15 ans l'accord d'un parent avant de cocher.

### Pourquoi une case plutôt que l'« exception client »
Depuis l'arrêt de la Cour de justice de l'UE du 13/11/2025, une inscription gratuite à un service freemium peut compter comme une « vente ». On pourrait alors écrire sans case, avec un simple refus proposé. Mais la CNIL lit ce point plus strictement, l'utilisateur gratuit n'a pas de compte ici, et la case coûte peu. **Case non cochée + confirmation = le plus sûr**, en France comme aux États-Unis.

## C. Mise en ligne
`legal/video-par-email` est à publier **en même temps** que la branche Comptes (et App pour l'écran de fin), pas avant : la page décrit la case, la durée de 7 jours, la confirmation et le désabonnement.
