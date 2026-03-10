import { Client, Databases, Query, Models } from "appwrite";
import { IInterviewRepository } from "../IInterviewRepository";
import { Interview } from "@/core/entities/interview";
import {
  HydratedInterview,
  Candidate,
  Role,
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
      interviewerId: (doc as any).interviewerId,
      companyId: (doc as any).companyId,
      roleId: (doc as any).roleId || null,

      driveFileUrl: (doc as any).driveFileUrl || null,
      driveFolderId: (doc as any).driveFolderId || null,
      driveFileId: (doc as any).driveFileId || null,

      aiSummary: (doc as any).aiSummary || null,
      score: (doc as any).score || 0,
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
        [Query.equal("companyId", companyId)],
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

      // 3. Extract unique IDs for batch fetching
      const candidateIds = [
        ...new Set(rawInterviews.map((i) => i.candidateId).filter(Boolean)),
      ];
      const roleIds = [
        ...new Set(rawInterviews.map((i) => i.roleId).filter(Boolean)),
      ];
      const interviewerIds = [
        ...new Set(rawInterviews.map((i) => i.interviewerId).filter(Boolean)),
      ];

      let candidates: Candidate[] = [];
      let roles: Role[] = [];
      let interviewers: Interviewer[] = [];

      // 4. Batch fetch related data
      const fetchPromises = [];

      if (candidateIds.length > 0) {
        fetchPromises.push(
          this.databases
            .listDocuments(this.databaseId, "candidates", [
              Query.equal("$id", candidateIds),
              Query.limit(candidateIds.length),
            ])
            .then((res) => {
              candidates = res.documents.map((doc) => ({
                $id: doc.$id,
                name: (doc as any).name || "",
                email: (doc as any).email || "",
                phone: (doc as any).phone || null,
                driveFolderId: (doc as any).driveFolderId || null,
              })) as Candidate[];
            }),
        );
      }

      if (roleIds.length > 0) {
        fetchPromises.push(
          this.databases
            .listDocuments(this.databaseId, "roles", [
              Query.equal("$id", roleIds),
              Query.limit(roleIds.length),
            ])
            .then((res) => {
              roles = res.documents.map((doc) => ({
                $id: doc.$id,
                name: (doc as any).name || "",
                title: (doc as any).title || "",
                level: (doc as any).level || "",
              })) as Role[];
            }),
        );
      }

      if (interviewerIds.length > 0) {
        fetchPromises.push(
          this.databases
            .listDocuments(this.databaseId, "interviewers", [
              Query.equal("$id", interviewerIds),
              Query.limit(interviewerIds.length),
            ])
            .then((res) => {
              interviewers = res.documents.map((doc) => ({
                $id: doc.$id,
                name: (doc as any).name || "",
                email: (doc as any).email || "",
                status: (doc as any).status || "",
                companyId: (doc as any).companyId || "",
                $createdAt: doc.$createdAt || "",
                $updatedAt: doc.$updatedAt || "",
              })) as Interviewer[];
            }),
        );
      }

      await Promise.all(fetchPromises);

      // 5. Hydrate interviews with guaranteed fallback objects
      let hydratedData: HydratedInterview[] = rawInterviews.map((interview) => {
        const candidate = candidates.find(
          (c) => c.$id === interview.candidateId,
        );
        const role = roles.find((r) => r.$id === interview.roleId);
        const interviewer = interviewers.find(
          (i) => i.$id === interview.interviewerId,
        );

        return {
          ...interview,
          candidate: {
            $id: interview.candidateId,
            name:
              candidate?.name ||
              `Unknown Candidate (${interview.candidateId.substring(0, 6)})`,
            email: candidate?.email || "No email recorded",
            phone: candidate?.phone || "No phone recorded",
            driveFolderId: candidate?.driveFolderId || null,
          },
          role: {
            $id: interview.roleId || "unknown",
            title: role?.title || "Unspecified Role",
            level: role?.level || "N/A",
          },
          interviewer: {
            $id: interview.interviewerId || "unknown",
            name:
              interviewer?.name ||
              `Unknown (${interview.interviewerId?.substring(0, 6) || "N/A"})`,
            email: interviewer?.email || "No email",
            status: interviewer?.status || "Inactive",
            companyId: interviewer?.companyId || interview.companyId,
            $createdAt:
              interviewer?.$createdAt ||
              interview.startedAt ||
              new Date().toISOString(),
            $updatedAt: interviewer?.$updatedAt || new Date().toISOString(),
          },
        };
      });

      // 6. Apply in-memory search filter on candidate name
      if (filters?.searchQuery) {
        const lowerQuery = filters.searchQuery.toLowerCase();
        hydratedData = hydratedData.filter((interview) =>
          interview.candidate?.name.toLowerCase().includes(lowerQuery),
        );
      }

      // 7. Apply pagination on the filtered results
      const offset = filters?.offset || 0;
      const limit = filters?.limit || 10;
      const paginatedData = hydratedData.slice(offset, offset + limit);

      return {
        total: hydratedData.length, // Total after search filter is applied
        documents: paginatedData,
      };
    } catch (error) {
      console.error("Failed to hydrate interviews:", error);
      return { total: 0, documents: [] };
    }
  }
}
