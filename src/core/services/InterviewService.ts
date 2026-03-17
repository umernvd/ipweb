import { HydratedInterview, PaginatedResult } from "../entities/types";
import {
  IInterviewRepository,
  InterviewQueryFilters,
} from "../repositories/IInterviewRepository";
import { Interview } from "@/core/entities/interview";

export class InterviewService {
  constructor(private readonly repository: IInterviewRepository) {}

  async getAll(companyId: string): Promise<Interview[]> {
    if (!companyId) return [];
    return this.repository.getInterviews(companyId);
  }

  async getById(id: string): Promise<Interview | null> {
    return this.repository.getInterviewById(id);
  }

  async create(data: Partial<Interview>): Promise<Interview> {
    return this.repository.createInterview(data);
  }

  async getDetailedInterviews(
    companyId: string,
    filters?: InterviewQueryFilters & { cacheBuster?: number },
  ): Promise<PaginatedResult<HydratedInterview>> {
    if (!companyId) return { total: 0, documents: [] };
    return this.repository.getHydratedInterviews(companyId, filters);
  }

  async updateStatus(
    id: string,
    status: "completed" | "reviewed",
    score?: number,
  ): Promise<Interview> {
    return this.repository.updateInterview(id, {
      status,
      ...(score !== undefined && { score }),
    });
  }

  async getGlobalInterviewCount(): Promise<number> {
    return this.repository.getGlobalInterviewCount();
  }
}
