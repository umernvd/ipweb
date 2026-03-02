export interface Candidate {
  $id: string;
  name: string;
  email: string;
  phone: string | null;
  driveFolderId?: string | null;
}

export interface Role {
  $id: string;
  title: string;
  level: string;
}

export interface Interviewer {
  $id: string;
  name: string;
  email: string;
}

export interface PaginatedResult<T> {
  total: number;
  documents: T[];
}

import { Interview } from "./interview";

export interface HydratedInterview extends Interview {
  candidate?: Candidate;
  role?: Role;
  interviewer?: Interviewer;
}
