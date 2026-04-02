"use client";

import {
  Building2,
  CheckCircle,
  Clock,
  Ban,
  Video,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/modules/dashboard/components/StatCard";
import { useSuperAdminDashboard } from "@/modules/super-admin/hooks/useSuperAdminDashboard";
import { useAuthStore } from "@/stores/authStore";

export default function SuperAdminDashboard() {
  const {
    stats,
    pendingList,
    isLoading,
    approveCompany,
    rejectCompany,
    isMutating,
  } = useSuperAdminDashboard();
  const { user } = useAuthStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Platform Overview</h2>
        <p className="text-sm text-slate-700 mt-1">
          Monitor system health and company registrations.
        </p>
      </div>

      {/* STATS CARDS - Now a responsive grid! */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-700">
              Total Companies
            </p>
            <Building2 size={20} className="text-slate-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">
              {stats?.totalCompanies || 0}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-700">
              Active Companies
            </p>
            <CheckCircle2 size={20} className="text-slate-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">
              {stats?.activeCompanies || 0}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-700">
              Pending Approvals
            </p>
            <Clock size={20} className="text-slate-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">
              {stats?.pendingApprovals || 0}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-700">
              Total Interviews
            </p>
            <Video size={20} className="text-slate-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">
              {stats?.totalInterviews || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* PENDING APPROVALS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-amber-500" />
            <h3 className="font-semibold text-slate-900">Pending Approvals</h3>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {pendingList.length} Pending
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white border-b border-slate-100 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium">Company Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Registered</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingList.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-700"
                  >
                    No pending approvals at this time.
                  </td>
                </tr>
              ) : (
                pendingList.map((company) => (
                  <tr
                    key={company.$id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {company.name}
                    </td>
                    <td className="px-6 py-4">{company.email}</td>
                    <td className="px-6 py-4">
                      {new Date(company.$createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-3">
                      <button
                        onClick={() => rejectCompany(company.$id)}
                        disabled={isMutating}
                        className="px-4 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => approveCompany(company.$id)}
                        disabled={isMutating}
                        className="px-4 py-1.5 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-all shadow-sm"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
