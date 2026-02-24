import {
  Building2,
  CheckCircle,
  Clock,
  Ban,
  Video,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/modules/dashboard/components/StatCard"; // Reusing your existing component!

export const metadata = {
  title: "Super Admin Dashboard | HireAI",
};

// Mock Data for Pending Companies
const pendingCompanies = [
  {
    id: 1,
    name: "TechNova Labs",
    email: "admin@technova.io",
    date: "2 mins ago",
  },
  {
    id: 2,
    name: "GreenLeaf Systems",
    email: "hr@greenleaf.com",
    date: "1 hour ago",
  },
  {
    id: 3,
    name: "Quantum Dynamics",
    email: "contact@quantum.ai",
    date: "3 hours ago",
  },
];

export default function SuperAdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Platform Overview
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor system health and company registrations.
        </p>
      </div>

      {/* 1. Stats Row (Section 7.1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Companies"
          value="142"
          icon={Building2}
          colorTheme="blue"
          trend={{ value: "+4", isPositive: true }}
        />
        <StatCard
          title="Active Companies"
          value="128"
          icon={CheckCircle}
          colorTheme="indigo"
        />
        <StatCard
          title="Pending Approvals"
          value="3"
          icon={Clock}
          colorTheme="orange"
        />
        <StatCard
          title="Total Interviews"
          value="8,492"
          icon={Video}
          colorTheme="purple"
          trend={{ value: "+12%", isPositive: true }}
        />
      </div>

      {/* 2. Pending Approvals Table (Section 7.2) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Clock size={18} className="text-amber-500" />
            Pending Approvals
          </h3>
          <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-md">
            3 Pending
          </span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-white text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-medium">Company Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Registered</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pendingCompanies.map((company) => (
              <tr
                key={company.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-3.5 font-medium text-slate-900">
                  {company.name}
                </td>
                <td className="px-6 py-3.5 text-slate-600">{company.email}</td>
                <td className="px-6 py-3.5 text-slate-500">{company.date}</td>
                <td className="px-6 py-3.5 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 rounded-lg text-xs font-medium transition-colors">
                      Reject
                    </button>
                    <button className="px-3 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-lg text-xs font-medium shadow-sm transition-colors">
                      Approve
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
