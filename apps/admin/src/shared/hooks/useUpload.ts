// src/shared/hooks/useUpload.ts
import { useMutation } from "@tanstack/react-query";
import { uploadApi, UploadImageResponse } from "@/shared/services/upload.api";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const useUploadImageMutation = () => {
  return useMutation<UploadImageResponse, Error, File>({
    mutationFn: async (file: File) => {
      // 🟢 Validate Client-side trước khi tốn Băng thông gửi API
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        throw new Error("Chỉ chấp nhận định dạng PNG, JPG, WEBP");
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Kích thước file không được vượt quá 2MB.");
      }

      return uploadApi.uploadImage(file);
    },
  });
};
