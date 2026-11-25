# Marketing & croissance (25/11/2026, point SEO/AEO du Chef de projet, docs/audit/seo-aeo-2026-11-25.md): the « percer » pages,
# in French (/fr/) and English (root). They answer the questions independent rappers ask Google and the AIs about blowing up,
# with a 40 to 60 word answer right under each title (what AIs quote), real sources, and our own numbers (our TikTok account,
# the public counter of videos made with Stalak). Stalak never promises to make anyone blow up: it says so on every page.
# Same look as the help pages (make_aide.py); the footer is the site's one (src/footer.py, list PERCER), put in by build_site.py.
# Run: python3 site_drafts/make_percer.py [--no-og]  -> site_src/<en slug>.html, site_src/fr/<fr slug>.html, site_src/og/<slug>.jpg
# Rules: no competitor named on the site (decision of 30/10), every number has its source, prices exactly as on /pricing.
import html as H, json, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'site_drafts')); sys.path.insert(0, str(ROOT / 'src'))
import make_aide as A
import footer as FOOT
TODAY = '2026-11-25'
AUTHOR = {'@type': 'Person', 'name': '99Sayso', 'url': 'https://stalak.app/', 'description': 'Independent rapper (Alaska collective), creator of Stalak'}

CSS = A.CSS + """
.byline{font-size:14px;color:#3f5170;margin:-6px 0 14px}
.ours{margin:28px -8px 0;padding:16px 18px;border:3px solid var(--ink);border-radius:22px;background:#fff8e1}
.ours h2{margin-top:0}
.src{font-size:14px}.src li{margin:3px 0}
.tl{list-style:none;padding:0;margin:12px 0}.tl li{border-left:4px solid var(--sky);padding:2px 0 8px 12px;margin:0}
.tl b{display:block}
@media (max-width:560px){.ours{margin:28px -6px 0;padding:14px}}"""

UI = {
 'en': dict(A.UI['en'], by='By 99Sayso, independent rapper and creator of Stalak · Updated {d}', sources='Sources', ours='Our own numbers',
            stalak='Where Stalak fits', cta='Make my snippet, free', more='Keep reading', date='November 25, 2026',
            promise='No app can promise you’ll blow up, Stalak included. It saves you the editing, so you can post more often.'),
 'fr': dict(A.UI['fr'], by='Par 99Sayso, rappeur indépendant et créateur de Stalak · Mis à jour le {d}', sources='Sources', ours='Nos propres chiffres',
            stalak='Ce que Stalak fait pour toi', cta='Monter mon snippet, gratuit', more='Pour aller plus loin', date='25 novembre 2026',
            promise='Aucune appli ne peut te promettre de percer, Stalak non plus. Elle t’enlève le montage, pour que tu postes plus souvent.'),
}

# the sources (read on 25/11/2026)
S = {
 'tt_reco': ('TikTok Newsroom, « How TikTok recommends videos #ForYou » (18/06/2020)', 'https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you'),
 'impact26': ('Music Business Worldwide, TikTok 2026 Music Impact Report by Luminate (18/11/2026)', 'https://www.musicbusinessworldwide.com/tiktok-says-94-of-songs-that-entered-the-billboard-global-200-in-2025-went-viral-on-its-platform-first/'),
 'tt4a': ('TikTok Newsroom, TikTok for Artists (03/06/2025)', 'https://newsroom.tiktok.com/tiktok-for-artists-launches?lang=en'),
 'spotify': ('Spotify for Artists, « Pitching music to playlist editors »', 'https://support.spotify.com/us/artists/article/pitching-music-to-playlist-editors/'),
 'prerelease': ('Interspace Music, « TikTok Pre-Release best practices »', 'https://interspacemusic.com/blog/tiktok-pre-release-best-practices/'),
 'wiki_mtr': ('Wikipedia, « Miss the Rage »', 'https://en.wikipedia.org/wiki/Miss_the_Rage'),
 'songfacts': ('Songfacts, « Miss The Rage » by Trippie Redd', 'https://www.songfacts.com/facts/trippie-redd/miss-the-rage'),
 'kym': ('Know Your Meme, « Mario Judah’s Miss The Rage »', 'https://knowyourmeme.com/memes/mario-judahs-miss-the-rage'),
 'rs': ('Rolling Stone, « Trippie Redd Teams Up With Playboi Carti for “Miss the Rage” » (07/05/2021)', 'https://www.rollingstone.com/music/music-news/trippie-redd-playboi-carti-new-song-miss-the-rage-1166426/'),
}

