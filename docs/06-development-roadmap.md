# Development Roadmap

Project: SupportFlow AI

Version: 1.0

---

# 1. Project Goal

Xây dựng một AI Customer Support Platform theo hướng sản phẩm thực tế.

Mục tiêu:

- Đưa vào Portfolio
- Có thể Deploy Demo
- Có thể mở rộng thành SaaS trong tương lai
- Hoàn thành MVP trong khoảng 1 tháng

---

# 2. Development Principles

## Rules

- Chỉ làm đúng Milestone hiện tại.
- Không thêm feature ngoài MVP.
- Mỗi Milestone phải chạy được.
- Mỗi Milestone phải có Demo.
- Mỗi Milestone phải Commit.
- Mỗi Milestone phải Update README.

---

## Priority

Working Software

>

Clean Architecture

>

Beautiful UI

>

Extra Features

---

# 3. Tech Stack

Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- Shadcn UI
- TanStack Query
- Zustand
- React Hook Form
- Zod

Backend

- Express
- TypeScript
- MongoDB
- Mongoose
- Socket.IO

AI

- Gemini API

Vector Database

- Qdrant

Automation

- n8n (Phase 2)

Deployment

- Docker

---

# 4. Folder Structure

supportflow-ai/

apps/

- admin
- widget

packages/

- ui
- api
- shared-types

backend/

docs/

---

# 5. Milestone Overview

M0 - Foundation

↓

M1 - Authentication

↓

M2 - Realtime Chat

↓

M3 - Gemini Integration

↓

M4 - Knowledge Base

↓

M5 - RAG

↓

M6 - Human Handoff

↓

M7 - Dashboard

↓

M8 - Polish & Deploy

---

# Milestone 0

## Foundation

Estimated

2 Days

Goal

Khởi tạo toàn bộ project.

Tasks

Repository

Monorepo

Admin App

Widget App

Backend

MongoDB Connection

Docker

Environment Variables

ESLint

Prettier

Git Hooks

Base Layout

Shadcn UI

Folder Structure

Success

- Admin chạy
- Widget chạy
- Backend chạy
- MongoDB kết nối
- Docker chạy

Commit

feat: initialize project foundation

---

# Milestone 1

## Authentication

Estimated

2 Days

Goal

Admin có thể đăng nhập.

Tasks

JWT

Refresh Token

Login API

Protected Route

Persist Login

Logout

Axios Interceptor

Success

- Login thành công
- Refresh Token hoạt động
- Dashboard được bảo vệ

Commit

feat(auth): implement authentication

---

# Milestone 2

## Realtime Chat

Estimated

3 Days

Goal

Khách và Admin chat realtime.

Tasks

Conversation

Message

Socket.IO

Widget UI

Admin Chat UI

Typing Indicator

Online Status

Auto Scroll

Conversation List

Success

Customer gửi tin

↓

Admin nhận

↓

Admin trả lời

↓

Customer nhận

Commit

feat(chat): realtime conversation

---

# Milestone 3

## Gemini Integration

Estimated

2 Days

Goal

AI trả lời khách.

Tasks

Gemini API

Prompt Builder

AI Service

Streaming (optional)

Loading

Retry

Success

Customer

↓

AI

↓

Reply

Commit

feat(ai): integrate gemini

---

# Milestone 4

## Knowledge Base

Estimated

3 Days

Goal

Upload tài liệu.

Tasks

Upload PDF

Upload DOCX

Extract Text

Document List

Delete Document

Processing Status

Success

Upload

↓

Extract

↓

Save

Commit

feat(kb): knowledge base management

---

# Milestone 5

## RAG

Estimated

3 Days

Goal

AI trả lời bằng tài liệu.

Tasks

Chunking

Embedding

Retriever

Qdrant

Similarity Search

Context Builder

Citation

Confidence Score

Success

Question

↓

Retriever

↓

Gemini

↓

Answer

Commit

feat(rag): retrieval augmented generation

---

# Milestone 6

## Human Handoff

Estimated

2 Days

Goal

Admin tiếp quản AI.

Tasks

Confidence Threshold

Waiting Admin

Notification

Assign Conversation

Take Over

Disable AI

Resolve Conversation

Success

AI

↓

Waiting

↓

Admin

↓

Resolved

Commit

feat(chat): human handoff

---

# Milestone 7

## Dashboard

Estimated

2 Days

Goal

Thống kê hệ thống.

Tasks

Statistics API

Cards

Charts

Recent Conversations

Today's Chats

Waiting Chats

Documents

Success Rate

Success

Dashboard hiển thị đầy đủ.

Commit

feat(dashboard): analytics overview

---

# Milestone 8

## Polish & Deploy

Estimated

3 Days

Goal

Hoàn thiện MVP.

Tasks

Loading

Skeleton

Responsive

Error Handling

Empty State

Toast

README

Environment Guide

Deployment

Testing

Performance Optimization

Success

Deploy thành công.

README hoàn chỉnh.

Demo hoạt động.

Commit

chore: prepare production release

---

# 6. Daily Workflow

Mỗi ngày:

1. Chọn 1 task.
2. Hoàn thành task.
3. Test.
4. Commit.
5. Push.
6. Cập nhật Roadmap nếu cần.

Không bắt đầu task mới nếu task hiện tại chưa hoàn thành.

---

# 7. Git Convention

Branch

feature/...

fix/...

refactor/...

Commit

feat:

fix:

refactor:

docs:

style:

chore:

---

# 8. MVP Checklist

Authentication (rồi)

Realtime Chat

Gemini Integration

Knowledge Base

RAG

Human Handoff

Dashboard

Deployment

README

---

# 9. Phase 2 Backlog

Multi Workspace

Multiple Admin

Role Permission

OpenAI

Claude

Ollama

n8n Workflow

Slack

Email

CRM

Analytics

Dark Mode

Theme

Widget Customization

---

# 10. Definition of Done

Một Milestone được xem là hoàn thành khi:

- Tất cả task hoàn thành.
- Không có bug nghiêm trọng.
- Có thể demo.
- Đã commit.
- Đã push.
- README được cập nhật.
- Không còn TODO trong Milestone hiện tại.

Sau khi đạt Definition of Done mới được chuyển sang Milestone tiếp theo.

---

# Current Status

Milestone: M0 - Foundation

Status: READY TO START

Next Action:

- Khởi tạo repository.
- Thiết lập monorepo.
- Tạo Admin App.
- Tạo Widget App.
- Tạo Backend.

Project Progress

████████░░░░░░░░░░░░░░░░ 0%
