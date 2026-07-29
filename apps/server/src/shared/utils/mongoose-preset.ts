import { Document } from "mongoose";

// Cấu hình định dạng JSON đầu ra mặc định cho Mongoose
export const transformToJSON = {
  virtuals: true, // Cho phép tự động sinh ra trường ảo 'id' (Mongoose mặc định có sẵn id từ _id)
  versionKey: false, // Triệt tiêu hoàn toàn trường '__v' khi xuất JSON
  transform: (_doc: Document, ret: Record<string, any>) => {
    delete ret._id; // Xóa bỏ trường gốc '_id' sau khi đã ánh xạ sang 'id'
    return ret;
  },
};
