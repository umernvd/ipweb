import { create } from "zustand";
import { Candidate } from "@/core/entities/candidate";

interface CandidateState {
  candidates: Candidate[];
  isLoading: boolean;

  setCandidates: (candidates: Candidate[]) => void;
  updateCandidate: (id: string, data: Partial<Candidate>) => void;
  setLoading: (loading: boolean) => void;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  candidates: [],
  isLoading: false,

  setCandidates: (candidates) => set({ candidates }),
  updateCandidate: (id, data) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.$id === id ? { ...c, ...data } : c,
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
