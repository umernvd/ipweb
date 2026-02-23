import { InterviewsTable } from "@/modules/interviews/components/InterviewsTable";

export const metadata = {
  title: "Interviews | HireAI Admin",
  description: "Manage and track candidate interviews",
};

export default function InterviewsPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto h-[calc(100vh-8rem)]">
      {/* h-[calc(100vh-8rem)] ensures the table takes up the full remaining height of the screen,
        allowing the internal table body to scroll while locking the pagination to the bottom.
      */}
      <InterviewsTable />
    </div>
  );
}
