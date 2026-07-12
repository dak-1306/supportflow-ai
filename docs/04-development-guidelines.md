# Development Guidelines

Project: SupportFlow AI

Version: 1.0

---

# 1. Purpose

Tài liệu này định nghĩa các quy tắc phát triển của dự án.

Mọi contributor (bao gồm AI) phải tuân thủ.

Nếu tài liệu khác mâu thuẫn với tài liệu này thì ưu tiên:

Product Requirement

↓

System Design

↓

Development Guidelines

---

# 2. General Principles

- Không tự ý thêm tính năng.
- Không thay đổi kiến trúc.
- Không refactor ngoài phạm vi task.
- Không tối ưu sớm (Premature Optimization).
- Luôn ưu tiên code dễ đọc.

---

# 3. Development Order

Luôn theo thứ tự:

Database

↓

Backend

↓

Frontend

↓

Testing

↓

Refactor

↓

Commit

---

# 4. Backend Architecture

Bắt buộc theo kiến trúc:

Route

↓

Controller

↓

Service

↓

Repository

↓

MongoDB

Controller:

- Không chứa business logic.
- Không truy cập database.

Service:

- Chứa toàn bộ business logic.

Repository:

- Chỉ làm việc với MongoDB.

---

# 5. Frontend Architecture

Page

↓

Feature

↓

Component

↓

Hook

↓

Service(API)

↓

Shared Package

Page

- Chỉ điều phối layout.

Feature

- Chứa business logic.

Component

- Chỉ render UI.

---

# 6. State Management

TanStack Query

→ Server State

Zustand

→ Global Client State

Local State

→ UI State

Không dùng Context API cho Global State.

---

# 7. API Rules

- RESTful API.
- Response thống nhất.
- Không trả raw Mongo document.

Ví dụ:

{
success,
message,
data
}

---

# 8. Error Handling

Frontend

- Toast
- Retry khi phù hợp
- Error Boundary

Backend

- Global Error Handler
- Không throw Error trực tiếp.
- Sử dụng AppError.

---

# 9. Validation

Frontend

React Hook Form

-

Zod

Backend

Validation Middleware

Không tin tưởng dữ liệu từ client.

---

# 10. Authentication

Admin

JWT Access Token

-

Refresh Token

Customer

Không cần Authentication.

---

# 11. Socket.IO Rules

Socket chỉ dùng cho:

- Chat
- Typing
- Notification

Không dùng Socket để CRUD dữ liệu.

---

# 12. AI Rules

Gemini chỉ được trả lời bằng dữ liệu từ Knowledge Base.

Nếu không tìm thấy:

↓

Human Handoff.

Không được bịa.

---

# 13. Coding Style

Function

Một chức năng.

Component

Một trách nhiệm.

Không tạo file quá lớn.

Khuyến nghị:

< 300 dòng/file.

---

# 14. Naming Convention

Folder

kebab-case

Component

PascalCase

Hook

camelCase

Enum

PascalCase

Interface

PascalCase

Variable

camelCase

Constant

UPPER_CASE

---

# 15. Import Rules

Ưu tiên:

Relative Import (trong cùng feature)

Alias Import (khác feature)

Không import xuyên tầng.

Ví dụ:

Component

↓

Repository

❌

---

# 16. Performance

React.memo khi cần.

Lazy Route.

Dynamic Import.

Debounce Search.

Pagination.

Virtual List (nếu cần).

Không optimize quá sớm.

---

# 17. Security

Validate Input.

Sanitize Input.

Hash Password.

Không log Token.

Không log Password.

Không commit API Key.

---

# 18. Documentation

Mỗi Milestone hoàn thành:

- Update README
- Update Roadmap
- Commit

---

# 19. Git Convention

feat:

fix:

docs:

style:

refactor:

test:

chore:

---

# 20. AI Contributor Rules

Nếu AI thiếu thông tin:

- Không tự quyết định.
- Không tự thêm tính năng.
- Không tự đổi kiến trúc.
- Dừng và hỏi.

Nếu tài liệu mâu thuẫn:

PRD

>

System Design

>

Database Design

>

Development Guidelines

---

END