# our own numbers: @stalak_app on TikTok (docs/marketing/JOURNAL_DATA.md, branch marketing/bonne-idee-v2, read through Zernio
# on 24/11/2026) and the public counter of videos exported with Stalak (/api/stats/exports, 293 on 25/11/2026)
OURS = {
 'en': ('<p>From 19 to 23 November 2026 we posted 15 short videos on Stalak’s own TikTok account (@stalak_app), three a day. Every one of them landed between 604 and 860 views. People watched them for 6.7 to 17.1 seconds on average, and only 1 to 2% watched to the end.</p>'
        '<p>What we take from it: posting every day gets you a first audience, not more. TikTok stopped at that first group each time, because almost nobody watched to the end. So now we change one thing per video (the topic, the length, the kind of hook) and compare watch time before anything else.</p>'
        '<p class="small">Source: our TikTok statistics, read on 24/11/2026. Stalak’s account posts short animated stories, not songs: treat it as a real example of the first audience TikTok gives, not as a music benchmark. Also: 293 videos have been exported with Stalak since launch (public counter, 25/11/2026).</p>'),
 'fr': ('<p>Du 19 au 23 novembre 2026, on a posté 15 vidéos courtes sur le compte TikTok de Stalak (@stalak_app), trois par jour. Toutes ont fini entre 604 et 860 vues. Les gens les ont regardées 6,7 à 17,1 secondes en moyenne, et seulement 1 à 2 % jusqu’au bout.</p>'
        '<p>Ce qu’on en retient : poster tous les jours te donne un premier public, pas plus. TikTok s’est arrêté à ce premier groupe à chaque fois, parce que presque personne n’allait au bout. Maintenant, on change une seule chose par vidéo (le sujet, la durée, le type d’accroche) et on compare d’abord le temps de visionnage.</p>'
        '<p class="small">Source : nos statistiques TikTok, relevées le 24/11/2026. Le compte de Stalak poste de petites histoires animées, pas des sons : c’est un vrai exemple du premier public que TikTok donne, pas une référence pour la musique. Aussi : 293 vidéos ont été exportées avec Stalak depuis le lancement (compteur public, 25/11/2026).</p>'),
}

STALAK = {
 'en': ('Film your part once, in 3 or 4 takes with the song playing. Stalak lines every take up with the audio and cuts between them on the beat, with your lyrics on screen. Tap Shuffle for a new edit of the same takes: one session gives you a week of different snippets. With Creator Plus, the pack generator makes 5 to 30 differently cut videos at once.'),
 'fr': ('Filme ton passage une fois, en 3 ou 4 prises avec le son qui tourne. Stalak cale chaque prise sur le son et passe de l’une à l’autre sur le rythme, avec tes paroles à l’écran. Touche « Régénérer » pour un nouveau montage des mêmes prises : une séance te donne une semaine de snippets différents. Avec Creator Plus, le générateur de packs fait 5 à 30 vidéos montées différemment d’un coup.'),
}

