Statut : EN COURS

# Branche `app/retours-25-11` — retours du propriétaire du 25/11 (points 1, 2 et 4 à 10)

Demande : `docs/handoff/chef-retours-maquettes-25-11.md`. **Cette branche contient `app/fond-degrade`, `app/stats-analyse` et `app/suite-clarity`** (et `main`) : l'intégrer remplace l'intégration de ces trois branches.

## 7. Crash à la 2e prise — corrigé (priorité 1)
- **Cause trouvée et reproduite** (iPhone simulé, 12 prises : la page plantait à la 8e, la mémoire montait de 300 Mo par prise) : à l'étape « Prises », chaque vignette sans image lançait sa propre relance toutes les 0,9 s, et chaque relance en relançait une par prise. Sur iPhone, les vidéos ne chargent jamais d'image sans geste de l'utilisateur, donc la cascade ne s'arrêtait pas : des milliers de minuteurs en quelques secondes, page figée, écran noir.
- Corrigé : une seule relance à la fois ; la vignette d'une prise filmée est prise sur l'image de la caméra.
- En plus, pour qu'aucune prise ne bloque :
  - pendant que la caméra est ouverte, rien de lourd ne tourne derrière (copies légères, analyse d'image, décodage des images des prises) : tout reprend à la fermeture de la caméra, une prise à la fois ;
  - après chaque prise et au retour sur la page, la caméra est vérifiée ; si le téléphone l'a coupée, elle est rouverte toute seule avant la prise suivante.
- Nouveau test `tests/ui/prises_ui.py` : 12 prises à la suite (iPhone 13 FR, iPhone SE EN), dont une caméra coupée par le téléphone au milieu : 24/24. Mémoire stable (≈ 700 Mo après 12 prises, contre plantage avant).
- **À refaire par le propriétaire sur son iPhone** : plusieurs prises de suite.

## 10. Fin d'export — corrigé
Sur téléphone, l'écran « Ta vidéo est prête » est un écran d'appli : plus de pied de page du site, plus de morceaux de l'éditeur (« Filmer maintenant », panneau du plan…) ; il s'arrête à la fin de sa carte.

## 8. Montage final — corrigé
Le panneau d'un plan (et d'un effet) est une feuille qui monte du bas sur un voile : elle se ferme avec ✕, en la glissant vers le bas ou en touchant à côté, et quand on quitte l'étape. Rien ne se décale ni ne se superpose (les bulles d'aide ne sortent plus de l'écran).

## 6. Caméra — corrigé
Tout tient dans l'écran visible (la caméra s'arrête au-dessus des barres de Safari, noir dessous) ; « Prise n enregistrée » est une bulle en haut qui glisse puis s'en va après 3,5 s.

## 5. Mode Clip — corrigé
- Sans abonnement, « Clip » ouvre le paywall, aucun essai (déjà en place depuis `app/clip-reserve-abonnes`, intégré dans `main`).
- TikTok ou Clip **se choisit à l'étape 1 seulement** : le sélecteur de l'étape Montage est retiré (caché, il ne fait plus rien).
- Les messages en haut de l'étape sont dans une bulle blanche, texte encre (plus de blanc pâle sur bleu clair).

## 4. Fonds par étape — fait
Chaque étape a son ciel, dans la famille du dégradé A, avec les flocons blancs : Son (bleu A), Prises (cyan), Paroles (lavande), Montage (bleu profond), fin d'export (halo doré). Titres blancs à contour, phrases et étiquettes posées sur le fond en blanc ; barre du haut assortie. Textes des vignettes de prises lisibles (voile plus sombre).

## 9. Export — en partie
- Fait : les étapes sont dans une carte blanche, lisibles ; phrases en blanc ; fond nuit.
- **Maquette vidéo HyperFrames à valider** : `docs/audit/maquettes/export-2026-11-25/export-mascotte.mp4` (source `src/index.html`) — la mascotte travaille pendant que les morceaux arrivent dans le téléphone, puis saute de joie. Elle sera mise dans l'app après validation.

## 1-2. Stats — fait
- Bouton TikTok aux couleurs de TikTok (noir, cyan, rose, logo), en haut de « Stats ».
- « Tes sorties par mois » : le mois sous chaque barre, le nombre au-dessus, et une phrase (« 4 sorties en 6 mois, rien en juillet et en octobre »).
- « Tes auditeurs, semaine par semaine » : chaque semaine sous son point, chaque chiffre au-dessus, et une phrase (« De 3 900 à 4 812 auditeurs en 7 semaines (+23 %) »).

## Nouveau (analyse Clarity du 25/11) : « Où est ton son ? »
Maquette à valider : `docs/audit/maquettes/son-2026-11-25/maquette.png`. Pas encore dans l'app.

Maquettes :
- Éditeur et caméra : https://app-retours-25-11.stalak-site.pages.dev/fr/ (« Voir un exemple »)
- Stats : https://app-retours-25-11.stalak-site.pages.dev/fr/?demo=pro et `?demo=gratuit`
