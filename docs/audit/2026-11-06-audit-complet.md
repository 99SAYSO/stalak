# Audit complet de Stalak — 6/11/2026 (Chef de projet)

Fait sur `main` après la mise en ligne « plus de pub » (6/11, 19 h 35). Trois audits en parallèle, en lecture seule :
produit et ventes (parcours réel avec Playwright, FR/EN, 390 et 1280 px), sécurité / paiements / données (lecture du code,
tests serveur 96/96), vitesse / SEO / accessibilité (site construit en local, 4G lente + téléphone 4× plus lent).
Non testable dans le bac à sable : la fenêtre Paddle, le bouton Google, le vrai site en ligne, la lecture H.264.
Chaque point a été vérifié (code lu ou parcours rejoué). Le point 1 a été relu par le Chef de projet.

## 🔴 Urgent

1. **Un client remboursé garde son abonnement** — 3. Comptes.
   `functions/_lib/paddle.js:127-138` : `applyAdjustment` n'enregistre que le remboursement, sans toucher à `subscriptions`.
   La page Remboursement promet « l'abonnement s'arrête et ton compte repasse en Gratuit ». Correctif : à un remboursement
   complet approuvé d'un paiement d'abonnement, arrêter l'abonnement tout de suite (API Paddle) + notif Telegram ; pour un
   remboursement de changement de formule, alerte pour remettre l'ancienne formule. Tableau de bord : les remboursements
   du jour ne comptent que l'EUR (`admin.js:128`), compter aussi l'USD.
2. **Trois « Choose Pro » avant de payer** — 3. Comptes.
   /pricing → page des formules de l'app → compte + code → retour sur les formules → 3ᵉ « Choose Pro ». La formule et la
   durée choisies se perdent. Correctif : retenir le choix et ouvrir le paiement Paddle dès le code validé / la connexion.
   `src/app.js` (`plBuy` ~9673, `apAuthDone` ~9459, fin du code ~9971), liens `?plan=` de `site_src/pricing.html`.
3. **Une seule personne peut épuiser le quota gratuit de la base pour la journée** — 3. Comptes + propriétaire.
   `POST /api/presence` écrit à chaque appel sans limite pour un même numéro de visite (`metrics.js:97-109`) : ~100 000
   appels → inscriptions, connexions et webhook Paddle en échec jusqu'à minuit UTC. Correctif : ignorer un signe de vie
   reçu moins de 4 min après le précédent (`… WHERE last_at < ?3 - 240000`), règle de limite Cloudflare sur `/api/*`,
   et passer en Workers Paid (5 $/mois, propriétaire).

## 🟠 Important

4. **Après avoir payé, rien ne propose de refaire la vidéo sans filigrane** — 2. App. Bouton « Enregistrer sans filigrane »
   qui relance l'export après le paiement (`doneUi` ~7925, merci Pro ~9885).
5. **La fenêtre « Passer à Pro » (une seule fois par appareil) s'ouvre sur l'export de l'exemple et cache « Enregistrer »
   sur téléphone** — 2. App (`ppEligible` ~8009). Ne pas l'ouvrir pour l'exemple ; sur téléphone, après le toucher sur « Enregistrer ».
6. **L'accueil ne dit pas ce qu'est Stalak** : le H1 est le logo (`#homeBtn`), le 1ᵉʳ écran est le formulaire « Pick your
   song », sans accroche ni image de résultat (déjà signalé le 30/10) — 5. Marketing (texte) + 2. App (code). Vrai H1
   « Free lip-sync video editor for rappers », une ligne d'accroche et une courte vidéo en boucle au-dessus du formulaire.
7. **L'exemple (bips + visages dessinés) ne montre pas un vrai résultat**, et rien ne pousse ensuite vers « ta chanson » —
   2. App + 5. Marketing (un vrai court extrait du propriétaire). « Now try it with your song » sur l'écran de fin de l'exemple.
8. **Tableau comparatif des Tarifs : sur téléphone, seule la colonne Gratuit se voit** (520 px dans 352 px, aucun signe de
   glissement) — 5. Marketing (`src/pricing.css` `.p4-table{min-width:520px}`). Une carte par formule ou 1ʳᵉ colonne fixe.
9. **Les maquettes de branches utilisent la vraie base clients** — propriétaire + Chef de projet / 3. Comptes. Étape 15.2
   de BACKEND.md (base `stalak-preview` + bucket à part ; bloc `[env.preview]` de `wrangler.toml:63-87` à activer).
