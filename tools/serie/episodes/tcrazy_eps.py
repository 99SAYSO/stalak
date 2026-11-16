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
    'ep3': [0, 3, 10, 18, 25, 28, 30, 35, 43, 50, 58, 62, 70],
    'ep5': [0, 3, 10, 15, 18, 26, 30, 38, 46, 52, 58, 62, 70],
}
TARGET = 67.0  # seconds : the shortest episode we make (the rule says 65 s at least)

# the shouted lines (« (crie) » in the script) are written big on screen, word by word (tcrazy.py is_cri, frame.js cri)
EPISODES = {
    'ep1': dict(card='tcrazy-ep1', same={14: 1}, shots=[
        ('ep1-01', [1], dict(music='galere', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep1-02', [2], {}),
        ('ep1-03', [3, 4], {}),
        ('ep1-04', [5], {}),
        ('ep1-05', [6, 7], {}),
        ('ep1-06', [8], dict(music='plan')),
        ('ep1-07', [9], {}),
        ('ep1-08', [10], dict(music='hustle')),
        ('ep1-09', [11], {}),
        ('ep1-10', [12], dict(sfx=[('knock.wav', 0.05, 0.55)])),
        ('ep1-11', [13], dict(music='victoire', sfx=[('pop.mp3', 3.1, 0.45)])),
        ('ep1-12', [14, 15, 16], {}),
        ('ep1-13', [17], {}),
        ('ep1-14', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shouting, outraged and shocked', 4: 'rapping a punchline into the mic, eyes closed, very inspired', 5: 'shouting through a door, firm',
                  6: 'panicking, whining', 7: 'calm and firm', 8: 'amused, telling a funny twist', 9: 'amazed and excited', 11: 'sighing, discouraged',
                  12: 'friendly and a bit teasing, then helpful', 15: 'proud and cheeky', 16: 'unimpressed, then firm', 17: CTA}),
    'ep2': dict(card='tcrazy-ep2', same={}, shots=[
        ('ep2-01', [1], dict(music='galere', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep2-02', [2], {}),
        ('ep2-03', [3], {}),
        ('ep2-04', [4], dict(music='hustle')),
        ('ep2-05', [5], {}),
        ('ep2-06', [6], dict(lead=0.3, after=1.3, sfx=[('notification.mp3', 0.1, 0.4)])),
        ('ep2-07', [7, 8, 9], dict(sfx=[('knock.wav', 0.05, 0.55)])),
        ('ep2-08', ['10a'], dict(music='victoire', sfx=[('pop.mp3', 1.2, 0.4)])),
        ('ep2-09', ['10b'], dict(sfx=[('pop.mp3', 0.6, 0.45)])),
        ('ep2-10', [11, 12], {}),
        ('ep2-11', [13], {}),
        ('ep2-12', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shouting at his screen, exhausted and furious', 3: 'very sure of himself, casual', 4: 'ironic', 5: 'frantic, more and more desperate',
                  6: 'excited', 7: 'friendly and teasing', 8: 'pretending to be cool', 9: 'flat, deadpan', 11: 'moved, a bit dramatic', 12: 'dry, ironic', 13: CTA}),
    'ep4': dict(card='tcrazy-ep4', same={}, shots=[
        ('ep4-01', [1], dict(music='plan', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep4-02', [2], {}),
        ('ep4-03', [3, 4], {}),
        ('ep4-04', ['5a'], dict(music='galere')),
        ('ep4-05', ['5b', 6], {}),
        ('ep4-06', [7, 8], {}),
        ('ep4-07', [9, 10], {}),
        ('ep4-08', [11, 12, 13, 14], {}),
        ('ep4-09', [15], dict(music='victoire')),
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
        ('ep3-03', [3, 4, 5], {}),
        ('ep3-04', [6], {}),
        ('ep3-05', ['7a'], dict(music='hustle')),
        ('ep3-06', ['7b'], {}),
        ('ep3-07', ['7c'], {}),
        ('ep3-08', [8, 9], {}),
        ('ep3-09', [10], {}),
        ('ep3-10', [11], dict(music='victoire', sfx=[('pop.mp3', 2.9, 0.45)])),
        ('ep3-11', [12], {}),
        ('ep3-12', [13], {}),
        ('ep3-13', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shouting, out of breath, annoyed', 3: 'very serious, like a businessman presenting a plan', 4: 'surprised', 5: 'proud',
                  7: 'ironic', 9: 'shocked', 10: 'friendly, matter-of-fact', 12: 'impressed, then like a salesman', 13: CTA}),
    'ep5': dict(card='tcrazy-ep5', same={7: 1}, shots=[
        ('ep5-01', [1], dict(music='plan', sfx=[('whoosh-short.mp3', 0.0, 0.3)])),
        ('ep5-02', [2], {}),
        ('ep5-03', [3], {}),
        ('ep5-04', [4, 5], {}),
        ('ep5-05', [6], dict(music='hustle')),
        ('ep5-06', [7], {}),
        ('ep5-07', [8], {}),
        ('ep5-08', [9], {}),
        ('ep5-09', ['10a'], dict(music='victoire')),
        ('ep5-10', ['10b'], dict(sfx=[('pop.mp3', 0.6, 0.45)])),
        ('ep5-11', [11, 12], {}),
        ('ep5-12', [13], {}),
        ('ep5-13', [], dict(hold=3.4, sfx=[('whoosh-short.mp3', 0.75, 0.25)])),
    ], direction={1: 'shouting, running after someone', 2: 'ironic', 3: 'dreamy, eyes lost in the distance', 4: 'flat, unimpressed', 5: 'proud',
                  6: 'ironic', 8: 'disappointed', 9: 'friendly, then convincing', 11: 'very proud', 12: 'dry, ironic', 13: CTA}),
}
