import { Types } from "mongoose";
import { ConversationModel } from "../../chat/models/Conversation";
import { DocumentModel } from "../../knowledge-base/models/document.model";

export class DashboardRepository {
  /**
   * Thống kê tổng quan các thẻ số liệu cho Conversations
   */
  static async getConversationStats(
    workspaceId: Types.ObjectId,
    startOfToday: Date,
  ) {
    const stats = await ConversationModel.aggregate([
      { $match: { workspaceId } },
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
    workspaceId: Types.ObjectId,
    sevenDaysAgo: Date,
  ) {
    return await ConversationModel.aggregate([
      {
        $match: {
          workspaceId,
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
   * Lấy danh sách 5 cuộc trò chuyện gần nhất
   */
  static async getRecentConversations(
    workspaceId: Types.ObjectId,
    limit: number = 5,
  ) {
    return await ConversationModel.find({ workspaceId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate("assignedAdminId", "name email avatar")
      .lean();
  }

  /**
   * Thống kê số lượng Document theo trạng thái
   */
  static async getDocumentStats(workspaceId: Types.ObjectId) {
    return await DocumentModel.aggregate([
      { $match: { workspaceId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
  }
}
