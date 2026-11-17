"""Série « T-Crazy » — the episodes as validated in Studio Stalak (16/11/2026), for tools/serie/tcrazy.py.

The words are never typed again here : they come from the validated script (the card's `script`, exported to
<work>/scripts/<card>.json). This file only says
  - which storyboard shot (engine/storyboard.js) is on screen while each line is spoken : shots = [(frame, lines, options)],
    a line being its number in the script (1 = the first spoken line), or '7a' / '7b' / '7c' for the sentences of line 7
    when the shot changes in the middle of it ;
  - where the music changes (option music = galere, plan, hustle, victoire : the 4 ambiences chosen on 16/11) ;
  - which line reuses the recording of an earlier one (same = {13: 1}) ;
  - how each line is acted (DIRECTION), for the voice generated once on the validated text.
Order of publication (owner, 16/11 : « ordre comme tu veux mais je veux celle sur GTA 6 le 19 ») : ep1, ep2, ep4, ep3, ep5.
(Marketing & croissance, 16/11/2026)
"""

TRACKS = {  # Pixabay, chosen by the owner on 16/11 (docs/marketing/SERIE_UNIVERS.md) ; all without Content ID but the galère one
    # « Urban Hip Hop », alex_makemusic : chosen and sent by the owner on 16/11 at 16 h (« Scars » was too serious and sad).
    # It has Content ID on Pixabay : he keeps it anyway ; claims are cleared with https://pixabay.com/music/351577/license/
    'galere': 'galere3-351577.mp3',
    'plan': 'foireux-603287.mp3',      # « Sneeze », Rockot
    'hustle': 'hustle-618590.mp3',     # « Game Show », Kulakovka
    'victoire': 'victoire-240482.mp3',  # « Funk Upbeat », Loksii
}

SPEAKERS = {'LIAM': 'liam', 'NADIA': 'nadia', 'DEUCE': 'deuce', 'MAYA': 'maya', 'NARRATEUR': 'narrateur', 'M. REYES': 'reyes', 'BIG MO': 'bigmo'}

VOICES = {'liam': 'Fenrir', 'nadia': 'Pulcherrima', 'deuce': 'Schedar', 'maya': 'Despina', 'narrateur': 'Algieba', 'reyes': 'Rasalgethi', 'bigmo': 'Alnilam'}  # Reyes and Big Mo : chosen on 16/11 at 14 h 47
SPEED = {'liam': 1.1, 'narrateur': 1.35, 'nadia': 1.15, 'maya': 1.15, 'deuce': 1.25, 'reyes': 1.2, 'bigmo': 1.15}
# owner, 16/11 : narrator ×1,2 then « trop lent » again (×1,35) ; « tous les personnages parlent trop lentement sauf Liam »
# (Liam stays ×1,1 ; the others ×1,15 to ×1,25, Deuce being the slowest voice) ; the pauses inside a line are cut down too

PERSONA = {
    'liam': 'a cocky, overconfident 15-year-old boy who thinks he is the next rap star, energetic and playful',
    'nadia': 'a tired but sharp mother who works night shifts as a nurse, firm and funny without meaning to be',
    'deuce': "a tall, slow, very self-assured teenage hustler who sells sneakers and calls himself a manager, using business words he doesn't understand, relaxed",
    'maya': "a calm, sarcastic 15-year-old girl who is always on her phone and amused by her neighbor's failures, dry and unimpressed",
    'narrateur': 'a deep, calm, slightly ironic documentary narrator presenting a legend',
    'reyes': 'a grumpy but kind-hearted corner-shop owner in his sixties, deadpan and dry, always thinking about business',
    'bigmo': 'a confident, laid-back neighborhood rap star in his twenties, deep voice, cool and a little condescending, never in a hurry',
}
CTA = 'talking straight to the camera, friendly and convincing, like giving a tip to a friend'

