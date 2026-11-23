# Marketing & croissance — essai de 7 jours de Stalak Pro (23/11/2026)

Branche : `marketing/essai-pro`, partie de `main` (1f62c8b, vidéo offerte retirée). Demande du Chef de projet du 23/11, 7 h 35.
Décisions du propriétaire (STATUS) : avec carte (Paddle), 7 jours, Pro seulement (mensuel et annuel), une fois par personne, prélevé au bout de
7 jours sauf annulation, rappel avant le 1er prélèvement. **Statut : pas PRÊT tant que les branches d'App (et de Comptes, pour Paddle) ne sont
pas fusionnées** : ces textes promettent un essai qui doit exister au moment où ils sont en ligne.

## Ce qui change
- `site_src/fr/tarifs.html`, `site_src/pricing.html` : les deux boutons de la carte Pro (mensuel, annuel) deviennent « Essayer 7 jours gratuits » /
  « Try 7 days free », mêmes liens qu'avant. Sous chacun (`.pr-trial`, suit le choix mensuel / annuel) : carte demandée, rien de prélevé pendant
  7 jours, puis 7,99 $ par mois (ou 49,99 $ pour l'année), sauf annulation avant la fin de l'essai. Le 4,17 $ et le 49,99 $ ne changent pas.
- Questions fréquentes, en premier et ouverte : « Comment marche l'essai gratuit ? » / « How does the free trial work? » (`#essai`, `#trial`).
- Accueil (`build_site.py`, clé `trial.line`) : une ligne discrète dans la bande glace, lien vers la question de Tarifs.
- Règle suivie partout : jamais « gratuit » pour l'essai sans « carte demandée » et ce qui est prélevé ensuite.

## Si App ou Comptes changent un détail
Les montants, la durée et « rappel avant le prélèvement » sont écrits à 3 endroits par langue : bouton + phrase dessous (Tarifs), réponse (Tarifs),
ligne de l'accueil. À ajuster ensemble si Paddle ou les écrans d'App disent autre chose.
