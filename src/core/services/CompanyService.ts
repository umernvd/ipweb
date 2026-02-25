import { ICompanyRepository } from "@/core/repositories/ICompanyRepository";
import { Company, CompanyStatus } from "@/core/entities/company";

export class CompanyService {
  constructor(private companyRepo: ICompanyRepository) {}

  async getById(id: string): Promise<Company | null> {
    return this.companyRepo.findById(id);
  }

  async getPendingApprovals(): Promise<Company[]> {
    return this.companyRepo.list("pending");
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepo.list();
  }

  async approveCompany(id: string): Promise<void> {
    // Future logic: Send "Welcome" email here
    await this.companyRepo.updateStatus(id, "active");
  }

  async rejectCompany(id: string): Promise<void> {
    // Future logic: Send "Rejection" email here
    await this.companyRepo.updateStatus(id, "rejected");
  }

  async banCompany(id: string): Promise<void> {
    await this.companyRepo.updateStatus(id, "banned");
  }

  async pauseCompany(id: string): Promise<void> {
    await this.companyRepo.updateStatus(id, "paused");
  }

  async updateStatus(id: string, status: "active" | "rejected"): Promise<void> {
    await this.companyRepo.updateStatus(id, status);
  }
}
