"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "@/stores/authStore";
import { useSuperAdminStore } from "@/stores/superAdminStore";

const navItems = [
  { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  {
    name: "Approvals",
    href: "/super-admin/approvals",
    icon: ShieldCheck,
    badgeKey: "pendingApprovals",
  },
  { name: "All Companies", href: "/super-admin/companies", icon: Building2 },
  { name: "Settings", href: "/super-admin/settings", icon: Settings },
];

export const SuperAdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { stats } = useSuperAdminStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <aside className="flex w-[240px] flex-col justify-between bg-primary border-r border-slate-700/30 overflow-y-auto shrink-0 z-20">
      <div className="flex flex-col">
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex items-center justify-center rounded-lg bg-white/10 p-2 border border-white/10">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">
              HireAI
            </h1>
            <span className="text-[10px] font-medium text-blue-200 uppercase tracking-wider">
              Super Admin
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const badgeCount = item.badgeKey
              ? stats[item.badgeKey as keyof typeof stats]
              : null;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 transition-all",
                  isActive
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-semibold">{item.name}</span>
                </div>
                {badgeCount !== null && badgeCount > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-300 hover:bg-red-400/10 hover:text-red-200 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
