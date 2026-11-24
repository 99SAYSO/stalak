Statut : PRÊT

# Branche `app/stats-analyse` — « Stats » et analyse de l'artiste (24/11)

Demande : `docs/handoff/chef-stats-analyse.md`. Part de `app/refonte-mobile-lot4` (contient lots 3 et 4) et de la fusion de `compte/stats-analyse` (serveur de Comptes, migration 0023, contrat `docs/contrats/stats-analyse.md`).

## Ce qui change (téléphone, stalak.app)
- **Premier lancement** : plus de questionnaire ; le tutoriel (lot 4) s'ouvre directement.
- **Onglet « Stats »** : si le questionnaire n'a jamais été fait, il s'ouvre ici (mêmes questions que la démo n° 13, « Passer » partout).
  - « Autre » dans le style ouvre un champ libre (envoyé avec les réponses).
  - Liens : **TikTok obligatoire** ; **Spotify obligatoire** si « déjà en ligne » ; les autres facultatifs. Message clair sous le champ manquant. `@pseudo` accepté pour TikTok et YouTube.
  - Chargement d'environ **9 s**, à rythme irrégulier (étapes qui avancent vite puis ralentissent).
  - Écran « **Ton analyse est prête** » : aperçu flouté avec cadenas, bouton « **Crée ton compte pour voir ton analyse** » (déconnecté) → inscription ; après l'inscription, l'onglet Stats se rouvre tout seul.
- **Écran « Tes stats »** (fichier à part `src/mobile5.js`, servi `/assets/mobile5.<hash>.js`, chargé seulement sur téléphone) :
  - lit `GET /api/stats?lang=` ; si le serveur répond `pending`, réessaie 3 fois toutes les 3 s ;
  - liens manquants (`missing`) → note et bouton « Ajouter mes liens » (rouvre le questionnaire à l'étape des liens) ;
  - état Spotify (`spotify.state`) en phrase simple ; formulaire « auditeurs » si le serveur le demande ;
  - **bilan gratuit** : `summary.sentences` et `summary.facts` (dont `under1000` → « moins de 1 000 écoutes ») ;
  - bouton « Relier TikTok » si `tiktokLinked` est faux ;
  - **partie Pro** : sans Pro (`locked`), faux graphique flouté + cadenas + « Débloquer avec Pro » (→ écran des formules) ; avec Pro (`pro`), semaines, sons, sorties par mois (`byMonth`), conseil de rythme (`avgGapDays`, `daysSinceLast`), plan de la semaine, villes.
- Noms de champs : **ceux de Comptes**, sans en inventer (`signedOut`, `missing`, `spotify`, `summary`, `locked`, `pro`, `tiktokLinked`).

## Tests
- Nouveau `tests/ui/refonte_stats_ui.py` : **47/47** (déconnecté FR/EN, questionnaire passé, Pro FR/EN).
- `refonte_mobile2_ui.py` : cas de l'onboarding au 1er lancement retirés (il n'y en a plus).
- Série du lot 4 repassée : mêmes échecs connus que sur `main` seulement.

## Pour les autres
- **Comptes** : rien touché dans `functions/` ni `account.js` ; l'app lit `/api/stats` et envoie le profil par `StalakAccount.saveArtist` (champ libre « autre » : `genreOther`, déjà prévu au contrat).
- **Marketing** : `build_site.py` sert un fichier de plus (`mobile5`).
- **Juridique** : rien de nouveau.
- **Propriétaire** : l'écran « ton plan » de la démo 13 est remplacé par « Ton analyse est prête » (sa décision du 24/11).

Maquette : https://app-stats-analyse.stalak-site.pages.dev/fr/
