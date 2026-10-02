# Video sinh nhật champagne 10 giây

Dựng video dọc 9:16 (1080×1920, 30 fps, 10 giây) từ một ảnh tĩnh, theo kiểu:
ảnh flash đêm → champagne nổ → chuyển đen trắng quay chậm → chữ "Happy Birthday".

## Cài đặt

Cần Python 3.10+ và ffmpeg.

```bash
pip install -r requirements.txt
```

Lần chạy đầu sẽ tải mô hình tách người (khoảng 170 MB).

## Chạy

```bash
python make_reel.py --photo anh.jpg --text "Happy Birthday 30" --out output/sinh-nhat.mp4
```

Tuỳ chọn:

| Tham số | Ý nghĩa |
|---|---|
| `--text` | Chữ hiện ở cuối, gõ được tiếng Việt (vd. `"Chúc mừng sinh nhật"`) |
| `--text-y 0.3` | Vị trí chữ theo chiều dọc (0 = đỉnh, 1 = đáy). Mặc định: tự đặt trên đầu người |
| `--side left/right` | Champagne phun từ góc nào. Mặc định: phía trống của ảnh |
| `--no-music` | Chỉ giữ hiệu ứng âm thanh, để tự ghép nhạc thịnh hành trên TikTok |
| `--no-cutout` | Không tách người khỏi nền (dùng khi ảnh tách bị lỗi) |
| `--preview` | Dựng nhanh để xem thử |

Ảnh chụp màn hình điện thoại có viền đen sẽ được tự cắt viền.
