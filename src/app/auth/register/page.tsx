"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RegisterForm } from "@/modules/auth/components/RegisterForm";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  // PRO UX: If they are already logged in, kick them to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/company/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="bg-background-light min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      {/* Step Indicator */}
      <div className="w-full max-w-[560px] mb-8 mt-4">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full" />

          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-background-light">
              1
            </div>
            <span className="text-sm font-semibold text-primary">Register</span>
          </div>

          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm ring-4 ring-background-light">
              2
            </div>
            <span className="text-xs font-medium text-slate-500">
              Verify Email
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm ring-4 ring-background-light">
              3
            </div>
            <span className="text-xs font-medium text-slate-500">Approval</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <main className="w-full max-w-[560px] bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
        <header className="bg-primary px-8 py-6 text-center">
          <h1 className="text-white text-2xl font-bold tracking-tight">
            Register Your Company
          </h1>
          <p className="text-blue-100 text-sm mt-1 opacity-90">
            Start hiring smarter with our AI platform
          </p>
        </header>

        <div className="p-8 md:p-10">
          <RegisterForm />
        </div>
      </main>

      <footer className="mt-8 text-center pb-8">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary hover:text-primary-hover hover:underline ml-1 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </footer>
    </div>
  );
}
