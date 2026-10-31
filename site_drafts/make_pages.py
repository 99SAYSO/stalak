# Marketing & croissance — 6 English use-case pages (drafts, NOT published).
# Run: python3 site_drafts/make_pages.py [--base ""|"/en"]   -> writes site_drafts/out/<slug>.html
# --base is where the English site lives: "" if English moves to the root (US_FIRST part A), "/en" otherwise.
# To publish (after the owner's decision): copy out/*.html into site_src/ (root) or site_src/en/, add them to
# SITEMAP_PAIRS-like list in build_site.py (English only, no French pair) and to the footer. No competitor is named.
import json, html as H, pathlib, sys
ROOT = pathlib.Path(__file__).parent
BASE = sys.argv[sys.argv.index('--base') + 1] if '--base' in sys.argv else ''
HOME = BASE + '/' if BASE else '/'
PRICING = BASE + '/pricing' if BASE else '/pricing'
TODAY = '2026-10-30'

COMMON_FAQ = [
  ('Is Stalak free?', 'Yes. Unlimited videos, no account. Free videos carry a small Stalak logo that moves to a new spot now and then; watch a ~30-second ad to remove it from that video, or go Pro ($7.99/mo or $49.99/yr) for no ads and no watermark.'),
  ('Is this an AI lip-sync tool?', 'No. Stalak never fakes your mouth. It edits your real takes: you perform the song, Stalak picks the cuts and keeps every take lined up with the audio.'),
  ('Do my videos get uploaded?', 'No. Editing happens in your browser, on your device. The only exceptions, if you use them: cloud projects (Creator Plus, saved automatically) and the audio sent for auto lyrics (Pro).'),
]

