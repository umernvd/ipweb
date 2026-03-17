import { create } from "zustand";
import { Company, CompanyStatus } from "@/core/entities/company";
import { DI } from "@/core/di/container";
import {
  getAllCompaniesAdmin,
  getPendingCompaniesAdmin,
  approveCompanyAdmin,
  rejectCompanyAdmin,
} from "@/app/actions/adminActions";
import { useAuthStore } from "./authStore";

interface CompanyStore {
  allCompanies: Company[];
  pendingCompanies: Company[];
  isLoading: boolean;

  fetchStats: () => Promise<void>;
  fetchAllCompanies: () => Promise<void>;
  fetchPendingCompanies: () => Promise<void>;
  updateCompanyStatus: (id: string, status: CompanyStatus) => Promise<void>;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  allCompanies: [],
  pendingCompanies: [],
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const isAdmin = useAuthStore.getState().isAdmin;

      if (isAdmin) {
        // Super Admin: Generate JWT and use Server Action
        const { jwt } = await DI.authService.createJWT();
        const pending = await getPendingCompaniesAdmin(jwt);
        set({ pendingCompanies: pending, isLoading: false });
      } else {
        // Regular user: Use DI service
        const pending = await DI.companyService.getPendingApprovals();
        set({ pendingCompanies: pending, isLoading: false });
      }
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  fetchAllCompanies: async () => {
    set({ isLoading: true });
    try {
      const isAdmin = useAuthStore.getState().isAdmin;

      if (isAdmin) {
        // Super Admin: Generate JWT and use Server Action
        const { jwt } = await DI.authService.createJWT();
        const all = await getAllCompaniesAdmin(jwt);
        set({ allCompanies: all, isLoading: false });
      } else {
        // Regular user: Use DI service
        const all = await DI.companyService.getAllCompanies();
        set({ allCompanies: all, isLoading: false });
      }
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  fetchPendingCompanies: async () => {
    set({ isLoading: true });
    try {
      const isAdmin = useAuthStore.getState().isAdmin;

      if (isAdmin) {
        // Super Admin: Generate JWT and use Server Action
        const { jwt } = await DI.authService.createJWT();
        const pending = await getPendingCompaniesAdmin(jwt);
        set({ pendingCompanies: pending, isLoading: false });
      } else {
        // Regular user: Use DI service
        const pending = await DI.companyService.getPendingApprovals();
        set({ pendingCompanies: pending, isLoading: false });
      }
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

    try {
      const isAdmin = useAuthStore.getState().isAdmin;

      if (isAdmin) {
        // Super Admin: Generate JWT and use Server Actions
        const { jwt } = await DI.authService.createJWT();

        if (status === "active") {
          await approveCompanyAdmin(jwt, id);
        } else if (status === "rejected") {
          await rejectCompanyAdmin(jwt, id);
        } else {
          // For other statuses (banned, paused), fall back to DI service
          // These might need their own Server Actions if they also hit RLS issues
          if (status === "banned") {
            await DI.companyService.banCompany(id);
          } else if (status === "paused") {
            await DI.companyService.pauseCompany(id);
          }
        }
      } else {
        // Regular user: Use DI service
        if (status === "active") {
          await DI.companyService.approveCompany(id);
        } else if (status === "rejected") {
          await DI.companyService.rejectCompany(id);
        } else if (status === "banned") {
          await DI.companyService.banCompany(id);
        } else if (status === "paused") {
          await DI.companyService.pauseCompany(id);
        }
      }
    } catch (error) {
      console.error("Failed to update status", error);
      // Revert optimistic update on error
      set((state) => ({
        allCompanies: state.allCompanies.map(
          (c) => (c.$id === id ? { ...c, status: "pending" } : c), // Revert to pending
        ),
        // Re-add to pending list if it was removed
        pendingCompanies: state.pendingCompanies.some((c) => c.$id === id)
          ? state.pendingCompanies
          : ([
              ...state.pendingCompanies,
              state.allCompanies.find((c) => c.$id === id),
            ].filter(Boolean) as Company[]),
      }));
      throw error; // Re-throw so UI can handle the error
    }
  },
}));
