export interface Interview {
  $id: string;
  candidateId: string;
  interviewerId: string;
  companyId: string;
  roleId: string | null;

  // The Drive Fields
  driveFileUrl: string | null; // The Audio Link
  driveFolderId: string | null; // The Folder containing CV
  driveFileId: string | null; // The Audio ID (internal use)

  // The Results
  aiSummary: string | null;
  score: number | null;
  status: "started" | "completed" | "pending" |"reviewed";
  startedAt: string | null;
}
