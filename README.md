# 💬 SupportFlow AI

<p align="center">
  <strong>Hệ thống Chatbot AI Chăm sóc Khách hàng Tự động & Hỗ trợ Đa kênh (RAG + Human Handoff)</strong>
</p>

<p align="center">
  <a href="https://supportflow-ai-admin.vercel.app/"><strong>🌐 Khám phá Live Demo (Admin Dashboard) »</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/pnpm-v8+-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI_RAG-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

## 📌 Giới thiệu Dự án

**SupportFlow AI** là nền tảng Customer Support toàn diện dạng Monorepo. Cho phép doanh nghiệp tạo và nhúng một khung chat AI thông minh vào bất kỳ website nào chỉ với 2 dòng mã script.

Chatbot áp dụng kỹ thuật **RAG (Retrieval-Augmented Generation)** để học và trả lời chính xác theo tài liệu **Knowledge Base** của doanh nghiệp. Trong trường hợp AI không đủ dữ liệu xử lý, hệ thống sẽ tự động chuyển giao cuộc trò chuyện sang cho Admin/Agent tương tác Real-time.

---

## ✨ Tính năng Nổi bật

| Tính năng                   | Mô tả chi tiết                                                                         |
| :-------------------------- | :------------------------------------------------------------------------------------- |
| 🏢 **Workspace Management** | Đăng ký workspace riêng biệt, tạo và quản lý mã nhúng Widget linh hoạt.                |
| 📚 **Knowledge Base & RAG** | Tải lên tài liệu (`.pdf`, `.docx`...), tự động phân tích, vector hóa để huấn luyện AI. |
| 🧪 **RAG Playground**       | Môi trường thử nghiệm trực quan khả năng truy xuất ngữ cảnh và phản hồi của AI.        |
| 🤖 **AI Auto-Response**     | Phản hồi khách hàng tự động, chính xác dựa trên Gemini LLM & Qdrant Vector DB.         |
| 👨‍💻 **Realtime Live Chat**   | Chuyển đổi mượt mà từ AI sang Admin/Agent xử lý khi gặp câu hỏi phức tạp.              |
| 🎨 **Lightweight Widget**   | Khung chat mỏng nhẹ, load nhanh, tương thích mọi loại website HTML/React/Vue.          |

---

## 🏗️ Kiến trúc Hệ thống (Architecture)

<p align="center">
    <img src="/docs/diagram/architecture.png" alt="architecture_diagram">
</p>
---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

### 📦 Monorepo Tooling

![Turborepo](https://img.shields.io/badge/Turborepo-111111?style=flat-square&logo=turborepo&logoColor=white)
![PNPM](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white)

### 🖥️ Frontend Apps (`apps/admin` & `apps/widget`)

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Shadcn UI](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=flat-square&logo=react&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat-square&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white)

### ⚡ Backend App (`apps/server`)

![NodeJS](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socketdotio&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)
![Qdrant](https://img.shields.io/badge/Qdrant_Vector_DB-DC2626?style=flat-square&logo=qdrant&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)

---

## 📁 Cấu trúc Thư mục

```text
supportflow-ai/
├── apps/
│   ├── admin/             # Trang quản trị Dashboard, Knowledge Base, Live Chat
│   ├── widget/            # Khung chat nhúng nhẹ dành cho khách hàng
│   └── server/            # REST API, Socket.IO Server, RAG Pipeline
└── packages/
    ├── ui/                # Component UI dùng chung (Shadcn UI, Tailwind)
    ├── shared-types/      # TypeScript types dùng chung cho cả Frontend & Backend
    ├── config/            # Cấu hình ESLint, Tailwind, TypeScript
    └── assets/            # Tài nguyên tĩnh và hình ảnh shared
```

---

## ⚡ Hướng dẫn Khởi chạy (Quick Start)

### 1. Requirements

- **Node.js**: `>= 18.x`
- **PNPM**: `>= 8.x` (`npm i -g pnpm`)
- Cú pháp Cơ sở dữ liệu: MongoDB, Qdrant Vector Cluster, Google Gemini API Key.

### 2. Cài đặt Project

```bash
git clone [https://github.com/dak-1306/supportflow-ai.git](https://github.com/dak-1306/supportflow-ai.git)
cd supportflow-ai
pnpm install
```

### 3. Cấu hình Biến môi trường (`.env`)

Tạo file `.env` ở các thư mục tương ứng:

<details>
<summary>📂 <b>apps/server/.env</b></summary>

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/supportflow
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# AI & Vector DB
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
QDRANT_URL=[https://your-qdrant-url.qdrant.tech](https://your-qdrant-url.qdrant.tech)
QDRANT_API_KEY=your_qdrant_api_key

# Widget Production CDN URL
WIDGET_CDN_URL=http://localhost:5174
```

</details>

<details>
<summary>📂 <b>apps/admin/.env</b></summary>

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

</details>

<details>
<summary>📂 <b>apps/widget/.env</b></summary>

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

</details>

### 4. Chạy môi trường Development

```bash
pnpm dev
```

Cổng chạy mặc định của ứng dụng:

- **Admin Dashboard:** `http://localhost:5173`
- **Widget App:** `http://localhost:5174`
- **Backend API:** `http://localhost:5000`

---

## 💻 Cách Nhúng Script Widget

Sau khi khởi tạo **Workspace** ở trang Quản trị, bạn sẽ có mã nhúng để dán vào thẻ `<body>` của website khách hàng:

```html
<!-- SupportFlow AI Widget -->
<script>
  window.SupportFlowConfig = { workspaceId: "YOUR_WORKSPACE_ID" };
</script>
<script
  async
  src="[https://supportflow-ai-widget.vercel.app/widget.js](https://supportflow-ai-widget.vercel.app/widget.js)"
></script>
<!-- End SupportFlow AI Widget -->
```

---

## 🔗 Chân trang & Liên kết

- **Repository**: [https://github.com/dak-1306/supportflow-ai.git](https://github.com/dak-1306/supportflow-ai.git)
- **Live Demo**: [https://supportflow-ai-admin.vercel.app/](https://supportflow-ai-admin.vercel.app/)

---

<p align="center">Made with ❤️ by SupportFlow AI Team</p>
