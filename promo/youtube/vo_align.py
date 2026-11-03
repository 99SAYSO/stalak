#!/usr/bin/env python3
"""Finds the words of the YouTube voice read (Flora, Gemini 3.1 Flash TTS, voice Achird, run run_m17cx2bneez1227r8g9nrkpnsh8hc180).

In: assets/audio/vo/yt_raw.wav (downloaded by the owner, 2/11). The TTS left 1 to 2.8 s of silence after every sentence.
Speech pieces: ffmpeg silencedetect at -45 dB (0.25 s). Words: pocketsphinx forced alignment of each piece on its text
(and a free decoding, printed, to check that each piece holds the words it is given). Out: assets/audio/vo/yt_pieces.json.
Run: python3 vo_align.py
"""
import json, pathlib, re, subprocess, sys
from pocketsphinx import Decoder

HERE = pathlib.Path(__file__).parent
RAW = HERE / "assets/audio/vo/yt_raw.wav"

# the pieces of speech in the order of the script (text as spoken)
TEXTS = [
    "You wrote the song.", "You filmed the takes.",
    "Now comes the part nobody sees:", "the edit.",
    "Every take has to line up with the track.",
    "Every cut has to land on the beat.",
    "One frame off,", "and your lips stop matching your words.",
    "And tomorrow?", "You need another video.", "And the day after that.",
    "This is Stalak.",
    "Drop in your song.",
    "Add a few takes.", "Import them,", "or film right in the app.",
    "Stalak lines every take up with the music,", "and cuts between them on the beat.",
    "Your lip sync stays locked.",
    "Paste your lyrics and tap along:", "they show up right on time.",
    "Chill", "or punchy?", "You pick the pace.",
    "Export for TikTok,", "Reels and Shorts.", "With Pro,", "the whole song becomes a music video for YouTube.",
    "And with Creator Plus,", "one song turns into up to thirty different edits.", "A new video every day.",
    "You film.", "Stalak edits.",
    "Free,", "in your browser.", "No download.", "No sign-up.", "Stalak dot app.",
]
# words the default dictionary does not know, spelled with its phones
EXTRA = {"stalak": "S T AA L AE K", "tiktok": "T IH K T AA K", "reels": "R IY L Z", "sign-up": "S AY N AH P"}


def pieces():
    out = subprocess.run(["ffmpeg", "-v", "info", "-hide_banner", "-i", str(RAW), "-af", "silencedetect=noise=-45dB:d=0.25", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", out)]
    en = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", out)]
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(RAW)], capture_output=True, text=True).stdout)
    sil = list(zip(st, en))
    return [(sil[i][1], sil[i + 1][0] if i + 1 < len(sil) else dur) for i in range(len(sil)) if (sil[i + 1][0] if i + 1 < len(sil) else dur) - sil[i][1] > 0.05]


def pcm(a, b, pad=0.15):
    return subprocess.run(["ffmpeg", "-v", "error", "-ss", "%.3f" % max(0, a - pad), "-t", "%.3f" % (b - a + 2 * pad), "-i", str(RAW),
                           "-ar", "16000", "-ac", "1", "-f", "s16le", "-"], capture_output=True).stdout


def decoder():
    d = Decoder(loglevel="FATAL")
    for w, ph in EXTRA.items():
        try: d.add_word(w, ph, True)
        except Exception: pass
    return d


def main():
    P = pieces()
    print(len(P), "pieces for", len(TEXTS), "texts")
    if len(P) != len(TEXTS):
        for a, b in P: print("  %.3f-%.3f" % (a, b))
        sys.exit("piece count differs: fix TEXTS or the silence threshold")
    res = []
    for (a, b), text in zip(P, TEXTS):
        raw = pcm(a, b)
        free = decoder(); free.start_utt(); free.process_raw(raw, full_utt=True); free.end_utt()
        hyp = free.hyp().hypstr if free.hyp() else ""
        al = decoder()
        words = [w.lower().strip(".,?!:") for w in text.split()]
        al.set_align_text(" ".join(words)); al.start_utt(); al.process_raw(raw, full_utt=True); al.end_utt()
        segs = [(s.word, s.start_frame / 100 + a - 0.15, s.end_frame / 100 + a - 0.15) for s in al.seg() if s.word not in ("<s>", "</s>", "<sil>", "(NULL)")]
        ok = len(segs) == len(words)
        print("%7.3f-%7.3f %-52s | heard: %s%s" % (a, b, text, hyp, "" if ok else "   <-- ALIGNMENT INCOMPLETE"))
        res.append({"text": text, "start": round(a, 4), "end": round(b, 4),
                    "words": [[w0, round(max(a, s0), 3)] for w0, (w, s0, e0) in zip(text.split(), segs)] if ok else []})
    (HERE / "assets/audio/vo/yt_pieces.json").write_text(json.dumps(res, indent=1))


if __name__ == "__main__":
    main()
