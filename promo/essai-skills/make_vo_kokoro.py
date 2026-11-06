#!/usr/bin/env python3
"""The voice of the Short read by Kokoro (Explainroo, on this machine), made ready for build_after.py: the same 10 lines and the
same file layout as the Flora (Achird) read in ../youtube/assets/audio/vo/ (one 48 kHz mono WAV per line + yt_clips.json with
the words and their times).

- Explainroo writes one clip per line and its word times (checked by Whisper): <project>/build/voice/<id>.wav + <id>.json.
- Tone matched a little towards Achird after Earshot's comparison (Kokoro am_fenrir was brighter and thinner: -6 dB below 250 Hz
  vs -2 dB): low shelf +4 dB at 220 Hz, high shelf -2 dB at 5.5 kHz.
- Each line brought towards the loudness of the same Achird line (BS.1770) by a plain gain, its peak kept under -1.5 dBFS; no
  limiter: Earshot heard a limited version much further from Achird (typicality z -6.4 against -3.9 without). What the peak
  does not allow is written as "gain_db" and given back in the mix (the clip's volume in build_after.py).

    python3 make_vo_kokoro.py <explainroo project> <out dir>      (needs numpy, scipy, soundfile, librosa, pyloudnorm)
"""
import json, pathlib, subprocess, sys, tempfile
import numpy as np, soundfile as sf, librosa, pyloudnorm as pyln
from scipy.signal import lfilter

HERE = pathlib.Path(__file__).parent
ACHIRD = HERE.parent / "youtube" / "assets" / "audio" / "vo"
IDS = ["L02", "L04", "L05", "L06", "L07", "L08", "S09", "L10", "L16", "L17"]
SR, PAD0, PAD1 = 48000, 0.08, 0.15


def shelf(y, f0, gain_db, kind):
    # RBJ cookbook shelving biquad, slope 1
    A = 10 ** (gain_db / 40); w0 = 2 * np.pi * f0 / SR; cw, sw = np.cos(w0), np.sin(w0); al = sw / 2 * np.sqrt(2)
    sA = 2 * np.sqrt(A) * al
    if kind == "low":
        b = [A * ((A + 1) - (A - 1) * cw + sA), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - sA)]
        a = [(A + 1) + (A - 1) * cw + sA, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - sA]
    else:
        b = [A * ((A + 1) + (A - 1) * cw + sA), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - sA)]
        a = [(A + 1) - (A - 1) * cw + sA, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - sA]
    return lfilter(np.array(b) / a[0], np.array(a) / a[0], y)


def true_peak_db(y):
    return 20 * np.log10(max(1e-9, np.max(np.abs(librosa.resample(y, orig_sr=SR, target_sr=SR * 4)))))


def limited(y, gain_db):
    """gain then ffmpeg's look-ahead limiter (ceiling -2 dBFS): reaches the loudness without plain clipping"""
    with tempfile.TemporaryDirectory() as d:
        a, b = pathlib.Path(d) / "a.wav", pathlib.Path(d) / "b.wav"
        sf.write(a, y.astype(np.float32), SR, subtype="FLOAT")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(a), "-af", "volume=%.3fdB,alimiter=limit=0.794:level=disabled:attack=5:release=60" % gain_db,
                        "-ar", str(SR), "-c:a", "pcm_f32le", str(b)], check=True)
        z, _ = sf.read(b, dtype="float64")
    return z


def main(proj, out):
    out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
    meter = pyln.Meter(SR); clips = []
    for lid in IDS:
        src = pathlib.Path(proj) / "build" / "voice" / (lid.lower() + ".wav")
        info = json.loads(src.with_suffix(".json").read_text())
        y, sr = sf.read(src, dtype="float32")
        if y.ndim > 1: y = y.mean(axis=1)
        y = librosa.resample(y, orig_sr=sr, target_sr=SR)
        y = shelf(shelf(y, 220, 4.0, "low"), 5500, -2.0, "high")
        y = np.concatenate([np.zeros(int(PAD0 * SR)), y, np.zeros(int(PAD1 * SR))]).astype(np.float64)
        ref, rsr = sf.read(ACHIRD / (lid + ".wav"), dtype="float64")
        if ref.ndim > 1: ref = ref.mean(axis=1)
        target = pyln.Meter(rsr).integrated_loudness(ref)
        g = target - meter.integrated_loudness(y)
        room = -1.5 - 20 * np.log10(max(1e-9, np.max(np.abs(y))))     # how much gain the peak allows
        y = y * 10 ** (min(g, room) / 20)
        rest = round(max(0.0, g - room), 2)                             # the rest goes back in the mix
        sf.write(out / (lid + ".wav"), y.astype(np.float32), SR, subtype="PCM_24")
        # words: the shown text, a word said as several ("stalak.app." = "Stalak dot app.") split over its time
        words = []
        for w in info["words"]:
            parts = w["spoken"].split() if w.get("spoken") and w["spoken"] != w["text"] and len(w["spoken"].split()) > 1 else [w["text"]]
            n = sum(len(p) for p in parts); t = w["start"]
            for p in parts:
                words.append([p, round(t, 3)]); t += (w["end"] - w["start"]) * len(p) / n
        t0, t1 = info["words"][0]["start"], info["words"][-1]["end"]
        clips.append({"id": lid, "dur": round(len(y) / SR, 3), "speech_offset": round(PAD0 + t0, 3), "speech_dur": round(t1 - t0, 3),
                      "text": " ".join(w["text"] for w in info["words"]), "words": [[x, round(t - t0, 3)] for x, t in words],
                      "lufs": round(meter.integrated_loudness(y), 2), "lufs_achird": round(target, 2), "gain_db": rest, "whisper": info.get("transcript")})
        print("%s %.2f s, %.1f LUFS (Achird %.1f), +%.1f dB in the mix | %s" % (lid, len(y) / SR, clips[-1]["lufs"], target, rest, info.get("transcript")))
    (out / "yt_clips.json").write_text(json.dumps(clips, indent=1))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
