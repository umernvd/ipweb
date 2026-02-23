"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const LoginForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="flex flex-col gap-5">
      {/* Email Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-700 text-sm font-medium leading-none" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="flex w-full h-12 rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Password Input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-slate-700 text-sm font-medium leading-none" htmlFor="password">
            Password
          </label>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="flex w-full h-12 rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="flex justify-end mt-1">
          <Link href="#" className="text-sm font-medium text-primary hover:text-primary-light hover:underline transition-colors">
            Forgot Password?
          </Link>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={() => router.push("/company/dashboard")}
        className="mt-2 inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-hover h-12 px-4 py-2 w-full shadow-sm hover:shadow-md transition-colors"
      >
        Sign In
      </button>
    </form>
  );
};