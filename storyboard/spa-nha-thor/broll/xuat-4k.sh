#!/bin/sh
# Ghép bản 4K: hình (spa-nha-thor-broll-4k.mp4) + phụ đề 4K (build/cap-4k) + âm thanh nền (build/audio-broll.wav)
set -e
cd "$(dirname "$0")/.."
FF=$(python3 -c 'import imageio_ffmpeg as f;print(f.get_ffmpeg_exe())')
AF=$(grep '^AF=' broll/nen-am-thanh.sh | sed 's/^AF="//; s/"$//')
V="-c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -profile:v high -level 5.1"
"$FF" -y -loglevel error -i broll/spa-nha-thor-broll-4k.mp4 -framerate 30 -i build/cap-4k/c%05d.png -i build/audio-broll.wav \
  -filter_complex "[0:v][1:v]overlay=format=auto,format=yuv420p[v];[2:a]$AF[a]" -map "[v]" -map "[a]" $V -c:a aac -b:a 192k -shortest -movflags +faststart build/4k-phu-de.mp4
"$FF" -y -loglevel error -i broll/spa-nha-thor-broll-4k.mp4 -i build/audio-broll.wav -map 0:v:0 -map 1:a:0 -af "$AF" $V -c:a aac -b:a 192k -shortest -movflags +faststart build/4k-co-nhac.mp4
ls -la build/4k-*.mp4
