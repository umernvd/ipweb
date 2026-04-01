import {
  Databases,
  Query,
  ID,
  Models,
  Permission,
  Role as AppwriteRole,
} from "appwrite";
import { IRoleRepository, ILevelRepository } from "../IConfigRepository";
import { Role, Level } from "@/core/entities/role";

// --- ROLE REPOSITORY ---
export class RoleAppwriteRepository implements IRoleRepository {
  constructor(private databases: Databases) {}

  async list(companyId: string): Promise<Role[]> {
    const response = await this.databases.listDocuments(
      "interview_pro_db",
      "roles",
      [Query.equal("companyId", companyId), Query.orderDesc("$createdAt")],
    );
    return response.documents.map(this.toDomain);
  }

  async create(role: Omit<Role, "$id" | "isActive">): Promise<Role> {
    // Idempotency: skip if a role with the same name already exists for this company
    const existing = await this.databases.listDocuments(
      "interview_pro_db",
      "roles",
      [
        Query.equal("companyId", role.companyId),
        Query.equal("name", role.name),
      ],
    );
    if (existing.total > 0) {
      return this.toDomain(existing.documents[0]);
    }

    const doc = await this.databases.createDocument(
      "interview_pro_db",
      "roles",
      ID.unique(),
      { ...role, isActive: true, icon: role.icon || "briefcase" },
      [
        Permission.read(AppwriteRole.any()),
        Permission.read(AppwriteRole.team(role.companyId)),
        Permission.update(AppwriteRole.team(role.companyId)),
        Permission.delete(AppwriteRole.team(role.companyId)),
      ],
    );
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await this.databases.deleteDocument("interview_pro_db", "roles", id);
  }

  private toDomain(doc: Models.Document): Role {
    return {
      $id: doc.$id,
      name: (doc as any).name,
      description: (doc as any).description,
      icon: (doc as any).icon,
      isActive: (doc as any).isActive,
      companyId: (doc as any).companyId,
    };
  }
}

// --- LEVEL REPOSITORY ---
export class LevelAppwriteRepository implements ILevelRepository {
  constructor(private databases: Databases) {}

  async list(companyId: string, roleId?: string): Promise<Level[]> {
    const queries = [
      Query.equal("companyId", companyId),
      Query.orderAsc("sortOrder"),
    ];

    // Fetch all levels for the company (without roleId filter in query)
    const response = await this.databases.listDocuments(
      "interview_pro_db",
      "experience_levels",
      queries,
    );

    // If roleId provided, filter in code to include:
    // 1. Levels where roleId is in the roleIds array
    // 2. Levels with empty/null roleIds (shared across all roles)
    if (roleId) {
      return response.documents
        .filter((doc) => {
          const roleIds = (doc as any).roleIds;
          // Include if: roleIds contains roleId OR roleIds is empty/null (shared level)
          return (
            (Array.isArray(roleIds) && roleIds.includes(roleId)) ||
            !roleIds ||
            roleIds.length === 0
          );
        })
        .map(this.toDomain);
    }

    return response.documents.map(this.toDomain);
  }

  async create(level: Omit<Level, "$id" | "isActive">): Promise<Level> {
    // --- VALIDATION ---
    if (
      !level.title ||
      typeof level.title !== "string" ||
      level.title.trim() === ""
    ) {
      throw new Error("Title is required and must be a non-empty string");
    }

    if (
      !level.companyId ||
      typeof level.companyId !== "string" ||
      level.companyId.trim() === ""
    ) {
      throw new Error("CompanyId is required and must be a non-empty string");
    }

    // roleIds is optional - can be empty array for shared levels
    if (level.roleIds && !Array.isArray(level.roleIds)) {
      throw new Error("RoleIds must be an array if provided");
    }

    // Validate each roleId if provided
    if (level.roleIds && level.roleIds.length > 0) {
      for (const roleId of level.roleIds) {
        if (!roleId || typeof roleId !== "string" || roleId.trim() === "") {
          throw new Error("Each roleId must be a non-empty string");
        }
      }
    }

    if (typeof level.sortOrder !== "number" || level.sortOrder < 0) {
      throw new Error("SortOrder must be a valid non-negative integer");
    }

    // --- DEDUPLICATION: Check by (companyId, title) ---
    // Prevent creating a level with the same title for the same company
    console.log(
      `🔍 [LevelRepository] Checking for existing level: title="${level.title}", companyId="${level.companyId}"`,
    );

    const existingLevels = await this.databases.listDocuments(
      "interview_pro_db",
      "experience_levels",
      [
        Query.equal("companyId", level.companyId),
        Query.equal("title", level.title.trim()),
      ],
    );

    if (existingLevels.total > 0) {
      const existingLevel = existingLevels.documents[0];
      const existingRoleIds = (existingLevel as any).roleIds || [];

      // If new roleIds provided, merge them with existing
      if (level.roleIds && level.roleIds.length > 0) {
        const updatedRoleIds = Array.from(
          new Set([...existingRoleIds, ...level.roleIds]),
        );

        // Only update if there are new roleIds to add
        if (updatedRoleIds.length > existingRoleIds.length) {
          console.log(
            `📝 [LevelRepository] Adding roleIds to existing level "${level.title}": ${level.roleIds.join(", ")}`,
          );

          const updatedDoc = await this.databases.updateDocument(
            "interview_pro_db",
            "experience_levels",
            existingLevel.$id,
            { roleIds: updatedRoleIds },
          );

          console.log(
            `✅ [LevelRepository] Updated experience level with new roleIds: ID=${updatedDoc.$id}, roleIds=${updatedRoleIds.join(", ")}`,
          );

          return this.toDomain(updatedDoc);
        }
      }

      console.log(
        `♻️ [LevelRepository] Experience level "${level.title}" already exists for companyId: ${level.companyId}, returning existing (ID: ${existingLevel.$id})`,
      );
      return this.toDomain(existingLevel);
    }

    // --- CREATE NEW LEVEL ---
    console.log(
      `✨ [LevelRepository] Creating new experience level: title="${level.title}", roleIds=[${(level.roleIds || []).join(", ")}], companyId="${level.companyId}"`,
    );

    const doc = await this.databases.createDocument(
      "interview_pro_db",
      "experience_levels",
      ID.unique(),
      { ...level, isActive: true, roleIds: level.roleIds || [] },
      [
        Permission.read(AppwriteRole.team(level.companyId)),
        Permission.update(AppwriteRole.team(level.companyId)),
        Permission.delete(AppwriteRole.team(level.companyId)),
      ],
    );

    console.log(
      `✅ [LevelRepository] Experience level created successfully: ID=${doc.$id}, title="${doc.title}", roleIds=${((doc as any).roleIds || []).join(", ")}`,
    );

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await this.databases.deleteDocument(
      "interview_pro_db",
      "experience_levels",
      id,
    );
  }

  private toDomain(doc: Models.Document): Level {
    return {
      $id: doc.$id,
      title: (doc as any).title,
      description: (doc as any).description,
      roleIds: (doc as any).roleIds || [], // Changed from roleId to roleIds
      companyId: (doc as any).companyId,
      sortOrder: (doc as any).sortOrder,
      isActive: (doc as any).isActive,
    };
  }
}
