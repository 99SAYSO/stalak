#!/usr/bin/env python3
"""Cuts the voice read of promo v7 (Flora, Gemini 3.1 Flash TTS, voice Achird, run run_m17fxc03nqng0vmct584p1fx6h8hcen8)
into its 9 lines and measures their words.

In: assets/audio/vo/lesson_raw.wav (downloaded by the owner). Out: assets/audio/vo/l1.wav ... l9.wav and
assets/audio/vo/lesson_clips.json (start of the speech in each file, its length, the onset of each word).
The TTS left a 1.2-1.8 s silence after every sentence (even inside a line): each line is joined back from its
sentences with short pauses (0.08-0.30 s). Word onsets: pocketsphinx alignment; the first word of each piece is
the end of the silence before it (ffmpeg silencedetect at -45 dB).
Run: python3 vo_cut.py
"""
import json, pathlib, subprocess, tempfile

HERE = pathlib.Path(__file__).parent
VO = HERE / "assets/audio/vo"
RAW = VO / "lesson_raw.wav"
NORM = VO / "lesson_norm.wav"
SR = 48000
LEAD = 0.06            # silence kept before the first word of each file (as in v5)

# each line: pieces (raw start, raw end, tempo), the pause before each piece after the first, the words (raw onset)
LINES = [
    ("l1", [(0.3115, 2.105, 1.0), (3.3125, 4.552, 1.0)], [0.30],
     [("Your", 0.3115), ("song", 0.51), ("isn't", 1.26), ("the", 1.51), ("problem.", 1.57), ("Your", 3.3125), ("snippet", 3.57), ("is.", 4.17)]),
    ("l2", [(6.1661, 7.972, 1.0), (9.5541, 10.218, 1.0), (11.3969, 12.075, 1.0), (13.5309, 14.295, 1.0)], [0.26, 0.16, 0.16],
     [("You", 6.1661), ("post", 6.32), ("what", 6.68), ("everyone", 6.86), ("posts.", 7.43), ("One", 9.5541), ("take.", 9.81),
      ("No", 11.3969), ("cuts.", 11.58), ("No", 13.5309), ("lyrics.", 13.68)]),
    ("l3", [(15.7962, 17.326, 1.0)], [],
     [("So", 15.7962), ("people", 15.92), ("scroll", 16.20), ("right", 16.65), ("past", 16.87), ("it.", 17.24)]),
    ("l4", [(19.0517, 19.988, 1.0), (21.5213, 22.530, 1.0), (23.9265, 24.730, 1.0)], [0.20, 0.16],
     [("Views", 19.0517), ("stay", 19.36), ("flat.", 19.56), ("Nobody", 21.5213), ("replays", 21.86), ("it.", 22.41),
      ("Nobody", 23.9265), ("shares", 24.21), ("it.", 24.67)]),
    ("l5", [(26.575, 28.101, 1.0), (29.4835, 30.509, 1.0)], [0.10],
     [("The", 26.575), ("snippets", 26.64), ("people", 27.15), ("replay", 27.48), ("are", 29.4835), ("built", 29.57), ("differently.", 29.95)]),
    ("l6", [(32.2064, 33.001, 1.0), (34.477, 35.731, 1.0), (37.2445, 38.888, 1.0)], [0.24, 0.24],
     [("They're", 32.2064), ("cut", 32.28), ("on", 32.54), ("the", 32.64), ("beat.", 32.72), ("They", 34.477), ("switch", 34.55),
      ("between", 34.91), ("takes.", 35.23), ("And", 37.2445), ("the", 37.34), ("lyrics", 37.40), ("are", 37.89), ("on", 38.02), ("screen.", 38.30)]),
    ("l7", [(40.5112, 42.352, 1.0), (44.1085, 44.688, 1.0), (45.9817, 47.097, 1.0)], [0.30, 0.08],
     [("That", 40.5112), ("used", 40.72), ("to", 40.93), ("take", 41.01), ("an", 41.23), ("hour", 41.47), ("of", 41.83), ("editing.", 41.91),
      ("Stalak", 44.1085), ("does", 45.9817), ("it", 46.13), ("in", 46.21), ("three", 46.31), ("minutes.", 46.63)]),
    ("l8", [(48.9527, 49.702, 1.0), (51.0814, 52.053, 1.0)], [0.22],
     [("Drop", 48.9527), ("your", 49.20), ("song.", 49.33), ("Post", 51.0814), ("it", 51.34), ("everywhere.", 51.48)]),
    ("l9", [(53.7372, 55.032, 1.0)], [],
     [("Stalak", 53.7372), ("dot", 54.28), ("app.", 54.70)]),
]



