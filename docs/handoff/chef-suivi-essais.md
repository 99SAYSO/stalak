# Demande du Chef de projet : carte « Essais Pro » au tableau de bord (26/11/2026)

Pour : **Comptes** (et App pour les évènements). Demande du propriétaire, 26/11 à 15 h 42 : les 3 chiffres les plus importants à suivre pour les essais gratuits.

## Les 3 chiffres, définis précisément
1. **Activation J1.** Parmi les essais démarrés, la part qui, **dans les 24 h** suivant le début, a fait **au moins un export réussi sans filigrane** (le « wow » de Pro). Afficher aussi : au moins un export, quel qu'il soit.
   Pourquoi : 64 % des résiliations d'un essai de 7 jours ont lieu le jour 0 ou 1 (RevenueCat).
2. **Conversion à la fin de l'essai.** Parmi les essais **terminés** :
   - la part devenue un **vrai premier paiement** ;
   - la part **résiliée pendant l'essai** ;
   - la part dont le paiement a échoué.

   Par semaine de début d'essai (cohorte). Puis la part **encore payante au 2e mois**.
3. **Actifs pendant l'essai** (le « MAU en essai » du propriétaire). Un essai dure 7 jours, donc un chiffre mensuel ne dit rien. On mesure :
   - le nombre d'essais **en cours** aujourd'hui, dont ceux **actifs sur les 3 derniers jours** (au moins une ouverture de l'app connectée ou un export) ;
   - la part des essais qui reviennent **au moins 2 jours différents** pendant l'essai ;
   - le **nombre moyen d'exports par essai**.

## Ce qu'il faut pour les mesurer
- Relier les exports et les ouvertures à **un compte**, pas seulement à un navigateur : aujourd'hui `video_counts` est par `vid`. Un compteur par compte et par jour suffit (`user_day_counts`), sans contenu, supprimé avec le compte. Migration à annoncer au propriétaire.
- App : envoyer « export sans filigrane » et « ouverture de l'app connectée » avec le compte quand il est connecté.
- Juridique : vérifier la ligne de la confidentialité sur ce suivi par compte (mesure du service, pas de pub).

## Le tableau de bord
Une carte « Essais Pro » en haut de « Du visiteur à l'abonné » : les 3 chiffres sur 7 et 30 jours, plus la liste des essais en cours. Pour chacun : le jour de l'essai (J1…J7), exporté oui/non, actif sur les 3 derniers jours oui/non, la source, et la réponse « Where did you hear about Stalak? » (`chef-question-source.md`).

Les 3 essais du 26/11 sont les premiers à suivre.

Comptes rendus : `docs/handoff/compte-suivi-essais.md`, et `app-suivi-essais.md` si App touche aux évènements.
