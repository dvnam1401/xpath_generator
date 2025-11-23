```markdown
# Technical Architecture & Implementation Plan

Tài liệu này mô tả chi tiết kiến trúc kỹ thuật, thuật toán cốt lõi và các chiến lược xử lý của hệ thống **Smart XPath Generator**.

---

## I. Kiến Trúc Tổng Quan (High-Level Architecture)

Hệ thống hoạt động hoàn toàn phía Client-side (trình duyệt), đảm bảo tốc độ và bảo mật dữ liệu.

1.  **Input Layer:**
    * Nhận chuỗi HTML thô (Raw String) từ người dùng.
    * Cấu hình: Tool (Selenium/Playwright...), Language (Java/Python...), Chế độ (Deep Scan).

2.  **Processing Layer (Core Engine):**
    * **HTML Parser:** Sử dụng `DOMParser` của trình duyệt để chuyển chuỗi thành DOM Tree thực thụ.
    * **Node Traversal (Deep Scan):** Quét và lọc các node quan trọng.
    * **Locator Generator:** Sinh ra các chiến lược định vị cho từng node.
    * **Heuristics Engine:** Phát hiện ID động, đánh giá độ ổn định.

3.  **Post-Processing Layer:**
    * **Deduplication:** Xử lý trùng lặp, thêm chỉ số (Index).
    * **Formatter:** Chuyển đổi Locator thành mã nguồn (Code Snippet).
    * **POM Builder:** Tạo cấu trúc Class Page Object.

4.  **UI Layer:**
    * Hiển thị phân cấp (Hierarchy View): Root vs Children.
    * Tương tác: Copy, Explain (AI), Settings.

---

## II. Thuật Toán Cốt Lõi (Core Logic)

### 1. Chiến Lược "Quét Sâu" (Deep Scan Strategy)
Thay vì chỉ xử lý 1 thẻ gốc, hệ thống áp dụng chiến lược **1-N**:
* **Bước 1:** Xác định xem thẻ gốc có phải là `Container` không (div, form, section, table...).
* **Bước 2:** Nếu là Container, sử dụng `querySelectorAll('*')` để lấy danh sách ứng viên.
* **Bước 3:** Lọc (Filter) ứng viên dựa trên tiêu chí "Tương tác" (Interactive):
    * Tag: `input`, `button`, `a`, `select`, `textarea`.
    * Attributes: `role="button/link/checkbox"`.
    * Events: `onclick`, `ng-click`, `@click`, `hx-*`.
    * Content: Thẻ chứa text quan trọng (`label`, `h1-h6`, `span` có text).

### 2. Hệ Thống Xếp Hạng Ưu Tiên (Priority System)
Mỗi Locator sinh ra được gán một điểm ưu tiên (`PriorityLevel`) dựa trên Tool được chọn:

| Priority Level | Mô tả | Tool Ưu Tiên |
| :--- | :--- | :--- |
| **0 - PLAYWRIGHT_ROLE** | Semantic (getByRole, getByLabel) | Playwright |
| **1 - ROBUST_ID** | ID tĩnh, ngắn gọn | Selenium, Appium |
| **2 - NAME** | Thuộc tính Name | Selenium |
| **3 - LINK_TEXT** | Text của thẻ `<a>` | Selenium |
| **6 - CSS_ID** | `#id` | Cypress, Playwright |
| **9 - XPATH_TEXT** | `normalize-space()` | Tất cả (Fallback) |
| **10 - XPATH_LABEL** | Dựa trên Label cha/anh em | Form Automation |
| **13 - DYNAMIC_ID** | ID có dấu hiệu sinh tự động | (Tránh dùng) |

### 3. Thuật Toán Phát Hiện ID Động (Dynamic Heuristics)
Hàm `isDynamicValue(val)` kiểm tra các mẫu (Pattern) rủi ro:
* Chứa chuỗi số dài liên tiếp (>3-5 số).
* Định dạng UUID (`8-4-4-4-12` hex).
* Tiền tố Framework: `data-v-` (Vue), `ng-` (Angular), `css-` (Styled Component).
* Bắt đầu bằng số.

---

## III. Xử Lý Nâng Cao & Edge Cases

### 1. Xử Lý Trùng Lặp (Duplicate Handling)
Khi Deep Scan tìm thấy nhiều phần tử giống nhau (VD: 10 nút "Edit" trong bảng), hệ thống xử lý như sau:
* **Đếm:** Sử dụng Map để đếm tần suất xuất hiện của mỗi Locator String.
* **Đánh chỉ số (Indexing):**
    * *Playwright:* Thêm `.nth(i)` hoặc `first()`, `last()`.
    * *XPath:* Thêm hậu tố `[i]` -> `(//button)[2]`.
    * *CSS:* Cố gắng chuyển đổi sang XPath để đánh index an toàn. Nếu giữ CSS (`:nth-of-type`), hạ mức độ ổn định xuống `Low` và cảnh báo người dùng.

### 2. Page Object Model (POM) Generator
Tính năng xuất code hàng loạt:
* **Chuẩn hóa tên biến:** `cleanVarName` loại bỏ ký tự đặc biệt, chuyển đổi case theo ngôn ngữ (Java: `camelCase`, Python: `snake_case`).
* **Đảm bảo duy nhất (Uniqueness):**
    * Duy trì một `Set` chứa các tên biến đã dùng.
    * Nếu trùng (VD: `btnLogin`), tự động thêm hậu tố số (`btnLogin2`, `btnLogin3`...).
* **Template:** Sinh code đầy đủ bao gồm Class, Khai báo biến, và Constructor.

### 3. Xử Lý Ngữ Cảnh (Context-Awareness)
* **Label Strategy:** Tự động tìm thẻ `<label>` có thuộc tính `for` khớp với ID của input để tạo XPath dựa trên Text của Label (Bền vững hơn ID).
* **Anchor Strategy:** Nếu phần tử con không có định danh tốt, thuật toán sẽ leo ngược lên cây DOM để tìm cha có ID ổn định gần nhất và tạo Locator kết hợp (VD: `//div[@id='header']//button`).

---

## IV. Định Hướng Mở Rộng Tương Lai

1.  **Smart Self-Healing:** Gợi ý regex cho ID động thay vì bỏ qua.
2.  **Custom Templates:** Cho phép người dùng định nghĩa mẫu code POM riêng.
3.  **Browser Extension:** Đóng gói thành Extension để dùng trực tiếp không cần copy-paste HTML.