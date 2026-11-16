# Marketing & croissance — 6 English use-case pages. Published on 01/11/2026 (owner's decision of 31/10), English at the root.
# Run: python3 site_drafts/make_pages.py [--base ""|"/en"]   -> writes site_drafts/out/<slug>.html
# --base is where the English site lives: "" if English moves to the root (US_FIRST part A), "/en" otherwise.
# To publish (after the owner's decision): copy out/*.html into site_src/ (root) or site_src/en/, add them to
# SITEMAP_PAIRS-like list in build_site.py (English only, no French pair) and to the footer. No competitor is named.
import json, html as H, pathlib, sys
ROOT = pathlib.Path(__file__).parent
BASE = sys.argv[sys.argv.index('--base') + 1] if '--base' in sys.argv else ''
HOME = BASE + '/' if BASE else '/'
PRICING = BASE + '/pricing' if BASE else '/pricing'
TODAY = '2026-11-06'   # 06/11: no more ads (owner's decision), new watermark (the mascot's face + stalak.app)
# 13/11 audit: 3 titles cut to 60 characters at most for Google (the pages' text is unchanged, so the date stays)

COMMON_FAQ = [
  ('Is Stalak free?', 'Yes. Unlimited videos, no account and no ads. Free videos carry a small watermark (our mascot’s face and stalak.app); go Pro ($7.99/mo or $49.99/yr) to export without it.'),
  ('Is this an AI lip-sync tool?', 'No. Stalak never fakes your mouth. It edits your real takes: you perform the song, Stalak picks the cuts and keeps every take lined up with the audio.'),
  ('Do my videos get uploaded?', 'No. Editing happens in your browser, on your device. The only exceptions, if you use them: cloud projects (Creator Plus, saved automatically) and the audio sent for auto lyrics (Pro).'),
]

