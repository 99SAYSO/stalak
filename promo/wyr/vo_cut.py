#!/usr/bin/env python3
"""Cuts the new voice read (Flora, Gemini 3.1 Flash TTS, voice Achird, run run_m176pp4ft9svwwc5nfv8e0xrmx8hcahz)
into the 6 lines of « Would you rather » and measures their words.

In: assets/audio/vo/wyr_raw.wav (downloaded by the owner). Out: assets/audio/vo/wyr_q1.wav ... wyr_a3.wav and
assets/audio/vo/wyr_clips.json (start of the speech in each file, its length, the onset of each word).
The read has one silence of at least 1.2 s between phrases, and the TTS also stopped before each "or":
each question is joined back with a short suspense pause (0.2 s). The questions are played 1.12x faster
(TikTok quiz pace, pitch kept: rubberband); inside the answers, the pauses are shortened (no long gaps).
Word onsets: pocketsphinx alignment, then checked by hand on the loudness curve (10 ms steps).
Run: python3 vo_cut.py
"""
import json, pathlib, subprocess, tempfile

HERE = pathlib.Path(__file__).parent
VO = HERE / "assets/audio/vo"
RAW = VO / "wyr_raw.wav"
NORM = VO / "wyr_norm.wav"
SR = 48000
LEAD = 0.06            # silence kept before the first word of each file (as in v3)

# each line: pieces (raw start, raw end, tempo), the pause before each piece after the first, the words (raw onset)
LINES = [
    ("wyr_q1", [(0.30, 2.215, 1.12), (3.858, 5.685, 1.12)], [0.20],
     [("Would", 0.300), ("you", 0.54), ("rather", 0.82), ("stop", 1.18), ("time", 1.68), ("or", 3.858), ("move", 3.99), ("things", 4.48),
      ("with", 4.87), ("your", 5.03), ("mind?", 5.16)]),
    ("wyr_q2", [(7.234, 9.735, 1.12), (11.436, 12.565, 1.12)], [0.20],
     [("Would", 7.234), ("you", 7.43), ("rather", 7.65), ("live", 7.95), ("in", 8.24), ("a", 8.31), ("world", 8.34), ("without", 8.72),
      ("music", 9.05), ("or", 11.436), ("without", 11.58), ("TV?", 11.95)]),
    ("wyr_q3", [(14.070, 16.940, 1.12), (18.483, 20.645, 1.12)], [0.20],
     [("Would", 14.070), ("you", 14.33), ("rather", 14.45), ("spend", 14.83), ("an", 15.13), ("hour", 15.41), ("editing", 15.88), ("your", 16.29),
      ("snippet", 16.45), ("or", 18.483), ("three", 18.68), ("minutes", 19.20), ("with", 19.67), ("Stalak?", 19.93)]),
    ("wyr_a1", [(22.158, 23.10, 1.0), (23.44, 25.68, 1.0)], [0.14],
     [("Well,", 22.158), ("yeah.", 22.56), ("The", 23.44), ("answer", 23.56), ("is", 23.82), ("obviously", 23.94), ("Stalak.", 24.76)]),
    ("wyr_a2", [(27.145, 29.47, 1.0), (29.79, 29.935, 1.0), (30.11, 30.55, 1.0)], [0.12, 0.08],
     [("The", 27.145), ("days", 27.36), ("of", 27.60), ("spending", 27.68), ("an", 27.98), ("hour", 28.26), ("editing", 28.68), ("a", 28.92),
      ("snippet", 29.02), ("are", 29.80), ("over.", 30.12)]),
    ("wyr_a3", [(31.762, 32.235, 1.0), (32.39, 33.905, 1.0)], [0.12],
     [("Now,", 31.762), ("you", 32.40), ("just", 32.58), ("drop", 32.86), ("your", 33.24), ("song.", 33.40)]),
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
    (VO / "wyr_clips.json").write_text(json.dumps(clips, indent=1))
    print("loudness of the read before:", m["input_i"], "LUFS, peak", m["input_tp"], "dBTP")
    for c in clips: print(c["id"], c["dur"], "speech", c["speech_dur"], " ".join("%s@%.2f" % (w, t) for w, t in c["words"]))


if __name__ == "__main__":
    main()
