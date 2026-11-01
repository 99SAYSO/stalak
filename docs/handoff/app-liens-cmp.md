Statut : EN COURS (tests en cours)
Branche : app/liens-cmp (créée depuis `main` du 1/11, 22 h 40 : ff69d15).

Résumé :
1. **Liens de l'app après la bascule** (`/` en anglais, `/fr/` en français) :
   - Relu `src/markup.html` (Tarifs, conditions, remboursement, confidentialité de la page compte et de la page des formules), les textes anglais de `I18N_EN` (`/pricing`, `/terms`, `/refunds`, `/privacy`), `src/account.js` (retour de connexion Google = la page où l'on est) et le pied de page ajouté par `build_site.py`. Tout pointait déjà vers les bonnes adresses : aucune ancienne adresse (`/en/…`, `/tarifs`, `/conditions`…).
   - **Sélecteur FR / EN corrigé** : il changeait la langue sur place, mais l'adresse restait. Passer en français sur `/` laissait donc `/`, et un rechargement ou un lien partagé redonnait l'anglais. Maintenant l'adresse suit la langue : `/` ↔ `/fr/`, sans recharger, le montage reste et `#compte` est gardé. L'adresse canonique et le manifeste de l'app installable suivent aussi. La version claude.ai n'est pas touchée.
   - Le test vérifie chaque lien de la page app (pied de page, page compte, formules) dans les 2 langues, avant et après le changement de langue, et chaque lien des pages Tarifs et légales : tous mènent à une page qui existe, aucun à une ancienne adresse.
2. **Consentement pour la pub** (STATUS, « bandeau de consentement (CMP) », règles de Juridique et page Confidentialité) :
   - **Europe, Royaume-Uni, Suisse.** L'outil retenu est le message RGPD gratuit de Google Ad Manager (« Confidentialité et messages »). Il est certifié par Google et compatible IAB TCF v2.2.
     - Il arrive avec le script de pub de Google, que Stalak ne charge qu'au toucher de « Regarder une pub ». La fenêtre apparaît donc au moment de la première pub, jamais à l'ouverture du site. Aucun script Google n'est chargé avant.
     - Quand l'outil est branché, la pub attend que la personne ait choisi (jusqu'à 2 min), puis passe. Le choix décide : plus de « pubs limitées » forcées.
     - Si la fenêtre de Google ne vient pas (message pas publié), la pub passe quand même après 5 s.
   - **Interrupteur `CMP_ON`** (`src/app.js`, à côté de `AD_UNIT`) : à mettre sur `true` quand le message est publié dans Ad Manager. D'ici là, les pubs restent en « pubs limitées » comme aujourd'hui, ce qui est la règle sans outil certifié.
   - **« Gérer les cookies »** en bas de l'app :
     - avec l'outil, il rouvre la fenêtre de Google (`googlefc.showRevocationMessage`) ;
     - sans l'outil, il mène à la page Confidentialité, partie cookies (`/privacy#cookies`, `/fr/confidentialite#cookies`).
     - Le même lien (« Cookie settings » / « Gérer les cookies ») est ajouté en bas des pages Tarifs et légales, vers la partie cookies : ces pages ne chargent pas le script de Google.
   - **« Your Privacy Choices »** (États-Unis, promis par la page Privacy) en bas de l'app :
     - une petite fenêtre avec « Ne pas vendre ni partager » et « Autoriser », de même taille et même couleur ; le choix est écrit dessous ;
     - le choix est gardé sur l'appareil ;
     - **Global Privacy Control** (GPC) compte comme un refus : c'est dit dans la fenêtre, et « Autoriser » est indisponible ;
     - en cas de refus, la pub est demandée non personnalisée (`restrictDataProcessing`). On peut toujours retirer le filigrane.
   - Survol des boutons limité aux appareils avec souris : sur iPhone, l'effet de survol restait collé après un toucher.

Pour le propriétaire (dans Google Ad Manager, quand le compte existe) :
- Confidentialité et messages > RGPD : créer le message pour stalak.app, avec :
  - le bouton « Ne pas consentir » activé, en plus de « Consentir » et « Gérer les options » ;
  - les pays de l'Espace économique européen, le Royaume-Uni et la Suisse ;
  - la langue selon le navigateur.
- Publier le message, puis me dire de passer `CMP_ON` à `true`.
- Juridique demande de reposer la question au bout de 6 mois au plus : vérifier le réglage de durée dans Ad Manager (je ne l'ai pas vérifié).

Pour Juridique (à relire) :
- **Ordre « bouton pub puis fenêtre de consentement ».** La fenêtre vient au toucher de « Regarder une pub », avant la pub. C'est conforme à « s'affiche au moment de la première pub ».
- **« Gérer les cookies » charge le script de Google** quand l'outil est branché. C'est la personne qui le demande, mais c'est le seul cas où le script se charge sans la pub. À valider.
- **Moins de 13 ans** : rien n'est fait dans l'app, car aucun âge n'est demandé.
- **Pages légales et Tarifs.** Le lien « Cookie settings » / « Gérer les cookies » mène à la partie cookies de la Confidentialité. Cette partie pourrait dire « pour changer ton choix : “Gérer les cookies” en bas de la page de l'app ». Je n'ai pas touché au texte juridique.

Tests : voir la fin de ce fichier.
