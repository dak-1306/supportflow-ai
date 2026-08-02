import { ConversationModel, IConversation } from "../models/Conversation";
import { Types } from "mongoose";
import { ConversationStatus } from "@supportflow/shared-types";

export class ConversationRepository {
  async findById(id: string): Promise<any | null> {
    const doc = await ConversationModel.findById(id).exec();
    return doc ? doc.toJSON() : null;
  }

  async findActiveByCustomerId(customerId: string): Promise<any | null> {
    const doc = await ConversationModel.findOne({
      customerId,
      status: { $ne: "RESOLVED" },
    }).exec();
    return doc ? doc.toJSON() : null;
  }

  async create(data: Partial<IConversation>): Promise<any> {
    const doc = await ConversationModel.create(data);
    return doc.toJSON();
  }

  async findByWorkspace(
    workspaceId: string,
    status?: string,
    page = 1,
    limit = 20,
  ): Promise<{ conversations: any[]; total: number }> {
    // Query dùng riêng cho Aggregate (Cần ObjectId)
    const matchQueryAggregate: any = {
      workspaceId: new Types.ObjectId(workspaceId),
    };

    // Query dùng cho Mongoose Count (Truyền string bình thường)
    const matchQueryCount: any = { workspaceId };

    if (status && status !== "ALL") {
      matchQueryAggregate.status = status;
      matchQueryCount.status = status;
    }

    const skip = (page - 1) * limit;

    const [rawConversations, total] = await Promise.all([
      ConversationModel.aggregate([
        { $match: matchQueryAggregate },
        { $sort: { updatedAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "messages",
            localField: "_id",
            foreignField: "conversationId",
            as: "chatMessages",
          },
        },
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
        {
          $project: {
            chatMessages: 0,
          },
        },
      ]),
      ConversationModel.countDocuments(matchQueryCount), // Dùng matchQueryCount an toàn hơn
    ]);

    // Hydrate & convert to JSON sạch (đổi _id -> id, xóa __v)
    const conversations = rawConversations.map((rawDoc) => {
      const doc = ConversationModel.hydrate(rawDoc);
      const json = doc.toJSON();
      if (rawDoc.lastMessage) {
        json.lastMessage = rawDoc.lastMessage;
      }
      return json;
    });

    return { conversations, total };
  }

  async updateHandoffStatus(
    conversationId: string,
    status: ConversationStatus,
    assignedAdminId?: string | null,
  ) {
    const updateData: Record<string, any> = { status, updatedAt: new Date() };

    if (assignedAdminId !== undefined) {
      updateData.assignedAdminId = assignedAdminId;
    }

    if (status === "RESOLVED") {
      updateData.endedAt = new Date();
    }

    const updatedDoc = await ConversationModel.findByIdAndUpdate(
      conversationId,
      updateData,
      { new: true },
    ).exec();

    return updatedDoc ? updatedDoc.toJSON() : null;
  }

  async update(
    conversationId: string,
    updateData: Record<string, any>,
  ): Promise<any | null> {
    const updatedDoc = await ConversationModel.findByIdAndUpdate(
      conversationId,
      updateData,
      { new: true },
    ).exec();

    return updatedDoc ? updatedDoc.toJSON() : null;
  }
}
