import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

export const Workspace = mongoose.model("Workspace", WorkspaceSchema);
