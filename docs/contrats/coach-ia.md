# Contrat Comptes ↔ App : « Ton coach » (25/11) — PROPOSITION à valider par le propriétaire
Demande : `docs/handoff/chef-coach-ia.md`. Branches : Comptes `compte/coach-ia`, App `app/coach-ia`.
À montrer au propriétaire avant de brancher :
- les consignes de l'IA (`functions/_lib/coach-prompt.js`, `COACH_SYSTEM`) ;
- le format de la réponse (`COACH_SCHEMA`) ;
- 2 exemples (`docs/coach-ia/exemple-1-*.json` : un rappeur avec 8 vidéos et 3 sons ; `exemple-2-*.json` : une chanteuse sans son sorti et 5 vidéos) ;
- le coût (section 6).

## 1. Route `GET /api/coach?lang=fr|en` (connecté ; sinon 401)
```js
{
  plan: 'free' | 'pro' | 'creator',
  locked: true | false,          // true pour un compte gratuit : « analysis » est null → App montre la partie floutée + cadenas
  state: 'ok' | 'pending' | 'not_enough' | 'failed' | 'off' | 'over_budget',
  week: '2026-W48' | null, createdAt: ISO | null, nextAt: ISO | null,   // date de l'analyse, date de la prochaine
  ai: true,                      // toujours : afficher « Analyse écrite par une IA, à partir de tes chiffres. Ce sont des conseils. »
  analysis: {                    // null si locked, ou si pas encore d'analyse
    resume: '…',
    marche: [{ video_id, video: { id, title, cover, url, views, likes, comments, shares } | null, pourquoi, leviers: ['accroche' | 'duree' | 'heure' | 'son' | 'format' | 'legende'] }],
    marche_pas: [{ constat, a_faire }],
    plan: [{ jour: 'lundi'…'dimanche', heure: 'HH:MM', accroche, format: 'face_camera' | 'performance' | 'coulisses' | 'paroles_ecran' | 'reaction' | 'avant_apres' | 'autre',
             sortie_id, sortie: { id, name } | null, passage, pourquoi, projectId: string | null }],
    rythme: { conseil, pousser_id, sortie: { id, name } | null, pourquoi },
    manque: ['…']
  }
}
```
- `state` :
  - `pending` : 1re analyse en cours (environ 20 à 40 s) ; redemander toutes les 5 s, 12 fois au plus ;
  - `not_enough` : ni vidéos TikTok ni sons Spotify, rien à analyser. Dire quoi relier, sans appeler l'IA ;
  - `failed` : l'IA n'a pas répondu, ou sa réponse contenait un chiffre absent des données. On n'affiche rien d'inventé : « Ton analyse n'a pas pu être faite cette semaine. » ;
  - `off` : la clé n'est pas encore saisie ;
  - `over_budget` : limite du mois atteinte (voir 5). On garde la dernière analyse affichée.
- **Monter cette idée** : `projectId` est celui du montage Stalak qui utilise ce son, quand il y en a un (même nom de son). L'éditeur s'ouvre alors sur ce projet ; sinon, il s'ouvre sur l'étape « Son » avec le nom du son en rappel.
- Les vidéos sont jointes par le serveur (`video`), avec les chiffres réels de TikTok : App n'affiche que ceux-là, pas des chiffres recopiés du texte de l'IA.
- Les jours sont en français dans le format. App les traduit en anglais si `lang=en` (le texte, lui, est déjà en anglais).

## 2. Ce que l'IA reçoit (et rien d'autre)
Un objet « donnees », construit par le serveur, comme dans les exemples :
- `profil` : nom d'artiste, styles et style libre, objectifs, blocages, où il publie ;
- `tiktok` : abonnés et 30 dernières vidéos (id, date, jour, heure, durée, vues, likes, commentaires, partages, légende) ;
- `spotify` : état, auditeurs mensuels (maintenant et il y a 4 semaines), abonnés, 5 villes, écoutes par son (`moins_de_1000: true` au lieu de 0) ;
- `sorties` : nom, type, date ;
- `montages_stalak` : nombre ce mois-ci et noms des sons ;
- `calculs` : faits par le serveur, pour que l'IA ne calcule rien. Meilleures vidéos, vues médianes, meilleures heures, durées, rythme de sortie ;
- `manque` : ce qui manque, dit en clair.

