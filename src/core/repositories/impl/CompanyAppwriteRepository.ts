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

  // Mapper: Appwrite Document -> Domain Entity
  private toDomain(doc: Models.Document): Company {
    // Cast to 'any' to access custom fields not in standard Appwrite types
    const d = doc as any;

    return {
      $id: d.$id,
      name: d.name,
      email: d.email,
      status: d.status,
      total_interviews: d.total_interviews || 0,
      $createdAt: d.$createdAt,
    };
  }
}
