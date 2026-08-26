import { api } from "@/shared/services/client";

export interface UploadImageResponse {
  url: string;
}

export const uploadApi = {
  /**
   * Tải ảnh đơn lên hệ thống (Cloudinary)
   */
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/uploads/image", formData, {
      headers: {
        "Content-Type": undefined,
      },
    });

    return response.data.data; // Trả về { url: "https://..." }
  },
};
