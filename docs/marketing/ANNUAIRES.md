# Stalak — annuaires d'outils et Bing (01/11/2026)

Marketing & croissance. Décision du propriétaire du 31/10 : « Annuaires d'outils et Bing Webmaster Tools : textes préparés par Marketing, comptes créés par le propriétaire. »
Version à cocher pour le propriétaire (colonne Statut) : document claude.ai « Stalak — annuaires d'outils et Bing » (https://claude.ai/artifact/EbcSbWg4zfAhNLrN6XWDn9). Il remplace le tableau des annuaires du document « Stalak — passer premier sur Google ».

Skills utilisés : `directory-submissions`, `copywriting`, `ai-seo`.
Logo carré et 5 vraies captures de Stalak (anglais) : `docs/marketing/annuaires/`.

**Quand :** juste après la mise en ligne de la bascule « anglais à la racine » (branche `marketing/en-racine`), pas avant : les fiches doivent pointer vers les adresses définitives.

## 1. Bing Webmaster Tools (le propriétaire, environ 10 minutes)

1. https://www.bing.com/webmasters → se connecter (compte Microsoft, Google ou Facebook).
2. My Sites → **Import** → se connecter avec le compte Google qui gère stalak.app dans Search Console → **Allow**.
3. Cocher stalak.app → Import. Vérification automatique ; données sous 48 h.
4. Sitemaps : vérifier `https://stalak.app/sitemap.xml` ; ajouter `https://stalak.app/sitemap-old.xml` (anciennes adresses, pour que les 301 soient vues vite). Le retirer après ~6 semaines.
5. Cloudflare → stalak.app → Caching → Configuration → **Crawler Hints** : gratuit, prévient IndexNow (Bing…) quand une page change. Fonctionnement avec Cloudflare Pages non vérifié.
6. Si l'import échoue : « Add a site » + vérification par enregistrement DNS TXT dans Cloudflare (aucun code).

Google : le Chef de projet renvoie `sitemap.xml` et `sitemap-old.xml` dans Search Console après la bascule, et demande l'indexation de `/` et `/fr/`.

## 2. Annuaires, dans l'ordre (vérifiés le 01/11/2026)

