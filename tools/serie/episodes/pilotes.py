"""Studio Chambre — the 3 pilots, new format of 15/11/2026 at 21 h 51 (Marketing & croissance).

Format decided by the owner : 1 min 05 to 1 min 20 ; a character SHOUTS a shock line from the first second ;
a banner at the top carries the episode title in capitals and leaves when the narrator starts ; the narrator
quickly introduces the characters and the context, then narrator and characters alternate ; everything said
is written on screen with the name of who speaks.

Each episode = its card for « Studio Stalak » (collection `videos`) + its steps, word for word.
The voice is generated ONCE from these texts, after the owner's validation (règle 11) : changing a line after
that goes back to him. A line marked `same` reuses the recording of the first identical line (not generated twice).

  python3 tools/serie/episodes/pilotes.py estimate      # estimated length of each episode
  python3 tools/serie/episodes/pilotes.py fiches <dir>  # writes the 3 cards as JSON (for ArtifactData)
"""
import json
import os
import sys

SERIE = 'Studio Chambre'
FORMAT = 'Histoire animée'
RESEAUX = ['TikTok', 'Instagram Reels', 'YouTube Shorts']
SON = ('Le beat de la série (fait par nous, sans droits de tiers) et des bruitages libres de droits. '
       'Voix de synthèse (Gemini, en français) générées une seule fois, après validation.')
CPS = 14.5          # estimated speaking speed of the synthetic voices, characters per second
GAP = 0.18          # silence after a line (short : the owner does not like added pauses)
COST_RUN = 0.013    # Flora, Gemini 3.1 Flash TTS : dollars per generation, whatever its length (charged on 8/11)

# who → name on screen, voice (Gemini 3.1 Flash TTS on Flora, fr-FR)
CAST = {
    'yanis': ('YANIS', 'Puck'),            # 19 ans, enjoué
    'narrateur': ('NARRATEUR', 'Charon'),  # posé, pince-sans-rire, jamais de pause ajoutée
    'maman': ('MAMAN', 'Kore'),            # ferme
    'banquise': ('BIG BANQUISE', 'Algenib'),  # grave
    'mascotte': ('MASCOTTE', 'Algieba'),   # posé
}
VOICES = {k: v[1] for k, v in CAST.items()}

NB = ' '  # non-breaking space before ? ! : (French typography ; keeps « ?! » with its word in the subtitles)


def fr(s):
    for p in ('?!', '?', '!', ':'):
        s = s.replace(' ' + p, NB + p)
    return s.replace('?' + NB + '!', '?!')


def L(who, text, plan='', ecran='', how='', shot='', say=None, gap=None, same=False):
    """A spoken line. `say` = what the voice reads when it differs from the subtitle (e.g. « stalak point app »)."""
    return dict(kind='line', who=who, text=fr(text), say=fr(say) if say else None, plan=plan, ecran=ecran, how=how,
                shot=shot, gap=GAP if gap is None else gap, same=same)


def A(plan, dur, ecran='', shot=''):
    """An action without a new voice line (a music moment, the end card)."""
    return dict(kind='action', plan=plan, dur=dur, ecran=ecran, shot=shot)


END = ("CARTE DE FIN : le logo rond de Stalak, « stalak.app » en grand, « Gratuit, dans ton navigateur », "
       "la mascotte qui salue (un de ses autocollants officiels), et « PROCHAIN ÉPISODE : {} ».")

