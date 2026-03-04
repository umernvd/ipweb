export interface Candidate {
  $id: string;
  name: string;
  email: string;
  interviewerId: string;
  companyId: string;
  phone?: string;
  cvFileUrl?: string;
  cvFileId?: string;
  driveFolderId?: string;
  createdAt?: string;
  updatedAt?: string;
}
