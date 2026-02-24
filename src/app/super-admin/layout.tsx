import { SuperAdminSidebar } from "@/modules/super-admin/components/SuperAdminSidebar";
import { Header } from "@/shared/components/layout/Header"; // We reuse the header!

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light text-slate-900 font-sans">
      <SuperAdminSidebar />
      <main className="flex h-full flex-1 flex-col overflow-hidden relative">
        {/* We can reuse the Header component, or pass a prop to hide the 'Company' specific items */}
        <Header />
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