EPISODES = {
 'p1': dict(
  date='2026-11-18', slot=1, heure='12 h 30 (à confirmer)', num=1,
  titre="Il a fait le son de l'année… mais pas la vidéo",
  bandeau="LE SON DE L'ANNÉE",
  suivant="MA MÈRE ENTRE PENDANT LA PRISE",
  legende=("Douze heures pour une vidéo de promo… et à la fin, l'écran noir. Vous aussi, la vidéo, c'est la galère ? "
           "Studio Chambre, épisode 1. Une série Stalak."),
  motsCles=['rap', 'rappeur', 'home studio', 'promo musique', 'série animée'],
  personnages="Yanis, alias Lil Givre (rappeur, son studio c'est sa chambre) ; le narrateur (on l'entend, on ne le voit pas) ; la mascotte de Stalak (petit rôle, à la fin).",
  decors="la chambre de Yanis, le jour et la nuit ; son bureau et son ordinateur (une appli d'enregistrement dessinée par nous, un écran de montage) ; la fenêtre givrée ; son téléphone avec le vrai Stalak.",
  steps=[
   L('yanis', "Pourquoi ma bouche est décalée ?!", how='il crie', shot='cri',
     plan="CRI D'OUVERTURE. 3 h 47 du matin, la chambre dans le noir. Yanis, les mains sur la tête, devant l'écran de montage. Zoom rapide sur son visage.",
     ecran="BANDEAU en haut : « LE SON DE L'ANNÉE » (il part quand le narrateur commence)."),
   L('narrateur', "Lui, c'est Yanis. Rappeur. Son studio, c'est sa chambre.", shot='intro',
     plan="Le bandeau s'envole. Arrêt sur image sur Yanis, puis l'image rembobine comme une cassette.",
     ecran="Étiquette : « YANIS, alias LIL GIVRE »."),
   L('narrateur', "Il y a douze heures, tout allait bien.", shot='jour',
     plan="La même chambre en plein jour, la neige à la fenêtre. Yanis, casque sur les oreilles, hoche la tête, les yeux fermés."),
   L('yanis', "J'ai fait le son de l'année.", how='fier', shot='fier',
     plan="Gros plan : il ouvre les yeux, sourire immense, son pendentif en glaçon brille."),
   L('narrateur', "Enregistré sur BandLab, mixé par lui. Reste la vidéo.", shot='appli',
     plan="L'écran de son ordinateur : son appli d'enregistrement (dessinée par nous, pas celle de BandLab), le fichier « son_final_v12 ».",
     ecran="Deux tampons qui tombent avec les mots : « ENREGISTRÉ », « MIXÉ »."),
   L('yanis', "Je me filme, je monte, je poste. Dans une heure, c'est réglé.", shot='plan',
     plan="Il cale son téléphone sur une pile de livres, l'objectif tourné vers lui."),
   A("Les prises, sur le beat, sans paroles : pose 1, il pointe l'objectif ; pose 2, de trois quarts, le regard au loin ; "
     "pose 3, il enfonce son bonnet glacé, bras croisés. Coupes sèches.", 2.4, ecran="Tampons « PRISE 1 », « PRISE 2 », « PRISE 3 ».", shot='prises'),
   L('narrateur', "Minuit. Il cale sa bouche sur le son, à la main.", shot='minuit',
     plan="La nuit est tombée. L'écran de montage (dessiné) : trois prises en vrac, pas alignées sur l'onde du son.",
     ecran="Horloge « 00:00 »."),
   L('yanis', "Là… Non. Là. Non plus.", shot='caler',
     plan="Gros plan sur ses yeux qui piquent. Dans l'aperçu, sa bouche bouge, mais pas en même temps que le son."),
   L('narrateur', "Trois heures quarante-sept.", shot='retour', plan="Les tasses vides s'empilent. Retour à la toute première image.",
     ecran="Horloge « 03:47 »."),
   L('yanis', "Pourquoi ma bouche est décalée ?!", how="le même cri qu'au début, même enregistrement", shot='cri2', same=True,
     plan="Le même plan qu'à 0:00 : cette fois, on comprend."),
   L('narrateur', "Et là, la pire décision de sa carrière.", shot='ferme',
     plan="Il referme l'ordinateur d'un coup. Son pendentif en glaçon perd une goutte."),
   L('yanis', "Laisse tomber. Je poste un écran noir avec les paroles.", shot='decision',
     plan="Il tape sur son téléphone, l'air buté."),
   L('narrateur', "L'écran noir. Même sa mère a scrollé.", shot='ecrannoir',
     plan="Un téléphone : sa vidéo (écran noir, paroles en blanc). Un pouce la fait défiler sans s'arrêter."),
   L('mascotte', "Psst. Tu connais Stalak ?", shot='toc',
     plan="Toc toc à la fenêtre givrée : la mascotte de Stalak apparaît dans un coin de la vitre (un de ses autocollants officiels)."),
   L('yanis', "T'es qui, toi ? Et t'es monté comment ?", shot='surprise',
     plan="Yanis sursaute et se retourne, les yeux ronds."),
   L('narrateur', "La mascotte de Stalak. Ne posez pas de questions.", shot='mascotte',
     plan="Arrêt sur image sur la mascotte.", ecran="Étiquette : « LA MASCOTTE DE STALAK »."),
   L('mascotte', "Tu mets ton son, tes prises, et Stalak coupe sur le rythme.", shot='stalak',
     plan="Le vrai Stalak sur un téléphone (vraies captures de l'appli) : le morceau, les prises, le montage.",
     ecran="Trois étapes qui s'empilent en haut : « 1 TON SON », « 2 TES PRISES », « 3 STALAK COUPE SUR LE RYTHME »."),
   L('yanis', "Attends… Les lèvres sont calées toutes seules ?", shot='cale',
     plan="Le montage joue dans Stalak, calé sur le son. La tête de Yanis surgit dans un coin, bouche ouverte."),
   L('mascotte', "Gratuit, dans ton navigateur : stalak.app.", say="Gratuit, dans ton navigateur : stalak point app.", shot='url',
     plan="La mascotte fait un clin d'œil.", ecran="« stalak.app » en grand."),
   A("Le clip de Yanis tourne sur son écran, calé sur le beat. Il danse dans sa chambre.", 2.0, shot='clip'),
   L('narrateur', "Enfin, la vidéo. Mais Yanis a oublié un détail.", shot='danse', plan="Il danse toujours."),
   L('narrateur', "Sa mère.", shot='porte', plan="La porte s'ouvre d'un coup. Noir."),
   A(END.format("MA MÈRE ENTRE PENDANT LA PRISE"), 3.4, shot='fin'),
  ]),

 'p2': dict(
  date='2026-11-18', slot=2, heure='18 h 30 (à confirmer)', num=2,
  titre="Ma mère est entrée pendant LA prise",
  bandeau="MA MÈRE ENTRE PENDANT LA PRISE",
  suivant="LE FEAT GRATUIT",
  legende=("Elle débarque toujours au pire moment… ou au meilleur ? Chez vous aussi, quelqu'un entre pendant la prise ? "
           "Studio Chambre, épisode 2. Une série Stalak."),
  motsCles=['rap', 'rappeur', 'studio maison', 'maman', 'série animée'],
  personnages="Yanis, alias Lil Givre ; sa mère (elle entre toujours au mauvais moment) ; le narrateur (voix off).",
  decors="la chambre de Yanis la nuit, son micro et son casque ; la porte qui s'ouvre sur le couloir ; l'écran de son appli d'enregistrement (dessinée par nous) ; son téléphone avec le vrai Stalak.",
  steps=[
   L('maman', "Yanis ! T'as sorti le poulet du congélo ?!", how='elle crie', shot='cri',
     plan="CRI D'OUVERTURE. La porte de la chambre s'ouvre d'un coup : sa mère, un poulet congelé à la main. Yanis, devant son micro, figé.",
     ecran="BANDEAU en haut : « MA MÈRE ENTRE PENDANT LA PRISE » (il part quand le narrateur commence)."),
   L('narrateur', "Voici la mère de Yanis. Trente secondes plus tôt, il tenait la prise de sa vie.", shot='intro',
     plan="Arrêt sur image, puis l'image rembobine comme une cassette.", ecran="Étiquettes : « MAMAN » et « YANIS, alias LIL GIVRE »."),
   L('yanis', "Chut. Celle-là, c'est la bonne.", how='il chuchote', shot='chut',
     plan="La chambre la nuit, guirlande allumée. Yanis devant son micro, casque sur les oreilles. Le voyant rouge « REC » s'allume."),
   L('narrateur', "Prise vingt-trois. Pour une fois, tout est parfait.", shot='prise23',
     plan="L'écran de son appli : la piste de sa voix se remplit, belle et régulière.", ecran="Tampon « PRISE 23 »."),
   L('yanis', "J'viens du froid, j'ai le cœur en verglas…", how='il rappe, sur le beat', shot='rap',
     plan="Yanis rappe, les yeux fermés, une main sur le casque. Les paroles s'allument mot après mot."),
   L('maman', "Yanis ! T'as sorti le poulet du congélo ?!", how="le même cri qu'au début, même enregistrement", shot='cri2', same=True,
     plan="La porte s'ouvre d'un coup, comme au début. Le beat s'arrête net (bruit de cassette qui ralentit)."),
   L('yanis', "Maman ! J'enregistre !", shot='enregistre', plan="Yanis arrache son casque."),
   L('maman', "Tu enregistres quoi ? Tu parles tout seul depuis deux heures.", shot='quoi',
     plan="Sa mère, pas impressionnée, le poulet sous le bras."),
   L('narrateur', "Pour sa mère, le rap, c'est parler tout seul en rythme.", shot='rythme', plan="Elle referme la porte."),
   A("Les prises suivantes, en accéléré : Yanis au micro, de plus en plus fatigué.", 2.2,
     ecran="Tampons « PRISE 24 », « PRISE 30 », « PRISE 40 ».", shot='prises'),
   L('yanis', "Je l'avais. Je l'avais !", shot='effondre', plan="Il s'effondre sur son bureau."),
   L('narrateur', "Par désespoir, il réécoute la prise gâchée.", shot='reecoute',
     plan="Il clique sur lecture. À l'écran, la piste de sa voix avec un gros pic rouge marqué « MAMAN »."),
   A("On entend la prise gâchée : le début de son couplet, puis le cri de sa mère, qui tombe pile sur le temps. "
     "Pas de nouvelle voix : ce sont les deux enregistrements d'avant. Sous-titres : « YANIS : … le cœur en verglas… » puis « MAMAN : Yanis ! »",
     2.6, shot='replay'),
   L('yanis', "Attends. En vrai… ça sonne.", shot='sonne', plan="Il relève la tête, lentement."),
   L('narrateur', "Son cri tombe pile sur le temps.", shot='pile',
     plan="L'onde du cri se cale sur la grille du beat, avec une étincelle."),
   L('yanis', "Maman ! Refais ton cri, mais sur le temps !", shot='reviens',
     plan="Il ouvre la porte en grand et crie dans le couloir."),
   L('maman', "Et je veux être créditée, hein.", shot='creditee',
     plan="Sa mère réapparaît dans l'encadrement de la porte, des lunettes de soleil sur le nez."),
   L('narrateur', "Reste le clip. Et cette fois, pas de nuit blanche à caler les lèvres.", shot='feat',
     plan="Yanis cale son téléphone sur la pile de livres ; sa mère prend la pose en lunettes noires. Clin d'œil à l'épisode 1 : l'horloge « 03:47 » barrée."),
   L('yanis', "Le son, les prises, et Stalak coupe sur le rythme.", shot='stalak',
     plan="Le vrai Stalak sur le téléphone (vraies captures de l'appli) : le morceau, les prises, le montage.",
     ecran="Trois étapes en haut : « 1 TON SON », « 2 TES PRISES », « 3 STALAK COUPE SUR LE RYTHME »."),
   L('maman', "Featuring Maman. Écris-le en gros.", shot='featuring',
     plan="Le clip terminé tourne sur le téléphone : Yanis et sa mère, coupés sur le beat.", ecran="Titre du clip : « LIL GIVRE feat. MAMAN »."),
   L('narrateur', "Le clip est prêt. Prochain rêve de Yanis : un feat avec une vraie star.", shot='reve',
     plan="Yanis tape un message, des étoiles dans les yeux. Derrière lui, sa mère lève les yeux au ciel."),
   A(END.format("LE FEAT GRATUIT"), 3.4, shot='fin'),
  ]),

 'p3': dict(
  date='2026-11-18', slot=3, heure='21 h (à confirmer)', num=3,
  titre="J'ai demandé un feat gratuit à un rappeur connu",
  bandeau="LE FEAT GRATUIT",
  suivant="LE SNIPPET POSTÉ TROP TÔT",
  legende=("Un feat gratuit, qu'il a dit… Vous auriez accepté ce deal ? Studio Chambre, épisode 3. Une série Stalak."),
  motsCles=['rap', 'feat', 'rappeur indépendant', 'promo musique', 'série animée'],
  personnages="Yanis, alias Lil Givre ; Big Banquise (la star du rap glacé, il répond par notes vocales) ; sa mère (une réplique, depuis le couloir) ; le narrateur (voix off).",
  decors="la chambre de Yanis ; son téléphone (l'écran verrouillé, la discussion avec les notes vocales) ; le portrait de Big Banquise ; une vidéo décalée de Big Banquise ; son téléphone avec le vrai Stalak.",
  steps=[
   L('yanis', "Big Banquise m'a répondu !", how='il crie', shot='cri',
     plan="CRI D'OUVERTURE. Yanis bondit de sa chaise, le téléphone brandi au-dessus de la tête. Sur l'écran : une notification de Big Banquise.",
     ecran="BANDEAU en haut : « LE FEAT GRATUIT » (il part quand le narrateur commence)."),
   L('narrateur', "Big Banquise. La plus grosse star du rap glacé.", shot='intro',
     plan="Arrêt sur image. Son portrait apparaît en grand : lunettes noires, fourrure blanche, chaîne en glace.",
     ecran="Étiquette : « BIG BANQUISE »."),
   L('narrateur', "Hier soir, Yanis lui a écrit.", shot='hier',
     plan="La discussion sur le téléphone de Yanis : son message d'hier, « Salut frère, un feat gratuit ? »"),
   L('yanis', "Je lui ai demandé un feat. Gratuit.", shot='fier', plan="Yanis, très fier, montre son message à la caméra."),
   L('narrateur', "Yanis a une stratégie. Elle est mauvaise.", shot='strategie', plan="Arrêt sur son sourire."),
   L('banquise', "Un couplet, c'est deux mille.", how='note vocale', shot='vn1',
     plan="Une note vocale arrive dans la discussion. L'onde s'anime pendant qu'elle joue."),
   L('yanis', "Et pour la visibilité ?", how="il l'écrit en même temps", shot='tape', plan="Yanis tape sa réponse."),
   L('narrateur', "La visibilité. La monnaie des rappeurs sans argent.", shot='piece',
     plan="Une pièce de monnaie en glace tourne sur elle-même… et se brise."),
   L('banquise', "Frérot. T'as deux cent douze abonnés.", how='note vocale', shot='vn2', plan="Deuxième note vocale."),
   L('yanis', "Deux cent douze abonnés très fidèles.", shot='torse', plan="Yanis bombe le torse."),
   L('maman', "Deux cent onze ! Je me suis désabonnée sans faire exprès !", how='depuis le couloir', shot='maman',
     plan="La porte s'entrouvre : la tête de sa mère, son téléphone à la main."),
   L('narrateur', "Fin de la négociation. Enfin… presque.", shot='fin_nego',
     plan="Yanis, la tête dans les mains. Le téléphone vibre encore."),
   L('banquise', "Par contre… tes vidéos, tu les fais comment ? Les miennes, personne les regarde.", how='note vocale', shot='vn3',
     plan="Troisième note vocale."),
   L('narrateur', "Le secret de Big Banquise : ses vidéos de promo sont décalées.", shot='decale',
     plan="Un extrait d'une vidéo de Big Banquise : sa bouche ne suit pas le son.", ecran="Tampon « DÉCALÉ »."),
   L('yanis', "Je te fais tes vidéos, tu me fais le couplet ?", how='sourire en coin', shot='deal',
     plan="Gros plan : sourire en coin, un sourcil levé."),
   L('banquise', "Marché conclu.", how='note vocale', shot='vn4', plan="Une note vocale très courte."),
   L('narrateur', "Ce que Big Banquise ne sait pas : Yanis fait tout avec Stalak.", shot='secret',
     plan="Le vrai Stalak sur le téléphone (vraies captures de l'appli)."),
   L('yanis', "Ton son, tes prises, et Stalak coupe sur le rythme.", shot='stalak',
     plan="Le morceau, les prises, puis le montage calé sur le son.",
     ecran="Trois étapes en haut : « 1 TON SON », « 2 TES PRISES », « 3 STALAK COUPE SUR LE RYTHME »."),
   A("La vidéo de Big Banquise, refaite avec Stalak : cette fois, calée sur le son, coupée sur le beat.", 1.8, shot='clip'),
   L('narrateur', "Gratuit, dans le navigateur. Yanis ne lui a jamais dit.", shot='chut',
     plan="Yanis met un doigt sur sa bouche : chut.", ecran="« stalak.app »."),
   L('banquise', "Frérot… t'es un génie.", how='note vocale', shot='vn5', plan="Dernière note vocale."),
   L('narrateur', "Reste le snippet. Et Yanis ne sait pas attendre.", shot='teaser',
     plan="Yanis, le pouce au-dessus du bouton « Publier »."),
   A(END.format("LE SNIPPET POSTÉ TROP TÔT"), 3.4, shot='fin'),
  ]),
}


