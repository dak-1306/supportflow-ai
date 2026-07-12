# System Design

Version: 1.0

Project: SupportFlow AI

---

# 1. Purpose

Tài liệu này mô tả kiến trúc tổng thể của hệ thống.

Mục tiêu:

- Dễ phát triển.
- Dễ mở rộng.
- Dễ bảo trì.
- Phù hợp với một lập trình viên phát triển.
- Có thể mở rộng thành SaaS trong tương lai.

---

# 2. System Architecture

                           +--------------------+
                           |     Customer       |
                           +---------+----------+
                                     |
                                     |
                          Chat Widget (React)
                                     |
                                     |
                         Socket.IO + REST API
                                     |
                                     |
               +--------------------------------------+
               |         Express Backend              |
               +--------------------------------------+
                  |        |        |         |
                  |        |        |         |
                  |        |        |         |
          Auth Module  Chat Module  AI Module  KB Module
                  |        |        |         |
                  +--------+--------+---------+
                           |
                    MongoDB Database
                           |
                    Conversation
                    User
                    Message
                    Document
                           |
                           |
                           Retriever
                           |
                      Vector Search
                        (Qdrant)
                           |
                           |
                     Gemini API

---

# 3. High Level Modules

Hệ thống được chia thành các module độc lập.

### Authentication

Quản lý:

- Login
- JWT
- Refresh Token
- Admin Authentication

Không ảnh hưởng tới Chat.

---

### Chat

Quản lý:

- Conversation
- Message
- Socket.IO
- Human Handoff

Không chứa logic AI.

---

### AI

Chịu trách nhiệm:

- Prompt
- RAG
- Gemini
- Confidence

Không biết Conversation lưu như thế nào.

---

### Knowledge Base

Quản lý:

- Upload
- Parsing
- Chunking
- Embedding
- Delete

Không biết AI hoạt động ra sao.

---

### Retriever

Chịu trách nhiệm:

- Generate Query Embedding
- Search Vector Database
- Ranking kết quả
- Trả về các đoạn văn phù hợp

Retriever không biết Conversation.

Retriever không biết UI.

Retriever chỉ có nhiệm vụ tìm dữ liệu liên quan nhất.

---

### Dashboard

Chỉ đọc dữ liệu.

Không xử lý Business Logic.

---

### Settings

Quản lý:

- Prompt
- Company
- Welcome Message

---

# 4. Frontend Architecture

frontend/

src/

components/

pages/

features/

hooks/

services/

types/

stores/

layouts/

routes/

utils/

assets/

Nguyên tắc:

- Components chỉ hiển thị.
- Feature chứa business logic.
- Services gọi API.
- Store chỉ lưu state.

---

# 5. Backend Architecture

backend/

src/

modules/

middlewares/

config/

database/

shared/

utils/

types/

Mỗi module gồm:

auth/

chat/

conversation/

document/

dashboard/

settings/

ai/

Mỗi module:

controller/

service/

repository/

routes/

validation/

types/

Nguyên tắc:

Route

↓

Validation Middleware

↓

Controller

↓

Service

↓

Repository

↓

MongoDB

Controller không truy cập Database.

---

# 6. Data Flow

Customer

↓

Socket Message

↓

Conversation Service

↓

AI Service

↓

Knowledge Search

↓

Gemini

↓

Response

↓

Store Message

↓

Socket Reply

---

# 7. RAG Flow

Upload PDF

↓

Extract Text

↓

Split thành Chunks

↓

Generate Embedding

↓

Save Vector

↓

Qdrant

↓

Customer Question

↓

AI Service

↓

Retriever

↓

Generate Query Embedding

↓

Qdrant Similarity Search

↓

Relevant Chunks

↓

Gemini

↓

Answer

---

# 8. Human Handoff Flow

Customer

↓

AI

↓

Confidence Check

↓

Confidence thấp

↓

Conversation Status

Waiting Admin

↓

Notification

↓

Admin Join

↓

AI Stop

↓

Admin Reply

↓

Conversation Resolved

---

# 9. Notification Flow

Conversation Waiting Admin

↓

Socket.IO

↓

Admin Dashboard

↓

Notification Badge

↓

Click

↓

Conversation

---

# 10. Component Responsibilities

Chat Widget

- UI
- Socket

Không chứa AI Logic.

---

Dashboard

- Statistics

Không xử lý Conversation.

---

AI Module

- Prompt
- Gemini
- Confidence

Không biết UI.

---

Knowledge Module

- Parse
- Chunk
- Embedding

Không gọi Socket.

---

# 11. Design Principles

Single Responsibility

Một module chỉ làm một việc.

---

Loose Coupling

Module không phụ thuộc trực tiếp nhau.

Ví dụ:

Conversation không gọi Gemini trực tiếp.

Conversation

↓

AI Service

↓

Retriever

↓

Gemini

---

Dependency Direction

UI

↓

Service

↓

Repository

↓

Database

Không làm ngược lại.

---

Scalable

Có thể mở rộng:

Single Admin

↓

Multiple Admin

↓

Workspace

↓

SaaS

mà không phải viết lại.

---

# 12. Technologies

Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- Shadcn UI
- Zustand
- TanStack Query

Backend

- Express
- TypeScript
- Socket.IO
- JWT

Database

- MongoDB

AI

- Gemini API

Vector Database

- Qdrant

Automation

- n8n

Deployment

- Docker

---

# 13. Error Handling

Frontend

- Toast
- Retry
- Error Boundary

Backend

- Global Error Handler
- Validation
- Logging

AI

- Timeout
- Retry
- Fallback Response

---

# 14. Security

Password Hash

JWT

Helmet

CORS

Rate Limit

Input Validation

Sanitize Input

---

# 15. Logging

Log:

- Login
- Upload Document
- AI Request
- Human Handoff
- Error

Không log:

- Password
- JWT
- API Key

---

# 16. Future Expansion

Không cần thay đổi kiến trúc khi thêm:

✓ Workspace

✓ Multiple AI

✓ Claude

✓ OpenAI

✓ Ollama

✓ CRM

✓ Email

✓ Slack

✓ Mobile

✓ SaaS

Chỉ cần thêm module mới.

---

End of Document
