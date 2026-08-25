# JUSpa Promotion Manager

Hệ thống quản lý chương trình khuyến mãi nội bộ cho JUSpa, kết nối với Firebase và sẵn sàng để deploy.

## Hướng dẫn Cài đặt & Deploy

Làm theo các bước sau để đưa trang web của bạn lên mạng (sử dụng Vercel hoặc GitHub Pages).

### Điều kiện cần có
- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18 trở lên).
- Có một tài khoản [GitHub](https://github.com/).
- Đã tạo dự án trên [Firebase](https://firebase.google.com/) và có các key cấu hình.

### Bước 1: Chuẩn bị Mã nguồn
1.  **Lấy Key Firebase:** Truy cập dự án của bạn trên Firebase, vào **Project Settings > General**. Tìm app của bạn và copy toàn bộ `firebaseConfig`.
2.  **Cập nhật `firebaseConfig.ts`:** Mở file `firebaseConfig.ts` trong dự án và dán các key bạn vừa copy vào.

### Bước 2: Cài đặt các công cụ cần thiết
Mở terminal (hoặc Command Prompt) trong thư mục dự án và chạy lệnh sau. Lệnh này sẽ tải Vite, React, và các thư viện cần thiết về máy.
```bash
npm install
```

### Bước 3: Chạy thử trên máy tính
Để kiểm tra xem mọi thứ hoạt động đúng chưa, chạy lệnh:
```bash
npm run dev
```
Mở trình duyệt và truy cập vào địa chỉ `http://localhost:5173` (hoặc địa chỉ mà terminal hiển thị). Bạn sẽ thấy trang web chạy trên máy của mình.

### Bước 4: Deploy lên Vercel (Khuyến khích - Dễ nhất)

1.  **Đẩy mã nguồn lên GitHub:**
    *   Tạo một repository mới trên GitHub (ví dụ: `juspa-manager`).
    *   Trong terminal, chạy các lệnh sau:
      ```bash
      git init
      git add .
      git commit -m "Initial project setup"
      git branch -M main
      git remote add origin https://github.com/TEN_USER_CUA_BAN/TEN_REPO.git
      git push -u origin main
      ```
      *(Nhớ thay `TEN_USER_CUA_BAN` và `TEN_REPO`)*

2.  **Kết nối Vercel:**
    *   Truy cập [vercel.com](https://vercel.com/) và đăng nhập bằng tài khoản GitHub.
    *   Trên Dashboard, chọn **Add New... > Project**.
    *   Tìm và **Import** repository `juspa-manager` bạn vừa tạo.
    *   Vercel sẽ tự động nhận diện đây là một dự án Vite. Bạn **không cần thay đổi bất kỳ cài đặt nào**.
    *   Bấm **Deploy**.

Đợi vài phút, Vercel sẽ cung cấp cho bạn một đường link trang web online.

### Bước 5 (Tùy chọn): Deploy lên GitHub Pages

1.  **Cấu hình đường dẫn:**
    *   Mở file `vite.config.ts`.
    *   Sửa dòng `base: '/JUSpa/'` thành tên repository GitHub của bạn (ví dụ: `base: '/juspa-manager/'`).
2.  **Chạy lệnh Deploy:**
    ```bash
    npm run build
    npm run deploy
    ```
3.  **Kích hoạt GitHub Pages:**
    *   Vào repository của bạn trên GitHub, đi tới **Settings > Pages**.
    *   Dưới mục **Branch**, chọn nhánh `gh-pages` và thư mục là `/ (root)`. Bấm **Save**.

Đợi vài phút, GitHub sẽ cung cấp cho bạn một đường link để truy cập.
