Statut : PRÊT
Branche : app/pied-de-page (créée depuis `main` du 1/11 : 2e89cb0, avec `app/liens-cmp` fusionnée dedans : à intégrer après elle ou à sa place).

Résumé :
- **Un vrai pied de page, le même sur toutes les pages** : l'app (`/`, `/fr/`), Tarifs, les 5 pages légales, les 6 guides et la page Triller, en français et en anglais.
  - **Style Stalak** : bande pleine largeur, fond encre `#0a0d14`, glaçons sur le bord du haut, texte blanc. Taille 15 px, liens hauts de 36 px au moins (44 px pour les icônes et le sélecteur de langue).
  - **Pas fixe** : tout en bas de la page. Dans l'app, la bande garde de la place sous sa dernière ligne : tout en bas de la page, la bulle d'aide et le bouton « Exporter » flottant ne cachent aucun lien (vérifié sur iPhone et ordinateur, bouton Exporter affiché).
  - **4 colonnes sur ordinateur**, 2 sur tablette, empilées sur téléphone :
    - **Stalak** : logo, une phrase (« Ton playback monté sur le rythme, directement dans ton navigateur. » / « Lip-sync videos cut to the beat, right in your browser. »), icônes Instagram et TikTok @stalak_app ;
    - **Produit** : Tarifs, les 6 guides (titres anglais, marqués comme anglais sur les pages françaises), la page Triller ;
    - **Légal** : Conditions, Remboursement, Confidentialité, Mentions légales ;
    - **Tes choix** : Gérer les cookies, Your Privacy Choices, sélecteur Français / English.
  - **Ligne du bas** : « © 2026 Stalak · Made by 99Sayso ».
- **Sélecteur Français / English** :
  - dans l'app, ce sont les boutons d'avant : la langue change sur place, l'adresse suit, le montage reste, et tout le pied de page passe dans l'autre langue ;
  - sur les autres pages, ce sont deux liens vers la même page dans l'autre langue (Tarifs ↔ Pricing, Conditions ↔ Terms…). Les guides n'ont pas de version française : leur « Français » mène à l'accueil français.
- **Une seule source** :
  - `src/footer.py` contient le contenu, en FR et en EN ;
  - `src/footer.css` contient le style.
  - `build_site.py` s'en sert pour l'app et pour remplacer le `<footer>` de chaque page de `site_src` ; le style est ajouté à `/site.css`.
  - `build.py` (version claude.ai) en fait une version légère : marque, langue et ligne du bas, sans liens vers des pages qui n'existent pas là-bas.
  - Dans `src/markup.html`, `<!--FOOTER-->` marque l'endroit du pied de page, après le bloc principal.
- **Aucun lien vers un autre site** que stalak.app et nos comptes Instagram et TikTok (le test le vérifie sur chaque page).
- **Animations (skill `motion-design`)** : aucune. Elle ne servirait à rien sur un pied de page. L'ancien fondu d'apparition des pages statiques est retiré pour le pied de page, et le survol (souris seulement) ne change que la couleur.
- **Retiré** :
  - l'ancien pied de page de l'app : liens légaux en une ligne, liens des guides, icônes (`legal-links`, `guide-links`, `social-links`, `site.legal`, `site.guides`) ;
  - l'ancienne règle `.sitefoot` de `theme.css`.
- Le clic sur le sélecteur de langue est maintenant écouté sur toute la page (`src/app.js`), car le pied de page est réécrit au changement de langue. Le sélecteur de la page compte marche toujours.

Pour Marketing (`build_site.py` touché) :
- **Les 6 guides (`GUIDES`) et les comptes officiels (`SOCIAL`) sont maintenant dans `src/footer.py`.** C'est là qu'il faut les changer : `build_site.py` les lit de là pour le plan du site et le `sameAs` de Google. Rien d'autre ne change pour eux.
- `PAGE[...]['legal']` et `PAGE[...]['guides']` sont retirés de `build_site.py` (remplacés par le pied de page commun).
- Les pages de `site_src` gardent leur `<footer>…</footer>`, qui est remplacé à la construction : ne pas l'enlever (le build vérifie qu'il y en a exactement un par page).
- La page Triller est maintenant liée depuis toutes les pages (le propriétaire l'a demandé dans la colonne « Produit »). Avant, elle n'était liée que depuis le plan du site et l'accueil.

Pour le propriétaire :
- « Your Privacy Choices » reste en anglais aussi sur les pages françaises, comme tu l'as écrit (c'est le nom officiel américain). Avant, l'app française disait « Vos choix de confidentialité ».
- Captures téléphone et ordinateur envoyées dans la conversation.

Tests (2/11, iPhone 15 Pro émulé + ordinateur, FR + EN) :
- **Nouveau `tests/ui/pied_de_page_ui.py`** : 402/402. Il vérifie l'app et les 18 autres pages, plus la version claude.ai :
  - un seul pied de page, en bande pleine largeur, fond encre, glaçons, pas fixe, tout en bas, sans animation ;
  - les textes dans la langue de la page, et exactement les mêmes liens que l'app ;
  - seulement nos sites, et chaque lien mène à une page qui existe ;
  - Français / English vers la bonne page ;
  - 4 colonnes côte à côte sur ordinateur, empilées sur téléphone, pas de défilement de côté ;
  - la bulle d'aide et le bouton Exporter ne cachent rien ;
  - le changement de langue réécrit le pied de page et marche encore ensuite ;
  - « Your Privacy Choices » ouvre sa fenêtre ;
  - aucune erreur.
- **`liens_cmp_ui.py`** : adapté au libellé « Your Privacy Choices ».
- RÉSULTATS_SUITES
