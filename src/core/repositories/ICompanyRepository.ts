import { Company, CompanyStatus } from "@/core/entities/company";

export interface ICompanyRepository {
  list(status?: CompanyStatus): Promise<Company[]>;
  updateStatus(id: string, status: CompanyStatus): Promise<void>;
  findById(id: string): Promise<Company | null>;
  create(company: Omit<Company, "$id" | "$createdAt">): Promise<Company>;
}
