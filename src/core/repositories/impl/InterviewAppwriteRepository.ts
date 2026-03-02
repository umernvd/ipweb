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

  // We cast 'doc' to 'any' to read custom attributes
  private toDomain(doc: Models.Document): Interview {
    const data = doc as any; // Allow accessing custom fields

    return {
      $id: doc.$id,
      candidateId: data.candidateId,
      interviewerId: data.interviewerId,
      companyId: data.companyId,
      roleId: data.roleId || null,

      driveFileUrl: data.driveFileUrl || null,
      driveFolderId: data.driveFolderId || null,
      driveFileId: data.driveFileId || null,

      aiSummary: data.aiSummary || null,
      score: data.score || 0,
      // Default to 'pending' if missing or invalid
      status: ["pending", "started", "completed", "reviewed"].includes(
        data.status,
      )
        ? data.status
        : "pending",

      startedAt: data.startedAt || null,
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

  async getHydratedInterviews(
    companyId: string,
    options?: {
      limit?: number;
      offset?: number;
      searchQuery?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<PaginatedResult<HydratedInterview>> {
    try {
      // 1. Build dynamic queries
      const queries: string[] = [Query.equal("companyId", companyId)];

      // Pagination
      if (options?.limit) {
        queries.push(Query.limit(options.limit));
      }
      if (options?.offset) {
        queries.push(Query.offset(options.offset));
      }

      // Filtering by status
      if (options?.status) {
        queries.push(Query.equal("status", options.status));
      }

      // Date range filtering
      if (options?.startDate) {
        queries.push(Query.greaterThanEqual("startedAt", options.startDate));
      }
      if (options?.endDate) {
        queries.push(Query.lessThanEqual("startedAt", options.endDate));
      }

      // Search (requires index on candidateName field in Appwrite)
      if (options?.searchQuery) {
        queries.push(Query.search("candidateName", options.searchQuery));
      }

      // Always order by creation date
      queries.push(Query.orderDesc("$createdAt"));

      // 2. Fetch interviews with total count
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        queries,
      );

      const rawInterviews = response.documents.map((doc) => this.toDomain(doc));
      const total = response.total;

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
              candidates = res.documents as unknown as Candidate[];
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
              roles = res.documents as unknown as Role[];
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
              interviewers = res.documents as unknown as Interviewer[];
            }),
        );
      }

      await Promise.all(fetchPromises);

      // 5. Hydrate interviews with guaranteed fallback objects
      const hydratedData: HydratedInterview[] = rawInterviews.map(
        (interview) => {
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
        },
      );

      return {
        total,
        documents: hydratedData,
      };
    } catch (error) {
      console.error("Failed to hydrate interviews:", error);
      return { total: 0, documents: [] };
    }
  }
}
