# Mesure (Clarity, GA4, TikTok) et offre à 1 € — demande du Chef de projet à « Comptes » et « Juridique »

Date : 23/11/2026. Décisions du propriétaire du 23/11 au soir. Elles **remplacent** « aucun traceur, pas de bandeau » (6/11).

## Pour Comptes, paiements & serveur (branche `compte/mesure-et-offre-1-euro`)

1. **Bandeau cookies** (accepté par le propriétaire) : Accepter / Refuser de même taille, rien de déposé avant le choix, choix gardé 6 mois, lien « Gérer les cookies » dans le pied de page (avec App pour `src/footer.py`). GPC respecté = refus.
2. **Microsoft Clarity** et **Google Analytics 4** : chargés **seulement après « Accepter »**. Les identifiants (ID du projet Clarity, ID de mesure GA4) seront donnés par le Chef de projet une fois les comptes créés ; ce ne sont pas des secrets. Clarity : masquer les champs (e-mail, mot de passe) et ne jamais enregistrer les vidéos des utilisateurs (canvas de l'aperçu masqué).
3. **Entonnoir GA4** : évènements `accueil_vue`, `onboarding_etape_N`, `montage_lance`, `export_ok`, `paywall_vu` (avec l'endroit), `checkout_ouvert`, `achat` (formule, montant) ; mêmes noms que nos compteurs (`docs/stats/compteurs.md`), qui restent (ils marchent sans cookie).
4. **API de conversion TikTok (Events API)** : côté serveur, à l'achat confirmé par le webhook Paddle, **seulement si la personne a accepté les cookies** ; e-mail haché SHA-256, jamais en clair. Jeton d'accès = secret Cloudflare saisi par le propriétaire. À préparer, à activer quand le compte TikTok Ads existera.
5. **Offre à 1 €**, **seulement sur l'écran de fin d'export avec filigrane** (l'essai gratuit de 7 jours reste ailleurs) : « Retire le filigrane pour 1 € », qui ouvre 7 jours de Pro puis l'abonnement Pro mensuel. À côté du bouton, en clair et lisible : « 1 € aujourd'hui, puis 7,99 $/mois dans 7 jours. Annulable à tout moment. » Voir avec Paddle comment le faire (prix d'essai payant) ; une fois par compte ; mêmes remboursements (14 jours).
6. **Écran de choix du paiement** : dire à App si Paddle permet d'ouvrir un moyen précis (`allowedPaymentMethods`).
7. Après un achat réussi : prévenir l'app pour l'écran « Bienvenue dans Stalak Pro » (démo `docs/audit/maquettes/mobile-2026-11-23/08-achat-confettis.mp4`).

## Pour Juridique (branche `legal/mesure-et-offre-1-euro`)

- Confidentialité FR/EN : section Cookies refaite (Clarity, GA4, plus tard TikTok ; finalités, durées, refus possible), prestataires ajoutés (Microsoft, Google Analytics, TikTok), section « vos choix » (on partage désormais des données de mesure et de publicité **après consentement**), transferts hors UE.
- Relire le texte du bandeau et le texte de l'offre à 1 € (elle ne doit pas être « cachée » : prix, durée de l'essai, prix ensuite, annulation, au même endroit que le bouton). Conditions et page Tarifs à compléter.
- Dire s'il manque quelque chose pour la CNIL (enregistrement de sessions par Clarity) et pour les États-Unis.
