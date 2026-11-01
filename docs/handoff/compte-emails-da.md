Statut : PRÊT
Branche : compte/emails-da
Conversation : 3. Comptes, paiements & serveur
Partie de : `main` 1c4842d (demande du propriétaire du 1/11 : e-mails aux couleurs de Stalak)

Résumé :
- Un seul modèle commun, `functions/_lib/mail-layout.js` (`mail({lang, site, subject, preheader, title, mascot, blocks, reason})`),
  en français et en anglais, pour les 4 e-mails envoyés aux utilisateurs :
  - les codes (création de compte, nouvel appareil, mot de passe oublié) : `email.js` ;
  - la réponse de « Parler à un humain » : `support.js` (avec un bouton « Ouvrir Stalak ») ;
  - l'avertissement avant suppression des projets en ligne : `cloud.js` (liste des projets, bouton « Ouvrir ma Galerie ») ;
  - le rappel annuel : `reminders.js` (bouton « Gérer mon abonnement »).
  Les alertes au propriétaire restent simples (inchangées).
- Style : fond bleu `#1f6fd6`, carte blanche au contour encre `#0a0d14` avec les glaçons du site sous le bord du haut, ombre dure
  (bord du bas épais, Gmail ignore `box-shadow`), logo `/icons/icon-192.png`, mascotte (bonjour, cool, surprise, café selon
  l'e-mail), titre en police grasse de secours (Lilita One quand le client la charge, Apple Mail), code en très gros (46 px,
  chiffres espacés, sélection d'un appui), bouton bleu « à l'épreuve des images », pied de page : stalak.app, Instagram et
  TikTok @stalak_app, « Pourquoi cet e-mail ? » + la raison.
- Technique : mise en page en tableaux, styles écrits dans chaque balise, 600 px et fluide sur téléphone, ligne d'aperçu cachée,
  mode sombre (Apple Mail, iOS, Outlook ; Gmail inverse lui-même les couleurs, la carte reste lisible), version texte gardée,
  ≈ 7 Ko de HTML par e-mail. Images PNG légères dans `site_src/icons/mail/` : glaçons 1,5 Ko, 4 mascottes ≈ 6-7 Ko chacune
  (+ le logo 12 Ko déjà en ligne). Pas de SVG.
- Les liens des e-mails pointent vers la page française (`/`) ou anglaise (`/en/`). À la bascule de l'anglais à la racine :
  changer `FR_HOME` en `'/fr/'` et `EN_HOME` en `'/'` (2 lignes en haut de `mail-layout.js`).

Captures : envoyées au propriétaire dans la conversation (12 planches : 6 e-mails × FR/EN, chacune téléphone et ordinateur,
clair et sombre). Rendu Chromium ; le vrai rendu Gmail / Outlook n'est pas simulable d'ici (voir « Reste »).

Skills utilisés : `appsec-review` (relecture : tout texte venant d'une personne — réponse, question, noms de projets — est échappé ;
liens rendus cliquables seulement pour `https://` et les adresses e-mail ; images seulement depuis stalak.app ; test ajouté).

Fichiers touchés :
- nouveau : `functions/_lib/mail-layout.js`, `site_src/icons/mail/` (icicles.png, hello.png, cool.png, shock.png, coffee.png)
- modifiés : `functions/_lib/email.js`, `cloud.js`, `support.js`, `reminders.js`, `tests/backend/run.mjs`, `docs/STATUS.md`
- `public/` reconstruit (les images des e-mails doivent être en ligne avant le premier envoi : elles le seront à la publication)

Migration SQL : aucune.

Tests :
- `node tests/backend/run.mjs` : 79/79 (nouveau test : modèle commun pour les 6 e-mails en FR et EN : tableaux, 600 px, aucune SVG,
  images PNG sur stalak.app, logo, couleurs, mode sombre, pied de page, code en très gros, bouton bleu, échappement, version texte)
- captures : téléphone 390 px et ordinateur 1280 px, clair et sombre, sans défilement horizontal

Reste au propriétaire :
- Après la mise en ligne : s'envoyer un vrai code (créer un compte de test ou « Mot de passe oublié ») et le regarder dans Gmail
  sur iPhone et sur ordinateur, en clair et en sombre. Si une image ne s'affiche pas, me le dire.
