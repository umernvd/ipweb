import { SuperAdminSidebar } from "@/modules/super-admin/components/SuperAdminSidebar";
import { Header } from "@/shared/components/layout/Header";
import { AuthGuard } from "@/modules/auth/components/AuthGuard";
import { UserProvider } from "@/context/UserContext";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <UserProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background-light text-slate-900 font-sans">
          <SuperAdminSidebar />
          <main className="flex h-full flex-1 flex-col overflow-hidden relative">
            <Header />
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {children}
            </div>
          </main>
        </div>
      </UserProvider>
    </AuthGuard>
  );
}
