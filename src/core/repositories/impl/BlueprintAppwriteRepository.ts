import { Databases, Query, ID, Models, Permission, Role } from "appwrite";
import { IBlueprintRepository } from "../IBlueprintRepository";
import { Blueprint } from "@/core/entities/blueprint";

export class BlueprintAppwriteRepository implements IBlueprintRepository {
  constructor(private databases: Databases) {}

  async list(companyId: string, roleId?: string): Promise<Blueprint[]> {
    const queries = [
      Query.equal("companyId", companyId),
      Query.orderDesc("$createdAt"),
    ];

    if (roleId) {
      queries.push(Query.equal("roleId", roleId));
    }

    const response = await this.databases.listDocuments(
      "interview_pro_db",
      "blueprints",
      queries,
    );

    return response.documents.map(this.toDomain);
  }

  async create(
    blueprint: Omit<Blueprint, "$id" | "createdAt">,
  ): Promise<Blueprint> {
    const doc = await this.databases.createDocument(
      "interview_pro_db",
      "blueprints",
      ID.unique(),
      {
        ...blueprint,
        structure: JSON.stringify(blueprint.structure),
      },
      [
        Permission.read(Role.team(blueprint.companyId)),
        Permission.write(Role.team(blueprint.companyId)),
        Permission.update(Role.team(blueprint.companyId)),
        Permission.delete(Role.team(blueprint.companyId)),
      ],
    );
    return this.toDomain(doc);
  }

  async findById(id: string): Promise<Blueprint | null> {
    try {
      const doc = await this.databases.getDocument(
        "interview_pro_db",
        "blueprints",
        id,
      );
      return this.toDomain(doc);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    await this.databases.deleteDocument("interview_pro_db", "blueprints", id);
  }

  // MAPPER: Handles the JSON Parsing safely with proper typing
  private toDomain(doc: Models.Document): Blueprint {
    return {
      $id: doc.$id,
      name: (doc as any).name,
      description: (doc as any).description,
      companyId: (doc as any).companyId,
      roleId: (doc as any).roleId,
      levelId: (doc as any).levelId,
      structure: this.parseStructure((doc as any).structure),
      createdAt: doc.$createdAt,
    };
  }

  private parseStructure(structure: any): any[] {
    let parsedStructure = [];
    try {
      // PARSE: Convert JSON String -> Array
      parsedStructure = structure ? JSON.parse(structure) : [];
    } catch (e) {
      console.error("Failed to parse blueprint structure", e);
      parsedStructure = [];
    }
    return parsedStructure;
  }
}
