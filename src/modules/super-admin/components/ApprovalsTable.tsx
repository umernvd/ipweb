"use client";

import { useEffect, useState } from "react";
import { useCompanyStore } from "@/stores/companyStore";
import { useAuthStore } from "@/stores/authStore";
import { DI } from "@/core/di/container";
import {
  approveCompanyAdmin,
  rejectCompanyAdmin,
} from "@/app/actions/adminActions";
import { Skeleton } from "@/shared/components/ui";
import {
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  Loader2,
} from "lucide-react";

export const ApprovalsTable = () => {
  const { pendingCompanies, fetchPendingCompanies, isLoading } =
    useCompanyStore();
  const { isAdmin } = useAuthStore();
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingCompanies();
  }, [fetchPendingCompanies]);

  const handleDecision = async (id: string, decision: "approve" | "reject") => {
    setProcessingId(id);
    try {
      if (isAdmin) {
        // Super Admin: Generate JWT and use Server Actions
        const { jwt } = await DI.authService.createJWT();

        if (decision === "approve") {
          await approveCompanyAdmin(jwt, id);
        } else {
          await rejectCompanyAdmin(jwt, id);
        }
      } else {
        // Regular user: Use DI service (fallback)
        if (decision === "approve") {
          await DI.companyService.approveCompany(id);
        } else {
          await DI.companyService.rejectCompany(id);
        }
      }

      // Refetch to update the list
      await fetchPendingCompanies();
    } catch (error) {
      console.error("Decision failed", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading && pendingCompanies.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">
                Company Details
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700">
                Registered On
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">
                Decision
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-16 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <p className="text-slate-800 text-sm mt-1">
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
              <th className="px-6 py-4 font-semibold text-slate-700">
                Company Details
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700">
                Registered On
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">
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
                      <div className="text-xs text-slate-700">
                        {company.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">
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
