import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HydratedInterview } from "@/core/entities/types";

interface InterviewState {
  interviews: HydratedInterview[];
  totalCount: number;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  searchQuery: string;
  statusFilter: string;
  error: string | null;

  setInterviews: (data: {
    documents: HydratedInterview[];
    total: number;
  }) => void;
  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
      interviews: [],
      totalCount: 0,
      isLoading: false,
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      statusFilter: "",
      error: null,

      setInterviews: (data) =>
        set({
          interviews: data.documents,
          totalCount: data.total,
          error: null,
        }),

      setPage: (currentPage) => set({ currentPage }),

      setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),

      setStatusFilter: (statusFilter) => set({ statusFilter, currentPage: 1 }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error: string) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "interview-storage",
    },
  ),
);
