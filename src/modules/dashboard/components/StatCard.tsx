import { LucideIcon } from "lucide-react";

// 1. Define the Trend object type explicitly
interface TrendData {
  value: string;
  isPositive?: boolean;
  label?: string;
}

// 2. Define the Props, making colorTheme optional
interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: TrendData;
  colorTheme?: "blue" | "purple" | "indigo" | "orange"; // Made optional (?)
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  colorTheme,
}: StatCardProps) => {
  return (
    <div className="flex flex-col p-5 bg-white border border-slate-200 rounded-xl shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {/* We use a subtle gray for the icon to keep it professional */}
        <Icon className="w-5 h-5 text-slate-400" />
      </div>

      <div className="flex items-baseline gap-3">
        <h3 className="text-2xl font-semibold text-slate-900">{value}</h3>

        {trend && (
          <span
            className={`text-sm font-medium flex items-center ${
              trend.isPositive
                ? "text-emerald-600"
                : trend.isPositive === false
                  ? "text-red-600"
                  : "text-slate-500"
            }`}
          >
            {trend.isPositive === true
              ? "↑"
              : trend.isPositive === false
                ? "↓"
                : ""}{" "}
            {trend.value}
            {trend.label && (
              <span className="ml-1 text-slate-400 font-normal">
                {trend.label}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
};
