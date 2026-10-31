Statut : EN COURS (tests en cours)
Branche : app/audit-fix (créée depuis `main` du 31/10, 3 h : 1f1bba7).

Résumé :
1. **Galerie : ouverture bloquée sur « Je remets ton montage en place… »** (`gallery_ui.py`, « en-1280 Pro: the project opens »).
   - Cause : le projet ouvert (« Démo glace ») est l'exemple. À chaque ouverture, son son est fabriqué de zéro (`makeDemoSong`, environ 700 notes rendues d'un coup) : 5,4 s sur la machine de test au repos, 46 s quand la machine est chargée (d'autres tests en même temps). Le test attend 20 s. Ce n'était pas plus lent avec `app/audit` qu'avec `compte/audit` (mesuré : 5,5 s contre 5,0 s au repos, 46,7 s contre 45,6 s sous la même charge) ; `app/audit` a surtout ajouté deux grosses suites de tests, qui chargent la machine quand tout tourne ensemble.
   - Correction : le son de l'exemple est fabriqué en 4 parties en parallèle (chaque partie commence 2,5 s plus tôt pour garder les notes qui sonnent déjà, puis cette avance est coupée) : 1,1 s au lieu de 5,4 s, même son (même longueur, enveloppe identique à 0,999 près ; seul le souffle aléatoire des charlestons change, comme avant à chaque fois). Il est gardé pour la visite (l'exemple et un projet « Démo glace » le partagent) et dans l'appareil (IndexedDB, clé `demo:1`) : instantané aux visites suivantes.
   - Résultat : `gallery_ui.py` 49/49, ouverture en 3 à 7 s sous la même charge (au lieu de 46 s). L'exemple de l'accueil s'ouvre aussi plus vite pour tout le monde.
2. **Catégorie des exports ratés** : un export arrêté parce qu'on a quitté Stalak (autre appli, écran verrouillé) était compté `cancel` (le temps réel s'arrête comme une annulation). Il est maintenant compté `hidden` (`expFailCat` regarde `S.leftDuring` en premier).
3. **Tests adaptés** :
   - `audit_ui.py` : les compteurs passent par `acctEvent` de Comptes (`{ name, ios?, cat?, why? }`) : on vérifie `export_start`, `export_ok`, `export_fail` avec `cat` = `hidden` et `memory`, `ios: true` sur iPhone seulement, aucun cookie. `plans_open` n'est plus vérifié ici : l'écran des formules est joué par le test, c'est Comptes qui l'envoie (à vérifier dans ses tests).
   - `formules_ui.py` : le conseil du pack dit « 2 takes » en anglais.

Pour le Chef de projet : `evt()` d'App ne fait plus rien, donc « offre Pro affichée » (`pro_offer`) et « pub affichée » (`ad_shown`) ne sont plus comptés. Si le propriétaire les veut dans l'entonnoir, il suffit que Comptes accepte ces deux noms et qu'App appelle `acctEvent` à ces deux endroits.

Tests : voir la fin de ce fichier.
