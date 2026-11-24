# Demande du Chef : paywall « Salle » (24/11/2026)

Maquette **D** choisie par le propriétaire (« D parfait », 24/11 à 18 h 18), après 6 maquettes. Référence : `docs/audit/maquettes/mobile-2026-11-23/paywall-D-salle.mp4` (source HyperFrames : `sources/gen_pay2.py`, variante `payD`, qui s'appuie sur `sources/gen_pay.py`).

- **Décor** : l'image `docs/marque/decors/scene-salle.jpg` (foule dessinée de dos, scène, projecteurs, stalactites) en haut de l'écran, fondue vers le bleu nuit `#081a45` ; léger zoom arrière à l'ouverture, 2 faisceaux qui balaient, petits flashs de téléphones dans le public, confettis. Pas de foule en formes simples.
- **Mascotte** : le sticker `docs/marque/mascotte/sticker-star.png` (fond transparent, détouré net), qui tombe sur la scène puis se balance doucement.
- **Titre** : « Fais décoller **ton son** » en **DM Sans très gras** (pas Lilita One), blanc, « ton son » en jaune `#ffd23f`, sur une ligne.
- **Avis** : carrousel qu'on fait glisser au doigt (la carte suivante dépasse sur le côté, points qui suivent), texte limité à 3 lignes. Avis de `site_src/avis.json` (vrais clients, confirmé par le propriétaire le 24/11).
- **Formules** : « Pro · à l'année » (étiquette « Meilleur prix · −48 % »), « Pro · au mois », puis une pastille **« ou »** entre « Pro · au mois » et le bouton « Essayer gratuitement ».
- Bouton avec un reflet qui passe et une légère pulsation ; « Rien à payer aujourd'hui · Annulable en 1 geste » dessous.
- Dans l'app : mêmes mouvements en CSS/JS léger (transform/opacity), « réduire les animations » respecté ; image du décor compressée (WebP) et chargée seulement à l'ouverture du paywall.
- Les prix restent ceux de Paddle (montants du pays).
