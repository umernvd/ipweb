import { Databases, Query, ID, Models } from "appwrite";
import { Candidate, CandidateStatus } from "@/core/entities/candidate";

export interface ICandidateRepository {
  list(companyId: string): Promise<Candidate[]>;
  create(data: Omit<Candidate, "$id" | "createdAt">): Promise<Candidate>;
}

export class CandidateAppwriteRepository implements ICandidateRepository {
  constructor(private databases: Databases) {}

  async list(companyId: string): Promise<Candidate[]> {
    const response = await this.databases.listDocuments(
      "interview_pro_db",
      "candidates",
      [Query.equal("companyId", companyId), Query.orderDesc("$createdAt")],
    );
    return response.documents.map(this.toDomain);
  }

  async create(data: Omit<Candidate, "$id" | "createdAt">): Promise<Candidate> {
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
      status: d.status as CandidateStatus,
      resumeUrl: d.resumeUrl,
      companyId: d.companyId,
      createdAt: d.$createdAt,
    };
  }
}
