# Compte rendu — compte/video-offerte
**Statut : PRÊT** — **migration 0019** (`migrations/0019_free_video.sql`) à lancer dans la console D1 **avant** la mise en ligne.

## Ce qui est fait (décision du 23/11 : « 1re vidéo sans filigrane offerte »)
1. **Retenu sur le serveur** : colonne `users.free_nowm_at` (heure où la vidéo offerte a été prise). Dans `/api/me`, `entitlements.freeNoWm` vaut `true` tant que le compte gratuit ne l'a pas prise ; toujours `false` sans compte et en Pro / Creator Plus.
2. **Adresse pour la consommer** : `POST /api/free-video` (compte connecté, corps `{}`).
   - `{ granted: true }` une seule fois ; ensuite `{ granted: false, reason: 'used' }` ;
   - Pro / Creator Plus : `{ granted: false, reason: 'pro' }` (rien n'est consommé) ;
   - deux exports en même temps : un seul « oui » (une seule requête SQL décide) ;
   - 30 demandes par heure au plus.
3. **Compte supprimé puis recréé** avec la même adresse : pas de 2e vidéo. Seule une empreinte de l'adresse est gardée (comme pour l'e-mail de remerciement), 3 ans. Les copies d'une même boîte comptent pour une : `nom+1@…` et les points d'une adresse Gmail.
4. **Tableau de bord**, page Entonnoir, carte « 🎁 Vidéos offertes utilisées » : nombre sur la période et depuis le début, et combien de ces comptes ont pris Pro ou Creator Plus **après** leur vidéo offerte (avec le %). Compteur anonyme `free_video` en plus.

## Pour App (contrat)
- Lire `StalakAccount` → `entitlements.freeNoWm`.
- Au moment où un compte gratuit lance un export **sans filigrane** grâce à l'offre : `POST /api/free-video` avec `{}` ; exporter sans filigrane **seulement** si la réponse est `granted: true`, sinon avec le filigrane (et la fenêtre Pro). Pas de compte : il faut d'abord en créer un.
- La vidéo est consommée au « oui ». Si l'export rate ensuite, elle est perdue (pas de retour en arrière, sinon on pourrait en obtenir à l'infini). Idée pour App : garder la vidéo prête dans le téléphone pour « Réessayer l'enregistrement » sans refaire de demande.

## Migration 0019
```sql
ALTER TABLE users ADD COLUMN free_nowm_at INTEGER;
CREATE INDEX IF NOT EXISTS users_free_nowm ON users(free_nowm_at) WHERE free_nowm_at IS NOT NULL;
```
(0014 est pris par `compte/provenance-ue`, 0018 par TikTok.)

## Tests
- `node tests/backend/run.mjs` : 118/118, dont 3 nouveaux : une seule fois, même pour deux exports en même temps ; Pro non concerné ; compte supprimé puis recréé, copies d'une même boîte, effacement après 3 ans ; tableau de bord.
- `tests/ui/support_ui.py` : 64/64.
- Carte vérifiée sur téléphone et ordinateur : `/admin-demo/#funnel`.
- Relecture de sécurité : `docs/appsec-review-video-offerte.md`.

## Juridique
- Dire dans la page de confidentialité : empreinte de l'adresse gardée 3 ans pour la vidéo offerte (comme pour le remerciement).
- Conditions : « une vidéo sans filigrane offerte par compte, une seule fois ».

## Reste
- App : l'appel et l'écran.
- Marketing : la mention sur l'accueil et Tarifs.
- Chef de projet : migration 0019.
