"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, User, Mail, ChevronDown, Check } from "lucide-react";
import {
  interviewerSchema,
  type InterviewerFormValues,
} from "@/core/validators/interviewer.validator";

interface AddInterviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddInterviewerModal = ({
  isOpen,
  onClose,
}: AddInterviewerModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InterviewerFormValues>({
    resolver: zodResolver(interviewerSchema),
    defaultValues: {
      status: "active",
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    reset(); // Clear form when closing
    onClose();
  };

  const onSubmit = async (data: InterviewerFormValues) => {
    console.log("Saving Interviewer:", data);
    // TODO: Add Appwrite API call here

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    handleClose();
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
