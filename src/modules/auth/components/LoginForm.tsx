"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export const LoginForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuthStore();
  const authError = useAuthStore((s) => s.authError);
  const clearAuthError = useAuthStore((s) => s.clearAuthError);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    clearAuthError();

    try {
      await login(email, password);

      // Check who just logged in
      const { isAdmin, authError: storeError } = useAuthStore.getState();

      // If authStore set an error (pending/rejected), don't redirect
      if (storeError) return;

      if (isAdmin) {
        router.push("/super-admin/dashboard");
      } else {
        router.push("/company/dashboard");
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-5">
      {/* Error Message */}
      {(error || authError) && (
        <div className="p-3 bg-red-700 text-white rounded-lg text-sm">
          {error || authError}
        </div>
      )}

      {/* Email Input */}
      <div className="flex flex-col gap-1.5">
        <label
          className="text-slate-700 text-sm font-medium leading-none"
          htmlFor="email"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex w-full h-12 rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Password Input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label
            className="text-slate-700 text-sm font-medium leading-none"
            htmlFor="password"
          >
            Password
          </label>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="flex w-full h-12 rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-hover h-12 px-4 py-2 w-full shadow-sm hover:shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
};
