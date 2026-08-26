// src/shared/hooks/useUpload.ts
import { useMutation } from "@tanstack/react-query";
import { uploadApi, UploadImageResponse } from "@/shared/services/upload.api";
import { IMAGE_UPLOAD_CONFIG } from "@/shared/constants/upload.constants";

export const useUploadImageMutation = () => {
  return useMutation<UploadImageResponse, Error, File>({
    mutationFn: async (file: File) => {
      // Validate Client-side sử dụng constant từ shared
      const isValidType = (
        IMAGE_UPLOAD_CONFIG.ACCEPTED_TYPES as readonly string[]
      ).includes(file.type);

      if (!isValidType) {
        throw new Error(IMAGE_UPLOAD_CONFIG.ERROR_MESSAGES.INVALID_TYPE);
      }

      if (file.size > IMAGE_UPLOAD_CONFIG.MAX_FILE_SIZE_BYTES) {
        throw new Error(IMAGE_UPLOAD_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE);
      }

      return uploadApi.uploadImage(file);
    },
  });
};
