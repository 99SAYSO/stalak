# Compte rendu — « Where did you hear about Stalak? », partie Comptes
**Statut : PRÊT**, dans la branche `compte/activation` (**migration 0026**).
Tout est expliqué dans `docs/handoff/compte-activation.md`, partie « Comment ils nous ont connus » et « Contrat pour App » (point 2).
En bref :
- la réponse est gardée sur le compte (`users.heard_from`, `heard_text`, `heard_at`), une seule fois ;
- App appelle `POST /api/account/heard {answer, text?}` et lit `GET /api/me` → `user.heardAsked` ;
- carte « Comment ils nous ont connus » (comptes, essais, payants par réponse, 7 et 30 jours) ;
- colonne « Comment il a connu Stalak » dans « Derniers inscrits ».
