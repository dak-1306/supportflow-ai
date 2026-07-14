import { MessageModel, IMessage } from "../models/Message";
import { Types } from "mongoose";

export class MessageRepository {
  async create(data: Partial<IMessage>): Promise<IMessage> {
    return MessageModel.create(data);
  }

  async findByConversationId(
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<{ messages: IMessage[]; total: number }> {
    const query = { conversationId: new Types.ObjectId(conversationId) };

    const [messages, total] = await Promise.all([
      MessageModel.find(query)
        .sort({ createdAt: 1 }) // Sắp xếp thời gian tăng dần để render mạch hội thoại
        .skip((page - 1) * limit)
        .limit(limit),
      MessageModel.countDocuments(query),
    ]);

    return { messages, total };
  }
}
