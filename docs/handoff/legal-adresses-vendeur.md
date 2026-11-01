Statut : PRÊT
Branche : legal/adresses-vendeur

Résumé :
Infos pour décider, pas un avis juridique. Détail dans docs/juridique/PADDLE.md.
1. Adresses vérifiées après la bascule « anglais à la racine » :
   - pages légales FR/EN, liens de l'app (FR/EN), liens des e-mails (#account / #compte) : tous bons ;
   - liens externes (Paddle, Google, CNIL, Cloudflare) : tous ouverts ; anciennes adresses en 301 ;
   - corrigé : BACKEND.md (fiches Google/Microsoft → /privacy, /terms ; /en/terms → /terms) ;
   - corrigé : « Account → Manage my subscription » (le nom du bouton de l'app) dans Terms et Refunds ;
   - prêts dans PADDLE.md : la liste des adresses et les textes à donner à Paddle pour la vérification du site.
2. Bouton « Renoncer au contrat ici » avec Paddle comme vendeur :
   - l'obligation pèse d'abord sur Paddle, mais c'est incertain ;
   - recommandé : question écrite à Paddle, et sinon bouton dans Stalak (cahier des charges pour Comptes).
3. Identité de la micro-entreprise :
   - nouveau fichier vendeur.json à la racine (vide) ;
   - build_site.py affiche les blocs <!--PRO--> / <!--MED--> une fois rempli, sinon les textes « particulier » d'aujourd'hui, et refuse un fichier à moitié rempli ;
   - mentions légales FR/EN (nom + EI, RNE, SIRET, adresse, téléphone, directeur de publication, médiateur) et conditions FR/EN (nom légal, médiateur, paddle.net) ;
   - testé avec des données fictives puis remis à vide.
   - Médiateur : obligation, coût, où l'afficher, plateforme européenne fermée → PADDLE.md partie 4.
4. Confidentialité FR/EN :
   - pays (Cloudflare, 2 lettres, sans ville ni IP) à l'inscription et sur les visites ;
   - compteurs anonymes de l'entonnoir ; Cloudflare Turnstile ; signe de vie toutes les 5 min ; empreinte d'IP pour les limites ;
   - section « Your US privacy rights » : catégorie « approximate location limited to the country ».
   - Consigne pour Comptes dans docs/STATUS.md.

Fichiers touchés :
- build_site.py (lecture de vendeur.json et blocs conditionnels, dans la boucle des pages statiques uniquement)
- vendeur.json (nouveau, vide)
- site_src/legal-notice.html, terms.html, privacy.html, refunds.html
- site_src/fr/mentions-legales.html, fr/conditions.html, fr/confidentialite.html
- public/ (reconstruit : build_site.py --domain stalak.app --email contact@stalak.app)
- BACKEND.md (3 adresses)
- docs/juridique/PADDLE.md (nouveau), docs/STATUS.md (section Juridique), docs/handoff/legal-adresses-vendeur.md

Migration SQL : aucune (la colonne pays est à faire par Comptes)

Tests :
- liens internes des 10 pages légales et tarifs : tous mènent à une page existante (ancres comprises) ;
- build en mode « particulier » (actuel) et en mode « micro-entreprise » (données fictives) : textes vérifiés ;
- pages à 390 px et 1280 px, FR/EN : pas de défilement horizontal, aucune erreur, aucun {{…}} restant ;
- node tests/backend/run.mjs : 79/79.

À fusionner avant ou avec la branche Comptes du pays : la confidentialité annonce déjà l'enregistrement du pays.

Reste au propriétaire :
- Remplir vendeur.json (nom, SIRET, adresse, téléphone) une fois la micro-entreprise créée, puis médiateur.
- Demander à Paddle s'il fournit le bouton de rétractation.
- Mettre /privacy et /terms dans Google Cloud → Stalak → Branding.
