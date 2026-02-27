import { Interview } from "@/core/entities/interview";

export interface IInterviewRepository {
  getHydratedInterviews(companyId: string): import("../entities/types").HydratedInterview[] | PromiseLike<import("../entities/types").HydratedInterview[]>;
  getInterviews(companyId: string): Promise<Interview[]>;
  getInterviewById(id: string): Promise<Interview | null>;
  updateInterview(id: string, data: Partial<Interview>): Promise<Interview>;
  deleteInterview(id: string): Promise<void>;
}
