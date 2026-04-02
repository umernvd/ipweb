"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RegisterForm } from "@/modules/auth/components/RegisterForm";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/company/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="bg-background-light min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      {/* Main Card */}
      <main className="w-full max-w-[480px] bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="p-8 md:p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Register Your Company
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create an account to get started
            </p>
          </div>

          <RegisterForm />
        </div>
      </main>

      <footer className="mt-6 text-center pb-6">
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
