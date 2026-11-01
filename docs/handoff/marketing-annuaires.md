# Compte rendu — branche `marketing/annuaires` (Marketing & croissance, 01/11/2026, 23 h)

Statut : PRÊT

Branche partie de `main` (ff69d15). **Documents seulement** : aucun changement du site ni de l'app, rien à reconstruire, aucune migration SQL.

## Résumé

Décisions du propriétaire du 1/11 (22 h 40, déjà notées en haut de `docs/STATUS.md`) appliquées au plan des annuaires :

1. **« Alternative à Triller » sur AlternativeTo et SaaSHub : oui.** Dans leur champ des alternatives : Triller seulement (la règle « aucun autre concurrent cité » reste). Une phrase neutre et vraie à ajouter à la fin de la description, sur ces deux sites seulement :
   > Coming from Triller? Like Triller's original editor, Stalak turns several takes of your song into one video cut to the music, right in your browser.

   Si un site demande une page de comparaison : https://stalak.app/triller-alternative.
2. **Aucun lien vers un autre site en bas de stalak.app** : Twelve Tools et Fazier (leur offre gratuite l'exige) sont retirés du tableau et notés dans les écartés. Le tableau passe à 16 sites, renumérotés.
3. Mises à jour liées à la bascule (en ligne depuis le 1/11, 22 h 30) : Bing peut être fait maintenant ; Google est noté comme fait par le Chef de projet (Search Console, `sitemap.xml` et `sitemap-old.xml`, indexation demandée) ; `sitemap-old.xml` à retirer vers le 15/12, sur Google comme sur Bing.

Le document claude.ai « Stalak — annuaires d'outils et Bing » (https://claude.ai/artifact/EbcSbWg4zfAhNLrN6XWDn9) a les mêmes changements ; la colonne Statut du propriétaire n'a pas été touchée (tout est encore « À faire »).

## Fichiers touchés

- `docs/marketing/ANNUAIRES.md`
- `docs/STATUS.md` (section Marketing ; `seo-triller` ajouté aux valeurs `ref` prévues, pour Comptes)
- ce compte rendu

## Tests

Sans objet (documents seulement). Les liens d'inscription du tableau sont ceux vérifiés le 1/11 dans `marketing/en-racine`.

## Pour les autres conversations

- **Comptes** : quand les visites seront affichées par `ref` dans le tableau de bord, prévoir `seo-triller` (bouton « Make my video, free » de `/triller-alternative` et `/fr/alternative-triller`).

## Ce qu'il reste au propriétaire

- Bing (environ 10 minutes, import depuis Search Console), puis les annuaires dans l'ordre du document. Il crée les comptes et valide lui-même ; Marketing l'aide site par site quand il le demande (textes, catégories, champs du formulaire).

Skills utilisés : `directory-submissions`, `docs`.
