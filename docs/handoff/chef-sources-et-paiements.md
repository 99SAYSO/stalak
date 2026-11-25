# Demande du Chef de projet — d'où viennent les abonnés, et pourquoi les paiements sont abandonnés (25/11)

Pour : **Comptes** (pilote) et **App** (le code de mesure de la source est dans `src/app.js`, l. ~9901-9970).
Accord du propriétaire : 25/11, 21 h 57 (« fais en sorte de le savoir », « dacc »).

## Ce que le Chef de projet a trouvé (base D1, 1er au 25/11)

- **9 abonnés payants sur 10 parlent anglais** (US, CA, AU, DE et ES en anglais), presque tous sur iPhone, arrivés en « direct » (aucune source connue). Le seul abonné français a été créé le 27/10 (le propriétaire ou un proche).
- Visites depuis le 1/11 : 1 700 en anglais (383 restées plus de 5 min) contre 449 en français (95).
- **Le pic du 16-17/11** (3 abonnés, 25 $) : des visiteurs anglais des États-Unis le 16, d'Australie le 17, en « direct ». Ce n'est **pas Google** (Search Console : 2 à 4 clics par jour ces jours-là) et **pas nos vidéos** (la série française a commencé le 19/11 ; les vidéos TikTok et Instagram donnent 0 clic vers le site, 4 visites « tt » en tout).
- Piste la plus probable : **les assistants IA (ChatGPT…)**. Preuve indirecte : Clarity a vu des visiteurs envoyés par ChatGPT vers `/opsh.php`. Mais **notre compteur ne peut pas le voir** :
  - ChatGPT ajoute `?utm_source=chatgpt.com` ; nos filtres `/^[a-z0-9_-]{1,32}$/` refusent le point → la visite devient « direct ».
  - Le site d'origine `chatgpt.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`, `copilot.microsoft.com` n'est pas reconnu (VISIT_REF le range dans « other », et `google.` attrape Gemini par erreur).

## À faire

**App (`src/app.js`, FIRST_SRC, VISIT_REF, VISIT_SRC)**
1. Accepter les points dans `utm_source` / `ref` (ex. `/^[a-z0-9._-]{1,40}$/`).
2. Nouvelle source **`ai`** avec le détail : `chatgpt` (chatgpt.com, chat.openai.com, utm chatgpt.com), `perplexity`, `claude`, `gemini` (gemini.google.com, avant la règle `google.`), `copilot`. À ajouter aussi dans `SRC_PLATFORMS` (Comptes).
3. Tests FR/EN, iPhone et ordinateur ; prévenir Comptes.

**Comptes**
1. Tableau de bord : la source `ai` (et son détail) dans « Sources », « Du visiteur à l'abonné » et « Derniers inscrits ».
2. Une carte « Langue des visiteurs et des abonnés » (anglais / français), sur 7 et 30 jours.
3. **Paiements abandonnés** : le 23 et le 24/11, 4 ouvertures de Paddle (`ev_checkout_open`), 4 fermetures (`ev_checkout_close`, dont 3 « details »), 0 paiement. Dire au propriétaire, chiffres à l'appui : à quelle étape les gens ferment (adresse, carte, prix affiché, taxes, devise), langue, appareil, formule, essai ou non. Si Paddle donne la raison (événements `checkout.*`, transactions « abandoned »), la lire. Proposer des corrections, sans rien changer à l'offre sans l'accord du propriétaire.
4. Compte rendu `docs/handoff/compte-sources-paiements.md`, Statut PRÊT / EN COURS, puis STATUS.

Rien ne doit être tiré d'une personne : les sources restent des totaux anonymes, comme aujourd'hui.
