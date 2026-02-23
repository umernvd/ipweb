"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/core/validators/settings.validator";

export const ChangePasswordForm = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const passwordValue = watch("newPassword", "");

  // Password strength calculator
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(passwordValue);
  const strengthLabels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-slate-200",
    "bg-red-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500",
  ];

  const onSubmit = async (data: ChangePasswordValues) => {
    console.log("Password change requested:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* De-AI'd Header: Clean layout with bottom border separator */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-900">
          Change Password
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Ensure your account is secure with a strong password.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 flex flex-col gap-5"
      >
        <div className="space-y-1.5 max-w-md">
          <label className="text-sm font-medium text-slate-700">
            Current Password
          </label>
          <div className="relative">
            <input
              {...register("currentPassword")}
              type={showCurrent ? "text" : "password"}
              className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-red-500">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 max-w-md">
          <label className="text-sm font-medium text-slate-700">
            New Password
          </label>
          <div className="relative">
            <input
              {...register("newPassword")}
              type={showNew ? "text" : "password"}
              className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Strength Indicator */}
          <div className="flex gap-1 mt-2 h-1.5">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`flex-1 rounded-full transition-colors duration-300 ${strength >= level ? strengthColors[strength] : "bg-slate-100"}`}
              />
            ))}
          </div>
          {passwordValue && (
            <p className="text-xs text-slate-500 mt-1.5">
              Strength:{" "}
              <span className="font-medium text-slate-700">
                {strengthLabels[strength]}
              </span>
            </p>
          )}
          {errors.newPassword && (
            <p className="text-xs text-red-500">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5 max-w-md">
          <label className="text-sm font-medium text-slate-700">
            Confirm New Password
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};
