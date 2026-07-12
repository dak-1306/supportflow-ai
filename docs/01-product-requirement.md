# Product Requirement Document (PRD)

Version: 1.0
Status: Requirements Frozen
Project: SupportFlow AI

---

# 1. Overview

## 1.1 Introduction

SupportFlow AI là nền tảng AI Customer Support giúp doanh nghiệp xây dựng chatbot hỗ trợ khách hàng dựa trên tài liệu nội bộ.

Khách hàng có thể trò chuyện trực tiếp với AI thông qua Chat Widget trên website.

AI sẽ trả lời dựa trên Knowledge Base của doanh nghiệp thay vì kiến thức chung.

Nếu AI không đủ tự tin để trả lời, cuộc hội thoại sẽ được chuyển đến Admin.

Mục tiêu của dự án là xây dựng một sản phẩm có kiến trúc tốt, đủ chất lượng để đưa vào Portfolio và có khả năng phát triển thành SaaS trong tương lai.

---

## 1.2 Objectives

MVP cần đạt được các mục tiêu sau:

- AI trả lời dựa trên tài liệu doanh nghiệp.
- Admin quản lý tài liệu.
- Admin quản lý cuộc hội thoại.
- AI hỗ trợ khách hàng.
- Human Handoff khi AI không thể trả lời.
- Dashboard hiển thị tình trạng hệ thống.

---

## 1.3 Out of Scope

Các tính năng sau không nằm trong MVP:

- Multi Workspace
- Multiple AI Providers
- Ticket Management
- Role Permission
- Workflow Builder
- Billing
- SDK
- Mobile App
- Voice Chat
- Image Recognition

Các tính năng này sẽ được đưa vào Backlog.

---

# 2. Users

## Customer

Khách truy cập website.

Không cần tài khoản.

Có thể:

- Chat với AI
- Nhận câu trả lời
- Tiếp tục chat với Admin nếu được chuyển tiếp

---

## Admin

Quản trị hệ thống.

Có thể:

- Đăng nhập
- Quản lý tài liệu
- Quản lý hội thoại
- Trò chuyện với khách hàng
- Xem Dashboard
- Cấu hình AI

---

# 3. Core Features

## F01 Authentication

Admin đăng nhập.

Sau khi đăng nhập sẽ vào Dashboard.

Customer không cần đăng nhập.

---

## F02 Chat Widget

Customer có thể:

- Gửi tin nhắn
- Nhận phản hồi từ AI
- Thấy trạng thái typing
- Tiếp tục cuộc hội thoại

Widget cần hoạt động tốt trên Desktop và Mobile.

---

## F03 AI Response

AI sử dụng Knowledge Base để trả lời.

Nguyên tắc:

- Không trả lời ngoài tài liệu.
- Không tự suy đoán.
- Không bịa thông tin.

Nếu không tìm thấy dữ liệu:

"Tôi chưa tìm thấy thông tin trong tài liệu. Nhân viên sẽ hỗ trợ bạn."

---

## F04 Knowledge Base

Admin có thể:

- Upload PDF
- Upload DOCX
- Xem danh sách tài liệu
- Xóa tài liệu

Sau khi upload:

Document

↓

Extract Text

↓

Chunk

↓

Embedding

↓

Vector Database

---

## F05 Conversation Management

Admin có thể:

- Xem danh sách cuộc hội thoại
- Xem chi tiết cuộc hội thoại
- Trả lời khách hàng
- Tiếp quản từ AI

---

## F06 Human Handoff

Nếu AI không thể trả lời:

- Conversation chuyển sang trạng thái Waiting Admin
- Admin nhận notification
- Admin tiếp quản cuộc hội thoại

Sau khi Admin tiếp quản:

AI sẽ dừng trả lời.

---

## F07 Dashboard

Dashboard hiển thị:

- Active Conversations
- Waiting Conversations
- Documents
- AI Success Rate
- Today's Chats

Mục tiêu:

Cho Admin nhìn nhanh tình trạng hệ thống.

---

## F08 Settings

Admin có thể chỉnh:

- Company Name
- Welcome Message
- AI System Prompt

---

# 4. User Flow

## Customer

Open Website

↓

Open Chat Widget

↓

Send Message

↓

AI Search Knowledge Base

↓

AI Found Answer?

├── Yes

│ ↓

│ AI Reply

│

└── No

↓

Waiting Admin

↓

Admin Reply

↓

Conversation Continue

---

## Admin

Login

↓

Dashboard

↓

Notification

↓

Conversation

↓

Reply

↓

Resolved

---

# 5. Business Rules

## BR01

Customer không cần đăng nhập.

---

## BR02

Chỉ có Admin được đăng nhập.

---

## BR03

AI chỉ trả lời từ Knowledge Base.

---

## BR04

Nếu không có dữ liệu

↓

Không được suy đoán.

---

## BR05

Mỗi Conversation chỉ có một Admin xử lý tại một thời điểm.

---

## BR06

Sau khi Human Handoff

↓

AI không được trả lời nữa.

---

## BR07

Mọi tin nhắn đều được lưu.

---

## BR08

Mỗi câu trả lời AI cần lưu:

- Prompt
- Retrieved Chunks
- Response
- Confidence Score

---

# 6. Non Functional Requirements

Performance

- Response < 3 seconds (không tính thời gian LLM)

Availability

- Có thể hoạt động liên tục.

Security

- JWT Authentication
- Password Hash
- Validate Input

Maintainability

- Modular Architecture
- Clean Code
- TypeScript

Scalability

Kiến trúc phải hỗ trợ:

Single Workspace

↓

Multiple Workspace

mà không cần viết lại toàn bộ hệ thống.

---

# 7. MVP Success Criteria

MVP được coi là hoàn thành nếu:

✓ Admin đăng nhập được.

✓ Customer chat được.

✓ AI trả lời dựa trên tài liệu.

✓ Upload PDF thành công.

✓ Upload DOCX thành công.

✓ Conversation được lưu.

✓ Human Handoff hoạt động.

✓ Dashboard hiển thị dữ liệu.

✓ Project Deploy thành công.

---

# 8. Future Roadmap

Phase 2

- Multi Workspace
- Multiple AI Providers
- Analytics
- Agent Management
- Better Dashboard

Phase 3

- n8n Workflow
- CRM Integration
- Email Integration
- Slack Integration
- Notion Integration

Phase 4

- Billing
- SaaS
- Subscription
- Widget SDK

---

# 9. Development Principles

- Không thêm tính năng ngoài MVP.
- Ưu tiên hoàn thành hơn hoàn hảo.
- Mọi tính năng mới phải nằm trong Backlog.
- Code phải dễ mở rộng.
- Mọi module phải độc lập.

---

Requirements Frozen

Version 1.0
