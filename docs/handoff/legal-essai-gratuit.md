Statut : PRÊT
Branche : legal/essai-gratuit

Résumé :
Essai gratuit de Stalak Pro écrit dans les pages légales FR/EN (décision du propriétaire du 23/11, remplace la « vidéo offerte »). Infos pour décider, pas un avis juridique. Règles complètes : docs/juridique/ESSAI_GRATUIT.md.
- Conditions (section 5 « Essai gratuit, renouvellement… », `#trial` / `#essai`) : 7 jours, Pro seulement (mensuel et annuel), carte demandée via Paddle, rien prélevé pendant l'essai, prélèvement automatique au bout de 7 jours sauf annulation, prix et date du 1er prélèvement affichés avant de confirmer, e-mail 2 jours avant, annulation en ligne possible pendant l'essai, une seule fois par personne, offre modifiable pour les nouveaux utilisateurs, abus. Aussi : formule Pro, encadré « en bref », rappels, annulation, remboursement (section 8).
- Remboursement : paragraphe « Essai gratuit » : rien à rembourser si annulé avant ; après le 1er prélèvement, 14 jours de remboursement = jusqu'à 21 jours depuis le début de l'essai.
- Confidentialité (`#trial` / `#essai`) : carte chez Paddle (jamais vue par nous), indicateur « essai utilisé » et date de fin, e-mail de rappel = e-mail de service (pas de consentement, aucune offre dedans), empreinte d'e-mail gardée même après suppression du compte, effacée 12 mois après ; base : intérêt légitime.
- Dates « dernière mise à jour » : 23/11/2026.

Règles à respecter (détail dans ESSAI_GRATUIT.md) :
- Avant paiement : dire que l'essai devient payant, le prix, la date du 1er prélèvement, comment annuler, accord explicite ; l'écran de paiement doit le répéter (les conditions seules ne suffisent pas).
- Rappel 2 jours avant : pas obligatoire pour un essai de 31 jours ou moins en Californie, mais utile ; e-mail de service, sans offre.
- Annulation : en ligne, même chemin que l'inscription, sans obstacle ; pendant l'essai, aucun prélèvement.
- Rétractation UE : contrat sans doute conclu au début de l'essai ; notre remboursement de 14 jours après chaque paiement couvre largement le délai légal. Bouton « Renoncer au contrat ici » : dès le début de l'essai.

Points à trancher :
- Passer à Creator Plus pendant l'essai : l'essai s'arrête-t-il, prélèvement immédiat ? (pas écrit dans les pages)
- Comptes garde-t-il une empreinte ? Sinon je retire la phrase (sinon la page promet du faux). Si oui : HMAC, e-mail normalisé, effacement à 12 mois.

Fichiers touchés :
- site_src/terms.html, privacy.html, refunds.html, fr/conditions.html, fr/confidentialite.html, fr/remboursement.html
- public/ : les 6 pages + sitemap.xml (build_site.py --domain stalak.app --email contact@stalak.app)
- docs/juridique/ESSAI_GRATUIT.md, docs/STATUS.md (section Juridique & business uniquement), docs/handoff/legal-essai-gratuit.md

Migration SQL : aucune

Tests : 115/115 tests serveur ; build_site.py et build.py ok ; 8 pages légales vérifiées à 390 px et 1280 px (pas de défilement horizontal, aucune erreur, aucun {{…}}). Aucun fichier de l'app ni du serveur touché.

Reste au propriétaire : rien. Comptes et App doivent faire ce qui est annoncé avant la mise en ligne ; relecture par un professionnel avant les vrais paiements.
