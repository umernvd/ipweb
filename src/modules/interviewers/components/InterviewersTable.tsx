"use client";

import { useState } from "react";
import { AddInterviewerModal } from "./AddInterviewerModal";
import { useInterviewers } from "@/modules/interviews/hooks/useInterviewers";
import { SkeletonTable, ConfirmDialog } from "@/shared/components/ui";
import {
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
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

export const InterviewersTable = () => {
  // Pull data from the custom hook
  const {
    interviewers,
    isLoading,
    isMutating,
    createInterviewer,
    deleteInterviewer,
  } = useInterviewers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] =
    useState<InterviewerDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedAuthCode, setCopiedAuthCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  // Filter interviewers based on search query
  const filteredInterviewers = interviewers.filter((interviewer) => {
    const query = searchQuery.toLowerCase();
    return (
      interviewer.name.toLowerCase().includes(query) ||
      interviewer.email.toLowerCase().includes(query)
    );
  });

  const handleRowClick = (interviewer: any) => {
    const detailData: InterviewerDetail = {
      id: interviewer.id,
      name: interviewer.name,
      email: interviewer.email,
      phone: interviewer.phone || "—",
      status: interviewer.status,
      date: interviewer.date,
      initials: interviewer.initials,
      color: interviewer.color,
      image: interviewer.image,
    };
    setSelectedInterviewer(detailData);
    setIsDrawerOpen(true);
  };

  // Delete handler - opens confirmation dialog
  const handleDelete = (
    e: React.MouseEvent,
    id: string,
    name: string,
  ) => {
    e.stopPropagation();
    setConfirmDelete({ id, name });
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      await deleteInterviewer(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  // Copy auth code to clipboard
  const handleCopyAuthCode = async (e: React.MouseEvent, authCode: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(authCode);
      setCopiedAuthCode(authCode);
      setTimeout(() => setCopiedAuthCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy auth code:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Interviewers
          </h1>
          <p className="text-sm text-slate-700 mt-1">
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
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <SkeletonTable rows={5} columns={6} />
          ) : interviewers.length === 0 ? (
            <div className="text-center p-12 text-slate-700">
              No interviewers found. Click "Add Interviewer" to create one.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                {/* Human-designed modern header: light gray, crisp uppercase text */}
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider w-[25%]">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider w-[25%]">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider w-[15%]">
                    Auth Code
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider w-[15%]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider w-[10%]">
                    Added
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider w-[10%] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInterviewers.map((interviewer) => {
                  return (
                    <tr
                      key={interviewer.$id}
                      onClick={() =>
                        handleRowClick({
                          id: interviewer.$id,
                          name: interviewer.name,
                          email: interviewer.email,
                          status: interviewer.status,
                          date: new Date(
                            interviewer.$createdAt,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }),
                        })
                      }
                      className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-900">
                          {interviewer.name}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-700">
                        {interviewer.email}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <code className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded font-mono text-sm font-semibold">
                            {interviewer.authCode || "—"}
                          </code>
                          {interviewer.authCode && (
                            <button
                              onClick={(e) =>
                                handleCopyAuthCode(e, interviewer.authCode!)
                              }
                              className="p-1.5 text-slate-700 hover:text-primary hover:bg-blue-50 rounded-md transition-colors"
                              title="Copy auth code"
                            >
                              {copiedAuthCode === interviewer.authCode ? (
                                <Check size={16} className="text-emerald-600" />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            interviewer.status === "Active"
                              ? "bg-emerald-700 text-white"
                              : "bg-slate-700 text-white"
                          }`}
                        >
                          {interviewer.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-700">
                        {new Date(interviewer.$createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) =>
                              handleDelete(e, interviewer.$id, interviewer.name)
                            }
                            className="p-1.5 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                            title="Delete"
                            disabled={isMutating}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <AddInterviewerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={createInterviewer}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Remove Interviewer"
        description={`Are you sure you want to remove ${confirmDelete?.name}? They will no longer be able to conduct interviews.`}
        variant="danger"
        confirmText="Remove"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};
