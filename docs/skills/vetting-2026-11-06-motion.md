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
