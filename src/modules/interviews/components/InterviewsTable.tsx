"use client";

import { useState, useEffect } from "react";
import { useInterviews } from "../hooks/useInterviews";
import {
  InterviewDetailDrawer,
  type InterviewDetail,
} from "./InterviewDetailDrawer";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

const getScoreBadge = (score: number | null) => {
  if (score === null)
    return <span className="text-slate-400 font-medium">-</span>;
  if (score >= 80)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        {score}
      </span>
    );
  if (score >= 60)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        {score}
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      {score}
    </span>
  );
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Completed
        </span>
      );
    case "started":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span> In
          Progress
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          Pending
        </span>
      );
    default:
      return <span className="text-sm text-slate-500">{status}</span>;
  }
};

export const InterviewsTable = () => {
  const {
    interviews,
    total,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    itemsPerPage,
  } = useInterviews();

  const [selectedInterview, setSelectedInterview] =
    useState<InterviewDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [localSearchInput, setLocalSearchInput] = useState("");

  // Debounced search: Update searchQuery after 500ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchInput);
      setCurrentPage(1); // Reset to page 1 when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchInput, setSearchQuery, setCurrentPage]);

  // Calculate pagination values
  const totalPages = Math.ceil(total / itemsPerPage);
  const startItem = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
        <h3 className="text-lg font-semibold text-slate-900">
          No Interviews Found
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {searchQuery
            ? "No interviews match your search."
            : "Start an interview on the mobile app to see it here."}
        </p>
      </div>
    );
  }

  const handleRowClick = (interview: any) => {
    const detailData: InterviewDetail = {
      id: interview.$id,
      candidate: {
        name: interview.candidate?.name || "Candidate",
        email: interview.candidate?.email || "candidate@example.com",
        phone: interview.candidate?.phone || "+1 (555) 000-0000",
      },
      role: interview.role?.title || "Role",
      level: interview.role?.level || "Level",
      interviewer: interview.interviewer?.name || "Unknown",
      date: new Date(interview.startedAt || Date.now()).toLocaleDateString(),
      score: interview.score || 0,
      summary: interview.aiSummary || "No summary available",
      skills: [
        { name: "Technical Knowledge", score: interview.score || 0 },
        { name: "Communication", score: interview.score || 0 },
      ],
      cvName: "Resume.pdf",
      audioUrl: interview.driveFileUrl || "",
      cvUrl: interview.driveFolderId || "",
    };

    setSelectedInterview(detailData);
    setIsDrawerOpen(true);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Debug: Log the first interview's data to inspect hydration
  if (interviews.length > 0) {
    console.log(
      "🚨 UI DATA CHECK - First Interview:",
      JSON.stringify(interviews[0], null, 2),
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Interviews
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage and track candidate interviews across all active roles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search candidates..."
              value={localSearchInput}
              onChange={(e) => setLocalSearchInput(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[280px]">
                  Candidate
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Interviewer
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  AI Score
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interviews.map((interview) => (
                <tr
                  key={interview.$id}
                  onClick={() => handleRowClick(interview)}
                  className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-6">
                    <span className="font-medium text-slate-900 text-sm">
                      {interview.candidate?.name || "Unknown Candidate"}
                    </span>
                  </td>

                  <td className="py-3.5 px-6 text-sm text-slate-700">
                    {interview.role?.title || "Unspecified Role"}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {interview.role?.level || "N/A"}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-sm text-slate-700">
                    {interview.interviewer?.name || "Unknown"}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    {getScoreBadge(interview.score)}
                  </td>
                  <td className="py-3.5 px-6 text-sm text-slate-500">
                    {interview.startedAt
                      ? new Date(interview.startedAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-3.5 px-6">
                    {getStatusBadge(interview.status)}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all">
                      <ArrowRight size={18} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-900">{startItem}</span> to{" "}
            <span className="font-medium text-slate-900">{endItem}</span> of{" "}
            <span className="font-medium text-slate-900">{total}</span> results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            {getPageNumbers().map((page, index) =>
              typeof page === "number" ? (
                <button
                  key={index}
                  onClick={() => handlePageClick(page)}
                  className={`h-8 w-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span
                  key={index}
                  className="h-8 w-8 flex items-center justify-center text-slate-400 text-sm"
                >
                  {page}
                </span>
              ),
            )}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <InterviewDetailDrawer
        interview={selectedInterview}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
