# Smart XPath Generator

Công cụ tạo XPath tự động (Smart XPath Generator) — giúp Tester hoặc Dev nhanh chóng tạo các XPath ổn định từ đoạn HTML được dán vào trình duyệt.

Ứng dụng này là một công cụ client-side (chạy hoàn toàn trên trình duyệt) được viết bằng HTML/CSS/Vanilla JS. Mục tiêu: giảm thời gian viết XPath thủ công, cung cấp nhiều phương án XPath sắp xếp theo độ ưu tiên và có nút copy nhanh.

## Tính năng chính
- Phân tích đoạn HTML (paste outerHTML) và sinh nhiều XPath gợi ý.
- Xếp hạng theo độ ổn định: ID → Text → Unique attributes → Class → Class+Text.
- Xử lý whitespace và ký tự đặc biệt trong nội dung (ví dụ dấu nháy đơn).
- Mỗi kết quả có nhãn (badge) để biết nhanh loại chiến lược (ID, Text, Class, ...).
- Hoàn toàn chạy client-side, không cần server.

## Luồng sử dụng
1. Mở trang cần lấy phần tử, F12 → copy outerHTML phần tử mong muốn.
2. Mở ứng dụng, dán đoạn HTML vào khung bên trái.
3. Nhấn "Phân tích" để nhận danh sách XPath gợi ý ở khung bên phải.
4. Bấm "Copy" trên phương án bạn chọn.

## Cách chạy (phát triển)
Yêu cầu: Node.js (để chạy dev server với Vite)

1. Cài phụ thuộc:

```bash
npm install
```

2. Chạy chế độ phát triển:

```bash
npm run dev
```

3. Xây dựng để deploy:

```bash
npm run build
```

## Thiết kế & Logic
- Ưu tiên 1 — ID: nếu có `id`, sinh XPath theo ID (mạnh nhất).
- Ưu tiên 2 — Text: dùng so sánh chính xác cho text ngắn, dùng `contains()` cho text dài (lấy khoảng 20 ký tự đầu).
- Ưu tiên 3 — Unique attributes: `name`, `placeholder`, `title`, `data-testid`,...
- Ưu tiên 4 — Class: dùng chuỗi class đầy đủ khi phù hợp.
- Ưu tiên 5 — Kết hợp Class + Text để tăng độ chính xác.

Giao diện đề xuất: chia đôi màn hình (Input bên trái, Output bên phải), mỗi kết quả kèm badge màu và nút copy.

## Mục tiêu kỹ thuật
- Thuần client-side: HTML5, CSS3, JavaScript (Vanilla).
- Dễ chia sẻ (chỉ cần gửi 1 thư mục / file tĩnh).

## Đóng góp
- Fork, tạo branch, sửa/thêm tính năng, mở pull request.
- Viết mô tả rõ ràng cho PR và test các thay đổi trong dev mode.

## Tiếp theo / Roadmap ngắn hạn
- Hoàn thiện thuật toán xếp hạng và xử lý edge-case (text chứa nháy, whitespace, HTML malformed).
- Thêm test đơn vị cho module sinh XPath (nếu tách thành module JS).
- Thêm guide nhỏ hướng dẫn cách copy outerHTML chuẩn từ các trình duyệt.

## License
Mặc định chưa chỉ định; thêm LICENSE nếu muốn chia sẻ công khai.

---

