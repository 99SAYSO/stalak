Statut : EN COURS (textes prêts ; attend la fusion de la branche d'App qui offre vraiment la 1re vidéo sans filigrane)
Branche : social/premiere-video
Maquette : https://social-premiere-video.stalak-site.pages.dev/fr/ (et /fr/tarifs, /pricing, / pour l'anglais)

Résumé :
Décision du propriétaire du 23/11 (5 h 25) : chaque compte a droit à sa 1re vidéo sans filigrane, offerte, une fois.
Textes du site, FR et EN ; jamais « sans filigrane » seul pour le gratuit, toujours « la 1re », et toujours la condition (un compte
gratuit, puisque le mode gratuit marche sans compte).
- Accueil : une ligne sous la phrase du haut, juste au-dessus de « Choisir mon son » (téléphone) / sous la phrase (ordinateur), avec
  un petit cadeau : « 1re vidéo sans filigrane offerte avec un compte » / « 1st video watermark-free with a free account ».
  Une seule ligne sur iPhone (390 px), FR et EN ; la note 4,7/5 reste dans le 1er écran.
- Tarifs, colonne Gratuit : « 1re vidéo sans filigrane offerte, une fois, avec un compte gratuit » ; la ligne suivante devient
  « Ensuite, un petit filigrane sur chaque vidéo… ». Tableau : « Sur chaque vidéo, sauf la 1re (offerte avec un compte gratuit) ».
- « C'est vraiment gratuit ? » : « Ta 1re vidéo sans filigrane est offerte, une fois, si tu crées un compte gratuit (sans carte).
  Ensuite… ». « Comment enlever le filigrane ? » corrigée aussi (elle disait « sur toutes les vidéos »).
- Anglais : mêmes changements sur `pricing.html` et l'accueil.

Fichiers touchés : `site_src/fr/tarifs.html`, `site_src/pricing.html`, `src/markup.html` (partagé : 1 ligne + commentaire dans le haut
de l'accueil), `src/app.js` (partagé : 2 lignes dans le dictionnaire EN, `_bloc.social.gift` + `hero.gift`), `src/theme.css` (bloc
`.hero-gift` commenté), `docs/STATUS.md`, ce compte rendu, `public/` reconstruit (`build_site.py --domain stalak.app --email contact@stalak.app`).

Migration SQL : aucune.

Tests : `accueil_a_ui` 77/77, `audit_ui` 122/122, serveur 115/115, `python3 build.py` OK ; captures 390 et 1440 px, FR et EN,
sans erreur ni défilement de côté. `formules_ui` 136/137 : l'échec (« le filigrane est dans chaque image ») est le même sur main
sans mes changements (à voir par App : il ne vient pas de cette branche, et la 1re vidéo offerte le fera sûrement évoluer).

Reste :
1. Chef de projet : fusionner **après** la branche d'App (export de la 1re vidéo sans filigrane) ; sinon le site promettrait une chose
   que l'app ne fait pas encore. Je passe ce compte rendu en PRÊT quand elle est sur main.
2. Juridique : conditions (déjà prévu par la décision).
3. App : le test `formules_ui` « filigrane dans chaque image » est à mettre à jour avec la 1re vidéo offerte.
