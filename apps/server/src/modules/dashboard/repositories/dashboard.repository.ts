import { Types } from "mongoose";
import { ConversationModel } from "../../chat/models/Conversation";
import { DocumentModel } from "../../knowledge-base/models/document.model";

export class DashboardRepository {
  /**
   * Helper ép kiểu an toàn cho Aggregation query
   */
  private static toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return typeof id === "string" ? new Types.ObjectId(id) : id;
  }

  /**
   * Thống kê tổng quan các thẻ số liệu cho Conversations
   */
  static async getConversationStats(
    workspaceId: string | Types.ObjectId,
    startOfToday: Date,
  ) {
    const wsId = this.toObjectId(workspaceId);

    const stats = await ConversationModel.aggregate([
      { $match: { workspaceId: wsId } },
      {
        $group: {
          _id: null,
          totalConversations: { $sum: 1 },
          todayChats: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", startOfToday] }, 1, 0],
            },
          },
          waitingChats: {
            $sum: {
              $cond: [{ $eq: ["$status", "WAITING_ADMIN"] }, 1, 0],
            },
          },
          resolvedChats: {
            $sum: {
              $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0],
            },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalConversations: 0,
        todayChats: 0,
        waitingChats: 0,
        resolvedChats: 0,
      }
    );
  }

  /**
   * Thống kê số lượng cuộc hội thoại theo từng ngày (7 ngày gần nhất)
   */
  static async getDailyChatVolume(
    workspaceId: string | Types.ObjectId,
    sevenDaysAgo: Date,
  ) {
    const wsId = this.toObjectId(workspaceId);

    return await ConversationModel.aggregate([
      {
        $match: {
          workspaceId: wsId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Lấy danh sách 5 cuộc trò chuyện gần nhất (Serialize sang JSON)
   */
  static async getRecentConversations(
    workspaceId: string | Types.ObjectId,
    limit: number = 5,
  ) {
    const rawDocs = await ConversationModel.find({ workspaceId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate("assignedAdminId", "name email avatar")
      .exec();

    // Biến đổi qua toJSON để đổi _id -> id và loại bỏ các trường ẩn
    return rawDocs.map((doc) => doc.toJSON());
  }

  /**
   * Thống kê số lượng Document theo trạng thái
   */
  static async getDocumentStats(workspaceId: string | Types.ObjectId) {
    const wsId = this.toObjectId(workspaceId);

    return await DocumentModel.aggregate([
      { $match: { workspaceId: wsId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
  }
}
