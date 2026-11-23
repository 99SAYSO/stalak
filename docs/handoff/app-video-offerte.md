Statut : PRÊT
Branche : app/video-offerte (créée depuis `main` ec52a24 du 23/11, « STATUS : 1re vidéo sans filigrane offerte, décidée »).
Maquette de la branche : https://app-video-offerte.stalak-site.pages.dev (à faire valider par le propriétaire, règle 9).
Serveur : branche `compte/video-offerte` de Comptes (`POST /api/free-video`, migration 0019). À fusionner **avec** cette branche :
sans elle, la vidéo offerte n'est jamais proposée à un compte connecté. Seule la ligne « connecte-toi » s'affiche quand on n'est
pas connecté.

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
3. **L'export** : le serveur n'est appelé qu'au moment où l'export commence (`POST /api/free-video`), et il dit « oui » une
   seule fois dans la vie du compte.
   - **Réussi** : la vidéo est faite sans filigrane.
   - **Raté ou annulé** : Comptes a choisi de ne jamais rendre le « oui » (sinon on pourrait en obtenir à l'infini). L'app le
     garde donc sur l'appareil, pour ce compte, pendant 2 jours, jusqu'à ce qu'une vidéo sans filigrane soit faite. La
     personne voit toujours « Exporter sans filigrane (offert) », et le nouvel essai ne redemande rien au serveur. C'est la
     façon de faire proposée par Comptes.
   - Si le serveur répond « déjà utilisée » (sur un autre appareil, par exemple) : « Ta vidéo offerte sans filigrane a déjà
     été utilisée sur ce compte. », et l'export ne part pas.
4. **Une fois utilisée** :
   - plus rien de « offert » à l'écran, et plus de « connecte-toi » sur cet appareil ;
   - les vidéos suivantes ont le filigrane et l'offre Pro habituelle ;
   - la fenêtre Pro (dès la 2e vidéo) a pour titre « Ta 1re vidéo était sans filigrane. Toutes comme ça avec Pro ? ».
5. **Rien d'autre ne devient gratuit** : seul le filigrane est concerné. Clip, filtres Pro, karaoké et effets gardent leurs
   verrous.

## Avec Comptes (`compte/video-offerte`)
- L'app lit `entitlements.freeNoWm` et appelle `POST /api/free-video` au début de l'export. Elle n'exporte sans filigrane que si
  la réponse est `granted: true`.
- **À trancher par le Chef de projet** : la demande disait « si l'export rate, le serveur ne doit pas la compter ». Comptes a
  choisi de ne pas l'annuler côté serveur. L'app compense en gardant le « oui » sur l'appareil 2 jours. Limite : si la personne
  change d'appareil, ou attend plus de 2 jours après un export raté, la vidéo offerte est perdue.
- Compteurs : l'app envoie `free_nowm` (`cat` : `login`, `claim`, `used`). Le serveur ne connaît pas ce nom. Comptes compte
  déjà `free_video` côté serveur, donc ces trois-là ne sont utiles que si Comptes veut l'entonnoir (« connecte-toi » touché →
  vidéo faite).
- `src/account.js` (fichier de Comptes) : ajout de `freeNoWm()` et `freeNoWmClaim()`.

## Fichiers
- `src/app.js` : `freeUi`, `freeClaim`, `freeEnd`, `freeAfterLogin`, le début de l'export, la fenêtre Pro, les textes FR/EN.
- `src/markup.html` : la ligne, le bouton et la question sur l'écran de fin.
- `src/theme.css`.
- `src/account.js` (Comptes).
- Tests : nouveau `tests/ui/video_offerte_ui.py` ; `partager_ui.py` adapté (les nouveaux éléments de l'écran de fin sont avant la
  zone de partage). Il joue le serveur de Comptes, sur iPhone et ordinateur, en
  FR et en EN.

## Résultats des tests
(23/11, sur la branche)
- serveur `tests/backend/run.mjs` **115/115**
- nouveau `video_offerte_ui` **68/68** (iPhone 12 et ordinateur, FR et EN)
- `fenetre_pro_ui` **84/84**, `fin_export_ui` **98/98**, `partager_ui` **92/92** (après adaptation), `vente_ui` **63/63**
- `audit_ui` **122/122**, `audit611_ui` **93/93**, `exports_rates_ui` **80/80**, `accueil_a_ui` **77/77**, `tiktok_ui` **220/220**
- `clip1_ui` 83/87 : les 4 échecs viennent de `.band-frost a:hover` dans `src/bands.css` (Marketing, « Bandes de glace »,
  e1c72fb, déjà sur `main`) : un survol qui n'est pas réservé à la souris. Sans lien avec cette branche. **Pour Marketing** :
  le mettre dans `@media (hover:hover)`.
