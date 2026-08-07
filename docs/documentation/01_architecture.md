Để không bị lỗi hiển thị khung code khi lồng các thẻ Mermaid, dưới đây là toàn bộ mã Markdown nguyên bản. Bạn chỉ cần copy khối văn bản dưới đây và dán thẳng vào file `docs/architecture.md`:

# Kiến trúc Hệ thống SupportFlow AI (System Architecture)

Tài liệu này mô tả chi tiết kiến trúc tổng thể, sơ đồ luồng dữ liệu, quy trình RAG (Retrieval-Augmented Generation), cơ chế Realtime Chat & Agent Handoff của dự án **SupportFlow AI**.

---

## 1. Tổng quan Kiến trúc (High-Level Architecture)

SupportFlow AI được thiết kế theo mô hình **Monorepo** kết hợp với **Hybrid Storage** (MongoDB + Qdrant Vector DB). Hệ thống chia làm 3 ứng dụng chính tương tác realtime qua Socket.IO:

- **`apps/widget`**: Script nhúng nhẹ (Embeddable Chat Widget) trên website khách hàng.
- **`apps/admin`**: Web Dashboard dành cho Chuyên viên / Admin quản lý Knowledge Base và hỗ trợ khách hàng.
- **`apps/server`**: REST API & Socket.IO Gateway xử lý RAG, kết nối Vector DB và Gemini AI.

<p align="center">
    <img src="/docs/diagram/architecture.png" alt="architecture_diagram">
</p>

---

## 2. Luồng Khai thác kiến thức RAG (RAG Pipeline)

Hệ thống xử lý RAG chia làm 2 giai đoạn độc lập: **Ingestion Pipeline** (Nạp tài liệu ngầm) và **Retrieval & Generation** (Truy vấn câu hỏi).

### 2.1 Ingestion Pipeline (Nạp & Xử lý tài liệu)

Khi Admin tải lên tài liệu (`PDF` hoặc `DOCX`):

1. **Document Extractor**: Đọc file buffer thông qua `pdf-parse-fork` hoặc `mammoth`.
2. **Text Chunking**: Chia văn bản thành các đoạn nhỏ (**800 từ**, overlap **100 từ**).
3. **Parallel Vectorization**: Gọi API Gemini `gemini-embedding-2` song song để tạo vector embedding.
4. **Dual Sync Storage**:

- Lưu cấu trúc Chunk + Metadata vào **MongoDB** (`DocumentChunk`).
- Upsert Vector + Metadata (`documentId`, `workspaceId`, `content`) vào **Qdrant Vector DB**.

<p align="center">
    <img src="/docs/diagram/sequenceDiagram_Rag.png" alt="sequenceDiagram_Rag">
</p>

---

### 2.2 Retrieval & Generation Pipeline (Trả lời câu hỏi)

Khi khách hàng gửi câu hỏi từ Widget:

1. **Embedding Query**: Chuyển câu hỏi khách hàng thành Vector Embedding bằng model `gemini-embedding-2`.
2. **Similarity Search**: Tìm kiếm trong Qdrant thu về **Top K=4** chunks phù hợp nhất (lọc theo `workspaceId`).
3. **Context Construction**: Ghép các chunks tìm được thành ngữ cảnh (Context) cùng với System Prompt của Workspace.
4. **AI Generation**: Sử dụng `gemini-3.5-flash` (temperature `0.2`) để tạo câu trả lời tự nhiên.
5. **Fallback & Handoff Check**: Kiểm tra xem câu trả lời có chứa câu lệnh Fallback (`RAG_FALLBACK_PHRASE`) hay không để quyết định chuyển tiếp sang Support Agent.

---

## 3. Realtime Chat & Agent Handoff Workflow

Hệ thống cho phép Chuyên viên (Admin) can thiệp vào cuộc trò chuyện bất kỳ lúc nào hoặc tự động chuyển tiếp khi AI không đáp ứng được (Fallback).

### Trạng thái cuộc hội thoại (`Conversation Status`)

- **`AI`**: AI Bot tự động trả lời dựa vào Knowledge Base.
- **`HUMAN`**: Chuyên viên (Admin) tiếp quản cuộc trò chuyện, AI Bot tạm dừng hoạt động.
- **`RESOLVED`**: Cuộc trò chuyện đã hoàn thành.

<p align="center">
    <img src="/docs/diagram/stateDiagram_chat.png" alt="stateDiagram_chat">
</p>

### Luồng Event Socket.IO chính

| Event Name       | Sender         | Scope             | Mục đích                                                 |
| ---------------- | -------------- | ----------------- | -------------------------------------------------------- |
| `join_workspace` | Admin          | Workspace Room    | Admin đăng ký nhận thông báo Handoff toàn Workspace      |
| `join_room`      | Client / Admin | Conversation Room | Tham gia vào phòng chat cụ thể (`room_{conversationId}`) |
| `typing_status`  | Client / Admin | Room Broadcast    | Báo trạng thái "đang gõ..." realtime                     |
| `new_message`    | Server         | Conversation Room | Phát tin nhắn mới đến các bên đang quan tâm              |

---

## 4. Cấu trúc Database Schemas (Data Models)

Sơ đồ thực thể quan hệ (ERD) thể hiện cấu trúc lưu trữ dữ liệu của SupportFlow AI trong MongoDB:

<p align="center">
    <img src="/docs/diagram/ERD.png" alt="ERD">
</p>

### 4.1 Workspace (`workspaces`)

Lưu trữ thông tin tổ chức, cấu hình AI Prompt và cấu hình giao diện Widget Chat.

- `aiConfig`: Model AI, systemPrompt, temperature.
- `widgetConfig`: Primary color, title, welcomeMessage, botAvatar.

### 4.2 Document & DocumentChunk (`documents`, `documentchunks`)

Lưu trữ tài liệu gốc và các đoạn văn bản đã bóc tách.

- `Document`: `name`, `type` (PDF/DOCX), `status` (PROCESSING, READY, FAILED), `chunkCount`.
- `DocumentChunk`: `documentId`, `chunkIndex`, `content`, `vectorId`, `page`.

### 4.3 Conversation & Message (`conversations`, `messages`)

Lưu trữ phiên chat và lịch sử tin nhắn.

- `Conversation`: `customerId`, `status` (`AI`, `HUMAN`, `RESOLVED`), `assignedAdminId`.
- `Message`: `conversationId`, `sender` (`CUSTOMER`, `AI`, `ADMIN`, `SYSTEM`), `message`, `sources` (dùng hiển thị Trích dẫn/Citations), `confidence`.
