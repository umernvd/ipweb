import { Interview } from "@/core/entities/interview";
import { HydratedInterview, PaginatedResult } from "@/core/entities/types";

export interface IInterviewRepository {
  getHydratedInterviews(
    companyId: string,
    options?: {
      limit?: number;
      offset?: number;
      searchQuery?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<PaginatedResult<HydratedInterview>>;
  getInterviews(companyId: string): Promise<Interview[]>;
  getInterviewById(id: string): Promise<Interview | null>;
  updateInterview(id: string, data: Partial<Interview>): Promise<Interview>;
  deleteInterview(id: string): Promise<void>;
}
