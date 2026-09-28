# Spa Nhà Thor: storyboard và video hoạt hình

Video dọc 9:16, 1080×1920, 30 khung/giây, 15 cảnh, dài khoảng 2 phút 43 giây.

## Kết quả
- `spa-nha-thor.mp4`: video hoạt hình có nhạc nền piano tạm và hiệu ứng âm thanh.
- `spa-nha-thor-khong-nhac.mp4`: cùng video, không có âm thanh. Dùng bản này để tự ghép giọng đọc và nhạc trong CapCut.
- `timeline.json`: mốc thời gian (giây) của từng cảnh và từng câu lời đọc. Dùng để canh giọng đọc cho khớp.
- `storyboard.png` và `frames/`: storyboard tĩnh.

## Cấu trúc
- `src/scenes.js`: hình vẽ nhân vật và bối cảnh, dùng cho cả storyboard lẫn video.
- `src/video-scenes.js`: lời đọc và chuyển động của từng cảnh.
- `src/video.html`: bộ máy chuyển động (phụ đề chạy từng chữ, chớp mắt, miệng nói, camera zoom, chuyển cảnh).
  Tốc độ đọc giả định là `RATE = 3.6` âm tiết/giây.
- `audio.py`: tạo nhạc nền và hiệu ứng âm thanh.

## Render lại
```bash
pip install imageio-ffmpeg numpy
export NODE_PATH=$(npm root -g)
node render.mjs          # storyboard tĩnh
node render-video.mjs    # video (chưa có tiếng)
node sfx-events.mjs && python3 audio.py   # âm thanh -> build/audio.wav
```
Tiếng riêng trong `sfx/`: `whoosh.*` thay tiếng chuyển cảnh; `nhac-kinh-di.*` là nhạc nền đoạn cô bé tuyệt vọng (cảnh 5–8). Nhạc vào ở câu "Cho đến một ngày…", cao trào rơi đúng "Mụn nhiều hơn", tắt dần sau "Rốt cuộc da mình đang bị gì?". Piano được tắt trong đoạn này.

Sau đó chạy `./mux.sh` để ghép tiếng: bản im lặng đổi tên thành `spa-nha-thor-khong-nhac.mp4`, bản có tiếng là `spa-nha-thor.mp4`.

Xem trước một khung bất kỳ: `node render-video.mjs --still 12.5 40`, ảnh ra trong `build/`.
