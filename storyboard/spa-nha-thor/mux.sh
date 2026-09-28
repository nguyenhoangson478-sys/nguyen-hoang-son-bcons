#!/bin/sh
# Ghép âm thanh build/audio.wav vào bản hình im lặng -> spa-nha-thor.mp4
# (Lần đầu sau khi render-video.mjs: bản im lặng được đổi tên thành spa-nha-thor-khong-nhac.mp4)
set -e
cd "$(dirname "$0")"
FF=$(python3 -c 'import imageio_ffmpeg as f;print(f.get_ffmpeg_exe())')
if [ ! -f spa-nha-thor-khong-nhac.mp4 ] || [ spa-nha-thor.mp4 -nt spa-nha-thor-khong-nhac.mp4 -a -z "$("$FF" -i spa-nha-thor.mp4 2>&1 | grep Audio)" ]; then
  mv spa-nha-thor.mp4 spa-nha-thor-khong-nhac.mp4
fi
"$FF" -y -loglevel error -i spa-nha-thor-khong-nhac.mp4 -i build/audio.wav -map 0:v:0 -map 1:a:0 \
  -af "loudnorm=I=-18:TP=-1.5:LRA=11,alimiter=limit=0.8:attack=2:release=80:level=false" -c:v copy -c:a aac -b:a 192k -ar 44100 -shortest -movflags +faststart spa-nha-thor.mp4
echo "xong: spa-nha-thor.mp4"
