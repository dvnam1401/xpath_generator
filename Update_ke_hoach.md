
Dưới đây là bản mô tả chi tiết các điều chỉnh cần thiết để tối ưu hóa hệ thống, đảm bảo tuân thủ đúng thứ tự ưu tiên `ID > Name > CSS > XPath` như giáo trình đã đề cập.

### 1\. Nâng cấp Thuật toán Sinh Locator (Core Logic)

Hiện tại, logic trong `xpathGenerator.ts` chỉ tập trung vào XPath. [cite\_start]Theo giáo trình, CSS Selector thường nhanh hơn và được ưu tiên hơn XPath trong các trường hợp không cần xử lý văn bản (text) hoặc duyệt ngược DOM[cite: 539].

**Yêu cầu điều chỉnh:**
Hàm `generateXPaths` cần đổi tên thành `generateLocators` và trả về cả **CSS Selector** lẫn **XPath**. Logic xếp hạng (Priority) cần được viết lại như sau:

#### 1.1. Tầng Ưu Tiên 1: ID (Tuyệt đối)

  * **Logic hiện tại:** Đang kiểm tra `element.id`.
  * **Cải tiến:**
      * [cite\_start]Giữ nguyên ưu tiên cao nhất[cite: 25, 541].
      * **Thêm bộ lọc "ID động" (Dynamic ID):** Kiểm tra xem ID có chứa chuỗi số ngẫu nhiên hoặc quá dài không (ví dụ: `input-12456`, `ember321`). [cite\_start]Nếu có, đẩy độ ưu tiên xuống thấp hoặc cảnh báo "Unstable ID" (ID không ổn định)[cite: 538].
      * [cite\_start]**Output:** Sinh cả XPath `//*[@id='val']` và CSS `#val`[cite: 953].

#### 1.2. Tầng Ưu Tiên 2: Name Attribute

  * **Logic hiện tại:** Gộp `name` chung với các attribute khác.
  * **Cải tiến:**
      * Tách `name` ra thành tầng ưu tiên riêng biệt, đứng ngay sau ID. [cite\_start]Giáo trình nhấn mạnh thứ tự: `id > name > css/xpath`[cite: 541].
      * **Output:**
          * [cite\_start]Selenium: `By.name("value")`[cite: 67, 81].
          * CSS: `[name='value']`.
          * XPath: `//*[@name='value']`.

#### 1.3. Tầng Ưu Tiên 3: Link Text (Dành riêng cho thẻ `<a>`)

  * **Logic hiện tại:** Chỉ xử lý Text chung chung.
  * **Cải tiến:**
      * [cite\_start]Nếu thẻ là `<a>` và có text, tạo gợi ý locator `Link Text` hoặc `Partial Link Text`[cite: 188, 242].
      * Đây là chiến lược rất mạnh cho các liên kết điều hướng mà XPath phức tạp thường hay gãy.

#### 1.4. Tầng Ưu Tiên 4: CSS Class & Attributes (Thay vì chỉ XPath)

  * **Logic hiện tại:** Dùng `//tag[@class='...']` hoặc `//tag[@attr='...']`.
  * **Cải tiến:**
      * [cite\_start]Ưu tiên sinh CSS Selector trước vì cú pháp gọn hơn và hiệu năng tốt hơn XPath[cite: 537, 539].
      * [cite\_start]**Với Class:** Chuyển đổi `class="btn primary"` thành CSS `.btn.primary`[cite: 954].
      * [cite\_start]**Loại bỏ Class rác:** Tự động lọc bỏ các class của framework CSS (như Tailwind `p-4`, `flex`, `text-white` hoặc các mã hash `jss123` như trong file giáo trình [cite: 46, 121]) vì chúng dễ thay đổi khi UI update. Chỉ giữ lại các class mang tính định danh (business logic) như `btn-login`, `header-menu`.

#### 1.5. Tầng Ưu Tiên 5: XPath dựa trên Text (Khi các cách trên thất bại)

  * **Logic hiện tại:** Đã xử lý `text()` và `contains()`.
  * **Cải tiến:**
      * [cite\_start]Giữ nguyên logic `normalize-space()` để xử lý khoảng trắng thừa[cite: 537].
      * [cite\_start]Đây là "vũ khí tối thượng" của XPath mà CSS không làm được (tìm theo nội dung text hiển thị)[cite: 1037, 1057].

-----

### 2\. Mô tả Điều chỉnh Giao diện (UI/UX)

File `XPathResultCard.tsx` và `types.ts` cần cập nhật để phản ánh sự thay đổi về loại Locator.

#### 2.1. Phân loại Loại Locator

