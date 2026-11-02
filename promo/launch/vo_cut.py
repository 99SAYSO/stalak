#!/usr/bin/env python3
"""Cuts the launch film's voice read (Flora, Gemini 3.1 Flash TTS, voice Achird, run run_m17cfsg4mpapmkrae1kgsambgx8hf8tg, 0,013 $)
into the 12 lines of the script (SPEC.md), with the TTS's silences (0.5 to 1.7 s between phrases) cut down to short pauses,
the way Lovio's narrator speaks (and the owner's rule of 2/11: no long blanks in the voice).

In: assets/audio/vo/vo_raw.wav, assets/audio/vo/pieces.json (vo_align.py: the 33 pieces and their words).
Out: assets/audio/vo/V01.wav … V12.wav and assets/audio/vo/lines.json (start of the speech in each file, its length, the onset
of each word from the start of the speech). Run: python3 vo_align.py (once), then python3 vo_cut.py
"""
import json, pathlib, subprocess, tempfile

HERE = pathlib.Path(__file__).parent
VO = HERE / "assets/audio/vo"
RAW = VO / "vo_raw.wav"
NORM = VO / "vo_norm.wav"
SR = 48000
LEAD = 0.06                      # silence kept before the first word of each file
EDGE = 0.04                      # kept around each piece (the TTS breath in and the tail of the last word)

PIECES = json.loads((VO / "pieces.json").read_text())
SPLIT = {}
# each line: [piece index, …] and the pause before each piece after the first (seconds)
LINES = [
    ("V01", [0, 1], [0.20]),                        # What if making a music video felt as easy as having a song?
    ("V02", [2], []),                               # Meet Stalak.
    ("V03", [3, 4, 5, 6], [0.06, 0.34, 0.14]),      # The app that turns your takes into music videos. Cut on the beat, lips in sync.
    ("V04", [7, 8, 9, 10], [0.30, 0.06, 0.14]),     # No editing skills needed. Just drop in your song and your takes, and Stalak syncs them to the music.
    ("V05", [11, 12, 13, 14], [0.08, 0.18, 0.06]),  # From a TikTok to a full music video, every cut lands right on the beat.
    ("V06", [15, 16], [0.16]),                      # Beautifully edited, and ready to post.
    ("V07", [17, 18, 19, 20], [0.14, 0.14, 0.32]),  # Change the pace, add your lyrics, shuffle the cuts. Take it in any direction.
    ("V08", [21, 22], [0.12]),                      # What starts as a few takes becomes a whole week of videos.
    ("V09", [23, 24, 25, 26], [0.22, 0.22, 0.20]),  # Export it for TikTok, Reels, Shorts, or YouTube.
    ("V10", [27, 28], [0.18]),                      # Spend less time editing, and more time making music.
    ("V11", [29, 30], [0.12]),                      # So, what will you drop today?
    ("V12", [31, 32], [0.06]),                      # Start creating with Stalak.
]


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def normalize():
    """limit, then loudness-normalize the whole read (two passes, -16 LUFS, -1.5 dBTP), at 48 kHz mono"""
    pre = "aresample=%d,alimiter=limit=0.9:attack=2:release=40:level=disabled" % SR
    out = run(["ffmpeg", "-v", "info", "-hide_banner", "-i", str(RAW), "-af", pre + ",loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]).stderr
    m = json.loads(out[out.rindex("{"):out.rindex("}") + 1])
    ln = ("loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true"
          % (m["input_i"], m["input_tp"], m["input_lra"], m["input_thresh"], m["target_offset"]))
    run(["ffmpeg", "-v", "error", "-y", "-i", str(RAW), "-af", pre + "," + ln + ",aresample=%d" % SR, "-ac", "1", "-c:a", "pcm_s16le", str(NORM)])
    return m


def span(k):
    """raw [start, end] of a piece, its words (text, raw onset)"""
    if isinstance(k, str):
        i, half = int(k[:-1]), k[-1]
        a, b = SPLIT[i][0 if half == "a" else 1]
        words = [w for w in PIECES[i]["words"] if a - 0.05 <= w[1] < b]
        return a, b, words
    p = PIECES[k]
    return p["start"], p["end"], p["words"]


def cut(td, n, a, b, fade=0.006):
    out = pathlib.Path(td) / ("p%03d.wav" % n)
    a0, b0 = max(0.0, a - EDGE), b + EDGE
    af = "afade=t=in:d=%.3f,afade=t=out:st=%.3f:d=%.3f" % (fade, (b0 - a0) - fade, fade)
    run(["ffmpeg", "-v", "error", "-y", "-ss", "%.4f" % a0, "-t", "%.4f" % (b0 - a0), "-i", str(NORM), "-af", af, "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", str(out)])
    return out, a0


def silence(td, n, d):
    out = pathlib.Path(td) / ("s%03d.wav" % n)
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=%d:cl=mono" % SR, "-t", "%.3f" % d, "-c:a", "pcm_s16le", str(out)])
    return out


def dur(p):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]).stdout)


def main(only=None):
    m = normalize() if not (only and NORM.exists()) else {"input_i": "(kept)", "input_tp": "(kept)"}
    clips, n = [], 0
    with tempfile.TemporaryDirectory() as td:
        for lid, keys, gaps in LINES:
            if only and lid not in only: continue
            parts, maps, cur = [silence(td, n, LEAD)], [], LEAD
            n += 1
            for i, k in enumerate(keys):
                a, b, words = span(k)
                if i > 0:
                    g = max(0.0, gaps[i - 1] - 2 * EDGE)          # the edges already hold 2 × EDGE of quiet
                    if g > 0:
                        parts.append(silence(td, n, g)); n += 1; cur += g
                p, a0 = cut(td, n, a, b); n += 1
                parts.append(p)
                maps.append((a0, a0 + dur(p), cur, words))
                cur += dur(p)
            lst = pathlib.Path(td) / (lid + ".txt")
            lst.write_text("".join("file '%s'\n" % q for q in parts))
            out = VO / (lid + ".wav")
            run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c:a", "pcm_s16le", str(out)])
            def where(x):
                for a0, b0, at, _ in maps:
                    if a0 - 0.01 <= x <= b0 + 0.01: return at + (x - a0)
                raise ValueError(x)
            words = [w for *_, ws in maps for w in ws]
            onset = where(words[0][1])
            last_a0, last_b0, last_at, _ = maps[-1]
            end = last_at + (last_b0 - last_a0) - EDGE
            clips.append({"id": lid, "dur": round(dur(out), 3), "speech_offset": round(onset, 3), "speech_dur": round(end - onset, 3),
                          "text": " ".join(w for w, _ in words),
                          "words": [[w, round(where(x) - onset, 3)] for w, x in words]})
    if only:                                                  # merge into the existing list
        old = json.loads((VO / "lines.json").read_text())
        old.update({c["id"]: c for c in clips}); clips = list(old.values())
    (VO / "lines.json").write_text(json.dumps({c["id"]: c for c in clips}, indent=1))
    print("loudness of the read before:", m["input_i"], "LUFS, peak", m["input_tp"], "dBTP")
    tot = 0
    for c in clips:
        tot += c["speech_dur"]
        print(c["id"], "%.2f" % c["speech_dur"], c["text"])
    print("speech with the short pauses: %.2f s" % tot)


if __name__ == "__main__":
    import sys
    main(sys.argv[1:] or None)
