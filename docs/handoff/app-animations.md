Statut : EN COURS (tests en cours)
Branche : app/animations (créée depuis `main` du 31/10 au matin, 18e93ac). Elle contient `app/audit-fix` (fusionnée dedans, pas encore dans `main`) : fusionner `app/animations` suffit.

Résumé : tour complet des animations du site et de l'app avec le skill `motion-design` (règle du 31/10). Chaque animation a un rôle, sinon elle est retirée. Les durées et les courbes viennent de réglages communs. Seuls `transform` et `opacity` bougent. Rien ne rebondit quand on touche. Tout s'arrête avec « Réduire les animations ». Le style givré reste : stalactites, neige, givre, mascotte.

## Réglages communs (`src/theme.css` pour l'app, `site_src/site.css` pour le site, `:root`)
- Durées : `--dur-1` 120 ms (appui), `--dur-2` 180 ms (menus, petites fenêtres, fermeture), `--dur-3` 240 ms (fenêtres, panneaux, cartes), `--dur-4` 300 ms (une étape ou une page entière), `--dur-5` 500 ms (rare : fête, ondulation).
- Courbes :
  - `--ease-out` (ease-out-quart) : ce qui apparaît ou répond à un toucher ;
  - `--ease-out-soft` (ease-out-cubic) ;
  - `--ease-press` (ease-out-quad) : un appui ;
  - `--ease-move` (ease-in-out-cubic) : ce qui est déjà à l'écran et bouge ;
  - `--ease-in` : ce qui part pour de bon ;
  - `linear` : le temps et la progression.
- Les anciens noms `--slide` et `--soft` pointent sur ces courbes. `--slide` dépassait (petit rebond) : plus maintenant.
- Règle : seulement `transform` et `opacity`. Changements de couleur et de largeur immédiats. Plus de flou animé (`filter: blur`), coûteux sur iPhone.

