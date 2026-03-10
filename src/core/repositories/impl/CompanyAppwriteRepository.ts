import { Databases, Query, ID, Models } from "appwrite";
import { ICompanyRepository } from "../ICompanyRepository";
import { Company, CompanyStatus } from "@/core/entities/company";

export class CompanyAppwriteRepository implements ICompanyRepository {
  private dbId = "interview_pro_db";
  private collectionId = "companies";

  constructor(private databases: Databases) {}

  async list(status?: CompanyStatus): Promise<Company[]> {
    const queries = [Query.orderDesc("$createdAt")];
    if (status) {
      queries.push(Query.equal("status", status));
    }

    const response = await this.databases.listDocuments(
      this.dbId,
      this.collectionId,
      queries,
    );

    return response.documents.map(this.toDomain);
  }

  async updateStatus(id: string, status: CompanyStatus): Promise<void> {
    await this.databases.updateDocument(this.dbId, this.collectionId, id, {
      status,
    });
  }

  async findById(id: string): Promise<Company | null> {
    try {
      const doc = await this.databases.getDocument(
        this.dbId,
        this.collectionId,
        id,
      );
      return this.toDomain(doc);
    } catch {
      return null;
    }
  }

  async create(company: Omit<Company, "$id" | "$createdAt">): Promise<Company> {
    const doc = await this.databases.createDocument(
      this.dbId,
      this.collectionId,
      ID.unique(),
      company,
    );
    return this.toDomain(doc);
  }

  async listPending(): Promise<Company[]> {
    const response = await this.databases.listDocuments(
      this.dbId,
      this.collectionId,
      [Query.equal("status", "pending"), Query.orderDesc("$createdAt")],
    );
    return response.documents.map(this.toDomain);
  }

  async update(id: string, data: Partial<Company>): Promise<Company> {
    const doc = await this.databases.updateDocument(
      this.dbId,
      this.collectionId,
      id,
      data,
    );
    return this.toDomain(doc);
  }

  async getGlobalStats(): Promise<{
    total: number;
    active: number;
    pending: number;
  }> {
    // Fetch all companies to calculate stats
    const allResponse = await this.databases.listDocuments(
      this.dbId,
      this.collectionId,
      [Query.limit(1)], // Just get the total count
    );
    const total = allResponse.total;

    // Fetch active companies count
    const activeResponse = await this.databases.listDocuments(
      this.dbId,
      this.collectionId,
      [Query.equal("status", "active"), Query.limit(1)],
    );
    const active = activeResponse.total;

    // Fetch pending companies count
    const pendingResponse = await this.databases.listDocuments(
      this.dbId,
      this.collectionId,
      [Query.equal("status", "pending"), Query.limit(1)],
    );
    const pending = pendingResponse.total;

    return { total, active, pending };
  }

  async getPendingCompanies(): Promise<Company[]> {
    const response = await this.databases.listDocuments(
      this.dbId,
      this.collectionId,
      [Query.equal("status", "pending"), Query.orderDesc("$createdAt")],
    );
    return response.documents.map(this.toDomain);
  }

  // Mapper: Appwrite Document -> Domain Entity with proper typing
  private toDomain(doc: Models.Document): Company {
    return {
      $id: doc.$id,
      name: (doc as any).name,
      email: (doc as any).email,
      status: (doc as any).status,
      total_interviews: (doc as any).total_interviews || 0,
      $createdAt: doc.$createdAt,
    };
  }
}