def voice_lines(ep):
    """The lines to generate for an episode, without duplicates : [(who, text read by the voice), …]."""
    out = []
    for s in EPISODES[ep]['steps']:
        if s['kind'] == 'line':
            k = (s['who'], s['say'] or s['text'])
            if k not in out:
                out.append(k)
    return out


def mode(s):
    """How a line is said ; one generation per (character, way of speaking) : the price is per generation, not per length."""
    h = s.get('how') or ''
    return 'cri' if 'crie' in h else 'chuchote' if 'chuchote' in h else 'rap' if 'rappe' in h else 'normal'


def voice_runs(ep):
    """[(who, mode, [texts])] : each group is generated in ONE run (lines separated by a silence, then cut)."""
    groups = {}
    for s in EPISODES[ep]['steps']:
        if s['kind'] == 'line' and not s['same']:
            groups.setdefault((s['who'], mode(s)), []).append(s['say'] or s['text'])
    return [(w, m, t) for (w, m), t in groups.items()]


def cost(ep):
    return len(voice_runs(ep)) * COST_RUN


def money(x):
    return ('%.2f' % x).replace('.', ',') + ' $'


def est(s):
    return 0.25 + len(s['say'] or s['text']) / CPS if s['kind'] == 'line' else s['dur']


def estimate(ep):
    """Estimated start of each step and total length (seconds), before the real voices exist."""
    t, starts = 0.0, []
    for s in EPISODES[ep]['steps']:
        starts.append(t)
        t += est(s) + (s['gap'] if s['kind'] == 'line' else 0)
    return starts, t


