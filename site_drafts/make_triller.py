# Marketing & croissance — writes site_src/triller-alternative.html (EN) and site_src/fr/alternative-triller.html (FR).
# Run: python3 site_drafts/make_triller.py   (then python3 build_site.py …). Re-check every Triller fact and its date before a change.
# Owner's decision of 31/10 (option B): ONE neutral, true comparison page with Triller, in English and French, linked from
# nowhere else on the site (no link from the home page, the pricing page or the app). Facts about Triller are dated and sourced.
import json, html as H, pathlib, sys
REPO = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent
DATE = '2026-11-01'       # first published
MODIFIED = '2026-11-06'   # 06/11: no more ads (owner's decision), new watermark (the mascot's face + stalak.app)

SOURCES = {
 'en': [
  ('https://www.globenewswire.com/news-release/2026/06/29/3319212/0/en/triller-group-inc-responses-to-shareholder-questions-following-the-annual-meeting-held-on-june-10-2026.html',
   'Triller Group, “Responses to Shareholder Questions Following the Annual Meeting held on June 10, 2026”, GlobeNewswire, June 29, 2026', 'the legacy app was shut down; “the strategy is not to recreate old Triller”; planned new name: Eight Holdings'),
  ('https://www.sec.gov/Archives/edgar/data/1769624/000121390026067678/ea029444502ex99-2.htm',
   'Triller Group, shareholder update presentation, annual general meeting, June 2026 (SEC filing, exhibit 99.2)', '“Legacy app shut down”; no revenue from social media in 2025'),
  ('https://www.digitalmusicnews.com/2026/07/15/merlin-triller-lawsuit-default-judgment/',
   'Digital Music News, “Merlin Scores $3.2 Million Default Judgment Against Triller”, July 15, 2026', 'Triller shut down its video-sharing app earlier in 2026'),
  ('https://www.androidpolice.com/2015/12/19/hands-on-popular-lip-sync-music-video-app-triller-comes-to-google-play-its-actually-incredibly-fun-to-play-with/',
   'Android Police, hands-on with Triller on Google Play, December 19, 2015', 'how the app worked: a song, several takes, an automatic edit; free'),
  ('https://en.wikipedia.org/wiki/Triller_(app)', 'Wikipedia, “Triller (app)”', 'launch in 2015, the multi-take editing, the app’s history'),
 ],
}
SOURCES['fr'] = [(u, t, {
  0: 'l’ancienne appli a été arrêtée ; « the strategy is not to recreate old Triller » ; nouveau nom prévu : Eight Holdings',
  1: '« Legacy app shut down » ; aucun revenu des réseaux sociaux en 2025',
  2: 'Triller a fermé son appli de partage de vidéos plus tôt en 2026',
  3: 'le fonctionnement de l’appli : un son, plusieurs prises, un montage automatique ; gratuite',
  4: 'la sortie en 2015, le montage multi-prises, l’histoire de l’appli'}[i]) for i, (u, t, _) in enumerate(SOURCES['en'])]

