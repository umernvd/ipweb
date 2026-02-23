import { Sidebar } from "@/shared/components/layout/Sidebar";
import { Header } from "@/shared/components/layout/Header";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light text-slate-900 font-sans">
      <Sidebar />
      <main className="flex h-full flex-1 flex-col overflow-hidden relative">
        <Header />
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}