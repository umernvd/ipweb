import { create } from "zustand";
import { Company, CompanyStatus } from "@/core/entities/company";
import { DI } from "@/core/di/container";

interface CompanyStore {
  allCompanies: Company[];
  pendingCompanies: Company[];
  isLoading: boolean;

  fetchStats: () => Promise<void>;
  fetchAllCompanies: () => Promise<void>;
  updateCompanyStatus: (id: string, status: CompanyStatus) => Promise<void>;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  allCompanies: [],
  pendingCompanies: [],
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const pending = await DI.companyService.getPendingApprovals();
      set({ pendingCompanies: pending, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  fetchAllCompanies: async () => {
    set({ isLoading: true });
    try {
      const all = await DI.companyService.getAllCompanies();
      set({ allCompanies: all, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  updateCompanyStatus: async (id, status) => {
    // Optimistic UI Update
    set((state) => ({
      allCompanies: state.allCompanies.map((c) =>
        c.$id === id ? { ...c, status } : c,
      ),
      pendingCompanies: state.pendingCompanies.filter((c) => c.$id !== id),
    }));

    // Call the Service via DI
    try {
      if (status === "active") {
        await DI.companyService.approveCompany(id);
      } else if (status === "rejected") {
        await DI.companyService.rejectCompany(id);
      } else if (status === "banned") {
        await DI.companyService.banCompany(id);
      } else if (status === "paused") {
        await DI.companyService.pauseCompany(id);
      }
    } catch (error) {
      console.error("Failed to update status", error);
      // Revert optimistic update here if needed (advanced)
    }
  },
}));
