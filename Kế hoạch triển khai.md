Dưới đây là bản mô tả chi tiết và rõ ràng nhất về ý tưởng dự án **"Công cụ tạo XPath Tự động cho Selenium"** của bạn. Bản mô tả này được viết dưới dạng **Đặc tả yêu cầu phần mềm (Software Requirements Specification)** để bạn có cái nhìn tổng quan về luồng đi (flow) và logic của sản phẩm mà không dính dáng đến mã nguồn.

---

## Tên Dự Án: Smart XPath Generator (Công cụ Tạo XPath Thông minh)

### 1. Vấn đề cần giải quyết (Problem Statement)
Khi làm tự động hóa kiểm thử (Automation Testing) với Selenium, Tester thường gặp khó khăn:
* Mất quá nhiều thời gian để tự viết các câu lệnh XPath thủ công.
* HTML của trang web thường lộn xộn, nhiều thẻ giống nhau, hoặc có class tên quá dài/ngẫu nhiên.
* Cần tìm một phần tử dựa trên **nội dung hiển thị (Text)** vì class của chúng bị trùng lặp, nhưng viết XPath theo text (`contains`, `normalize-space`) lại phức tạp và dễ sai cú pháp.

### 2. Mục tiêu sản phẩm (Goal)
Xây dựng một công cụ chạy trên trình duyệt (Web-based), nơi người dùng chỉ cần **Dán (Paste)** đoạn mã HTML thô vào, và hệ thống sẽ tự động phân tích để trả về danh sách các **XPath tối ưu nhất**, được sắp xếp theo thứ tự ưu tiên từ "Dễ dùng/Chính xác nhất" đến "Ít ưu tiên hơn".

### 3. Luồng hoạt động (User Flow)
1.  **Bước 1 (Input):** Người dùng copy đoạn mã HTML của một phần tử từ trình duyệt (F12 -> Copy outerHTML). Đoạn mã này có thể chứa nhiều khoảng trắng thừa, xuống dòng, hoặc dấu nháy lộn xộn.
2.  **Bước 2 (Processing):** Người dùng dán vào công cụ và nhấn nút "Phân tích".
3.  **Bước 3 (Logic):** Hệ thống làm sạch đoạn mã, phân tích các thuộc tính (ID, Class, Name, Text...) và áp dụng thuật toán xếp hạng ưu tiên.
4.  **Bước 4 (Output):** Hệ thống hiển thị danh sách các câu lệnh XPath gợi ý kèm theo giải thích ngắn gọn. Người dùng bấm nút "Copy" để lấy dòng code mong muốn.

### 4. Logic Xếp hạng Ưu tiên (Priority Logic)
Đây là "trái tim" của công cụ. Hệ thống sẽ không chỉ trả về 1 kết quả, mà sẽ đưa ra nhiều phương án dựa trên độ ổn định của phần tử:

* **Ưu tiên 1 (Cao nhất): Tìm theo ID**
    * *Lý do:* ID là duy nhất trên trang web.
    * *Hành động:* Nếu thẻ có `id`, tạo ngay XPath theo ID. Đây là lựa chọn "vàng".

* **Ưu tiên 2: Tìm theo Nội dung văn bản (Text Content)**
    * *Lý do:* Giải quyết vấn đề **"Nhiều thẻ giống nhau"** mà bạn gặp phải (ví dụ: menu có 10 thẻ `span` giống hệt class, chỉ khác chữ "Leave", "Home", "Settings").
    * *Hành động:*
        * Nếu text ngắn: Dùng so sánh chính xác (tự động xử lý cắt bỏ khoảng trắng thừa).
        * Nếu text dài: Dùng hàm "chứa" (contains) lấy khoảng 20 ký tự đầu.
        * *Đặc biệt:* Tự động xử lý các ký tự đặc biệt như dấu nháy đơn `'` trong văn bản (ví dụ: "User's Profile").

* **Ưu tiên 3: Tìm theo Thuộc tính định danh khác (Unique Attributes)**
    * *Lý do:* Nếu không có ID hoặc Text, hãy tìm các thuộc tính thường dùng cho lập trình viên.
    * *Hành động:* Quét các thuộc tính như `name`, `placeholder` (cho ô input), `title`, `data-testid` (thường dùng trong test hiện đại).

* **Ưu tiên 4: Tìm theo Class (CSS Class)**
    * *Lý do:* Class rất phổ biến nhưng hay bị thay đổi hoặc trùng lặp.
    * *Hành động:* Lấy toàn bộ chuỗi class.

* **Ưu tiên 5 (Kết hợp): Class + Text**
    * *Lý do:* Tăng độ chính xác cực đại khi Class bị trùng lặp.
    * *Hành động:* Tạo câu lệnh XPath yêu cầu phần tử phải thỏa mãn **CẢ HAI** điều kiện: vừa có Class đó, vừa chứa Text đó.

### 5. Yêu cầu về Giao diện & Kỹ thuật

**Giao diện người dùng (UI):**
* Thiết kế chia đôi màn hình: **Bên trái** là khung nhập liệu (Input), **Bên phải** là danh sách kết quả (Output).
* Mỗi kết quả XPath phải đi kèm một **"Nhãn" (Badge)** màu sắc để người dùng nhận biết nhanh (ví dụ: Nhãn xanh lá cho "ID - Tốt nhất", Nhãn xanh dương cho "Text - Chính xác").
* Tích hợp nút **"Copy nhanh"** ở mỗi dòng kết quả.

**Nền tảng kỹ thuật (Tech Stack):**
* **Ngôn ngữ:** HTML5, CSS3, JavaScript (Vanilla JS - Thuần).
* **Cơ chế xử lý:** Client-side (Xử lý ngay tại trình duyệt người dùng).
* **Lý do chọn công nghệ này:**
    * Không cần cài đặt Python hay Server ảo.
    * Tận dụng chính bộ phân tích HTML (DOM Parser) của trình duyệt Chrome/Edge để đảm bảo XPath tạo ra luôn chạy đúng trên trình duyệt đó.
    * Dễ dàng chia sẻ (chỉ cần gửi 1 file duy nhất).

### 6. Giá trị mang lại
Công cụ này giúp bạn chuyển từ quy trình:
> *Nhìn code -> Phân tích bằng mắt -> Tự gõ XPath -> Chạy thử -> Sai -> Sửa lại.*

Sang quy trình:
> *Copy HTML -> Dán vào Tool -> Chọn phương án tốt nhất -> Done.*

Đây là bản mô tả ý tưởng hoàn chỉnh. Hãy tiến hành triển khai theo ý tưởng này