import { create } from "zustand";
import { HydratedInterview } from "@/core/entities/types";

interface InterviewState {
  interviews: HydratedInterview[];
  selectedInterview: HydratedInterview | null;

  totalCount: number;
  currentPage: number;
  searchQuery: string;
  isLoading: boolean;

  setInterviews: (interviews: HydratedInterview[], totalCount?: number) => void;
  setSelectedInterview: (interview: HydratedInterview | null) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  updateInterviewStatus: (id: string, status: string, score: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  interviews: [],
  selectedInterview: null,
  totalCount: 0,
  currentPage: 1,
  searchQuery: "",
  isLoading: false,

  setInterviews: (interviews, totalCount) =>
    set((state) => ({
      interviews,
      totalCount: totalCount ?? state.totalCount,
    })),

  setSelectedInterview: (selectedInterview) => set({ selectedInterview }),

  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }), // Reset page on new search

  setCurrentPage: (currentPage) => set({ currentPage }),

  updateInterviewStatus: (id, status, score) =>
    set((state) => ({
      interviews: state.interviews.map((i) =>
        i.$id === id ? { ...i, status: status as any, score } : i,
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
