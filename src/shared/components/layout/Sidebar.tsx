"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  LayoutDashboard,
  Users,
  Briefcase,
  Library,
  FileText,
  Video,
  Settings,
  UserCircle,
  LogOut,
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { name: "Dashboard", href: "/company/dashboard", icon: LayoutDashboard },
  { name: "Candidates", href: "/company/candidates", icon: UserCircle },
  { name: "Interviewers", href: "/company/interviewers", icon: Users },
  { name: "Roles & Levels", href: "/company/hiring-roles", icon: Briefcase },
  { name: "Question Bank", href: "/company/questions", icon: Library },
  { name: "Blueprints", href: "/company/blueprints", icon: FileText },
  { name: "Interviews", href: "/company/interviews", icon: Video },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <aside className="flex w-[240px] flex-col justify-between bg-primary border-r border-slate-700/30 overflow-y-auto shrink-0 z-20">
      <div className="flex flex-col">
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex items-center justify-center rounded-lg bg-white/10 p-2">
            <Bot className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            HireAI
          </h1>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                  isActive
                    ? "bg-white/5 text-white border-l-2 border-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="w-5 h-5 font-medium" />
                <span className="text-sm font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-1 px-3 py-4 mt-auto border-t border-slate-700/30">
        <Link
          href="/company/settings"
          className={clsx(
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
            pathname === "/company/settings"
              ? "bg-white/5 text-white border-l-2 border-white"
              : "text-slate-300 hover:bg-white/10 hover:text-white",
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-red-300 hover:bg-red-400/10 hover:text-red-200 transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
