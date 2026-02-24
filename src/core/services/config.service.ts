import { Client, Databases, Query, ID } from "appwrite";
import { Role, Level } from "@/core/entities/role";

// Initialize Appwrite
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("interviewpro");

const databases = new Databases(client);
const DB_ID = "interview_pro_db";

export const configService = {
  // --- ROLES ---
  async getRoles(companyId: string): Promise<Role[]> {
    const response = await databases.listDocuments(DB_ID, "roles", [
      Query.equal("companyId", companyId),
      Query.orderDesc("$createdAt"),
    ]);
    return response.documents as unknown as Role[];
  },

  async createRole(data: Omit<Role, "$id" | "isActive">): Promise<Role> {
    const response = await databases.createDocument(
      DB_ID,
      "roles",
      ID.unique(),
      {
        ...data,
        isActive: true,
        icon: data.icon || "briefcase",
      },
    );
    return response as unknown as Role;
  },

  async deleteRole(roleId: string): Promise<void> {
    await databases.deleteDocument(DB_ID, "roles", roleId);
  },

  // --- LEVELS ---
  async getLevels(companyId: string, roleId?: string): Promise<Level[]> {
    const queries = [
      Query.equal("companyId", companyId),
      Query.orderAsc("sortOrder"),
    ];
    if (roleId) {
      queries.push(Query.equal("roleId", roleId));
    }
    const response = await databases.listDocuments(
      DB_ID,
      "experience_levels",
      queries,
    );
    return response.documents as unknown as Level[];
  },

  async createLevel(data: Omit<Level, "$id" | "isActive">): Promise<Level> {
    const response = await databases.createDocument(
      DB_ID,
      "experience_levels",
      ID.unique(),
      {
        ...data,
        isActive: true,
      },
    );
    return response as unknown as Level;
  },

  async deleteLevel(levelId: string): Promise<void> {
    await databases.deleteDocument(DB_ID, "experience_levels", levelId);
  },
};
