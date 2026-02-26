import { Interview } from "@/core/entities/interview";

export interface IInterviewRepository {
  getInterviews(companyId: string): Promise<Interview[]>;
  getInterviewById(id: string): Promise<Interview | null>;
  updateInterview(id: string, data: Partial<Interview>): Promise<Interview>;
  deleteInterview(id: string): Promise<void>;
}
