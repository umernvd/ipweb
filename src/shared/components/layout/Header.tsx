import { Search, Bell, ChevronDown } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white px-8 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-500">
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">Sarah Jenkins</p>
            <p className="text-xs text-slate-500 mt-1">SPEEDFORCE DIGITAL</p>
          </div>
          {/* Replaced external image with a clean UI avatar to prevent Next.js image domain errors */}
         
         
        </div>
      </div>
    </header>
  );
};