def mmss(t):
    return '%d:%02d' % (int(t) // 60, int(t) % 60)


CHOIX = ("À CHOISIR (images sous le script) : le style de dessin (A, B ou C) et le look du bandeau et des sous-titres (1, 2 ou 3). "
         "Écris ton choix dans la case sous le script, par exemple « style A, bandeau 2 », puis valide ou demande une correction.")

# the still images deposited in Studio Stalak (asset url → name shown under the image), in the order shown
VISUELS = {
    'style-A': ('/_blob/f8bd8912bf678b58c538f9f5da8a7b9b', 'À choisir · Style A : sticker givré (conseillé)'),
    'style-B': ('/_blob/9f441e7e1279de38601549ba81acc77e', 'À choisir · Style B : glaçon'),
    'style-C': ('/_blob/51f6f520d8f4c705dedcfd2e80fabe5f', 'À choisir · Style C : papier découpé'),
    'bandeau-1': ('/_blob/e1ba9710efa78bd28bcbfaced7438c04', 'À choisir · Bandeau et sous-titres 1 : carte givrée'),
    'bandeau-2': ('/_blob/bdf4a2b656f4afb81c04dd4b7ff14ded', 'À choisir · Bandeau et sous-titres 2 : glaçon'),
    'bandeau-3': ('/_blob/40e2ffe528c68445968286619f5f7f33', 'À choisir · Bandeau et sous-titres 3 : ruban bleu'),
    'personnages': ('/_blob/0113dbee3840b099c15a88aa568a465e', 'Les personnages'),
    'expressions': ('/_blob/f11d6d8d11cda408655b0fe65c6fd306', 'Yanis, ses expressions'),
    'decor-chambre': ('/_blob/27e8c7132f6bffd6af9204f6c974ff7e', 'La chambre, le jour et la nuit'),
    'decor-ordi': ('/_blob/6e0f8cec712d8a5f9d61650bdfab1941', "L'ordinateur : enregistrement et montage"),
    'decor-prises': ('/_blob/cb73eae8cc5517a85a8e0edf323f5fcc', "Les prises et l'écran noir"),
    'decor-mascotte': ('/_blob/602061c336d5889873297e1f41bcef07', 'La mascotte à la fenêtre, puis la danse'),
    'decor-fin': ('/_blob/63c93fb483c3c416af94067781905385', 'Le vrai Stalak et la carte de fin'),
    'decor-micro': ('/_blob/32b98f90d0b9b70cd12c80a64c965af1', 'Le micro et la prise gâchée'),
    'decor-porte': ('/_blob/50c419240c0ce72da6035e94a3b753eb', 'La porte et sa mère'),
    'decor-telephone': ('/_blob/4d63ff0dae0cfc1658272c12cce92a63', 'Le téléphone : notification et discussion'),
    'decor-banquise': ('/_blob/87d5661858e73d9c676577fa094d901c', 'Big Banquise et sa vidéo décalée'),
}
VISUELS_EP = {
    'p1': ['style-A', 'style-B', 'style-C', 'bandeau-1', 'bandeau-2', 'bandeau-3', 'personnages', 'expressions',
           'decor-chambre', 'decor-ordi', 'decor-prises', 'decor-mascotte', 'decor-fin'],
    'p2': ['personnages', 'expressions', 'decor-micro', 'decor-porte', 'decor-chambre', 'decor-fin'],
    'p3': ['personnages', 'expressions', 'decor-telephone', 'decor-banquise', 'decor-fin'],
}


def script_text(ep):
    E = EPISODES[ep]
    starts, total = estimate(ep)
    n = len(voice_lines(ep))
    first_stalak = next(st for st, s in zip(starts, E['steps']) if 'Stalak' in (s.get('text') or '') + s.get('plan', ''))
    out = [f"STUDIO CHAMBRE — ÉPISODE {E['num']} : « {E['bandeau']} »",
           f"Pilote {E['num']} sur 3 · format « {FORMAT} » · durée prévue : {mmss(total).replace(':', ' min ')} s environ "
           f"(estimée sur le texte ; la règle : entre 1 min 05 et 1 min 20).",
           f"Personnages : {E['personnages']}",
           f"Décors : {E['decors']}",
           "À l'écran : le bandeau du titre en haut pendant le cri, puis tout ce qui est dit, en sous-titres, avec le nom de celui qui parle.",
           CHOIX if ep == 'p1' else "Style de dessin, bandeau et sous-titres : ceux que tu choisis dans l'épisode 1.",
           ""]
    for st, s in zip(starts, E['steps']):
        out.append(f"{mmss(st)} · {s['plan']}")
        if s.get('ecran'):
            out.append(f"  ÉCRAN : {s['ecran']}")
        if s['kind'] == 'line':
            name = CAST[s['who']][0]
            how = f" ({s['how']})" if s['how'] else ''
            out.append(f"  {name}{how} : « {s['text']} »")
    out += ["",
            "À savoir :",
            f"- Voix : {n} répliques, générées une seule fois après ton feu vert, en {len(voice_runs(ep))} générations "
            f"(une par personnage et par façon de parler) : {money(cost(ep))} environ. "
            "Les répliques marquées « même enregistrement » ne sont pas générées deux fois.",
            f"- Stalak n'arrive qu'à la fin : à partir de {mmss(first_stalak)} environ.",
            "- Les chiffres de l'histoire (heures, numéros de prise, abonnés…) sont de la fiction sur les personnages ; aucun chiffre sur Stalak.",
            "- Si la vraie voix est un peu plus rapide ou plus lente que prévu, j'ajuste les moments sans paroles (prises, clip, carte de fin), jamais le texte.",
            "- Les dessins (personnages, décors) sont faits en code : ils ne coûtent rien. Ils sont dans « Personnages et décors », sous ce script."]
    if 'BandLab' in json.dumps(E, ensure_ascii=False):
        out.append("- BandLab : le nom seulement (ni logo, ni copie de son écran), en attente de l'avis de Juridique ; sinon « sur son ordi ».")
    return '\n'.join(out)


def fiche(ep):
    E = EPISODES[ep]
    _, total = estimate(ep)
    first = E['steps'][0]
    return dict(date=E['date'], slot=E['slot'], heure=E['heure'], titre=E['titre'],
                serie=f"{SERIE} · pilote {E['num']} sur 3 (épisode {E['num']})", format=FORMAT,
                accroche=first['text'], script=script_text(ep), legende=E['legende'], motsCles=E['motsCles'],
                son=SON, duree=f"{mmss(total).replace(':', ' min ')} s environ (estimée sur le texte)",
                reseaux=RESEAUX, statut='script', majPar='marketing',
                visuels=[dict(url=VISUELS[k][0], nom=VISUELS[k][1]) for k in VISUELS_EP[ep]])


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'estimate'
    if cmd == 'estimate':
        for ep in EPISODES:
            st, total = estimate(ep)
            n = len(voice_lines(ep))
            words = sum(len((s['say'] or s['text']).split()) for s in EPISODES[ep]['steps'] if s['kind'] == 'line')
            print(f'{ep} : {total:5.1f} s ({mmss(total)}), {n} voice lines in {len(voice_runs(ep))} runs, {words} words, voice ≈ {cost(ep):.3f} $')
    elif cmd == 'fiches':
        d = sys.argv[2]
        os.makedirs(d, exist_ok=True)
        for ep in EPISODES:
            with open(os.path.join(d, f'studio-chambre-{ep}.json'), 'w', encoding='utf-8') as f:
                json.dump(fiche(ep), f, ensure_ascii=False, indent=1)
        print('cards written in', d)
    elif cmd == 'script':
        print(script_text(sys.argv[2]))
