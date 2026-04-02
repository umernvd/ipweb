"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/company/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="h-screen w-full flex flex-col md:flex-row font-sans overflow-hidden bg-background-light">
      {/* Left Column: Brand Panel */}
      <div className="relative w-full md:w-5/12 lg:w-1/2 bg-primary flex flex-col items-center justify-center p-8 overflow-hidden md:h-full h-[25vh] shrink-0">
        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
            <Bot className="text-white w-10 h-10" />
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight">
            HireAI
          </h1>
        </div>
      </div>

      {/* Right Column: Login Form Container */}
      <div className="w-full md:w-7/12 lg:w-1/2 h-full flex items-center justify-center p-6 lg:px-24 overflow-y-auto">
        <div className="w-full max-w-[400px] bg-white rounded-xl shadow-sm p-8 md:p-10 border border-slate-100 my-auto">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign In</h2>
            <p className="text-slate-500 text-sm">
              Enter your credentials to continue
            </p>
          </div>

          <LoginForm />

          {/* Register Link */}
          <div className="text-center mt-6 pt-6 border-t border-slate-100">
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
