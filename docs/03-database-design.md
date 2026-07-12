# Database Design

Version: 1.0

Project: SupportFlow AI

---

# 1. Database Overview

Database: MongoDB

Collections

- workspaces
- users
- conversations
- messages
- documents
- document_chunks
- notifications
- settings

---

# 2. Relationship Overview

Workspace

│

├── Users

├── Conversations

├── Documents

├── Settings

└── Notifications

Conversation

│

└── Messages

Document

│

└── Document Chunks

---

# 3. Collection Design

---

## Workspace

Purpose

Đại diện cho một doanh nghiệp.

MVP chỉ có một Workspace.

Fields

\_id

name

logo

status

createdAt

updatedAt

Future

Subscription

Plan

Billing

---

## User

Purpose

Admin của Workspace.

Fields

\_id

workspaceId

name

email

password

avatar

status

lastLogin

createdAt

updatedAt

Future

Role

Permission

---

## Conversation

Purpose

Một cuộc hội thoại.

Fields

\_id

workspaceId

customerId

status

assignedAdminId

startedAt

endedAt

createdAt

updatedAt

Status

AI

WAITING_ADMIN

HUMAN

RESOLVED

---

## Message

Purpose

Tin nhắn.

Fields

\_id

conversationId

sender

message

type

sources

confidence

createdAt

Sender

CUSTOMER

AI

ADMIN

Type

TEXT

SYSTEM

Future

IMAGE

FILE

VOICE

---

## Document

Purpose

Tài liệu gốc.

Fields

\_id

workspaceId

name

type

size

status

chunkCount

uploadedBy

createdAt

Status

PROCESSING

READY

FAILED

---

## DocumentChunk

Purpose

Lưu từng đoạn văn.

Fields

\_id

documentId

workspaceId

chunkIndex

content

vectorId

page

createdAt

vectorId

ID tương ứng trong Qdrant.

---

## Notification

Purpose

Thông báo cho Admin.

Fields

\_id

workspaceId

type

title

content

conversationId

isRead

createdAt

Types

NEW_CHAT

HANDOFF

SYSTEM

---

## Setting

Purpose

Cấu hình Workspace.

Fields

\_id

workspaceId

companyName

welcomeMessage

systemPrompt

updatedAt

---

# 4. Conversation Lifecycle

Conversation

↓

AI

↓

Waiting Admin

↓

Human

↓

Resolved

---

# 5. Message Flow

Customer

↓

Message

↓

MongoDB

↓

AI

↓

Message

↓

MongoDB

↓

Socket

↓

Customer

---

# 6. Index Recommendation

Conversation

workspaceId

status

updatedAt

---

Message

conversationId

createdAt

---

Document

workspaceId

status

---

DocumentChunk

documentId

workspaceId

---

Notification

workspaceId

isRead

---

User

email

(unique)

---

# 7. Data Retention

Conversation

Không tự xóa.

Message

Không tự xóa.

Notification

Có thể archive.

Document

Admin xóa thủ công.

---

# 8. Future Expansion

Database hỗ trợ sẵn:

✓ Multiple Workspace

✓ Multiple Admin

✓ Role Permission

✓ AI Provider

✓ Billing

✓ Subscription

không cần redesign.

---

End of Document
