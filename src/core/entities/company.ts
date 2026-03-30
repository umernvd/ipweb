export type CompanyStatus =
  | "active"
  | "pending"
  | "paused"
  | "banned"
  | "rejected";

export interface Company {
  $id: string;
  name: string;
  email: string;
  status: CompanyStatus;
  total_interviews: number;
  googleRefreshToken?: string;
  driveConnectedAt?: string;
  $createdAt: string;
}
