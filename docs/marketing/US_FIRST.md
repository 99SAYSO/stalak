# Stalak — États-Unis d'abord (30/10/2026, 21 h)

Skills utilisés : `seo-audit`, `site-architecture`, `ai-seo`, `copywriting`, `social`, `community-marketing`, `content-strategy`.
Ce document remplace `PLAN_TRILLER.md` : le site ne cite plus aucun concurrent.

---

## A. Proposition : l'anglais à l'adresse principale, le français dans `/fr/`

**Rien n'est appliqué. J'attends l'accord du propriétaire.**

### Aujourd'hui

| Page | Français | Anglais |
|---|---|---|
| Accueil (l'app) | `/` | `/en/` |
| Tarifs | `/tarifs` | `/en/pricing` |
| Conditions | `/conditions` | `/en/terms` |
| Remboursement | `/remboursement` | `/en/refunds` |
| Confidentialité | `/confidentialite` | `/en/privacy` |
| Mentions légales | `/mentions-legales` | `/en/legal-notice` |

Les balises `hreflang` relient déjà les deux langues, et la page par défaut (`x-default`) est déjà l'anglais `/en/`.

### Ce que je propose

| Page | Anglais (nouveau) | Français (nouveau) |
|---|---|---|
| Accueil (l'app) | `/` | `/fr/` |
| Tarifs | `/pricing` | `/fr/tarifs` |
| Conditions | `/terms` | `/fr/conditions` |
| Remboursement | `/refunds` | `/fr/remboursement` |
| Confidentialité | `/privacy` | `/fr/confidentialite` |
| Mentions légales | `/legal-notice` | `/fr/mentions-legales` |

**Redirections permanentes (301)**, pour que les anciens liens marchent toujours :
- `/en/` → `/`, `/en/pricing` → `/pricing`, `/en/terms` → `/terms`, et de même pour toutes les pages anglaises ;
- `/tarifs` → `/fr/tarifs`, `/conditions` → `/fr/conditions`, et de même pour toutes les pages françaises ;
- `/` ne peut pas être redirigée, puisqu'elle devient l'accueil anglais.

**Pour les visiteurs francophones** : pas de redirection automatique selon le pays ou la langue du téléphone. Google visite le site depuis les États-Unis : une redirection automatique pourrait lui cacher la version française. À la place, un petit bandeau « Version française → » s'affiche si le téléphone est réglé en français ; il se ferme d'un appui et le choix est retenu.

### Les risques, et comment les réduire

1. **Le classement bouge pendant quelques semaines.** Google doit revisiter les pages et comprendre les redirections.
   - Le site est jeune et a peu de liens : c'est le meilleur moment pour changer, avant la promo aux États-Unis.
   - Après le changement : renvoyer le plan du site dans Google Search Console et Bing, puis demander l'indexation de `/` et `/fr/`.
2. **La recherche « stalak » en France.**
   - Aujourd'hui, stalak.app sort en 5e position derrière le monstre de Dofus.
   - Après le changement, Google peut montrer quelque temps l'accueil anglais aux Français.
   - Les `hreflang` (fr → `/fr/`, en → `/`, x-default → `/`) corrigent ça en général en quelques semaines.
3. **Les redirections en chaîne.** Une redirection doit mener directement à la page finale, jamais à une autre redirection. Les anciennes pages Triller doivent aussi être changées : `/en/triller-alternative` → `/` (et plus `/en/`), `/alternative-triller` → `/fr/`.
4. **Les appareils où Stalak est installé sur l'écran d'accueil.** Le fichier `manifest.webmanifest` démarre sur `/?app=1`, en français (`"lang": "fr"`). Après le changement, ces personnes arrivent en anglais. Il faut basculer le manifest en anglais et garder le choix de langue de chacun.
5. **Ce que d'autres conversations doivent changer en même temps** (sinon des choses cassent) :
   - **App** : `src/app.js` décide de la langue d'après l'adresse (`/en/…` = anglais). Il faut que `/fr/…` donne le français, et tout le reste l'anglais.
   - **Comptes** :
     - la connexion Google retient la langue d'après l'adresse de retour (`/en` = anglais, sinon français, dans `functions/_lib/oauth.js`) ;
     - les e-mails de code prennent le français par défaut (`functions/_lib/email.js`) ;
     - la publication sur les réseaux renvoie vers `/en/` (`functions/_lib/social.js`) ;
     - à inverser : anglais par défaut, français si `/fr`.
   - **Marketing** (moi) : `build_site.py` (l'anglais construit à la racine et le français dans `public/fr/`), les liens du pied de page, le plan du site, les `hreflang`, le fichier `_redirects`, `llms.txt`.
   - **Juridique** : vérifier que les adresses des pages légales citées dans les conditions et dans les e-mails Paddle sont à jour.
   - **Chef de projet** : mettre en ligne d'un coup, puis vérifier dans Search Console et Bing.
6. **Le risque de ne rien faire.** Une adresse en `/en/` montre aux Américains que leur langue est secondaire. Le titre anglais s'affiche déjà sur Google en France : le site reste entre deux langues.

**Ma recommandation : oui, le faire maintenant**, en une seule mise en ligne coordonnée, avant la promo aux États-Unis. Il faut compter une journée de travail répartie entre Marketing, App et Comptes, plus les vérifications.

---

## B. Plan de croissance aux États-Unis, sans budget, au nom de 99Sayso

### 1. Le message

- **En une phrase :** « I'm a rapper. I coded Stalak to cut my takes to the beat. It's free, in your browser. »
- **Promesse :** drop your song + a few takes → a lip-sync video cut on the beat, ready to post. No app, no sign-up.
- **Pourquoi toi :** un artiste de la scène underground qui a codé son propre outil. C'est rare, et ça se raconte.
- **Règles :**
  - toujours dire que c'est toi qui as fait l'outil ;
  - aucun faux compte, aucun faux avis, aucun chiffre inventé ;
  - pas de message privé à des inconnus ;
  - respecter les règles de chaque réseau et de chaque groupe.
- **Concurrents :** le site n'en cite aucun. Dans tes posts, la décision ne dit rien. Par défaut, je n'en cite aucun non plus : c'est plus simple et ça évite les débats. À toi de trancher.

### 2. Les réseaux, par ordre de priorité

| Rang | Réseau | Pourquoi | Rythme |
|---|---|---|---|
| 1 | **TikTok** | C'est là que les rappeurs américains postent leurs snippets | 1 vidéo par jour |
| 2 | **Instagram Reels** | Même vidéo, public rap très présent | La même vidéo, chaque jour |
| 3 | **YouTube Shorts** | La même vidéo, et les recherches « how to » restent longtemps | La même vidéo, chaque jour |
| 4 | **X** | La communauté rap et le « build in public » (raconter qu'on construit l'outil) | 3 posts par semaine |
| 5 | **Reddit** | Des musiciens qui cherchent des outils et des avis | 1 post utile par semaine, plus des réponses |
| 6 | **Discord** | Ton #stalak-beta, et des serveurs de producteurs ou de rappeurs | Participer chaque semaine |

**Horaires** : le soir sur la côte Est (19 h – 22 h), c'est-à-dire 1 h – 4 h du matin en France. Programme tes posts à l'avance avec les outils de programmation de chaque réseau, sans rester debout la nuit.

### 3. Les 5 types de vidéos

1. **Avant / après** : « 3 takes → 1 edit », l'écran filmé puis la vidéo finale.
2. **« I'm editing your snippet »** : des rappeurs t'envoient leurs prises, tu les montes. Toujours avec leur accord écrit pour reposter, et en les identifiant.
3. **Build in public** : « I'm a rapper who codes. Here's what I added this week. »
4. **Tutos** : « How to make a lip-sync video for your snippet ». Ces vidéos marchent bien sur YouTube, et elles reviennent dans les recherches.
5. **Ta musique** : tes propres sons montés avec Stalak. C'est la preuve la plus honnête.

**Accroches** (les 2 premières secondes, en anglais américain) :
- "I got tired of editing my snippets by hand, so I coded this."
- "3 takes. 1 click. Cut on the beat."
- "Rappers: stop editing your snippets frame by frame."
- "This is what my edit looks like with no editing."

### 4. Les communautés (à vérifier avant de poster)

**Reddit** : lis les règles et le fil épinglé. Beaucoup de groupes n'acceptent l'auto-promo que dans un fil dédié, ou à certains jours.
- r/makinghiphop : rappeurs et producteurs ; passe par les fils de retours ou d'auto-promo s'il y en a.
- r/WeAreTheMusicMakers : musiciens ; la promo n'y est permise qu'à certains endroits, alors réponds surtout aux questions.
- r/musicmarketing : artistes qui cherchent comment se faire connaître.
- r/IndieMusicFeedback : partage de morceaux ; poste tes vidéos montées avec Stalak, sans lien insistant.
- r/hiphopheads : seulement pour participer, jamais de promo.
- r/NewTubers et r/TikTokCreators : créateurs qui débutent ; règles strictes, à lire d'abord.

**TikTok et Instagram** : commente sincèrement sous les posts de petits rappeurs américains de ta scène (underground, rage, pluggnb), sans lien et sans « check my app ». Les gens viennent voir ton profil.

**Discord** : serveurs de producteurs, de beats et de rap underground. Les salons « tools » ou « resources » existent souvent : partage-y Stalak une fois, puis aide les gens.

**Collaborations sans budget** :
- propose un mois de Creator Plus gratuit à de petits rappeurs américains contre des retours honnêtes, sans obligation de poster ;
- s'ils postent quand même, la FTC (l'autorité américaine) exige qu'ils signalent le cadeau (« gifted », « #ad ») : dis-le-leur par écrit ;
- ça demande que Paddle soit en mode réel, ou un code d'essai géré par la conversation Comptes.

### 5. Les mots-clés américains

**Google Trends, États-Unis, 12 derniers mois** (consulté le 30/10/2026). Ce sont des indices relatifs, pas des volumes : aucun outil de volumes n'était disponible.

| Recherche | Indice moyen | Fin octobre 2026 | Ce que ça veut dire |
|---|---|---|---|
| music video editor | ≈ 50 (pic à 100 en juin) | ≈ 20 | La plus cherchée des 5, mais très générale et très concurrencée |
| lip sync app | ≈ 15 | ≈ 5 | Les résultats sont surtout des outils d'IA qui fabriquent une fausse bouche, pas du montage. Les données de Trends s'arrêtent bizarrement de juillet à octobre |
| beat sync video | ≈ 4 | ≈ 3 | Petit, mais bien ciblé |
| rap video editor | ≈ 0 | ≈ 0 | Trop rare pour Trends |
| lip sync video editor | ≈ 0 | ≈ 1 | Trop rare pour Trends, mais parfaitement ciblé |

**À viser en premier** (peu de concurrence, l'intention correspond exactement) :
- lip sync video editor
- edit multiple takes to the beat
- multi cam lip sync edit
- auto edit music video
- cut video to the beat automatically
- music video maker for rappers
- rap snippet editor
- how to make a lip sync video for TikTok

**Plus tard** (plus gros, plus durs) : music video editor, beat sync video, music video maker.

**Où les utiliser** :
- titres et descriptions YouTube ;
- légendes TikTok et Instagram (la recherche TikTok lit le texte) ;
- titre et description de la page anglaise ;
- 4 pages utiles en anglais, après le passage de l'anglais à la racine : `/lip-sync-video-editor`, `/music-video-maker-for-rappers`, `/how-to-make-a-lip-sync-video`, `/edit-video-to-the-beat`. Elles ne citent aucun concurrent, et chacune a une vraie vidéo d'exemple.

**Hashtags** : #rapper #newmusic #snippet #undergroundrap #lipsync #musicvideo #independentartist #rapsnippet

### 6. Le calendrier (4 semaines)

| Semaine | Vidéos | X | Reddit / Discord |
|---|---|---|---|
| 1 | Avant / après, tous les jours | « I'm a rapper, I coded my own editor » (thread) | Présentation dans 1 groupe qui l'accepte, puis réponses pendant 24 h |
| 2 | « I'm editing your snippet » (appel aux prises) | Les montages faits, avec l'accord des artistes | Réponses dans les fils existants |
| 3 | Tutos « how to make a lip-sync video » | « What I added this week » | Partage dans 2 serveurs Discord (salons « tools ») |
| 4 | Ton propre son, monté avec Stalak | Bilan honnête de ce qui a marché | Fil de retours : « what should I build next? » |

### 7. Les textes prêts

**TikTok / Reels / Shorts (légende) :**
I coded this because editing my snippets took forever 🧊 Drop your song + a few takes, Stalak cuts them on the beat. Free, right in your browser. stalak.app #rapper #snippet #lipsync

**X (thread) :**
1. I'm a rapper. Editing my snippets by hand was killing me, so I coded my own editor. It's called Stalak 🧊 stalak.app
2. Drop your song + 3 or 4 takes of you rapping. It cuts between them on the beat, lip sync locked in. Lyrics on screen if you want.
3. Runs in your browser. No download, no sign-up. Free videos get a small logo, or watch a 30-second ad to remove it.
4. Pro drops ads + watermark and unlocks 16:9 music videos, karaoke lyrics and auto lyrics.
5. One artist building for artists. Tell me what's missing and I'll build it.

**Reddit (titre + texte) :**
I'm a rapper and I built a free browser tool that cuts my takes to the beat. Looking for honest feedback.

> I'm 99Sayso, an independent rapper. I film 3 or 4 takes of every snippet and editing them by hand took forever, so I coded Stalak (stalak.app). You drop your song and your takes, it cuts between them on the beat with the lip sync locked in, and you can add lyrics on screen. It runs in the browser, no download, no account.
>
> Full transparency: free videos get a small Stalak logo, or you can watch a ~30 s ad to remove it. The paid plan removes both, that's how I keep it running.
>
> What would make this actually useful for you? I'll answer everything.

**Réponses types :**
- **"What is it?"** It's a site I built: drop your song and a few takes, it cuts between them on the beat with the lips in sync. stalak.app
- **"Is it free?"** Yep, unlimited and no account. Free videos get a small logo; a 30 s ad removes it, or Pro ($7.99/mo) gets rid of it for good.
- **"Is this an ad?"** It's my own tool, so yeah, I'm promoting it, and I'm telling you that up front. Mostly I want feedback.
- **"Where do my videos go?"** Nowhere. Editing happens on your phone or computer. Only cloud saving (Creator Plus) and auto lyrics (Pro) send anything.
- **"It's buggy"** Thanks for telling me. What phone and browser? Send me what you're seeing at contact@stalak.app and I'll look into it.

### 8. Ce qu'on mesure

- Un lien par réseau : `stalak.app/?ref=tiktok`, `?ref=ig`, `?ref=yt`, `?ref=x`, `?ref=reddit`, `?ref=discord`. À vérifier avec le Chef de projet : le tableau de bord doit compter ces `ref`.
- Chaque semaine :
  - visites venues des États-Unis ;
  - exports ;
  - abonnements ;
  - les 3 demandes qui reviennent le plus, à transmettre à App & montage.
- Dans Search Console : les recherches américaines qui amènent des visites. Ce sont elles qui diront quelles pages créer ensuite.

### 9. Ce que tu fais toi-même

- Créer ou renommer les comptes TikTok, Instagram et YouTube, puis donner les adresses à Marketing (liste `SOCIAL` de `build_site.py`).
- Filmer et poster les vidéos, et répondre aux commentaires en ton nom.
- Demander par écrit l'accord des artistes avant de reposter leurs prises.
- Décider : cites-tu des concurrents dans tes propres posts ? Et passe-t-on l'anglais à l'adresse principale (partie A) ?
