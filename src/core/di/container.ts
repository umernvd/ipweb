import { Client, Databases } from "appwrite";
import { CompanyAppwriteRepository } from "@/core/repositories/impl/CompanyAppwriteRepository";
import { CompanyService } from "@/core/services/CompanyService";

// 1. Infrastructure Layer (Raw Tools)
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("interviewpro");

const databases = new Databases(client);

// 2. Repository Layer (Data Access)
const companyRepository = new CompanyAppwriteRepository(databases);

// 3. Service Layer (Business Logic)
const companyService = new CompanyService(companyRepository);

// 4. Export Global Container
export const DI = {
  companyService,
};
