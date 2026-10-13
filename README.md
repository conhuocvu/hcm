# 🎓 FPT Quiz Master — Nền Tảng Ôn Thi Trắc Nghiệm Đa Môn FPT University

Ứng dụng web ôn thi trắc nghiệm thông minh dành cho sinh viên **FPT University**, tích hợp trang chọn môn học trực quan trước khi vào, hỗ trợ hai môn lý luận chính trị trọng điểm: **HCM202 (Tư tưởng Hồ Chí Minh)** và **MLN131 (Chủ nghĩa xã hội khoa học)**.

---

## 🚀 Tính năng nổi bật

### 1. 🧭 Trang Chọn Môn Học (Portal Landing View)
- Giao diện chào đón hiện đại, trực quan trước khi vào ôn tập.
- Thẻ thông tin chi tiết từng môn kèm tiến độ ghi nhớ theo thời gian thực (real-time progress bar).
- Phím tắt chọn nhanh (`Phím 1` cho HCM202, `Phím 2` cho MLN131).
- Nút **"🏠 Đổi môn"** (Phím `ESC` hoặc `P`) trên thanh điều hướng giúp chuyển đổi linh hoạt bất cứ lúc nào.
- Hỗ trợ URL Hash: `#portal`, `#hcm202`, `#mln131`, `#mln133`.

### 2. 🏛️ Môn MLN131 — Chủ Nghĩa Xã Hội Khoa Học
- **9 Bộ đề thi FE/RE thực tế đầy đủ nhất**:
  - `FA25 RE`: 60 câu hỏi có đáp án chi tiết & phân tích chuyên sâu (Câu 41 [A, B], Câu 44 [A, B, C]).
  - `SP26`: 60 câu hỏi có đáp án chi tiết & phân tích chuyên sâu (Câu 1 [A, C, D], Câu 3 [B, C], Câu 4 [A, B, C]).
  - `SU26 C1FE`: 60 câu hỏi có đáp án chi tiết & phân tích chuyên sâu (Câu 39 [A, B, C], Câu 41 [A, B], Câu 42 [A, B], Câu 52 [A, C]).
  - `SU26 C1RE`: 60 câu hỏi có đáp án chi tiết & phân tích chuyên sâu (Câu 54 [A, B], Câu 55 [B, D]).
  - `SU26 C2RE`: 60 câu hỏi có đáp án chi tiết (Câu 53 [A, C], Câu 57 [A, B, D], Câu 58 [A, C, D]).
  - `SU25 B5 RE`: 60 câu hỏi có đáp án chi tiết (Câu 40 [A, B, C], Câu 41 [A, B], Câu 43 [A, B, C], Câu 44 [A, B, C]).
  - `SU25 B5 (1)`: 60 câu hỏi có đáp án chi tiết (Câu 40 [A, B], Câu 41 [A, B, C], Câu 43 [B, D], Câu 46 [A, B, C]).
  - `SU25 FEKTS`: 60 câu hỏi có đáp án chi tiết (Câu 40 [A, B], Câu 41 [A, B], Câu 43 [A, B, C]).
  - `SP25 FE`: 60 câu hỏi có đáp án chi tiết (Câu 40 [A, B], Câu 41 [A, B], Câu 42 [A, B, C], Câu 43 [B, D]).
- **Bản Tổng Hợp Lọc Trùng Toàn Bộ (384 câu độc bản)**: Tự động phát hiện và gộp 156 lượt câu hỏi trùng lặp giữa 9 đề thi (540 câu gốc -> 384 câu duy nhất), giữ nguyên liên kết nguồn gốc đa đề (`sources`) để sinh viên dễ dàng đối chiếu.
- Hỗ trợ câu hỏi nhiều đáp án tương tác mượt mà (chọn nhiều đáp án trước khi nhấn xác nhận / Enter).
- Hỗ trợ cả 2 chế độ học: **Quizlet Lặp Lại Thông Minh (Spaced Repetition)** và **Bảng Tra Đáp Án Nhanh (Quick Key Tra Cứu)**.

