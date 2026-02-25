"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  // PRO UX: If they are already logged in, kick them to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/company/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    // 1. Changed min-h-screen to h-screen and added overflow-hidden to lock the page
    <div className="h-screen w-full flex flex-col md:flex-row font-sans overflow-hidden bg-background-light">
      {/* Left Column: Brand Panel */}
      {/* 2. Set height to h-full instead of min-h-screen */}
      <div className="relative w-full md:w-5/12 lg:w-1/2 bg-primary flex flex-col items-center justify-center p-12 overflow-hidden h-[30vh] md:h-full shrink-0">
        {/* Abstract Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.4),transparent_50%)]" />

        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl">
            <Brain className="text-white w-14 h-14" />
          </div>
          <h1 className="text-white text-4xl font-bold tracking-tight">
            HireAI
          </h1>
          <p className="text-blue-200 text-lg font-medium max-w-sm">
            Intelligent hiring, simplified.
          </p>
        </div>

        {/* Decorative Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-linear-to-t from-primary-hover to-transparent opacity-60" />
      </div>

      {/* Right Column: Login Form Container */}
      {/* 3. Removed excessive vertical padding, added h-full, and overflow-y-auto for tiny screens */}
      <div className="w-full md:w-7/12 lg:w-1/2 h-full flex items-center justify-center p-6 lg:px-24 overflow-y-auto">
        {/* 4. Added my-auto to ensure strict vertical centering */}
        <div className="w-full max-w-[480px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 md:p-10 border border-slate-100 my-auto">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-500 text-sm">
              Welcome back! Please enter your details to access the admin panel.
            </p>
          </div>

          <LoginForm />

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              New to HireAI?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
              >
                Register your company
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
