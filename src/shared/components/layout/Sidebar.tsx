"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart2,
  Library,
  FileText,
  Video,
  Settings,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Interviewers", href: "/interviewers", icon: Users },
  { name: "Hiring Roles", href: "/roles", icon: Briefcase },
  { name: "Levels", href: "/levels", icon: BarChart2 },
  { name: "Question Bank", href: "/questions", icon: Library },
  { name: "Blueprints", href: "/blueprints", icon: FileText },
  { name: "Interviews", href: "/interviews", icon: Video },
];

export const Sidebar = () => {
  const pathname = usePathname();

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
          href="/settings"
          className={clsx(
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
            pathname === "/settings"
              ? "bg-white/5 text-white border-l-2 border-white"
              : "text-slate-300 hover:bg-white/10 hover:text-white",
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
};
