import { Blueprint } from "@/core/entities/blueprint";

export interface IBlueprintRepository {
  list(companyId: string, roleId?: string): Promise<Blueprint[]>;
  create(blueprint: Omit<Blueprint, "$id" | "createdAt">): Promise<Blueprint>;
  findById(id: string): Promise<Blueprint | null>;
  delete(id: string): Promise<void>;
}
