# AppSec review — social-connect (liaison TikTok / Instagram)

Scope / authority: dépôt 99SAYSO/stalak, base `main` @ f3e38fc, cible = branche `social/connexion-comptes` (arbre de travail). Fichiers : `functions/_lib/social.js` (réécrit), `functions/_lib/router.js` (5 lignes), `migrations/0005_social_accounts.sql`, tests `tests/backend/run.mjs`. Environnement : tests locaux seulement (faux TikTok / Instagram / D1), aucun appel aux vrais services. Exclu : la future publication de vidéos, l'interface.

Threat model :
- Actifs : jetons d'accès TikTok (24 h) / rafraîchissement (365 j), jetons Instagram longue durée (60 j) ; lien compte Stalak ↔ compte réseau ; données de profil (pseudo, photo).
- Acteurs : utilisateur connecté ; attaquant extérieur (site tiers, CSRF, liens piégés) ; Meta / TikTok (appels serveur) ; quelqu'un qui lirait la base D1.
- Entrées : `/api/connect` (GET/DELETE), `/api/connect/:p/start|callback` (navigations GET), `/api/connect/instagram/deauthorize|data-deletion` (POST formulaire de Meta, hors contrôle CSRF), `/deletion` (GET public).
- Frontières : navigateur → Stalak ; Stalak ↔ TikTok / Meta (serveur à serveur, secrets d'appli) ; base D1 (jetons chiffrés).

Release advice: proceed within reviewed scope (rien de bloquant ; la fonction reste éteinte par `SOCIAL_CONNECT_ENABLED = "0"`).

| ID | Severity / confidence | File:line | Conditions / impact | Fix / regression check |
|---|---|---|---|---|
| S1 | Corrigé (bas) | social.js `httpsUrl` | La photo renvoyée par TikTok / Instagram finit dans un `<img>` : on n'accepte que `https://` sans guillemets ni chevrons. | Fait. Test : `row.avatar_url` gardé pour une URL https. |
| S2 | Info / accepté | social.js `parseSignedRequest` | `issued_at` n'est pas vérifié : rejouer une vraie demande de Meta ne fait qu'effacer à nouveau le même compte. | Aucun. |
| S3 | Info / hypothèse | social.js Instagram `connect` | Les jetons Instagram passent en paramètre d'URL vers graph.instagram.com (comme la doc Meta) : seulement serveur à serveur, jamais journalisés par Stalak. | Garder les journaux sans URL (vérifié : `console.warn` n'écrit que des codes d'état). |
| S4 | Info | social.js `tokenKey` | Clé AES dérivée par SHA-256 de `SOCIAL_TOKEN_KEY` : suffisant si le secret est aléatoire (≥ 32 caractères exigés, 40 conseillés). Changer le secret oblige à relier les comptes à nouveau (`reconnect_needed`). | Documenté dans `docs/SOCIAL_SETUP.md`. |

Contrôles faits (PASS) — `node tests/backend/run.mjs` : 55/55 :
- liaison forcée (CSRF de connexion) : le state est à usage unique, haché en base, lié au compte Stalak qui l'a demandé **et** au navigateur (cookie `stalak_c` HttpOnly, Secure, SameSite=Lax, `Path=/api/connect`, 10 min) ; state d'un autre réseau, d'un autre compte, expiré, sans cookie → `state_mismatch` ;
- redirection ouverte : `return` filtré (`//evil.example/` → `/`) ;
- jetons au repos : AES-GCM 256, IV aléatoire, données associées `user:réseau:type` (un jeton copié sur une autre ligne ne s'ouvre pas), jamais renvoyés par `/api/connect` ni `/api/config` ;
- permission retirée par la personne (`video.publish`, `instagram_business_content_publish`) → refus `missing_permission`, rien d'enregistré ;
- `DELETE /api/connect/:p` : contrôle CSRF (Origin + JSON) du routeur ; suppression du compte Stalak → jetons TikTok révoqués et lignes effacées ;
- appels de Meta : signature HMAC-SHA256 vérifiée en temps constant ; signature fausse / format cassé / algorithme ≠ HMAC-SHA256 → `400`, rien n'est effacé ; route absente si Instagram n'est pas configuré ;
- pages HTML (popup, suivi de suppression) : CSP `default-src 'none'`, texte échappé / code filtré `[A-Za-z0-9_-]`.

Dependencies: aucune nouvelle dépendance (WebCrypto et fetch du runtime).
Secrets hygiene: aucun secret dans le code ni les tests (valeurs factices). Les 5 secrets (`TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `SOCIAL_TOKEN_KEY`) sont saisis par le propriétaire dans Cloudflare.

Coverage / residual risk: pas d'essai contre les vrais TikTok / Instagram (attend les applis développeur) ; la forme exacte de certaines réponses Meta (à plat ou dans `data[]`) est gérée dans les deux cas. Publication des vidéos et adresse R2 temporaire : revue à faire à l'étape suivante.
Handoff: Chef de projet — appliquer la migration 0005 **avant** la fusion ; garder `SOCIAL_CONNECT_ENABLED = "0"` jusqu'au premier test avec les comptes testeurs.
