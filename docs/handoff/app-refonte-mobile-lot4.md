Statut : EN COURS (lot 4 fait, maquette à montrer ; série de non-régression en cours)
Branche : app/refonte-mobile-lot4, partie de `app/refonte-mobile-lot3` : **elle contient le lot 3** (fusionner celle-ci suffit
pour les deux, une fois les deux maquettes validées).
Maquette de la branche : https://app-refonte-mobile-lot4.stalak-site.pages.dev/fr/ (sur un téléphone).
Demande : `docs/handoff/chef-refonte-mobile-app.md` (démos n° 6, 8, 10, 14, 15) ; le propriétaire le 24/11 à 16 h : « commence
le lot 3 et le reste, il faut finir le plus rapidement possible ». **Les écrans 14 (paywall) et 15 (offre à 1 €) attendaient
son « ok final » : je l'ai pris dans ce message ; à lui de le confirmer sur la maquette.**

## Ce qui est fait (téléphone, sur stalak.app), dans un fichier à part `src/mobile4.js`
Les mots des démos sont repris mot pour mot. Tous les prix, droits et paiements viennent de l'app (`window.StalakM.pw`) : ce sont
ceux de la page des formules et de l'écran de fin ; ce fichier ne fixe aucun prix et n'ouvre aucun paiement à lui.
- **Tutoriel** (n° 10) : 4 écrans (« Choisis ton son », « Filme tes prises », « Stalak coupe sur le rythme », « Exporte et
  poste »), barre en haut qui se remplit, « Passer », « Suivant », « C'est parti ! » ; on peut aussi glisser. Au premier
  lancement, juste après l'onboarding (répondu ou passé), une seule fois ; et depuis le profil, « Revoir le tutoriel »
  (sous « Aide »).
- **Glaçon d'aide** (n° 6) : plein écran, en-tête bleu (retour, le glaçon, « Le glaçon d'aide », « Répond tout de suite »),
  « Aujourd'hui · heure », bulles (le glaçon à gauche avec sa tête, toi à droite en bleu), réponses toutes prêtes en pastilles,
  le champ et la flèche d'envoi. **Les vraies réponses** (celles de l'assistant du site) ; « Parler à un humain » (Creator
  Plus) et « Copier les infos pour l'équipe » restent.
- **Paywall** (n° 14) : la page des formules d'une personne sans formule, sur téléphone : la mascotte, « Fais décoller ton son,
  {nom} » (le nom d'artiste de l'onboarding, sinon le nom du compte, sinon sans nom), **5 vrais avis clients mot pour mot**
  (ceux de `avis.json`, qui défilent), l'année mise en avant (prix ramené au mois, « Meilleur prix · -48 % » calculé sur les
  vrais prix) et le mois, « N jours gratuits » seulement si l'essai est possible, **un seul bouton** (« Essayer gratuitement »
  avec l'essai, sinon « Choisir Pro ») qui fait exactement ce que fait le bouton Pro de la page, et dessous les conditions en
  clair (« Rien aujourd'hui. Puis 49,99 $ par an dans 7 jours. Annulable à tout moment. »). Pas de compte à rebours, pas de prix
  barré. « Voir Creator Plus (packs, sauvegarde en ligne) » ramène toute la page des formules habituelle.
- **Fin d'export avec filigrane, offre à 1 €** (n° 15), seulement quand l'app propose déjà l'offre (droit de Comptes, montants
  de Paddle) : fond sombre, la vidéo, « ✓ Ta vidéo est prête », une feuille blanche « Retire le filigrane pour 1 € »,
  « Retirer pour 1 € » (le bouton de l'offre de Comptes), les conditions de Comptes en clair, « Enregistrer avec le filigrane »
  en petit. Le reste de l'écran de fin (légende, partager, poster…) est dessous, inchangé. Sans l'offre : l'écran habituel.
- **Après un achat** (n° 8) : à la place du « Merci ! » : une feuille qui monte, la mascotte contente, des confettis (bleu,
  blanc, glace, jaune, rose), « Bienvenue dans Stalak Pro ! », « Plus de filigrane. Tous les effets et les paroles
  automatiques sont débloqués. », un seul bouton « Faire un montage » (ouvre le choix du son), « Voir ma formule ».
  **Phrase ajoutée pour Creator Plus** (la démo ne montre que Pro) : « Plus de filigrane. Les effets, les paroles
  automatiques, les packs et la sauvegarde en ligne sont débloqués. » → à valider par le propriétaire.

## Pas fait : le choix du moyen de paiement (n° 5)
L'écran « Comment veux-tu payer ? » (Carte, PayPal, Apple Pay) demande d'ouvrir la fenêtre de Paddle sur un moyen précis :
c'est `src/account.js` (Comptes). **→ Comptes** : dire si Paddle le permet (`allowedPaymentMethods` ou équivalent) ; sinon,
comme prévu par le Chef, l'écran s'arrête au rappel de la formule et Paddle prend le relais (c'est déjà le cas aujourd'hui :
le bouton ouvre Paddle directement).

## Tests
- Nouveau `tests/ui/refonte_mobile4_ui.py` (serveur de test avec de vrais comptes) : **61/61** (iPhone 12 FR, iPhone SE EN,
  ordinateur, « sous test sans le drapeau »). Il vérifie aussi que les avis du paywall sont ceux de la page, mot pour mot, que
  les prix sont ceux de la page des formules, et que le bouton achète Pro avec la facturation choisie.
- L'offre à 1 € est testée avec des montants donnés comme Paddle les donnerait (pas de Paddle dans le serveur de test).
- Sous test automatique, ce fichier reste éteint sauf si le test le demande (`window.__stalakM4on`).

## Pour les autres
- **Comptes** : la page des formules et l'écran de fin sont rhabillés sur téléphone (mêmes boutons, mêmes textes de Comptes
  pour les conditions) ; le choix du moyen de paiement (ci-dessus).