PAGES = [
 dict(slug='lip-sync-video-editor', deep=('What Stalak does with your takes', ['Every take you add was filmed with your song playing, so its sound matches a spot in the track. Stalak listens to each take, finds that spot and lines the take up with your song. From then on, whichever take is on screen, your mouth follows the audio.', 'Then it plans the cuts. Stalak finds the beat and the bars of your song and picks where to switch takes. <strong>Auto</strong> follows the music phrase by phrase. <strong>On the words</strong> cuts at the start of each line and on the rhyme at the end of it, once your lyrics are synced. <strong>Every bar</strong> gives each bar to a different take, in turn. The <strong>Pace</strong> setting goes from Chill (long shots, few cuts) to Punchy (quick cuts, down to every beat).', 'You stay in charge of the edit. Tap <strong>Shuffle</strong> for a new one. If a shot is perfect, tap <strong>Keep this shot</strong> and it stays put while you shuffle the rest; <strong>Swap take</strong> puts another take in its place.', 'If the cuts ever feel off the beat, open “Cuts not on the beat?” under your song, tap <strong>TAP</strong> along with the music, starting on a strong beat, and apply. Stalak fine-tunes your taps on the song itself, then plays beeps so you can check.', 'When it looks right, export. The video is rendered on your device, in full quality from your original files, ready for TikTok, Reels and Shorts.']), crumb='Lip-sync video editor',
  title='Lip-Sync Video Editor: Your Takes, Cut to the Beat | Stalak',
  desc='Free lip-sync video editor for rappers and singers. Drop your song and a few takes; Stalak cuts between them on the beat, perfectly in sync. No app, no sign-up.',
  h1='A lip-sync video editor that does the cutting for you',
  lead='Stalak is a free lip-sync video editor that runs in your browser. Upload your song and a few videos of you performing it, and Stalak cuts between your takes on the beat, keeping your mouth in sync with the track. No download, no account, ready for TikTok, Reels and Shorts.',
  why=('Why it’s different', ['It edits your <strong>real takes</strong>. No AI face, no fake mouth.', 'Cuts land on the beat: phrase by phrase, on your lines and rhymes, or every bar. You pick.', 'Lyrics on screen, one line at a time for free, word-by-word or karaoke with Pro.', 'Everything runs on your device, so your footage stays yours.']),
  tips=('Tips for a clean lip-sync edit', ['Play the song out loud while you film, so every take follows the same audio.', 'Film 3 or 4 takes from different spots: close-up, wide, a different wall or light.', 'Start each take a couple of seconds before the part you want to post.']),
  faq=[('What is a lip-sync video editor?', 'An editor that keeps your performance lined up with the song while it cuts between shots. Stalak does the lining up and the cutting for you: you just bring the takes.')]),
 dict(slug='music-video-maker-for-rappers', deep=('Plan a shoot that cuts well', ['You don’t need a crew, but the edit can only be as good as the takes. Pick two or three places you can reach in one afternoon: your room, a stairwell, a rooftop, a parking lot at night. Keep the same outfit, so the cuts read as one video and not as a playlist.', 'In each place, film the whole part you’ll post, or the whole song for YouTube, with the track playing out loud from a speaker. Do one take close on your face and one wider, so the edit can switch between energy and setting. You don’t have to start the takes at the same moment: Stalak lines each one up with the audio by itself.', 'For TikTok, Reels and Shorts, keep the snippet short and vertical. For YouTube, Stalak Pro’s Music video mode edits the whole song in 16:9, and you can put effects on the cuts: flash, zoom, shake and slow-mo.', 'Once the edit is done, don’t stop at one video. With Creator Plus, the pack generator makes 5 to 30 videos from the same takes, each cut differently, so the song can show up in feeds all week without looking like a repost.', 'The demo above is the real thing: three takes by 99Sayso, in a garden, an attic and in front of mountains, edited by Stalak with one cut per bar.']), crumb='Music video maker for rappers',
  title='Music Video Maker for Rappers: Cut on the Beat | Stalak',
  desc='Make a rap video from a few phone takes. Stalak cuts on the beat, adds your lyrics and exports 9:16 for TikTok or a full 16:9 music video for YouTube. Free to start.',
  h1='A music video maker built by a rapper, for rappers',
  lead='Stalak turns a few phone takes into a rap video cut on the beat. Drop your song, add your takes, and export a vertical snippet for TikTok, Reels or Shorts, or the whole song as a 16:9 music video for YouTube with Stalak Pro. It runs in your browser, free to start.',
  why=('Made for how rappers actually post', ['Post the same song every day without re-editing: Creator Plus makes packs of 5 to 30 videos, each cut differently.', 'Full 16:9 music video mode with effects like flash, zoom, shake and slow-mo (Pro).', 'Auto lyrics: Stalak writes and syncs your bars from your vocals (Pro).', 'Built by 99Sayso, an independent rapper who coded Stalak for his own videos.']),
  tips=('Tips for a rap video from your phone', ['Shoot in a few locations with the same outfit: the cuts feel like a real video.', 'Keep your face well lit; the cuts look sharper when every take is clear.', 'For a full music video, film the whole song in each take.']),
  faq=[('Can I make a full music video, not just a snippet?', 'Yes. With Stalak Pro, the 16:9 Clip mode edits the whole song for YouTube, with effects.')]),
 dict(slug='rap-snippet-video', deep=('A week of snippets from one session', ['A rollout means posting the same song again and again until it sticks. Filming something new every day burns you out, so film once and edit many times.', 'Day one is the shoot: three or four takes of the snippet, in different spots, with the song playing out loud. In Stalak’s first step, pick the part to post, down to the bar. Start on the hook, or on the bar people will quote.', 'Then let Stalak make the first edit. Once your lyrics are synced, <strong>On the words</strong> cuts at the start of each line and on the rhyme, so the switches land on your punchlines. Keep the lyrics on screen too, so people catch the bars with the sound off.', 'For the next days, tap <strong>Shuffle</strong> for a new edit, or change the pace: Punchy for the hype days, Chill when the part is calmer. With Creator Plus, the pack generator does the whole week at once: 5 to 30 videos from the same takes, each cut differently.', 'Post one a day and watch which version people replay and share. When a kind of cut works, keep it for the release-day video.']), crumb='Rap snippet video',
  title='Rap Snippet Video: Your Takes, Cut on the Beat | Stalak',
  desc='Got a snippet to tease? Drop the song and a few takes of you rapping it. Stalak cuts them on the beat with your lyrics on screen. Free, in your browser.',
  h1='Turn your takes into a snippet, cut on the beat',
  lead='A snippet is the 10 to 30 seconds you post before a song drops. With Stalak, you pick that part of your song, add a few takes of you rapping it, and get a snippet cut on the beat with your lyrics on screen. Free, in your browser, ready to post.',
  why=('Built for the rollout', ['Pick the exact part of the song to post, down to the bar.', 'Lyrics on screen so people catch the bars on mute.', 'Creator Plus packs: 5 to 30 different cuts of the same snippet, so you can post every day of your rollout.', 'Vertical 9:16, ready for TikTok, Reels and Shorts.']),
  tips=('Tips for a snippet people replay', ['Start on the hook or the hardest bar: the first 2 seconds decide everything.', 'Keep it short; 10 to 20 seconds is often enough.', 'Post a different cut every day instead of the same video twice.']),
  faq=[('How long should a rap snippet be?', 'There’s no rule, but short snippets that start on the strongest bar are easiest to replay. Stalak lets you pick any part of the song, down to the bar.')]),
 dict(slug='lip-sync-videos-for-singers', deep=('Filming a performance that holds up', ['Singing shows everything: the breaths, the held notes, the line you push on purpose. A cut in the wrong spot can break that, so Stalak lets you choose how often it cuts.', 'For ballads and slower songs, pick <strong>Every bar</strong> or the <strong>Chill</strong> pace: the shots last longer and the edit breathes with the song. For an upbeat track, <strong>Auto</strong> with the Normal or Punchy pace keeps it moving. Once your lyrics are synced, <strong>On the words</strong> switches takes at the start of each line and on the rhyme, which often feels natural with singing.', 'Every take is lined up with the same audio, so your mouth stays on the words after each cut, held notes included. Sing along at full voice while you film: a quiet lip-sync shows on camera.', 'Mix your framings: a close-up for the lines that hurt, a wider shot that shows the room or the outfit. Light your face from the front (a window works) so every take stays clear.', 'With Stalak Pro, the lyrics can follow your voice word by word, or light up like karaoke, in any size. For a cover, check that you’re allowed to post the song on the platform.']), crumb='Performance videos for singers',
  title='Performance Videos for Singers: Multi-Take Edits | Stalak',
  desc='Singer? Film a few takes of your song and Stalak edits them into a performance video cut on the beat, with lyrics on screen. Free, no app, no sign-up.',
  h1='Performance videos for singers, edited for you',
  lead='Stalak edits a few takes of you singing into one performance video. Upload your song and your takes; Stalak cuts between them on the beat or on the words, keeps every take in sync and adds your lyrics on screen. It works for covers and originals, free in your browser.',
  why=('What singers get', ['Cuts on your lines and rhymes, or every bar, for slower songs that need longer shots.', 'Karaoke and word-by-word lyrics with Pro, so the words follow your voice.', 'Filters like 35mm Film, Frost and Black & White for free.', 'A full 16:9 video of the whole song for YouTube with Pro.']),
  tips=('Tips for a singing performance video', ['For ballads, pick “Every bar” or the Chill pace instead of quick cuts. To cut on the lines, sync your lyrics first.', 'Mix close-ups and wide shots so the emotion and the setting both show.', 'For covers, only post songs you’re allowed to use on the platform.']),
  faq=[('Does it work for slow songs?', 'Yes. Pick “Every bar” or the Chill pace for longer shots, and the edit breathes with the song.')]),
 dict(slug='how-to-make-a-lip-sync-video', deep=('Each step in detail', ['<strong>Your song.</strong> Stalak takes an MP3, WAV or M4A file, or a video, and uses its sound. Keep the whole song or just a few bars: drag the handles to set the start and the end.', '<strong>Your takes.</strong> Film each take with the song playing out loud, from the start of the part to the end. Two takes work; three or four look better, from different spots. If you film right in Stalak, the camera plays the song for you while you record.', '<strong>Your lyrics (optional).</strong> Paste one line per row, then sync them by tapping along with the song. Free shows them one line at a time; Stalak Pro adds word-by-word and karaoke styles, and can write and sync them for you.', '<strong>The edit.</strong> Stalak makes a first edit right away. Try <strong>Shuffle</strong>, change the pace, or tap <strong>Keep this shot</strong> on the shots you love. If the cuts feel off, open “Cuts not on the beat?” and tap the tempo.', '<strong>The export.</strong> Hit Export: the video is rendered on your device, in full quality from your original files. A longer video takes longer: a whole music video takes a few minutes.']), crumb='How to make a lip-sync video',
  title='How to Make a Lip-Sync Video in 4 Steps (Free) | Stalak',
  desc='How to make a lip-sync video for TikTok, Reels or Shorts: upload your song, add a few takes and lyrics, and let Stalak cut them on the beat. Free guide.',
  h1='How to make a lip-sync video in 4 steps',
  lead='To make a lip-sync video, film a few takes of yourself performing the song, then line them up with the audio and cut between them on the beat. Stalak does the lining up and the cutting for you: upload the song, add your takes, export. It’s free and runs in your browser.',
  why=('The 4 steps', ['<strong>1. Upload your song</strong>, or the part you want to post.', '<strong>2. Add your takes</strong>: 2 or more videos of you performing it, filmed before or right in Stalak’s camera.', '<strong>3. Add your lyrics</strong> if you want: paste them and sync them by tapping, or let Stalak write them (Pro).', '<strong>4. Pick how it cuts</strong> (Auto, On the words or Every bar) and export for TikTok, Reels or Shorts.']),
  tips=('Filming tips', ['Play the song out loud while you film each take.', 'Film vertically for TikTok, Reels and Shorts.', 'Do at least 3 takes from different angles; more takes means more variety in the cuts.']),
  faq=[('How many takes do I need?', 'At least 2. Three or four takes from different angles give the best-looking cuts.'), ('Can I film right in the browser?', 'Yes. Stalak has a built-in camera, so you can film your takes right in the browser.')]),
 dict(slug='edit-video-to-the-beat', deep=('How Stalak finds the beat', ['When you import a song, Stalak listens for its pulse: the kicks, the snares, the accents that come back. From them it works out the tempo, in beats per minute, and where each bar starts. Every cut snaps to that grid.', 'Most songs are read right away. Some throw it off: a long intro with no drums, a beat that switches halfway, a half-time feel. If the cuts don’t land, open “Cuts not on the beat?” under the song, tap <strong>TAP</strong> on every beat for a few bars, starting on a strong one, and apply. Stalak fine-tunes your taps on the song itself, then plays beeps over the music so you can check.', 'With the grid right, the cut mode decides where the takes change. <strong>Auto</strong> follows the music phrase by phrase. <strong>On the words</strong> cuts at line starts and rhymes, always on a beat, once your lyrics are synced. <strong>Every bar</strong> switches takes every bar, in turn. The pace stretches or tightens the shots, from Chill to Punchy.', 'Wherever a cut lands, each take stays lined up with the audio, so the lip sync holds from the first shot to the last.']), crumb='Edit video to the beat',
  title='Edit Multiple Takes to the Beat Automatically | Stalak',
  desc='Stop cutting frame by frame. Stalak finds the beat of your song and cuts between your takes automatically, on the beat, on your lines or every bar. Free.',
  h1='Edit multiple takes to the beat, automatically',
  lead='Stalak finds the beat of your song and cuts between your takes automatically. Let the cuts follow the music phrase by phrase, land on your lines and rhymes, or switch takes every bar; Stalak keeps each take in sync with the audio. No timeline to drag, no frame-by-frame editing. Free, right in your browser.',
  why=('What “automatic” means here', ['Stalak finds the beat of your song and places the cuts for you. To cut on the words, sync your lyrics first: tap along, or let auto lyrics do it (Pro).', 'Every take stays lined up with the audio, so the lip sync holds after each cut.', 'Don’t like the result? Pick another cut rhythm and get a new edit.', 'Creator Plus makes 5 to 30 different edits of the same song at once.']),
  tips=('Tips for beat-synced edits', ['Fast songs: try the Punchy pace (quick cuts, down to every beat) and “Every bar”; keep the one you like.', 'Use takes with different framing so each cut is easy to see.', 'Keep the same audio playing while filming every take.']),
  faq=[('Do I need editing software?', 'No. Everything happens in your browser on iPhone, Android or desktop. There’s nothing to install.')]),
]

