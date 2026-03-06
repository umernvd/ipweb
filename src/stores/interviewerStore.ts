import { create } from "zustand";
import { Interviewer } from "@/core/entities/types";

interface InterviewerState {
  // State
  interviewers: Interviewer[];
  selectedInterviewer: Interviewer | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setInterviewers: (interviewers: Interviewer[]) => void;
  addInterviewer: (interviewer: Interviewer) => void;
  updateInterviewer: (id: string, updatedData: Partial<Interviewer>) => void;
  removeInterviewer: (id: string) => void;
  setSelectedInterviewer: (interviewer: Interviewer | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useInterviewerStore = create<InterviewerState>((set) => ({
  interviewers: [],
  selectedInterviewer: null,
  isLoading: false,
  error: null,

  setInterviewers: (interviewers) => set({ interviewers, error: null }),
  addInterviewer: (interviewer) =>
    set((state) => ({
      interviewers: [interviewer, ...state.interviewers],
    })),
  updateInterviewer: (id, updatedData) =>
    set((state) => ({
      interviewers: state.interviewers.map((i) =>
        i.$id === id ? { ...i, ...updatedData } : i,
      ),
    })),
  removeInterviewer: (id) =>
    set((state) => ({
      interviewers: state.interviewers.filter((i) => i.$id !== id),
    })),
  setSelectedInterviewer: (selectedInterviewer) => set({ selectedInterviewer }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
