import { CompaniesTable } from "@/modules/super-admin/components/CompaniesTable";

export const metadata = {
  title: "All Companies | HireAI Super Admin",
};

export default function AllCompaniesPage() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          All Companies
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage all registered tenants on the platform.
        </p>
      </div>

      <CompaniesTable />
    </div>
  );
}