CSS = """:root{--sky:#1f6fd6;--ink:#0a0d14;--frost:#eef7ff}
body{margin:0;background:var(--sky);color:var(--ink);font:400 16px/1.6 Rubik,system-ui,sans-serif;padding:24px 16px 60px}
main{max-width:820px;margin:0 auto;background:#fff;border:3px solid var(--ink);border-radius:24px;box-shadow:0 6px 0 var(--ink);padding:28px 24px}
h1{font:400 clamp(28px,6vw,38px)/1.1 'Lilita One',system-ui,sans-serif;margin:0 0 14px} h2{font-size:21px;line-height:1.25;margin:28px 0 8px}
a{color:#1a64c8} .back{display:inline-block;margin-bottom:16px;color:#fff;font-weight:600}
.lead{font-size:17px} ul li,ol li{margin:4px 0}
details{border:2px solid var(--ink);border-radius:14px;padding:10px 14px;margin:10px 0;background:var(--frost)} summary{font-weight:700;cursor:pointer}
.cta{display:inline-block;margin-top:10px;background:var(--ink);color:#fff!important;text-decoration:none;font-weight:700;border-radius:14px;padding:12px 18px}
.founder{background:var(--frost);border-radius:14px;padding:12px 14px;margin-top:22px;font-size:15px}
video{width:100%;max-width:340px;display:block;margin:12px auto;border:3px solid var(--ink);border-radius:18px;background:#000}
.ba{margin:18px 0 8px;padding:14px;border:2px solid var(--ink);border-radius:18px;background:var(--frost)}
.ba-row{display:flex;align-items:center;justify-content:center;gap:14px}.ba-before{flex:1 1 0;min-width:0;max-width:430px}
.ba-before img{display:block;width:100%;height:auto;border:2px solid var(--ink);border-radius:12px}.ba-after{flex:none}
.ba video{width:150px;height:auto;max-width:none;margin:0;border-width:2px;border-radius:14px}
.ba-l{margin:6px 0 0;text-align:center;font-weight:700;font-size:14px}.ba-arrow{flex:none;font:400 30px/1 'Lilita One',system-ui,sans-serif}
.ba figcaption{margin-top:10px;text-align:center;font-size:14px}
@media (max-width:560px){.ba-row{flex-direction:column;gap:8px}.ba-before{max-width:none;width:100%}.ba-arrow{transform:rotate(90deg)}.ba video{width:180px}}
.more{font-size:15px} footer{max-width:820px;margin:18px auto 0;color:#fff;font-size:13px;text-align:center}footer a{color:#fff}"""