T = {
 'en': dict(
  path='/triller-alternative', other='/fr/alternative-triller', home='/', pricing='/pricing', locale='en_US', lang='en',
  title='Triller Alternative: Lip-Sync Takes Cut on the Beat | Stalak',
  desc='Triller’s parent company says it shut down the original app. Stalak still cuts several takes of your song on the beat, in your browser. Free.',
  crumb='Triller alternative', back='← Back to Stalak',
  h1='Triller alternative: cut your lip-sync takes on the beat',
  updated='Updated November 6, 2026 · Written by the team that makes Stalak. Every fact about Triller on this page comes from a source listed at the bottom.',
  lead='Triller’s parent company says it shut down the original Triller app and doesn’t plan to bring it back as it was. If you used Triller to turn a few takes of a song into one video cut to the music, Stalak does that job in your browser: upload your song, add your takes, and it cuts between them on the beat. It’s free, and there’s nothing to install.',
  cta1='Make my video, free', cta2='Start now, no sign-up',
  s_what='What happened to Triller?',
  what=['Triller launched in 2015 as a music video app. You picked a song, filmed yourself performing part of it a few times, and the app edited your takes into one clip timed to the music. You could then swap a shot for another take before sharing. Over the years, Triller grew into a social network and a media company.',
        'In its June 2026 answers to shareholder questions, Triller Group said the legacy app had been shut down because it didn’t work economically. It added that “the strategy is not to recreate old Triller” (the company also plans to rename itself Eight Holdings). In July 2026, Digital Music News reported that Triller shut down its video-sharing app earlier in the year.',
        'So if Triller was how you edited your videos, you need another tool for that part.'],
  s_table='Stalak vs Triller at a glance',
  table_note='The Triller column describes the app as Android Police reviewed it in 2015 and as its parent company described it in 2026. Stalak’s prices and features are those of November 6, 2026.',
  cols=('', 'Triller', 'Stalak'),
  rows=[('Edits several takes of one song for you', 'Yes, it was its signature feature', 'Yes: cuts on the beat, phrase by phrase, on your lines or every bar'),
        ('Where it runs', 'iPhone and Android app', 'In the browser, on iPhone, Android or computer'),
        ('The song', 'Featured tracks, or music from your phone (2015)', 'Your own file: MP3, WAV, M4A, or the sound of a video'),
        ('Social feed', 'Yes, it was a social video app', 'No: you post your video on TikTok, Instagram or YouTube'),
        ('Price', 'Free (2015)', 'Free, with a small watermark; Pro $7.99/mo or $49.99/yr'),
        ('Status in November 2026', 'Original app shut down, according to its parent company', 'Online')],
  s_adds='What Stalak adds',
  adds=['Lyrics on screen: one line at a time for free; word-by-word and karaoke with Stalak Pro; lyrics written and synced from your vocals (Pro).',
        'You pick how it cuts: with the music, phrase by phrase (from Chill to Punchy), on your lines and rhymes (once your lyrics are synced), or every bar.',
        'A full 16:9 music video of the whole song for YouTube, with effects like flash, zoom, shake and slow-mo (Pro).',
        'Packs of 5 to 30 differently cut videos from one song, from just 2 takes (Creator Plus).',
        'Editing happens on your device, so your videos stay with you. The only exceptions: cloud projects (Creator Plus) and the audio sent for auto lyrics.',
        'English and French.'],
  s_not='What Stalak doesn’t do',
  nots=['It isn’t a social network: no feed, no followers. You post where your audience already is.',
        'There’s no song catalog: you bring your own track. For a cover, only post songs you’re allowed to use.',
        'There’s no app to download: Stalak runs in the browser, and you can add it to your home screen.',
        'Free videos carry a small watermark (our mascot and stalak.app). To export without it, go Pro.'],
  s_who='Is Stalak the right fit?',
  who=['<strong>Yes</strong>, if you made Triller videos of your own songs and want the same multi-take edit for TikTok, Reels or Shorts, with your lyrics on screen.',
       '<strong>Probably not</strong>, if you mainly want an app to scroll and share videos with a community, or a library of licensed songs to lip-sync to.'],
  s_how='How to make a Triller-style video with Stalak',
  how=['Import your song (MP3, WAV, M4A, or a video’s sound) and pick the part you want to post.',
       'Add 2 or more takes of you performing it: videos filmed with the song playing out loud, or filmed right in Stalak.',
       'Pick how it cuts (Auto, On the words or Every bar), add your lyrics if you want, and export for TikTok, Reels or Shorts.'],
  s_faq='FAQ',
  faq=[('Is Triller still working?', 'Triller Group, Triller’s parent company, said in June 2026 that the legacy Triller app had been shut down, and that it doesn’t plan to recreate it as it was. For the latest, check the app store on your phone.'),
       ('What app does what Triller did?', 'Triller’s signature feature was turning several takes of one song into one video cut to the music. Stalak does that in your browser: upload the song, add your takes, and it cuts between them on the beat, on your lines or every bar, with your lyrics on screen if you want.'),
       ('Is Stalak free?', 'Yes, with no account and no ads: unlimited videos, lyrics one line at a time, 3 filters and 9:16 export. Free videos carry a small watermark (our mascot’s face and stalak.app). Stalak Pro ($7.99/mo or $49.99/yr) removes it, and adds 16:9 music videos, karaoke lyrics, every filter and auto lyrics. Creator Plus ($14.99/mo or $99.99/yr) adds video packs, automatic cloud saving (100 GB) and “Talk to a human”.'),
       ('Do I need to download an app?', 'No. Stalak runs in the browser on iPhone, Android or computer, at stalak.app. Editing and export happen on your device.'),
       ('Is Stalak related to Triller?', 'No. Stalak is an independent tool made by 99Sayso, a rapper from the Alaska collective. It isn’t affiliated with Triller or Triller Group.')],
  founder='Stalak is made by 99Sayso, an independent rapper from the Alaska collective. He coded it to cut his own takes to the beat.',
  s_src='Sources', src_note='Checked on November 1, 2026.',
  tm='Triller is a trademark of its owner. Stalak is an independent product, not affiliated with, endorsed or sponsored by Triller.',
  lang_link=('Version française', 'fr'),
  footer=[('/pricing', 'Pricing'), ('/terms', 'Terms'), ('/refunds', 'Refunds'), ('/privacy', 'Privacy'), ('/legal-notice', 'Legal notice'), ('/privacy#cookies', 'Cookie settings'), ('/privacy#choices', 'Your Privacy Choices')],
 ),
 'fr': dict(
  path='/fr/alternative-triller', other='/triller-alternative', home='/fr/', pricing='/fr/tarifs', locale='fr_FR', lang='fr',
  title='Alternative à Triller : ton playback sur le rythme | Stalak',
  desc='La société mère de Triller dit avoir arrêté l’appli d’origine. Stalak coupe toujours tes prises sur le rythme, dans ton navigateur. Gratuit.',
  crumb='Alternative à Triller', back='← Retour à Stalak',
  h1='Alternative à Triller : tes prises de playback montées sur le rythme',
  updated='Mis à jour le 6 novembre 2026 · Écrit par l’équipe qui fait Stalak. Chaque information sur Triller vient d’une source citée en bas de page.',
  lead='La société mère de Triller dit avoir arrêté l’appli Triller d’origine, et ne pas vouloir la refaire telle qu’elle était. Si tu utilisais Triller pour transformer quelques prises d’un son en une vidéo montée sur la musique, Stalak fait ce travail dans ton navigateur : tu importes ton son, tu ajoutes tes prises, et il coupe de l’une à l’autre sur le rythme. C’est gratuit, sans rien à installer.',
  cta1='Monter ma vidéo gratuitement', cta2='Commencer, sans inscription',
  s_what='Que s’est-il passé avec Triller ?',
  what=['Triller est sortie en 2015 : c’était une appli de clips musicaux. Tu choisissais un son, tu te filmais plusieurs fois sur un passage, et l’appli montait tes prises en une seule vidéo calée sur la musique. Tu pouvais ensuite remplacer un plan par une autre prise avant de partager. Avec les années, Triller est devenue un réseau social et une entreprise de médias.',
        'Dans ses réponses aux questions des actionnaires (juin 2026), Triller Group explique avoir arrêté l’ancienne appli, faute de modèle économique viable. Il précise que sa stratégie n’est pas de recréer l’ancien Triller (la société prévoit aussi de se renommer Eight Holdings). En juillet 2026, Digital Music News écrit que Triller a fermé son appli de partage de vidéos plus tôt dans l’année.',
        'Si Triller te servait à monter tes vidéos, il te faut donc un autre outil pour ça.'],
  s_table='Stalak et Triller en un coup d’œil',
  table_note='La colonne Triller décrit l’appli telle qu’Android Police l’a testée en 2015 et telle que sa société mère la décrit en 2026. Les prix et fonctions de Stalak sont ceux du 6 novembre 2026.',
  cols=('', 'Triller', 'Stalak'),
  rows=[('Monte pour toi plusieurs prises d’un même son', 'Oui, c’était sa fonction phare', 'Oui : coupes sur les temps, sur les mots ou par mesure'),
        ('Où ça marche', 'Appli iPhone et Android', 'Dans le navigateur, sur iPhone, Android ou ordinateur'),
        ('Le son', 'Des titres proposés, ou la musique de ton téléphone (2015)', 'Ton propre fichier : MP3, WAV, M4A, ou le son d’une vidéo'),
        ('Fil social', 'Oui, c’était une appli sociale de vidéos', 'Non : tu postes ta vidéo sur TikTok, Instagram ou YouTube'),
        ('Prix', 'Gratuite (2015)', 'Gratuit, avec un petit filigrane ; Pro à 7,99 $/mois ou 49,99 $/an'),
        ('État en novembre 2026', 'Appli d’origine arrêtée, selon sa société mère', 'En ligne')],
  s_adds='Ce que Stalak ajoute',
  adds=['Les paroles à l’écran : en phrase entière en gratuit ; mot par mot et karaoké avec Stalak Pro ; paroles écrites et calées à partir de ta voix (Pro).',
        'Tu choisis comment ça coupe : avec la musique, phrase par phrase (de Posé à Nerveux), sur tes phrases et tes rimes (une fois tes paroles calées), ou à chaque mesure.',
        'Un clip 16:9 de tout le son pour YouTube, avec des effets : flash, zoom, secousse, ralenti… (Pro).',
        'Des packs de 5 à 30 vidéos aux coupes différentes du même son, dès 2 prises (Creator Plus).',
        'Le montage se fait sur ton appareil : tes vidéos restent chez toi, sauf tes projets en ligne (Creator Plus) et le son envoyé pour les paroles automatiques.',
        'En français et en anglais.'],
  s_not='Ce que Stalak ne fait pas',
  nots=['Ce n’est pas un réseau social : pas de fil, pas d’abonnés. Tu postes là où ton public est déjà.',
        'Pas de catalogue de sons : tu apportes ton propre morceau. Pour une reprise, poste seulement ce que tu as le droit d’utiliser.',
        'Pas d’appli à télécharger : Stalak marche dans le navigateur, et tu peux l’ajouter à ton écran d’accueil.',
        'Les vidéos gratuites ont un petit filigrane (la mascotte et stalak.app). Pour tes vidéos sans filigrane, passe à Pro.'],
  s_who='Stalak est-il fait pour toi ?',
  who=['<strong>Oui</strong>, si tu faisais des vidéos Triller sur tes propres sons et que tu veux le même montage multi-prises pour TikTok, Reels ou Shorts, avec tes paroles à l’écran.',
       '<strong>Sans doute pas</strong>, si tu cherches surtout une appli pour regarder et partager des vidéos avec une communauté, ou un catalogue de titres sous licence pour faire du playback.'],
  s_how='Refaire une vidéo façon Triller avec Stalak',
  how=['Importe ton son (MP3, WAV, M4A, ou le son d’une vidéo) et choisis le passage à poster.',
       'Ajoute au moins 2 prises où tu chantes dessus : des vidéos filmées avec le son qui joue à voix haute, ou filmées directement dans Stalak.',
       'Choisis comment ça coupe (Auto, Sur les mots ou Par mesure), ajoute tes paroles si tu veux, et exporte pour TikTok, Reels ou Shorts.'],
  s_faq='Questions fréquentes',
  faq=[('Triller marche-t-elle encore ?', 'Triller Group, la société mère de Triller, a indiqué en juin 2026 avoir arrêté l’ancienne appli Triller, et ne pas vouloir la recréer telle qu’elle était. Pour l’état le plus récent, regarde le magasin d’applis de ton téléphone.'),
       ('Quelle appli fait ce que faisait Triller ?', 'La fonction phare de Triller, c’était de transformer plusieurs prises d’un même son en une seule vidéo montée sur la musique. Stalak le fait dans ton navigateur : tu importes ton son, tu ajoutes tes prises, et il coupe de l’une à l’autre sur les temps, sur les mots ou par mesure, avec tes paroles à l’écran si tu veux.'),
       ('Stalak est-il gratuit ?', 'Oui, sans compte et sans pub : montage illimité, paroles en phrase entière, 3 filtres et export 9:16. Les vidéos gratuites ont un petit filigrane (le visage de la mascotte et stalak.app). Stalak Pro (7,99 $/mois ou 49,99 $/an) l’enlève, et ajoute le clip 16:9, le karaoké, tous les filtres et les paroles automatiques. Creator Plus (14,99 $/mois ou 99,99 $/an) ajoute les packs de vidéos, la sauvegarde en ligne automatique (100 Go) et « Parler à un humain ».'),
       ('Faut-il télécharger une appli ?', 'Non. Stalak marche dans le navigateur sur iPhone, Android ou ordinateur, sur stalak.app. Le montage et l’export se font sur ton appareil.'),
       ('Stalak a-t-il un lien avec Triller ?', 'Non. Stalak est un outil indépendant fait par 99Sayso, rappeur du collectif Alaska. Il n’est affilié ni à Triller ni à Triller Group.')],
  founder='Stalak est fait par 99Sayso, rappeur indépendant du collectif Alaska. Il l’a codé pour monter ses propres prises sur le rythme.',
  s_src='Sources', src_note='Vérifiées le 1er novembre 2026 (en anglais).',
  tm='Triller est une marque de son propriétaire. Stalak est un produit indépendant, sans lien avec Triller, ni approuvé ou sponsorisé par Triller.',
  lang_link=('English version', 'en'),
  footer=[('/fr/tarifs', 'Tarifs'), ('/fr/conditions', 'Conditions'), ('/fr/remboursement', 'Remboursement'), ('/fr/confidentialite', 'Confidentialité'), ('/fr/mentions-legales', 'Mentions légales'), ('/fr/confidentialite#cookies', 'Gérer les cookies')],
 ),
}

