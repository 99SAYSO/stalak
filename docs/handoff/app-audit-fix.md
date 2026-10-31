Statut : PRÊT
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

4. **Offre Pro après la 1re vidéo : une fenêtre au milieu de l'écran** (demande du propriétaire, 31/10, 4 h ; remplace le bloc sous la vidéo) :
   - elle s'ouvre environ 1 s après que la vidéo est là (une fois l'écran d'export parti), le fond assombri, avec une apparition qui monte et un reflet givré qui la traverse (rien ne bouge si l'appareil demande moins d'animations) ;
   - contenu : la mascotte, « Belle vidéo ! La prochaine, sans filigrane ? » (EN « Nice video! Next one without the watermark? »), 3 avantages cochés (ni pub ni filigrane, mode Clip 16:9 sur tout le son, tous les filtres), « 4,17 $/mois, facturé à l'année », gros bouton « Passer à Pro » (formules sur Pro), lien discret « Plus tard » ;
   - se ferme d'un toucher : ×, « Plus tard », à côté, Échap ; le focus va sur « Passer à Pro » et revient où il était ;
   - ne bloque jamais l'enregistrement ni le partage : la page dessous n'est pas figée, un toucher à côté la ferme ;
   - une seule fois par appareil (même après rechargement), jamais pour un abonné, jamais pendant un export, Gratuit sur stalak.app seulement ;
   - compteur : `acctEvent('pro_offer')` à l'ouverture.
   - Pas de flou derrière la fenêtre (seulement assombri) : le flou plein écran bloquait le navigateur de test et coûte cher sur un téléphone.

Pour le Chef de projet :
- **Comptes : ajouter `pro_offer` à la liste `EVENTS` de `functions/_lib/metrics.js`** (fichier de Comptes, pas touché ici) : sans ça, le serveur refuse ce compteur et il n'apparaît pas au tableau de bord.
- « pub affichée » (`ad_shown`) n'est plus compté (la demande de pub l'est : `ad_offer`).

5. **Bouton « Exporter ↓ » fixe** : après l'appui, il vise encore les boutons pendant 3 s s'ils se retrouvent sous l'aperçu (la page au-dessus peut encore bouger), sauf si la personne fait défiler elle-même.

Tests (31/10, iPhone 15 Pro émulé + ordinateur, FR + EN) :
- `audit_ui.py` 158/158 (dont la fenêtre Pro : pas tout de suite puis environ 1 s après, au milieu, fond assombri, apparition et reflet givré, mascotte + titre + 3 avantages + 4,17 $/mois, focus sur « Passer à Pro », fermeture par Échap / « Plus tard » / × / à côté, ne bloque pas l'enregistrement, « Passer à Pro » → formules Pro, une seule fois même après rechargement, jamais pour un abonné, compteur `pro_offer`)
- `gallery_ui.py` 49/49 (aussi sous charge), `formules_ui.py` 169/169, `projet_local_ui.py` 48/48, `export_pub_ui.py` 22/22, `son_passage.py` 86/86, `filtres_ui.py` 106/106, `remux_frag.py`, `paroles_suppr.py`, `plans_ui.py`, `help_ui.py` : tous réussis ; `tests/backend/run.mjs` 78/78
- `support_ui.py` et `lyrics_ui.py` : même arrêt sur une attente trop longue que sur `main`, sans lien avec cette branche.

À tester par le propriétaire sur un vrai iPhone : un 1er export en Gratuit → la fenêtre Pro 1 s après ; « Plus tard », puis enregistrer la vidéo dans Photos ; un 2e export → plus de fenêtre. Ouvrir « Démo glace » depuis la Galerie.
