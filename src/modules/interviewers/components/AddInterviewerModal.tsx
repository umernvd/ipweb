"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, User, Mail, ChevronDown, Check, Loader2 } from "lucide-react";
import {
  interviewerSchema,
  type InterviewerFormValues,
} from "@/core/validators/interviewer.validator";

interface AddInterviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    email: string,
    status: string,
  ) => Promise<boolean | undefined>;
}

export const AddInterviewerModal = ({
  isOpen,
  onClose,
  onSave,
}: AddInterviewerModalProps) => {
  // Strict loading state to prevent double-submits
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InterviewerFormValues>({
    resolver: zodResolver(interviewerSchema),
    defaultValues: {
      status: "Active",
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    reset(); // Clear form when closing
    onClose();
  };

  const onSubmit = async (data: InterviewerFormValues) => {
    // Set loading state at the very beginning to prevent double-submits
    setIsSubmitting(true);

    try {
      const success = await onSave(data.fullName, data.email, data.status);
      if (success) {
        handleClose();
      }
    } finally {
      // Always reset loading state, even if there's an error
      setIsSubmitting(false);
    }
  };

  return (
    // Backdrop with Blur Effect (z-50 ensures it covers the header)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      onClick={handleClose}
    >
      {/* Modal Container (stop propagation prevents closing when clicking inside the white box) */}
      <div
        className="relative w-full max-w-[540px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary text-white">
          <h2 className="text-lg font-bold tracking-wide">
            Add New Interviewer
          </h2>
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
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-slate-700"
            >
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={18} />
              </span>
              <input
                {...register("fullName")}
                id="fullName"
                type="text"
                placeholder="e.g. Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName.message}</p>
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={18} />
              </span>
              <input
                {...register("email")}
                id="email"
                type="email"
                placeholder="e.g. jane@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="status"
              className="text-sm font-medium text-slate-700"
            >
              Status
            </label>
            <div className="relative">
              <select
                {...register("status")}
                id="status"
                className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer transition-all"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown size={18} />
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-3 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center gap-2 min-w-[160px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Save Interviewer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
