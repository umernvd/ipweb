"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { InterviewReportPDF } from "../reports/InterviewReportPDF";
import { FileText, Loader2 } from "lucide-react";

interface Props {
  candidateName: string;
  role: string;
  score: number;
  summary: string;
}

export const DownloadReportButton = ({
  candidateName,
  role,
  score,
  summary,
}: Props) => {
  return (
    <PDFDownloadLink
      document={
        <InterviewReportPDF
          candidateName={candidateName}
          roleName={role}
          totalScore={score}
          aiSummary={summary}
        />
      }
      fileName={`${candidateName.replace(/\s+/g, "_")}_Report.pdf`}
    >
      {({ blob, url, loading, error }) => (
        <button
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <FileText size={14} />
          )}
          {loading ? "Generating..." : "Download Report"}
        </button>
      )}
    </PDFDownloadLink>
  );
};
