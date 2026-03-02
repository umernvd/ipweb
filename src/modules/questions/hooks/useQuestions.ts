import { useEffect, useState, useMemo } from "react";
import { useQuestionStore } from "@/stores/questionStore";
import { useAuthStore } from "@/stores/authStore";
import { DI } from "@/core/di/container";

export const useQuestions = () => {
  const { companyId } = useAuthStore();
  const [isMutating, setIsMutating] = useState(false);

  // Pull everything from the Zustand store we created earlier
  const {
    questions,
    activeRoleId,
    activeLevelId,
    activeSection,
    isLoading,
    setQuestions,
    addQuestion: addQuestionToStore,
    removeQuestion: removeQuestionFromStore,
    setFilters,
    clearFilters,
    setLoading,
  } = useQuestionStore();

  // --- READ (Fetch All) ---
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const data = await DI.questionService.getAll(companyId);
        setQuestions(data);
      } catch (err: any) {
        console.error("Failed to load questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [companyId, setQuestions, setLoading]);

  // --- THE FILTER ENGINE (Derived State) ---
  // We use useMemo so we don't recalculate on every single render
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // If a filter is active, check if the question matches. If no filter is active, it passes.
      const matchesRole = activeRoleId ? q.roleId === activeRoleId : true;
      const matchesLevel = activeLevelId ? q.levelId === activeLevelId : true;
      const matchesSection = activeSection ? q.section === activeSection : true;

      return matchesRole && matchesLevel && matchesSection;
    });
  }, [questions, activeRoleId, activeLevelId, activeSection]);

  // --- CREATE ---
  const createQuestion = async (
    questionText: string,
    roleId: string,
    levelId: string,
    section: string,
    difficulty: string,
  ) => {
    if (!companyId) return false;
    setIsMutating(true);
    try {
      const newQuestion = await DI.questionService.create({
        companyId,
        questionText,
        roleId,
        levelId,
        section,
        difficulty,
      });
      addQuestionToStore(newQuestion);
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // --- DELETE ---
  const deleteQuestion = async (id: string) => {
    setIsMutating(true);
    try {
      await DI.questionService.delete(id);
      removeQuestionFromStore(id);
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    // We return the FILTERED list to the UI, not the raw list
    questions: filteredQuestions,
    activeFilters: { activeRoleId, activeLevelId, activeSection },
    isLoading,
    isMutating,
    createQuestion,
    deleteQuestion,
    setFilters,
    clearFilters,
  };
};
