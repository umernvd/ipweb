"use client";

import { X, User, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { DriveAssetCard } from "./DriveAssetCard";

export interface InterviewDetail {
  id: string;
  candidate: {
    name: string;
    email: string;
    phone: string;
    driveFolderId?: string | null;
  };
  role: string;
  level: string;
  interviewer: string;
  date: string;
  score: number | null;
  summary: string;
  skills: { name: string; score: number }[];
  audioUrl?: string;
  cvUrl?: string;
  cvName?: string;
}

interface InterviewDetailDrawerProps {
  interview: InterviewDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InterviewDetailDrawer = ({
  interview,
  isOpen,
  onClose,
}: InterviewDetailDrawerProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;
  if (!interview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      <div
        className={`
          relative w-full max-w-2xl bg-white shadow-2xl flex flex-col
          rounded-2xl overflow-hidden max-h-[90vh]
          transform transition-all duration-300 ease-out
          ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {interview.candidate.name}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm text-slate-500 font-medium">
                {interview.role}
              </span>
              {interview.level && interview.level !== "—" && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {interview.level}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors mt-0.5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Email
              </span>
              <span
                className="text-sm font-medium text-slate-700 truncate"
                title={interview.candidate.email}
              >
                {interview.candidate.email}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Date
              </span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Calendar size={13} className="text-slate-400" />
                {interview.date}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Interviewer
              </span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <User size={13} className="text-slate-400" />
                {interview.interviewer}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Phone
              </span>
              <span className="text-sm font-medium text-slate-700">
                {interview.candidate.phone}
              </span>
            </div>
          </div>

          {/* Assets */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-primary rounded-full" />
              Assets
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DriveAssetCard
                label="Session Recording"
                subLabel="Listen in Google Drive"
                type="audio"
                link={interview.audioUrl}
              />
              <DriveAssetCard
                label="Candidate Assets"
                subLabel="View CV & Notes in Drive"
                type="folder"
                link={interview.candidate?.driveFolderId || interview.cvUrl}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <p className="text-xs text-slate-400 text-center">
            Interview recorded on {interview.date} · {interview.interviewer}
          </p>
        </div>
      </div>
    </div>
  );
};
