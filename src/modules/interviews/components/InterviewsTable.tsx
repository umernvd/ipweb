"use client";

import { useState } from "react";
import {
  InterviewDetailDrawer,
  type InterviewDetail,
} from "./InterviewDetailDrawer";
import {
  Search,
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

// Mock Data
const mockInterviews = [
  {
    id: "1",
    candidate: { name: "Alex Johnson", email: "alex.j@gmail.com" },
    role: "Senior Frontend Dev",
    level: "Senior",
    interviewer: "Sarah Smith",
    score: 85,
    date: "Oct 24, 2023",
    status: "Completed",
  },
  {
    id: "2",
    candidate: { name: "Maria Garcia", email: "m.garcia@outlook.com" },
    role: "Product Manager",
    level: "L4",
    interviewer: "Mike Ross",
    score: 72,
    date: "Oct 23, 2023",
    status: "In Progress",
  },
  {
    id: "3",
    candidate: { name: "James Lee", email: "james.lee@tech.co" },
    role: "Backend Engineer",
    level: "Mid",
    interviewer: "Sarah Smith",
    score: 55,
    date: "Oct 22, 2023",
    status: "Pending",
  },
  {
    id: "4",
    candidate: { name: "Linda Kim", email: "linda.k@gmail.com" },
    role: "Data Scientist",
    level: "Senior",
    interviewer: "David Chen",
    score: 92,
    date: "Oct 21, 2023",
    status: "Completed",
  },
];

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
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{" "}
          Completed
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span> In
          Progress
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>{" "}
          Pending
        </span>
      );
    default:
      return <span className="text-sm text-slate-500">{status}</span>;
  }
};

export const InterviewsTable = () => {
  const [selectedInterview, setSelectedInterview] =
    useState<InterviewDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (interview: any) => {
    const detailData: InterviewDetail = {
      id: interview.id,
      candidate: {
        name: interview.candidate.name,
        email: interview.candidate.email,
        phone: "+1 (555) 000-0000",
      },
      role: interview.role,
      level: interview.level,
      interviewer: interview.interviewer,
      date: interview.date,
      score: interview.score || 0,
      summary:
        "Candidate demonstrated strong problem-solving skills but struggled slightly with system design concepts...",
      skills: [
        { name: "Technical Knowledge", score: 85 },
        { name: "Communication", score: 90 },
      ],
      cvName: "Resume.pdf",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    };

    setSelectedInterview(detailData);
    setIsDrawerOpen(true);
  };

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
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
            <Calendar size={16} /> Date Range
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium shadow-sm transition-all">
            <Plus size={18} /> Schedule
          </button>
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
              {mockInterviews.map((interview) => (
                <tr
                  key={interview.id}
                  onClick={() => handleRowClick(interview)}
                  className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  {/* CLEAN TEXT ROW - NO AVATAR */}
                  <td className="py-3.5 px-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 text-sm">
                        {interview.candidate.name}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        {interview.candidate.email}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-6 text-sm text-slate-700">
                    {interview.role}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {interview.level}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-sm text-slate-700">
                    {interview.interviewer}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    {getScoreBadge(interview.score)}
                  </td>
                  <td className="py-3.5 px-6 text-sm text-slate-500">
                    {interview.date}
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

        {/* Pagination */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">1</span> to{" "}
            <span className="font-medium text-slate-900">6</span> of{" "}
            <span className="font-medium text-slate-900">124</span> results
          </p>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              disabled
            >
              <ChevronLeft size={18} />
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-md bg-primary text-white text-sm font-medium">
              1
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
              2
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
              3
            </button>
            <span className="h-8 w-8 flex items-center justify-center text-slate-400 text-sm">
              ...
            </span>
            <button className="p-1.5 border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
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
