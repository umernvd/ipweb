import { Users, Briefcase, Video, Clock } from "lucide-react";
import { StatCard } from "@/modules/dashboard/components/StatCard";
import { StatusBadge } from "@/shared/components/ui/StatusBadge";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Interviewers"
          value="24"
          icon={Users}
          trend={{ value: "+12%", direction: "up" }}
        />
        <StatCard
          title="Active Roles"
          value="8"
          icon={Briefcase}
          trend={{ value: "0%", direction: "neutral" }}
        />
        <StatCard
          title="Total Interviews"
          value="1,204"
          icon={Video}
          trend={{ value: "+5.2%", direction: "up" }}
        />
        <StatCard
          title="Pending Interviews"
          value="12"
          icon={Clock}
          trend={{ value: "Action Required", direction: "down" }}
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
              <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all">
                Week
              </button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all">
                Month
              </button>
            </div>
          </div>

          <div className="h-64 w-full rounded-lg bg-white relative overflow-hidden">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="border-t border-dashed border-slate-200"
                />
              ))}
            </div>

            {/* Chart bars */}
            <div className="relative h-full flex items-end justify-between px-6 pb-0 pt-10 gap-3">
              {/* Using a mapped array to generate dummy chart bars cleanly */}
              {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
                <div
                  key={i}
                  style={{ height: `${height}%` }}
                  className="flex-1 bg-[#3B9EDB] rounded-t-md hover:bg-[#2d8bc9] transition-colors cursor-pointer relative group/bar focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  role="img"
                  aria-label={`${height} interviews`}
                  tabIndex={0}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    {height} interviews
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500 px-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
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
              className="text-sm font-medium text-primary hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded transition-all"
            >
              View all
            </a>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            {[
              {
                name: "John Doe",
                role: "Frontend Dev",
                status: "Pending" as const,
              },
              {
                name: "Alice Smith",
                role: "Product Manager",
                status: "Completed" as const,
              },
              {
                name: "Robert Fox",
                role: "UX Designer",
                status: "Completed" as const,
              },
              {
                name: "Emily Davis",
                role: "Data Analyst",
                status: "Reviewing" as const,
              },
            ].map((user, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                tabIndex={0}
                role="button"
                aria-label={`View interview details for ${user.name}, ${user.role}`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">
                      {user.name}
                    </span>
                    <span className="text-xs text-slate-500">{user.role}</span>
                  </div>
                </div>
                <StatusBadge status={user.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
}
