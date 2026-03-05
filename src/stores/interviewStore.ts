import { create } from "zustand";
import { HydratedInterview } from "@/core/entities/types";

interface InterviewState {
  interviews: HydratedInterview[];
  totalCount: number;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  searchQuery: string;
  statusFilter: string;

  setInterviews: (data: {
    documents: HydratedInterview[];
    total: number;
  }) => void;
  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  interviews: [],
  totalCount: 0,
  isLoading: false,
  currentPage: 1,
  itemsPerPage: 10,
  searchQuery: "",
  statusFilter: "",

  setInterviews: (data) =>
    set({ interviews: data.documents, totalCount: data.total }),

  setPage: (currentPage) => set({ currentPage }),

  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),

  setStatusFilter: (statusFilter) => set({ statusFilter, currentPage: 1 }),

  setLoading: (isLoading) => set({ isLoading }),
}));
