#!/bin/sh
# Ghép cảnh 7 bản 3D: hình Blender (build/3d) + lớp chữ (build/overlay) + tiếng cắt từ video chính
set -e
cd "$(dirname "$0")/.."
FF=$(python3 -c 'import imageio_ffmpeg as f;print(f.get_ffmpeg_exe())')
START=45.42; DUR=11.16
"$FF" -y -loglevel error \
  -framerate 30 -i build/3d/f%04d.png \
  -framerate 30 -i build/overlay/o%04d.png \
  -ss $START -t $DUR -i spa-nha-thor.mp4 \
  -filter_complex "[0:v]scale=1080:1920:flags=lanczos[bg];[bg][1:v]overlay=format=auto,format=yuv420p[v];[2:a]afade=t=in:d=0.15,afade=t=out:st=$(python3 -c "print($DUR-0.3)"):d=0.3[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 17 -c:a aac -b:a 192k -shortest -movflags +faststart canh7-3d.mp4
echo "xong: canh7-3d.mp4"