CSS = """:root{--sky:#1f6fd6;--ink:#0a0d14;--frost:#eef7ff}
body{margin:0;background:var(--sky);color:var(--ink);font:400 16px/1.6 Rubik,system-ui,sans-serif;padding:24px 16px 60px}
main{max-width:860px;margin:0 auto;background:#fff;border:3px solid var(--ink);border-radius:24px;box-shadow:0 6px 0 var(--ink);padding:28px 24px}
h1{font:400 clamp(28px,6vw,38px)/1.1 'Lilita One',system-ui,sans-serif;margin:0 0 14px} h2{font-size:21px;line-height:1.25;margin:30px 0 8px}
a{color:#1a64c8} .back{display:inline-block;margin-bottom:16px;color:#fff;font-weight:600}
.lead{font-size:17px} .updated{font-size:13px;opacity:.75;margin:0 0 14px}
.tbl{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:12px 0;border:2px solid var(--ink);border-radius:14px}
table{border-collapse:collapse;width:100%;min-width:520px;font-size:14.5px}
th,td{padding:9px 10px;border-bottom:1px solid #d5dbe6;text-align:left;vertical-align:top}
thead th{background:var(--frost);font-weight:700} tbody th{font-weight:600;width:30%} td.us{background:#f2f8ff}
tr:last-child th,tr:last-child td{border-bottom:0}
.note{font-size:13.5px;opacity:.8}
ol li,ul li{margin:4px 0}
details{border:2px solid var(--ink);border-radius:14px;padding:10px 14px;margin:10px 0;background:var(--frost)} summary{font-weight:700;cursor:pointer}
.cta{display:inline-block;margin-top:10px;background:var(--ink);color:#fff!important;text-decoration:none;font-weight:700;border-radius:14px;padding:12px 18px}
.founder{background:var(--frost);border-radius:14px;padding:12px 14px;margin-top:22px;font-size:15px}
video{width:100%;max-width:340px;display:block;margin:12px auto;border:3px solid var(--ink);border-radius:18px;background:#000}
.demo{margin:14px 0}.demo video{max-width:210px;height:auto}.demo figcaption{text-align:center;font-size:14px}
.src{font-size:13.5px} .src li{margin:3px 0} .tm{font-size:12.5px;opacity:.7;margin-top:18px}
footer{max-width:860px;margin:18px auto 0;color:#fff;font-size:13px;text-align:center}footer a{color:#fff}"""