def page(p):
    url = '{{URL}}' + BASE + '/' + p['slug']
    faq = p['faq'] + COMMON_FAQ
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebPage', 'name': p['title'], 'description': p['desc'], 'inLanguage': 'en-US', 'url': url, 'dateModified': TODAY,
         'about': {'@type': 'SoftwareApplication', 'name': 'Stalak', 'applicationCategory': 'MultimediaApplication', 'operatingSystem': 'Web',
                   'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}}},
        {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Stalak', 'item': '{{URL}}' + HOME},
                                                        {'@type': 'ListItem', 'position': 2, 'name': p['crumb'], 'item': url}]},
        {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]}]}
    if p['slug'] == 'how-to-make-a-lip-sync-video':
        ld['@graph'].append({'@type': 'HowTo', 'name': p['h1'], 'step': [{'@type': 'HowToStep', 'position': i + 1, 'text': H.unescape(s.replace('<strong>', '').replace('</strong>', ''))} for i, s in enumerate(p['why'][1])]})
    others = ''.join(f'<li><a href="{BASE}/{o["slug"]}">{o["crumb"]}</a></li>' for o in PAGES if o is not p)
    li = lambda xs: ''.join(f'<li>{x}</li>' for x in xs)
    tag = 'ol' if p['slug'] == 'how-to-make-a-lip-sync-video' else 'ul'
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{H.escape(p["title"])}</title>
<meta name="description" content="{H.escape(p["desc"])}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Stalak"><meta property="og:locale" content="en_US">
<meta property="og:title" content="{H.escape(p["title"])}"><meta property="og:description" content="{H.escape(p["desc"])}">
<meta property="og:url" content="https://stalak.app{BASE}/{p["slug"]}"><meta property="og:image" content="https://stalak.app/og/{p["slug"]}.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{H.escape(p["crumb"])} with Stalak"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://stalak.app/og/{p["slug"]}.jpg">
<link rel="canonical" href="{url}">
<link rel="icon" href="/icons/icon-192.png"><link rel="stylesheet" href="/fonts/fonts.css">
<style>
{CSS}
</style>
<link rel="stylesheet" href="/site.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head><body>
<a class="back" href="{HOME}">← Back to Stalak</a>
<main>
<h1>{p["h1"]}</h1>
<p class="lead">{p["lead"]}</p>
<p><a class="cta" href="{HOME}?ref=seo">Start free, no sign-up</a></p>
<!--DEMO--><figure class="ba"><div class="ba-row"><div class="ba-before"><img src="/demo/takes.jpg" width="884" height="512" loading="lazy" alt="Three takes of the same song by 99Sayso, filmed in front of mountains, in an attic and in a garden"><p class="ba-l">Before: 3 takes</p></div><div class="ba-arrow" aria-hidden="true">→</div><div class="ba-after"><video src="/demo/edit.mp4" poster="/demo/edit.jpg" width="432" height="768" controls muted loop playsinline preload="none" aria-label="After: the video Stalak edited from these three takes, cut on the beat"></video><p class="ba-l">After: Stalak’s edit</p></div></div><figcaption>Real takes by 99Sayso, edited by Stalak: one cut per bar, the lip sync locked. Play it with the sound on.</figcaption></figure><!--/DEMO-->
<h2>{p["why"][0]}</h2>
<{tag}>{li(p["why"][1])}</{tag}>
<h2>{p["deep"][0]}</h2>
{"".join(f"<p>{x}</p>" for x in p["deep"][1])}
<h2>{p["tips"][0]}</h2>
<ul>{li(p["tips"][1])}</ul>
<h2>What’s free, what’s Pro</h2>
<ul>
<li><strong>Free</strong>: unlimited videos, auto cuts, lyrics one line at a time, 3 filters, 9:16 export, no ads. A small watermark (our mascot and stalak.app) on every video.</li>
<li><strong>Stalak Pro</strong> ($7.99/mo or $49.99/yr): no watermark, 16:9 music videos, karaoke and word-by-word lyrics, auto lyrics, all filters and premium effects.</li>
<li><strong>Creator Plus</strong> ($14.99/mo or $99.99/yr): everything in Pro, plus video packs, automatic cloud saving (100 GB) and “Talk to a human”.</li>
</ul>
<p><a href="{PRICING}">See pricing</a></p>
<h2>FAQ</h2>
{"".join(f"<details><summary>{H.escape(q)}</summary><p>{H.escape(a)}</p></details>" for q, a in faq)}
<p class="founder">Stalak is made by 99Sayso, an independent rapper from the Alaska collective. He coded it to cut his own takes to the beat.</p>
<h2>More guides</h2>
<ul class="more">{others}</ul>
<p><a class="cta" href="{HOME}?ref=seo">Make your video now</a></p>
</main>
<footer><a href="{PRICING}">Pricing</a> · <a href="{BASE}/terms">Terms</a> · <a href="{BASE}/refunds">Refunds</a> · <a href="{BASE}/privacy">Privacy</a> · <a href="{BASE}/legal-notice">Legal notice</a> · <a href="{BASE}/privacy#cookies">Cookie settings</a> · <a href="{BASE}/privacy#choices">Your Privacy Choices</a></footer>
</body></html>
'''

out = ROOT / 'out'; out.mkdir(exist_ok=True)
for p in PAGES:
    (out / (p['slug'] + '.html')).write_text(page(p), encoding='utf-8')
print(len(PAGES), 'pages ->', out, '(base', repr(BASE) + ')')
