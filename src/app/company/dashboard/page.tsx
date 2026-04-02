"use client";

import { Users, Briefcase, Video } from "lucide-react";
import { StatCard } from "@/modules/dashboard/components/StatCard";
import { useCompanyDashboard } from "@/modules/dashboard/hooks/useCompanyDashboard";
import { Skeleton } from "@/shared/components/ui";

export default function DashboardPage() {
  const {
    totalInterviewers,
    activeRoles,
    totalInterviews,
    recentInterviews,
    chartData,
    isLoading,
  } = useCompanyDashboard();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl flex flex-col gap-8">
        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart and Recent Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
            <Skeleton className="h-6 w-40 mb-6" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <Skeleton className="h-6 w-40 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Interviewers"
          value={totalInterviewers.toString()}
          icon={Users}
          colorTheme="blue"
        />
        <StatCard
          title="Active Roles"
          value={activeRoles.toString()}
          icon={Briefcase}
          colorTheme="purple"
        />
        <StatCard
          title="Total Interviews"
          value={totalInterviews.toLocaleString()}
          icon={Video}
          colorTheme="indigo"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="col-span-1 lg:col-span-2 rounded-xl bg-white p-6 border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Interview Activity
            </h3>
          </div>

          <div className="h-64 w-full rounded-lg bg-slate-50 flex items-end justify-between px-6 pb-0 pt-10 gap-2 relative overflow-hidden">
            {chartData.map((item, i) => (
              <div
                key={i}
                style={{ height: `${item.height}%` }}
                className="w-full bg-primary/30 rounded-t-sm hover:bg-primary/60 transition-colors cursor-pointer relative group/bar"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-700 px-2">
            {chartData.map((item, i) => (
              <span key={i}>{item.label}</span>
            ))}
          </div>
        </div>

        {/* Recent List */}
        <div className="col-span-1 rounded-xl bg-white p-6 border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Recent Interviews
            </h3>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            {recentInterviews.length === 0 ? (
              <p className="text-sm text-slate-700 text-center py-8">
                No recent interviews
              </p>
            ) : (
              recentInterviews.map((interview) => {
                const statusColorMap: Record<string, string> = {
                  Pending: "orange",
                  Completed: "green",
                  Reviewing: "blue",
                  Scheduled: "purple",
                };
                const statusColor = statusColorMap[interview.status] || "slate";

                return (
                  <div
                    key={interview.$id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">
                        {interview.candidate?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-slate-700">
                        {interview.role?.title || "No Role"}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded 
                      ${statusColor === "orange" ? "bg-orange-50 text-orange-600" : ""}
                      ${statusColor === "green" ? "bg-green-50 text-green-600" : ""}
                      ${statusColor === "blue" ? "bg-blue-50 text-blue-600" : ""}
                      ${statusColor === "purple" ? "bg-purple-50 text-purple-600" : ""}
                      ${statusColor === "slate" ? "bg-slate-50 text-slate-600" : ""}
                    `}
                    >
                      {interview.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
