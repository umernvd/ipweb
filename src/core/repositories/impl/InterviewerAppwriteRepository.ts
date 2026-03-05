import { Databases, ID, Query, Permission, Role } from "appwrite";
import { IInterviewerRepository } from "../IInterviewerRepository";
import { Interviewer } from "../../entities/types";
import { useAuthStore } from "@/stores/authStore";

export class InterviewerAppwriteRepository implements IInterviewerRepository {
  constructor(
    private readonly databases: Databases,
    private readonly databaseId: string,
  ) {}

  async getInterviewers(companyId: string): Promise<Interviewer[]> {
    const response = await this.databases.listDocuments(
      this.databaseId,
      "interviewers",
      [Query.equal("companyId", companyId)],
    );
    return response.documents as unknown as Interviewer[];
  }

  async createInterviewer(data: {
    companyId: string;
    name: string;
    email: string;
    status: string;
  }): Promise<Interviewer> {
    // Get current user ID from auth store for permission assignment
    const { user } = useAuthStore.getState();
    const currentAdminUserId = user?.$id;

    // Build permissions array
    // - Allow any unauthenticated user to read (for mobile login phase)
    // - Allow current admin to update and delete
    const permissions = [
      Permission.read(Role.any()),
      ...(currentAdminUserId
        ? [
            Permission.update(Role.user(currentAdminUserId)),
            Permission.delete(Role.user(currentAdminUserId)),
          ]
        : []),
    ];

    const response = await this.databases.createDocument(
      this.databaseId,
      "interviewers",
      ID.unique(),
      data,
      permissions,
    );
    return response as unknown as Interviewer;
  }

  async updateInterviewer(
    id: string,
    data: Partial<Interviewer>,
  ): Promise<Interviewer> {
    const response = await this.databases.updateDocument(
      this.databaseId,
      "interviewers",
      id,
      data,
    );
    return response as unknown as Interviewer;
  }

  async deleteInterviewer(id: string): Promise<void> {
    await this.databases.deleteDocument(this.databaseId, "interviewers", id);
  }
}
