"use client";

import { X, User, Calendar, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { DriveAssetCard } from "./DriveAssetCard";

export interface InterviewDetail {
  id: string;
  candidate: {
    name: string;
    email: string;
    phone: string;
  };
  role: string;
  level: string;
  interviewer: string;
  date: string;
  score: number;
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
          relative w-full max-w-4xl bg-white shadow-2xl flex flex-col 
          rounded-2xl overflow-hidden max-h-[90vh] 
          transform transition-all duration-300 ease-out
          ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}
        `}
      >
        {/* Header - CLEAN TEXT ONLY */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {interview.candidate.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500 font-medium">
                {interview.role}
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {interview.level}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
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
                <Calendar size={14} className="text-slate-400" />
                {interview.date}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Interviewer
              </span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <User size={14} className="text-slate-400" />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Col: Score & Summary */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  AI Assessment
                </h3>

                {!interview.summary ||
                interview.score === null ||
                interview.score === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Evaluating Session...
                      </p>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">
                        The AI is currently analyzing the interview transcript.
                        The final score and summary will appear here shortly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 w-32 h-32 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center">
                      <span
                        className={`text-4xl font-bold ${interview.score >= 70 ? "text-emerald-500" : interview.score >= 40 ? "text-amber-500" : "text-red-500"}`}
                      >
                        {interview.score}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                        Out of 100
                      </span>
                    </div>

                    <div className="flex-grow bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Executive Summary
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {interview.summary}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-3 mt-2">
                  {interview.skills.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-600 w-32 truncate">
                        {skill.name}
                      </span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-8 text-right">
                        {skill.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Assets (Audio/CV) */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Assets
              </h3>

              <div className="space-y-4">
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
                  link={interview.cvUrl}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm">
            <XCircle size={18} />
            Reject
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-hover shadow-md shadow-primary/20 transition-all">
            <CheckCircle size={18} />
            Move to Offer
          </button>
        </div>
      </div>
    </div>
  );
};
