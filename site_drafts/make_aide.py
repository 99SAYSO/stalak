# Marketing & croissance (09/11/2026, A7): the help pages for Google, in English at the root and in French in /fr/.
# Each page answers a real question rappers and singers type in Google (chosen from Google's suggestions, « People also ask »
# and Google Trends: docs/marketing/PAGES_AIDE.md), explains how to do it for real, then shows Stalak in one minute with
# real screenshots of the app (site_drafts/aide_shots.py) and a « Try it free » button.
# Same look as the 6 guides (make_pages.py); the footer is the site's one (src/footer.py, list AIDE), put in by build_site.py.
# Run: python3 site_drafts/make_aide.py   -> writes site_src/<en slug>.html, site_src/fr/<fr slug>.html, site_src/og/<slug>.jpg
# Rules: no competitor named, no invented number, prices and limits exactly as on /pricing, nothing written only for Google.
import html as H, json, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'src')); import footer as FOOT
TODAY = '2026-11-09'

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
.stalak{margin:30px -8px 0;padding:18px 18px 20px;border:3px solid var(--ink);border-radius:22px;background:var(--frost)}
.stalak h2{margin-top:0}
.steps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 18px;margin:14px 0 4px;padding:0;list-style:none}
.steps li{margin:0}.steps figure{margin:0}
.steps img{display:block;width:100%;max-width:280px;height:auto;margin:0 auto;border:3px solid var(--ink);border-radius:22px;background:var(--sky)}
.steps figcaption{margin:10px auto 0;max-width:300px;font-size:15px;line-height:1.5}
.small{font-size:14px;color:#3f5170;margin:8px 0 0}
@media (max-width:560px){.stalak{margin:30px -6px 0;padding:16px 14px}.steps{grid-template-columns:1fr}.steps img{max-width:260px}}
.more{font-size:15px} footer{max-width:820px;margin:18px auto 0;color:#fff;font-size:13px;text-align:center}footer a{color:#fff}"""

# the exact words of /pricing and /fr/tarifs (06/11)
PLANS = {
 'en': ('What’s free, what’s Pro', [
   '<strong>Free</strong>: unlimited videos, auto cuts, lyrics one line at a time, 3 filters, 9:16 export, no ads. A small watermark (our mascot and stalak.app) on every video.',
   '<strong>Stalak Pro</strong> ($7.99/mo or $49.99/yr): no watermark, 16:9 music videos, karaoke and word-by-word lyrics, auto lyrics, all filters and premium effects.',
   '<strong>Creator Plus</strong> ($14.99/mo or $99.99/yr): everything in Pro, plus video packs, automatic cloud saving (100 GB) and “Talk to a human”.'],
   ('/pricing', 'See pricing')),
 'fr': ('Ce qui est gratuit, ce qui est Pro', [
   '<strong>Gratuit</strong> : vidéos illimitées montées sur le rythme, paroles à l’écran en phrases entières, 3 filtres, vidéos 9:16, aucune pub. Un petit filigrane (le visage de la mascotte et stalak.app) sur chaque vidéo.',
   '<strong>Stalak Pro</strong> (7,99 $/mois ou 49,99 $/an) : sans filigrane, le mode Clip 16:9, paroles mot par mot et karaoké, paroles écrites pour toi à partir de ta voix, tous les filtres et les effets premium.',
   '<strong>Creator Plus</strong> (14,99 $/mois ou 99,99 $/an) : tout Pro, plus les packs de vidéos, la sauvegarde en ligne automatique (100 Go) et « Parler à un humain ».'],
   ('/fr/tarifs', 'Voir les tarifs')),
}
COMMON_FAQ = {
 'en': [('Is Stalak free?', 'Yes. Unlimited videos, no account and no ads. Free videos carry a small watermark (our mascot’s face and stalak.app); go Pro ($7.99/mo or $49.99/yr) to export without it.'),
        ('Do my videos get uploaded?', 'No. Editing happens in your browser, on your device. The only exceptions, if you use them: cloud projects (Creator Plus, saved automatically) and the audio sent for auto lyrics (Pro).')],
 'fr': [('Stalak est gratuit ?', 'Oui : vidéos illimitées, sans compte et sans pub. Les vidéos gratuites portent un petit filigrane (le visage de la mascotte et stalak.app) ; passe à Pro (7,99 $/mois ou 49,99 $/an) pour exporter sans.'),
        ('Mes vidéos sont envoyées en ligne ?', 'Non. Le montage se fait dans ton navigateur, sur ton appareil. Seules exceptions, si tu les utilises : les projets en ligne (Creator Plus, sauvegarde automatique) et le son envoyé pour les paroles automatiques (Pro).')],
}
UI = {   # the words around the content, per language
 'en': dict(home='/', back='← Back to Stalak', cta='Try it free', cta_end='Make your music video now', free_line='Free, in your browser. No sign-up.',
            locale='en_US', lang='en-US', faq='FAQ', more='More guides', founder='Stalak is made by 99Sayso, an independent rapper from the Alaska collective. He coded it to cut his own takes to the beat.',
            demo='<!--DEMO--><figure class="ba"><div class="ba-row"><div class="ba-before"><img src="/demo/takes.jpg" width="884" height="512" loading="lazy" alt="Three takes of the same song by 99Sayso, filmed in front of mountains, in an attic and in a garden"><p class="ba-l">Before: 3 takes</p></div><div class="ba-arrow" aria-hidden="true">→</div><div class="ba-after"><video src="/demo/edit.mp4" poster="/demo/edit.jpg" width="432" height="768" controls muted loop playsinline preload="none" aria-label="After: the video Stalak edited from these three takes, cut on the beat"></video><p class="ba-l">After: Stalak’s edit</p></div></div><figcaption>Real takes by 99Sayso, edited by Stalak: one cut per bar, the lip sync locked. Play it with the sound on.</figcaption></figure><!--/DEMO-->'),
 'fr': dict(home='/fr/', back='← Retour à Stalak', cta='Essaie gratuitement', cta_end='Fais ton clip maintenant', free_line='Gratuit, dans ton navigateur, sans inscription.',
            locale='fr_FR', lang='fr-FR', faq='Questions fréquentes', more='Pour aller plus loin', founder='Stalak est fait par 99Sayso, rappeur indépendant du collectif Alaska. Il l’a codé pour monter ses propres prises sur le rythme.',
            demo='<!--DEMO--><figure class="ba"><div class="ba-row"><div class="ba-before"><img src="/demo/takes.jpg" width="884" height="512" loading="lazy" alt="Trois prises du même morceau par 99Sayso, filmées devant des montagnes, dans un grenier et dans un jardin"><p class="ba-l">Avant : 3 prises</p></div><div class="ba-arrow" aria-hidden="true">→</div><div class="ba-after"><video src="/demo/edit.mp4" poster="/demo/edit.jpg" width="432" height="768" controls muted loop playsinline preload="none" aria-label="Après : la vidéo montée par Stalak à partir de ces trois prises, coupée sur le rythme"></video><p class="ba-l">Après : le montage de Stalak</p></div></div><figcaption>Vraies prises de 99Sayso, montées par Stalak : une coupe par mesure, le playback bien calé. Mets le son.</figcaption></figure><!--/DEMO-->'),
}

# the screenshots (site_drafts/aide_shots.py): the real app at phone size, Free plan, the example's takes and lyrics
SHOTS = {   # name: (width, height, alt en, alt fr)
 'song': (600, 916, 'Stalak at phone size, step 1: Pick your song, with the song “neva die” loaded at 157 BPM',
          'Stalak en taille téléphone, étape 1 : Choisis ton son, avec le morceau « neva die » chargé à 157 BPM'),
 'takes': (600, 916, 'Stalak at phone size, step 2: Add your takes, with three takes each marked “Synced to the song”',
           'Stalak en taille téléphone, étape 2 : Ajoute tes prises, avec trois prises marquées « Calée sur le son »'),
 'edit': (600, 977, 'Stalak at phone size, the edit: the video with its lyrics on screen, then the Cuts and Pace settings',
          'Stalak en taille téléphone, le montage : la vidéo avec ses paroles à l’écran, puis les réglages Coupes et Rythme'),
 'export': (600, 916, 'Stalak at phone size, the Export button, with the note that free videos carry the watermark',
            'Stalak en taille téléphone, le bouton Exporter, avec la note sur le filigrane des vidéos gratuites'),
}

PAGES = [
 dict(n=1, en_slug='how-to-make-a-music-video-on-your-phone', fr_slug='faire-un-clip-avec-son-telephone', mascot='hype',
  en=dict(
   title='How to Make a Music Video on Your Phone by Yourself | Stalak',
   desc='Make a music video with just your phone: plan two or three spots, film full takes with the song playing, then line them up and cut on the beat. Free guide.',
   og=('Make a music video on your phone', 'Plan it, film it and edit it by yourself'),
   h1='How to make a music video on your phone', crumb='Make a music video on your phone',
   lead='To make a music video on your phone, film three or four full takes of yourself performing the song, each in a different spot, with the track playing out loud. Then line every take up with the song and switch between them on the beat. Stalak does the lining up and the cutting for you, free, in your browser.',
   sections=[
    ('What do you need to make a music video on your phone?',
     'A phone, your song as an audio file, and something to hold the phone still: a shelf, a stack of books or a small tripod. Add a way to play the song out loud while you film, like a speaker or a second phone. That’s enough to make the whole video alone.',
     ['<strong>The song</strong>: the final version as an MP3, WAV or M4A file. A video works too, if it has the song as its sound.',
      '<strong>Two or three spots</strong> you can reach in one session: your room, a hallway, a balcony, the street outside.',
      '<strong>Light</strong>: daylight from a window in front of you is the easiest good light you’ll find.'], None),
    ('How do you plan a music video by yourself?',
     'Decide what you’re posting before you film. For TikTok, Reels or Shorts, pick the 10 to 30 seconds people will replay, usually the hook or your best bars. For YouTube, plan on the whole song. Then pick your spots and keep one outfit, so the cuts read as one video.',
     ['A <strong>close shot</strong>, head and shoulders, for the lines that matter most.',
      'A <strong>wider shot</strong> that shows the place and the outfit.',
      'A <strong>different angle</strong>: from the side, from below, or with the phone lower than your face.'],
     'Three spots with one take each already give the edit three looks to switch between. A second take in each spot, closer or wider, doubles that.'),
    ('How do you film a music video on your phone?',
     'Film each take from the first word to the last, with the song playing out loud, so your lips follow the real track. Keep the phone still, face the light, and do at least three takes in different spots. Full takes let the edit switch to any take at any moment of the song.',
     ['Start recording a couple of seconds before the part, and stop a couple of seconds after it.',
      'Perform every word at full voice: a quiet lip-sync shows on camera.',
      'Wipe the lens before each spot. A thumbprint makes the whole take look soft.',
      'Turn on Do Not Disturb, so a call or a notification doesn’t stop you in the middle of a take.',
      'Film vertically for TikTok, Reels and Shorts. Film horizontally only if the video is just for YouTube.',
      'The back camera is usually the sharper one. Do a short test take to check the framing before you start.'], None),
    ('How do you edit the takes together?',
     'Put the song on a timeline, line each take up so the mouth matches the audio, then switch takes on the beat. By hand, lining up means matching each take’s sound to the song, one take after another. Stalak does the lining up and the cuts for you as soon as you add your takes.',
     ['<strong>Keep the song as the sound.</strong> The phone’s microphone only helps to line the takes up; the finished video should carry the real track.',
      '<strong>Cut on the beat.</strong> Switching takes at the start of a bar feels natural. Quick cuts suit the hype parts, longer shots the calm ones.',
      '<strong>Add your lyrics.</strong> With the lyrics on screen, people can follow your bars even with the sound off.'], None),
    ('Should you film vertical or horizontal?',
     'Vertical (9:16) for TikTok, Instagram Reels and YouTube Shorts, horizontal (16:9) for a music video on YouTube. Stalak exports 9:16 videos at 1080 × 1920. Its Music video mode (export with Stalak Pro) makes the 16:9 version at 1920 × 1080, and shows vertical takes whole, in the middle, over a blurred copy of themselves.',
     None, None),
   ],
   stalak=('Stalak in one minute', 'Here’s each step in Stalak at phone size, with the takes from the example above.', [
    ('song', '<strong>1. Pick your song.</strong> Drop the file: Stalak finds the tempo. Keep the whole song, or drag the handles to keep just a part.'),
    ('takes', '<strong>2. Add your takes.</strong> Import the videos from your phone, or tap <strong>Film now</strong> and the song plays while you film. Each take shows “Synced to the song” once Stalak has lined it up.'),
    ('edit', '<strong>3. Lyrics, then the edit.</strong> Paste your lyrics and tap to sync them, or skip. Stalak cuts on the beat right away: pick the cuts (Auto, On the words, Every bar) and the pace (Chill, Normal, Punchy), or tap <strong>Shuffle</strong> for another edit.'),
    ('export', '<strong>4. Export.</strong> The video is made on your device, in full quality from your original files. Free videos carry a small watermark; Pro exports without it.'),
   ]),
   howto=['Pick the part you’ll post, two or three spots and one outfit.', 'Film three or four full takes with the song playing out loud.',
          'Line each take up with the song and cut between them on the beat.', 'Export in 9:16 for TikTok, Reels and Shorts, or in 16:9 for YouTube.'],
   faq=[('Can I make a music video by myself?', 'Yes. Set the phone on a shelf or a tripod, play the song out loud and film several full takes in different spots. Stalak lines the takes up and cuts them for you, so nobody needs to hold the camera or edit.'),
        ('What is the best free app to make a music video?', 'Any video editor can cut a music video if you line up each take by hand. Stalak is made for that one job: it lines your takes up with the song and cuts them on the beat for you. It’s free, runs in the browser, and free videos carry a small watermark.'),
        ('Do I need a tripod?', 'No. Lean the phone on a shelf, a window sill or a stack of books, at chest height. A tripod mostly helps you keep the same framing from one take to the next.'),
        ('How many takes do I need?', 'At least 2. Three or four takes from different spots give the best-looking cuts.'),
        ('Can I film right in Stalak?', 'Yes. At step 2, tap Film now: the song plays while you film.')],
   more=[('/how-to-make-a-lip-sync-video', 'How to make a lip-sync video'), ('/music-video-maker-for-rappers', 'Music video maker for rappers'),
         ('/edit-video-to-the-beat', 'Edit video to the beat'), ('/rap-snippet-video', 'Rap snippet video'),
         ('/lip-sync-videos-for-singers', 'Performance videos for singers'), ('/lip-sync-video-editor', 'Lip-sync video editor')]),
  fr=dict(
   title='Comment faire un clip avec son téléphone, tout seul | Stalak',
   desc='Fais ton clip avec ton téléphone : choisis deux ou trois lieux, filme des prises entières avec le son, puis cale-les et coupe sur le rythme. Guide gratuit.',
   og=('Faire un clip avec son téléphone', 'Le préparer, le filmer et le monter tout seul'),
   h1='Comment faire un clip avec son téléphone', crumb='Faire un clip avec son téléphone',
   lead='Pour faire un clip avec ton téléphone, filme trois ou quatre prises entières de ton morceau, chacune dans un lieu différent, avec le son en haut-parleur. Ensuite, cale chaque prise sur le son et passe de l’une à l’autre sur le rythme. Stalak fait le calage et les coupes à ta place, gratuitement, dans ton navigateur.',
   sections=[
    ('De quoi as-tu besoin pour faire un clip avec ton téléphone ?',
     'Un téléphone, ton son en fichier audio, et de quoi caler le téléphone : une étagère, une pile de livres ou un petit trépied. Il te faut aussi de quoi passer le son en haut-parleur pendant que tu filmes, une enceinte ou un deuxième téléphone. Avec ça, tu peux faire tout le clip seul.',
     ['<strong>Le son</strong> : la version finale en MP3, WAV ou M4A. Une vidéo marche aussi, si le son est dedans.',
      '<strong>Deux ou trois lieux</strong> où tu peux aller dans la même journée : ta chambre, un couloir, un balcon, la rue en bas de chez toi.',
      '<strong>La lumière</strong> : la lumière du jour d’une fenêtre, devant toi, est la plus simple à trouver.'], None),
    ('Comment préparer un clip quand on est seul ?',
     'Décide ce que tu vas poster avant de filmer. Pour TikTok, Reels ou Shorts, choisis les 10 à 30 secondes que les gens vont réécouter, souvent le refrain ou tes meilleures mesures. Pour YouTube, prévois le morceau entier. Choisis ensuite tes lieux et garde la même tenue, pour que les coupes forment un seul clip.',
     ['Un <strong>plan serré</strong>, tête et épaules, pour les phases qui comptent le plus.',
      'Un <strong>plan large</strong> qui montre le lieu et la tenue.',
      'Un <strong>autre angle</strong> : de côté, d’en bas, ou le téléphone plus bas que ton visage.'],
     'Trois lieux avec une prise chacun donnent déjà trois looks au montage. Une deuxième prise dans chaque lieu, plus près ou plus loin, double le choix.'),
    ('Comment filmer un clip avec son téléphone ?',
     'Filme chaque prise du premier au dernier mot, avec le son en haut-parleur, pour que ta bouche suive le vrai morceau. Garde le téléphone immobile, mets-toi face à la lumière et fais au moins trois prises dans des lieux différents. Avec des prises entières, le montage peut passer à n’importe quelle prise à tout moment du morceau.',
     ['Lance l’enregistrement deux secondes avant le passage, et arrête-le deux secondes après.',
      'Rappe ou chante chaque mot à pleine voix : un playback chuchoté se voit à l’écran.',
      'Essuie l’objectif avant chaque lieu. Une trace de doigt rend toute la prise floue.',
      'Active « Ne pas déranger », pour qu’un appel ou une notif ne t’arrête pas en pleine prise.',
      'Filme à la verticale pour TikTok, Reels et Shorts. Filme à l’horizontale seulement si le clip est juste pour YouTube.',
      'La caméra arrière est souvent la plus nette. Fais une courte prise d’essai pour vérifier le cadre avant de te lancer.'], None),
    ('Comment monter les prises ensemble ?',
     'Pose le son sur une timeline, cale chaque prise pour que la bouche suive le son, puis passe d’une prise à l’autre sur le rythme. À la main, caler veut dire faire coïncider le son de chaque prise avec le morceau, une prise après l’autre. Stalak fait le calage et les coupes à ta place dès que tu ajoutes tes prises.',
     ['<strong>Garde le vrai son.</strong> Le micro du téléphone sert seulement à caler les prises ; le clip fini doit avoir le morceau.',
      '<strong>Coupe sur le rythme.</strong> Changer de prise au début d’une mesure paraît naturel. Des coupes rapides pour les passages énervés, des plans plus longs pour les passages calmes.',
      '<strong>Ajoute tes paroles.</strong> Avec les paroles à l’écran, on suit tes phases même sans le son.'], None),
    ('Filmer à la verticale ou à l’horizontale ?',
     'À la verticale (9:16) pour TikTok, Instagram Reels et YouTube Shorts, à l’horizontale (16:9) pour un clip sur YouTube. Stalak exporte les vidéos 9:16 en 1080 × 1920. Son mode Clip (export avec Stalak Pro) fait la version 16:9 en 1920 × 1080, et montre les prises verticales en entier, au milieu, sur une copie floutée d’elles-mêmes.',
     None, None),
   ],
   stalak=('Stalak en une minute', 'Voici chaque étape dans Stalak en taille téléphone, avec les prises de l’exemple plus haut.', [
    ('song', '<strong>1. Choisis ton son.</strong> Dépose le fichier : Stalak trouve le tempo. Garde tout le morceau, ou déplace les poignées pour n’en garder qu’un passage.'),
    ('takes', '<strong>2. Ajoute tes prises.</strong> Importe les vidéos de ton téléphone, ou touche <strong>Filmer maintenant</strong> : ton son se lance pendant que tu filmes. Chaque prise affiche « Calée sur le son » quand Stalak l’a calée.'),
    ('edit', '<strong>3. Les paroles, puis le montage.</strong> Colle tes paroles et cale-les au tap, ou passe cette étape. Stalak coupe tout de suite sur le rythme : choisis les coupes (Auto, Sur les mots, Par mesure) et le rythme (Posé, Normal, Nerveux), ou touche <strong>Régénérer</strong> pour un autre montage.'),
    ('export', '<strong>4. Exporte.</strong> La vidéo est fabriquée sur ton appareil, en pleine qualité, à partir de tes vidéos originales. Les vidéos gratuites portent un petit filigrane ; Pro exporte sans.'),
   ]),
   howto=['Choisis le passage à poster, deux ou trois lieux et une tenue.', 'Filme trois ou quatre prises entières avec le son en haut-parleur.',
          'Cale chaque prise sur le son et coupe de l’une à l’autre sur le rythme.', 'Exporte en 9:16 pour TikTok, Reels et Shorts, ou en 16:9 pour YouTube.'],
   faq=[('Est-ce que je peux faire un clip tout seul ?', 'Oui. Pose le téléphone sur une étagère ou un trépied, passe le son en haut-parleur et filme plusieurs prises entières dans des lieux différents. Stalak cale les prises et les coupe pour toi : personne n’a besoin de tenir la caméra ni de monter.'),
        ('Quelle application pour faire un clip ?', 'N’importe quel logiciel de montage peut faire un clip si tu cales chaque prise à la main. Stalak est fait pour ce travail précis : il cale tes prises sur le son et coupe sur le rythme à ta place. Il est gratuit, marche dans le navigateur, et les vidéos gratuites portent un petit filigrane.'),
        ('Il faut un trépied ?', 'Non. Pose le téléphone sur une étagère, un rebord de fenêtre ou une pile de livres, à hauteur de poitrine. Un trépied aide surtout à garder le même cadre d’une prise à l’autre.'),
        ('Combien de prises faut-il ?', 'Au moins 2. Trois ou quatre prises dans des lieux différents donnent les plus belles coupes.'),
        ('Je peux filmer directement dans Stalak ?', 'Oui. À l’étape 2, touche « Filmer maintenant » : ton son se lance pendant que tu filmes.')],
   more=[('/fr/tarifs', 'Les tarifs de Stalak'), ('/fr/', 'Ouvrir Stalak')]),
 ),
]


def fr_typo(doc):
    """French typography, as on /fr/tarifs: a no-break space before : ; ? ! and inside « », so a line never starts with one of them
    (the <style> block is left alone)"""
    a, b = doc.split('<style>', 1)
    css, rest = b.split('</style>', 1)
    fix = lambda s: (s.replace(' :', ' :').replace(' ;', ' ;').replace(' ?', ' ?').replace(' !', ' !')
                     .replace('« ', '« ').replace(' »', ' »'))
    return fix(a) + '<style>' + css + '</style>' + fix(rest)


def other_tutos(p, lang):
    """the other help pages, in the same language (none yet while only page 1 exists)"""
    return [('/' + ('fr/' + q['fr_slug'] if lang == 'fr' else q['en_slug']), q[lang]['crumb']) for q in PAGES if q is not p]


def page(p, lang):
    T, U = p[lang], UI[lang]
    path = ('/fr/' + p['fr_slug']) if lang == 'fr' else ('/' + p['en_slug'])
    en_url, fr_url = '{{URL}}/' + p['en_slug'], '{{URL}}/fr/' + p['fr_slug']
    url = '{{URL}}' + path
    slug = p['fr_slug'] if lang == 'fr' else p['en_slug']
    faq = T['faq'] + COMMON_FAQ[lang]
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebPage', 'name': T['title'], 'description': T['desc'], 'inLanguage': U['lang'], 'url': url, 'dateModified': TODAY,
         'about': {'@type': 'SoftwareApplication', 'name': 'Stalak', 'applicationCategory': 'MultimediaApplication', 'operatingSystem': 'Web',
                   'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}}},
        {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Stalak', 'item': '{{URL}}' + U['home']},
                                                        {'@type': 'ListItem', 'position': 2, 'name': T['crumb'], 'item': url}]},
        {'@type': 'HowTo', 'name': T['h1'], 'step': [{'@type': 'HowToStep', 'position': i + 1, 'text': s} for i, s in enumerate(T['howto'])]},
        {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]}]}
    li = lambda xs: ''.join(f'<li>{x}</li>' for x in xs)
    secs = ''
    for h2, answer, items, after in T['sections']:
        secs += f'<h2>{H.escape(h2)}</h2>\n<p>{answer}</p>\n' + (f'<ul>{li(items)}</ul>\n' if items else '') + (f'<p>{after}</p>\n' if after else '')
    st_h2, st_intro, st_steps = T['stalak']
    steps = ''.join(f'<li><figure><img src="/aide/{lang}-{name}.jpg" width="{SHOTS[name][0]}" height="{SHOTS[name][1]}" loading="lazy" '
                    f'alt="{H.escape(SHOTS[name][2 if lang == "en" else 3])}"><figcaption>{cap}</figcaption></figure></li>' for name, cap in st_steps)
    plans_h2, plans, (plans_url, plans_txt) = PLANS[lang]
    more = other_tutos(p, lang) + T['more']
    return f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{H.escape(T["title"])}</title>
