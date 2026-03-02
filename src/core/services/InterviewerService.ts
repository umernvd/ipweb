import { IInterviewerRepository } from "../repositories/IInterviewerRepository";
import { Interviewer } from "../entities/types";

export class InterviewerService {
  constructor(private readonly repository: IInterviewerRepository) {}

  async getAll(companyId: string): Promise<Interviewer[]> {
    return this.repository.getInterviewers(companyId);
  }

  async create(data: {
    companyId: string;
    name: string;
    email: string;
    status: string;
  }): Promise<Interviewer> {
    return this.repository.createInterviewer(data);
  }

  async update(id: string, data: Partial<Interviewer>): Promise<Interviewer> {
    return this.repository.updateInterviewer(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repository.deleteInterviewer(id);
  }
}
