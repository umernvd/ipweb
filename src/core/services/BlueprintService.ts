import { IBlueprintRepository } from "@/core/repositories/IBlueprintRepository";
import { Blueprint } from "@/core/entities/blueprint";

export class BlueprintService {
  constructor(private repo: IBlueprintRepository) {}

  async getCompanyBlueprints(
    companyId: string,
    roleId?: string,
  ): Promise<Blueprint[]> {
    return this.repo.list(companyId, roleId);
  }

  async createBlueprint(
    data: Omit<Blueprint, "$id" | "createdAt">,
  ): Promise<Blueprint> {
    // Future validation logic can go here (e.g. max 5 blueprints per role)
    return this.repo.create(data);
  }

  async deleteBlueprint(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
