"use client";

import { useEffect } from "react";
import { useCompanyStore } from "@/stores/companyStore";
import {
  MoreHorizontal,
  Ban,
  PauseCircle,
  Trash2,
  Eye,
  CheckCircle,
} from "lucide-react";
import { CompanyStatus } from "@/core/entities/company";

const getStatusBadge = (status: CompanyStatus) => {
  const styles = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    paused: "bg-orange-100 text-orange-700 border-orange-200",
    banned: "bg-red-100 text-red-700 border-red-200",
    rejected: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status] || styles.pending}`}
    >
      {status}
    </span>
  );
};

export const CompaniesTable = () => {
  const { allCompanies, fetchAllCompanies, updateCompanyStatus, isLoading } =
    useCompanyStore();

  useEffect(() => {
    fetchAllCompanies();
  }, []);

  if (isLoading && allCompanies.length === 0) {
    return (
      <div className="p-12 text-center text-slate-800">
        Loading companies...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 font-semibold text-slate-700">
              Company Name
            </th>
            <th className="px-6 py-3 font-semibold text-slate-700">Email</th>
            <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
            <th className="px-6 py-3 font-semibold text-slate-700">
              Interviews
            </th>
            <th className="px-6 py-3 font-semibold text-slate-700 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {allCompanies.map((company) => (
            <tr
              key={company.$id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-6 py-3.5 font-medium text-slate-900">
                {company.name}
              </td>
              <td className="px-6 py-3.5 text-slate-600">{company.email}</td>
              <td className="px-6 py-3.5">{getStatusBadge(company.status)}</td>
              <td className="px-6 py-3.5 text-slate-600">
                {company.total_interviews}
              </td>
              <td className="px-6 py-3.5 text-right">
                <div className="flex justify-end gap-2">
                  {/* Action Buttons */}
                  {company.status === "active" && (
                    <button
                      title="Pause Access"
                      onClick={() => updateCompanyStatus(company.$id, "paused")}
                      className="p-1.5 text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                    >
                      <PauseCircle size={16} />
                    </button>
                  )}

                  {company.status === "paused" && (
                    <button
                      title="Resume Access"
                      onClick={() => updateCompanyStatus(company.$id, "active")}
                      className="p-1.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}

                  <button
                    title="Ban Company"
                    onClick={() => updateCompanyStatus(company.$id, "banned")}
                    className="p-1.5 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Ban size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {allCompanies.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-700">
                No companies found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
