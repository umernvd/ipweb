"use client";

import { useEffect, useState } from "react";
import { DI } from "@/core/di/container";
import { Company } from "@/core/entities/company";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  Calendar,
} from "lucide-react";

export const ApprovalsTable = () => {
  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await DI.companyService.getPendingApprovals();
      setPendingCompanies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (id: string, decision: "approve" | "reject") => {
    setProcessingId(id);
    try {
      if (decision === "approve") {
        await DI.companyService.approveCompany(id);
      } else {
        await DI.companyService.rejectCompany(id);
      }
      // Remove from UI immediately (Optimistic-ish update)
      setPendingCompanies((prev) => prev.filter((c) => c.$id !== id));
    } catch (error) {
      console.error("Decision failed", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (pendingCompanies.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={24} />
        </div>
        <h3 className="text-slate-900 font-medium">All Caught Up!</h3>
        <p className="text-slate-500 text-sm mt-1">
          There are no pending company approvals.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-500">
                Company Details
              </th>
              <th className="px-6 py-4 font-semibold text-slate-500">
                Registered On
              </th>
              <th className="px-6 py-4 font-semibold text-slate-500 text-right">
                Decision
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pendingCompanies.map((company) => (
              <tr
                key={company.$id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {company.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {company.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(company.$createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleDecision(company.$id, "reject")}
                      disabled={!!processingId}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {processingId === company.$id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <XCircle size={14} />
                      )}
                      Reject
                    </button>
                    <button
                      onClick={() => handleDecision(company.$id, "approve")}
                      disabled={!!processingId}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
                    >
                      {processingId === company.$id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      Approve Access
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
};
