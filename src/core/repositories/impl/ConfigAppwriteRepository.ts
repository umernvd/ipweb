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
    const doc = await this.databases.createDocument(
      "interview_pro_db",
      "roles",
      ID.unique(),
      { ...role, isActive: true, icon: role.icon || "briefcase" },
      [
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
    if (roleId) queries.push(Query.equal("roleId", roleId));

    const response = await this.databases.listDocuments(
      "interview_pro_db",
      "experience_levels",
      queries,
    );
    return response.documents.map(this.toDomain);
  }

  async create(level: Omit<Level, "$id" | "isActive">): Promise<Level> {
    // Check for duplicate: prevent creating a level with the same title for the same role
    const existingLevels = await this.databases.listDocuments(
      "interview_pro_db",
      "experience_levels",
      [
        Query.equal("roleId", level.roleId),
        Query.equal("companyId", level.companyId),
        Query.equal("title", level.title),
      ],
    );

    if (existingLevels.total > 0) {
      throw new Error(
        `An experience level with title "${level.title}" already exists for this role.`,
      );
    }

    const doc = await this.databases.createDocument(
      "interview_pro_db",
      "experience_levels",
      ID.unique(),
      { ...level, isActive: true },
      [
        Permission.read(AppwriteRole.team(level.companyId)),
        Permission.update(AppwriteRole.team(level.companyId)),
        Permission.delete(AppwriteRole.team(level.companyId)),
      ],
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
      roleId: (doc as any).roleId,
      companyId: (doc as any).companyId,
      sortOrder: (doc as any).sortOrder,
      isActive: (doc as any).isActive,
    };
  }
}
