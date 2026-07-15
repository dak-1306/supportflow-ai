# Design System

Project: SupportFlow AI

Version: 1.0

---

# 1. Purpose

Tài liệu này định nghĩa toàn bộ quy tắc thiết kế giao diện của dự án.

Mục tiêu:

- Giao diện nhất quán.
- Dễ mở rộng.
- Dễ bảo trì.
- AI và Developer cùng tuân theo một tiêu chuẩn.

Nếu có mâu thuẫn với tài liệu khác thì ưu tiên:

Product Requirement

↓

System Design

↓

Design System

---

# 2. Design Philosophy

SupportFlow AI là một sản phẩm SaaS hiện đại.

Phong cách thiết kế:

- Clean
- Minimal
- Professional
- Premium
- Modern
- Functional
- Accessibility First

Ưu tiên:

- Dễ đọc.
- Dễ sử dụng.
- Khoảng trắng hợp lý.
- Ít màu sắc.
- Ít hiệu ứng.
- Tập trung vào nội dung.

Không theo phong cách:

- Glassmorphism.
- Neumorphism.
- Quá nhiều animation.
- Gradient lạm dụng.

---

# 3. Design Inspirations

Toàn bộ giao diện lấy cảm hứng từ:

- Vercel Dashboard
- Linear
- Notion
- shadcn/ui

Mục tiêu:

- Dashboard chuyên nghiệp.
- Typography rõ ràng.
- Component đồng bộ.
- Trải nghiệm nhanh và gọn.

---

# 4. Theme

Sử dụng Theme của shadcn/ui.

Không tạo thêm hệ màu mới.

Chỉ sử dụng:

- Primary
- Secondary
- Accent
- Muted
- Destructive
- Background
- Card
- Border

Không hardcode màu trong component.

---

# 5. Typography

Font:

- Inter

Hierarchy:

- H1
- H2
- H3
- Body
- Small
- Muted

Không sử dụng kích thước font tùy ý.

Ưu tiên class mặc định của Tailwind.

Ví dụ:

- text-4xl
- text-3xl
- text-2xl
- text-xl
- text-base
- text-sm

---

# 6. Spacing

Quy tắc spacing:

Page Padding

- p-6
- lg:p-8

Card Padding

- p-6

Section Gap

- gap-6

Component Gap

- gap-4

Input Gap

- gap-2

Không sử dụng spacing ngẫu nhiên.

---

# 7. Border Radius

Button

- rounded-md

Input

- rounded-md

Card

- rounded-xl

Dialog

- rounded-xl

Không sử dụng:

- rounded-full (trừ Avatar)
- rounded-3xl
- rounded-[...]

---

# 8. Shadow

Chỉ sử dụng:

- shadow-sm
- shadow-md

Không sử dụng shadow quá lớn.

---

# 9. Icon

Sử dụng:

- Lucide React

Kích thước mặc định:

- 16
- 18
- 20

Không sử dụng nhiều bộ icon khác nhau.

---

# 10. Layout

## Admin

Sidebar

↓

Header

↓

Content

↓

Footer (nếu cần)

---

## Widget

Header

↓

Conversation

↓

Input

---

# 11. Component Rules

Ưu tiên sử dụng:

packages/ui

↓

shadcn/ui

↓

Custom Component

Không viết lại component nếu đã tồn tại.

Ví dụ:

Button

Input

Dialog

Dropdown

Table

Badge

Card

Sheet

Popover

Tooltip

---

# 12. Form

Sử dụng:

React Hook Form

-

Zod

Component:

Input

Select

Textarea

Checkbox

Radio

Switch

Button

Không tự tạo form component mới nếu không cần.

---

# 13. Table

Sử dụng Table của shadcn/ui.

Mỗi bảng nên có:

- Search
- Filter (nếu cần)
- Pagination
- Empty State
- Loading State

---

# 14. Card

Card luôn gồm:

Header

↓

Content

↓

Footer (nếu cần)

Không lồng quá nhiều card.

---

# 15. Button

Chỉ sử dụng variant của shadcn/ui.

Ví dụ:

- default
- secondary
- outline
- ghost
- destructive
- link

Không tạo thêm variant mới nếu không thực sự cần.

---

# 16. Feedback

Loading

- Skeleton
- Spinner

Success

- Toast

Error

- Toast
- Inline Error

Empty

- Empty State Component

Không dùng alert().

---

# 17. Responsive

Desktop First.

Các breakpoint:

- sm
- md
- lg
- xl
- 2xl

Không viết CSS media query thủ công nếu Tailwind đã hỗ trợ.

---

# 18. Animation

Sử dụng animation nhẹ.

Ví dụ:

- Fade
- Slide
- Accordion
- Dialog Transition

Không sử dụng animation phức tạp.

Thời gian animation:

150–300ms.

---

# 19. Accessibility

Button phải có trạng thái:

- Hover
- Focus
- Disabled

Input phải có:

- Label
- Placeholder
- Error Message

Icon Button phải có aria-label.

Không dùng màu sắc làm cách truyền đạt duy nhất.

---

# 20. Reusability

Nếu một component xuất hiện từ 2 lần trở lên:

↓

Đưa vào packages/ui.

Không copy-paste component.

---

# 21. AI Design Rules

AI phải:

- Tuân thủ Design System.
- Không tự sáng tạo UI mới.
- Không thêm màu mới.
- Không thêm font mới.
- Không thay đổi spacing.
- Không thay đổi typography.
- Không tạo component mới nếu đã có component tương đương.
- Ưu tiên tái sử dụng packages/ui và shadcn/ui.

Nếu chưa rõ về thiết kế:

↓

Dừng và hỏi.

---

# 22. Definition of Done

Một màn hình được xem là hoàn thành khi:

- Responsive.
- Có Loading State.
- Có Empty State.
- Có Error State.
- Có Success Feedback.
- Đúng Design System.
- Không hardcode màu sắc.
- Không trùng lặp component.
- Có thể tái sử dụng.

---

END
