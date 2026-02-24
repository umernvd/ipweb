import { Client, Databases, Query, Models } from "appwrite";
import { Company, CompanyStatus } from "@/core/entities/company";

// Initialize Appwrite
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("interviewpro"); // ✅ I put your Project ID here based on your JSON

const databases = new Databases(client); // ✅ Fixes "Cannot find name databases"

const DB_ID = "interview_pro_db";
const COLLECTION_ID = "companies";

export const companyService = {
  // Fetch all companies, optionally filtered by status
  async listCompanies(status?: CompanyStatus): Promise<Company[]> {
    try {
      const queries = [Query.orderDesc("$createdAt")];
      if (status) {
        queries.push(Query.equal("status", status));
      }

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTION_ID,
        queries,
      );

      // ✅ Fixes "Parameter doc implicitly has an any type"
      const companies = response.documents.map((doc: any) => ({
        $id: doc.$id,
        name: doc.name,
        email: doc.email,
        status: doc.status,
        total_interviews: doc.total_interviews || 0,
        $createdAt: doc.$createdAt,
      })) as Company[];

      return companies;
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      return [];
    }
  },

  // Update company status
  async updateStatus(id: string, status: CompanyStatus): Promise<void> {
    try {
      await databases.updateDocument(DB_ID, COLLECTION_ID, id, {
        status: status,
      });
    } catch (error) {
      console.error(`Failed to update company ${id}:`, error);
      throw error;
    }
  },
};
