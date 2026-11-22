Statut : PRÊT
Branche : social/tiktok-bouton
Maquette : https://social-tiktok-bouton.stalak-site.pages.dev

Résumé :
Demande du Chef de projet du 22/11 (20 h 09), après l'essai réussi en Sandbox.
1. **Bouton aux couleurs de TikTok** : « Publier sur TikTok » (fin d'export) et « Relier TikTok » (page « Ton compte ») ont le fond
   noir des boutons officiels de TikTok (#121212), le texte blanc et le **logo officiel blanc**, pris tel quel dans le « Logo and
   Button pack » de TikTok for Developers (aucune modification : forme, couleur, proportions ; de l'espace autour ; toujours avec le
   texte). L'ombre dure de Stalak prend le cyan et le rouge de TikTok, pour ne pas confondre avec « Enregistrer la vidéo ».
   L'étiquette PRO (compte gratuit) passe en blanc sur ce fond. Le menu du compte montre le logo TikTok (noir, couleur du texte).
   Contraste texte / fond : 18:1 ; le bouton garde son texte lu par les lecteurs d'écran (logo caché pour eux).
2. **« Délier »** : la correction du Chef de projet (corps {} en JSON) est gardée, avec 2 tests : serveur (sans JSON → 415 ; avec {} →
   délié et envois effacés) et interface (la demande part en `application/json` et la carte revient à « Relier TikTok »).
   Le message `e.tt_private_only` corrigé (le compte doit être privé) est gardé ; la doc est alignée.
3. **Brouillon qui tournait sans fin** : rien ne peut plus rester bloqué.
   - Limites de temps : app 30 s par question, 2 min par morceau ; serveur 20 s vers l'API TikTok, 90 s par morceau envoyé à TikTok.
     Avant, si TikTok ne répondait pas, l'écran tournait sans fin et ne pouvait même pas se fermer (Échap bloqué pendant l'envoi).
   - Morceau bien reçu mais réponse perdue (réseau) : l'app le renvoyait et le serveur répondait « déjà envoyé », ce qui finissait en
     erreur ; maintenant c'est compté comme reçu (dernier morceau : « déjà envoyé » ; autre morceau : le serveur dit lequel il attend).
   - Une fois le fichier chez TikTok, « Fermer » et Échap marchent tout de suite ; texte propre au brouillon (boîte de réception
     TikTok). L'attente s'arrête après 5 erreurs de suite ou 5 minutes, avec un message ; « reconnecte TikTok » s'affiche aussitôt.
   - Journaux Cloudflare : chaque statut TikTok (`[stalak] tiktok status draft SEND_TO_USER_INBOX`) et chaque délai dépassé, sans
     identifiant ni jeton. Ça donnera une trace la prochaine fois, même après un « Délier » (qui efface toujours les envois en base).
   - Un 2ᵉ envoi juste après une publication : vérifié (test serveur brouillon puis publication à la suite, et test interface).

Fichiers touchés : `src/tiktok.js`, `src/tiktok.css`, `functions/_lib/tiktok.js`, `tests/backend/run.mjs`, `tests/ui/tiktok_ui.py`,
`docs/social/TIKTOK_PUBLIER.md`, `docs/STATUS.md`, ce compte rendu, `public/` reconstruit. **`src/app.js` et `src/markup.html` non touchés.**

Migration SQL : aucune.

Tests :
- serveur `node tests/backend/run.mjs` : 114/114 (2 nouveaux : « never stays stuck » — morceau sans réponse de TikTok puis renvoyé,
  morceau renvoyé après réponse perdue, statut sans réponse puis repris, brouillon puis publication à la suite ; « Délier » en JSON).
- interface `python3 tests/ui/tiktok_ui.py public` : 220/220 (iPhone 390 px et ordinateur 1280 px, FR et EN, gratuit et Pro : couleurs
  et logo des boutons, logo du menu, morceau à la réponse perdue, fenêtre qu'on ferme pendant l'attente, « Délier » ; sans défilement
  de côté, aucune erreur). `python3 build.py` (version claude.ai) : OK.

Pour App & montage (écran de fin d'export) :
- Le bouton TikTok est ajouté par `src/tiktok.js` (rien dans app.js / markup.html) : juste après `#shareBox` s'il est visible, sinon
  après `#saveRow` ; dans la carte de fin il prend `order:3` (`src/tiktok.css`, `.doneview #ttkPub`). Si « Partager » disparaît et
  que l'ordre des boutons change, il suffit de me dire où il doit aller (ou d'ajuster cette ligne de `tiktok.css`).
- Le pont en lecture seule `window.StalakApp` (fin de app.js, avant `applyLang();`) doit rester : `exported()` donne la vidéo finie.

Reste au Chef de projet / au propriétaire :
1. Fusionner, puis refaire un brouillon en Sandbox ; si ça bloque encore, regarder les journaux Cloudflare (`[stalak] tiktok`).
2. Coordonner avec App & montage la place du bouton TikTok sur le nouvel écran de fin.
