import { create } from "zustand";
import { Question } from "@/core/entities/question";

interface QuestionState {
  questions: Question[];
  // Global Filters for the Question Bank UI
  activeRoleId: string | null;
  activeLevelId: string | null;
  activeSection: string | null;
  isLoading: boolean;

  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  removeQuestion: (id: string) => void;
  setFilters: (filters: {
    roleId?: string | null;
    levelId?: string | null;
    section?: string | null;
  }) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
}

export const useQuestionStore = create<QuestionState>((set) => ({
  questions: [],
  activeRoleId: null,
  activeLevelId: null,
  activeSection: null,
  isLoading: false,

  setQuestions: (questions) => set({ questions }),
  addQuestion: (question) =>
    set((state) => ({ questions: [question, ...state.questions] })),
  removeQuestion: (id) =>
    set((state) => ({
      questions: state.questions.filter((q) => q.$id !== id),
    })),
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  clearFilters: () =>
    set({ activeRoleId: null, activeLevelId: null, activeSection: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));
