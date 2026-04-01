import { Client, Databases, Query, Models, Permission, Role } from "appwrite";
import { IInterviewRepository } from "../IInterviewRepository";
import { Interview } from "@/core/entities/interview";
import {
  HydratedInterview,
  Candidate,
  Role as RoleEntity,
  Interviewer,
  PaginatedResult,
} from "@/core/entities/types";

export class InterviewAppwriteRepository implements IInterviewRepository {
  private databases: Databases;
  private databaseId: string;
  private collectionId = "interviews";

  constructor(client: Client, databaseId: string) {
    this.databases = new Databases(client);
    this.databaseId = databaseId;
  }

  // We map 'doc' to Interview using typed property access
  private toDomain(doc: Models.Document): Interview {
    return {
      $id: doc.$id,
      candidateId: (doc as any).candidateId,
      candidateName: (doc as any).candidateName || null, // Direct column from DB
      interviewerId: (doc as any).interviewerId,
      companyId: (doc as any).companyId,
      roleId: (doc as any).roleId || null,
      levelId: (doc as any).levelId || null, // Direct column from DB

      driveFileUrl: (doc as any).driveFileUrl || null,
      cvDriveUrl: (doc as any).cvDriveUrl || null,
      driveFolderId: (doc as any).driveFolderId || null,
      driveFileId: (doc as any).driveFileId || null,

      aiSummary: (doc as any).aiSummary || null,
      score: (doc as any).score ?? null,
      // Default to 'pending' if missing or invalid
      status: ["pending", "started", "completed", "reviewed"].includes(
        (doc as any).status,
      )
        ? (doc as any).status
        : "pending",

      startedAt: (doc as any).startedAt || null,
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

  async createInterview(data: Partial<Interview>): Promise<Interview> {
    const doc = await this.databases.createDocument(
      this.databaseId,
      this.collectionId,
      "unique()",
      {
        ...data,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.team(data.companyId!)),
        Permission.write(Role.team(data.companyId!)),
        Permission.update(Role.team(data.companyId!)),
        Permission.delete(Role.team(data.companyId!)),
      ],
    );
    return this.toDomain(doc);
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

  async getGlobalInterviewCount(): Promise<number> {
    try {
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [Query.limit(1)], // Only fetch metadata, not documents
      );
      return response.total;
    } catch (error) {
      console.error("Failed to fetch global interview count:", error);
      return 0;
    }
  }

  async getHydratedInterviews(
    companyId: string,
    filters?: {
      limit?: number;
      offset?: number;
      searchQuery?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      cacheBuster?: number;
    },
  ): Promise<PaginatedResult<HydratedInterview>> {
    try {
      // 1. Build dynamic queries WITHOUT search and pagination
      const queries: string[] = [Query.equal("companyId", companyId)];

      // Filtering by status
      if (filters?.status) {
        queries.push(Query.equal("status", filters.status));
      }

      // Date range filtering
      if (filters?.startDate) {
        queries.push(Query.greaterThanEqual("startedAt", filters.startDate));
      }
      if (filters?.endDate) {
        queries.push(Query.lessThanEqual("startedAt", filters.endDate));
      }

      // Always order by creation date
      queries.push(Query.orderDesc("$createdAt"));

      // Note: cacheBuster is passed through filters but not used in queries
      // The cache-busting happens at the client hook level by passing a timestamp
      // This ensures each fetch request is unique and bypasses Next.js caching

      // 2. Fetch interviews WITHOUT pagination to get all results for filtering
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        queries,
      );

      const rawInterviews = response.documents.map((doc) => this.toDomain(doc));

      if (rawInterviews.length === 0) {
        return { total: 0, documents: [] };
      }

      // 5. Hydrate interviews by fetching related documents
      const hydratedData = await Promise.all(
        rawInterviews.map(async (interview) => {
          // 1. Fetch Candidate Data (email, phone)
          let candidateEmail = "N/A";
          let candidatePhone = "N/A";
          if (interview.candidateId && interview.candidateId.length >= 20) {
            try {
              const candidateDoc = await this.databases.getDocument(
                this.databaseId,
                "candidates",
                interview.candidateId,
              );
              candidateEmail = (candidateDoc as any).email || "N/A";
              candidatePhone = (candidateDoc as any).phone || "N/A";
            } catch (e) {
              console.warn(
                `Candidate fetch failed for ID: ${interview.candidateId}`,
                e,
              );
            }
          }

          // 2. Fetch Role Name
          let roleTitle = "Unspecified Role";
          if (interview.roleId && interview.roleId.length >= 20) {
            try {
              const roleDoc = await this.databases.getDocument(
                this.databaseId,
                "roles",
                interview.roleId,
              );
              roleTitle =
                (roleDoc as any).title ||
                (roleDoc as any).name ||
                (roleDoc as any).roleName ||
                interview.roleId;
            } catch (e) {
              console.warn(`Role fetch failed for ID: ${interview.roleId}`, e);
            }
          } else if (interview.roleId) {
            roleTitle = interview.roleId;
          }

          // 3. Fetch Level Name
          let levelTitle = "N/A";
          if (interview.levelId && interview.levelId.length >= 20) {
            try {
              const levelDoc = await this.databases.getDocument(
                this.databaseId,
                "experience_levels",
                interview.levelId,
              );
              levelTitle =
                (levelDoc as any).title ||
                (levelDoc as any).name ||
                interview.levelId;
            } catch (e) {
              console.warn(
                `Level fetch failed for ID: ${interview.levelId}`,
                e,
              );
            }
          } else if (interview.levelId) {
            levelTitle = interview.levelId;
          }

          // 4. Fetch Interviewer Name
          let interviewerName = "Unknown Interviewer";
          if (interview.interviewerId && interview.interviewerId.length >= 20) {
            try {
              const intDoc = await this.databases.getDocument(
                this.databaseId,
                "interviewers",
                interview.interviewerId,
              );
              interviewerName =
                (intDoc as any).name || (intDoc as any).fullName || "Unknown";
            } catch (e) {
              console.warn(
                `Interviewer fetch failed for ID: ${interview.interviewerId}`,
                e,
              );
            }
          }

          // 5. Return properly nested object for the UI
          return {
            ...interview,
            candidate: {
              $id: interview.candidateId || "unspecified",
              name: interview.candidateName || "Unknown Candidate",
              email: candidateEmail,
              phone: candidatePhone,
              driveFolderId: interview.driveFolderId || null,
            },
            role: {
              $id: interview.roleId || "unspecified",
              title: roleTitle,
              level: levelTitle,
            },
            interviewer: {
              $id: interview.interviewerId || "unspecified",
              name: interviewerName,
              email: "N/A",
              status: "Active",
              companyId: interview.companyId,
              $createdAt: new Date().toISOString(),
              $updatedAt: new Date().toISOString(),
            },
          };
        }),
      );

      // 6. Apply in-memory search filter on candidate name
      let filteredData = hydratedData;
      if (filters?.searchQuery) {
        const lowerQuery = filters.searchQuery.toLowerCase();
        filteredData = hydratedData.filter((interview) =>
          interview.candidate?.name.toLowerCase().includes(lowerQuery),
        );
      }

      // 7. Apply pagination on the filtered results
      const offset = filters?.offset || 0;
      const limit = filters?.limit || 10;
      const paginatedData = filteredData.slice(offset, offset + limit);

      // Diagnostic: log first interview's hydrated fields to verify mapping
      if (paginatedData.length > 0) {
        console.log(
          "🔍 HYDRATION SAMPLE:",
          JSON.stringify(
            {
              candidateName: paginatedData[0].candidate?.name,
              roleTitle: paginatedData[0].role?.title,
              roleLevel: paginatedData[0].role?.level,
              interviewerName: paginatedData[0].interviewer?.name,
              rawRoleId: paginatedData[0].roleId,
              rawCandidateId: paginatedData[0].candidateId,
            },
            null,
            2,
          ),
        );
      }

      return {
        total: filteredData.length, // Total after search filter is applied
        documents: paginatedData,
      };
    } catch (error) {
      console.error("Failed to hydrate interviews:", error);
      return { total: 0, documents: [] };
    }
  }
}
