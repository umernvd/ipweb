import { create } from "zustand";
import { Candidate } from "@/core/entities/candidate";

interface CandidateState {
  candidates: Candidate[];
  isLoading: boolean;
  error: string | null;

  setCandidates: (candidates: Candidate[]) => void;
  updateCandidate: (id: string, data: Partial<Candidate>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  candidates: [],
  isLoading: false,
  error: null,

  setCandidates: (candidates) => set({ candidates, error: null }),
  updateCandidate: (id, data) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.$id === id ? { ...c, ...data } : c,
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error: string) => set({ error }),
  clearError: () => set({ error: null }),
}));