def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def normalize():
    """limit, then loudness-normalize the whole read (two passes, -16 LUFS, -1.5 dBTP), at 48 kHz like the v3 lines"""
    pre = "aresample=%d,alimiter=limit=0.9:attack=2:release=40:level=disabled" % SR
    out = run(["ffmpeg", "-v", "info", "-hide_banner", "-i", str(RAW), "-af", pre + ",loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]).stderr
    m = json.loads(out[out.rindex("{"):out.rindex("}") + 1])
    ln = ("loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true"
          % (m["input_i"], m["input_tp"], m["input_lra"], m["input_thresh"], m["target_offset"]))
    run(["ffmpeg", "-v", "error", "-y", "-i", str(RAW), "-af", pre + "," + ln + ",aresample=%d" % SR, "-ac", "1", "-c:a", "pcm_s16le", str(NORM)])
    return m


def piece(td, k, a, b, tempo, fade=0.004):
    """one piece of the normalized read, with tiny fades at its edges (they are in silence), stretched if tempo != 1"""
    out = pathlib.Path(td) / ("p%02d.wav" % k)
    af = "afade=t=in:d=%.3f,afade=t=out:st=%.3f:d=%.3f" % (fade, (b - a) - fade, fade)
    if abs(tempo - 1) > 1e-6: af += ",rubberband=tempo=%.4f:pitchq=quality:formant=preserved" % tempo
    run(["ffmpeg", "-v", "error", "-y", "-ss", "%.4f" % a, "-t", "%.4f" % (b - a), "-i", str(NORM), "-af", af, "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", str(out)])
    return out


def dur(p):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]).stdout)


def main():
    m = normalize()
    clips = []
    with tempfile.TemporaryDirectory() as td:
        k = 0
        for lid, pieces, gaps, words in LINES:
            parts, maps, cur = [], [], LEAD
            sil = pathlib.Path(td) / ("lead%02d.wav" % k)
            run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=%d:cl=mono" % SR, "-t", "%.3f" % LEAD, "-c:a", "pcm_s16le", str(sil)])
            parts.append(sil)
            for i, (a, b, tempo) in enumerate(pieces):
                if i > 0:
                    g = pathlib.Path(td) / ("gap%02d.wav" % k)
                    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=%d:cl=mono" % SR, "-t", "%.3f" % gaps[i - 1], "-c:a", "pcm_s16le", str(g)])
                    parts.append(g); cur += gaps[i - 1]
                p = piece(td, k, a, b, tempo); k += 1
                parts.append(p)
                maps.append((a, b, tempo, cur))          # raw [a, b] lands at file time cur, stretched
                cur += dur(p)
            lst = pathlib.Path(td) / (lid + ".txt")
            lst.write_text("".join("file '%s'\n" % q for q in parts))
            out = VO / (lid + ".wav")
            run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c:a", "pcm_s16le", str(out)])
            def where(x):
                for a, b, tempo, at in maps:
                    if a - 0.05 <= x <= b + 0.05: return at + (x - a) / tempo
                raise ValueError(x)
            onset = where(words[0][1])
            end = maps[-1][3] + (pieces[-1][1] - pieces[-1][0]) / pieces[-1][2]
            clips.append({"id": lid, "dur": round(dur(out), 3), "speech_offset": round(onset, 3), "speech_dur": round(end - onset - 0.03, 3),
                          "words": [[w, round(where(x) - onset, 3)] for w, x in words]})
    (VO / "lesson_clips.json").write_text(json.dumps(clips, indent=1))
    print("loudness of the read before:", m["input_i"], "LUFS, peak", m["input_tp"], "dBTP")
    for c in clips: print(c["id"], c["dur"], "speech", c["speech_dur"], " ".join("%s@%.2f" % (w, t) for w, t in c["words"]))


if __name__ == "__main__":
    main()