<meta name="description" content="{H.escape(T["desc"])}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Stalak"><meta property="og:locale" content="{U["locale"]}"><meta property="og:locale:alternate" content="{UI["fr" if lang == "en" else "en"]["locale"]}">
<meta property="og:title" content="{H.escape(T["title"])}"><meta property="og:description" content="{H.escape(T["desc"])}">
<meta property="og:url" content="https://stalak.app{path}"><meta property="og:image" content="https://stalak.app/og/{slug}.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{H.escape(T["og"][0])}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://stalak.app/og/{slug}.jpg">
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
<h1>{H.escape(T["h1"])}</h1>
<p class="lead">{T["lead"]}</p>
<p><a class="cta" href="{U["home"]}?ref=seo">{U["cta"]}</a></p>
{U["demo"]}
{secs}<section class="stalak" aria-labelledby="st-h"><h2 id="st-h">{H.escape(st_h2)}</h2>
<p>{st_intro}</p>
<ol class="steps">{steps}</ol>
<p><a class="cta" href="{U["home"]}?ref=seo">{U["cta"]}</a></p>
<p class="small">{U["free_line"]}</p>
</section>
<h2>{H.escape(plans_h2)}</h2>
<ul>{li(plans)}</ul>
<p><a href="{plans_url}">{plans_txt}</a></p>
<h2>{U["faq"]}</h2>
{"".join(f"<details><summary>{H.escape(q)}</summary><p>{H.escape(a)}</p></details>" for q, a in faq)}
<p class="founder">{U["founder"]}</p>
<h2>{U["more"]}</h2>
<ul class="more">{"".join(f'<li><a href="{u}">{H.escape(n)}</a></li>' for u, n in more)}</ul>
<p><a class="cta" href="{U["home"]}?ref=seo">{U["cta_end"]}</a></p>
</main>
<footer></footer>
</body></html>
'''


def og_images():
    """one share picture per page and language, the same look as the guides' (make_og.py), the bottom line in the page's language"""
    import make_og as O
    from playwright.sync_api import sync_playwright
    free = {'en': 'Free · in your browser · no sign-up', 'fr': 'Gratuit · dans ton navigateur · sans inscription'}
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=1)
        for p in PAGES:
            for lang in ('en', 'fr'):
                title, sub = p[lang]['og']
                html = O.PAGE.format(lilita=O.LILITA, rubik=O.RUBIK, flakes=O.flakes(), logo=O.LOGO, title=H.escape(title), sub=H.escape(sub),
                                     mascot=O.data(ROOT / 'site_src' / 'emoji' / (p['mascot'] + '.webp'), 'image/webp'))
                pg.set_content(html.replace('Free · in your browser · no sign-up', free[lang]), wait_until='load')
                pg.evaluate('document.fonts.ready.then(() => document.fonts.size)'); pg.wait_for_timeout(250)
                assert pg.evaluate("document.fonts.check('70px \"Lilita One\"')"), 'Lilita One not loaded'
                slug = p['fr_slug'] if lang == 'fr' else p['en_slug']
                pg.screenshot(path=str(ROOT / 'site_src' / 'og' / (slug + '.jpg')), type='jpeg', quality=86)
        b.close()


def main():
    # the footer's list (src/footer.py, AIDE) and these pages must be the same
    assert [(a[0], a[1]) for a in FOOT.AIDE] == [(p['fr_slug'], p['en_slug']) for p in PAGES], 'src/footer.py AIDE and make_aide.py PAGES differ'
    for p in PAGES:
        for lang in ('en', 'fr'):
            for name, _ in p[lang]['stalak'][2]:
                assert (ROOT / 'site_src' / 'aide' / f'{lang}-{name}.jpg').exists(), f'screenshot missing: site_src/aide/{lang}-{name}.jpg (site_drafts/aide_shots.py)'
        (ROOT / 'site_src' / (p['en_slug'] + '.html')).write_text(page(p, 'en'), encoding='utf-8')
        (ROOT / 'site_src' / 'fr' / (p['fr_slug'] + '.html')).write_text(fr_typo(page(p, 'fr')), encoding='utf-8')
        print('wrote', p['en_slug'], '+ fr/' + p['fr_slug'])
    if '--no-og' not in sys.argv:
        sys.path.insert(0, str(ROOT / 'site_drafts')); og_images(); print('wrote the share pictures')


if __name__ == '__main__':
    main()
