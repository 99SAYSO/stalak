Statut : PRÊT
Branche : compte/sauvegarde-auto
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` 5ea00e4 (demandes du 30/10, 21 h)

Résumé :
1. Sauvegarde automatique pour Creator Plus : chaque projet s'enregistre tout seul en ligne.
   - La page relit le projet toutes les 4 s. S'il a changé et ne bouge plus au passage suivant, elle envoie seulement ce qui a changé :
     les fichiers pas encore en ligne (chacun une seule fois), puis le petit état du projet. La couverture de la Galerie n'est envoyée
     que si le montage a changé (une fois par minute au plus).
   - Rien pendant un export : un envoi en cours s'arrête et reprend juste après, à partir des morceaux déjà envoyés.
   - Indicateur discret en haut à droite : « Enregistré ✓ » (aussi « Enregistrement… », « Hors ligne », « Pas enregistré »,
     « Espace plein »). Il est caché sans Creator Plus ou sans projet.
   - Un nom changé dans la Galerie est gardé. Un projet rouvert depuis la Galerie n'est pas renvoyé. Avant d'ouvrir un autre projet,
     ce qui a changé est d'abord enregistré.
   - Côté serveur : `PUT /api/projects/:id` accepte `name: null` (garde le nom) ; 900 enregistrements par heure et par compte au plus ;
     le tableau de bord compte les nouveaux projets, pas chaque enregistrement (« Nouveaux projets en ligne »).
2. Bouton « Sauvegarder en ligne » supprimé : étape Montage, Galerie et fenêtre du nom. La Galerie dit « Commence un montage : il
   s'enregistre tout seul et apparaîtra ici avec sa couverture ». Les textes Creator Plus de la Galerie sont mis à jour.
3. Anglais d'abord :
   - e-mails en anglais par défaut (codes, mot de passe oublié, « Parler à un humain », rappel des 6 mois), en français seulement si
     la personne utilise Stalak en français ;
   - fenêtre de paiement Paddle dans la langue de la page (donc en anglais sauf sur la version française) ;
   - visiteurs et tickets sans langue comptés en anglais.
4. Guide de l'assistant d'aide : « façon Triller » retiré, règle ajoutée en FR et EN (ne jamais citer ni comparer une autre
   application de montage), sauvegarde décrite comme automatique. Un test serveur vérifie qu'aucun concurrent n'y est cité.

Skills utilisés : `appsec-review` (revue : `docs/appsec-review-sauvegarde-auto.md` ; 1 correction, la limite de 900 enregistrements par
heure ; le reste accepté et expliqué).

Fichiers touchés :
- serveur : `functions/_lib/router.js`, `auth.js`, `email.js`, `cloud.js`, `support.js`, `help.js`, `help-guide.js`, `metrics.js`,
  `oauth.js`, `admin-page.js`
- page : `src/app.js` (bloc compte : sauvegarde automatique `AS` à la place de `clSaveAsk` / `clSaveRun` ; nouveau bloc de textes
  `_bloc.compte.sauvegarde` ; textes `gal.*`), `src/account.js`, `src/markup.html` (indicateur `#clAuto`, bouton et fenêtre du nom retirés),
  `src/theme.css` (indicateur)
- docs : `BACKEND.md` (section 11, route `PUT /api/projects/:id`), `docs/STATUS.md`, `docs/appsec-review-sauvegarde-auto.md`
- tests : `tests/backend/run.mjs` (3 tests ajoutés, test des visites adapté), `tests/ui/gallery_ui.py`, `tests/ui/cloud-server.mjs`
  (sonde de test `__ev`, comme `tests/ui/server.mjs`)
- `public/` reconstruit

Migration SQL : **aucune**.

Tests (sur la branche) :
- `node tests/backend/run.mjs` : 70/70
- `tests/ui/gallery_ui.py` : 49/49 : l'exemple s'enregistre tout seul (« Enregistré ✓ », couverture dans R2), rien de renvoyé quand rien
  ne change, rien pendant un export puis enregistrement juste après (sans renvoyer de fichier), nom de la Galerie gardé, projet rouvert
  sans renvoi (« Saved ✓ ») ; FR 390 px et EN 1280 px
- `tests/ui/plans_ui.py` : 30/30 ; `tests/ui/support_ui.py` : 39/39 (e-mail de réponse en 19,3 s) ; `tests/ui/help_ui.py` : 42/42
  (dont la version claude.ai)
- sans défilement horizontal, sans erreur de page, FR et EN
- non lancé : vrai R2 et vrai Paddle

Ordre de mise en ligne (Chef de projet) : fusion et publication, rien d'autre.

Reste au propriétaire : rien à saisir. À essayer sur iPhone avec un compte Creator Plus : charger l'exemple, voir « Enregistré ✓ »,
le retrouver dans la Galerie, le renommer, faire une modification, vérifier que le nom reste.

À signaler :
- App & montage : le guide d'aide dit encore « au moins 3 playbacks » pour les packs et décrit l'ancien filigrane. À changer dans
  `functions/_lib/help-guide.js` (FR et EN) quand les packs dès 2 playbacks et le filigrane logo seul seront livrés.
- Comptes existants : ceux enregistrés avant avec une autre langue que l'anglais restent en français jusqu'à leur prochaine connexion
  depuis la page (la langue est alors mise à jour).
