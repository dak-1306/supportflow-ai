import React, { memo } from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  color: string;
}

export const MetricCard: React.FC<MetricCardProps> = memo(
  ({ title, value, subtext, icon: Icon, color }) => {
    return (
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    );
  },
);

MetricCard.displayName = "MetricCard";
