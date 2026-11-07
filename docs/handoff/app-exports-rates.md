Statut : PRÊT
Branche : app/exports-rates (créée depuis `main` 4e15291 du 7/11, « Rapport chiffres du 7/11 »).
Maquette : https://app-exports-rates.stalak-site.pages.dev (l'appli) et https://app-exports-rates.stalak-site.pages.dev/admin-demo/
(le tableau de bord avec des chiffres inventés, onglet « Entonnoir », carte « Pourquoi les exports ratent »). À faire valider par
le propriétaire (règle 9).

Demande : rapport chiffres du 7/11 (`docs/stats/2026-11-07-rapport.md`), piste 4. 8 % des exports ratent (85 lancés, 70 réussis,
7 ratés, 5 annulés, du 3 au 7/11). Il fallait enregistrer la raison de chaque échec en compteurs anonymes, l'afficher dans le
tableau de bord et corriger les causes principales.

## Ce qui est compté (anonyme, rien sur la personne ni sur la vidéo)
Pour chaque export raté, le serveur garde un +1 par jour sur des listes fermées (`functions/_lib/metrics.js`, `EXPORT_X`) :
- **appareil** : iPhone / Android / ordinateur, lu dans le nom du navigateur, comme pour les visites ;
- **raison** : mémoire, lecture vidéo, fabrication de la vidéo (nouveau), appli quittée, annulé, et deux nouvelles :
  - « page fermée » : la page a été fermée pendant l'export ;
  - « onglet fermé par le navigateur » : l'export n'a jamais fini, et Stalak le découvre à la visite suivante. Sur téléphone,
    c'est presque toujours un manque de mémoire. C'est sans doute ce qui explique les 3 exports du rapport qui n'ont ni réussi
    ni raté (85 − 70 − 7 − 5).
- **étape** où ça casse : lancement, préparation des prises, fabrication des images, assemblage, fichier final, ou enregistrement
  en temps réel ;
- **format** (9:16, 4:5, 1:1, 16:9) et **une vidéo ou un pack** ;
- **méthode** : WebCodecs ou enregistrement en temps réel ;
- **mémoire de l'appareil** en tranches (1, 2, 4, 8 Go). Les iPhone ne la donnent jamais, ils sont comptés « inconnue ».
- **durée du passage** et **temps avant l'échec**, en tranches.
On compte aussi les lancés et les réussis par appareil (pour la part ratée de chaque appareil), les exports refaits tout seuls
(« nouvel essai »), ceux qui ont alors réussi (« rattrapés »), et les packs refusés parce que trop gros pour l'appareil.

Les packs refusés ne comptent plus dans les « ratés » : ils ne sont jamais lancés, un message propose un passage plus court ou
un pack plus petit. Jusqu'ici, ils gonflaient les « ratés ».

## Dans le tableau de bord
Onglet « Entonnoir », nouvelle carte **« Pourquoi les exports ratent »** :
- une phrase de résumé : ratés sur lancés, rattrapés tout seuls, packs refusés ;
- un tableau par appareil : lancés, réussis, ratés, % ratés ;
- une liste par raison, par appareil et raison, par étape, par format, vidéo ou pack, mémoire, durée et temps avant l'échec ;
- les exports rattrapés tout seuls, par raison.
Ça se remplit à partir de la mise en ligne. Les anciens chiffres « Ratées : … » de la carte « Vidéos exportées » restent.

## Les corrections
1. **Un export raté est refait une fois, tout seul**, avec des réglages plus sûrs :
   - une prise à la fois ;
   - un dessin en 2D au lieu du dessin par la carte graphique ;
   - l'encodeur choisi par le navigateur ;
   - un débit plus léger si la mémoire a manqué.
   L'écran d'export le dit : « L'export n'a pas marché du premier coup : Stalak le refait avec des réglages plus sûrs… ». La
   personne n'a rien à faire. Le message d'erreur n'apparaît que si le 2ᵉ essai rate aussi. Une annulation n'est jamais refaite.
2. **Appli quittée pendant l'export** (autre appli, écran verrouillé : la cause la plus fréquente sur téléphone d'après les
   anciens compteurs) : l'export s'arrêtait et il fallait recommencer. Maintenant, un message dit « Il repart tout seul dès que
   tu reviens ici », et l'export repart de lui-même au retour.
3. **Onglet fermé par le navigateur en plein export** (manque de mémoire) :
   - à la visite suivante, Stalak le dit : « Ton dernier export s'est arrêté en route… Le prochain sera fait plus léger » ;
   - l'export suivant se fait avec les réglages sûrs et un débit réduit, packs compris ;
   - ensuite tout redevient normal.
