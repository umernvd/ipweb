import { Client, Databases, Query, Models } from "appwrite";
import { IInterviewRepository } from "../IInterviewRepository";
import { Interview } from "@/core/entities/interview";

export class InterviewAppwriteRepository implements IInterviewRepository {
  private databases: Databases;
  private databaseId: string;
  private collectionId = "interviews";

  constructor(client: Client, databaseId: string) {
    this.databases = new Databases(client);
    this.databaseId = databaseId;
  }

  // We cast 'doc' to 'any' to read custom attributes
  private toDomain(doc: Models.Document): Interview {
    const data = doc as any; // Allow accessing custom fields

    return {
      $id: doc.$id,
      candidateId: data.candidateId,
      interviewerId: data.interviewerId,
      companyId: data.companyId,
      roleId: data.roleId || null,

      driveFileUrl: data.driveFileUrl || null,
      driveFolderId: data.driveFolderId || null,
      driveFileId: data.driveFileId || null,

      aiSummary: data.aiSummary || null,
      score: data.score || 0,
      // Default to 'pending' if missing or invalid
      status: ["pending", "started", "completed", "reviewed"].includes(
        data.status,
      )
        ? data.status
        : "pending",

      startedAt: data.startedAt || null,
    };
  }

  async getInterviews(companyId: string): Promise<Interview[]> {
    try {
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [Query.equal("companyId", companyId), Query.orderDesc("$createdAt")],
      );
      return response.documents.map((doc) => this.toDomain(doc));
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
      return [];
    }
  }

  async getInterviewById(id: string): Promise<Interview | null> {
    try {
      const doc = await this.databases.getDocument(
        this.databaseId,
        this.collectionId,
        id,
      );
      return this.toDomain(doc);
    } catch (error) {
      return null;
    }
  }

  async updateInterview(
    id: string,
    data: Partial<Interview>,
  ): Promise<Interview> {
    const doc = await this.databases.updateDocument(
      this.databaseId,
      this.collectionId,
      id,
      data,
    );
    return this.toDomain(doc);
  }

  async deleteInterview(id: string): Promise<void> {
    await this.databases.deleteDocument(this.databaseId, this.collectionId, id);
  }
}
