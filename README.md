# ASIMEN - Dự án Thương mại Điện tử / Quản lý bán hàng

Dự án này là một hệ thống mẫu (hoặc khung sườn) cho một trang web thương mại điện tử hoặc quản lý bán hàng đơn giản.

## 🚀 Tính năng nổi bật (Dự kiến)

* **Giao diện người dùng (Client):**
    * Trang chủ (`index.html`)
    * Trang sản phẩm chi tiết (`product.html`)
    * Giỏ hàng (`cart.html`)
    * Thanh toán (`checkout.html`)
    * Đăng nhập/Đăng ký (`login.html`, `register.html`)
    * Trang cảm ơn (`thankyou.html`)
* **Giao diện Quản trị (Admin):**
    * Trang tổng quan Admin (`admin.html`, `admin-stats.html`)
    * Quản lý đơn hàng (`admin-orders.html`)
    * Quản lý khách hàng (`admin-customers.html`)
    * Quản lý danh mục (`admin-categories.html`)
    * Quản lý sản phẩm (`products-admin.html`)
* **Dữ liệu mô phỏng:** Sử dụng tệp `db.json` để mô phỏng dữ liệu back-end (thường dùng với công cụ như JSON Server).

## 🛠️ Công nghệ sử dụng

Dựa trên cấu trúc tệp, dự án này chủ yếu sử dụng các công nghệ Front-end tiêu chuẩn và có thể sử dụng Node.js cho các tác vụ phát triển:

* **HTML5:** Cấu trúc trang.
* **CSS3:** Định kiểu (Styling) với tệp chính là `public/styles/main.css`.
* **JavaScript:** Logic Front-end.
* **JSON Server (Dự kiến):** Dùng để tạo API giả lập từ tệp `db.json` (cần Node.js).

## 💻 Cài đặt và Khởi chạy

Để chạy dự án này, bạn cần cài đặt **Node.js** trên máy tính.

### 1. Cài đặt các gói phụ thuộc

Mở Terminal trong thư mục gốc của dự án (`/asimen/`) và chạy lệnh sau để cài đặt các gói cần thiết được liệt kê trong `package.json`:

```bash
npm install

2. Khởi chạy Dự án
npm start
