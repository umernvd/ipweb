export type CandidateStatus = "pending" | "active" | "rejected" | "hired";

export interface Candidate {
  $id: string;
  name: string;
  email: string;
  status: CandidateStatus;
  resumeUrl?: string;
  companyId: string;
  createdAt: string;
}
