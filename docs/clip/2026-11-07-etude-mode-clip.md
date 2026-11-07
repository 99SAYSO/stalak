# Étude : rendre le mode Clip irréprochable — 7/11/2026 (Chef de projet)

Pourquoi : le mode Clip est la 1ʳᵉ raison d'ouvrir la page Pro (51 sur 116, du 3 au 7/11, `docs/stats/2026-11-07-rapport.md`).
Méthode : lecture du code, site construit et piloté avec Playwright (1280 et 390 px ; pas de H.264 dans ce Chromium, donc
pas de vrai export mesuré), recherche des concurrents et des recommandations de YouTube. Points 4 et 6 revérifiés dans le code.

## Aujourd'hui
1. Sortie 1920×1080, 30 i/s, H.264 10 Mbit/s, son AAC 192 kbit/s (`src/app.js` l.5, 6897, 6938). Ni 4K, ni 24/60 i/s.
2. Les prises verticales sont posées entières au centre sur une copie floutée : l'image utile ≈ 32 % de la largeur
   (`drawCover` ~l.4828 ; capture `2026-11-07-prise-verticale-dans-169.png`). Aucun réglage de cadrage.
3. Coupes plus lentes qu'en TikTok (1 à 4 mesures, `PACES_CLIP` ~l.3283), 7 effets auto (Aucun / Sobre / Intense).
4. ⚠ En Gratuit, « Sobre » est coché mais **aucun effet n'est posé** (`fxOn` l.3588 exige `can('fx')`) ; paroles coupées par
   défaut en Clip (`setKind` ~l.8339) : l'essai gratuit du Clip est « nu ».
5. ⚠ L'exemple en Clip = 42 s de visages dessinés, pas un vrai clip.
6. ⚠ Export d'un long morceau sur téléphone : tout en mémoire (380 Mo iPhone, 550 Mo Android, `memBudget` ~l.6911) ; le débit
   descend (~4,3 Mbit/s à 3 min, ~3,2 à 4 min, plancher 3) et **l'export unique ne refuse pas quand la mémoire manque**
   (`exportOne` l.7788 ignore `mp.ok`, contrairement au pack l.7845) → risque que l'onglet se ferme. YouTube recommande 8 Mbit/s en 1080p.
7. Choix Clip / TikTok seulement à l'étape 1.

## Concurrents et références
CapCut AutoCut (coupes sur le temps, appli et ordinateur) et multicam synchronisé par le son (ordinateur) ; Triller (assemblage
auto de prises, fermé en 2026) ; Rotor Videos (clips et lyric videos jusqu'à 10 min, dès 9,99 $/mois, source indirecte) ;
Neural Frames (images IA réactives au son, 4K payant, pas de lip-sync) ; VEED (lyric video) ; VN / InShot (auto-beat).
YouTube : 1080p 8 Mbit/s (12 en 60 i/s), 4K 35–45 Mbit/s, son stéréo 384 kbit/s, garder la cadence de tournage ; miniature 16:9.
Sources : capcut.com/help/auto-cut-in-capcut, capcut.com/resource/multicam-editing, en.wikipedia.org/wiki/Triller_(app),
lyrc.studio/vs/rotor, neuralframes.com, support.google.com/youtube/answer/1722171 et /72431,
services.google.com/fh/files/misc/artist_inspo_guide_and_faqs_en.pdf, sondo.ai (16:9 + 9:16).

## Améliorations classées
🔴 Indispensables
1. **Export robuste du morceau entier sur téléphone** : écrire la vidéo au fur et à mesure (pas tout en mémoire), ≥ 8 Mbit/s ;
   en attendant, prévenir ou refuser au lieu de risquer la fermeture. Gros. App. Pro.
2. **Essai complet du Clip en aperçu** (effets et paroles visibles en Gratuit avec filigrane, blocage seulement à l'export,
   comme `clipGate`). Petit. App (+ Comptes pour la mesure). ⚠ Change ce que voit le Gratuit en aperçu : accord du propriétaire.
3. **Vrai exemple 16:9** à la place des visages dessinés. Moyen. App + Marketing (extrait du propriétaire).
4. **Cadrage des prises verticales** : « Entière + flou » / « Remplir, centré sur le visage » (détecteur de visage déjà là, ~l.6326) / « Zoom ». Moyen. App. Pro.
5. **Son à 320–384 kbit/s** (aujourd'hui 192). Petit. App. Pour tous.
6. **Changer Clip ↔ TikTok depuis l'étape Montage.** Petit. App.

🟠 Ce qui nous distinguerait
7. Carton d'ouverture « Artiste — Titre » et générique « Réalisé par ». Petit/moyen. App. Pro.
8. Miniature YouTube 16:9 tirée de la meilleure image, avec le titre. Moyen. App. Pro.
9. Le 16:9 et des extraits 9:16 du même montage (F5 de la feuille de route). Moyen. App. Packs = Creator Plus.
10. Chapitres YouTube prêts à copier (sections déjà détectées, ~l.3630). Petit. App.
11. Cadence 24 / 60 i/s au choix. Moyen. App. Pro.
12. Look « bandes cinéma 2,39 ». Petit. App. Pro.

🟢 Bonus : 4K sur ordinateur (gros) ; recadrage à la main par prise ; envoi direct vers YouTube (Comptes) ; page Marketing du Clip.

Aucune ne change prix, filigrane ni « pas de pub » ; seul le n° 2 demande l'accord du propriétaire.

## Mesure (2 semaines avant / après)
Part des paiements précédés de `ev_plans_why_clip` ; exports réussis **en mode Clip** (ajouter le mode à `export_ok` si absent) ;
choix à l'export « Pro » contre « TikTok/Reels » dans `clipAsk` (compteur à ajouter) ; exports ratés en Clip sur téléphone.
