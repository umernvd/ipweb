"use client";

import { useEffect } from "react";
import { useCompanyStore } from "@/stores/companyStore";
import { Check, X, Clock } from "lucide-react";

export const PendingApprovalsTable = () => {
  const { pendingCompanies, fetchStats, updateCompanyStatus, isLoading } =
    useCompanyStore();

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-50 border-t border-slate-100">
        Loading approvals...
      </div>
    );
  }

  if (pendingCompanies.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-3 bg-slate-50/50 border-t border-slate-100">
        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <Clock size={20} />
        </div>
        <div>
          <p className="text-slate-900 font-medium text-sm">All caught up!</p>
          <p className="text-slate-500 text-xs">
            No pending company registrations found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
        <tr>
          <th className="px-6 py-3 font-semibold">Company Name</th>
          <th className="px-6 py-3 font-semibold">Email</th>
          <th className="px-6 py-3 font-semibold">Registered On</th>
          <th className="px-6 py-3 font-semibold text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {pendingCompanies.map((company) => (
          <tr
            key={company.$id}
            className="hover:bg-slate-50/80 transition-colors"
          >
            <td className="px-6 py-3.5 font-medium text-slate-900">
              {company.name}
            </td>
            <td className="px-6 py-3.5 text-slate-600">{company.email}</td>
            <td className="px-6 py-3.5 text-slate-500">
              {new Date(company.$createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-3.5 text-right">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => updateCompanyStatus(company.$id, "rejected")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors"
                >
                  <X size={14} /> Reject
                </button>
                <button
                  onClick={() => updateCompanyStatus(company.$id, "active")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
                >
                  <Check size={14} /> Approve
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
