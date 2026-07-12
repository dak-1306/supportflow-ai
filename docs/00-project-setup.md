# Project Setup

Project: SupportFlow AI

Version: 1.0

Status: READY

---

# 1. Goal

Chuẩn bị nền tảng cho toàn bộ dự án.

Sau khi hoàn thành tài liệu này cần đạt được:

- Monorepo hoạt động.
- Các ứng dụng chạy độc lập.
- Có thể phát triển ngay.

---

# 2. Workspace Structure

supportflow-ai/

apps/

- admin
- widget
- server

packages/

- ui
- api-client
- shared-types
- config

docs/

docker/

---

# 3. Package Manager

pnpm

---

# 4. Monorepo Tool

Turborepo

---

# 5. Apps

## Admin

React

TypeScript

Vite

---

## Widget

React

TypeScript

Vite

---

## Server

Express

TypeScript

---

# 6. Shared Packages

## ui

Shared Components

---

## api-client

Axios

API

DTO

---

## shared-types

Interfaces

Enums

Types

---

## config

ESLint

Prettier

TSConfig

---

# 7. UI

TailwindCSS

Shadcn UI

Lucide Icons

React Hook Form

Zod

---

# 8. State

TanStack Query

Zustand

---

# 9. Backend

Express

Socket.IO

JWT

Mongoose

---

# 10. Database

MongoDB

Qdrant

---

# 11. Development Rules

Không import chéo app.

Chỉ import thông qua package.

---

Ví dụ

admin

↓

shared-types

↓

server

❌

admin

↓

server

---

# 12. Naming Convention

Folders

kebab-case

Components

PascalCase

Hooks

camelCase

Interfaces

PascalCase

Enums

PascalCase

---

# 13. Environment

.env

.env.local

.env.example

Không commit .env

---

# 14. Git

main

develop

feature/\*

fix/\*

---

# 15. Code Style

ESLint

Prettier

Husky

lint-staged

---

# 16. Ready Checklist

□ Monorepo

□ Admin

□ Widget

□ Server

□ Shared Packages

□ Tailwind

□ Shadcn

□ MongoDB

□ Docker

□ ESLint

□ Prettier

□ Husky

□ Git Ignore

□ Environment

---

END
