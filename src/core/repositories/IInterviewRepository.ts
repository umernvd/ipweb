import { Interview } from "@/core/entities/interview";
import { HydratedInterview, PaginatedResult } from "@/core/entities/types";

export interface InterviewQueryFilters {
  limit?: number;
  offset?: number;
  searchQuery?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  cacheBuster?: number;
}

export interface IInterviewRepository {
  getHydratedInterviews(
    companyId: string,
    filters?: InterviewQueryFilters,
  ): Promise<PaginatedResult<HydratedInterview>>;
  getInterviews(companyId: string): Promise<Interview[]>;
  getInterviewById(id: string): Promise<Interview | null>;
  createInterview(data: Partial<Interview>): Promise<Interview>;
  updateInterview(id: string, data: Partial<Interview>): Promise<Interview>;
  deleteInterview(id: string): Promise<void>;
  getGlobalInterviewCount(): Promise<number>;
}