PAGES = [
 dict(n=1, en_slug='how-to-blow-up-as-a-rapper', fr_slug='comment-percer-dans-le-rap', mascot='hype', rel=[2, 3, 4],
  src=['impact26', 'tt_reco', 'tt4a', 'spotify'],
  en=dict(
   title='How to Blow Up as a Rapper in 2026: What Actually Works | Stalak',
   desc='How independent rappers get noticed in 2026: short videos of the song, the first seconds, posting rhythm, and turning views into streams. With sources and our own numbers.',
   og=('How to blow up as a rapper', 'What works in 2026, with sources'), h1='How to blow up as a rapper in 2026', crumb='Blow up as a rapper',
   lead='In 2026, blowing up as a rapper mostly means being seen again and again with the same song. Nothing guarantees it, but the artists who break almost always have one part of a song that travels on TikTok, Reels or Shorts, posted often, with the song ready on streaming when people come looking.',
   sections=[
    ('Why does TikTok matter so much for breaking through?',
     'According to TikTok’s 2026 Music Impact Report, prepared by Luminate, 94% of the songs that entered the Billboard Global 200 in 2025 had gone viral on TikTok first. Viral songs stayed on that chart eight weeks on average, against two weeks for the others. TikTok commissioned the study, so read it as TikTok’s numbers.',
     None, None),
    ('Do you need a lot of followers to get seen?',
     'No. TikTok says the number of followers and an account’s past hits are not direct factors in what it recommends. What counts is what people do with each video: watching it to the end, liking, sharing, commenting. A new account can reach strangers from its very first video if people watch it.',
     None, None),
    ('What should a rapper post to blow up?',
     'Videos of you performing the strongest part of the song, starting on it from the first second. Hooks and quotable bars work better than intros. Put your lyrics on screen so people get the bars with the sound off, and post several different edits of the same part rather than one video per song.',
     ['Start on the hook or the hardest bar: no intro, no logo, no “new song out Friday” card first.',
      'Film a few takes in different spots so the edit can switch looks on the beat.',
      'Keep a few “story” videos around the song: where you wrote it, who it’s about, the take that went wrong.'], None),
    ('How often should you post?',
     'There is no magic number. A rhythm you can hold for weeks beats a big week followed by silence: several videos a week on the same song, each one a different edit or angle. The hard part is the editing time, so film once and cut many versions from the same session.',
     None, None),
    ('How do you turn views into streams?',
     'Have the song out, or ready, when the attention comes. Put the streaming link in your bio, pitch the song to Spotify at least 7 days before release so it reaches your followers’ Release Radar, and get a TikTok Artist Account: it unlocks TikTok for Artists, with song stats and pre-saves.',
     None, None),
   ],
   faq=[('Can Stalak make me blow up?', 'No, and no app can promise that. Stalak edits your takes on the beat for you, so making a new video of the same song takes minutes instead of an evening. That makes it easier to post often, which is the part you control.'),
        ('Is it too late to start on TikTok in 2026?', 'TikTok says follower count is not a direct factor in its recommendations, so a new account can still reach people. What matters is whether viewers watch your videos to the end.')]),
  fr=dict(
   title='Comment percer dans le rap en 2026 : ce qui marche vraiment | Stalak',
   desc='Comment les rappeurs indés se font remarquer en 2026 : vidéos courtes du son, premières secondes, rythme de publication, vues qui deviennent des écoutes. Sources et chiffres.',
   og=('Comment percer dans le rap', 'Ce qui marche en 2026, sources à l’appui'), h1='Comment percer dans le rap en 2026', crumb='Percer dans le rap',
   lead='En 2026, percer dans le rap, c’est surtout être vu encore et encore avec le même son. Rien ne le garantit, mais les artistes qui décollent ont presque toujours un passage qui tourne sur TikTok, Reels ou Shorts, posté souvent, avec le son prêt sur les plateformes quand les gens viennent le chercher.',
   sections=[
    ('Pourquoi TikTok compte autant pour percer ?',
     'D’après le rapport Music Impact 2026 de TikTok, préparé par Luminate, 94 % des sons entrés dans le Billboard Global 200 en 2025 étaient d’abord devenus viraux sur TikTok. Les sons viraux sont restés huit semaines en moyenne dans ce classement, contre deux pour les autres. L’étude est commandée par TikTok : ce sont ses chiffres.',
     None, None),
    ('Faut-il beaucoup d’abonnés pour être vu ?',
     'Non. TikTok explique que le nombre d’abonnés et les anciens succès d’un compte ne comptent pas directement dans ses recommandations. Ce qui compte, c’est ce que les gens font de chaque vidéo : la regarder jusqu’au bout, l’aimer, la partager, la commenter. Un compte qui démarre peut toucher des inconnus dès sa première vidéo.',
     None, None),
    ('Qu’est-ce qu’un rappeur doit poster pour percer ?',
     'Des vidéos de toi qui performes le passage le plus fort du son, dès la première seconde. Les refrains et les phases qu’on retient marchent mieux que les intros. Mets tes paroles à l’écran pour qu’on comprenne sans le son, et poste plusieurs montages du même passage plutôt qu’une vidéo par son.',
     ['Commence sur le refrain ou la phase la plus forte : pas d’intro, pas de logo, pas de carton « nouveau son vendredi » en premier.',
      'Filme quelques prises à des endroits différents, pour que le montage change de décor sur le rythme.',
      'Garde quelques vidéos « histoire » autour du son : où tu l’as écrit, pour qui, la prise ratée.'], None),
    ('À quel rythme poster ?',
     'Il n’y a pas de chiffre magique. Un rythme que tu tiens pendant des semaines vaut mieux qu’une grosse semaine suivie de silence : plusieurs vidéos par semaine sur le même son, chacune avec un montage ou un angle différent. Le plus dur, c’est le temps de montage : filme une fois et tire plusieurs versions de la même séance.',
     None, None),
    ('Comment transformer des vues en écoutes ?',
     'Aie le son en ligne, ou prêt, quand l’attention arrive. Mets le lien d’écoute dans ta bio, propose le son à Spotify au moins 7 jours avant la sortie pour qu’il arrive dans le Radar des sorties de tes abonnés, et passe en compte artiste TikTok : il ouvre TikTok for Artists, avec les stats du son et les pré-enregistrements.',
     None, None),
   ],
   faq=[('Stalak peut me faire percer ?', 'Non, et aucune appli ne peut le promettre. Stalak monte tes prises sur le rythme à ta place : refaire une vidéo du même son prend quelques minutes au lieu d’une soirée. Ça t’aide à poster souvent, et ça, c’est la partie que tu contrôles.'),
        ('C’est trop tard pour commencer TikTok en 2026 ?', 'TikTok dit que le nombre d’abonnés ne compte pas directement dans ses recommandations : un nouveau compte peut encore toucher du monde. Ce qui compte, c’est que les gens regardent tes vidéos jusqu’au bout.')])),

 dict(n=2, en_slug='how-to-make-a-song-go-viral-on-tiktok', fr_slug='faire-decoller-un-son-sur-tiktok', mascot='shock', rel=[1, 3, 4],
  src=['tt_reco', 'impact26', 'prerelease'],
  en=dict(
   title='How to Make Your Song Take Off on TikTok (2026) | Stalak',
   desc='How TikTok decides who sees your video, what to put in the first two seconds, which part of the song to use, and how to tell if it’s working. With sources and our own numbers.',
   og=('Make your song take off on TikTok', 'Hook, part of the song, watch time'), h1='How to make your song take off on TikTok', crumb='Song take off on TikTok',
   lead='To make a song take off on TikTok, post short videos built around its strongest part, and make people watch them to the end: that is the signal TikTok weighs most. Start on the hook, keep the lyrics on screen, post several edits of the same part, and judge each video by its watch time first.',
   sections=[
    ('How does TikTok decide who sees your video?',
     'TikTok ranks the For You feed with what people do: what they like, share, comment on and watch. It says finishing a longer video is a strong sign of interest, weighted more than weak signals, and that follower count is not a direct factor. Each video is first shown to a small group; their reactions decide what comes next.',
     None, None),
    ('What should be in the first two seconds?',
     'The song’s strongest moment and your face performing it. People decide almost instantly whether they stay, so skip intros, logos and silent openings. A line of text on screen that sets up the bar, a reaction or a question can help, as long as the music and the performance start at once.',
     ['Open on the hook, the drop or the bar people will quote.',
      'Show the lyrics on screen, so the bars land even with the sound off.',
      'Keep the first cut early: a change of shot in the first seconds holds attention.'], None),
    ('Which part of the song should you use?',
     'The part that makes people want to use it themselves: the chorus, the drop, a bar that works as a caption. Distributors that handle TikTok pre-releases advise picking a section that invites participation. Choose one part and stick to it for a while, so people hear the same moment again and again.',
     None, None),
    ('How many videos should you make with the same song?',
     'More than one, and not the same video twice. Post several different edits of the same part over days or weeks: other takes, other spots, faster or slower cuts, a story video, a reaction. Each new video gets its own first audience, and the one that keeps people watching shows you what to do next.',
     None, None),
    ('How do you know if it’s working?',
     'Look at average watch time and how much of the video people watch before views. Then likes, shares, saves and videos made with your sound. Change one thing at a time (the opening, the length, the part, the hour) so you know what made the difference. A gap of a few dozen views proves nothing.',
     None, None),
   ],
   faq=[('Should I delete videos that flop?', 'TikTok does not say that deleting helps. It is usually more useful to keep them, read their watch time, and change one thing in the next video.'),
        ('How long should a music video on TikTok be?', 'There is no fixed rule. Short snippets that start on the strongest bar are easiest to watch to the end; check the watch time of your own videos to find your length.')]),
  fr=dict(
   title='Comment faire décoller un son sur TikTok (2026) | Stalak',
   desc='Comment TikTok décide qui voit ta vidéo, quoi mettre dans les deux premières secondes, quel passage du son choisir et comment savoir si ça marche. Sources et chiffres.',
   og=('Faire décoller un son sur TikTok', 'Accroche, passage, temps de visionnage'), h1='Comment faire décoller un son sur TikTok', crumb='Faire décoller un son sur TikTok',
   lead='Pour faire décoller un son sur TikTok, poste des vidéos courtes sur son passage le plus fort, et fais en sorte qu’on les regarde jusqu’au bout : c’est le signal qui pèse le plus pour TikTok. Commence sur le refrain, garde les paroles à l’écran, poste plusieurs montages du même passage et juge chaque vidéo sur son temps de visionnage.',
   sections=[
    ('Comment TikTok décide qui voit ta vidéo ?',
     'TikTok classe le fil Pour toi avec ce que font les gens : ce qu’ils aiment, partagent, commentent et regardent. Il explique que regarder une vidéo jusqu’au bout est un fort signe d’intérêt, qui pèse plus que les petits signaux, et que le nombre d’abonnés ne compte pas directement. Chaque vidéo est d’abord montrée à un petit groupe.',
     None, None),
    ('Que mettre dans les deux premières secondes ?',
     'Le moment le plus fort du son et ton visage qui le performe. Les gens décident presque tout de suite s’ils restent : oublie les intros, les logos et les débuts silencieux. Une ligne de texte à l’écran qui annonce la phase, une réaction ou une question peut aider, tant que la musique et la perf démarrent aussitôt.',
     ['Ouvre sur le refrain, le drop ou la phase qu’on va citer.',
      'Affiche les paroles à l’écran, pour que les phases passent même sans le son.',
      'Coupe tôt : un changement de plan dans les premières secondes retient l’attention.'], None),
    ('Quel passage du son choisir ?',
     'Celui qui donne envie aux gens de l’utiliser eux-mêmes : le refrain, le drop, une phase qui marche comme légende. Les distributeurs qui gèrent les pré-sorties TikTok conseillent de choisir un passage qui invite à participer. Choisis-en un et garde-le un moment, pour qu’on entende le même moment encore et encore.',
     None, None),
    ('Combien de vidéos faire avec le même son ?',
     'Plus d’une, et jamais deux fois la même. Poste plusieurs montages différents du même passage sur des jours ou des semaines : d’autres prises, d’autres décors, des coupes plus rapides ou plus lentes, une vidéo histoire, une réaction. Chaque nouvelle vidéo a son propre premier public, et celle qui retient le mieux te montre la suite.',
     None, None),
    ('Comment savoir si ça marche ?',
     'Regarde le temps de visionnage moyen et la part de la vidéo regardée avant les vues. Ensuite les j’aime, partages, enregistrements et vidéos faites avec ton son. Change une seule chose à la fois (le début, la durée, le passage, l’heure) pour savoir ce qui a fait la différence. Quelques dizaines de vues d’écart ne prouvent rien.',
     None, None),
   ],
   faq=[('Faut-il supprimer les vidéos qui ne marchent pas ?', 'TikTok ne dit pas que supprimer aide. Il est souvent plus utile de les garder, de lire leur temps de visionnage, et de changer une seule chose dans la vidéo suivante.'),
        ('Quelle durée pour une vidéo de son sur TikTok ?', 'Il n’y a pas de règle fixe. Les snippets courts qui commencent sur la phase la plus forte se regardent plus facilement jusqu’au bout ; regarde le temps de visionnage de tes propres vidéos pour trouver ta durée.')])),

 dict(n=3, en_slug='how-many-snippets-before-a-release', fr_slug='combien-de-snippets-avant-une-sortie', mascot='think', rel=[2, 4, 1],
  src=['spotify', 'prerelease', 'tt4a', 'wiki_mtr'],
  en=dict(
   title='How Many Snippets to Post Before a Release? | Stalak',
   desc='How many snippets to post before a song drops, when to start teasing, which part to use and what to do if a snippet blows up early. A simple plan with sources.',
   og=('How many snippets before a release?', 'A simple plan for the weeks before'), h1='How many snippets should you post before a release?', crumb='Snippets before a release',
   lead='There is no official number. A plan that holds up: start teasing two to three weeks before the release and post a snippet every day or two, so 10 to 20 videos of the same part, each edited differently. Pitch the song to Spotify at least 7 days before release, and keep posting after it drops.',
   sections=[
    ('How many snippets should you post before a release?',
     'No platform gives a number. Our advice: 10 to 20 snippets of the same part over the two or three weeks before the drop, one every day or two. Fewer than that and most people never hear the part twice. Make each one a different edit, so it never looks like a repost.',
     None,
     '<table><thead><tr><th>When</th><th>What to post</th></tr></thead><tbody><tr><td>3 weeks before</td><td>The first snippet of the part, a story about the song</td></tr><tr><td>2 weeks before</td><td>A snippet every day or two, other takes and spots; pitch to Spotify by 7 days before</td></tr><tr><td>Last week</td><td>The best-performing edit again in new versions, the release date on screen</td></tr><tr><td>Release day</td><td>The song is out: the same part, with “out now” and the link in bio</td></tr><tr><td>After</td><td>Keep posting the part, fans’ videos and new angles while it still moves</td></tr></tbody><caption>Our suggested plan, not a platform rule.</caption></table>'),
    ('When should you start teasing a song?',
     'At least a week before, and usually two or three. Spotify only puts a song in your followers’ Release Radar if you pitch it at least 7 days before release day. TikTok pre-release clips are also advised at least a week ahead, up to two for an album, because a clip can take days to catch on.',
     None, None),
    ('Which part of the song should be the snippet?',
     'The part you want people to remember: usually the hook, sometimes the hardest bar. Keep it short, 10 to 30 seconds, and start right on it. Use the same part in every snippet, so that by release day people already know it and recognise it in the first second.',
     None, None),
    ('Can you post the same snippet several times?',
     'The same part, yes. The same video, no. Change the takes, the place, the cuts, the pace or the text on screen. Each new edit gets its own first audience, and comparing their watch time tells you which version to push on release day.',
     None, None),
    ('What if a snippet blows up before the release?',
     'Keep feeding it and get the song out as soon as you can, while people are asking for it. Trippie Redd teased “Miss the Rage” on Instagram in December 2020; fan edits spread on TikTok for months before the official release on 7 May 2021. The song then peaked at number 11 on the Billboard Hot 100.',
     None, None),
   ],
   faq=[('How long should a snippet be?', 'Usually 10 to 30 seconds, starting on the strongest bar. Short snippets are easier to watch to the end.'),
        ('Should I post the snippet on every platform?', 'Yes, the same edits work on TikTok, Instagram Reels and YouTube Shorts in vertical 9:16. Post the best-performing version everywhere.')]),
  fr=dict(
   title='Combien de snippets poster avant une sortie ? | Stalak',
   desc='Combien de snippets poster avant la sortie d’un son, quand commencer à teaser, quel passage choisir et quoi faire si un snippet décolle avant. Un plan simple, avec sources.',
   og=('Combien de snippets avant une sortie ?', 'Un plan simple pour les semaines d’avant'), h1='Combien de snippets poster avant une sortie ?', crumb='Snippets avant une sortie',
   lead='Il n’y a pas de nombre officiel. Un plan qui tient : commence à teaser deux à trois semaines avant la sortie et poste un snippet tous les jours ou tous les deux jours, soit 10 à 20 vidéos du même passage, chacune montée différemment. Propose le son à Spotify au moins 7 jours avant, et continue après la sortie.',
   sections=[
    ('Combien de snippets poster avant une sortie ?',
     'Aucune plateforme ne donne de chiffre. Notre conseil : 10 à 20 snippets du même passage sur les deux ou trois semaines avant la sortie, un tous les jours ou tous les deux jours. En dessous, la plupart des gens n’entendent jamais le passage deux fois. Monte chacun différemment, pour que ça ne fasse jamais repost.',
     None,
     '<table><thead><tr><th>Quand</th><th>Quoi poster</th></tr></thead><tbody><tr><td>3 semaines avant</td><td>Le premier snippet du passage, une histoire autour du son</td></tr><tr><td>2 semaines avant</td><td>Un snippet tous les un ou deux jours, d’autres prises et décors ; son proposé à Spotify au plus tard 7 jours avant</td></tr><tr><td>La dernière semaine</td><td>Le montage qui a le mieux marché, en nouvelles versions, la date de sortie à l’écran</td></tr><tr><td>Le jour J</td><td>Le son est sorti : le même passage, avec « dispo » et le lien en bio</td></tr><tr><td>Après</td><td>Continue le passage, les vidéos des fans et de nouveaux angles tant que ça bouge</td></tr></tbody><caption>Notre plan conseillé, pas une règle des plateformes.</caption></table>'),
    ('Quand commencer à teaser un son ?',
     'Au moins une semaine avant, et en général deux ou trois. Spotify ne met un son dans le Radar des sorties de tes abonnés que si tu le proposes au moins 7 jours avant la sortie. Pour les pré-sorties TikTok, on conseille aussi une semaine, deux pour un album : un extrait peut mettre des jours à prendre.',
     None, None),
    ('Quel passage du son mettre en snippet ?',
     'Celui dont tu veux qu’on se souvienne : souvent le refrain, parfois la phase la plus forte. Garde-le court, 10 à 30 secondes, et commence pile dessus. Utilise le même passage dans tous les snippets : le jour de la sortie, les gens le connaissent déjà et le reconnaissent dès la première seconde.',
     None, None),
    ('Peut-on poster le même snippet plusieurs fois ?',
     'Le même passage, oui. La même vidéo, non. Change les prises, le décor, les coupes, le rythme ou le texte à l’écran. Chaque nouveau montage a son propre premier public, et comparer leur temps de visionnage te dit quelle version pousser le jour de la sortie.',
     None, None),
    ('Et si un snippet décolle avant la sortie ?',
     'Nourris-le et sors le son dès que tu peux, tant qu’on le réclame. Trippie Redd a teasé « Miss the Rage » sur Instagram en décembre 2020 ; des montages de fans ont tourné sur TikTok des mois avant la sortie du 7 mai 2021. Le son a ensuite atteint la 11e place du Billboard Hot 100.',
     None, None),
   ],
   faq=[('Quelle durée pour un snippet ?', 'En général 10 à 30 secondes, en commençant sur la phase la plus forte. Les snippets courts se regardent plus facilement jusqu’au bout.'),
        ('Faut-il poster le snippet sur toutes les plateformes ?', 'Oui, les mêmes montages marchent sur TikTok, Instagram Reels et YouTube Shorts en vertical 9:16. Poste partout la version qui marche le mieux.')])),

 dict(n=4, en_slug='miss-the-rage-snippet-story', fr_slug='histoire-snippet-miss-the-rage', mascot='cool', rel=[3, 2, 1],
  src=['songfacts', 'wiki_mtr', 'kym', 'rs'],
  en=dict(
   title='The Story of the “Miss the Rage” Snippet | Stalak',
   desc='How Trippie Redd’s “Miss the Rage” spent five months as a snippet, how a TikTok fan edit brought Playboi Carti onto the song, and what independent rappers can learn from it.',
   og=('The “Miss the Rage” snippet', 'Five months of hype before the release'), h1='The story of the “Miss the Rage” snippet', crumb='The Miss the Rage snippet',
   lead='“Miss the Rage” lived as a snippet for almost five months before it came out. Trippie Redd teased it on Instagram on 21 December 2020; a TikTok fan edit with Playboi Carti’s vocals spread so far that Trippie invited Carti onto the song. Released on 7 May 2021, it peaked at number 11 on the Billboard Hot 100.',
   sections=[
    ('Where did the “Miss the Rage” snippet come from?',
     'Trippie Redd first teased the song on Instagram on 21 December 2020, at a time when concerts were stopped by the pandemic: the title is about missing the energy of a live crowd. The short preview built a lot of hype, and fans started using the beat and the intro in their own videos.',
     None, None),
    ('How did Playboi Carti end up on the song?',
     'As the intro caught on, fans layered Playboi Carti’s vocals from his unreleased song “Want To” over the beat, and that edit spread on TikTok. Its popularity led Trippie Redd to invite Carti onto the official track. The fans’ version of the song, in a way, decided the final feature.',
     None, None),
    ('What was the Mario Judah version?',
     'Another version of the song, by Mario Judah, leaked on YouTube by 27 March 2021. Some fans thought he would be on the official track; Trippie Redd denied it on Instagram Live. After the release, Judah’s version was re-uploaded and passed 1.9 million views in two months, and became a meme of its own.',
     None, None),
    ('When did the real song come out, and how did it do?',
     'The official “Miss the Rage” featuring Playboi Carti came out on 7 May 2021 as the lead single of Trippie Redd’s album “Trip at Knight”, produced by Loesoe. It peaked at number 11 on the Billboard Hot 100, his highest entry on that chart, and was certified Platinum in the United States.',
     None,
     '<ul class="tl"><li><b>21 December 2020</b>Trippie Redd teases the song on Instagram.</li><li><b>Early 2021</b>A fan edit with Playboi Carti’s vocals from “Want To” spreads on TikTok.</li><li><b>27 March 2021</b>Mario Judah’s version leaks on YouTube.</li><li><b>7 May 2021</b>The official song with Playboi Carti comes out.</li><li><b>27 May 2021</b>The music video comes out.</li><li><b>June 2021</b>“Miss the Rage” sounds spread across TikTok, with tens of thousands of videos.</li></ul>'),
    ('What can an independent rapper learn from it?',
     'A snippet can build demand for months if people keep hearing the same part. Watch what fans do with it, because their edits can tell you what the song needs. But keep it in proportion: Trippie Redd was already famous. For an independent artist, the lesson is to tease one part often, not to wait five months.',
     None, None),
   ],
   faq=[('Who produced “Miss the Rage”?', 'Loesoe produced the song, according to its credits on Wikipedia.'),
        ('Was “Miss the Rage” a TikTok song?', 'Partly. The snippet first circulated from Instagram, a TikTok fan edit brought Playboi Carti onto it, and after the release, sounds made from the song inspired a large TikTok trend in June 2021.')]),
  fr=dict(
   title='L’histoire du snippet de « Miss the Rage » | Stalak',
   desc='Comment « Miss the Rage » de Trippie Redd a vécu cinq mois en snippet, comment un montage de fan sur TikTok a fait venir Playboi Carti, et ce qu’un rappeur indé en retient.',
   og=('Le snippet de « Miss the Rage »', 'Cinq mois de hype avant la sortie'), h1='L’histoire du snippet de « Miss the Rage »', crumb='Le snippet de Miss the Rage',
   lead='« Miss the Rage » a vécu cinq mois en snippet. Trippie Redd l’a teasé sur Instagram le 21 décembre 2020 ; un montage de fan avec la voix de Playboi Carti a tant tourné sur TikTok que Trippie a invité Carti sur le son. Sorti le 7 mai 2021, il a atteint la 11e place du Billboard Hot 100.',
   sections=[
    ('D’où vient le snippet de « Miss the Rage » ?',
     'Trippie Redd a teasé le son pour la première fois sur Instagram le 21 décembre 2020, quand les concerts étaient arrêtés par la pandémie : le titre parle du manque de l’énergie d’une salle. Ce court extrait a créé beaucoup de hype, et les fans ont commencé à utiliser le beat et l’intro dans leurs propres vidéos.',
     None, None),
    ('Comment Playboi Carti s’est retrouvé sur le son ?',
     'Quand l’intro a pris, des fans ont posé la voix de Playboi Carti, tirée de son son inédit « Want To », sur le beat, et ce montage a tourné sur TikTok. Son succès a poussé Trippie Redd à inviter Carti sur le morceau officiel. D’une certaine façon, la version des fans a décidé du featuring final.',
     None, None),
    ('C’est quoi la version de Mario Judah ?',
     'Une autre version du son, par Mario Judah, a fuité sur YouTube au plus tard le 27 mars 2021. Des fans le croyaient sur le morceau officiel ; Trippie Redd l’a démenti en live sur Instagram. Remise en ligne après la sortie, la version de Judah a passé 1,9 million de vues en deux mois et est devenue un mème.',
     None, None),
    ('Quand est sorti le vrai son, et qu’est-ce qu’il a donné ?',
     'Le vrai « Miss the Rage » avec Playboi Carti est sorti le 7 mai 2021, premier single de l’album « Trip at Knight » de Trippie Redd, produit par Loesoe. Il a atteint la 11e place du Billboard Hot 100, sa meilleure place dans ce classement, et a été certifié platine aux États-Unis.',
     None,
     '<ul class="tl"><li><b>21 décembre 2020</b>Trippie Redd teste le son sur Instagram.</li><li><b>Début 2021</b>Un montage de fan avec la voix de Playboi Carti (« Want To ») tourne sur TikTok.</li><li><b>27 mars 2021</b>La version de Mario Judah fuite sur YouTube.</li><li><b>7 mai 2021</b>Le vrai son avec Playboi Carti sort.</li><li><b>27 mai 2021</b>Le clip sort.</li><li><b>Juin 2021</b>Des sons tirés de « Miss the Rage » se répandent sur TikTok, avec des dizaines de milliers de vidéos.</li></ul>'),
    ('Qu’est-ce qu’un rappeur indé peut en retenir ?',
     'Un snippet peut créer de l’attente pendant des mois si les gens entendent souvent le même passage. Regarde ce que les fans en font : leurs montages te disent ce qui manque au son. Mais Trippie Redd était déjà connu. Pour un artiste indé, la leçon, c’est de teaser souvent un passage, pas d’attendre cinq mois.',
     None, None),
   ],
   faq=[('Qui a produit « Miss the Rage » ?', 'Loesoe a produit le son, d’après ses crédits sur Wikipédia.'),
        ('« Miss the Rage », c’est un son TikTok ?', 'En partie. Le snippet est d’abord parti d’Instagram, un montage de fan sur TikTok a fait venir Playboi Carti, et après la sortie, des sons tirés du morceau ont lancé une grosse tendance TikTok en juin 2021.')])),
]


