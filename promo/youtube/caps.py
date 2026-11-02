"""The captions of the film and of the Short (the owner, 2/11: « des sous-titres à l'écran… un texte en motion design… changer de typo
sur les mots importants »): the voice, a few words at a time, the key words in another typeface (the engine draws them, renderCaps).
CH: for each voice line, its chunks (first word, last word, key words), word indexes as in assets/audio/vo/yt_clips.json."""
CH = {                                                      # chunks end on the voice's pauses (a fast "up with…" is never split)
    "L01": [(0, 3, [3]), (4, 7, [7])],                       # You wrote the SONG. / You filmed the TAKES.
    "L02": [(0, 5, [4, 5]), (6, 7, [7])],                    # Now comes the part NOBODY SEES: / the EDIT.
    "L03": [(0, 8, [4, 5, 8])],                              # Every take has to LINE UP with the TRACK.
    "L04": [(0, 7, [1, 7])],                                 # Every CUT has to land on the BEAT.
    "L05": [(0, 2, [1, 2]), (3, 6, [5]), (7, 9, [9])],       # One FRAME OFF, / and your LIPS stop / matching your WORDS.
    "L06": [(0, 1, [1]), (2, 5, [4]), (6, 10, [8, 9, 10])],  # And TOMORROW? / You need ANOTHER video. / And the DAY AFTER THAT.
    "L07": [(0, 2, [2])],                                    # This is STALAK.
    "L08": [(0, 3, [3])],                                    # Drop in your SONG.
    "L09": [(0, 3, [3]), (4, 11, [4, 7])],                   # Add a few TAKES. / IMPORT them, or FILM right in the app.
    "S09": [(0, 3, [3])],                                    # Add a few TAKES.
    "L10": [(0, 7, [0, 7]), (8, 14, [9, 14])],               # STALAK lines every take up with the MUSIC, / and CUTS between them on the BEAT.
    "L11": [(0, 2, [1, 2]), (3, 4, [4])],                    # Your LIP SYNC / stays LOCKED.
    "L12": [(0, 2, [2]), (3, 5, [4]), (6, 11, [9, 10, 11])], # Paste your LYRICS / and TAP along: / they show up RIGHT ON TIME.
    "L13": [(0, 2, [0, 2]), (3, 6, [6])],                    # CHILL or PUNCHY? / You pick the PACE.
    "L14": [(0, 2, [0, 2]), (3, 5, [3, 5]), (6, 7, [7]), (8, 10, [9, 10]), (11, 16, [13, 14, 16])],   # … / the WHOLE SONG / becomes a MUSIC VIDEO for YOUTUBE.
    "L15": [(0, 3, [2, 3]), (4, 5, [4, 5]), (6, 12, [10]), (13, 17, [16, 17])],
}
LEAD = 0.04        # a word shows 0.04 s before it is heard
SWAP = 0.07        # within a line, a chunk leaves in 0.07 s, just before the next one's first word (never two chunks at once)
OUT = 0.15         # a line's last chunk fades in 0.15 s


def make_caps(lids, at, VO, dur, captioned, barriers=()):
    """-> [{line (index in lids), from, to, key, end, out}]: a chunk stays until the next one comes (within its line),
    or until 0.45 s after its line, and always leaves before the next voice line (and before any barrier: the payoff);
    it fades from end to end + out"""
    seq = [(li, lid, a, b, k) for li, lid in enumerate(lids) if lid in captioned for a, b, k in CH[lid]]
    for lid in captioned:
        assert CH[lid][-1][1] == len(VO[lid]["words"]) - 1 and CH[lid][0][0] == 0, lid
        assert all(c1[0] == c0[1] + 1 for c0, c1 in zip(CH[lid], CH[lid][1:])), lid
    res = []
    for i, (li, lid, a, b, keys) in enumerate(seq):
        w = VO[lid]["words"]
        if i + 1 < len(seq) and seq[i + 1][1] == lid:              # the next chunk of the line takes its place
            out = SWAP
            end = at[lid] + w[seq[i + 1][2]][1] - LEAD - SWAP + 0.01
            hold = w[seq[i + 1][2]][1] - w[b][1]
            assert hold >= 0.2, (lid, a, b, round(hold, 3))
        else:                                                      # the line's last chunk: gone before the next line
            out = OUT
            nxt = min([at[l] for l in lids if at[l] > at[lid]] + [x + LEAD for x in barriers if x > at[lid]] + [1e9])
            end = min(at[lid] + dur(lid) + 0.45, nxt - LEAD - OUT - 0.01)
            hold = end - (at[lid] + w[b][1] - LEAD)
            assert hold >= 0.25, (lid, a, b, round(hold, 3))
        res.append({"line": li, "from": a, "to": b, "key": keys, "end": round(end, 3), "out": out})
    return res


# The payoff's lyric (the owner, 2/11 11 h 27: « j'ai mis de l'or sur mes plaies, cicatrices valent des millions », shown in
# everyday US English). Word times are take times (the takes' own sound, assets/audio/takes_song.wav), read from its vocal
# phrases and from his lips ("j'ai" 21.26, the m of "mis" 21.50, "sur" 22.17, the comma 22.50-22.54, "cicatrices" 22.56).
LYRIC = [(21.24, [[("I", 21.26), ("put", 21.50), ("gold", 21.80)], [("on", 22.17), ("my", 22.40), ("wounds,", 22.47)]]),
         (22.55, [[("scars", 22.56), ("worth", 22.98)], [("millions.", 23.12)]])]


def payoff_lyric(tau0, t_end):
    """-> [{t0, t1, lines: [[[word, t]]]}], times from the payoff's start (take time tau0); the last part stays until t_end"""
    out = []
    for i, (a, lines) in enumerate(LYRIC):
        b = LYRIC[i + 1][0] if i + 1 < len(LYRIC) else tau0 + t_end
        out.append({"t0": round(a - tau0, 3), "t1": round(b - tau0, 3), "lines": [[[w, round(t - tau0, 3)] for w, t in ln] for ln in lines]})
    assert out[0]["t0"] >= 0 and out[-1]["t1"] > out[-1]["lines"][-1][-1][1] + 0.4, out
    return out
