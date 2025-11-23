<div align="center">
  <img src="https://via.placeholder.com/1200x300?text=Smart+XPath+Generator" alt="Banner" width="100%" />
  <h1>Smart XPath Generator</h1>
  <p>
    <strong>Trợ lý AI tạo Locator thông minh cho Selenium, Playwright, Cypress, Appium</strong>
  </p>
</div>

---

## 📖 Giới thiệu
**Smart XPath Generator** là công cụ hỗ trợ Automation Tester và Developer tự động phân tích mã HTML và sinh ra các chiến lược định vị (Locator Strategies) tối ưu nhất. 

Khác với các công cụ thông thường chỉ tạo XPath tuyệt đối, hệ thống này sử dụng các thuật toán Heuristics và AI để:
- Đánh giá độ ổn định (Stability).
- Phát hiện ID động/sinh ngẫu nhiên.
- Tìm kiếm theo ngữ nghĩa (Semantic) và ngữ cảnh (Context).
- Tự động quét và gợi ý các phần tử tương tác bên trong (Deep Scan).

## 🌟 Tính năng nổi bật

### 1. Đa Nền Tảng & Đa Ngôn Ngữ
Hỗ trợ sinh code native cho các Framework và Ngôn ngữ phổ biến:
- **Tools:** Selenium, Playwright, Cypress, Appium, Katalon, Robot Framework.
- **Languages:** Java, Python, C#, JavaScript/TypeScript, Ruby, Groovy.

### 2. Deep Scan (Quét Sâu Thông Minh) 🧠
Không chỉ phân tích thẻ bạn dán vào. Nếu bạn dán một đoạn HTML lớn (ví dụ: cả `form` đăng nhập), công cụ sẽ:
- Tự động phát hiện thẻ chứa (Container).
- Quét tìm tất cả các phần tử tương tác bên trong (`input`, `button`, `a`, `select`...).
- Đặt tên gợi nhớ cho từng phần tử (VD: "Input: Username", "Button: Login").

### 3. Chiến Lược Locator Tối Ưu
Hệ thống tự động xếp hạng các Locator dựa trên "Best Practices":
- **Playwright:** Ưu tiên `getByRole`, `getByPlaceholder`, `getByTestId`.
- **Selenium:** Ưu tiên `ID` > `Name` > `LinkText` > `CSS` > `XPath`.
- **Form Handling:** Tự động liên kết `Label` với `Input` để tạo XPath bền vững.
- **Xử lý Trùng lặp:** Tự động thêm chỉ số (Index) an toàn khi phát hiện nhiều phần tử giống nhau.

### 4. Page Object Model (POM) Generator 📦
- Tự động gom nhóm tất cả các Locator tìm được.
- Xuất ra mã nguồn Class hoàn chỉnh (Java/C#/Python/TS).
- Tự động đặt tên biến chuẩn (CamelCase/SnakeCase) và xử lý trùng tên biến.

### 5. Tích hợp AI (Gemini) 🤖
- Giải thích chi tiết ý nghĩa của từng Locator.
- Đề xuất các phương án thay thế khi thuật toán bí.

## 🚀 Cài đặt & Chạy Local

Yêu cầu: **Node.js** (v16 trở lên)

1. **Clone dự án & Cài đặt dependencies:**
   ```bash
   npm install
Cấu hình Environment: Tạo file .env.local tại thư mục gốc và thêm API Key (nếu dùng tính năng AI):

Đoạn mã

GEMINI_API_KEY=your_api_key_here
Chạy ứng dụng:

Bash

npm run dev
Truy cập: http://localhost:3000 (hoặc port hiển thị trên terminal).

Build để Deploy:

Bash

npm run build
💡 Hướng dẫn sử dụng nhanh
Mở trang web cần test, nhấn F12 (DevTools).

Chuột phải vào phần tử (hoặc khối cha bao quanh) -> Copy -> Copy outerHTML.

Dán vào công cụ Smart XPath Generator.

(Tùy chọn) Bật chế độ "Quét Sâu" (Deep Scan) để lấy toàn bộ phần tử con.

Chọn Tool và Ngôn ngữ mong muốn trên thanh Header.

Sao chép Locator hoặc xuất toàn bộ thành file POM.

🤝 Đóng góp
Dự án mã nguồn mở. Mọi đóng góp (Pull Request, Issue) đều được hoan nghênh!

© 2025 dvnam1401.