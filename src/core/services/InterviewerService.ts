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
    // Auto-generate a 6-character uppercase auth code (e.g., "A7X9WQ")
    const generatedAuthCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    // Combine the form data with the new authCode
    const payloadToSave = {
      ...data,
      authCode: generatedAuthCode,
    };

    return this.repository.createInterviewer(payloadToSave as any);
  }

  async update(id: string, data: Partial<Interviewer>): Promise<Interviewer> {
    return this.repository.updateInterviewer(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repository.deleteInterviewer(id);
  }
}
