import { Types } from "mongoose";
import { DashboardRepository } from "../repositories/dashboard.repository";
import { AppError } from "../../../shared/utils/app-error"; // Import AppError

export class DashboardService {
  static async getAnalytics(workspaceIdStr: string) {
    // 1. Kiểm tra định dạng ObjectId
    if (!Types.ObjectId.isValid(workspaceIdStr)) {
      throw new AppError("Invalid Workspace ID format", 400);
    }

    const workspaceId = new Types.ObjectId(workspaceIdStr);

    // Mốc thời gian Đầu ngày (00:00:00)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Mốc thời gian 7 ngày gần đây
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [convStats, dailyChart, recentConversations, docStats] =
      await Promise.all([
        DashboardRepository.getConversationStats(workspaceId, startOfToday),
        DashboardRepository.getDailyChatVolume(workspaceId, sevenDaysAgo),
        DashboardRepository.getRecentConversations(workspaceId, 5),
        DashboardRepository.getDocumentStats(workspaceId),
      ]);

    const successRate =
      convStats.totalConversations > 0
        ? Math.round(
            (convStats.resolvedChats / convStats.totalConversations) * 100,
          )
        : 0;

    const totalDocuments = docStats.reduce((acc, curr) => acc + curr.count, 0);
    const readyDocuments = docStats.find((d) => d._id === "READY")?.count || 0;

    return {
      cards: {
        todayChats: convStats.todayChats,
        waitingChats: convStats.waitingChats,
        totalDocuments,
        readyDocuments,
        successRate,
      },
      chart: dailyChart.map((item) => ({
        date: item._id,
        chats: item.count,
      })),
      recentConversations,
    };
  }
}