### 3. 🇻🇳 Môn HCM202 — Tư Tưởng Hồ Chí Minh
- **Đầy đủ 7 bộ đề thi thực tế mới nhất**:
  - `SU26 RE`: 60 câu hỏi có đáp án chi tiết & ảnh gốc
  - `SU26 C1FE`: 60 câu hỏi có đáp án chi tiết & ảnh gốc
  - `FA25 HALF1`: 60 câu hỏi có đáp án chi tiết & ảnh gốc
  - `SU25 B5`: 60 câu hỏi có đáp án chi tiết & ảnh gốc
  - `SU25 FEKTS`: 60 câu hỏi có đáp án chi tiết & ảnh gốc
  - `SP25 FE`: 60 câu hỏi có đáp án chi tiết & ảnh gốc
  - `FA24 RE`: 60 câu hỏi có đáp án chi tiết & ảnh gốc
- **Bản Tổng Hợp Lọc Trùng Toàn Bộ (280 câu độc bản)** kèm 420 ảnh chụp đề gốc và đối chiếu biến thể.

### 4. 🎴 Hai chế độ luyện thi chuyên sâu
- **Chế độ Quizlet (Spaced Repetition)**: Tự động ghi nhớ các câu chưa thuộc, lặp lại ngắt quãng theo vòng đến khi thuộc 100%.
- **Chế độ Danh sách & Tra cứu nhanh (Quick Key)**: Bảng tra đáp án toàn bộ câu hỏi và bộ tìm kiếm tức thì theo từ khóa.
- **Tiện ích học tập**: Dark/Light mode (`Phím T`), phím tắt số (`1-4`, `A-D`, `Space/Enter`, `← / →`).


---

## 🛠️ Công nghệ sử dụng

- **Frontend**: Pure HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid, Dark/Light Mode), Vanilla JavaScript (ES6+).
- **Dữ liệu**: Bộ dữ liệu JSON & JS cấu trúc đồng bộ, kèm 420 hình ảnh minh chứng đề thi thực tế.
- Không cần cài đặt `node_modules` hay backend phức tạp - chạy trực tiếp 100% offline trên trình duyệt hoặc bất kỳ static hosting nào (GitHub Pages, Vercel, Netlify, Cloudflare Pages).

---

## 💻 Hướng dẫn chạy thử trên máy local

1. Tải hoặc clone repository về máy:
   ```bash
   git clone <URL_REPOSITORY>
   cd <thu_muc_du_an>
   ```

2. Mở file `index.html` trực tiếp trên trình duyệt hoặc sử dụng Live Server:
   - Với VS Code: Cài extension **Live Server** và nhấn **Open with Live Server**.
   - Hoặc dùng Python:
     ```bash
     python -m http.server 8000
     ```
     Sau đó truy cập: `http://localhost:8000`

---

## 🌐 Triển khai (Deploy)

Ứng dụng là dạng web tĩnh (Static Web), có thể deploy miễn phí siêu tốc qua:

1. **GitHub Pages**:
   - Vào Settings của repo trên GitHub -> **Pages**.
   - Tại mục **Build and deployment** > Chọn branch `main` (hoặc `master`), thư mục `/ (root)` và nhấn **Save**.
2. **Vercel / Netlify**:
   - Đăng nhập Vercel hoặc Netlify -> Chọn **Import Git Repository**.
   - Để nguyên cấu hình mặc định và nhấn **Deploy**.

---

## 📄 Tài liệu tổng hợp Markdown

Trong repository có kèm các tài liệu tổng hợp dạng Markdown phục vụ in ấn hoặc đọc offline:
- `HCM202_TONG_HOP_CAC_DE.md`: Tổng hợp toàn bộ các đề thi và giải thích chi tiết.
- Các file chi tiết từng đề: `HCM202_FA24_RE_DAP_AN_CHI_TIET.md`, `HCM202_SP25_FE_DAP_AN_CHI_TIET.md`, `HCM202_SU25_FEKTS_DAP_AN_CHI_TIET.md`, `HCM202_SU25_B5_DAP_AN_CHI_TIET.md`, `HCM202_FA25_HALF1_DAP_AN_CHI_TIET.md`, `HCM202_SU26_C1FE_DAP_AN_CHI_TIET.md`, `HCM202_SU26_RE_DAP_AN_CHI_TIET.md`.

---
*Chúc các bạn ôn tập tốt và đạt điểm cao trong kỳ thi HCM202!*
