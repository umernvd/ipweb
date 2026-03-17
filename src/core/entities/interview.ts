export interface Interview {
  $id: string;
  candidateId: string;
  candidateName?: string; // Direct column from interviews collection
  interviewerId: string;
  companyId: string;
  roleId: string | null;
  levelId?: string; // Direct column from interviews collection

  // The Drive Fields
  driveFileUrl: string | null; // The Audio Link
  driveFolderId: string | null; // The Folder containing CV
  driveFileId: string | null; // The Audio ID (internal use)
  cvDriveUrl?: string | null; // Optional CV file URL

  // The Results
  aiSummary: string | null;
  score: number | null;
  status: "started" | "completed" | "pending" | "reviewed";
  startedAt: string | null;
}
