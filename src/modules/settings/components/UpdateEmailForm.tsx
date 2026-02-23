"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateEmailSchema,
  type UpdateEmailValues,
} from "@/core/validators/settings.validator";

export const UpdateEmailForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateEmailValues>({
    resolver: zodResolver(updateEmailSchema),
  });

  const onSubmit = async (data: UpdateEmailValues) => {
    console.log("Email update requested:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
            {isSubmitting ? "Sending Verification..." : "Update Email"}
          </button>
        </div>
      </form>
    </div>
  );
};