def words(s):
    return len(re.sub(r'<[^>]+>', ' ', s).split())


def page(p, lang):
    T, U = p[lang], UI[lang]
    path = ('/fr/' + p['fr_slug']) if lang == 'fr' else ('/' + p['en_slug'])
    en_url, fr_url = '{{URL}}/' + p['en_slug'], '{{URL}}/fr/' + p['fr_slug']
    url = '{{URL}}' + path
    slug = p['fr_slug'] if lang == 'fr' else p['en_slug']
    faq = T['faq']
    sources = [S[k] for k in p['src']]
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'Article', 'headline': T['h1'], 'name': T['title'], 'description': T['desc'], 'inLanguage': U['lang'], 'url': url,
         'mainEntityOfPage': url, 'datePublished': TODAY, 'dateModified': TODAY, 'author': AUTHOR,
         'publisher': {'@type': 'Organization', 'name': 'Stalak', 'url': '{{URL}}/', 'logo': {'@type': 'ImageObject', 'url': '{{URL}}/icons/icon-512.png'}},
         'image': 'https://stalak.app/og/' + slug + '.jpg', 'citation': [u for _, u in sources],
         'about': {'@type': 'SoftwareApplication', 'name': 'Stalak', 'applicationCategory': 'MultimediaApplication', 'operatingSystem': 'Web',
                   'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}}},
        {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Stalak', 'item': '{{URL}}' + U['home']},
                                                        {'@type': 'ListItem', 'position': 2, 'name': T['crumb'], 'item': url}]},
        {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]}]}
    li = lambda xs: ''.join(f'<li>{x}</li>' for x in xs)
    secs = ''
    for h2, answer, items, after in T['sections']:
        secs += (f'<h2>{H.escape(h2)}</h2>\n<p>{answer}</p>\n' + (f'<ul>{li(items)}</ul>\n' if items else '')
                 + ((f'<div class="tbl">{after}</div>\n' if after.startswith('<table') else after + '\n') if after else ''))
    plans_h2, plans, (plans_url, plans_txt) = A.PLANS[lang]
    by_n = {q['n']: q for q in PAGES}
    more = [('/' + ('fr/' + by_n[n]['fr_slug'] if lang == 'fr' else by_n[n]['en_slug']), by_n[n][lang]['crumb']) for n in p['rel']]
    more += ([('/fr/teaser-un-son', 'Teaser un son avant sa sortie'), ('/fr/promouvoir-sa-musique-sur-tiktok', 'Promouvoir sa musique sur TikTok')] if lang == 'fr'
             else [('/how-to-tease-a-song', 'How to tease a new song'), ('/promote-your-music-on-tiktok', 'Promote your music on TikTok')])
    src_html = ''.join(f'<li><a href="{H.escape(u)}" rel="noopener" target="_blank">{H.escape(n)}</a></li>' for n, u in sources)
    return f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{H.escape(T["title"])}</title>