| N° | Quand | Site (inscription) | Prix | À savoir | Texte |
|---|---|---|---|---|---|
| 1 | Semaine 1 | AlternativeTo (https://alternativeto.net/software/_/add/) | Gratuit | Compte ; validation en quelques jours à une semaine ; « alternative à Triller » = décision du propriétaire | B |
| 2 | Semaine 1 | SaaSHub (https://www.saashub.com/submit-software) | Gratuit (IdeaProof, août 2026 ; site non lisible par robot) | Compte ; Video Editing | B |
| 3 | Semaine 1 | Buzzsonic (https://buzzsonic.com/submit-music-industry-resource/) | Non indiqué | 500 caractères max, image 1280 × 960 ; Video & YouTube | C courte |
| 4 | Semaine 1 | The Music Industry Toolkit (https://the-music-industry-toolkit.super.site/request-something-1) | Non indiqué | Formulaire créateurs d'outils ; Design / Content Creation | C |
| 5 | Semaine 1 | contentcreators.com (https://contentcreators.com/submit) | Non indiqué | Video Creation & Editing ; 3 mots-clés max | C |
| 6 | Semaine 1 | Uneed (https://uneed.best/submit-a-tool) | Gratuit en file ; 14,99 $ / 39,99 $ | Score de 10 votes le jour J pour rester publié, 20 pour le lien dofollow | A |
| 7 | Semaine 1 | PeerPush (https://peerpush.com/submit) | Gratuit en file ; 39 $ à 229 $ | Creator Economy / Video Editing ; page « Products for Musicians » | A |
| 8 | Semaine 2 | WebCatalog (https://webcatalog.io/en/apps/submit) | Gratuit | Compte ; examen en quelques jours | B |
| 9 | Semaine 2 | Tinyshelf (https://www.tinyshelf.co/submit) | Non indiqué | Relu à la main ; Photo, Video & Audio ; tinyshelf.co, pas .com | A |
| 10 | Semaine 2 | Launching Next (https://launchingnext.com) | Gratuit (IdeaProof, août 2026) | Sélection éditoriale | A |
| 11 | Semaine 2 | Peerlist Launchpad (https://peerlist.io/launchpad) | Aucun frais indiqué | Profil vérifié, projet rempli à 100 %, lancement le lundi | A |
| 12 | À décider | Twelve Tools (https://twelve.tools/submit) | Gratuit contre un lien vers eux sur stalak.app ; 36 $ une fois sans lien | Video Editing ou Music | A |
| 13 | À décider | Fazier (https://fazier.com/submit) | Gratuit contre un lien vers eux sur stalak.app ; 29 $ à 139 $ | Publié sous 30 jours | A |
| 14 | Plus tard | Product Hunt | Gratuit | Compte personnel ; un dimanche (décision A8), 3 semaines de préparation | A + premier commentaire |
| 15 | Plus tard | Show HN (https://news.ycombinator.com/showhn.html) | Gratuit | Seulement avec un angle technique | à écrire |
| 16 | Plus tard | Crunchbase | Gratuit | Compte vérifié (LinkedIn, Facebook ou Twitter) | B |
| 17 | Plus tard | awesome-music-production (GitHub) | Gratuit | Section Webapps ; ajout lent | phrase B |
| 18 | Plus tard | Creator Economy Tools | Gratuit | E-mail hello@creatoreconomytools.com | C |

Écartés : BetaList et Microlaunch (payants), OpenHunts (~60 semaines d'attente en gratuit), annuaires d'outils d'IA (Stalak n'est pas un générateur), G2 / Capterra (sans avis, inutiles), Slant (interdit d'ajouter son produit), sites qui exigent leur badge.
Le type de lien (dofollow ou non) n'est connu qu'une fois la fiche en ligne : le vérifier dans le code de la page (pas seulement les en-têtes).

## 3. Textes prêts à coller (anglais)

Toujours pareil : Name `Stalak` · Website `https://stalak.app` · Category Video editing / Music / Creator tools · Platforms Web (iPhone, Android and desktop browsers) · Languages English, French · Pricing Free (small watermark) · Stalak Pro $7.99/mo or $49.99/yr · Creator Plus $14.99/mo or $99.99/yr · Maker 99Sayso · Contact contact@stalak.app.
Tags : lip sync video editor, music video maker, beat sync video editing, video editor for musicians, lyric video, rap video, TikTok video editor, online video editor.

Fondateur :
> I'm 99Sayso, a rapper from the Alaska collective. I coded Stalak to cut my own takes to the beat for my videos. Now any artist can use it for free, right in the browser.

**A — sites de lancement.** Accroche : `Cut your lip-sync takes to the beat, automatically` · Courte : `Free lip-sync video editor that cuts your takes on the beat` · Product Hunt (251 car.) :
> Stalak turns a few phone takes of your song into a video cut on the beat. Add your track and 2+ takes: it switches between them phrase by phrase, on your lines or every bar, lip sync locked in, lyrics on screen. Runs in your browser. Free, no sign-up.

Longue :
> Stalak turns a few phone takes of your song into a video cut on the beat. Upload the track, add two or more videos of you performing it, and Stalak switches between them on the beat, phrase by phrase, on your lines and rhymes, or every bar, with your lip sync locked in. Put your lyrics on screen, then export a vertical video for TikTok, Reels or Shorts, or a full 16:9 music video for YouTube.
>
> It runs in the browser on iPhone, Android or desktop. There's nothing to install, and the free plan needs no account. Editing happens on your device, so your footage stays yours.
>
> I'm 99Sayso, a rapper from the Alaska collective. I coded Stalak to cut my own takes to the beat, and now any artist can use it.
>
> Free with a small watermark. Stalak Pro is $7.99/month.

Premier commentaire Product Hunt :
> Hey Product Hunt! I'm 99Sayso, a rapper. Every song I put out needs a bunch of short videos, and cutting several takes by hand on a timeline is slow. So I built Stalak: drop your song and a few takes, and it cuts between them on the beat while keeping the lip sync tight. It runs in the browser, and the free plan needs no account. I'd love your honest take: what would make you use it for your next post?

**B — logiciels et alternatives.** Accroche : `Browser-based lip-sync video editor for musicians` · Courte : `Auto-edits your lip-sync takes on the beat, in the browser` · Longue :
> Stalak is a lip-sync video editor for rappers and singers that does the cutting for you. Instead of placing every cut on a timeline, you give it your song and a few takes; Stalak finds the beat and switches takes phrase by phrase, on your lines and rhymes, or every bar.
>
> Main features:
> - Automatic multi-take editing, with the lip sync kept tight
> - On-screen lyrics: one line at a time (free); word-by-word and karaoke (Pro); lyrics written from your vocals (Pro)
> - 9:16 export for TikTok, Reels and Shorts; full 16:9 music video (Pro)
> - Video packs: 5 to 30 differently cut videos from one song (Creator Plus)
> - Runs in the browser; editing stays on your device
>
> Pricing: free, with a small watermark that a ~30-second ad removes from a video. Stalak Pro $7.99/month or $49.99/year. Creator Plus $14.99/month or $99.99/year.

**C — listes pour musiciens et créateurs.** Accroche : `Built by a rapper for artists who post daily` · Texte :
> If you release music, you need a steady stream of short videos: snippets, teasers, performance clips. Stalak turns one filming session into many posts. Film a few takes of your song on your phone, drop them in with the track, and Stalak cuts them on the beat with your lyrics on screen. With Creator Plus, one song becomes 5 to 30 differently cut videos, so you can post every day of a rollout without re-editing.
>
> Free in the browser, with no download and no account. Made by 99Sayso, an independent rapper from the Alaska collective.

**C courte** (Buzzsonic, 444 caractères) :
> Stalak turns a few phone takes of your song into videos cut on the beat. Drop in the track and your takes: it switches between them on the beat, on your lines or every bar, keeps the lip sync tight and puts your lyrics on screen. Export for TikTok, Reels, Shorts or a 16:9 YouTube music video. Creator Plus makes 5 to 30 differently cut videos from one song. Free in the browser, no download, no account. Made by 99Sayso, an independent rapper.

**D — annuaires d'IA** (aucun retenu ; seulement si on en ajoute un) :
> Stalak uses beat detection to cut between your real takes on the beat, and speech recognition to write and sync your lyrics from your vocals (Pro). It never generates a face or fake mouth movements: every frame is you, filmed on your phone. Upload a song and 2+ takes, then export 9:16 for TikTok, Reels and Shorts, or 16:9 for YouTube. Free in the browser.

## Sources (ouvertes le 01/11/2026)

Bing : https://blogs.bing.com/webmaster/2019/9/Import-sites-from-Search-Console-to-Bing-Webmaster-Tools/ · https://blogs.bing.com/webmaster/2025/6/Start-Using-Bing-Webmaster-Tools-to-Improve-Your-Site-Visibility/ · https://blogs.bing.com/webmaster/2025/7/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search/ · https://www.bing.com/indexnow · https://www.indexnow.org/faq · https://developers.cloudflare.com/cache/advanced-configuration/crawler-hints/
Annuaires : https://alternativeto.net/faq/ · https://ideaproof.io/launch-directories/saashub · https://ideaproof.io/launch-directories/launching-next · https://buzzsonic.com/submit-music-industry-resource/ · https://the-music-industry-toolkit.super.site/about · https://contentcreators.com/submit · https://www.uneed.best/pricing · https://peerpush.com/for/musicians · https://docs.webcatalog.io/en/articles/14623074-how-to-get-your-app-listed-on-webcatalog · https://help.peerlist.io/individual/launchpad/how-to-launch-a-project-on-peerlist-launchpad · https://twelve.tools/submit · https://fazier.com/submit · https://help.producthunt.com/en/articles/479557-how-to-post-a-product · https://news.ycombinator.com/showhn.html · https://support.crunchbase.com/hc/en-us/articles/115011823988-How-do-I-create-a-Crunchbase-profile · https://github.com/ad-si/awesome-music-production · https://creatoreconomytools.com/creator-economy-startup-database
Écartés : https://betalist.com/faq · https://microlaunch.net/submit · https://openhunts.com/pricing · https://slant.co/help
