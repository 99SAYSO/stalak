Statut : EN COURS (maquette `?demo=pro` à valider par le propriétaire)

# Branche `app/coach-ia` — « Ton coach » dans « Stats » (25/11)

Demande : `docs/handoff/chef-coach-ia.md`. Part de `app/retours-25-11` (Stats retravaillé).

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

## Pour Comptes : la forme attendue (proposition, à confirmer dans `docs/contrats/coach-ia.md`)
`GET /api/coach?lang=fr|en` (Pro / Creator Plus ; 401 déconnecté ; 403 ou `{ locked: true }` sinon) :
```
{ "coach": {
    "weekOf": "2026-11-23",
    "works": [ { "videoId": "…", "caption": "…", "cover": "https://…", "views": 12400, "why": "…" } ],   // 3 au plus
    "stop": [ "…" ],                                                                                     // 4 au plus
    "ideas": [ { "day": "Mardi", "time": "19 h", "hook": "…", "format": "…", "song": "Neva Die", "songId": "…", "part": "le refrain" } ],  // 3 à 5
    "pace": { "next": "Glaçon", "text": "…" },
    "missing": [ "tes vidéos TikTok" ]
  } }
```
ou `{ "pending": true }` pendant la première analyse. Les textes arrivent écrits dans la langue demandée ; l'app les montre tels quels (aucun chiffre ajouté par l'app). Si la route n'existe pas encore, l'app ne montre rien de cassé (carte « relie ton TikTok »).

## Pour les autres
- **Juridique** : mention « Analyse écrite par une IA » et « conseils, pas une promesse de résultats » affichées sous le coach.
- **Marketing** : rien dans `site_src`.
