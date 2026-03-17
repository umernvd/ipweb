"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import {
  updateEmailSchema,
  type UpdateEmailValues,
} from "@/core/validators/settings.validator";
import { DI } from "@/core/di/container";

export const UpdateEmailForm = () => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateEmailValues>({
    resolver: zodResolver(updateEmailSchema),
  });

  const onSubmit = async (data: UpdateEmailValues) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await DI.authService.updateEmail(data.newEmail, data.currentPassword);
      setSuccessMsg("Email address updated successfully.");
      reset();
    } catch (err: any) {
      const msg = err?.message || "Failed to update email.";
      if (msg.toLowerCase().includes("invalid credentials")) {
        setErrorMsg("Current password is incorrect.");
      } else if (
        msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("conflict")
      ) {
        setErrorMsg("This email address is already in use.");
      } else {
        setErrorMsg(msg);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-900">
          Update Email Address
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Change the email address associated with your admin account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 flex flex-col gap-5"
      >
        <div className="space-y-1.5 max-w-md">
          <label className="text-sm font-medium text-slate-700">
            New Email Address
          </label>
          <input
            {...register("newEmail")}
            type="email"
            placeholder="admin@company.com"
            className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
          {errors.newEmail && (
            <p className="text-xs text-red-500">{errors.newEmail.message}</p>
          )}
        </div>

        <div className="space-y-1.5 max-w-md">
          <label className="text-sm font-medium text-slate-700">
            Current Password
          </label>
          <input
            {...register("currentPassword")}
            type="password"
            placeholder="Verify with your password"
            className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
          <p className="text-[13px] text-slate-500 mt-1">
            We need your password to verify this change.
          </p>
          {errors.currentPassword && (
            <p className="text-xs text-red-500">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
          >
            {isSubmitting ? "Updating..." : "Update Email"}
          </button>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 max-w-md">
            <CheckCircle size={16} className="shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-md">
            {errorMsg}
          </div>
        )}
      </form>
    </div>
  );
};
