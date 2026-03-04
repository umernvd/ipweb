import { Databases, Query, ID, Models } from "appwrite";
import { Candidate } from "@/core/entities/candidate";
import { ICandidateRepository } from "../ICandidateRepository";

export class CandidateAppwriteRepository implements ICandidateRepository {
  constructor(private databases: Databases) {}

  async list(companyId: string): Promise<Candidate[]> {
    const response = await this.databases.listDocuments(
      "interview_pro_db",
      "candidates",
      [Query.equal("companyId", companyId), Query.orderDesc("$createdAt")],
    );
    return response.documents.map((doc) => this.toDomain(doc));
  }

  async create(
    data: Omit<Candidate, "$id" | "createdAt" | "updatedAt">,
  ): Promise<Candidate> {
    const doc = await this.databases.createDocument(
      "interview_pro_db",
      "candidates",
      ID.unique(),
      data,
    );
    return this.toDomain(doc);
  }

  private toDomain(doc: Models.Document): Candidate {
    const d = doc as any;
    return {
      $id: d.$id,
      name: d.name,
      email: d.email,
      interviewerId: d.interviewerId,
      companyId: d.companyId,
      phone: d.phone,
      cvFileUrl: d.cvFileUrl,
      cvFileId: d.cvFileId,
      driveFolderId: d.driveFolderId,
      createdAt: d.$createdAt,
      updatedAt: d.$updatedAt,
    };
  }
}