**Jamais envoyés à l'IA :** e-mail, nom réel, identifiant de compte, adresse IP, liens, images, vidéos.

## 3. Ce que l'IA rend
JSON imposé par l'API (`output_config.format`, type `json_schema` : `COACH_SCHEMA`). Les 4 parties de la demande, plus `resume` et `manque`. Après la réponse, le serveur vérifie :
- **aucun chiffre inventé** (`checkFigures`) : tout nombre de 2 chiffres ou plus écrit par l'IA doit se trouver dans « donnees ». Les nombres de 0 à 10 sont permis (« 3 idées »), ainsi que l'heure du plan ;
- les `video_id` et `sortie_id` doivent exister, sinon ils sont remplacés par `null` ;
- tailles : 3 « marche » au plus, 1 à 3 « marche_pas », 3 à 5 idées.

**Si une vérification rate :** on redemande 1 fois en signalant le chiffre fautif. Si ça rate encore : `failed`, rien n'est affiché.

## 4. Quand
- **1 analyse par semaine et par artiste Pro / Creator Plus**, faite par la tâche du lundi. Pour la semaine, elle passe par la file d'attente moins chère d'Anthropic (« Batch », −50 %), avec une réponse en quelques heures.
- **1 analyse tout de suite à la première ouverture** de « Ton coach » (appel direct).
- **Gardée en base.** Ouvrir l'écran ne rappelle jamais l'IA.
- Pas d'analyse si rien n'a changé depuis la dernière (aucune nouvelle vidéo, aucun nouveau relevé).

## 5. Limites de coût
- Plafond **0,50 $ par compte et par mois**, soit environ 15 analyses. C'est très au-dessus de l'usage prévu (4 à 5) : il ne sert qu'à arrêter une panne ou un abus.
- **Plafond global** pour tout Stalak, réglable : `COACH_MONTHLY_USD`, 20 $ par défaut.
- Si un plafond est dépassé, l'état passe à `over_budget` et **une alerte part au propriétaire** (Telegram / ntfy), une fois par jour au plus.
- Coût réel de chaque appel (jetons comptés par l'API) gardé en base et visible dans le tableau de bord.

## 6. Coût estimé (tarifs lus le 25/11 sur platform.claude.com)
Mesure sur les exemples, comptée large (3 caractères par jeton ; un gros compte de 30 vidéos) :
- consignes + format : environ 1 800 jetons ;
- données : 1 000 à 3 000 jetons ;
- réponse : 800 à 1 500 jetons.

**Donc par analyse : environ 5 000 jetons en entrée et 1 500 en sortie.**

| Modèle | Prix (entrée / sortie, par million) | Par analyse | Par artiste et par mois (≈ 5 analyses) | Avec la file « Batch » (−50 %) |
|---|---|---|---|---|
| **Claude Sonnet 5.5 (proposé)** | 2 $ / 10 $ | ≈ 0,025 $ | **≈ 0,13 $** | **≈ 0,07 $** |
| Claude Haiku 5.5 | 0,10 $ / 0,50 $ | ≈ 0,0013 $ | ≈ 0,007 $ | ≈ 0,004 $ |
| Claude Opus 5.5 | 4 $ / 20 $ | ≈ 0,05 $ | ≈ 0,25 $ | ≈ 0,13 $ |

Une 2e demande quand un chiffre est faux ajoute environ 20 % au pire.

**Proposition : Sonnet 5.5**, soit environ **0,10 $ par artiste Pro et par mois**, à comparer aux 7,99 € de l'abonnement (environ 1 %). Haiku coûte 20 fois moins mais écrit des conseils moins fins. On peut le comparer sur les 2 exemples une fois la clé saisie.

## 7. Juridique (à relire par Juridique)
- **Données envoyées à Anthropic (États-Unis) pour l'analyse :** la liste de la section 2, sans e-mail ni nom réel. Selon les conditions de l'API d'Anthropic, les données ne servent pas à entraîner ses modèles. Juridique doit vérifier la durée de conservation chez Anthropic et l'écrire dans la page de confidentialité.
- **Chez Stalak :** l'analyse est gardée 12 semaines, puis effacée. Elle est effacée aussi avec le compte.
- **Mentions à l'écran :** « Analyse écrite par une IA, à partir de tes chiffres. Ce sont des conseils, pas une promesse de résultats. »
