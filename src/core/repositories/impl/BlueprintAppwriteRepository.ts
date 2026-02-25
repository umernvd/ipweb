import { Databases, Query, ID, Models } from "appwrite";
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

  // MAPPER: Handles the JSON Parsing safely
  private toDomain(doc: Models.Document): Blueprint {
    const d = doc as any;

    let parsedStructure = [];
    try {
      // PARSE: Convert JSON String -> Array
      parsedStructure = d.structure ? JSON.parse(d.structure) : [];
    } catch (e) {
      console.error("Failed to parse blueprint structure", e);
      parsedStructure = [];
    }

    return {
      $id: d.$id,
      name: d.name,
      description: d.description,
      companyId: d.companyId,
      roleId: d.roleId,
      levelId: d.levelId,
      structure: parsedStructure,
      createdAt: d.$createdAt,
    };
  }
}
