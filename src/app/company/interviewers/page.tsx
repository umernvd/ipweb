import { InterviewersTable } from "@/modules/interviewers/components/InterviewersTable";

export const metadata = {
  title: "Interviewers | HireAI Admin",
  description: "Manage your company interviewers",
};

export default function InterviewersPage() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <InterviewersTable />
    </div>
  );
}
