import mongoose from "mongoose";
import { transformToJSON } from "../../../shared/utils/mongoose-preset";

const WorkspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // 1. Cấu hình AI mặc định cho Workspace
    aiConfig: {
      provider: { type: String, default: "gemini" },
      model: { type: String, default: "gemini-3.5-flash" },
      temperature: { type: Number, default: 0.7 },
      systemPrompt: {
        type: String,
        default: "Bạn là trợ lý AI hỗ trợ khách hàng lịch sự và chuyên nghiệp.",
      },
    },

    // 2. Cấu hình Widget Chat ở Client/Website
    widgetConfig: {
      primaryColor: { type: String, default: "#0066FF" },
      title: { type: String, default: "Hỗ trợ trực tuyến" },
      welcomeMessage: {
        type: String,
        default: "Xin chào! Chúng tôi có thể giúp gì cho bạn?",
      },
      botName: { type: String, default: "Support AI" },
      botAvatar: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    toJSON: transformToJSON,
  },
);

export const Workspace = mongoose.model("Workspace", WorkspaceSchema);
