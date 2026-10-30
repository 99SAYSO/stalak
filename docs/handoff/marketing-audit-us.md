Statut : PRÊT
Branche : marketing/audit-us

Résumé : les 6 priorités Marketing de l'audit du 30/10 (`docs/audit/2026-10-30-croissance.md` ; points 1, 8, 9, 14 et 15 de `docs/audit/2026-10-30-ux.md`).

1. **Données structurées de l'accueil en USD** (`build_site.py`) :
   - `WebApplication.offers` liste Free, Stalak Pro (mensuel et annuel) et Creator Plus (mensuel et annuel), en USD ;
   - `x-default` ajouté aux pages Tarifs et aux paires du plan du site.
2. **Anglais de l'app** :
   - drapeau américain à la place du britannique (`src/markup.html`, 2 boutons de langue) ;
   - « takes » au lieu de « playbacks » ;
   - messages sans « je » anonyme : `auto.novoice`, `play.stuck`, `crash.t`, `crash.p`, `lyr.empty`, `lyr.vox.bad`, `lyr.vox.unsure`.
   - Seules les valeurs du dictionnaire anglais changent dans `src/app.js`, aucune clé. Le glaçon d'aide garde le « je », puisqu'on sait que c'est lui qui parle.
3. **Premier écran** (bloc `#heroPitch` en haut de l'étape Son, caché dès qu'un son est importé) :
   - une phrase : « Your takes, cut on the beat. » et son sous-titre ;
   - les pastilles « No account needed » et « On Free, your videos never leave your device » ;
   - la vidéo finie en boucle n'apparaît que si `site_src/demo/hero.mp4` existe : `build_site.py` retire le bloc sinon, et `build.py` le retire toujours ;
   - `#demoBtn` devient un vrai bouton ;
   - ligne `ap.noacct` sous le titre de l'écran de connexion ;
   - styles dans un bloc Marketing à la fin de `src/style.css` ; clés anglaises dans le bloc `_bloc.marketing.accueil`.
4. **6 pages anglaises par cas d'usage, NON publiées** : `site_drafts/` (générateur `make_pages.py`, pages dans `out/`, mode d'emploi dans `README.md`). À publier seulement après la décision sur l'anglais à l'adresse principale.
5. **`?ref=`** (`src/app.js`, juste avant le bloc des visites) :
   - lu dans l'adresse puis retiré (`?app=1`, `?plan=…` gardés) ;
   - sinon, déduit du site d'où vient la visite ;
   - gardé pour l'onglet seulement et envoyé dans `/api/presence` ;
   - le serveur l'ignore pour l'instant. Ce qui reste à Comptes est dans STATUS.
6. **Plan US mis à jour** (`docs/marketing/US_FIRST.md`, et un encadré dans le document claude.ai « Stalak — États-Unis d'abord ») :
   - TikTok : lien en bio à 1 000 abonnés, compte personnel ;
   - Reddit : règle 90/10 et 2 à 4 semaines de participation d'abord ;
   - beatmakers « type beats » ;
   - tutos YouTube longs ;
   - vocabulaire « snippet » et « no AI face » ;
   - grosse promo après les vrais paiements ;
   - calendrier ajusté.

Fichiers touchés :
- `build_site.py`, `build.py` (2 lignes : retrait du bloc vidéo) ;
- `src/markup.html` (drapeau, `#heroPitch`, `ap.noacct`, classe de `#demoBtn`) ;
- `src/app.js` (bloc `_bloc.marketing.accueil`, textes anglais, `VISIT_REF`) ;
- `src/style.css` (bloc Marketing à la fin) ;
- `site_src/tarifs.html`, `site_src/en/pricing.html` (`x-default`) ;
- `site_drafts/` (nouveau) ;
- `public/` (reconstruit) ;
- `docs/STATUS.md`, `docs/marketing/US_FIRST.md`, ce compte rendu.

Migration SQL : aucune de mon côté. Comptes en ajoutera une pour enregistrer `ref`.

Tests :
- `node tests/backend/run.mjs` : 70/70 ; `node --check src/app.js` passe ; `build.py` et `build_site.py` passent.
- Playwright à 390 px et 1280 px :
  - pages vérifiées : `/`, `/en/`, `/tarifs` et `/en/pricing`, plus l'écran de connexion en anglais (390 px) ;
  - aucun défilement horizontal, aucune erreur ;
  - `/en/?ref=tiktok&app=1` donne l'adresse `?app=1`, `sessionStorage` = tiktok, et `/api/presence` reçoit `{"ref":"tiktok"}`.
- Plus aucun « EUR » dans les données structurées de l'accueil (9 « USD »).

Reste au propriétaire :
- Filmer la vidéo finie (`site_src/demo/hero.mp4`, 5 à 8 s, 9:16, sans son) et sa version de 20 à 30 s (`site_src/demo/exemple.mp4`).
- Décider de l'anglais à l'adresse principale avant que les pages par cas d'usage soient publiées.
- Commencer à participer sur Reddit avec le compte de 99Sayso, sans parler de Stalak.
