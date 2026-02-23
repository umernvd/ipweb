"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Phone, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { registerSchema, type RegisterFormValues } from "@/core/validators/auth.validator";

export const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const passwordValue = watch("password", "");

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
  const strengthColors = ["bg-slate-200", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-green-500"];

  const onSubmit = async (data: RegisterFormValues) => {
    // Appwrite registration logic will be injected here
    console.log("Form submitted:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
          Company Name
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Building2 size={20} />
          </span>
          <input
            {...register("companyName")}
            id="companyName"
            type="text"
            placeholder="e.g. Acme Corp"
            className="block w-full rounded-lg border-slate-300 pl-10 py-3 text-sm focus:border-primary focus:ring-primary shadow-sm transition-colors"
          />
        </div>
        {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Work Email Address
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Mail size={20} />
          </span>
          <input
            {...register("email")}
            id="email"
            type="email"
            placeholder="name@company.com"
            className="block w-full rounded-lg border-slate-300 pl-10 py-3 text-sm focus:border-primary focus:ring-primary shadow-sm transition-colors"
          />
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
          Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Phone size={20} />
          </span>
          <input
            {...register("phone")}
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="block w-full rounded-lg border-slate-300 pl-10 py-3 text-sm focus:border-primary focus:ring-primary shadow-sm transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock size={20} />
            </span>
            <input
              {...register("password")}
              id="password"
              type="password"
              placeholder="••••••••"
              className="block w-full rounded-lg border-slate-300 pl-10 py-3 text-sm focus:border-primary focus:ring-primary shadow-sm transition-colors"
            />
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <ShieldCheck size={20} />
            </span>
            <input
              {...register("confirmPassword")}
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="block w-full rounded-lg border-slate-300 pl-10 py-3 text-sm focus:border-primary focus:ring-primary shadow-sm transition-colors"
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-500">Password strength</span>
          <span className={`text-xs font-medium ${strength > 2 ? 'text-green-600' : 'text-amber-500'}`}>
            {passwordValue ? strengthLabels[strength] : ""}
          </span>
        </div>
        <div className="flex gap-1 h-1.5 w-full">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-full w-1/4 rounded-full transition-colors duration-300 ${
                strength >= level ? strengthColors[strength] : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1.5">Use at least 8 characters with a mix of letters, numbers & symbols.</p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-white py-3.5 px-4 text-sm font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span>{isSubmitting ? "Creating..." : "Create Account"}</span>
          <ArrowRight size={18} />
        </button>
      </div>

      <p className="text-xs text-center text-slate-500 px-4">
        By registering, you agree to our <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>
    </form>
  );
};