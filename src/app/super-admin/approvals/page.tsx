import { ApprovalsTable } from "@/modules/super-admin/components/ApprovalsTable";

export const metadata = {
  title: "Pending Approvals | HireAI Admin",
};

export default function ApprovalsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Pending Approvals
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review and approve new company registration requests.
        </p>
      </div>

      <ApprovalsTable />
    </div>
  );
}
