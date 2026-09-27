#!/bin/sh
# Ghép âm thanh vào video: spa-nha-thor.mp4 (bản im lặng) + build/audio.wav
set -e
cd "$(dirname "$0")"
FF=$(python3 -c 'import imageio_ffmpeg as f;print(f.get_ffmpeg_exe())')
mv spa-nha-thor.mp4 spa-nha-thor-khong-nhac.mp4
"$FF" -y -loglevel error -i spa-nha-thor-khong-nhac.mp4 -i build/audio.wav \
  -af "loudnorm=I=-18:TP=-1.5:LRA=11" -c:v copy -c:a aac -b:a 192k -ar 44100 -shortest -movflags +faststart spa-nha-thor.mp4
echo "xong: spa-nha-thor.mp4"
