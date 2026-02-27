import { HydratedInterview } from "../entities/types";
import { IInterviewRepository } from "../repositories/IInterviewRepository";
import { Interview } from "@/core/entities/interview";

export class InterviewService {
  constructor(private repo: IInterviewRepository) {}

  async getAll(companyId: string): Promise<Interview[]> {
    if (!companyId) return [];
    return this.repo.getInterviews(companyId);
  }

  async getById(id: string): Promise<Interview | null> {
    return this.repo.getInterviewById(id);
  }

  async getDetailedInterviews(companyId: string): Promise<HydratedInterview[]> {
    if (!companyId) return [];
    // Call our new batch-fetching method
    return this.repo.getHydratedInterviews(companyId);
  }

  // Useful for the "Review" page to update scores/status
  async updateStatus(
    id: string,
    status: "completed" | "reviewed",
    score?: number,
  ): Promise<Interview> {
    return this.repo.updateInterview(id, {
      status,
      ...(score !== undefined && { score }),
    });
  }
}
