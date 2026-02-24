"use client";

import { useState } from "react";
import { AddInterviewerModal } from "./AddInterviewerModal";
import {
  Search,
  Filter,
  Download,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Define the shape of interviewer detail data
export interface InterviewerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  date: string;
  initials?: string;
  color?: string;
  image?: string;
}

// Dummy data to map over (will be replaced by Appwrite data later)
const mockInterviewers = [
  {
    id: "1",
    name: "Sarah Jenkins",
    email: "sarah.j@company.com",
    status: "Active",
    date: "Oct 24, 2023",
    initials: "SJ",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@company.com",
    status: "Active",
    date: "Oct 22, 2023",
    image: "https://i.pravatar.cc/150?u=michael",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "e.rodriguez@company.com",
    status: "Inactive",
    date: "Sep 15, 2023",
    initials: "ER",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.k@company.com",
    status: "Active",
    date: "Sep 10, 2023",
    image: "https://i.pravatar.cc/150?u=david",
  },
];

export const InterviewersTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] =
    useState<InterviewerDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Mock function to transform table row data into detailed drawer data
  // In the real app, this would fetch from Appwrite based on ID
  const handleRowClick = (interviewer: any) => {
    const detailData: InterviewerDetail = {
      id: interviewer.id,
      name: interviewer.name,
      email: interviewer.email,
      phone: "+1 (555) 000-0000",
      status: interviewer.status,
      date: interviewer.date,
      initials: interviewer.initials,
      color: interviewer.color,
      image: interviewer.image,
    };
    setSelectedInterviewer(detailData);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Interviewers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your organization's interviewers and their permissions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm font-medium"
        >
          <Plus size={18} />
          Add Interviewer
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center bg-white">
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="inline-flex items-center gap-2 px-3 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium w-full sm:w-auto justify-center">
              <Filter size={16} /> Filter
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium w-full sm:w-auto justify-center">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Human-designed modern header: light gray, crisp uppercase text */}
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[30%]">
                  Name
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[30%]">
                  Email
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[15%]">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[15%]">
                  Added
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[10%] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockInterviewers.map((interviewer) => (
                <tr
                  key={interviewer.id}
                  onClick={() => handleRowClick(interviewer)}
                  className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {interviewer.image ? (
                        <img
                          src={interviewer.image}
                          alt={interviewer.name}
                          className="size-8 rounded-full border border-slate-200 object-cover"
                        />
                      ) : (
                        <div
                          className={`size-8 rounded-full flex items-center justify-center font-semibold text-xs border border-white shadow-sm ${interviewer.color}`}
                        >
                          {interviewer.initials}
                        </div>
                      )}
                      <span className="font-medium text-slate-900">
                        {interviewer.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {interviewer.email}
                  </td>
                  <td className="px-6 py-3.5">
                    {/* Modern solid/subtle badges */}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                        interviewer.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {interviewer.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {interviewer.date}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modern Pagination */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">1</span> to{" "}
            <span className="font-medium text-slate-900">10</span> of{" "}
            <span className="font-medium text-slate-900">34</span> results
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              disabled
            >
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 min-w-[32px] rounded-lg bg-primary text-white text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1 min-w-[32px] rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors">
              2
            </button>
            <button className="px-3 py-1 min-w-[32px] rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors">
              3
            </button>
            <span className="text-slate-400 px-1">...</span>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <AddInterviewerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
