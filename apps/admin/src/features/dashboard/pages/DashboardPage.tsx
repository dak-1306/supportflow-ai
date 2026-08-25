import React from "react";
import { MessageSquare, Clock, FileText, CheckCircle2 } from "lucide-react";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { ChatVolumeChart } from "@/features/dashboard/components/ChatVolumeChart";
import { RecentConversationsList } from "@/features/dashboard/components/RecentConversationsList";

const DASHBOARD_TEXT = {
  title: "Analytics Overview",
  loading: "Đang tải thông số thống kê...",
  errorDefault: "Không thể tải dữ liệu Dashboard",
  cards: {
    todayChats: {
      title: "Today's Chats",
      subtext: "Lượt hội thoại mới hôm nay",
    },
    waitingChats: { title: "Waiting Chats", subtext: "Đang chờ Admin hỗ trợ" },
    documents: { title: "Documents" },
    successRate: { title: "Success Rate", subtext: "Tỷ lệ xử lý thành công" },
  },
};

export const DashboardPage: React.FC = () => {
  const { analytics, isLoading, isError, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        {DASHBOARD_TEXT.loading}
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="p-8 text-center text-red-500">
        {error?.message || DASHBOARD_TEXT.errorDefault}
      </div>
    );
  }

  const { cards, chart, recentConversations } = analytics;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {DASHBOARD_TEXT.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={DASHBOARD_TEXT.cards.todayChats.title}
          value={cards.todayChats}
          subtext={DASHBOARD_TEXT.cards.todayChats.subtext}
          icon={MessageSquare}
          color="bg-blue-500"
        />
        <MetricCard
          title={DASHBOARD_TEXT.cards.waitingChats.title}
          value={cards.waitingChats}
          subtext={DASHBOARD_TEXT.cards.waitingChats.subtext}
          icon={Clock}
          color="bg-amber-500"
        />
        <MetricCard
          title={DASHBOARD_TEXT.cards.documents.title}
          value={cards.totalDocuments}
          subtext={`${cards.readyDocuments} tài liệu đã sẵn sàng`}
          icon={FileText}
          color="bg-indigo-500"
        />
        <MetricCard
          title={DASHBOARD_TEXT.cards.successRate.title}
          value={`${cards.successRate}%`}
          subtext={DASHBOARD_TEXT.cards.successRate.subtext}
          icon={CheckCircle2}
          color="bg-emerald-500"
        />
      </div>

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