def page(L):
    P = T[L]; url = '{{URL}}' + P['path']; abs_url = 'https://stalak.app' + P['path']
    og = 'https://stalak.app/' + ('og-en.png' if L == 'en' else 'og.png')   # 13/11: the share picture in the page's language
    src = SOURCES[L]
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'Article', 'headline': P['h1'], 'description': P['desc'], 'inLanguage': P['lang'], 'datePublished': DATE, 'dateModified': MODIFIED,
         'mainEntityOfPage': abs_url, 'image': og,
         'author': {'@type': 'Organization', 'name': 'Stalak', 'url': 'https://stalak.app' + P['home']}, 'publisher': {'@id': 'https://stalak.app/#organization'},
         'about': [{'@type': 'SoftwareApplication', 'name': 'Triller'}, {'@type': 'WebApplication', 'name': 'Stalak', 'url': 'https://stalak.app' + P['home']}],
         'citation': [u for u, _, _ in src]},
        {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Stalak', 'item': 'https://stalak.app' + P['home']},
                                                        {'@type': 'ListItem', 'position': 2, 'name': P['crumb'], 'item': abs_url}]},
        {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in P['faq']]}]}
    o = 'fr' if L == 'en' else 'en'
    alt = (f'<link rel="alternate" hreflang="{L}" href="{url}"><link rel="alternate" hreflang="{o}" href="{{{{URL}}}}{P["other"]}">'
           f'<link rel="alternate" hreflang="x-default" href="{{{{URL}}}}{T["en"]["path"]}">')
    li = lambda xs: ''.join(f'<li>{x}</li>' for x in xs)
    rows = ''.join(f'<tr><th scope="row">{a}</th><td>{b}</td><td class="us">{c}</td></tr>' for a, b, c in P['rows'])
    return f'''<!doctype html>
<html lang="{P["lang"]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{H.escape(P["title"])}</title>
<meta name="description" content="{H.escape(P["desc"])}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Stalak"><meta property="og:locale" content="{P["locale"]}">
<meta property="og:title" content="{H.escape(P["title"])}"><meta property="og:description" content="{H.escape(P["desc"])}">
<meta property="og:url" content="{abs_url}"><meta property="og:image" content="{og}"><meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{url}">
{alt}
<link rel="icon" href="/icons/icon-192.png"><link rel="stylesheet" href="/fonts/fonts.css">
<style>
{CSS}
</style>
<link rel="stylesheet" href="/site.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head><body>
<a class="back" href="{P["home"]}">{P["back"]}</a>
<main>
<h1>{P["h1"]}</h1>
<p class="updated">{P["updated"]}</p>
<p class="lead">{P["lead"]}</p>
<p><a class="cta" href="{P["home"]}?ref=seo-triller">{P["cta1"]}</a></p>
<!--DEMO--><figure class="demo"><video src="/demo/edit.mp4" poster="/demo/edit.jpg" width="432" height="768" controls muted loop playsinline preload="none" aria-label="{"A video Stalak edited from three takes by 99Sayso" if L == "en" else "Une vidéo montée par Stalak à partir de trois prises de 99Sayso"}"></video><figcaption>{"A real Stalak edit: three takes by 99Sayso, one cut per bar. Play it with the sound on." if L == "en" else "Un vrai montage Stalak : trois prises de 99Sayso, une coupe par mesure. Lance-le avec le son."}</figcaption></figure><!--/DEMO-->
<h2>{P["s_what"]}</h2>
{"".join(f"<p>{x}</p>" for x in P["what"])}
<h2>{P["s_table"]}</h2>
<p class="note">{P["table_note"]}</p>
<div class="tbl"><table>
<thead><tr><td></td><th scope="col">{P["cols"][1]}</th><th scope="col">{P["cols"][2]}</th></tr></thead>
<tbody>{rows}</tbody></table></div>
<h2>{P["s_adds"]}</h2>
<ul>{li(P["adds"])}</ul>
<h2>{P["s_not"]}</h2>
<ul>{li(P["nots"])}</ul>
<h2>{P["s_who"]}</h2>
<ul>{li(P["who"])}</ul>
<h2>{P["s_how"]}</h2>
<ol>{li(P["how"])}</ol>
<p><a class="cta" href="{P["home"]}?ref=seo-triller">{P["cta2"]}</a></p>
<h2>{P["s_faq"]}</h2>
{"".join(f"<details><summary>{H.escape(q)}</summary><p>{H.escape(a)}</p></details>" for q, a in P["faq"])}
<p class="founder">{P["founder"]}</p>
<h2>{P["s_src"]}</h2>
<p class="note">{P["src_note"]}</p>
<ul class="src">{"".join(f'<li><a href="{H.escape(u)}" rel="noopener">{H.escape(t)}</a>: {H.escape(n)}.</li>' for u, t, n in src)}</ul>
<p class="tm">{P["tm"]}</p>
<p><a href="{P["other"]}" hreflang="{P["lang_link"][1]}" lang="{P["lang_link"][1]}">{P["lang_link"][0]}</a></p>
</main>
<footer>{" · ".join(f'<a href="{u}">{n}</a>' for u, n in P["footer"])}</footer>
</body></html>
'''

(REPO / 'site_src' / 'triller-alternative.html').write_text(page('en'), encoding='utf-8')
(REPO / 'site_src' / 'fr' / 'alternative-triller.html').write_text(page('fr'), encoding='utf-8')
print('ok')
