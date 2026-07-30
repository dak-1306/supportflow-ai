import { z } from "zod";

export const testRagQuerySchema = z.object({
  workspaceId: z.string({
    message: "workspaceId là bắt buộc",
  }),
  question: z
    .string({
      message: "question là bắt buộc",
    })
    .min(1, "Câu hỏi không được để trống"),
});

export type TestRagQueryInput = z.infer<typeof testRagQuerySchema>;
