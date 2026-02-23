import { LucideIcon } from "lucide-react";

interface TrendData {
  value: string;
  direction: "up" | "down" | "neutral";
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: TrendData;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
}: StatCardProps) => {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition-all hover:shadow-md hover:-translate-y-1">
      <div className="mb-4 flex items-start justify-between">
        <Icon className="w-5 h-5 text-slate-400" aria-label={title} />
        {trend && (
          <span className="flex items-center gap-1 text-xs" data-testid="trend">
            {trend.direction === "up" && (
              <span className="text-green-600">↑</span>
            )}
            {trend.direction === "down" && (
              <span className="text-red-600">↓</span>
            )}
            <span
              className={
                trend.direction === "up"
                  ? "text-green-600"
                  : trend.direction === "down"
                    ? "text-red-600"
                    : "text-slate-500"
              }
            >
              {trend.value}
            </span>
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );
};
