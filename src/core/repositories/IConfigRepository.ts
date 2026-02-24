import { Role, Level } from "@/core/entities/role";

export interface IRoleRepository {
  list(companyId: string): Promise<Role[]>;
  create(role: Omit<Role, "$id" | "isActive">): Promise<Role>;
  delete(id: string): Promise<void>;
}

export interface ILevelRepository {
  list(companyId: string, roleId?: string): Promise<Level[]>;
  create(level: Omit<Level, "$id" | "isActive">): Promise<Level>;
  delete(id: string): Promise<void>;
}
