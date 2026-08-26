// src/shared/constants/upload.constants.ts
export const IMAGE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE_MB: 2,
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024,
  ACCEPTED_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
  ERROR_MESSAGES: {
    INVALID_TYPE: "Chỉ chấp nhận định dạng PNG, JPG, WEBP.",
    FILE_TOO_LARGE: "Kích thước file không được vượt quá 2MB.",
  },
} as const;
