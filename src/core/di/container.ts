import { Client, Databases } from "appwrite";
import { CompanyAppwriteRepository } from "@/core/repositories/impl/CompanyAppwriteRepository";
import { BlueprintAppwriteRepository } from "@/core/repositories/impl/BlueprintAppwriteRepository";
import {
  RoleAppwriteRepository,
  LevelAppwriteRepository,
} from "@/core/repositories/impl/ConfigAppwriteRepository";
import { CompanyService } from "@/core/services/CompanyService";
import { RoleService, LevelService } from "@/core/services/ConfigService";
import { BlueprintService } from "@/core/services/BlueprintService";

// 1. Infrastructure
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("interviewpro");

const databases = new Databases(client);

// 2. Repositories
const companyRepo = new CompanyAppwriteRepository(databases);
const roleRepo = new RoleAppwriteRepository(databases);
const levelRepo = new LevelAppwriteRepository(databases);
const blueprintRepo = new BlueprintAppwriteRepository(databases);

// 3. Services
const companyService = new CompanyService(companyRepo);
const roleService = new RoleService(roleRepo);
const levelService = new LevelService(levelRepo);
const blueprintService = new BlueprintService(blueprintRepo);

// 4. Export
export const DI = {
  companyService,
  roleService,
  levelService,
  blueprintService,
};
