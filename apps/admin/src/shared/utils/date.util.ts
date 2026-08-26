// src/shared/utils/date.util.ts

/**
 * Định dạng ngày giờ chuẩn cho toàn hệ thống
 * @param dateInput Giá trị ngày tháng (chuỗi, số, hoặc object Date)
 * @param fallback Chuỗi hiển thị mặc định nếu dữ liệu đầu vào không hợp lệ
 */
export const formatDateTime = (
  dateInput?: string | number | Date | null,
  fallback = "N/A"
): string => {
  if (!dateInput) return fallback;

  const date = new Date(dateInput);

  // Kiểm tra xem date có hợp lệ không (tránh lỗi "Invalid Date")
  if (isNaN(date.getTime())) return fallback;

  // Bạn có thể tùy chỉnh format ở đây bằng Intl.DateTimeFormat để đồng bộ 100%
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};