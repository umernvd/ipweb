import { Databases, ID, Query, Permission, Role, Models } from "appwrite";
import { IInterviewerRepository } from "../IInterviewerRepository";
import { Interviewer } from "../../entities/types";
import { useAuthStore } from "@/stores/authStore";

// Lightweight validation helper
const validateInterviewerInput = (data: {
  companyId: string;
  name: string;
  email: string;
  status: string;
}): void => {
  // Validate companyId
  if (
    !data.companyId ||
    typeof data.companyId !== "string" ||
    data.companyId.trim().length === 0
  ) {
    throw new Error("Invalid companyId: must be a non-empty string");
  }

  // Validate name
  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    throw new Error("Invalid name: must be a non-empty string");
  }
  if (data.name.length > 255) {
    throw new Error("Invalid name: must not exceed 255 characters");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    !data.email ||
    typeof data.email !== "string" ||
    !emailRegex.test(data.email)
  ) {
    throw new Error("Invalid email: must be a valid email address");
  }
  if (data.email.length > 255) {
    throw new Error("Invalid email: must not exceed 255 characters");
  }

  // Validate status
  const validStatuses = ["active", "inactive", "pending"];
  if (
    !data.status ||
    typeof data.status !== "string" ||
    !validStatuses.includes(data.status.toLowerCase())
  ) {
    throw new Error(
      `Invalid status: must be one of ${validStatuses.join(", ")}`,
    );
  }
};

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
    return response.documents.map((doc) => this.toDomain(doc));
  }

  private toDomain(doc: Models.Document): Interviewer {
    return {
      $id: doc.$id,
      companyId: (doc as any).companyId,
      name: (doc as any).name,
      email: (doc as any).email,
      status: (doc as any).status,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
    };
  }

  async createInterviewer(data: {
    companyId: string;
    name: string;
    email: string;
    status: string;
  }): Promise<Interviewer> {
    // Validate input before proceeding
    validateInterviewerInput(data);

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
    return this.toDomain(response);
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
    return this.toDomain(response);
  }

  async deleteInterviewer(id: string): Promise<void> {
    await this.databases.deleteDocument(this.databaseId, "interviewers", id);
  }
}