PAGES = [
 dict(slug='lip-sync-video-editor', crumb='Lip-sync video editor',
  title='Lip-Sync Video Editor That Cuts Your Takes to the Beat | Stalak',
  desc='Free lip-sync video editor for rappers and singers. Drop your song and a few takes; Stalak cuts between them on the beat, perfectly in sync. No app, no sign-up.',
  h1='A lip-sync video editor that does the cutting for you',
  lead='Stalak is a free lip-sync video editor that runs in your browser. Upload your song and a few videos of you performing it, and Stalak cuts between your takes on the beat, keeping your mouth in sync with the track. No download, no account, ready for TikTok, Reels and Shorts.',
  why=('Why it’s different', ['It edits your <strong>real takes</strong>. No AI face, no fake mouth.', 'Cuts land on the beat, on every word or every bar: you pick the rhythm.', 'Lyrics on screen, one line at a time for free, word-by-word or karaoke with Pro.', 'Everything runs on your device, so your footage stays yours.']),
  tips=('Tips for a clean lip-sync edit', ['Play the song out loud while you film, so every take follows the same audio.', 'Film 3 or 4 takes from different spots: close-up, wide, a different wall or light.', 'Start each take a couple of seconds before the part you want to post.']),
  faq=[('What is a lip-sync video editor?', 'An editor that keeps your performance lined up with the song while it cuts between shots. Stalak does the lining up and the cutting for you: you just bring the takes.')]),
 dict(slug='music-video-maker-for-rappers', crumb='Music video maker for rappers',
  title='Music Video Maker for Rappers: Cut Your Takes on the Beat | Stalak',
  desc='Make a rap video from a few phone takes. Stalak cuts on the beat, adds your lyrics and exports 9:16 for TikTok or a full 16:9 music video for YouTube. Free to start.',
  h1='A music video maker built by a rapper, for rappers',
  lead='Stalak turns a few phone takes into a rap video cut on the beat. Drop your song, add your takes, and export a vertical snippet for TikTok, Reels or Shorts, or the whole song as a 16:9 music video for YouTube with Stalak Pro. It runs in your browser, free to start.',
  why=('Made for how rappers actually post', ['Post the same song every day without re-editing: Creator Plus makes packs of 5 to 30 videos, each cut differently.', 'Full 16:9 music video mode with effects like flash, zoom, shake and slow-mo (Pro).', 'Auto lyrics: Stalak writes and syncs your bars from your vocals (Pro).', 'Built by 99Sayso, an independent rapper who coded Stalak for his own videos.']),
  tips=('Tips for a rap video from your phone', ['Shoot in a few locations with the same outfit: the cuts feel like a real video.', 'Keep your face well lit; the cuts look sharper when every take is clear.', 'For a full music video, film the whole song in each take.']),
  faq=[('Can I make a full music video, not just a snippet?', 'Yes. With Stalak Pro, the 16:9 Clip mode edits the whole song for YouTube, with effects.')]),
 dict(slug='rap-snippet-video', crumb='Rap snippet video',
  title='Make a Rap Snippet Video From Your Takes, Cut on the Beat | Stalak',
  desc='Got a snippet to tease? Drop the song and a few takes of you rapping it. Stalak cuts them on the beat with your lyrics on screen. Free, in your browser.',
  h1='Turn your takes into a snippet, cut on the beat',
  lead='A snippet is the 10 to 30 seconds you post before a song drops. With Stalak, you pick that part of your song, add a few takes of you rapping it, and get a snippet cut on the beat with your lyrics on screen. Free, in your browser, ready to post.',
  why=('Built for the rollout', ['Pick the exact part of the song to post, down to the bar.', 'Lyrics on screen so people catch the bars on mute.', 'Creator Plus packs: 5 to 30 different cuts of the same snippet, so you can post every day of your rollout.', 'Vertical 9:16, ready for TikTok, Reels and Shorts.']),
  tips=('Tips for a snippet people replay', ['Start on the hook or the hardest bar: the first 2 seconds decide everything.', 'Keep it short; 10 to 20 seconds is often enough.', 'Post a different cut every day instead of the same video twice.']),
  faq=[('How long should a rap snippet be?', 'There’s no rule, but short snippets that start on the strongest bar are easiest to replay. Stalak lets you pick any part of the song, down to the bar.')]),
 dict(slug='lip-sync-videos-for-singers', crumb='Performance videos for singers',
  title='Performance Videos for Singers: Multi-Take Edits on the Beat | Stalak',
  desc='Singer? Film a few takes of your song and Stalak edits them into a performance video cut on the beat, with lyrics on screen. Free, no app, no sign-up.',
  h1='Performance videos for singers, edited for you',
  lead='Stalak edits a few takes of you singing into one performance video. Upload your song and your takes; Stalak cuts between them on the beat or on the words, keeps every take in sync and adds your lyrics on screen. It works for covers and originals, free in your browser.',
  why=('What singers get', ['Cuts on every word or every bar, for slower songs that need longer shots.', 'Karaoke and word-by-word lyrics with Pro, so the words follow your voice.', 'Filters like 35mm Film, Frost and Black & White for free.', 'A full 16:9 video of the whole song for YouTube with Pro.']),
  tips=('Tips for a singing performance video', ['For ballads, choose cuts every bar instead of every beat.', 'Mix close-ups and wide shots so the emotion and the setting both show.', 'For covers, only post songs you’re allowed to use on the platform.']),
  faq=[('Does it work for slow songs?', 'Yes. Choose cuts every bar or on the words instead of every beat, and the edit breathes with the song.')]),
 dict(slug='how-to-make-a-lip-sync-video', crumb='How to make a lip-sync video',
  title='How to Make a Lip-Sync Video in 3 Steps (Free, No App) | Stalak',
  desc='How to make a lip-sync video for TikTok, Reels or Shorts: film a few takes, upload them with your song, and let Stalak cut them on the beat. Free guide.',
  h1='How to make a lip-sync video in 3 steps',
  lead='To make a lip-sync video, film a few takes of yourself performing the song, then line them up with the audio and cut between them on the beat. Stalak does the lining up and the cutting for you: upload the song, add your takes, export. It’s free and runs in your browser.',
  why=('The 3 steps', ['<strong>1. Upload your song</strong>, or the part you want to post.', '<strong>2. Add your takes</strong>: 2 or more videos of you performing it, filmed before or right in Stalak’s camera.', '<strong>3. Pick the cut rhythm</strong> (beats, words or bars), add lyrics if you want, and export for TikTok, Reels or Shorts.']),
  tips=('Filming tips', ['Play the song out loud while you film each take.', 'Film vertically for TikTok, Reels and Shorts.', 'Do at least 3 takes from different angles; more takes means more variety in the cuts.']),
  faq=[('How many takes do I need?', 'At least 2. Three or four takes from different angles give the best-looking cuts.'), ('Can I film right in the browser?', 'Yes. Stalak has a built-in camera, so you can film your takes right in the browser.')]),
 dict(slug='edit-video-to-the-beat', crumb='Edit video to the beat',
  title='Edit Multiple Takes to the Beat Automatically | Stalak',
  desc='Stop cutting frame by frame. Stalak finds the beat of your song and cuts between your takes automatically, on the beat, every word or every bar. Free.',
  h1='Edit multiple takes to the beat, automatically',
  lead='Stalak finds the beat of your song and cuts between your takes automatically. Choose cuts on every beat, on every word or every bar, and Stalak keeps each take in sync with the audio. No timeline to drag, no frame-by-frame editing. Free, right in your browser.',
  why=('What “automatic” means here', ['Stalak hears the beat and the words of your song and places the cuts for you.', 'Every take stays lined up with the audio, so the lip sync holds after each cut.', 'Don’t like the result? Pick another cut rhythm and get a new edit.', 'Creator Plus makes 5 to 30 different edits of the same song at once.']),
  tips=('Tips for beat-synced edits', ['Fast songs: cuts every beat or every bar both work; try both.', 'Use takes with different framing so each cut is easy to see.', 'Keep the same audio playing while filming every take.']),
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
<meta property="og:url" content="https://stalak.app{BASE}/{p["slug"]}"><meta property="og:image" content="https://stalak.app/og.png"><meta name="twitter:card" content="summary_large_image">
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
<!--DEMO--><video controls playsinline muted preload="metadata" src="/demo/exemple.mp4" aria-label="Example of a video edited with Stalak"></video><!--/DEMO-->
<h2>{p["why"][0]}</h2>
<{tag}>{li(p["why"][1])}</{tag}>
<h2>{p["tips"][0]}</h2>
<ul>{li(p["tips"][1])}</ul>
<h2>What’s free, what’s Pro</h2>
<ul>
<li><strong>Free</strong>: unlimited videos, auto cuts, lyrics one line at a time, 3 filters, 9:16 export. A small Stalak logo, or a ~30-second ad to remove it.</li>
<li><strong>Stalak Pro</strong> ($7.99/mo or $49.99/yr): no ads, no watermark, 16:9 music videos, karaoke and word-by-word lyrics, auto lyrics, all filters and premium effects.</li>
<li><strong>Creator Plus</strong> ($14.99/mo or $99.99/yr): everything in Pro, plus video packs, automatic cloud saving and a real person to talk to.</li>
</ul>
<p><a href="{PRICING}">See pricing</a></p>
<h2>FAQ</h2>
{"".join(f"<details><summary>{H.escape(q)}</summary><p>{H.escape(a)}</p></details>" for q, a in faq)}
<p class="founder">Stalak is made by 99Sayso, an independent rapper from the Alaska collective. He coded it to cut his own takes to the beat.</p>
<h2>More guides</h2>
<ul class="more">{others}</ul>
<p><a class="cta" href="{HOME}?ref=seo">Make your video now</a></p>
</main>
<footer><a href="{PRICING}">Pricing</a> · <a href="{BASE}/terms">Terms</a> · <a href="{BASE}/refunds">Refunds</a> · <a href="{BASE}/privacy">Privacy</a> · <a href="{BASE}/legal-notice">Legal notice</a></footer>
</body></html>
'''

out = ROOT / 'out'; out.mkdir(exist_ok=True)
for p in PAGES:
    (out / (p['slug'] + '.html')).write_text(page(p), encoding='utf-8')
print(len(PAGES), 'pages ->', out, '(base', repr(BASE) + ')')
