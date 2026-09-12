import { ReactNode } from "react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendUp?: boolean;
  trendDown?: boolean;
  icon: ReactNode;
  iconBgClass: string;
}

export default function StatCard({
  title,
  value,
  trend,
  trendUp,
  trendDown,
  icon,
  iconBgClass,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className={clsx("p-3 rounded-xl", iconBgClass)}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p
          className={clsx("text-sm font-medium", {
            "text-green-600": trendUp || (!trendUp && !trendDown),
            "text-red-500": trendDown,
          })}
        >
          {trendUp && "↑ "}
          {trendDown && "↓ "}
          {trend}
        </p>
      </div>
    </div>
  );
}
