# Smart XPath Generator

Công cụ tạo XPath tự động (Smart XPath Generator) — giúp Tester hoặc Dev nhanh chóng tạo các XPath ổn định từ đoạn HTML được dán vào trình duyệt.

Ứng dụng này là một công cụ client-side (chạy hoàn toàn trên trình duyệt) được viết bằng HTML/CSS/Vanilla JS. Mục tiêu: giảm thời gian viết XPath thủ công, cung cấp nhiều phương án XPath sắp xếp theo độ ưu tiên và có nút copy nhanh.

## 🎯 Tính năng chính
- ✨ Phân tích đoạn HTML (paste outerHTML) và sinh nhiều XPath gợi ý.
- 📊 Xếp hạng theo độ ổn định: ID → Text → Unique attributes → Class → Class+Text.
- 🛡️ Xử lý whitespace và ký tự đặc biệt trong nội dung (ví dụ dấu nháy đơn).
- 🏷️ Mỗi kết quả có nhãn (badge) để biết nhanh loại chiến lược (ID, Text, Class, ...).
- 🚀 Hoàn toàn chạy client-side, không cần server.

## 📋 Luồng sử dụng
1. Mở trang cần lấy phần tử, F12 → copy outerHTML phần tử mong muốn.
2. Mở ứng dụng, dán đoạn HTML vào khung bên trái.
3. Nhấn "Phân tích" để nhận danh sách XPath gợi ý ở khung bên phải.
4. Bấm "Copy" trên phương án bạn chọn.

## 🚀 Cách chạy (phát triển)
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

## 🧠 Logic & Thiết kế
### Xếp hạng ưu tiên XPath
- **Ưu tiên 1 — ID**: Nếu có `id`, sinh XPath theo ID (mạnh nhất, duy nhất trên trang).
- **Ưu tiên 2 — Text**: So sánh chính xác cho text ngắn; dùng `contains()` cho text dài (lấy khoảng 20 ký tự đầu).
- **Ưu tiên 3 — Unique attributes**: `name`, `placeholder`, `title`, `data-testid`, ...
- **Ưu tiên 4 — Class**: Dùng chuỗi class đầy đủ khi phù hợp.
- **Ưu tiên 5 — Kết hợp Class + Text**: Tăng độ chính xác cực đại khi class bị trùng lặp.

### Giao diện đề xuất
- Chia đôi màn hình: **Input bên trái**, **Output bên phải**.
- Mỗi kết quả kèm **badge màu** để nhận biết nhanh chiến lược.
- Nút **"Copy nhanh"** ở mỗi dòng kết quả.

## 🛠️ Mục tiêu kỹ thuật
- **Thuần client-side**: HTML5, CSS3, JavaScript (Vanilla).
- **Dễ chia sẻ**: Chỉ cần gửi 1 thư mục / file tĩnh.
- **Độc lập**: Không cần Python, Server hay công nghệ phục tạp.

## 🤝 Đóng góp
- Fork repository, tạo branch feature.
- Sửa/thêm tính năng, viết mô tả rõ ràng cho PR.
- Test các thay đổi trong dev mode trước khi gửi PR.

## 🗺️ Roadmap ngắn hạn
- ✅ Hoàn thiện thuật toán xếp hạng, xử lý edge-case (text chứa nháy, whitespace, HTML malformed).
- ✅ Thêm test đơn vị cho module sinh XPath.
- ✅ Thêm guide hướng dẫn cách copy outerHTML chuẩn từ các trình duyệt.
- ✅ Cải thiện giao diện UX/UI.

## 📄 License
Chưa chỉ định; thêm LICENSE nếu muốn chia sẻ công khai.

---

**Lưu ý:** Dự án này được phát triển để giải quyết vấn đề mất thời gian viết XPath thủ công trong Selenium Automation Testing. Bằng cách dán HTML và nhận ngay danh sách XPath gợi ý, quy trình kiểm thử trở nên nhanh hơn và hiệu quả hơn.
