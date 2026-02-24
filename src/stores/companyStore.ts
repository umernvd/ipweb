import { create } from "zustand";
import { Company, CompanyStatus } from "@/core/entities/company";
import { companyService } from "@/core/services/company.service";

interface CompanyStore {
  allCompanies: Company[];
  pendingCompanies: Company[];
  isLoading: boolean;

  // Actions
  fetchStats: () => Promise<void>;
  fetchAllCompanies: () => Promise<void>;
  updateCompanyStatus: (id: string, status: CompanyStatus) => Promise<void>;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  allCompanies: [],
  pendingCompanies: [],
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true });
    const pending = await companyService.listCompanies("pending");
    set({ pendingCompanies: pending, isLoading: false });
  },

  fetchAllCompanies: async () => {
    set({ isLoading: true });
    const all = await companyService.listCompanies();
    set({ allCompanies: all, isLoading: false });
  },

  updateCompanyStatus: async (id, status) => {
    // Optimistic Update
    set((state) => ({
      allCompanies: state.allCompanies.map((c) =>
        c.$id === id ? { ...c, status } : c,
      ),
      pendingCompanies: state.pendingCompanies.filter((c) => c.$id !== id),
    }));

    await companyService.updateStatus(id, status);
  },
}));
