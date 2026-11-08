# Conseils par e-mail (gratuits) et totaux de visites : ce que dit la confidentialité, ce que Comptes doit garder vrai (07/11/2026)

> Rôle Juridique & business. Infos pour décider, **pas un avis juridique**. Remplace la version « vidéo par e-mail » du même
> jour : il n'y a **pas** d'envoi de la vidéo par e-mail. Base : `compte/donnees-7-11` (`docs/handoff/compte-donnees-7-11.md`,
> `functions/_lib/optin.js`, migration 0017).

## A. Totaux de visites par provenance et par pays
- Validé : chaque nouvelle visite ajoute +1 au total `vs:<source>:<pays>` du jour. La provenance vient de l'onglet
  (`stalak:vsrc`, `stalak:ref`) ; les étapes de l'entonnoir et les fermetures de la fenêtre Paddle sont comptées par source et par
  étape. Rien n'est relié à une personne : mesure d'audience dispensée de consentement (CNIL).
- Pour que ça reste vrai : jamais de `vid`, de compte, d'e-mail ni d'empreinte d'IP dans ces totaux.
- `stalak:lastDay` : la page annonce un effacement à 13 mois (règle CNIL : pas de prolongation à chaque visite). **À faire par App**
  (la page le dit) : garder la date de première écriture et effacer au-delà de 13 mois.

## B. « 📩 Reçois des conseils pour tes prochaines vidéos par e-mail »
**Validé tel que fait par Comptes** : case non cochée, aucun envoi sans la case, double confirmation par un bouton (un lien
ouvert par un antivirus ne confirme rien), même réponse pour une adresse déjà inscrite, désinscription qui efface, 7 jours
sans confirmation puis effacement, 3 ans après la confirmation puis effacement, rien d'autre gardé (ni compte, ni pays, ni IP),
preuve gardée (version du texte `v1-2026-11-07` + dates), limites anti-abus.

La confidentialité FR/EN (`#conseils-email` / `#email-tips`) le décrit mot pour mot, avec le texte de la case cité.

### Changements demandés à Comptes (petits, avant ou avec la mise en ligne)
1. **Offres** : si les e-mails peuvent un jour proposer Pro, un code promo ou une réduction, la case doit le dire. Texte conseillé :
   - FR : « J’accepte de recevoir par e-mail des conseils pour mes vidéos, des nouvelles et des offres de Stalak (au plus 2 par mois). Je peux me désinscrire à tout moment avec le lien de chaque e-mail. »
   - EN : « I agree to get tips for my videos, Stalak news and offers by e-mail (2 a month at most). I can unsubscribe at any time with the link in each e-mail. »
   - Changer aussi `OPTIN_TEXT` et `OPTIN_CONSENT` (`v2-…`). Les adresses déjà inscrites avec la v1 ne reçoivent pas d'offres.
   - Si on garde la v1 : **jamais d'offre ni de promo dans ces e-mails**, seulement des conseils et des nouvelles.
   - **À décider par le propriétaire.** Dès que la case change, la page doit être mise à jour : prévenir Juridique.
2. **Petit texte sous la case** (`opt.legal`) : « On garde seulement ton e-mail et ta langue » est incomplet (on garde aussi la
   version du texte et les dates, comme preuve). Remplacer par :
   - FR : « Facultatif. On garde ton e-mail, ta langue et la date de ton accord. <a href="/fr/confidentialite#conseils-email">Confidentialité</a> »
   - EN : « Optional. We keep your e-mail, your language and the date you agreed. <a href="/privacy#email-tips">Privacy</a> »
3. **Le jour où les envois commencent** (aujourd'hui : seulement la collecte) :
   - lien « Me désinscrire » / « Unsubscribe » dans chaque e-mail, plus les en-têtes `List-Unsubscribe` et `List-Unsubscribe-Post: List-Unsubscribe=One-Click` ;
   - **2 e-mails par mois au plus** (promesse de la case) ;
   - expéditeur clair, objet honnête ;
   - **adresse postale de l'entreprise** en bas (loi américaine CAN-SPAM : une domiciliation ou une boîte postale suffit) ;
   - envoi seulement aux adresses confirmées.
   - Prévenir Juridique avant le premier envoi : la page dit « depuis login@stalak.app » pour la confirmation seulement.

## C. Mise en ligne
`legal/video-par-email` (nom historique de la branche) se publie **en même temps** que `compte/donnees-7-11`.
