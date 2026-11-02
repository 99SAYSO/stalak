#!/usr/bin/env python3
"""Cuts the YouTube voice read (Flora, Gemini 3.1 Flash TTS, voice Achird, run run_m17cx2bneez1227r8g9nrkpnsh8hc180, 0,013 $)
into the 17 lines of the script, with the TTS's long silences (1 to 2.8 s after every sentence) cut down to short pauses:
the owner asked for a voice with no long blanks (2/11).

In: assets/audio/vo/yt_raw.wav, assets/audio/vo/yt_pieces.json (vo_align.py: the 38 pieces and their words).
Out: assets/audio/vo/L01.wav … L17.wav and assets/audio/vo/yt_clips.json (start of the speech in each file, its length,
the onset of each word from the start of the speech). Run: python3 vo_align.py (once), then python3 vo_cut.py
"""
import json, pathlib, subprocess, tempfile

HERE = pathlib.Path(__file__).parent
VO = HERE / "assets/audio/vo"
RAW = VO / "yt_raw.wav"
NORM = VO / "yt_norm.wav"
SR = 48000
LEAD = 0.06                      # silence kept before the first word of each file
EDGE = 0.04                      # kept around each piece (the TTS breath in and the tail of the last word)

PIECES = json.loads((VO / "yt_pieces.json").read_text())
# "This is Stalak." holds a 0.19 s pause after "This": cut in two to keep it tight
SPLIT = {11: [(35.413, 35.910), (36.104, 36.911)]}
# each line: [piece index, …] and the pause before each piece after the first (seconds)
LINES = [
    ("L01", [0, 1], [0.14]),                       # You wrote the song. You filmed the takes.
    ("L02", [2, 3], [0.16]),                       # Now comes the part nobody sees: the edit.
    ("L03", [4], []),                              # Every take has to line up with the track.
    ("L04", [5], []),                              # Every cut has to land on the beat.
    ("L05", [6, 7], [0.10]),                       # One frame off, and your lips stop matching your words.
    ("L06", [8, 9, 10], [0.16, 0.12]),             # And tomorrow? You need another video. And the day after that.
    ("L07", ["11a", "11b"], [0.06]),               # This is Stalak.
    ("L08", [12], []),                             # Drop in your song.
    ("L09", [13, 14, 15], [0.14, 0.06]),           # Add a few takes. Import them, or film right in the app.
    ("L10", [16, 17], [0.10]),                     # Stalak lines every take up with the music, and cuts between them on the beat.
    ("L11", [18], []),                             # Your lip sync stays locked.
    ("L12", [19, 20], [0.10]),                     # Paste your lyrics and tap along: they show up right on time.
    ("L13", [21, 22, 23], [0.06, 0.14]),           # Chill or punchy? You pick the pace.
    ("L14", [24, 25, 26, 27], [0.04, 0.20, 0.04]), # Export for TikTok, Reels and Shorts. With Pro, the whole song becomes a music video for YouTube.
    ("L15", [28, 29, 30], [0.04, 0.16]),           # And with Creator Plus, one song turns into up to thirty different edits. A new video every day.
    ("L16", [31, 32], [0.16]),                     # You film. Stalak edits.
    ("L17", [33, 34, 35, 36, 37], [0.04, 0.16, 0.10, 0.20]),  # Free, in your browser. No download. No sign-up. Stalak dot app.
    ("S09", [13], []),                             # the Short: "Add a few takes." alone
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
        old = {c["id"]: c for c in json.loads((VO / "yt_clips.json").read_text())}
        old.update({c["id"]: c for c in clips}); clips = list(old.values())
    (VO / "yt_clips.json").write_text(json.dumps(clips, indent=1))
    print("loudness of the read before:", m["input_i"], "LUFS, peak", m["input_tp"], "dBTP")
    tot = 0
    for c in clips:
        tot += c["speech_dur"]
        print(c["id"], "%.2f" % c["speech_dur"], c["text"])
    print("speech with the short pauses: %.2f s" % tot)


if __name__ == "__main__":
    import sys
    main(sys.argv[1:] or None)
