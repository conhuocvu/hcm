# 🇻🇳 HCM202 - Hệ Thống Ôn Luyện & Giải Đề Tư Tưởng Hồ Chí Minh

Ứng dụng web ôn thi trắc nghiệm môn **Tư tưởng Hồ Chí Minh (HCM202)** dành cho sinh viên FPT University. Bao gồm ngân hàng câu hỏi thực tế từ các kỳ thi gần nhất kèm giải thích chi tiết, dẫn chứng giáo trình và ảnh chụp đề gốc.

---

## 🚀 Tính năng nổi bật

- **Đầy đủ các bộ đề thi mới nhất**:
  - `FA25 HALF1`: 60 câu hỏi có đáp án chi tiết
  - `SU25 B5`: 60 câu hỏi có đáp án chi tiết
  - `SU26 C1FE`: 60 câu hỏi có đáp án chi tiết
  - `SU26 RE`: 60 câu hỏi có đáp án chi tiết
- **Hai chế độ luyện thi**:
  - 📖 **Chế độ Ôn tập**: Xem đáp án và giải thích chi tiết ngay sau khi chọn.
  - ⏱️ **Chế độ Thi thử**: Bấm giờ làm bài 60 phút, nộp bài tính điểm và chấm chi tiết.
- **Tính năng hỗ trợ học tập**:
  - Tìm kiếm câu hỏi tức thì theo từ khóa.
  - Bộ lọc thông minh theo kỳ thi, câu đã làm, câu trả lời sai.
  - Xem ảnh chụp đề thi gốc trực tiếp trong từng câu hỏi.
  - Thống kê tiến độ ôn tập và tỷ lệ chính xác theo thời gian thực.
- **Giao diện hiện đại**: Tối ưu hiển thị trên cả máy tính và điện thoại.

---

## 🛠️ Công nghệ sử dụng

- **Frontend**: Pure HTML5, CSS3 (Modern Glassmorphism & Responsive Design), Vanilla JavaScript (ES6+).
- **Dữ liệu**: Bộ dữ liệu JSON & JS cấu trúc đồng bộ, kèm 240+ hình ảnh minh chứng đề thi.
- Không cần cài đặt `node_modules` hay backend phức tạp - chạy trực tiếp trên bất kỳ web server hoặc static hosting nào (GitHub Pages, Vercel, Netlify, Cloudflare Pages).

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
- Các file chi tiết từng đề: `HCM202_FA25_HALF1_DAP_AN_CHI_TIET.md`, `HCM202_SU25_B5_DAP_AN_CHI_TIET.md`, `HCM202_SU26_C1FE_DAP_AN_CHI_TIET.md`, `HCM202_SU26_RE_DAP_AN_CHI_TIET.md`.

---
*Chúc các bạn ôn tập tốt và đạt điểm cao trong kỳ thi HCM202!*