# the start of each shot in the storyboard (seconds) : the shots that need more time than their lines get it, so that an
# episode lasts between 1 min 05 and 1 min 20 (rule of the owner, 15/11). Version 2 of 16/11 (the owner's remarks on episode 1).
TIMES = {
    'ep1': [0, 3, 9, 15, 20, 26, 30, 33, 38, 42, 49, 57, 63, 70],
    'ep2': [0, 3, 9, 14, 20, 25, 32, 41, 46, 53, 59, 67],
    'ep4': [0, 3, 9, 16, 22, 26, 32, 37, 47, 51, 58, 62, 70],
    'ep3': [0, 3, 10, 18, 25, 28, 30, 35, 41, 48, 52, 60, 67, 71, 79],
    'ep5': [0, 3, 10, 15, 18, 26, 30, 38, 46, 52, 58, 62, 70],
    'ep6': [0, 2, 6, 11, 17, 21, 24, 27, 33, 38, 42, 48, 54, 58, 66, 71, 79],
    # 17/11 : the new episodes (3 a day, 18 to 22/11), numbers 7 to 15 on screen
    'ep7': [0, 2, 5, 13, 18, 21, 25, 31, 37, 45, 54, 57, 61, 66, 73],
    'ep8': [0, 2, 5, 12, 17, 22, 28, 33, 37, 43, 52, 59, 64, 72],
    'ep9': [0, 2, 6, 14, 21, 26, 30, 36, 41, 51, 59, 62, 65, 73],
    'ep10': [0, 2, 5, 13, 18, 22, 29, 36, 41, 50, 58, 64, 72],
    'ep11': [0, 2, 5, 12, 18, 22, 28, 35, 38, 47, 52, 59, 65, 69, 76],
}
TARGET = 65.0  # seconds : the rule says 65 s at least. The pauses added to get there are small (tcrazy.py plan) : the owner
# does not want blanks (16/11, episode 2 : « il faut cut à ce moment la séquence, il y a un blanc trop long sinon »), so the
# time comes from things that happen on screen (fixed=True : a shot whose actions are timed on its lines, never padded)

