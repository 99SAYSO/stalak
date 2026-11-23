Statut : EN COURS (tests en cours)
Branche : app/video-offerte (créée depuis `main` ec52a24 du 23/11, « STATUS : 1re vidéo sans filigrane offerte, décidée »).
Maquette de la branche : https://app-video-offerte.stalak-site.pages.dev (à faire valider par le propriétaire, règle 9).
Attention : tant que le serveur de Comptes n'a pas les adresses ci-dessous, la maquette ne propose jamais la vidéo offerte à
un compte connecté. Elle montre seulement la ligne « connecte-toi » quand on n'est pas connecté.

Demande : message du Chef de projet du 23/11 (5 h 25). Décision du propriétaire : « 1re vidéo sans filigrane offerte », une
fois par compte.

## Ce que voit la personne (écran de fin d'une vidéo gratuite avec le logo ; jamais pour l'exemple ni un pack)
1. **Pas connectée** : sous l'offre Pro (« Exporter sans le logo PRO »), la ligne « Ta 1re vidéo sans filigrane est offerte :
   connecte-toi ».
   - « connecte-toi » ouvre la connexion, avec en haut : « Connecte-toi : ta 1re vidéo sans filigrane est offerte. »
   - Une personne jamais connectée sur cet appareil arrive sur « Créer un compte ».
   - Une fois connectée, l'app revient **au même écran de fin**, la vidéo toujours là, avec le bouton ci-dessous mis en avant.
     Avec un projet ouvert, Google, Apple et Microsoft s'ouvrent dans une petite fenêtre, et l'e-mail se fait dans la page :
     rien n'est perdu.
2. **Connectée, la vidéo offerte encore là** :
   - « Exporter sans filigrane (offert) » prend la place de « Exporter sans le logo PRO » ;
   - l'image de droite (« Sans le logo ») porte « OFFERT » au lieu de « PRO » ;
   - « Enregistrer la vidéo » (avec le logo) reste le premier bouton.
   - Un toucher n'exporte pas tout de suite. Il affiche d'abord « C'est ta seule vidéo offerte sans filigrane. », avec
     « Exporter sans filigrane » et « Pas maintenant ». « Pas maintenant » revient au bouton sans rien utiliser.
3. **L'export** : la vidéo offerte n'est demandée au serveur qu'au moment où l'export commence.
   - **Réussi** : la vidéo est faite sans filigrane, et l'app le confirme au serveur.
   - **Raté ou annulé** : l'app la rend au serveur, et elle reste proposée. Après un nouvel essai automatique raté, elle est
     aussi rendue.
   - Si le serveur dit qu'elle a déjà servi (sur un autre appareil, par exemple), une phrase le dit et l'export ne part pas.
4. **Une fois utilisée** :
   - plus rien de « offert » à l'écran, et plus de « connecte-toi » sur cet appareil ;
   - les vidéos suivantes ont le filigrane et l'offre Pro habituelle ;
   - la fenêtre Pro (dès la 2e vidéo) a pour titre « Ta 1re vidéo était sans filigrane. Toutes comme ça avec Pro ? ».
5. **Rien d'autre ne devient gratuit** : seul le filigrane est concerné. Clip, filtres Pro, karaoké et effets gardent leurs
   verrous.

## Pour Comptes : ce que l'app attend du serveur (proposition, à confirmer ou à changer)
- **`/api/me`** : `entitlements.freeNoWm: true` tant que le compte a sa vidéo offerte, `false` ensuite. Accepté aussi :
  `'freeNoWm'` dans `entitlements.features`.
- **`POST /api/free-nowm/claim`**, appelé au début de l'export :
  - réponse `{ claim: "<id>" }` ; la vidéo est alors réservée et `freeNoWm` passe à `false` ;
  - erreur `409 { error: "free_nowm_used" }` si elle est déjà utilisée ou réservée.
- **`POST /api/free-nowm/release { claim }`** : l'export a raté ou a été annulé. La réservation est annulée, `freeNoWm`
  redevient `true`.
- **`POST /api/free-nowm/confirm { claim }`** : la vidéo est faite. C'est définitif.
- **Proposé** : une réservation ni confirmée ni rendue (onglet fermé en plein export, téléphone éteint) est rendue par le serveur
  au bout d'un délai, par exemple 2 h. Sinon, un export coupé ferait perdre la vidéo offerte.
- **Compteurs** : l'app envoie `free_nowm` avec `cat` `login`, `claim` ou `used`. Le serveur refuse les noms qu'il ne connaît
  pas : à ajouter dans `EVENTS` (`metrics.js`) si Comptes veut les voir dans le tableau de bord.
- `src/account.js` (fichier de Comptes) : ajout de `freeNoWm()`, `freeNoWmClaim()`, `freeNoWmRelease(claim)` et
  `freeNoWmConfirm(claim)`. Si les adresses changent, ce sont les seules lignes à reprendre.

## Fichiers
- `src/app.js` : `freeUi`, `freeClaim`, `freeEnd`, `freeAfterLogin`, le début de l'export, la fenêtre Pro, les textes FR/EN.
- `src/markup.html` : la ligne, le bouton et la question sur l'écran de fin.
- `src/theme.css`.
- `src/account.js` (Comptes).
- Tests : nouveau `tests/ui/video_offerte_ui.py`. Il joue le serveur avec les adresses ci-dessus, sur iPhone et ordinateur, en
  FR et en EN.

## Résultats des tests
(à venir)
