#!/bin/bash
# master.sh <in.mp4> <out.mp4> : audio to -14 LUFS integrated, peaks limited (-1.4 dBFS), video copied
IN=$1; OUT=$2
I=$(ffmpeg -hide_banner -i "$IN" -vn -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
G=$(python3 -c "print(round(-14.0 - ($I), 2))")
echo "integrated before: $I LUFS -> gain $G dB"
ffmpeg -v error -y -i "$IN" -c:v copy -af "volume=${G}dB,alimiter=limit=0.85:attack=4:release=60:level=disabled" -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
ffmpeg -hide_banner -i "$OUT" -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):" | tail -3
