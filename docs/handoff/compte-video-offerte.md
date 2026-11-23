# Compte rendu — compte/video-offerte
**Statut : PRÊT** — **migration 0019** (`migrations/0019_free_video.sql`) à lancer dans la console D1 **avant** la mise en ligne.

## Ce qui est fait (décision du 23/11 : « 1re vidéo sans filigrane offerte »)
1. **Retenu sur le serveur** : colonne `users.free_nowm_at` (heure où la vidéo offerte a été prise). Dans `/api/me`, `entitlements.freeNoWm` vaut `true` tant que le compte gratuit ne l'a pas prise ; toujours `false` sans compte et en Pro / Creator Plus.
2. **Adresse pour la consommer** : `POST /api/free-video` (compte connecté, corps `{}`).
   - `{ granted: true }` une seule fois ; ensuite `{ granted: false, reason: 'used' }` ;
   - Pro / Creator Plus : `{ granted: false, reason: 'pro' }` (rien n'est consommé) ;
   - deux exports en même temps : un seul « oui » (une seule requête SQL décide) ;
   - 30 demandes par heure au plus.
3. **Compte supprimé puis recréé** avec la même adresse : pas de 2e vidéo. Révisé le 23/11 (6 h 45) pour coller aux pages de Juridique (`legal/video-offerte`) :
   - tant que le compte existe, seule `users.free_nowm_at` est gardée ;
   - à la suppression d'un compte **qui a pris sa vidéo**, une empreinte de l'adresse est écrite avec la clé secrète **`AUTH_SECRET`** (HMAC, déjà utilisée pour les codes de connexion : pas de nouvelle clé) ; on ne peut pas la retrouver en essayant des adresses ;
   - elle est **effacée 12 mois après la suppression** (tâche quotidienne). Rien d'autre n'est gardé ;
   - les copies d'une même boîte comptent pour une : `nom+1@…` et les points d'une adresse Gmail ;
   - **à vérifier par le propriétaire** : `AUTH_SECRET` existe dans Cloudflare → stalak-site → Variables and secrets (production). Sans elle, aucune empreinte n'est écrite et un compte supprimé puis recréé pourrait reprendre une vidéo.
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
- `node tests/backend/run.mjs` : 119/119, dont 4 nouveaux : une seule fois, même pour deux exports en même temps ; Pro non concerné ; compte supprimé puis recréé (empreinte HMAC écrite à la suppression, pas un SHA-256), copies d'une même boîte, effacement 12 mois après ; sans `AUTH_SECRET`, rien d'écrit ; tableau de bord.
- `tests/ui/support_ui.py` : 64/64.
- Carte vérifiée sur téléphone et ordinateur : `/admin-demo/#funnel`.
- Relecture de sécurité : `docs/appsec-review-video-offerte.md`.

## Juridique
- Aligné sur `legal/video-offerte` : empreinte (HMAC) de l'adresse écrite seulement à la suppression d'un compte qui a pris sa vidéo, effacée 12 mois après ; rien d'autre.

## Reste
- App : l'appel et l'écran.
- Marketing : la mention sur l'accueil et Tarifs.
- Chef de projet : migration 0019.
