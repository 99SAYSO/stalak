# Skill vetting — 9 skills vidéo / motion (post Reddit r/claudeskills, 6/11/2026)

Revue par le Chef de projet avec le skill `skill-vetting`. Copies en quarantaine (clone `--depth 1` le 6/11, hors des dossiers
de skills), **rien installé ni lancé**. Lecture des SKILL.md, recherche de commandes à risque (shell, téléchargements, clés,
envois réseau, hooks d'installation). Aucun scanner (SkillSpector, Cisco) disponible : **NOT RUN**. Pas de signature : **NOT RUN**.
Toutes les licences : MIT.

| Skill (commit) | Utilité pour Stalak | Décision |
|---|---|---|
| Leonxlnx/earshot (`4ac3d2a`) | **Oui, gros manque** : donne des « oreilles » à l'agent (mesure, choix et vérification des sons, musique, bruitages) + bruitages sous licence libre (CC0, CC BY, Mixkit, Pixabay). Marketing ne peut pas écouter aujourd'hui. | **Essai encadré** |
| win4r/video-director (`4747e5c`) | Moyen : contrôle qualité des vidéos faites en code (qa_video.py : images noires, son…), complète la planche contact. | **Essai encadré, optionnel** |
| NiazMorshed2007/reanimate (`3f7a55a`) | Faible : recopie une animation d'un autre site ou d'une vidéo. Risque de copier le travail des autres (interdit par nos règles). Télécharge Bun, Chromium et ffmpeg au 1ᵉʳ lancement. | **Refusé pour l'instant** |
| alchaincyf/huashu-motion, huashu-art-motion, talsiach/take-one, vincentsch/explainroo | Font la même chose qu'HyperFrames + saas-motion-video (films de lancement, explicatifs) : consignes en concurrence. | **Non retenus** |
| shreyaskarnik/argo | Démos de l'app à partir de scripts Playwright + voix IA. Intéressant plus tard pour des tutoriels. | **Plus tard** |
| rossark0/rossark-motion-skill | Animation pour React Native / SwiftUI, pas notre cas. | **Non retenu** |

## Earshot — points relevés
- Scripts Python lancent ffmpeg / ffprobe avec des listes d'arguments (pas de `shell=True`). `audit.py --fetch` télécharge des sons
  (Freesound, Mixkit, Pixabay) : seulement les licences autorisées, à vérifier sur la page de chaque son.
- `earshot llm` envoie l'audio à Google Gemini : **désactivé tant qu'aucune clé GEMINI_API_KEY n'est fournie ET sans `--yes-upload`**.
  Règle : **ne jamais l'utiliser** (pas de clé, pas d'envoi).
- Installation `pip install -e` + modèles d'écoute téléchargés (versions figées) : peut être bloqué par la liste d'accès réseau
  de l'espace de travail ; si c'est bloqué, on arrête l'essai (pas de contournement).
- Fichiers lus : skills/earshot/SKILL.md (sha256 57b984a602ae1881…), skills/real-sound/SKILL.md (4810cd9a42676d92…).
## Video Director — points relevés
- Surtout du texte ; `scripts/qa_video.py` lance ffmpeg en local, sans réseau. SKILL.md aa7740e3f606a79c…, qa_video.py fb0aee3ec22c84a1….

## Non établi
Pas d'exécution, pas de scanner, pas de revue complète des 172 fichiers Python d'Earshot (lus : les scripts de real-sound et llm.py).
L'essai se fait sur **une** vidéo promo, en comparant avec et sans, et le propriétaire décide à l'œil et à l'oreille.

## Deuxième passe (6/11, 20 h 45, à la demande du propriétaire) : Take One, Explainroo, Huashu Motion

Même méthode (lecture, recherche de commandes à risque, rien installé ni lancé ; scanners et signatures : NOT RUN).
Aucun hook d'installation (`preinstall`/`postinstall`), aucun lien symbolique, aucun `shell: true` / `curl | sh` trouvé ;
les `.exec(` trouvés sont des expressions régulières. ffmpeg / ffprobe lancés avec des listes d'arguments.

| Skill (commit) | Ce qu'il fait mieux | Points relevés | Décision |
|---|---|---|---|
| talsiach/take-one (`830621c`) | Méthode tirée de vraies vidéos : se comprendre sans le son, ne jamais cacher un visage, vertical = nouveau cadrage, montrer le vrai produit, une idée + un look + une chute, se noter sur 10 face à une référence, bruitages par défaut. Contrôles `scripts/gate.mjs`, `text-audit.mjs`, `edge-audit.mjs`. | Cite des outils payants (Higgsfield, Seedance, Kling, Suno, ElevenLabs) mais exige de demander avant toute dépense. Salle de relecture = petit serveur local. | **Essai encadré, comme guide de méthode** avec HyperFrames (pas de changement de moteur) ; **aucun outil payant sans accord du propriétaire, prix en dollars annoncé**. |
| vincentsch/explainroo (`e95232c`) | **Voix off gratuite sur la machine** (modèle Kokoro-82M, timing des mots par Whisper), sans clé. | Télécharge les modèles depuis Hugging Face (peut être bloqué par l'espace de travail). `src/images.js:72` appelle OpenRouter (images générées) : **ne jamais fournir de clé**. Polices téléchargées. | **Essai encadré : la voix seulement**, sur une vidéo, comparée à la voix Flora. |
| alchaincyf/huashu-motion (`52467f9`) | **Studio dans le navigateur : on touche l'image à changer et on écrit sa remarque** ; garde les goûts du propriétaire d'un film à l'autre (`om learn`) ; 3 directions avec une vraie image chacune avant de construire ; musique composée et bruitages placés à l'image. | Moteur complet (remplacerait HyperFrames). `om grab <url>` télécharge des pages avec curl (OK pour stalak.app, à ne pas utiliser sur des sites tiers pour copier). Vérification de version par `git ls-remote` (lecture seule). | **Plus tard : test A/B** (une même vidéo avec lui et avec HyperFrames) ; si le propriétaire préfère, changement de moteur = nouvelle décision. |
