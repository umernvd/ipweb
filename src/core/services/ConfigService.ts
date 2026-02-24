import {
  IRoleRepository,
  ILevelRepository,
} from "@/core/repositories/IConfigRepository";
import { Role, Level } from "@/core/entities/role";

export class RoleService {
  constructor(private repo: IRoleRepository) {}

  async getCompanyRoles(companyId: string): Promise<Role[]> {
    return this.repo.list(companyId);
  }

  async createRole(role: Omit<Role, "$id" | "isActive">): Promise<Role> {
    // Business Logic Rule: Maybe validate role name uniqueness here in the future?
    return this.repo.create(role);
  }

  async removeRole(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}

export class LevelService {
  constructor(private repo: ILevelRepository) {}

  async getLevels(companyId: string, roleId: string): Promise<Level[]> {
    return this.repo.list(companyId, roleId);
  }

  async createLevel(level: Omit<Level, "$id" | "isActive">): Promise<Level> {
    return this.repo.create(level);
  }

  async removeLevel(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
