"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, User, Mail, Phone, Users, Check } from "lucide-react";
import { useInterviewers } from "@/modules/interviews/hooks/useInterviewers";
import { Candidate } from "@/core/entities/candidate";

const candidateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  interviewerId: z.string().min(1, "Interviewer is required"),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<Candidate, "$id" | "createdAt" | "updatedAt" | "companyId">,
  ) => Promise<boolean>;
}

export const AddCandidateModal = ({
  isOpen,
  onClose,
  onSave,
}: AddCandidateModalProps) => {
  const { interviewers, isLoading: isLoadingInterviewers } = useInterviewers();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
  });

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CandidateFormValues) => {
    const success = await onSave({
      name: data.name,
      email: data.email,
      phone: data.phone,
      interviewerId: data.interviewerId,
      cvFileUrl: undefined,
      cvFileId: undefined,
      driveFolderId: undefined,
    });
    if (success) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-[540px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary text-white">
          <h2 className="text-lg font-bold tracking-wide">Add New Candidate</h2>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body / Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col p-6 gap-5"
        >
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-sm font-medium text-slate-700"
            >
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700">
                <User size={18} />
              </span>
              <input
                {...register("name")}
                id="name"
                type="text"
                placeholder="e.g. John Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700">
                <Mail size={18} />
              </span>
              <input
                {...register("email")}
                id="email"
                type="email"
                placeholder="e.g. john@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-slate-700"
            >
              Phone (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700">
                <Phone size={18} />
              </span>
              <input
                {...register("phone")}
                id="phone"
                type="tel"
                placeholder="e.g. +1 (555) 123-4567"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Interviewer */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="interviewerId"
              className="text-sm font-medium text-slate-700"
            >
              Assigned Interviewer
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none">
                <Users size={18} />
              </span>
              <select
                {...register("interviewerId")}
                id="interviewerId"
                disabled={isLoadingInterviewers}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer transition-all disabled:opacity-50"
              >
                <option value="">
                  {isLoadingInterviewers
                    ? "Loading interviewers..."
                    : "Select an interviewer"}
                </option>
                {interviewers.map((interviewer) => (
                  <option key={interviewer.$id} value={interviewer.$id}>
                    {interviewer.name}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none">
                ▼
              </span>
            </div>
            {errors.interviewerId && (
              <p className="text-xs text-red-500">
                {errors.interviewerId.message}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-3 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary-hover disabled:opacity-70 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Check size={16} />
                  Save Candidate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
