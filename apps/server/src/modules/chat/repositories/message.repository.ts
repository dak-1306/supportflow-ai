import { MessageModel, IMessage } from "../models/Message";

export class MessageRepository {
  async create(data: Partial<IMessage>): Promise<any> {
    const doc = await MessageModel.create(data);
    return doc.toJSON();
  }

  async findByConversationId(
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<{ messages: any[]; total: number }> {
    // Không bọc new Types.ObjectId() ở đây để tránh crash app nếu string không đúng định dạng
    const query = { conversationId };

    const [docs, total] = await Promise.all([
      MessageModel.find(query)
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      MessageModel.countDocuments(query),
    ]);

    // Biến đổi toàn bộ sang JSON sạch (đổi _id thành id)
    const messages = docs.map((doc) => doc.toJSON());

    return { messages, total };
  }
}
