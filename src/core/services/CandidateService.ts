import { ICandidateRepository } from "../repositories/ICandidateRepository";
import { Candidate } from "../entities/candidate";

export class CandidateService {
  constructor(private repo: ICandidateRepository) {}

  async getCandidates(companyId: string): Promise<Candidate[]> {
    return this.repo.list(companyId);
  }

  async addCandidate(
    data: Omit<Candidate, "$id" | "createdAt" | "updatedAt">,
  ): Promise<Candidate> {
    return this.repo.create(data);
  }
}
