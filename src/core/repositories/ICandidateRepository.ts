import { Candidate } from "@/core/entities/candidate";

export interface ICandidateRepository {
  list(companyId: string): Promise<Candidate[]>;
  create(
    data: Omit<Candidate, "$id" | "createdAt" | "updatedAt">,
  ): Promise<Candidate>;
}
