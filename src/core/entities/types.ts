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

import { Interview } from "./interview";

export interface HydratedInterview extends Interview {
  candidate?: Candidate; // Optional because the fetch could fail
  role?: Role;
}
