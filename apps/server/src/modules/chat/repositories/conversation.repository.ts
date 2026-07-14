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
  ): Promise<{ conversations: IConversation[]; total: number }> {
    const query: any = { workspaceId: new Types.ObjectId(workspaceId) };
    if (status && status !== "ALL") {
      query.status = status;
    }

    const [conversations, total] = await Promise.all([
      ConversationModel.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ConversationModel.countDocuments(query),
    ]);

    console.log(
      `Retrieved ${conversations.length} conversations for workspace ${workspaceId} with status ${status || "ALL"}. Total: ${total}`,
    );

    return { conversations, total };
  }
}
