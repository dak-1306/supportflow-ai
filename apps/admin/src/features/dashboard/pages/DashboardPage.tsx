import React from "react";
import { MessageSquare, Clock, FileText, CheckCircle2 } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { MetricCard } from "../components/MetricCard";
import { ChatVolumeChart } from "../components/ChatVolumeChart";
import { RecentConversationsList } from "../components/RecentConversationsList";

export const DashboardPage: React.FC = () => {
  const { analytics, isLoading, isError, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải thông số thống kê...
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="p-8 text-center text-red-500">
        {error?.message || "Không thể tải dữ liệu Dashboard"}
      </div>
    );
  }

  const { cards, chart, recentConversations } = analytics;

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Chats"
          value={cards.todayChats}
          subtext="Lượt hội thoại mới hôm nay"
          icon={MessageSquare}
          color="bg-blue-500"
        />
        <MetricCard
          title="Waiting Chats"
          value={cards.waitingChats}
          subtext="Đang chờ Admin hỗ trợ"
          icon={Clock}
          color="bg-amber-500"
        />
        <MetricCard
          title="Documents"
          value={cards.totalDocuments}
          subtext={`${cards.readyDocuments} tài liệu đã sẵn sàng`}
          icon={FileText}
          color="bg-indigo-500"
        />
        <MetricCard
          title="Success Rate"
          value={`${cards.successRate}%`}
          subtext="Tỷ lệ xử lý thành công"
          icon={CheckCircle2}
          color="bg-emerald-500"
        />
      </div>

      {/* CHARTS & RECENT CONVERSATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChatVolumeChart data={chart} />
        </div>
        <div className="lg:col-span-1">
          <RecentConversationsList conversations={recentConversations} />
        </div>
      </div>
    </div>
  );
};
