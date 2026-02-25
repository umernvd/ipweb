"use client";

import { useEffect, useState } from "react";
import { DI } from "@/core/di/container";
import { Candidate } from "@/core/entities/candidate";
import { Plus, User, Mail, Calendar } from "lucide-react";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const COMPANY_ID = "demo-company-id";

  useEffect(() => {
    const load = async () => {
      try {
        const data = await DI.candidateService.getCandidates(COMPANY_ID);
        setCandidates(data);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="text-sm text-slate-500">
            Manage applicants and track their status.
          </p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary-hover">
          <Plus size={16} /> Add Candidate
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Candidate</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Applied Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map((c) => (
              <tr key={c.$id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail size={10} /> {c.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs capitalize ${
                      c.status === "hired"
                        ? "bg-green-100 text-green-700"
                        : c.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />{" "}
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary hover:underline text-xs font-medium">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {candidates.length === 0 && !isLoading && (
          <div className="p-12 text-center text-slate-500">
            No candidates found.
          </div>
        )}
      </div>
    </div>
  );
}
