"use client";

import {
  X,
  User,
  Calendar,
  Mic,
  FileText,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export interface InterviewDetail {
  id: string;
  candidate: {
    name: string;
    email: string;
    phone: string;
    // Removed initials/avatar entirely
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

                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center bg-white border border-slate-100 rounded-xl p-4 shadow-sm w-28 h-28">
                    <span
                      className={`text-4xl font-bold ${interview.score >= 80 ? "text-emerald-600" : interview.score >= 60 ? "text-amber-500" : "text-rose-600"}`}
                    >
                      {interview.score}
                    </span>
                    <span className="text-xs text-slate-400 font-medium mt-1">
                      / 100
                    </span>
                  </div>

                  <div className="flex-1 text-sm text-slate-600 leading-relaxed bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                    <p>{interview.summary}</p>
                  </div>
                </div>

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

              {/* Audio Player Card */}
              <div className="p-4 bg-slate-900 rounded-xl shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Mic size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Audio Recording</p>
                    <p className="text-xs text-slate-400">
                      MP3 • AI Transcribed
                    </p>
                  </div>
                </div>

                {interview.audioUrl ? (
                  <audio controls className="w-full h-8 mt-1 accent-primary">
                    <source src={interview.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <div className="text-xs text-slate-500 italic mt-1 bg-white/5 p-2 rounded text-center">
                    Audio processing or unavailable
                  </div>
                )}
              </div>

              {/* CV Card */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-primary/30 transition-colors shadow-sm cursor-pointer group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-slate-900 truncate pr-2">
                      {interview.cvName || "Resume.pdf"}
                    </span>
                    <span className="text-xs text-slate-500">PDF Document</span>
                  </div>
                </div>
                <a
                  href={interview.cvUrl}
                  target="_blank"
                  className="p-2 text-slate-400 hover:text-primary transition-colors shrink-0"
                >
                  <Download size={18} />
                </a>
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
