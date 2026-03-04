import { Databases, Query, ID, Models } from "appwrite";
import { Candidate } from "@/core/entities/candidate";
import { ICandidateRepository } from "../ICandidateRepository";

export class CandidateAppwriteRepository implements ICandidateRepository {
  constructor(private databases: Databases) {}

  async list(companyId: string): Promise<Candidate[]> {
    const response = await this.databases.listDocuments(
      "interview_pro_db",
      "candidates",
      [Query.equal("companyId", companyId)],
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
      name: d.name || "",
      email: d.email || "",
      interviewerId: d.interviewerId || "",
      companyId: d.companyId || "",
      phone: d.phone || null,
      cvFileUrl: d.cvFileUrl || null,
      cvFileId: d.cvFileId || null,
      driveFolderId: d.driveFolderId || null,
      createdAt: d.$createdAt,
      updatedAt: d.$updatedAt,
    };
  }
}
