# Demande du Chef : suite de l'analyse Clarity (24/11/2026)

Analyse : `docs/audit/clarity-2026-11-24.md`. Décisions du propriétaire du 24/11 à 16 h 17.

## Pour App (branche `app/suite-clarity`, maquette avant fusion)
1. **Caméra « Filmer maintenant »** (validé) : la prise s'arrête toute seule à la fin du passage ; temps restant visible pendant la prise ; message clair si la caméra ne démarre pas ; vérifier sur iPhone ce qui se trouve en haut à droite de l'aperçu (les taps des visiteurs y reviennent toujours).
2. **Choix du passage** (validé) : le son se lit depuis la poignée dès qu'on la lâche ; choix rapides « 15 s / 30 s / refrain ».
3. **Export trop lent à l'œil** (avis du propriétaire : la personne a tapé partout parce que l'export passait de 16 à 17 % en 5 s) : barre qui avance de façon continue et régulière (jamais figée plusieurs secondes), temps restant estimé, aperçu de la vidéo qui se construit si possible ; les étapes ne doivent plus ressembler à des boutons. Chercher aussi à accélérer vraiment la fabrication des images sur iPhone (1re cause d'échec : Safari ferme l'onglet, surtout pour les passages de plus d'1 min).
4. **Onboarding déplacé** (décision du propriétaire) : les questions de l'onboarding se posent **juste après la création du compte** (e-mail ou Google), plus au premier lancement. Au premier lancement, c'est **le tutoriel** (lot 4) qui prend sa place. Le bouton « Passer » reste.

## Pour Comptes (branche `compte/mesure-paiement`)
- Le compteur « Paiement fermé : après l'e-mail » est faux : l'e-mail est déjà rempli par Stalak (`customer: { email }`), donc Paddle envoie `checkout.customer.created` dès l'ouverture et l'étape passe à « details » sans que la personne ait rien fait. Corriger la mesure (ne compter « details » que sur une vraie saisie, ou distinguer « a seulement regardé le prix »), et renommer les libellés du tableau de bord en conséquence.
- Ensuite seulement, on saura où les gens s'arrêtent dans le paiement.
