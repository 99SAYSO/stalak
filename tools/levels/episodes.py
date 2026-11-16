"""Les épisodes LEVELS : le texte validé dans Studio Stalak (mot pour mot), découpé en niveaux.

who : 'r' le rappeur, 'rp' le rappeur dans son téléphone, 'v' le Videur. Voix brutes : ~/work/levels/voice/raw/<ep>_<id>.wav
Les paroles des snippets (niveaux 4 et 5) sont écrites pour LEVELS : elles ne viennent d'aucun vrai morceau.
"""

# la voix off du niveau 5 : une seule prise (Enceladus), coupée en 3 sur ses pauses
OFF = dict(cuts=[(0.30, 3.55), (4.05, 5.78), (5.98, 7.55)],
           texts=['Niveau 5. Il filme trois prises sur son son.', 'Stalak les coupe sur le rythme…', '… et ses lèvres restent synchro.'])

EPISODES = {
    'drill': dict(
        genre='DRILL', question='Tu t\'es arrêté à quel niveau, toi ?',
        levels=[
            dict(n=1, label='il veut un feat avec Pop Smoke', special=dict(behind='echelle', pose='echelle'),
                 lines=[dict(id='r1', who='r', text='Bouge, je vais chercher Pop Smoke au paradis pour le feat.'),
                        dict(id='v1', who='v', text='Pas sur la liste.')],
                 coup=dict(type='baffe', word='BAF !', sfx='baffe')),
            dict(n=2, label='il fait la drill dans sa tête', hx=600, special=dict(talk='drill', pose='drill'),
                 lines=[dict(id='r2', who='r', text='Gang, gang, gang, gang, gang…', tail=600),
                        dict(id='v2', who='v', text='Recule.')],
                 coup=dict(type='pied', word='BONK !', sfx='pied', bx=600, by=1340)),
            dict(n=3, label='20 secondes d\'intro', phone=dict(type='intro', lieu='immeuble', mask=True),
                 lines=[dict(id='r3', who='rp', text='Yo, c\'est le bloc, abonnez-vous, partagez, ça arrive bientôt…'),
                        dict(id='v3', who='v', text='Il rappe quand ?')],
                 coup=dict(type='chute', prop='enclume', word='CLANG !', sfx='clang', bx=560, by=820)),
            dict(n=4, label='monté avec une appli classique', phone=dict(type='desync'),
                 lines=[dict(id='v4', who='v', text='Ta bouche est en retard.')], lead=1.3,
                 coup=dict(type='big', prop='poele', word='BONG !', sfx='bong', bx=560, by=820)),
            dict(n=5, label='snippet monté avec Stalak', lieux=['capot', 'immeuble', 'porte'], bpm=140,
                 lyrics=['Bonnet bleu dans le bloc,', 'j\'ai le flow qui gèle tout'],
                 lines=[dict(id='v5', who='v', text='… Entre.')]),
        ]),
}
