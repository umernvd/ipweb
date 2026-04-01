import { Databases, Query, ID, Models, Permission, Role } from "appwrite";
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
      [
        // Allow unauthenticated reads so web dashboard can fetch candidates
        Permission.read(Role.any()),
        // Team-level permissions for write/update/delete
        Permission.read(Role.team(data.companyId)),
        Permission.write(Role.team(data.companyId)),
        Permission.update(Role.team(data.companyId)),
        Permission.delete(Role.team(data.companyId)),
      ],
    );
    return this.toDomain(doc);
  }

  private toDomain(doc: Models.Document): Candidate {
    return {
      $id: doc.$id,
      name: (doc as any).name || "",
      email: (doc as any).email || "",
      interviewerId: (doc as any).interviewerId || "",
      companyId: (doc as any).companyId || "",
      phone: (doc as any).phone || null,
      cvFileUrl: (doc as any).cvFileUrl || null,
      cvFileId: (doc as any).cvFileId || null,
      driveFolderId: (doc as any).driveFolderId || null,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    };
  }
}
