import { create } from "zustand";
import { Company } from "@/core/entities/company";

interface SuperAdminStats {
  totalCompanies: number;
  activeCompanies: number;
  pendingApprovals: number;
  totalInterviews: number;
}

interface SuperAdminState {
  stats: SuperAdminStats;
  pendingList: Company[];
  isLoading: boolean;

  setStats: (stats: SuperAdminStats) => void;
  setPendingList: (companies: Company[]) => void;
  setLoading: (loading: boolean) => void;
  removePendingCompany: (companyId: string) => void;
}

export const useSuperAdminStore = create<SuperAdminState>((set) => ({
  stats: {
    totalCompanies: 0,
    activeCompanies: 0,
    pendingApprovals: 0,
    totalInterviews: 0,
  },
  pendingList: [],
  isLoading: false,

  setStats: (stats) => set({ stats }),

  setPendingList: (pendingList) => set({ pendingList }),

  setLoading: (isLoading) => set({ isLoading }),

  removePendingCompany: (companyId) =>
    set((state) => ({
      pendingList: state.pendingList.filter((c) => c.$id !== companyId),
      stats: {
        ...state.stats,
        pendingApprovals: Math.max(0, state.stats.pendingApprovals - 1),
      },
    })),
}));
