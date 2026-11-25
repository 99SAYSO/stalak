Statut : PRÊT
Branche : legal/coach-ia

Résumé :
Réponse à `docs/handoff/chef-coach-ia.md` (partie Juridique). Construite **sur `legal/stats-analyse`** (pas encore dans `main`) : à intégrer avec ou après elle. Infos pour décider, pas un avis juridique. Détail : docs/juridique/COACH_IA.md.
- Confidentialité FR/EN :
  - section `#coach` : coach facultatif (activé par la personne, désactivable), analyse écrite par une IA (Claude, d'Anthropic), peut se tromper, conseils sans promesse ;
  - envoyé à Anthropic : chiffres des vidéos TikTok (@mentions retirées), chiffres Spotify, dates de sorties, réponses au questionnaire, nombre et dates de montages ; **pas** envoyé : e-mail, nom ou nom d'artiste, mot de passe, jetons, paiement, vidéos, photos, sons, paroles, texte des commentaires ;
  - Anthropic : écrit l'analyse pour notre compte, pas d'entraînement, conservation limitée (à confirmer) ; chez nous : 12 semaines, effacées aussi à la suppression du compte, la désactivation du coach ou le détachement de TikTok ;
  - Anthropic ajouté aux prestataires, aux transferts (États-Unis) et à la section États-Unis (inférences) ;
  - section TikTok corrigée : nouvelles données lues (partages, commentaires, durée, heure, légende, hashtags) ; « jamais partagées ni croisées » remplacé par l'exception Anthropic.
- Conditions FR/EN : formule Pro (coach IA) et section 10 `#coach` : suggestions et pas promesses, aucune garantie de vues, abonnés, auditeurs, revenus, erreurs possibles, responsabilité de la personne et des règles des plateformes, pas d'achat de vues, pas de conseil professionnel, pas d'affiliation.
- Étiquette IA proposée pour l'écran (FR/EN) dans le document.

Points sensibles (à décider) :
- **TikTok** : ses conditions développeur limitent l'envoi des données de son API à des tiers et à l'entraînement d'IA. À déclarer à TikTok à la validation de l'appli et à vérifier par écrit avant d'activer ; sinon le coach n'utilise que ce que la personne saisit.
- **Paddle** : ses règles du 13/04/2026 interdisent la pub vendue et le marketing automatisé sur les réseaux. Écrire à Paddle avant de changer les textes d'accueil et de tarifs en « aide au marketing sur les réseaux ».
- **Anthropic** : accepter l'accord de traitement des données dans la console, vérifier « pas d'entraînement » et la durée de conservation (la page le dit).
- Marketing : éviter « blow up », « tu vas percer », « garanti », « plus de vues ».

À faire (avant la mise en ligne des pages) :
- Comptes : activation explicite et désactivation ; ne pas envoyer e-mail, nom ni nom d'artiste ; retirer les @mentions ; aucun commentaire ni média ; 12 analyses gardées ; légendes et champ libre traités comme des données (injection), réponse affichée en texte ; consignes de l'IA (pas d'achat de vues, pas de promesse). Le propriétaire saisit `ANTHROPIC_API_KEY` dans Cloudflare.
- App : étiquette « Analyse écrite par une IA » toujours visible ; écran d'activation avec ce qui part et vers qui.

Fichiers touchés :
- site_src/privacy.html, terms.html, fr/confidentialite.html, fr/conditions.html (dates 25/11/2026)
- public/ : les 4 pages + sitemap.xml (build_site.py --domain stalak.app --email contact@stalak.app)
- docs/juridique/COACH_IA.md, docs/STATUS.md (section Juridique & business uniquement), docs/handoff/legal-coach-ia.md

Migration SQL : aucune

Tests : 132/132 tests serveur ; build_site.py et build.py ok ; 8 pages légales vérifiées à 390 px et 1280 px (pas de défilement horizontal, aucune erreur, aucun {{…}}). Aucun fichier de l'app ni du serveur touché.

Reste au propriétaire : saisir `ANTHROPIC_API_KEY` (Cloudflare) et accepter l'accord de traitement d'Anthropic ; relecture par un professionnel avant la mise en ligne.
