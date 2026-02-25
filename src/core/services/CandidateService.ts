import { ICandidateRepository } from "../repositories/impl/CandidateAppwriteRepository";
import { Candidate } from "../entities/candidate";

export class CandidateService {
  constructor(private repo: ICandidateRepository) {}

  async getCandidates(companyId: string): Promise<Candidate[]> {
    return this.repo.list(companyId);
  }

  async addCandidate(
    data: Omit<Candidate, "$id" | "createdAt">,
  ): Promise<Candidate> {
    // Business Logic: Check for duplicate emails here in the future
    return this.repo.create(data);
  }
}
