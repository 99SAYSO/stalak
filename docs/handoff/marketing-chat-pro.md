Statut : EN COURS
Branche : marketing/chat-pro

Bloqué par : « Parler à un humain » doit d'abord être réservé à Stalak Pro (rôle Comptes, décision du propriétaire du 27/10, détail dans `docs/STATUS.md` → Comptes). Aujourd'hui le chat est ouvert à tous : mettre ces textes en ligne seuls annoncerait un avantage Pro faux. Dès que la branche Comptes est prête, ce compte rendu peut passer à `Statut : PRÊT`, et les deux branches peuvent être fusionnées ensemble.

Résumé : nouvel avantage Stalak Pro « Chat en direct avec l'équipe Stalak (réponse sous 24 h si on n'est pas en ligne) ». « 24 h/24 » n'est écrit nulle part.
- Page Tarifs FR/EN (`site_src/tarifs.html`, `site_src/en/pricing.html`) : une ligne dans les deux cartes Pro, une ligne dans le tableau Gratuit / Pro, une question dans la FAQ (« Comment je parle à l'équipe Stalak ? »).
- Écran Pro de l'app (`src/markup.html`) : `pr.f.chat` dans les deux cartes, `acct.perk7` dans la liste des avantages d'un compte Pro, `pr.r.chat` dans le tableau, `pr.q.chat` / `pr.a.chat` dans la FAQ.
- Traductions (`src/app.js`) : clés EN et FR dans un bloc à part `_bloc.marketing.chatpro`, placé avant `_bloc.app.son`. Rien d'autre n'est reformaté.

Textes :
- FR : « Une vraie personne pour t'aider. Chat en direct avec l'équipe Stalak (réponse sous 24 h si on n'est pas en ligne). »
- EN : « A real person to help you. Live chat with the Stalak team (reply within 24 h if we're offline). »

Fichiers touchés : `site_src/tarifs.html`, `site_src/en/pricing.html`, `src/markup.html`, `src/app.js` (bloc de traductions seulement), `public/` (reconstruit), `docs/STATUS.md`, `docs/handoff/marketing-chat-pro.md`.

Migration SQL : aucune.

Tests :
- `node tests/backend/run.mjs` : 62/62.
- `node --check src/app.js` et `build.py` passent.
- `build_site.py` passe (les clés anglaises sont toutes présentes).
- Playwright à 390 px et 1280 px sur `/tarifs`, `/en/pricing`, `/` et `/en/` : pas de défilement horizontal, aucune erreur de page.
- Écran Pro de l'app affiché en FR et en EN : les nouvelles lignes apparaissent.

Reste au propriétaire :
- Rien de plus pour ces textes : la décision « chat réservé à Pro » est prise.
- La promesse de réponse sous 24 h t'engage : il faut pouvoir répondre aux messages laissés, y compris le week-end.
