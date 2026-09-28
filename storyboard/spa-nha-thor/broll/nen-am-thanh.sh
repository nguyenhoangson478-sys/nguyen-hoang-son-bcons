#!/bin/sh
# Ghép âm thanh B-roll ở mức NHẠC NỀN cho video có lời thoại (không át giọng Thoa):
#   trung bình ~ -26 LUFS, không đoạn nào vượt ~ -20 LUFS, khoét nhẹ dải giọng nói 1.5–3 kHz.
# Dùng: sh broll/nen-am-thanh.sh  (cần build/audio-broll.wav và build/cap/ nếu làm bản phụ đề)
set -e
cd "$(dirname "$0")/.."
FF=$(python3 -c 'import imageio_ffmpeg as f;print(f.get_ffmpeg_exe())')
AF="equalizer=f=2200:t=q:w=1.2:g=-3,acompressor=threshold=-24dB:ratio=1.8:attack=20:release=400:makeup=1,loudnorm=I=-25:TP=-4:LRA=11,alimiter=limit=0.6:attack=3:release=150:level=false"
"$FF" -y -loglevel error -i broll/spa-nha-thor-broll.mp4 -i build/audio-broll.wav -map 0:v:0 -map 1:a:0 -af "$AF" \
  -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart broll/spa-nha-thor-broll-co-nhac.mp4
if [ -d build/cap ]; then
  "$FF" -y -loglevel error -i broll/spa-nha-thor-broll.mp4 -framerate 30 -i build/cap/c%05d.png -i build/audio-broll.wav \
    -filter_complex "[0:v][1:v]overlay=format=auto,format=yuv420p[v];[2:a]$AF[a]" -map "[v]" -map "[a]" \
    -c:v libx264 -preset slow -crf 22 -c:a aac -b:a 160k -shortest -movflags +faststart broll/spa-nha-thor-broll-phu-de.mp4
fi
echo xong
