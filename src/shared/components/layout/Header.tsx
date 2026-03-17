"use client";

import { Search } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export const Header = () => {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-10 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white px-8 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
      </div>

      <div className="flex items-center gap-6">
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
          <Search className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide uppercase">
              Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
