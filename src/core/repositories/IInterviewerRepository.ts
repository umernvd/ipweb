import { Interviewer } from "../entities/types";

export interface IInterviewerRepository {
  getInterviewers(companyId: string): Promise<Interviewer[]>;
  createInterviewer(data: {
    companyId: string;
    name: string;
    email: string;
    status: string;
  }): Promise<Interviewer>;
  updateInterviewer(
    id: string,
    data: Partial<Interviewer>,
  ): Promise<Interviewer>;
  deleteInterviewer(id: string): Promise<void>;
}