10. **Vitesse** — 2. App.
    - `mp4box` (256 Ko) et `mp4-muxer` (31 Ko) bloquent l'affichage (`src/head.html:8-9`) : avec `defer`, premier affichage
      1 032 → 668 ms (−35 %, 4G lente). Vérifier l'export après.
    - `index.html` fait 1,17 Mo (397 Ko compressé, dont 860 Ko de JS dans la page), rechargé à chaque visite : JS dans un
      fichier versionné, gardé un an. TBT 460 ms, page prête à 3,3 s sur téléphone lent.
    - Polices en TTF (Rubik = 77 % du poids d'un guide) : WOFF2 + sous-ensemble, noms versionnés (sinon `immutable`
      d'un an garde l'ancienne). `_headers` : `site.css?v=` et `pricing.css` versionnés peuvent passer en `immutable` (3. Comptes).
11. **Pas de page 404** : toute adresse inconnue affiche l'accueil en 200 (« soft 404 » chez Google) — 5. Marketing
    (`build_site.py`). À confirmer avec `curl -I https://stalak.app/xyz`.
12. **Données gardées plus que ce que dit la confidentialité** — 3. Comptes + 6. Juridique.
    - `lyrics_usage` jamais effacée (ni à la suppression du compte, ni après 90 j).
    - Cookies `stalak_d` (90 j) et `stalak_o` (10 min), type d'appareil du compte, ntfy : pas mentionnés.
    - Empreintes « déjà remercié » (3 ans) et empreintes IP des limites (purge au hasard, 5 %) : pas de purge réelle.
    - E-mail de remerciement programmé chez Resend, pas annulé si le compte est supprimé avant l'envoi.
13. **Les 6 guides sont minces et très semblables** (~430 mots, ~1/3 de phrases communes, aucune image ni vidéo) —
    5. Marketing. Une démo avant/après et ~300 mots propres à chaque sujet.
14. **Le guide d'aide dit « au moins 3 playbacks » pour les packs** (l.47 et l.117 de `functions/_lib/help-guide.js`),
    partout ailleurs c'est 2 — 3. Comptes.

## 🟢 Utile

15. Deux messages Paddle simultanés peuvent s'écraser : garde `WHERE subscriptions.last_event_at <= ?8` dans l'écriture (`paddle.js:67-91`) — 3. Comptes.
16. À tester en sandbox : un acheteur qui paie avec l'e-mail de quelqu'un d'autre pourrait être relié à son client Paddle
    (`account.js:223-227`, `paddle.js:43-62`, `204-217`). Ne jamais remplacer un `paddle_customer_id` déjà rempli — 3. Comptes.
17. L'assistant d'aide : une seule connexion peut prendre tout le budget du jour (60) : ~10 par connexion (`help.js:25-27`) — 3. Comptes.
18. « Music video » ouvre tout de suite le paiement : laisser voir l'aperçu 16:9, bloquer seulement l'export, comme les filtres — 2. App (suggestion).
19. Mots différents entre Tarifs et l'app (paroles auto « 20 par jour », sauvegarde « 100 Go », « parler à un humain ») ;
    « 3 étapes » écrit mais 4 affichées — 5. Marketing.
20. Message dédié quand la fenêtre Paddle est bloquée (bloqueur de pub) ; bandeau et étiquette « Sans filigrane » en double — 3. Comptes.
21. Lien « step-by-step guide » de l'accueil presque invisible (contraste 1,93:1, `build_site.py:132`) ; une image de
    partage par guide ; descriptions des pages légales — 5. Marketing.
22. Clavier : la sélection se perd après « Try with an example » ; liens du pied de page à 36 px (conseillé 44) — 2. App.

## Ce qui est solide
- Webhook Paddle signé, traité une seule fois, ne peut pas être bloqué par les notifs ou l'e-mail ; aucun secret dans le
  dépôt ; comptes bien protégés (PBKDF2, codes en empreinte, Turnstile, origine vérifiée, Google en PKCE) ; tableau de bord
  protégé (jeton Access vérifié côté serveur, texte seul, CSP stricte) ; sauvegarde en ligne cloisonnée par compte.
- Prix identiques partout ; plus aucune mention de pub visible ; écran de fin clair ; question des paroles OK ;
  aucune erreur console, aucun défilement de côté (20 pages, 390 et 320 px), CLS ≈ 0 ; iPhone : champs à 16 px,
  encoches respectées, neige coupée si « réduire les animations » ; données structurées, sitemap, hreflang, robots et llms.txt cohérents.