4. **Défaut trouvé en testant, qui existait déjà** : un export raté juste après une vidéo réussie remontrait l'écran de fin de
   l'ancienne vidéo. Le message d'erreur était donc caché, et la personne croyait que c'était fini. C'est corrigé. Un export raté
   lancé depuis l'écran de fin (« Enregistrer sans filigrane ») montre maintenant son message sur cet écran.

## Fichiers
- App : `src/app.js` (détails de l'export, nouvel essai, page fermée ou plantée, messages FR/EN), `src/markup.html` (une ligne
  sur l'écran d'export), `src/theme.css`, `src/account.js` (transmet les détails, mots courts seulement).
- Serveur et tableau de bord : `functions/_lib/metrics.js`, `functions/_lib/admin.js`, `functions/_lib/admin-page.js`,
  `tests/fixtures/dashboard-seed.mjs` et `functions/_lib/admin-demo-data.js` (chiffres inventés de la démo, refaits par
  `node tools/admin_demo_data.mjs`).
- Tests :
  - nouveau `tests/ui/exports_rates_ui.py` : iPhone 390 px et ordinateur 1280 px, FR et EN ;
  - nouveau test serveur dans `tests/backend/run.mjs` : listes fermées, appareil, essais et rattrapés, tableau de bord.

**Pour Comptes, paiements & serveur** :
- `metrics.js`, `admin.js` et `admin-page.js` sont modifiés : 3 nouveaux noms d'événements (`export_retry`, `export_saved`,
  `export_refused`), de nouvelles raisons (`encoder`, `closed`, `crash`) et les détails `body.x`.
- Pas de migration : tout va dans `daily_counts`, comme avant. Chaque valeur sort d'une liste fermée, donc le nombre de
  compteurs reste borné (environ 60 noms possibles).
- Un échec écrit environ 9 lignes de compteurs au lieu de 2. C'est négligeable à ce volume (une dizaine d'échecs par semaine).

## Correction après le retour du Chef de projet (7/11, 17 h)
`tests/ui/audit_ui.py` restait bloqué au passage « n° 3 : app quittée pendant un export fait en temps réel ». La cause : quand
on quittait l'app, `exportOne()` attendait le retour de la personne avant de se terminer, pour refaire l'export. Il ne finissait
donc jamais tant que la page restait cachée. (Plus tôt, j'avais pris ce blocage pour une machine trop chargée : c'était mon
erreur.)
Maintenant :
- l'export s'arrête tout de suite et proprement ;
- le message « L'export s'est arrêté quand tu as quitté Stalak. Il repart tout seul dès que tu reviens ici. » apparaît sous
  les boutons, ou sur l'écran de fin si l'export était lancé depuis là ;
- le nouvel essai est seulement programmé pour le retour, une fois. La page cachée est lue comme pour l'arrêt
  (`visibilityState`) ;
- seul un export vraiment commencé est refait.
`audit_ui.py` est adapté à la nouvelle façon de compter :
- un export arrêté parce qu'on a quitté l'app est compté `export_retry` (« hidden ») ;
- un pack trop gros est compté `export_refused` (« memory ») ;
- les détails `x` font partie des champs anonymes permis.
`exports_rates_ui.py` vérifie en plus que l'export se termine alors que la page reste cachée.

## Résultats des tests (7/11 au soir, sur la branche à jour, lancés un par un)
- `tests/ui/audit_ui.py` : **158/158**
- `tests/ui/formules_ui.py` : **137/137**
- `tests/ui/audit611_ui.py` : **91/91**
- `tests/ui/exports_rates_ui.py` : **76/76**
- serveur `tests/backend/run.mjs` : **102/102**
- `tests/ui/pied_de_page_ui.py` : **402/402**
- Plus tôt dans la journée, avant la correction (rien de ce qu'ils testent n'a changé depuis) : `fin_export_ui` 86/86,
  `fluidite_ui` 30/30, `partager_ui`, `filtres_ui`, `export_pub_ui`, `projet_local_ui`, `son_passage`, `remux_frag`,
  `paroles_suppr`, `animations_ui` et `liens_cmp_ui` sans échec, `plans_ui` 35/35, `gallery_ui` 49/49, `help_ui` 42/42.
  `support_ui` échoue comme sur `main`, à cause de son envoi d'e-mail de test (« Pas envoyés : access »), sans lien avec
  cette branche.

## Planche contact (skill `planche-contact`)
Un vrai export de l'exemple, fait avec les « réglages plus sûrs » du nouvel essai (comme après un onglet fermé), en Gratuit, 9:16,
20 s : **41 images vérifiées, aucun problème**. Le filigrane reste hors des zones TikTok / Instagram, les paroles sont lisibles et
non coupées, il n'y a ni image noire ni image figée. **0 problème restant.**