<meta name="description" content="{H.escape(T["desc"])}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Stalak"><meta property="og:locale" content="{U["locale"]}"><meta property="og:locale:alternate" content="{UI["fr" if lang == "en" else "en"]["locale"]}">
<meta property="og:title" content="{H.escape(T["title"])}"><meta property="og:description" content="{H.escape(T["desc"])}">
<meta property="og:url" content="https://stalak.app{path}"><meta property="og:image" content="https://stalak.app/og/{slug}.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{H.escape(T["og"][0])}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://stalak.app/og/{slug}.jpg">
<meta property="article:published_time" content="{TODAY}"><meta property="article:modified_time" content="{TODAY}">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en" href="{en_url}">
<link rel="alternate" hreflang="fr" href="{fr_url}">
<link rel="alternate" hreflang="x-default" href="{en_url}">
<link rel="icon" href="/icons/icon-192.png"><link rel="stylesheet" href="/fonts/fonts.css">
<style>
{CSS}
</style>
<link rel="stylesheet" href="/site.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head><body>
<a class="back" href="{U["home"]}">{U["back"]}</a>
<main>
<article>
<h1>{H.escape(T["h1"])}</h1>
<p class="byline">{U["by"].format(d=U["date"])}</p>
<p class="lead">{T["lead"]}</p>
{secs}<section class="ours" aria-labelledby="ours-h"><h2 id="ours-h">{U["ours"]}</h2>
{OURS[lang]}
</section>
<section class="stalak" aria-labelledby="st-h"><h2 id="st-h">{U["stalak"]}</h2>
<p>{STALAK[lang]}</p>
<p>{U["promise"]}</p>
{U["demo"]}
<p><a class="cta" href="{U["home"]}?ref=seo-percer">{U["cta"]}</a></p>
<p class="small">{U["free_line"]}</p>
</section>
<h2>{H.escape(plans_h2)}</h2>
<ul>{li(plans)}</ul>
<p><a href="{plans_url}">{plans_txt}</a></p>
<h2>{U["faq"]}</h2>
{"".join(f"<details><summary>{H.escape(q)}</summary><p>{H.escape(a)}</p></details>" for q, a in faq)}
<h2>{U["sources"]}</h2>
<ul class="src">{src_html}</ul>
<p class="founder">{U["founder"]}</p>
<h2>{U["more"]}</h2>
<ul class="more">{"".join(f'<li><a href="{u}">{H.escape(n)}</a></li>' for u, n in more)}</ul>
</article>
</main>
<footer></footer>
</body></html>
'''


def check():
    """the answers AIs quote: the lead and the paragraph under each title, 40 to 60 words, in both languages"""
    bad = []
    for p in PAGES:
        for lang in ('en', 'fr'):
            T = p[lang]
            for name, txt in [('lead', T['lead'])] + [(h, a) for h, a, _, _ in T['sections']]:
                n = words(txt)
                if not 40 <= n <= 60: bad.append(f'{lang}/{p["n"]} « {name[:40]} »: {n} words')
            assert len(T['title']) <= 70, T['title']
            assert 110 <= len(T['desc']) <= 175, (lang, p['n'], len(T['desc']))
    assert not bad, 'answers not between 40 and 60 words:\n' + '\n'.join(bad)


def og_images():
    import make_og as O
    from playwright.sync_api import sync_playwright
    free = {'en': 'Free · in your browser · no sign-up', 'fr': 'Gratuit · dans ton navigateur · sans inscription'}
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=1)
        for p in PAGES:
            for lang in ('en', 'fr'):
                title, sub = p[lang]['og']
                html = O.PAGE.format(lilita=O.LILITA, rubik=O.RUBIK, flakes=O.flakes(), logo=O.LOGO, title=H.escape(title), sub=H.escape(sub),
                                     mascot=O.data(ROOT / 'site_src' / 'emoji' / (p['mascot'] + '.webp'), 'image/webp'), free=H.escape(free[lang]))
                pg.set_content(html, wait_until='load')
                pg.evaluate('document.fonts.ready.then(() => document.fonts.size)'); pg.wait_for_timeout(250)
                slug = p['fr_slug'] if lang == 'fr' else p['en_slug']
                pg.screenshot(path=str(ROOT / 'site_src' / 'og' / (slug + '.jpg')), type='jpeg', quality=86)
        b.close()


def main():
    check()
    assert [(a[0], a[1]) for a in FOOT.PERCER] == [(p['fr_slug'], p['en_slug']) for p in PAGES], 'src/footer.py PERCER and make_percer.py PAGES differ'
    for p in PAGES:
        (ROOT / 'site_src' / (p['en_slug'] + '.html')).write_text(page(p, 'en'), encoding='utf-8')
        (ROOT / 'site_src' / 'fr' / (p['fr_slug'] + '.html')).write_text(A.fr_typo(page(p, 'fr')), encoding='utf-8')
        print('wrote', p['en_slug'], '+ fr/' + p['fr_slug'])
    if '--no-og' not in sys.argv:
        og_images(); print('wrote the share pictures')


if __name__ == '__main__':
    main()
