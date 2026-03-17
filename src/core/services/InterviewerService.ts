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
    // Auto-generate an 8-character uppercase auth code using cryptographic randomness
    // Meets Appwrite's minimum 8-character password requirement
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    const generatedAuthCode = Array.from(array)
      .map((x) => chars[x % chars.length])
      .join("");

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
