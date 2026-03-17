"use client";

import { useCandidates } from "@/modules/candidates/hooks/useCandidates";
import { useInterviewers } from "@/modules/interviews/hooks/useInterviewers";
import { Users, FileText } from "lucide-react";

export default function CandidatesPage() {
  const { candidates, isLoading } = useCandidates();
  const { interviewers } = useInterviewers();

  // Helper function to get interviewer name by ID
  const getInterviewerName = (interviewerId: string): string => {
    const interviewer = interviewers.find((i) => i.$id === interviewerId);
    return interviewer?.name || "Unknown";
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
        <p className="text-sm text-slate-500">
          View candidates generated from the mobile app.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No candidates found. Candidates will appear here when generated
              from the mobile app.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Interviewer
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    CV
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((candidate) => {
                  return (
                    <tr key={candidate.$id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">
                          {candidate.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <span className="text-slate-900">
                            {getInterviewerName(candidate.interviewerId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {candidate.cvFileUrl ? (
                          <a
                            href={candidate.cvFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
                          >
                            <FileText size={14} />
                            View CV
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
