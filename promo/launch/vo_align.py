#!/usr/bin/env python3
"""Finds the words of the launch film's voice read (Flora, Gemini 3.1 Flash TTS, voice Achird, run run_m17cfsg4mpapmkrae1kgsambgx8hf8tg).

In: assets/audio/vo/vo_raw.wav (downloaded by the owner, 2/11 15 h 21, "Creative_App_Launch.wav"). The TTS left 0.5 to 1.7 s of silence
between phrases.
Speech pieces: ffmpeg silencedetect at -45 dB (0.25 s). Words: pocketsphinx forced alignment of each piece on its text
(and a free decoding, printed, to check that each piece holds the words it is given). Out: assets/audio/vo/pieces.json.
Run: python3 vo_align.py
"""
import json, pathlib, re, subprocess, sys
from pocketsphinx import Decoder

HERE = pathlib.Path(__file__).parent
RAW = HERE / "assets/audio/vo/vo_raw.wav"

# the pieces of speech in the order of the script (text as spoken)
TEXTS = [
    "What if making a music video", "felt as easy as having a song?",
    "Meet Stalak.",
    "The app that turns your takes", "into music videos.", "Cut on the beat,", "lips in sync.",
    "No editing skills needed.", "Just drop in your song", "and your takes,", "and Stalak syncs them to the music.",
    "From a TikTok", "to a full music video,", "every cut lands", "right on the beat.",
    "Beautifully edited,", "and ready to post.",
    "Change the pace,", "add your lyrics,", "shuffle the cuts.", "Take it in any direction.",
    "What starts as a few takes", "becomes a whole week of videos.",
    "Export it for TikTok,", "Reels,", "Shorts,", "or YouTube.",
    "Spend less time editing,", "and more time making music.",
    "So,", "what will you drop today?",
    "Start creating", "with Stalak.",
]
# words the default dictionary does not know, spelled with its phones
EXTRA = {"stalak": "S T AA L AE K", "tiktok": "T IH K T AA K", "reels": "R IY L Z", "syncs": "S IH NG K S", "youtube": "Y UW T UW B"}


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
        words = [w.lower().strip(".,?!:") for w in text.split()]
        try:
            al = decoder()
            al.set_align_text(" ".join(words)); al.start_utt(); al.process_raw(raw, full_utt=True); al.end_utt()
            segs = [(s.word, s.start_frame / 100 + a - 0.15, s.end_frame / 100 + a - 0.15) for s in (al.seg() or []) if s.word not in ("<s>", "</s>", "<sil>", "(NULL)")]
        except RuntimeError:
            segs = []
        if len(segs) != len(words):      # no alignment: the words spread by their length over the piece (the pieces are short)
            L = [len(w) + 2 for w in words]; acc, segs = 0, []
            for w, l in zip(words, L): segs.append((w, a + (b - a) * acc / sum(L), 0)); acc += l
            hyp += "   (words spread, not aligned)"
        ok = len(segs) == len(words)
        print("%7.3f-%7.3f %-52s | heard: %s%s" % (a, b, text, hyp, "" if ok else "   <-- ALIGNMENT INCOMPLETE"))
        res.append({"text": text, "start": round(a, 4), "end": round(b, 4),
                    "words": [[w0, round(max(a, s0), 3)] for w0, (w, s0, e0) in zip(text.split(), segs)] if ok else []})
    (HERE / "assets/audio/vo/pieces.json").write_text(json.dumps(res, indent=1))


if __name__ == "__main__":
    main()
