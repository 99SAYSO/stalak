Statut : PRÊT
Branche : compte/menu-galerie
Conversation : 3. Comptes, paiements & serveur

Résumé :
1. Menu du compte (en haut à droite). Connecté, un appui sur le compte ouvre un menu : Galerie ; Mon compte ;
   Stalak Pro (ou « Gérer mon abonnement » pour un Pro, qui ouvre la page Paddle) ; Aide (ouvre le glaçon) ; Se déconnecter.
   Marche au doigt (iPhone), se ferme en touchant à côté, avec Échap, en tournant l'écran ; flèches du clavier sur ordinateur.
   Non connecté : le bouton dit « Se connecter » et ouvre la connexion, sans menu.
2. Galerie (remplace « Mes projets », adresse `#galerie`). Grille comme l'app Photos : 3 colonnes sur téléphone, plus sur
   ordinateur (environ 5 à 1280 px), les plus récents en premier. Pour chaque projet : sa couverture, son nom dessous ;
   un appui rouvre le projet (en demandant avant de remplacer celui à l'écran, comme avant) ; appui long ou « … » :
   Renommer (dans la case), Supprimer (avec confirmation). La jauge des 20 Go et « Sauvegarder le projet en cours » restent.
   La carte de la page Compte mène à la Galerie.
3. Couverture : à chaque « Sauvegarder en ligne », la page dessine une image du montage (premier plan chanté, avec le
   texte et les effets), 300 px de large, WebP (JPEG sur iPhone), 64 Ko au plus, rangée dans R2 à côté du projet
   (`u/<compte>/p/<projet>/cover`). Effacée avec le projet, le compte et la règle des 6 mois. Les projets sauvegardés avant
   cette version montrent un carré de couleur numéroté jusqu'à leur prochaine sauvegarde. Une couverture ratée n'empêche
   jamais la sauvegarde.
4. Sans Pro : la Galerie s'ouvre et affiche « La sauvegarde en ligne est réservée à Stalak Pro. » avec « Découvrir Stalak Pro »
   (page Pro). Texte différent pour un ex-Pro : ses projets sont gardés 6 mois et reviennent s'il reprend Pro.
   Règles inchangées : l'ex-Pro perd l'accès, projets gardés 6 mois.
5. Le guide du glaçon d'aide (FR/EN) et la politique de confidentialité (FR/EN) parlent maintenant de la Galerie et de la couverture.

Skills utilisés : `appsec-review` (revue : `docs/appsec-review-menu-galerie.md`, 1 point corrigé : lecture d'une couverture
trop grande arrêtée à 64 Ko même sans taille annoncée). Parcours vérifiés avec Playwright (captures 390 px et 1280 px).

Fichiers touchés :
- nouveaux : `migrations/0007_project_covers.sql`, `tests/ui/gallery_ui.py`, `docs/appsec-review-menu-galerie.md`,
  `docs/handoff/compte-menu-galerie.md`
- modifiés : `functions/_lib/cloud.js` (couvertures), `functions/_lib/router.js` (route `cover`, `coverUrl` dans la liste,
  CSRF des images), `functions/_lib/help-guide.js` (Galerie), `src/account.js` (`projects.setCover`), `src/app.js` (menu,
  Galerie, couverture ; clés de texte à la fin des dictionnaires après la clé repère `_bloc.compte.galerie`), `src/markup.html`
  (menu, page Galerie), `src/theme.css` (bloc « account menu and Galerie » à la fin), `site_src/confidentialite.html`,
  `site_src/en/privacy.html`, `BACKEND.md` (section 11 + routes), `docs/STATUS.md`, `tests/backend/run.mjs`,
  `tests/ui/cloud-server.mjs` (compte ex-Pro de test), `public/` (reconstruit)

Migration SQL : **oui, `migrations/0007_project_covers.sql`**, à coller dans la console D1 AVANT de publier
(sinon la Galerie répond une erreur) :

    ALTER TABLE projects ADD COLUMN cover_at INTEGER;

Une seule ligne, sans danger pour l'existant (ajoute une colonne vide). À ne lancer qu'une fois.

Tests :
- `node tests/backend/run.mjs` : 63/63 (nouveau : couvertures — type vérifié par les octets, taille, CSRF, propriétaire seul,
  gratuit et ex-Pro refusés, effacement avec le projet et le compte)
- `tests/ui/gallery_ui.py` : 40/40 (non connecté, gratuit 390 px FR, ex-Pro 1280 px EN, Pro 390 px FR : vraie sauvegarde de
  l'exemple avec couverture, 3 colonnes, appui long, « … », renommer, supprimer, ouvrir ; Pro 1280 px EN : plus de colonnes,
  ouvrir), sans défilement horizontal, sans erreur de page
- `tests/ui/help_ui.py` : 42/42 (dont la version claude.ai qui se charge) ; `tests/ui/support_ui.py` : 34/34
- non lancé : vrai R2 et vrai iPhone (à vérifier après publication)

Ordre de mise en ligne (Chef de projet) :
1. migration 0007 dans la console D1 ;
2. fusion et publication ;
3. vérifier avec un compte Pro : menu du compte, « Sauvegarder en ligne », la couverture apparaît dans la Galerie.

Reste au propriétaire : rien d'autre que la vérification ci-dessus (idéalement sur iPhone).

À signaler :
- Si `compte/humain-pro` est fusionnée avant ou après : pas de conflit attendu (fichiers communs touchés à des endroits différents).
- Juridique : une phrase ajoutée à la politique de confidentialité FR/EN (la couverture est gardée avec le projet), à relire.
