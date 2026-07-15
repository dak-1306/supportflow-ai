import { ConversationModel, IConversation } from "../models/Conversation";
import { Types } from "mongoose";

export class ConversationRepository {
  async findById(id: string): Promise<IConversation | null> {
    return ConversationModel.findById(id);
  }

  async findActiveByCustomerId(
    customerId: string,
  ): Promise<IConversation | null> {
    return ConversationModel.findOne({
      customerId,
      status: { $ne: "RESOLVED" },
    });
  }

  async create(data: Partial<IConversation>): Promise<IConversation> {
    return ConversationModel.create(data);
  }

  async findByWorkspace(
    workspaceId: string,
    status?: string,
    page = 1,
    limit = 20,
  ): Promise<{ conversations: any[]; total: number }> {
    const matchQuery: any = { workspaceId: new Types.ObjectId(workspaceId) };
    if (status && status !== "ALL") {
      matchQuery.status = status;
    }

    const skip = (page - 1) * limit;

    // Chạy song song query đếm tổng số lượng và query aggregate lấy dữ liệu kèm tin nhắn cuối
    const [rawConversations, total] = await Promise.all([
      ConversationModel.aggregate([
        // 1. Lọc dữ liệu theo workspace và status
        { $match: matchQuery },

        // 2. Sắp xếp theo thời gian cập nhật mới nhất
        { $sort: { updatedAt: -1 } },

        // 3. Phân trang trực tiếp trong database
        { $skip: skip },
        { $limit: limit },

        // 4. JOIN qua bảng messages (MongoDB lưu mặc định tên collection là 'messages')
        {
          $lookup: {
            from: "messages",
            localField: "_id",
            foreignField: "conversationId",
            as: "chatMessages",
          },
        },

        // 5. Trích xuất text của tin nhắn cuối cùng (nếu có)
        {
          $addFields: {
            lastMessage: {
              $let: {
                vars: {
                  sortedMessages: {
                    $sortArray: {
                      input: "$chatMessages",
                      sortBy: { createdAt: 1 },
                    },
                  },
                },
                in: { $arrayElemAt: ["$$sortedMessages.message", -1] },
              },
            },
          },
        },

        // 6. Loại bỏ mảng tin nhắn trung gian để tối ưu hóa băng thông trả về
        {
          $project: {
            chatMessages: 0,
          },
        },
      ]),
      ConversationModel.countDocuments(matchQuery),
    ]);

    // Chuyển đổi các kết quả Aggregate thô thành Mongoose Document ảo
    // để các Virtuals toJSON (đổi _id -> id, ẩn __v) hoạt động mượt mà
    const conversations = rawConversations.map((rawDoc) => {
      const doc = ConversationModel.hydrate(rawDoc);
      // Đảm bảo trường lastMessage không bị mất khi hydrate
      const json = doc.toJSON();
      if (rawDoc.lastMessage) {
        json.lastMessage = rawDoc.lastMessage;
      }
      return json;
    });

    console.log(
      `Retrieved ${conversations.length} conversations for workspace ${workspaceId} with status ${status || "ALL"}. Total: ${total}`,
    );

    return { conversations, total };
  }
}
