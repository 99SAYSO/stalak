# Premier essai : une vidéo programmée par Zernio (pour Marketing)

> Préparé par Réseaux sociaux (4) le 4/11/2026. À faire par **Marketing (5)**, avec le propriétaire.
> But : vérifier tout le circuit sur **une seule vidéo déjà validée**, avant la première semaine (lundi 9/11).

## Ce qu'on teste

1. Une légende et des réglages montrés au propriétaire, puis son « ok ».
2. L'envoi du fichier vidéo vers Zernio depuis l'espace de travail de Claude. Si ça échoue, on passe par le lien de dépôt.
3. La publication programmée dans Zernio, avec l'approbation du propriétaire dans Claude.
4. La publication réelle sur TikTok et Instagram @stalak_app, à l'heure prévue.
5. La tâche du samedi 7/11, qui doit retrouver la vidéo (étiquette `stalak-promo`) et relever ses chiffres.

## Déroulé

1. **La vidéo** : une promo que le propriétaire a déjà validée.
   - Proposition par défaut : **« The Snippet Machine »** (v8, 29 s, sans voix).
   - Sans voix et entièrement dessinée en code (rien de réaliste), elle n'a pas besoin d'étiquette IA : `videoMadeWithAi: false` et pas de mention « AI voiceover ».
   - Si le propriétaire en préfère une avec voix off IA (par exemple « Your snippet is the problem », v7), alors `videoMadeWithAi: true` et « AI voiceover » dans la légende.
2. **Quand** : **jeudi 5/11 à 19 h 30, heure de New York** (vendredi 1 h 30 à Paris). Étiquettes : `stalak-promo`, `semaine-0`, `modele-essai`, `creneau-6`.
3. **La légende** : en anglais, ton de `docs/marketing/US_FIRST.md` §7, avec « stalak.app » et 3 à 5 hashtags.
4. **Montrer au propriétaire** :
   - la vidéo ;
   - la légende ;
   - l'heure (New York et Paris) ;
   - les réglages : TikTok « Tout le monde » (seule possibilité pour ce compte), commentaires oui, Duo non, Collage non, « Ta marque » oui ; Instagram : Reel partagé dans le fil.
   
   Puis attendre son « ok ».
5. **Programmer** en suivant exactement l'étape 7 de `docs/social/TACHE_DIMANCHE.md` (fichier, puis `posts_create_post` avec `scheduled_for` et `timezone: America/New_York`). **Jamais** de publication immédiate.
6. **Vérifier** :
   - la publication apparaît dans `posts_list` avec le statut `scheduled` ;
   - le récapitulatif est envoyé au propriétaire ;
   - la ligne est ajoutée au journal (`social/promo-journal`).
7. **Après l'heure prévue** (vendredi matin, heure de Paris), vérifier avec `posts_get` que la publication est `published` sur les deux réseaux, avec les liens. En cas d'échec, `posts_list_failed`, puis dire au propriétaire ce qui s'est passé. Ne pas relancer sans son accord.
8. **Noter** dans le compte rendu de Marketing, pour Réseaux sociaux :
   - ce qui a marché ;
   - la méthode d'envoi du fichier qui a fonctionné (adresse d'envoi ou lien de dépôt) ;
   - les erreurs éventuelles.