## Chaque animation : ce qui change et pourquoi
| Animation | Rôle | Avant | Maintenant |
|---|---|---|---|
| Changement d'étape (Son → Prises → Paroles → Montage, et retour) | continuité : on avance ou on recule | 500-550 ms, glisse de 36-42 px avec rotation et rebond | 300 ms, glisse de 24 px dans le sens du trajet, ease-out, sans rotation ni rebond |
| Entrée dans l'étape Montage : vignettes des filtres | (pas une animation, mais elle faisait saccader le glissement de l'étape) | les 27 vignettes dessinées d'un coup, même celles cachées derrière « +23 » : images de 1 à 5 s avec le processeur ralenti 4 fois | seulement les vignettes visibles, après le glissement (320 ms), quelques-unes par image (8 ms de travail au plus) : 50 à 80 ms au pire, ralenti 4 fois |
| Aperçu qui apparaît (étape 3) | continuité | 400 ms | 240 ms, ease-out |
| Stalactites des cartes qui « poussent » à chaque étape | aucun (rejoué à chaque étape) | 500 ms avec rebond | retiré (stalactites fixes) |
| Pastille de l'étape en cours | dire quelle étape est active | 450 ms, tourne et rebondit | 180 ms, grandit de 85 % à 100 %, ease-out |
| Reflet qui traverse l'étape en cours | aucun | 700 ms | retiré |
| Boutons (appui) | réponse au toucher | 100-120 ms, ombre et fond animés | 120 ms, seulement l'enfoncement (transform), ease-press ; ombre et fond changent d'un coup |
| Boutons principaux au survol : tremblement de givre et goutte | aucun (et sur iPhone le survol reste collé après un toucher) | 450 ms et 900 ms | retirés |
| Bouton « Tap » des paroles | réponse immédiate, très fréquent | 70 ms (transform + ombre) | 60 ms, transform seulement |
| Choix (segments, langue, police, filtres, vignettes de la Galerie, poignées du son) | réponse au toucher | couleurs animées 150 ms, transform 100-150 ms | couleur immédiate, transform 120 ms ease-press |
| Logo au survol (petit saut) | aucun | 2 × 500 ms | retiré |
| Mascotte qui dit bonjour sur l'écran d'accueil | accueil, une fois | 1,6 s | 1,2 s, ease-out |
| Neige du fond (2 couches) | ambiance de la marque | 13 s et 19 s, linéaire, sans fin | gardée telle quelle (transform seulement) ; arrêtée avec « Réduire les animations » |
| Neige dans le carré d'import et la liste de prises vide | aucun (la neige du fond tombe déjà derrière) | 14 s sans fin | flocons fixes |
| Carré d'import quand un fichier le survole | dire « lâche ici » | tremblement sans fin | le givre apparaît en 120 ms, sans tremblement |
| Barre de progression (et la tête de la mascotte dessus) | montrer que ça avance | largeur animée 200 ms ; tête qui bouge 800 ms | largeur posée d'un coup (pas d'animation de mise en page) ; la tête bouge toujours (600 ms, ease-move) pour dire « ça travaille » |
| Barres de la sauvegarde en ligne et de l'export | progression | largeur animée 250-300 ms | largeur posée d'un coup |
| Écran d'export (igloo qui se construit, mascotte qui porte les blocs, vagues, neige, drapeau) | faire patienter, montrer l'avancée | blocs 250-350 ms avec rebond, porte et drapeau 400 ms | blocs, porte, drapeau 240 ms ease-out sans rebond ; mascotte, vagues et neige gardées (attente longue) |
| Bande des coupes (plan touché) | montrer le plan choisi | 300 ms avec rebond | 180 ms ease-out |
| Plan de la ligne de temps qui se soulève | état du plan | 200 ms avec rebond | 180 ms ease-move |
| Points du rythme | battre la mesure, très fréquent | 80 ms (taille + couleur) | 80 ms linéaire, taille seulement |
| Fenêtres de question (« Recommencer ? », filtre Pro, sauvegarde en ligne) | une fenêtre arrive | 180 ms, monte de 6 px | 240 ms, monte de 8 px depuis 95 %, ease-out |
| Fenêtre Pro après la 1re vidéo | proposer Pro | 500 ms avec rebond, reflet par fond animé (dans `app/audit-fix` avant correction) | fond 180 ms, fenêtre 240 ms depuis 95 % ease-out, reflet givré une seule fois (700 ms, transform) ; fermeture immédiate |
| Bulle d'aide (glaçon) | se faire trouver au début | se balance sans fin, tremble au survol | se balance 6 fois puis s'arrête (déjà fait), plus de tremblement au survol |
| Panneau d'aide | s'ouvre depuis le glaçon | 300 ms avec rebond, depuis 94 % | 240 ms depuis 95 %, ease-out, depuis le coin du glaçon |
| Menu du compte | menu | 160 ms | 180 ms ease-out, part du coin du bouton |
| Page compte / formules (ouverture, fermeture) | une page passe par-dessus | ouverture 280 + 440 ms avec flou et rebond ; fermeture 230 ms floue | ouverture : fond 180 ms + contenu 240 ms ease-out, sans flou ; fermeture 180 ms (le code attend aussi 180 ms) |
| Vues du compte, cartes des formules (décalées), onglets connexion / inscription, champs | continuité | 320-460 ms avec flou et rebond ; cartes décalées de 50 ms | 240 ms ease-out sans flou ; cartes décalées de 40 ms ; onglets 240 ms dans leur sens |
| Indicateur des onglets | se déplace sous l'onglet choisi | 400 ms avec rebond | 240 ms ease-move |
| Stalactites des cartes de formules | aucun | 500 ms | retiré |
| Ondulation au toucher (page compte) | réponse au toucher | 550 ms | 500 ms ease-out |
| Erreurs, messages, emoji de la page compte | attirer l'œil | 200-300 ms avec rebond | 180-240 ms ease-out |
| Merci après l'achat Pro (confettis, emoji, « Merci ») | fête, une seule fois | 600 ms avec rebond | gardée (moment rare) : 500 ms ; sortie 180 ms ; carte 240 ms |
| Points du diaporama après l'achat | dire quelle page | largeur animée 200 ms | changement immédiat |
| Flocons qui jaillissent des boutons | petit plaisir sur « Continuer » (quelques fois par vidéo) | sur « Continuer » et « Régénérer », 620 ms | gardés sur « Continuer » et la page compte, 500 ms ease-out ; retirés de « Régénérer » (appuyé sans arrêt) |
| Caméra : compte à rebours | le temps (1 s par chiffre) | 950 ms | gardé |
| Caméra : « prise enregistrée » | message | 350 ms | 240 ms ease-out |
| Caméra : « Refaire » qui appelle | attirer l'œil | halo animé (ombre) 2 × 800 ms | petit gonflement (transform) 2 × 500 ms |
| Bouton pub givré | demande du propriétaire : bien visible | reflet 3,6 s et cristaux 2,4 s sans fin | gardé, sur la courbe commune (transform et opacity) |
| Bouton « Pro » de la barre du haut : reflet, stalactites qui se balancent, goutte qui tombe | aucun (trois boucles sans fin qui distraient et usent la batterie) | 5 s, 3,4 s, 5 s sans fin | retirés (stalactites fixes) |
| Cadenas, étiquettes PRO / CREATOR+ | — | pas d'animation | inchangé |
| Filigrane | règle du propriétaire : saute d'un coin à l'autre sans glisser | pas d'animation | inchangé (aucun mouvement entre deux places) |
| Galerie | réponse au toucher | vignettes 120 ms | 120 ms ease-press |
| Défilements faits par la page (message d'erreur, bouton « Exporter ↓ », filtres) | amener à l'endroit utile | toujours glissés | glissés, sauf avec « Réduire les animations » (saut direct) |
| Site : arrivée sur une page (mentions, tarifs…) | continuité | 500 ms avec flou et rebond, stalactites qui poussent | 300 ms, monte de 12 px, ease-out, sans flou ; stalactites fixes |
| Site : passage d'une page à l'autre | continuité | 260 ms, floue | 180 ms, fondu seul |
| Site : boutons au survol (tremblement) | aucun | 450 ms | retiré |
| Page Tarifs : cartes, emoji, ruban, reflet, FAQ | présenter les formules | 500-600 ms avec flou et rebond, stalactites qui poussent | cartes 300 ms décalées de 40 ms, emoji 500 ms, ruban 240 ms, reflet une fois 700 ms, FAQ 180 ms, sans flou ni rebond ; stalactites fixes |

« Réduire les animations » : le réglage de l'iPhone arrête tout (animations, transitions, neige, défilements glissés, flocons, fermetures).

## Vérifié
Nouveau test `tests/ui/animations_ui.py`, sur iPhone 15 Pro émulé et ordinateur, FR + EN :
- toutes les feuilles de style de l'app, d'une page légale et de la page Tarifs : seulement `transform` / `opacity` ;
- 300 ms au plus, sauf l'ambiance et les moments rares (liste fermée dans le test) ; aucune courbe qui rebondit ; réglages communs présents ;
- changement d'étape : 300 ms, ease-out-quart, dans le bon sens ;
- avec « Réduire les animations » : aucune animation en cours (neige, étape, aide), défilements sans glissement ;
- fluidité, iPhone émulé avec le processeur ralenti 4 fois : neige, changement d'étape, aide et fenêtre Pro à 60 images/s (95 % des images en moins de 20 ms, aucune de plus de 50 ms).

Tests : voir la fin de ce fichier.
