import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Question } from "@/core/entities/question";

interface QuestionState {
  questions: Question[];
  // Global Filters for the Question Bank UI
  activeRoleId: string | null;
  activeLevelId: string | null;
  activeSection: string | null;
  isLoading: boolean;
  error: string | null;

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
  setError: (error: string) => void;
  clearError: () => void;
}

export const useQuestionStore = create<QuestionState>()(
  persist(
    (set) => ({
      questions: [],
      activeRoleId: null,
      activeLevelId: null,
      activeSection: null,
      isLoading: false,
      error: null,

      setQuestions: (questions) => set({ questions, error: null }),
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
      setError: (error: string) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "question-storage",
    },
  ),
);
