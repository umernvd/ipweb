"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DI } from "@/core/di/container"; // ✅ Import the Dependency Injection container
import {
  Loader2,
  AlertCircle,
  Building2,
  Mail,
  Lock,
  CheckCircle2,
} from "lucide-react";

export const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 1. Extract Data
    const formData = new FormData(e.currentTarget);
    const companyName = formData.get("companyName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // 2. Client-Side Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // 3. The "Engine": Call Appwrite Service
      // This creates User + Session + Company Document
      await DI.authService.register(email, password, companyName);

      // 4. Success Redirect
      // The AuthGuard will eventually catch them, but we send them to dashboard
      router.push("/company/dashboard");
    } catch (err: any) {
      console.error(err);
      // Nice error handling for common Appwrite errors
      if (err.code === 409) {
        setError("An account with this email already exists.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Input: Company Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Building2 size={16} className="text-slate-700" />
          Company Name
        </label>
        <input
          name="companyName"
          required
          placeholder="e.g. Acme Innovations"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Input: Work Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Mail size={16} className="text-slate-700" />
          Work Email
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="hr@company.com"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Inputs: Password Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Lock size={16} className="text-slate-700" />
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Confirm Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Creating Account...
          </>
        ) : (
          <>
            Create Account
            
          </>
        )}
      </button>

      {/* Terms fine print */}
      <p className="text-xs text-center text-slate-800 mt-4">
        By registering, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
};
