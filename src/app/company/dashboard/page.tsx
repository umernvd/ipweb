"use client";

import { Users, Briefcase, Video, Clock } from "lucide-react";
import { StatCard } from "@/modules/dashboard/components/StatCard";
import { useCompanyDashboard } from "@/modules/dashboard/hooks/useCompanyDashboard";

export default function DashboardPage() {
  const {
    totalInterviewers,
    activeRoles,
    totalInterviews,
    pendingInterviews,
    recentInterviews,
    chartData,
    isLoading,
  } = useCompanyDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        <StatCard
          title="Pending Interviews"
          value={pendingInterviews.toString()}
          icon={Clock}
          colorTheme="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="col-span-1 lg:col-span-2 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Interview Activity
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
                Week
              </button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white shadow-sm">
                Month
              </button>
            </div>
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
          <div className="flex justify-between mt-2 text-xs text-slate-400 px-2">
            {chartData.map((item, i) => (
              <span key={i}>{item.label}</span>
            ))}
          </div>
        </div>

        {/* Recent List */}
        <div className="col-span-1 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Recent Interviews
            </h3>
            <a
              href="#"
              className="text-sm font-medium text-primary hover:opacity-80"
            >
              View all
            </a>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            {recentInterviews.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
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
                      <span className="text-xs text-slate-500">
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
      <div className="h-10"></div>
    </div>
  );
}
