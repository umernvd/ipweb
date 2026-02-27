"use client";

import { ErrorBoundary } from "react-error-boundary";
import { ComponentErrorFallback } from "@/shared/components/FallbackError";
import { InterviewsTable } from "@/modules/interviews/components/InterviewsTable";

export default function InterviewsPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto h-[calc(100vh-8rem)]">
      {/* h-[calc(100vh-8rem)] ensures the table takes up the full remaining height of the screen,
        allowing the internal table body to scroll while locking the pagination to the bottom.
      */}
      <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
        <InterviewsTable />
      </ErrorBoundary>
    </div>
  );
}
