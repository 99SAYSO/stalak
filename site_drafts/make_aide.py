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
.steps li{margin:0}.steps figure{margin:0}.steps li:last-child:nth-child(odd){grid-column:1/-1}
.steps img{display:block;width:100%;max-width:280px;height:auto;margin:0 auto;border:3px solid var(--ink);border-radius:22px;background:var(--sky)}
.steps figcaption{margin:10px auto 0;max-width:300px;font-size:15px;line-height:1.5}
.small{font-size:14px;color:#3f5170;margin:8px 0 0}
@media (max-width:560px){.stalak{margin:30px -6px 0;padding:16px 14px}.steps{grid-template-columns:1fr}.steps img{max-width:260px}}
.tbl{width:100%;overflow-x:auto;margin:10px 0}.tbl table{width:100%;border-collapse:collapse;font-size:15px;min-width:460px}
.tbl th,.tbl td{border:2px solid var(--ink);padding:8px 10px;text-align:left;vertical-align:top}.tbl th{background:var(--frost)}
.tbl caption{caption-side:bottom;text-align:left;font-size:13px;color:#3f5170;padding-top:6px}
@media (max-width:560px){.tbl table{min-width:0;font-size:14px}.tbl th,.tbl td{padding:6px 7px}}
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
SHOTS = {   # name: (alt en, alt fr); the width and height are read from the files
 'song': ('Stalak at phone size, step 1: Pick your song, with the song “neva die” loaded at 157 BPM',
          'Stalak en taille téléphone, étape 1 : Choisis ton son, avec le morceau « neva die » chargé à 157 BPM'),
 'takes': ('Stalak at phone size, step 2: Add your takes, with three takes each marked “Synced to the song”',
           'Stalak en taille téléphone, étape 2 : Ajoute tes prises, avec trois prises marquées « Calée sur le son »'),
 'broll': ('Stalak at phone size, step 2: under the three takes, the “+ B-roll” button for shots without singing',
           'Stalak en taille téléphone, étape 2 : sous les trois prises, le bouton « + Plans d’ambiance » pour les plans sans chant'),
 'lyrics': ('Stalak at phone size, step 3: Paste my lyrics, with two lines of “neva die” pasted',
            'Stalak en taille téléphone, étape 3 : Coller mes paroles, avec deux lignes de « neva die » collées'),
 'style': ('Stalak at phone size, the text style: size S, M or L, and the reveal Word by word, Whole line or Karaoke',
           'Stalak en taille téléphone, le style du texte : taille S, M ou L, et l’apparition Mot par mot, Phrase entière ou Karaoké'),
 'edit': ('Stalak at phone size, the edit: the video with its lyrics on screen, then the Cuts and Pace settings',
          'Stalak en taille téléphone, le montage : la vidéo avec ses paroles à l’écran, puis les réglages Coupes et Rythme'),
 'export': ('Stalak at phone size, the Export button, with the note that free videos carry the watermark',
            'Stalak en taille téléphone, le bouton Exporter, avec la note sur le filigrane des vidéos gratuites'),
 'pack': ('Stalak at phone size, the pack: a number of videos and “Make the pack”, a Creator Plus feature',
          'Stalak en taille téléphone, le pack : un nombre de vidéos et « Générer le pack », avec Creator Plus'),
 'clip': ('Stalak at phone size, Music video mode: the 16:9 video, a vertical take over a blurred copy of itself, with its lyrics',
          'Stalak en taille téléphone, le mode Clip : la vidéo 16:9, une prise verticale sur une copie floutée d’elle-même, avec ses paroles'),
}


def shot_size(lang, name):
    from PIL import Image
    return Image.open(ROOT / 'site_src' / 'aide' / f'{lang}-{name}.jpg').size

PAGES = [
 dict(n=1, en_slug='how-to-make-a-music-video-on-your-phone', fr_slug='faire-un-clip-avec-son-telephone', mascot='hype', rel=[4, 2, 3, 10],
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
   more=[('/music-video-maker-for-rappers', 'Music video maker for rappers'), ('/how-to-make-a-lip-sync-video', 'How to make a lip-sync video'),
         ('/edit-video-to-the-beat', 'Edit video to the beat')]),
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
   more=[('/fr/tarifs', 'Les tarifs de Stalak')]),
 ),
 dict(n=2, en_slug='music-video-ideas', fr_slug='idees-de-clip', mascot='think', rel=[1, 4, 10, 9],
  en=dict(
   title='Music Video Ideas You Can Shoot on Your Phone | Stalak',
   desc='Low-budget music video ideas for rappers and singers: one room, a car at night, your friends, B-roll from your street. Each one works with just a phone.',
   og=('Music video ideas you can shoot on your phone', 'One room, a car at night, your friends'),
   h1='Music video ideas you can shoot on your phone', crumb='Music video ideas',
   lead='The best low-budget music video ideas use what you already have: one strong place, a change of light or angle, your friends, and three or four full takes. Here are ideas that work with a single phone, how to film each one, and how Stalak turns the takes into one video cut on the beat.',
   sections=[
    ('What makes a low-budget music video look good?',
     'Clear takes and clean cuts. A phone in daylight, a steady frame and a performance you mean carry a video further than gear does. The variety comes from places, angles and light, and the edit keeps it tight by switching takes on the beat.',
     None, None),
    ('Music video ideas with one location',
     'One room can give you a whole video. Film the same part from three spots in it, and change one thing each time.',
     ['<strong>Three corners, one room.</strong> A close take by the window, a wide one from the door, one sitting on the floor.',
      '<strong>Day and night.</strong> One take in daylight, one at night with a single lamp as your only light.',
      '<strong>The mirror.</strong> Film your reflection for one take: it changes the picture without moving the phone far.',
      '<strong>The car.</strong> Parked at night under a street light, the windshield frames you.'], None),
    ('Music video ideas with friends',
     'Friends turn a lip-sync into a scene. Keep the song playing out loud, so everyone moves on the same beat.',
     ['<strong>The crew shot.</strong> Everybody in the frame behind you, rapping the hook with you.',
      '<strong>One take each.</strong> Each friend films a take from where they stand, and you get angles you can’t get alone.',
      '<strong>The reactions.</strong> Film your friends listening to the song, and slip those shots between your takes as B-roll.'], None),
    ('Music video ideas outside',
     'Outside, the place does half the work. Go at sunset or at night, when the light is softer and the street is calmer.',
     ['<strong>Walk and rap.</strong> Hold the phone at arm’s length and walk the same stretch of street for each take.',
      '<strong>A rooftop or a parking lot.</strong> Open space, with the city behind you.',
      '<strong>One spot, three times of day.</strong> Morning, sunset, night: three takes, three moods.',
      '<strong>Your neighborhood.</strong> The bus stop, the court, your block: places people recognize.'], None),
    ('How do you turn the ideas into one video?',
     'Film every idea as a full take of the same part, with the song playing out loud. Then the edit can switch between them on the beat. Shots where you don’t sing, like the street or your friends, go between your takes as B-roll.',
     ['Film the whole part for each idea, not just a few seconds.',
      'Keep one outfit, or change it on purpose for each place.',
      'Two or three ideas are plenty for a short video; three or four keep a whole song moving.'], None),
   ],
   stalak=('Stalak in one minute', 'Here’s each step in Stalak at phone size, with three takes filmed in three places.', [
    ('takes', '<strong>1. Add one take per idea.</strong> Each take is lined up with the song by itself: “Synced to the song”.'),
    ('broll', '<strong>2. Add your B-roll.</strong> Tap <strong>+ B-roll</strong> for the shots where you don’t sing, like the street or your friends. No need to sync them: their sound is never used.'),
    ('edit', '<strong>3. Shuffle the edit.</strong> Stalak cuts between the ideas on the beat. Tap <strong>Shuffle</strong> for a new order, and <strong>Keep this shot</strong> on the ones you love.'),
    ('clip', '<strong>4. Want it on YouTube?</strong> Pick “Music video” at step 1: the same takes make a 16:9 video (export with Stalak Pro).'),
   ]),
   howto=['Pick one or more ideas: one location, friends, or outside.', 'Film each idea as a full take of the same part, with the song playing out loud.',
          'Add shots without singing as B-roll.', 'Let the edit switch between the ideas on the beat.'],
   faq=[('How much does a low-budget music video cost?', 'It can cost nothing if you film it yourself with your phone, in places you can use for free. Your costs are your time and, if you want them, a small tripod or a lamp. Stalak’s free plan edits it, with a small watermark.'),
        ('What are some cool ideas for music videos?', 'The same part filmed in three places, at night with one light, in a parked car, with your friends rapping the hook, or at one spot at three times of day. Mix them in one edit, cut on the beat.'),
        ('Do I need someone to film me?', 'No. Set the phone on something steady, or ask a friend for the moving shots. Stalak lines every take up with the song, wherever it was filmed.')],
   more=[('/music-video-maker-for-rappers', 'Music video maker for rappers'), ('/rap-snippet-video', 'Rap snippet video')]),
  fr=dict(
   title='Idées de clip sans budget, à tourner au téléphone | Stalak',
   desc='Des idées de clip sans budget pour rappeurs et chanteurs : une seule pièce, la voiture la nuit, tes potes, des plans de ta rue. Avec juste un téléphone.',
   og=('Idées de clip sans budget', 'Une pièce, la voiture la nuit, tes potes'),
   h1='Idées de clip sans budget, à tourner au téléphone', crumb='Idées de clip sans budget',
   lead='Les meilleures idées de clip sans budget utilisent ce que tu as déjà : un bon lieu, un changement de lumière ou d’angle, tes potes, et trois ou quatre prises entières. Voici des idées qui marchent avec un seul téléphone, comment filmer chacune, et comment Stalak en fait un clip coupé sur le rythme.',
   sections=[
    ('Qu’est-ce qui rend un clip sans budget réussi ?',
     'Des prises nettes et des coupes propres. Un téléphone à la lumière du jour, un cadre stable et une vraie interprétation valent plus que du matériel. La variété vient des lieux, des angles et de la lumière, et le montage garde le rythme en changeant de prise sur le temps.',
     None, None),
    ('Des idées de clip dans un seul lieu',
     'Une seule pièce peut te donner tout un clip. Filme le même passage depuis trois endroits de la pièce, en changeant une chose à chaque fois.',
     ['<strong>Trois coins, une pièce.</strong> Une prise serrée près de la fenêtre, une large depuis la porte, une assis par terre.',
      '<strong>Le jour et la nuit.</strong> Une prise à la lumière du jour, une la nuit avec une seule lampe.',
      '<strong>Le miroir.</strong> Filme ton reflet pour une prise : l’image change sans bouger beaucoup le téléphone.',
      '<strong>La voiture.</strong> Garée la nuit sous un lampadaire, le pare-brise te cadre.'], None),
    ('Des idées de clip avec tes potes',
     'Avec tes potes, un playback devient une scène. Garde le son en haut-parleur, pour que tout le monde bouge sur le même temps.',
     ['<strong>Le plan d’équipe.</strong> Tout le monde dans le cadre derrière toi, qui rappe le refrain avec toi.',
      '<strong>Une prise chacun.</strong> Chaque pote filme une prise depuis sa place : tu as des angles impossibles à faire seul.',
      '<strong>Les réactions.</strong> Filme tes potes qui écoutent le son, et glisse ces plans entre tes prises comme plans d’ambiance.'], None),
    ('Des idées de clip dehors',
     'Dehors, le lieu fait la moitié du travail. Vas-y au coucher du soleil ou la nuit, quand la lumière est plus douce et la rue plus calme.',
     ['<strong>Marcher en rappant.</strong> Tiens le téléphone à bout de bras et refais le même bout de rue à chaque prise.',
      '<strong>Un toit ou un parking.</strong> De l’espace, avec la ville derrière toi.',
      '<strong>Un lieu, trois moments.</strong> Le matin, au coucher du soleil, la nuit : trois prises, trois ambiances.',
      '<strong>Ton quartier.</strong> L’arrêt de bus, le terrain, ta rue : des lieux que les gens reconnaissent.'], None),
    ('Comment faire un seul clip avec toutes ces idées ?',
     'Filme chaque idée comme une prise entière du même passage, avec le son en haut-parleur. Le montage peut alors passer de l’une à l’autre sur le rythme. Les plans où tu ne chantes pas, comme la rue ou tes potes, se glissent entre tes prises comme plans d’ambiance.',
     ['Filme tout le passage pour chaque idée, pas juste quelques secondes.',
      'Garde la même tenue, ou change-la exprès à chaque lieu.',
      'Deux ou trois idées suffisent pour une vidéo courte ; trois ou quatre font vivre un morceau entier.'], None),
   ],
   stalak=('Stalak en une minute', 'Voici chaque étape dans Stalak en taille téléphone, avec trois prises filmées dans trois lieux.', [
    ('takes', '<strong>1. Ajoute une prise par idée.</strong> Chaque prise se cale toute seule sur le son : « Calée sur le son ».'),
    ('broll', '<strong>2. Ajoute tes plans d’ambiance.</strong> Touche <strong>+ Plans d’ambiance</strong> pour les plans où tu ne chantes pas, comme la rue ou tes potes. Pas besoin de les caler : leur son n’est jamais utilisé.'),
    ('edit', '<strong>3. Régénère le montage.</strong> Stalak passe d’une idée à l’autre sur le rythme. Touche <strong>Régénérer</strong> pour un autre ordre, et <strong>Garder ce plan</strong> sur ceux que tu aimes.'),
    ('clip', '<strong>4. Pour YouTube ?</strong> Choisis « Clip » à l’étape 1 : les mêmes prises font une vidéo 16:9 (export avec Stalak Pro).'),
   ]),
   howto=['Choisis une ou plusieurs idées : un seul lieu, avec tes potes, ou dehors.', 'Filme chaque idée comme une prise entière du même passage, avec le son en haut-parleur.',
          'Ajoute les plans sans chant comme plans d’ambiance.', 'Laisse le montage passer d’une idée à l’autre sur le rythme.'],
   faq=[('Combien coûte un clip sans budget ?', 'Il peut ne rien coûter si tu le filmes toi-même avec ton téléphone, dans des lieux gratuits. Tes seuls frais : ton temps et, si tu veux, un petit trépied ou une lampe. La formule gratuite de Stalak le monte, avec un petit filigrane.'),
        ('Quelles idées pour un clip de rap ?', 'Le même passage filmé dans trois lieux, la nuit avec une seule lumière, dans une voiture garée, avec tes potes qui rappent le refrain, ou au même endroit à trois moments de la journée. Mélange-les dans un seul montage, coupé sur le rythme.'),
        ('Il faut quelqu’un pour me filmer ?', 'Non. Pose le téléphone sur quelque chose de stable, ou demande à un pote pour les plans en mouvement. Stalak cale chaque prise sur le son, où qu’elle ait été filmée.')],
   more=[('/fr/tarifs', 'Les tarifs de Stalak')]),
 ),
 dict(n=3, en_slug='how-to-lip-sync', fr_slug='comment-faire-un-playback', mascot='cool', rel=[5, 4, 1, 6],
  en=dict(
   title='How to Lip Sync Perfectly to Your Own Song | Stalak',
   desc='How to lip sync so it looks real: know every word and breath, play the song out loud, perform at full voice and film several takes. Then fix a take that drifts.',
   og=('How to lip sync perfectly', 'Every word, every breath, in time'),
   h1='How to lip sync perfectly', crumb='How to lip sync',
   lead='To lip sync perfectly, know every word and every breath of the song, play it out loud while you film, and perform at full voice instead of mouthing quietly. Film several takes of the same part, then keep each one lined up with the audio. Stalak does that last part for you, down to a single frame.',
   sections=[
    ('How do you do a perfect lip sync?',
     'Perform the song instead of only moving your lips. Rap or sing every word out loud over the track, with the same breaths, pauses and energy as the recording. The camera sees your jaw, your throat and your chest, so a real performance reads as in sync.',
     ['Learn the part by heart, ad-libs included.',
      'Breathe where the recording breathes: a breath in the wrong place shows.',
      'Hit the closed-mouth sounds, like P, B and M: that’s where people see the sync.',
      'Keep the song loud enough to hear it over your own voice.'], None),
    ('How do you get good at lip syncing?',
     'Practice in front of a mirror or the front camera, then watch the takes back with the sound on. Look at the closed-mouth sounds and the ends of lines: that’s where a lip-sync looks off first. Run the part a few times before you film for real.',
     ['Film a test take and check it before moving to the next spot.',
      'On held notes, keep your mouth open as long as the note lasts.',
      'On fast verses, keep the mouth moves small and sharp.'], None),
    ('Why does my lip sync look off?',
     'Most of the time, the take sits a little early or late against the song, and a few frames are enough to see it. It happens when the video is placed by hand, or when you heard the song late while filming. Moving the take a frame or two fixes the first; a speaker fixes the second.',
     ['Play the song from a speaker, not Bluetooth earbuds: their delay makes you perform a little late.',
      'If a line repeats in the song, a take can be lined up on the wrong one: check the lips on the chorus.',
      'In Stalak, each take has <strong>−</strong> and <strong>+</strong> to move it one frame earlier or later, and <strong>⇄</strong> to try the other spot when a part repeats.'], None),
    ('Can you fix a lip sync that’s out of sync?',
     'Yes, if the take was filmed over the same song. Line it up again with the audio, frame by frame, until the lips land on the closed-mouth sounds. If the performance itself drifts on a few bars, use another take there instead.',
     ['In Stalak, tap a shot and <strong>Swap take</strong> to put another take at the same moment.',
      '<strong>Exclude this part</strong> stops a moment of a take from being used again, even when you shuffle.'], None),
   ],
   stalak=('Stalak in one minute', 'Here’s each step in Stalak at phone size, with the takes from the example above.', [
    ('takes', '<strong>1. Add your takes.</strong> Stalak lines each one up with the song and shows “Synced to the song”. <strong>−</strong> / <strong>+</strong> move a take one frame earlier or later.'),
    ('edit', '<strong>2. Check the lips.</strong> Play the edit and watch the closed-mouth sounds. If a shot doesn’t hold, swap the take, or exclude that part.'),
    ('export', '<strong>3. Export.</strong> The video is made on your device, in full quality from your original files, with your song as its sound.'),
   ]),
   howto=['Learn the part by heart, breaths and ad-libs included.', 'Play the song from a speaker and perform every word at full voice.',
          'Film several full takes of the same part.', 'Line each take up with the audio and fix any take that drifts, frame by frame.'],
   faq=[('How do I lip sync on TikTok?', 'Film yourself performing the song with the track playing out loud, at full voice. To keep it in sync, film a few takes, line them up with the audio and cut between them on the beat before you post: that’s what Stalak does.'),
        ('Why are my lips late in my video?', 'Often because you listened through Bluetooth earbuds while filming, or because the video was placed by hand. Play the song from a speaker next time, and move the take a frame or two earlier.'),
        ('Is lip syncing hard?', 'Not when you know the song. Most of it is knowing every word and breathing where the recording breathes. Lining the video up with the audio is the technical part, and Stalak does it for you.')],
   more=[('/how-to-make-a-lip-sync-video', 'How to make a lip-sync video'), ('/lip-sync-video-editor', 'Lip-sync video editor')]),
  fr=dict(
   title='Comment faire un playback parfait | Stalak',
   desc='Un playback qui a l’air vrai : connais chaque mot, mets le son en haut-parleur, joue à pleine voix, filme plusieurs prises et recale celle qui décale.',
   og=('Faire un playback parfait', 'Chaque mot, chaque souffle, dans le temps'),
   h1='Comment faire un playback parfait', crumb='Faire un playback parfait',
   lead='Pour un playback parfait, connais chaque mot et chaque souffle du morceau, mets le son en haut-parleur pendant que tu filmes, et joue à pleine voix au lieu de bouger les lèvres en silence. Filme plusieurs prises du même passage, puis garde chacune bien calée sur le son. Stalak fait cette dernière partie pour toi, à l’image près.',
   sections=[
    ('Comment fait-on un playback parfait ?',
     'Interprète le morceau au lieu de seulement bouger les lèvres. Rappe ou chante chaque mot à voix haute sur le son, avec les mêmes souffles, les mêmes pauses et la même énergie que l’enregistrement. La caméra voit ta mâchoire, ta gorge et ta poitrine : une vraie interprétation a l’air calée.',
     ['Apprends le passage par cœur, ad-libs compris.',
      'Respire là où l’enregistrement respire : un souffle au mauvais endroit se voit.',
      'Marque les sons bouche fermée, comme P, B et M : c’est là qu’on voit si c’est calé.',
      'Garde le son assez fort pour l’entendre par-dessus ta voix.'], None),
    ('Comment devenir bon en playback ?',
     'Entraîne-toi devant un miroir ou la caméra avant, puis regarde tes prises avec le son. Regarde les sons bouche fermée et les fins de phrases : c’est là qu’un playback décale en premier. Fais le passage plusieurs fois avant de filmer pour de vrai.',
     ['Filme une prise d’essai et vérifie-la avant de changer de lieu.',
      'Sur les notes tenues, garde la bouche ouverte aussi longtemps que la note.',
      'Sur les couplets rapides, fais des mouvements de bouche petits et nets.'], None),
    ('Pourquoi mon playback n’est pas calé ?',
     'La plupart du temps, la prise est un peu en avance ou en retard sur le son, et quelques images suffisent pour que ça se voie. Ça arrive quand la vidéo est placée à la main, ou quand tu entendais le son en retard en filmant. Décaler la prise d’une ou deux images règle le premier cas ; une enceinte règle le second.',
     ['Passe le son sur une enceinte, pas dans des écouteurs Bluetooth : leur retard te fait jouer un peu en retard.',
      'Si une phrase revient dans le morceau, une prise peut se caler sur la mauvaise : vérifie la bouche sur le refrain.',
      'Dans Stalak, chaque prise a <strong>−</strong> et <strong>+</strong> pour la décaler d’une image plus tôt ou plus tard, et <strong>⇄</strong> pour essayer l’autre position quand un passage revient.'], None),
    ('Peut-on rattraper un playback décalé ?',
     'Oui, si la prise a été filmée sur le même son. Recale-la sur le son, image par image, jusqu’à ce que la bouche tombe sur les sons bouche fermée. Si c’est ton interprétation qui décale sur quelques mesures, utilise une autre prise à cet endroit.',
     ['Dans Stalak, touche un plan puis <strong>Changer de prise</strong> pour mettre une autre prise au même moment.',
      '<strong>Exclure ce passage</strong> empêche ce moment d’une prise de revenir, même quand tu régénères.'], None),
   ],
   stalak=('Stalak en une minute', 'Voici chaque étape dans Stalak en taille téléphone, avec les prises de l’exemple plus haut.', [
    ('takes', '<strong>1. Ajoute tes prises.</strong> Stalak cale chacune sur le son et affiche « Calée sur le son ». <strong>−</strong> / <strong>+</strong> décalent une prise d’une image plus tôt ou plus tard.'),
    ('edit', '<strong>2. Vérifie la bouche.</strong> Lance le montage et regarde les sons bouche fermée. Si un plan ne tient pas, change de prise ou exclus ce passage.'),
    ('export', '<strong>3. Exporte.</strong> La vidéo est fabriquée sur ton appareil, en pleine qualité, à partir de tes vidéos originales, avec ton son.'),
   ]),
   howto=['Apprends le passage par cœur, souffles et ad-libs compris.', 'Passe le son sur une enceinte et joue chaque mot à pleine voix.',
          'Filme plusieurs prises entières du même passage.', 'Cale chaque prise sur le son et recale celle qui décale, image par image.'],
   faq=[('Comment faire un playback sur TikTok ?', 'Filme-toi en train d’interpréter le morceau avec le son en haut-parleur, à pleine voix. Pour qu’il reste calé, filme quelques prises, cale-les sur le son et coupe de l’une à l’autre sur le rythme avant de poster : c’est ce que fait Stalak.'),
        ('Pourquoi ma bouche est en retard sur la vidéo ?', 'Souvent parce que tu écoutais le son dans des écouteurs Bluetooth en filmant, ou parce que la vidéo a été placée à la main. La prochaine fois, passe le son sur une enceinte, et décale la prise d’une ou deux images plus tôt.'),
        ('C’est difficile de faire un playback ?', 'Pas quand tu connais le morceau. L’essentiel, c’est de connaître chaque mot et de respirer là où l’enregistrement respire. Caler la vidéo sur le son, c’est la partie technique, et Stalak la fait pour toi.')],
   more=[('/fr/tarifs', 'Les tarifs de Stalak')]),
 ),
 dict(n=4, en_slug='how-to-film-yourself-rapping', fr_slug='se-filmer-en-train-de-rapper', mascot='focus', rel=[1, 3, 2, 5],
  en=dict(
   title='How to Film Yourself Rapping or Singing, Alone | Stalak',
   desc='Film yourself rapping or singing with just your phone: where to put it, how to frame and light yourself, a timer, and the song playing while you film.',
   og=('Film yourself rapping or singing', 'Phone, light, timer, and the song playing'),
   h1='How to film yourself rapping or singing', crumb='Film yourself rapping',
   lead='To film yourself rapping or singing alone, set the phone at eye level on something steady, face a window or a lamp, play the song out loud and record full takes of the part. Use a timer so you’re in place when the take starts. In Stalak, Film now plays the song while you record and lines each take up for you.',
   sections=[
    ('What is the best way to film yourself?',
     'Put the phone at eye level, at arm’s length or a bit farther, on a shelf, a stack of books or a tripod. Face the light, start a timer and film the whole part each time. Watch the first take back before you film the others.',
     ['<strong>Height</strong>: the lens at eye level. Lower makes you look bigger; higher makes you look smaller.',
      '<strong>Distance</strong>: head and shoulders for the bars that matter, a step back for a wide shot that shows your moves.',
      '<strong>Background</strong>: clear the clutter behind you, or pick a wall that says something about you.'], None),
    ('How do you frame yourself without a camera person?',
     'Use the front camera to set the frame, mark where you stand with tape or a shoe, then film. If your back camera is sharper, switch to it once the frame is set, and stay on your mark.',
     ['Leave a little space above your head and room for your hands.',
      'Vertical for TikTok, Reels and Shorts; horizontal for YouTube.',
      'Do one take close and one wider: the edit can switch between them.'], None),
    ('How do you light yourself at home?',
     'Face a window in daylight, with the light in front of you, never behind. At night, one lamp at face height, a little to the side, beats the ceiling light. Avoid mixing daylight and lamps in the same take: your skin changes color from one side to the other.',
     None, None),
    ('How do you record yourself singing with music?',
     'Play the song out loud from a speaker or a second phone while you film, so the video’s sound matches the track. The phone’s microphone picks it up, and that’s fine: it only serves to line the take up. The finished video uses the real song.',
     ['Avoid Bluetooth earbuds: their delay makes you perform a little late.',
      'In Stalak, tap <strong>Film now</strong>: the song plays while you film, with a timer before the take if you want one.',
      'Film the part several times in a row: each take is saved and lined up, and you can go straight to the next one.'], None),
   ],
   stalak=('Stalak in one minute', 'Here’s each step in Stalak at phone size, with the takes from the example above.', [
    ('takes', '<strong>1. Tap Film now.</strong> Set the timer, switch cameras if you want, and the song plays while you film. Each take shows “Filmed here, synced”.'),
    ('edit', '<strong>2. Watch the edit.</strong> Stalak cuts between your takes on the beat. A mistake or a laughing fit? Tap that shot, then <strong>Exclude this part</strong>.'),
    ('export', '<strong>3. Export.</strong> The video is made on your device, in full quality. Free videos carry a small watermark; Pro exports without it.'),
   ]),
   howto=['Set the phone at eye level on something steady.', 'Face the light and mark where you stand.',
          'Play the song out loud and start a timer.', 'Film several full takes, close and wide.'],
   faq=[('What app can I record myself singing with?', 'Your phone’s camera app works if the song plays from a speaker while you film. Stalak can also film right in the browser: tap Film now and it plays the song while you record.'),
        ('Should I use the front or the back camera?', 'The back camera is usually sharper; the front one lets you see yourself. Set the frame with the front camera, then switch if you can stay on your mark.'),
        ('How do I film myself without a tripod?', 'Lean the phone on a shelf, a window sill or a stack of books, at eye level. A rubber band around a mug or a bottle can hold it upright.')],
   more=[('/lip-sync-videos-for-singers', 'Performance videos for singers'), ('/music-video-maker-for-rappers', 'Music video maker for rappers')]),
  fr=dict(
   title='Se filmer seul en train de rapper ou chanter | Stalak',
   desc='Te filmer seul en train de rapper ou chanter avec ton téléphone : où le poser, comment te cadrer et t’éclairer, le minuteur, et le son pendant que tu filmes.',
   og=('Se filmer seul en train de rapper', 'Téléphone, lumière, minuteur et le son'),
   h1='Comment se filmer seul en train de rapper', crumb='Se filmer en train de rapper',
   lead='Pour te filmer seul en train de rapper ou chanter, pose le téléphone à hauteur des yeux sur quelque chose de stable, mets-toi face à une fenêtre ou une lampe, passe le son en haut-parleur et filme des prises entières du passage. Lance un minuteur pour être en place quand la prise commence. Dans Stalak, Filmer maintenant lance ton son pendant que tu filmes et cale chaque prise pour toi.',
   sections=[
    ('Quelle est la meilleure façon de se filmer ?',
     'Pose le téléphone à hauteur des yeux, à bout de bras ou un peu plus loin, sur une étagère, une pile de livres ou un trépied. Mets-toi face à la lumière, lance un minuteur et filme tout le passage à chaque fois. Regarde la première prise avant de filmer les autres.',
     ['<strong>La hauteur</strong> : l’objectif à hauteur des yeux. Plus bas, tu parais plus grand ; plus haut, plus petit.',
      '<strong>La distance</strong> : tête et épaules pour les phases qui comptent, un pas en arrière pour un plan large qui montre tes gestes.',
      '<strong>Le fond</strong> : range ce qui traîne derrière toi, ou choisis un mur qui dit quelque chose de toi.'], None),
    ('Comment se cadrer sans personne derrière la caméra ?',
     'Règle le cadre avec la caméra avant, marque ta place avec du scotch ou une chaussure, puis filme. Si ta caméra arrière est plus nette, passe dessus une fois le cadre réglé, et reste sur ta marque.',
     ['Laisse un peu d’espace au-dessus de ta tête et de la place pour tes mains.',
      'À la verticale pour TikTok, Reels et Shorts ; à l’horizontale pour YouTube.',
      'Fais une prise serrée et une plus large : le montage peut passer de l’une à l’autre.'], None),
    ('Comment s’éclairer chez soi ?',
     'Mets-toi face à une fenêtre en journée, la lumière devant toi, jamais derrière. La nuit, une lampe à hauteur du visage, un peu sur le côté, vaut mieux que le plafonnier. Évite de mélanger la lumière du jour et les lampes dans la même prise : ta peau change de couleur d’un côté à l’autre.',
     None, None),
    ('Comment se filmer en train de chanter avec la musique ?',
     'Passe le son en haut-parleur, sur une enceinte ou un deuxième téléphone, pendant que tu filmes : le son de la vidéo correspond alors au morceau. Le micro du téléphone le capte, et c’est très bien : il sert seulement à caler la prise. Le clip fini utilise le vrai son.',
     ['Évite les écouteurs Bluetooth : leur retard te fait jouer un peu en retard.',
      'Dans Stalak, touche <strong>Filmer maintenant</strong> : ton son se lance pendant que tu filmes, avec un minuteur avant la prise si tu veux.',
      'Filme le passage plusieurs fois de suite : chaque prise est gardée et calée, et tu peux enchaîner sur la suivante.'], None),
   ],
   stalak=('Stalak en une minute', 'Voici chaque étape dans Stalak en taille téléphone, avec les prises de l’exemple plus haut.', [
    ('takes', '<strong>1. Touche Filmer maintenant.</strong> Règle le minuteur, change de caméra si tu veux, et ton son se lance pendant que tu filmes. Chaque prise affiche « Filmée ici, calée ».'),
    ('edit', '<strong>2. Regarde le montage.</strong> Stalak coupe entre tes prises sur le rythme. Une erreur ou un fou rire ? Touche ce plan, puis <strong>Exclure ce passage</strong>.'),
    ('export', '<strong>3. Exporte.</strong> La vidéo est fabriquée sur ton appareil, en pleine qualité. Les vidéos gratuites portent un petit filigrane ; Pro exporte sans.'),
   ]),
   howto=['Pose le téléphone à hauteur des yeux sur quelque chose de stable.', 'Mets-toi face à la lumière et marque ta place.',
          'Passe le son en haut-parleur et lance un minuteur.', 'Filme plusieurs prises entières, serrées et larges.'],
   faq=[('Quelle application pour se filmer en train de chanter ?', 'L’appareil photo de ton téléphone suffit si le son passe sur une enceinte pendant que tu filmes. Stalak peut aussi filmer directement dans le navigateur : touche Filmer maintenant, et il lance ton son pendant que tu enregistres.'),
        ('Caméra avant ou arrière ?', 'La caméra arrière est souvent plus nette ; celle de devant te permet de te voir. Règle le cadre avec la caméra avant, puis passe à l’arrière si tu peux rester sur ta marque.'),
        ('Comment se filmer sans trépied ?', 'Pose le téléphone sur une étagère, un rebord de fenêtre ou une pile de livres, à hauteur des yeux. Un élastique autour d’un mug ou d’une bouteille peut le tenir droit.')],
   more=[('/fr/tarifs', 'Les tarifs de Stalak')]),
 ),
 dict(n=5, en_slug='sync-video-to-music', fr_slug='synchroniser-video-et-musique', mascot='gg', rel=[3, 4, 6, 1],
  en=dict(
   title='How to Sync Your Video to Your Song (Lip Sync Fix) | Stalak',
   desc='How to sync a video with a song recorded separately: line up the sound, fix a take that’s a few frames off, and keep the studio track as the sound.',
   og=('Sync your video to your song', 'Line it up, nudge it, keep the real track'),
   h1='How to sync your video with your song', crumb='Sync video to music',
   lead='To sync a video with your song, film it with the song playing, line up the video’s sound with the track, then keep the song as the sound. By hand, that means sliding each take until the two sounds match. Stalak listens to each take and lines it up for you, then lets you nudge it one frame at a time.',
   sections=[
    ('How do you sync separate audio and video files?',
     'Put the song and the video on the same timeline, find the same moment in both, like a kick, a clap or the first word, and slide the video until they match. Then mute the video’s own sound and keep the song. The clearer the sound in the video, the easier it is.',
     ['Film with the song playing out loud: the video’s sound becomes your guide.',
      'Clap once in front of the camera at the start of a take: it gives you a sharp spike to line up.',
      'Line up on a sharp sound, never on a held note.'], None),
    ('How do you fix a video whose sound is out of sync?',
     'Move the video against the sound, one frame at a time, until the lips match on the closed-mouth sounds like P, B and M. At 30 frames per second, a frame lasts a thirtieth of a second: tiny, but you see it on a mouth.',
     ['Check several moments, not only the start.',
      'If a part of the song repeats, make sure the take is lined up on the right one.',
      'If the lips are late everywhere, move the take earlier; if they’re early, move it later.'], None),
    ('Why use the song instead of the video’s sound?',
     'The phone’s microphone records the room: the echo, the speaker, your voice over the track. The song file is the real mix. Lining the video up with it gives you the studio sound with your performance on screen.',
     None, None),
    ('How does Stalak sync your takes?',
     'When you add a take filmed with the song playing, Stalak listens to its sound, finds the matching spot in your song and lines it up. If a part repeats or the sound is hard to read, it says so, and <strong>−</strong> / <strong>+</strong> move the take one frame earlier or later.',
     ['“Synced to the song”: done.',
      '“Repeated part in the song”: try <strong>⇄</strong> if the lips don’t match.',
      '“Check this one”: adjust with − / +.',
      '“Can’t read the video’s sound”: sync it by hand with − / +.'], None),
   ],
   stalak=('Stalak in one minute', 'Here’s each step in Stalak at phone size, with the takes from the example above.', [
    ('takes', '<strong>1. Add your takes.</strong> Stalak listens to each one and lines it up with the song: “Synced to the song”. Each take also has − / + and ×.'),
    ('edit', '<strong>2. Check and nudge.</strong> Play the edit. If a take is a frame off, − / + move it one frame earlier or later.'),
    ('export', '<strong>3. Export with the real song.</strong> The video carries your song file as its sound, in full quality from your original files.'),
   ]),
   howto=['Film each take with the song playing out loud.', 'Find the same sharp sound in the video and in the song.',
          'Slide the video until they match, then keep the song as the sound.', 'Check the lips on P, B and M sounds and nudge a frame if needed.'],
   faq=[('How do I delay a video to sync with audio?', 'Move the video later on the timeline, or the audio earlier, until the lips match. In Stalak, + moves a take one frame later and − one frame earlier.'),
        ('Can Stalak sync a video filmed without the song playing?', 'Stalak lines takes up by their sound, so film with the song playing. If it can’t read a take’s sound, it tells you, and you can still place the take by hand with − / +.'),
        ('Does syncing change my video’s quality?', 'No. Stalak only changes where the take starts; the export is made from your original files, in full quality.')],
   more=[('/edit-video-to-the-beat', 'Edit video to the beat'), ('/lip-sync-video-editor', 'Lip-sync video editor')]),
  fr=dict(
   title='Synchroniser la vidéo et la musique (playback calé) | Stalak',
   desc='Synchroniser une vidéo avec un son enregistré à part : caler le son, rattraper une prise décalée de quelques images, et garder le vrai morceau comme son.',
   og=('Synchroniser vidéo et musique', 'Caler, ajuster, garder le vrai son'),
   h1='Comment synchroniser ta vidéo avec ton son', crumb='Synchroniser vidéo et son',
   lead='Pour synchroniser une vidéo avec ton son, filme-la avec le son en haut-parleur, cale le son de la vidéo sur le morceau, puis garde le morceau comme son. À la main, il faut faire glisser chaque prise jusqu’à ce que les deux sons coïncident. Stalak écoute chaque prise et la cale pour toi, puis te laisse l’ajuster image par image.',
   sections=[
    ('Comment synchroniser un son et une vidéo séparés ?',
     'Pose le son et la vidéo sur la même timeline, trouve le même moment dans les deux, comme une grosse caisse, un clap ou le premier mot, et fais glisser la vidéo jusqu’à ce qu’ils coïncident. Coupe ensuite le son de la vidéo et garde le morceau. Plus le son de la vidéo est clair, plus c’est facile.',
     ['Filme avec le son en haut-parleur : le son de la vidéo devient ton repère.',
      'Tape une fois dans tes mains devant la caméra au début d’une prise : ça fait un pic net à caler.',
      'Cale sur un son sec, jamais sur une note tenue.'], None),
    ('Comment rattraper une vidéo dont le son est décalé ?',
     'Décale la vidéo par rapport au son, une image à la fois, jusqu’à ce que la bouche tombe sur les sons bouche fermée comme P, B et M. À 30 images par seconde, une image dure un trentième de seconde : c’est peu, mais ça se voit sur une bouche.',
     ['Vérifie plusieurs moments, pas seulement le début.',
      'Si un passage revient dans le morceau, vérifie que la prise est calée sur le bon.',
      'Si la bouche est en retard partout, avance la prise ; si elle est en avance, recule-la.'], None),
    ('Pourquoi garder le morceau plutôt que le son de la vidéo ?',
     'Le micro du téléphone enregistre la pièce : l’écho, l’enceinte, ta voix par-dessus le son. Le fichier du morceau, c’est le vrai mix. En calant la vidéo dessus, tu as le son du studio avec ton interprétation à l’image.',
     None, None),
    ('Comment Stalak cale tes prises ?',
     'Quand tu ajoutes une prise filmée avec le son en haut-parleur, Stalak écoute son son, trouve le bon endroit dans ton morceau et la cale. Si un passage revient ou si le son est difficile à lire, il te le dit, et <strong>−</strong> / <strong>+</strong> décalent la prise d’une image plus tôt ou plus tard.',
     ['« Calée sur le son » : c’est fait.',
      '« Passage répété dans le son » : essaie <strong>⇄</strong> si la bouche ne suit pas.',
      '« À vérifier » : ajuste avec − / +.',
      '« Son de la vidéo illisible » : cale-la à la main avec − / +.'], None),
   ],
   stalak=('Stalak en une minute', 'Voici chaque étape dans Stalak en taille téléphone, avec les prises de l’exemple plus haut.', [
    ('takes', '<strong>1. Ajoute tes prises.</strong> Stalak écoute chacune et la cale sur le son : « Calée sur le son ». Chaque prise a aussi − / + et ×.'),
    ('edit', '<strong>2. Vérifie et ajuste.</strong> Lance le montage. Si une prise est décalée d’une image, − / + la décalent d’une image plus tôt ou plus tard.'),
    ('export', '<strong>3. Exporte avec le vrai son.</strong> La vidéo garde ton morceau comme son, en pleine qualité, à partir de tes vidéos originales.'),
   ]),
   howto=['Filme chaque prise avec le son en haut-parleur.', 'Trouve le même son sec dans la vidéo et dans le morceau.',
          'Fais glisser la vidéo jusqu’à ce qu’ils coïncident, puis garde le morceau comme son.', 'Vérifie la bouche sur les sons P, B et M, et décale d’une image si besoin.'],
   faq=[('Comment décaler une vidéo pour la caler sur le son ?', 'Décale la vidéo plus tard sur la timeline, ou le son plus tôt, jusqu’à ce que la bouche suive. Dans Stalak, + décale une prise d’une image plus tard et − d’une image plus tôt.'),
        ('Stalak peut-il caler une vidéo filmée sans le son ?', 'Stalak cale les prises grâce à leur son, alors filme avec le son en haut-parleur. S’il n’arrive pas à lire le son d’une prise, il te le dit, et tu peux quand même la caler à la main avec − / +.'),
        ('Caler la vidéo change sa qualité ?', 'Non. Stalak change seulement le moment où la prise commence ; l’export est fait à partir de tes vidéos originales, en pleine qualité.')],
   more=[('/fr/tarifs', 'Les tarifs de Stalak')]),
 ),
 dict(n=6, en_slug='add-lyrics-to-video', fr_slug='mettre-les-paroles-sur-une-video', mascot='love', rel=[1, 9, 7, 3],
  en=dict(
   title='How to Add Lyrics to a Video, Synced to Your Song | Stalak',
   desc='Put your lyrics on screen, line by line and in time with the song: paste them, sync them by tapping or automatically, pick the style. For TikTok, Reels, Shorts.',
   og=('Add lyrics to a video', 'On screen, in time with your song'),
   h1='How to add lyrics to a video', crumb='Add lyrics to a video',
   lead='To add lyrics to a video, paste them one line per row, then sync each line to the moment it’s sung: by tapping along with the song, or automatically from your voice. Keep them big, short and away from the edges of the screen. Stalak does all of it in the browser, free one whole line at a time.',
   sections=[
    ('How do you put lyrics on a video so they match the song?',
     'Split the lyrics into short lines, one per row, the way you say them. Then give each line its start: tap a button the moment each line begins, or let an app place the lines from the voice. Play it back and nudge any line that comes too early or too late.',
     None, None),
    ('Where should lyrics go on a TikTok, Reel or Short?',
     'Away from the edges: the bottom of the screen holds the caption and the username, and the right side holds the buttons. The middle or the upper part of the frame is the safe spot, with big letters and an outline so they read on any background.',
     ['Short lines read faster than long ones.',
      'An outline or a box keeps white letters readable on a bright shot.',
      'Check them on a phone, at arm’s length, before you post.'], None),
    ('Line by line, word by word or karaoke?',
     'Whole lines are the easiest to read and suit fast verses. Word by word shows each word as you say it, which punches up a hook. Karaoke lights up the sung word in the line, so people can sing along. In Stalak, whole lines in size M are free; word by word, karaoke and every size come with Pro.',
     None, None),
    ('How do you make a lyric video for your song?',
     'A lyric video often shows only the words over a picture. If you’d rather keep your face on screen, film a few takes of you performing the song and put the lyrics over them: people follow the words and see you. Stalak is made for that: it puts your lyrics over your own takes.',
     None, None),
   ],
   stalak=('Stalak in one minute', 'Here’s each step in Stalak at phone size, with two lines of the example’s song.', [
    ('lyrics', '<strong>1. Paste your lyrics.</strong> One line per row, only the part you post. Or <strong>Auto transcription</strong> (Pro): Stalak writes them from your voice.'),
    ('style', '<strong>2. Sync and style them.</strong> Tap <strong>Sync automatically</strong> (Stalak places each line on your voice) or <strong>Sync by tapping</strong>. Then pick the position, font, color, size and reveal.'),
    ('edit', '<strong>3. Check them on the video.</strong> Play the edit: each line shows up as you say it. If a line comes early or late, − / + next to it in the lyrics move it a little.'),
   ]),
   howto=['Paste the lyrics of the part, one short line per row.', 'Sync each line: tap along with the song, or let Stalak place them from your voice.',
          'Pick a position away from the edges, a size and an outline.', 'Play it back and nudge any line that’s early or late.'],
   faq=[('How do I put lyrics on TikTok automatically?', 'In Stalak, paste your lyrics and tap Sync automatically: it listens to the voice in your song and places each line by itself. With Pro, Auto transcription writes the lyrics for you too, 20 times a day.'),
        ('Can I add lyrics to a video for free?', 'Yes. On Stalak’s free plan you paste your lyrics, sync them and show them one whole line at a time, in size M. Free videos carry a small watermark.'),
        ('What size should lyrics be?', 'Big enough to read on a phone at arm’s length, in short lines. An outline or a box behind the text keeps it readable on bright shots.')],
   more=[('/rap-snippet-video', 'Rap snippet video'), ('/how-to-make-a-lip-sync-video', 'How to make a lip-sync video')]),
  fr=dict(
   title='Mettre les paroles sur une vidéo, calées sur le son | Stalak',
   desc='Mets tes paroles à l’écran, phrase par phrase et dans le temps : colle-les, cale-les au tap ou automatiquement, choisis le style. Pour TikTok, Reels et Shorts.',
   og=('Mettre les paroles sur une vidéo', 'À l’écran, dans le temps du son'),
   h1='Comment mettre les paroles sur une vidéo', crumb='Mettre les paroles sur une vidéo',
   lead='Pour mettre les paroles sur une vidéo, colle-les une phrase par ligne, puis cale chaque phrase au moment où elle est chantée : au tap en suivant le son, ou automatiquement à partir de ta voix. Garde-les grandes, courtes et loin des bords de l’écran. Stalak fait tout ça dans le navigateur, gratuitement en phrases entières.',
   sections=[
    ('Comment mettre les paroles sur une vidéo pour qu’elles suivent le son ?',
     'Découpe les paroles en phrases courtes, une par ligne, comme tu les dis. Donne ensuite à chaque phrase son départ : touche un bouton au moment où chaque phrase commence, ou laisse une appli placer les phrases à partir de la voix. Relis en lançant la vidéo et décale la phrase qui arrive trop tôt ou trop tard.',
     None, None),
    ('Où placer les paroles sur un TikTok, un Reel ou un Short ?',
     'Loin des bords : le bas de l’écran porte la légende et le pseudo, et le côté droit les boutons. Le milieu ou le haut de l’image, c’est l’endroit sûr, avec de grandes lettres et un contour pour qu’elles se lisent sur n’importe quel fond.',
     ['Les phrases courtes se lisent plus vite que les longues.',
      'Un contour ou un cadre garde les lettres blanches lisibles sur un plan clair.',
      'Vérifie-les sur un téléphone, à bout de bras, avant de poster.'], None),
    ('Phrase entière, mot par mot ou karaoké ?',
     'Les phrases entières sont les plus faciles à lire et vont bien aux couplets rapides. Le mot par mot montre chaque mot au moment où tu le dis, ce qui donne de la force à un refrain. Le karaoké allume le mot chanté dans la phrase, pour que les gens chantent avec toi. Dans Stalak, les phrases entières en taille M sont gratuites ; le mot par mot, le karaoké et toutes les tailles sont avec Pro.',
     None, None),
    ('Comment faire une vidéo lyrics pour ton son ?',
     'Une vidéo lyrics montre souvent seulement les mots sur une image. Si tu préfères garder ton visage à l’écran, filme quelques prises de toi en train d’interpréter le morceau et mets les paroles par-dessus : les gens suivent les mots et te voient. Stalak est fait pour ça : il met tes paroles sur tes propres prises.',
     None, None),
   ],
   stalak=('Stalak en une minute', 'Voici chaque étape dans Stalak en taille téléphone, avec deux lignes du morceau de l’exemple.', [
    ('lyrics', '<strong>1. Colle tes paroles.</strong> Une phrase par ligne, seulement le passage que tu postes. Ou <strong>Transcription auto</strong> (Pro) : Stalak les écrit à partir de ta voix.'),
    ('style', '<strong>2. Cale-les et choisis le style.</strong> Touche <strong>Caler automatiquement</strong> (Stalak place chaque phrase sur ta voix) ou <strong>Caler au tap</strong>. Puis choisis la position, la police, la couleur, la taille et l’apparition.'),
    ('edit', '<strong>3. Vérifie-les sur la vidéo.</strong> Lance le montage : chaque phrase apparaît quand tu la dis. Si une phrase arrive trop tôt ou trop tard, − / + à côté d’elle, dans les paroles, la décalent un peu.'),
   ]),
   howto=['Colle les paroles du passage, une phrase courte par ligne.', 'Cale chaque phrase : au tap en suivant le son, ou laisse Stalak les placer à partir de ta voix.',
          'Choisis une position loin des bords, une taille et un contour.', 'Relis et décale la phrase qui arrive trop tôt ou trop tard.'],
   faq=[('Comment mettre les paroles automatiquement ?', 'Dans Stalak, colle tes paroles et touche Caler automatiquement : il écoute la voix dans ton son et place chaque phrase tout seul. Avec Pro, la Transcription auto écrit aussi les paroles pour toi, 20 fois par jour.'),
        ('Peut-on mettre les paroles sur une vidéo gratuitement ?', 'Oui. Avec la formule gratuite de Stalak, tu colles tes paroles, tu les cales et elles s’affichent en phrases entières, en taille M. Les vidéos gratuites portent un petit filigrane.'),
        ('Quelle taille pour les paroles ?', 'Assez grandes pour se lire sur un téléphone à bout de bras, en phrases courtes. Un contour ou un cadre derrière le texte le garde lisible sur les plans clairs.')],
   more=[('/fr/tarifs', 'Les tarifs de Stalak')]),
 ),
 dict(n=7, en_slug='promote-your-music-on-tiktok', fr_slug='promouvoir-sa-musique-sur-tiktok', mascot='lol', rel=[9, 8, 6, 2],
  en=dict(
   title='How to Promote Your Own Music on TikTok | Stalak',
   desc='A simple plan to promote your own song on TikTok: short videos of you performing it, posted often, with the best part first, and a week of them from one shoot.',
   og=('Promote your own music on TikTok', 'Short videos of you, the hook first'),
   h1='How to promote your own music on TikTok', crumb='Promote your music on TikTok',
   lead='To promote your own music on TikTok, post short videos of you performing the song, often, with the best part of the song in the first seconds. One video rarely does it: the same song comes back again and again, in different cuts, until people know it. Stalak makes those videos from one filming session.',
   sections=[
    ('How do you promote your own music on TikTok?',
     'Pick the 10 to 30 seconds of the song people will replay, film yourself performing it, and post a new version of it regularly. Put the song itself in every video, so they all lead back to the same track. Answer comments, and make more of the versions that work.',
     None, None),
    ('What should the first seconds show?',
     'Your best bar or the hook, with you on screen from the first frame. People decide fast, so skip the silent intro and the logo. Lyrics on screen help people catch the words even with the sound off.',
     None, None),
    ('How often should you post the same song?',
     'Often enough that people hear it more than once, at a pace you can keep for weeks: one video a day during release week, for example. Each video should look new, even if the song is the same.',
     ['Change the cut, not the song: a new order of takes, another part, another framing.',
      'Film once, post many: one session with three or four takes can give you a week of videos.',
      'When a version gets replays and shares, make the next ones like it.'], None),
    ('Is TikTok promotion worth it for music?',
     'Posting your own videos costs only time, so it’s worth trying on every release. Paying to boost a video is a separate choice: if you try it, pick a video that already works on its own.',
     None, None),
   ],
   stalak=('Stalak in one minute', 'Here’s each step in Stalak at phone size, with the takes from the example above.', [
    ('edit', '<strong>1. One session, many edits.</strong> Tap <strong>Shuffle</strong> for a new edit of the same takes; change the pace for a calmer or punchier day.'),
    ('pack', '<strong>2. A week at once (Creator Plus).</strong> Make a pack of 5, 10 or 30 videos from the same takes, each cut differently.'),
    ('export', '<strong>3. Export in 9:16.</strong> Ready for TikTok, made on your device in full quality. Free videos carry a small watermark.'),
   ]),
   howto=['Pick the 10 to 30 seconds people will replay.', 'Film three or four takes of you performing it.',
          'Post a different cut of it regularly, best part first.', 'Make more of the versions that get replays and shares.'],
   faq=[('How long should a TikTok snippet be?', 'Long enough for the hook: often 10 to 30 seconds. Shorter is easier to replay.'),
        ('Can I post the same song every day?', 'Yes, as long as each video is different: another cut, another place, another part of the song.'),
        ('Should I show my face?', 'If you perform the song, yes: a real performance makes people stop. Stalak is made for videos of you performing your own song.')],
   more=[('/rap-snippet-video', 'Rap snippet video'), ('/music-video-maker-for-rappers', 'Music video maker for rappers')]),
  fr=dict(
   title='Comment promouvoir sa musique sur TikTok | Stalak',
   desc='Promouvoir ton son sur TikTok : des vidéos courtes de toi qui l’interprètes, postées souvent, le meilleur passage d’abord, toutes tirées d’un seul tournage.',
   og=('Promouvoir sa musique sur TikTok', 'Des vidéos courtes de toi, le refrain d’abord'),
   h1='Comment promouvoir ta musique sur TikTok', crumb='Promouvoir sa musique sur TikTok',
   lead='Pour promouvoir ta musique sur TikTok, poste souvent des vidéos courtes de toi en train d’interpréter le morceau, avec le meilleur passage dans les premières secondes. Une seule vidéo suffit rarement : le même son revient encore et encore, avec des coupes différentes, jusqu’à ce que les gens le connaissent. Stalak fait ces vidéos à partir d’un seul tournage.',
   sections=[
    ('Comment promouvoir sa propre musique sur TikTok ?',
     'Choisis les 10 à 30 secondes du morceau que les gens vont réécouter, filme-toi en train de les interpréter, et poste régulièrement une nouvelle version. Mets le morceau lui-même dans chaque vidéo, pour qu’elles mènent toutes au même son. Réponds aux commentaires, et refais les versions qui marchent.',
     None, None),
    ('Que montrer dans les premières secondes ?',
     'Ta meilleure phase ou le refrain, avec toi à l’écran dès la première image. Les gens décident vite : oublie l’intro silencieuse et le logo. Les paroles à l’écran aident à comprendre les mots même sans le son.',
     None, None),
    ('À quel rythme poster le même son ?',
     'Assez souvent pour qu’on l’entende plus d’une fois, à un rythme que tu peux tenir des semaines : une vidéo par jour pendant la semaine de sortie, par exemple. Chaque vidéo doit paraître nouvelle, même si le son est le même.',
     ['Change la coupe, pas le son : un autre ordre de prises, un autre passage, un autre cadre.',
      'Filme une fois, poste plusieurs fois : un tournage avec trois ou quatre prises peut te donner une semaine de vidéos.',
      'Quand une version est réécoutée et partagée, fais les suivantes dans le même esprit.'], None),
    ('La promotion sur TikTok, ça vaut le coup pour la musique ?',
     'Poster tes propres vidéos ne coûte que du temps : ça vaut le coup d’essayer à chaque sortie. Payer pour pousser une vidéo, c’est un autre choix : si tu essaies, choisis une vidéo qui marche déjà toute seule.',
     None, None),
   ],
   stalak=('Stalak en une minute', 'Voici chaque étape dans Stalak en taille téléphone, avec les prises de l’exemple plus haut.', [
    ('edit', '<strong>1. Un tournage, plein de montages.</strong> Touche <strong>Régénérer</strong> pour un nouveau montage des mêmes prises ; change le rythme pour un jour plus posé ou plus nerveux.'),
    ('pack', '<strong>2. Une semaine d’un coup (Creator Plus).</strong> Fais un pack de 5, 10 ou 30 vidéos à partir des mêmes prises, toutes coupées différemment.'),
    ('export', '<strong>3. Exporte en 9:16.</strong> Prêt pour TikTok, fabriqué sur ton appareil en pleine qualité. Les vidéos gratuites portent un petit filigrane.'),
   ]),
   howto=['Choisis les 10 à 30 secondes que les gens vont réécouter.', 'Filme trois ou quatre prises de toi en train de les interpréter.',
          'Poste régulièrement une coupe différente, le meilleur passage d’abord.', 'Refais les versions qui sont réécoutées et partagées.'],
   faq=[('Combien de temps doit durer un snippet sur TikTok ?', 'Assez pour le refrain : souvent 10 à 30 secondes. Plus c’est court, plus c’est facile à réécouter.'),
        ('Je peux poster le même son tous les jours ?', 'Oui, tant que chaque vidéo est différente : une autre coupe, un autre lieu, un autre passage du morceau.'),
        ('Je dois montrer mon visage ?', 'Si tu interprètes le morceau, oui : une vraie interprétation fait s’arrêter les gens. Stalak est fait pour les vidéos de toi qui interprètes ton propre son.')],
   more=[('/fr/tarifs', 'Les tarifs de Stalak')]),
 ),
 dict(n=8, en_slug='promote-your-music-on-instagram', fr_slug='promouvoir-sa-musique-sur-instagram', mascot='hello', rel=[7, 9, 10, 6],
  en=dict(
   title='How to Promote Your Music on Instagram Reels | Stalak',
   desc='Promote your song on Instagram: Reels of you performing it, a countdown in your Story, collab posts with the artists on the song, and the right size for Reels.',
   og=('Promote your music on Instagram', 'Reels, Stories and collabs for your song'),
   h1='How to promote your music on Instagram', crumb='Promote your music on Instagram',
   lead='To promote your music on Instagram, post Reels of you performing the song: Instagram can recommend them to people who don’t follow you yet. Use your Story to count down to the release, and post with the other artists on the song as a collab, so it reaches both audiences. Stalak makes the Reels from one filming session.',
   sections=[
    ('How do you promote your music on Instagram?',
     'Post Reels of you performing the best part of the song, a few times a week around the release, with the song as the sound. Instagram can recommend Reels to people who don’t follow you yet, in the Reels tab and in Explore. Keep Stories for the people who already follow you.',
     ['<strong>Reels</strong>: short videos of you performing the song, to reach new listeners.',
      '<strong>Stories</strong>: the countdown, the release day, the behind the scenes, for your followers.',
      '<strong>Collabs</strong>: one post shown on your profile and on another artist’s, to reach both audiences.'], None),
    ('How do you announce a release on Instagram?',
     'Add a countdown sticker to a Story with the release date: people can tap it to get a reminder when it ends. Post a Reel of the hook the same week. On release day, share the link in a Story with the link sticker, and put it in your bio.',
     None, None),
    ('What size should a Reel be?',
     'Vertical, 9:16, at 1080 × 1920 pixels. Since January 2025, a Reel you upload can be up to 3 minutes long, but a short part of the song is easier to watch twice. For a portrait post in the feed, 4:5 at 1080 × 1350 works too.',
     None, None),
    ('Should you test a Reel before everyone sees it?',
     'If your account has trial reels, it’s worth it: Instagram shows a trial reel to people who don’t follow you first. About 24 hours later you see how it did, and you choose whether to share it with everyone. That’s a simple way to find the cut of your song that works.',
     None, None),
   ],
   stalak=('Stalak in one minute', 'Here’s each step in Stalak at phone size, with the takes from the example above.', [
    ('edit', '<strong>1. Make the Reel.</strong> Add your song and your takes: Stalak lines them up and cuts on the beat. Pick 9:16 for Reels, or 4:5 for the feed.'),
    ('pack', '<strong>2. A Reel a day (Creator Plus).</strong> A pack of 5, 10 or 30 videos from the same takes, each cut differently, for the weeks around the release.'),
    ('export', '<strong>3. Export.</strong> The video is made on your device, 1080 pixels wide, in full quality from your original files. Free videos carry a small watermark.'),
   ]),
   howto=['Film three or four takes of you performing the best part of the song.', 'Post them as Reels around the release, with the song as the sound.',
          'Count down to the release with a countdown sticker in your Story.', 'Share the release as a collab with the other artists on the song.'],
   faq=[('How long can an Instagram Reel be?', 'Up to 3 minutes when you upload it, since January 2025. A short part of the song, 10 to 30 seconds, is easier to watch twice.'),
        ('How do I get my song in Instagram’s music library?', 'Through your distributor, the service that puts your music on streaming platforms: ask it to send your song to Instagram and Facebook. Once it’s there, people can use your song in their own Reels and Stories.'),
        ('What is a collab post?', 'A post you share with another account: you invite them as a collaborator, and once they accept, the post shows on both profiles with the same likes and comments.')],
   more=[('/rap-snippet-video', 'Rap snippet video'), ('/lip-sync-videos-for-singers', 'Lip-sync videos for singers')]),
  fr=dict(
   title='Comment promouvoir sa musique sur Instagram (Reels) | Stalak',
   desc='Fais connaître ton son sur Instagram : des Reels de toi qui l’interprètes, un compte à rebours en story, des posts en collab et le bon format pour les Reels.',
   og=('Promouvoir sa musique sur Instagram', 'Reels, stories et collabs pour ton son'),
   h1='Comment promouvoir ta musique sur Instagram', crumb='Promouvoir sa musique sur Instagram',
   lead='Pour promouvoir ta musique sur Instagram, poste des Reels de toi en train d’interpréter le morceau : Instagram peut les montrer à des gens qui ne te suivent pas encore. Sers-toi de ta story pour le compte à rebours avant la sortie, et poste avec les autres artistes du morceau en collab, pour toucher vos deux publics. Stalak fait ces Reels à partir d’un seul tournage.',
   sections=[
    ('Comment promouvoir sa musique sur Instagram ?',
     'Poste des Reels de toi en train d’interpréter le meilleur passage, plusieurs fois par semaine autour de la sortie, avec le morceau comme son. Instagram peut recommander les Reels à des gens qui ne te suivent pas, dans l’onglet Reels et dans Explorer. Garde les stories pour ceux qui te suivent déjà.',
     ['Les <strong>Reels</strong> : des vidéos courtes de toi qui interprètes le morceau, pour toucher de nouvelles personnes.',
      'Les <strong>stories</strong> : le compte à rebours, le jour de la sortie, les coulisses, pour ceux qui te suivent.',
      'Les <strong>collabs</strong> : un seul post, affiché sur ton profil et sur celui d’un autre artiste, pour toucher vos deux publics.'], None),
    ('Comment annoncer une sortie sur Instagram ?',
     'Ajoute un sticker « Compte à rebours » à une story, avec la date de sortie : les gens peuvent le toucher pour recevoir un rappel à la fin. Poste un Reel du refrain la même semaine. Le jour de la sortie, partage le lien en story avec le sticker « Lien », et mets-le dans ta bio.',
     None, None),
    ('Quel format pour un Reel ?',
     'Vertical, 9:16, en 1080 × 1920 pixels. Depuis janvier 2025, un Reel importé peut durer jusqu’à 3 minutes, mais un passage court se regarde plus facilement deux fois. Pour un post en portrait dans le fil, le 4:5 en 1080 × 1350 marche aussi.',
     None, None),
    ('Faut-il tester un Reel avant que tout le monde le voie ?',
     'Si ton compte a les Reels d’essai, ça vaut le coup : Instagram montre d’abord un Reel d’essai à des gens qui ne te suivent pas. Environ 24 heures après, tu vois comment il a marché et tu choisis de le partager avec tout le monde. C’est un moyen simple de trouver la coupe de ton son qui marche.',
     None, None),
   ],
   stalak=('Stalak en une minute', 'Voici chaque étape dans Stalak en taille téléphone, avec les prises de l’exemple plus haut.', [
    ('edit', '<strong>1. Fais le Reel.</strong> Ajoute ton son et tes prises : Stalak les cale et coupe sur le rythme. Choisis 9:16 pour les Reels, ou 4:5 pour le fil.'),
    ('pack', '<strong>2. Un Reel par jour (Creator Plus).</strong> Un pack de 5, 10 ou 30 vidéos à partir des mêmes prises, toutes coupées différemment, pour les semaines autour de la sortie.'),
    ('export', '<strong>3. Exporte.</strong> La vidéo est fabriquée sur ton appareil, en 1080 pixels de large, en pleine qualité à partir de tes vidéos originales. Les vidéos gratuites portent un petit filigrane.'),
   ]),
   howto=['Filme trois ou quatre prises de toi en train d’interpréter le meilleur passage du morceau.', 'Poste-les en Reels autour de la sortie, avec le morceau comme son.',
          'Fais le compte à rebours de la sortie avec un sticker « Compte à rebours » en story.', 'Partage la sortie en collab avec les autres artistes du morceau.'],
   faq=[('Combien de temps peut durer un Reel Instagram ?', 'Jusqu’à 3 minutes quand tu l’importes, depuis janvier 2025. Un passage court du morceau, 10 à 30 secondes, se regarde plus facilement deux fois.'),
        ('Comment mettre mon son dans la bibliothèque musicale d’Instagram ?', 'Par ton distributeur, le service qui met ta musique sur les plateformes de streaming : demande-lui d’envoyer ton son à Instagram et Facebook. Une fois qu’il y est, les gens peuvent utiliser ton son dans leurs propres Reels et stories.'),
        ('C’est quoi, un post en collab ?', 'Un post que tu partages avec un autre compte : tu l’invites comme collaborateur, et une fois qu’il accepte, le post s’affiche sur vos deux profils avec les mêmes j’aime et commentaires.')],
   more=[('/fr/tarifs', 'Les tarifs de Stalak')]),
 ),
 dict(n=9, en_slug='how-to-tease-a-song', fr_slug='teaser-un-son', mascot='shock', rel=[7, 8, 1, 10],
  en=dict(
   title='How to Tease a New Song Before It Drops | Stalak',
   desc='How to tease a song before release: which part to post, how long a snippet should be, a simple plan for the weeks before, and a week of teasers from one shoot.',
   og=('Tease a new song before it drops', 'The right part, the right length, a plan'),
   h1='How to tease a new song before it drops', crumb='Tease a new song',
   lead='To tease a song, post short videos of its best part before it comes out: the hook or your strongest bars, 10 to 30 seconds, with you performing it. Start a few weeks before the release, post more often in the last days, and give the date in every post. Stalak turns one filming session into a week of different teasers.',
   sections=[
    ('Which part of the song should you tease?',
     'The part people will want to hear again: the hook, a punchline, or the first bars of a verse that hits right away. Pick one part and repeat it: hearing the same lines several times is what makes people remember them.',
     ['Skip the intro: start on a word, not on the beat.',
      'Keep a part that ends on a strong line, so the video loops well.',
      'Try two parts in the first week, then keep the one people replay.'], None),
    ('How long should a song snippet be?',
     'Long enough for the hook, short enough to watch twice: often 10 to 30 seconds. YouTube Shorts and Instagram Reels take up to 3 minutes, but a teaser should leave people wanting the rest of the song.',
     None, None),
    ('What should you post before a release?',
     'A simple plan: the first snippet three or four weeks before, then more cuts of the same part, then a video a day in release week, and the song everywhere on release day. Give the date in every caption, and share a pre-save link if your distributor gives you one.',
     ['<strong>3 to 4 weeks before</strong>: the first snippet, with the release date.',
      '<strong>2 weeks before</strong>: more cuts of the same part, from other spots.',
      '<strong>Release week</strong>: a video a day, and a countdown in your Story.',
      '<strong>Release day</strong>: “out now”, with the link in your bio and your Story.',
      '<strong>After</strong>: keep posting the song; now people can stream all of it.'], None),
    ('How do you make a week of teasers from one shoot?',
     'Film the part several times, in two or three spots, then cut it differently for each day: another order of takes, another pace, another framing. Stalak does that for you: <strong>Shuffle</strong> gives a new edit of the same takes, and a pack (Creator Plus) makes 5, 10 or 30 at once.',
     None, None),
   ],
   stalak=('Stalak in one minute', 'Here’s each step in Stalak at phone size, with the song and takes from the example above.', [
    ('song', '<strong>1. Keep just the part.</strong> Drop your song: Stalak finds the tempo. Drag the handles to keep the part you’re teasing.'),
    ('pack', '<strong>2. A week of teasers (Creator Plus).</strong> Make a pack of 5, 10 or 30 videos from the same takes, each cut differently.'),
    ('export', '<strong>3. Export and post.</strong> Each video is made on your device in 9:16, ready for TikTok, Reels and Shorts. Free videos carry a small watermark.'),
   ]),
   howto=['Pick the part people will want to hear again.', 'Film it several times, in two or three spots.',
          'Post a different cut of it regularly before the release, with the date.', 'Post a video a day in release week, then the song everywhere on release day.'],
   faq=[('Should I post a snippet before the song is out?', 'Yes. A snippet lets people hear the song before the release and tells them when it comes out. Post a part you’re sure about, in its final mix.'),
        ('How long before a release should I start teasing?', 'A few weeks gives you time to post the part several times without wearing it out. Pick a pace you can keep until release day.'),
        ('Can I tease a song that isn’t mixed yet?', 'You can, but the snippet is the version people remember. Tease the final mix when you can.')],
   more=[('/rap-snippet-video', 'Rap snippet video'), ('/music-video-maker-for-rappers', 'Music video maker for rappers')]),
  fr=dict(
   title='Comment teaser un son avant sa sortie | Stalak',
   desc='Teaser un son : quel passage poster, combien de temps doit durer un snippet, un plan pour les semaines avant la sortie et une semaine de teasers en un tournage.',
   og=('Teaser un son avant sa sortie', 'Le bon passage, la bonne durée, un plan'),
   h1='Comment teaser un son avant sa sortie', crumb='Teaser un son',
   lead='Pour teaser un son, poste avant sa sortie des vidéos courtes de son meilleur passage : le refrain ou tes meilleures phases, 10 à 30 secondes, avec toi qui l’interprètes. Commence quelques semaines avant, poste plus souvent les derniers jours, et donne la date dans chaque post. Stalak transforme un seul tournage en une semaine de teasers différents.',
   sections=[
    ('Quel passage du son faut-il teaser ?',
     'Celui que les gens voudront réécouter : le refrain, une punchline, ou les premières mesures d’un couplet qui frappe tout de suite. Choisis un passage et répète-le : c’est en entendant les mêmes phases plusieurs fois que les gens les retiennent.',
     ['Oublie l’intro : commence sur un mot, pas sur le beat.',
      'Garde un passage qui finit sur une phase forte, pour que la vidéo tourne bien en boucle.',
      'Essaie deux passages la première semaine, puis garde celui que les gens réécoutent.'], None),
    ('Combien de temps doit durer un snippet ?',
     'Assez pour le refrain, assez court pour être regardé deux fois : souvent 10 à 30 secondes. Les Shorts YouTube et les Reels Instagram acceptent jusqu’à 3 minutes, mais un teaser doit donner envie d’entendre la suite.',
     None, None),
    ('Que poster avant une sortie ?',
     'Un plan simple : le premier snippet trois ou quatre semaines avant, puis d’autres coupes du même passage, puis une vidéo par jour la semaine de la sortie, et le son partout le jour J. Donne la date dans chaque légende, et partage un lien de pre-save si ton distributeur t’en donne un.',
     ['<strong>3 à 4 semaines avant</strong> : le premier snippet, avec la date de sortie.',
      '<strong>2 semaines avant</strong> : d’autres coupes du même passage, dans d’autres lieux.',
      '<strong>La semaine de la sortie</strong> : une vidéo par jour, et un compte à rebours en story.',
      '<strong>Le jour J</strong> : « dispo partout », avec le lien dans ta bio et ta story.',
      '<strong>Après</strong> : continue de poster le son ; maintenant, on peut l’écouter en entier.'], None),
    ('Comment faire une semaine de teasers avec un seul tournage ?',
     'Filme le passage plusieurs fois, dans deux ou trois lieux, puis coupe-le différemment pour chaque jour : un autre ordre de prises, un autre rythme, un autre cadre. Stalak le fait pour toi : <strong>Régénérer</strong> donne un nouveau montage des mêmes prises, et un pack (Creator Plus) en fait 5, 10 ou 30 d’un coup.',
     None, None),
   ],
   stalak=('Stalak en une minute', 'Voici chaque étape dans Stalak en taille téléphone, avec le son et les prises de l’exemple plus haut.', [
    ('song', '<strong>1. Garde juste le passage.</strong> Dépose ton son : Stalak trouve le tempo. Déplace les poignées pour garder le passage que tu teases.'),
    ('pack', '<strong>2. Une semaine de teasers (Creator Plus).</strong> Fais un pack de 5, 10 ou 30 vidéos à partir des mêmes prises, toutes coupées différemment.'),
    ('export', '<strong>3. Exporte et poste.</strong> Chaque vidéo est fabriquée sur ton appareil en 9:16, prête pour TikTok, Reels et Shorts. Les vidéos gratuites portent un petit filigrane.'),
   ]),
   howto=['Choisis le passage que les gens voudront réécouter.', 'Filme-le plusieurs fois, dans deux ou trois lieux.',
          'Poste régulièrement une coupe différente avant la sortie, avec la date.', 'Poste une vidéo par jour la semaine de la sortie, puis le son partout le jour J.'],
   faq=[('Faut-il poster un snippet avant la sortie ?', 'Oui. Un snippet fait entendre le son avant la sortie et dit aux gens quand il arrive. Poste un passage dont tu es sûr, dans son mix final.'),
        ('Combien de temps avant la sortie commencer à teaser ?', 'Quelques semaines te laissent le temps de poster le passage plusieurs fois sans le griller. Choisis un rythme que tu peux tenir jusqu’au jour J.'),
        ('Je peux teaser un son pas encore mixé ?', 'Tu peux, mais c’est cette version que les gens retiendront. Quand c’est possible, attends le mix final pour teaser.')],
   more=[('/fr/tarifs', 'Les tarifs de Stalak')]),
 ),
 dict(n=10, en_slug='music-video-format', fr_slug='format-video-clip', mascot='coffee', rel=[1, 2, 8, 7],
  en=dict(
   title='Music Video Aspect Ratio, Size and Length | Stalak',
   desc='The right shape, size and length for a music video on YouTube, Shorts, Reels and TikTok: 16:9 or 9:16, 1920 × 1080 or 1080 × 1920, and how long it should run.',
   og=('Music video format', 'Shape, size and length for each app'),
   h1='Music video format: aspect ratio, size and length', crumb='Music video format',
   lead='A music video for YouTube is horizontal, 16:9, at 1920 × 1080 pixels, and runs the whole song. For TikTok, Instagram Reels and YouTube Shorts, it’s vertical, 9:16, at 1080 × 1920, and a short part of the song works best. Stalak makes both from the same takes (the 16:9 one with Stalak Pro).',
   sections=[
    ('What aspect ratio should a music video be?',
     '16:9, horizontal, for a music video on YouTube: it’s the shape of the YouTube player on a computer or a TV. 9:16, vertical, for TikTok, Reels and Shorts: those videos fill a phone held upright. Square (1:1) and portrait (4:5) posts work in the Instagram feed.',
     None,
     '<table><caption>Limits from YouTube’s and Instagram’s own announcements, checked in November 2026.</caption>'
     '<thead><tr><th>Where</th><th>Shape</th><th>Size (pixels)</th><th>Length</th></tr></thead><tbody>'
     '<tr><td>YouTube video</td><td>16:9 horizontal</td><td>1920 × 1080</td><td>The whole song</td></tr>'
     '<tr><td>YouTube Shorts</td><td>9:16 vertical (or square)</td><td>1080 × 1920</td><td>Up to 3 minutes</td></tr>'
     '<tr><td>Instagram Reels</td><td>9:16 vertical</td><td>1080 × 1920</td><td>Up to 3 minutes</td></tr>'
     '<tr><td>TikTok</td><td>9:16 vertical</td><td>1080 × 1920</td><td>A short part works best</td></tr></tbody></table>'),
    ('Is 1920 × 1080 or 1280 × 720 better?',
     '1920 × 1080 (1080p) is sharper and is the usual size for a music video on YouTube. 1280 × 720 (720p) makes smaller files, but looks soft on a big screen. Phones film in 1080p or more, so export in 1080p: 1920 × 1080 for horizontal, 1080 × 1920 for vertical.',
     None, None),
    ('How long should a music video be?',
     'On YouTube, as long as the song itself. On TikTok, Reels and Shorts, post a part: 10 to 30 seconds of the hook or your best bars is easy to watch twice. One catch on YouTube: a Short longer than 1 minute with an active copyright claim is blocked, so keep Shorts of a claimed song under a minute.',
     None, None),
    ('Can you make the same video in 9:16 and 16:9?',
     'Yes. Film vertically, with yourself near the middle of the frame: the vertical video uses the takes as they are, and the horizontal one can show each take whole, in the middle, over a blurred copy of itself. That’s what Stalak’s Music video mode does, from the same takes as your vertical videos.',
     None, None),
   ],
   stalak=('Stalak in one minute', 'Here’s each step in Stalak at phone size, with the song and takes from the example above.', [
    ('song', '<strong>1. Pick what you’re making.</strong> <strong>TikTok / Reels</strong> for a vertical video, <strong>Music video</strong> for the whole song in 16:9 for YouTube.'),
    ('clip', '<strong>2. Music video mode (16:9).</strong> Your takes over the whole song, at 1920 × 1080; vertical takes are shown whole, over a blurred copy of themselves. Export with Stalak Pro.'),
    ('edit', '<strong>3. Or vertical.</strong> Pick 9:16 (1080 × 1920), 4:5 for the Instagram feed (1080 × 1350) or square (1080 × 1080), all free.'),
   ]),
   howto=['Pick the app you’re posting on: YouTube, or TikTok, Reels and Shorts.', 'Use 16:9 at 1920 × 1080 for YouTube, 9:16 at 1080 × 1920 for the others.',
          'Post the whole song on YouTube, a short part on TikTok, Reels and Shorts.', 'Film vertically, with yourself near the middle, so the takes work in both shapes.'],
   faq=[('Is 16:9 or 4:3 better for a music video?', '16:9. It’s the shape of the YouTube player and of today’s screens; 4:3 is the old TV shape and leaves black bars on the sides.'),
        ('Is a 2 minute video too long?', 'Not on YouTube, where the music video runs the whole song. Shorts and Reels allow 2 minutes, but a short part is easier to watch twice, and a Short over 1 minute with an active copyright claim is blocked.'),
        ('What sizes does Stalak export?', 'Vertical 9:16 at 1080 × 1920, 4:5 at 1080 × 1350 and square at 1080 × 1080, all free; the 16:9 music video at 1920 × 1080 with Stalak Pro.')],
   more=[('/music-video-maker-for-rappers', 'Music video maker for rappers'), ('/edit-video-to-the-beat', 'Edit video to the beat')]),
  fr=dict(
   title='Format d’un clip : taille et durée selon le réseau | Stalak',
   desc='La bonne forme, la bonne taille et la bonne durée d’un clip pour YouTube, Shorts, Reels et TikTok : 16:9 ou 9:16, 1920 × 1080 ou 1080 × 1920.',
   og=('Format d’un clip', 'Forme, taille et durée selon le réseau'),
   h1='Format d’un clip : forme, taille et durée', crumb='Format d’un clip',
   lead='Un clip pour YouTube est à l’horizontale, en 16:9, en 1920 × 1080 pixels, et dure tout le morceau. Pour TikTok, les Reels Instagram et les Shorts YouTube, il est à la verticale, en 9:16, en 1080 × 1920, et un passage court marche le mieux. Stalak fait les deux à partir des mêmes prises (le 16:9 avec Stalak Pro).',
   sections=[
    ('Quel format pour un clip ?',
     '16:9, à l’horizontale, pour un clip sur YouTube : c’est la forme du lecteur YouTube sur un ordinateur ou une télé. 9:16, à la verticale, pour TikTok, Reels et Shorts : ces vidéos remplissent un téléphone tenu droit. Les posts carrés (1:1) et portrait (4:5) marchent dans le fil Instagram.',
     None,
     '<table><caption>Limites tirées des annonces de YouTube et d’Instagram, vérifiées en novembre 2026.</caption>'
     '<thead><tr><th>Où</th><th>Forme</th><th>Taille (pixels)</th><th>Durée</th></tr></thead><tbody>'
     '<tr><td>Clip YouTube</td><td>16:9 horizontal</td><td>1920 × 1080</td><td>Tout le morceau</td></tr>'
     '<tr><td>Shorts YouTube</td><td>9:16 vertical (ou carré)</td><td>1080 × 1920</td><td>Jusqu’à 3 minutes</td></tr>'
     '<tr><td>Reels Instagram</td><td>9:16 vertical</td><td>1080 × 1920</td><td>Jusqu’à 3 minutes</td></tr>'
     '<tr><td>TikTok</td><td>9:16 vertical</td><td>1080 × 1920</td><td>Un passage court marche le mieux</td></tr></tbody></table>'),
    ('1920 × 1080 ou 1280 × 720 : lequel choisir ?',
     '1920 × 1080 (1080p) est plus net, et c’est la taille habituelle d’un clip sur YouTube. 1280 × 720 (720p) fait des fichiers plus légers, mais paraît flou sur un grand écran. Les téléphones filment en 1080p ou plus : exporte en 1080p, 1920 × 1080 à l’horizontale et 1080 × 1920 à la verticale.',
     None, None),
    ('Combien de temps doit durer un clip ?',
     'Sur YouTube, la durée du morceau. Sur TikTok, Reels et Shorts, poste un passage : 10 à 30 secondes du refrain ou de tes meilleures phases se regardent facilement deux fois. Attention sur YouTube : un Short de plus d’une minute qui a une revendication de droits d’auteur active est bloqué. Si ton son est revendiqué, garde tes Shorts sous la minute.',
     None, None),
    ('Peut-on faire le même clip en 9:16 et en 16:9 ?',
     'Oui. Filme à la verticale, en restant vers le milieu de l’image : la vidéo verticale utilise les prises telles quelles, et la version horizontale peut montrer chaque prise en entier, au milieu, sur une copie floutée d’elle-même. C’est ce que fait le mode Clip de Stalak, avec les mêmes prises que tes vidéos verticales.',
     None, None),
   ],
   stalak=('Stalak en une minute', 'Voici chaque étape dans Stalak en taille téléphone, avec le son et les prises de l’exemple plus haut.', [
    ('song', '<strong>1. Choisis ce que tu fais.</strong> <strong>TikTok / Reels</strong> pour une vidéo verticale, <strong>Clip</strong> pour tout le morceau en 16:9 pour YouTube.'),
    ('clip', '<strong>2. Le mode Clip (16:9).</strong> Tes prises sur tout le morceau, en 1920 × 1080 ; les prises verticales sont montrées en entier, sur une copie floutée d’elles-mêmes. Export avec Stalak Pro.'),
    ('edit', '<strong>3. Ou à la verticale.</strong> Choisis 9:16 (1080 × 1920), 4:5 pour le fil Instagram (1080 × 1350) ou carré (1080 × 1080), tout ça gratuitement.'),
   ]),
   howto=['Choisis le réseau où tu postes : YouTube, ou TikTok, Reels et Shorts.', 'Prends 16:9 en 1920 × 1080 pour YouTube, 9:16 en 1080 × 1920 pour les autres.',
          'Poste tout le morceau sur YouTube, un passage court sur TikTok, Reels et Shorts.', 'Filme à la verticale, en restant vers le milieu, pour que tes prises marchent dans les deux formats.'],
   faq=[('16:9 ou 4:3 pour un clip ?', '16:9. C’est la forme du lecteur YouTube et des écrans d’aujourd’hui ; le 4:3 est l’ancienne forme de la télé et laisse des bandes noires sur les côtés.'),
        ('Une vidéo de 2 minutes, c’est trop long ?', 'Pas sur YouTube, où le clip dure tout le morceau. Les Shorts et les Reels acceptent 2 minutes, mais un passage court se regarde plus facilement deux fois, et un Short de plus d’une minute avec une revendication de droits d’auteur active est bloqué.'),
        ('Quelles tailles Stalak exporte ?', 'Vertical 9:16 en 1080 × 1920, 4:5 en 1080 × 1350 et carré en 1080 × 1080, tout ça gratuitement ; le clip 16:9 en 1920 × 1080 avec Stalak Pro.')],
   more=[('/fr/tarifs', 'Les tarifs de Stalak')]),
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
    """the related help pages (numbers in rel), in the same language"""
    by_n = {q['n']: q for q in PAGES}
    return [('/' + ('fr/' + by_n[n]['fr_slug'] if lang == 'fr' else by_n[n]['en_slug']), by_n[n][lang]['crumb']) for n in p.get('rel', []) if n in by_n]


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
        secs += (f'<h2>{H.escape(h2)}</h2>\n<p>{answer}</p>\n' + (f'<ul>{li(items)}</ul>\n' if items else '')
                 + ((f'<div class="tbl">{after}</div>\n' if after.startswith('<table') else f'<p>{after}</p>\n') if after else ''))
    st_h2, st_intro, st_steps = T['stalak']
    steps = ''.join(f'<li><figure><img src="/aide/{lang}-{name}.jpg" width="{shot_size(lang, name)[0]}" height="{shot_size(lang, name)[1]}" loading="lazy" '
                    f'alt="{H.escape(SHOTS[name][0 if lang == "en" else 1])}"><figcaption>{cap}</figcaption></figure></li>' for name, cap in st_steps)
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
