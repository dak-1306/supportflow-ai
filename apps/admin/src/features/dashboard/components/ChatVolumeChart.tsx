import React, { memo } from "react";
import { TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartVolumePoint } from "@/features/dashboard/types/types";

interface ChatVolumeChartProps {
  data: ChartVolumePoint[];
}

export const ChatVolumeChart: React.FC<ChatVolumeChartProps> = memo(
  ({ data }) => {
    return (
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Lượng trò chuyện (7 ngày gần đây)
          </h2>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="chats"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorChats)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  },
);

ChatVolumeChart.displayName = "ChatVolumeChart";