# the shout of the hook (« (crie) » on the first line) is written big on screen, word by word (tcrazy.py is_cri, frame.js cri).
# dip=True : a change of time or place (the shot with its caption, or the narrator saying where we are) : the picture goes
# dark and comes back, the caption is read before anyone speaks (owner, 16/11 at 17 h 04 : « un enfant doit pouvoir comprendre »)
EPISODES = {
    'ep1': dict(card='tcrazy-ep1', same={14: 1}, shots=[
        ('ep1-01', [1], dict(music='galere', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep1-02', [2], {}),
        ('ep1-03', [3, 4], dict(dip=True)),
        ('ep1-04', [5], {}),
        ('ep1-05', [6, 7], {}),
        ('ep1-06', [8], dict(music='plan')),
        ('ep1-07', [9], {}),
        ('ep1-08', [10], dict(music='hustle', dip=True)),
        ('ep1-09', [11], {}),
        ('ep1-10', [12], dict(sfx=[('knock.wav', 0.05, 0.55)])),
        ('ep1-11', [13], dict(music='victoire', sfx=[('pop.mp3', 3.1, 0.45)])),
        ('ep1-12', [14, 15, 16], dict(lead=2.2, fixed=True, sfx=[('steps.wav', 0.3, 0.25)])),  # v5 : Nadia walks in, then speaks
        ('ep1-13', [17], {}),
        ('ep1-14', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shouting, outraged and shocked', 4: 'rapping a punchline into the mic, eyes closed, very inspired', 5: 'shouting through a door, firm',
                  6: 'panicking, whining', 7: 'calm and firm', 8: 'amused, telling a funny twist', 9: 'amazed and excited', 11: 'sighing, discouraged',
                  12: 'friendly and a bit teasing, then helpful', 15: 'proud and cheeky', 16: 'unimpressed, then firm', 17: CTA}),
    'ep2': dict(card='tcrazy-ep2', same={}, shots=[
        ('ep2-01', [1], dict(music='galere', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep2-02', [2], {}),
        ('ep2-03', [3], dict(dip=True)),
        ('ep2-04', [4], dict(music='hustle', dip=True)),
        # v3 (owner's remarks on v2) : the editor moves (he drags his video, « DÉCALÉ » comes back on each « Non ») ; then he posts
        # it (« Publier », « Vidéo publiée ! »), a notification, the comment, and the cut right after « Un commentaire ! »
        ('ep2-05', [5], dict(lead=0.9, fixed=True, sfx=[('click.mp3', 0.95, 0.3), ('error.mp3', 2.2, 0.16), ('click.mp3', 2.5, 0.3), ('error.mp3', 3.94, 0.16)])),
        ('ep2-06', [6], dict(lead=2.6, after=0.35, fixed=True, sfx=[('click.mp3', 1.0, 0.35), ('ping.mp3', 1.25, 0.3), ('notification.mp3', 2.05, 0.4)])),
        ('ep2-07', [7, 8, 9], dict(lead=1.3, sfx=[('knock.wav', 0.05, 0.55)])),  # the knock is heard, Liam looks up, then « Coucou » (v3 : 1.3 s, the episode stays over a minute)
        ('ep2-08', ['10a'], dict(music='victoire', sfx=[('pop.mp3', 1.2, 0.4)])),
        ('ep2-09', ['10b'], dict(after=1.0, sfx=[('pop.mp3', 0.6, 0.45)])),  # v3 : his clip keeps playing a moment, cut on the beat
        ('ep2-10', [11, 12], dict(lead=0.8, sfx=[('sparkle.mp3', 0.1, 0.25)])),  # v3 : he looks at his clip, moved, before he speaks
        ('ep2-11', [13], {}),
        ('ep2-12', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shouting at his screen, exhausted and furious', 3: 'very sure of himself, casual', 4: 'ironic', 5: 'frantic, more and more desperate',
                  6: 'excited', 7: 'friendly and teasing', 8: 'pretending to be cool', 9: 'flat, deadpan', 11: 'moved, a bit dramatic', 12: 'dry, ironic', 13: CTA}),
    'ep4': dict(card='tcrazy-ep4', same={}, shots=[
        ('ep4-01', [1], dict(music='plan', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep4-02', [2], {}),
        ('ep4-03', [3, 4], {}),
        # v2 (owner's remarks on v1) : one place at a time, the school then the empty court with its tumbleweed (a gust of wind) ;
        # then he posts his song with a still picture, in a feed like TikTok's (the tap at 2.9 s), and nobody reacts
        ('ep4-04', ['5a'], dict(music='galere', dip=True, fixed=True, sfx=[('whoosh.mp3', 2.36, 0.3)])),
        ('ep4-05', ['5b', 6], {}),
        ('ep4-06', [7, 8], dict(dip=True, fixed=True, sfx=[('click.mp3', 2.9, 0.35), ('ping.mp3', 3.15, 0.3)])),
        ('ep4-07', [9, 10], dict(dip=True)),
        ('ep4-08', [11, 12, 13, 14], dict(dip=True, lead=2.6, fixed=True, sfx=[('steps.wav', 0.5, 0.25)])),  # v3 : Maya walks in, then speaks
        ('ep4-09', [15], dict(music='victoire', dip=True)),
        ('ep4-10', [16], dict(sfx=[('pop.mp3', 2.9, 0.45)])),
        ('ep4-11', [17], dict(lead=0.6, sfx=[('notification.mp3', 0.2, 0.4)])),
        ('ep4-12', [18], {}),
        ('ep4-13', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'horrified, shouting', 3: 'confident', 4: 'patient, like explaining the obvious', 5: 'ironic', 6: 'casual, a bit muffled behind a shop window',
                  8: 'disappointed', 9: 'hopeful, calling from the kitchen', 10: 'busy and distracted, from another room', 11: 'friendly and cheerful',
                  12: 'discouraged', 14: 'determined', 17: 'thrilled', 18: CTA}),
    'ep3': dict(card='tcrazy-ep3', same={}, shots=[
        ('ep3-01', [1], dict(music='plan', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep3-02', [2], {}),
        ('ep3-03', [3, 4, 5], dict(dip=True)),
        ('ep3-04', [6], {}),
        ('ep3-05', ['7a'], dict(music='hustle')),
        ('ep3-06', ['7b'], {}),
        ('ep3-07', ['7c'], {}),
        # v3 (owner, 16/11 : « l'entrée de Big Mo et Maya sont trop rapides ») : Big Mo walks in while Liam recognises him,
        # they talk, Big Mo walks away ; Liam alone, disgusted, collapses ; Maya walks in before she speaks
        ('ep3-08', [8], dict(lead=1.3, after=0.5, fixed=True, sfx=[('steps.wav', 0.0, 0.25)])),
        ('ep3-09', [9, 10], dict(after=2.0, fixed=True, sfx=[('steps.wav', -2.25, 0.25)])),
        ('ep3-10', [11], dict(after=0.9, fixed=True, sfx=[('whoosh-short.mp3', -0.85, 0.2), ('thud.wav', -0.36, 0.3)])),
        ('ep3-11', [12], dict(lead=2.5, fixed=True, sfx=[('steps.wav', 0.3, 0.25)])),
        ('ep3-12', [13], dict(music='victoire', lead=0.5, after=1.0, fixed=True, sfx=[('pop.mp3', 3.4, 0.45)])),  # v2 : Liam takes his phone first ; the clip plays on a moment
        ('ep3-13', [14], {}),
        ('ep3-14', [15], {}),
        ('ep3-15', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shouting, out of breath, annoyed', 3: 'very serious, like a businessman presenting a plan', 4: 'surprised', 5: 'proud',
                  7: 'ironic', 8: 'amazed and starstruck, half to himself', 10: 'shocked', 11: 'disgusted and discouraged, to himself',
                  12: 'friendly, matter-of-fact', 14: 'impressed, then like a salesman', 15: CTA}),
    'ep5': dict(card='tcrazy-ep5', same={7: 1}, shots=[
        ('ep5-01', [1], dict(music='plan', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep5-02', [2], {}),
        ('ep5-03', [3], dict(dip=True)),
        ('ep5-04', [4, 5], dict(after=0.3)),
        ('ep5-05', [6], dict(music='hustle', after=0.6)),  # v2 : a beat to see the scooter stall
        ('ep5-06', [7], {}),
        ('ep5-07', [8], dict(dip=True, lead=1.7, fixed=True)),  # v2 : Liam with his phone, then his twelve takes, then he speaks
        ('ep5-08', [9], dict(lead=2.4, fixed=True, sfx=[('steps.wav', 0.2, 0.25)])),  # v2 : Maya walks in before she speaks
        ('ep5-09', ['10a'], dict(music='victoire', lead=0.5)),  # v2 : his phone comes up, then the narrator
        ('ep5-10', ['10b'], dict(after=2.6, sfx=[('pop.mp3', 0.6, 0.45)])),  # v2 : the clip plays on a moment, cut on the beat (longer : the result is the point)
        ('ep5-11', [11, 12], {}),
        ('ep5-12', [13], dict(after=0.4)),
        ('ep5-13', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shouting, running after someone', 2: 'ironic', 3: 'dreamy, eyes lost in the distance', 4: 'flat, unimpressed', 5: 'proud',
                  6: 'ironic', 8: 'disappointed', 9: 'friendly, then convincing', 11: 'very proud', 12: 'dry, ironic', 13: CTA}),
    # « L'appli a fermé » (the owner's idea of 16/11 ; script v2 and storyboard validated on 16/11) : Triller named, never its logo.
    # The snippet plays then freezes at the end of the narrator's line ; the camera counts 3, 2, 1 before the narrator ; Maya walks
    # into take 2 while Liam raps ; the clapperboard of take 3 ; he posts the clip (« Publier »), the likes, then the comment.
    'ep6': dict(card='tcrazy-ep6', same={}, shots=[
        ('ep6-01', [1], dict(music='plan', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep6-02', [2], {}),
        ('ep6-03', [3], {}),
        ('ep6-04', [4], dict(lead=0.2, after=0.8, fixed=True, sfx=[('error.mp3', -0.8, 0.16)])),
        ('ep6-05', [5], dict(music='galere')),
        ('ep6-06', [6], {}),
        ('ep6-07', [7], {}),
        ('ep6-08', [8, 9], dict(lead=0.3)),
        ('ep6-09', [10, 11], {}),
        ('ep6-10', [12], dict(music='hustle', dip=True)),
        ('ep6-11', [13], dict(lead=1.55, fixed=True, sfx=[('click.mp3', 0.05, 0.3), ('click.mp3', 0.5, 0.3), ('click.mp3', 0.95, 0.3), ('ping.mp3', 1.35, 0.3)])),
        ('ep6-12', [14], dict(lead=2.15, after=0.2, fixed=True, sfx=[('steps.wav', 0.2, 0.25)])),
        ('ep6-13', [15], dict(lead=0.8, fixed=True, sfx=[('click.mp3', 0.1, 0.4)])),
        ('ep6-14', [16, 17], dict(music='victoire', lead=0.1, sfx=[('pop.mp3', 2.7, 0.45)])),
        ('ep6-15', [18], dict(lead=3.35, fixed=True, sfx=[('click.mp3', 0.8, 0.35), ('ping.mp3', 1.05, 0.3), ('notification.mp3', 1.6, 0.4), ('notification.mp3', 2.2, 0.3), ('ping.mp3', 2.9, 0.3)])),
        ('ep6-16', [19], {}),
        ('ep6-17', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shocked and outraged, shouting at his phone', 2: 'disappointed and sulking, a bit whiny', 5: 'worried, a bit lost',
                  6: 'deadpan, teasing his friend', 7: 'calm and sure of herself', 8: 'curious, a bit suspicious', 9: 'calm, explaining simply, as if it were obvious',
                  10: 'suspicious', 11: 'dry and amused', 12: 'like a film director, excited and loud', 14: 'excited, jumping into the shot',
                  15: 'satisfied, like a film director wrapping a scene', 17: 'thrilled', 18: 'amazed and excited', 19: CTA}),
    # ---------------- 17/11 : 3 a day (owner, 17/11 at 3 h 57) ; scripts and storyboards validated on 17/11 ----------------
    # « Les tee-shirts » (n° 7, 18/11 at 18 h) : Deuce's merch ; the street in the afternoon, then two hours later at sunset
    'ep7': dict(card='tcrazy-ep7', same={}, shots=[
        ('ep7-01', [1], dict(music='plan', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep7-02', [2], {}),
        ('ep7-03', [3], {}),
        ('ep7-04', [4], {}),
        ('ep7-05', [5], dict(after=0.4)),  # M. Reyes goes back into his shop
        ('ep7-06', [6], dict(music='galere', dip=True, lead=0.6)),
        ('ep7-07', [7, 8, 9], dict(lead=2.1, fixed=True, sfx=[('steps.wav', 0.2, 0.25)])),  # Maya walks in, then speaks (owner, 16/11 : entrances not too fast)
        ('ep7-08', [10], {}),
        ('ep7-09', [11, 12], {}),
        ('ep7-10', [13, 14, 15], dict(lead=0.2)),
        ('ep7-11', [], dict(music='hustle', hold=2.8, sfx=[('click.mp3', 0.1, 0.35)])),  # the takes : Liam raps on his song, Deuce dances
        ('ep7-12', [16], dict(lead=0.1, sfx=[('pop.mp3', 2.6, 0.45)])),
        ('ep7-13', [17], dict(music='victoire', lead=2.0, fixed=True, sfx=[('click.mp3', 0.8, 0.35), ('ping.mp3', 1.05, 0.3), ('notification.mp3', 1.9, 0.4)])),  # the post's own times (storyboard posted : the comment at 1.9 s)
        ('ep7-14', [18], {}),
        ('ep7-15', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shouting, outraged, holding up a tee-shirt with a kid\'s face on it', 2: 'very proud, like a young businessman', 4: 'very sure of himself, explaining business',
                  5: 'dry, deadpan, grumpy', 6: 'ironic', 7: 'curious, casual', 8: 'proud, pointing at himself', 9: 'deadpan, honestly confused',
                  10: 'like a genius with a brilliant idea', 11: 'calm, matter-of-fact', 12: 'whining, discouraged', 13: 'calm, explaining simply',
                  14: 'suspicious', 15: 'casual, as if it were obvious', 16: 'warm', 17: 'thrilled and triumphant', 18: CTA}),
    # « Nuit à 17 h » (n° 8, 18/11 at 21 h) : the street of houses at nightfall (rue 1 'nuit'), the three lights, the filter
    'ep8': dict(card='tcrazy-ep8', same={}, shots=[
        ('ep8-01', [1], dict(music='plan', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep8-02', [2], {}),
        ('ep8-03', [3], {}),
        ('ep8-04', [4], dict(music='galere', sfx=[('click.mp3', 0.2, 0.35)])),  # the phone light comes on
        ('ep8-05', [5], dict(music='hustle', lead=0.8)),  # take 1 on the screen of Deuce's phone
        ('ep8-06', [6], dict(lead=0.3, sfx=[('click.mp3', 0.05, 0.35)])),  # take 2 under the street lamp
        ('ep8-07', [7, 8], dict(lead=2.1, fixed=True, sfx=[('steps.wav', 0.2, 0.25)])),  # Maya walks in, then speaks
        ('ep8-08', [9], {}),
        ('ep8-09', [10, 11], dict(lead=0.4, sfx=[('click.mp3', 0.05, 0.35)])),  # take 3 ; M. Reyes at his door
        ('ep8-10', [12, 13, 14], dict(lead=0.3)),
        ('ep8-11', [15], dict(lead=0.2, after=0.6, sfx=[('pop.mp3', 0.8, 0.45)])),
        ('ep8-12', [16, 17], dict(music='victoire', lead=2.3, fixed=True, sfx=[('click.mp3', 0.8, 0.35), ('ping.mp3', 1.05, 0.3), ('notification.mp3', 1.9, 0.4)])),
        ('ep8-13', [18], {}),
        ('ep8-14', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shocked and outraged, shouting at the dark sky', 2: 'whining, frustrated', 4: 'very sure of himself, proud of his idea',
                  5: 'deadpan, puzzled, looking at his screen', 6: 'amused', 7: 'curious and amused', 8: 'proud, insisting', 9: 'calm, helpful',
                  10: 'grumpy, dry, deadpan', 11: 'quick, giving in', 12: 'calm, explaining simply', 13: 'puzzled', 14: 'dry, teasing',
                  15: 'warm', 16: 'cocky, pretending it was all planned', 17: 'flat, ironic', 18: CTA}),
    # « Le cahier de rap » (n° 9, 19/11 at 21 h) : the kitchen at dawn, then after school (cuisine 1, 'nuit' then 'jour')
    'ep9': dict(card='tcrazy-ep9', same={}, shots=[
        ('ep9-01', [1], dict(music='plan', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep9-02', [2], {}),
        ('ep9-03', [3], {}),
        ('ep9-04', [4], {}),  # the notebook, close : Nadia reads
        ('ep9-05', [5, 6], {}),
        ('ep9-06', [7], dict(music='galere')),
        ('ep9-07', [8], dict(sfx=[('pop.mp3', 0.1, 0.4)])),  # his video, too fast : « Il dit quoi ? »
        ('ep9-08', [9, 10], dict(dip=True, lead=2.6, fixed=True, sfx=[('steps.wav', 0.5, 0.25)])),  # after school : Maya walks in, then speaks
        ('ep9-09', [11, 12, 13], dict(lead=0.3)),
        ('ep9-10', [14], dict(music='hustle', lead=0.2, after=0.8, sfx=[('pop.mp3', 2.6, 0.45)])),  # the clip : each sentence when he says it
        ('ep9-11', [], dict(music='victoire', hold=3.4, sfx=[('click.mp3', 0.8, 0.35), ('ping.mp3', 1.05, 0.3), ('notification.mp3', 1.9, 0.4)])),  # he posts, the comment comes at 1.9 s and stays to be read
        ('ep9-12', [15], dict(lead=2.1, fixed=True, sfx=[('steps.wav', 0.2, 0.25)])),  # Nadia walks in, her mug in her hand
        ('ep9-13', [16], {}),
        ('ep9-14', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shouting, shocked, holding up her son\'s notebook', 2: 'panicked and embarrassed, waking up suddenly',
                  4: 'reading aloud from a notebook, slowly, quietly moved', 5: 'hiding that she is moved, dry', 6: 'outraged, very proud of himself',
                  7: 'calm and direct, a bit tired', 8: 'admitting it, a bit embarrassed', 9: 'casual, saying hi, curious', 10: 'surprised and touched',
                  11: 'calm, explaining simply', 12: 'hopeful, amazed', 13: 'dry, teasing', 14: 'warm', 15: 'warm and proud, then firm like a mother', 16: CTA}),
    # « L'extrait de 3 h du matin » (n° 10, 20/11 at 18 h) : Liam's room in the day (chambre 2)
    'ep10': dict(card='tcrazy-ep10', same={}, shots=[
        ('ep10-01', [1], dict(music='plan', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep10-02', [2], {}),
        ('ep10-03', [3], dict(sfx=[('notification.mp3', 0.2, 0.35)])),  # the extract posted at 3 h 12
        ('ep10-04', [4], {}),
        ('ep10-05', [5], dict(lead=2.1, fixed=True, sfx=[('steps.wav', 0.2, 0.25)])),  # Deuce walks in, then speaks
        ('ep10-06', [6, 7], dict(music='galere')),
        ('ep10-07', [8], {}),  # his computer : 4 hours of editing for 15 seconds
        ('ep10-08', [9, 10], dict(lead=2.1, fixed=True, sfx=[('steps.wav', 0.2, 0.25)])),  # Maya walks in, then speaks
        ('ep10-09', [11], {}),
        ('ep10-10', [12], dict(music='hustle', lead=0.2, after=0.6, sfx=[('pop.mp3', 2.6, 0.45)])),  # Stalak cuts the extract while Liam writes
        ('ep10-11', [13, 14], dict(music='victoire', lead=2.3, fixed=True, sfx=[('click.mp3', 0.8, 0.35), ('ping.mp3', 1.05, 0.3), ('notification.mp3', 1.9, 0.4)])),
        ('ep10-12', [15], {}),
        ('ep10-13', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shocked, shouting at his phone', 2: 'panicked, whining', 4: 'ironic', 5: 'very proud, like a businessman, saying hi',
                  6: 'overwhelmed, stressed', 7: 'very sure of himself, explaining business', 8: 'outraged and exhausted', 9: 'casual, saying hi, curious',
                  10: 'exasperated', 11: 'calm, explaining simply', 12: 'warm', 13: 'very proud, like a genius', 14: 'dry, teasing', 15: CTA}),
    # « La voix perdue » (n° 11, 20/11 at 21 h) : the kitchen in the evening (cuisine 1 'nuit', instead of the living room), then the court at 16 h
    'ep11': dict(card='tcrazy-ep11', same={}, shots=[
        ('ep11-01', [1], dict(music='plan', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep11-02', [2], {}),
        ('ep11-03', [3], {}),
        ('ep11-04', [4], dict(lead=2.1, fixed=True, sfx=[('steps.wav', 0.2, 0.25)])),  # Nadia walks in with tea, then speaks
        ('ep11-05', [5], dict(sfx=[('typing.mp3', 0.3, 0.3)])),  # he can't speak : he types
        ('ep11-06', [6], dict(music='galere')),
        ('ep11-07', [7, 8, 9], {}),
        ('ep11-08', [], dict(dip=True, hold=2.4)),  # « Le lendemain, 16 h · le terrain »
        ('ep11-09', [10], dict(music='hustle', lead=0.4, sfx=[('click.mp3', 0.1, 0.35)])),  # the takes : he moves his lips, without a sound
        ('ep11-10', [11, 12], dict(lead=2.1, fixed=True, sfx=[('steps.wav', 0.2, 0.25)])),  # Maya walks in, then speaks
        ('ep11-11', [13], {}),
        ('ep11-12', [14], dict(lead=0.2, after=0.6, sfx=[('pop.mp3', 2.6, 0.45)])),
        ('ep11-13', [15], dict(music='victoire', lead=2.3, fixed=True, sfx=[('click.mp3', 0.8, 0.35), ('ping.mp3', 1.05, 0.3), ('notification.mp3', 1.9, 0.4)])),
        ('ep11-14', [16], {}),
        ('ep11-15', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shouting, panicked', 2: 'whispering with almost no voice, hoarse, pretending to be fine', 4: 'calm and firm, like a nurse giving orders',
                  5: 'ironic', 6: 'very serious, like a businessman in a crisis', 7: 'dry, a bit tired', 8: 'calm, explaining simply', 9: 'amazed, excited',
                  10: 'warm', 11: 'casual, curious, saying hi', 12: 'proud', 13: 'calm, explaining simply', 14: 'warm', 15: 'very sure of himself, like a genius',
                  16: 'whispering with almost no voice, hoarse, talking straight to the camera, friendly, like giving a tip to a friend'}),
}