- **Marketing** : `build_site.py` sert un fichier de plus (`mobile4`, `window.STALAK_M4`).
- **Juridique** : le paywall écrit les conditions en clair sous le bouton ; vérifier la phrase.

## Fichiers
`src/mobile4.js` (nouveau), `src/app.js` (`StalakM.pw` : prix, essai, facturation, achat, offre, merci ; chargement de
`mobile4`), `build_site.py`, `tests/ui/refonte_mobile4_ui.py`.

## Paywall « Salle » (demande du Chef du 24/11, 18 h 18 : `docs/handoff/chef-paywall-scene.md`, maquette D)
Remplace le paywall ci-dessus (n° 14) :
- **Décor** : le dessin de la salle (`docs/marque/decors/scene-salle.jpg`, compressé en WebP 960 px, 71 Ko :
  `site_src/decors/scene-salle.webp`), fondu vers le bleu nuit `#081a45` ; chargé seulement à l'ouverture du paywall.
  À l'ouverture : léger zoom arrière, 2 faisceaux qui balaient, flashs de téléphones dans le public, confettis.
- **Mascotte** : le sticker `docs/marque/mascotte/sticker-star.png` (détouré, WebP 382 px, 40 Ko : `site_src/emoji/star.webp`),
  qui tombe sur la scène puis se balance.
- **Titre** : « Fais décoller **ton son** » en DM Sans très gras, blanc, « ton son » en jaune `#ffd23f`, sur une ligne (le nom
  d'artiste n'est plus dans le titre, comme la maquette D).
- **Avis** : 6 vrais avis (`avis.json`, mot pour mot) qu'on fait glisser au doigt, la carte suivante dépasse, les points
  suivent, 3 lignes au plus ; ils avancent seuls toutes les 5 s jusqu'à ce qu'on les touche.
- **Formules** : « Pro · à l'année » (« Meilleur prix · −48 % »), « Pro · au mois », la pastille **« ou »**, puis le bouton
  (« Essayer gratuitement » avec l'essai, « Choisir Pro » sinon) avec un reflet qui passe et une légère pulsation.
- **Dessous** : « Rien à payer aujourd'hui · Annulable en 1 geste » avec l'essai (texte de la maquette) ; sans essai, le
  montant (« 49,99 $ par an. Annulable à tout moment. »).
- « Voir Creator Plus (packs, sauvegarde en ligne) » reste en petit lien sous le bouton (toute la page des formules).
- « Réduire les animations » : rien ne bouge, tout est là.
- **Juridique** : les conditions de l'essai (« Puis 49,99 $ par an dans 7 jours ») ne sont plus écrites sous le bouton, comme
  dans la maquette validée ; le prix est sur les cartes. À relire (et « Annulable en 1 geste »).
- **Marketing** : 2 images ajoutées dans `site_src/` (`decors/scene-salle.webp`, `emoji/star.webp`).
- Test `refonte_mobile4_ui` : **69/69** (en plus : police et couleur du titre, une ligne ; décor et sticker servis ; pastille
  « ou » à sa place ; avis au doigt, points qui suivent).
