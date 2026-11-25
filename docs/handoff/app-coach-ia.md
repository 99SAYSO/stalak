Statut : PRÊT (côté App ; la maquette `?demo=pro` est à valider par le propriétaire, le serveur est chez Comptes)

# Branche `app/coach-ia` — « Ton coach » dans « Stats » (25/11)

Demande : `docs/handoff/chef-coach-ia.md`. Contient `app/retours-25-11` (à intégrer avant).

## Ce qui change (téléphone)
- Dans « Stats », partie Pro : **« Ton coach »** remplace « Ton plan de la semaine » (et la carte « Ton rythme » quand le coach donne le rythme).
  - En-tête : la mascotte, « Ton coach », « Analyse de la semaine du …, écrite par une IA à partir de tes vrais chiffres ».
  - **Ce qui marche** : ses 3 meilleures vidéos (vignette, légende, vues) et le « Pourquoi ».
  - **Ce qui ne marche pas** : ce qu'il faut arrêter.
  - **Ton plan de la semaine** : 3 à 5 idées (jour et heure, accroche écrite, format, son et passage) avec « Monter cette idée » (ouvre un nouveau montage ; ouvrir directement le bon son viendra quand le serveur donnera l'identifiant du son).
  - **Ton rythme de sortie** : le son à pousser et une phrase.
  - Ce qui manque (« Il me manque : … ») et, en bas : « Ce sont des conseils, pas une promesse de résultats. Analyse écrite par une IA. »
- Gratuit : l'aperçu flouté sous le cadenas montre aussi « Ce qui marche » et « Ton coach : le plan de la semaine ».
- Sans analyse encore : « Ton coach prépare ta première analyse… » (`pending`) ou « relie ton TikTok » (rien).
- Maquette avec des chiffres d'exemple (marqués « Exemple ») : https://app-coach-ia.stalak-site.pages.dev/fr/?demo=pro

## Données : le contrat de Comptes
L'app suit `docs/contrats/coach-ia.md` (branche `compte/coach-ia`) : `GET /api/coach?lang=` → `state`, `createdAt`, `nextAt`, `analysis` (`resume`, `marche[].video` / `pourquoi`, `marche_pas[].constat` / `a_faire`, `plan[].jour` / `heure` / `accroche` / `format` / `sortie` / `passage` / `pourquoi` / `projectId`, `rythme.conseil` / `sortie` / `pourquoi`, `manque`).
- `pending` : redemandé toutes les 5 s, 12 fois au plus ; `failed`, `off`, `not_enough`, `over_budget` : une phrase claire, rien d'inventé ; route absente (404) : « Ton coach arrive très bientôt ».
- Les chiffres des vidéos viennent de `video` (joint par le serveur), jamais du texte de l'IA. Les jours sont traduits en anglais par l'app, les formats aussi (`face_camera` → « Face caméra »…).
- « Monter cette idée » : ouvre le projet `projectId` quand il est dans la liste du compte, sinon un nouveau montage.
- Mention sous le coach, mot pour mot du contrat : « Analyse écrite par une IA, à partir de tes chiffres. Ce sont des conseils, pas une promesse de résultats. »

## Juridique (25/11, `docs/juridique/COACH_IA.md` sur `legal/coach-ia`) — fait côté App
- **Étiquette toujours visible au-dessus de l'analyse**, mot pour mot : « Analyse écrite par une IA (Claude, d'Anthropic) à partir de tes chiffres. Elle peut se tromper : ce sont des conseils, pas des promesses. » (EN : “Analysis written by an AI (Claude, by Anthropic) from your figures. It can be wrong: it's advice, not a promise.”)
- **Écran d'activation** avant le premier envoi : « Active ton coach », **Ce qui part** (chiffres TikTok, Spotify, montages Stalak, réponses au questionnaire ; pas l'e-mail, le nom ni les vidéos), **Vers qui** (Anthropic, sans entraînement), lien « En savoir plus » vers `/fr/confidentialite#coach` (`/privacy#coach`), bouton « Activer mon coach ».
- **« Désactiver mon coach »** en bas du coach (avec confirmation : « Tes analyses seront effacées »).
- **À ajouter par Comptes** (proposition) : `GET /api/coach` rend `state: 'inactive'` (ou `active: false`) tant que la personne n'a pas activé, et n'envoie rien à Anthropic avant ; `POST /api/coach/activate` avec `{ "on": true | false }` (désactiver efface les analyses). Après l'activation, l'app redemande `GET /api/coach` (état `pending`, toutes les 5 s, 12 fois au plus).
- Démo : `?demo=pro&coach=off` montre l'écran d'activation ; « Activer » y montre l'exemple.

## Tests
`refonte_stats_ui` 77/77 (dont l'étiquette IA au-dessus de l'analyse et l'écran d'activation) (dont le coach en démo Pro : 3 vidéos, ce qui ne marche pas, 3 idées avec « Monter cette idée », la mention IA ; « Ton plan de la semaine » et « Ton rythme » remplacés ; l'aperçu flouté a 6 parties).

Capture de la maquette : `docs/audit/maquettes/coach-ia-2026-11-25.png`.

## Pour les autres
- **Juridique** : mention « Analyse écrite par une IA » et « conseils, pas une promesse de résultats » affichées sous le coach.
- **Marketing** : rien dans `site_src`.
