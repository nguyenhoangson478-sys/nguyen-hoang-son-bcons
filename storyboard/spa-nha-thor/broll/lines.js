// Lời kể kèm mốc thời gian (giây) — lấy từ src/video.html; *chữ* là từ nhấn
const LINES = [
 {
  "t": "Cô bé chỉ muốn *hết mụn* trước ngày tốt nghiệp.",
  "s": 0.4,
  "e": 3.18,
  "q": false
 },
 {
  "t": "Không ngờ thứ mất đi sau đó…",
  "s": 4.48,
  "e": 6.42,
  "q": false
 },
 {
  "t": "lại *không chỉ là tiền*.",
  "s": 7.37,
  "e": 8.76,
  "q": false
 },
 {
  "t": "Cô bé tìm đến Thoa với *một câu chuyện rất buồn*.",
  "s": 9.96,
  "e": 13.85,
  "q": false
 },
 {
  "t": "cô bé sắp *chụp ảnh tốt nghiệp*.",
  "s": 14.45,
  "e": 16.39,
  "q": false
 },
 {
  "t": "Da có *mấy nốt mụn*.",
  "s": 16.84,
  "e": 18.23,
  "q": false
 },
 {
  "t": "Cô bé muốn đẹp hơn một chút trong ngày quan trọng nhất của tuổi sinh viên.",
  "s": 18.68,
  "e": 23.13,
  "q": false
 },
 {
  "t": "Rồi cô bé bắt đầu nghe người ta tư vấn.",
  "s": 24.33,
  "e": 27.11,
  "q": false
 },
 {
  "t": "*Một liệu trình.*",
  "s": 27.56,
  "e": 28.39,
  "q": false
 },
 {
  "t": "Rồi thêm *một sản phẩm*.",
  "s": 28.84,
  "e": 30.23,
  "q": false
 },
 {
  "t": "Rồi thêm *một lần chăm sóc* nữa.",
  "s": 30.68,
  "e": 32.62,
  "q": false
 },
 {
  "t": "Mỗi thứ nghe qua *đều có lý*.",
  "s": 33.07,
  "e": 35.02,
  "q": false
 },
 {
  "t": "Cho đến một ngày…",
  "s": 36.22,
  "e": 37.33,
  "q": false
 },
 {
  "t": "cô bé *không còn dám soi gương*.",
  "s": 38.28,
  "e": 40.22,
  "q": false
 },
 {
  "t": "*Mụn nhiều hơn.*",
  "s": 45.82,
  "e": 46.66,
  "q": false
 },
 {
  "t": "*Da đỏ hơn.*",
  "s": 47.11,
  "e": 47.94,
  "q": false
 },
 {
  "t": "Và số tiền bỏ ra thì đã *nhiều hơn rất nhiều*",
  "s": 48.39,
  "e": 51.44,
  "q": false
 },
 {
  "t": "so với số tiền ban đầu cô bé định dành cho việc chăm da.",
  "s": 51.89,
  "e": 55.78,
  "q": false
 },
 {
  "t": "Điều đau nhất *không phải là mất tiền*.",
  "s": 56.98,
  "e": 59.21,
  "q": false
 },
 {
  "t": "Mà là lúc ấy cô bé vẫn không biết:",
  "s": 59.66,
  "e": 62.16,
  "q": false
 },
 {
  "t": "“Rốt cuộc da mình đang bị gì?”",
  "s": 62.76,
  "e": 64.7,
  "q": true
 },
 {
  "t": "Mười năm làm nghề,",
  "s": 66.3,
  "e": 67.41,
  "q": false
 },
 {
  "t": "Thoa đã nghe và chứng kiến *quá nhiều câu chuyện* như vậy.",
  "s": 67.86,
  "e": 71.19,
  "q": false
 },
 {
  "t": "Và Thoa bắt đầu nghĩ:",
  "s": 72.59,
  "e": 73.98,
  "q": false
 },
 {
  "t": "có phải người ta *thiếu tiền* đâu.",
  "s": 74.58,
  "e": 76.53,
  "q": false
 },
 {
  "t": "Người ta thiếu *một người nói thật* với họ ngay từ đầu.",
  "s": 76.98,
  "e": 80.31,
  "q": false
 },
 {
  "t": "Nói rằng cái này *chưa cần làm*.",
  "s": 80.76,
  "e": 82.71,
  "q": false
 },
 {
  "t": "Cái kia *chưa cần mua*.",
  "s": 83.16,
  "e": 84.54,
  "q": false
 },
 {
  "t": "Và có những lúc…",
  "s": 84.99,
  "e": 86.11,
  "q": false
 },
 {
  "t": "điều tốt nhất cho làn da là *đừng làm thêm gì nữa*.",
  "s": 87.06,
  "e": 90.39,
  "q": false
 },
 {
  "t": "Đó là lý do Thoa rời Sài Gòn,",
  "s": 91.59,
  "e": 93.81,
  "q": false
 },
 {
  "t": "về *Làng Đại học*.",
  "s": 94.26,
  "e": 95.37,
  "q": false
 },
 {
  "t": "Ở đây có *rất nhiều bạn trẻ*.",
  "s": 96.77,
  "e": 98.72,
  "q": false
 },
 {
  "t": "Tuổi còn rất dài.",
  "s": 99.17,
  "e": 100.28,
  "q": false
 },
 {
  "t": "Nhưng *tiền thì thường rất ngắn*.",
  "s": 100.73,
  "e": 102.39,
  "q": false
 },
 {
  "t": "Trong khi quảng cáo ngoài kia…",
  "s": 102.84,
  "e": 104.51,
  "q": false
 },
 {
  "t": "lại luôn có cách khiến người ta cảm thấy *mình đang thiếu một thứ gì đó*.",
  "s": 105.46,
  "e": 109.91,
  "q": false
 },
 {
  "t": "Vì vậy Thoa bắt đầu hành trình xây kênh *Spa Nhà Thor*",
  "s": 111.11,
  "e": 114.44,
  "q": false
 },
 {
  "t": "với một mong muốn rất đơn giản:",
  "s": 114.89,
  "e": 116.83,
  "q": false
 },
 {
  "t": "Trước khi bạn bỏ tiền cho làn da, *hãy hiểu nó trước*.",
  "s": 117.43,
  "e": 120.77,
  "q": false
 },
 {
  "t": "Thoa *không bán phép màu*.",
  "s": 121.22,
  "e": 122.61,
  "q": false
 },
 {
  "t": "Thoa muốn chia sẻ những điều mà đáng lẽ bạn nên biết trước khi bỏ tiền,",
  "s": 123.06,
  "e": 127.5,
  "q": false
 },
 {
  "t": "trước khi thử một thứ gì đó lên da,",
  "s": 127.95,
  "e": 130.45,
  "q": false
 },
 {
  "t": "và trước khi *quá muộn để quay lại*.",
  "s": 130.9,
  "e": 133.12,
  "q": false
 },
 {
  "t": "Để một ngày nào đó…",
  "s": 134.32,
  "e": 135.71,
  "q": false
 },
 {
  "t": "khi bước vào một spa,",
  "s": 136.66,
  "e": 138.05,
  "q": false
 },
 {
  "t": "bạn không còn ngồi đó chờ người khác *quyết định thay mình*.",
  "s": 138.5,
  "e": 141.83,
  "q": false
 },
 {
  "t": "Bạn biết làn da của mình *cần gì*.",
  "s": 142.28,
  "e": 144.51,
  "q": false
 },
 {
  "t": "Và bạn có quyền nói:",
  "s": 144.96,
  "e": 146.34,
  "q": false
 },
 {
  "t": "Không, cái này tôi chưa cần.",
  "s": 146.94,
  "e": 148.61,
  "q": false
 },
 {
  "t": "Nếu bạn đang loay hoay với làn da của mình…",
  "s": 150.21,
  "e": 152.99,
  "q": false
 },
 {
  "t": "thì ở lại đây với kênh *Spa Nhà Thor*.",
  "s": 153.94,
  "e": 156.44,
  "q": false
 },
 {
  "t": "Thoa sẽ cùng bạn bắt đầu từ *những điều căn bản nhất*.",
  "s": 156.89,
  "e": 160.22,
  "q": false
 }
];