Thay vì chỉ hiện một dòng code XPath, thẻ kết quả cần hiển thị rõ loại Locator để Tester chọn đúng hàm trong Selenium (`By.id`, `By.cssSelector`, `By.xpath`):

  * **Thêm Badges (Nhãn) mới:**
      * `By.id` (Màu xanh lá - Tốt nhất)
      * `By.name` (Màu xanh dương - Tốt)
      * `By.cssSelector` (Màu cam - Hiệu năng cao)
      * `By.xpath` (Màu tím - Linh hoạt nhất)

#### 2.2. Cảnh báo Độ ổn định (Stability Warning)

[cite\_start]Dựa trên nguyên tắc "Locator phải ổn định"[cite: 538], hệ thống nên hiện cảnh báo màu vàng nếu:

  * ID hoặc Class trông giống được sinh tự động (vd: `css-1q2w3e`).
  * [cite\_start]XPath quá dài hoặc phụ thuộc vào cấu trúc tuyệt đối (ví dụ: `/html/body/div[1]/...`)[cite: 1045, 1046].

-----

### 3\. Cấu trúc Dữ liệu Mới (Đề xuất sửa `types.ts`)

Cần sửa lại interface `XPathResult` trong file `types.ts` để hỗ trợ đa dạng locator:

```typescript
// Đề xuất sửa đổi cho file types.ts
export enum PriorityLevel {
  ID = 1,          // By.id
  NAME = 2,        // By.name
  LINK_TEXT = 3,   // By.linkText (cho thẻ a)
  CSS_ID = 4,      // css=#id
  CSS_CLASS = 5,   // css=.class
  XPATH_TEXT = 6,  // xpath=//*[text()='...']
  XPATH_ATTR = 7   // xpath=//*[@attr='...']
}

export interface LocatorResult { // Đổi tên từ XPathResult
  id: string;
  value: string;   // Giá trị locator (ví dụ: "login-btn" hoặc "//div[@id='...']")
  method: 'id' | 'name' | 'css' | 'xpath' | 'linkText'; // Phương thức Selenium
  priority: PriorityLevel;
  description: string; // Giải thích (vd: "Dùng ID là nhanh nhất")
  stabilityScore: 'High' | 'Medium' | 'Low'; // Đánh giá độ ổn định
}
```

### 4\. Kịch bản Kiểm thử & Tối ưu (Dựa trên Giáo trình)

Khi bạn cập nhật code, hãy đảm bảo tool xử lý được các trường hợp khó trong file PDF:

1.  [cite\_start]**Trường hợp Login Form:** [cite: 1165]

      * Input: `<input id="taikhoan" name="taikhoan" ...>`
      * Tool phải trả về ưu tiên 1: `By.id("taikhoan")`. Ưu tiên 2: `By.name("taikhoan")`.

2.  [cite\_start]**Trường hợp Class phức tạp:** [cite: 31, 32, 45]

      * Input: `<label class="MuiFormLabel-root MuiInputLabel-root...">`
      * Tool không nên lấy toàn bộ chuỗi class dài ngoằng. Nó nên gợi ý CSS Selector lấy class đặc trưng nhất hoặc XPath `contains(@class, 'MuiInputLabel-root')`.

3.  [cite\_start]**Trường hợp Text chứa khoảng trắng:** [cite: 48]

      * Input: `<h1>  Đăng ký </h1>`
      * Tool phải dùng `normalize-space()='Đăng ký'` thay vì so sánh chuỗi tuyệt đối để tránh lỗi khoảng trắng.

### Tổng kết kế hoạch thực hiện

1.  **Bước 1 (Refactor Type):** Cập nhật `types.ts` để hỗ trợ `LocatorResult` thay vì chỉ `XPathResult`.
2.  **Bước 2 (Logic Update):** Viết lại `utils/xpathGenerator.ts`. Thêm hàm `generateCssSelectors` và tích hợp logic ưu tiên `ID > Name > CSS` vào hàm chính.
3.  **Bước 3 (Validation):** Thêm regex để phát hiện ID/Class động (có số ngẫu nhiên) và đánh dấu độ ổn định thấp.
4.  **Bước 4 (UI Update):** Cập nhật `XPathResultCard.tsx` để hiển thị cú pháp Selenium tương ứng (ví dụ: `driver.findElement(By.cssSelector("..."))` để Tester copy paste nhanh hơn).

Cách tiếp cận này sẽ biến tool của bạn từ một "XPath Generator" đơn giản thành một **"Selenium Locator Expert System"** thực thụ, bám sát các thực hành tốt nhất trong ngành.